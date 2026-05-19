import { TONE_DEFINITIONS } from "@/lib/today-tone-data";
import { generateTodayToneReport, hashSeed as toneHashSeed } from "@/lib/today-tone-engine";
import type { ToneKey, ToneStatus, UserSajuProfile } from "@/lib/today-tone-types";

type DailyProfile = UserSajuProfile;

export type DailyFortuneContent = {
  seedKey: string;
  toneKey: ToneKey;
  toneLabel: string;
  status: ToneStatus;
  saveSentence: string;
  compareWithYesterday?: string;
  axisScores: {
    relation: number;
    decision: number;
    emotion: number;
    balance: number;
  };
  sentence: string;
  flow: string;
  actionGuide: {
    dos: string;
    donts: string;
    relationTip: string;
    workMoneyTip: string;
  };
  emotionPoint: {
    description: string;
    tips: string[];
  };
  timeSlots: {
    label: "오전" | "오후" | "저녁" | "밤";
    keyword: string;
    description: string;
  }[];
  weekly: {
    trend: number[];
    keyDay: string;
    summary: string;
  };
  recommendation: {
    title: string;
    text: string;
    href: string;
  };
};

function buildWeekly(seed: number) {
  const dayNames = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const trend = Array.from({ length: 7 }, (_, index) => 46 + ((seed + index * 13) % 39));
  const keyIndex = trend.reduce((bestIndex, value, index) => (value > trend[bestIndex] ? index : bestIndex), 0);

  return {
    trend,
    keyDay: dayNames[keyIndex],
    summary: `이번 주의 중심은 ${dayNames[keyIndex]}에 가장 또렷하게 놓여 있습니다.`,
  };
}

function buildRecommendation(date: Date, seed: number) {
  const day = date.getDay();
  const hour = date.getHours();

  if (day === 1) {
    return { title: "토정비결", text: "이번 주 토정비결로 한 주의 흐름을 먼저 읽어보세요.", href: "/tojeong" };
  }
  if (day === 3) {
    return { title: "사주", text: "사주 리포트로 한 주의 중간 흐름을 차분히 점검해보세요.", href: "/saju" };
  }
  if (day === 5) {
    return { title: "궁합", text: "궁합 리포트로 주말 관계의 온도를 미리 읽어보세요.", href: "/compatibility" };
  }
  if (day === 0 && hour >= 18) {
    return { title: "꿈해몽", text: "꿈해몽으로 한 주의 흐름을 조용히 마무리해보세요.", href: "/dream" };
  }

  const fallback = [
    { title: "타로", text: "타로 리포트로 오늘 마음의 결을 가볍게 읽어보세요.", href: "/tarot" },
    { title: "AI상담", text: "오늘의 흐름이 걸리는 지점이 있다면, AI상담에서 한 번 더 깊게 정리해보세요.", href: "/chat" },
    { title: "오늘의 흐름", text: "오늘의 리포트로 지금 필요한 움직임을 정리해보세요.", href: "/today" },
  ];

  return fallback[seed % fallback.length];
}

export function buildDailyFortuneContent(
  date = new Date(),
  profile: DailyProfile = {},
  options?: { yesterdayTone?: ToneKey },
): DailyFortuneContent {
  const toneReport = generateTodayToneReport(date, profile, options);
  const seed = toneHashSeed(toneReport.seedKey);
  const toneDef = TONE_DEFINITIONS[toneReport.toneKey];
  const timeKeywords = toneDef.timeKeywords;
  const pickTip = (step: number) => toneDef.dontList[(seed + step * 17) % toneDef.dontList.length];

  return {
    seedKey: toneReport.seedKey,
    toneKey: toneReport.toneKey,
    toneLabel: toneReport.toneLabel,
    status: toneReport.status,
    saveSentence: toneReport.saveSentence,
    compareWithYesterday: toneReport.compareWithYesterday,
    axisScores: {
      relation: toneReport.scores.relation,
      decision: toneReport.scores.decision,
      emotion: toneReport.scores.emotion,
      balance: toneReport.scores.balance,
    },
    sentence: toneReport.oneLiner,
    flow: toneReport.flowText,
    actionGuide: {
      dos: toneReport.guides.do,
      donts: toneReport.guides.dont,
      relationTip: toneReport.guides.relation,
      workMoneyTip: toneReport.guides.money,
    },
    emotionPoint: {
      description: toneReport.guides.emotion,
      tips: [pickTip(4), pickTip(5)],
    },
    timeSlots: [
      { label: "오전", keyword: timeKeywords.morning, description: toneReport.timeFlow.morning },
      { label: "오후", keyword: timeKeywords.afternoon, description: toneReport.timeFlow.afternoon },
      { label: "저녁", keyword: timeKeywords.evening, description: toneReport.timeFlow.evening },
      { label: "밤", keyword: timeKeywords.night, description: toneReport.timeFlow.night },
    ],
    weekly: buildWeekly(seed),
    recommendation: buildRecommendation(date, seed),
  };
}

export { generateTodayToneReport } from "@/lib/today-tone-engine";
export type { ToneKey, ToneStatus, TodayToneReport, UserSajuProfile } from "@/lib/today-tone-types";
