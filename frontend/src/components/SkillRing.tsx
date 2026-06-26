import React from "react";

export default function SkillRing({
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
