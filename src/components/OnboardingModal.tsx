"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BirthDateNumberInputs, { isValidBirthDate } from "@/components/BirthDateNumberInputs";
import type { UserBirthProfile } from "@/lib/user-profile-storage";

const TIME_SLOTS = [
  { value: 23, label: "?��??" },
  { value: 1, label: "�?�??" },
  { value: 3, label: "?��??" },
  { value: 5, label: "�?�??" },
  { value: 7, label: "�?�??" },
  { value: 9, label: "?��??" },
  { value: 11, label: "?��??" },
  { value: 13, label: "미�??" },
  { value: 15, label: "?��??" },
  { value: 17, label: "?��??" },
  { value: 19, label: "?��??" },
  { value: 21, label: "?��??" },
];

interface OnboardingModalProps {
  open: boolean;
  onComplete: (profile: Omit<UserBirthProfile, "savedAt">) => void;
  onClose: () => void;
}

export default function OnboardingModal({ open, onComplete, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<"?? | "??>("??);
  const [timeMode, setTimeMode] = useState<"none" | "slot" | "exact">("slot");
  const [slotHour, setSlotHour] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidBirthDate(year, month, day)) {
      setError("?��????일???��?��???�??????력?�주?��??.");
      return;
    }

    onComplete({
      name: name.trim() || undefined,
      year,
      month,
      day,
      gender,
      calendarType: "solar",
      timeMode,
      slotHour,
      exactHour,
      exactMinute,
    });
    router.push("/today");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2F282B]/55 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-[#E2D7D0] bg-[#FFFDF8] shadow-[0_24px_64px_rgba(47,40,43,0.28)] sm:rounded-[28px]"
      >
        <div className="border-b border-[#E8D7C4] px-5 py-5 sm:px-6">
          <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">STEP 1 · ??�?�?</p>
          <h2
            id="onboarding-title"
            className="mt-2 text-2xl text-[#2F282B] sm:text-3xl"
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            ??결�? ??�????기
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">
            ?��????일·??�?????�?�? ??력??면 ??·�?�??�?�?�·�?�주·�?�?�이 모�?� �?춤?��? ?��?��?�????
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#8B6F47]">?��? (?��?�)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="?�길??
              className="w-full rounded-2xl border-2 border-[#E2D7D0] bg-white px-4 py-3 text-sm text-[#3D3338] outline-none focus:border-[#8B6F47]"
            />
          </div>

          <BirthDateNumberInputs
            year={year}
            month={month}
            day={day}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onDayChange={setDay}
          />

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#8B6F47]">�?�?�??�?</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["slot", "??�??? ?��?�"],
                  ["exact", "??·�? ??력"],
                  ["none", "??�? 모�?"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimeMode(mode)}
                  className={`rounded-2xl border py-2.5 text-xs font-semibold transition ${
                    timeMode === mode
                      ? "border-[#8B6F47] bg-[#FFF8EE] text-[#2F282B]"
                      : "border-[#E2D7D0] bg-white text-[#8A7E78]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {timeMode === "slot" && (
              <select
                value={slotHour}
                onChange={(e) => setSlotHour(Number(e.target.value))}
                className="mt-3 w-full rounded-2xl border-2 border-[#E2D7D0] bg-white px-4 py-3 text-sm outline-none focus:border-[#8B6F47]"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            )}
            {timeMode === "exact" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  value={exactHour}
                  onChange={(e) => setExactHour(Number(e.target.value))}
                  className="rounded-2xl border-2 border-[#E2D7D0] bg-white px-3 py-3 text-sm"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}??                    </option>
                  ))}
                </select>
                <select
                  value={exactMinute}
                  onChange={(e) => setExactMinute(Number(e.target.value))}
                  className="rounded-2xl border-2 border-[#E2D7D0] bg-white px-3 py-3 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, "0")}�?                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#8B6F47]">?��?</label>
            <div className="grid grid-cols-2 gap-2">
              {(["??, "??] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  className={`rounded-2xl border py-3 text-sm font-bold transition ${
                    gender === value
                      ? "border-[#8B6F47] bg-[#FFF8EE] text-[#2F282B]"
                      : "border-[#E2D7D0] bg-white text-[#8A7E78]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#7B7355] py-4 text-lg font-bold text-white transition hover:brightness-110"
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            ??결�? ??�????기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-xs text-[#8A7E78] underline"
          >
            ??�?????력??기
          </button>
        </form>
      </div>
    </div>
  );
}
