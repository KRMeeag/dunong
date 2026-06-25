import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { scanImageWithVLM, transcribeWithWhisper, getCoachResponse, askQuestion } from './services/groq.ts'

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json({ limit: '20mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/scan', async (req, res) => {
  try {
    const { image } = req.body as { image: string }
    if (!image) { res.status(400).json({ error: 'Missing image' }); return }
    const text = await scanImageWithVLM(image)
    res.json({ text })
  } catch (e: any) {
    console.error('/api/scan error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Missing audio file' }); return }
    const transcript = await transcribeWithWhisper(req.file.buffer, req.file.originalname || 'audio.webm')
    res.json({ transcript })
  } catch (e: any) {
    console.error('/api/transcribe error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/coach', async (req, res) => {
  try {
    const { lockedText, transcript, mode, lang } = req.body as { lockedText:string; transcript:string; mode:string; lang:string }
    if (!lockedText || !transcript) { res.status(400).json({ error: 'Missing fields' }); return }
    const result = await getCoachResponse({ lockedText, transcript, mode: mode||'paraphrase', lang: lang||'FIL' })
    res.json(result)
  } catch (e: any) {
    console.error('/api/coach error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/ask', async (req, res) => {
  try {
    const { context, question } = req.body as { context:string; question:string }
    if (!context || !question) { res.status(400).json({ error: 'Missing fields' }); return }
    const answer = await askQuestion(context, question)
    res.json({ answer })
  } catch (e: any) {
    console.error('/api/ask error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => console.log(`Dunong backend listening on port ${PORT}`))
