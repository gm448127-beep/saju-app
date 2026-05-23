/** `/today` 화면 정보 위계·탭·카드 라벨 */

export const TODAY_TAB_COPY = {
  summary: { key: "summary" as const, label: "핵심만", hint: "3분 · 한 줄·행동·흐름" },
  detail: { key: "detail" as const, label: "자세히", hint: "점수·12시진·가이드 전체" },
  myeongsik: { key: "myeongsik" as const, label: "근거", hint: "명식·합충·트리거" },
};

export const TODAY_READING_STEPS = [
  {
    id: "sentence",
    step: 1,
    title: "오늘의 한 줄",
    hint: "하루의 결",
  },
  {
    id: "action",
    step: 2,
    title: "행동 가이드",
    hint: "할 것 · 피할 것",
  },
  {
    id: "flow",
    step: 3,
    title: "오늘의 흐름",
    hint: "왜 그런지",
  },
] as const;

export type TodayCardPriority = "primary" | "secondary" | "optional";

export const TODAY_CARD_META: Record<
  string,
  { step?: number; title: string; priority: TodayCardPriority }
> = {
  sentence: { step: 1, title: "오늘의 한 줄", priority: "primary" },
  action: { step: 2, title: "지금 이렇게 움직이세요", priority: "primary" },
  flow: { step: 3, title: "오늘의 흐름", priority: "secondary" },
  emotion: { title: "감정·마음 포인트", priority: "optional" },
  hourly: { step: 4, title: "시간대별 흐름", priority: "secondary" },
};
