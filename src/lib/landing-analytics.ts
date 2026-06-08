import { trackGa4Event } from "@/lib/ga4";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-pixel";

/** 랜딩 GA4/Meta 공통 source */
export type LandingAnalyticsSource = "landing_decision" | "landing_mbti" | "landing_restart";

/** 랜딩 — 이메일 제출 성공 */
export function trackLandingLeadGenerate(source: LandingAnalyticsSource) {
  trackMetaEvent("Lead", { source });
  trackGa4Event("lead_generate", { source });
}

/** 랜딩 — 무료 운세 결과 최초 노출 */
export function trackLandingViewContent(source: LandingAnalyticsSource) {
  trackMetaEvent("ViewContent");
  trackGa4Event("view_content", { content_type: "today_fortune", source });
}

/** 랜딩 — 「오늘 전체 리포트 무료로 이어 읽기」 클릭 */
export function trackLandingUnlockReport(source: LandingAnalyticsSource) {
  trackMetaCustomEvent("UnlockReport");
  trackGa4Event("unlock_report", { source });
}
