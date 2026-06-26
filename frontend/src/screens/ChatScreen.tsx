import React, { useState, useRef, useCallback, useEffect } from "react";
import { Globe, RotateCcw, Mic, Play } from "lucide-react";
import { ChatMessage } from "../types";
import { offlineChat } from "../types";
import { API } from "../constants";

export default function ChatScreen({
  lang,
  messages,
  setMessages,
  studyContext,
}: {
  lang: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  studyContext?: string;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [voiceAccent, setVoiceAccent] = useState<"FIL" | "EN">(lang === "FIL" ? "FIL" : "EN");
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFil = lang === "FIL";

  const greeting = (l: string) => ({
    id: "greeting",
    role: "assistant" as const,
    text: l === "FIL"
      ? "Kumusta! Ako si Dunong, ang iyong AI study companion. Maaari kang magtanong tungkol sa anumang paksa — Science, Math, Filipino, History, at iba pa. Nandito ako para tumulong!"
      : "Hello! I'm Dunong, your AI study companion. You can ask me about any subject — Science, Math, Filipino, History, and more. I'm here to help!",
  });

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([greeting(lang)]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync voice accent and update greeting when language changes
  useEffect(() => {
    setVoiceAccent(lang === "FIL" ? "FIL" : "EN");
    setMessages((prev) =>
      prev.map((m) => (m.id === "greeting" ? greeting(lang) : m))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = voiceAccent === "FIL" ? "fil-PH" : "en-US";
      utt.rate = 0.95;
      window.speechSynthesis.speak(utt);
    },
    [voiceAccent],
  );

  const sendMessage = useCallback(
    async (text: string, currentMessages: ChatMessage[]) => {
      if (!text.trim() || loading) return;
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        text: text.trim(),
      };
      const updated = [...currentMessages, userMsg];
      setMessages(updated);
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
              messages: updated.map((m) => ({
                role: m.role,
                content: m.text,
              })),
              lang,
              context: studyContext,
            }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          reply = data.message;
        }
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: reply,
        };
        setMessages((prev) => [...prev, aiMsg]);
        speak(reply);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: isFil
              ? "May problema sa koneksyon. Subukan muli."
              : "Connection error. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, isOnline, lang, studyContext, speak],
  );

  const startListening = useCallback(() => {
    chunksRef.current = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start();
        mediaRecRef.current = mr;
        setListening(true);
      })
      .catch(() => {});
  }, []);

  const stopListening = useCallback(async () => {
    setListening(false);
    if (!mediaRecRef.current) return;
    const mr = mediaRecRef.current;
    mr.stop();
    mr.stream.getTracks().forEach((t) => t.stop());
    await new Promise((r) => setTimeout(r, 300));
    const blob = new Blob(chunksRef.current as BlobPart[], { type: "audio/webm" });
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "audio.webm");
      const res = await fetch(`${API}/api/transcribe`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.transcript) {
        setLoading(false);
        await sendMessage(data.transcript, messages);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [sendMessage, messages]);

  return (
    <div className="h-full flex flex-col bg-[#FFF9EE]">
      <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-[#E7D3A8]/60 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D6B15E] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black">D</span>
          </div>
          <div>
            <p
              className="text-[#4B4032] font-black text-sm"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Dunong AI
            </p>
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#A8CFA0]" : "bg-[#C5B9AE]"}`}
              />
              <span className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wide">
                {isOnline ? "Online" : "Offline Mode"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#E7D3A8] rounded-xl p-0.5">
            {(["FIL", "EN"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setVoiceAccent(a)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${voiceAccent === a ? "bg-[#D6B15E] text-white shadow-sm" : "text-[#7A736B]"}`}
              >
                {a === "FIL" ? "🇵🇭 FIL" : "🇺🇸 EN"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMessages([])}
            className="w-8 h-8 rounded-xl bg-[#E7D3A8] flex items-center justify-center active:scale-95 transition-transform"
          >
            <RotateCcw size={13} className="text-[#7A736B]" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {!isOnline && (
          <div className="bg-[#F4E3B2] border border-[#D6B15E]/40 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <Globe size={13} className="text-[#D6B15E] flex-shrink-0" />
            <p className="text-[10px] text-[#7A736B] font-semibold leading-snug">
              {isFil
                ? "Offline mode — limitado ang kakayahan. Ikonekta ang internet para sa buong AI."
                : "Offline mode — limited responses. Connect to the internet for full AI."}
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-[#D6B15E] flex items-center justify-center mr-2 flex-shrink-0 self-end mb-0.5">
                <span className="text-white text-[8px] font-black">D</span>
              </div>
            )}
            <div
              className={`max-w-[76%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[#4B4032] text-white rounded-br-md"
                  : "bg-white border border-[#E7D3A8]/70 text-[#4B4032] rounded-bl-md shadow-sm"
              }`}
            >
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
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#D6B15E] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-[#E7D3A8]/60 flex-shrink-0 bg-[#FFF9EE]">
        {listening && (
          <div className="flex items-center justify-center gap-1 mb-2">
            {[4, 8, 14, 10, 18, 12, 6].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-[#D6B15E] rounded-full animate-pulse"
                style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
            <span className="text-[10px] text-[#7A736B] ml-2 font-semibold">
              {isFil ? "Nakikinig..." : "Listening..."}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-white border border-[#E7D3A8] rounded-full px-4 py-2 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input, messages)}
            placeholder={isFil ? "Magtanong..." : "Ask anything..."}
            className="flex-1 text-sm text-[#4B4032] bg-transparent outline-none placeholder:text-[#C5B9AE]"
            disabled={loading}
          />
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={(e) => {
              e.preventDefault();
              startListening();
            }}
            onTouchEnd={stopListening}
            disabled={loading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 ${listening ? "bg-[#D6B15E]" : "bg-[#E7D3A8]"} disabled:opacity-50`}
          >
            <Mic size={14} className={listening ? "text-white" : "text-[#7A736B]"} />
          </button>
          <button
            onClick={() => sendMessage(input, messages)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-[#4B4032] flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95"
          >
            <Play size={12} className="text-white translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
