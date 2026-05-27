"use client";

const GOOGLE_FORM_EMBED_URL =
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL_RESTART ??
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL ??
  "";

const HAS_FORM =
  GOOGLE_FORM_EMBED_URL.length > 0 && !GOOGLE_FORM_EMBED_URL.includes("PLACEHOLDER");

export default function LandingRestartPage() {
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
        <p className="landing__persona">재시작 · 30~40대</p>
        <h1 id="landing-headline" className="landing__headline">
          다시 시작하는 당신을 위한
          <br />
          사주 매거진
        </h1>
        <p className="landing__sub">
          끌리는 사람과 맞는 사람은 다릅니다. 운명비서는 차분한 매거진 톤으로, 두 번째 인연을 위한
          인사이트를 드립니다.
        </p>
      </section>

      <div className="landing__visual">
        <img src="/landing-hero.png" alt="" width={280} height={350} loading="eager" />
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
            <code style={{ fontSize: "0.75rem" }}>NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL_RESTART</code>
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
