/**

 * 운명비서 — 오늘의 운세 AI 생성 프롬프트 (헌법 v2.1 4단 정렬)

 *

 * 문체: `unmyeong-generation-voice.ts`

 * UI 무료 4단: `landing-insight-copy.ts` (규칙 엔진)

 * 이 프롬프트: API secretaryCopy (유료·보조 필드)

 */



import { buildUnmyeongGenerationVoiceBlock } from "@/lib/unmyeong-generation-voice";
import { appendUnmyeongPromptSentencePeriodRule } from "@/lib/unmyeong-sentence-period";



export const TODAY_SECRETARY_COPY_GOAL =

  '「어? 이거 내 얘기인데?」 — 사건 예언이 아니라 오늘의 선택·장면';



/** JSON 키 ↔ 헌법 4단 매핑 (키 이름은 API 호환 유지) */

export const TODAY_SECRETARY_FIELD_MAP = {

  coreMessage: "1. 오늘의 흐름 — 하루 분위기·에너지 한 줄",

  flowNarrative: "2. 행동하기 좋은 타이밍 — 무엇을 하면 좋은 시간인지 (몇 시 단정 금지)",

  warningLine: "3. 실수할 가능성 — 「~라는 생각이 들 때」 장면. 신중하세요 금지",

  shake: "유료 — 오늘 당신을 흔드는 선택·갈등",

  myeongri: "유료 — 왜 이런 흐름인지 (명리 근거를 인간 언어로)",

  strategy: "4. 오늘 비서의 제안 — 오늘 실행 가능한 행동 1~2개",

} as const;



export const TODAY_SECRETARY_COPY_PRINCIPLES = [

  "시적·은유 최소 — 장면·선택 먼저",

  "관계·일·돈·선택·감정 중 최소 1축",

  "명리는 myeongri·괄호 근거로만",

  "교훈·낙인·사건 예언 금지",

] as const;



export type TodaySecretaryGeneratedCopy = {

  coreMessage: string;

  flowNarrative: string;

  warningLine: string;

  shake: string;

  myeongri: string;

  strategy: string;

};



export function buildTodaySecretarySystemPrompt(): string {

  return appendUnmyeongPromptSentencePeriodRule(`당신은 **운명비서** 오늘의 운세 카피 작성자다.

제공된 명리 데이터만 근거로, 헌법 4단에 맞는 JSON을 쓴다.



${buildUnmyeongGenerationVoiceBlock({ product: "today" })}



[필드 매핑 — 반드시 준수]

${Object.entries(TODAY_SECRETARY_FIELD_MAP)

  .map(([k, v]) => `- ${k}: ${v}`)

  .join("\n")}



[원칙]

${TODAY_SECRETARY_COPY_PRINCIPLES.map((p) => `- ${p}`).join("\n")}



[예시]

- coreMessage: 오늘은 관계의 결을 맞추는 날이에요.

- flowNarrative: 짧은 안부가 잘 통하는 시간이에요. 큰 말보다 확인 한마디가 낫습니다.

- warningLine: 「이 정도는 말해도 되지」라는 생각이 들 때

- strategy: 맞는 말보다 상대가 듣기 쉬운 말을 선택해 보세요.



[출력]

유효한 JSON만. 다른 텍스트 없음.`);

}



export function buildTodaySecretaryUserPrompt(context: {

  toneLabel: string;

  todaySipsin: string;

  todayJiSipsin?: string;

  relationDetail?: string;

  summary?: string;

  warning?: string;

  tip?: string;

  triggerLine?: string;

  focusDomain: string;

  secondaryDomain: string;

  workMoneyTip: string;

  relationTip: string;

  dontGuide: string;

}): string {

  return `[오늘 명리 — 추측 금지, 아래만 사용]

- 오늘의 결(톤): ${context.toneLabel}

- 천간 십성: ${context.todaySipsin}

- 지지 십성: ${context.todayJiSipsin ?? "—"}

- 십성 작용: ${context.relationDetail ?? "—"}

- 합충·트리거: ${context.triggerLine ?? "—"}



[강조 분야] ${context.focusDomain} · ${context.secondaryDomain}



[가이드 원문 — 문체만 운명비서로, 내용 복사 최소화]

- 일·돈: ${context.workMoneyTip}

- 관계: ${context.relationTip}

- 피할 장면 힌트: ${context.dontGuide}



JSON:

{

  "coreMessage": "",

  "flowNarrative": "",

  "warningLine": "",

  "shake": "",

  "myeongri": "",

  "strategy": ""

}`;

}


