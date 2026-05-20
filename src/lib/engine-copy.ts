/**
 * 운명비서 해석 엔진·차별화 카피 (홈·/today 등 공용)
 * — 실제 구현: /api/today 규칙 엔진 + today-tone 템플릿 (LLM 아님)
 */

/** 대표 슬로건 (포지셔닝) */
export const PRIMARY_TAGLINE = "한마디만 말고, 왜 그런지까지";

/** 기술 한 줄 — 신뢰·보조 설명 */
export const ENGINE_ONE_LINER =
  "내 일간 × 오늘 일진의 십성과 사주 원국의 천·지 합·충을 규칙으로 계산해 5축 점수와 「오늘의 결」을 만듭니다. (매번 새로 지어내는 AI 문장이 아닙니다)";

/** 엔진이 쓰지 않는 것 — 과장 방지 */
export const ENGINE_SCOPE_NOTE =
  "오늘의 흐름에는 신살·LLM을 넣지 않습니다. 신살·대운은 사주 리포트, 깊은 대화는 AI 상담에서 이어집니다.";

/** 01·02·03 = 엔진 / 표현 / 기록 (톤과 기술 역할 분리) */
export const DIFFERENCE_LAYERS: ReadonlyArray<{
  badge: string;
  line1: string;
  line2: string;
}> = [
  {
    badge: "엔진",
    line1: "일간 기준 십성·합·충",
    line2: "같은 생일·같은 날이면\n같은 점수·같은 결",
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
