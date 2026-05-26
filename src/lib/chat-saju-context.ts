/**
 * AI 상담용 사주 맥락 텍스트 생성
 * - ssaju 엔진(사주·오늘의 흐름과 동일)으로 원국 계산
 * - 사주팔자, 기둥별 십신, 원국 합·충만 포함 (오늘 일진 제외)
 */

import { calculateSaju, type PillarKey, type SajuInput } from "ssaju";

/** 채팅 화면·API가 넘기는 생년월일 형식 */
export type ChatSajuBirthInput = {
  year: string | number;
  month: string | number;
  day: string | number;
  gender?: string;
  calendarType?: "solar" | "lunar" | "lunarLeap";
  isLunar?: boolean;
  timeMode?: "none" | "slot" | "exact";
  slotHour?: string | number;
  exactHour?: string | number;
  exactMinute?: string | number;
};

const PILLAR_ORDER: PillarKey[] = ["year", "month", "day", "hour"];
const PILLAR_LABEL: Record<PillarKey, string> = {
  year: "년주",
  month: "월주",
  day: "일주",
  hour: "시주",
};

const BRANCH_REL_TYPES = [
  "육합",
  "삼합",
  "반합",
  "방합",
  "충",
  "형",
  "파",
  "해",
  "원진",
  "귀문",
] as const;

const DDI_BY_BRANCH: Record<string, string> = {
  자: "쥐",
  축: "소",
  인: "호랑이",
  묘: "토끼",
  진: "용",
  사: "뱀",
  오: "말",
  미: "양",
  신: "원숭이",
  유: "닭",
  술: "개",
  해: "돼지",
};

const TIME_SLOT_LABELS: Record<number, string> = {
  23: "자시 (23:00~01:00)",
  1: "축시 (01:00~03:00)",
  3: "인시 (03:00~05:00)",
  5: "묘시 (05:00~07:00)",
  7: "진시 (07:00~09:00)",
  9: "사시 (09:00~11:00)",
  11: "오시 (11:00~13:00)",
  13: "미시 (13:00~15:00)",
  15: "신시 (15:00~17:00)",
  17: "유시 (17:00~19:00)",
  19: "술시 (19:00~21:00)",
  21: "해시 (21:00~23:00)",
};

function parseYmd(birth: ChatSajuBirthInput): { y: number; m: number; d: number } | null {
  const y = Number(birth.year);
  const m = Number(birth.month);
  const d = Number(birth.day);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

function resolveBirthTime(birth: ChatSajuBirthInput): {
  hasHour: boolean;
  hour?: number;
  minute?: number;
  label: string;
} {
  const mode = birth.timeMode ?? "none";

  if (mode === "slot" && birth.slotHour !== "" && birth.slotHour !== undefined && birth.slotHour !== null) {
    const hour = Number(birth.slotHour);
    if (Number.isFinite(hour)) {
      return {
        hasHour: true,
        hour,
        minute: 0,
        label: TIME_SLOT_LABELS[hour] ?? `${String(hour).padStart(2, "0")}:00 전후 시간대`,
      };
    }
  }

  if (mode === "exact" && birth.exactHour !== "" && birth.exactHour !== undefined && birth.exactHour !== null) {
    const hour = Number(birth.exactHour);
    const minute =
      birth.exactMinute !== "" && birth.exactMinute !== undefined && birth.exactMinute !== null
        ? Number(birth.exactMinute)
        : 0;
    if (Number.isFinite(hour) && Number.isFinite(minute)) {
      return {
        hasHour: true,
        hour,
        minute,
        label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      };
    }
  }

  return { hasHour: false, label: "출생시간 미입력 (시주·시진 분석 제외)" };
}

function calendarLabel(birth: ChatSajuBirthInput): string {
  if (birth.calendarType === "lunarLeap") return "음력 윤달";
  if (birth.calendarType === "lunar" || birth.isLunar) return "음력";
  return "양력";
}

/** ssaju 입력 객체 (사주·오늘 API와 동일 옵션) */
export function buildSajuInputFromChatBirth(birth: ChatSajuBirthInput): SajuInput | null {
  const ymd = parseYmd(birth);
  if (!ymd) return null;

  const isLunar = birth.calendarType === "lunar" || birth.calendarType === "lunarLeap" || !!birth.isLunar;
  const leap = birth.calendarType === "lunarLeap";

  const input: SajuInput = {
    year: ymd.y,
    month: ymd.m,
    day: ymd.d,
    gender: birth.gender === "여" ? "여" : "남",
    calendar: isLunar ? "lunar" : "solar",
    leap,
    timezone: "Asia/Seoul",
    applyLocalMeanTime: true,
    longitude: 126.9784,
  };

  const time = resolveBirthTime(birth);
  if (time.hasHour && time.hour !== undefined) {
    input.hour = time.hour;
    input.minute = time.minute ?? 0;
  }

  return input;
}

function formatTenGod(stem?: string, branch?: string): string {
  const parts: string[] = [];
  if (stem?.trim()) parts.push(`천간 ${stem}`);
  if (branch?.trim()) parts.push(`지지 ${branch}`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function formatPillarsSection(
  pillars: ReturnType<typeof calculateSaju>["pillarDetails"],
  tenGods: ReturnType<typeof calculateSaju>["tenGods"],
  includeHour: boolean,
): string[] {
  const lines: string[] = ["[사주팔자]"];
  const keys = includeHour ? PILLAR_ORDER : (["year", "month", "day"] as const);

  for (const key of keys) {
    const p = pillars[key];
    const tg = tenGods[key];
    const ganji = `${p.stemKo}${p.branchKo}`;
    const stemEl = p.element?.stem ?? "";
    const branchEl = p.element?.branch ?? "";
    lines.push(
      `- ${PILLAR_LABEL[key]}: ${ganji} (천간 ${p.stemKo}/${stemEl}, 지지 ${p.branchKo}/${branchEl}) · 십신: ${formatTenGod(tg?.stem, tg?.branch)}`,
    );
  }

  if (!includeHour) {
    lines.push("- 시주: 출생시간 미입력으로 제외");
  }

  return lines;
}

function formatStemRelations(relations: ReturnType<typeof calculateSaju>["stemRelations"]): string[] {
  const lines: string[] = ["[원국 천간 합·충]"];
  if (!relations?.length) {
    lines.push("- 원국 천간끼리 뚜렷한 합·충 없음");
    return lines;
  }
  for (const r of relations) {
    const pillars = r.pillars.map((k) => PILLAR_LABEL[k]).join("·");
    lines.push(`- ${r.type}: ${r.stems.join("·")} (${pillars}) — ${r.desc}`);
  }
  return lines;
}

function formatBranchRelationEntry(pillarKey: string, value: string): string {
  const label = PILLAR_LABEL[pillarKey as PillarKey] ?? pillarKey;
  return `${label}: ${value}`;
}

function formatBranchRelations(branchRelations: ReturnType<typeof calculateSaju>["branchRelations"]): string[] {
  const lines: string[] = ["[원국 지지 합·충·형·파·해 등]"];
  let found = false;

  for (const type of BRANCH_REL_TYPES) {
    const data = branchRelations[type];
    if (!data || typeof data !== "object") continue;
    const entries = Object.entries(data).filter(([, v]) => v != null && String(v).trim() !== "");
    if (entries.length === 0) continue;
    found = true;
    const detail = entries.map(([k, v]) => formatBranchRelationEntry(k, String(v))).join(" / ");
    lines.push(`- ${type}: ${detail}`);
  }

  if (!found) {
    lines.push("- 원국 지지끼리 뚜렷한 합·충·형·파·해 없음");
  }

  return lines;
}

function formatFiveElements(five: Record<string, number>): string {
  const parts = ["목", "화", "토", "금", "수"].map((el) => {
    const n = five[el] ?? five[el === "목" ? "木" : el === "화" ? "火" : el === "토" ? "土" : el === "금" ? "金" : "水"] ?? 0;
    return `${el}=${n}`;
  });
  return parts.join(", ");
}

/**
 * 생년월일 → AI 상담용 사주 맥락 문자열
 * @returns 맥락 텍스트. 생년월일이 잘못되면 null
 */
export function buildChatSajuContext(birth: ChatSajuBirthInput): string | null {
  const input = buildSajuInputFromChatBirth(birth);
  if (!input) return null;

  const ymd = parseYmd(birth)!;
  const time = resolveBirthTime(birth);
  const result = calculateSaju(input);
  const pd = result.pillarDetails;
  const dayStem = pd.day.stemKo;
  const dayBranch = pd.day.branchKo;
  const dayEl = pd.day.element?.stem ?? "";
  const dayYy = pd.day.yinYang?.stem ?? "";

  const includeHour = time.hasHour;
  const genderLabel = input.gender === "여" ? "여성" : "남성";

  const ddi = DDI_BY_BRANCH[pd.year.branchKo];

  const header = [
    "[상담자의 사주 정보]",
    `- 생년월일: ${ymd.y}년 ${ymd.m}월 ${ymd.d}일 (${calendarLabel(birth)}, ${genderLabel})`,
    `- 태어난 시간: ${time.label}`,
    `- 일간: ${dayStem} (${dayEl}, ${dayYy}) · 일지: ${dayBranch}`,
    ...(ddi ? [`- 띠: ${ddi}띠`] : []),
    `- 오행 분포(원국): ${formatFiveElements(result.fiveElements || {})}`,
  ];

  const body = [
    ...formatPillarsSection(pd, result.tenGods, includeHour),
    ...formatStemRelations(result.stemRelations),
    ...formatBranchRelations(result.branchRelations),
  ];

  return `${header.join("\n")}\n\n${body.join("\n")}`;
}
