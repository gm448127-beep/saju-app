/**
 * 운명비서 문체 — 후처리 + 레거시 re-export
 * 생성 프롬프트 문체: `unmyeong-generation-voice.ts`
 */

import type { TodaySecretaryGeneratedCopy } from "@/lib/today-secretary-prompts";
import {
  buildSecretaryVoicePromptBlock,
  buildUnmyeongGenerationVoiceBlock,
  UNMYEONG_GENERATION_FORBIDDEN as SECRETARY_VOICE_FORBIDDEN,
  UNMYEONG_GENERATION_GOAL as SECRETARY_VOICE_GOAL,
} from "@/lib/unmyeong-generation-voice";

export { buildSecretaryVoicePromptBlock, buildUnmyeongGenerationVoiceBlock, SECRETARY_VOICE_GOAL, SECRETARY_VOICE_FORBIDDEN };

const VOICE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/권장됩니다\.?/g, "추천해요."],
  [/유리합니다\.?/g, "더 잘 맞아요."],
  [/유리한\s*날입니다\.?/g, "더 잘 맞는 날이에요."],
  [/필요합니다\.?/g, "필요할 수 있어요."],
  [/해야\s*합니다\.?/g, "하는 편이 좋아요."],
  [/주의하십시오\.?/g, "조심하세요."],
  [/검토하십시오\.?/g, "한 번 더 보세요."],
  [/확인하십시오\.?/g, "확인해 보세요."],
  [/접근이\s*필요/g, "조심이 필요"],
  [/발생할\s*수\s*있습니다/g, "느낄 수 있어요"],
  [/나타날\s*수\s*있습니다/g, "나타날 수 있어요"],
  [/이루어지기\s*쉽습니다/g, "이어지기 쉬워요"],
  [/중요합니다\.?/g, "중요해요."],
  [/안전합니다\.?/g, "안전해요."],
  [/낫습니다\.?/g, "나아요."],
  [/맞습니다\.?/g, "맞아요."],
  [/작용합니다\.?/g, "돌아가요."],
  [/의미합니다\.?/g, "뜻해요."],
  [/설명합니다\.?/g, "설명해요."],
];

/** 규칙·API·톤 엔진 문장을 운명비서 말투로 가볍게 정리 */
export function applySecretaryVoice(text: string): string {
  if (!text?.trim()) return text;
  let out = text.trim();
  for (const [pattern, replacement] of VOICE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s+/g, " ").trim();
}

export function applySecretaryVoiceToCopy(
  copy: TodaySecretaryGeneratedCopy,
): TodaySecretaryGeneratedCopy {
  return {
    coreMessage: applySecretaryVoice(copy.coreMessage),
    flowNarrative: applySecretaryVoice(copy.flowNarrative),
    warningLine: applySecretaryVoice(copy.warningLine),
    shake: applySecretaryVoice(copy.shake),
    myeongri: applySecretaryVoice(copy.myeongri),
    strategy: applySecretaryVoice(copy.strategy),
  };
}
