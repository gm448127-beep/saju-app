"use client";

import { FormEvent, useId, useState } from "react";
import { LandingBirthPreview } from "@/components/landing/LandingBirthPreview";
import { LandingConversionHeadline } from "@/components/landing/LandingConversionHeadline";
import { LandingCuriosityPrompt } from "@/components/landing/LandingCuriosityPrompt";
import { LandingServicePitch } from "@/components/landing/LandingServicePitch";
import { LandingTodaySheet } from "@/components/landing/LandingTodaySheet";
import { submitLandingEmail } from "@/lib/landing-google-form";
import { LANDING_CURIOSITY } from "@/lib/landing-curiosity-copy";
import { LANDING_FORTUNE_BAIT } from "@/lib/landing-service-pitch";
import { getStoredLandingBirth } from "@/lib/landing-preview-storage";
import { fetchTodayReport, isValidLandingBirthDate } from "@/lib/landing-today-api";
import { landingBirthKeyFromStored } from "@/lib/landing-birth-payload";
import {
  buildSheetFromPreview,
  type LandingTodaySheetData,
} from "@/lib/landing-today-sheet";

async function submitEmailWithTimeout(email: string) {
  await Promise.race([
    submitLandingEmail(email),
    new Promise<void>((resolve) => window.setTimeout(resolve, 6000)),
  ]);
}

export function LandingSignupForm({ illustrationSrc }: { illustrationSrc?: string }) {
  const formId = useId().replace(/:/g, "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheet, setSheet] = useState<LandingTodaySheetData | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }

    const birth = getStoredLandingBirth();
    if (!birth || !isValidLandingBirthDate(birth.year, birth.month, birth.day)) {
      setError("생년월일, 태어난 시간, 성별을 입력해 주세요.");
      document.getElementById("landing-birth-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const birthKey = landingBirthKeyFromStored(birth);

    setSubmitting(true);
    setSheetLoading(true);
    setError("");

    const reportPromise = fetchTodayReport(birth).catch(() =>
      buildSheetFromPreview(
        {
          sentence: birth.sentence?.trim() || "비슷한 갈림길에서, 같은 기준으로 멈춥니다.",
          toneLabel: birth.toneLabel?.trim() || "나를 오해하는 방식",
        },
        "오늘",
        birthKey,
      ),
    );

    try {
      await submitEmailWithTimeout(normalizedEmail);
    } catch {
      /* 이메일 실패해도 결과는 보여줌 */
    }

    try {
      const report = await reportPromise;
      setSheet(report);
      setEmail("");

      window.setTimeout(() => {
        document.getElementById("landing-today-sheet")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch {
      setError("통찰을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
      setSheetLoading(false);
    }
  };

  return (
    <>
      <section id="launch-form" className="landing-signup" aria-label="나만의 통찰 받기">
        <LandingConversionHeadline illustrationSrc={illustrationSrc} />

        {!sheet ? <LandingServicePitch /> : null}

        <LandingBirthPreview mode="form" />

        {!sheet ? <LandingCuriosityPrompt /> : null}

        <form id={formId} className="landing-signup__form" onSubmit={handleSubmit}>
          <label htmlFor={`${formId}-email`} className="landing-signup__field-label">
            이메일
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            className="landing-signup__input"
            placeholder="이메일 주소를 입력해 주세요"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            aria-label="이메일 주소"
            required
          />
        </form>

        <p className="landing-signup__hint-below">{LANDING_CURIOSITY.emailHint}</p>

        {error ? <p className="landing-signup__message landing-signup__message--error">{error}</p> : null}

        <div className="landing-signup__cta-wrap">
          <button type="submit" form={formId} className="landing-signup__cta" disabled={submitting}>
            {submitting ? LANDING_FORTUNE_BAIT.loading : LANDING_FORTUNE_BAIT.cta}
          </button>
        </div>
      </section>

      {sheetLoading ? <p className="landing-sheet__loading">{LANDING_FORTUNE_BAIT.loading}</p> : null}
      {sheet && !sheetLoading ? <LandingTodaySheet data={sheet} /> : null}
    </>
  );
}
