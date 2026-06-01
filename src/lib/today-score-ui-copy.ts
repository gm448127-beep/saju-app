/**
 * 점수 UI 숨김 시 API 문장에 남은 "71점" 등을 화면에서만 제거
 * (계산·저장 로직은 변경하지 않음)
 */

/** 화면 표시용 — 숫자 점수·괄호 점수 표기 제거 */
export function stripScoreMentions(text: string): string {
  if (!text?.trim()) return text;
  return text
    .replace(/\s*\(\s*\d+점[^)]*\)/g, "")
    .replace(/\s*[,·]\s*\d+점/g, "")
    .replace(/\d+점/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}
