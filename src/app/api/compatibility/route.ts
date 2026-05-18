import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "ssaju";

type PersonRequest = {
  name?: string;
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  gender?: "남" | "여";
  isLunar?: boolean;
};

type PersonProfile = {
  name: string;
  hasHour: boolean;
  dayStem: string;
  dayBranch: string;
  yearBranch: string;
  mainElement: string;
  elementKey: ElementKey;
  eumyang: string;
  ddi: string;
  pillarDetails: Record<string, PillarView>;
  personality: {
    title: string;
    traits: string;
  };
};

type PillarView = {
  stem: string;
  branch: string;
  stemKo: string;
  branchKo: string;
};

type ElementKey = "목" | "화" | "토" | "금" | "수";

const ganInfo: Record<string, { hanja: string; element: string; elementKey: ElementKey; eumyang: string }> = {
  갑: { hanja: "甲", element: "목(木)", elementKey: "목", eumyang: "양" },
  을: { hanja: "乙", element: "목(木)", elementKey: "목", eumyang: "음" },
  병: { hanja: "丙", element: "화(火)", elementKey: "화", eumyang: "양" },
  정: { hanja: "丁", element: "화(火)", elementKey: "화", eumyang: "음" },
  무: { hanja: "戊", element: "토(土)", elementKey: "토", eumyang: "양" },
  기: { hanja: "己", element: "토(土)", elementKey: "토", eumyang: "음" },
  경: { hanja: "庚", element: "금(金)", elementKey: "금", eumyang: "양" },
  신: { hanja: "辛", element: "금(金)", elementKey: "금", eumyang: "음" },
  임: { hanja: "壬", element: "수(水)", elementKey: "수", eumyang: "양" },
  계: { hanja: "癸", element: "수(水)", elementKey: "수", eumyang: "음" },
};

const jiInfo: Record<string, { hanja: string; ddi: string }> = {
  자: { hanja: "子", ddi: "쥐" },
  축: { hanja: "丑", ddi: "소" },
  인: { hanja: "寅", ddi: "호랑이" },
  묘: { hanja: "卯", ddi: "토끼" },
  진: { hanja: "辰", ddi: "용" },
  사: { hanja: "巳", ddi: "뱀" },
  오: { hanja: "午", ddi: "말" },
  미: { hanja: "未", ddi: "양" },
  신: { hanja: "申", ddi: "원숭이" },
  유: { hanja: "酉", ddi: "닭" },
  술: { hanja: "戌", ddi: "개" },
  해: { hanja: "亥", ddi: "돼지" },
};

const personality: Record<ElementKey, { title: string; traits: string }> = {
  목: {
    title: "성장과 배려의 기운",
    traits: "새로운 방향을 잘 열고 관계 안에서 가능성을 키우려는 성향이 강합니다.",
  },
  화: {
    title: "표현과 온기의 기운",
    traits: "감정 표현이 빠르고 분위기를 밝게 만드는 힘이 있어 관계의 활력을 만듭니다.",
  },
  토: {
    title: "안정과 신뢰의 기운",
    traits: "현실적이고 책임감이 강해 관계를 오래 유지하는 기반을 중요하게 봅니다.",
  },
  금: {
    title: "원칙과 결단의 기운",
    traits: "기준이 분명하고 말과 행동이 명확해 관계에서도 약속과 태도를 중요하게 여깁니다.",
  },
  수: {
    title: "지혜와 유연함의 기운",
    traits: "상황을 넓게 보고 감정을 깊이 이해하려는 성향이 있어 대화의 깊이를 만듭니다.",
  },
};

const generateCycle: Record<ElementKey, ElementKey> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

const controlCycle: Record<ElementKey, ElementKey> = {
  목: "토",
  토: "수",
  수: "화",
  화: "금",
  금: "목",
};

const branchTriads = [
  ["신", "자", "진"],
  ["해", "묘", "미"],
  ["인", "오", "술"],
  ["사", "유", "축"],
];

const branchPairs = [
  ["자", "축"],
  ["인", "해"],
  ["묘", "술"],
  ["진", "유"],
  ["사", "신"],
  ["오", "미"],
];

const branchClashes = [
  ["자", "오"],
  ["축", "미"],
  ["인", "신"],
  ["묘", "유"],
  ["진", "술"],
  ["사", "해"],
];

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function gradeFromScore(score: number) {
  if (score >= 85) return "매우 좋음";
  if (score >= 70) return "좋음";
  if (score >= 55) return "보통";
  if (score >= 40) return "노력 필요";
  return "주의";
}

function pairIncludes(pair: string[], a: string, b: string) {
  return pair.includes(a) && pair.includes(b);
}

function hasBatchim(element: ElementKey) {
  return element === "목" || element === "금";
}

function subjectElement(element: ElementKey) {
  return `${element}${hasBatchim(element) ? "이" : "가"}`;
}

function objectElement(element: ElementKey) {
  return `${element}${hasBatchim(element) ? "을" : "를"}`;
}

function pairElement(element: ElementKey) {
  return `${element}${hasBatchim(element) ? "과" : "와"}`;
}

function getElementScore(a: ElementKey, b: ElementKey) {
  if (a === b) {
    return {
      score: 78,
      title: `${pairElement(a)} ${b}, 비슷한 결의 만남`,
      chemistry: "기본 성향이 비슷해 서로를 빠르게 이해합니다. 다만 같은 장점과 같은 고집이 함께 커질 수 있습니다.",
      strength: "관심사와 판단 기준이 잘 맞아 초반 친밀감이 빠르게 생깁니다.",
      weakness: "둘 다 같은 방식으로 밀어붙이면 양보가 늦어질 수 있습니다.",
      tip: "같은 생각을 확인하는 것보다 역할을 나누는 대화가 관계를 안정시킵니다.",
    };
  }

  if (generateCycle[a] === b) {
    return {
      score: 84,
      title: `${subjectElement(a)} ${objectElement(b)} 살리는 흐름`,
      chemistry: "한 사람이 자연스럽게 다른 사람의 장점을 키워주는 상생 흐름입니다.",
      strength: "응원과 성장의 흐름이 좋아 함께 있을 때 추진력이 살아납니다.",
      weakness: "주는 쪽이 지치지 않도록 고마움을 자주 표현해야 합니다.",
      tip: "도움을 당연하게 여기지 않고 작은 보답을 자주 남기면 좋습니다.",
    };
  }

  if (generateCycle[b] === a) {
    return {
      score: 82,
      title: `${subjectElement(b)} ${objectElement(a)} 살리는 흐름`,
      chemistry: "상대의 기운이 나의 장점을 끌어올리는 관계입니다.",
      strength: "부족한 자신감이나 실행력을 관계 안에서 보완받기 쉽습니다.",
      weakness: "한쪽에게 의존이 커지면 균형이 흔들릴 수 있습니다.",
      tip: "받는 만큼 인정과 배려를 돌려주는 습관이 중요합니다.",
    };
  }

  if (controlCycle[a] === b || controlCycle[b] === a) {
    return {
      score: 52,
      title: `${pairElement(a)} ${b}, 긴장 속에서 배우는 관계`,
      chemistry: "서로의 방식이 달라 부딪힘이 생길 수 있지만, 잘 맞추면 균형감이 커지는 조합입니다.",
      strength: "서로에게 없는 현실감과 자극을 줄 수 있습니다.",
      weakness: "조언이 통제처럼 들리거나 감정이 방어적으로 흐를 수 있습니다.",
      tip: "상대를 고치려 하기보다 원하는 행동을 구체적으로 요청하는 편이 좋습니다.",
    };
  }

  return {
    score: 66,
    title: `${pairElement(a)} ${b}, 차이를 맞춰가는 관계`,
    chemistry: "크게 밀어내는 흐름은 아니지만 서로의 속도와 관심사가 다를 수 있습니다.",
    strength: "각자의 장점이 달라 역할 분담이 자연스럽게 만들어질 수 있습니다.",
    weakness: "말하지 않아도 알 것이라는 기대는 오해를 만들 수 있습니다.",
    tip: "감정과 일정, 돈과 약속처럼 현실적인 기준을 미리 맞추면 안정적입니다.",
  };
}

function getBranchScore(a: string, b: string) {
  if (a === b) {
    return { score: 74, title: "비슷한 리듬", desc: "생활 감각과 반응 속도가 비슷해 편안함을 느끼기 쉽습니다." };
  }

  if (branchPairs.some((pair) => pairIncludes(pair, a, b))) {
    return { score: 86, title: "육합의 조화", desc: "서로를 끌어당기는 힘이 있어 친밀감과 협력성이 좋은 편입니다." };
  }

  if (branchTriads.some((triad) => triad.includes(a) && triad.includes(b))) {
    return { score: 80, title: "삼합의 흐름", desc: "큰 방향성에서 서로의 흐름을 도와주는 조합입니다." };
  }

  if (branchClashes.some((pair) => pairIncludes(pair, a, b))) {
    return { score: 42, title: "충의 긴장", desc: "끌림은 있어도 생활 방식이나 감정 표현에서 충돌이 생기기 쉽습니다." };
  }

  return { score: 62, title: "무난한 띠 흐름", desc: "강한 충돌도 강한 결속도 적어 서로의 선택과 노력이 중요합니다." };
}

function buildProfile(input: PersonRequest, fallbackName: string): PersonProfile {
  const hasHour = input.hour !== undefined && input.hour !== null;
  const sajuInput: any = {
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    gender: input.gender || "남",
    calendar: input.isLunar ? "lunar" : "solar",
    timezone: "Asia/Seoul",
    applyLocalMeanTime: true,
    longitude: 126.9784,
  };

  if (hasHour) {
    sajuInput.hour = Number(input.hour);
    sajuInput.minute = input.minute !== undefined && input.minute !== null ? Number(input.minute) : 0;
  }

  const result = calculateSaju(sajuInput);
  const pd = result.pillarDetails;
  const dayStem = pd.day.stemKo;
  const dayBranch = pd.day.branchKo;
  const yearBranch = pd.year.branchKo;
  const dayInfo = ganInfo[dayStem] || ganInfo.갑;
  const yearInfo = jiInfo[yearBranch] || jiInfo.자;

  const pillarDetails = Object.fromEntries(
    (["hour", "day", "month", "year"] as const).map((key) => {
      const p = pd[key];
      return [
        key,
        {
          stem: p.stem,
          branch: p.branch,
          stemKo: p.stemKo,
          branchKo: p.branchKo,
        },
      ];
    }),
  ) as Record<string, PillarView>;

  return {
    name: input.name?.trim() || fallbackName,
    hasHour,
    dayStem,
    dayBranch,
    yearBranch,
    mainElement: dayInfo.element,
    elementKey: dayInfo.elementKey,
    eumyang: dayInfo.eumyang,
    ddi: yearInfo.ddi,
    pillarDetails,
    personality: personality[dayInfo.elementKey],
  };
}

function getEumyangScore(a: string, b: string) {
  if (a !== b) {
    return {
      score: 78,
      desc: "음양이 달라 서로에게 부족한 결을 채워주는 관계입니다. 한쪽은 움직임을, 다른 한쪽은 안정감을 보태기 쉽습니다.",
    };
  }

  return {
    score: 62,
    desc: "음양이 같아 반응 방식이 비슷합니다. 편안함은 있지만 갈등 상황에서는 둘 다 같은 방향으로 치우칠 수 있습니다.",
  };
}

function getIljuScore(a: PersonProfile, b: PersonProfile) {
  let score = 60;
  const notes: string[] = [];

  if (a.dayStem === b.dayStem) {
    score += 10;
    notes.push("일간이 같아 생각의 기준을 이해하기 쉽습니다.");
  }

  if (a.dayBranch === b.dayBranch) {
    score += 8;
    notes.push("일지의 생활 리듬이 비슷해 편안함이 있습니다.");
  }

  if (branchPairs.some((pair) => pairIncludes(pair, a.dayBranch, b.dayBranch))) {
    score += 14;
    notes.push("일지가 합을 이루어 친밀감과 협력성이 좋습니다.");
  }

  if (branchClashes.some((pair) => pairIncludes(pair, a.dayBranch, b.dayBranch))) {
    score -= 18;
    notes.push("일지가 충을 이루어 가까울수록 생활 방식의 차이가 드러날 수 있습니다.");
  }

  if (notes.length === 0) {
    notes.push("일주 흐름은 강하게 치우치지 않아 관계를 만들어가는 태도가 더 중요합니다.");
  }

  return {
    score: clampScore(score),
    title: `${a.dayStem}${a.dayBranch}일주와 ${b.dayStem}${b.dayBranch}일주`,
    desc: notes.join(" "),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { person1, person2 } = body as { person1?: PersonRequest; person2?: PersonRequest };

    if (!person1 || !person2) {
      return NextResponse.json({ error: "두 사람의 정보가 필요합니다." }, { status: 400 });
    }

    const p1 = buildProfile(person1, "첫째");
    const p2 = buildProfile(person2, "둘째");

    const ohaengCombo = getElementScore(p1.elementKey, p2.elementKey);
    const ddiCombo = getBranchScore(p1.yearBranch, p2.yearBranch);
    const eumyang = getEumyangScore(p1.eumyang, p2.eumyang);
    const ilju = getIljuScore(p1, p2);

    const gearAnalysis = [
      {
        label: "일간 오행",
        desc: ohaengCombo.chemistry,
        score: ohaengCombo.score - 65,
      },
      {
        label: "띠 흐름",
        desc: ddiCombo.desc,
        score: ddiCombo.score - 65,
      },
      {
        label: "음양 균형",
        desc: eumyang.desc,
        score: eumyang.score - 65,
      },
      {
        label: "일주 흐름",
        desc: ilju.desc,
        score: ilju.score - 65,
      },
    ];

    const categories = [
      {
        label: "애정 궁합",
        score: clampScore((ohaengCombo.score + ilju.score) / 2 + 4),
        description: "끌림과 친밀감의 흐름을 일간 오행과 일주 관계로 함께 본 점수입니다.",
      },
      {
        label: "성격 궁합",
        score: clampScore((ohaengCombo.score + eumyang.score) / 2),
        description: "성향 차이를 받아들이고 서로의 장점을 살릴 수 있는 정도입니다.",
      },
      {
        label: "생활 리듬",
        score: clampScore((ddiCombo.score + ilju.score) / 2),
        description: "생활 방식, 반복되는 습관, 가까운 거리에서의 편안함을 본 항목입니다.",
      },
      {
        label: "소통 궁합",
        score: clampScore((eumyang.score + ilju.score) / 2),
        description: "감정 표현과 대화 방식이 서로에게 전달되기 쉬운 정도입니다.",
      },
      {
        label: "장기 안정성",
        score: clampScore((ohaengCombo.score + ddiCombo.score + eumyang.score + ilju.score) / 4),
        description: "관계가 오래 이어질 때 안정적으로 균형을 잡을 수 있는 흐름입니다.",
      },
    ];

    const overallScore = clampScore(
      categories.reduce((sum, category) => sum + category.score, 0) / categories.length,
    );

    const strengths = [
      ohaengCombo.strength,
      ddiCombo.desc,
      p1.eumyang !== p2.eumyang
        ? "서로 다른 음양 기운이 보완 작용을 만들 수 있습니다."
        : "비슷한 반응 방식 덕분에 서로를 빠르게 이해할 수 있습니다.",
    ];

    const weaknesses = [
      ohaengCombo.weakness,
      ddiCombo.score < 50
        ? "가까워질수록 생활 습관과 속도 차이를 의식적으로 조율해야 합니다."
        : "편안함에 기대어 중요한 이야기를 미루지 않는 것이 좋습니다.",
    ];

    const tips = [
      ohaengCombo.tip,
      "갈등이 생기면 성격 문제로 단정하기보다 역할과 기대치를 구체적으로 나누세요.",
      "서로 잘 맞는 부분은 루틴으로 만들고, 반복해서 부딪히는 부분은 규칙을 정해두는 편이 좋습니다.",
    ];

    return NextResponse.json({
      person1: p1,
      person2: p2,
      overallScore,
      grade: gradeFromScore(overallScore),
      mainAdvice:
        overallScore >= 70
          ? "서로의 장점을 살리기 좋은 궁합입니다. 익숙함 속에서도 고마움을 표현하면 관계가 더 깊어집니다."
          : "차이가 분명한 궁합입니다. 다만 차이를 이해하고 역할을 나누면 오히려 균형 있는 관계로 발전할 수 있습니다.",
      gearAnalysis,
      ohaengCombo,
      eumyangDesc: eumyang.desc,
      ddiCombo,
      ilju,
      categories,
      strengths,
      weaknesses,
      tips,
    });
  } catch (err: any) {
    console.error("Compatibility API error:", err);
    return NextResponse.json(
      { error: err?.message || "궁합 분석 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
