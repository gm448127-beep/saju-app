type ScoreMap = {
  overall?: number;
  wealth?: number;
  love?: number;
  career?: number;
  health?: number;
  luck?: number;
};

type DailyProfile = {
  sipsin?: string;
  element?: string;
  scores?: ScoreMap;
};

export type DailyFortuneContent = {
  seedKey: string;
  sentence: string;
  flow: string;
  actionGuide: {
    dos: string;
    donts: string;
    relationTip: string;
    workMoneyTip: string;
  };
  emotionPoint: {
    title: string;
    description: string;
  };
  timeSlots: {
    label: "오전" | "오후" | "저녁" | "밤";
    keyword: string;
    description: string;
  }[];
  weekly: {
    trend: number[];
    keyDay: string;
    summary: string;
  };
  recommendation: {
    title: string;
    text: string;
    href: string;
  };
};

const DAILY_SENTENCES = [
  "오늘은 흐름을 읽는 날.",
  "작은 정리가 큰 결정을 가볍게 만듭니다.",
  "말을 아끼면 운이 오래 머무는 날입니다.",
  "서두르기보다 방향을 고르는 시간이 필요합니다.",
  "한 번 더 확인하는 습관이 손실을 막아줍니다.",
  "가볍게 시작한 일이 오후에 힘을 받을 수 있습니다.",
  "관계의 온도를 맞추면 일이 부드럽게 풀립니다.",
  "오늘의 운은 정확한 표현에서 시작됩니다.",
  "큰 변화보다 작은 조정이 유리합니다.",
  "마음이 급해질수록 순서를 다시 세워야 합니다.",
  "기회는 가까운 대화 속에서 먼저 보입니다.",
  "오래 미룬 일을 짧게라도 건드리면 흐름이 열립니다.",
  "결정보다 관찰이 먼저인 날입니다.",
  "상대의 속도를 맞추면 관계운이 살아납니다.",
  "돈과 약속은 숫자로 확인할수록 안전합니다.",
  "오늘은 내 리듬을 지키는 것이 가장 큰 운입니다.",
  "작은 칭찬 하나가 관계의 문을 열 수 있습니다.",
  "무리한 확장보다 현재의 것을 다듬기 좋습니다.",
  "오전의 정리가 오후의 기회를 만듭니다.",
  "감정이 올라올 때는 답을 늦추는 편이 좋습니다.",
  "단단한 하루는 차분한 시작에서 만들어집니다.",
  "혼자 끌고 가기보다 역할을 나누면 수월합니다.",
  "오늘은 선택보다 기준을 세우는 날입니다.",
  "낯선 제안은 반갑게 듣되 천천히 결정하세요.",
  "작은 루틴을 지키면 컨디션이 살아납니다.",
  "관계에서는 설명보다 태도가 더 오래 남습니다.",
  "돈의 흐름은 지출을 줄이는 데서 먼저 안정됩니다.",
  "예민한 판단은 기록으로 보완하는 것이 좋습니다.",
  "오늘의 성과는 속도보다 완성도에 있습니다.",
  "가장 쉬운 일부터 끝내면 운의 속도가 붙습니다.",
  "침착하게 물러나는 것도 좋은 선택입니다.",
  "기대보다 현실을 보면 답이 빨라집니다.",
  "새로운 말보다 약속한 일을 지키는 날입니다.",
  "감정의 파도는 짧고, 남는 것은 선택입니다.",
  "오후에는 사람보다 일의 순서를 먼저 보세요.",
  "오늘은 조언을 듣되 결론은 스스로 내리는 날입니다.",
  "정확한 질문이 좋은 답을 부릅니다.",
  "가까운 사람에게 짧은 안부를 전하면 운이 부드러워집니다.",
  "일의 핵심은 많이 하는 것이 아니라 먼저 할 것을 고르는 데 있습니다.",
  "불필요한 비교를 줄이면 내 흐름이 선명해집니다.",
  "작은 수익보다 큰 손실을 막는 감각이 중요합니다.",
  "몸이 보내는 신호를 무시하지 않는 것이 좋습니다.",
  "한 박자 늦춘 말이 관계를 지켜줍니다.",
  "오늘은 준비한 사람에게 기회가 먼저 보입니다.",
  "흐름이 흔들릴 때는 기본으로 돌아가야 합니다.",
  "무리한 설득보다 조용한 증명이 통합니다.",
  "정리되지 않은 마음은 글로 적으면 가벼워집니다.",
  "오늘은 새로운 출발보다 방향 수정에 유리합니다.",
  "작은 성의가 예상보다 크게 돌아올 수 있습니다.",
  "결정은 짧게, 확인은 길게 가져가세요.",
  "좋은 운은 차분한 태도에 오래 머뭅니다.",
  "해야 할 일과 하지 않을 일을 나누면 하루가 선명해집니다.",
  "낮은 목소리와 분명한 기준이 오늘의 무기입니다.",
  "쌓인 일을 나누면 부담이 줄고 성과가 보입니다.",
  "오늘은 마음보다 일정표를 믿는 편이 좋습니다.",
  "상대의 말 뒤에 있는 필요를 읽어보세요.",
  "가벼운 산책이 생각을 정리해줄 수 있습니다.",
  "익숙한 방식 안에서 작은 개선을 찾는 날입니다.",
  "오늘의 좋은 선택은 내일의 피로를 줄입니다.",
  "운은 과감함보다 균형감에서 살아납니다.",
];

const FLOW_LINES = [
  "표현은 살아나지만 판단이 예민해질 수 있어요. 중요한 말은 한 번 정리한 뒤 전하는 편이 좋습니다.",
  "일의 속도는 빠르지 않아도 방향이 잡히는 날입니다. 오전에는 정리, 오후에는 실행이 어울립니다.",
  "사람의 반응에 마음이 흔들리기 쉽습니다. 상대를 설득하기보다 상황을 차분히 설명해보세요.",
  "돈과 일정에서 작은 변수가 생길 수 있습니다. 숫자, 시간, 약속을 다시 확인하면 안정됩니다.",
  "새로운 기회가 보이지만 바로 잡기보다 조건을 살피는 편이 유리합니다.",
  "컨디션이 흐름을 좌우합니다. 무리하게 밀어붙이기보다 리듬을 지키면 결과가 좋아집니다.",
];

const EMOTION_POINTS = [
  ["말이 늦어질 때", "답답함이 올라와도 바로 몰아붙이지 마세요. 한 문장으로 원하는 것을 정리하면 감정 소모가 줄어듭니다."],
  ["평가받는 느낌이 들 때", "상대의 말 전체를 공격으로 받아들이지 않는 것이 중요합니다. 필요한 부분만 골라 들으면 중심이 잡힙니다."],
  ["결정을 재촉받을 때", "오늘은 빠른 답보다 정확한 기준이 더 중요합니다. 시간을 요청해도 흐름이 크게 꺾이지 않습니다."],
  ["관계의 온도가 달라질 때", "서운함을 쌓아두기보다 짧고 부드럽게 확인하는 편이 좋습니다."],
  ["할 일이 많아 보일 때", "전체를 보려고 하면 부담이 커집니다. 가장 작은 한 가지부터 끝내세요."],
];

const TIME_KEYWORDS = [
  [
    ["정리", "오전에는 흩어진 일정과 생각을 한곳에 모으기 좋습니다."],
    ["판단", "오후에는 결정할 일이 선명해집니다. 조건을 비교해보세요."],
    ["대화", "저녁에는 관계의 온도를 맞추는 말이 힘을 얻습니다."],
    ["회복", "밤에는 무리한 생각보다 회복을 우선하세요."],
  ],
  [
    ["준비", "오전에는 새로 벌이기보다 필요한 자료를 챙기세요."],
    ["실행", "오후에는 미룬 일을 실제 행동으로 옮기기 좋습니다."],
    ["조율", "저녁에는 약속과 관계를 부드럽게 조정하세요."],
    ["비움", "밤에는 불필요한 걱정을 내려놓는 것이 좋습니다."],
  ],
  [
    ["집중", "오전에는 방해를 줄이면 생각보다 빠르게 처리됩니다."],
    ["기회", "오후에는 제안이나 연락을 가볍게 넘기지 마세요."],
    ["점검", "저녁에는 오늘의 선택을 다시 확인하기 좋습니다."],
    ["안정", "밤에는 몸을 따뜻하게 하고 일찍 쉬는 편이 좋습니다."],
  ],
] as const;

const ACTION_BY_SIPSIN: Record<string, DailyFortuneContent["actionGuide"]> = {
  식신: {
    dos: "아이디어를 말로 꺼내고, 작은 결과물로 보여주세요.",
    donts: "좋은 분위기만 믿고 중요한 확인을 생략하지 마세요.",
    relationTip: "칭찬과 유머가 관계를 부드럽게 만듭니다.",
    workMoneyTip: "제안, 콘텐츠, 영업처럼 표현이 필요한 일에 유리합니다.",
  },
  상관: {
    dos: "불편한 점을 고치되 표현은 부드럽게 다듬으세요.",
    donts: "날카로운 말과 즉흥적인 반박은 피하는 편이 좋습니다.",
    relationTip: "상대의 체면을 세워주면 대화가 훨씬 쉬워집니다.",
    workMoneyTip: "새 아이디어는 좋지만 계약과 숫자는 한 번 더 확인하세요.",
  },
  정관: {
    dos: "약속, 보고, 문서처럼 신뢰가 쌓이는 일을 먼저 하세요.",
    donts: "완벽하게 하려다 시작을 늦추지 마세요.",
    relationTip: "예의 있는 표현이 오늘의 관계운을 올립니다.",
    workMoneyTip: "공식적인 절차와 안정적인 선택에 운이 따릅니다.",
  },
  편재: {
    dos: "사람을 만나고 제안을 넓게 살펴보세요.",
    donts: "충동 결제와 검증 없는 투자는 피하세요.",
    relationTip: "먼저 연락하면 예상보다 빠르게 분위기가 풀립니다.",
    workMoneyTip: "활동량이 돈의 흐름을 만들지만 과욕은 줄여야 합니다.",
  },
};

const DEFAULT_ACTION: DailyFortuneContent["actionGuide"] = {
  dos: "가장 중요한 일 한 가지를 먼저 끝내세요.",
  donts: "감정이 올라온 상태에서 바로 결정하지 마세요.",
  relationTip: "상대의 말을 끝까지 듣고 짧게 답하면 좋습니다.",
  workMoneyTip: "일정과 지출을 숫자로 확인하면 손실을 줄일 수 있습니다.",
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

function pick<T>(items: readonly T[], seed: number, step = 0) {
  return items[(seed + step * 17) % items.length];
}

function buildWeekly(seed: number) {
  const dayNames = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const trend = Array.from({ length: 7 }, (_, index) => 46 + ((seed + index * 13) % 39));
  const keyIndex = trend.reduce((bestIndex, value, index) => (value > trend[bestIndex] ? index : bestIndex), 0);

  return {
    trend,
    keyDay: dayNames[keyIndex],
    summary: `이번 주의 중심은 ${dayNames[keyIndex]}에 가장 또렷하게 놓여 있습니다.`,
  };
}

function buildRecommendation(date: Date, seed: number) {
  const day = date.getDay();
  const hour = date.getHours();

  if (day === 1) {
    return { title: "토정비결", text: "이번 주 토정비결로 한 주의 흐름을 먼저 읽어보세요.", href: "/tojeong" };
  }
  if (day === 3) {
    return { title: "사주", text: "사주 리포트로 한 주의 중간 흐름을 차분히 점검해보세요.", href: "/saju" };
  }
  if (day === 5) {
    return { title: "궁합", text: "궁합 리포트로 주말 관계의 온도를 미리 읽어보세요.", href: "/compatibility" };
  }
  if (day === 0 && hour >= 18) {
    return { title: "꿈해몽", text: "꿈해몽으로 한 주의 흐름을 조용히 마무리해보세요.", href: "/dream" };
  }

  const fallback = [
    { title: "타로", text: "타로 리포트로 오늘 마음의 결을 가볍게 읽어보세요.", href: "/tarot" },
    { title: "AI상담", text: "오늘의 흐름이 걸리는 지점이 있다면, AI상담에서 한 번 더 깊게 정리해보세요.", href: "/chat" },
    { title: "오늘의 흐름", text: "오늘의 리포트로 지금 필요한 움직임을 정리해보세요.", href: "/today" },
  ];

  return fallback[seed % fallback.length];
}

export function buildDailyFortuneContent(date = new Date(), profile: DailyProfile = {}): DailyFortuneContent {
  const seedKey = `${dateKey(date)}-${profile.sipsin ?? "default"}-${profile.element ?? "none"}`;
  const seed = hashSeed(seedKey);
  const timeSet = pick(TIME_KEYWORDS, seed, 3);
  const scores = profile.scores ?? {};
  const relationIsLow = typeof scores.love === "number" && scores.love < 58;
  const workIsStrong = typeof scores.career === "number" && scores.career >= 72;
  const actionGuide = ACTION_BY_SIPSIN[profile.sipsin ?? ""] ?? DEFAULT_ACTION;

  return {
    seedKey,
    sentence: pick(DAILY_SENTENCES, seed),
    flow: pick(FLOW_LINES, seed, 1),
    actionGuide: {
      ...actionGuide,
      relationTip: relationIsLow ? "오해가 생기기 쉬우니 짧고 분명하게 확인하세요." : actionGuide.relationTip,
      workMoneyTip: workIsStrong ? "오후에는 일의 성과가 살아나니 중요한 업무를 앞쪽에 두세요." : actionGuide.workMoneyTip,
    },
    emotionPoint: {
      title: pick(EMOTION_POINTS, seed, 2)[0],
      description: pick(EMOTION_POINTS, seed, 2)[1],
    },
    timeSlots: timeSet.map(([keyword, description], index) => ({
      label: (["오전", "오후", "저녁", "밤"] as const)[index],
      keyword,
      description,
    })),
    weekly: buildWeekly(seed),
    recommendation: buildRecommendation(date, seed),
  };
}
