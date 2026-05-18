// 사주 일간(dayGan)을 받아 50개 캐릭터 중 하나를 매칭하는 함수

import { CHARACTERS, Character } from "./characters";

// 일간(한글 한 글자) → 캐릭터 matchKey 첫 부분 매핑
const dayGanMap: Record<string, string> = {
  "갑": "갑목",
  "을": "을목",
  "병": "병화",
  "정": "정화",
  "무": "무토",
  "기": "기토",
  "경": "경금",
  "신": "신금",
  "임": "임수",
  "계": "계수",
};

/**
 * 사주 일간과 강한 십성으로 캐릭터를 찾아줍니다.
 * @param dayGan 일간 한글 한 글자 (예: "갑")
 * @param strongSipsin 강한 십성 (예: "상관") — 선택
 */
export function matchCharacter(
  dayGan: string,
  strongSipsin?: string
): Character {
  const dayElement = dayGanMap[dayGan] || "갑목";

  // 1순위: 일간 + 십성 정확 매칭
  if (strongSipsin) {
    const exactMatch = CHARACTERS.find(
      (c) => c.matchKey === `${dayElement}+${strongSipsin}`
    );
    if (exactMatch) return exactMatch;
  }

  // 2순위: 일간으로 시작하는 첫 번째 캐릭터
  const dayMatch = CHARACTERS.find((c) =>
    c.matchKey.startsWith(dayElement)
  );
  if (dayMatch) return dayMatch;

  // 모두 실패 시 기본값 (큰 나무형)
  return CHARACTERS[0];
}

/**
 * 사주 결과 객체에서 가장 강한 십성을 찾아줍니다.
 */
export function findStrongestSipsin(
  sipsinCount: Record<string, number> | undefined
): string | undefined {
  if (!sipsinCount) return undefined;

  let maxKey = "";
  let maxVal = 0;
  for (const [key, val] of Object.entries(sipsinCount)) {
    if (val > maxVal) {
      maxVal = val;
      maxKey = key;
    }
  }
  return maxKey || undefined;
}
