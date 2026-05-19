export type SavedSajuRecord = {
  savedAt: string;
  birthKey: string;
  name: string;
  birthDate: string;
  dayGan: string;
  gyeok: string;
  mainElement: string;
  summary: string;
};

export type SavedTarotFavorite = {
  savedAt: string;
  id: string;
  question: string;
  timeHorizon: string;
  cardNames: string[];
  excerpt: string;
};

const SAJU_HISTORY_KEY = "unmyeong-saju-history";
const TAROT_FAVORITES_KEY = "unmyeong-tarot-favorites";

function parseJson<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as T[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function buildSajuBirthKey(name: string, year: string, month: string, day: string, gender: string) {
  return `${name || "anonymous"}-${year}-${month}-${day}-${gender}`;
}

export function getSajuHistory(): SavedSajuRecord[] {
  if (typeof window === "undefined") return [];
  return parseJson<SavedSajuRecord>(window.localStorage.getItem(SAJU_HISTORY_KEY));
}

export function saveSajuRecord(record: SavedSajuRecord) {
  if (typeof window === "undefined") return false;
  try {
    const list = getSajuHistory();
    const next = [
      { ...record, savedAt: record.savedAt || new Date().toISOString() },
      ...list.filter((item) => item.birthKey !== record.birthKey),
    ].slice(0, 20);
    window.localStorage.setItem(SAJU_HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function deleteSajuRecord(birthKey: string) {
  if (typeof window === "undefined") return false;
  try {
    const next = getSajuHistory().filter((item) => item.birthKey !== birthKey);
    window.localStorage.setItem(SAJU_HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function getTarotFavorites(): SavedTarotFavorite[] {
  if (typeof window === "undefined") return [];
  return parseJson<SavedTarotFavorite>(window.localStorage.getItem(TAROT_FAVORITES_KEY));
}

export function saveTarotFavorite(record: SavedTarotFavorite) {
  if (typeof window === "undefined") return false;
  try {
    const list = getTarotFavorites();
    const next = [record, ...list.filter((item) => item.id !== record.id)].slice(0, 30);
    window.localStorage.setItem(TAROT_FAVORITES_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function deleteTarotFavorite(id: string) {
  if (typeof window === "undefined") return false;
  try {
    const next = getTarotFavorites().filter((item) => item.id !== id);
    window.localStorage.setItem(TAROT_FAVORITES_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function hasTarotFavorite(id: string) {
  return getTarotFavorites().some((item) => item.id === id);
}

export function buildTarotFavoriteId(question: string, timeHorizon: string, cardNames: string[]) {
  return `${timeHorizon}-${cardNames.join("-")}-${question.slice(0, 40)}`;
}

export function extractTarotExcerpt(reading: string) {
  const line = reading
    .split("\n")
    .map((item) => item.replace(/\*\*/g, "").trim())
    .find((item) => item.length > 8 && !item.startsWith("-"));
  return line?.slice(0, 120) || "카드가 비추는 흐름을 다시 읽어보세요.";
}
