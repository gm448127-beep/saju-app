export type ToneKey =
  | "ORGANIZE"
  | "TUNE"
  | "DECIDE"
  | "DISTANCE"
  | "RISE"
  | "RECOVER";

export type ToneStatus = "안정" | "상승" | "보통" | "주의" | "정리" | "회복" | "조율";

export interface ToneDefinition {
  key: ToneKey;
  label: string;
  shortLabel: string;
  status: ToneStatus;
  baseScores: {
    relation: number;
    decision: number;
    emotion: number;
    balance: number;
  };
  oneLiners: string[];
  flowTexts: string[];
  doList: string[];
  dontList: string[];
  relationTip: string;
  moneyTip: string;
  emotionTip: string;
  timeKeywords: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
  saveSentence: string;
}

export interface UserSajuProfile {
  dayMaster?: string;
  dayElement?: string;
  ohaengCount?: Record<string, number>;
  sipsin?: string;
  scores?: {
    overall?: number;
    wealth?: number;
    love?: number;
    career?: number;
    health?: number;
    luck?: number;
  };
}

export interface TodayToneReport {
  date: string;
  seedKey: string;
  toneKey: ToneKey;
  toneLabel: string;
  status: ToneStatus;
  oneLiner: string;
  flowText: string;
  saveSentence: string;
  scores: {
    total: number;
    relation: number;
    decision: number;
    emotion: number;
    balance: number;
  };
  guides: {
    do: string;
    dont: string;
    relation: string;
    money: string;
    emotion: string;
  };
  timeFlow: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
  compareWithYesterday?: string;
}
