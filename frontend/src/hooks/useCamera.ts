import { useRef, useState, useCallback } from 'react'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setActive(true)
    } catch { setActive(false) }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null; setActive(false)
  }, [])

  const capture = useCallback((): string | null => {
    const v = videoRef.current; if (!v) return null
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    return c.toDataURL('image/jpeg', 0.85).split(',')[1]
  }, [])

  const toggleFlash = useCallback(async () => {
    const t = streamRef.current?.getVideoTracks()[0]; if (!t) return
    try { await (t as any).applyConstraints({ advanced: [{ torch: !flashOn }] }); setFlashOn(f => !f) } catch {}
  }, [flashOn])

  return { videoRef, active, flashOn, start, stop, capture, toggleFlash }
}
