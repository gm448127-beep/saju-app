/**
 * 운명비서 해석 엔진·차별화 카피 (홈·/today 등 공용)
 * — 실제 구현: /api/today 규칙 엔진 + today-tone 템플릿 (LLM 아님)
 */

/** 대표 슬로건 (포지셔닝) */
export const PRIMARY_TAGLINE =
  "매일 아침, 내 사주 기준으로 오늘의 흐름을 1분 안에 읽어드립니다";

/** 시(時) 차별화 — 「유일」 단정 없이 사실 기반 */
export const BIRTH_TIME_MARKETING = {
  onboardingSlide3Title: "생년월일과 태어난 시까지 보면, 오늘이 더 정확해져요",
  subcopy:
    "대부분의 오늘의 운세는 생일까지만 봅니다.\n운명비서는 태어난 시(時)까지 읽어 하루의 결을 가릅니다.",
  hourlyFlowTitle: "오늘, 당신의 시(時)에 맞춘 시간대별 흐름",
} as const;

/** 기술 한 줄 — 신뢰·보조 설명 */
export const ENGINE_ONE_LINER =
  "내 일간 × 오늘 일진의 십성과 사주 원국의 천·지 합·충을 규칙으로 계산해 5축 점수와 「오늘의 결」을 만듭니다. (매번 새로 지어내는 AI 문장이 아닙니다)";

/** 엔진이 쓰지 않는 것 — 과장 방지 */
export const ENGINE_SCOPE_NOTE =
  "오늘의 흐름에는 신살·LLM을 넣지 않습니다. 신살·대운은 사주 리포트, 깊은 대화는 AI 상담에서 이어집니다.";

/** 홈 — 운명비서가 흐름을 읽는 방식 (3카드) */
export const HOME_READING_WAY_CARDS = [
  {
    num: "01",
    title: "명리 엔진",
    description: "생년월일·시(時)와 오늘 일진을 규칙으로 계산해 5축 점수와 「오늘의 결」을 만듭니다.",
  },
  {
    num: "02",
    title: "매일 리포트",
    description: "오늘의 한 줄·12시진·행동 가이드를 매일 같은 기준으로 읽고 기록에 쌓습니다.",
  },
  {
    num: "03",
    title: "AI 상담",
    description: "사주 맥락을 바탕으로 걸리는 마음을 대화로 깊게 정리합니다.",
  },
] as const;

/** 01·02·03 = 엔진 / 표현 / 기록 (톤과 기술 역할 분리) */
export const DIFFERENCE_LAYERS: ReadonlyArray<{
  badge: string;
  line1: string;
  line2: string;
}> = [
  {
    badge: "엔진",
    line1: "생일 + 태어난 시(時) 반영",
    line2: "일간·시주·12시진까지\n규칙으로 계산",
  },
  {
    badge: "표현",
    line1: "우리말 풀이 + 「왜?」",
    line2: "점수·오늘의 결마다\n명리 근거를 펼쳐 확인",
  },
  {
    badge: "기록",
    line1: "매일 저장되는 흐름",
    line2: "7일 패턴·어제 비교로\n나만의 리듬이 선명해짐",
  },
];
