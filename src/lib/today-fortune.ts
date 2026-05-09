import { CHEONGAN, JIJI, GAN_OHAENG, JI_OHAENG, OHAENG_EMOJI, OHAENG_COLOR } from './constants';

export interface TodayFortuneInput {
  year: number;
  month: number;
  day: number;
  isLunar?: boolean;
  gender?: '남' | '여';
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
}

export interface TodayFortuneResult {
  date: string;
  todayGan: string;
  todayJi: string;
  todayGanOhaeng: string;
  todayJiOhaeng: string;
  todayEmoji: string;
  myElement: string;
  myEmoji: string;
  relation: string;
  scores: FortuneScores;
  grade: string;
  gradeColor: string;
  gradeEmoji: string;
  luckyItems: LuckyItem[];
  tip: string;
  warning: string;
}

const SANGSAENG: Record<string, string> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
};

const SANGGEUK: Record<string, string> = {
  목: '토', 화: '금', 토: '수', 금: '목', 수: '화',
};

function getTodayGanji(): { gan: string; ji: string } {
  const baseDate = new Date(1900, 0, 1);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / 86400000);
  const ganIdx = ((diffDays % 10) + 10) % 10;
  const jiIdx = ((diffDays % 12) + 12) % 12;
  return { gan: CHEONGAN[ganIdx], ji: JIJI[jiIdx] };
}

function getMyElement(year: number, month: number, day: number): string {
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);
  const dayGanIdx = ((diffDays % 10) + 10) % 10;
  return GAN_OHAENG[CHEONGAN[dayGanIdx]];
}

function calcRelationScore(myEl: string, todayEl: string): { score: number; relation: string } {
  if (myEl === todayEl) return { score: 75, relation: `같은 ${myEl} 기운! 비견의 날로, 경쟁과 자립심이 강해집니다.` };
  if (SANGSAENG[myEl] === todayEl) return { score: 90, relation: `${myEl}이(가) ${todayEl}을(를) 생합니다! 내가 에너지를 주는 날, 베풀면 복이 옵니다.` };
  if (SANGSAENG[todayEl] === myEl) return { score: 95, relation: `${todayEl}이(가) ${myEl}을(를) 생합니다! 오늘 에너지를 받는 길한 날입니다.` };
  if (SANGGEUK[myEl] === todayEl) return { score: 60, relation: `${myEl}이(가) ${todayEl}을(를) 극합니다. 주도적이지만 무리하지 마세요.` };
  if (SANGGEUK[todayEl] === myEl) return { score: 40, relation: `${todayEl}이(가) ${myEl}을(를) 극합니다. 조심스럽게 행동하세요.` };
  return { score: 65, relation: '평범한 관계의 날입니다.' };
}

function getGrade(score: number): { grade: string; color: string; emoji: string } {
  if (score >= 90) return { grade: 'SSS', color: '#f59e0b', emoji: '🌟' };
  if (score >= 80) return { grade: 'S', color: '#a855f7', emoji: '✨' };
  if (score >= 70) return { grade: 'A', color: '#3b82f6', emoji: '😊' };
  if (score >= 60) return { grade: 'B', color: '#22c55e', emoji: '🙂' };
  if (score >= 50) return { grade: 'C', color: '#6b7280', emoji: '😐' };
  return { grade: 'D', color: '#ef4444', emoji: '😰' };
}

function generateScores(baseScore: number): FortuneScores {
  const jitter = () => Math.floor(Math.random() * 20) - 10;
  const clamp = (n: number) => Math.max(10, Math.min(100, n));
  return {
    overall: clamp(baseScore + jitter()),
    wealth: clamp(baseScore + jitter()),
    love: clamp(baseScore + jitter()),
    career: clamp(baseScore + jitter()),
    health: clamp(baseScore + jitter()),
    luck: clamp(baseScore + jitter()),
  };
}

function getLuckyItems(element: string): LuckyItem[] {
  const items: Record<string, LuckyItem[]> = {
    목: [
      { label: '행운의 색', value: '초록색', emoji: '💚' },
      { label: '행운의 숫자', value: '3, 8', emoji: '🔢' },
      { label: '행운의 방향', value: '동쪽', emoji: '🧭' },
      { label: '행운의 음식', value: '샐러드', emoji: '🥗' },
    ],
    화: [
      { label: '행운의 색', value: '빨간색', emoji: '❤️' },
      { label: '행운의 숫자', value: '2, 7', emoji: '🔢' },
      { label: '행운의 방향', value: '남쪽', emoji: '🧭' },
      { label: '행운의 음식', value: '매운 음식', emoji: '🌶️' },
    ],
    토: [
      { label: '행운의 색', value: '노란색', emoji: '💛' },
      { label: '행운의 숫자', value: '5, 10', emoji: '🔢' },
      { label: '행운의 방향', value: '중앙', emoji: '🧭' },
      { label: '행운의 음식', value: '고구마', emoji: '🍠' },
    ],
    금: [
      { label: '행운의 색', value: '흰색', emoji: '🤍' },
      { label: '행운의 숫자', value: '4, 9', emoji: '🔢' },
      { label: '행운의 방향', value: '서쪽', emoji: '🧭' },
      { label: '행운의 음식', value: '삼계탕', emoji: '🍲' },
    ],
    수: [
      { label: '행운의 색', value: '검은색', emoji: '🖤' },
      { label: '행운의 숫자', value: '1, 6', emoji: '🔢' },
      { label: '행운의 방향', value: '북쪽', emoji: '🧭' },
      { label: '행운의 음식', value: '해산물', emoji: '🦐' },
    ],
  };
  return items[element] || items['목'];
}

const TIPS: Record<string, string> = {
  목: '창의적인 활동이나 새로운 시작에 좋은 날입니다. 산책이나 자연 속에서 에너지를 충전하세요.',
  화: '열정을 발휘하기 좋은 날! 사람들과의 소통에서 좋은 기운을 얻을 수 있습니다.',
  토: '안정적이고 꾸준한 노력이 결실을 맺는 날입니다. 기초를 다지는 데 집중하세요.',
  금: '결단력이 필요한 날입니다. 중요한 결정이 있다면 오늘 내리는 것이 좋습니다.',
  수: '지혜와 통찰력이 빛나는 날! 공부나 연구에 집중하면 큰 성과를 얻을 수 있습니다.',
};

const WARNINGS: Record<string, string> = {
  목: '과도한 욕심은 금물! 무리한 계획보다 실현 가능한 목표를 세우세요.',
  화: '감정 조절에 유의하세요. 급한 성격이 화를 부를 수 있습니다.',
  토: '고집을 부리면 손해! 유연하게 대처하는 것이 중요합니다.',
  금: '완벽주의에 빠지지 마세요. 적당한 타협도 필요합니다.',
  수: '우유부단함을 조심하세요. 결정을 미루면 기회를 놓칠 수 있습니다.',
};

export function calculateTodayFortune(input: TodayFortuneInput): TodayFortuneResult {
  const { year, month, day } = input;
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const { gan, ji } = getTodayGanji();
  const todayGanOhaeng = GAN_OHAENG[gan];
  const todayJiOhaeng = JI_OHAENG[ji];
  const myElement = getMyElement(year, month, day);

  const { score: relationScore, relation } = calcRelationScore(myElement, todayGanOhaeng);
  const scores = generateScores(relationScore);
  const { grade, color, emoji } = getGrade(scores.overall);

  return {
    date: dateStr,
    todayGan: gan,
    todayJi: ji,
    todayGanOhaeng,
    todayJiOhaeng,
    todayEmoji: OHAENG_EMOJI[todayGanOhaeng],
    myElement,
    myEmoji: OHAENG_EMOJI[myElement],
    relation,
    scores,
    grade,
    gradeColor: color,
    gradeEmoji: emoji,
    luckyItems: getLuckyItems(myElement),
    tip: TIPS[todayGanOhaeng] || TIPS['목'],
    warning: WARNINGS[myElement] || WARNINGS['목'],
  };
}
