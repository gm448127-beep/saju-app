/**
 * AI 생성 문장 — 마침표(.) 종결 검사
 * 출력 후 경고 로그만 남기고, 자동 수정은 하지 않는다.
 */

export const UNMYEONG_PROMPT_SENTENCE_PERIOD_CLOSING = `[문장 마침 — 필수]
- 모든 문장은 반드시 마침표(.)로 끝낸다.
- 마침표 없이 문장이나 줄을 끝내지 않는다.`;

/** system/user 프롬프트 맨 끝에 마침표 규칙 블록 추가 */
export function appendUnmyeongPromptSentencePeriodRule(prompt: string): string {
  const base = prompt.trimEnd();
  if (base.includes("모든 문장은 반드시 마침표")) return base;
  return `${base}\n\n${UNMYEONG_PROMPT_SENTENCE_PERIOD_CLOSING}`;
}

export type SentenceWithoutPeriod = {
  /** 원문 내 시작 위치(대략) */
  index: number;
  text: string;
};

export type SentencePeriodLintResult = {
  ok: boolean;
  missing: SentenceWithoutPeriod[];
};

const LOG_PREFIX = "[운명비서 AI 문장]";

/** 마침표(.)로 끝나는지 — 닫는 따옴표·괄호 허용 */
export function endsWithSentencePeriod(text: string): boolean {
  return /[.]["')\]」』]*\s*$/.test(text.trim());
}

/** 헤더·라벨·JSON 조각 등 검사 제외 */
export function shouldSkipSentencePeriodCheck(sentence: string): boolean {
  const s = sentence.trim();
  if (!s) return true;
  if (s.length < 3) return true;
  if (/^#{1,6}\s/.test(s)) return true;
  if (/^[-*_]{3,}\s*$/.test(s)) return true;
  if (!/[가-힣A-Za-z]/.test(s)) return true;
  if (/[：:]\s*$/.test(s) && !endsWithSentencePeriod(s)) return true;
  if (/^[\[{<][\s\S]*[\]}>]\s*$/.test(s) && !endsWithSentencePeriod(s)) return true;
  if (/^[-*•]\s*[\w가-힣]{1,12}\s*[:：]/.test(s)) return true;
  return false;
}

/** 텍스트를 문장 후보 단위로 분리 */
export function splitSentenceCandidates(text: string): string[] {
  if (!text?.trim()) return [];

  const candidates: string[] = [];
  const normalized = text.replace(/\r\n/g, "\n");

  for (const line of normalized.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/(?<=[.!?…])\s+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) {
      candidates.push(trimmed);
    } else {
      candidates.push(...parts);
    }
  }

  return candidates;
}

/** 마침표로 끝나지 않은 문장 목록 */
export function findSentencesWithoutPeriod(text: string): SentenceWithoutPeriod[] {
  const missing: SentenceWithoutPeriod[] = [];
  let searchFrom = 0;

  for (const candidate of splitSentenceCandidates(text)) {
    if (shouldSkipSentencePeriodCheck(candidate)) continue;
    if (endsWithSentencePeriod(candidate)) continue;

    const index = text.indexOf(candidate, searchFrom);
    missing.push({
      index: index >= 0 ? index : searchFrom,
      text: candidate,
    });
    searchFrom = index >= 0 ? index + candidate.length : searchFrom + candidate.length;
  }

  return missing;
}

export function lintSentencesWithoutPeriod(text: string): SentencePeriodLintResult {
  const missing = findSentencesWithoutPeriod(text);
  return { ok: missing.length === 0, missing };
}

export type WarnSentencesWithoutPeriodOptions = {
  /** 로그 출처 — 예: today/secretaryCopy, chat/reply */
  source?: string;
  /** 필드명 — 예: coreMessage */
  field?: string;
};

/** 마침표 미종결 문장이 있으면 console.warn */
export function warnSentencesWithoutPeriod(
  text: string,
  options: WarnSentencesWithoutPeriodOptions = {},
): SentencePeriodLintResult {
  const result = lintSentencesWithoutPeriod(text);
  if (result.ok || !text?.trim()) return result;

  const scope = [options.source, options.field].filter(Boolean).join("/") || "output";
  const preview = (s: string) => (s.length > 72 ? `${s.slice(0, 72)}…` : s);

  for (const item of result.missing) {
    console.warn(
      `${LOG_PREFIX} 마침표 없음 @${scope} (index ${item.index}): "${preview(item.text)}"`,
    );
  }

  return result;
}

/** 객체 필드 일괄 검사 */
export function warnAiOutputFieldsWithoutPeriod(
  fields: Record<string, string | undefined | null>,
  options: Omit<WarnSentencesWithoutPeriodOptions, "field"> = {},
): void {
  for (const [field, value] of Object.entries(fields)) {
    if (!value?.trim()) continue;
    warnSentencesWithoutPeriod(value, { ...options, field });
  }
}
