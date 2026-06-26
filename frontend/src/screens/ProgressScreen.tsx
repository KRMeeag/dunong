import React from "react";
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
import { Star, BookOpen, Award, Check, Target } from "lucide-react";
import SkillRing from "../components/SkillRing";
import { Session } from "../types";
import { weeklyPoints } from "../constants";

export default function ProgressScreen({ history }: { history: Session[] }) {
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
