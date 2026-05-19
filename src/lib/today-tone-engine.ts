import {
  ELEMENT_STRONG_BIAS,
  ELEMENT_WEAK_BIAS,
  TIME_SLOT_DESCRIPTIONS,
  TONE_DEFINITIONS,
  TONE_ORDER,
  TONE_TRANSITION_COMMENTS,
} from "@/lib/today-tone-data";
import type { ToneKey, TodayToneReport, UserSajuProfile } from "@/lib/today-tone-types";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatDateLabel(date: Date) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} (${weekdays[date.getDay()]})`;
}

export function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

function pickFromPool<T>(items: readonly T[], seed: number, step = 0) {
  return items[(seed + step * 17) % items.length];
}

function getDateSeed(date: Date) {
  return Number(dateKey(date));
}

export function selectBaseTone(date: Date): ToneKey {
  const index = getDateSeed(date) % TONE_ORDER.length;
  return TONE_ORDER[index];
}

function getStrongestElement(ohaengCount?: Record<string, number>) {
  if (!ohaengCount) return null;
  const entries = Object.entries(ohaengCount).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function getWeakestElement(ohaengCount?: Record<string, number>) {
  if (!ohaengCount) return null;
  const entries = Object.entries(ohaengCount).filter(([, count]) => count >= 0);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => a[1] - b[1])[0][0];
}

function getUserToneBias(profile?: UserSajuProfile, seed = 0): ToneKey | null {
  if (!profile?.ohaengCount) return null;
  const strongest = getStrongestElement(profile.ohaengCount);
  const weakest = getWeakestElement(profile.ohaengCount);
  const strongOptions = strongest ? ELEMENT_STRONG_BIAS[strongest] ?? [] : [];
  const weakOptions = weakest ? ELEMENT_WEAK_BIAS[weakest] ?? [] : [];
  const merged = [...strongOptions, ...weakOptions];
  if (merged.length === 0) return null;
  return merged[(seed >> 2) % merged.length];
}

export function resolveFinalTone(date: Date, profile?: UserSajuProfile): ToneKey {
  const seed = hashSeed(`${dateKey(date)}-${profile?.sipsin ?? "default"}-${profile?.dayElement ?? "none"}`);
  const baseTone = selectBaseTone(date);
  const biasTone = getUserToneBias(profile, seed);
  if (!biasTone || biasTone === baseTone) return baseTone;
  return (seed % 10) < 4 ? biasTone : baseTone;
}

function buildToneScores(toneKey: ToneKey, seed: number, profile?: UserSajuProfile) {
  const tone = TONE_DEFINITIONS[toneKey];
  const relation = clampScore(tone.baseScores.relation + ((seed >> 1) % 5) - 2);
  const decision = clampScore(tone.baseScores.decision + ((seed >> 3) % 5) - 2);
  const emotion = clampScore(tone.baseScores.emotion + ((seed >> 5) % 5) - 2);
  const balance = clampScore(tone.baseScores.balance + ((seed >> 7) % 5) - 2);
  const apiOverall = profile?.scores?.overall;
  const total = clampScore(
    apiOverall ?? Math.round(relation * 0.28 + decision * 0.28 + emotion * 0.24 + balance * 0.2),
  );

  return { total, relation, decision, emotion, balance };
}

export function buildToneTransitionComment(yesterdayTone: ToneKey, todayTone: ToneKey) {
  if (yesterdayTone === todayTone) {
    return `어제와 같은 '${TONE_DEFINITIONS[todayTone].label}'의 결이 이어집니다`;
  }
  return TONE_TRANSITION_COMMENTS[yesterdayTone]?.[todayTone] ?? `어제와 다른 '${TONE_DEFINITIONS[todayTone].label}'의 결로 흐릅니다`;
}

export function generateTodayToneReport(
  date = new Date(),
  profile: UserSajuProfile = {},
  options?: { yesterdayTone?: ToneKey },
): TodayToneReport {
  const dateLabel = formatDateLabel(date);
  const seedKey = `${dateKey(date)}-${profile.sipsin ?? "default"}-${profile.dayElement ?? "none"}`;
  const seed = hashSeed(seedKey);
  const toneKey = resolveFinalTone(date, profile);
  const tone = TONE_DEFINITIONS[toneKey];
  const scores = buildToneScores(toneKey, seed, profile);

  const oneLiner = pickFromPool(tone.oneLiners, seed, 1);
  const flowText = pickFromPool(tone.flowTexts, seed, 2);
  const guides = {
    do: pickFromPool(tone.doList, seed, 3),
    dont: pickFromPool(tone.dontList, seed, 4),
    relation: tone.relationTip,
    money: tone.moneyTip,
    emotion: tone.emotionTip,
  };

  const timeDescriptions = TIME_SLOT_DESCRIPTIONS[toneKey];
  const timeFlow = {
    morning: timeDescriptions.morning,
    afternoon: timeDescriptions.afternoon,
    evening: timeDescriptions.evening,
    night: timeDescriptions.night,
  };

  const compareWithYesterday = options?.yesterdayTone
    ? buildToneTransitionComment(options.yesterdayTone, toneKey)
    : undefined;

  return {
    date: dateLabel,
    seedKey,
    toneKey,
    toneLabel: tone.label,
    status: tone.status,
    oneLiner,
    flowText,
    saveSentence: tone.saveSentence,
    scores,
    guides,
    timeFlow,
    compareWithYesterday,
  };
}

export function computeOhaengCountFromPillars(stems: string[], branches: string[]) {
  const GAN_OHAENG: Record<string, string> = {
    갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수",
  };
  const JI_OHAENG: Record<string, string> = {
    자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화", 오: "화", 미: "토", 신: "금", 유: "금", 술: "토", 해: "수",
  };

  const count: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [...stems, ...branches].forEach((char) => {
    const element = GAN_OHAENG[char] ?? JI_OHAENG[char];
    if (element) count[element] += 1;
  });
  return count;
}
