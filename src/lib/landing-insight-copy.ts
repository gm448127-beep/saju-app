import type { DailyFortuneContent } from "@/lib/today-content-engine";
import type { ToneKey } from "@/lib/today-tone-types";

/**
 * 오늘의 운세 무료 4단 — docs/content-constitution-2.1.md §1
 * 1 흐름 · 2 타이밍(무엇을 할 시간) · 3 실수 장면 · 4 비서 제안
 * 금지: 성격 낙인, 교훈, 사건 예언 (헌법 §2·§3·§6)
 */
export const LANDING_RESULT_LABELS = [
  "오늘의 흐름",
  "행동하기 좋은 타이밍",
  "실수할 가능성이 높은 순간",
  "오늘 비서의 제안",
] as const;

/** @deprecated LANDING_RESULT_LABELS 사용 */
export const LANDING_LOCKED_INSIGHT_LABELS = LANDING_RESULT_LABELS;

export type LandingUnlockedInsight = {
  label: (typeof LANDING_RESULT_LABELS)[number];
  fortune: string;
  insight?: string;
  highlight?: boolean;
};

type ToneExposure = {
  flow: { headline: string; detail: string };
  timing: { energy: string; note: string };
  mistake: { scene: string; detail: string };
  /** 구체적 행동 제안 */
  suggestion: string;
};

const TONE_EXPOSURE: Record<ToneKey, ToneExposure> = {
  ORGANIZE: {
    flow: {
      headline: "오늘은 정리가 먼저인 날입니다.",
      detail:
        "머릿속이 꼬인 채로 움직이기 쉽습니다.\n오후에 무거워질 수 있으니, 큰 결정은 정리한 뒤에 하는 편이 유리합니다.",
    },
    timing: {
      energy: "미뤄둔 정리 하나만 손대도 흐름이 바뀌기 쉬운 시간입니다.",
      note: "꼬인 상태에서 새 약속이나 큰 말을 붙이지 않는 편이 좋습니다.",
    },
    mistake: {
      scene: "'일단 이렇게라도'라는 생각이 들 때.",
      detail: "답답할수록 말이 앞서가기 쉽습니다.\n설명 없이 넘기려다 오해가 남을 수 있습니다.",
    },
    suggestion: "오늘은 길게 설명하지 말고,\n한 문장만 더 덧붙여 보세요.",
  },
  TUNE: {
    flow: {
      headline: "오늘은 관계의 결을 맞추는 날입니다.",
      detail:
        "분위기가 어색하면 하루 종일 마음이 무겁기 쉽습니다.\n짧게 결을 맞추는 쪽이 편합니다.",
    },
    timing: {
      energy: "짧은 안부, 확인 한마디가 잘 통하는 시간입니다.",
      note: "감정이 올라온 상태에서 단호하게 말하는 건 피하는 편이 좋습니다.",
    },
    mistake: {
      scene: "'이 정도는 말해도 되지'라는 생각이 들 때.",
      detail: "맞추려다 말이 세져지기 쉽습니다.\n괜찮다고 넘기려다 밤에 더 무거워질 수 있습니다.",
    },
    suggestion: "오늘은 맞는 말을 하기보다\n상대가 듣기 쉬운 말을 선택하세요.",
  },
  DECIDE: {
    flow: {
      headline: "오늘은 확신보다 실행이 먼저인 날입니다.",
      detail:
        "생각이 길어질수록 기회가 먼저 지나가기 쉽습니다.\n이미 알고 있는 답이 있다면, 비교를 줄이는 편이 유리합니다.",
    },
    timing: {
      energy: "작은 결정부터 밀어붙이기 쉬운 시간입니다.",
      note: "'한 번만 더 물어보자'로 선택지를 넓히지 않는 편이 좋습니다.",
    },
    mistake: {
      scene: "'한 번만 더 보자'라는 생각이 들 때.",
      detail: "확인할수록 마음만 흔들리기 쉽습니다.\n물어볼수록 결정만 늦어질 수 있습니다.",
    },
    suggestion: "오늘은 비교를 늘리지 말고,\n이미 알고 있는 답으로 예/아니오만 말하세요.",
  },
  DISTANCE: {
    flow: {
      headline: "오늘은 거리를 두는 날입니다.",
      detail:
        "붙어 있으면 판단이 흐려지기 쉽습니다.\n연락을 줄이고, 혼자 정리하는 시간을 확보하는 편이 유리합니다.",
    },
    timing: {
      energy: "혼자 있을 때 마음이 가라앉기 쉬운 시간입니다.",
      note: "불안해서 바로 답장하는 건, 오후에 더 피곤해질 수 있습니다.",
    },
    mistake: {
      scene: "'이번엔 달라졌을 거야'라는 생각이 들 때.",
      detail: "멀어졌다가 다시 붙으려는 마음이 앞서기 쉽습니다.\n억지로 맞추려다 더 지칠 수 있습니다.",
    },
    suggestion: "오늘은 길게 맞추려 하지 말고,\n연락 간격을 한 칸만 비워 두세요.",
  },
  RISE: {
    flow: {
      headline: "오늘은 밀어붙이기 좋은 날입니다.",
      detail:
        "미루던 일에 손이 가기 쉽습니다.\n다만 확인 없이 '알았어'부터 나오기 쉬우니, 중요한 말은 한 번 더 멈추는 편이 유리합니다.",
    },
    timing: {
      energy: "미뤄둔 실행을 시작하기 쉬운 시간입니다.",
      note: "답장을 미루면 불안해지기 쉬우니, 짧게라도 확인하는 편이 좋습니다.",
    },
    mistake: {
      scene: "'이 정도면 됐겠지'라는 생각이 들 때.",
      detail: "서두를수록 말이 앞서가기 쉽습니다.\n확인 전에 약속부터 잡으면 밤에 후회가 남을 수 있습니다.",
    },
    suggestion: "오늘은 먼저 연락하는 쪽이\n생각보다 편해집니다.",
  },
  RECOVER: {
    flow: {
      headline: "오늘은 회복이 먼저인 날입니다.",
      detail:
        "억지로 채우면 금방 지치기 쉽습니다.\n큰 결정보다, 숨 고르기와 작은 정리 하나가 낫습니다.",
    },
    timing: {
      energy: "쉬었다가 오후에 다시 움직이기 쉬운 시간입니다.",
      note: "거절하기 싫어 '괜찮아'가 먼저 나오기 쉬우니, 부탁은 짧게 거절하는 편이 좋습니다.",
    },
    mistake: {
      scene: "'이번만 참자'라는 생각이 들 때.",
      detail: "맞춰 주다 하루가 비워지기 쉽습니다.\n이미 지친 관계에 억지로 맞추면 밤에 더 텅 빕니다.",
    },
    suggestion: "오늘은 억지로 맞추지 말고,\n'오늘은 어렵다'를 먼저 말해 보세요.",
  },
};

const SLOT_TIME_RANGE: Record<DailyFortuneContent["timeSlots"][number]["label"], string> = {
  오전: "오전 9시~11시",
  오후: "오후 2시~4시",
  저녁: "저녁 6시~8시",
  밤: "밤 10시~12시",
};

const TONE_BEST_SLOT_INDEX: Record<ToneKey, number> = {
  ORGANIZE: 1,
  TUNE: 1,
  DECIDE: 0,
  DISTANCE: 2,
  RISE: 1,
  RECOVER: 0,
};

function pickBestTimeSlot(report: DailyFortuneContent) {
  const index = TONE_BEST_SLOT_INDEX[report.toneKey] ?? 1;
  return report.timeSlots[index] ?? report.timeSlots[1];
}

function buildFlow(_report: DailyFortuneContent, exposure: ToneExposure): LandingUnlockedInsight {
  const { headline, detail } = exposure.flow;

  return {
    label: "오늘의 흐름",
    fortune: headline,
    insight: detail,
  };
}

function buildTiming(report: DailyFortuneContent, exposure: ToneExposure): LandingUnlockedInsight {
  const timeRange = SLOT_TIME_RANGE[pickBestTimeSlot(report).label];
  const { energy, note } = exposure.timing;

  return {
    label: "행동하기 좋은 타이밍",
    fortune: timeRange,
    insight: `${energy}\n\n${note}`,
  };
}

function buildMistakeScene(_report: DailyFortuneContent, exposure: ToneExposure): LandingUnlockedInsight {
  const { scene, detail } = exposure.mistake;

  return {
    label: "실수할 가능성이 높은 순간",
    fortune: scene,
    insight: detail,
  };
}

function buildSuggestion(_report: DailyFortuneContent, exposure: ToneExposure): LandingUnlockedInsight {
  return {
    label: "오늘 비서의 제안",
    fortune: exposure.suggestion,
    highlight: true,
  };
}

/** API 리포트 → 흐름·타이밍·장면·행동 제안 */
export function buildUnlockedInsights(report: DailyFortuneContent): LandingUnlockedInsight[] {
  const exposure = TONE_EXPOSURE[report.toneKey] ?? TONE_EXPOSURE.RECOVER;

  return [
    buildFlow(report, exposure),
    buildTiming(report, exposure),
    buildMistakeScene(report, exposure),
    buildSuggestion(report, exposure),
  ];
}
