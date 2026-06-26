import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Library,
  ChevronRight,
  FileText,
  Camera,
  Link,
  Layers,
  Mic,
  MessageCircle,
  X,
  RotateCw,
  HelpCircle,
  Check,
  Clock,
  StopCircle,
  Trophy,
} from "lucide-react";
import {
  Notebook,
  Source,
  ResourceType,
  ChatMessage,
  OralMode,
  OralPhase,
  OralCard,
  OralScore,
} from "../types";
import { API } from "../constants";

export default function LibraryScreen({
  notebooks,
  setNotebooks,
  lang,
  onPractice,
}: {
  notebooks: Notebook[];
  setNotebooks: React.Dispatch<React.SetStateAction<Notebook[]>>;
  lang: string;
  onPractice: (mode: string, text: string) => void;
}) {
  const fil = lang === "FIL";
  const [selected, setSelected] = useState<Notebook | null>(null);
  const [activeTab, setActiveTab] = useState<"sources" | "chat" | "studio" | "oral">("sources");
  const [showAddSource, setShowAddSource] = useState(false);
  const [addType, setAddType] = useState<ResourceType | null>(null);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [generatingStudio, setGeneratingStudio] = useState(false);
  const [studioMode, setStudioMode] = useState<"flashcards" | "quiz">("flashcards");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  // Oral practice state
  const [oralPhase, setOralPhase] = useState<OralPhase>("select");
  const [oralMode, setOralMode] = useState<OralMode>("read-aloud");
  const [oralCount, setOralCount] = useState(5);
  const [oralSelection, setOralSelection] = useState<"auto" | "manual">("auto");
  const [oralPool, setOralPool] = useState<OralCard[]>([]);
  const [oralPickedIds, setOralPickedIds] = useState<Set<string>>(new Set());
  const [oralCards, setOralCards] = useState<OralCard[]>([]);
  const [oralCardIndex, setOralCardIndex] = useState(0);
  const [oralRecording, setOralRecording] = useState(false);
  const [oralAnalyzing, setOralAnalyzing] = useState(false);
  const [oralCurrentScore, setOralCurrentScore] = useState<OralScore | null>(null);
  const [oralScores, setOralScores] = useState<OralScore[]>([]);
  const [oralGenerating, setOralGenerating] = useState(false);
  const [oralTimer, setOralTimer] = useState(0);
  const oralMrRef = useRef<MediaRecorder | null>(null);
  const oralChunksRef = useRef<Blob[]>([]);
  const oralTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getContent = (nb: Notebook) => nb.sources.map((s) => s.content).join("\n\n");

  const oralTimerLimit = (m: OralMode) => ({ "read-aloud": 0, "paraphrase": 0, "quiz-bee": 30, "recitation": 60 }[m]);
  const oralScoreInfo = (s: number) => {
    if (s >= 9) return { color: "#D6B15E", bg: "#D6B15E20", badge: "Expert 🏆" };
    if (s >= 7) return { color: "#A8CFA0", bg: "#A8CFA020", badge: "Proficient ⭐" };
    if (s >= 5) return { color: "#6BBBDD", bg: "#6BBBDD20", badge: "Developing 📈" };
    if (s >= 3) return { color: "#D6936B", bg: "#D6936B20", badge: "Beginner 🌱" };
    return { color: "#D66B6B", bg: "#D66B6B20", badge: "Needs Improvement 💪" };
  };
  const getParagraphs = (txt: string): OralCard[] => {
    const paras = txt.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 40);
    if (paras.length >= 2) return paras.map((p, i) => ({ id: `p_${i}`, content: p }));
    // Fall back to sentence chunking ~150 chars each
    const sentences = txt.match(/[^.!?。]+[.!?。]+\s*/g) ?? [txt];
    const chunks: string[] = [];
    let cur = "";
    for (const s of sentences) {
      cur += s;
      if (cur.length > 140) { chunks.push(cur.trim()); cur = ""; }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.filter(c => c.length > 20).map((c, i) => ({ id: `p_${i}`, content: c }));
  };
  const evenlySample = (arr: OralCard[], n: number): OralCard[] => {
    if (arr.length <= n) return arr;
    const step = arr.length / n;
    return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
  };
  const resetOral = () => {
    setOralPhase("select");
    setOralCards([]); setOralScores([]); setOralCurrentScore(null);
    setOralCardIndex(0); setOralPool([]); setOralPickedIds(new Set());
    setOralRecording(false); setOralAnalyzing(false);
    if (oralTimerRef.current) { clearInterval(oralTimerRef.current); oralTimerRef.current = null; }
  };

  const handleOralGenerate = useCallback(async () => {
    if (!selected) return;
    const cnt = getContent(selected);
    if (oralMode === "read-aloud") {
      const pool = getParagraphs(cnt);
      if (oralSelection === "auto") {
        setOralCards(evenlySample(pool, Math.min(oralCount, pool.length)));
        setOralCardIndex(0); setOralScores([]); setOralCurrentScore(null);
        setOralPhase("practice");
      } else {
        setOralPool(pool); setOralPickedIds(new Set()); setOralPhase("pick");
      }
    } else {
      setOralGenerating(true);
      try {
        const fetchCount = oralSelection === "auto" ? oralCount : Math.min(oralCount * 2 + 2, 12);
        const res = await fetch(`${API}/api/oral-generate`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: cnt, mode: oralMode, count: fetchCount, lang }),
        });
        const data = await res.json();
        const items: OralCard[] = (data.cards ?? []).map((c: any, i: number) => ({ id: `oral_${i}`, content: String(c.content ?? ""), hint: c.hint ? String(c.hint) : undefined }));
        if (oralSelection === "auto") {
          setOralCards(items.slice(0, oralCount));
          setOralCardIndex(0); setOralScores([]); setOralCurrentScore(null);
          setOralPhase("practice");
        } else {
          setOralPool(items); setOralPickedIds(new Set()); setOralPhase("pick");
        }
      } catch { /* silent */ }
      finally { setOralGenerating(false); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, oralMode, oralCount, oralSelection, lang]);

  const startOralRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      oralChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) oralChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setOralRecording(false); setOralAnalyzing(true);
        try {
          const blob = new Blob(oralChunksRef.current, { type: "audio/webm" });
          const fd = new FormData(); fd.append("audio", blob, "oral.webm");
          const tRes = await fetch(`${API}/api/transcribe`, { method: "POST", body: fd });
          const { transcript = "" } = await tRes.json();
          const card = oralCards[oralCardIndex];
          const sRes = await fetch(`${API}/api/oral-score`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: oralMode, cardContent: card.content, transcript, lang }),
          });
          const sData = await sRes.json();
          const result: OralScore = { score: sData.score ?? 5, label: sData.label ?? "Developing", feedback: sData.feedback ?? "", transcript };
          setOralCurrentScore(result);
          setOralScores(prev => [...prev, result]);
          setOralPhase("card-result");
        } catch { /* silent */ }
        finally { setOralAnalyzing(false); }
      };
      mr.start(); oralMrRef.current = mr; setOralRecording(true);
      const limit = oralTimerLimit(oralMode);
      if (limit > 0) {
        setOralTimer(limit);
        oralTimerRef.current = setInterval(() => {
          setOralTimer(prev => {
            if (prev <= 1) { clearInterval(oralTimerRef.current!); oralTimerRef.current = null; oralMrRef.current?.stop(); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch { /* mic denied */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oralMode, oralCards, oralCardIndex, lang]);

  const stopOralRecording = useCallback(() => {
    if (oralTimerRef.current) { clearInterval(oralTimerRef.current); oralTimerRef.current = null; }
    oralMrRef.current?.stop();
  }, []);

  const updateNotebook = useCallback((updated: Notebook) => {
    setNotebooks((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelected(updated);
  }, [setNotebooks]);

  const addSource = useCallback(async (type: ResourceType, content: string, label: string) => {
    if (!selected || !content.trim()) return;
    const src: Source = { id: Date.now().toString(), type, label, content };
    const updated = { ...selected, sources: [...selected.sources, src] };
    updateNotebook(updated);
    setAddType(null);
    setTextInput("");
    setUrlInput("");
    setShowAddSource(false);
  }, [selected, updateNotebook]);

  const handlePdfUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setAdding(true); setAddError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/extract-pdf`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await addSource("pdf", data.text, file.name.replace(".pdf", ""));
    } catch (err: any) { setAddError(err.message || "PDF extraction failed"); }
    finally { setAdding(false); if (pdfInputRef.current) pdfInputRef.current.value = ""; }
  }, [selected, addSource]);

  const handleImgUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setAdding(true); setAddError("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`${API}/api/scan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await addSource("image", data.text, file.name || "Scanned Image");
    } catch (err: any) { setAddError(err.message || "Image scan failed"); }
    finally { setAdding(false); if (imgInputRef.current) imgInputRef.current.value = ""; }
  }, [selected, addSource]);

  const handleUrlExtract = useCallback(async () => {
    if (!urlInput.trim() || !selected) return;
    setAdding(true); setAddError("");
    try {
      const res = await fetch(`${API}/api/extract-url`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: urlInput.trim() }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await addSource("url", data.text, urlInput.trim());
    } catch (err: any) { setAddError(err.message || "URL extraction failed"); }
    finally { setAdding(false); }
  }, [urlInput, selected, addSource]);

  const handleGenerateStudio = useCallback(async () => {
    if (!selected) return;
    const content = getContent(selected);
    if (!content) return;
    setGeneratingStudio(true);
    try {
      const res = await fetch(`${API}/api/studio`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, lang }) });
      const data = await res.json();
      const updated = { ...selected, flashcards: data.flashcards ?? [], quiz: data.quiz ?? [] };
      updateNotebook(updated);
      setFcIndex(0); setFcFlipped(false);
      setQuizAnswers(new Array((data.quiz ?? []).length).fill(null));
    } catch (err) { /* silent */ }
    finally { setGeneratingStudio(false); }
  }, [selected, lang, updateNotebook]);

  const handleChatSend = useCallback(async (text: string) => {
    if (!text.trim() || !selected || chatLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: text.trim() };
    const updated = { ...selected, chatMessages: [...selected.chatMessages, userMsg] };
    updateNotebook(updated);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...updated.chatMessages].map((m) => ({ role: m.role, content: m.text })), lang, context: getContent(selected).slice(0, 2000) }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", text: data.message || "..." };
      updateNotebook({ ...updated, chatMessages: [...updated.chatMessages, aiMsg] });
    } catch { /* silent */ }
    finally { setChatLoading(false); }
  }, [selected, chatLoading, lang, updateNotebook]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selected?.chatMessages, chatLoading]);

  const typeIcon = (t: ResourceType) => ({ text: FileText, image: Camera, pdf: FileText, url: Link }[t]);
  const typeColor = (t: ResourceType) => ({ text: "#4B4032", image: "#D6B15E", pdf: "#BF9840", url: "#A8CFA0" }[t]);

  // ─── LIST VIEW ────────────────────────────────────────────────────────────
  if (!selected)
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 pt-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-[#4B4032] font-black text-xl" style={{ fontFamily: "Fraunces, serif" }}>Study Space</h2>
            <p className="text-[#7A736B] text-xs">{fil ? "Ang iyong mga notebook" : "Your notebooks"}</p>
          </div>
          <button
            onClick={() => {
              const nb: Notebook = { id: Date.now().toString(), title: `Notebook ${notebooks.length + 1}`, sources: [], chatMessages: [], flashcards: [], quiz: [], createdAt: new Date().toLocaleDateString() };
              setNotebooks((prev) => [...prev, nb]);
              setSelected(nb);
              setActiveTab("sources");
              setShowAddSource(true);
            }}
            className="w-10 h-10 rounded-2xl bg-[#D6B15E] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 space-y-3" style={{ scrollbarWidth: "none" }}>
          {notebooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-[#F4E3B2] flex items-center justify-center">
                <Library size={36} className="text-[#D6B15E]" />
              </div>
              <p className="text-[#7A736B] text-sm text-center leading-relaxed">
                {fil ? "Walang notebook pa.\nPindutin ang + para gumawa ng bago." : "No notebooks yet.\nTap + to create your first one."}
              </p>
            </div>
          ) : notebooks.map((nb) => {
            const content = getContent(nb);
            return (
              <button key={nb.id} onClick={() => { setSelected(nb); setActiveTab("sources"); }} className="w-full bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm text-left active:scale-[0.98] transition-transform">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F4E3B2] flex items-center justify-center flex-shrink-0">
                    <Library size={20} className="text-[#D6B15E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#4B4032] font-black text-sm">{nb.title}</p>
                    <p className="text-[#7A736B] text-xs mt-0.5">{nb.sources.length} {fil ? "source" : "source"}{nb.sources.length !== 1 ? "s" : ""} · {nb.createdAt}</p>
                    {content && <p className="text-[#4B4032]/60 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">{content.slice(0, 120)}</p>}
                  </div>
                  <ChevronRight size={16} className="text-[#C5B9AE] flex-shrink-0 mt-1" />
                </div>
                {nb.sources.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {(["sources", "chat", "studio", "oral"] as const).map((t) => (
                      <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F4E3B2] text-[#7A736B] uppercase tracking-wide">{t}</span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );

  // ─── NOTEBOOK DETAIL VIEW ─────────────────────────────────────────────────
  const content = getContent(selected);
  const tabs = [
    { id: "sources", label: "Sources", icon: FileText },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "studio", label: "Studio", icon: Layers },
    { id: "oral", label: "Oral", icon: Mic },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-[#FFF9EE]">
      {/* Header */}
      <div className="px-5 pt-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#4B4032]" />
        </button>
        <p className="text-[#4B4032] font-black text-sm flex-1 truncate" style={{ fontFamily: "Fraunces, serif" }}>{selected.title}</p>
      </div>

      {/* Tab bar */}
      <div className="px-5 mt-3 flex-shrink-0">
        <div className="flex gap-1 bg-[#E7D3A8]/50 rounded-2xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${activeTab === id ? "bg-white shadow-sm" : ""}`}>
              <Icon size={14} className={activeTab === id ? "text-[#D6B15E]" : "text-[#A89D8A]"} />
              <span className={`text-[9px] font-bold uppercase tracking-wide ${activeTab === id ? "text-[#4B4032]" : "text-[#A89D8A]"}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SOURCES TAB ── */}
      {activeTab === "sources" && (
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4 space-y-3" style={{ scrollbarWidth: "none" }}>
          <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
          <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />

          {/* Add source button */}
          <button onClick={() => { setShowAddSource(!showAddSource); setAddType(null); setAddError(""); }}
            className="w-full flex items-center gap-3 bg-[#4B4032] rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform">
            <Plus size={18} className="text-[#D6B15E]" />
            <span className="text-white font-bold text-sm">{fil ? "Magdagdag ng Source" : "Add Source"}</span>
            <ChevronRight size={14} className="text-white/40 ml-auto" />
          </button>

          {showAddSource && !addType && (
            <div className="bg-white rounded-3xl border border-[#E7D3A8]/60 overflow-hidden shadow-sm">
              {([
                { type: "text" as ResourceType, icon: FileText, label: fil ? "I-type ang Teksto" : "Type / Paste Text", color: "#4B4032" },
                { type: "image" as ResourceType, icon: Camera, label: fil ? "I-scan ang Larawan" : "Scan Image", color: "#D6B15E" },
                { type: "pdf" as ResourceType, icon: FileText, label: "PDF", color: "#BF9840" },
                { type: "url" as ResourceType, icon: Link, label: fil ? "I-paste ang Link" : "Paste a Link", color: "#A8CFA0" },
              ]).map((opt, i, arr) => {
                const Icon = opt.icon;
                return (
                  <button key={opt.type} onClick={() => setAddType(opt.type)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#F4E3B2]/30 text-left ${i < arr.length - 1 ? "border-b border-[#E7D3A8]/40" : ""}`}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${opt.color}22` }}>
                      <Icon size={15} style={{ color: opt.color }} />
                    </div>
                    <span className="text-[#4B4032] font-medium text-sm">{opt.label}</span>
                    <ChevronRight size={13} className="text-[#C5B9AE] ml-auto" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Text input */}
          {addType === "text" && (
            <div className="bg-white rounded-3xl border border-[#E7D3A8]/60 p-4 shadow-sm space-y-3">
              <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} rows={5}
                placeholder={fil ? "I-paste o i-type ang teksto dito..." : "Paste or type your text here..."}
                className="w-full text-sm text-[#4B4032] bg-[#FAFAF8] border border-[#E7D3A8] rounded-2xl p-3 outline-none resize-none leading-relaxed" />
              {addError && <p className="text-red-500 text-xs">{addError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setAddType(null)} className="flex-1 py-2.5 rounded-xl border border-[#E7D3A8] text-[#7A736B] text-sm font-bold"><X size={14} className="inline mr-1" />{fil ? "Bumalik" : "Back"}</button>
                <button onClick={() => addSource("text", textInput, `Text ${selected.sources.length + 1}`)} disabled={!textInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#4B4032] text-white text-sm font-bold disabled:opacity-40">
                  {fil ? "Idagdag" : "Add"}
                </button>
              </div>
            </div>
          )}

          {/* URL input */}
          {addType === "url" && (
            <div className="bg-white rounded-3xl border border-[#E7D3A8]/60 p-4 shadow-sm space-y-3">
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full text-sm text-[#4B4032] bg-[#FAFAF8] border border-[#E7D3A8] rounded-2xl px-3 py-2.5 outline-none" />
              {addError && <p className="text-red-500 text-xs">{addError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setAddType(null)} className="flex-1 py-2.5 rounded-xl border border-[#E7D3A8] text-[#7A736B] text-sm font-bold"><X size={14} className="inline mr-1" />{fil ? "Bumalik" : "Back"}</button>
                <button onClick={handleUrlExtract} disabled={adding || !urlInput.trim()} className="flex-1 py-2.5 rounded-xl bg-[#A8CFA0] text-white text-sm font-bold disabled:opacity-40">
                  {adding ? (fil ? "Kumukuha..." : "Fetching...") : (fil ? "I-extract" : "Extract")}
                </button>
              </div>
            </div>
          )}

          {/* PDF / Image triggers */}
          {addType === "pdf" && (
            <div className="bg-white rounded-3xl border border-[#E7D3A8]/60 p-4 shadow-sm space-y-3">
              {addError && <p className="text-red-500 text-xs">{addError}</p>}
              <button onClick={() => pdfInputRef.current?.click()} disabled={adding}
                className="w-full py-3 rounded-xl bg-[#BF9840] text-white font-bold text-sm disabled:opacity-50">
                {adding ? (fil ? "Pinoproseso..." : "Processing...") : (fil ? "Piliin ang PDF File" : "Choose PDF File")}
              </button>
              <button onClick={() => setAddType(null)} className="w-full py-2 text-[#7A736B] text-sm font-bold">{fil ? "Bumalik" : "Back"}</button>
            </div>
          )}

          {addType === "image" && (
            <div className="bg-white rounded-3xl border border-[#E7D3A8]/60 p-4 shadow-sm space-y-3">
              {addError && <p className="text-red-500 text-xs">{addError}</p>}
              <button onClick={() => imgInputRef.current?.click()} disabled={adding}
                className="w-full py-3 rounded-xl bg-[#D6B15E] text-white font-bold text-sm disabled:opacity-50">
                {adding ? (fil ? "Siniscan..." : "Scanning...") : (fil ? "Pumili ng Larawan" : "Choose Image")}
              </button>
              <button onClick={() => setAddType(null)} className="w-full py-2 text-[#7A736B] text-sm font-bold">{fil ? "Bumalik" : "Back"}</button>
            </div>
          )}

          {/* Sources list */}
          {selected.sources.length === 0 && !showAddSource && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <FileText size={32} className="text-[#E7D3A8]" />
              <p className="text-[#7A736B] text-xs text-center">{fil ? "Walang source pa. Magdagdag ng teksto, PDF, o link." : "No sources yet. Add text, PDF, image, or a link."}</p>
            </div>
          )}
          {selected.sources.map((src) => {
            const Icon = typeIcon(src.type);
            const color = typeColor(src.type);
            return (
              <div key={src.id} className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <p className="text-[#4B4032] font-bold text-xs flex-1 truncate">{src.label}</p>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full" style={{ color, background: `${color}20` }}>{src.type}</span>
                </div>
                <p className="text-[#7A736B] text-[11px] leading-relaxed line-clamp-3">{src.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col min-h-0">
          {content ? (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "none" }}>
                {selected.chatMessages.length === 0 && (
                  <div className="bg-[#F4E3B2] rounded-2xl p-3 border border-[#D6B15E]/30">
                    <p className="text-[#4B4032] text-xs leading-relaxed">
                      {fil ? `Handa na akong sagutin ang iyong mga tanong tungkol sa "${selected.title}". Ano ang gusto mong malaman?`
                        : `Ready to answer questions about "${selected.title}". What would you like to know?`}
                    </p>
                  </div>
                )}
                {selected.chatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && <div className="w-6 h-6 rounded-full bg-[#D6B15E] flex items-center justify-center mr-2 flex-shrink-0 self-end mb-0.5"><span className="text-white text-[8px] font-black">D</span></div>}
                    <div className={`max-w-[76%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-[#4B4032] text-white rounded-br-md" : "bg-white border border-[#E7D3A8]/70 text-[#4B4032] rounded-bl-md shadow-sm"}`}>{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-[#D6B15E] flex items-center justify-center mr-2 flex-shrink-0"><span className="text-white text-[8px] font-black">D</span></div>
                    <div className="bg-white border border-[#E7D3A8]/70 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5">
                      {[0,1,2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D6B15E] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="px-4 pb-3 pt-2 border-t border-[#E7D3A8]/60 flex-shrink-0 bg-[#FFF9EE]">
                <div className="flex items-center gap-2 bg-white border border-[#E7D3A8] rounded-full px-4 py-2 shadow-sm">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSend(chatInput)}
                    placeholder={fil ? "Magtanong..." : "Ask about this notebook..."}
                    className="flex-1 text-sm text-[#4B4032] bg-transparent outline-none placeholder:text-[#C5B9AE]" disabled={chatLoading} />
                  <button onClick={() => handleChatSend(chatInput)} disabled={!chatInput.trim() || chatLoading}
                    className="w-8 h-8 rounded-full bg-[#4B4032] flex items-center justify-center disabled:opacity-40">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white" className="translate-x-0.5"><path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
              <MessageCircle size={32} className="text-[#E7D3A8]" />
              <p className="text-[#7A736B] text-sm text-center">{fil ? "Magdagdag muna ng source para makapag-chat." : "Add a source first to start chatting."}</p>
              <button onClick={() => setActiveTab("sources")} className="bg-[#4B4032] text-white text-sm font-bold px-5 py-2.5 rounded-full">{fil ? "Pumunta sa Sources" : "Go to Sources"}</button>
            </div>
          )}
        </div>
      )}

      {/* ── STUDIO TAB ── */}
      {activeTab === "studio" && (
        <div className="flex-1 flex flex-col min-h-0">
          {!content ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
              <Layers size={32} className="text-[#E7D3A8]" />
              <p className="text-[#7A736B] text-sm text-center">{fil ? "Magdagdag ng source para makagawa ng study materials." : "Add a source to generate study materials."}</p>
              <button onClick={() => setActiveTab("sources")} className="bg-[#4B4032] text-white text-sm font-bold px-5 py-2.5 rounded-full">{fil ? "Pumunta sa Sources" : "Go to Sources"}</button>
            </div>
          ) : selected.flashcards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
              <Layers size={36} className="text-[#D6B15E]" />
              <p className="text-[#7A736B] text-sm text-center">{fil ? "Gumawa ng flashcards at quiz mula sa iyong sources." : "Generate flashcards and quiz from your sources."}</p>
              <button onClick={handleGenerateStudio} disabled={generatingStudio}
                className="bg-[#D6B15E] text-white font-bold px-6 py-3 rounded-full text-sm disabled:opacity-50 shadow-md shadow-[#D6B15E]/30">
                {generatingStudio ? (fil ? "Ginagawa..." : "Generating...") : (fil ? "Gumawa ng Study Materials" : "Generate Study Materials")}
              </button>
            </div>
          ) : (
            <>
              {/* Exercise type toggle */}
              <div className="px-5 pt-3 pb-2 flex-shrink-0">
                <div className="flex gap-2 bg-[#E7D3A8]/50 rounded-2xl p-1">
                  <button onClick={() => setStudioMode("flashcards")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${studioMode === "flashcards" ? "bg-white shadow-sm" : ""}`}>
                    <Layers size={14} className={studioMode === "flashcards" ? "text-[#D6B15E]" : "text-[#A89D8A]"} />
                    <span className={`text-xs font-bold ${studioMode === "flashcards" ? "text-[#4B4032]" : "text-[#A89D8A]"}`}>{fil ? "Flashcards" : "Flashcards"}</span>
                  </button>
                  <button onClick={() => setStudioMode("quiz")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${studioMode === "quiz" ? "bg-white shadow-sm" : ""}`}>
                    <HelpCircle size={14} className={studioMode === "quiz" ? "text-[#D6B15E]" : "text-[#A89D8A]"} />
                    <span className={`text-xs font-bold ${studioMode === "quiz" ? "text-[#4B4032]" : "text-[#A89D8A]"}`}>{fil ? "Quiz" : "Quiz"}</span>
                  </button>
                </div>
              </div>

              {/* Regenerate button */}
              <div className="px-5 pb-2 flex justify-end flex-shrink-0">
                <button onClick={handleGenerateStudio} disabled={generatingStudio} className="text-[10px] text-[#D6B15E] font-bold flex items-center gap-1">
                  <RotateCw size={11} />{generatingStudio ? (fil ? "Ginagawa..." : "Generating...") : (fil ? "I-regenerate" : "Regenerate")}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
                {/* ── FLASHCARDS MODE ── */}
                {studioMode === "flashcards" && (
                  <>
                    <div onClick={() => setFcFlipped(!fcFlipped)}
                      className="w-full min-h-44 bg-gradient-to-br from-[#4B4032] to-[#6B5B4A] rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl shadow-[#4B4032]/20 cursor-pointer active:scale-[0.98] transition-transform mb-4">
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider mb-3">
                        {fcFlipped ? (fil ? "Sagot" : "Answer") : (fil ? "Tanong" : "Question")}
                      </p>
                      <p className="text-white font-bold text-sm text-center leading-relaxed">
                        {fcFlipped ? selected.flashcards[fcIndex]?.a : selected.flashcards[fcIndex]?.q}
                      </p>
                      <p className="text-white/30 text-[10px] mt-5">
                        {fil ? "Pindutin para makita ang " : "Tap to see "}
                        {fcFlipped ? (fil ? "tanong" : "question") : (fil ? "sagot" : "answer")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <button onClick={() => { setFcIndex(Math.max(0, fcIndex - 1)); setFcFlipped(false); }} disabled={fcIndex === 0}
                        className="w-11 h-11 rounded-full bg-[#E7D3A8] flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform">
                        <ArrowLeft size={16} className="text-[#4B4032]" />
                      </button>
                      <div className="text-center">
                        <span className="text-[#7A736B] text-xs font-bold">{fcIndex + 1} / {selected.flashcards.length}</span>
                        <div className="flex gap-1.5 mt-1.5 justify-center">
                          {selected.flashcards.map((_, i) => (
                            <button key={i} onClick={() => { setFcIndex(i); setFcFlipped(false); }}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === fcIndex ? "bg-[#D6B15E] w-4" : "bg-[#E7D3A8]"}`} />
                          ))}
                        </div>
                      </div>
                      <button onClick={() => { setFcIndex(Math.min(selected.flashcards.length - 1, fcIndex + 1)); setFcFlipped(false); }} disabled={fcIndex === selected.flashcards.length - 1}
                        className="w-11 h-11 rounded-full bg-[#E7D3A8] flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform">
                        <ChevronRight size={16} className="text-[#4B4032]" />
                      </button>
                    </div>
                    {/* All cards list */}
                    <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2">{fil ? "Lahat ng Cards" : "All Cards"}</p>
                    <div className="space-y-2">
                      {selected.flashcards.map((fc, i) => (
                        <button key={i} onClick={() => { setFcIndex(i); setFcFlipped(false); }}
                          className={`w-full text-left bg-white rounded-2xl px-4 py-3 border transition-all ${i === fcIndex ? "border-[#D6B15E] shadow-sm" : "border-[#E7D3A8]/60"}`}>
                          <p className="text-[9px] font-bold text-[#D6B15E] uppercase tracking-wider mb-0.5">Q{i + 1}</p>
                          <p className="text-[#4B4032] text-xs font-medium line-clamp-1">{fc.q}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ── QUIZ MODE ── */}
                {studioMode === "quiz" && (
                  <>
                    {selected.quiz.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <p className="text-[#7A736B] text-sm">{fil ? "Walang quiz items." : "No quiz items."}</p>
                      </div>
                    ) : (
                      <>
                        {/* Score summary if all answered */}
                        {quizAnswers.every((a) => a !== null && a !== undefined) && (
                          <div className="bg-[#F4E3B2] rounded-2xl p-4 border border-[#D6B15E]/40 mb-4 text-center">
                            <p className="text-[#4B4032] font-black text-2xl">
                              {quizAnswers.filter((a, i) => a === selected.quiz[i]?.answer).length}/{selected.quiz.length}
                            </p>
                            <p className="text-[#7A736B] text-xs mt-0.5 font-medium">{fil ? "Tamang sagot" : "Correct answers"}</p>
                            <button onClick={() => setQuizAnswers(new Array(selected.quiz.length).fill(null))}
                              className="mt-3 text-[11px] font-bold text-[#D6B15E] flex items-center gap-1 mx-auto">
                              <RotateCw size={11} />{fil ? "Subukang muli" : "Try again"}
                            </button>
                          </div>
                        )}
                        <div className="space-y-4">
                          {selected.quiz.map((item, qi) => {
                            const chosen = quizAnswers[qi];
                            const revealed = chosen !== null && chosen !== undefined;
                            return (
                              <div key={qi} className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm">
                                <p className="text-[#4B4032] font-bold text-sm mb-3">{qi + 1}. {item.question}</p>
                                <div className="space-y-2">
                                  {item.choices.map((choice, ci) => {
                                    const isCorrect = ci === item.answer;
                                    const isChosen = ci === chosen;
                                    return (
                                      <button key={ci} onClick={() => {
                                        if (revealed) return;
                                        setQuizAnswers((prev) => { const n = [...prev]; n[qi] = ci; return n; });
                                      }}
                                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between
                                          ${revealed
                                            ? isCorrect
                                              ? "bg-[#A8CFA0]/20 border-2 border-[#A8CFA0] text-[#4B4032]"
                                              : isChosen
                                                ? "bg-red-100 border-2 border-red-300 text-red-700"
                                                : "bg-[#FAFAF8] border border-[#E7D3A8] text-[#9A9490]"
                                            : "bg-[#FAFAF8] border border-[#E7D3A8] text-[#4B4032] active:bg-[#F4E3B2]"}`}>
                                        <span><span className="font-bold mr-2">{String.fromCharCode(65 + ci)}.</span>{choice}</span>
                                        {revealed && isCorrect && <Check size={13} className="text-[#A8CFA0] flex-shrink-0" strokeWidth={3} />}
                                        {revealed && isChosen && !isCorrect && <X size={13} className="text-red-400 flex-shrink-0" strokeWidth={3} />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ORAL TAB ── */}
      {activeTab === "oral" && (
        <div className="flex-1 flex flex-col min-h-0">
          {!content ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
              <Mic size={32} className="text-[#E7D3A8]" />
              <p className="text-[#7A736B] text-sm text-center">{fil ? "Magdagdag ng source para magsimula ng oral practice." : "Add a source to start oral practice."}</p>
              <button onClick={() => setActiveTab("sources")} className="bg-[#4B4032] text-white text-sm font-bold px-5 py-2.5 rounded-full">{fil ? "Pumunta sa Sources" : "Go to Sources"}</button>
            </div>

          ) : oralPhase === "select" ? (
            /* ── SELECT MODE ── */
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4 space-y-3" style={{ scrollbarWidth: "none" }}>
              <div className="bg-[#F4E3B2] rounded-2xl p-3 border border-[#D6B15E]/40 mb-1">
                <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-0.5">{fil ? "Nilalaman" : "Content"}</p>
                <p className="text-[#4B4032] text-xs line-clamp-2 leading-relaxed">{content.slice(0, 120)}…</p>
              </div>
              <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider">{fil ? "Pumili ng Uri ng Pagsasanay" : "Choose Exercise Type"}</p>
              {([
                { id: "read-aloud" as OralMode, label: "Read Aloud", sub: fil ? "Basahin ang mga talata nang malakas" : "Read paragraphs aloud & get scored", color: "#A8CFA0", timer: "" },
                { id: "paraphrase" as OralMode, label: "Paraphrase", sub: fil ? "Ipaliwanag ang mga termino sa sariling salita" : "Explain key terms in your own words", color: "#D6B15E", timer: "" },
                { id: "quiz-bee" as OralMode, label: "Quiz Bee", sub: fil ? "Pangalanan ang termino mula sa kahulugan" : "Name the term from its definition", color: "#4B4032", timer: "30s" },
                { id: "recitation" as OralMode, label: "Recitation", sub: fil ? "Ipaliwanag ang konsepto nang detalyado" : "Explain concepts in detail", color: "#BF9840", timer: "60s" },
              ]).map((m) => (
                <button key={m.id} onClick={() => { setOralMode(m.id); setOralCount(5); setOralSelection("auto"); setOralPhase("setup"); }}
                  className="w-full flex items-center gap-3.5 bg-white rounded-2xl px-4 py-3.5 border border-[#E7D3A8]/60 shadow-sm active:scale-[0.98] transition-transform text-left">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${m.color}20` }}>
                    <Mic size={19} style={{ color: m.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[#4B4032] font-black text-sm">{m.label}</p>
                      {m.timer && (
                        <span className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#4B4032]/10 text-[#4B4032]">
                          <Clock size={8} />{m.timer}
                        </span>
                      )}
                    </div>
                    <p className="text-[#7A736B] text-[11px] mt-0.5 leading-relaxed">{m.sub}</p>
                  </div>
                  <ChevronRight size={14} className="text-[#C5B9AE] flex-shrink-0" />
                </button>
              ))}
            </div>

          ) : oralPhase === "setup" ? (
            /* ── SETUP ── */
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4" style={{ scrollbarWidth: "none" }}>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setOralPhase("select")} className="w-9 h-9 rounded-xl bg-[#E7D3A8] flex items-center justify-center flex-shrink-0">
                  <ArrowLeft size={16} className="text-[#4B4032]" />
                </button>
                <p className="text-[#4B4032] font-black text-sm capitalize">{oralMode.replace("-", " ")}</p>
              </div>

              {/* Card count */}
              <div className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-3">
                <p className="text-[#4B4032] font-bold text-xs mb-3">{fil ? "Ilang cards ang gusto mo?" : "How many cards?"}</p>
                <div className="flex items-center justify-center gap-5">
                  <button onClick={() => setOralCount(c => Math.max(1, c - 1))} className="w-10 h-10 rounded-full bg-[#E7D3A8] flex items-center justify-center text-[#4B4032] font-black text-lg active:scale-90 transition-transform">−</button>
                  <span className="text-[#4B4032] font-black text-2xl w-8 text-center">{oralCount}</span>
                  <button onClick={() => setOralCount(c => Math.min(10, c + 1))} className="w-10 h-10 rounded-full bg-[#E7D3A8] flex items-center justify-center text-[#4B4032] font-black text-lg active:scale-90 transition-transform">+</button>
                </div>
              </div>

              {/* Selection mode */}
              <div className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-5">
                <p className="text-[#4B4032] font-bold text-xs mb-3">{fil ? "Paano pipiliin ang mga items?" : "How to select items?"}</p>
                <div className="flex gap-2">
                  {(["auto", "manual"] as const).map((s) => (
                    <button key={s} onClick={() => setOralSelection(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${oralSelection === s ? "bg-[#4B4032] text-white shadow-sm" : "bg-[#F4E3B2] text-[#7A736B]"}`}>
                      {s === "auto" ? (fil ? "Auto" : "Auto") : (fil ? "Manual" : "Manual")}
                    </button>
                  ))}
                </div>
                <p className="text-[#7A736B] text-[11px] mt-2.5 leading-relaxed">
                  {oralSelection === "auto"
                    ? (fil ? "Awtomatikong pipiliin ang mga items para sa iyo." : "Items will be selected automatically for you.")
                    : (fil ? "Ikaw ang pipili kung aling mga items ang isasama." : "You choose which specific items to include.")}
                </p>
              </div>

              <button onClick={handleOralGenerate} disabled={oralGenerating}
                className="w-full py-3.5 rounded-2xl bg-[#4B4032] text-white font-black text-sm shadow-lg shadow-[#4B4032]/20 disabled:opacity-50 active:scale-[0.98] transition-transform">
                {oralGenerating ? (fil ? "Ginagawa ang mga cards..." : "Generating cards...") : (fil ? "Gumawa ng Cards →" : "Generate Cards →")}
              </button>
            </div>

          ) : oralPhase === "pick" ? (
            /* ── MANUAL PICK ── */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-5 pt-3 pb-2 flex items-center gap-3 flex-shrink-0">
                <button onClick={() => setOralPhase("setup")} className="w-9 h-9 rounded-xl bg-[#E7D3A8] flex items-center justify-center flex-shrink-0">
                  <ArrowLeft size={16} className="text-[#4B4032]" />
                </button>
                <div className="flex-1">
                  <p className="text-[#4B4032] font-black text-sm">{fil ? "Pumili ng Items" : "Select Items"}</p>
                  <p className="text-[#7A736B] text-[11px]">{oralPickedIds.size} {fil ? "napili" : "selected"}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-2" style={{ scrollbarWidth: "none" }}>
                {oralPool.map((item, i) => {
                  const picked = oralPickedIds.has(item.id);
                  return (
                    <button key={item.id} onClick={() => setOralPickedIds(prev => {
                      const next = new Set(prev);
                      picked ? next.delete(item.id) : next.add(item.id);
                      return next;
                    })}
                      className={`w-full text-left rounded-2xl p-3.5 border transition-all ${picked ? "bg-[#4B4032] border-[#4B4032]" : "bg-white border-[#E7D3A8]/60"}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border-2 ${picked ? "bg-[#D6B15E] border-[#D6B15E]" : "border-[#C5B9AE]"}`}>
                          {picked && <Check size={11} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${picked ? "text-[#D6B15E]" : "text-[#C5B9AE]"}`}>
                            {oralMode === "read-aloud" ? `Para ${i + 1}` : oralMode === "paraphrase" ? `Term ${i + 1}` : oralMode === "quiz-bee" ? `Def ${i + 1}` : `Q${i + 1}`}
                          </p>
                          <p className={`text-xs leading-relaxed line-clamp-2 ${picked ? "text-white" : "text-[#4B4032]"}`}>{item.content}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-5 py-3 border-t border-[#E7D3A8]/60 flex-shrink-0">
                <button onClick={() => {
                  const cards = oralPool.filter(c => oralPickedIds.has(c.id));
                  if (!cards.length) return;
                  setOralCards(cards); setOralCardIndex(0); setOralScores([]); setOralCurrentScore(null);
                  setOralPhase("practice");
                }} disabled={oralPickedIds.size === 0}
                  className="w-full py-3 rounded-2xl bg-[#4B4032] text-white font-black text-sm disabled:opacity-40 active:scale-[0.98] transition-transform">
                  {fil ? `Simulan ang ${oralPickedIds.size} Cards →` : `Start with ${oralPickedIds.size} Cards →`}
                </button>
              </div>
            </div>

          ) : oralPhase === "practice" ? (
            /* ── PRACTICE ── */
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="px-5 pt-3 pb-2 flex items-center gap-3 flex-shrink-0">
                <button onClick={() => { resetOral(); }} className="w-9 h-9 rounded-xl bg-[#E7D3A8] flex items-center justify-center flex-shrink-0">
                  <X size={15} className="text-[#4B4032]" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[#7A736B] text-[11px] font-bold capitalize">{oralMode.replace("-", " ")}</p>
                    <p className="text-[#7A736B] text-[11px] font-bold">{oralCardIndex + 1}/{oralCards.length}</p>
                  </div>
                  <div className="h-1.5 bg-[#E7D3A8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D6B15E] rounded-full transition-all" style={{ width: `${((oralCardIndex + 1) / oralCards.length) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Timer (quiz-bee / recitation) */}
              {oralTimerLimit(oralMode) > 0 && oralRecording && (
                <div className="px-5 flex-shrink-0 mb-1">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl self-start ${oralTimer <= 10 ? "bg-red-100" : "bg-[#F4E3B2]"}`}>
                    <Clock size={12} className={oralTimer <= 10 ? "text-red-500" : "text-[#D6B15E]"} />
                    <span className={`font-black text-sm tabular-nums ${oralTimer <= 10 ? "text-red-500" : "text-[#4B4032]"}`}>
                      {String(Math.floor(oralTimer / 60)).padStart(2, "0")}:{String(oralTimer % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              )}

              {/* Content card */}
              <div className="flex-1 overflow-y-auto px-5 pb-3" style={{ scrollbarWidth: "none" }}>
                <div className="bg-white rounded-3xl border border-[#E7D3A8]/70 shadow-md p-5 mb-4">
                  <p className="text-[9px] font-black text-[#D6B15E] uppercase tracking-widest mb-3">
                    {oralMode === "read-aloud" ? (fil ? "BASAHIN" : "READ THIS") : oralMode === "paraphrase" ? (fil ? "TERMINO" : "TERM") : oralMode === "quiz-bee" ? (fil ? "KAHULUGAN" : "DEFINITION") : (fil ? "TANONG" : "QUESTION")}
                  </p>
                  <p className="text-[#4B4032] text-sm leading-relaxed font-medium">{oralCards[oralCardIndex]?.content}</p>
                  {oralMode === "paraphrase" && oralCards[oralCardIndex]?.hint && (
                    <p className="text-[#7A736B] text-[11px] mt-3 italic leading-relaxed border-t border-[#E7D3A8]/60 pt-2.5">{oralCards[oralCardIndex].hint}</p>
                  )}
                </div>

                {/* Mic area */}
                <div className="flex flex-col items-center gap-3">
                  {oralAnalyzing ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-14 h-14 rounded-full bg-[#F4E3B2] flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#D6B15E] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-[#7A736B] text-xs font-bold">{fil ? "Sinusuri ang iyong sagot..." : "Analyzing your answer..."}</p>
                    </div>
                  ) : oralRecording ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-600 text-xs font-bold">{fil ? "Nagre-record..." : "Recording..."}</span>
                      </div>
                      <button onClick={stopOralRecording} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform">
                        <StopCircle size={28} className="text-white" />
                      </button>
                      <p className="text-[#7A736B] text-[11px]">{fil ? "Pindutin para ihinto" : "Tap to stop recording"}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <button onClick={startOralRecording} className="w-16 h-16 rounded-full bg-[#4B4032] flex items-center justify-center shadow-lg shadow-[#4B4032]/25 active:scale-95 transition-transform">
                        <Mic size={28} className="text-white" />
                      </button>
                      <p className="text-[#7A736B] text-[11px]">{fil ? "Pindutin para magsimula" : "Tap to start speaking"}</p>
                      {oralTimerLimit(oralMode) > 0 && (
                        <p className="text-[#C5B9AE] text-[10px]">
                          <Clock size={9} className="inline mr-1" />
                          {fil ? `May ${oralTimerLimit(oralMode)}s na limitasyon` : `${oralTimerLimit(oralMode)}s time limit`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          ) : oralPhase === "card-result" && oralCurrentScore ? (
            /* ── CARD RESULT ── */
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4" style={{ scrollbarWidth: "none" }}>
              {(() => {
                const info = oralScoreInfo(oralCurrentScore.score);
                const isLast = oralCardIndex + 1 >= oralCards.length;
                return (
                  <>
                    {/* Score */}
                    <div className="flex flex-col items-center mb-5">
                      <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl mb-3" style={{ background: info.bg, border: `3px solid ${info.color}` }}>
                        <span className="font-black text-3xl leading-none" style={{ color: info.color }}>{oralCurrentScore.score}</span>
                        <span className="text-[10px] font-bold" style={{ color: info.color }}>/10</span>
                      </div>
                      <span className="font-black text-base text-[#4B4032]">{info.badge}</span>
                    </div>

                    {/* Feedback */}
                    <div className="bg-[#F4E3B2] rounded-2xl p-4 border border-[#D6B15E]/40 mb-3">
                      <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">{fil ? "Feedback" : "Feedback"}</p>
                      <p className="text-[#4B4032] text-xs leading-relaxed">{oralCurrentScore.feedback}</p>
                    </div>

                    {/* What you said */}
                    <div className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-3">
                      <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">{fil ? "Sinabi mo" : "You said"}</p>
                      <p className="text-[#4B4032] text-xs leading-relaxed italic">"{oralCurrentScore.transcript || (fil ? "(walang narinig)" : "(nothing detected)")}"</p>
                    </div>

                    {/* Correct answer for quiz-bee */}
                    {oralMode === "quiz-bee" && oralCards[oralCardIndex]?.hint && (
                      <div className="bg-[#A8CFA0]/20 rounded-2xl p-4 border border-[#A8CFA0]/50 shadow-sm mb-3">
                        <p className="text-[9px] font-bold text-[#4B4032]/60 uppercase tracking-wider mb-1.5">{fil ? "Tamang Sagot" : "Correct Answer"}</p>
                        <p className="text-[#4B4032] text-sm font-black">{oralCards[oralCardIndex].hint}</p>
                      </div>
                    )}

                    {/* Next */}
                    <button onClick={() => {
                      setOralCurrentScore(null);
                      if (isLast) { setOralPhase("results"); }
                      else { setOralCardIndex(prev => prev + 1); setOralPhase("practice"); }
                    }}
                      className="w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-lg active:scale-[0.98] transition-transform"
                      style={{ background: "#4B4032" }}>
                      {isLast ? (fil ? "Tingnan ang Resulta →" : "See Results →") : (fil ? "Susunod na Card →" : "Next Card →")}
                    </button>
                  </>
                );
              })()}
            </div>

          ) : oralPhase === "results" ? (
            /* ── RESULTS ── */
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4" style={{ scrollbarWidth: "none" }}>
              {(() => {
                const avg = oralScores.reduce((a, s) => a + s.score, 0) / (oralScores.length || 1);
                const info = oralScoreInfo(Math.round(avg));
                return (
                  <>
                    <div className="flex flex-col items-center mb-5">
                      <Trophy size={28} className="text-[#D6B15E] mb-2" />
                      <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-1">{fil ? "Pangkalahatang Score" : "Overall Score"}</p>
                      <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center mb-2" style={{ background: info.bg, border: `3px solid ${info.color}` }}>
                        <span className="font-black text-2xl leading-none" style={{ color: info.color }}>{avg.toFixed(1)}</span>
                        <span className="text-[10px] font-bold" style={{ color: info.color }}>/10</span>
                      </div>
                      <span className="font-black text-sm text-[#4B4032]">{info.badge}</span>
                    </div>

                    {/* Per-card scores */}
                    <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2">{fil ? "Bawat Card" : "Per Card"}</p>
                    <div className="space-y-2 mb-5">
                      {oralScores.map((s, i) => {
                        const si = oralScoreInfo(s.score);
                        return (
                          <div key={i} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#E7D3A8]/60 shadow-sm">
                            <span className="text-[#7A736B] text-[11px] font-bold w-12 flex-shrink-0">Card {i + 1}</span>
                            <div className="flex-1 h-2 bg-[#E7D3A8] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${s.score * 10}%`, background: si.color }} />
                            </div>
                            <span className="font-black text-sm w-8 text-right flex-shrink-0" style={{ color: si.color }}>{s.score}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => { setOralCardIndex(0); setOralScores([]); setOralCurrentScore(null); setOralPhase("practice"); }}
                        className="flex-1 py-3 rounded-2xl border-2 border-[#4B4032] text-[#4B4032] font-black text-sm active:scale-[0.98] transition-transform">
                        {fil ? "Ulitin" : "Try Again"}
                      </button>
                      <button onClick={resetOral}
                        className="flex-1 py-3 rounded-2xl bg-[#4B4032] text-white font-black text-sm shadow-md active:scale-[0.98] transition-transform">
                        {fil ? "Ibang Mode" : "New Mode"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
