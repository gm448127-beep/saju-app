import { LandingInfoAccordion, type LandingInfoBlock } from "@/components/landing/LandingInfoAccordion";
import { LandingSignupForm } from "@/components/landing/LandingSignupForm";

type LandingConversionBodyProps = {
  infoBlocks: LandingInfoBlock[];
  footerClassName: string;
  illustrationSrc?: string;
};

/** 랜딩 — 전환 흐름: 소름 훅 → 잠긴 통찰 → 생년월일 → 이메일 */
export function LandingConversionBody({
  infoBlocks,
  footerClassName,
  illustrationSrc,
}: LandingConversionBodyProps) {
  return (
    <div className="landing-page__body landing-conversion">
      <LandingSignupForm illustrationSrc={illustrationSrc} />
      <LandingInfoAccordion blocks={infoBlocks} />
      <footer className={footerClassName}>
        <p>
          <strong>운명비서</strong> · 오늘의 운세 무료보기, 매일 아침
        </p>
      </footer>
    </div>
  );
}
