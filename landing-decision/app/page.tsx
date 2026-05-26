"use client";

const GOOGLE_FORM_EMBED_URL =
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL_DECISION ??
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL ??
  "";

const HAS_FORM =
  GOOGLE_FORM_EMBED_URL.length > 0 && !GOOGLE_FORM_EMBED_URL.includes("PLACEHOLDER");

export default function LandingDecisionPage() {
  const scrollToForm = () => {
    document.getElementById("launch-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="landing">
      <header className="landing__brand">
        <span className="landing__hanja" aria-hidden>
          命
        </span>
        <span className="landing__logo">운명비서</span>
      </header>

      <section className="landing__hero" aria-labelledby="landing-headline">
        <p className="landing__persona">결정장애 · 30대</p>
        <h1 id="landing-headline" className="landing__headline">
          매일의 작은 결정이
          <br />
          어려운 당신에게
        </h1>
        <p className="landing__sub">
          결정장애는 의지의 문제가 아닙니다. 오늘이 결정의 날인지, 흐름을 따라가는 날인지 알면 결정이
          가벼워집니다.
        </p>
      </section>

      <div className="landing__visual">
        <img src="/landing-hero.png" alt="" width={600} height={600} loading="eager" />
      </div>

      <section id="launch-form" className="landing__form-card" aria-labelledby="form-heading">
        <p id="form-heading" className="landing__form-label">
          출시 알림 신청
        </p>
        {HAS_FORM ? (
          <iframe
            title="운명비서 출시 알림 신청"
            src={GOOGLE_FORM_EMBED_URL}
            className="landing__form-frame"
            loading="lazy"
          />
        ) : (
          <div className="landing__form-placeholder" role="status">
            Google Form URL을 연결하면 이곳에 신청 폼이 표시됩니다.
            <br />
            <br />
            <code style={{ fontSize: "0.75rem" }}>NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL_DECISION</code>
          </div>
        )}
      </section>

      <div className="landing__cta-wrap">
        <button type="button" className="landing__cta" onClick={scrollToForm}>
          출시 알림 받기
        </button>
      </div>

      <footer className="landing__footer">
        <p>
          <strong>운명비서</strong> · 당신의 매일을 차분히 정리해 드립니다
        </p>
      </footer>
    </main>
  );
}
