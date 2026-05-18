import {
  RELATION_PLAIN,
  SAJU_TRIGGER_INTRO,
  TRIGGER_META,
} from "@/data/triggerDict";
import { SIPSIN_DICT } from "@/data/wisdomDict";

export type TriggerTone = "positive" | "negative" | "neutral" | "info";

export interface SajuTriggerItem {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  formula: string;
  explanation: string;
  tone: TriggerTone;
  sipsin?: string;
  sipsinTitle?: string;
  tags?: string[];
}

const CHEONGAN_HANJA: Record<string, string> = {
  갑: "甲", 을: "乙", 병: "丙", 정: "丁", 무: "戊", 기: "己", 경: "庚", 신: "辛", 임: "壬", 계: "癸",
};
const JIJI_HANJA: Record<string, string> = {
  자: "子", 축: "丑", 인: "寅", 묘: "卯", 진: "辰", 사: "巳", 오: "午", 미: "未", 신: "申", 유: "酉", 술: "戌", 해: "亥",
};
const GAN_OHAENG: Record<string, string> = {
  갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수",
};
const JI_OHAENG: Record<string, string> = {
  자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화", 오: "화", 미: "토", 신: "금", 유: "금", 술: "토", 해: "수",
};

const PILLAR_LABELS = ["년주", "월주", "일주", "시주"];

function stemLabel(ko: string, oh: string) {
  return `${ko}${CHEONGAN_HANJA[ko]}(${oh})`;
}

function branchLabel(ko: string, oh: string) {
  return `${ko}${JIJI_HANJA[ko]}(${oh})`;
}

function findPillarLabel(branchKo: string, branches: string[]): string {
  const idx = branches.indexOf(branchKo);
  return idx >= 0 ? PILLAR_LABELS[idx] ?? "원국" : "원국";
}

function findStemPillarLabel(stemKo: string, stems: string[]): string {
  const idx = stems.indexOf(stemKo);
  return idx >= 0 ? PILLAR_LABELS[idx] ?? "원국" : "원국";
}

function sipsinExplanation(sipsin: string): string {
  const info = SIPSIN_DICT[sipsin];
  return info ? `${info.title} — ${info.desc}` : "";
}

function meta(id: number) {
  return TRIGGER_META[id] ?? { emoji: "⚙️", title: `TRIGGER ${id}`, subtitle: "" };
}

interface JijiRelation {
  type: string;
  branches: string[];
  result?: string;
}

interface CheonganRelation {
  type: string;
  stems: string[];
  result?: string;
}

export function buildSajuTriggers(params: {
  myDayStem: string;
  myDayOh: string;
  myStems: string[];
  myBranches: string[];
  tdStem: string;
  tdStemOh: string;
  tdBranch: string;
  tdBranchOh: string;
  todaySipsin: string;
  todayJiSipsin: string;
  jijiRels: JijiRelation[];
  cheonganRels: CheonganRelation[];
  seyunDesc: string;
  seyunGan: string;
  seyunJi: string;
  seyunSipsin: string;
  hasHour: boolean;
  siStem?: string;
  siStemOh?: string;
  siBranch?: string;
  siVsTdSipsin?: string;
  siJijiRels?: JijiRelation[];
  siCheonganRels?: CheonganRelation[];
}): { intro: string; triggers: SajuTriggerItem[] } {
  const {
    myDayStem,
    myDayOh,
    myStems,
    myBranches,
    tdStem,
    tdStemOh,
    tdBranch,
    tdBranchOh,
    todaySipsin,
    todayJiSipsin,
    jijiRels,
    cheonganRels,
    seyunDesc,
    seyunGan,
    seyunJi,
    seyunSipsin,
    hasHour,
    siStem,
    siStemOh,
    siBranch,
    siVsTdSipsin,
    siJijiRels = [],
    siCheonganRels = [],
  } = params;

  const triggers: SajuTriggerItem[] = [];

  // TRIGGER 1
  const m1 = meta(1);
  triggers.push({
    id: 1,
    title: m1.title,
    subtitle: m1.subtitle,
    emoji: m1.emoji,
    formula: `내 일간 ${stemLabel(myDayStem, myDayOh)} × 오늘 일간 ${stemLabel(tdStem, tdStemOh)} = ${todaySipsin}`,
    explanation: sipsinExplanation(todaySipsin),
    tone: "neutral",
    sipsin: todaySipsin,
    sipsinTitle: SIPSIN_DICT[todaySipsin]?.title,
    tags: ["일간", "십성"],
  });

  // TRIGGER 2
  const m2 = meta(2);
  triggers.push({
    id: 2,
    title: m2.title,
    subtitle: m2.subtitle,
    emoji: m2.emoji,
    formula: `내 일간 ${stemLabel(myDayStem, myDayOh)} × 오늘 일지 ${branchLabel(tdBranch, tdBranchOh)} = ${todayJiSipsin}`,
    explanation: sipsinExplanation(todayJiSipsin),
    tone: "neutral",
    sipsin: todayJiSipsin,
    sipsinTitle: SIPSIN_DICT[todayJiSipsin]?.title,
    tags: ["일지", "십성"],
  });

  // TRIGGER 3 — 지지 관계
  const m3 = meta(3);
  if (jijiRels.length === 0 && cheonganRels.length === 0) {
    triggers.push({
      id: 3,
      title: m3.title,
      subtitle: m3.subtitle,
      emoji: m3.emoji,
      formula: "원국 ↔ 오늘 일진: 특별한 합·충·형·해 없음",
      explanation:
        "팔자와 오늘 일진 사이에 뚜렷한 합충형이 없어 비교적 평온한 날입니다. 스스로 만든 리듬을 지키면 안정적으로 흘러갑니다.",
      tone: "neutral",
      tags: ["합충형"],
    });
  } else {
    for (const r of jijiRels) {
      const info = RELATION_PLAIN[r.type];
      if (!info) continue;
      const myBranch = r.branches.find((b) => b !== tdBranch) ?? r.branches[0];
      const pillar = findPillarLabel(myBranch, myBranches);
      triggers.push({
        id: 3,
        title: `${m3.title} · ${info.label}`,
        subtitle: `${pillar} 지지와 오늘 일지`,
        emoji: m3.emoji,
        formula: `${pillar} ${branchLabel(myBranch, JI_OHAENG[myBranch])} ↔ 오늘 ${branchLabel(tdBranch, tdBranchOh)}${r.result ? ` → ${r.result}` : ""}`,
        explanation: `${info.desc} ${info.action}`,
        tone: info.tone,
        tags: ["지지", r.type],
      });
    }
    for (const r of cheonganRels) {
      const info = RELATION_PLAIN[r.type];
      if (!info) continue;
      const myStem = r.stems.find((s) => s !== tdStem) ?? r.stems[0];
      const pillar = findStemPillarLabel(myStem, myStems);
      triggers.push({
        id: 3,
        title: `${m3.title} · ${info.label}`,
        subtitle: `${pillar} 천간과 오늘 일간`,
        emoji: m3.emoji,
        formula: `${pillar} ${stemLabel(myStem, GAN_OHAENG[myStem])} ↔ 오늘 ${stemLabel(tdStem, tdStemOh)}${r.result ? ` → ${r.result}` : ""}`,
        explanation: `${info.desc} ${info.action}`,
        tone: info.tone,
        tags: ["천간", r.type],
      });
    }
  }

  // TRIGGER 4
  const m4 = meta(4);
  triggers.push({
    id: 4,
    title: m4.title,
    subtitle: m4.subtitle,
    emoji: m4.emoji,
    formula: `올해 ${seyunGan}${CHEONGAN_HANJA[seyunGan]}${seyunJi}${JIJI_HANJA[seyunJi]}년 · [${seyunSipsin}]`,
    explanation: seyunDesc.replace(/^올해[^→]*→\s*/, ""),
    tone: seyunSipsin.includes("식신") || seyunSipsin.includes("정재") || seyunSipsin.includes("정관") || seyunSipsin.includes("정인") ? "positive" : seyunSipsin.includes("겁재") || seyunSipsin.includes("편관") ? "negative" : "neutral",
    sipsin: seyunSipsin,
    sipsinTitle: SIPSIN_DICT[seyunSipsin]?.title,
    tags: ["세운", "연운"],
  });

  // TRIGGER 5
  const m5 = meta(5);
  if (!hasHour) {
    triggers.push({
      id: 5,
      title: m5.title,
      subtitle: m5.subtitle,
      emoji: m5.emoji,
      formula: "시주(時柱) 미입력",
      explanation:
        "출생 시간을 입력하지 않아 시주 분석이 생략되었습니다. 시간을 알고 계시다면 입력해 주세요 — 말년운·실행력·자녀운 관점의 해석이 더 정밀해집니다.",
      tone: "info",
      tags: ["시주"],
    });
  } else if (siStem && siStemOh && siBranch && siVsTdSipsin) {
    triggers.push({
      id: 5,
      title: m5.title,
      subtitle: "시간(時干) × 오늘 일간",
      emoji: m5.emoji,
      formula: `시간 ${stemLabel(siStem, siStemOh)} × 오늘 일간 ${stemLabel(tdStem, tdStemOh)} = ${siVsTdSipsin}`,
      explanation: `말년·말년운·자녀·실행력 쪽으로 [${siVsTdSipsin}] 기운이 작용합니다. ${sipsinExplanation(siVsTdSipsin)}`,
      tone: "neutral",
      sipsin: siVsTdSipsin,
      sipsinTitle: SIPSIN_DICT[siVsTdSipsin]?.title,
      tags: ["시주", "십성"],
    });

    for (const r of siJijiRels) {
      const info = RELATION_PLAIN[r.type];
      if (!info) continue;
      triggers.push({
        id: 5,
        title: `${m5.title} · ${info.label}`,
        subtitle: "시지 × 오늘 일지",
        emoji: m5.emoji,
        formula: `시지 ${branchLabel(siBranch, JI_OHAENG[siBranch])} ↔ 오늘 ${branchLabel(tdBranch, tdBranchOh)}`,
        explanation: `말년·자녀·건강 방면: ${info.desc} ${info.action}`,
        tone: info.tone,
        tags: ["시지", r.type],
      });
    }
    for (const r of siCheonganRels) {
      const info = RELATION_PLAIN[r.type];
      if (!info) continue;
      triggers.push({
        id: 5,
        title: `${m5.title} · ${info.label}`,
        subtitle: "시간 × 오늘 일간",
        emoji: m5.emoji,
        formula: `시간 ${stemLabel(siStem, siStemOh)} ↔ 오늘 ${stemLabel(tdStem, tdStemOh)}`,
        explanation: `말년·실행 방면: ${info.desc} ${info.action}`,
        tone: info.tone,
        tags: ["시간", r.type],
      });
    }
  }

  return { intro: SAJU_TRIGGER_INTRO, triggers };
}

/** 레거시 문자열 배열 (하위 호환) */
export function triggersToLegacyLines(triggers: SajuTriggerItem[]): string[] {
  return triggers.map(
    (t) => `⚙️ [${t.title}] ${t.formula}${t.sipsin ? ` = ${t.sipsin}` : ""} → ${t.explanation.split("—")[0]?.trim() || t.explanation.slice(0, 40)}`
  );
}
