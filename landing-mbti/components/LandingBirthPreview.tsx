"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  fetchTodayOneLiner,
  isValidLandingBirthDate,
  type TodayOneLiner,
} from "@/lib/landing-today-api";
import {
  getStoredLandingPreview,
  hasUsedLandingPreview,
  saveStoredLandingPreview,
} from "@/lib/landing-preview-storage";

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function LandingBirthPreview() {
  const hintId = useId();
  const storedOnMount = useRef(getStoredLandingPreview());
  const [year, setYear] = useState(storedOnMount.current?.year ?? "");
  const [month, setMonth] = useState(storedOnMount.current?.month ?? "");
  const [day, setDay] = useState(storedOnMount.current?.day ?? "");
  const [gender, setGender] = useState<"남" | "여">(storedOnMount.current?.gender ?? "여");
  const [locked, setLocked] = useState(() => hasUsedLandingPreview());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TodayOneLiner | null>(() =>
    storedOnMount.current
      ? {
          sentence: storedOnMount.current.sentence,
          toneLabel: storedOnMount.current.toneLabel,
        }
      : null,
  );
  const requestId = useRef(0);

  const birthValid = isValidLandingBirthDate(year, month, day);

  useEffect(() => {
    if (locked) return;

    if (!birthValid) {
      setResult(null);
      setError("");
      return;
    }

    const timer = window.setTimeout(async () => {
      const currentId = ++requestId.current;
      setLoading(true);
      setError("");

      try {
        const next = await fetchTodayOneLiner({
          year: Number(year),
          month: Number(month),
          day: Number(day),
          gender,
        });
        if (currentId !== requestId.current) return;

        saveStoredLandingPreview({
          year,
          month,
          day,
          gender,
          sentence: next.sentence,
          toneLabel: next.toneLabel,
        });
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
  }, [locked, birthValid, year, month, day, gender]);

  const scrollToEmailForm = () => {
    document.getElementById("launch-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const inputsDisabled = locked || loading;

  return (
    <section className="landing-preview" aria-labelledby={hintId}>
      <p id={hintId} className="landing-preview__label">
        생년월일로 오늘의 한 줄 보기
      </p>
      <p className="landing-preview__hint">
        {locked
          ? "미리보기 1회를 사용했어요 · 매일 받으려면 아래에서 이메일을 남겨주세요"
          : "양력 기준 · 세션당 1회만 미리볼 수 있어요"}
      </p>

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

      {loading ? (
        <p className="landing-preview__status" role="status">
          오늘의 흐름을 읽는 중…
        </p>
      ) : null}

      {error ? (
        <p className="landing-preview__status landing-preview__status--error" role="alert">
          {error}
        </p>
      ) : null}

      {result && !loading ? (
        <div className="landing-preview__result" role="status">
          <p className="landing-preview__tone">오늘의 결 · {result.toneLabel}</p>
          <p className="landing-preview__sentence">{result.sentence}</p>
          <button type="button" className="landing-preview__email-link" onClick={scrollToEmailForm}>
            매일 받아보려면 이메일 입력
          </button>
        </div>
      ) : null}
    </section>
  );
}
