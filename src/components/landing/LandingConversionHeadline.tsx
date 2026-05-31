import { LandingPromoHero } from "@/components/landing/LandingPromoHero";
import { LANDING_CURIOSITY } from "@/lib/landing-curiosity-copy";
import { LANDING_FORTUNE_BAIT } from "@/lib/landing-service-pitch";

type LandingConversionHeadlineProps = {
  illustrationSrc?: string;
};

/** 랜딩 — 광고형 히어로 + 호기심 유발 리드 (소름 문장은 결과에서) */
export function LandingConversionHeadline({ illustrationSrc }: LandingConversionHeadlineProps) {
  return (
    <section className="landing-conversion-headline" aria-label="오늘의 운세 무료보기">
      <LandingPromoHero illustrationSrc={illustrationSrc} />

      <div className="landing-conversion-headline__chill">
        <p className="landing-conversion-headline__lead">{LANDING_CURIOSITY.lead}</p>
        <p className="landing-conversion-headline__bridge">{LANDING_FORTUNE_BAIT.headlineBridge}</p>
        <p className="landing-conversion-headline__cta-line">{LANDING_FORTUNE_BAIT.birthLead}</p>
      </div>
    </section>
  );
}
