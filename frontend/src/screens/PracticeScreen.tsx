import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Upload,
  Mic,
  ScanLine,
  MessageCircle,
  RotateCcw,
  StopCircle,
  Lock,
  Volume2,
  Zap,
  Check,
  Timer,
} from "lucide-react";
import SkillRing from "../components/SkillRing";
import { ocrImage } from "../utils/ocr";
import { watchSilence } from "../utils/vad";
import { Scores } from "../types";
import { API } from "../constants";

const TIME_OPTIONS = [
  { label: "No limit", value: 0 },
  { label: "30s", value: 30 },
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
];

export default function PracticeScreen({
  onDone,
  lang,
  onBack,
  onScanComplete,
  preloadedText,
}: {
  onDone: (scores: Scores, feedback: string) => void;
  lang: string;
  onBack: () => void;
  defaultMode?: string; // kept for compat, ignored — only Recitation now
  onScanComplete?: (text: string) => void;
  preloadedText?: string;
}) {
  const [showChoice, setShowChoice] = useState(false);
  const [step, setStep] = useState(preloadedText ? 1 : 0);
  const [listening, setListening] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [extractedText, setExtractedText] = useState(preloadedText ?? "");
  const [selBlock, setSelBlock] = useState<number | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>(() => {
    if (!preloadedText) return [];
    const paras = preloadedText.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 20);
    return paras.length ? paras : [preloadedText];
  });
  const [asking, setAsking] = useState(false);
  const [askAnswer, setAskAnswer] = useState("");
  const [scores, setScores] = useState<Scores>({ accuracy: 0, confidence: 0, clarity: 0 });
  const [feedback, setFeedback] = useState("");
  const [transcript, setTranscript] = useState("");
  const [fillerWords, setFillerWords] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSabihinMo, setShowSabihinMo] = useState(false);
  const [promptPlaying, setPromptPlaying] = useState(false);
  const [showTamaBa, setShowTamaBa] = useState(false);
  const [tamaBaText, setTamaBaText] = useState("");

  // Timer
  const [timeLimit, setTimeLimit] = useState(0); // seconds; 0 = no limit
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recMimeRef = useRef<string>("audio/webm");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vadCleanupRef = useRef<(() => void) | null>(null);
  // Always-current ref so VAD callback can call the latest stopRecordingAndSubmit
  const stopFnRef = useRef<(() => Promise<void>) | null>(null);

  const isFil = lang === "FIL";

  // TTS feedback on step 3
  useEffect(() => {
    if (step === 3 && feedback) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(feedback);
      utt.lang = "fil-PH";
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
    return () => { window.speechSynthesis.cancel(); };
  }, [step, feedback]);

  const sabihinMoPrompt = isFil
    ? "Ipaliwanag mo nang detalyado. Handa na?"
    : "Explain this in detail. Ready?";

  const playSabihinMoPrompt = useCallback(() => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(sabihinMoPrompt);
    utt.lang = isFil ? "fil-PH" : "en-US";
    utt.rate = 0.85;
    utt.onstart = () => setPromptPlaying(true);
    utt.onend = () => setPromptPlaying(false);
    utt.onerror = () => setPromptPlaying(false);
    setPromptPlaying(true);
    window.speechSynthesis.speak(utt);
  }, [sabihinMoPrompt, isFil]);

  useEffect(() => {
    if (showSabihinMo) {
      const t = setTimeout(() => playSabihinMoPrompt(), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSabihinMo]);

  // Camera
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices) { setError("Camera not available."); return; }
      let s: MediaStream;
      try { s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); }
      catch { s = await navigator.mediaDevices.getUserMedia({ video: true }); }
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); }
    } catch { setError("Camera access denied. Please allow camera permission and try again."); }
  }, []);

  useEffect(() => {
    if (!showChoice && step === 0) startCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChoice, step]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    window.speechSynthesis.cancel();
    vadCleanupRef.current?.();
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleGalleryUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true); setError("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const MAX = 1280;
          let { naturalWidth: w, naturalHeight: h } = img;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round((h / w) * MAX); w = MAX; }
            else { w = Math.round((w / h) * MAX); h = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
        img.src = url;
      });
      const text = await ocrImage(base64);
      if (!text) throw new Error("No text found — try better lighting or a closer shot.");
      stopCamera();
      setTamaBaText(text);
      setShowTamaBa(true);
    } catch (e: any) { setError(e.message || "Upload failed"); }
    finally { setScanning(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }, [stopCamera]);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    if (!vid.videoWidth || !vid.videoHeight || vid.readyState < 2) {
      setError("Camera not ready yet — wait a moment and try again.");
      return;
    }
    setScanning(true); setError("");
    const MAX = 1280;
    let cw = vid.videoWidth, ch = vid.videoHeight;
    if (cw > MAX || ch > MAX) {
      if (cw > ch) { ch = Math.round((ch / cw) * MAX); cw = MAX; }
      else { cw = Math.round((cw / ch) * MAX); ch = MAX; }
    }
    const canvas = document.createElement("canvas");
    canvas.width = cw; canvas.height = ch;
    canvas.getContext("2d")!.drawImage(vid, 0, 0, cw, ch);
    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    try {
      const text = await ocrImage(base64);
      if (!text) throw new Error("No text found — try better lighting or move closer.");
      stopCamera();
      setTamaBaText(text);
      setShowTamaBa(true);
    } catch (e: any) { setError(e.message || "Scan failed"); }
    finally { setScanning(false); }
  }, [stopCamera]);

  const askDunong = useCallback(async () => {
    if (selBlock === null) return;
    setAsking(true); setAskAnswer("");
    const question = isFil ? "Ano ang ibig sabihin nito?" : "What does this mean?";
    try {
      const res = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: paragraphs[selBlock], question, lang }),
      });
      const data = await res.json();
      setAskAnswer(data.answer || "");
    } catch {
      setAskAnswer(isFil ? "Hindi makonekta sa Dunong." : "Could not connect to Dunong.");
    }
    setAsking(false);
  }, [selBlock, paragraphs, lang, isFil]);

  const startRecording = useCallback(() => {
    chunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((s) => {
        const mime = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
        recMimeRef.current = mime || "audio/webm";
        const mr = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.start();
        mediaRecRef.current = mr;
        setListening(true);

        // Countdown timer if time limit set
        if (timeLimit > 0) {
          setCountdown(timeLimit);
          countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownRef.current!);
                countdownRef.current = null;
                stopFnRef.current?.();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }

        // VAD: auto-stop after ~1.8s silence following at least 400ms of speech
        vadCleanupRef.current = watchSilence(s, () => {
          stopFnRef.current?.();
        }, { silenceMs: 1800, minSpeakMs: 400 });
      })
      .catch(() => setError(isFil ? "Hindi mapayagan ang mikropono." : "Microphone access denied"));
  }, [timeLimit, isFil]);

  const stopRecordingAndSubmit = useCallback(async () => {
    // Cleanup VAD and countdown
    vadCleanupRef.current?.();
    vadCleanupRef.current = null;
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }

    if (!mediaRecRef.current) return;
    const mr = mediaRecRef.current;
    mediaRecRef.current = null;
    setListening(false);
    try { mr.stop(); mr.stream.getTracks().forEach((t) => t.stop()); }
    catch { /* already stopped */ }

    setSubmitting(true); setError("");
    await new Promise((r) => setTimeout(r, 300));
    const mime = recMimeRef.current;
    const blob = new Blob(chunksRef.current, { type: mime });
    const audioFilename = mime === "audio/mp4" ? "audio.mp4" : "audio.webm";
    try {
      const fd = new FormData();
      fd.append("audio", blob, audioFilename);
      const tRes = await fetch(`${API}/api/transcribe`, { method: "POST", body: fd });
      const tData = await tRes.json();
      if (tData.error) throw new Error(tData.error);
      setTranscript(tData.transcript);
      const lockedText = selBlock !== null ? paragraphs[selBlock] : extractedText;
      const cRes = await fetch(`${API}/api/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockedText, transcript: tData.transcript, mode: "recitation", lang }),
      });
      const cData = await cRes.json();
      if (cData.error) throw new Error(cData.error);
      const s = {
        accuracy: cData.accuracy ?? 75,
        confidence: cData.confidence ?? 70,
        clarity: cData.clarity ?? 72,
      };
      setScores(s);
      setFeedback(cData.feedback || (isFil ? "Magaling! Keep practicing." : "Great! Keep practicing."));
      setFillerWords(cData.fillerWords ?? 0);
      setPauseTime(cData.pauseTime ?? 0);
      setStep(3);
      onDone(s, cData.feedback || "");
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [selBlock, paragraphs, extractedText, lang, onDone, isFil]);

  // Keep stopFnRef current so VAD/timer callbacks always call latest version
  useEffect(() => { stopFnRef.current = stopRecordingAndSubmit; }, [stopRecordingAndSubmit]);

  // ─── SCAN CHOICE ──────────────────────────────────────────────────────────
  if (showChoice)
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <h3 className="text-[#4B4032] font-bold text-sm">I-scan ang Modulo</h3>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
        <div className="flex-1 flex flex-col justify-center gap-4 px-6">
          {scanning && (
            <div className="bg-[#F4E3B2] rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#D6B15E] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-[#4B4032] text-xs font-semibold">{isFil ? "Binabasa ang teksto…" : "Reading text…"}</p>
            </div>
          )}
          {error && !scanning && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-xs font-semibold">{error}</p>
            </div>
          )}
          <p className="text-[#7A736B] text-xs text-center">{isFil ? "Paano mo gustong i-scan ang iyong modulo?" : "How do you want to scan your module?"}</p>
          <button onClick={() => setShowChoice(false)}
            className="w-full bg-[#4B4032] rounded-3xl p-5 flex items-center gap-4 active:scale-95 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-[#D6B15E] flex items-center justify-center shrink-0">
              <Camera size={24} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-bold text-base">{isFil ? "Camera" : "Camera"}</p>
              <p className="text-white/55 text-xs">{isFil ? "Ituro sa iyong modulo" : "Point at your printed module"}</p>
            </div>
            <ChevronRight size={20} className="text-white/40" />
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white rounded-3xl p-5 flex items-center gap-4 border border-[#E7D3A8] active:scale-95 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-[#E7D3A8] flex items-center justify-center shrink-0">
              <Upload size={24} className="text-[#4B4032]" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[#4B4032] font-bold text-base">{isFil ? "Gallery" : "Gallery"}</p>
              <p className="text-[#7A736B] text-xs">{isFil ? "Mag-upload ng litrato" : "Upload a photo from your device"}</p>
            </div>
            <ChevronRight size={20} className="text-[#C5B9AE]" />
          </button>
        </div>
      </div>
    );

  // ─── TAMA BA ──────────────────────────────────────────────────────────────
  if (showTamaBa)
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 shrink-0">
          <button onClick={() => { setShowTamaBa(false); startCamera(); }}
            className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <div className="flex-1">
            <h3 className="text-[#4B4032] font-black text-base" style={{ fontFamily: "Fraunces, serif" }}>Tama Ba?</h3>
            <p className="text-[#7A736B] text-xs">
              {isFil ? "Suriin at i-edit ang na-scan na teksto" : "Review and edit the scanned text"}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 mt-4 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-3">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ScanLine size={9} />
              {isFil ? "Na-extract na Teksto — I-edit kung may mali" : "Extracted Text — Edit any mistakes"}
            </p>
            <textarea value={tamaBaText} onChange={(e) => setTamaBaText(e.target.value)}
              className="w-full text-[#4B4032] text-xs leading-relaxed outline-none resize-none bg-transparent"
              rows={14} />
          </div>
          <div className="bg-[#F4E3B2] rounded-2xl px-4 py-3 border border-[#E7D3A8]">
            <p className="text-[#4B4032] text-xs leading-relaxed">
              {isFil
                ? "I-edit ang anumang salita na hindi tama. Kapag tama na ang lahat, pindutin ang 'Tama Na!'"
                : "Fix any word the scanner got wrong. When everything looks right, tap 'Looks Good!'"}
            </p>
          </div>
        </div>
        <div className="px-5 pb-8 pt-2 shrink-0 flex gap-3">
          <button onClick={() => { setShowTamaBa(false); startCamera(); }}
            className="w-14 h-14 rounded-2xl bg-[#E7D3A8] flex items-center justify-center shrink-0 active:scale-95 transition-transform">
            <Camera size={20} className="text-[#4B4032]" />
          </button>
          <button
            onClick={() => {
              const paras = tamaBaText.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 20);
              setExtractedText(tamaBaText);
              setParagraphs(paras.length ? paras : [tamaBaText]);
              onScanComplete?.(tamaBaText);
              setShowTamaBa(false);
              setStep(1);
            }}
            disabled={!tamaBaText.trim()}
            className="flex-1 py-4 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40">
            <Check size={18} />
            {isFil ? "Tama Na!" : "Looks Good!"}
          </button>
        </div>
      </div>
    );

  // ─── CAMERA / SCAN (step 0) ───────────────────────────────────────────────
  if (step === 0)
    return (
      <div className="h-full flex flex-col bg-[#1A1209]">
        <div className="px-5 pt-3 flex items-center justify-between shrink-0">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <span className="text-white font-bold text-sm">Scan Module</span>
          <div className="w-10 h-10" />
        </div>
        <div className="flex-1 mx-4 mt-4 relative rounded-3xl overflow-hidden bg-[#0D0A04]">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          {[
            "top-5 left-5 border-t-[3px] border-l-[3px] rounded-tl-2xl",
            "top-5 right-5 border-t-[3px] border-r-[3px] rounded-tr-2xl",
            "bottom-5 left-5 border-b-[3px] border-l-[3px] rounded-bl-2xl",
            "bottom-5 right-5 border-b-[3px] border-r-[3px] rounded-br-2xl",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-9 h-9 border-[#D6B15E] ${cls}`} />
          ))}
          <div className="absolute left-8 right-8 h-px bg-[#D6B15E]" style={{ top: "48%", boxShadow: "0 0 12px 2px #D6B15E88" }} />
          {error && (
            <div className="absolute inset-x-4 top-4 bg-red-900/80 text-white text-xs p-2 rounded-xl text-center">{error}</div>
          )}
          <div className="absolute bottom-6 inset-x-0 flex justify-center">
            <span className="bg-[#D6B15E]/90 text-white text-xs font-bold px-4 py-1.5 rounded-full">
              {scanning ? (isFil ? "Binabasa…" : "Reading text…") : (isFil ? "Ituro sa nakasulat na teksto" : "Point at printed text")}
            </span>
          </div>
        </div>
        <div className="px-6 py-5 flex items-center justify-around shrink-0">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
          <button onClick={() => fileInputRef.current?.click()} disabled={scanning}
            className="w-14 h-14 rounded-2xl bg-[#2A2010] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-40">
            <Upload size={18} className="text-[#D6B15E]" />
            <span className="text-[#D6B15E]/70 text-[9px] font-semibold">Gallery</span>
          </button>
          <button onClick={captureAndScan} disabled={scanning}
            className="w-20 h-20 rounded-full bg-[#D6B15E] flex items-center justify-center shadow-xl shadow-[#D6B15E]/40 active:scale-95 transition-transform disabled:opacity-50">
            <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
              {scanning ? <ScanLine size={26} className="text-white animate-pulse" /> : <Camera size={26} className="text-white" />}
            </div>
          </button>
          <button onClick={startCamera}
            className="w-14 h-14 rounded-2xl bg-[#2A2010] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <RotateCcw size={18} className="text-[#D6B15E]" />
            <span className="text-[#D6B15E]/70 text-[9px] font-semibold">Retry</span>
          </button>
        </div>
      </div>
    );

  // ─── SABIHIN MO ───────────────────────────────────────────────────────────
  if (showSabihinMo) {
    const lockedPara = selBlock !== null ? paragraphs[selBlock] : extractedText;
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 shrink-0">
          <button onClick={() => { window.speechSynthesis.cancel(); setShowSabihinMo(false); }}
            className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider">Sabihin Mo</p>
            <p className="text-[#4B4032] font-black text-sm">Recitation</p>
          </div>
          <div className="w-3 h-3 rounded-full animate-pulse bg-[#BF9840]" />
        </div>

        <div className="flex-1 flex flex-col px-5 pt-5 pb-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {lockedPara && (
            <div className="bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-5">
              <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock size={9} /> {isFil ? "Na-lock na Talata" : "Locked Paragraph"}
              </p>
              <p className="text-[#4B4032] text-xs leading-relaxed line-clamp-5">{lockedPara}</p>
            </div>
          )}

          {/* Dunong speech bubble */}
          <div className="flex flex-col items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl bg-[#BF9840]">
              <span className="text-white font-black text-xl" style={{ fontFamily: "Fraunces, serif" }}>D</span>
            </div>
            <div className="bg-white rounded-3xl rounded-tl-md px-5 py-4 border border-[#E7D3A8]/70 shadow-md max-w-[90%] text-center">
              <p className="text-[#4B4032] font-bold text-sm leading-relaxed">"{sabihinMoPrompt}"</p>
            </div>
            <button onClick={playSabihinMoPrompt} disabled={promptPlaying}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7D3A8] bg-white text-[#7A736B] text-xs font-bold active:scale-95 transition-transform disabled:opacity-40">
              <Volume2 size={13} />
              {promptPlaying ? (isFil ? "Nagsasalita…" : "Speaking…") : (isFil ? "Pakinggan ulit" : "Play again")}
            </button>
          </div>

          {/* Time limit selector */}
          <div className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-5">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Timer size={10} className="text-[#D6B15E]" />
              {isFil ? "Limitasyon sa Oras" : "Time Limit"}
            </p>
            <div className="flex gap-2 flex-wrap">
              {TIME_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setTimeLimit(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timeLimit === opt.value ? "bg-[#4B4032] text-white shadow-sm" : "bg-[#F4E3B2] text-[#7A736B]"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 shrink-0">
          <button
            onClick={() => { window.speechSynthesis.cancel(); setShowSabihinMo(false); setStep(2); }}
            className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.98] transition-transform bg-[#BF9840]"
            style={{ boxShadow: "0 12px 30px #BF984040" }}>
            <Mic size={20} />
            {isFil ? "Handa na ako — Magsalita" : "I'm Ready — Speak Now"}
          </button>
        </div>
      </div>
    );
  }

  // ─── SIPAT-ARAL (step 1) ──────────────────────────────────────────────────
  if (step === 1)
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setStep(0)} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <div className="flex-1">
            <h3 className="text-[#4B4032] font-bold text-sm">Sipat-Aral</h3>
            <p className="text-[#7A736B] text-xs">{isFil ? "Piliin ang talata" : "Select a paragraph"}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 mt-4 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-3">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-3">
              {isFil ? "Na-extract na Teksto — Piliin ang talata" : "Extracted Text — Tap to select"}
            </p>
            <div className="flex flex-col gap-2.5">
              {paragraphs.map((p, i) => (
                <button key={i} onClick={() => { setSelBlock(selBlock === i ? null : i); setAskAnswer(""); }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all text-xs leading-relaxed text-[#4B4032] ${
                    selBlock === i ? "bg-[#F4E3B2] border-2 border-[#D6B15E]" : "bg-[#FAFAF8] border border-[#E7D3A8]"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {selBlock !== null && (
            <button onClick={askDunong} disabled={asking}
              className="w-full bg-[#F4E3B2] rounded-2xl p-3.5 mb-3 flex items-center gap-3 active:scale-95 transition-transform disabled:opacity-60">
              <div className="w-9 h-9 rounded-xl bg-[#D6B15E] flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-[#4B4032] text-xs font-bold">Ask Dunong</p>
                <p className="text-[#7A736B] text-xs mt-0.5">
                  {asking ? (isFil ? "Iniisip…" : "Thinking…") : (isFil ? "Ano ang ibig sabihin nito?" : "What does this mean?")}
                </p>
              </div>
            </button>
          )}
          {askAnswer && (
            <div className="bg-white rounded-2xl p-4 mb-3 border border-[#E7D3A8]/60 text-xs text-[#4B4032] leading-relaxed">
              {askAnswer}
            </div>
          )}
          <p className="text-[#7A736B] text-xs font-medium text-center mb-3">
            {isFil ? "Piliin ang talata na gusto mong ipaliwanag." : "Select a paragraph to explain in your own words."}
          </p>
          <button
            onClick={() => setShowSabihinMo(true)}
            className="w-full py-4 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Lock size={16} />
            {isFil ? "I-lock at Magsalita" : "Lock & Recite"}
          </button>
        </div>
      </div>
    );

  // ─── RECORDING (step 2) ───────────────────────────────────────────────────
  if (step === 2) {
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;
    const timerWarning = timeLimit > 0 && countdown <= 10 && countdown > 0;

    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setStep(1)} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <h3 className="text-[#4B4032] font-bold text-sm flex-1">Recitation</h3>
          {listening && (
            <div className="bg-[#F4E3B2] px-3 py-1 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[#4B4032] text-xs font-bold">REC</span>
            </div>
          )}
        </div>

        {/* Countdown timer */}
        {timeLimit > 0 && listening && countdown > 0 && (
          <div className="px-5 mt-2 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl self-start w-fit ${timerWarning ? "bg-red-100" : "bg-[#F4E3B2]"}`}>
              <Timer size={12} className={timerWarning ? "text-red-500" : "text-[#D6B15E]"} />
              <span className={`font-black text-sm tabular-nums ${timerWarning ? "text-red-500" : "text-[#4B4032]"}`}>
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {/* Selected paragraph */}
        {selBlock !== null && (
          <div className="mx-5 mt-3 bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm shrink-0">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">
              {isFil ? "Na-lock na Talata" : "Locked Paragraph"}
            </p>
            <p className="text-[#4B4032] text-xs leading-relaxed line-clamp-4">{paragraphs[selBlock]}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {error && <p className="text-red-500 text-xs px-5 text-center">{error}</p>}

          {/* Waveform */}
          <div className="flex items-end justify-center gap-0.75 h-14">
            {listening
              ? [6,10,18,26,32,26,36,22,30,18,28,16,24,12,20].map((h, i) => (
                  <div key={i} className="w-1.25 rounded-full bg-red-400"
                    style={{ height: `${h}px`, animation: `pulse ${0.4 + (i % 5) * 0.12}s ease-in-out infinite alternate`, animationDelay: `${i * 0.06}s` }} />
                ))
              : submitting
                ? [8,14,20,14,8,14,20,14,8,14,20,14,8].map((h, i) => (
                    <div key={i} className="w-1.25 rounded-full bg-[#D6B15E]/50" style={{ height: `${h}px` }} />
                  ))
                : [4,8,12,8,4,8,12,8,4,8,12,8,4].map((h, i) => (
                    <div key={i} className="w-1.25 rounded-full bg-[#E7D3A8]" style={{ height: `${h}px` }} />
                  ))}
          </div>

          {/* Mic button */}
          <div className="relative flex items-center justify-center">
            {listening && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-red-400/10 animate-ping" style={{ animationDuration: "1.2s" }} />
                <div className="absolute w-36 h-36 rounded-full bg-red-400/15 animate-ping" style={{ animationDuration: "1.2s", animationDelay: "0.3s" }} />
              </>
            )}
            <button
              onTouchEnd={(e) => {
                e.preventDefault();
                if (!submitting) listening ? stopRecordingAndSubmit() : startRecording();
              }}
              onClick={(e) => {
                if (e.detail === 0) return;
                if (!submitting) listening ? stopRecordingAndSubmit() : startRecording();
              }}
              disabled={submitting}
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
                listening ? "bg-red-500 shadow-red-500/40" : "bg-[#BF9840] shadow-[#BF9840]/30"
              }`}>
              {listening ? <StopCircle size={44} className="text-white" /> : <Mic size={44} className="text-white" />}
            </button>
          </div>

          {/* Status label */}
          <div className="flex flex-col items-center gap-1">
            {listening && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-600 text-xs font-bold uppercase tracking-wide">Recording</span>
              </div>
            )}
            <p className="text-[#7A736B] text-sm font-semibold">
              {submitting
                ? (isFil ? "Sinusuri ang iyong sagot…" : "Processing your answer…")
                : listening
                  ? (isFil ? "Magsalita nang malinaw — hihinto sa katahimikan" : "Speak clearly — auto-stops on silence")
                  : (isFil ? "I-tap ang mikropono para magsimula" : "Tap the mic to start")}
            </p>
          </div>

          {submitting && (
            <div className="flex items-center gap-3 bg-[#F4E3B2] rounded-2xl px-5 py-3 border border-[#E7D3A8]">
              <div className="w-4 h-4 border-2 border-[#D6B15E] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-[#4B4032] text-xs font-semibold">{isFil ? "Sinusuri ni Dunong ang iyong sagot…" : "Dunong is evaluating your answer…"}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RESULTS (step 3) ─────────────────────────────────────────────────────
  const scoreList = [
    { label: "Accuracy", value: scores.accuracy, color: "#D6B15E" },
    { label: "Confidence", value: scores.confidence, color: "#A8CFA0" },
    { label: "Clarity", value: scores.clarity, color: "#4B4032" },
  ];
  const total = Math.round((scores.accuracy + scores.confidence + scores.clarity) / 3);

  return (
    <div className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-3 flex items-center gap-3">
        <button onClick={() => setStep(2)} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#4B4032]" />
        </button>
        <h3 className="text-[#4B4032] font-black text-base flex-1" style={{ fontFamily: "Fraunces, serif" }}>
          {isFil ? "Mga Resulta" : "Feedback Results"}
        </h3>
        <span className="text-white font-bold text-xs bg-[#D6B15E] px-3 py-1 rounded-full">+{total} pts</span>
      </div>
      <div className="mx-5 mt-4 grid grid-cols-3 gap-2.5">
        {scoreList.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-[#E7D3A8]/60 shadow-sm">
            <SkillRing label={s.label} value={s.value} color={s.color} />
          </div>
        ))}
      </div>
      <div className="mx-5 mt-3 grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-[#E7D3A8]/60 shadow-sm">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1">{isFil ? "Mga Filler Words" : "Filler Words"}</p>
          <p className="text-xl font-black text-[#4B4032]">{fillerWords} <span className="text-xs font-semibold text-[#7A736B]">{isFil ? "natukoy" : "detected"}</span></p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#E7D3A8]/60 shadow-sm">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1">{isFil ? "Average Pause" : "Avg Pause"}</p>
          <p className="text-xl font-black text-[#4B4032]">{pauseTime}s <span className="text-xs font-semibold text-[#7A736B]">{isFil ? "sa pagitan ng salita" : "between words"}</span></p>
        </div>
      </div>
      {transcript && (
        <div className="mx-5 mt-4 bg-white rounded-3xl p-4 border border-[#E7D3A8]/60">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">{isFil ? "Narinig ni Dunong" : "Dunong heard"}</p>
          <p className="text-[#4B4032] text-xs leading-relaxed italic">"{transcript}"</p>
        </div>
      )}
      <div className="mx-5 mt-4 bg-[#F4E3B2] rounded-3xl p-4 border border-[#E7D3A8]">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#D6B15E] flex items-center justify-center">
            <span className="text-white text-[10px] font-black">D</span>
          </div>
          <span className="text-[#4B4032] font-bold text-sm">{isFil ? "Sabi ni Dunong" : "Dunong says"}</span>
          <button onClick={() => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(feedback); u.lang = "fil-PH"; u.rate = 0.9; window.speechSynthesis.speak(u); }}
            className="ml-auto w-7 h-7 rounded-full bg-[#D6B15E] flex items-center justify-center">
            <Volume2 size={13} className="text-white" />
          </button>
        </div>
        <p className="text-[#4B4032] text-sm leading-relaxed">{feedback || (isFil ? "Napakagaling mo! Keep going!" : "Great job! Keep going!")}</p>
      </div>
      <div className="mx-5 mt-4 flex gap-3">
        <button onClick={() => setStep(2)}
          className="flex-1 py-3.5 bg-[#E7D3A8] rounded-2xl text-[#4B4032] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <RotateCcw size={15} />
          {isFil ? "Subukan Ulit" : "Try Again"}
        </button>
        <button onClick={() => setStep(0)}
          className="flex-1 py-3.5 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Zap size={15} />
          {isFil ? "Bagong Scan" : "New Scan"}
        </button>
      </div>
    </div>
  );
}
