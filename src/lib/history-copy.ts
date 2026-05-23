/**
 * 운명비서 `/history` (나의 패턴) 카피 시트 v1
 * Figma 시안 · UI 구현의 단일 출처
 */

import type { ToneKey } from "@/lib/today-tone-types";

export type HistoryFilter = "all" | "today" | "saju" | "saved" | "rising";

/** 페이지 메타 */
export const HISTORY_PAGE_META = {
  name: "나의 패턴",
  tone: "차분함 · 정제됨 · 리포트형 · 프리미엄",
  essence: "/history는 운세 보관함이 아니라, 내 결을 발견하는 화면이다.",
} as const;

/** 개발·Figma 컴포넌트 ID */
export const HISTORY_COMPONENT_IDS = {
  header: "HistoryHeader",
  patternReport: "PatternReportSummary",
  recurringTones: "RecurringTones",
  last7Days: "Last7Days",
  savedSentences: "SavedSentencesList",
  recentRecords: "RecentRecordsList",
  detail: "HistoryDetail",
  pageEmpty: "HistoryEmptyState",
  sectionEmpty: "SectionEmptyState",
  filter: "HistoryFilterDropdown",
} as const;

/** §1 헤더 */
export const HISTORY_HEADER_COPY = {
  back: "←",
  backBrand: "← 운명비서",
  title: "나의 패턴",
  subtitle: "이 브라우저에 쌓인 흐름입니다. 기기를 바꾸면 기록이 이어지지 않습니다.",
  filterLabelEn: "FILTER",
  filterTrigger: "필터 ▾",
  loading: "패턴을 불러오는 중...",
} as const;

export const HISTORY_FILTER_OPTIONS: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "today", label: "오늘의 흐름만" },
  { value: "saju", label: "사주 리포트만" },
  { value: "saved", label: "저장한 문장만" },
  { value: "rising", label: "상승한 날만" },
];

/** 행동 가이드 (CARD 03) 라벨 */
export const ACTION_GUIDE_COPY = {
  dosLabel: "권하는 움직임",
  dontsLabel: "늦추는 편이 좋은 것",
} as const;

/** `/today` 입력 전(empty) · 홈 TODAY PREVIEW */
export const TODAY_EMPTY_COPY = {
  badgeCommon: "공통 흐름",
  badgeMyToday: "내 사주 기준",
  badgeTodayAll: "오늘 전체",
  badgeSample: "예시",
  title: "오늘의 흐름",
  ctaLead: "지금은 일반 흐름이에요",
  ctaAction: "내 결로 보려면 생년월일·시 입력",
  ctaButton: "1초 입력하고 내 흐름 보기",
  scoreDisclaimer: "아래 숫자는 내 점수가 아니라, 오늘 하루 전체의 예시 흐름입니다.",
  scoreSectionLabel: "오늘 전체 · 예시 점수",
  previewOneLine: "오늘의 한 줄 (미리보기)",
  afterInputNote: "점수·어제 비교·행동 가이드는 입력 후 내 사주 기준으로 계산됩니다.",
  formTitle: "내 결로 읽기",
  formSubtitle:
    "지금 보신 흐름은 오늘 전체 기준입니다. 생년월일과 태어난 시를 넣으면 내 점수·시간대 흐름이 더 정밀해집니다.",
  formSubmit: "내 흐름 보기",
} as const;

/** 홈 PATTERN 카드 미리보기 */
export const HOME_PATTERN_COPY = {
  emptyInsight: "오늘부터 패턴이 쌓이기 시작해요",
  emptySub: "매일의 결이 쌓이면 여기에 주간 패턴이 보입니다",
  emptyNudgeWithProfile: "오늘 한 번만 읽어도 첫 점이 찍힙니다",
  emptyNudgeNoProfile: "생년월일·태어난 시를 넣고 읽으면 첫 점이 찍힙니다",
  emptyCta: "오늘운세 읽고 시작하기",
  emptyStatsMuted: "아직 기록이 없어요 · 오늘부터 채워집니다",
  startedInsight: "오늘부터 패턴이 쌓이기 시작했어요",
  startedSub(toneLabel: string) {
    return `첫 기록 · ${toneLabel}의 결`;
  },
  warmupInsight(daysLeft: number) {
    return `${daysLeft}일만 더 읽으면\n주간 패턴이 또렷해집니다`;
  },
  dominantInsight(count: number, windowDays: number, toneLabel: string) {
    return `최근 ${windowDays}일 중 ${count}일이\n'${toneLabel}'의 결이었어요`;
  },
  runnerUp(toneLabel: string, count: number) {
    return `그다음은 ${toneLabel} · ${count}일`;
  },
  statsLine(recordDays: number, sajuCount: number, todayCount: number) {
    return `기록 ${recordDays}일 · 사주 ${sajuCount} · 오늘 ${todayCount}`;
  },
} as const;

/** 홈 WEEKLY 카드 */
export const HOME_WEEKLY_COPY = {
  todayFocus(todayDay: string, toneLabel: string) {
    return `오늘은 ${todayDay} · ${toneLabel}의\n흐름이 가장 또렷합니다`;
  },
  warmup(todayDay: string, toneLabel: string, daysLeft: number) {
    return `오늘은 ${todayDay} · ${toneLabel}입니다.\n${daysLeft}일만 더 읽으면 주간 패턴이 보입니다`;
  },
  todayIsCenter(todayDay: string, toneLabel: string) {
    return `오늘 ${todayDay} · ${toneLabel}의 결이\n이번 주의 중심에 놓여 있습니다`;
  },
  keyDayCenter(keyDay: string) {
    return `이번 주의 중심은 ${keyDay}에\n가장 또렷하게 놓여 있습니다`;
  },
} as const;

/** §2 PATTERN REPORT */
export const PATTERN_REPORT_COPY = {
  sectionLabel: "PATTERN REPORT",
  headline: "나의 흐름은 이렇게 쌓이고 있어요",
  topTonesPrefix: "최근 7일, 가장 자주 나타난 결은",
  topTonesSuffix: "입니다",
  formatTopTones(tones: string[]) {
    return `${this.topTonesPrefix} ${tones.join(" · ")} ${this.topTonesSuffix}`;
  },
} as const;

/** 주간 보조 한 줄 (룰 기반) */
export const WEEK_INSIGHT_COPY = {
  balance: "이번 주는 밀기보다 균형을 맞추는 흐름이 더 자주 나타났습니다",
  move: "이번 주는 머무는 자리보다 움직이는 자리로 흐름이 흘렀습니다",
  rest: "이번 주는 채우기보다 비우는 결이 더 또렷했습니다",
  volatile: "이번 주는 결이 자주 바뀌며 감정의 폭이 넓었습니다",
  calm: "이번 주는 잔잔한 흐름이 길게 이어진 한 주였습니다",
  mixed: "이번 주는 여러 결의 흐름이 번갈아 나타났습니다",
  /** 데이터 부족 시 (부분 빈 상태) */
  warmup: "오늘의 흐름을 읽기 시작하면 이곳에 주간 패턴이 쌓입니다",
  oneDay: "이틀 이상 읽으면 이번 주의 흐름이 더 또렷해집니다",
} as const;

/** §3 RECURRING TONES */
export const RECURRING_TONES_COPY = {
  sectionLabel: "RECURRING TONES",
  headline: "반복되는 결",
  sub: "최근 흐름에서 자주 나타난 결을 모아두었습니다",
  empty: "아직 반복되는 결이 충분히 모이지 않았습니다",
  chipSelectedSuffix: "· 선택됨",
  filterClear: "필터 해제",
  toneLabels: ["정리", "조율", "결정", "거리두기", "상승", "회복"] as const,
} as const;

/** §4 LAST 7 DAYS */
export const LAST_7_DAYS_COPY = {
  sectionLabel: "LAST 7 DAYS",
  headline: "최근 7일의 흐름",
  empty: "최근 7일 기록이 아직 충분하지 않습니다. 오늘의 흐름을 읽으면 흐름이 쌓이기 시작합니다",
  /** 기록 없는 날이 많을 때 (4일 이상) */
  warmupHint: "매일 오늘운세를 읽으면 패턴이 쌓여요 🌿",
  /** 오늘만 쌓인 경우 */
  dailyAccumulate: "오늘 운세를 읽을 때마다 그날 한 줄이 쌓입니다. 내일 다시 읽으면 여기에 하루가 더해져요.",
  /** 카드 하단 고정 안내 */
  footerHint: "이틀 이상 읽으면 이번 주의 흐름이 더 또렷해집니다",
} as const;

/** 최근 기록 카드 안 — 저장 문장 소제목 */
export const RECENT_RECORDS_SAVED_SUBCOPY = {
  subhead: "저장한 문장",
  viewAll: "전체 저장 문장 보기 ›",
} as const;

/** 어제→오늘 우선 10조합 (카피 시트 §4, tone-engine과 동기화 권장) */
export const PRIORITY_TRANSITION_COPY: Partial<
  Record<ToneKey, Partial<Record<ToneKey, string>>>
> = {
  TUNE: { TUNE: "어제의 결이 오늘도 부드럽게 이어집니다" },
  ORGANIZE: { TUNE: "마무리한 자리에서 부드러운 흐름이 자랍니다" },
  DECIDE: { TUNE: "어제의 판단을 오늘은 조율로 다듬는 날입니다" },
  DISTANCE: {
    DECIDE: "한 발 떨어졌던 자리에서 다시 움직이는 흐름입니다",
    DISTANCE: "오늘도 한 발 떨어진 자리에서 흐름이 잡힙니다",
  },
  RECOVER: { RISE: "충전된 흐름이 오늘 가볍게 열립니다" },
  RISE: { RECOVER: "어제의 움직임을 잠시 가라앉히는 날입니다" },
  ORGANIZE: { ORGANIZE: "어제의 마무리가 오늘도 이어지는 하루입니다" },
  DECIDE: { DECIDE: "결정의 결이 오늘도 또렷하게 이어집니다" },
  RECOVER: { TUNE: "충전된 마음이 오늘의 균형으로 이어집니다" },
};

/** §5 SAVED SENTENCES */
export const SAVED_SENTENCES_COPY = {
  sectionLabel: "SAVED SENTENCES",
  headline: "저장한 문장",
  empty: "아직 저장한 문장이 없습니다. 오늘의 흐름에서 마음에 닿는 문장을 저장해보세요",
  viewAll: "전체 저장 문장 보기 ›",
  pageSub: "오늘의 흐름에서 마음에 닿은 문장을 모았습니다",
  pageEmptyCta: "오늘의 흐름 읽기",
  formatMeta(shortDate: string, toneLabel: string) {
    return `${shortDate} · ${toneLabel}`;
  },
} as const;

/** 결별 기본 저장 문장 시드 */
export const TONE_SAVE_SENTENCE_SEEDS: Record<string, string> = {
  정리: "정답보다 결이 먼저다",
  조율: "맞는 말보다 부드러운 말이 멀리 간다",
  결정: "결정이 빠를수록 마음은 가볍다",
  거리두기: "한 발 멀어지면 더 많이 보인다",
  상승: "오늘은 가벼운 한 걸음이 멀리 간다",
  회복: "쉼은 가장 단단한 다음 흐름이다",
};

/** §6 RECENT RECORDS */
export const RECENT_RECORDS_COPY = {
  sectionLabel: "RECENT RECORDS",
  headline: "최근 기록",
  readToday: "오늘 읽기 ›",
  viewDetail: "자세히 보기 ›",
  loadMore: "더 보기",
  delete: "삭제",
  filterNoMatch: "선택한 필터에 맞는 기록이 없습니다",
  empty: "아직 기록이 없습니다. 오늘의 흐름을 읽으면 자동으로 저장됩니다",
  formatDateLine(shortDate: string, weekday: string, toneLabel: string) {
    return `${shortDate} (${weekday}) · ${toneLabel}`;
  },
  formatScores(overall: number, relation: number, decision: number) {
    return `종합 ${overall} · 관계 ${relation} · 결정 ${decision}`;
  },
} as const;

/** §7 상세 페이지 */
export const HISTORY_DETAIL_COPY = {
  back: "← 나의 패턴",
  invalidDate: "날짜 형식이 올바르지 않습니다.",
  backToPattern: "나의 패턴으로 돌아가기",
  noRecordSuffix: "기록이 없습니다.",
  readToday: "오늘의 흐름 읽기",
  readTodayAgain: "오늘의 흐름 다시 읽기",
  oneLiner: "오늘의 한 줄",
  flow: "오늘의 흐름",
  scores: "점수",
  overallMeta: "종합",
  areas: { relation: "관계", decision: "결정", emotion: "감정", balance: "균형" },
  remember: "오늘 기억할 말",
  compareSection: "어제와 오늘",
  yesterdayOneLiner: "어제의 한 줄:",
  save: "저장하기",
  unsave: "저장 해제",
  share: "공유",
} as const;

/** §8 페이지 빈 상태 */
export const HISTORY_PAGE_EMPTY_COPY = {
  sectionLabel: "PATTERN REPORT",
  headline: "아직 패턴이 충분히 쌓이지 않았어요",
  body: "오늘의 흐름을 3일 이상 읽으면\n반복되는 결과 키워드가 보이기 시작합니다",
  cta: "오늘의 흐름 보러 가기",
  partialHeadline: "패턴이 조금씩 쌓이고 있어요",
  partialBody(daysLeft: number) {
    return `${daysLeft}일만 더 읽으면 반복되는 결과 키워드가 보입니다.`;
  },
} as const;

/** §9 섹션별 빈 상태 */
export const HISTORY_SECTION_EMPTY_COPY = {
  recurringTones: RECURRING_TONES_COPY.empty,
  last7Days: LAST_7_DAYS_COPY.empty,
  savedSentences: SAVED_SENTENCES_COPY.empty,
  recentRecords: RECENT_RECORDS_COPY.empty,
} as const;

/** 빈 상태 섹션 미리보기 (구조 안내) */
export const HISTORY_PREVIEW_COPY = {
  recurringTones: "여기에 자주 나타나는 결 키워드가 쌓입니다",
  last7Days: "최근 7일의 흐름이 이곳에 이어집니다",
  savedSentences: "저장한 문장이 이곳에 모입니다",
  recentRecords: "읽은 날의 흐름이 자동으로 기록됩니다",
  sampleQuote: "맞는 말보다 부드러운 말이 멀리 간다",
  sampleDate: "05.19 · 조율",
  sampleRecordLine: "부드러움이 오늘의 가장 단단한 무기입니다",
  sampleScores: "종합 · · 관계 · · 결정 ·",
} as const;

/** §10 상태 라벨 */
export const HISTORY_STATUS_LABELS = {
  dots: "●●●●● ~ ●○○○○ (종합 점수 5단계)",
  tones: RECURRING_TONES_COPY.toneLabels,
  statuses: ["안정", "상승", "흔들림", "정리", "회복", "조율"] as const,
} as const;

/** §11 인터랙션 */
export const HISTORY_TOAST_COPY = {
  saved: "저장되었습니다",
  unsaved: "저장이 해제되었습니다",
  favorited: "즐겨찾기에 추가되었습니다",
  unfavorited: "즐겨찾기에서 제외되었습니다",
  shared: "공유 카드가 준비되었습니다",
  deleteConfirm: "이 기록을 삭제할까요?",
  deleted: "기록이 삭제되었습니다",
  filterApplied(tone: string) {
    return `${tone} 흐름만 보여드립니다`;
  },
  filterCleared: "전체 흐름을 다시 보여드립니다",
} as const;

/** §12 하단 (Optional) */
export const HISTORY_FOOTER_COPY = {
  note: "운명비서는 매일의 흐름을 조용히 기록하고 있어요",
} as const;

/** OTHER RECORDS — 사주·타로 보조 영역 */
export const HISTORY_ARCHIVE_COPY = {
  sectionLabel: "OTHER RECORDS",
  headline: "사주 · 타로 기록",
  body: "오늘의 흐름 외의 기록도 함께 정리됩니다.",
  emptyBody: "지금은 비어 있어요.",
  sajuCount: (n: number) => `사주 ${n}건`,
  tarotCount: (n: number) => `타로 ${n}건`,
} as const;

/** §13 톤 가이드 (디자이너 참고) */
export const HISTORY_TONE_GUIDE = {
  recommend: ["결", "흐름", "패턴", "균형", "정리", "조율", "쌓이다", "또렷해지다"],
  avoid: ["운세 기록", "운세 히스토리", "점수 기록", "행운", "불운", "100점 만점", "0점"],
  sentenceStyle: "~에 가깝습니다 / ~한 편이 좋습니다 / ~로 이어집니다",
  forbid: "당신은 ~할 것입니다 / 반드시 / 무조건 / 분명히",
  address: "무인칭 선호, 당신은 절제",
} as const;
