import { buildTodayExpertBasisGuide } from "@/lib/today-expert-basis-guide";
export { buildTodayExpertBasisGuide } from "@/lib/today-expert-basis-guide";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import type { TodaySecretaryGeneratedCopy } from "@/lib/today-secretary-prompts";
import { buildTodaySecretaryCopySync } from "@/lib/today-secretary-copy-engine";
import { applySecretaryVoice, applySecretaryVoiceToCopy } from "@/lib/today-secretary-voice";

type DomainItem = {
  key: string;
  label: string;
  desc?: string;
  score: number;
  grade?: string;
  overview?: string;
  positive?: string;
  cautionText?: string;
  action?: string;
  avoid?: string;
  basis?: string;
  caution?: string;
};

type HourlySlot = {
  hour?: string;
  range?: string;
  score?: number;
  label?: string;
  sipsin?: string;
};

type ActionGuide = {
  text: string;
  reason?: string;
  action?: string;
};

export type TodayApiResult = Record<string, unknown> & {
  scores?: Record<string, number>;
  briefing?: {
    oneLine?: string;
    headline?: string;
    focus?: string;
    caution?: string;
    executiveSummary?: string[];
  };
  summary?: string;
  warning?: string;
  tip?: string;
  todayQuote?: string | { text?: string; author?: string };
  todaySipsin?: string;
  todayJiSipsin?: string;
  sipsinTitle?: string;
  relationDetail?: string;
  myElement?: string;
  todayGanOhaeng?: string;
  myDayGan?: string;
  myDayBranch?: string;
  todayGan?: string;
  todayJi?: string;
  pillars?: Record<string, string>;
  domainScores?: DomainItem[];
  detailedFortunes?: DomainItem[];
  todayDonts?: string[];
  todayDontsDetailed?: ActionGuide[];
  todayDos?: string[];
  todayDosDetailed?: ActionGuide[];
  luckyItems?: Array<{ emoji: string; label: string; value: string; detail?: string; use?: string }>;
  hourlyFlow?: HourlySlot[];
  hourlyFlowIntro?: string;
  hourlyPeak?: HourlySlot;
  hourlyCaution?: HourlySlot;
  timeAdvice?: Array<{ time?: string; range?: string; advice?: string; goodFor?: string }>;
  myeongsikReport?: {
    title?: string;
    natal?: { pillars?: Array<{ label: string; value: string }> };
    today?: { gan?: string; ji?: string; sipsin?: string; branchSipsin?: string };
    triggers?: Array<{ label?: string; desc?: string; title?: string; description?: string }>;
    legacyLines?: string[];
  };
  sajuTriggers?: Array<{ formula?: string; explanation?: string; title?: string }>;
  gearAnalysis?: string[];
  /** AI/규칙 엔진이 생성한 무료·유료 카피 (API 응답에 포함) */
  secretaryCopy?: TodaySecretaryGeneratedCopy;
  /** 원국 오행 개수 (명리 요약 표) */
  ohaengCount?: Record<string, number>;
};

export type TodayFreeContent = {
  coreMessage: string;
  flowNarrative: string;
  warningLine: string;
};

export type TodaySecretaryPremiumAdvice = {
  shake: string;
  myeongri: string;
  strategy: string;
};

export type TodayDecisionPoint = {
  topic: string;
  guidance: string;
};

export type TodayDomainCard = {
  key: string;
  label: string;
  score: number;
  grade: string;
  summary: string;
  action: string;
};

export type TodayLuckyTime = {
  rangeLabel: string;
  hourLabel: string;
  recommendedAction: string;
};

export type TodayExpertBasisBlock = {
  id: string;
  title: string;
  lines: string[];
};

const DOMAIN_CARD_KEYS = [
  { key: "career", label: "일·사업" },
  { key: "wealth", label: "돈" },
  { key: "people", label: "인간관계" },
  { key: "love", label: "연애" },
  { key: "luck", label: "행운" },
] as const;

const DECISION_TOPIC_POOL: Array<{ topic: string; pickWhen: (scores: Record<string, number>) => number }> = [
  { topic: "계약", pickWhen: (s) => (s.career ?? 60) * 0.4 + (100 - (s.overall ?? 60)) * 0.3 },
  { topic: "인간관계", pickWhen: (s) => (s.love ?? 60) * 0.5 + (s.luck ?? 60) * 0.2 },
  { topic: "연락", pickWhen: (s) => (s.love ?? 60) * 0.45 + (s.overall ?? 60) * 0.25 },
  { topic: "투자", pickWhen: (s) => (s.wealth ?? 60) * 0.55 + (100 - (s.wealth ?? 60)) * 0.15 },
  { topic: "이직", pickWhen: (s) => (s.career ?? 60) * 0.5 + (100 - (s.career ?? 60)) * 0.2 },
  { topic: "사업 결정", pickWhen: (s) => (s.career ?? 60) * 0.35 + (s.wealth ?? 60) * 0.35 },
];

function findDomain(result: TodayApiResult, key: string): DomainItem | undefined {
  if (key === "luck") {
    return (
      result.detailedFortunes?.find((item) => item.key === "luck") ||
      result.detailedFortunes?.find((item) => item.key === "hope") ||
      result.domainScores?.find((item) => item.key === "hope") ||
      result.domainScores?.find((item) => item.key === "luck")
    );
  }
  return (
    result.detailedFortunes?.find((item) => item.key === key) ||
    result.domainScores?.find((item) => item.key === key)
  );
}

function domainCardScore(result: TodayApiResult, key: string, domain?: DomainItem): number {
  if (domain?.score != null) return domain.score;
  const scores = result.scores ?? {};
  if (key === "people") return scores.love ?? 60;
  if (key === "luck") return scores.luck ?? 60;
  if (key === "career") return scores.career ?? 60;
  if (key === "wealth") return scores.wealth ?? 60;
  if (key === "love") return scores.love ?? 60;
  return 60;
}

function firstGuideLine(guide?: string) {
  if (!guide?.trim()) return "";
  return guide.split("\n")[0]?.replace(/^·\s*/, "").trim() ?? "";
}

function splitGuideLines(guide?: string) {
  if (!guide?.trim()) return [];
  return guide.split("\n").map((line) => line.replace(/^·\s*/, "").trim()).filter(Boolean);
}

function formatHourRange(slot?: HourlySlot): string {
  if (!slot?.range) return slot?.hour ?? "오늘 중";
  const parts = slot.range.split("-").map((part) => part.trim());
  if (parts.length === 2) return `${parts[0]}~${parts[1]}`;
  return slot.range;
}

function buildDecisionGuidance(topic: string, result: TodayApiResult, report: DailyFortuneContent): string {
  const sipsin = result.todaySipsin ?? "오늘의 기운";
  const career = result.scores?.career ?? 60;
  const wealth = result.scores?.wealth ?? 60;
  const love = result.scores?.love ?? 60;
  const templates: Record<string, string> = {
    계약: `계약·서명은 조건 문구부터 오늘 안에 다시 읽어 보세요. ${sipsin} 흐름에서는 ${career >= 65 ? "속도를 내도 되지만" : "서두르기보다"} 담당자·기한·위약을 적어 두는 게 나아요.`,
    "인간관계": `인간관계에서는 ${report.actionGuide.relationTip} 상대 반응을 재촉하기보다 내가 지킬 선을 먼저 정해 보세요.`,
    연락: `연락은 '지금 보낼 메시지 한 줄'만 적고 보내 보세요. ${love >= 65 ? "짧고 분명한 안부가 잘 맞아요." : "감정 섞인 장문은 하루 미뤄도 괜찮아요."}`,
    투자: `돈·투자는 ${report.actionGuide.workMoneyTip} 검증 없이 키우는 결정은 오늘은 피하세요.`,
    이직: `이직·이동은 ${career >= 75 ? "지금 자리에서 성과 쌓기" : "이력·연봉 조건 정리"}가 먼저예요. 오늘은 지원서 한 줄만 손봐도 충분해요.`,
    "사업 결정": `사업·프로젝트는 ${result.briefing?.focus ?? result.tip ?? "작게 실행하고 피드백 받기"}가 오늘 실전 답에 가까워요.`,
  };
  return applySecretaryVoice(templates[topic] ?? `${topic}은 오늘 ${report.toneLabel} 흐름에서 ${report.actionGuide.workMoneyTip}`);
}

function getSecretaryCopy(
  result: TodayApiResult,
  report: DailyFortuneContent,
): TodaySecretaryGeneratedCopy {
  if (result.secretaryCopy?.coreMessage) {
    return applySecretaryVoiceToCopy(result.secretaryCopy);
  }
  return buildTodaySecretaryCopySync(result, report);
}

export function buildTodayFreeContent(
  result: TodayApiResult,
  report: DailyFortuneContent,
): TodayFreeContent {
  const copy = getSecretaryCopy(result, report);
  return {
    coreMessage: copy.coreMessage,
    flowNarrative: copy.flowNarrative,
    warningLine: copy.warningLine,
  };
}


export function buildTodayDecisionPoints(
  result: TodayApiResult,
  report: DailyFortuneContent,
): TodayDecisionPoint[] {
  const scores = result.scores ?? {};
  return DECISION_TOPIC_POOL.slice()
    .sort((a, b) => b.pickWhen(scores) - a.pickWhen(scores))
    .slice(0, 4)
    .map(({ topic }) => ({
      topic,
      guidance: buildDecisionGuidance(topic, result, report),
    }));
}

export function buildTodayDomainCards(result: TodayApiResult): TodayDomainCard[] {
  return DOMAIN_CARD_KEYS.map(({ key, label }) => {
    const domain = findDomain(result, key);
    return {
      key,
      label,
      score: domainCardScore(result, key, domain),
      grade: domain?.grade ?? "평",
      summary: applySecretaryVoice(
        domain?.overview ?? domain?.desc ?? `${label} 흐름, 차분히 살펴보는 날이에요.`,
      ),
      action: applySecretaryVoice(
        domain?.action ?? domain?.caution ?? "크게 벌리기보다 확인·정리부터 해 보세요.",
      ),
    };
  });
}

/** 요약 카드(일·사업 등) ↔ API 분야별 상세(직장운 등) */
const DOMAIN_DETAIL_LABEL: Record<string, string> = {
  career: "직장운",
  wealth: "재물운",
  people: "대인운",
  love: "사랑운",
  luck: "행운",
};

const DOMAIN_DETAIL_DESC: Record<string, string> = {
  luck: "기회, 타이밍, 작은 확신이 들어오는 흐름을 보여줍니다.",
};

export type TodayDomainDetailedItem = {
  key: string;
  label: string;
  desc?: string;
  score: number;
  grade?: string;
  overview?: string;
  positive?: string;
  cautionText?: string;
  action?: string;
  avoid?: string;
  basis?: string;
};

export function getDomainDetailedFortune(
  result: TodayApiResult,
  cardKey: string,
  card?: TodayDomainCard,
): TodayDomainDetailedItem | undefined {
  const domain = findDomain(result, cardKey);
  if (!domain && !card) return undefined;

  const score =
    cardKey === "luck" && card?.score != null
      ? card.score
      : domain?.score ?? card?.score ?? domainCardScore(result, cardKey, domain);
  const grade = domain?.grade ?? card?.grade;

  return {
    key: cardKey,
    label: DOMAIN_DETAIL_LABEL[cardKey] ?? domain?.label ?? card?.label ?? cardKey,
    desc: domain?.desc ?? DOMAIN_DETAIL_DESC[cardKey],
    score,
    grade,
    overview: domain?.overview ?? card?.summary,
    positive: domain?.positive,
    cautionText: domain?.cautionText,
    action: domain?.action ?? card?.action,
    avoid: domain?.avoid,
    basis: domain?.basis,
  };
}

export function buildTodayAvoidChoice(result: TodayApiResult, report: DailyFortuneContent): string {
  const detailed = result.todayDontsDetailed?.[0];
  if (detailed?.text) {
    const parts = [detailed.text];
    if (detailed.reason) parts.push(detailed.reason);
    if (detailed.action) parts.push(`대신 ${detailed.action}`);
    return parts.join(" ");
  }
  const dontLines = splitGuideLines(report.actionGuide.donts);
  const primary = dontLines[0]?.replace(/^·\s*/, "") ?? result.todayDonts?.[0];
  const warning = result.warning?.trim();
  if (primary && warning) return `${primary} ${warning}`;
  return applySecretaryVoice(
    primary ?? warning ?? "감정이 올라온 상태에서 내리는 즉흥 결정은 오늘 가장 위험한 선택이에요.",
  );
}

export function buildTodayLuckyTime(result: TodayApiResult, report: DailyFortuneContent): TodayLuckyTime {
  const peak = result.hourlyPeak;
  const timeItem = result.timeAdvice?.[0];
  const dosAction = result.todayDosDetailed?.[0]?.action;
  const rangeLabel = formatHourRange(peak);
  const hourLabel = peak?.hour ? `${peak.hour}${peak.range ? ` (${peak.range}시)` : ""}` : timeItem?.time ?? "오늘 중";

  return {
    rangeLabel,
    hourLabel,
    recommendedAction:
      dosAction ||
      timeItem?.goodFor ||
      timeItem?.advice ||
      firstGuideLine(report.actionGuide.dos) ||
      "준비해 둔 일 하나를 작게 실행해 보세요.",
  };
}

function readQuoteText(quote: TodayApiResult["todayQuote"]): string {
  if (!quote) return "";
  if (typeof quote === "string") return quote.trim();
  return quote.text?.trim() ?? "";
}

export function buildTodaySecretaryPremiumAdvice(
  result: TodayApiResult,
  report: DailyFortuneContent,
): TodaySecretaryPremiumAdvice {
  const copy = getSecretaryCopy(result, report);
  return {
    shake: copy.shake,
    myeongri: copy.myeongri,
    strategy: copy.strategy,
  };
}

/** @deprecated 단일 문단 — UI는 buildTodaySecretaryPremiumAdvice 사용 */
export function buildTodaySecretaryAdvice(result: TodayApiResult, report: DailyFortuneContent): string {
  const { shake, myeongri, strategy } = buildTodaySecretaryPremiumAdvice(result, report);
  return [shake, myeongri, strategy].filter(Boolean).join(" ");
}

export function buildTodayExpertBasisBlocks(result: TodayApiResult): TodayExpertBasisBlock[] {
  /** @deprecated TodayExpertBasisAccordion은 buildTodayExpertBasisGuide 사용 */
  const blocks: TodayExpertBasisBlock[] = [];

  const sajuLines = [
    result.myDayGan ? `일간: ${result.myDayGan}` : null,
    result.myDayBranch ? `일지: ${result.myDayBranch}` : null,
    result.todayGan ? `오늘 천간: ${result.todayGan}` : null,
    result.todayJi ? `오늘 지지: ${result.todayJi}` : null,
    result.pillars?.day ? `일주: ${result.pillars.day}` : null,
    result.summary?.trim() ?? null,
  ].filter((line): line is string => Boolean(line));

  if (sajuLines.length) {
    blocks.push({ id: "saju", title: "사주 해석", lines: sajuLines });
  }

  const ohaengLines = [
    result.myElement ? `나의 오행(일간): ${result.myElement}` : null,
    result.todayGanOhaeng ? `오늘 천간 오행: ${result.todayGanOhaeng}` : null,
    result.relationDetail?.trim() ?? null,
  ].filter((line): line is string => Boolean(line));

  if (ohaengLines.length) {
    blocks.push({ id: "ohaeng", title: "오행 분석", lines: ohaengLines });
  }

  const sipsinLines = [
    result.todaySipsin ? `오늘 천간 십성: ${result.todaySipsin}` : null,
    result.todayJiSipsin ? `오늘 지지 십성: ${result.todayJiSipsin}` : null,
    result.sipsinTitle ? `십성 의미: ${result.sipsinTitle}` : null,
    result.briefing?.oneLine?.trim() ?? null,
  ].filter((line): line is string => Boolean(line));

  if (sipsinLines.length) {
    blocks.push({ id: "sipsin", title: "십성 분석", lines: sipsinLines });
  }

  const aiLines = [
    result.briefing?.executiveSummary?.[0]?.trim() ?? null,
    result.gearAnalysis?.[0] ?? null,
    result.sajuTriggers?.[0]
      ? `${result.sajuTriggers[0].formula ?? result.sajuTriggers[0].title ?? "트리거"} — ${result.sajuTriggers[0].explanation ?? ""}`.trim()
      : null,
    "명리 규칙과 오늘 데이터를 바탕으로 AI가 문장을 다듬어 선택 가이드로 정리했습니다.",
  ].filter((line): line is string => Boolean(line));

  blocks.push({ id: "ai", title: "AI 해석 과정", lines: aiLines });

  return blocks;
}

export const TODAY_PREMIUM_SECTIONS = [
  { id: "decision", title: "오늘의 결정 포인트" },
  { id: "domains", title: "분야별 상세 운세" },
  { id: "avoid", title: "오늘 피해야 할 선택" },
  { id: "lucky", title: "행운 시간" },
  { id: "advice", title: "운명비서 조언" },
  { id: "hourly", title: "12시진 전체" },
  { id: "time-action", title: "시간대 · 행동 상세" },
] as const;
