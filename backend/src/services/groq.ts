import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function scanImageWithVLM(base64: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Extract all the text from this image exactly as it appears. Return only the extracted text, no commentary.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } }
      ]
    }],
    max_tokens: 2048,
  })
  return response.choices[0].message.content?.trim() ?? ''
}

export async function transcribeWithWhisper(audioBuffer: Buffer, filename: string): Promise<string> {
  const ab = audioBuffer.buffer instanceof SharedArrayBuffer
    ? new Uint8Array(audioBuffer).buffer
    : audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength) as ArrayBuffer
  const file = new File([ab], filename, { type: 'audio/webm' })
  const response = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo',
    language: 'fil',
  })
  return response.text
}

export interface CoachParams {
  lockedText: string
  transcript: string
  mode: string
  lang: string
}

export interface CoachResponse {
  type: string
  message: string
  accuracy: number
  confidence: number
  clarity: number
  fillerWords: number
  pauseTime: number
  feedback: string
}

export async function getCoachResponse(params: CoachParams): Promise<CoachResponse> {
  const { lockedText, transcript, mode, lang } = params
  const systemPrompt = lang === 'FIL'
    ? 'Ikaw ay isang AI coach para sa recitation. Magbigay ng feedback sa Filipino. Tumugon sa JSON.'
    : 'You are an AI recitation coach. Give feedback in English. Respond in JSON.'

  const userPrompt = `Source text: "${lockedText}"
Student recitation (mode: ${mode}): "${transcript}"

Evaluate and return JSON with these exact keys:
{
  "type": "encouragement" | "correction" | "question",
  "message": "short Socratic follow-up or encouragement (1-2 sentences)",
  "accuracy": <0-100>,
  "confidence": <0-100>,
  "clarity": <0-100>,
  "fillerWords": <count of filler words like "um", "ah", "ano">,
  "pauseTime": <estimated avg pause in seconds, 1 decimal>,
  "feedback": "detailed coaching feedback (2-3 sentences)"
}`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 512,
  })

  const raw = JSON.parse(response.choices[0].message.content ?? '{}')
  return {
    type: raw.type ?? 'encouragement',
    message: raw.message ?? '',
    accuracy: Number(raw.accuracy) || 0,
    confidence: Number(raw.confidence) || 0,
    clarity: Number(raw.clarity) || 0,
    fillerWords: Number(raw.fillerWords) || 0,
    pauseTime: Number(raw.pauseTime) || 0,
    feedback: raw.feedback ?? '',
  }
}

export async function askQuestion(context: string, question: string, lang = 'FIL'): Promise<string> {
  const systemPrompt = lang === 'FIL'
    ? 'Ikaw si Dunong, isang matulunging AI tutor. Sagutin ang tanong base sa ibinigay na konteksto. Maging malinaw at maikli.'
    : 'You are Dunong, a helpful AI tutor. Answer the question based on the given context. Be clear and concise.'
  const userPrompt = lang === 'FIL'
    ? `Konteksto: "${context}"\n\nTanong: ${question}`
    : `Context: "${context}"\n\nQuestion: ${question}`
  const fallback = lang === 'FIL' ? 'Hindi ko masagot iyon ngayon.' : 'I cannot answer that right now.'
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 256,
  })
  return response.choices[0].message.content?.trim() ?? fallback
}
