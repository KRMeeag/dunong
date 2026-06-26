/**
 * Monitors a MediaStream for silence after the speaker starts talking,
 * then calls onSilence() so the caller can stop the recording.
 *
 * Returns a cleanup function that cancels monitoring early (e.g. on manual stop).
 */
export function watchSilence(
  stream: MediaStream,
  onSilence: () => void,
  options: { threshold?: number; silenceMs?: number; minSpeakMs?: number } = {},
): () => void {
  const { threshold = 12, silenceMs = 1800, minSpeakMs = 500 } = options;

  let ctx: AudioContext;
  try {
    ctx = new AudioContext();
  } catch {
    return () => {};
  }

  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  src.connect(analyser);
  const buf = new Uint8Array(analyser.frequencyBinCount);

  let hasSpokeOnce = false;
  let silenceStart: number | null = null;
  const startTime = Date.now();
  let rafId = 0;
  let done = false;

  const tick = () => {
    if (done) return;
    analyser.getByteFrequencyData(buf);
    const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
    const now = Date.now();

    if (avg > threshold) {
      hasSpokeOnce = true;
      silenceStart = null;
    } else if (hasSpokeOnce && now - startTime > minSpeakMs) {
      if (silenceStart === null) silenceStart = now;
      else if (now - silenceStart >= silenceMs) {
        done = true;
        ctx.close().catch(() => {});
        onSilence();
        return;
      }
    }
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    done = true;
    cancelAnimationFrame(rafId);
    ctx.close().catch(() => {});
  };
}
