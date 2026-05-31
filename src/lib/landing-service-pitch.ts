/** 메타 광고 소재 — 랜딩 첫 화면 메시지 매칭 */
export const LANDING_META_AD_MATCH = {
  headline: "오늘의 운세 무료 확인",
  lead: "생년월일만 입력하면",
  items: ["오늘의 운세와", "오늘 운이 좋은 시간,", "오늘 피해야 할 행동"],
  closing: "무료로 확인하세요.",
  footer: "AI가 분석한 오늘의 운세 리포트",
} as const;

/** 랜딩 — 「오늘의 운세 무료보기」 검색 미끼 (SEO·전환 공통) */
export const LANDING_FORTUNE_BAIT = {
  badge: "오늘의 운세 · 무료",
  searchLabel: "오늘의 운세 무료보기",
  headlineBridge: "운세를 찾으셨다면, 여기가 맞습니다.",
  cta: "오늘의 운세 무료 보기",
  emailHint: "입력하면 오늘의 운세와 통찰이 열립니다.",
  birthLead: "생년월일·태어난 시간 입력 → 오늘의 운세 무료 확인",
  loading: "오늘의 운세를 읽는 중…",
} as const;

/** 랜딩 SEO — 검색 1위 키워드 대응 */
export const LANDING_SEO = {
  title: "오늘의 운세 무료보기 | 운명비서",
  description:
    "오늘의 운세 무료로 확인하세요. 생년월일만 입력하면, '어떻게 알았지?' 수준의 오늘 통찰을 받습니다.",
} as const;

/** 랜딩 — 운명비서가 어떤 서비스인지 설명하는 공통 카피 */
export const LANDING_SERVICE_PITCH = {
  eyebrow: "오늘의 운세 무료보기 — 여기서 끝이 아닙니다",
  headline: "운세를 찾으셨다면, 여기가 맞습니다.\n다만 '운이 좋다'가 아니라, 오늘의 당신을 읽습니다.",
  beats: [
    "오늘의 운세, 생년월일만으로 무료 확인 가능합니다.",
    "길흉·좋은 시간 대신, 오늘 반복되는 선택 패턴을 읽어냅니다.",
    "5,000년치 사주 데이터 위에, 오늘의 당신을 올립니다.",
  ],
  punchline: "그래서 첫 반응은 항상 같습니다. — \"어떻게 알았지?\"",
} as const;

/** 하단 아코디언 — 운명비서 소개 (3랜딩 공통) */
export const LANDING_SERVICE_ABOUT = {
  title: "운명비서의 오늘의 운세란?",
  lines: [
    "오늘의 운세를 무료로 볼 수 있습니다.",
    "다만 '운이 좋다·나쁘다'가 아닙니다.",
    "오늘의 당신을 소름 돋게 읽는 통찰입니다.",
  ],
} as const;

/** 하단 아코디언 — 받게 되는 것 (3랜딩 공통) */
export const LANDING_SERVICE_DELIVERY = {
  title: "이메일 입력 후 받는 내용",
  items: [
    "오늘의 흐름",
    "행동하기 좋은 타이밍",
    "실수할 가능성이 높은 순간",
    "오늘 비서의 제안",
  ],
} as const;
