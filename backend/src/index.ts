import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { scanImageWithVLM, transcribeWithWhisper, getCoachResponse, askQuestion } from './services/groq.ts'

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

const MOCK = !process.env.GROQ_API_KEY
if (MOCK) console.log('⚠️  No GROQ_API_KEY — running in mock mode')

app.use(cors())
app.use(express.json({ limit: '20mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/scan', async (req, res) => {
  try {
    const { image } = req.body as { image: string }
    if (!image) { res.status(400).json({ error: 'Missing image' }); return }
    if (MOCK) {
      res.json({ text: 'Ang pag-aaral ay isang mahalagang proseso ng pagkuha ng kaalaman at kasanayan.\n\nAng bawat mag-aaral ay kailangang mag-aral nang husto upang magtagumpay sa buhay at makamit ang kanilang mga pangarap.\n\nSa pamamagitan ng pagsisipag at dedikasyon, maaaring makamit ng sinuman ang kanilang mga layunin.' })
      return
    }
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
    if (MOCK) {
      res.json({ transcript: 'Ang pag-aaral ay isang mahalagang proseso ng pagkuha ng kaalaman at kasanayan sa buhay.' })
      return
    }
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
    if (MOCK) {
      res.json({ type: 'encouragement', message: 'Napakagaling! Patuloy mo itong gawin.', accuracy: 82, confidence: 76, clarity: 79, fillerWords: 2, pauseTime: 1.1, feedback: 'Magaling ang iyong pagsisipag! Subukan mong palawakin pa ang iyong sagot sa susunod na pagkakataon.' })
      return
    }
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
    if (MOCK) {
      res.json({ answer: 'Ang tekstong ito ay nagsasalita tungkol sa kahalagahan ng pag-aaral at kung paano ito nakakatulong sa ating pang-araw-araw na buhay.' })
      return
    }
    const answer = await askQuestion(context, question)
    res.json({ answer })
  } catch (e: any) {
    console.error('/api/ask error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => console.log(`Dunong backend listening on port ${PORT}`))
