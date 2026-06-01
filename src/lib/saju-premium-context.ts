/**
 * 프리미엄 사주 리포트 — API가 계산한 원국 + v3 secretaryReading만 LLM에 전달
 * (legacy personality/summary·해석 desc 금지)
 */

import {
  buildSecretaryReading,
  type SecretaryReading,
} from "@/lib/saju-secretary-reading";
import { getMonthLordAnchor, type MonthLordBranch } from "@/lib/month-lord-anchors";
import { getSipsinScenePack } from "@/lib/sipsin-scene-dictionary";

export type SajuPremiumChartData = Record<string, unknown> & {
  birthDate?: string;
  birthTime?: string;
  gender?: string;
  age?: number;
  dayGan?: string;
  mainElement?: string;
  eumyang?: string;
  strength?: string;
  strengthScore?: number;
  gyeok?: string;
  yongshin?: string;
  gilsin?: string[];
  hyungsin?: string[];
  gongmang?: string;
  pillars?: Record<
    string,
    {
      label?: string;
      skyKo?: string;
      earthKo?: string;
      sky?: string;
      earth?: string;
      tenGodSky?: string;
      tenGodEarth?: string;
      skyElement?: string;
      earthElement?: string;
    }
  >;
  ohaengCount?: Record<string, number>;
  ohaengAnalysis?: Array<{ name: string; count: number; desc?: string }>;
  sipsinCount?: Record<string, number>;
  sipsinAnalysis?: Array<{ name: string; count: number; desc?: string }>;
  stemRelations?: Array<{ type?: string; desc?: string; pillars?: string; stems?: string }>;
  branchRelations?: Array<{ type?: string; details?: Record<string, string> }>;
  salsSummary?: Array<{ pillar?: string; twelveSal?: string; specialSals?: string[] }>;
  daeun?: Array<{
    age?: number;
    endAge?: number;
    ganzhi?: string;
    ganKo?: string;
    jiKo?: string;
    tenGodStem?: string;
    tenGodBranch?: string;
  }>;
  daeunCurrent?: { age?: number; ganzhi?: string; ganKo?: string; jiKo?: string } | null;
  daeunStartAge?: number;
  seyun?: Array<{
    year?: number;
    ganzhi?: string;
    ganKo?: string;
    jiKo?: string;
    tenGodStem?: string;
    tenGodBranch?: string;
  }>;
  wolun?: unknown[];
  /** v3 — 무료 사주 API secretaryReading (프리미엄 LLM 1순위 참고) */
  secretaryReading?: SecretaryReading;
  v3?: { secretaryReading?: SecretaryReading };
  /** @deprecated sanitize 시 제거 — 프롬프트에 넣지 않음 */
  compactText?: string;
  markdownText?: string;
  summary?: string;
  personality?: string;
  legacy?: unknown;
};

function lines(block: string[]) {
  return block.filter(Boolean).join("\n");
}

function formatPillars(data: SajuPremiumChartData): string {
  const pillars = data.pillars;
  if (!pillars) return "(사주 기둥 데이터 없음)";

  const order = ["year", "month", "day", "hour"] as const;
  return order
    .map((key) => {
      const p = pillars[key];
      if (!p?.skyKo) return null;
      return `- ${p.label || key}: ${p.skyKo}${p.sky || ""} / ${p.earthKo}${p.earth || ""} | 천간십신 ${p.tenGodSky || "-"} · 지지십신 ${p.tenGodEarth || "-"} | 오행 천${p.skyElement || "-"} 지${p.earthElement || "-"}`;
    })
    .filter(Boolean)
    .join("\n");
}

function formatMonthCommand(data: SajuPremiumChartData): string {
  const month = data.pillars?.month;
  if (!month?.skyKo) return "(월주 데이터 없음)";
  return lines([
    `- 월주: ${month.skyKo}${month.sky || ""} / ${month.earthKo}${month.earth || ""}`,
    `- 월지 십신: ${month.tenGodEarth || "-"}`,
    `- 월간 십신: ${month.tenGodSky || "-"}`,
  ]);
}

function formatDayPillar(data: SajuPremiumChartData): string {
  const day = data.pillars?.day;
  if (!day?.skyKo) {
    return `- 일간: ${data.dayGan || "미상"}`;
  }
  return lines([
    `- 일간: ${day.skyKo}${day.sky || ""} (${data.mainElement || day.skyElement || "오행 미상"})`,
    `- 일지: ${day.earthKo}${day.earth || ""} | 일지 십신 ${day.tenGodEarth || "-"}`,
  ]);
}

function formatOhaengCounts(counts?: Record<string, number>): string {
  if (!counts || Object.keys(counts).length === 0) return "없음";
  const entries = Object.entries(counts).filter(([k]) => k !== "(일간)");
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;
  const countLine = entries.map(([k, v]) => `${k}:${v}`).join(", ");
  const ratioLine = entries
    .map(([k, v]) => `${k} ${Math.round((v / total) * 100)}%`)
    .join(", ");
  return lines([`개수: ${countLine}`, `비율: ${ratioLine}`]);
}

function formatSipsinCounts(counts?: Record<string, number>): string {
  if (!counts || Object.keys(counts).length === 0) return "없음";
  return Object.entries(counts)
    .filter(([k]) => k !== "(일간)")
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`)
    .join(", ");
}

/** 기둥별 십신 위치 — 해석 문장 없이 이름·위치만 */
function formatSipsinPositions(data: SajuPremiumChartData): string {
  const pillars = data.pillars;
  if (!pillars) return "(없음)";

  const order = ["year", "month", "day", "hour"] as const;
  return (
    order
      .map((key) => {
        const p = pillars[key];
        if (!p?.skyKo) return null;
        const label = p.label || key;
        return `  - ${label}: 천간 ${p.tenGodSky || "-"} · 지지 ${p.tenGodEarth || "-"}`;
      })
      .filter(Boolean)
      .join("\n") || "(없음)"
  );
}

function formatRelations(data: SajuPremiumChartData): string {
  const stems =
    data.stemRelations
      ?.map((r) => {
        const parts = [r.type, r.pillars, r.stems].filter(Boolean).join(" · ");
        return `  - ${parts || "(항목 없음)"}`;
      })
      .join("\n") || "  (없음)";
  const branches =
    data.branchRelations
      ?.map((br) => {
        const detail = br.details ? Object.entries(br.details).map(([k, v]) => `${k}:${v}`).join("; ") : "";
        return `  - [${br.type || "관계"}] ${detail || "(상세 없음)"}`;
      })
      .join("\n") || "  (없음)";
  return lines(["천간:", stems, "지지(합·충·형·파·해 등):", branches]);
}

function formatDaeunSeyun(data: SajuPremiumChartData): string {
  const currentYear = new Date().getFullYear();
  const cur = data.daeunCurrent;
  const daeunLine = cur
    ? `현재 대운: ${cur.ganzhi || `${cur.ganKo}${cur.jiKo}`} (시작 나이 약 ${cur.age ?? "?"}세)`
    : "현재 대운: (데이터 없음)";

  const daeunList =
    data.daeun
      ?.slice(0, 8)
      .map(
        (d) =>
          `  - ${d.age ?? "?"}~${d.endAge ?? "?"}세 ${d.ganzhi || `${d.ganKo}${d.jiKo}`} | 십신 ${d.tenGodStem || "-"}/${d.tenGodBranch || "-"}`,
      )
      .join("\n") || "  (없음)";

  const seyunThisYear = data.seyun?.find((s) => s.year === currentYear);
  const seyunLine = seyunThisYear
    ? `${currentYear}년 세운: ${seyunThisYear.ganzhi || `${seyunThisYear.ganKo}${seyunThisYear.jiKo}`} | 십신 ${seyunThisYear.tenGodStem || "-"}/${seyunThisYear.tenGodBranch || "-"}`
    : `${currentYear}년 세운: (목록에서 확인)`;

  const seyunList =
    data.seyun
      ?.filter((s) => s.year && s.year >= currentYear - 1 && s.year <= currentYear + 2)
      .map((s) => `  - ${s.year}년 ${s.ganzhi || `${s.ganKo}${s.jiKo}`}`)
      .join("\n") || "";

  return lines([daeunLine, "대운 흐름(일부):", daeunList, seyunLine, seyunList ? "인근 세운:" : "", seyunList]);
}

/** LLM user 프롬프트용 원국 팩트 시트 — 설명문·레거시 필드 제외 */
export function buildSajuPremiumChartFacts(data: SajuPremiumChartData): string {
  const gender =
    data.gender === "male" || data.gender === "남" || data.gender === "남성"
      ? "남성"
      : data.gender === "female" || data.gender === "여"
        ? "여성"
        : data.gender || "미상";

  return lines([
    "## 입력 메타",
    `- 생년월일: ${data.birthDate || "미상"}`,
    `- 출생시간: ${data.birthTime || "미상(시주 해석 제한 가능)"}`,
    `- 성별: ${gender}`,
    `- 만 나이: ${data.age ?? "미상"}`,
    "",
    "## 일간·일지",
    formatDayPillar(data),
    `- 음양: ${data.eumyang || "미상"}`,
    `- 신강약: ${data.strength || "미상"}${data.strengthScore != null ? ` (점수 ${data.strengthScore})` : ""}`,
    "",
    "## 월령(월주)",
    formatMonthCommand(data),
    "",
    "## 격국·용신·길흉",
    `- 격국: ${data.gyeok || "미상"}`,
    `- 용신: ${data.yongshin || "미상"}`,
    `- 길신(희신): ${data.gilsin?.length ? data.gilsin.join(", ") : "없음"}`,
    `- 흉신(기신): ${data.hyungsin?.length ? data.hyungsin.join(", ") : "없음"}`,
    `- 공망: ${data.gongmang || "없음"}`,
    "",
    "## 사주 원국(연·월·일·시)",
    formatPillars(data),
    "",
    "## 오행",
    formatOhaengCounts(data.ohaengCount),
    "",
    "## 십신 개수",
    formatSipsinCounts(data.sipsinCount),
    "",
    "## 십신 위치(기둥별)",
    formatSipsinPositions(data),
    "",
    "## 합충형파해",
    formatRelations(data),
    "",
    data.salsSummary?.length
      ? lines([
          "## 십이운성·신살",
          ...data.salsSummary.map(
            (s) =>
              `  - ${s.pillar}: 십이운성 ${s.twelveSal || "-"}${s.specialSals?.length ? ` | 신살 ${s.specialSals.join(", ")}` : ""}`,
          ),
        ])
      : "",
    "",
    "## 대운·세운",
    formatDaeunSeyun(data),
  ]);
}

const BRANCH_CHARS = "자축인묘진사오미신유술해";

function extractBranchKo(earthKo?: string): string {
  if (!earthKo) return "진";
  const m = String(earthKo).match(new RegExp(`[${BRANCH_CHARS}]`));
  return m?.[0] ?? "진";
}

function extractDayGanKo(chart: SajuPremiumChartData): string {
  const sky = chart.pillars?.day?.skyKo ?? chart.dayGan ?? "기";
  const m = String(sky).match(/[갑을병정무기경신임계]/);
  return m?.[0] ?? "기";
}

function pickRelationTypes(data: SajuPremiumChartData): string[] {
  const types: string[] = [];
  for (const r of data.stemRelations ?? []) {
    if (r.type) types.push(String(r.type));
  }
  for (const r of data.branchRelations ?? []) {
    if (r.type) types.push(String(r.type));
  }
  return types;
}

/** chart에서 secretaryReading 확보 (없으면 팩트로 재생성) */
export function resolveSecretaryReadingForPremium(
  chart: SajuPremiumChartData,
): SecretaryReading {
  const embedded =
    chart.secretaryReading ?? chart.v3?.secretaryReading;
  if (embedded) return embedded;

  const monthBranchKo = extractBranchKo(chart.pillars?.month?.earthKo);
  const dayGanKo = extractDayGanKo(chart);

  return buildSecretaryReading({
    dayGanKo,
    monthBranchKo,
    sipsinCount: chart.sipsinCount ?? {},
    yongshin: chart.yongshin,
    gyeok: chart.gyeok,
    relationTypes: pickRelationTypes(chart),
    daeunLabel: chart.daeunCurrent?.ganzhi
      ? String(chart.daeunCurrent.ganzhi)
      : chart.daeunCurrent?.ganKo && chart.daeunCurrent?.jiKo
        ? `${chart.daeunCurrent.ganKo}${chart.daeunCurrent.jiKo}`
        : undefined,
    seyunYear: new Date().getFullYear(),
  });
}

function formatSecretaryReadingFacts(reading: SecretaryReading): string {
  const scenes = reading.scenes;
  return lines([
    "## secretaryReading (v3 — 장면·패턴 참고, 문장 복사 금지)",
    `- 월령 환경: ${reading.environment.label} — ${reading.environment.text}`,
    `- 일간 반응: ${reading.responsePattern.label} — ${reading.responsePattern.text}`,
    `- 관계: ${scenes.relationship ?? "(없음)"}`,
    `- 일: ${scenes.work ?? "(없음)"}`,
    `- 돈: ${scenes.money ?? "(없음)"}`,
    `- 선택: ${scenes.choice ?? "(없음)"}`,
    `- 감정: ${scenes.emotion ?? "(없음)"}`,
    `- 흔들릴 때: ${reading.stressPattern.scene}`,
    `- 비서 한 줄: ${reading.closingLine}`,
    `- 전면 십성: ${reading.facts.mainSipsin.join(", ") || "미상"}`,
  ]);
}

function formatMonthLordAnchorFacts(branch: string): string {
  const anchor = getMonthLordAnchor(branch);
  return lines([
    "## 월령 anchor (환경 바탕 — 장면 복사 금지)",
    `- 라벨: ${anchor.label}`,
    `- environment: ${anchor.environment}`,
    `- relationship: ${anchor.relationship}`,
    `- work: ${anchor.work}`,
    `- money: ${anchor.money}`,
    `- choice: ${anchor.choice}`,
    `- emotion: ${anchor.emotion}`,
    `- stressScene: ${anchor.stressScene}`,
    `- secretaryLine: ${anchor.secretaryLine}`,
  ]);
}

function formatSipsinScenePacks(mainSipsin: string[]): string {
  const names = mainSipsin.slice(0, 2);
  if (names.length === 0) return "## 십성 scene pack\n(전면 십성 없음)";

  const blocks = names.map((name) => {
    const pack = getSipsinScenePack(name);
    if (!pack) return `- ${name}: (사전 없음)`;
    const s = pack.scenes;
    return lines([
      `### ${name}`,
      `- relationship: ${s.relationship}`,
      `- work: ${s.work}`,
      `- money: ${s.money}`,
      `- choice: ${s.choice}`,
      `- emotion: ${s.emotion}`,
      `- stress: ${pack.stressPattern.scene}`,
      `- suggestion: ${pack.suggestion.action}`,
    ]);
  });

  return lines(["## 십성 scene pack (행동 보정 — 문장 복사 금지)", ...blocks]);
}

/** LLM user 프롬프트 — 원국 fact + v3 참고 데이터 */
export function buildSajuPremiumV3Reference(chart: SajuPremiumChartData): string {
  const reading = resolveSecretaryReadingForPremium(chart);
  const branch = (reading.facts.monthBranch ||
    extractBranchKo(chart.pillars?.month?.earthKo)) as MonthLordBranch;

  return lines([
    formatSecretaryReadingFacts(reading),
    "",
    formatMonthLordAnchorFacts(branch),
    "",
    formatSipsinScenePacks(reading.facts.mainSipsin),
  ]);
}

/** 원국 fact + v3 참고 (legacy 필드는 sanitize 후 호출) */
export function buildSajuPremiumFullContext(chart: SajuPremiumChartData): string {
  return lines([
    buildSajuPremiumChartFacts(chart),
    "",
    "---",
    "",
    buildSajuPremiumV3Reference(chart),
  ]);
}
