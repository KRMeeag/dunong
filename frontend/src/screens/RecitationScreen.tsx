import React from "react";
import { Volume2, MessageCircle, Zap, Award, Star } from "lucide-react";
import { Session } from "../types";

export default function RecitationScreen({
  onStartMode,
  history,
  lang,
}: {
  onStartMode: (mode: string) => void;
  history: Session[];
  lang: string;
}) {
  const isFil = lang === "FIL";
  const modes = [
    {
      id: "Read-Aloud",
      label: "Read-Aloud",
      tagalog: "Basahin",
      desc: isFil
        ? "Basahin ang teksto nang malakas — para mapabilis ang iyong vocal comfort."
        : "Read the text aloud — builds vocal comfort and fluency.",
      icon: Volume2,
      xp: "+10 XP",
      color: "#A8CFA0",
      bg: "#A8CFA0/20",
    },
    {
      id: "Paraphrase",
      label: "Paraphrase",
      tagalog: "Sa Sariling Salita",
      desc: isFil
        ? "Ipaliwanag ang teksto sa iyong sariling salita. Sinusubok ang pag-unawa."
        : "Explain the text in your own words. Tests your true understanding.",
      icon: MessageCircle,
      xp: "+20 XP",
      color: "#D6B15E",
      bg: "#D6B15E/15",
    },
    {
      id: "Cold Call",
      label: "Cold Call",
      tagalog: "Tawag Mode",
      desc: isFil
        ? "Sagutin nang walang makikitang teksto. Subok ng aktwal na kaalaman."
        : "Answer without seeing the text. Tests real knowledge recall.",
      icon: Zap,
      xp: "+35 XP",
      color: "#4B4032",
      bg: "#4B4032/10",
    },
    {
      id: "Stand & Deliver",
      label: "Stand & Deliver",
      tagalog: "Buong Recitation",
      desc: isFil
        ? "Countdown bago mag-record — sinisimula ang real recitation pressure."
        : "Countdown before recording starts — simulates real recitation pressure.",
      icon: Award,
      xp: "+50 XP",
      color: "#BF9840",
      bg: "#BF9840/10",
    },
  ];

  const avgScore =
    history.length > 0
      ? Math.round(
          history.reduce(
            (s, h) =>
              s +
              (h.scores.accuracy + h.scores.confidence + h.scores.clarity) / 3,
            0,
          ) / history.length,
        )
      : 0;

  return (
    <div
      className="h-full overflow-y-auto bg-[#FFF9EE] pb-4"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="px-5 pt-3 pb-2">
        <h2
          className="text-[#4B4032] font-black text-xl"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {isFil ? "Recitation Training" : "Recitation Training"}
        </h2>
        <p className="text-[#7A736B] text-xs mt-0.5">
          {isFil
            ? "Piliin ang iyong mode at i-scan ang iyong module para magsimula."
            : "Choose your mode then scan your module to begin."}
        </p>
      </div>

      {history.length > 0 && (
        <div className="mx-5 mb-3 bg-gradient-to-r from-[#4B4032] to-[#6B5B4A] rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
              {isFil ? "Kabuuang Session" : "Total Sessions"}
            </p>
            <p
              className="text-white font-black text-2xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {history.length}
            </p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="flex-1 text-right">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
              {isFil ? "Avg. Score" : "Avg. Score"}
            </p>
            <p
              className="text-white font-black text-2xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {avgScore}%
            </p>
          </div>
        </div>
      )}

      <div className="px-5">
        <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2">
          {isFil ? "Pumili ng Mode" : "Choose a Mode"}
        </p>
        <div className="flex flex-col gap-2.5">
          {modes.map((m, i) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => onStartMode(m.id)}
                className="w-full flex items-center gap-3.5 bg-white rounded-2xl px-4 py-3.5 border border-[#E7D3A8]/60 shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}22` }}
                >
                  <Icon size={20} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[#4B4032] font-bold text-sm">
                      {m.label}
                    </p>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{
                        color: m.color,
                        background: `${m.color}22`,
                      }}
                    >
                      {m.xp}
                    </span>
                  </div>
                  <p className="text-[#7A736B] text-[11px] mt-0.5 leading-snug">
                    {m.desc}
                  </p>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}22` }}
                >
                  <span
                    className="text-[10px] font-black"
                    style={{ color: m.color }}
                  >
                    {i + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-5 mt-4">
        <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2">
          {isFil ? "Difficulty Ladder" : "Difficulty Ladder"}
        </p>
        <div className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm">
          <div className="flex items-end gap-2 justify-center h-14">
            {[
              { h: 28, c: "#A8CFA0", label: "1" },
              { h: 40, c: "#D6B15E", label: "2" },
              { h: 52, c: "#4B4032", label: "3" },
              { h: 64, c: "#BF9840", label: "4" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-t-lg"
                  style={{ height: b.h, background: b.c }}
                />
                <span className="text-[9px] font-black text-[#7A736B]">
                  L{b.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-[#7A736B] mt-2 font-medium">
            {isFil
              ? "Magsimula sa L1 at umakyat patungo sa L4 habang lumalaki ang kumpiyansa mo."
              : "Start at L1 and climb to L4 as your confidence grows."}
          </p>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mx-5 mt-4">
          <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2">
            {isFil ? "Pinakabagong Session" : "Recent Sessions"}
          </p>
          <div className="flex flex-col gap-2">
            {[...history]
              .reverse()
              .slice(0, 3)
              .map((h, i) => {
                const avg = Math.round(
                  (h.scores.accuracy +
                    h.scores.confidence +
                    h.scores.clarity) /
                    3,
                );
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-[#E7D3A8]/60 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#F4E3B2] flex items-center justify-center flex-shrink-0">
                      <Star size={14} className="text-[#D6B15E]" />
                    </div>
                    <p className="text-[#4B4032] text-xs font-medium flex-1 truncate">
                      {h.feedback.slice(0, 45)}
                      {h.feedback.length > 45 ? "…" : ""}
                    </p>
                    <span
                      className={`text-sm font-black shrink-0 ${avg >= 80 ? "text-[#A8CFA0]" : avg >= 60 ? "text-[#D6B15E]" : "text-[#C5B9AE]"}`}
                    >
                      {avg}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
