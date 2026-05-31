/** 랜딩 첫 화면 — 「어떻게 알았지?」 통찰형 훅 (칭찬형 금지) */
export type LandingChillHook = {
  line1: string;
  line2: string;
};

export const LANDING_CHILL_LEAD =
  "사람들은 운세를 보러 왔다가 자기 이야기를 발견하고 갑니다.";

/** 반복 행동·선택 패턴 — 「~한 사람입니다」 칭찬형 금지 */
export const LANDING_CHILL_HOOKS: LandingChillHook[] = [
  {
    line1: "당신은 사람을 못 믿는 것이 아닙니다.",
    line2: "한번 믿으면 의심을 멈춥니다.",
  },
  {
    line1: "당신은 결정을 못하는 것이 아닙니다.",
    line2: "확신이 생길 때까지 움직이지 않습니다.",
  },
  {
    line1: "당신은 상처를 오래 기억합니다.",
    line2: "그래서 같은 실수를 반복하지 않습니다.",
  },
  {
    line1: "당신은 관계를 끊지 못합니다.",
    line2: "좋아서가 아니라 끝내는 것이 더 어렵기 때문입니다.",
  },
  {
    line1: "당신은 먼저 연락하지 않습니다.",
    line2: "거절당하는 쪽이 익숙하기 때문입니다.",
  },
  {
    line1: "당신은 '괜찮다'고 말합니다.",
    line2: "진짜 상태를 말하면 부담이 되기 때문입니다.",
  },
  {
    line1: "당신은 감정을 늦게 표현합니다.",
    line2: "터질 때 이미 늦었다고 배웠기 때문입니다.",
  },
  {
    line1: "당신은 먼저 맞춰 줍니다.",
    line2: "불편한 사람이 되기 싫기 때문입니다.",
  },
  {
    line1: "당신은 '아닌 것 같다'고 합니다.",
    line2: "확신이 없을 때 가장 많이 쓰는 말이기 때문입니다.",
  },
  {
    line1: "당신은 선택지를 좁힙니다.",
    line2: "결정 피로를 줄이려고 하기 때문입니다.",
  },
  {
    line1: "당신은 게으른 것이 아닙니다.",
    line2: "의미가 없으면 움직이지 않습니다.",
  },
  {
    line1: "당신은 포기가 빠릅니다.",
    line2: "이미 답을 알고 있을 때만 그렇습니다.",
  },
  {
    line1: "당신은 독립적인 척합니다.",
    line2: "도움을 요청하는 게 더 어렵기 때문입니다.",
  },
  {
    line1: "당신은 남의 기분을 먼저 봅니다.",
    line2: "그래서 내 마음은 나중에 처리합니다.",
  },
  {
    line1: "당신은 쉽게 화해하지 않습니다.",
    line2: "한번 무너진 신뢰는 다시 쌓기 어렵기 때문입니다.",
  },
  {
    line1: "당신은 '지금은 아닌 것 같다'고 합니다.",
    line2: "실은 타이밍을 보고 있을 때가 많습니다.",
  },
  {
    line1: "당신은 같은 유형에게 끌립니다.",
    line2: "익숙한 패턴이 안전하기 때문입니다.",
  },
  {
    line1: "당신은 말을 줄입니다.",
    line2: "설명해도 이해받지 못할 때가 많기 때문입니다.",
  },
  {
    line1: "당신은 혼자 결정합니다.",
    line2: "책임질 사람이 없을 때가 더 편하기 때문입니다.",
  },
  {
    line1: "당신은 거절을 연습합니다.",
    line2: "안 그러면 계속 맡게 되기 때문입니다.",
  },
];

/** 화면에 보여줄 소름 문장 개수 */
export const LANDING_CHILL_HOOK_DISPLAY_COUNT = 3;

function shuffleHooks(hooks: LandingChillHook[]) {
  const next = [...hooks];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function pickRandomChillHook(): LandingChillHook {
  return pickRandomChillHooks(1)[0] ?? LANDING_CHILL_HOOKS[0];
}

export function pickRandomChillHooks(count = LANDING_CHILL_HOOK_DISPLAY_COUNT): LandingChillHook[] {
  const limit = Math.min(count, LANDING_CHILL_HOOKS.length);
  return shuffleHooks(LANDING_CHILL_HOOKS).slice(0, limit);
}
