/**
 * 프리미엄 사주 리포트 — 생성 후 문체 후처리
 * LLM이 ~습니다·역술가 톤을 섞어도 최종 출력을 운명비서 말투로 정리
 */

import { applySecretaryVoice } from "@/lib/today-secretary-voice";
import { warnSentencesWithoutPeriod } from "@/lib/unmyeong-sentence-period";

/** 보고서체·역술가 패턴 → 해요체 (마크다운 헤더 제외) */
const PREMIUM_LINE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/([가-힣])습니다(?=\.|$|\s)/g, "$1어요"],
  [/([가-힣])입니다(?=\.|$|\s)/g, "$1이에요"],
  [/([가-힣])됩니다(?=\.|$|\s)/g, "$1돼요"],
  [/([가-힣])겠습니다(?=\.|$|\s)/g, "$1겠어요"],
  [/([가-힣])십시오(?=\.|$|\s)/g, "$1세요"],
  [/신중(?:한|히)\s*접근/g, "한 번 더 생각"],
  [/리더십이\s*강/g, "앞에 서는 편"],
  [/표현력이\s*(?:뛰어납|좋습)/g, "말·글로 풀면 편"],
  [/추진력이\s*(?:뛰어납|강합)/g, "일단 움직이는 편"],
  [/~?한\s*사람입니다/g, "패턴이에요"],
  [/당신은\s*[^.\n]{2,30}한\s*사람/g, "이런 선택이 반복"],
  [/운이\s*(?:상승|좋습|상당)/g, "흐름이 밀리는 편"],
  [/좋은\s*일이\s*생/g, "기대가 커지"],
];

function isMarkdownStructureLine(line: string): boolean {
  const t = line.trim();
  return /^#{1,3}\s/.test(t) || t === "---" || t === "";
}

/** 한 줄 문체 정리 — 헤더·구분선은 그대로 */
export function applySajuPremiumLineVoice(line: string): string {
  if (isMarkdownStructureLine(line)) return line;
  let out = line;
  for (const [pattern, replacement] of PREMIUM_LINE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  // applySecretaryVoice는 공백을 한 칸으로 — 줄 단위로만 적용
  if (!/^#/.test(out.trim())) {
    out = applySecretaryVoice(out.replace(/\s+/g, " "));
    warnSentencesWithoutPeriod(out, { source: "saju/premium", field: "line" });
  }
  return out;
}

/** 마크다운 리포트 전체 후처리 */
export function applySajuPremiumReportVoice(report: string): string {
  if (!report?.trim()) return report;
  return report
    .split("\n")
    .map((line) => applySajuPremiumLineVoice(line))
    .join("\n");
}
