"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BIRTH_TIME_SLOTS } from "@/lib/birth-time-slots";
import {
  fetchTodayOneLiner,
  isValidLandingBirthDate,
  type TodayOneLiner,
} from "@/lib/landing-today-api";
import {
  getStoredLandingBirth,
  hasUsedLandingPreview,
  normalizeStoredLandingBirth,
  saveStoredLandingBirth,
  saveStoredLandingPreview,
  type StoredLandingBirth,
} from "@/lib/landing-preview-storage";
import type { BirthTimeMode, CalendarType } from "@/lib/user-profile-storage";
import {
  getUserProfile,
  landingPreviewToProfile,
  saveUserProfile,
} from "@/lib/user-profile-storage";

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

const CALENDAR_OPTIONS = [
  ["solar", "양력"],
  ["lunar", "음력"],
  ["lunarLeap", "윤달"],
] as const satisfies ReadonlyArray<readonly [CalendarType, string]>;

function birthSnapshot(
  year: string,
  month: string,
  day: string,
  gender: "남" | "여",
  calendarType: CalendarType,
  timeMode: BirthTimeMode,
  slotHour: number,
): StoredLandingBirth {
  return normalizeStoredLandingBirth({ year, month, day, gender, calendarType, timeMode, slotHour });
}

type LandingBirthPreviewProps = {
  /** form: 입력만 저장 · preview: 한 줄 미리보기 API */
  mode?: "form" | "preview";
};

export function LandingBirthPreview({ mode = "form" }: LandingBirthPreviewProps) {
  const hintId = useId();
  const isFormMode = mode === "form";
  const storedOnMount = useRef(normalizeStoredLandingBirth(getStoredLandingBirth() ?? {}));
  const [year, setYear] = useState(storedOnMount.current.year ?? "");
  const [month, setMonth] = useState(storedOnMount.current.month ?? "");
  const [day, setDay] = useState(storedOnMount.current.day ?? "");
  const [gender, setGender] = useState<"남" | "여">(storedOnMount.current.gender ?? "여");
  const [calendarType, setCalendarType] = useState<CalendarType>(
    storedOnMount.current.calendarType ?? "solar",
  );
  const [timeMode, setTimeMode] = useState<BirthTimeMode>(storedOnMount.current.timeMode ?? "slot");
  const [slotHour, setSlotHour] = useState(storedOnMount.current.slotHour ?? 9);
  const [locked, setLocked] = useState(() => !isFormMode && hasUsedLandingPreview());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TodayOneLiner | null>(() => {
    if (isFormMode) return null;
    const stored = storedOnMount.current;
    if (!stored?.sentence) return null;
    return {
      sentence: stored.sentence,
      toneLabel: stored.toneLabel || "오늘의 결",
    };
  });
  const requestId = useRef(0);

  const birthValid = isValidLandingBirthDate(year, month, day);

  useEffect(() => {
    if (!birthValid) return;
    saveStoredLandingBirth(birthSnapshot(year, month, day, gender, calendarType, timeMode, slotHour));
  }, [birthValid, year, month, day, gender, calendarType, timeMode, slotHour]);

  useEffect(() => {
    if (isFormMode || locked) return;

    if (!birthValid) {
      setResult(null);
      setError("");
      return;
    }

    const birth = birthSnapshot(year, month, day, gender, calendarType, timeMode, slotHour);

    const timer = window.setTimeout(async () => {
      const currentId = ++requestId.current;
      setLoading(true);
      setError("");

      try {
        const next = await fetchTodayOneLiner(birth);
        if (currentId !== requestId.current) return;

        saveStoredLandingPreview({
          ...birth,
          sentence: next.sentence,
          toneLabel: next.toneLabel,
        });
        const existing = getUserProfile();
        if (!existing) {
          saveUserProfile(landingPreviewToProfile(birth));
        }
        setResult(next);
        setLocked(true);
      } catch (err) {
        if (currentId !== requestId.current) return;
        setResult(null);
        setError(err instanceof Error ? err.message : "오늘의 흐름을 불러오지 못했어요.");
      } finally {
        if (currentId === requestId.current) setLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [isFormMode, locked, birthValid, year, month, day, gender, calendarType, timeMode, slotHour]);

  const inputsDisabled = !isFormMode && (locked || loading);

  return (
    <section
      className={`landing-preview${isFormMode ? " landing-preview--form" : ""}`}
      id="landing-birth-preview"
      aria-labelledby={hintId}
    >
      <p id={hintId} className="landing-preview__label">
        {isFormMode ? "생년월일 · 달력 · 태어난 시간" : "내 사주로 받으려면"}
      </p>
      {!isFormMode ? (
        <p className="landing-preview__hint">
          {locked
            ? "입력하신 정보로 리포트를 맞춰 드려요 · 이메일만 남기면 돼요"
            : "양력·음력·윤달 중 맞는 달력을 고른 뒤 생년월일과 태어난 시간을 입력해 주세요"}
        </p>
      ) : (
        <p className="landing-preview__hint landing-preview__hint--form">
          신분증·가족관계증명서에 적힌 달력(양력·음력·윤달)을 선택해 주세요. 태어난 시(時)도 알면
          꼭 골라 주세요.
        </p>
      )}

      <div className="landing-preview__grid">
        <div className="landing-preview__field">
          <label htmlFor={`${hintId}-year`}>년</label>
          <input
            id={`${hintId}-year`}
            className="landing-preview__input"
            type="text"
            inputMode="numeric"
            placeholder="1990"
            maxLength={4}
            value={year}
            disabled={inputsDisabled}
            onChange={(event) => setYear(onlyDigits(event.target.value, 4))}
            aria-label="출생년도"
          />
        </div>
        <div className="landing-preview__field">
          <label htmlFor={`${hintId}-month`}>월</label>
          <input
            id={`${hintId}-month`}
            className="landing-preview__input"
            type="text"
            inputMode="numeric"
            placeholder="5"
            maxLength={2}
            value={month}
            disabled={inputsDisabled}
            onChange={(event) => setMonth(onlyDigits(event.target.value, 2))}
            aria-label="출생월"
          />
        </div>
        <div className="landing-preview__field">
          <label htmlFor={`${hintId}-day`}>일</label>
          <input
            id={`${hintId}-day`}
            className="landing-preview__input"
            type="text"
            inputMode="numeric"
            placeholder="15"
            maxLength={2}
            value={day}
            disabled={inputsDisabled}
            onChange={(event) => setDay(onlyDigits(event.target.value, 2))}
            aria-label="출생일"
          />
        </div>
      </div>

      <p className="landing-preview__calendar-label">달력</p>
      <div className="landing-preview__calendar" role="group" aria-label="달력">
        {CALENDAR_OPTIONS.map(([type, label]) => (
          <button
            key={type}
            type="button"
            className={`landing-preview__calendar-btn${
              calendarType === type ? " landing-preview__calendar-btn--active" : ""
            }`}
            disabled={inputsDisabled}
            onClick={() => setCalendarType(type)}
            aria-pressed={calendarType === type}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="landing-preview__time-label">태어난 시간</p>
      <div className="landing-preview__time-modes" role="group" aria-label="태어난 시간">
        <button
          type="button"
          className={`landing-preview__time-mode${timeMode === "slot" ? " landing-preview__time-mode--active" : ""}`}
          disabled={inputsDisabled}
          onClick={() => setTimeMode("slot")}
          aria-pressed={timeMode === "slot"}
        >
          시간대 선택
        </button>
        <button
          type="button"
          className={`landing-preview__time-mode${timeMode === "none" ? " landing-preview__time-mode--active" : ""}`}
          disabled={inputsDisabled}
          onClick={() => setTimeMode("none")}
          aria-pressed={timeMode === "none"}
        >
          시간 모름
        </button>
      </div>

      {timeMode === "slot" ? (
        <select
          id={`${hintId}-slot`}
          className="landing-preview__time-select"
          value={slotHour}
          disabled={inputsDisabled}
          onChange={(event) => setSlotHour(Number(event.target.value))}
          aria-label="출생 시간대"
        >
          {BIRTH_TIME_SLOTS.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="landing-preview__time-note">시간을 모르면 생년월일 기준으로 읽어 드립니다.</p>
      )}

      <p className="landing-preview__gender-label">성별</p>
      <div className="landing-preview__gender" role="group" aria-label="성별">
        {(["여", "남"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={`landing-preview__gender-btn${
              gender === value ? " landing-preview__gender-btn--active" : ""
            }`}
            disabled={inputsDisabled}
            onClick={() => setGender(value)}
            aria-pressed={gender === value}
          >
            {value}
          </button>
        ))}
      </div>

      {!isFormMode && loading ? (
        <p className="landing-preview__status" role="status">
          오늘의 흐름을 읽는 중…
        </p>
      ) : null}

      {error ? (
        <p className="landing-preview__status landing-preview__status--error" role="alert">
          {error}
        </p>
      ) : null}

      {!isFormMode && result && !loading ? (
        <div className="landing-preview__result landing-preview__result--compact" role="status">
          <p className="landing-preview__tone">오늘의 결 · {result.toneLabel}</p>
          <p className="landing-preview__sentence">{result.sentence}</p>
        </div>
      ) : null}
    </section>
  );
}
