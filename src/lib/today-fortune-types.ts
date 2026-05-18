export interface TodayFortuneInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  isLunar?: boolean;
  gender?: "남" | "여";
}

export interface FortuneScores {
  overall: number;
  wealth: number;
  love: number;
  career: number;
  health: number;
  luck: number;
}

export interface LuckyItem {
  label: string;
  value: string;
  emoji: string;
  detail?: string;
  use?: string;
}

export interface TodayFortuneResult {
  date: string;
  todayGan: string;
  todayJi: string;
  todayGanOhaeng: string;
  todayEmoji: string;
  myElement: string;
  myEmoji: string;
  todaySipsin: string;
  todayJiSipsin?: string;
  sipsinTitle?: string;
  relation: string;
  relationDetail: string;
  summary?: string;
  character?: { emoji: string; title: string; description: string };
  scores: FortuneScores;
  grade: string;
  gradeColor: string;
  gradeEmoji: string;
  luckyItems: LuckyItem[];
  tip: string;
  warning: string;
  timeAdvice: TimeAdviceItem[];
  todayDos: string[];
  todayDonts: string[];
  todayDosDetailed?: ActionGuideItem[];
  todayDontsDetailed?: ActionGuideItem[];
  todayQuote: { text: string; author: string };
  hourlyFlowIntro?: string;
  hourlyPeak?: HourlyFlowSlot;
  hourlyCaution?: HourlyFlowSlot;
  hourlyFlow?: HourlyFlowSlot[];
  sajuTriggerIntro?: string;
  sajuTriggers?: import("@/lib/saju-triggers").SajuTriggerItem[];
  gearAnalysis?: string[];
  pillars?: Record<string, string>;
}

export interface ActionGuideItem {
  text: string;
  reason?: string;
  action?: string;
}

export interface HourlyFlowSlot {
  hour: string;
  hanja: string;
  range: string;
  score: number;
  label: string;
  branch?: string;
  element?: string;
  keyword?: string;
  sipsin?: string;
  sipsinTitle?: string;
  labelDesc?: string;
  goodFor?: string;
  avoid?: string;
  relations?: string[];
  advice?: string;
}

export interface TimeAdviceItem {
  time: string;
  label?: string;
  hanjaRange?: string;
  range?: string;
  score: number;
  scoreLabel?: string;
  summary?: string;
  advice: string;
  goodFor?: string;
  caution?: string;
  peak?: {
    hour: string;
    range: string;
    score: number;
    label: string;
    keyword?: string;
  };
  cautionSlot?: {
    hour: string;
    range: string;
    score: number;
    label: string;
    keyword?: string;
  };
  slots?: Array<{
    hour: string;
    range: string;
    score: number;
    label: string;
    keyword?: string;
  }>;
}
