import React, { useState } from "react";
import {
  Settings,
  Globe,
  Moon,
  Volume2,
  Lock,
  Download,
  ChevronRight,
  Star,
  Check,
} from "lucide-react";

export default function ProfileScreen({
  userName,
  streak,
  points,
  sessions,
  lang,
  setLang,
  setUserName,
}: {
  userName: string;
  streak: number;
  points: number;
  sessions: number;
  lang: string;
  setLang: (l: string) => void;
  setUserName: (n: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userName);
  const [theme, setTheme] = useState("Light");
  const [textSize, setTextSize] = useState("Standard");
  const [privacy, setPrivacy] = useState("Private");
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div
      className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="px-5 pt-3 flex items-center justify-between">
        <h2
          className="text-[#4B4032] font-black text-xl"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Profile
        </h2>
        <button className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
          <Settings size={18} className="text-[#4B4032]" />
        </button>
      </div>

      {/* Hero card */}
      <div className="mx-5 mt-4 bg-gradient-to-br from-[#D6B15E] to-[#BF9840] rounded-3xl p-5 flex items-center gap-4 shadow-lg shadow-[#D6B15E]/25 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-black text-base flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 relative z-10">
          {editing ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-white/20 border border-white/30 rounded-xl px-3 py-1.5 text-white text-sm font-bold outline-none"
              />
              <button
                onClick={() => {
                  setUserName(name);
                  setEditing(false);
                }}
                className="bg-white/25 border border-white/30 rounded-xl px-3 py-1.5 text-white text-sm font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <p className="text-white font-black text-base">{userName}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-white/65 text-xs mt-0.5"
              >
                Edit name
              </button>
            </>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-yellow-300 fill-yellow-300" />
            <span className="text-white text-[11px] font-semibold">
              Dunong Learner
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mx-5 mt-3.5 grid grid-cols-4 gap-2">
        {[
          { l: "Sessions", v: String(sessions) },
          { l: "Streak", v: `${streak}d` },
          { l: "Points", v: String(points) },
          { l: "Lang", v: lang },
        ].map((s) => (
          <div
            key={s.l}
            className="bg-white rounded-2xl p-3 text-center border border-[#E7D3A8]/60"
          >
            <p className="text-[#4B4032] font-black text-base">{s.v}</p>
            <p className="text-[9px] text-[#7A736B] font-semibold">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="mx-5 mt-4">
        <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2.5">
          Preferences
        </p>
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E7D3A8]/60 shadow-sm">
          {/* Language row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E7D3A8]/40">
            <div className="w-8 h-8 rounded-xl bg-[#F4E3B2] flex items-center justify-center flex-shrink-0">
              <Globe size={14} className="text-[#D6B15E]" />
            </div>
            <span className="flex-1 text-sm text-[#4B4032] font-medium">
              Coach Language
            </span>
            <div className="flex gap-1.5">
              {["FIL", "EN"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${lang === l ? "bg-[#4B4032] text-white" : "bg-[#E7D3A8] text-[#7A736B]"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle rows */}
          {(
            [
              {
                icon: Moon,
                label: "Theme",
                options: ["Light", "Dark"] as const,
                value: theme,
                set: setTheme,
              },
              {
                icon: Volume2,
                label: "Text Size",
                options: ["Standard", "Large"] as const,
                value: textSize,
                set: setTextSize,
              },
              {
                icon: Lock,
                label: "Privacy",
                options: ["Private", "Public"] as const,
                value: privacy,
                set: setPrivacy,
              },
            ] as const
          ).map((s, i, arr) => {
            const Icon = s.icon;
            const opts = s.options as readonly string[];
            const next = opts[(opts.indexOf(s.value) + 1) % opts.length];
            return (
              <button
                key={s.label}
                onClick={() => (s.set as (v: string) => void)(next)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#F4E3B2]/40 transition-colors ${i < arr.length - 1 ? "border-b border-[#E7D3A8]/40" : ""}`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#F4E3B2] flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-[#D6B15E]" />
                </div>
                <span className="flex-1 text-sm text-[#4B4032] font-medium text-left">
                  {s.label}
                </span>
                <span className="text-[11px] text-[#7A736B]">{s.value}</span>
                <ChevronRight size={13} className="text-[#C5B9AE] shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer badge */}
      <div className="mx-5 mt-4">
        <div className="bg-[#F4E3B2] rounded-2xl p-4 flex items-center gap-3 border border-[#E7D3A8]">
          <Download size={17} className="text-[#D6B15E] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[#4B4032] font-bold text-sm">Powered by Groq AI</p>
            <p className="text-[#7A736B] text-xs">Free tier · Always available</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#A8CFA0] flex items-center justify-center flex-shrink-0">
            <Check size={13} className="text-white" strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
