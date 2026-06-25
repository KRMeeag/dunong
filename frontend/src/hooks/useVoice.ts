import { useRef, useState, useCallback } from 'react'
import { transcribeAudio } from '../services/api'

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.start(); mediaRef.current = mr; setRecording(true)
  }, [])

  const stop = useCallback((): Promise<string> => new Promise((resolve, reject) => {
    const mr = mediaRef.current; if (!mr) return reject('No recorder')
    mr.onstop = async () => {
      setLoading(true)
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        mr.stream.getTracks().forEach(t => t.stop())
        resolve(await transcribeAudio(blob))
      } catch (e) { reject(e) } finally { setLoading(false); setRecording(false) }
    }
    mr.stop()
  }), [])

  return { recording, loading, start, stop }
}

export function useTTS() {
  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'fil-PH'; utt.rate = 0.95
    const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('fil') || v.lang.startsWith('tl'))
    if (v) utt.voice = v
    window.speechSynthesis.speak(utt)
  }, [])
  return { speak, stop: () => window.speechSynthesis.cancel() }
}
