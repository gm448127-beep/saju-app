"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

interface BirthDateNumberInputsProps {
  year: string;
  month: string;
  day: string;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
}

const inputClass =
  "min-h-11 w-full rounded-xl border-2 border-[#D9C8C0] bg-white px-3 py-2.5 text-center text-base font-semibold text-[#3D3338] outline-none transition-colors focus:border-[#8B6F47]";

const CURRENT_YEAR = new Date().getFullYear();

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function focusField(el: HTMLInputElement | null) {
  if (!el) return;
  requestAnimationFrame(() => {
    el.focus();
    el.select();
  });
}

/** 붙여넣기: 19950817 → 년·월·일 분리 */
function splitPastedDate(text: string) {
  const digits = text.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return {
    year: digits.slice(0, 4),
    month: digits.slice(4, 6),
    day: digits.length >= 8 ? digits.slice(6, 8) : "",
  };
}

export function isValidBirthDate(year: string, month: string, day: string) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (!year || !month || !day) return false;
  if (y < 1900 || y > CURRENT_YEAR) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export default function BirthDateNumberInputs({
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
}: BirthDateNumberInputsProps) {
  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  const applyPastedDate = (raw: string) => {
    const parts = splitPastedDate(raw);
    if (!parts) return false;

    onYearChange(parts.year);
    onMonthChange(parts.month.replace(/^0+/, "") || parts.month);
    if (parts.day) {
      onDayChange(parts.day.replace(/^0+/, "") || parts.day);
      focusField(dayRef.current);
    } else {
      onDayChange("");
      focusField(monthRef.current);
    }
    return true;
  };

  const handleYearChange = (raw: string) => {
    const next = onlyDigits(raw, 4);
    onYearChange(next);
    if (next.length === 4) focusField(monthRef.current);
  };

  const handleMonthChange = (raw: string) => {
    const next = onlyDigits(raw, 2);
    onMonthChange(next);

    if (next.length === 2) {
      focusField(dayRef.current);
      return;
    }

    // 2~9월: 한 자리만 입력해도 일로 이동
    if (next.length === 1) {
      const n = Number(next);
      if (n >= 2 && n <= 9) focusField(dayRef.current);
    }
  };

  const handleDayChange = (raw: string) => {
    const next = onlyDigits(raw, 2);
    onDayChange(next);

    // 4~9일: 한 자리 입력 후 키패드 닫기 유도
    if (next.length === 1) {
      const n = Number(next);
      if (n >= 4 && n <= 9) dayRef.current?.blur();
    } else if (next.length === 2) {
      dayRef.current?.blur();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    if (applyPastedDate(pasted)) event.preventDefault();
  };

  const handleMonthKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && month === "") {
      event.preventDefault();
      focusField(yearRef.current);
    }
  };

  const handleDayKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && day === "") {
      event.preventDefault();
      focusField(monthRef.current);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2">
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]" style={{ fontFamily: "Jua, sans-serif" }}>
            출생년도
          </label>
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="bday-year"
            enterKeyHint="next"
            maxLength={4}
            min={1900}
            max={CURRENT_YEAR}
            placeholder="1995"
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            onPaste={handlePaste}
            className={inputClass}
            aria-label="출생년도 4자리"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]" style={{ fontFamily: "Jua, sans-serif" }}>
            월
          </label>
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="bday-month"
            enterKeyHint="next"
            maxLength={2}
            min={1}
            max={12}
            placeholder="8"
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            onKeyDown={handleMonthKeyDown}
            onPaste={handlePaste}
            className={inputClass}
            aria-label="출생월"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]" style={{ fontFamily: "Jua, sans-serif" }}>
            일
          </label>
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="bday-day"
            enterKeyHint="done"
            maxLength={2}
            min={1}
            max={31}
            placeholder="17"
            value={day}
            onChange={(e) => handleDayChange(e.target.value)}
            onKeyDown={handleDayKeyDown}
            onPaste={handlePaste}
            className={inputClass}
            aria-label="출생일"
          />
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#8A7E78]">
        숫자 키패드로 입력 · 년도 4자리 후 월·일로 자동 이동 (예: 19950817 붙여넣기 가능)
      </p>
    </div>
  );
}
