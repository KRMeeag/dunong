export const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

export async function scanImage(base64: string): Promise<string> {
  const res = await fetch(`${BASE}/scan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Scan failed')
  return data.text
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const form = new FormData()
  form.append('audio', blob, 'recording.webm')
  const res = await fetch(`${BASE}/transcribe`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Transcription failed')
  return data.text
}

export interface CoachResponse {
  type: 'probing' | 'redirecting' | 'affirming'
  message: string
  accuracy: number
  confidence: number
  clarity: number
  fillerWords: number
  pauseTime: number
  feedback: string
}

export async function getCoachFeedback(params: { lockedText: string; transcript: string; mode: string; lang: string }): Promise<CoachResponse> {
  const res = await fetch(`${BASE}/coach`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Coach failed')
  return data
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`)
    const data = await res.json()
    return data.ok === true
  } catch (e) {
    return false
  }
}
