import React, { useState, useRef, useCallback, useEffect } from "react";
import { Globe, RotateCcw, Mic, Play, Square, Plus, MessageSquare, Trash2 } from "lucide-react";
import { ChatMessage, ChatSession } from "../types";
import { offlineChat } from "../types";
import { API } from "../constants";
import { watchSilence } from "../utils/vad";

function newSession(): ChatSession {
  return {
    id: Date.now().toString(),
    title: "New Chat",
    messages: [],
    createdAt: new Date().toLocaleDateString(),
  };
}

export default function ChatScreen({
  lang,
  sessions,
  setSessions,
  activeChatId,
  setActiveChatId,
}: {
  lang: string;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeChatId: string | null;
  setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [voiceAccent, setVoiceAccent] = useState<"FIL" | "EN">(lang === "FIL" ? "FIL" : "EN");
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const vadCleanupRef = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const isFil = lang === "FIL";

  // Ensure there's always at least one session; create one if empty
  useEffect(() => {
    if (sessions.length === 0) {
      const s = newSession();
      setSessions([s]);
      setActiveChatId(s.id);
    } else if (!activeChatId || !sessions.find((s) => s.id === activeChatId)) {
      setActiveChatId(sessions[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSession = sessions.find((s) => s.id === activeChatId) ?? sessions[0] ?? null;
  const messages: ChatMessage[] = activeSession?.messages ?? [];

  const greeting = useCallback((l: string): ChatMessage => ({
    id: "greeting",
    role: "assistant",
    text: l === "FIL"
      ? "Kumusta! Ako si Dunong, ang iyong AI study companion. Maaari kang magtanong tungkol sa anumang paksa — Science, Math, Filipino, History, at iba pa. Nandito ako para tumulong!"
      : "Hello! I'm Dunong, your AI study companion. You can ask me about any subject — Science, Math, Filipino, History, and more. I'm here to help!",
  }), []);

  // Add greeting to a brand-new session when it becomes active
  useEffect(() => {
    if (!activeSession) return;
    if (activeSession.messages.length === 0) {
      setSessions((prev) => prev.map((s) =>
        s.id === activeSession.id ? { ...s, messages: [greeting(lang)] } : s
      ));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  useEffect(() => {
    setVoiceAccent(lang === "FIL" ? "FIL" : "EN");
  }, [lang]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => () => {
    vadCleanupRef.current?.();
    mediaRecRef.current?.stop();
  }, []);

  // Scroll the tab bar to show the active tab
  useEffect(() => {
    const bar = tabsRef.current;
    if (!bar) return;
    const active = bar.querySelector(`[data-active="true"]`) as HTMLElement | null;
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeChatId]);

  const updateSession = useCallback((id: string, updater: (s: ChatSession) => ChatSession) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }, [setSessions]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = voiceAccent === "FIL" ? "fil-PH" : "en-US";
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
  }, [voiceAccent]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading || !activeSession) return;
    const sessionId = activeSession.id;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: text.trim() };
    let currentMessages: ChatMessage[] = [];

    // Optimistically add user message
    setSessions((prev) => prev.map((s) => {
      if (s.id !== sessionId) return s;
      const updated = [...s.messages, userMsg];
      currentMessages = updated;
      const title = s.title === "New Chat" ? text.trim().slice(0, 30) : s.title;
      return { ...s, messages: updated, title };
    }));
    setInput("");
    setLoading(true);

    try {
      let reply: string;
      if (!isOnline) {
        await new Promise((r) => setTimeout(r, 700));
        reply = offlineChat(text, lang);
      } else {
        const res = await fetch(`${API}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: currentMessages.map((m) => ({ role: m.role, content: m.text })),
            lang,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        reply = data.message;
      }
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", text: reply };
      updateSession(sessionId, (s) => ({ ...s, messages: [...s.messages, aiMsg] }));
      speak(reply);
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: isFil ? "May problema sa koneksyon. Subukan muli." : "Connection error. Please try again.",
      };
      updateSession(sessionId, (s) => ({ ...s, messages: [...s.messages, errMsg] }));
    } finally {
      setLoading(false);
    }
  }, [loading, activeSession, isOnline, lang, speak, isFil, setSessions, updateSession]);

  const stopListening = useCallback(async () => {
    vadCleanupRef.current?.();
    vadCleanupRef.current = null;
    setListening(false);
    if (!mediaRecRef.current) return;
    const mr = mediaRecRef.current;
    const mime = mr.mimeType || "audio/webm";
    mediaRecRef.current = null;
    try { mr.stop(); mr.stream.getTracks().forEach((t) => t.stop()); } catch { /* already stopped */ }
    await new Promise((r) => setTimeout(r, 300));
    const blob = new Blob(chunksRef.current as BlobPart[], { type: mime });
    const filename = mime.includes("mp4") ? "audio.mp4" : "audio.webm";
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, filename);
      const res = await fetch(`${API}/api/transcribe`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.transcript) { setLoading(false); await sendMessage(data.transcript); }
      else setLoading(false);
    } catch { setLoading(false); }
  }, [sendMessage]);

  // Keep stopListening current for VAD callback
  const stopFnRef = useRef(stopListening);
  useEffect(() => { stopFnRef.current = stopListening; }, [stopListening]);

  const toggleListening = useCallback(async () => {
    if (mediaRecRef.current) { await stopFnRef.current(); return; }
    chunksRef.current = [];
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { return; }
    const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.start();
    mediaRecRef.current = mr;
    setListening(true);
    vadCleanupRef.current = watchSilence(stream, () => stopFnRef.current(), { silenceMs: 1800, minSpeakMs: 400 });
  }, []);

  const createNewSession = useCallback(() => {
    const s = newSession();
    setSessions((prev) => [s, ...prev]);
    setActiveChatId(s.id);
  }, [setSessions, setActiveChatId]);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh = newSession();
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (id === activeChatId) setActiveChatId(remaining[0].id);
      return remaining;
    });
  }, [activeChatId, setSessions, setActiveChatId]);

  return (
    <div className="h-full flex flex-col bg-[#FFF9EE]">
      {/* Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#E7D3A8]/60 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D6B15E] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black">D</span>
          </div>
          <div>
            <p className="text-[#4B4032] font-black text-sm" style={{ fontFamily: "Fraunces, serif" }}>Dunong AI</p>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#A8CFA0]" : "bg-[#C5B9AE]"}`} />
              <span className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wide">
                {isOnline ? "Online" : "Offline Mode"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#E7D3A8] rounded-xl p-0.5">
            {(["FIL", "EN"] as const).map((a) => (
              <button key={a} onClick={() => setVoiceAccent(a)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${voiceAccent === a ? "bg-[#D6B15E] text-white shadow-sm" : "text-[#7A736B]"}`}>
                {a === "FIL" ? "🇵🇭 FIL" : "🇺🇸 EN"}
              </button>
            ))}
          </div>
          <button onClick={createNewSession}
            className="w-8 h-8 rounded-xl bg-[#4B4032] flex items-center justify-center active:scale-95 transition-transform"
            title="New chat">
            <Plus size={14} className="text-white" />
          </button>
        </div>
      </div>

      {/* Session tabs */}
      <div ref={tabsRef} className="flex gap-1.5 px-4 py-2 overflow-x-auto flex-shrink-0 border-b border-[#E7D3A8]/40" style={{ scrollbarWidth: "none" }}>
        {sessions.map((s) => {
          const isActive = s.id === activeChatId;
          return (
            <div key={s.id} data-active={isActive}
              className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full border transition-all ${
                isActive ? "bg-[#4B4032] border-[#4B4032]" : "bg-white border-[#E7D3A8] active:bg-[#F4E3B2]"
              }`}>
              <button onClick={() => setActiveChatId(s.id)} className="flex items-center gap-1.5">
                <MessageSquare size={10} className={isActive ? "text-[#D6B15E]" : "text-[#C5B9AE]"} />
                <span className={`text-[10px] font-bold max-w-[80px] truncate ${isActive ? "text-white" : "text-[#7A736B]"}`}>
                  {s.title}
                </span>
              </button>
              {sessions.length > 0 && (
                <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  className={`ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${isActive ? "text-white/60 hover:text-white" : "text-[#C5B9AE] hover:text-red-400"}`}>
                  <Trash2 size={8} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "none" }}>
        {!isOnline && (
          <div className="bg-[#F4E3B2] border border-[#D6B15E]/40 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <Globe size={13} className="text-[#D6B15E] flex-shrink-0" />
            <p className="text-[10px] text-[#7A736B] font-semibold leading-snug">
              {isFil ? "Offline mode — limitado ang kakayahan." : "Offline mode — limited responses."}
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-[#D6B15E] flex items-center justify-center mr-2 flex-shrink-0 self-end mb-0.5">
                <span className="text-white text-[8px] font-black">D</span>
              </div>
            )}
            <div className={`max-w-[76%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-[#4B4032] text-white rounded-br-md"
                : "bg-white border border-[#E7D3A8]/70 text-[#4B4032] rounded-bl-md shadow-sm"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-[#D6B15E] flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-[8px] font-black">D</span>
            </div>
            <div className="bg-white border border-[#E7D3A8]/70 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D6B15E] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-3 pt-2 border-t border-[#E7D3A8]/60 flex-shrink-0 bg-[#FFF9EE]">
        {listening && (
          <div className="flex items-center justify-center gap-1 mb-2">
            {[4, 8, 14, 10, 18, 12, 6].map((h, i) => (
              <div key={i} className="w-1 bg-[#D6B15E] rounded-full animate-pulse"
                style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
            <span className="text-[10px] text-[#7A736B] ml-2 font-semibold">
              {isFil ? "Nakikinig… magsalita ka" : "Listening… speak now"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-white border border-[#E7D3A8] rounded-full px-4 py-2 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={isFil ? "Magtanong o pindutin ang mic…" : "Ask or tap the mic…"}
            className="flex-1 text-sm text-[#4B4032] bg-transparent outline-none placeholder:text-[#C5B9AE]"
            disabled={loading}
          />
          <button
            onTouchEnd={(e) => { e.preventDefault(); if (!loading) toggleListening(); }}
            onClick={(e) => { if (e.detail === 0) return; if (!loading) toggleListening(); }}
            disabled={loading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              listening ? "bg-[#D6B15E] shadow-md shadow-[#D6B15E]/40" : "bg-[#E7D3A8]"
            } disabled:opacity-50`}>
            {listening ? <Square size={12} className="text-white" fill="white" /> : <Mic size={14} className="text-[#7A736B]" />}
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-[#4B4032] flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95">
            <Play size={12} className="text-white translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
