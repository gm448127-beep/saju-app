"use client";

import { LandingBirthPreview } from "../components/LandingBirthPreview";
import { LandingCanvasHero } from "../components/LandingCanvasHero";
import { LandingSignupForm } from "../components/LandingSignupForm";

export default function LandingRestartPage() {
  return (
    <main className="landing">
      <LandingCanvasHero
        headline={
          <>
            다시 시작하는
            <br />
            당신의 두 번째 챕터
          </>
        }
        tagline="새 출발을 위한 사주 인사이트"
        imageSrc="/landing-hero-moon.png"
      />

      <div className="landing-page__body">
        <LandingBirthPreview />

        <section className="landing__info" aria-label="서비스 설명">
          <article className="landing__info-block">
            <h2 className="landing__info-title">운명비서가 뭔가요?</h2>
            <p className="landing__info-text">
              사주는 패턴을 봅니다.
              <br />
              끌리는 사람과 맞는 사람이 왜 다른지,
              <br />
              그 패턴을 차분하게 읽어드립니다.
            </p>
          </article>

          <article className="landing__info-block">
            <h2 className="landing__info-title">이런 분들을 위해 만들었어요</h2>
            <ul className="landing__info-list">
              <li>• 새로운 인연을 시작하기 전에 나를 먼저 알고 싶은 분</li>
              <li>• 같은 실수를 반복하고 싶지 않으신 분</li>
              <li>• 두 번째 챕터를 차분하게 시작하고 싶으신 분</li>
            </ul>
          </article>

          <article className="landing__info-block">
            <h2 className="landing__info-title">매일 아침 이런 걸 받아보세요</h2>
            <ul className="landing__info-list">
              <li>• 오늘의 관계 흐름</li>
              <li>• 나와 맞는 사람의 패턴</li>
              <li>• 지금 이 시기에 집중할 것</li>
              <li>• 나를 지키는 방법</li>
            </ul>
          </article>
        </section>

        <LandingSignupForm />

        <footer className="landing__footer">
          <p>
            <strong>운명비서</strong> · 당신의 매일을 차분히 정리해 드립니다
          </p>
        </footer>
      </div>
    </main>
  );
}
