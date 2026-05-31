/** `/today` 화면 정보 위계·카드 라벨 — docs/content-constitution-1.0.md §6·§16 */

/** 무료 ↔ 유료 전환 티저 (카피만 변경, 디자인 동일) */
export const TODAY_DECISION_TEASER = {
  title: "오늘, 선택 하나 앞에 서 있을 수 있어요.",
  body: [
    "4단까지 읽었다면",
    "이제 사업·돈·관계·연애 중",
    "오늘 가장 영향력이 큰 영역을",
    "이어서 정리해 뒀어요.",
    "",
    "놓치고 있는 것,",
    "지금 가장 위험한 선택,",
    "밀어붙여도 되는 시점까지",
    "한 번에 확인해 보세요.",
  ],
  cta: "상세 리포트 읽기",
  hint: "사업, 돈, 인간관계, 연애 중\n오늘 가장 영향력이 큰 영역을 확인하세요.",
} as const;

export const TODAY_READING_STEPS = [
  { id: "flow", step: 1, title: "오늘의 흐름", hint: "오늘 어떤 흐름인가" },
  { id: "timing", step: 2, title: "행동하기 좋은 타이밍", hint: "언제 움직일 것인가" },
  { id: "mistake", step: 3, title: "실수할 가능성", hint: "어디서 실수하는가" },
  { id: "suggestion", step: 4, title: "오늘 비서의 제안", hint: "오늘 뭘 하면 좋은가" },
  { id: "premium", step: 5, title: "상세 리포트", hint: "분야별·결정 포인트" },
  { id: "basis", step: 6, title: "전문가 근거", hint: "해석 신뢰" },
] as const;

export type TodayCardPriority = "primary" | "secondary" | "optional";

export const TODAY_CARD_META: Record<
  string,
  { step?: number; title: string; priority: TodayCardPriority }
> = {
  flow: { step: 1, title: "오늘의 흐름", priority: "primary" },
  timing: { step: 2, title: "행동하기 좋은 타이밍", priority: "primary" },
  mistake: { step: 3, title: "실수할 가능성이 높은 순간", priority: "primary" },
  suggestion: { step: 4, title: "오늘 비서의 제안", priority: "primary" },
  premium: { step: 5, title: "상세 리포트", priority: "secondary" },
  basis: { step: 6, title: "전문가 근거", priority: "optional" },
};

/** 카드 공통 — 얇은 베이지 배경 */
export const TODAY_CARD_SURFACE =
  "scroll-mt-24 rounded-[26px] border border-[#E8D7C4] bg-[#FAF5ED] px-5 py-6 shadow-[0_4px_18px_rgba(139,111,71,0.06)]";
