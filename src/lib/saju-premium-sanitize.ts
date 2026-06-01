/**
 * 프리미엄 API 입력 — 레거시 해석 필드 제거 (facts·v3 빌더 이중 방어)
 */

import type { SajuPremiumChartData } from "@/lib/saju-premium-context";

const LEGACY_STRIP_KEYS = new Set([
  "personality",
  "summary",
  "compactText",
  "markdownText",
  "interpretation",
  "interpretationTitle",
  "interpretationSummary",
  "personalityMap",
  "sipsinDesc",
  "ohaengDesc",
  "legacy",
]);

function stripTopLevelLegacy(chart: SajuPremiumChartData): SajuPremiumChartData {
  const out: SajuPremiumChartData = { ...chart };
  for (const key of Object.keys(out)) {
    if (LEGACY_STRIP_KEYS.has(key) || key.startsWith("LEGACY_")) {
      delete out[key];
    }
  }
  return out;
}

export function sanitizePremiumChartInput(chart: SajuPremiumChartData): SajuPremiumChartData {
  const stripped = stripTopLevelLegacy(chart);
  const {
    personality: _p,
    summary: _s,
    compactText: _c,
    markdownText: _m,
    interpretation: _i,
    interpretationTitle: _it,
    interpretationSummary: _is,
    personalityMap: _pm,
    sipsinDesc: _sd,
    ohaengDesc: _od,
    legacy: _leg,
    ...rest
  } = stripped;

  return {
    ...rest,
    ohaengAnalysis: chart.ohaengAnalysis?.map(({ name, count }) => ({ name, count })),
    sipsinAnalysis: chart.sipsinAnalysis?.map(({ name, count }) => ({ name, count })),
    stemRelations: chart.stemRelations?.map(({ type, pillars, stems }) => ({
      type,
      pillars,
      stems,
    })),
    branchRelations: chart.branchRelations?.map(({ type, details }) => ({
      type,
      details,
    })),
  };
}
