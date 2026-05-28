"use client";

import { FormEvent, useId, useState } from "react";
import { submitLandingEmail } from "../lib/landing-google-form";

export function LandingSignupForm() {
  const formId = useId().replace(/:/g, "");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setError("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitLandingEmail(normalizedEmail);
      setSubmitted(true);
      setEmail("");
    } catch {
      setError("전송 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section id="launch-form" className="landing-signup__card" aria-labelledby={`${formId}-heading`}>
        <p id={`${formId}-heading`} className="landing-signup__label">
          출시 알림 신청
        </p>
        <form id={formId} className="landing-signup__form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="landing-signup__input"
            placeholder="이메일 주소를 입력해주세요"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            aria-label="이메일 주소"
            required
          />
        </form>
        {error ? <p className="landing-signup__message landing-signup__message--error">{error}</p> : null}
        {submitted ? (
          <p className="landing-signup__message" role="status">
            감사합니다. 출시 소식 가장 먼저 알려드릴게요.
          </p>
        ) : null}
      </section>

      <div className="landing-signup__cta-wrap">
        <button type="submit" form={formId} className="landing-signup__cta" disabled={submitting}>
          출시 알림 받기
        </button>
      </div>
    </>
  );
}
