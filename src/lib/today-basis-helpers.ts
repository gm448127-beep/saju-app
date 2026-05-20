import type { SajuTriggerItem } from "@/lib/saju-triggers";

export type TodayBasisSection = {
  title: string;
  lines: string[];
};

type TodayApiResult = {
  myDayGan?: string;
  myDayBranch?: string;
  myElement?: string;
  myHourGan?: string | null;
  myHourBranch?: string | null;
  hasHour?: boolean;
  todayGan?: string;
  todayJi?: string;
  todaySipsin?: string;
  todayJiSipsin?: string;
  sipsinTitle?: string;
  relation?: string;
  relationDetail?: string;
  summary?: string;
  pillars?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
  sajuTriggers?: SajuTriggerItem[];
  hourlyPeak?: { hour?: string; range?: string; sipsin?: string };
};

function compactLines(lines: Array<string | undefined | null>) {
  return lines.map((line) => line?.trim()).filter((line): line is string => Boolean(line));
}

/** 개인화 오늘 리포트용 명리 근거 블록 */
export function buildTodayMyeongriBasis(result: TodayApiResult | null | undefined): TodayBasisSection[] {
  if (!result?.myDayGan || !result.todayGan) return [];

  const sections: TodayBasisSection[] = [];

  const pillarLines = compactLines([
    `일간(天干): ${result.myDayGan} — 오늘 하늘 기운이 이 기준과 만나 '${result.todaySipsin}'으로 작용합니다.`,
    `일지(地支): ${result.myDayBranch} — 땅의 기운은 '${result.todayJiSipsin}' 쪽으로 읽힙니다.`,
    result.pillars?.day ? `일주 한글: ${result.pillars.day}` : null,
    result.hasHour && result.pillars?.hour && result.pillars.hour !== "미입력"
      ? `시주: ${result.pillars.hour}`
      : "시주: 미입력 (시간 미입력 시 시주 트리거는 참고만)",
  ]);
  if (pillarLines.length) {
    sections.push({ title: "내 일간·일주", lines: pillarLines });
  }

  const iljinLines = compactLines([
    `오늘 천간: ${result.todayGan}`,
    `오늘 지지: ${result.todayJi}`,
    result.sipsinTitle
      ? `오늘의 십성: ${result.todaySipsin}(${result.sipsinTitle})`
      : `오늘의 십성: ${result.todaySipsin}`,
    result.relation ? `한 줄 관계: ${result.relation}` : null,
    result.relationDetail ? result.relationDetail : null,
  ]);
  sections.push({ title: "오늘 일진과의 관계", lines: iljinLines });

  const triggers = result.sajuTriggers ?? [];
  const relationTriggers = triggers.filter(
    (t) =>
      t.id === 3 ||
      /합|충|형|해|파/.test(t.title) ||
      /합|충|형|해|파/.test(t.formula) ||
      t.tags?.some((tag) => /합|충|형/.test(tag)),
  );

  if (relationTriggers.length > 0) {
    sections.push({
      title: "합·충·형 (원국 ↔ 오늘)",
      lines: relationTriggers.slice(0, 3).flatMap((t) =>
        compactLines([t.formula, t.explanation]),
      ),
    });
  }

  const skyTriggers = triggers.filter((t) => t.id === 1 || t.id === 2).slice(0, 2);
  if (skyTriggers.length > 0) {
    sections.push({
      title: "하늘·땅 트리거",
      lines: skyTriggers.flatMap((t) => compactLines([t.formula, t.explanation])),
    });
  }

  if (result.summary) {
    sections.push({
      title: "종합",
      lines: [result.summary],
    });
  }

  if (result.hourlyPeak?.hour) {
    sections.push({
      title: "시간대 근거",
      lines: compactLines([
        `점수가 가장 높은 시진: ${result.hourlyPeak.hour} (${result.hourlyPeak.range ?? ""}시)`,
        result.hourlyPeak.sipsin ? `이때 십성: ${result.hourlyPeak.sipsin}` : null,
        "CARD 05 시간대 해석과 연결됩니다.",
      ]),
    });
  }

  return sections;
}
