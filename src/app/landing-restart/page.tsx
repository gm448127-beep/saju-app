"use client";

import { LandingConversionBody } from "@/components/landing/LandingConversionBody";
import { buildLandingInfoBlocks } from "@/components/landing/landing-info-blocks";
import "./landing-restart.css";

const RESTART_INFO_BLOCKS = buildLandingInfoBlocks({
  title: "이런 분들을 위해 만들었어요",
  children: (
    <ul>
      <li>• 같은 실수를 반복하고 싶지 않으신 분</li>
      <li>• 관계·선택에서 나만의 기준이 궁금하신 분</li>
      <li>• 두 번째 챕터를 차분하게 시작하고 싶으신 분</li>
    </ul>
  ),
});

export default function LandingRestartPage() {
  return (
    <div className="landing-restart-page">
      <LandingConversionBody
        infoBlocks={RESTART_INFO_BLOCKS}
        footerClassName="landing-restart-page__footer"
        illustrationSrc="/landing/landing-hero-moon.png"
      />
    </div>
  );
}
