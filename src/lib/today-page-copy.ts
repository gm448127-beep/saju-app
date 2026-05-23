/** `/today` 화면 정보 위계·탭·카드 라벨 */

export const TODAY_TAB_COPY = {
  summary: { key: "summary" as const, label: "핵심만", hint: "한 줄·점수·흐름·행동" },
  detail: { key: "detail" as const, label: "자세히", hint: "브리핑·12시진·상세 가이드" },
  myeongsik: { key: "myeongsik" as const, label: "근거", hint: "명식·합충·트리거" },
};

export const TODAY_READING_STEPS = [
  { id: "sentence", step: 1, title: "한 줄 요약", hint: "오늘의 결" },
  { id: "scores", step: 2, title: "4축 점수", hint: "관계·결정·감정·균형" },
  { id: "flow", step: 3, title: "오늘의 흐름", hint: "오전·오후·저녁·밤" },
  { id: "action", step: 4, title: "행동 가이드", hint: "할 것 · 피할 것" },
  { id: "hourly", step: 5, title: "시간대별 운세", hint: "12시진" },
] as const;

export type TodayCardPriority = "primary" | "secondary" | "optional";

export const TODAY_CARD_META: Record<
  string,
  { step?: number; title: string; priority: TodayCardPriority }
> = {
  sentence: { step: 1, title: "오늘의 한 줄", priority: "primary" },
  scores: { step: 2, title: "4축 점수", priority: "primary" },
  flow: { step: 3, title: "오늘의 흐름", priority: "primary" },
  action: { step: 4, title: "행동 가이드", priority: "primary" },
  hourly: { step: 5, title: "시간대별 운세", priority: "secondary" },
};

/** 카드 공통 — 얇은 베이지 배경 */
export const TODAY_CARD_SURFACE =
  "scroll-mt-24 rounded-[26px] border border-[#E8D7C4] bg-[#FAF5ED] px-5 py-6 shadow-[0_4px_18px_rgba(139,111,71,0.06)]";
