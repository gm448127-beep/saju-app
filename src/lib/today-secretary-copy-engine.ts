import type { DailyFortuneContent } from "@/lib/today-content-engine";
import type { ToneKey } from "@/lib/today-tone-types";
import type { TodaySecretaryGeneratedCopy } from "@/lib/today-secretary-prompts";
import { stripScoreMentions } from "@/lib/today-score-ui-copy";
import {
  buildTodaySecretarySystemPrompt,
  buildTodaySecretaryUserPrompt,
} from "@/lib/today-secretary-prompts";
import {
  applySecretaryVoice,
  applySecretaryVoiceToCopy,
} from "@/lib/today-secretary-voice";

type SecretaryApiContext = {
  scores?: Record<string, number>;
  todaySipsin?: string;
  todayJiSipsin?: string;
  relationDetail?: string;
  summary?: string;
  warning?: string;
  tip?: string;
  briefing?: { focus?: string; oneLine?: string; executiveSummary?: string[] };
  sajuTriggers?: Array<{ formula?: string; explanation?: string; title?: string }>;
  gearAnalysis?: string[];
  todayDosDetailed?: Array<{ text: string; action?: string }>;
  secretaryCopy?: TodaySecretaryGeneratedCopy;
};

export type { TodaySecretaryGeneratedCopy };

type DomainFocus = { key: string; label: string; score: number };

const CORE_BY_TONE: Record<ToneKey, string[]> = {
  ORGANIZE: [
    "새 일을 벌리기보다 이미 시작한 일을 마무리해 보세요.",
    "지금은 미뤄둔 일 하나를 끝내는 쪽이 더 잘 맞아요.",
    "조건을 줄이고 한 가지에만 손대 보세요.",
  ],
  TUNE: [
    "사람 말보다 조건·의도를 먼저 확인해 보세요.",
    "빠르게 말하기보다 상대가 진짜 원하는 걸 한 번 더 짚어 보세요.",
    "관계에서는 속도를 맞추는 쪽이 오늘은 편해요.",
  ],
  DECIDE: [
    "미뤄둔 결정 하나, 오늘 안에 예/아니오만 정해 보세요.",
    "망설임을 줄일수록 일·돈 판단이 가벼워져요.",
    "지금은 '언제 할지'보다 '할지 말지'를 먼저 정하는 날이에요.",
  ],
  DISTANCE: [
    "새로 벌리기보다 진행 중인 일을 점검해 보세요.",
    "큰 결론은 하루 미뤄도 괜찮아요. 손실부터 막는 쪽이 나아요.",
    "한 발 물러서서 숫자·조건을 다시 보세요.",
  ],
  RISE: [
    "준비해 둔 일, 오늘은 작게라도 움직여 보세요.",
    "작게 시작해서 피드백 받는 쪽이 잘 맞아요.",
    "기회가 보이면 조건 확인하고 한 걸음만 밀어 보세요.",
  ],
  RECOVER: [
    "큰 결론보다 회복·정리에 에너지를 쓰는 날이에요.",
    "결정은 하루 미루고 컨디션부터 채워 보세요.",
    "무리한 확장보다 손실 막기가 먼저예요.",
  ],
};

const PSYCHE_BY_TONE: Record<ToneKey, string> = {
  ORGANIZE: "밀고 갈지 멈출지, 무엇부터 끝낼지",
  TUNE: "관계에서 맞출지 거리를 둘지",
  DECIDE: "선택을 미룰지 오늘 정할지",
  DISTANCE: "속도를 낼지 한 박자 쉴지",
  RISE: "지금 밀어붙일지 타이밍을 볼지",
  RECOVER: "버틸지 회복 우선으로 돌릴지",
};

const WARNING_BY_DOMAIN: Record<string, string[]> = {
  career: [
    "서두른 확답·날 선 메일은 오늘 흐름을 흔들어요. 보내기 전 한 번 더 읽어 보세요.",
    "조건 없는 사업·프로젝트 제안은 오늘 바로 수락하지 마세요.",
  ],
  wealth: [
    "검증 없는 투자·충동 결제는 오늘 손해로 이어지기 쉬워요.",
    "큰 금액 약속은 서류·숫자 다시 보고 결정하세요.",
  ],
  people: [
    "상대가 서두르게 만드는 제안은 한 번 더 보고 결정하세요.",
    "침묵을 부정으로 단정하는 말은 오늘 관계를 흔들어요.",
  ],
  love: [
    "확인을 강요하는 연락은 갈등을 키울 수 있어요. 한 박자 늦춰 보세요.",
    "감정이 올라온 상태에서 보낼 메시지는 잠시 멈춰 두세요.",
  ],
};

function hashPick<T>(items: T[], seed: string, salt = 0): T {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return items[Math.abs(h) % items.length];
}

function getDomainFocuses(result: SecretaryApiContext): DomainFocus[] {
  const s = result.scores ?? {};
  return [
    { key: "career", label: "사업·일", score: s.career ?? 60 },
    { key: "wealth", label: "돈", score: s.wealth ?? 60 },
    { key: "people", label: "인간관계", score: s.love ?? 60 },
    { key: "love", label: "연애", score: s.love ?? 60 },
  ];
}

function pickFocusDomains(result: SecretaryApiContext, toneKey: ToneKey) {
  const domains = getDomainFocuses(result);
  const sorted = [...domains].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  if (toneKey === "DECIDE" || toneKey === "RISE") {
    return { focus: strongest.key === "people" ? domains[0] : strongest, secondary: weakest };
  }
  if (toneKey === "TUNE") {
    const people = domains.find((d) => d.key === "people")!;
    return { focus: people, secondary: domains.find((d) => d.key === "wealth")! };
  }
  return { focus: weakest, secondary: strongest };
}

function buildCoreMessage(toneKey: ToneKey, seed: string): string {
  const pool = CORE_BY_TONE[toneKey] ?? CORE_BY_TONE.DECIDE;
  return hashPick(pool, seed, 1);
}

function buildFlowNarrative(
  toneKey: ToneKey,
  focus: DomainFocus,
  secondary: DomainFocus,
  report: DailyFortuneContent,
): string {
  const psyche = PSYCHE_BY_TONE[toneKey] ?? PSYCHE_BY_TONE.DECIDE;
  const line1 = `요즘 ${psyche} 고민하고 있죠.`;
  const line2 =
    focus.score < 55
      ? `특히 ${focus.label}에서는 속도보다 확인이 먼저예요. ${secondary.label}은 크게 벌리기보다 작게 정리하는 쪽이 나아요.`
      : `오늘은 ${focus.label}에서 움직임을 살리기 좋아요. 다만 ${secondary.label}은 조건부터 맞춰 보세요.`;
  const line3 = report.actionGuide.workMoneyTip?.includes("·")
    ? report.actionGuide.workMoneyTip.split("\n")[0]?.replace(/^·\s*/, "") ?? ""
    : report.actionGuide.workMoneyTip ?? "";
  return stripScoreMentions(`${line1} ${line2} ${line3}`.trim());
}

function buildWarningLine(focus: DomainFocus, report: DailyFortuneContent, result: SecretaryApiContext): string {
  const fromApi = result.warning?.trim();
  if (fromApi && !/\d+점/.test(fromApi)) return stripScoreMentions(fromApi);
  const pool = WARNING_BY_DOMAIN[focus.key] ?? WARNING_BY_DOMAIN.career;
  const fromDont = report.actionGuide.donts?.split("\n")[0]?.replace(/^·\s*/, "").trim();
  if (fromDont && fromDont.length > 8) {
    const base = fromDont.replace(/\.$/, "").replace(/하세요\.?$/, "").trim();
    return stripScoreMentions(applySecretaryVoice(`${base}해 보세요.`));
  }
  return stripScoreMentions(hashPick(pool, `${focus.key}-${report.seedKey}`, 2));
}

function buildShake(
  focus: DomainFocus,
  report: DailyFortuneContent,
  result: SecretaryApiContext,
): string {
  const triggers: Record<string, string> = {
    career:
      "마음이 걸리는 건 일·사업 선택이에요. 미뤄둔 보고, 계약 조건, 협업 방향 중 하나가 자꾸 떠오를 수 있어요.",
    wealth:
      "돈 판단이 부담으로 느껴질 수 있어요. 지출, 투자, 정산처럼 숫자가 오가는 결정이 특히 신경 쓰일 거예요.",
    people:
      "인간관계에서 기대치가 맞는지가 핵심이에요. 상대 반응, 연락 타이밍, 협력 조건이 자꾸 신경 쓰일 수 있어요.",
    love:
      "가까운 관계의 거리가 갈림길이에요. 먼저 연락할지, 기다릴지, 어디까지 열지가 마음에 남을 수 있어요.",
  };
  const base = triggers[focus.key] ?? triggers.career;
  const extra = result.briefing?.focus?.trim();
  return stripScoreMentions(extra ? `${base} ${extra}` : base);
}

function buildMyeongri(result: SecretaryApiContext): string {
  const sipsin = result.todaySipsin ?? "오늘의 기운";
  const ji = result.todayJiSipsin;
  const relation = result.relationDetail?.trim();
  const trigger = result.sajuTriggers?.[0];
  const triggerText = trigger
    ? `${trigger.formula ?? trigger.title ?? "오늘의 작용"} — ${trigger.explanation ?? ""}`.trim()
    : result.gearAnalysis?.[0];

  const parts = [
    `오늘 일진에 ${sipsin}${ji ? `·${ji}` : ""}이 겹치면서 `,
    relation ? `${relation} ` : "",
    triggerText ? `${triggerText} ` : "",
    "그래서 감정보다 조건·타이밍·상대 반응을 먼저 보게 되는 날이에요.",
  ];
  return stripScoreMentions(parts.join("").replace(/\s+/g, " ").trim());
}

function buildStrategy(report: DailyFortuneContent, result: SecretaryApiContext): string {
  const dos = result.todayDosDetailed?.[0];
  const workTip = report.actionGuide.workMoneyTip ?? "";
  const parts = [
    workTip.replace(/^·\s*/gm, "").split("\n").filter(Boolean)[0],
    report.actionGuide.relationTip,
    dos?.action ? `오늘 실행: ${dos.action}` : dos?.text,
    report.actionGuide.dos?.split("\n")[0]?.replace(/^·\s*/, ""),
  ].filter(Boolean);
  const unique = [...new Set(parts.map((p) => p?.trim()).filter(Boolean))].slice(0, 2);
  return stripScoreMentions(applySecretaryVoice(`그래서 오늘은 ${unique.join(" 또한 ")}.`));
}

/** 규칙 기반 카피 (API/LLM 공통 폴백) */
export function buildTodaySecretaryCopySync(
  result: SecretaryApiContext,
  report: DailyFortuneContent,
): TodaySecretaryGeneratedCopy {
  const toneKey = report.toneKey;
  const seed = report.seedKey;
  const { focus, secondary } = pickFocusDomains(result, toneKey);

  return applySecretaryVoiceToCopy({
    coreMessage: buildCoreMessage(toneKey, seed),
    flowNarrative: buildFlowNarrative(toneKey, focus, secondary, report),
    warningLine: buildWarningLine(focus, report, result),
    shake: buildShake(focus, report, result),
    myeongri: buildMyeongri(result),
    strategy: buildStrategy(report, result),
  });
}

function parseSecretaryJson(text: string): TodaySecretaryGeneratedCopy | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const raw = JSON.parse(match[0]) as Partial<TodaySecretaryGeneratedCopy>;
    if (!raw.coreMessage || !raw.flowNarrative || !raw.warningLine) return null;
    return applySecretaryVoiceToCopy({
      coreMessage: stripScoreMentions(raw.coreMessage),
      flowNarrative: stripScoreMentions(raw.flowNarrative),
      warningLine: stripScoreMentions(raw.warningLine),
      shake: stripScoreMentions(raw.shake ?? ""),
      myeongri: stripScoreMentions(raw.myeongri ?? ""),
      strategy: stripScoreMentions(raw.strategy ?? ""),
    });
  } catch {
    return null;
  }
}

/** LLM 생성 (키 없으면 null → 호출부에서 sync 폴백) */
export async function generateTodaySecretaryCopyWithAI(
  result: SecretaryApiContext,
  report: DailyFortuneContent,
): Promise<TodaySecretaryGeneratedCopy | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  const { focus, secondary } = pickFocusDomains(result, report.toneKey);
  const userPrompt = buildTodaySecretaryUserPrompt({
    toneLabel: report.toneLabel,
    todaySipsin: result.todaySipsin ?? "",
    todayJiSipsin: result.todayJiSipsin,
    relationDetail: result.relationDetail,
    summary: result.summary,
    warning: result.warning,
    tip: result.tip,
    triggerLine:
      result.sajuTriggers?.[0]?.explanation ?? result.gearAnalysis?.[0] ?? undefined,
    focusDomain: focus.label,
    secondaryDomain: secondary.label,
    workMoneyTip: report.actionGuide.workMoneyTip,
    relationTip: report.actionGuide.relationTip,
    dontGuide: report.actionGuide.donts,
  });

  const models = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${buildTodaySecretarySystemPrompt()}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: { temperature: 0.65, maxOutputTokens: 1024 },
          }),
        },
      );
      if (!response.ok) continue;
      const json = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed = parseSecretaryJson(text);
      if (parsed?.shake && parsed.myeongri && parsed.strategy) return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

export async function resolveTodaySecretaryCopy(
  result: SecretaryApiContext,
  report: DailyFortuneContent,
): Promise<TodaySecretaryGeneratedCopy> {
  const cached = result.secretaryCopy as TodaySecretaryGeneratedCopy | undefined;
  if (cached?.coreMessage) return cached;

  const ai = await generateTodaySecretaryCopyWithAI(result, report);
  if (ai) return ai;

  return buildTodaySecretaryCopySync(result, report);
}
