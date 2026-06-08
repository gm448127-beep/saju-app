import { trackGa4Event } from "@/lib/ga4";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-pixel";

/** 랜딩 — 무료 운세 결과 최초 노출 */
export function trackLandingViewContent() {
  trackMetaEvent("ViewContent");
  trackGa4Event("view_content", { page_type: "landing_free_fortune" });
}

/** 랜딩 — 「오늘 전체 리포트 무료로 이어 읽기」 클릭 */
export function trackLandingUnlockReport() {
  trackMetaCustomEvent("UnlockReport");
  trackGa4Event("unlock_report", { cta: "landing_premium_lock" });
}
