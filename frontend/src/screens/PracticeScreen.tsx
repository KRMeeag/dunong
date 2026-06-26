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
  PenLine,
} from "lucide-react";
import SkillRing from "../components/SkillRing";
import { Scores } from "../types";
import { API } from "../constants";

export default function PracticeScreen({
  onDone,
  lang,
  onBack,
  defaultMode = "Paraphrase",
  preloadedText,
}: {
  onDone: (scores: Scores, feedback: string) => void;
  lang: string;
  onBack: () => void;
  defaultMode?: string;
  preloadedText?: string;
}) {
  const [showChoice, setShowChoice] = useState(false);
  const [step, setStep] = useState(preloadedText ? 1 : 0);
  const [recitMode, setRecitMode] = useState(defaultMode);
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
  const [scores, setScores] = useState<Scores>({
    accuracy: 0,
    confidence: 0,
    clarity: 0,
  });
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

  useEffect(() => {
    if (step === 3 && feedback) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(feedback);
      utt.lang = "fil-PH";
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [step, feedback]);

  const sabihinMoPrompts: Record<string, { fil: string; en: string }> = {
    "Read-Aloud":      { fil: "Sige, basahin mo ito nang malakas at malinaw.",           en: "Go ahead, read this out loud and clearly." },
    "Paraphrase":      { fil: "Sige, ipaliwanag mo ito sa sarili mong salita.",           en: "Go ahead, explain this in your own words." },
    "Cold Call":       { fil: "Ano ang naalala mo tungkol dito? Sabihin mo ngayon.",      en: "What do you remember about this? Say it now." },
    "Stand & Deliver": { fil: "Handa ka na ba? Sige — ipaliwanag mo ito sa harap ng lahat.", en: "Are you ready? Go ahead — explain this in front of everyone." },
    "Quiz Bee":        { fil: "Ano ang tamang sagot? Sabihin mo.",                         en: "What is the correct answer? Say it." },
    "Recitation":      { fil: "Ipaliwanag mo nang detalyado. Handa na?",                  en: "Explain this in detail. Ready?" },
  };

  const playSabihinMoPrompt = useCallback(() => {
    const prompts = sabihinMoPrompts[recitMode] ?? sabihinMoPrompts["Paraphrase"];
    const text = lang === "FIL" ? prompts.fil : prompts.en;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === "FIL" ? "fil-PH" : "en-US";
    utt.rate = 0.85;
    utt.onstart = () => setPromptPlaying(true);
    utt.onend = () => setPromptPlaying(false);
    utt.onerror = () => setPromptPlaying(false);
    setPromptPlaying(true);
    window.speechSynthesis.speak(utt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recitMode, lang]);

  useEffect(() => {
    if (showSabihinMo) {
      const t = setTimeout(() => playSabihinMoPrompt(), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSabihinMo]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices) {
        setError("Camera not available in this context.");
        return;
      }
      let s: MediaStream;
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      } catch {
        s = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setError("Camera access denied. Please allow camera permission and try again.");
    }
  }, []);

  // Start camera as soon as the camera view is visible (after DOM commit)
  useEffect(() => {
    if (!showChoice && step === 0) {
      startCamera();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChoice, step]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleGalleryUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setScanning(true);
      setError("");
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await fetch(`${API}/api/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const text: string = data.text;
        const paras = text
          .split(/\n\n+/)
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 20);
        stopCamera();
        setTamaBaText(text);
        setShowTamaBa(true);
      } catch (e: any) {
        setError(e.message || "Upload failed");
      } finally {
        setScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [stopCamera],
  );

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    if (!vid.videoWidth || !vid.videoHeight || vid.readyState < 2) {
      setError("Camera not ready yet — wait a moment and try again.");
      return;
    }
    setScanning(true);
    setError("");
    const canvas = document.createElement("canvas");
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext("2d")!.drawImage(vid, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
    try {
      const res = await fetch(`${API}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text: string = data.text;
      const paras = text
        .split(/\n\n+/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 20);
      stopCamera();
      setTamaBaText(text);
      setShowTamaBa(true);
    } catch (e: any) {
      setError(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  }, [stopCamera]);

  const askDunong = useCallback(async () => {
    if (selBlock === null) return;
    setAsking(true);
    setAskAnswer("");
    const question =
      lang === "EN" ? "What does this mean?" : "Ano ang ibig sabihin nito?";
    try {
      const res = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: paragraphs[selBlock], question, lang }),
      });
      const data = await res.json();
      setAskAnswer(data.answer || "");
    } catch {
      setAskAnswer(
        lang === "EN"
          ? "Could not connect to Dunong."
          : "Hindi makonekta sa Dunong.",
      );
    }
    setAsking(false);
  }, [selBlock, paragraphs, lang]);

  const startRecording = useCallback(() => {
    chunksRef.current = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        const mr = new MediaRecorder(s, { mimeType: "audio/webm" });
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start();
        mediaRecRef.current = mr;
        setListening(true);
      })
      .catch(() => setError("Microphone access denied"));
  }, []);

  const stopRecordingAndSubmit = useCallback(async () => {
    setListening(false);
    if (!mediaRecRef.current) return;
    const mr = mediaRecRef.current;
    mr.stop();
    mr.stream.getTracks().forEach((t) => t.stop());
    setSubmitting(true);
    setError("");
    await new Promise((r) => setTimeout(r, 300));
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    try {
      const fd = new FormData();
      fd.append("audio", blob, "audio.webm");
      const tRes = await fetch(`${API}/api/transcribe`, {
        method: "POST",
        body: fd,
      });
      const tData = await tRes.json();
      if (tData.error) throw new Error(tData.error);
      setTranscript(tData.transcript);
      const lockedText =
        selBlock !== null ? paragraphs[selBlock] : extractedText;
      const cRes = await fetch(`${API}/api/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockedText,
          transcript: tData.transcript,
          mode: recitMode.toLowerCase().replace(/ /g, "_"),
          lang,
        }),
      });
      const cData = await cRes.json();
      if (cData.error) throw new Error(cData.error);
      const s = {
        accuracy: cData.accuracy ?? 75,
        confidence: cData.confidence ?? 70,
        clarity: cData.clarity ?? 72,
      };
      setScores(s);
      setFeedback(cData.feedback || "Magaling! Keep practicing.");
      setFillerWords(cData.fillerWords ?? 0);
      setPauseTime(cData.pauseTime ?? 0);
      setStep(3);
      onDone(s, cData.feedback || "");
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [selBlock, paragraphs, extractedText, recitMode, onDone]);

  if (showChoice) {
    const modeInfo: Record<string, { desc: string; xp: string; color: string; tip: string }> = {
      "Read-Aloud": {
        desc: "Read the text aloud clearly",
        xp: "+10 XP",
        color: "#A8CFA0",
        tip: "Focus on pronunciation and pace.",
      },
      Paraphrase: {
        desc: "Explain in your own words",
        xp: "+20 XP",
        color: "#D6B15E",
        tip: "Don't memorize — understand and rephrase.",
      },
      "Cold Call": {
        desc: "Answer from memory, no text visible",
        xp: "+35 XP",
        color: "#4B4032",
        tip: "Lock the text first, then recall everything you know.",
      },
      "Stand & Deliver": {
        desc: "Full recitation with countdown pressure",
        xp: "+50 XP",
        color: "#BF9840",
        tip: "Breathe. You have 3 seconds on the clock — just start speaking.",
      },
    };
    const info = modeInfo[recitMode] ?? modeInfo["Paraphrase"];
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <h3 className="text-[#4B4032] font-bold text-sm">Start Practice</h3>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleGalleryUpload}
        />
        <div className="mx-5 mt-4 rounded-3xl p-4 border-2 flex items-start gap-3" style={{ borderColor: info.color, background: `${info.color}12` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${info.color}30` }}>
            <Mic size={18} style={{ color: info.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-black text-[#4B4032] text-sm">{recitMode}</p>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ color: info.color, background: `${info.color}25` }}>{info.xp}</span>
            </div>
            <p className="text-[#7A736B] text-xs">{info.desc}</p>
            <p className="text-[10px] mt-1 font-medium italic" style={{ color: info.color }}>Tip: {info.tip}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-4 px-6">
          {scanning && (
            <div className="bg-[#F4E3B2] rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#D6B15E] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-[#4B4032] text-xs font-semibold">Scanning photo...</p>
            </div>
          )}
          {error && !scanning && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-xs font-semibold">{error}</p>
            </div>
          )}
          <p className="text-[#7A736B] text-xs text-center">
            How do you want to scan your module?
          </p>
          <button
            onClick={() => {
              setShowChoice(false);
            }}
            className="w-full bg-[#4B4032] rounded-3xl p-5 flex items-center gap-4 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#D6B15E] flex items-center justify-center flex-shrink-0">
              <Camera size={24} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-bold text-base">Camera</p>
              <p className="text-white/55 text-xs">
                Point at your printed module
              </p>
            </div>
            <ChevronRight size={20} className="text-white/40" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white rounded-3xl p-5 flex items-center gap-4 border border-[#E7D3A8] active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E7D3A8] flex items-center justify-center flex-shrink-0">
              <Upload size={24} className="text-[#4B4032]" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[#4B4032] font-bold text-base">Gallery</p>
              <p className="text-[#7A736B] text-xs">
                Upload a photo from your device
              </p>
            </div>
            <ChevronRight size={20} className="text-[#C5B9AE]" />
          </button>
          {recitMode === "Read-Aloud" && (
            <button
              onClick={() => {
                setShowChoice(false);
                setStep(2);
              }}
              className="w-full bg-[#A8CFA0] rounded-3xl p-5 flex items-center gap-4 active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center flex-shrink-0">
                <Mic size={24} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-bold text-base">Record Now</p>
                <p className="text-white/75 text-xs">
                  Skip scan — tap to start reading aloud
                </p>
              </div>
              <ChevronRight size={20} className="text-white/60" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 0)
    return (
      <div className="h-full flex flex-col bg-[#1A1209]">
        <div className="px-5 pt-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <span className="text-white font-bold text-sm">Scan Module</span>
          <div className="w-10 h-10" />
        </div>
        <div className="flex-1 mx-4 mt-4 relative rounded-3xl overflow-hidden bg-[#0D0A04]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          {[
            "top-5 left-5 border-t-[3px] border-l-[3px] rounded-tl-2xl",
            "top-5 right-5 border-t-[3px] border-r-[3px] rounded-tr-2xl",
            "bottom-5 left-5 border-b-[3px] border-l-[3px] rounded-bl-2xl",
            "bottom-5 right-5 border-b-[3px] border-r-[3px] rounded-br-2xl",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-9 h-9 border-[#D6B15E] ${cls}`}
            />
          ))}
          <div
            className="absolute left-8 right-8 h-px bg-[#D6B15E]"
            style={{ top: "48%", boxShadow: "0 0 12px 2px #D6B15E88" }}
          />
          {error && (
            <div className="absolute inset-x-4 top-4 bg-red-900/80 text-white text-xs p-2 rounded-xl text-center">
              {error}
            </div>
          )}
          <div className="absolute bottom-6 inset-x-0 flex justify-center">
            <span className="bg-[#D6B15E]/90 text-white text-xs font-bold px-4 py-1.5 rounded-full">
              {scanning ? "Scanning..." : "Point at printed text"}
            </span>
          </div>
        </div>
        <div className="px-6 py-5 flex items-center justify-around flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGalleryUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="w-14 h-14 rounded-2xl bg-[#2A2010] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-40"
          >
            <Upload size={18} className="text-[#D6B15E]" />
            <span className="text-[#D6B15E]/70 text-[9px] font-semibold">
              Gallery
            </span>
          </button>
          <button
            onClick={captureAndScan}
            disabled={scanning}
            className="w-20 h-20 rounded-full bg-[#D6B15E] flex items-center justify-center shadow-xl shadow-[#D6B15E]/40 active:scale-95 transition-transform disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
              {scanning ? <ScanLine size={26} className="text-white animate-pulse" /> : <Camera size={26} className="text-white" />}
            </div>
          </button>
          <button
            onClick={startCamera}
            className="w-14 h-14 rounded-2xl bg-[#2A2010] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <RotateCcw size={18} className="text-[#D6B15E]" />
            <span className="text-[#D6B15E]/70 text-[9px] font-semibold">Retry</span>
          </button>
        </div>
      </div>
    );

  if (showTamaBa)
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setShowTamaBa(false); startCamera(); }}
            className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <div className="flex-1">
            <h3 className="text-[#4B4032] font-black text-base" style={{ fontFamily: "Fraunces, serif" }}>
              Tama Ba?
            </h3>
            <p className="text-[#7A736B] text-xs">
              {lang === "FIL" ? "Suriin at i-edit ang na-scan na teksto" : "Review and edit the scanned text"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#F4E3B2] flex items-center justify-center">
            <PenLine size={14} className="text-[#D6B15E]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 mt-4 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-3">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ScanLine size={9} />
              {lang === "FIL" ? "Na-extract na Teksto — I-edit kung may mali" : "Extracted Text — Edit any mistakes"}
            </p>
            <textarea
              value={tamaBaText}
              onChange={(e) => setTamaBaText(e.target.value)}
              className="w-full text-[#4B4032] text-xs leading-relaxed outline-none resize-none bg-transparent"
              rows={14}
            />
          </div>
          <div className="bg-[#F4E3B2] rounded-2xl px-4 py-3 border border-[#E7D3A8]">
            <p className="text-[#4B4032] text-xs leading-relaxed">
              {lang === "FIL"
                ? "I-edit ang anumang salita na hindi tama. Kapag tama na ang lahat, pindutin ang 'Tama Na!'"
                : "Fix any word the scanner got wrong. When everything looks right, tap 'Looks Good!'"}
            </p>
          </div>
        </div>

        <div className="px-5 pb-8 pt-2 shrink-0 flex gap-3">
          <button
            onClick={() => { setShowTamaBa(false); startCamera(); }}
            className="w-14 h-14 rounded-2xl bg-[#E7D3A8] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Camera size={20} className="text-[#4B4032]" />
          </button>
          <button
            onClick={() => {
              const paras = tamaBaText.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 20);
              setExtractedText(tamaBaText);
              setParagraphs(paras.length ? paras : [tamaBaText]);
              setShowTamaBa(false);
              setStep(1);
            }}
            disabled={!tamaBaText.trim()}
            className="flex-1 py-4 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
          >
            <Check size={18} />
            {lang === "FIL" ? "Tama Na!" : "Looks Good!"}
          </button>
        </div>
      </div>
    );

  if (step === 1)
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setStep(0)}
            className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <div className="flex-1">
            <h3 className="text-[#4B4032] font-bold text-sm">Sipat-Aral</h3>
            <p className="text-[#7A736B] text-xs">Extracted Text</p>
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto px-5 mt-4 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-3">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-3">
              Extracted Text — Tap to select
            </p>
            <div className="flex flex-col gap-2.5">
              {paragraphs.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelBlock(selBlock === i ? null : i);
                    setAskAnswer("");
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all text-xs leading-relaxed text-[#4B4032] ${selBlock === i ? "bg-[#F4E3B2] border-2 border-[#D6B15E]" : "bg-[#FAFAF8] border border-[#E7D3A8]"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {selBlock !== null && (
            <button
              onClick={askDunong}
              disabled={asking}
              className="w-full bg-[#F4E3B2] rounded-2xl p-3.5 mb-3 flex items-center gap-3 active:scale-95 transition-transform disabled:opacity-60"
            >
              <div className="w-9 h-9 rounded-xl bg-[#D6B15E] flex items-center justify-center flex-shrink-0">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-[#4B4032] text-xs font-bold">Ask Dunong</p>
                <p className="text-[#7A736B] text-xs mt-0.5">
                  {asking
                    ? "Thinking..."
                    : lang === "EN"
                      ? "What does this mean?"
                      : "Ano ang ibig sabihin nito?"}
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
            {recitMode === "Read-Aloud"
              ? "Select the text you want to read aloud."
              : "Select a paragraph then explain it in your own words."}
          </p>
          <button
            onClick={() => {
              if (recitMode === "Read-Aloud" && selBlock === null && paragraphs.length > 0) {
                setSelBlock(0);
              }
              setShowSabihinMo(true);
            }}
            className="w-full py-4 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Lock size={16} />
            {recitMode === "Read-Aloud" ? "Lock & Start Reading" : "I-lock at Magsalita"}
          </button>
        </div>
      </div>
    );

  if (showSabihinMo) {
    const prompts = sabihinMoPrompts[recitMode] ?? sabihinMoPrompts["Paraphrase"];
    const promptText = lang === "FIL" ? prompts.fil : prompts.en;
    const lockedPara = selBlock !== null ? paragraphs[selBlock] : extractedText;
    const modeColors: Record<string, string> = {
      "Read-Aloud": "#A8CFA0", "Paraphrase": "#D6B15E",
      "Cold Call": "#4B4032", "Stand & Deliver": "#BF9840",
    };
    const accent = modeColors[recitMode] ?? "#D6B15E";
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        {/* Top bar */}
        <div className="px-5 pt-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => { window.speechSynthesis.cancel(); setShowSabihinMo(false); }}
            className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider">Sabihin Mo</p>
            <p className="text-[#4B4032] font-black text-sm">{recitMode}</p>
          </div>
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: accent }} />
        </div>

        <div className="flex-1 flex flex-col px-5 pt-5 pb-6 justify-between">
          {/* Locked paragraph */}
          {lockedPara && (
            <div className="bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-5">
              <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock size={9} /> Na-lock na Talata
              </p>
              <p className="text-[#4B4032] text-xs leading-relaxed line-clamp-5">{lockedPara}</p>
            </div>
          )}

          {/* AI teacher prompt card */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl" style={{ background: accent }}>
              <span className="text-white font-black text-xl" style={{ fontFamily: "Fraunces, serif" }}>D</span>
            </div>

            {/* Prompt bubble */}
            <div className="bg-white rounded-3xl rounded-tl-md px-5 py-4 border border-[#E7D3A8]/70 shadow-md max-w-[90%] text-center">
              <p className="text-[#4B4032] font-bold text-sm leading-relaxed">"{promptText}"</p>
            </div>

            {/* Replay TTS button */}
            <button onClick={playSabihinMoPrompt} disabled={promptPlaying}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7D3A8] bg-white text-[#7A736B] text-xs font-bold active:scale-95 transition-transform disabled:opacity-40">
              <Volume2 size={13} />
              {promptPlaying ? (lang === "FIL" ? "Nagsasalita..." : "Speaking...") : (lang === "FIL" ? "Pakinggan ulit" : "Play again")}
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => { window.speechSynthesis.cancel(); setShowSabihinMo(false); setStep(2); }}
            className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.98] transition-transform"
            style={{ background: accent, boxShadow: `0 12px 30px ${accent}40` }}
          >
            <Mic size={20} />
            {lang === "FIL" ? "Handa na ako — Magsalita" : "I'm Ready — Speak Now"}
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const modes = ["Paraphrase", "Read-Aloud", "Cold Call", "Stand & Deliver"];
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setStep(1)}
            className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <h3 className="text-[#4B4032] font-bold text-sm flex-1">
            Recitation Mode
          </h3>
          {listening && (
            <div className="bg-[#F4E3B2] px-3 py-1 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[#4B4032] text-xs font-bold">REC</span>
            </div>
          )}
        </div>
        <div className="px-5 mt-3 flex-shrink-0">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setRecitMode(m)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${recitMode === m ? "bg-[#4B4032] text-white" : "bg-[#E7D3A8] text-[#7A736B]"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {selBlock !== null &&
          (["Cold Call", "Stand & Deliver"].includes(recitMode) ? (
            <div className="mx-5 mt-3 bg-[#F4E3B2] rounded-3xl p-4 border border-[#D6B15E]/40 shadow-sm flex-shrink-0 flex items-center gap-3">
              <Lock size={16} className="text-[#D6B15E] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider">
                  Text hidden
                </p>
                <p className="text-[#4B4032] text-xs font-medium mt-0.5">
                  {recitMode} — recall from memory
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-5 mt-3 bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm flex-shrink-0">
              <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">
                Selected Text
              </p>
              <p className="text-[#4B4032] text-xs leading-relaxed line-clamp-4">
                {paragraphs[selBlock]}
              </p>
            </div>
          ))}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {error && (
            <p className="text-red-500 text-xs px-5 text-center">{error}</p>
          )}
          <div className="relative flex items-center justify-center">
            {listening && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-[#D6B15E]/15 animate-ping" />
                <div
                  className="absolute w-28 h-28 rounded-full bg-[#D6B15E]/20 animate-ping"
                  style={{ animationDelay: "0.25s" }}
                />
              </>
            )}
            {recitMode === "Read-Aloud" ? (
              <button
                onClick={listening ? stopRecordingAndSubmit : startRecording}
                disabled={submitting}
                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${listening ? "bg-red-500 shadow-red-500/35" : "bg-[#A8CFA0] shadow-[#A8CFA0]/35"}`}
              >
                {listening
                  ? <StopCircle size={40} className="text-white" />
                  : <Mic size={40} className="text-white" />}
              </button>
            ) : (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecordingAndSubmit}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onTouchEnd={stopRecordingAndSubmit}
                disabled={submitting}
                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${listening ? "bg-[#D6B15E] shadow-[#D6B15E]/35" : "bg-[#4B4032] shadow-[#4B4032]/20"}`}
              >
                <Mic size={40} className="text-white" />
              </button>
            )}
          </div>
          <p className="text-[#7A736B] text-sm font-semibold">
            {submitting
              ? "Processing..."
              : recitMode === "Read-Aloud"
                ? listening
                  ? "Recording — tap to stop"
                  : "Tap to start reading"
                : listening
                  ? "Listening..."
                  : "Hold to Speak"}
          </p>
          {listening && (
            <div className="flex items-end gap-1 h-10">
              {[4, 8, 14, 10, 18, 12, 6, 16, 9].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-[#D6B15E] rounded-full animate-pulse"
                  style={{
                    height: `${h + 4}px`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}
          {submitting && transcript && (
            <div className="mx-5 bg-white rounded-2xl p-3.5 border border-[#E7D3A8]/60 w-full">
              <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1">
                Dunong heard
              </p>
              <p className="text-[#4B4032] text-xs leading-relaxed italic">
                "{transcript}"
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const scoreList = [
    { label: "Accuracy", value: scores.accuracy, color: "#D6B15E" },
    { label: "Confidence", value: scores.confidence, color: "#A8CFA0" },
    { label: "Clarity", value: scores.clarity, color: "#4B4032" },
  ];
  const total = Math.round(
    (scores.accuracy + scores.confidence + scores.clarity) / 3,
  );
  return (
    <div
      className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="px-5 pt-3 flex items-center gap-3">
        <button
          onClick={() => setStep(2)}
          className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-[#4B4032]" />
        </button>
        <h3
          className="text-[#4B4032] font-black text-base flex-1"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Feedback Results
        </h3>
        <span className="text-white font-bold text-xs bg-[#D6B15E] px-3 py-1 rounded-full">
          +{total} pts
        </span>
      </div>
      <div className="mx-5 mt-4 grid grid-cols-3 gap-2.5">
        {scoreList.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-3 text-center border border-[#E7D3A8]/60 shadow-sm"
          >
            <SkillRing label={s.label} value={s.value} color={s.color} />
          </div>
        ))}
      </div>
      <div className="mx-5 mt-3 grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-[#E7D3A8]/60 shadow-sm">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1">
            Filler Words
          </p>
          <p className="text-xl font-black text-[#4B4032]">
            {fillerWords}{" "}
            <span className="text-xs font-semibold text-[#7A736B]">
              detected
            </span>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#E7D3A8]/60 shadow-sm">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1">
            Avg Pause
          </p>
          <p className="text-xl font-black text-[#4B4032]">
            {pauseTime}s{" "}
            <span className="text-xs font-semibold text-[#7A736B]">
              between words
            </span>
          </p>
        </div>
      </div>
      {transcript && (
        <div className="mx-5 mt-4 bg-white rounded-3xl p-4 border border-[#E7D3A8]/60">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">
            Dunong heard
          </p>
          <p className="text-[#4B4032] text-xs leading-relaxed italic">
            "{transcript}"
          </p>
        </div>
      )}
      <div className="mx-5 mt-4 bg-[#F4E3B2] rounded-3xl p-4 border border-[#E7D3A8]">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#D6B15E] flex items-center justify-center">
            <span className="text-white text-[10px] font-black">D</span>
          </div>
          <span className="text-[#4B4032] font-bold text-sm">Dunong says</span>
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(feedback);
              u.lang = "fil-PH";
              u.rate = 0.9;
              window.speechSynthesis.speak(u);
            }}
            className="ml-auto w-7 h-7 rounded-full bg-[#D6B15E] flex items-center justify-center"
          >
            <Volume2 size={13} className="text-white" />
          </button>
        </div>
        <p className="text-[#4B4032] text-sm leading-relaxed">
          {feedback || "Napakagaling mo! Keep going!"}
        </p>
      </div>
      <div className="mx-5 mt-4 flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-3.5 bg-[#E7D3A8] rounded-2xl text-[#4B4032] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RotateCcw size={15} />
          Try Again
        </button>
        <button
          onClick={() => setStep(0)}
          className="flex-1 py-3.5 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Zap size={15} />
          New Scan
        </button>
      </div>
    </div>
  );
}
