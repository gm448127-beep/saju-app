import { brandGradeStyle } from '@/lib/brand-colors';
import {
  CHEONGAN,
  JIJI,
  GAN_OHAENG,
  OHAENG_EMOJI,
  OHAENG_COLOR,
  CHEONGAN_TAESU,
  JIJI_TAESU,
  JIJI_WOLGEON,
  JIJI_ILJIN,
} from './constants';

export interface TojeongInput {
  year: number;
  month: number;
  day: number;
  isLunar?: boolean;
}

export interface MonthFortune {
  month: number;
  label: string;
  score: number;
  summary: string;
  emoji: string;
}

export interface TojeongResult {
  birthDate: string;
  isLunar: boolean;
  age: number;
  yearGanji: string;
  taesu: number;
  wolgeon: number;
  iljin: number;
  totalGwae: number;
  hexagram: string;
  grade: string;
  gradeColor: string;
  gradeEmoji: string;
  poem: string;
  summary: string;
  categories: { label: string; emoji: string; score: number; description: string }[];
  monthlyFortunes: MonthFortune[];
}

const HEXAGRAM_DATA: Record<number, { name: string; poem: string; summary: string }> = {
  1: { name: '건(乾)', poem: '하늘이 맑고 용이 승천하니', summary: '매우 길한 해입니다. 하는 일마다 순조롭고 큰 성과를 이룰 수 있습니다.' },
  2: { name: '곤(坤)', poem: '대지가 만물을 품으니', summary: '안정적인 해입니다. 기반을 다지고 내실을 기하면 좋습니다.' },
  3: { name: '둔(屯)', poem: '새싹이 땅을 뚫고 나오듯', summary: '어려움 속에서 새로운 시작이 있습니다. 인내가 필요합니다.' },
  4: { name: '몽(蒙)', poem: '안개 속에 길을 찾으니', summary: '아직 때가 무르익지 않았습니다. 배움과 준비에 집중하세요.' },
  5: { name: '수(需)', poem: '비가 올 때를 기다리니', summary: '기다림의 해입니다. 조급하지 않으면 좋은 기회가 옵니다.' },
  6: { name: '송(訟)', poem: '바람과 물이 서로 어긋나니', summary: '갈등과 다툼을 조심해야 합니다. 양보가 미덕입니다.' },
  7: { name: '사(師)', poem: '장수가 군사를 이끄니', summary: '리더십을 발휘할 수 있는 해입니다.' },
  8: { name: '비(比)', poem: '물이 땅 위에 모이듯', summary: '협력과 화합의 해입니다. 주변 사람과의 관계가 복을 부릅니다.' },
  9: { name: '소축(小畜)', poem: '바람이 구름을 모으나 비는 오지 않으니', summary: '작은 것들이 쌓여가는 해입니다.' },
  10: { name: '리(履)', poem: '호랑이 꼬리를 밟으나 물리지 않으니', summary: '조심스럽게 행동하면 위험을 피할 수 있습니다.' },
  11: { name: '태(泰)', poem: '천지가 교감하여 만물이 소통하니', summary: '대길한 해입니다. 모든 일이 잘 풀립니다.' },
  12: { name: '비(否)', poem: '천지가 막히니', summary: '막힘이 있는 해입니다. 무리하지 말고 때를 기다리세요.' },
  13: { name: '동인(同人)', poem: '하늘 아래 불이 타오르듯', summary: '뜻이 맞는 사람과 함께하면 큰 일을 이룰 수 있습니다.' },
  14: { name: '대유(大有)', poem: '하늘 위에 해가 빛나니', summary: '크게 얻는 해입니다. 재물운과 명예운이 좋습니다.' },
  15: { name: '겸(謙)', poem: '산이 땅 아래에 있으니', summary: '겸손이 복을 부르는 해입니다.' },
  16: { name: '예(豫)', poem: '우레가 땅 위에서 울리니', summary: '즐거움이 있는 해입니다. 새로운 일을 시작하기 좋습니다.' },
  17: { name: '수(隨)', poem: '못 속에 우레가 있으니', summary: '흐름에 따르면 좋은 해입니다.' },
  18: { name: '고(蠱)', poem: '산 아래 바람이 부니', summary: '잘못된 것을 바로잡는 해입니다.' },
  19: { name: '임(臨)', poem: '땅 위에 못이 있으니', summary: '적극적으로 나서면 좋은 결과를 얻습니다.' },
  20: { name: '관(觀)', poem: '바람이 땅 위를 불어가니', summary: '관찰하고 살피는 해입니다. 신중한 판단이 필요합니다.' },
  21: { name: '서합(噬嗑)', poem: '우레와 번개가 함께하니', summary: '결단력이 필요한 해입니다.' },
  22: { name: '비(賁)', poem: '산 아래 불이 빛나니', summary: '외면보다 내면을 가꾸세요.' },
  23: { name: '박(剝)', poem: '산이 무너지려 하니', summary: '조심해야 할 해입니다. 지출과 손실에 주의하세요.' },
  24: { name: '복(復)', poem: '땅 속에서 우레가 울리니', summary: '회복의 해입니다. 어려웠던 일들이 풀리기 시작합니다.' },
  25: { name: '무망(無妄)', poem: '하늘 아래 우레가 울리니', summary: '순리대로 움직이면 좋은 해입니다.' },
  26: { name: '대축(大畜)', poem: '산 속에 하늘이 있으니', summary: '크게 쌓이는 해입니다. 실력과 재물이 모두 늘어납니다.' },
  27: { name: '이(頤)', poem: '산 아래 우레가 있으니', summary: '건강과 양생에 신경 써야 할 해입니다.' },
  28: { name: '대과(大過)', poem: '못 위에 나무가 있으니', summary: '과한 것을 경계하는 해입니다.' },
  29: { name: '감(坎)', poem: '물이 겹겹이 흐르니', summary: '어려움이 있지만 지혜로 헤쳐나갈 수 있습니다.' },
  30: { name: '리(離)', poem: '불이 밝게 타오르니', summary: '밝고 화려한 해입니다. 학문과 예술에 좋습니다.' },
};

function getGrade(gwae: number): { grade: string; color: string; emoji: string } {
  const grade =
    gwae <= 5 ? 'SSS' : gwae <= 10 ? 'S' : gwae <= 15 ? 'A' : gwae <= 20 ? 'B' : gwae <= 25 ? 'C' : 'D';
  const style = brandGradeStyle(grade);
  return { grade, color: style.color, emoji: style.emoji };
}

function generateCategories(gwae: number): { label: string; emoji: string; score: number; description: string }[] {
  const base = Math.max(30, 100 - gwae * 2);
  const jitter = () => Math.floor(Math.random() * 20) - 10;
  const clamp = (n: number) => Math.max(10, Math.min(100, n));

  return [
    { label: '재물운', emoji: '💰', score: clamp(base + jitter()), description: base > 70 ? '재물이 들어오는 운입니다.' : '지출을 줄이고 절약하세요.' },
    { label: '건강운', emoji: '💪', score: clamp(base + jitter()), description: base > 70 ? '건강하고 활력 넘치는 해입니다.' : '건강 관리에 신경 쓰세요.' },
    { label: '애정운', emoji: '💕', score: clamp(base + jitter()), description: base > 70 ? '좋은 인연을 만날 수 있습니다.' : '관계에서 인내심이 필요합니다.' },
    { label: '직장운', emoji: '💼', score: clamp(base + jitter()), description: base > 70 ? '승진이나 좋은 기회가 옵니다.' : '현재 위치에서 실력을 쌓으세요.' },
    { label: '학업운', emoji: '📚', score: clamp(base + jitter()), description: base > 70 ? '집중력이 높아 좋은 성과를 냅니다.' : '꾸준한 노력이 필요합니다.' },
  ];
}

function generateMonthly(gwae: number): MonthFortune[] {
  const months: MonthFortune[] = [];
  const emojis = ['❄️', '🌸', '🌸', '🌷', '🌿', '☀️', '☀️', '🌻', '🍂', '🍂', '🍁', '❄️'];
  const labels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const summaries = [
    '새해 시작, 계획을 세우세요.',
    '봄기운이 올라옵니다.',
    '활동적인 시기입니다.',
    '꽃피는 시기, 인연수가 있습니다.',
    '안정적인 달입니다.',
    '여름 에너지로 활력이 넘칩니다.',
    '중간 점검의 시기입니다.',
    '노력의 결실이 보이기 시작합니다.',
    '수확의 계절, 성과를 거두세요.',
    '정리와 마무리가 필요합니다.',
    '차분하게 내면을 돌보세요.',
    '한 해를 마무리하며 감사하세요.',
  ];

  for (let i = 0; i < 12; i++) {
    const base = Math.max(30, 100 - gwae * 2);
    const score = Math.max(10, Math.min(100, base + Math.floor(Math.random() * 30) - 15));
    months.push({
      month: i + 1,
      label: labels[i],
      score,
      summary: summaries[i],
      emoji: emojis[i],
    });
  }
  return months;
}

export function calculateTojeong(input: TojeongInput): TojeongResult {
  const { year, month, day, isLunar = false } = input;

  const today = new Date();
  const currentYear = today.getFullYear();
  const age = currentYear - year + 1;

  const yearGanIdx = (year - 4) % 10;
  const yearJiIdx = (year - 4) % 12;
  const yearGan = CHEONGAN[yearGanIdx >= 0 ? yearGanIdx : yearGanIdx + 10];
  const yearJi = JIJI[yearJiIdx >= 0 ? yearJiIdx : yearJiIdx + 12];
  const yearGanji = `${yearGan}${yearJi}`;

  const taesu = CHEONGAN_TAESU[yearGan] || 5;

  const monthJiIdx = ((month + 1) % 12);
  const monthJi = JIJI[monthJiIdx >= 0 ? monthJiIdx : monthJiIdx + 12];
  const wolgeon = JIJI_WOLGEON[monthJi] || 1;

  const dayJiIdx = ((day - 1) % 12);
  const dayJi = JIJI[dayJiIdx >= 0 ? dayJiIdx : dayJiIdx + 12];
  const iljin = JIJI_ILJIN[dayJi] || 1;

  const totalGwae = ((taesu + wolgeon + iljin - 1) % 30) + 1;

  const hexData = HEXAGRAM_DATA[totalGwae] || HEXAGRAM_DATA[1]!;
  const { grade, color, emoji } = getGrade(totalGwae);

  return {
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    isLunar,
    age,
    yearGanji,
    taesu,
    wolgeon,
    iljin,
    totalGwae,
    hexagram: hexData.name,
    grade,
    gradeColor: color,
    gradeEmoji: emoji,
    poem: hexData.poem,
    summary: hexData.summary,
    categories: generateCategories(totalGwae),
    monthlyFortunes: generateMonthly(totalGwae),
  };
}
