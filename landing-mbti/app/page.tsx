"use client";

/**
 * Google Form 임베드 URL — 나중에 실제 URL로 교체
 * 예: https://docs.google.com/forms/d/e/XXXXXXXX/viewform?embedded=true
 */
const GOOGLE_FORM_EMBED_URL =
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL ?? "";

const HAS_FORM = GOOGLE_FORM_EMBED_URL.length > 0 && !GOOGLE_FORM_EMBED_URL.includes("PLACEHOLDER");

export default function LandingMbtiPage() {
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
        <p className="landing__persona">자기이해 · 30대</p>
        <h1 id="landing-headline" className="landing__headline">
          MBTI보다 깊고,
          <br />
          점집보다 가벼운
          <br />
          매일의 나 리포트
        </h1>
        <p className="landing__sub">
          같은 사람이어도 오늘은 결정의 날, 내일은 회복의 날. 운명비서는 매일 아침 1분, 당신의 오늘을
          정리해 드립니다.
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
            <code style={{ fontSize: "0.75rem" }}>NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL</code>
            환경 변수 또는 page.tsx 상단의 URL을 교체해 주세요.
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
