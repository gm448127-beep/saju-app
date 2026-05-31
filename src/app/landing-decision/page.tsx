"use client";

import { LandingConversionBody } from "@/components/landing/LandingConversionBody";
import { buildLandingInfoBlocks } from "@/components/landing/landing-info-blocks";
import "./landing-decision.css";

const DECISION_INFO_BLOCKS = buildLandingInfoBlocks({
  title: "이런 분들을 위해 만들었어요",
  children: (
    <ul>
      <li>• &quot;이거 나 얘기 같은데?&quot;라고 느낀 적 있는 분</li>
      <li>• MBTI·별자리보다 더 깊은 자기 인식을 원하시는 분</li>
      <li>• 결정·관계·일에서 같은 패턴이 반복된다고 느끼시는 분</li>
    </ul>
  ),
});

export default function LandingDecisionPage() {
  return (
    <div className="landing-decision-page">
      <LandingConversionBody
        infoBlocks={DECISION_INFO_BLOCKS}
        footerClassName="landing-decision-page__footer"
        illustrationSrc="/landing/landing-decision-illustration.png"
      />
    </div>
  );
}
