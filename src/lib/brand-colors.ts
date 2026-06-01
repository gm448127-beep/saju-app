/**
 * JS/TS 브랜드 컬러 — `brand-tokens.css`와 동기화
 * @see docs/brand-color-audit.md
 */

export const BRAND_COLORS = {
  paper: "#F5F0E8",
  paperSubtle: "#FAF6EF",
  paperElevated: "#FFFDFC",
  paperInset: "#F7F2EC",
  paperSelected: "#F2EBE3",
  paperDesktop: "#EBE6DF",
  ink: "#2F282B",
  inkBody: "#5A504B",
  inkMuted: "#726963",
  line: "#DCCFBE",
  lineInteractive: "#917D63",
  accent: "#7A5D35",
  accentHover: "#6B502E",
  onAccent: "#FFFFFF",
  primaryDark: "#2F282B",
  dataAccent: "#C79A5A",
  sageBg: "#E8F0E5",
  sageText: "#5E7A5E",
} as const;

export const OHAENG_BRAND_COLORS: Record<string, string> = {
  목: "#5C8B6F",
  화: "#B85C4C",
  토: "#B89968",
  금: "#9B9591",
  수: "#3D4A5C",
};

/** 궁합·토정·점수 — CTA 색과 데이터 강조 분리 */
export function brandScoreColor(score: number): string {
  if (score >= 80) return BRAND_COLORS.dataAccent;
  if (score >= 65) return BRAND_COLORS.accent;
  if (score >= 50) return BRAND_COLORS.inkMuted;
  return BRAND_COLORS.inkBody;
}

export function brandGradeStyle(grade: string): { color: string; emoji: string } {
  switch (grade) {
    case "SSS":
    case "S":
      return { color: BRAND_COLORS.dataAccent, emoji: "👑" };
    case "A":
      return { color: BRAND_COLORS.accent, emoji: "✨" };
    case "B":
      return { color: BRAND_COLORS.inkBody, emoji: "👍" };
    case "C":
      return { color: BRAND_COLORS.inkMuted, emoji: "💪" };
    default:
      return { color: BRAND_COLORS.inkMuted, emoji: "🛡️" };
  }
}
