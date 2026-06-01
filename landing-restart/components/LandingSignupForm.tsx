"use client";

import { FormEvent, useId, useState } from "react";
import { submitLandingEmail } from "../lib/landing-google-form";
import { getStoredLandingPreview } from "../lib/landing-preview-storage";
import { fetchTodayReport } from "../lib/landing-today-api";
import { buildSheetFromPreview, type LandingTodaySheetData } from "../lib/landing-today-sheet";
import { LandingTodaySheet } from "../components/LandingTodaySheet";

export function LandingSignupForm() {
  const formId = useId().replace(/:/g, "");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheet, setSheet] = useState<LandingTodaySheetData | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setError("?щ컮瑜??대찓??二쇱냼瑜??낅젰?댁＜?몄슂.");
      return;
    }

    const birth = getStoredLandingPreview();
    if (!birth) {
      setError("癒쇱? ?꾩뿉???앸뀈?붿씪???낅젰??二쇱꽭??");
      document.getElementById("landing-birth-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitLandingEmail(normalizedEmail);
      setSubmitted(true);
      setEmail("");
      setSheetLoading(true);

      try {
        const report = await fetchTodayReport({
          year: Number(birth.year),
          month: Number(birth.month),
          day: Number(birth.day),
          gender: birth.gender,
        });
        setSheet(report);
      } catch {
        setSheet(buildSheetFromPreview(birth));
      }

      window.setTimeout(() => {
        document.getElementById("landing-today-sheet")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch {
      setError("?꾩넚 以?臾몄젣媛 諛쒖깮?덉뼱?? ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.");
    } finally {
      setSubmitting(false);
      setSheetLoading(false);
    }
  };

  return (
    <>
      <section id="launch-form" className="landing-signup__card" aria-labelledby={`${formId}-heading`}>
        <p id={`${formId}-heading`} className="landing-signup__label">
          異쒖떆 ?뚮┝ ?좎껌
        </p>
        <p className="landing-signup__hint">?대찓?쇱쓣 ?④린?쒕㈃ ?ㅻ뒛???댁꽭 ???μ쓣 諛붾줈 蹂댁뿬?쒕젮??/p>
        <form id={formId} className="landing-signup__form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="landing-signup__input"
            placeholder="?대찓??二쇱냼瑜??낅젰?댁＜?몄슂"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            aria-label="?대찓??二쇱냼"
            required
          />
        </form>
        {error ? <p className="landing-signup__message landing-signup__message--error">{error}</p> : null}
        {submitted ? (
          <p className="landing-signup__message" role="status">
            媛먯궗?⑸땲?? 異쒖떆 ?뚯떇 媛??癒쇱? ?뚮젮?쒕┫寃뚯슂.
          </p>
        ) : null}
      </section>

      <div className="landing-signup__cta-wrap">
        <button type="submit" form={formId} className="landing-signup__cta" disabled={submitting}>
          {submitting ? "蹂대궡??以묅? : "異쒖떆 ?뚮┝ 諛쏄린"}
        </button>
      </div>

      {sheetLoading ? <p className="landing-sheet__loading">?ㅻ뒛??由ы룷?몃? 留뚮뱶??以묅?/p> : null}
      {sheet && !sheetLoading ? <LandingTodaySheet data={sheet} /> : null}
    </>
  );
}

