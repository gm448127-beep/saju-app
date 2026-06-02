/** 랜딩 — 신뢰·무료 이유·유료 구분 카피 */

/** A. 개인정보 */
export const LANDING_PRIVACY_NOTICE = {
  title: "개인정보 안내",
  lines: [
    "입력하신 정보는 사주 풀이에만 사용됩니다.",
    "서비스 이용 후 1년 이내 자동 삭제됩니다.",
  ],
} as const;

/** B. 왜 무료인지 */
export const LANDING_WHY_FREE = {
  title: "왜 무료인가요?",
  lines: [
    "운명비서는 광고 없이 운영됩니다.",
    "기본 사주·오늘의 흐름은 무료로 제공합니다.",
    "더 깊은 분석·결정 리포트는 유료로 제공합니다.",
  ],
  footnote: "무료라서 의심스럽기보다, 먼저 맞는지 확인해 보시라는 뜻이에요.",
} as const;

/** 이메일 입력 전 — 잠긴 결과 미리보기 */
export const LANDING_LOCKED_PREVIEW = {
  title: "입력하시면 열리는 오늘의 리포트",
  hint: "아래 네 가지는 이메일 입력 후 공개됩니다.",
  unlockLabel: "이메일 입력 후 공개",
} as const;

/** C. 결과 화면 — 무료/유료 구분 */
export const LANDING_RESULT_FREE_BADGE = "무료로 확인한 내용";
export const LANDING_RESULT_LOCK_BADGE = "앱에서 전체 보기";

export const LANDING_INSIGHT_LOCK_MESSAGE =
  "왜 이런 흐름인지, 더 깊은 해석은 전체 리포트에서 확인할 수 있어요.";

/** 유료 영역 티저 (오늘의 운세 상세) */
export const LANDING_PREMIUM_LOCKED = {
  title: "더 깊은 리포트",
  subtitle: "오늘의 흐름은 무료입니다. 아래는 앱에서 이어서 읽을 수 있어요.",
  items: [
    {
      title: "오늘의 결정 포인트",
      desc: "계약·연락·투자처럼 오늘 가장 고민될 선택",
    },
    {
      title: "분야별 상세 운세",
      desc: "일·돈·인간관계·연애·행운",
    },
    {
      title: "시간대별 흐름",
      desc: "오늘 하루, 언제 움직이면 좋은지",
    },
  ],
  cta: "오늘 전체 리포트 무료로 이어 읽기",
  ctaHint: "생년월일은 이미 입력하셨다면 바로 열립니다.",
} as const;
