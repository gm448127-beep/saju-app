/**
 * 운명비서 v3 출력 문체 린트
 * @see docs/content-constitution-3.0.md
 * @see src/lib/unmyeong-constitution-v3.ts
 *
 * API·채팅·프리미엄·오늘운세 등 사용자 노출 문장에 공통 적용.
 */

export type UnmyeongViolationType =
  | "personality_label"
  | "strength_label"
  | "lesson"
  | "prediction"
  | "fatalism";

export type UnmyeongViolation = {
  type: UnmyeongViolationType;
  word: string;
  index: number;
  suggestion?: string;
};

export type UnmyeongLintResult = {
  ok: boolean;
  violations: UnmyeongViolation[];
};

/** 명리 팩트 라벨 — 이 토큰 자체는 허용 (진단형 강/약 문장은 별도 규칙으로 차단) */
export const UNMYEONG_FACT_LABEL_TOKENS = [
  "신강",
  "신약",
  "강약",
  "십성",
  "오행",
] as const;

const SUGGESTIONS: Record<UnmyeongViolationType, string> = {
  personality_label:
    "추상 성격 라벨 대신 관계·일·돈·선택·감정 중 구체 장면으로 바꿔 보세요.",
  strength_label:
    "강/약·부족/넘침 단정 대신 ‘~쪽으로 기울기 쉽습니다’·‘반복될 수 있어요’ 장면을 쓰세요.",
  lesson: "훈계·명령형(~하세요) 대신 ‘흔들릴 때 ~ 장면’ 또는 실행 한 가지 제안을 쓰세요.",
  prediction:
    "미래 사건 예언 대신 ‘반복되기 쉬운 패턴’·‘나타날 수 있는 장면’으로 쓰세요.",
  fatalism:
    "낙인·운명 단정 대신 지금 시기·환경·반응 패턴으로 쓰세요.",
};

type LintRule = {
  type: UnmyeongViolationType;
  /** 위반 보고용 표시 문자열 */
  word: string;
  pattern: RegExp;
};

/** 카테고리별 금지 패턴 — 긴 구문을 먼저 두어 부분 중복 보고를 줄임 */
const LINT_RULES: LintRule[] = [
  // personality_label
  { type: "personality_label", word: "리더십", pattern: /리더십/g },
  { type: "personality_label", word: "표현력", pattern: /표현력/g },
  { type: "personality_label", word: "창의력", pattern: /창의력/g },
  { type: "personality_label", word: "사교성", pattern: /사교성/g },
  { type: "personality_label", word: "완벽주의", pattern: /완벽주의/g },
  { type: "personality_label", word: "성격이", pattern: /성격이/g },
  { type: "personality_label", word: "타입", pattern: /타입/g },

  // strength_label (신강/신약 등 팩트 라벨과 겹치지 않는 진단형만)
  { type: "strength_label", word: "강한 사람", pattern: /강한\s*사람/g },
  { type: "strength_label", word: "약한 사람", pattern: /약한\s*사람/g },
  { type: "strength_label", word: "강합니다", pattern: /강합니다/g },
  { type: "strength_label", word: "약합니다", pattern: /약합니다/g },
  { type: "strength_label", word: "부족합니다", pattern: /부족합니다/g },
  { type: "strength_label", word: "넘칩니다", pattern: /넘칩니다/g },
  { type: "strength_label", word: "강하다", pattern: /강하다/g },
  { type: "strength_label", word: "약하다", pattern: /약하다/g },

  // lesson
  { type: "lesson", word: "조심하세요", pattern: /조심하세요/g },
  { type: "lesson", word: "신중하세요", pattern: /신중하세요/g },
  { type: "lesson", word: "침착하세요", pattern: /침착하세요/g },
  {
    type: "lesson",
    word: "마음을 다스리세요",
    pattern: /마음을\s*다스리세요/g,
  },
  {
    type: "lesson",
    word: "긍정적으로 생각하세요",
    pattern: /긍정적으로\s*생각하세요/g,
  },

  // prediction
  {
    type: "prediction",
    word: "좋은 일이 생깁니다",
    pattern: /좋은\s*일이\s*생깁니다/g,
  },
  { type: "prediction", word: "연락이 옵니다", pattern: /연락이\s*옵니다/g },
  {
    type: "prediction",
    word: "돈이 들어옵니다",
    pattern: /돈이\s*들어옵니다/g,
  },
  {
    type: "prediction",
    word: "재회할 수 있습니다",
    pattern: /재회할\s*수\s*있습니다/g,
  },
  {
    type: "prediction",
    word: "합격운이 좋습니다",
    pattern: /합격운이\s*좋습니다/g,
  },
  {
    type: "prediction",
    word: "재물운이 상승합니다",
    pattern: /재물운이\s*상승합니다/g,
  },

  // fatalism
  {
    type: "fatalism",
    word: "당신은 원래",
    pattern: /당신은\s*원래/g,
  },
  { type: "fatalism", word: "타고난", pattern: /타고난/g },
  { type: "fatalism", word: "운명적으로", pattern: /운명적으로/g },
  { type: "fatalism", word: "반드시", pattern: /반드시/g },
  { type: "fatalism", word: "절대", pattern: /절대/g },
];

/** strength_label: 팩트 라벨 문맥에 겹친 오탐 방지 (예: 신강/신약 인접 구간) */
function isStrengthLabelFactContext(text: string, index: number): boolean {
  const windowStart = Math.max(0, index - 6);
  const windowEnd = Math.min(text.length, index + 12);
  const slice = text.slice(windowStart, windowEnd);
  return /신강|신약|강약/.test(slice);
}

function isOverlapping(
  start: number,
  end: number,
  ranges: { start: number; end: number }[],
): boolean {
  return ranges.some((r) => start < r.end && end > r.start);
}

function collectMatches(text: string, rule: LintRule): UnmyeongViolation[] {
  const found: UnmyeongViolation[] = [];
  const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
  let match: RegExpExecArray | null;
  const occupied: { start: number; end: number }[] = [];

  while ((match = pattern.exec(text)) !== null) {
    const index = match.index;
    const word = match[0];
    const end = index + word.length;

    if (isOverlapping(index, end, occupied)) {
      continue;
    }

    if (
      rule.type === "strength_label" &&
      isStrengthLabelFactContext(text, index)
    ) {
      continue;
    }

    occupied.push({ start: index, end });
    found.push({
      type: rule.type,
      word,
      index,
      suggestion: SUGGESTIONS[rule.type],
    });
  }

  return found;
}

/** v3 헌법 위반 여부 검사 */
export function lintUnmyeongOutput(text: string): UnmyeongLintResult {
  if (!text?.trim()) {
    return { ok: true, violations: [] };
  }

  const violations: UnmyeongViolation[] = [];
  for (const rule of LINT_RULES) {
    violations.push(...collectMatches(text, rule));
  }

  violations.sort((a, b) => a.index - b.index || a.word.localeCompare(b.word));

  return {
    ok: violations.length === 0,
    violations,
  };
}

/** 테스트·CI — 위반 시 Error */
export function assertUnmyeongOutput(text: string): void {
  const { ok, violations } = lintUnmyeongOutput(text);
  if (ok) return;

  const detail = violations
    .map((v) => `${v.type}@${v.index}:"${v.word}"`)
    .join("; ");
  throw new Error(`unmyeong v3 output lint failed: ${detail}`);
}

/**
 * 표시용 최소 정리 — 감지 우선, 위반 구간만 … 로 치환
 * (전체 문장 삭제·의미 재작성은 하지 않음)
 */
export function sanitizeForDisplay(text: string): string {
  const { violations } = lintUnmyeongOutput(text);
  if (violations.length === 0) return text;

  let out = text;
  const sorted = [...violations].sort((a, b) => b.index - a.index);
  for (const v of sorted) {
    out = out.slice(0, v.index) + "…" + out.slice(v.index + v.word.length);
  }
  return out;
}

/** secretaryReading 노출 문장 수집 */
export function collectSecretaryReadingTexts(reading: {
  environment: { label: string; text: string };
  responsePattern: { label: string; text: string };
  scenes: Record<string, string | undefined>;
  stressPattern: { trigger: string; scene: string };
  secretarySuggestions: { title: string; action: string; reason: string }[];
  closingLine: string;
}): string[] {
  return [
    reading.environment.label,
    reading.environment.text,
    reading.responsePattern.label,
    reading.responsePattern.text,
    reading.closingLine,
    reading.stressPattern.trigger,
    reading.stressPattern.scene,
    ...Object.values(reading.scenes).filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    ),
    ...reading.secretarySuggestions.flatMap((s) => [
      s.title,
      s.action,
      s.reason,
    ]),
  ];
}

/** secretaryReading 전체 본문 린트 */
export function assertSecretaryReadingLint(reading: Parameters<
  typeof collectSecretaryReadingTexts
>[0]): void {
  for (const text of collectSecretaryReadingTexts(reading)) {
    assertUnmyeongOutput(text);
  }
}

/** 여러 필드를 한 번에 검사 (API 응답 객체 등) */
export function lintUnmyeongOutputFields(
  fields: Record<string, string | undefined | null>,
): UnmyeongLintResult {
  const violations: UnmyeongViolation[] = [];
  for (const [field, value] of Object.entries(fields)) {
    if (!value) continue;
    const result = lintUnmyeongOutput(value);
    for (const v of result.violations) {
      violations.push({ ...v, word: `${field}: ${v.word}` });
    }
  }
  return { ok: violations.length === 0, violations };
}
