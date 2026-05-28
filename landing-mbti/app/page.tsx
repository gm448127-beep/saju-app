"use client";

import { LandingBirthPreview } from "../components/LandingBirthPreview";
import { LandingCanvasHero } from "../components/LandingCanvasHero";
import { LandingSignupForm } from "../components/LandingSignupForm";

export default function LandingMbtiPage() {
  return (
    <main className="landing">
      <LandingCanvasHero
        headline={
          <>
            MBTI보다 깊고,
            <br />
            점집보다 가벼운
            <br />
            매일의 나 리포트
          </>
        }
        tagline="매일 아침 1분, 오늘의 나를 정리해 드립니다"
        imageSrc="/landing-hero.png"
      />

      <div className="landing-page__body">
        <LandingBirthPreview />

        <section className="landing__info" aria-label="서비스 설명">
          <article className="landing__info-block">
            <h2 className="landing__info-title">운명비서가 뭔가요?</h2>
            <p className="landing__info-text">
              사주는 5,000년의 데이터입니다.
              <br />
              점집의 두려움 없이, 매일 아침 1분.
              <br />
              오늘의 나를 차분히 읽어드립니다.
            </p>
          </article>

          <article className="landing__info-block">
            <h2 className="landing__info-title">이런 분들을 위해 만들었어요</h2>
            <ul className="landing__info-list">
              <li>• MBTI는 좋은데 매일 똑같아서 아쉬우신 분</li>
              <li>• 별자리 운세는 너무 가볍게 느껴지시는 분</li>
              <li>• 점집은 부담스럽고 그 중간이 없어서 답답하신 분</li>
            </ul>
          </article>

          <article className="landing__info-block">
            <h2 className="landing__info-title">매일 아침 이런 걸 받아보세요</h2>
            <ul className="landing__info-list">
              <li>• 오늘의 결: 결정의 날인지, 회복의 날인지</li>
              <li>• 오늘의 관계: 가까이할 사람, 거리 둘 상황</li>
              <li>• 오늘의 감정: 내 감정의 흐름</li>
              <li>• 오늘의 균형: 나를 지키는 방법</li>
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
