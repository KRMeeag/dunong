import { useState, useRef, useCallback, useEffect } from "react";
import {
  Home, BookOpen, TrendingUp, User, Bell, Flame, Mic,
  Camera, ChevronRight, Check, ArrowLeft, Award,
  Zap, Upload, Settings, Download, Globe, Moon,
  ScanLine, MessageCircle, RotateCcw, Star, Lock,
  Volume2, Play, Target, LayoutGrid,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";

const API = "";

const weeklyPoints = [
  { day: "M", pts: 42 }, { day: "T", pts: 78 }, { day: "W", pts: 35 },
  { day: "T", pts: 91 }, { day: "F", pts: 67 }, { day: "S", pts: 28 }, { day: "S", pts: 55 },
];
const monthlyData = [
  { week: "W1", score: 58 }, { week: "W2", score: 65 },
  { week: "W3", score: 71 }, { week: "W4", score: 83 },
];

function SkillRing({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#E7D3A8" strokeWidth="5" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 34 34)" />
        <text x="34" y="39" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4B4032"
          fontFamily="Plus Jakarta Sans, sans-serif">{value}%</text>
      </svg>
      <span className="text-[10px] text-[#7A736B] font-bold tracking-wide uppercase">{label}</span>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 py-2">
      <span className="text-[13px] font-bold text-[#4B4032]">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#4B4032">
          <rect x="0" y="4" width="3" height="7" rx="1" opacity={0.4} />
          <rect x="4.5" y="2" width="3" height="9" rx="1" opacity={0.65} />
          <rect x="9" y="0" width="3" height="11" rx="1" />
          <rect x="13.5" y="1" width="2" height="9" rx="1" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#4B4032" strokeOpacity={0.35} />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="#4B4032" />
          <path d="M23 4v4a2 2 0 000-4z" fill="#4B4032" fillOpacity={0.4} />
        </svg>
      </div>
    </div>
  );
}

function BottomNav({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "practice", icon: Mic, label: "Practice" },
    { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
    { id: "progress", icon: TrendingUp, label: "Progress" },
    { id: "profile", icon: User, label: "Profile" },
  ];
  return (
    <div className="bg-[#FFFDF8]/95 backdrop-blur-sm border-t border-[#E7D3A8]">
      <div className="flex items-center justify-around px-4 pt-2.5 pb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const on = active === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} className="flex flex-col items-center gap-1">
              <div className={`p-2 rounded-2xl transition-all ${on ? "bg-[#D6B15E]" : ""}`}>
                <Icon size={20} className={on ? "text-white" : "text-[#7A736B]"} />
              </div>
              <span className={`text-[10px] font-bold ${on ? "text-[#D6B15E]" : "text-[#7A736B]"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#FFF9EE] via-[#FFF4DC] to-[#F4E3B2]" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center justify-between px-6 pt-4 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D6B15E] flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-black">D</span>
          </div>
          <span className="text-[#4B4032] font-black text-base tracking-widest" style={{ fontFamily: "Fraunces, serif" }}>
            DUNONG
          </span>
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <svg viewBox="0 0 240 220" className="w-56 h-52">
          <circle cx="120" cy="110" r="100" fill="#F4E3B2" opacity="0.5" />
          <circle cx="120" cy="110" r="80" fill="#F4E3B2" opacity="0.3" />
          <rect x="88" y="128" width="64" height="60" rx="12" fill="#D6B15E" opacity="0.85" />
          <rect x="112" y="120" width="16" height="14" rx="4" fill="#F5D5A8" />
          <circle cx="120" cy="100" r="28" fill="#F5D5A8" />
          <ellipse cx="120" cy="76" rx="28" ry="14" fill="#4B4032" />
          <rect x="92" y="76" width="8" height="20" rx="4" fill="#4B4032" />
          <rect x="140" y="76" width="8" height="20" rx="4" fill="#4B4032" />
          <circle cx="112" cy="100" r="3.5" fill="#4B4032" />
          <circle cx="128" cy="100" r="3.5" fill="#4B4032" />
          <circle cx="113" cy="99" r="1.2" fill="white" />
          <circle cx="129" cy="99" r="1.2" fill="white" />
          <path d="M112 110 Q120 117 128 110" stroke="#4B4032" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="70" y="130" width="44" height="56" rx="6" fill="white" opacity="0.92" />
          <rect x="76" y="137" width="32" height="3" rx="1.5" fill="#D6B15E" />
          <rect x="76" y="143" width="32" height="2" rx="1" fill="#E7D3A8" />
          <rect x="76" y="148" width="24" height="2" rx="1" fill="#E7D3A8" />
          <circle cx="172" cy="92" r="20" fill="#A8CFA0" opacity="0.45" />
          <circle cx="172" cy="92" r="13" fill="#A8CFA0" />
        </svg>
      </div>
      <div className="px-8 text-center mt-1">
        <h1 className="text-3xl font-black text-[#4B4032] leading-tight" style={{ fontFamily: "Fraunces, serif" }}>
          Practice before<br />you recite.
        </h1>
        <p className="mt-2.5 text-[#7A736B] text-[13px] leading-relaxed">
          Dunong helps Filipino students speak with confidence through AI-guided recitation.
        </p>
      </div>
      <div className="px-6 mt-5 flex flex-col gap-2.5">
        <button onClick={onStart}
          className="w-full py-4 bg-[#D6B15E] rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-[#D6B15E]/35 active:scale-95 transition-transform">
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
            <div key={i} className="bg-white/70 rounded-2xl p-3 flex flex-col items-center gap-2 text-center border border-[#E7D3A8]/50">
              <div className="w-9 h-9 rounded-xl bg-[#F4E3B2] flex items-center justify-center">
                <Icon size={16} className="text-[#D6B15E]" />
              </div>
              <span className="text-[10px] font-semibold text-[#4B4032] leading-tight">{f.label}</span>
            </div>
          );
        })}
      </div>
      <div className="px-6 mt-4 mb-10">
        <div className="bg-white/60 rounded-2xl p-4 border border-[#E7D3A8]/50">
          <p className="text-[10px] text-[#7A736B] font-bold uppercase tracking-wider mb-2.5">Privacy First</p>
          {["No images stored", "Your voice stays on device", "Free to use"].map((b) => (
            <div key={b} className="flex items-center gap-2 py-0.5">
              <div className="w-4 h-4 rounded-full bg-[#A8CFA0] flex items-center justify-center flex-shrink-0">
                <Check size={10} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[12px] text-[#4B4032] font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ onDone, lang, setLang }: { onDone: () => void; lang: string; setLang: (l: string) => void }) {
  const [step, setStep] = useState(0);
  const total = 3;
  return (
    <div className="h-full flex flex-col bg-[#FFF9EE]">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i <= step ? "bg-[#4B4032] w-6" : "bg-[#E7D3A8] w-2"}`} />
          ))}
        </div>
        <button onClick={onDone} className="text-[#7A736B] text-xs font-semibold">Skip</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-7">
        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFFDF6] to-[#D6B15E] flex items-center justify-center shadow-xl shadow-[#D6B15E]/40">
              <span className="text-4xl font-black text-[#4B4032]" style={{ fontFamily: "Fraunces, serif" }}>D</span>
            </div>
            <h1 className="text-3xl font-black text-[#4B4032]" style={{ fontFamily: "Fraunces, serif" }}>Welcome to Dunong!</h1>
            <p className="text-[#7A736B] text-sm leading-relaxed">Your AI recitation coach for Filipino students. Practice before you recite.</p>
          </div>
        )}
        {step === 1 && (
          <div className="w-full">
            <h2 className="text-2xl font-black text-[#4B4032] mb-2 text-center" style={{ fontFamily: "Fraunces, serif" }}>Choose language</h2>
            <p className="text-[#7A736B] text-xs text-center mb-6">Used for AI coaching feedback</p>
            <div className="flex flex-col gap-3">
              {["FIL", "EN"].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${lang === l ? "border-[#4B4032] bg-[#4B4032]/5" : "border-[#E7D3A8] bg-white"}`}>
                  <span className="font-bold text-[#4B4032]">{l === "FIL" ? "Filipino" : "English"}</span>
                  {lang === l && <Check size={18} className="text-[#4B4032]" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#A8CFA0] flex items-center justify-center">
              <Check size={36} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-[#4B4032]" style={{ fontFamily: "Fraunces, serif" }}>You're all set!</h1>
            <p className="text-[#7A736B] text-sm leading-relaxed">Point your camera at a printed module to begin practicing.</p>
          </div>
        )}
      </div>
      <div className="px-6 pb-10 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex-1 h-14 rounded-full border-2 border-[#E7D3A8] bg-transparent text-[#4B4032] font-bold text-sm">
            Back
          </button>
        )}
        <button onClick={() => step < total - 1 ? setStep(s => s + 1) : onDone()}
          className="flex-[2] h-14 rounded-full bg-[#4B4032] text-[#FFF9EE] font-bold text-sm shadow-xl shadow-[#4B4032]/30">
          {step === total - 1 ? "Start Practicing" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ onPractice, userName, streak, points, sessions }:
  { onPractice: () => void; userName: string; streak: number; points: number; sessions: number }) {
  const initials = userName.slice(0, 2).toUpperCase();
  return (
    <div className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#7A736B] font-medium">Magandang araw,</p>
          <h2 className="text-xl font-black text-[#4B4032]" style={{ fontFamily: "Fraunces, serif" }}>{userName}</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="relative w-10 h-10 rounded-2xl bg-white border border-[#E7D3A8] flex items-center justify-center shadow-sm">
            <Bell size={18} className="text-[#4B4032]" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-[#D6B15E] flex items-center justify-center text-white font-black text-[11px] shadow-sm">
            {initials}
          </div>
        </div>
      </div>
      <div className="mx-5 mt-4 bg-gradient-to-br from-[#D6B15E] to-[#BF9840] rounded-3xl p-5 shadow-lg shadow-[#D6B15E]/25 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame size={20} className="text-white" />
            <span className="text-white/75 text-xs font-semibold">Current Streak</span>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-5xl font-black text-white" style={{ fontFamily: "Fraunces, serif" }}>{streak}</span>
            <span className="text-white/70 text-sm font-semibold">days</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/65 text-[10px] font-semibold uppercase tracking-wide">Total Points</p>
              <p className="text-white font-black text-xl" style={{ fontFamily: "Fraunces, serif" }}>{points} pts</p>
            </div>
            <button onClick={onPractice}
              className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-white font-bold text-sm flex items-center gap-1.5 border border-white/25 active:scale-95 transition-transform">
              <Play size={12} fill="white" />
              Practice
            </button>
          </div>
        </div>
      </div>
      <div className="mx-5 mt-3.5 grid grid-cols-3 gap-2.5">
        {[
          { label: "Sessions", value: String(sessions), unit: "", c: "#4B4032" },
          { label: "Streak", value: String(streak), unit: "d", c: "#D6B15E" },
          { label: "Points", value: String(points), unit: "", c: "#4B8C42" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-3.5 border border-[#E7D3A8]/60 shadow-sm">
            <p className="text-[9px] text-[#7A736B] font-bold uppercase tracking-wide mb-1">{m.label}</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black" style={{ color: m.c }}>{m.value}</span>
              <span className="text-[10px] text-[#7A736B] font-medium">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mx-5 mt-3.5">
        <button onClick={onPractice}
          className="w-full bg-[#4B4032] rounded-3xl p-4 flex items-center justify-between active:scale-95 transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D6B15E] flex items-center justify-center">
              <Camera size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-[15px]">Scan a Module</p>
              <p className="text-white/55 text-xs">Point camera at printed material</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/50" />
        </button>
      </div>
      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
        <p className="text-[#4B4032] font-bold text-sm mb-4">Your Skill Profile</p>
        <div className="flex justify-around">
          <SkillRing label="Confidence" value={78} color="#D6B15E" />
          <SkillRing label="Clarity" value={65} color="#A8CFA0" />
          <SkillRing label="Accuracy" value={84} color="#4B4032" />
        </div>
      </div>
      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
        <p className="text-[#4B4032] font-bold text-sm mb-3">Points This Week</p>
        <ResponsiveContainer width="100%" height={96}>
          <BarChart data={weeklyPoints} barSize={22}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#7A736B", fontWeight: 600 }} />
            <Bar dataKey="pts" radius={[6, 6, 0, 0]}>
              {weeklyPoints.map((_, i) => (
                <Cell key={i} fill={i === 3 ? "#D6B15E" : "#E7D3A8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type Scores = { accuracy: number; confidence: number; clarity: number };
type Session = { scores: Scores; feedback: string };

function DashboardScreen({ userName, streak, points, history, onScan }:
  { userName: string; streak: number; points: number; history: Session[]; onScan: () => void }) {
  const initials = userName.slice(0, 2).toUpperCase();
  const avg = history.length
    ? Math.round(history.reduce((s, h) => s + (h.scores.accuracy + h.scores.confidence + h.scores.clarity) / 3, 0) / history.length)
    : 0;
  const conf = history.length ? Math.round(history.reduce((s, h) => s + h.scores.confidence, 0) / history.length) : 74;
  const acc = history.length ? Math.round(history.reduce((s, h) => s + h.scores.accuracy, 0) / history.length) : 65;
  const clar = history.length ? Math.round(history.reduce((s, h) => s + h.scores.clarity, 0) / history.length) : 78;
  const weekDots = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#7A736B] font-medium">Dashboard</p>
          <h2 className="text-xl font-black text-[#4B4032]" style={{ fontFamily: "Fraunces, serif" }}>{userName}</h2>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#D6B15E] flex items-center justify-center text-white font-black text-[11px] shadow-sm">{initials}</div>
      </div>
      <div className="mx-5 mt-4 bg-gradient-to-br from-[#4B4032] to-[#6B5A48] rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#D6B15E]/10 rounded-full" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Flame size={16} className="text-[#D6B15E]" />
              <span className="text-white/70 text-xs font-semibold">Current Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white" style={{ fontFamily: "Fraunces, serif" }}>{streak}</span>
              <span className="text-white/60 text-sm font-semibold">days</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {weekDots.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i < streak ? "bg-[#D6B15E]" : "bg-white/15"}`}>
                  {i < streak && <Check size={10} className="text-[#4B4032]" strokeWidth={3} />}
                </div>
                <span className="text-[9px] text-white/50">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onScan} className="mt-4 bg-[#D6B15E] text-[#4B4032] font-bold text-xs px-4 py-2.5 rounded-full active:scale-95 transition-transform">
          Continue Session →
        </button>
      </div>
      <div className="mx-5 mt-3.5 grid grid-cols-3 gap-2.5">
        {[{ l: "Points", v: String(points), c: "#D6B15E" }, { l: "Sessions", v: String(history.length), c: "#9BBBD4" }, { l: "Avg Score", v: `${avg}%`, c: "#A8CFA0" }].map((s) => (
          <div key={s.l} className="bg-white rounded-2xl p-3.5 text-center border border-[#E7D3A8]/60 shadow-sm">
            <p className="font-black text-lg" style={{ color: s.c }}>{s.v}</p>
            <p className="text-[9px] text-[#7A736B] font-semibold mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
        <p className="text-[#4B4032] font-bold text-sm mb-4">Skill Profile</p>
        <div className="flex justify-around">
          <SkillRing label="Confidence" value={conf} color="#A8CFA0" />
          <SkillRing label="Clarity" value={clar} color="#D6B15E" />
          <SkillRing label="Accuracy" value={acc} color="#4B4032" />
        </div>
      </div>
      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
        <p className="text-[#4B4032] font-bold text-sm mb-3">Points This Week</p>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={weeklyPoints} barSize={22}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#7A736B", fontWeight: 600 }} />
            <Bar dataKey="pts" radius={[5, 5, 0, 0]}>
              {weeklyPoints.map((_, i) => <Cell key={i} fill={i === 3 ? "#D6B15E" : "#E7D3A8"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {history.length > 0 && (
        <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
          <p className="text-[#4B4032] font-bold text-sm mb-3">Recent Sessions</p>
          <div className="flex flex-col gap-0">
            {history.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#E7D3A8]/40 last:border-0">
                <p className="text-xs text-[#4B4032] font-medium truncate flex-1 mr-3">{h.feedback.slice(0, 50)}…</p>
                <span className="text-xs font-black text-[#A8CFA0] flex-shrink-0">{Math.round((h.scores.accuracy + h.scores.confidence + h.scores.clarity) / 3)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeScreen({ onDone }: { onDone: (scores: Scores, feedback: string) => void }) {
  const [step, setStep] = useState(0);
  const [recitMode, setRecitMode] = useState("Paraphrase");
  const [listening, setListening] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [selBlock, setSelBlock] = useState<number | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [askAnswer, setAskAnswer] = useState("");
  const [scores, setScores] = useState<Scores>({ accuracy: 0, confidence: 0, clarity: 0 });
  const [feedback, setFeedback] = useState("");
  const [transcript, setTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step === 3 && feedback) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(feedback);
      utt.lang = "fil-PH"; utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
    return () => { window.speechSynthesis.cancel(); };
  }, [step, feedback]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch { setError("Camera access denied"); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const handleGalleryUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true); setError("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`${API}/api/scan`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text: string = data.text;
      const paras = text.split(/\n\n+/).map((p: string) => p.trim()).filter((p: string) => p.length > 20);
      setExtractedText(text);
      setParagraphs(paras.length ? paras : [text]);
      stopCamera(); setStep(1);
    } catch (e: any) { setError(e.message || "Upload failed"); }
    finally { setScanning(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }, [stopCamera]);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current) return;
    setScanning(true); setError("");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
    try {
      const res = await fetch(`${API}/api/scan`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text: string = data.text;
      const paras = text.split(/\n\n+/).map((p: string) => p.trim()).filter((p: string) => p.length > 20);
      setExtractedText(text);
      setParagraphs(paras.length ? paras : [text]);
      stopCamera(); setStep(1);
    } catch (e: any) { setError(e.message || "Scan failed"); }
    finally { setScanning(false); }
  }, [stopCamera]);

  const askDunong = useCallback(async () => {
    if (selBlock === null) return;
    setAsking(true); setAskAnswer("");
    try {
      const res = await fetch(`${API}/api/ask`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: paragraphs[selBlock], question: "Ano ang ibig sabihin nito?" }),
      });
      const data = await res.json();
      setAskAnswer(data.answer || "");
    } catch { setAskAnswer("Hindi makonekta sa Dunong."); }
    setAsking(false);
  }, [selBlock, paragraphs]);

  const startRecording = useCallback(() => {
    chunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      const mr = new MediaRecorder(s, { mimeType: "audio/webm" });
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      mediaRecRef.current = mr;
      setListening(true);
    }).catch(() => setError("Microphone access denied"));
  }, []);

  const stopRecordingAndSubmit = useCallback(async () => {
    setListening(false);
    if (!mediaRecRef.current) return;
    const mr = mediaRecRef.current;
    mr.stop(); mr.stream.getTracks().forEach(t => t.stop());
    setSubmitting(true); setError("");
    await new Promise(r => setTimeout(r, 300));
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    try {
      const fd = new FormData();
      fd.append("audio", blob, "audio.webm");
      const tRes = await fetch(`${API}/api/transcribe`, { method: "POST", body: fd });
      const tData = await tRes.json();
      if (tData.error) throw new Error(tData.error);
      setTranscript(tData.transcript);
      const lockedText = selBlock !== null ? paragraphs[selBlock] : extractedText;
      const cRes = await fetch(`${API}/api/coach`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockedText, transcript: tData.transcript, mode: recitMode.toLowerCase().replace(/ /g, "_"), lang: "FIL" }),
      });
      const cData = await cRes.json();
      if (cData.error) throw new Error(cData.error);
      const s = { accuracy: cData.accuracy ?? 75, confidence: cData.confidence ?? 70, clarity: cData.clarity ?? 72 };
      setScores(s); setFeedback(cData.feedback || "Magaling! Keep practicing.");
      setStep(3); onDone(s, cData.feedback || "");
    } catch (e: any) { setError(e.message || "Submission failed"); }
    finally { setSubmitting(false); }
  }, [selBlock, paragraphs, extractedText, recitMode, onDone]);

  if (step === 0) return (
    <div className="h-full flex flex-col bg-[#1A1209]">
      <div className="px-5 pt-3 flex items-center justify-between flex-shrink-0">
        <button className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <span className="text-white font-bold text-sm">Scan Module</span>
        <div className="w-10 h-10" />
      </div>
      <div className="flex-1 mx-4 mt-4 relative rounded-3xl overflow-hidden bg-[#0D0A04]">
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        {["top-5 left-5 border-t-[3px] border-l-[3px] rounded-tl-2xl","top-5 right-5 border-t-[3px] border-r-[3px] rounded-tr-2xl","bottom-5 left-5 border-b-[3px] border-l-[3px] rounded-bl-2xl","bottom-5 right-5 border-b-[3px] border-r-[3px] rounded-br-2xl"].map((cls, i) => (
          <div key={i} className={`absolute w-9 h-9 border-[#D6B15E] ${cls}`} />
        ))}
        <div className="absolute left-8 right-8 h-px bg-[#D6B15E]" style={{ top: "48%", boxShadow: "0 0 12px 2px #D6B15E88" }} />
        {error && <div className="absolute inset-x-4 top-4 bg-red-900/80 text-white text-xs p-2 rounded-xl text-center">{error}</div>}
        <div className="absolute bottom-6 inset-x-0 flex justify-center">
          <span className="bg-[#D6B15E]/90 text-white text-xs font-bold px-4 py-1.5 rounded-full">
            {scanning ? "Scanning..." : "Point at printed text"}
          </span>
        </div>
      </div>
      <div className="px-6 py-5 flex items-center justify-around flex-shrink-0">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
        <button onClick={() => fileInputRef.current?.click()} disabled={scanning}
          className="w-14 h-14 rounded-2xl bg-[#2A2010] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-40">
          <Upload size={18} className="text-[#D6B15E]" />
          <span className="text-[#D6B15E]/70 text-[9px] font-semibold">Gallery</span>
        </button>
        <button onClick={startCamera} className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-95 transition-transform">
          <div className="w-16 h-16 rounded-full border-4 border-[#E7D3A8] flex items-center justify-center">
            <Camera size={26} className="text-[#4B4032]" />
          </div>
        </button>
        <button onClick={captureAndScan} disabled={scanning}
          className="w-14 h-14 rounded-2xl bg-[#D6B15E] disabled:opacity-40 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform">
          <ScanLine size={18} className="text-white" />
          <span className="text-white/80 text-[9px] font-semibold">Scan</span>
        </button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="h-full flex flex-col bg-[#FFF9EE]">
      <div className="px-5 pt-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => setStep(0)} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#4B4032]" />
        </button>
        <div className="flex-1">
          <h3 className="text-[#4B4032] font-bold text-sm">Sipat-Aral</h3>
          <p className="text-[#7A736B] text-xs">Extracted Text</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 mt-4 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm mb-3">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-3">Extracted Text — Tap to select</p>
          <div className="flex flex-col gap-2.5">
            {paragraphs.map((p, i) => (
              <button key={i} onClick={() => { setSelBlock(selBlock === i ? null : i); setAskAnswer(""); }}
                className={`w-full text-left p-3.5 rounded-2xl transition-all text-xs leading-relaxed text-[#4B4032] ${selBlock === i ? "bg-[#F4E3B2] border-2 border-[#D6B15E]" : "bg-[#FAFAF8] border border-[#E7D3A8]"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        {selBlock !== null && (
          <button onClick={askDunong} disabled={asking}
            className="w-full bg-[#F4E3B2] rounded-2xl p-3.5 mb-3 flex items-center gap-3 active:scale-95 transition-transform disabled:opacity-60">
            <div className="w-9 h-9 rounded-xl bg-[#D6B15E] flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-[#4B4032] text-xs font-bold">Ask Dunong</p>
              <p className="text-[#7A736B] text-xs mt-0.5">{asking ? "Thinking..." : "Ano ang ibig sabihin nito?"}</p>
            </div>
          </button>
        )}
        {askAnswer && (
          <div className="bg-white rounded-2xl p-4 mb-3 border border-[#E7D3A8]/60 text-xs text-[#4B4032] leading-relaxed">{askAnswer}</div>
        )}
        <p className="text-[#7A736B] text-xs font-medium text-center mb-3">Explain this in your own words.</p>
        <button onClick={() => setStep(2)}
          className="w-full py-4 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Mic size={16} />
          Lock Context & Practice
        </button>
      </div>
    </div>
  );

  if (step === 2) {
    const modes = ["Paraphrase", "Read-Aloud", "Cold Call", "Stand & Deliver"];
    return (
      <div className="h-full flex flex-col bg-[#FFF9EE]">
        <div className="px-5 pt-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setStep(1)} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#4B4032]" />
          </button>
          <h3 className="text-[#4B4032] font-bold text-sm flex-1">Recitation Mode</h3>
          {listening && (
            <div className="bg-[#F4E3B2] px-3 py-1 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[#4B4032] text-xs font-bold">REC</span>
            </div>
          )}
        </div>
        <div className="px-5 mt-3 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {modes.map((m) => (
              <button key={m} onClick={() => setRecitMode(m)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${recitMode === m ? "bg-[#4B4032] text-white" : "bg-[#E7D3A8] text-[#7A736B]"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        {selBlock !== null && (
          ["Cold Call", "Stand & Deliver"].includes(recitMode) ? (
            <div className="mx-5 mt-3 bg-[#F4E3B2] rounded-3xl p-4 border border-[#D6B15E]/40 shadow-sm flex-shrink-0 flex items-center gap-3">
              <Lock size={16} className="text-[#D6B15E] flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider">Text hidden</p>
                <p className="text-[#4B4032] text-xs font-medium mt-0.5">{recitMode} — recall from memory</p>
              </div>
            </div>
          ) : (
            <div className="mx-5 mt-3 bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm flex-shrink-0">
              <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">Selected Text</p>
              <p className="text-[#4B4032] text-xs leading-relaxed line-clamp-4">{paragraphs[selBlock]}</p>
            </div>
          )
        )}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {error && <p className="text-red-500 text-xs px-5 text-center">{error}</p>}
          <div className="relative flex items-center justify-center">
            {listening && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-[#D6B15E]/15 animate-ping" />
                <div className="absolute w-28 h-28 rounded-full bg-[#D6B15E]/20 animate-ping" style={{ animationDelay: "0.25s" }} />
              </>
            )}
            <button onMouseDown={startRecording} onMouseUp={stopRecordingAndSubmit}
              onTouchStart={(e) => { e.preventDefault(); startRecording(); }} onTouchEnd={stopRecordingAndSubmit}
              disabled={submitting}
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${listening ? "bg-[#D6B15E] shadow-[#D6B15E]/35" : "bg-[#4B4032] shadow-[#4B4032]/20"}`}>
              <Mic size={40} className="text-white" />
            </button>
          </div>
          <p className="text-[#7A736B] text-sm font-semibold">
            {submitting ? "Processing..." : listening ? "Listening..." : "Hold to Speak"}
          </p>
          {listening && (
            <div className="flex items-end gap-1 h-10">
              {[4, 8, 14, 10, 18, 12, 6, 16, 9].map((h, i) => (
                <div key={i} className="w-1.5 bg-[#D6B15E] rounded-full animate-pulse" style={{ height: `${h + 4}px`, animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          )}
          {submitting && transcript && (
            <div className="mx-5 bg-white rounded-2xl p-3.5 border border-[#E7D3A8]/60 w-full">
              <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1">Dunong heard</p>
              <p className="text-[#4B4032] text-xs leading-relaxed italic">"{transcript}"</p>
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
  const total = Math.round((scores.accuracy + scores.confidence + scores.clarity) / 3);
  return (
    <div className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-3 flex items-center gap-3">
        <button onClick={() => setStep(2)} className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#4B4032]" />
        </button>
        <h3 className="text-[#4B4032] font-black text-base flex-1" style={{ fontFamily: "Fraunces, serif" }}>Feedback Results</h3>
        <span className="text-white font-bold text-xs bg-[#D6B15E] px-3 py-1 rounded-full">+{total} pts</span>
      </div>
      <div className="mx-5 mt-4 grid grid-cols-3 gap-2.5">
        {scoreList.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-[#E7D3A8]/60 shadow-sm">
            <SkillRing label={s.label} value={s.value} color={s.color} />
          </div>
        ))}
      </div>
      {transcript && (
        <div className="mx-5 mt-4 bg-white rounded-3xl p-4 border border-[#E7D3A8]/60">
          <p className="text-[9px] font-bold text-[#7A736B] uppercase tracking-wider mb-1.5">Dunong heard</p>
          <p className="text-[#4B4032] text-xs leading-relaxed italic">"{transcript}"</p>
        </div>
      )}
      <div className="mx-5 mt-4 bg-[#F4E3B2] rounded-3xl p-4 border border-[#E7D3A8]">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#D6B15E] flex items-center justify-center">
            <span className="text-white text-[10px] font-black">D</span>
          </div>
          <span className="text-[#4B4032] font-bold text-sm">Dunong says</span>
          <button onClick={() => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(feedback); u.lang = "fil-PH"; u.rate = 0.9; window.speechSynthesis.speak(u); }}
            className="ml-auto w-7 h-7 rounded-full bg-[#D6B15E] flex items-center justify-center">
            <Volume2 size={13} className="text-white" />
          </button>
        </div>
        <p className="text-[#4B4032] text-sm leading-relaxed">{feedback || "Napakagaling mo! Keep going!"}</p>
      </div>
      <div className="mx-5 mt-4 flex gap-3">
        <button onClick={() => setStep(2)}
          className="flex-1 py-3.5 bg-[#E7D3A8] rounded-2xl text-[#4B4032] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <RotateCcw size={15} />
          Try Again
        </button>
        <button onClick={() => setStep(0)}
          className="flex-1 py-3.5 bg-[#4B4032] rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Zap size={15} />
          New Scan
        </button>
      </div>
    </div>
  );
}

function ProgressScreen({ history }: { history: { scores: Scores }[] }) {
  const avg = history.length
    ? Math.round(history.reduce((s, h) => s + (h.scores.accuracy + h.scores.confidence + h.scores.clarity) / 3, 0) / history.length)
    : 0;
  return (
    <div className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-3">
        <h2 className="text-[#4B4032] font-black text-xl" style={{ fontFamily: "Fraunces, serif" }}>Progress</h2>
        <p className="text-[#7A736B] text-xs">Your recitation journey</p>
      </div>
      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
        <p className="text-[#4B4032] font-bold text-sm mb-4">Overall</p>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 96 96" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r="38" fill="none" stroke="#E7D3A8" strokeWidth="8" />
              <circle cx="48" cy="48" r="38" fill="none" stroke="#D6B15E" strokeWidth="8"
                strokeDasharray={`${(avg / 100) * 2 * Math.PI * 38} ${2 * Math.PI * 38}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#4B4032]">{avg}%</span>
              <span className="text-[9px] text-[#7A736B] font-bold uppercase">Avg</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2.5">
            {[{ l: "Sessions", v: String(history.length) }, { l: "Avg score", v: `${avg}%` }].map((s) => (
              <div key={s.l} className="flex justify-between items-center">
                <span className="text-xs text-[#7A736B]">{s.l}</span>
                <span className="text-xs font-bold text-[#4B4032]">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {history.length > 0 && (
        <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
          <p className="text-[#4B4032] font-bold text-sm mb-3">Score History</p>
          <ResponsiveContainer width="100%" height={96}>
            <AreaChart data={history.map((h, i) => ({ s: `S${i+1}`, score: Math.round((h.scores.accuracy+h.scores.confidence+h.scores.clarity)/3) }))}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D6B15E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D6B15E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="s" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#7A736B" }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#FFF9EE", border: "1px solid #E7D3A8", borderRadius: 12, fontSize: 11 }} />
              <Area type="monotone" dataKey="score" stroke="#D6B15E" strokeWidth={2.5} fill="url(#cg)" dot={{ r: 3.5, fill: "#D6B15E", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mx-5 mt-4">
        <p className="text-[#4B4032] font-bold text-sm mb-3">Achievements</p>
        <div className="flex flex-col gap-2.5">
          {[
            { name: "First Session", desc: "Complete your first recitation", icon: "⭐", earned: history.length >= 1 },
            { name: "Study Buddy", desc: "Complete 5 sessions", icon: "📚", earned: history.length >= 5 },
            { name: "High Scorer", desc: "Score 80%+ overall", icon: "🎯", earned: avg >= 80 },
          ].map((a) => (
            <div key={a.name} className={`flex items-center gap-3.5 p-4 rounded-2xl border ${a.earned ? "bg-white border-[#E7D3A8]/60" : "bg-[#F5F5F0] border-[#E7D3A8]/25 opacity-55"}`}>
              <div className="w-12 h-12 rounded-2xl bg-[#F4E3B2] flex items-center justify-center text-xl flex-shrink-0">{a.icon}</div>
              <div className="flex-1">
                <p className="text-[#4B4032] font-bold text-sm">{a.name}</p>
                <p className="text-[#7A736B] text-xs">{a.desc}</p>
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.earned ? "bg-[#A8CFA0]" : "bg-[#E7D3A8]"}`}>
                {a.earned ? <Check size={13} className="text-white" strokeWidth={3} /> : <Target size={13} className="text-[#7A736B]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ userName, streak, points, sessions, lang, setLang, setUserName }:
  { userName: string; streak: number; points: number; sessions: number; lang: string; setLang: (l: string) => void; setUserName: (n: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userName);
  const initials = userName.slice(0, 2).toUpperCase();
  return (
    <div className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-3 flex items-center justify-between">
        <h2 className="text-[#4B4032] font-black text-xl" style={{ fontFamily: "Fraunces, serif" }}>Profile</h2>
        <button className="w-10 h-10 rounded-2xl bg-[#E7D3A8] flex items-center justify-center">
          <Settings size={18} className="text-[#4B4032]" />
        </button>
      </div>
      <div className="mx-5 mt-4 bg-gradient-to-br from-[#D6B15E] to-[#BF9840] rounded-3xl p-5 flex items-center gap-4 shadow-lg shadow-[#D6B15E]/25 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-black text-base flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 relative z-10">
          {editing ? (
            <div className="flex gap-2">
              <input value={name} onChange={e => setName(e.target.value)}
                className="flex-1 bg-white/20 border border-white/30 rounded-xl px-3 py-1.5 text-white text-sm font-bold outline-none" />
              <button onClick={() => { setUserName(name); setEditing(false); }}
                className="bg-white/25 border border-white/30 rounded-xl px-3 py-1.5 text-white text-sm font-bold">Save</button>
            </div>
          ) : (
            <>
              <p className="text-white font-black text-base">{userName}</p>
              <button onClick={() => setEditing(true)} className="text-white/65 text-xs mt-0.5">Edit name</button>
            </>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-yellow-300 fill-yellow-300" />
            <span className="text-white text-[11px] font-semibold">Dunong Learner</span>
          </div>
        </div>
      </div>
      <div className="mx-5 mt-3.5 grid grid-cols-4 gap-2">
        {[{ l: "Sessions", v: String(sessions) }, { l: "Streak", v: `${streak}d` }, { l: "Points", v: String(points) }, { l: "Lang", v: lang }].map((s) => (
          <div key={s.l} className="bg-white rounded-2xl p-3 text-center border border-[#E7D3A8]/60">
            <p className="text-[#4B4032] font-black text-base">{s.v}</p>
            <p className="text-[9px] text-[#7A736B] font-semibold">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="mx-5 mt-4">
        <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2.5">Preferences</p>
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E7D3A8]/60 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E7D3A8]/40">
            <div className="w-8 h-8 rounded-xl bg-[#F4E3B2] flex items-center justify-center flex-shrink-0">
              <Globe size={14} className="text-[#D6B15E]" />
            </div>
            <span className="flex-1 text-sm text-[#4B4032] font-medium">Coach Language</span>
            <div className="flex gap-1.5">
              {["FIL","EN"].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${lang === l ? "bg-[#4B4032] text-white" : "bg-[#E7D3A8] text-[#7A736B]"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {[{ icon: Moon, label: "Theme", value: "Light" }, { icon: Volume2, label: "Accessibility", value: "Standard" }, { icon: Lock, label: "Privacy", value: "Private" }].map((s, i, arr) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length-1 ? "border-b border-[#E7D3A8]/40" : ""}`}>
                <div className="w-8 h-8 rounded-xl bg-[#F4E3B2] flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#D6B15E]" />
                </div>
                <span className="flex-1 text-sm text-[#4B4032] font-medium">{s.label}</span>
                <span className="text-[11px] text-[#7A736B]">{s.value}</span>
                <ChevronRight size={13} className="text-[#C5B9AE] flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
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

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [userName, setUserName] = useState("Learner");
  const [lang, setLang] = useState("FIL");
  const [streak] = useState(1);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<Session[]>([]);

  const handleDone = useCallback((scores: Scores, feedback: string) => {
    const earned = Math.round((scores.accuracy + scores.confidence + scores.clarity) / 3);
    setPoints(p => p + earned);
    setHistory(h => [...h, { scores, feedback }]);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #2C2416 0%, #1A1209 60%, #0D0A04 100%)" }}>
      <div className="relative flex flex-col bg-[#FFF9EE]"
        style={{ width: 370, height: 800, borderRadius: 44, overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 10px #1A1209, inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
          style={{ width: 120, height: 28, background: "#1A1209", borderRadius: "0 0 20px 20px" }} />
        <div className="flex-shrink-0 pt-7 z-20"><StatusBar /></div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {showLanding ? (
            <LandingScreen onStart={() => { setShowLanding(false); setShowOnboarding(true); }} />
          ) : showOnboarding ? (
            <OnboardingScreen onDone={() => setShowOnboarding(false)} lang={lang} setLang={setLang} />
          ) : (
            <>
              <div className="flex-1 overflow-hidden min-h-0">
                {activeTab === "home" && <HomeScreen onPractice={() => setActiveTab("practice")} userName={userName} streak={streak} points={points} sessions={history.length} />}
                {activeTab === "practice" && <PracticeScreen onDone={handleDone} />}
                {activeTab === "dashboard" && <DashboardScreen userName={userName} streak={streak} points={points} history={history} onScan={() => setActiveTab("practice")} />}
                {activeTab === "progress" && <ProgressScreen history={history} />}
                {activeTab === "profile" && <ProfileScreen userName={userName} streak={streak} points={points} sessions={history.length} lang={lang} setLang={setLang} setUserName={setUserName} />}
              </div>
              <BottomNav active={activeTab} onChange={setActiveTab} />
            </>
          )}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-28 h-1 rounded-full"
          style={{ background: "rgba(75,64,50,0.25)" }} />
      </div>
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/20 text-xs font-bold tracking-widest uppercase">
        Dunong · AI Recitation Coach
      </p>
    </div>
  );
}
