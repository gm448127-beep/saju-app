export interface TarotCardImageSource {
  name: string;
  suit?: string;
  rank?: string;
}

const MAJOR_CARD_SLUGS: Record<string, string> = {
  바보: 'major-00-fool',
  마법사: 'major-01-magician',
  여사제: 'major-02-high-priestess',
  여황제: 'major-03-empress',
  황제: 'major-04-emperor',
  교황: 'major-05-hierophant',
  연인: 'major-06-lovers',
  전차: 'major-07-chariot',
  힘: 'major-08-strength',
  은둔자: 'major-09-hermit',
  '운명의 수레바퀴': 'major-10-wheel-of-fortune',
  정의: 'major-11-justice',
  '매달린 사람': 'major-12-hanged-man',
  죽음: 'major-13-death',
  절제: 'major-14-temperance',
  악마: 'major-15-devil',
  탑: 'major-16-tower',
  별: 'major-17-star',
  달: 'major-18-moon',
  태양: 'major-19-sun',
  심판: 'major-20-judgement',
  세계: 'major-21-world',
};

const SUIT_SLUGS: Record<string, string> = {
  완드: 'wands',
  컵: 'cups',
  소드: 'swords',
  펜타클: 'pentacles',
};

const RANK_SLUGS: Record<string, string> = {
  에이스: 'ace',
  '2': '02',
  '3': '03',
  '4': '04',
  '5': '05',
  '6': '06',
  '7': '07',
  '8': '08',
  '9': '09',
  '10': '10',
  페이지: 'page',
  나이트: 'knight',
  퀸: 'queen',
  킹: 'king',
};

function fallbackSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function getTarotCardSlug(card: TarotCardImageSource) {
  if (card.suit && card.rank) {
    const suitSlug = SUIT_SLUGS[card.suit] ?? fallbackSlug(card.suit);
    const rankSlug = RANK_SLUGS[card.rank] ?? fallbackSlug(card.rank);

    return `${suitSlug}-${rankSlug}`;
  }

  return MAJOR_CARD_SLUGS[card.name] ?? fallbackSlug(card.name);
}

export function getTarotCardImagePath(card: TarotCardImageSource) {
  return `/tarot/cards/${getTarotCardSlug(card)}.webp`;
}
