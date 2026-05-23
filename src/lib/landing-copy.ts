/** 메타 광고용 페르소나 랜딩 카피 (수정_내역_정리.md 반영) */

export type LandingCompareRow = {
  badge: string;
  title: string;
  desc: string;
  variant: "generic" | "brand";
};

export type LandingBarRow = { label: string; value: number };

export type LandingPersonaCopy = {
  slug: string;
  metaTitle: string;
  heroTag: string;
  heroTitleLines: string[];
  heroTitleEmIndex?: number;
  heroLead: string;
  heroLeadBold?: string;
  heroImage: string;
  hook: {
    kicker: string;
    title: string;
    body: string[];
    compare: LandingCompareRow[];
  };
  report: {
    kicker: string;
    title: string;
    date: string;
    flow: string;
    line: string;
    score: number;
    bars: LandingBarRow[];
  };
  capture: {
    title: string;
    subtitle: string;
    ctaHref: string;
    ctaLabel: string;
  };
};

export const LANDING_SELF: LandingPersonaCopy = {
  slug: "self",
  metaTitle: "운명비서 — 태어난 시까지 읽는 오늘의 운세",
  heroTag: "命 운명비서",
  heroTitleLines: ["MBTI는 안 바뀌지만,", "내 오늘은", "매일 다릅니다"],
  heroTitleEmIndex: 1,
  heroLead:
    "대부분의 오늘의 운세는 생일까지만 봅니다. 운명비서는 태어난 시(時)까지 읽어 하루의 결을 가릅니다.",
  heroImage: "/miim.png",
  hook: {
    kicker: "WHY 시(時)를 봐야 할까",
    title: "같은 생일인데도\n당신의 시는 다릅니다",
    body: [
      "사주명리에서 시주(時柱)는 당신의 본체 기질을 드러냅니다. 같은 날 태어났어도 오전과 오후에 태어난 사람은 완전히 다른 운의 기질을 타고나죠.",
      "그런데 일반적인 오늘의 운세는 생년월일만 봅니다. 당신의 정말 중요한 한 축을 빼먹는 거죠. 운명비서는 태어난 시까지 반영해 오늘의 흐름을 훨씬 정확하게 읽습니다.",
    ],
    compare: [
      {
        variant: "generic",
        badge: "일반",
        title: "생년월일만 봅니다",
        desc: "시주 없이 기질이 흐려진 해석",
      },
      {
        variant: "brand",
        badge: "命",
        title: "생년월일 + 태어난 시를 봅니다",
        desc: "당신만의 기질과 오늘의 시어",
      },
    ],
  },
  report: {
    kicker: "당신의 시로 읽은 오늘",
    title: "같은 시간대도\n당신에겐 다르게 흐립니다",
    date: "2026 · 05 · 22 (금)",
    flow: "오늘의 결 · 상승",
    line: "지금 당신은 움직임의 시기예요.\n새로운 시도를 하기 좋은 때입니다.",
    score: 82,
    bars: [
      { label: "관계", value: 86 },
      { label: "결정", value: 86 },
      { label: "감정", value: 79 },
      { label: "균형", value: 72 },
    ],
  },
  capture: {
    title: "가장 먼저\n내 시간대 흐름을 받아보세요",
    subtitle:
      "지금 바로 생년월일과 태어난 시를 넣으면,\n당신 기준 오늘의 흐름을 읽을 수 있어요.",
    ctaHref: "/today#personalize",
    ctaLabel: "내 결로 시작하기",
  },
};

export const LANDING_DIVORCED: LandingPersonaCopy = {
  slug: "divorced",
  metaTitle: "운명비서 — 두 번째 챕터를 위한 사주",
  heroTag: "命 운명비서",
  heroTitleLines: ["인생의 두 번째 챕터,", "맞는 사람을", "찾고 싶어요"],
  heroTitleEmIndex: 1,
  heroLead:
    "첫 번째에서 배운 게 있어요. '끌리는 사람'과 '맞는 사람'은 다르다는 것. 사주는 그 차이를 보여줍니다.",
  heroImage: "/miim.png",
  hook: {
    kicker: "WHY 사주를 다시 봐야 할까",
    title: "첫 번째와는 다른 기준으로\n선택해야 합니다",
    body: [
      "사주에는 당신의 기질(일간)과 타고난 운의 기울기(대운)가 있습니다. 인생의 첫 번째 챕터에서 배운 교훈들이 지금의 선택 기준을 만들었어요.",
      "운명비서는 당신의 현재 대운과 태어난 시를 함께 봅니다. 지금 이 시기에 맞는 관계의 온도를 차분하게 읽어드려요.",
    ],
    compare: [
      {
        variant: "generic",
        badge: "과거",
        title: "감정적으로 끌리는 사람을 선택했어요",
        desc: "좋았던 기분은 식었고, 남은 건 후회뿐",
      },
      {
        variant: "brand",
        badge: "命",
        title: "당신의 현재 흐름에 맞는 사람을 찾아요",
        desc: "시간이 갈수록 더 편해지는 관계",
      },
    ],
  },
  report: {
    kicker: "당신의 현재 대운으로 읽은 관계",
    title: "관계의 결을\n미리 알 수 있어요",
    date: "2026 · 05 · 22 (금)",
    flow: "오늘의 결 · 안정",
    line: "지금은 서두를 때가 아니에요.\n차근차근 신뢰를 쌓는 시기입니다.",
    score: 76,
    bars: [
      { label: "관계", value: 84 },
      { label: "결정", value: 71 },
      { label: "감정", value: 78 },
      { label: "균형", value: 74 },
    ],
  },
  capture: {
    title: "당신의 대운 흐름을\n가장 먼저 받아보세요",
    subtitle: "생년월일과 태어난 시를 넣으면,\n지금 이 시기의 관계 흐름을 읽을 수 있어요.",
    ctaHref: "/today#personalize",
    ctaLabel: "내 결로 시작하기",
  },
};

export const LANDING_DECISION: LandingPersonaCopy = {
  slug: "decision",
  metaTitle: "운명비서 — 결정이 필요한 날들을 위해",
  heroTag: "命 운명비서",
  heroTitleLines: ["둘 중 하나를", "결정해야 하는데,", "자신이 없어요"],
  heroTitleEmIndex: 1,
  heroLead:
    "머리로는 A가 맞는 것 같은데 가슴은 B를 원해요. 사주는 지금의 당신에게 어느 길이 흐르는지 알려줍니다.",
  heroImage: "/miim.png",
  hook: {
    kicker: "WHY 결정 전에 사주를 봐야 할까",
    title: "지금의 당신은\n선택지 중 어느 쪽으로 흐르고 있습니다",
    body: [
      "선택지들이 똑같이 좋아 보일 때, 사주는 당신의 지금 흐름이 어느 쪽으로 향하는지 보여줍니다.",
      "우리는 종종 옳은 것과 맞는 것을 혼동합니다. 이성적으로 옳은 선택이 감정적으로 맞지 않으면 오래 가지 못하죠.",
    ],
    compare: [
      {
        variant: "generic",
        badge: "고민",
        title: "두 길 다 맞는 것 같은데...",
        desc: "고민만 하다 기회를 놓칠 수 있어요",
      },
      {
        variant: "brand",
        badge: "命",
        title: "지금의 나에게는 명확한 답이 있어요",
        desc: "사주가 그 신호를 보여줍니다",
      },
    ],
  },
  report: {
    kicker: "당신의 결정 기질을 읽은 오늘",
    title: "선택할 때 당신은\n어떤 타입인가요",
    date: "2026 · 05 · 22 (금)",
    flow: "오늘의 결 · 신중",
    line: "당신은 신중함을 중시합니다.\n지금이 확신 있게 결정하기 좋은 때예요.",
    score: 80,
    bars: [
      { label: "결정", value: 88 },
      { label: "관계", value: 75 },
      { label: "감정", value: 77 },
      { label: "균형", value: 81 },
    ],
  },
  capture: {
    title: "당신의 결정 타입을\n가장 먼저 알아보세요",
    subtitle: "생년월일과 태어난 시를 넣으면,\n오늘 당신에게 맞는 선택의 신호를 읽을 수 있어요.",
    ctaHref: "/today#personalize",
    ctaLabel: "내 결로 시작하기",
  },
};

export const LANDING_BY_SLUG: Record<string, LandingPersonaCopy> = {
  self: LANDING_SELF,
  divorced: LANDING_DIVORCED,
  decision: LANDING_DECISION,
};
