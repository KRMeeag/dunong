import React from "react";

export default function StatusBar() {
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
