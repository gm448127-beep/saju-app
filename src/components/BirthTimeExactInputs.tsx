"use client";

import { useRef, type KeyboardEvent } from "react";

const defaultInputClass =
  "min-h-11 w-full rounded-xl border-2 border-[#D9C8C0] bg-white px-3 py-2.5 text-center text-base font-semibold text-[#3D3338] outline-none transition-colors focus:border-[#8B6F47]";

const errorInputClass = "border-red-400 focus:border-red-500";

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

/** 시(0~23) 범위 오류 — 빈 값이면 null */
export function getBirthHourError(hour: string): string | null {
  if (!hour) return null;
  const n = Number(hour);
  if (Number.isNaN(n) || n < 0 || n > 23) {
    return "시는 0~23 사이로 입력해 주세요.";
  }
  return null;
}

/** 분(0~59) 범위 오류 — 빈 값이면 null */
export function getBirthMinuteError(minute: string): string | null {
  if (!minute) return null;
  const n = Number(minute);
  if (Number.isNaN(n) || n < 0 || n > 59) {
    return "분은 0~59 사이로 입력해 주세요.";
  }
  return null;
}

export function isValidBirthTimeExact(hour: string, minute: string): boolean {
  if (!hour || !minute) return false;
  return getBirthHourError(hour) === null && getBirthMinuteError(minute) === null;
}

export function parseBirthHourValue(hour: string): number | undefined {
  if (!hour || getBirthHourError(hour)) return undefined;
  return Number(hour);
}

export function parseBirthMinuteValue(minute: string): number | undefined {
  if (!minute || getBirthMinuteError(minute)) return undefined;
  return Number(minute);
}

/** 시·분 문자열 → API용 숫자 (유효하지 않으면 undefined) */
export function parseBirthTimeExact(hour: string, minute: string): { hour: number; minute: number } | undefined {
  if (!isValidBirthTimeExact(hour, minute)) return undefined;
  return { hour: Number(hour), minute: Number(minute) };
}

type BirthTimeExactInputsProps = {
  hour: string;
  minute: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showHint?: boolean;
};

/** 출생 시·분 — 숫자 직접 입력 (0~23시, 0~59분) */
export default function BirthTimeExactInputs({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  disabled = false,
  className = "",
  inputClassName = defaultInputClass,
  showHint = true,
}: BirthTimeExactInputsProps) {
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  const hourError = getBirthHourError(hour);
  const minuteError = getBirthMinuteError(minute);

  const handleHourChange = (raw: string) => {
    const next = onlyDigits(raw, 2);
    onHourChange(next);
    if (next.length === 2 && !getBirthHourError(next)) {
      focusField(minuteRef.current);
    }
  };

  const handleMinuteChange = (raw: string) => {
    const next = onlyDigits(raw, 2);
    onMinuteChange(next);
    if (next.length === 2 && !getBirthMinuteError(next)) {
      minuteRef.current?.blur();
    }
  };

  const handleMinuteKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && minute === "") {
      event.preventDefault();
      focusField(hourRef.current);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]">시</label>
          <input
            ref={hourRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="next"
            maxLength={2}
            placeholder="9"
            value={hour}
            disabled={disabled}
            onChange={(e) => handleHourChange(e.target.value)}
            className={`${inputClassName}${hourError ? ` ${errorInputClass}` : ""}`}
            aria-label="출생 시 0부터 23까지"
            aria-invalid={hourError ? true : undefined}
            aria-describedby={hourError ? "birth-hour-error" : undefined}
          />
          {hourError ? (
            <p id="birth-hour-error" className="mt-1 text-xs text-red-600" role="alert">
              {hourError}
            </p>
          ) : null}
        </div>
        <span className="pt-8 text-[#A09488] font-bold">:</span>
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]">분</label>
          <input
            ref={minuteRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="done"
            maxLength={2}
            placeholder="0"
            value={minute}
            disabled={disabled}
            onChange={(e) => handleMinuteChange(e.target.value)}
            onKeyDown={handleMinuteKeyDown}
            className={`${inputClassName}${minuteError ? ` ${errorInputClass}` : ""}`}
            aria-label="출생 분 0부터 59까지"
            aria-invalid={minuteError ? true : undefined}
            aria-describedby={minuteError ? "birth-minute-error" : undefined}
          />
          {minuteError ? (
            <p id="birth-minute-error" className="mt-1 text-xs text-red-600" role="alert">
              {minuteError}
            </p>
          ) : null}
        </div>
      </div>
      {showHint ? (
        <p className="mt-2 text-xs leading-relaxed text-[#8A7E78]">
          숫자만 입력 · 시 0~23, 분 0~59
        </p>
      ) : null}
    </div>
  );
}
