import { createWorker } from "tesseract.js";
import { API } from "../constants";

export async function ocrImage(base64: string): Promise<string> {
  // Primary: VLM via backend — handles handwriting, printed, and mixed text
  try {
    const res = await fetch(`${API}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.text?.trim()) return data.text.trim();
    }
  } catch {
    // network unavailable — fall through to offline OCR
  }

  // Fallback: Tesseract (offline, printed text only)
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(`data:image/jpeg;base64,${base64}`);
  await worker.terminate();
  const text = data.text.trim();
  if (!text) throw new Error("No text found — try better lighting or a closer shot.");
  return text;
}
