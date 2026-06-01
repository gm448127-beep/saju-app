/**
 * 사주 API v3 — secretaryReading 빌더
 * @see docs/content-constitution-3.0.md
 * 해석 순서: 팩트 → 환경(월령) → 반응(일간) → 5축 → 흔들릴 때 → 비서 제안 → 한 문장 → 근거
 * 십성 장면: `sipsin-scene-dictionary.ts` (월령·일간 문장은 덮어쓰지 않음)
 */

import {
  buildEnvironmentFromMonthLord,
  buildScenesFromMonthAndSipsin,
  buildStressFromMonthLord,
  getMonthLordAnchor,
} from "@/lib/month-lord-anchors";
import {
  buildSuggestionsFromMainSipsin,
  buildSipsinSceneLine as buildSipsinSceneLineFromDictionary,
} from "@/lib/sipsin-scene-dictionary";

export type SecretaryReadingFacts = {
  dayMaster: string;
  monthBranch: string;
  mainSipsin: string[];
  usefulGod?: string;
  structure?: string;
  relations?: string[];
};

export type SecretaryReadingBlock = {
  label: string;
  text: string;
  evidence: string[];
};

export type SecretaryReadingScenes = {
  relationship?: string;
  work?: string;
  money?: string;
  choice?: string;
  emotion?: string;
};

export type SecretaryStressPattern = {
  trigger: string;
  scene: string;
};

export type SecretarySuggestion = {
  title: string;
  action: string;
  reason: string;
};

export type SecretaryEvidenceItem = {
  term: string;
  role: "month" | "dayMaster" | "sipsin" | "relation" | "daeyun" | "sewoon";
  note: string;
};

export type SecretaryReading = {
  facts: SecretaryReadingFacts;
  environment: SecretaryReadingBlock;
  responsePattern: SecretaryReadingBlock;
  scenes: SecretaryReadingScenes;
  stressPattern: SecretaryStressPattern;
  secretarySuggestions: SecretarySuggestion[];
  closingLine: string;
  evidence: SecretaryEvidenceItem[];
};

/** 일간 → 환경에 대한 반응(자세) — 2순위, 장면형 */
const DAY_RESPONSE: Record<string, { label: string; text: string }> = {
  갑: {
    label: "먼저 판을 깔기",
    text: "자료가 덜 모여도 방향을 먼저 잡고 움직이기 쉬운 편이에요. 한번 밀면 속도가 나지만, 중간에 조율이 길어지면 답답해질 수 있어요.",
  },
  을: {
    label: "맞추며 길 만들기",
    text: "딱 부러지게 밀기보다, 상대·상황에 맞춰 길을 바꾸는 쪽으로 움직이기 쉬워요. 거절이 어려우면 일이 겹치는 날이 반복될 수 있어요.",
  },
  병: {
    label: "앞에 드러내기",
    text: "생각만 할 때보다 말하거나 보여주기 시작할 때 흐름이 열리는 편이에요. 속도가 빠르면 뒤의 정리가 밀릴 수 있어요.",
  },
  정: {
    label: "안에서 끓이기",
    text: "겉은 잔잔해도 안에서 여러 번 다듬은 뒤에야보내기 쉬운 편이에요. 마음에 안 들면 다시 손대는 날이 반복될 수 있어요.",
  },
  무: {
    label: "중간에서 받치기",
    text: "혼자 끝내기보다, 사람·일 사이를 받치며 버티는 쪽으로 움직이기 쉬워요. 책임이 쌓이면 혼자 끌고 가는 패턴이 나올 수 있어요.",
  },
  기: {
    label: "실속으로 쌓기",
    text: "크게 말하기보다, 오늘 굴러가게 만드는 손으로 풀기 쉬운 편이에요. 여러 갈래가 겹치면 우선순위 정리가 늦어질 수 있어요.",
  },
  경: {
    label: "기준으로 자르기",
    text: "애매한 상태를 오래 두기 어렵고, 기준이 보이면 바로 정리하려는 편이에요. 말이 짧고 단단하게 나갈 수 있어요.",
  },
  신: {
    label: "틈 보고 다듬기",
    text: "작은 모순이 보이면 바로 손보거나 절차부터 맞추려는 편이에요. 혼자 다시 검토하는 시간이 길어질 수 있어요.",
  },
  임: {
    label: "큰 그림으로 흘리기",
    text: "한 가지에만 묶이기보다, 흐름을 넓게 보고 갈아타기 쉬운 편이에요. 방향이 자주 바뀌면 주변은 따라가기 힘들 수 있어요.",
  },
  계: {
    label: "안에서 흡수하기",
    text: "겉으로 크게 드러내기보다, 정보·감정을 안에서 여러 번 거른 뒤에 움직이기 쉬워요. 말하기 전에 혼자 오래 고민하는 날이 반복될 수 있어요.",
  },
};

function pickMainSipsin(
  sipsinCount: Record<string, number>
): string[] {
  return Object.entries(sipsinCount)
    .filter(([name]) => name !== "(일간)" && name.trim() !== "")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);
}

export type BuildSecretaryReadingInput = {
  dayGanKo: string;
  monthBranchKo: string;
  sipsinCount: Record<string, number>;
  yongshin?: string;
  gyeok?: string;
  relationTypes?: string[];
  daeunLabel?: string;
  seyunYear?: number;
};

/** v3 secretaryReading 본문 생성 */
export function buildSecretaryReading(
  input: BuildSecretaryReadingInput
): SecretaryReading {
  const {
    dayGanKo,
    monthBranchKo,
    sipsinCount,
    yongshin,
    gyeok,
    relationTypes = [],
    daeunLabel,
    seyunYear,
  } = input;

  const mainSipsin = pickMainSipsin(sipsinCount);
  const primarySipsin = mainSipsin[0] ?? "식신";
  const secondarySipsin = mainSipsin[1];

  const monthAnchor = getMonthLordAnchor(monthBranchKo);
  const monthEnv = buildEnvironmentFromMonthLord(monthBranchKo);
  const dayResp =
    DAY_RESPONSE[dayGanKo] ?? DAY_RESPONSE["기"];

  // 월령(환경 바탕) + 십성(행동 보정) → 5축 · 흔들림은 월령 장면 우선
  const scenes = buildScenesFromMonthAndSipsin(monthBranchKo, mainSipsin);
  const stressPattern = buildStressFromMonthLord(monthBranchKo);
  const gyeokSuggestion: SecretarySuggestion | undefined = gyeok
    ? {
        title: "맡을 범위 한 줄",
        action: "내가 맡을 일과 맡기지 않을 일을 문장으로 적어 보세요.",
        reason: `격국 ${gyeok} — 범위가 한곳에 몰릴 때`,
      }
    : undefined;
  const secretarySuggestions = buildSuggestionsFromMainSipsin(
    mainSipsin,
    gyeokSuggestion,
  );

  const evidence: SecretaryEvidenceItem[] = [
    {
      term: `월지 ${monthBranchKo}`,
      role: "month",
      note: monthEnv.label,
    },
    {
      term: `일간 ${dayGanKo}`,
      role: "dayMaster",
      note: dayResp.label,
    },
    {
      term: primarySipsin,
      role: "sipsin",
      note: "원국에서 두드러지는 십성(전면 1)",
    },
  ];
  if (secondarySipsin) {
    evidence.push({
      term: secondarySipsin,
      role: "sipsin",
      note: "원국에서 두드러지는 십성(전면 2)",
    });
  }
  if (yongshin) {
    evidence.push({
      term: yongshin,
      role: "sipsin",
      note: "용신 (팩트)",
    });
  }
  if (gyeok) {
    evidence.push({
      term: gyeok,
      role: "sipsin",
      note: "격국 (팩트)",
    });
  }
  for (const rel of relationTypes.slice(0, 3)) {
    evidence.push({
      term: rel,
      role: "relation",
      note: "지지 관계",
    });
  }
  if (daeunLabel) {
    evidence.push({
      term: daeunLabel,
      role: "daeyun",
      note: "현재 대운",
    });
  }
  if (seyunYear) {
    evidence.push({
      term: `${seyunYear}년 세운`,
      role: "sewoon",
      note: "올해 흐름 참고",
    });
  }

  const closingLine =
    `${dayResp.text.split(".")[0]}. ` +
    `${monthAnchor.secretaryLine}`;

  return {
    facts: {
      dayMaster: dayGanKo,
      monthBranch: monthBranchKo,
      mainSipsin,
      usefulGod: yongshin || undefined,
      structure: gyeok || undefined,
      relations: relationTypes.length > 0 ? relationTypes : undefined,
    },
    environment: {
      label: monthEnv.label,
      text: monthEnv.text,
      evidence: [`월지 ${monthBranchKo}`],
    },
    responsePattern: {
      label: dayResp.label,
      text: dayResp.text,
      evidence: [`일간 ${dayGanKo}`],
    },
    scenes,
    stressPattern,
    secretarySuggestions,
    closingLine,
    evidence,
  };
}

/** UI·아카이브용 짧은 v3 요약 (legacy summary 대체 후보) */
export function buildV3SummaryText(reading: SecretaryReading): string {
  const parts = [
    reading.environment.text,
    reading.responsePattern.text,
    reading.closingLine,
  ];
  return parts.filter(Boolean).join("\n\n");
}

/** 십성 분석 desc — v3 한 줄 장면 (사전) */
export function buildSipsinSceneLine(sipsinName: string): string {
  return buildSipsinSceneLineFromDictionary(sipsinName);
}

/** 오행 분석 desc — 강/약 없이 팩트만 */
export function buildOhaengFactLine(name: string, count: number): string {
  return `원국에서 ${name}이(가) ${count}개 나타납니다. (오행 개수 팩트)`;
}
