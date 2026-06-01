/**
 * 프리미엄 리포트 출력 — 헌법 v3 린트 (운영: warn/meta, 테스트: assert 가능)
 */

import {
  lintUnmyeongOutput,
  type UnmyeongLintResult,
  type UnmyeongViolation,
} from "@/lib/unmyeong-output-lint";
import { runRouteOutputLint, type RouteLintMeta } from "@/lib/unmyeong-route-lint";

export type PremiumLintMeta = RouteLintMeta;

/** 운영·생성 파이프라인 — throw 없이 메타만 반환 */
export function lintPremiumReportOutput(report: string): PremiumLintMeta {
  return runRouteOutputLint({ report }, "saju-premium");
}

/** 테스트·CI — 위반 시 throw */
export function assertPremiumReportLint(report: string): void {
  const { ok, violations } = lintUnmyeongOutput(report);
  if (ok) return;
  const detail = violations
    .map((v) => `${v.type}@${v.index}:"${v.word}"`)
    .join("; ");
  throw new Error(`premium report lint failed: ${detail}`);
}

export function applyPremiumReportLint(report: string): {
  report: string;
  lint: PremiumLintMeta;
} {
  const lint = lintPremiumReportOutput(report);
  return { report, lint };
}

export type { UnmyeongLintResult, UnmyeongViolation };
