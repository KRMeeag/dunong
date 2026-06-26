import React, { useState } from "react";
import { Check } from "lucide-react";

export default function OnboardingScreen({
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
