import { useState, useRef, useCallback, useEffect } from "react";
import {
  Home,
  BookOpen,
  TrendingUp,
  User,
  Bell,
  Flame,
  Mic,
  Camera,
  ChevronRight,
  Check,
  ArrowLeft,
  Award,
  Zap,
  Upload,
  Settings,
  Download,
  Globe,
  Moon,
  ScanLine,
  MessageCircle,
  RotateCcw,
  StopCircle,
  Plus,
  FileText,
  Link,
  Library,
  Layers,
  HelpCircle,
  RotateCw,
  X,
  Clock,
  Trophy,
  Star,
  Lock,
  Volume2,
  Play,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

import { checkHealth } from "./services/api";

const API = "";

const weeklyPoints = [
  { day: "M", pts: 42 },
  { day: "T", pts: 78 },
  { day: "W", pts: 35 },
  { day: "T", pts: 91 },
  { day: "F", pts: 67 },
  { day: "S", pts: 28 },
  { day: "S", pts: 55 },
];
const monthlyData = [
  { week: "W1", score: 58 },
  { week: "W2", score: 65 },
  { week: "W3", score: 71 },
  { week: "W4", score: 83 },
];

function SkillRing({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="#E7D3A8"
          strokeWidth="5"
        />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 34 34)"
        />
        <text
          x="34"
          y="39"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#4B4032"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          {value}%
        </text>
      </svg>
      <span className="text-[10px] text-[#7A736B] font-bold tracking-wide uppercase">
        {label}
      </span>
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
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="3.5"
            stroke="#4B4032"
            strokeOpacity={0.35}
          />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="#4B4032" />
          <path d="M23 4v4a2 2 0 000-4z" fill="#4B4032" fillOpacity={0.4} />
        </svg>
      </div>
    </div>
  );
}

function BottomNav({
  active,
  onChange,
  onScanPress,
}: {
  active: string;
  onChange: (t: string) => void;
  onScanPress: () => void;
}) {
  const leftTabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
  ];
  const rightTabs = [
    { id: "library", icon: Library, label: "Library" },
    { id: "profile", icon: User, label: "Profile" },
  ];
  const renderTab = (tab: { id: string; icon: any; label: string }) => {
    const Icon = tab.icon;
    const on = active === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className="flex flex-col items-center gap-0.5 px-4 py-2"
      >
        <Icon size={20} className={on ? "text-[#4B4032]" : "text-[#A89D8A]"} />
        <span
          className={`text-[9px] font-bold ${on ? "text-[#4B4032]" : "text-[#A89D8A]"}`}
        >
          {tab.label}
        </span>
      </button>
    );
  };
  return (
    <div
      className="relative bg-[#FFF9EE] px-5"
      style={{ paddingTop: 28, paddingBottom: 24 }}
    >
      <div
        className="flex items-center justify-between bg-white/90 border border-[#E7D3A8]/70 rounded-full px-1 shadow-md"
        style={{ height: 56 }}
      >
        <div className="flex">{leftTabs.map(renderTab)}</div>
        <div style={{ width: 56 }} />
        <div className="flex">{rightTabs.map(renderTab)}</div>
      </div>
      <button
        onClick={onScanPress}
        className="absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#D6B15E] border-4 border-[#FFF9EE] flex items-center justify-center shadow-xl shadow-[#D6B15E]/40 active:scale-95 transition-transform z-10"
        style={{ top: 0 }}
      >
        <ScanLine size={22} className="text-white" />
      </button>
    </div>
  );
}

function LandingScreen({ onStart }: { onStart: () => void }) {
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

function OnboardingScreen({
  onDone,
  lang,
  setLang,
}: {
  onDone: () => void;
  lang: string;
  setLang: (l: string) => void;
}) {
  const [step, setStep] = useState(0);
  const total = 3;
  return (
    <div className="h-full flex flex-col bg-[#FFF9EE]">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i <= step ? "bg-[#4B4032] w-6" : "bg-[#E7D3A8] w-2"}`}
            />
          ))}
        </div>
        <button
          onClick={onDone}
          className="text-[#7A736B] text-xs font-semibold"
        >
          Skip
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-7">
        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFFDF6] to-[#D6B15E] flex items-center justify-center shadow-xl shadow-[#D6B15E]/40">
              <span
                className="text-4xl font-black text-[#4B4032]"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                D
              </span>
            </div>
            <h1
              className="text-3xl font-black text-[#4B4032]"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Welcome to Dunong!
            </h1>
            <p className="text-[#7A736B] text-sm leading-relaxed">
              Your AI recitation coach for Filipino students. Practice before
              you recite.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="w-full">
            <h2
              className="text-2xl font-black text-[#4B4032] mb-2 text-center"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Choose language
            </h2>
            <p className="text-[#7A736B] text-xs text-center mb-6">
              Used for AI coaching feedback
            </p>
            <div className="flex flex-col gap-3">
              {["FIL", "EN"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${lang === l ? "border-[#4B4032] bg-[#4B4032]/5" : "border-[#E7D3A8] bg-white"}`}
                >
                  <span className="font-bold text-[#4B4032]">
                    {l === "FIL" ? "Filipino" : "English"}
                  </span>
                  {lang === l && (
                    <Check
                      size={18}
                      className="text-[#4B4032]"
                      strokeWidth={3}
                    />
                  )}
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
            <h1
              className="text-3xl font-black text-[#4B4032]"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              You're all set!
            </h1>
            <p className="text-[#7A736B] text-sm leading-relaxed">
              Point your camera at a printed module to begin practicing.
            </p>
          </div>
        )}
      </div>
      <div className="px-6 pb-10 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 h-14 rounded-full border-2 border-[#E7D3A8] bg-transparent text-[#4B4032] font-bold text-sm"
          >
            Back
          </button>
        )}
        <button
          onClick={() => (step < total - 1 ? setStep((s) => s + 1) : onDone())}
          className="flex-[2] h-14 rounded-full bg-[#4B4032] text-[#FFF9EE] font-bold text-sm shadow-xl shadow-[#4B4032]/30"
        >
          {step === total - 1 ? "Start Practicing" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function HomeScreen({
  onPractice,
  onProfile,
  onLibrary,
  userName,
  points,
  notebookCount,
  history,
}: {
  onPractice: (mode?: string) => void;
  onProfile: () => void;
  onLibrary: () => void;
  userName: string;
  points: number;
  notebookCount: number;
  history: Session[];
}) {
  const initials = userName.slice(0, 2).toUpperCase();

  // Contribution graph — last 84 days (12 weeks)
  const WEEKS = 12;
  const today = new Date();
  // Align so the last column ends today
  const todayDow = today.getDay(); // 0=Sun…6=Sat
  const totalDays = WEEKS * 7;
  const sessionMap = new Map<string, number>();
  history.forEach(h => {
    if (h.date) sessionMap.set(h.date, (sessionMap.get(h.date) ?? 0) + 1);
  });
  const cellColor = (n: number) => {
    if (n === 0) return "#E7D3A8";
    if (n === 1) return "#C4A96B";
    if (n === 2) return "#BF9840";
    return "#D6B15E";
  };
  // Build grid: rows=days of week (0=Mon…6=Sun), cols=weeks (oldest→newest)
  const grid: { date: string; count: number }[][] = Array.from({ length: 7 }, () => []);
  for (let col = 0; col < WEEKS; col++) {
    for (let row = 0; row < 7; row++) {
      const dayOffset = (WEEKS - 1 - col) * 7 + (6 - ((todayDow + 6 - row) % 7));
      const d = new Date(today);
      d.setDate(today.getDate() - dayOffset);
      const dateStr = d.toISOString().slice(0, 10);
      grid[row].push({ date: dateStr, count: sessionMap.get(dateStr) ?? 0 });
    }
  }
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const totalSessions = history.length;

  return (
    <div className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="px-5 pt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#7A736B] font-medium">Magandang araw,</p>
          <h2 className="text-xl font-black text-[#4B4032]" style={{ fontFamily: "Fraunces, serif" }}>{userName}</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="relative w-10 h-10 rounded-2xl bg-white border border-[#E7D3A8] flex items-center justify-center shadow-sm">
            <Bell size={18} className="text-[#4B4032]" />
          </button>
          <button onClick={onProfile} className="w-10 h-10 rounded-2xl bg-[#D6B15E] flex items-center justify-center text-white font-black text-[11px] shadow-sm active:scale-95 transition-transform">
            {initials}
          </button>
        </div>
      </div>

      {/* Hero banner */}
      <div className="mx-5 mt-4 bg-gradient-to-br from-[#D6B15E] to-[#BF9840] rounded-3xl p-5 shadow-lg shadow-[#D6B15E]/25 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">Total Points</p>
            <p className="text-white font-black text-4xl leading-none" style={{ fontFamily: "Fraunces, serif" }}>{points}</p>
            <button onClick={onLibrary} className="flex items-center gap-1.5 mt-2 bg-white/20 border border-white/30 rounded-xl px-2.5 py-1 active:scale-95 transition-transform">
              <span className="text-white text-xs font-bold">{notebookCount}</span>
              <Library size={12} className="text-white" />
            </button>
          </div>
          <button onClick={() => onPractice()} className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-white font-bold text-sm flex items-center gap-1.5 border border-white/25 active:scale-95 transition-transform">
            <Play size={12} fill="white" />Practice
          </button>
        </div>
      </div>

      {/* Contribution graph */}
      <div className="mx-5 mt-3.5 bg-white rounded-3xl p-4 border border-[#E7D3A8]/60 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider">Practice Activity</p>
          <p className="text-[#C5B9AE] text-[10px]">{totalSessions} session{totalSessions !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-1.5">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] justify-start pt-0.5">
            {dayLabels.map((d, i) => (
              <div key={i} className="h-[10px] w-3 flex items-center justify-center">
                <span className="text-[7px] text-[#C5B9AE] font-bold leading-none">{i % 2 === 0 ? d : ""}</span>
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[3px] flex-1">
            {Array.from({ length: WEEKS }, (_, col) => (
              <div key={col} className="flex flex-col gap-[3px] flex-1">
                {grid.map((row, rowIdx) => {
                  const cell = row[col];
                  return (
                    <div key={rowIdx} className="rounded-[2px]" style={{ height: 10, background: cell ? cellColor(cell.count) : "#E7D3A8" }} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2.5 justify-end">
          <span className="text-[9px] text-[#C5B9AE]">Less</span>
          {[0, 1, 2, 3].map(n => (
            <div key={n} className="w-2.5 h-2.5 rounded-[2px]" style={{ background: cellColor(n) }} />
          ))}
          <span className="text-[9px] text-[#C5B9AE]">More</span>
        </div>
      </div>

      {/* Recent sessions */}
      {history.length > 0 && (
        <div className="mx-5 mt-3.5">
          <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2">Recent Sessions</p>
          <div className="flex flex-col gap-2">
            {[...history].reverse().slice(0, 3).map((h, i) => (
              <div key={i} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-[#E7D3A8]/60 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#A8CFA0]/20 flex items-center justify-center shrink-0">
                  <Check size={16} className="text-[#A8CFA0]" />
                </div>
                <p className="text-[#4B4032] text-xs font-medium flex-1 truncate">{h.feedback.slice(0, 50)}{h.feedback.length > 50 ? "…" : ""}</p>
                <span className="text-sm font-black text-[#A8CFA0] shrink-0">{Math.round((h.scores.accuracy + h.scores.confidence + h.scores.clarity) / 3)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Scores = { accuracy: number; confidence: number; clarity: number };
type Session = { scores: Scores; feedback: string; date?: string };
type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
type ResourceType = "text" | "image" | "pdf" | "url";
type Source = { id: string; type: ResourceType; label: string; content: string };
type Flashcard = { q: string; a: string };
type QuizItem = { question: string; choices: string[]; answer: number };
type OralMode = "read-aloud" | "paraphrase" | "quiz-bee" | "recitation";
type OralPhase = "select" | "setup" | "pick" | "practice" | "card-result" | "results";
type OralCard = { id: string; content: string; hint?: string };
type OralScore = { score: number; label: string; feedback: string; transcript: string };
type Notebook = {
  id: string;
  title: string;
  sources: Source[];
  chatMessages: ChatMessage[];
  flashcards: Flashcard[];
  quiz: QuizItem[];
  createdAt: string;
};

function offlineChat(message: string, lang: string): string {
  const msg = message.toLowerCase();
  const fil = lang === "FIL";

  // Greetings
  if (/hello|hi\b|kumusta|kamusta|hey|good morning|magandang/.test(msg))
    return fil
      ? "Kumusta! Offline mode kami ngayon pero nandito pa rin ako. Kaya kong mag-explain ng Math, Science, Filipino, History, at English kahit walang internet. Ano ang gusto mong pag-aralan?"
      : "Hello! I'm in offline mode but still here. I can explain Math, Science, Filipino, History, and English even without internet. What would you like to study?";

  if (/salamat|thank/.test(msg))
    return fil ? "Walang anuman! Kaya mo yan!" : "You're welcome! You've got this!";

  if (/motivat|encourage|pangamba|takot|nerbiyos|nervous|kaya ko ba/.test(msg))
    return fil
      ? "Kaya mo yan! Normal ang maging kinabahan — kahit ang pinakamagagaling na estudyante ay natatakot din. Ang laging sumusubok ang nagpapalakas ng kumpiyansa, hindi ang pagiging perpekto."
      : "You've got this! Feeling nervous is completely normal. What builds confidence is showing up repeatedly, not being perfect.";

  // ── MATHEMATICS ──────────────────────────────────────────────────────────
  if (/algebra|equation|variable|polynomial|factor|quadratic|linear equation|solve for|isolate x/.test(msg))
    return fil
      ? "Sa algebra, ang layunin ay hanapin ang value ng unknown variable. Para sa linear equation (hal. 2x + 3 = 7): ilipat ang constants sa isang side → 2x = 4 → x = 2. Para sa quadratic (ax² + bx + c = 0): gamitin ang quadratic formula x = (−b ± √(b²−4ac)) / 2a."
      : "In algebra, the goal is to find the unknown variable. For a linear equation (e.g. 2x + 3 = 7): move constants to one side → 2x = 4 → x = 2. For quadratics (ax² + bx + c = 0): use the quadratic formula x = (−b ± √(b²−4ac)) / 2a.";

  if (/geometry|area|perimeter|volume|circle|triangle|rectangle|pythagor|hypotenuse|polygon|angle/.test(msg))
    return fil
      ? "Mahahalagang formula sa Geometry — Area: rectangle = l×w, triangle = ½bh, circle = πr². Perimeter: rectangle = 2(l+w), circle = 2πr. Volume: prism = l×w×h, cylinder = πr²h. Pythagorean theorem: a² + b² = c² (para sa right triangle, c = hypotenuse)."
      : "Key Geometry formulas — Area: rectangle = l×w, triangle = ½bh, circle = πr². Perimeter: rectangle = 2(l+w), circle = 2πr. Volume: prism = l×w×h, cylinder = πr²h. Pythagorean theorem: a² + b² = c² (c = hypotenuse of a right triangle).";

  if (/trigon|sine|cosine|tangent|\bsin\b|\bcos\b|\btan\b|sohcahtoa|radian/.test(msg))
    return fil
      ? "Tandaan ang SOHCAHTOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. Special angles: sin 30°=½, cos 60°=½, tan 45°=1. I-convert degrees sa radians: i-multiply ng π/180."
      : "Remember SOHCAHTOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. Special angles: sin 30°=½, cos 60°=½, tan 45°=1. Convert degrees to radians: multiply by π/180.";

  if (/fraction|decimal|percent|ratio|proportion|numerator|denominator/.test(msg))
    return fil
      ? "Para mag-add/subtract ng fractions: kailangan ng common denominator. Para mag-multiply: i-multiply ang numerator at denominator nang direkta. Para mag-divide: i-flip ang pangalawang fraction (reciprocal) tapos i-multiply. Convert sa percent: i-multiply ng 100. Hal.: ¾ = 0.75 = 75%."
      : "To add/subtract fractions: find a common denominator. To multiply: multiply numerators and denominators directly. To divide: flip the second fraction (reciprocal) then multiply. Convert to percent: multiply by 100. E.g.: ¾ = 0.75 = 75%.";

  if (/statistic|probabilit|mean|median|mode|average|range|data/.test(msg))
    return fil
      ? "Sa statistics — Mean: kabuuan ÷ bilang ng data. Median: gitnang value kapag naayos na (odd) o average ng dalawang gitna (even). Mode: pinaka-madalas na value. Range: pinakamataas − pinakamababa. Probability = (favorable outcomes) ÷ (total outcomes)."
      : "Statistics — Mean: sum ÷ count. Median: middle value when sorted (odd) or average of two middle values (even). Mode: most frequent value. Range: highest − lowest. Probability = (favorable outcomes) ÷ (total outcomes).";

  if (/math|calculus|exponent|logarithm|function|slope|derivative|integer|prime number/.test(msg))
    return fil
      ? "Alin sa mga paksa ang gusto mong talakayin? Kaya kong mag-explain ng Algebra (equations), Geometry (shapes at formulas), Trigonometry (SOHCAHTOA), o Statistics (mean, median, mode, probability). Sabihin mo lang!"
      : "Which math topic would you like? I can explain Algebra (equations), Geometry (shapes and formulas), Trigonometry (SOHCAHTOA), or Statistics (mean, median, mode, probability). Just say which one!";

  // ── SCIENCE – BIOLOGY ────────────────────────────────────────────────────
  if (/\bcell\b|nucleus|membrane|mitochondria|organelle|prokaryote|eukaryote|ribosome/.test(msg))
    return fil
      ? "Ang cell ay pinakamaliit na yunit ng buhay. Plant cells ay may cell wall, chloroplast, at central vacuole — wala ito sa animal cells. Ang mitochondria ang 'powerhouse' na gumagawa ng ATP. Ang nucleus ang nagtatago ng DNA at nagko-control ng lahat ng cell functions."
      : "The cell is the smallest unit of life. Plant cells have a cell wall, chloroplasts, and a large central vacuole — animal cells do not. Mitochondria is the 'powerhouse' producing ATP energy. The nucleus stores DNA and controls all cell functions.";

  if (/photosynthesis|chlorophyll|chloroplast|glucose|respiration|atp/.test(msg))
    return fil
      ? "Photosynthesis (sa chloroplast): 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Gumagamit ang plants ng sunlight para gumawa ng glucose. Cellular Respiration (sa mitochondria): C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP energy. Ito ang kabaligtaran ng photosynthesis."
      : "Photosynthesis (in chloroplasts): 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Plants use sunlight to make glucose. Cellular Respiration (in mitochondria): C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP. This is the reverse of photosynthesis.";

  if (/genetic|heredity|dominant|recessive|allele|mendel|dna|rna|mutation|inherit|chromosome/.test(msg))
    return fil
      ? "Sa genetics ni Mendel: Dominant alleles (malaking letra, hal. A) ay nagtatago ng recessive (maliit, a). Sa Punnett square, Aa × Aa ay nagbibigay ng 3:1 ratio. Ang DNA ay double helix — A pairs sa T, C pairs sa G. Ang RNA naman ay single-stranded at ginagamit para gumawa ng proteins."
      : "Mendel's genetics: Dominant alleles (capital, e.g. A) mask recessive ones (lowercase, a). In a Punnett square, Aa × Aa gives a 3:1 ratio. DNA is a double helix — A pairs with T, C pairs with G. RNA is single-stranded and used to make proteins.";

  if (/ecosystem|food chain|food web|producer|consumer|decomposer|biome|ecology|population/.test(msg))
    return fil
      ? "Food chain: Producer (plants) → Primary consumer (herbivore) → Secondary consumer (carnivore) → Tertiary consumer. Sa bawat trophic level, ~10% lang ng energy ang nailipat (10% rule). Ang decomposers (bacteria, fungi) ay nagbabalik ng nutrients sa lupa para sa cycle na magtuloy."
      : "Food chain: Producer (plants) → Primary consumer (herbivore) → Secondary consumer (carnivore) → Tertiary consumer. At each trophic level, only ~10% of energy is transferred (10% rule). Decomposers (bacteria, fungi) return nutrients to the soil to continue the cycle.";

  // ── SCIENCE – CHEMISTRY ──────────────────────────────────────────────────
  if (/atom|element|periodic table|proton|neutron|electron|atomic number|valence|ion|isotope/.test(msg))
    return fil
      ? "Ang atom ay may 3 subatomic particles: proton (+, nasa nucleus), neutron (neutral, nasa nucleus), electron (−, sa shells). Atomic number = bilang ng protons. Mass number = protons + neutrons. Ang valence electrons (outermost shell) ang nagde-determine ng reactivity ng element."
      : "An atom has 3 subatomic particles: proton (+, in nucleus), neutron (neutral, in nucleus), electron (−, in shells). Atomic number = number of protons. Mass number = protons + neutrons. Valence electrons (outermost shell) determine an element's reactivity.";

  if (/chemical bond|ionic|covalent|acid|base|\bph\b|neutraliz|oxidation|reduction|reaction|compound|molecule/.test(msg))
    return fil
      ? "Chemical bonding: Ionic bonds ay nagaganap sa pagitan ng metal at non-metal (electron transfer). Covalent bonds ay sa dalawang non-metals (electron sharing). Acids: pH < 7, maraming H⁺. Bases: pH > 7, maraming OH⁻. Neutral = pH 7. Neutralization: acid + base → salt + water."
      : "Chemical bonding: Ionic bonds form between a metal and non-metal (electron transfer). Covalent bonds form between two non-metals (electron sharing). Acids: pH < 7, high H⁺. Bases: pH > 7, high OH⁻. Neutral = pH 7. Neutralization: acid + base → salt + water.";

  // ── SCIENCE – PHYSICS ────────────────────────────────────────────────────
  if (/newton|force|motion|velocity|acceleration|speed|momentum|inertia|friction|gravity|weight/.test(msg))
    return fil
      ? "Newton's 3 Laws: (1) Inertia — ang object ay nananatili sa rest o motion maliban kung may external force. (2) F = ma (Force = mass × acceleration). (3) Bawat action ay may equal at opposite na reaction. Weight = mass × 9.8 m/s². Velocity = displacement ÷ time."
      : "Newton's 3 Laws: (1) Inertia — an object stays at rest or in motion unless acted on by external force. (2) F = ma (Force = mass × acceleration). (3) Every action has an equal and opposite reaction. Weight = mass × 9.8 m/s². Velocity = displacement ÷ time.";

  if (/energy|work|power|kinetic|potential|joule|watt|wave|frequency|wavelength|sound|light|conservation/.test(msg))
    return fil
      ? "Work = Force × distance (Joules). Power = Work ÷ time (Watts). Kinetic Energy = ½mv². Potential Energy = mgh. Law of Conservation of Energy: ang energy ay hindi malilikha o masisirain — nagbabago lang ng form. Wave speed = frequency × wavelength."
      : "Work = Force × distance (Joules). Power = Work ÷ time (Watts). Kinetic Energy = ½mv². Potential Energy = mgh. Law of Conservation of Energy: energy cannot be created or destroyed — only converted. Wave speed = frequency × wavelength.";

  if (/electric|current|voltage|resistance|ohm|circuit|series|parallel|conductor|insulator/.test(msg))
    return fil
      ? "Ohm's Law: V = IR (Voltage = Current × Resistance). Series circuit: Rtotal = R₁ + R₂ + ... (same current sa lahat). Parallel circuit: 1/Rtotal = 1/R₁ + 1/R₂ + ... (same voltage sa bawat branch). Conductors (metal, copper) ay madaling dumaan ang kuryente; insulators (rubber, plastic) ay hindi."
      : "Ohm's Law: V = IR (Voltage = Current × Resistance). Series circuit: Rtotal = R₁ + R₂ + ... (same current throughout). Parallel circuit: 1/Rtotal = 1/R₁ + 1/R₂ + ... (same voltage per branch). Conductors (metal, copper) allow electricity to flow; insulators (rubber, plastic) do not.";

  if (/earth science|volcano|earthquake|plate tectonic|rock|mineral|water cycle|weather|climate|solar system|planet/.test(msg))
    return fil
      ? "Ang Earth ay may 4 layers: crust, mantle, outer core (liquid), inner core (solid). Plate tectonics ang nagpapaliwanag ng earthquakes at volcanoes. Water cycle: evaporation → condensation → precipitation → collection. Solar system: 8 planets — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
      : "Earth has 4 layers: crust, mantle, outer core (liquid), inner core (solid). Plate tectonics explains earthquakes and volcanoes. Water cycle: evaporation → condensation → precipitation → collection. Solar system: 8 planets — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.";

  if (/science|biology|chemistry|physics|scientific method|hypothesis|experiment/.test(msg))
    return fil
      ? "Scientific Method: (1) Obserbahan ang problema, (2) Gumawa ng hypothesis, (3) Mag-eksperimento (kontrolin ang variables), (4) I-analyze ang data, (5) Gumawa ng conclusion. Alin ang gusto mong talakayin — Biology, Chemistry, o Physics?"
      : "Scientific Method: (1) Observe a problem, (2) Form a hypothesis, (3) Experiment (control variables), (4) Analyze data, (5) Draw a conclusion. Which would you like — Biology, Chemistry, or Physics?";

  // ── HISTORY / ARALING PANLIPUNAN ─────────────────────────────────────────
  if (/rizal|noli|fili|bonifacio|katipunan|aguinaldo|edsa|marcos|aquino|philippine history|kasaysayan|revolution|kalayaan/.test(msg))
    return fil
      ? "Mahahalagang events sa kasaysayan ng Pilipinas: Si Rizal ay sumulat ng Noli Me Tangere at El Filibusterismo bilang kritika sa kolonyalismo. Itinatag ni Andres Bonifacio ang Katipunan noong 1892. Ang kalayaan ay idineklara noong Hunyo 12, 1898. Ang EDSA Revolution (1986) ay nagwakas sa diktadura ni Marcos."
      : "Key Philippine history: Rizal wrote Noli Me Tangere and El Filibusterismo to critique colonialism. Andres Bonifacio founded the Katipunan in 1892. Independence was declared on June 12, 1898. The EDSA Revolution (1986) ended the Marcos dictatorship.";

  // ── ENGLISH / FILIPINO GRAMMAR ───────────────────────────────────────────
  if (/grammar|pangngalan|pandiwa|pang-uri|pang-abay|noun|verb|adjective|adverb|pronoun|sentence|essay|paragraph/.test(msg))
    return fil
      ? "Parts of speech: Pangngalan/Noun (tao, lugar, bagay), Pandiwa/Verb (kilos o estado), Pang-uri/Adjective (naglalarawan ng noun), Pang-abay/Adverb (nagpapaliwanag ng verb). Key rule sa English: subject-verb agreement — singular subject = singular verb (She runs), plural = plural (They run)."
      : "Parts of speech: Noun (person, place, thing, idea), Verb (action or state), Adjective (describes a noun), Adverb (modifies a verb). Key rule: subject-verb agreement — singular subject needs singular verb (She runs), plural subject needs plural verb (They run).";

  // ── STUDY HELP ───────────────────────────────────────────────────────────
  if (/memorize|memorya|tandain|study tip|paano mag-aral/.test(msg))
    return fil
      ? "Pinaka-epektibong study techniques: (1) Active recall — subukan mong isulat ang natutunan nang walang tinitingnan. (2) Spaced repetition — mag-review ulit pagkatapos ng 1 araw, 3 araw, 1 linggo. (3) Feynman technique — ipaliwanag ang konsepto sa simpleng salita parang nagtuturo ka. (4) Practice testing — gumawa ng sariling quiz."
      : "Most effective study techniques: (1) Active recall — write what you learned without looking. (2) Spaced repetition — review after 1 day, 3 days, 1 week. (3) Feynman technique — explain the concept in simple words as if teaching. (4) Practice testing — make your own quiz.";

  if (/practice|pagsasanay|recite|recitation/.test(msg))
    return fil
      ? "Gamitin ang Recitation tab para sa structured practice. Mayroon itong 4 na levels: Read-Aloud (+10 XP), Paraphrase (+20 XP), Cold Call (+35 XP), at Stand & Deliver (+50 XP). I-scan ang iyong module tapos piliin ang mode."
      : "Use the Recitation tab for structured practice. It has 4 levels: Read-Aloud (+10 XP), Paraphrase (+20 XP), Cold Call (+35 XP), and Stand & Deliver (+50 XP). Scan your module then choose a mode.";

  if (/help|tulong|confused|nalito|hindi ko maintindihan|di ko gets/.test(msg))
    return fil
      ? "Nandito ako para tumulong! Sa offline mode, kaya kong mag-explain ng Math (Algebra, Geometry, Trigonometry, Statistics), Science (Biology, Chemistry, Physics, Earth Science), Philippine History, at Grammar. Sabihin mo ang paksa!"
      : "I'm here to help! In offline mode I can explain Math (Algebra, Geometry, Trig, Stats), Science (Biology, Chemistry, Physics, Earth Science), Philippine History, and Grammar. Just tell me the topic!";

  // Default
  return fil
    ? "Nasa offline mode kami ngayon. Kaya kong mag-explain ng Math, Science (Biology, Chemistry, Physics), Philippine History, at Grammar kahit walang internet. Subukan mong i-type ang paksa — hal. 'Ipaliwanag ang photosynthesis' o 'Ano ang quadratic formula?'"
    : "I'm in offline mode right now. I can still explain Math, Science (Biology, Chemistry, Physics), Philippine History, and Grammar without internet. Try typing your topic — e.g. 'Explain photosynthesis' or 'What is the quadratic formula?'";
}

function PracticeScreen({
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
  const [showChoice, setShowChoice] = useState(!preloadedText);
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
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError("Camera access denied");
    }
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
        setExtractedText(text);
        setParagraphs(paras.length ? paras : [text]);
        stopCamera();
        setShowChoice(false);
        setStep(1);
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
    setScanning(true);
    setError("");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
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
      setExtractedText(text);
      setParagraphs(paras.length ? paras : [text]);
      stopCamera();
      setStep(1);
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
          <p className="text-[#7A736B] text-xs text-center">
            How do you want to scan your module?
          </p>
          <button
            onClick={() => {
              setShowChoice(false);
              setTimeout(() => startCamera(), 50);
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
            onClick={startCamera}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-4 border-[#E7D3A8] flex items-center justify-center">
              <Camera size={26} className="text-[#4B4032]" />
            </div>
          </button>
          <button
            onClick={captureAndScan}
            disabled={scanning}
            className="w-14 h-14 rounded-2xl bg-[#D6B15E] disabled:opacity-40 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <ScanLine size={18} className="text-white" />
            <span className="text-white/80 text-[9px] font-semibold">Scan</span>
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

function ProgressScreen({ history }: { history: Session[] }) {
  const avg = history.length
    ? Math.round(
        history.reduce(
          (s, h) =>
            s +
            (h.scores.accuracy + h.scores.confidence + h.scores.clarity) / 3,
          0,
        ) / history.length,
      )
    : 0;
  const conf = history.length
    ? Math.round(
        history.reduce((s, h) => s + h.scores.confidence, 0) / history.length,
      )
    : 0;
  const acc = history.length
    ? Math.round(
        history.reduce((s, h) => s + h.scores.accuracy, 0) / history.length,
      )
    : 0;
  const clar = history.length
    ? Math.round(
        history.reduce((s, h) => s + h.scores.clarity, 0) / history.length,
      )
    : 0;
  return (
    <div
      className="h-full overflow-y-auto pb-4 bg-[#FFF9EE]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="px-5 pt-3">
        <h2
          className="text-[#4B4032] font-black text-xl"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Progress
        </h2>
        <p className="text-[#7A736B] text-xs">Your recitation journey</p>
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
        <p className="text-[#4B4032] font-bold text-sm mb-3">
          Points This Week
        </p>
        <ResponsiveContainer width="100%" height={88}>
          <BarChart data={weeklyPoints} barSize={22}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#7A736B", fontWeight: 600 }}
            />
            <Bar dataKey="pts" radius={[6, 6, 0, 0]}>
              {weeklyPoints.map((_, i) => (
                <Cell key={i} fill={i === 3 ? "#D6B15E" : "#E7D3A8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-[#E7D3A8]/60 shadow-sm">
        <p className="text-[#4B4032] font-bold text-sm mb-4">Overall</p>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg
              viewBox="0 0 96 96"
              className="w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="48"
                cy="48"
                r="38"
                fill="none"
                stroke="#E7D3A8"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                fill="none"
                stroke="#D6B15E"
                strokeWidth="8"
                strokeDasharray={`${(avg / 100) * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#4B4032]">{avg}%</span>
              <span className="text-[9px] text-[#7A736B] font-bold uppercase">
                Avg
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2.5">
            {[
              { l: "Sessions", v: String(history.length) },
              { l: "Avg score", v: `${avg}%` },
            ].map((s) => (
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
            <AreaChart
              data={history.map((h, i) => ({
                s: `S${i + 1}`,
                score: Math.round(
                  (h.scores.accuracy + h.scores.confidence + h.scores.clarity) /
                    3,
                ),
              }))}
            >
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D6B15E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D6B15E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="s"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#7A736B" }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#FFF9EE",
                  border: "1px solid #E7D3A8",
                  borderRadius: 12,
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#D6B15E"
                strokeWidth={2.5}
                fill="url(#cg)"
                dot={{ r: 3.5, fill: "#D6B15E", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mx-5 mt-4">
        <p className="text-[#4B4032] font-bold text-sm mb-3">Achievements</p>
        <div className="flex flex-col gap-2.5">
          {[
            {
              name: "First Session",
              desc: "Complete your first recitation",
              Icon: Star,
              earned: history.length >= 1,
            },
            {
              name: "Study Buddy",
              desc: "Complete 5 sessions",
              Icon: BookOpen,
              earned: history.length >= 5,
            },
            {
              name: "High Scorer",
              desc: "Score 80%+ overall",
              Icon: Award,
              earned: avg >= 80,
            },
          ].map((a) => (
            <div
              key={a.name}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border ${a.earned ? "bg-white border-[#E7D3A8]/60" : "bg-[#F5F5F0] border-[#E7D3A8]/25 opacity-55"}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F4E3B2] flex items-center justify-center shrink-0">
                <a.Icon size={22} className="text-[#D6B15E]" />
              </div>
              <div className="flex-1">
                <p className="text-[#4B4032] font-bold text-sm">{a.name}</p>
                <p className="text-[#7A736B] text-xs">{a.desc}</p>
              </div>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.earned ? "bg-[#A8CFA0]" : "bg-[#E7D3A8]"}`}
              >
                {a.earned ? (
                  <Check size={13} className="text-white" strokeWidth={3} />
                ) : (
                  <Target size={13} className="text-[#7A736B]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SessionsScreen({ history }: { history: Session[] }) {
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

function ChatScreen({
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
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          text: isFil
            ? "Kumusta! Ako si Dunong, ang iyong AI study companion. Maaari kang magtanong tungkol sa anumang paksa — Science, Math, Filipino, History, at iba pa. Nandito ako para tumulong!"
            : "Hello! I'm Dunong, your AI study companion. You can ask me about any subject — Science, Math, Filipino, History, and more. I'm here to help!",
        },
      ]);
    }
  }, []);

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
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
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

function RecitationScreen({
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

function LibraryScreen({
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
                    <Play size={12} className="text-white translate-x-0.5" />
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

function ProfileScreen({
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
      <div className="mx-5 mt-4">
        <p className="text-[#7A736B] text-[10px] font-bold uppercase tracking-wider mb-2.5">
          Preferences
        </p>
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E7D3A8]/60 shadow-sm">
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
      <div className="mx-5 mt-4">
        <div className="bg-[#F4E3B2] rounded-2xl p-4 flex items-center gap-3 border border-[#E7D3A8]">
          <Download size={17} className="text-[#D6B15E] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[#4B4032] font-bold text-sm">
              Powered by Groq AI
            </p>
            <p className="text-[#7A736B] text-xs">
              Free tier · Always available
            </p>
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
  const [practiceKey, setPracticeKey] = useState(0);
  const [userName, setUserName] = useState("Learner");
  const [lang, setLang] = useState("FIL");
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<Session[]>([]);
  const [practiceDefaultMode, setPracticeDefaultMode] = useState("Paraphrase");
  const [practicePreloadedText, setPracticePreloadedText] = useState<string | undefined>(undefined);
  const [practiceReturnTab, setPracticeReturnTab] = useState<string>("home");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  useEffect(() => {
    checkHealth().then(ok => {
      if (ok) console.log("✅ Successfully connected to the Dunong backend API.");
      else console.error("❌ Failed to connect to the backend API.");
    });
  }, []);

  const handleDone = useCallback((scores: Scores, feedback: string) => {
    const earned = Math.round(
      (scores.accuracy + scores.confidence + scores.clarity) / 3,
    );
    setPoints((p) => p + earned);
    setStreak((s) => s + 1);
    setHistory((h) => [...h, { scores, feedback, date: new Date().toISOString().slice(0, 10) }]);
  }, []);

  const handleScanPress = useCallback((mode?: string) => {
    if (mode) setPracticeDefaultMode(mode);
    setPracticePreloadedText(undefined);
    setPracticeReturnTab("home");
    setActiveTab("practice");
    setPracticeKey((k) => k + 1);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, #2C2416 0%, #1A1209 60%, #0D0A04 100%)",
      }}
    >
      <div
        className="relative flex flex-col bg-[#FFF9EE]"
        style={{
          width: 370,
          height: 800,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), 0 0 0 10px #1A1209, inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
          style={{
            width: 120,
            height: 28,
            background: "#1A1209",
            borderRadius: "0 0 20px 20px",
          }}
        />
        <div className="flex-shrink-0 pt-7 z-20">
          <StatusBar />
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {showLanding ? (
            <LandingScreen
              onStart={() => {
                setShowLanding(false);
                setShowOnboarding(true);
              }}
            />
          ) : showOnboarding ? (
            <OnboardingScreen
              onDone={() => setShowOnboarding(false)}
              lang={lang}
              setLang={setLang}
            />
          ) : (
            <>
              <div className="flex-1 overflow-hidden min-h-0">
                {activeTab === "home" && (
                  <HomeScreen
                    onPractice={handleScanPress}
                    onProfile={() => setActiveTab("profile")}
                    onLibrary={() => setActiveTab("library")}
                    userName={userName}
                    points={points}
                    notebookCount={notebooks.length}
                    history={history}
                  />
                )}
                {activeTab === "practice" && (
                  <PracticeScreen
                    key={practiceKey}
                    onDone={handleDone}
                    lang={lang}
                    onBack={() => setActiveTab(practiceReturnTab)}
                    defaultMode={practiceDefaultMode}
                    preloadedText={practicePreloadedText}
                  />
                )}
                {activeTab === "chat" && (
                  <ChatScreen
                    lang={lang}
                    messages={chatMessages}
                    setMessages={setChatMessages}
                  />
                )}
                {activeTab === "recitation" && (
                  <RecitationScreen
                    onStartMode={handleScanPress}
                    history={history}
                    lang={lang}
                  />
                )}
                {activeTab === "library" && (
                  <LibraryScreen
                    notebooks={notebooks}
                    setNotebooks={setNotebooks}
                    lang={lang}
                    onPractice={(mode, text) => {
                      setPracticeDefaultMode(mode);
                      setPracticePreloadedText(text);
                      setPracticeReturnTab("library");
                      setPracticeKey((k) => k + 1);
                      setActiveTab("practice");
                    }}
                  />
                )}
                {activeTab === "profile" && (
                  <ProfileScreen
                    userName={userName}
                    streak={streak}
                    points={points}
                    sessions={history.length}
                    lang={lang}
                    setLang={setLang}
                    setUserName={setUserName}
                  />
                )}
              </div>
              <BottomNav
                active={activeTab}
                onChange={setActiveTab}
                onScanPress={handleScanPress}
              />
            </>
          )}
        </div>
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-28 h-1 rounded-full"
          style={{ background: "rgba(75,64,50,0.25)" }}
        />
      </div>
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/20 text-xs font-bold tracking-widest uppercase">
        Dunong · AI Recitation Coach
      </p>
    </div>
  );
}
