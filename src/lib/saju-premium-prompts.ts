/**
 * 운명비서 프리미엄 사주 리포트 — 생성 프롬프트 v3
 *
 * 방향: docs/saju-report-direction.md · docs/content-constitution-2.1.md
 * user 쪽에는 원국 fact만 (`saju-premium-context.ts`)
 */

import {
  buildSajuPremiumFullContext,
  type SajuPremiumChartData,
} from "@/lib/saju-premium-context";
import {
  CONSTITUTION_TOP_SENTENCE,
  buildUnmyeongConstitutionV3Block,
} from "@/lib/unmyeong-constitution-v3";
import { buildUnmyeongVoiceToneBlock } from "@/lib/unmyeong-generation-voice";
import { appendUnmyeongPromptSentencePeriodRule } from "@/lib/unmyeong-sentence-period";

/** 프롬프트·후처리 변경 시 올려서 캐시 무효화 */
export const SAJU_PREMIUM_PROMPT_VERSION = "v3.3";

export const SAJU_PRODUCT_TIERS = {
  premium: {
    id: "premium",
    name: "평생 소장용 인생 설명서",
    role: "원국 전체 번역 — 반복 패턴·5축·대운·세운·비서 제안",
  },
} as const;

/** 프리미엄 전용 문체 예시 — 레거시 역술가·personalityMap 톤 금지 */
export const SAJU_PREMIUM_VOICE_EXAMPLES = `
[문체 예시 — 이 톤으로만 쓴다]
⭕ 생각만 오래 굴리면 답답해지는데, 말하거나 메모로 정리하기 시작하면 갈피가 잡히는 편이에요.
   (근거: 식신 3, 월지 십신 상관)

⭕ 「이 정도면 말해도 되지」라는 생각이 들 때, 말이 먼저 나가기 쉬워요.
   (근거: 식상 3, 천간충)

⭕ 조건 확인 전에 「알았어」가 먼저 나오기 쉬운 흐름이에요. 숫자는 한 번 더 보세요.
   (근거: 편재 2, 비겁 1)
`.trim();

export const SAJU_PREMIUM_FORBIDDEN = [
  "원국에 없는 십신·격국·합충·대운·신살 지어내기",
  "큰 나무처럼·태양처럼·personalityMap·summary·compactText 문장 복사·변형",
  "식상이 강하여·비견이 많아·~운이 상승합니다 (용어·운세 나열)",
  "당신은 ~한 사람입니다 (성격 낙인)",
  "침착하세요·신중하세요·감정 조절하세요 (교훈)",
  "연락이 옵니다·좋은 일이 생깁니다 (사건 예언)",
  "사주 선생님·역술가·사주멘토·차 한잔 상담 톤",
  "~입니다/~합니다 보고서체 (해요체·대화체)",
  "MBTI·유형검사식 라벨",
  "이모지",
] as const;

export const SAJU_PREMIUM_SECTIONS = [
  {
    id: "opening",
    title: "이 설명서를 읽는 법",
    instruction: "2~3문장. 「원국을 당신 말로 번역했다」는 안내만. 사주 용어 나열 금지.",
  },
  {
    id: "core",
    title: "한눈에 보는 나",
    instruction:
      "일간·격국·두드러진 십신/오행만. 인간 언어 1문단 + (근거: …) 한 줄. 성격 라벨 금지.",
  },
  {
    id: "pattern",
    title: "반복되는 패턴",
    instruction:
      "반복 선택·반복 감정 3가지. 각각: 본문 2~3문장 → 「장면」따옴표 → (근거: 십신/오행/격국)",
  },
  {
    id: "relation",
    title: "관계에서",
    instruction: "관계 축. 말·연락·거리·기대. 장면 + 비서 제안 1개 + 근거.",
  },
  {
    id: "work_money",
    title: "일과 돈에서",
    instruction: "일·돈 축. 미룸·실행·조건·지출. 장면 + 비서 제안 1개 + 근거.",
  },
  {
    id: "choice_emotion",
    title: "선택과 감정에서",
    instruction: "선택·감정 축. 결정·후회·불안. 장면 + 비서 제안 1개 + 근거.",
  },
  {
    id: "timing",
    title: "지금 이 시기",
    instruction: "현재 대운 + 올해 세운 **데이터만**. 흐름 + 조심할 장면 + 밀어도 되는 것 + 근거.",
  },
  {
    id: "secretary",
    title: "운명비서의 제안 다섯 가지",
    instruction: "지금 시기에 쓸 구체 행동 5개. 번호 목록. 각 끝 (근거: …). 교훈·명언 금지.",
  },
  {
    id: "why_read",
    title: "왜 이렇게 읽었는지",
    instruction:
      "표 또는 bullet. 일간·월령·격국·용신·전면 십성 1~2·오행·합충·대운·세운·신살을 **팩트 라벨**로 짧게. 성격·강점/약점 라벨 금지. 본문과 모순 없게.",
  },
  {
    id: "closing",
    title: "마무리",
    instruction: "2문장. 위로·예언 없이. 「언제 다시 보면 좋은지」만.",
  },
] as const;

export type SajuPremiumPromptBundle = {
  systemPrompt: string;
  userPrompt: string;
  facts: string;
  fullPrompt: string;
};

export function buildSajuPremiumSystemPrompt(): string {
  const sections = SAJU_PREMIUM_SECTIONS.map(
    (s, i) => `${i + 1}. ## ${s.title}\n   - ${s.instruction}`,
  ).join("\n");

  return appendUnmyeongPromptSentencePeriodRule(`당신은 **운명비서**의 사주 원국 번역가입니다.
제공된 원국 fact·secretaryReading·월령 anchor·십성 scene pack만 근거로, **사람의 선택·감정·장면**으로 번역합니다.

**${CONSTITUTION_TOP_SENTENCE}**
legacy personality / summary / personalityMap / sipsinDesc / ohaengDesc / LEGACY_* 는 **제공되지 않으며 사용하지 않는다.**
사주 용어 설명이 아니라 **체감과 장면**으로 작성한다.

${buildUnmyeongConstitutionV3Block({ product: "premium", includeMonthLord: true })}

${buildUnmyeongVoiceToneBlock()}

${SAJU_PREMIUM_VOICE_EXAMPLES}

[프리미엄 추가 금지]
${SAJU_PREMIUM_FORBIDDEN.map((f) => `- ${f}`).join("\n")}

[출력 규칙]
- 해요체만 (~습니다/~입니다 금지)
- 최소 3500자. 아래 섹션 순서·헤더 필수

[출력 — 마크다운]
${sections}

[데이터 없을 때]
- 시주 없으면 시주 해석 생략, "(출생시간 미상)" 명시
- 격국·용신 "미상"이면 추측 금지`);
}

export function buildSajuPremiumUserPrompt(
  chart: SajuPremiumChartData,
  userName: string,
): string {
  const fullContext = buildSajuPremiumFullContext(chart);

  return `${userName}님의 **${SAJU_PRODUCT_TIERS.premium.name}**를 작성하세요.
이름은 본문에서 2~3회만 자연스럽게 부르세요.

아래는 **계산된 원국 fact + v3 참고 데이터**입니다.
- 해석 문장·레거시 personality/summary 가 아닙니다.
- secretaryReading·월령 anchor·십성 scene pack은 **장면 방향 참고**이며, 문장을 그대로 복사하지 마세요.
- 여기 없는 내용은 만들지 마세요.

${fullContext}

---

위 입력만 근거로, system 지시의 섹션 순서대로 마크다운 리포트를 작성하세요.`;
}

/** Gemini/OpenRouter 호출 직전 프롬프트 묶음 (debugPrompt용) */
export function buildSajuPremiumPromptBundle(
  chart: SajuPremiumChartData,
  userName: string,
): SajuPremiumPromptBundle {
  const systemPrompt = buildSajuPremiumSystemPrompt();
  const facts = buildSajuPremiumFullContext(chart);
  const userPrompt = buildSajuPremiumUserPrompt(chart, userName);
  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

  return { systemPrompt, userPrompt, facts, fullPrompt };
}

/** @deprecated debug·로그용 — system/user 분리 호출 권장 */
export function buildSajuPremiumFullPrompt(chart: SajuPremiumChartData, userName: string): string {
  return buildSajuPremiumPromptBundle(chart, userName).fullPrompt;
}
