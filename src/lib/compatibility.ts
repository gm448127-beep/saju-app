import {
  CHEONGAN,
  JIJI,
  GAN_OHAENG,
  JI_OHAENG,
  GAN_EUMYANG,
  OHAENG_EMOJI,
  OHAENG_COLOR,
  SANGSAENG,
  SANGGEUK,
  DDI,
} from './constants';

export interface PersonInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  isLunar?: boolean;
  gender: '남' | '여';
  name?: string;
}

export interface CompatibilityResult {
  person1: PersonInfo;
  person2: PersonInfo;
  overallScore: number;
  grade: string;
  gradeColor: string;
  gradeEmoji: string;
  categories: { label: string; emoji: string; score: number; description: string }[];
  advice: string;
  summary: string;
}

export interface PersonInfo {
  name: string;
  gender: '남' | '여';
  birthDate: string;
  dayGan: string;
  dayJi: string;
  mainElement: string;
  mainElementEmoji: string;
  mainElementColor: string;
  eumyang: string;
  ddi: string;
}

function getPersonInfo(input: PersonInput): PersonInfo {
  const { year, month, day, gender, name } = input;

  const yearJiIdx = ((year - 4) % 12 + 12) % 12;
  const ddi = DDI[yearJiIdx];

  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);
  const dayGanIdx = ((diffDays % 10) + 10) % 10;
  const dayJiIdx = ((diffDays % 12) + 12) % 12;

  const dayGan = CHEONGAN[dayGanIdx];
  const dayJi = JIJI[dayJiIdx];
  const mainElement = GAN_OHAENG[dayGan];

  return {
    name: name || (gender === '남' ? '남성' : '여성'),
    gender,
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    dayGan,
    dayJi,
    mainElement,
    mainElementEmoji: OHAENG_EMOJI[mainElement],
    mainElementColor: OHAENG_COLOR[mainElement],
    eumyang: GAN_EUMYANG[dayGan],
    ddi,
  };
}

function calcOhaengScore(el1: string, el2: string): number {
  if (SANGSAENG[el1] === el2 || SANGSAENG[el2] === el1) return 95;
  if (el1 === el2) return 75;
  if (SANGGEUK[el1] === el2 || SANGGEUK[el2] === el1) return 35;
  return 60;
}

function calcEumyangScore(ey1: string, ey2: string): number {
  return ey1 !== ey2 ? 90 : 60;
}

function calcDdiScore(ji1: number, ji2: number): number {
  const diff = Math.abs(ji1 - ji2);
  const samhap = [[0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11]];
  const yukchung = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];

  for (const group of samhap) {
    if (group.includes(ji1) && group.includes(ji2)) return 95;
  }
  for (const pair of yukchung) {
    if ((pair[0] === ji1 && pair[1] === ji2) || (pair[0] === ji2 && pair[1] === ji1)) return 90;
  }

  const sangchung = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
  for (const pair of sangchung) {
    if ((pair[0] === ji1 && pair[1] === ji2) || (pair[0] === ji2 && pair[1] === ji1)) return 30;
  }

  return 65;
}

function getGrade(score: number): { grade: string; color: string; emoji: string } {
  if (score >= 90) return { grade: 'SSS', color: '#f59e0b', emoji: '👑' };
  if (score >= 80) return { grade: 'S', color: '#a855f7', emoji: '🌟' };
  if (score >= 70) return { grade: 'A', color: '#22c55e', emoji: '✨' };
  if (score >= 60) return { grade: 'B', color: '#3b82f6', emoji: '👍' };
  if (score >= 50) return { grade: 'C', color: '#6b7280', emoji: '💪' };
  return { grade: 'D', color: '#ef4444', emoji: '🛡️' };
}

function generateAdvice(el1: string, el2: string, score: number): string {
  if (score >= 85) {
    return `${OHAENG_EMOJI[el1]} ${el1}과(와) ${OHAENG_EMOJI[el2]} ${el2}은(는) 서로를 살려주는 아주 좋은 조합입니다. 함께할수록 시너지가 커집니다.`;
  }
  if (score >= 70) {
    return `${OHAENG_EMOJI[el1]} ${el1}과(와) ${OHAENG_EMOJI[el2]} ${el2}은(는) 조화로운 관계입니다. 서로를 이해하려는 노력이 있으면 더 좋아집니다.`;
  }
  if (score >= 55) {
    return `${OHAENG_EMOJI[el1]} ${el1}과(와) ${OHAENG_EMOJI[el2]} ${el2}은(는) 보통의 관계입니다. 소통과 배려가 중요합니다.`;
  }
  return `${OHAENG_EMOJI[el1]} ${el1}과(와) ${OHAENG_EMOJI[el2]} ${el2}은(는) 서로 다른 에너지를 가지고 있습니다. 차이를 인정하고 존중하면 오히려 성장할 수 있습니다.`;
}

export function calculateCompatibility(input1: PersonInput, input2: PersonInput): CompatibilityResult {
  const person1 = getPersonInfo(input1);
  const person2 = getPersonInfo(input2);

  const ohaengScore = calcOhaengScore(person1.mainElement, person2.mainElement);
  const eumyangScore = calcEumyangScore(person1.eumyang, person2.eumyang);

  const ji1 = ((input1.year - 4) % 12 + 12) % 12;
  const ji2 = ((input2.year - 4) % 12 + 12) % 12;
  const ddiScore = calcDdiScore(ji1, ji2);

  const jitter = () => Math.floor(Math.random() * 10) - 5;
  const clamp = (n: number) => Math.max(10, Math.min(100, n));

  const communicationScore = clamp(Math.round((ohaengScore + eumyangScore) / 2) + jitter());
  const emotionScore = clamp(Math.round((eumyangScore + ddiScore) / 2) + jitter());
  const valueScore = clamp(Math.round((ohaengScore + ddiScore) / 2) + jitter());

  const overallScore = clamp(Math.round(
    ohaengScore * 0.3 + eumyangScore * 0.15 + ddiScore * 0.2 +
    communicationScore * 0.15 + emotionScore * 0.1 + valueScore * 0.1
  ));

  const { grade, color, emoji } = getGrade(overallScore);

  const categories = [
    { label: '오행 궁합', emoji: '🔮', score: ohaengScore, description: `${person1.mainElementEmoji} ${person1.mainElement} × ${person2.mainElementEmoji} ${person2.mainElement}` },
    { label: '음양 조화', emoji: '☯️', score: eumyangScore, description: `${person1.eumyang} × ${person2.eumyang}` },
    { label: '띠 궁합', emoji: '🐾', score: ddiScore, description: `${person1.ddi}띠 × ${person2.ddi}띠` },
    { label: '소통 지수', emoji: '💬', score: communicationScore, description: communicationScore >= 70 ? '대화가 잘 통하는 관계' : '서로 이해하려는 노력이 필요' },
    { label: '감정 교감', emoji: '💗', score: emotionScore, description: emotionScore >= 70 ? '감정적으로 깊이 교감' : '감정 표현을 더 해보세요' },
    { label: '가치관', emoji: '🎯', score: valueScore, description: valueScore >= 70 ? '비슷한 가치관을 공유' : '다름을 인정하면 성장' },
  ];

  return {
    person1,
    person2,
    overallScore,
    grade,
    gradeColor: color,
    gradeEmoji: emoji,
    categories,
    advice: generateAdvice(person1.mainElement, person2.mainElement, overallScore),
    summary: `${person1.name}(${person1.mainElementEmoji}${person1.mainElement})님과 ${person2.name}(${person2.mainElementEmoji}${person2.mainElement})님의 궁합 점수는 ${overallScore}점(${grade}등급)입니다.`,
  };
}
