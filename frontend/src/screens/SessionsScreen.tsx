import React from "react";
import { Mic } from "lucide-react";
import { Session } from "../types";

export default function SessionsScreen({ history }: { history: Session[] }) {
  return (
    <div
      className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="px-5 pt-3 mb-4">
        <h2
          className="text-[#4B4032] font-black text-xl"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Sessions
        </h2>
        <p className="text-[#7A736B] text-xs">
          {history.length} recitation{history.length !== 1 ? "s" : ""} completed
        </p>
      </div>
      {history.length === 0 ? (
        <div className="mx-5 flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#F4E3B2] flex items-center justify-center">
            <Mic size={28} className="text-[#D6B15E]" />
          </div>
          <p className="text-[#4B4032] font-bold text-sm">No sessions yet</p>
          <p className="text-[#7A736B] text-xs text-center">
            Tap the scan button below to start your first recitation.
          </p>
        </div>
      ) : (
        <div className="mx-5 flex flex-col gap-3">
          {[...history].reverse().map((h, i) => {
            const score = Math.round(
              (h.scores.accuracy + h.scores.confidence + h.scores.clarity) / 3,
            );
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-[#E7D3A8]/60 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#7A736B] uppercase tracking-wider">
                    Session {history.length - i}
                  </span>
                  <span
                    className={`text-sm font-black ${score >= 80 ? "text-[#A8CFA0]" : score >= 60 ? "text-[#D6B15E]" : "text-[#4B4032]"}`}
                  >
                    {score}%
                  </span>
                </div>
                <div className="flex gap-3 mb-2.5">
                  {[
                    { l: "Accuracy", v: h.scores.accuracy },
                    { l: "Confidence", v: h.scores.confidence },
                    { l: "Clarity", v: h.scores.clarity },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="flex-1 bg-[#FAFAF8] rounded-xl p-2 text-center border border-[#E7D3A8]/40"
                    >
                      <p className="text-xs font-black text-[#4B4032]">
                        {s.v}%
                      </p>
                      <p className="text-[8px] text-[#7A736B] font-semibold mt-0.5">
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[#7A736B] text-xs leading-relaxed line-clamp-2">
                  {h.feedback}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
