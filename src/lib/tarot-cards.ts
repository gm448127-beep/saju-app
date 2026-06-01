import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { getTarotImageCandidates } from '@/lib/tarot-assets';

export type TarotCardDefinition = {
  id: number;
  number: string;
  name: string;
  name_ko: string;
  keywords_left: string[];
  keywords_right: string[];
  image: string;
  meaning_upright: string;
  meaning_reversed: string;
};

export type DrawnTarotCard = {
  id: number;
  name: string;
  english: string;
  image: string;
  keywordsLeft: string[];
  keywordsRight: string[];
  isReversed: boolean;
  position: string;
  meaning: string;
  advice: string;
};

const POSITIONS_BY_HORIZON: Record<string, string[]> = {
  지금: ['현재 상황', '다가오는 흐름', '운명비서의 조언'],
  '3개월 후': ['지금의 씨앗', '3개월 안의 변화', '3개월 후의 흐름'],
  '1년 후': ['현재의 출발점', '1년 안의 전환', '1년 후의 모습'],
  '2년 후': ['지금 숨은 가능성', '다가올 변화', '2년 후 당신의 모습'],
};

let deckCache: TarotCardDefinition[] | null = null;

export function loadTarotDeck(): TarotCardDefinition[] {
  if (deckCache) return deckCache;
  const filePath = join(process.cwd(), 'public', 'data', 'tarot-cards.json');
  deckCache = JSON.parse(readFileSync(filePath, 'utf-8')) as TarotCardDefinition[];
  return deckCache;
}

function buildCardAdvice(def: TarotCardDefinition) {
  return `${def.keywords_left.join(' · ')} / ${def.keywords_right.join(' · ')}`;
}

function getPositions(timeHorizon: string) {
  return POSITIONS_BY_HORIZON[timeHorizon] ?? POSITIONS_BY_HORIZON['지금'];
}

export function drawTarotCards(timeHorizon = '지금', count = 3): DrawnTarotCard[] {
  const positions = getPositions(timeHorizon);
  const deck = [...loadTarotDeck()].sort(() => Math.random() - 0.5);

  return deck.slice(0, count).map((def, index) => {
    const isReversed = Math.random() > 0.72;
    return {
      id: def.id,
      name: def.name_ko,
      english: def.name,
      image: getTarotImageCandidates(def.image, def.name)[0],
      keywordsLeft: def.keywords_left,
      keywordsRight: def.keywords_right,
      isReversed,
      position: positions[index] ?? positions[positions.length - 1],
      meaning: isReversed ? def.meaning_reversed : def.meaning_upright,
      advice: buildCardAdvice(def),
    };
  });
}
