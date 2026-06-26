import React from "react";
import { Home, MessageCircle, Library, User, ScanLine } from "lucide-react";

export default function BottomNav({
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
        onClick={() => onScanPress()}
        className="absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#D6B15E] border-4 border-[#FFF9EE] flex items-center justify-center shadow-xl shadow-[#D6B15E]/40 active:scale-95 transition-transform z-10"
        style={{ top: 0 }}
      >
        <ScanLine size={22} className="text-white" />
      </button>
    </div>
  );
}
