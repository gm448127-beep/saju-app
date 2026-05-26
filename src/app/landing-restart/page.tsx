"use client";

import "./landing-restart.css";

/**
 * Google Form 임베드 URL — 재시작 랜딩 전용 (없으면 공용 변수 사용)
 * 예: https://docs.google.com/forms/d/e/XXXXXXXX/viewform?embedded=true
 */
const GOOGLE_FORM_EMBED_URL =
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL_RESTART ??
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL ??
  "";

const HAS_FORM =
  GOOGLE_FORM_EMBED_URL.length > 0 && !GOOGLE_FORM_EMBED_URL.includes("PLACEHOLDER");

export default function LandingRestartPage() {
  const scrollToForm = () => {
    document.getElementById("launch-form-restart")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="landing-restart-page">
      <header className="landing-restart-page__brand">
        <span className="landing-restart-page__hanja" aria-hidden>
          命
        </span>
        <span className="landing-restart-page__logo">운명비서</span>
      </header>

      <section className="landing-restart-page__hero" aria-labelledby="landing-restart-headline">
        <p className="landing-restart-page__persona">재시작 · 30~40대</p>
        <h1 id="landing-restart-headline" className="landing-restart-page__headline">
          다시 시작하는 당신을 위한
          <br />
          사주 매거진
        </h1>
        <p className="landing-restart-page__sub">
          끌리는 사람과 맞는 사람은 다릅니다. 운명비서는 차분한 매거진 톤으로, 두 번째 인연을 위한
          인사이트를 드립니다.
        </p>
      </section>

      <div className="landing-restart-page__visual">
        <img src="/landing/landing-hero-moon.png" alt="" width={600} height={600} loading="eager" />
      </div>

      <section
        id="launch-form-restart"
        className="landing-restart-page__form-card"
        aria-labelledby="form-heading-restart"
      >
        <p id="form-heading-restart" className="landing-restart-page__form-label">
          출시 알림 신청
        </p>
        {HAS_FORM ? (
          <iframe
            title="운명비서 출시 알림 신청"
            src={GOOGLE_FORM_EMBED_URL}
            className="landing-restart-page__form-frame"
            loading="lazy"
          />
        ) : (
          <div className="landing-restart-page__form-placeholder" role="status">
            Google Form URL을 연결하면 이곳에 신청 폼이 표시됩니다.
            <br />
            <br />
            <code style={{ fontSize: "0.75rem" }}>NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL_RESTART</code>{" "}
            환경 변수를 설정해 주세요.
          </div>
        )}
      </section>

      <div className="landing-restart-page__cta-wrap">
        <button type="button" className="landing-restart-page__cta" onClick={scrollToForm}>
          출시 알림 받기
        </button>
      </div>

      <footer className="landing-restart-page__footer">
        <p>
          <strong>운명비서</strong> · 당신의 매일을 차분히 정리해 드립니다
        </p>
      </footer>
    </div>
  );
}
