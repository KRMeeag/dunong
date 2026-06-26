import React from "react";
import { ScanLine, Mic, Award, Check } from "lucide-react";

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
        <svg viewBox="0 0 240 220" className="w-56 h-52">
          <circle cx="120" cy="110" r="100" fill="#F4E3B2" opacity="0.5" />
          <circle cx="120" cy="110" r="80" fill="#F4E3B2" opacity="0.3" />
          <rect
            x="88"
            y="128"
            width="64"
            height="60"
            rx="12"
            fill="#D6B15E"
            opacity="0.85"
          />
          <rect x="112" y="120" width="16" height="14" rx="4" fill="#F5D5A8" />
          <circle cx="120" cy="100" r="28" fill="#F5D5A8" />
          <ellipse cx="120" cy="76" rx="28" ry="14" fill="#4B4032" />
          <rect x="92" y="76" width="8" height="20" rx="4" fill="#4B4032" />
          <rect x="140" y="76" width="8" height="20" rx="4" fill="#4B4032" />
          <circle cx="112" cy="100" r="3.5" fill="#4B4032" />
          <circle cx="128" cy="100" r="3.5" fill="#4B4032" />
          <circle cx="113" cy="99" r="1.2" fill="white" />
          <circle cx="129" cy="99" r="1.2" fill="white" />
          <path
            d="M112 110 Q120 117 128 110"
            stroke="#4B4032"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x="70"
            y="130"
            width="44"
            height="56"
            rx="6"
            fill="white"
            opacity="0.92"
          />
          <rect x="76" y="137" width="32" height="3" rx="1.5" fill="#D6B15E" />
          <rect x="76" y="143" width="32" height="2" rx="1" fill="#E7D3A8" />
          <rect x="76" y="148" width="24" height="2" rx="1" fill="#E7D3A8" />
          <circle cx="172" cy="92" r="20" fill="#A8CFA0" opacity="0.45" />
          <circle cx="172" cy="92" r="13" fill="#A8CFA0" />
        </svg>
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
