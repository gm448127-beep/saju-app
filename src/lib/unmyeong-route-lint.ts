/**
 * API route 응답 — 헌법 v3 출력 린트 (운영: warn + meta, 테스트: assert)
 * @see src/lib/unmyeong-output-lint.ts
 */

import {
  assertUnmyeongOutput,
  lintUnmyeongOutputFields,
  type UnmyeongViolation,
} from "@/lib/unmyeong-output-lint";
import { warnAiOutputFieldsWithoutPeriod } from "@/lib/unmyeong-sentence-period";

export type RouteLintMeta = {
  lintOk: boolean;
  lintViolations: UnmyeongViolation[];
};

/** 사용자 노출 문장만 수집 */
export function pushDisplayText(
  fields: Record<string, string | undefined | null>,
  key: string,
  value: unknown,
): void {
  if (typeof value === "string" && value.trim()) {
    fields[key] = value;
  }
}

export function runRouteOutputLint(
  fields: Record<string, string | undefined | null>,
  route: string,
): RouteLintMeta {
  const { ok, violations } = lintUnmyeongOutputFields(fields);
  if (!ok) {
    console.warn(
      `[unmyeong-route-lint:${route}]`,
      violations.map((v) => `${v.type}@${v.index}:"${v.word}"`).join("; "),
    );
  }
  warnAiOutputFieldsWithoutPeriod(fields, { source: route });
  return { lintOk: ok, lintViolations: violations };
}

/** 기존 meta와 병합 — 스키마 필드는 유지 */
export function attachRouteLintMeta<T extends Record<string, unknown>>(
  body: T,
  route: string,
  fields: Record<string, string | undefined | null>,
): T & { meta: Record<string, unknown> & RouteLintMeta } {
  const lint = runRouteOutputLint(fields, route);
  const prevMeta =
    body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
      ? (body.meta as Record<string, unknown>)
      : {};
  return {
    ...body,
    meta: {
      ...prevMeta,
      lintOk: lint.lintOk,
      lintViolations: lint.lintViolations,
    },
  };
}

/** 테스트·CI — 수집 필드 전체 assert */
export function assertRouteDisplayLint(
  fields: Record<string, string | undefined | null>,
): void {
  for (const [key, value] of Object.entries(fields)) {
    if (value) assertUnmyeongOutput(value);
  }
}

/* ─── today ─── */

export function collectTodayDisplayFields(
  res: Record<string, unknown>,
): Record<string, string | undefined | null> {
  const f: Record<string, string | undefined | null> = {};

  pushDisplayText(f, "summary", res.summary);
  pushDisplayText(f, "tip", res.tip);
  pushDisplayText(f, "warning", res.warning);
  pushDisplayText(f, "relationDetail", res.relationDetail);
  pushDisplayText(f, "sajuTriggerIntro", res.sajuTriggerIntro);

  const briefing = res.briefing as Record<string, unknown> | undefined;
  if (briefing) {
    pushDisplayText(f, "briefing.headline", briefing.headline);
    pushDisplayText(f, "briefing.oneLine", briefing.oneLine);
    pushDisplayText(f, "briefing.focus", briefing.focus);
    pushDisplayText(f, "briefing.caution", briefing.caution);
    const exec = briefing.executiveSummary;
    if (Array.isArray(exec)) {
      exec.forEach((line, i) => pushDisplayText(f, `briefing.executiveSummary.${i}`, line));
    }
  }

  const character = res.character as Record<string, unknown> | undefined;
  if (character) {
    pushDisplayText(f, "character.description", character.description);
  }

  const secretaryCopy = res.secretaryCopy as Record<string, unknown> | undefined;
  if (secretaryCopy) {
    for (const key of [
      "coreMessage",
      "flowNarrative",
      "warningLine",
      "shake",
      "myeongri",
      "strategy",
    ]) {
      pushDisplayText(f, `secretaryCopy.${key}`, secretaryCopy[key]);
    }
  }

  const dailyReport = res.dailyReport as Record<string, unknown> | undefined;
  if (dailyReport) {
    pushDisplayText(f, "dailyReport.sentence", dailyReport.sentence);
    pushDisplayText(f, "dailyReport.flow", dailyReport.flow);
    pushDisplayText(f, "dailyReport.saveSentence", dailyReport.saveSentence);
    pushDisplayText(
      f,
      "dailyReport.compareWithYesterday",
      dailyReport.compareWithYesterday,
    );
    const ag = dailyReport.actionGuide as Record<string, unknown> | undefined;
    if (ag) {
      pushDisplayText(f, "dailyReport.actionGuide.dos", ag.dos);
      pushDisplayText(f, "dailyReport.actionGuide.donts", ag.donts);
      pushDisplayText(f, "dailyReport.actionGuide.relationTip", ag.relationTip);
      pushDisplayText(f, "dailyReport.actionGuide.workMoneyTip", ag.workMoneyTip);
    }
    const ep = dailyReport.emotionPoint as Record<string, unknown> | undefined;
    if (ep) {
      pushDisplayText(f, "dailyReport.emotionPoint.description", ep.description);
      const tips = ep.tips;
      if (Array.isArray(tips)) {
        tips.forEach((t, i) => pushDisplayText(f, `dailyReport.emotionPoint.tips.${i}`, t));
      }
    }
    const slots = dailyReport.timeSlots;
    if (Array.isArray(slots)) {
      slots.forEach((slot, i) => {
        const s = slot as Record<string, unknown>;
        pushDisplayText(f, `dailyReport.timeSlots.${i}.description`, s.description);
      });
    }
    const weekly = dailyReport.weekly as Record<string, unknown> | undefined;
    if (weekly) pushDisplayText(f, "dailyReport.weekly.summary", weekly.summary);
    const rec = dailyReport.recommendation as Record<string, unknown> | undefined;
    if (rec) {
      pushDisplayText(f, "dailyReport.recommendation.text", rec.text);
    }
  }

  const detailedFortunes = res.detailedFortunes;
  if (Array.isArray(detailedFortunes)) {
    detailedFortunes.forEach((item, i) => {
      const d = item as Record<string, unknown>;
      pushDisplayText(f, `detailedFortunes.${i}.overview`, d.overview);
      pushDisplayText(f, `detailedFortunes.${i}.positive`, d.positive);
      pushDisplayText(f, `detailedFortunes.${i}.cautionText`, d.cautionText);
      pushDisplayText(f, `detailedFortunes.${i}.action`, d.action);
      pushDisplayText(f, `detailedFortunes.${i}.avoid`, d.avoid);
    });
  }

  const timeAdvice = res.timeAdvice;
  if (Array.isArray(timeAdvice)) {
    timeAdvice.forEach((item, i) => {
      const t = item as Record<string, unknown>;
      pushDisplayText(f, `timeAdvice.${i}.summary`, t.summary);
      pushDisplayText(f, `timeAdvice.${i}.advice`, t.advice);
    });
  }

  const hourlyFlow = res.hourlyFlow;
  if (Array.isArray(hourlyFlow)) {
    hourlyFlow.forEach((item, i) => {
      const h = item as Record<string, unknown>;
      pushDisplayText(f, `hourlyFlow.${i}.advice`, h.advice);
    });
  }

  const dos = res.todayDosDetailed;
  if (Array.isArray(dos)) {
    dos.forEach((item, i) => {
      const d = item as Record<string, unknown>;
      pushDisplayText(f, `todayDosDetailed.${i}.text`, d.text);
      pushDisplayText(f, `todayDosDetailed.${i}.reason`, d.reason);
      pushDisplayText(f, `todayDosDetailed.${i}.action`, d.action);
    });
  }

  const donts = res.todayDontsDetailed;
  if (Array.isArray(donts)) {
    donts.forEach((item, i) => {
      const d = item as Record<string, unknown>;
      pushDisplayText(f, `todayDontsDetailed.${i}.text`, d.text);
      pushDisplayText(f, `todayDontsDetailed.${i}.reason`, d.reason);
      pushDisplayText(f, `todayDontsDetailed.${i}.action`, d.action);
    });
  }

  const luckyItems = res.luckyItems;
  if (Array.isArray(luckyItems)) {
    luckyItems.forEach((item, i) => {
      const l = item as Record<string, unknown>;
      pushDisplayText(f, `luckyItems.${i}.detail`, l.detail);
      pushDisplayText(f, `luckyItems.${i}.use`, l.use);
    });
  }

  return f;
}

/* ─── compatibility ─── */

export function collectCompatibilityDisplayFields(res: {
  mainAdvice?: string;
  gearAnalysis?: { desc?: string }[];
  categories?: { description?: string }[];
  strengths?: string[];
  weaknesses?: string[];
  tips?: string[];
  ohaengCombo?: {
    chemistry?: string;
    strength?: string;
    weakness?: string;
    tip?: string;
  };
  ddiCombo?: { desc?: string };
  ilju?: { desc?: string };
  eumyangDesc?: string;
  person1?: { personality?: { title?: string; traits?: string } };
  person2?: { personality?: { title?: string; traits?: string } };
}): Record<string, string | undefined | null> {
  const f: Record<string, string | undefined | null> = {};

  pushDisplayText(f, "mainAdvice", res.mainAdvice);
  pushDisplayText(f, "eumyangDesc", res.eumyangDesc);
  pushDisplayText(f, "ohaengCombo.chemistry", res.ohaengCombo?.chemistry);
  pushDisplayText(f, "ohaengCombo.strength", res.ohaengCombo?.strength);
  pushDisplayText(f, "ohaengCombo.weakness", res.ohaengCombo?.weakness);
  pushDisplayText(f, "ohaengCombo.tip", res.ohaengCombo?.tip);
  pushDisplayText(f, "ddiCombo.desc", res.ddiCombo?.desc);
  pushDisplayText(f, "ilju.desc", res.ilju?.desc);
  pushDisplayText(f, "person1.personality.traits", res.person1?.personality?.traits);
  pushDisplayText(f, "person2.personality.traits", res.person2?.personality?.traits);

  res.gearAnalysis?.forEach((g, i) =>
    pushDisplayText(f, `gearAnalysis.${i}.desc`, g.desc),
  );
  res.categories?.forEach((c, i) =>
    pushDisplayText(f, `categories.${i}.description`, c.description),
  );
  res.strengths?.forEach((s, i) => pushDisplayText(f, `strengths.${i}`, s));
  res.weaknesses?.forEach((s, i) => pushDisplayText(f, `weaknesses.${i}`, s));
  res.tips?.forEach((s, i) => pushDisplayText(f, `tips.${i}`, s));

  return f;
}

/* ─── tojeong ─── */

export function collectTojeongDisplayFields(res: {
  poem?: string;
  meaning?: string;
  summary?: string;
  advice?: string;
  caution?: string;
  deepContent?: string | null;
  samjae?: { description?: string };
  categories?: { description?: string; tip?: string }[];
  monthlyFortunes?: { description?: string }[];
}): Record<string, string | undefined | null> {
  const f: Record<string, string | undefined | null> = {};

  pushDisplayText(f, "poem", res.poem);
  pushDisplayText(f, "meaning", res.meaning);
  pushDisplayText(f, "summary", res.summary);
  pushDisplayText(f, "advice", res.advice);
  pushDisplayText(f, "caution", res.caution);
  pushDisplayText(f, "deepContent", res.deepContent ?? undefined);
  pushDisplayText(f, "samjae.description", res.samjae?.description);

  res.categories?.forEach((c, i) => {
    pushDisplayText(f, `categories.${i}.description`, c.description);
    pushDisplayText(f, `categories.${i}.tip`, c.tip);
  });
  res.monthlyFortunes?.forEach((m, i) =>
    pushDisplayText(f, `monthlyFortunes.${i}.description`, m.description),
  );

  return f;
}

/* ─── tarot / dream ─── */

export function collectTarotDisplayFields(res: {
  reading?: string;
}): Record<string, string | undefined | null> {
  const f: Record<string, string | undefined | null> = {};
  pushDisplayText(f, "reading", res.reading);
  return f;
}

export function collectDreamDisplayFields(res: {
  interpretation?: string;
}): Record<string, string | undefined | null> {
  const f: Record<string, string | undefined | null> = {};
  pushDisplayText(f, "interpretation", res.interpretation);
  return f;
}
