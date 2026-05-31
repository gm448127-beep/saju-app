import {
  LANDING_REPORT_EXAMPLE_ITEMS,
  LandingReportCards,
} from "@/components/landing/LandingReportCards";

/** 랜딩 — 정적 리포트 예시 (이메일 입력 전) */
export function LandingReportExample() {
  return (
    <LandingReportCards
      sectionTitle="이런 결과를 받게 됩니다"
      toneLabel="상승"
      items={LANDING_REPORT_EXAMPLE_ITEMS}
    />
  );
}
