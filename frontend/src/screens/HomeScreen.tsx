import React from "react";
import { Bell, Library, Play, Check } from "lucide-react";
import { Session } from "../types";

export default function HomeScreen({
  onPractice,
  onProfile,
  onLibrary,
  userName,
  points,
  notebookCount,
  history,
  lang,
}: {
  onPractice: (mode?: string) => void;
  onProfile: () => void;
  onLibrary: () => void;
  userName: string;
  points: number;
  notebookCount: number;
  history: Session[];
  lang: string;
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
          <p className="text-xs text-[#7A736B] font-medium">{lang === "FIL" ? "Magandang araw," : "Good day,"}</p>
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
