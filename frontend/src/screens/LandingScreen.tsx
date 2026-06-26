import React from "react";
import { ScanLine, Mic, Award, Check } from "lucide-react"; // ScanLine/Mic/Award used in feature cards

export default function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="h-full overflow-y-auto bg-gradient-to-b from-[#FFF9EE] via-[#FFF4DC] to-[#F4E3B2]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex items-center justify-between px-6 pt-4 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D6B15E] flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-black">D</span>
          </div>
          <span
            className="text-[#4B4032] font-black text-base tracking-widest"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            DUNONG
          </span>
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <img
          src="/Thumbs_up_transparent.png"
          alt="Dunong mascot"
          className="w-56 h-52 object-contain"
        />
      </div>
      <div className="px-8 text-center mt-1">
        <h1
          className="text-3xl font-black text-[#4B4032] leading-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Practice before
          <br />
          you recite.
        </h1>
        <p className="mt-2.5 text-[#7A736B] text-[13px] leading-relaxed">
          Dunong helps Filipino students speak with confidence through AI-guided
          recitation.
        </p>
      </div>
      <div className="px-6 mt-5 flex flex-col gap-2.5">
        <button
          onClick={onStart}
          className="w-full py-4 bg-[#D6B15E] rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-[#D6B15E]/35 active:scale-95 transition-transform"
        >
          <ScanLine size={18} />
          Get Started
        </button>
      </div>
      <div className="px-6 mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: ScanLine, label: "Scan printed modules" },
          { icon: Mic, label: "Practice speaking" },
          { icon: Award, label: "Build confidence" },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="bg-white/70 rounded-2xl p-3 flex flex-col items-center gap-2 text-center border border-[#E7D3A8]/50"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4E3B2] flex items-center justify-center">
                <Icon size={16} className="text-[#D6B15E]" />
              </div>
              <span className="text-[10px] font-semibold text-[#4B4032] leading-tight">
                {f.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="px-6 mt-4 mb-10">
        <div className="bg-white/60 rounded-2xl p-4 border border-[#E7D3A8]/50">
          <p className="text-[10px] text-[#7A736B] font-bold uppercase tracking-wider mb-2.5">
            Privacy First
          </p>
          {[
            "No images stored",
            "Your voice stays on device",
            "Free to use",
          ].map((b) => (
            <div key={b} className="flex items-center gap-2 py-0.5">
              <div className="w-4 h-4 rounded-full bg-[#A8CFA0] flex items-center justify-center flex-shrink-0">
                <Check size={10} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[12px] text-[#4B4032] font-medium">
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
