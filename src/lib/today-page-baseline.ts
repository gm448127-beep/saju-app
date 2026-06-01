/**
 * `/today` 화면 — 무료/유료 분리 이전 기준 스냅샷
 *
 * 이후 UI가 바뀔 때 “예전에 뭐가 있었는지” 비교·복원용으로 유지합니다.
 * 실제 렌더는 `TodayFiveCardReport.tsx` + (과거) `page.tsx` 탭 분기를 참고하세요.
 *
 * @see src/components/TodayFiveCardReport.tsx
 * @updated 2026-05 — TodaySecretaryReport(무료/유료 스크롤) 도입 이전
 */

/** 탭 3개 — sticky 탭 바 */
export const TODAY_BASELINE_TABS = {
  summary: { key: "summary" as const, label: "핵심", hint: "한 줄·점수·흐름·행동" },
  detail: { key: "detail" as const, label: "자세히", hint: "브리핑·12시진·상세 가이드" },
  myeongsik: { key: "myeongsik" as const, label: "근거", hint: "명식·합충·트리거" },
} as const;

/** 핵심 탭 — 5카드 읽기 순서 (`TodayFiveCardReport`) */
export const TODAY_BASELINE_READING_STEPS = [
  { id: "sentence", step: 1, title: "오늘의 한 줄", hint: "오늘의 결" },
  { id: "scores", step: 2, title: "4축 점수", hint: "관계·결정·감정·균형" },
  { id: "flow", step: 3, title: "오늘의 흐름", hint: "오전·오후·저녁·밤" },
  { id: "action", step: 4, title: "행동 가이드", hint: "할 것 · 피할 것" },
  { id: "hourly", step: 5, title: "시간대별 운세", hint: "12시진" },
] as const;

/** 핵심 탭 카드 메타 */
export const TODAY_BASELINE_CARD_META = {
  sentence: { step: 1, title: "오늘의 한 줄", priority: "primary" as const },
  scores: { step: 2, title: "4축 점수", priority: "primary" as const },
  flow: { step: 3, title: "오늘의 흐름", priority: "primary" as const },
  action: { step: 4, title: "행동 가이드", priority: "primary" as const },
  hourly: { step: 5, title: "시간대별 운세", priority: "secondary" as const },
} as const;

/**
 * 자세히 탭 섹션 순서 (page.tsx 인라인 컴포넌트)
 * - TodayBriefingReport (브리핑·종합점수·executiveSummary)
 * - DomainScoreSummary (영역별 점수)
 * - TodayStatsSection (5대운)
 * - DetailedFortuneReport (분야별 상세)
 * - HourlyFlowSection (12시진 전체)
 * - TimeAdviceSection
 * - TodayActionGuideSection (상세 dos/donts, luckyItems)
 */
export const TODAY_BASELINE_DETAIL_SECTIONS = [
  "TodayBriefingReport",
  "DomainScoreSummary",
  "TodayStatsSection",
  "DetailedFortuneReport",
  "HourlyFlowSection",
  "TimeAdviceSection",
  "TodayActionGuideSection",
] as const;

/** 근거 탭 */
export const TODAY_BASELINE_MYEOngSIK_SECTIONS = ["MyeongsikReport", "SajuTriggerSection"] as const;

/** 핵심 탭 부가 UI */
export const TODAY_BASELINE_SUMMARY_CHROME = [
  "TodayPageHeader",
  "TodayScoreBasisBar",
  "저장·공유·PDF",
  "TodayReadingGuide",
  "저장하기 / 어제와 비교 / 공유 / 기록 툴바",
  "TomorrowPreviewTeaser",
  "MyeongriBasisToggle (흐름 카드 내)",
] as const;

/** 데이터 소스 — `/api/today` + `dailyReport` (DailyFortuneContent) */
export const TODAY_BASELINE_DATA_NOTES = {
  mainReportComponent: "TodayFiveCardReport",
  pageEntry: "src/app/today/page.tsx (탭 분기)",
  api: "/api/today",
  personalizedFlag: "result.dailyReport 존재",
  hourlyInSummary: "showSijinDetails=false, onOpenDetail → 자세히 탭",
} as const;

/** 2026-05 무료/유료 개편 이후 현재 구조 (변경 추적용) */
export const TODAY_CURRENT_STRUCTURE_NOTE =
  "TodaySecretaryReport: 무료 3블록 → 유료 티저 → 결정포인트·분야별 아코디언·피할선택·행운시간·조언 → 12시진·시간행동 → 전문가 근거. 화면 점수 UI 숨김 → @see today-score-ui-archive.ts";

/** 2026-05 운명비서 문체 가이드 */
export const TODAY_SECRETARY_VOICE_NOTE = {
  module: "src/lib/today-secretary-voice.ts",
  appliedTo: [
    "today-secretary-prompts.ts (LLM)",
    "today-secretary-copy-engine.ts (규칙·후처리)",
    "today-expert-basis-guide.ts",
    "today-content-engine.ts (톤 가이드)",
    "today-secretary-report.ts (결정·분야 카피)",
  ],
} as const;

/** 2026-05 AI 카피 개편 — 프롬프트·엔진 */
export const TODAY_SECRETARY_COPY_NOTE = {
  prompts: "src/lib/today-secretary-prompts.ts",
  voice: "src/lib/today-secretary-voice.ts",
  engine: "src/lib/today-secretary-copy-engine.ts",
  apiField: "secretaryCopy",
  freeKeys: ["coreMessage", "flowNarrative", "warningLine"],
  premiumKeys: ["shake", "myeongri", "strategy"],
/** 점수 UI 제거 (2026-05) — 복원 시 today-score-ui-archive.ts 참고 */
export const TODAY_SCORE_UI_NOTE = {
  hidden: true,
  archive: "src/lib/today-score-ui-archive.ts",
  stripHelper: "src/lib/today-score-ui-copy.ts stripScoreMentions",
  keptComponents: [
    "TodayScoreBasisBar.tsx",
    "TodayStatsSection.tsx",
    "TodayFiveCardReport.tsx",
    "AxisScorePanel.tsx",
  ],
} as const;
