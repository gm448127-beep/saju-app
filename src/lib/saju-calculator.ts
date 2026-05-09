import { Solar } from 'lunar-javascript';
import {
  CHEONGAN,
  JIJI,
  GAN_OHAENG,
  JI_OHAENG,
  GAN_EUMYANG,
  OHAENG_COLOR,
  OHAENG_EMOJI,
  DDI,
  SIPSIN_MAP,
  CHEONGAN_HANJA,
  JIJI_HANJA,
} from './constants';

// ==================== 타입 정의 ====================
export interface SajuInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  isLunar?: boolean;
  gender?: '남' | '여';
}

export interface Pillar {
  gan: string;
  ji: string;
  ganHanja: string;
  jiHanja: string;
  ganOhaeng: string;
  jiOhaeng: string;
  ganColor: string;
  jiColor: string;
  ganEmoji: string;
  jiEmoji: string;
}

export interface SajuResult {
  name?: string;
  gender?: '남' | '여';
  birthDate: string;
  isLunar: boolean;
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  mainElement: string;
  mainElementColor: string;
  mainElementEmoji: string;
  eumyang: string;
  ddi: string;
  ohaengCount: Record<string, number>;
  sipsinCount: Record<string, number>;
  ohaengBalance: string;
  summary: string;
}

// ==================== 기주 매핑 (시간→시주 천간) ====================
const HOUR_GAN_MAP: Record<number, number[]> = {
  0: [0, 2, 4, 6, 8],  // 갑기일 → 갑자시 시작
  1: [2, 4, 6, 8, 0],  // 을경일 → 병자시 시작
  2: [4, 6, 8, 0, 2],  // 병신일 → 무자시 시작
  3: [6, 8, 0, 2, 4],  // 정임일 → 경자시 시작
  4: [8, 0, 2, 4, 6],  // 무계일 → 임자시 시작
};

function getHourJiji(hour: number): number {
  if (hour === 23 || hour === 0) return 0;   // 자시
  if (hour === 1 || hour === 2) return 1;    // 축시
  if (hour === 3 || hour === 4) return 2;    // 인시
  if (hour === 5 || hour === 6) return 3;    // 묘시
  if (hour === 7 || hour === 8) return 4;    // 진시
  if (hour === 9 || hour === 10) return 5;   // 사시
  if (hour === 11 || hour === 12) return 6;  // 오시
  if (hour === 13 || hour === 14) return 7;  // 미시
  if (hour === 15 || hour === 16) return 8;  // 신시
  if (hour === 17 || hour === 18) return 9;  // 유시
  if (hour === 19 || hour === 20) return 10; // 술시
  return 11; // 해시 (21~22)
}

// ==================== 기둥 생성 ====================
function makePillar(ganIdx: number, jiIdx: number): Pillar {
  const gan = CHEONGAN[ganIdx % 10];
  const ji = JIJI[jiIdx % 12];
  return {
    gan,
    ji,
    ganHanja: CHEONGAN_HANJA[ganIdx % 10],
    jiHanja: JIJI_HANJA[jiIdx % 12],
    ganOhaeng: GAN_OHAENG[gan],
    jiOhaeng: JI_OHAENG[ji],
    ganColor: OHAENG_COLOR[GAN_OHAENG[gan]],
    jiColor: OHAENG_COLOR[JI_OHAENG[ji]],
    ganEmoji: OHAENG_EMOJI[GAN_OHAENG[gan]],
    jiEmoji: OHAENG_EMOJI[JI_OHAENG[ji]],
  };
}

// ==================== 오행 균형 분석 ====================
function analyzeBalance(counts: Record<string, number>): string {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return '분석 불가';

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  if (strongest[1] - weakest[1] <= 1) {
    return '오행이 고르게 분포되어 균형 잡힌 사주입니다.';
  }

  const strongName = `${OHAENG_EMOJI[strongest[0]]} ${strongest[0]}`;
  const weakName = `${OHAENG_EMOJI[weakest[0]]} ${weakest[0]}`;
  return `${strongName}(이/가) 강하고 ${weakName}(이/가) 약합니다. ${weakest[0]} 기운을 보강하면 좋습니다.`;
}

// ==================== 요약 생성 ====================
function buildSummary(result: Omit<SajuResult, 'summary'>): string {
  const { mainElement, eumyang, ddi, ohaengBalance } = result;
  return `당신은 ${eumyang} ${mainElement}(${OHAENG_EMOJI[mainElement]}) 기운의 ${ddi}띠입니다. ${ohaengBalance}`;
}

// ==================== 메인 계산 함수 ====================
export function calculateSaju(input: SajuInput): SajuResult {
  const { year, month, day, hour, isLunar = false, gender } = input;

  // lunar-javascript 사용
  let solar;
  if (isLunar) {
    const lunar = Solar.fromYmd(year, month, day);
    // lunar-javascript: Lunar → Solar 변환
    const lunarObj = (Solar as any).fromLunarDate
      ? (Solar as any).fromLunarDate(year, month, day)
      : Solar.fromYmd(year, month, day);
    solar = lunarObj;
  } else {
    solar = Solar.fromYmd(year, month, day);
  }

  // lunar-javascript 에서 Lunar 객체 얻기
  const lunarDate = (solar as any).getLunar?.() ?? solar;

  // 연주 (年柱)
  const yearGanIdx = (year - 4) % 10;
  const yearJiIdx = (year - 4) % 12;
  const yearPillar = makePillar(yearGanIdx, yearJiIdx);

  // 월주 (月柱) — 간이 계산
  const monthGanBase = (yearGanIdx % 5) * 2 + 2;
  const monthGanIdx = (monthGanBase + (month - 1)) % 10;
  const monthJiIdx = (month + 1) % 12;
  const monthPillar = makePillar(monthGanIdx, monthJiIdx);

  // 일주 (日柱) — 기준일로부터 차이 계산
  const baseDate = new Date(1900, 0, 1); // 1900-01-01 = 갑자일 (index 0 기준 보정)
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);
  const dayGanIdx = ((diffDays % 10) + 10) % 10;
  const dayJiIdx = ((diffDays % 12) + 12) % 12;
  const dayPillar = makePillar(dayGanIdx, dayJiIdx);

  // 시주 (時柱)
  let hourPillar: Pillar;
  if (hour !== undefined && hour >= 0) {
    const hourJiIdx = getHourJiji(hour);
    const dayGanGroup = dayGanIdx % 5;
    const hourGanStart = HOUR_GAN_MAP[dayGanGroup][0];
    const hourGanIdx = (hourGanStart + hourJiIdx) % 10;
    hourPillar = makePillar(hourGanIdx, hourJiIdx);
  } else {
    // 시간 미입력 시 기본값
    hourPillar = makePillar(0, 0);
  }

  // 일간 (나의 오행)
  const mainElement = GAN_OHAENG[dayPillar.gan];
  const eumyang = GAN_EUMYANG[dayPillar.gan];

  // 띠
  const ddi = DDI[yearJiIdx];

  // 오행 카운트
  const ohaengCount: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach((p) => {
    ohaengCount[p.ganOhaeng]++;
    ohaengCount[p.jiOhaeng]++;
  });

  // 십신 카운트
  const sipsinCount: Record<string, number> = {
    비견: 0, 식신: 0, 재성: 0, 관성: 0, 인성: 0,
  };
  const sipsinMap = SIPSIN_MAP[mainElement];
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach((p) => {
    if (sipsinMap[p.ganOhaeng]) sipsinCount[sipsinMap[p.ganOhaeng]]++;
    if (sipsinMap[p.jiOhaeng]) sipsinCount[sipsinMap[p.jiOhaeng]]++;
  });

  const ohaengBalance = analyzeBalance(ohaengCount);

  const partialResult = {
    gender,
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    isLunar,
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    mainElement,
    mainElementColor: OHAENG_COLOR[mainElement],
    mainElementEmoji: OHAENG_EMOJI[mainElement],
    eumyang,
    ddi,
    ohaengCount,
    sipsinCount,
    ohaengBalance,
  };

  return {
    ...partialResult,
    summary: buildSummary(partialResult as any),
  };
}

// ==================== 오늘의 간지 ====================
export function getTodayGanji(): { gan: string; ji: string; ganOhaeng: string; jiOhaeng: string } {
  const today = new Date();
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / 86400000);
  const ganIdx = ((diffDays % 10) + 10) % 10;
  const jiIdx = ((diffDays % 12) + 12) % 12;
  return {
    gan: CHEONGAN[ganIdx],
    ji: JIJI[jiIdx],
    ganOhaeng: GAN_OHAENG[CHEONGAN[ganIdx]],
    jiOhaeng: JI_OHAENG[JIJI[jiIdx]],
  };
}
