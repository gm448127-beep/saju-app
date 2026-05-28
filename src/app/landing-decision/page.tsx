"use client";

import { LandingBirthPreview } from "@/components/landing/LandingBirthPreview";
import { LandingCanvasHero } from "@/components/landing/LandingCanvasHero";
import { LandingSignupForm } from "@/components/landing/LandingSignupForm";
import "./landing-decision.css";

export default function LandingDecisionPage() {
  return (
    <div className="landing-decision-page">
      <LandingCanvasHero
        headline={
          <>
            매일의 작은 결정이
            <br />
            어려운 당신에게
          </>
        }
        tagline="오늘이 결정의 날인지, 흐름을 따라가는 날인지"
        imageSrc="/landing/landing-hero-cat.png"
      />

      <div className="landing-page__body">
        <LandingBirthPreview />

        <section className="landing-decision-page__info" aria-label="서비스 설명">
          <article className="landing-decision-page__info-block">
            <h2 className="landing-decision-page__info-title">운명비서가 뭔가요?</h2>
            <p className="landing-decision-page__info-text">
              결정장애는 의지의 문제가 아닙니다.
              <br />
              오늘이 결정의 날인지, 흐름을 따라가는 날인지.
              <br />
              그걸 알면 결정이 가벼워집니다.
            </p>
          </article>

          <article className="landing-decision-page__info-block">
            <h2 className="landing-decision-page__info-title">이런 분들을 위해 만들었어요</h2>
            <ul className="landing-decision-page__info-list">
              <li>• 매일 작은 결정에도 에너지를 많이 쓰시는 분</li>
              <li>• &quot;이게 맞는 건가&quot; 확신이 잘 안 서시는 분</li>
              <li>• 결정 후에도 계속 후회하시는 분</li>
            </ul>
          </article>

          <article className="landing-decision-page__info-block">
            <h2 className="landing-decision-page__info-title">매일 아침 이런 걸 받아보세요</h2>
            <ul className="landing-decision-page__info-list">
              <li>• 오늘이 결정의 날인지 확인</li>
              <li>• 지금 집중할 것 vs 나중으로 미룰 것</li>
              <li>• 오늘의 에너지 방향</li>
              <li>• 나를 지키는 한 마디</li>
            </ul>
          </article>
        </section>

        <LandingSignupForm />

        <footer className="landing-decision-page__footer">
          <p>
            <strong>운명비서</strong> · 당신의 매일을 차분히 정리해 드립니다
          </p>
        </footer>
      </div>
    </div>
  );
}
