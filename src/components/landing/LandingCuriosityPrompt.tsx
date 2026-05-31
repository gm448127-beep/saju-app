import { LANDING_CURIOSITY } from "@/lib/landing-curiosity-copy";

/** 이메일 입력 직전 — 질문형 기대감 카피 (잠금·흐림 없음) */
export function LandingCuriosityPrompt() {
  return (
    <section className="landing-curiosity" aria-label="오늘의 질문">
      <p className="landing-curiosity__title">{LANDING_CURIOSITY.beforeEmailTitle}</p>
      <ul className="landing-curiosity__list">
        {LANDING_CURIOSITY.questions.map((question) => (
          <li key={question} className="landing-curiosity__item">
            {question}
          </li>
        ))}
      </ul>
      <p className="landing-curiosity__note">{LANDING_CURIOSITY.beforeEmailNote}</p>
    </section>
  );
}
