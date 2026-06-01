import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { OHAENG_DICT, SIPSIN_DICT } from "@/data/wisdomDict";
import { computeOhaengCountFromPillars } from "@/lib/today-tone-engine";
import type { TodayApiResult } from "@/lib/today-secretary-report";
import { applySecretaryVoice } from "@/lib/today-secretary-voice";

export type TodayExpertBasisTableRow = {
  label: string;
  value: string;
  note?: string;
};

export type TodayExpertBasisGuide = {
  step1: { title: string; paragraphs: string[] };
  step2: { title: string; bullets: string[] };
  step3: { title: string; paragraphs: string[] };
  step4: { title: string; rows: TodayExpertBasisTableRow[] };
};

/** 십성 — 쉬운 뜻 + 오늘의 흐름 */
const SIPSIN_EXPERT: Record<
  string,
  { meaning: string; plain: string; flow: string; reality: string[] }
> = {
  비견: {
    meaning: "자립, 동료, 내 기준",
    plain: "비견은 나와 비슷한 기운이에요. 협력은 쉬워지는데, 고집·경쟁도 같이 올라올 수 있어요.",
    flow: "남과 맞서기보다 내 기준을 지키는 선택이 자주 나와요.",
    reality: [
      "혼자 결정하고 싶어지는 마음이 강해짐",
      "동료·파트너와 역할을 나누려는 생각이 많아짐",
      "남의 방식에 쉽게 동의하지 않게 됨",
      "내 페이스를 지키려는 성향이 두드러짐",
    ],
  },
  겁재: {
    meaning: "경쟁, 변동, 지출",
    plain: "겁재는 같은 그릇을 나누는 기운이에요. 돈·감정이 생각보다 빨리 움직일 수 있어요.",
    flow: "서두른 확장보다 손실 막는 쪽이 먼저예요.",
    reality: [
      "지출·약속이 늘어날지 검토하게 됨",
      "경쟁 상황에서 감정이 올라오기 쉬움",
      "검증 없는 제안을 경계하게 됨",
      "혼자 끙끙 앓기보다 확인을 요청하게 됨",
    ],
  },
  식신: {
    meaning: "표현, 여유, 성과",
    plain: "식신은 내가 만든 것·말한 것이 퍼지는 기운이에요. 편하게 표현할수록 흐름이 열려요.",
    flow: "새로 벌리기보다 보여 주고 정리하는 쪽이 잘 맞아요.",
    reality: [
      "말·글·작업 결과를 밖으로보내고 싶어짐",
      "작은 성과를 쌓으려는 마음이 생김",
      "대화·미팅에서 분위기를 부드럽게 만듦",
      "무리한 확장보다 실행·피드백에 집중함",
    ],
  },
  상관: {
    meaning: "재능, 변화, 말의 힘",
    plain: "상관은 틀을 깨는 표현이에요. 아이디어는 좋은데 말이 날카로워지기 쉬워요.",
    flow: "재능을 보여 주되, 관계에서는 말의 온도를 조절하는 게 중요해요.",
    reality: [
      "새 아이디어가 자주 떠오름",
      "불만을 말로 표현하고 싶어짐",
      "규칙·형식에 답답함을 느끼기 쉬움",
      "행동으로 보여 주면 설득력이 커짐",
    ],
  },
  편재: {
    meaning: "기회, 활동, 변동 재물",
    plain: "편재는 움직이는 돈·일이에요. 기회는 보이는데 과속은 리스크예요.",
    flow: "적극적으로 움직이되, 조건 확인은 빼먹지 마세요.",
    reality: [
      "연락·거래·외부 일정이 늘기 쉬움",
      "돈이 들어오거나 나갈 타이밍을 점검함",
      "새 제안을 빠르게 검토하게 됨",
      "한 번에 크게 베팅하기보다 나눠 실행함",
    ],
  },
  정재: {
    meaning: "안정, 실리, 꾸준한 재물",
    plain: "정재는 정리된 돈·일이에요. 꾸준함과 계산이 오늘 무기예요.",
    flow: "화려한 도전보다 숫자·계약·정산이 잘 맞는 날이에요.",
    reality: [
      "수입·지출을 다시 적어 보게 됨",
      "계약·영수증·조건을 꼼꼼히 봄",
      "안정적인 선택을 선호하게 됨",
      "무리한 투자보다 저축·정리에 마음이 감",
    ],
  },
  편관: {
    meaning: "압박, 도전, 긴장",
    plain: "편관은 견제와 책임이 따라오는 기운이에요. 스트레스 속에서도 성장 포인트가 있어요.",
    flow: "밀어붙이기보다 원칙과 체력을 지키는 선택이 나아요.",
    reality: [
      "마감·평가·상급자 이슈가 신경 쓰임",
      "규칙을 어기면 손해 본다고 느끼기 쉬움",
      "몸·마음 긴장을 먼저 관리하게 됨",
      "감정적 반응보다 절차를 따르려 함",
    ],
  },
  정관: {
    meaning: "책임, 규칙, 검증",
    plain: "정관은 맡은 역할을 지키는 기운이에요. 약속·계약·공적인 일에서 신뢰가 핵심이에요.",
    flow: "새 도전보다 이미 진행 중인 일을 점검하는 흐름이 강해요.",
    reality: [
      "거래·계약 조건을 다시 확인하게 됨",
      "상대의 말을 쉽게 믿지 않게 됨",
      "실수를 줄이려는 성향이 강해짐",
      "중요한 결정을 신중하게 검토하게 됨",
    ],
  },
  편인: {
    meaning: "영감, 학습, 변화",
    plain: "편인은 뜻밖의 정보·직감이에요. 배움은 좋은데 의심만 과하면 피곤해져요.",
    flow: "밖으로 나가기보다 정보 모으고 정리하는 쪽이 잘 맞아요.",
    reality: [
      "검색·공부·메모가 늘어남",
      "분위기를 해석하려는 마음이 강해짐",
      "결정을 미루고 더 보려는 경향이 생김",
      "혼자 생각할 시간이 필요해짐",
    ],
  },
  정인: {
    meaning: "인덕, 배움, 정리",
    plain: "정인은 도움과 배움의 기운이에요. 어른·자료·정리가 도움이 돼요.",
    flow: "혼자 끙끙 앓기보다 물어보고 정리하는 선택이 맞아요.",
    reality: [
      "조언을 구하거나 기록을 남기게 됨",
      "자격·서류·학습에 손이 가기 쉬움",
      "감사·사과 표현이 관계를 부드럽게 함",
      "급한 결론보다 차분한 정리를 택함",
    ],
  },
};

const TONE_FLOW_HINT: Record<string, string> = {
  ORGANIZE: "확장보다 정리·검증",
  TUNE: "밀어붙이기보다 조율·확인",
  DECIDE: "미루기보다 분명한 선택",
  DISTANCE: "속도보다 점검·회복",
  RISE: "준비된 실행·작은 확장",
  RECOVER: "무리한 결정보다 회복·방어",
};

function parseDayMaster(result: TodayApiResult): string {
  const gan = result.myDayGan?.match(/^([가-힣])/)?.[1];
  const el = result.myElement?.trim();
  if (gan && el) return `${gan}${el}`;
  if (gan) return `${gan} 일간`;
  return result.myDayGan?.split("(")[0]?.trim() ?? "—";
}

function resolveOhaengCount(result: TodayApiResult): Record<string, number> {
  if (result.ohaengCount && Object.keys(result.ohaengCount).length > 0) {
    return result.ohaengCount;
  }
  const pillars = result.pillars;
  if (!pillars?.year || !pillars.day) {
    return { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  }
  const stems: string[] = [];
  const branches: string[] = [];
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!p || p === "미입력") continue;
    const m = p.match(/^([가-힣])([가-힣])/);
    if (m) {
      stems.push(m[1]);
      branches.push(m[2]);
    }
  }
  return computeOhaengCountFromPillars(stems, branches);
}

function pickStrongWeakOhaeng(count: Record<string, number>) {
  const entries = Object.entries(count).filter(([, n]) => n > 0);
  if (!entries.length) return { strong: "—", weak: "—", strongNote: "", weakNote: "" };
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [strongEl, strongN] = sorted[0];
  const [weakEl, weakN] = sorted[sorted.length - 1];
  const strongDict = OHAENG_DICT[strongEl];
  const weakDict = OHAENG_DICT[weakEl];
  return {
    strong: strongEl,
    weak: weakEl,
    strongNote: strongDict ? `원국에 ${strongEl}이 ${strongN}개 — ${strongDict.strong}` : "",
    weakNote: weakDict ? `채우면 좋은 쪽 — ${weakDict.weak}` : "",
  };
}

function pickAdviceTheme(result: TodayApiResult, report: DailyFortuneContent): string {
  const toneHint = TONE_FLOW_HINT[report.toneKey] ?? "속도보다 검증";
  const tip = result.secretaryCopy?.strategy ?? report.actionGuide.workMoneyTip ?? "";
  if (tip.includes("검증") || tip.includes("확인")) return "속도보다 검증";
  if (tip.includes("정리")) return "확장보다 정리";
  if (tip.includes("연락") || tip.includes("관계")) return "관계에서 조율";
  if (tip.includes("결정")) return "미루지 않는 선택";
  return toneHint;
}

function pickDomainExample(scores: Record<string, number> | undefined): string {
  const s = scores ?? {};
  const weakest = [
    { key: "career", label: "사업·계약" },
    { key: "wealth", label: "돈·투자" },
    { key: "love", label: "연애·관계" },
  ].sort((a, b) => (s[a.key] ?? 60) - (s[b.key] ?? 60))[0];
  return weakest?.label ?? "중요한 결정";
}

function getSipsinExpert(sipsin: string) {
  const base = SIPSIN_EXPERT[sipsin];
  if (base) return base;
  return {
    meaning: SIPSIN_DICT[sipsin]?.title ?? "오늘의 기운",
    plain:
      SIPSIN_DICT[sipsin]?.desc ??
      `${sipsin}은 오늘 일진과 맞물려 하루의 선택 방향을 바꿉니다.`,
    flow: "무리한 확장보다 확인·정리가 먼저인 흐름이에요.",
    reality: SIPSIN_EXPERT["정관"].reality,
  };
}

/** 4단계 명리 해설 가이드 */
export function buildTodayExpertBasisGuide(
  result: TodayApiResult,
  report: DailyFortuneContent,
): TodayExpertBasisGuide | null {
  const sipsin = result.todaySipsin?.trim();
  if (!sipsin) return null;

  const expert = getSipsinExpert(sipsin);
  const jiSipsin = result.todayJiSipsin?.trim();
  const jiLine = jiSipsin && jiSipsin !== sipsin
    ? `땅의 기운(지지)에는 ${jiSipsin}도 겹쳐서, ${SIPSIN_EXPERT[jiSipsin]?.meaning ?? "보조 기운"}이 더해져요.`
    : "";

  const step1Paragraphs = [
    `지금은 ${sipsin} 기운이 꽤 강하게 돌고 있어요.`,
    `${sipsin}은 ${expert.meaning}을 뜻해요. ${expert.plain}`,
    `그래서 ${expert.flow}${jiLine ? ` ${jiLine}` : ""}`,
  ].filter(Boolean);

  const step2Bullets = [...expert.reality];
  if (result.sajuTriggers?.[0]?.explanation) {
    const short = result.sajuTriggers[0].explanation.replace(/\s+/g, " ").slice(0, 80);
    if (short.length > 12) {
      step2Bullets.push(`명리적으로는 ${short}… 같은 신호도 함께 읽힙니다.`);
    }
  }

  const theme = pickAdviceTheme(result, report);
  const domain = pickDomainExample(result.scores);
  const step3Paragraphs = [
    `오늘 ${domain}에서 「${theme}」 조언이 나온 이유는요.`,
    `${sipsin} 기운이 강하게 들어오면서 ${expert.flow.replace(/^오늘은\s*/, "").replace(/입니다\.?$/, "이에요.")}`,
    `운명비서는 점만 찍지 않고, 그래서 현실에서 어떻게 움직이면 좋을지까지 이어서 말해요.`,
  ];

  const ohaeng = resolveOhaengCount(result);
  const { strong, weak, strongNote, weakNote } = pickStrongWeakOhaeng(ohaeng);
  const yongsinNote =
    weak !== "—"
      ? `균형을 위해 ${weak} 기운을 채우는 쪽(색·음식·휴식)이 도움이 돼요.`
      : "";

  const rows: TodayExpertBasisTableRow[] = [
    { label: "일간", value: parseDayMaster(result), note: "나를 뜻하는 핵심 기준" },
    { label: "오늘의 핵심 기운", value: sipsin, note: result.sipsinTitle ?? SIPSIN_DICT[sipsin]?.title },
    { label: "천간 십성", value: sipsin, note: "하늘(천)의 오늘 작용" },
    {
      label: "지지 십성",
      value: jiSipsin ?? "—",
      note: jiSipsin ? "땅(지)에서 보조하는 작용" : undefined,
    },
    { label: "강한 오행", value: strong, note: strongNote || undefined },
    { label: "보완 오행", value: weak, note: weakNote || yongsinNote || undefined },
    {
      label: "오늘 천간·지지",
      value: [result.todayGan, result.todayJi].filter(Boolean).join(" · ") || "—",
      note: "오늘 일진",
    },
  ];

  if (result.pillars?.day) {
    rows.push({ label: "일주", value: result.pillars.day, note: "타고난 기본 격" });
  }

  return {
    step1: {
      title: "1. 오늘 작동하는 핵심 기운",
      paragraphs: step1Paragraphs.map(applySecretaryVoice),
    },
    step2: {
      title: "2. 이 기운이 현실에서 어떻게 나타날까?",
      bullets: step2Bullets.map(applySecretaryVoice),
    },
    step3: {
      title: "3. 그래서 운명비서는 이렇게 해석했어요",
      paragraphs: step3Paragraphs.map(applySecretaryVoice),
    },
    step4: { title: "4. 명리 요약", rows },
  };
}
