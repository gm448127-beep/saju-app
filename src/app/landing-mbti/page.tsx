"use client";

import { LandingConversionBody } from "@/components/landing/LandingConversionBody";
import { buildLandingInfoBlocks } from "@/components/landing/landing-info-blocks";
import "./landing-mbti.css";

const MBTI_INFO_BLOCKS = buildLandingInfoBlocks({
  title: "이런 분들을 위해 만들었어요",
  children: (
    <ul>
      <li>• MBTI는 좋은데 매일 똑같아서 아쉬우신 분</li>
      <li>• 별자리 운세는 너무 가볍게 느껴지시는 분</li>
      <li>• 자기 인식 문장을 친구에게 보내고 싶으신 분</li>
    </ul>
  ),
});

export default function LandingMbtiPage() {
  return (
    <div className="landing-mbti-page">
      <LandingConversionBody
        infoBlocks={MBTI_INFO_BLOCKS}
        footerClassName="landing-mbti-page__footer"
        illustrationSrc="/landing/landing-hero.png"
      />
    </div>
  );
}
