/**
 * 월령(월지) 환경 앵커 — 헌법 v3.0
 * @see docs/content-constitution-3.0.md
 * 월령 = 삶의 무대 온도 · 일간 = 그 온도에서 몸의 자세 (일간은 saju-secretary-reading DAY_RESPONSE)
 */

import type { SipsinFiveAxisScenes } from "@/lib/sipsin-scene-dictionary";
import { buildScenesFromMainSipsin } from "@/lib/sipsin-scene-dictionary";

/** 12월령 — 지지(월지) 키 */
export const MONTH_LORD_BRANCHES = [
  "인",
  "묘",
  "진",
  "사",
  "오",
  "미",
  "신",
  "유",
  "술",
  "해",
  "자",
  "축",
] as const;

export type MonthLordBranch = (typeof MONTH_LORD_BRANCHES)[number];

export type MonthLordAnchor = {
  /** 환경 라벨 (짧은 온도 이름) */
  label: string;
  /** 공기·압력 1문장 */
  environment: string;
  relationship: string;
  work: string;
  money: string;
  choice: string;
  emotion: string;
  stressScene: string;
  secretaryLine: string;
};

export const MONTH_LORD_FORBIDDEN = [
  "강하다",
  "약하다",
  "강합니다",
  "약합니다",
  "리더십",
  "표현력",
  "창의력",
  "조심하세요",
  "신중하세요",
  "침착하세요",
  "좋은 운",
  "나쁜 운",
  "대길",
  "흉운",
] as const;

export const MONTH_LORD_ANCHORS: Record<MonthLordBranch, MonthLordAnchor> = {
  인: {
    label: "인월 · 문을 여는 공기",
    environment:
      "인월에는 새 문을 여는 쪽으로 움직임이 먼저 눈에 들어오기 쉬워요. 시작·확장 쪽으로 마음이 기울기 쉽습니다.",
    relationship:
      "관계에서는 먼저 연락하거나 만남을 제안하는 쪽으로 기울기 쉬워요.",
    work:
      "일에서는 미뤄둔 시작을 손대고, 작은 실행으로 길을 여는 장면이 반복될 수 있어요.",
    money:
      "돈에서는 들어갈 항목·나갈 항목을 나누기 전에, ‘이번에 움직일 한 가지’가 먼저 보이기 쉬워요.",
    choice:
      "선택에서는 ‘지금 열어볼까’ 쪽으로 손이 먼저 가고, 나중에 속도를 맞추려는 흐름이 있어요.",
    emotion:
      "감정에서는 설렘과 불안이 같이 오고, 몸이 먼저 움직이려는 날이 있을 수 있어요.",
    stressScene: "「아직 준비 덜 됐는데」인데 밀어붙이다가 금방 지치는 순간",
    secretaryLine:
      "이번 달은 크게 벌리기보다, 문을 여는 실행 하나를 끝까지 가져가 보세요.",
  },
  묘: {
    label: "묘월 · 맞추는 봄바람",
    environment:
      "묘월에는 맞춤·조율 쪽 공기가 먼저 눈에 들어오기 쉬워요. 혼자보다 관계의 결을 맞추는 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 말투·거리·연락 주기를 맞추려는 장면이 잦아질 수 있어요.",
    work:
      "일에서는 협업·피드백·짧은 확인이 늘고, 혼자 끝내기보다 맞추는 시간이 길어질 수 있어요.",
    money:
      "돈에서는 같이 쓰는 돈·나누는 비용을 먼저 맞추려는 흐름이 반복될 수 있어요.",
    choice:
      "선택에서는 상대 입장을 한 번 더 본 뒤에 움직이기 쉬워요.",
    emotion:
      "감정에서는 거절이 어렵고, 맞추다 보면 내 일정이 밀리는 날이 있을 수 있어요.",
    stressScene: "「이 정도면 되겠지」하며 말이 앞서가는 순간",
    secretaryLine:
      "이번 달은 맞추기 전에, 내가 지킬 한 줄 기준을 먼저 적어 보세요.",
  },
  진: {
    label: "진월 · 바꾸기 전 습한 공기",
    environment:
      "진월에는 겉은 잔잔한데 속에서 방향을 바꾸려는 압력이 쌓이기 쉬워요. 정리와 전환이 동시에 눈에 들어옵니다.",
    relationship:
      "관계에서는 역할·약속을 다시 짜려는 대화가 늘어날 수 있어요.",
    work:
      "일에서는 구조를 바꾸거나, 미뤄둔 정리를 한꺼번에 하려는 장면이 나올 수 있어요.",
    money:
      "돈에서는 고정비·구독·자동이체를 다시 보는 쪽으로 손이 가기 쉬워요.",
    choice:
      "선택에서는 ‘지금 바꿀까, 조금 더 볼까’ 사이에서 시간이 길어질 수 있어요.",
    emotion:
      "감정에서는 답답함이 쌓이면 말수가 줄거나, 반대로 한 번에 터뜨리고 싶어질 수 있어요.",
    stressScene: "정리하다가 다른 일이 또 쌓이는 저녁",
    secretaryLine:
      "이번 달은 전환 하나만 정하고, 나머지는 목록에만 남겨 두세요.",
  },
  사: {
    label: "사월 · 속도가 붙는 오후",
    environment:
      "사월에는 보이는 일·말·속도가 빨라지기 쉬워요. 한꺼번에 여러 갈래로 손이 가는 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 연락·약속·대화가 잦아지고, 짧은 확인이 늘어날 수 있어요.",
    work:
      "일에서는 회의·메시지·결정이 연속으로 이어지는 날이 반복될 수 있어요.",
    money:
      "돈에서는 당장 쓰는 항목이 늘고, 나중에 통장을 여는 장면이 잦아질 수 있어요.",
    choice:
      "선택에서는 ‘지금 정해야 한다’는 압박이 먼저 올라오기 쉬워요.",
    emotion:
      "감정에서는 피곤한데 멈추기 어렵고, 잠들기 전에 머리가 또 돌아가는 날이 있어요.",
    stressScene: "알림이 쌓인 채로 우선순위를 못 정하는 순간",
    secretaryLine:
      "이번 달은 오늘 끝낼 하나만 정하고, 나머지 알림은 저녁에만 보세요.",
  },
  오: {
    label: "오월 · 드러나는 한낮",
    environment:
      "오월에는 드러내고 결정하는 쪽으로 흐름이 먼저 눈에 들어오기 쉬워요. 에너지가 앞에 나가기 쉽습니다.",
    relationship:
      "관계에서는 내 입장·내 일정을 먼저 말하는 장면이 늘어날 수 있어요.",
    work:
      "일에서는 결과·마감·공개가 있는 일로 손이 가기 쉬워요.",
    money:
      "돈에서는 보이는 지출·계약·결제가 먼저 처리되는 흐름이 반복될 수 있어요.",
    choice:
      "선택에서는 빠르게 결론을 내고, 뒤처리는 나중으로 미루기 쉬워요.",
    emotion:
      "감정에서는 인정받으면 올라오고, 무시당했다고 느끼면 바로 반응이 나올 수 있어요.",
    stressScene: "말은 했는데 정리가 안 된 채로 주말이 지나가는 날",
    secretaryLine:
      "이번 달은 말하기 전에, 적어 둔 한 줄 근거를 먼저 보여 주세요.",
  },
  미: {
    label: "미월 · 돌보는 늦여름",
    environment:
      "미월에는 돌봄·마무리·정리 쪽으로 마음이 기울기 쉬워요. 남을 챙기다 내 일정이 뒤로 밀리는 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 챙김·안부·실질 도움이 늘고, 내 시간은 줄어드는 장면이 나올 수 있어요.",
    work:
      "일에서는 마무리·인수인계·뒤처리로 손이 가기 쉬워요.",
    money:
      "돈에서는 생활비·돌봄·공동비용 쪽으로 손이 먼저 갈 수 있어요.",
    choice:
      "선택에서는 ‘다른 사람 먼저’가 먼저 나오고, 내 선택은 늦어질 수 있어요.",
    emotion:
      "감정에서는 고맙지만 지친다는 마음이 같이 올라오는 날이 반복될 수 있어요.",
    stressScene: "챙기다가 내 숙제가 밀린 밤",
    secretaryLine:
      "이번 달은 돌봄 전에, 내가 지킬 시간 한 칸을 먼저 예약해 보세요.",
  },
  신: {
    label: "신월 · 기준 잡는 바람",
    environment:
      "신월에는 기준·판단·검증·정리 쪽으로 머리가 먼저 움직이기 쉬워요. 결정 직전 확인이 눈에 들어옵니다.",
    relationship:
      "관계에서는 약속·역할·말한 내용을 다시 맞추려는 장면이 잦아질 수 있어요.",
    work:
      "일에서는 절차·문서·숫자를 맞추는 일로 시간이 가기 쉬워요.",
    money:
      "돈에서는 영수증·계약·대가를 검증한 뒤에야 마음이 놓이는 흐름이 있어요.",
    choice:
      "선택에서는 ‘근거가 있나’를 먼저 보고 움직이기 쉬워요.",
    emotion:
      "감정에서는 불확실하면 몸이 긴장하고, 확인이 끝나면 금방 풀리는 날이 있어요.",
    stressScene: "확인만 늘고 실행은 안 되는 저녁",
    secretaryLine:
      "이번 달은 확인할 것 3가지만 적고, 그다음에 실행하세요.",
  },
  유: {
    label: "유월 · 맞추는 저녁 공기",
    environment:
      "유월에는 말·글·약속·기준을 맞추는 일이 먼저 눈에 들어오기 쉬워요. 검증·정리 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 답장·말투·약속 시간을 다시 맞추려는 장면이 반복될 수 있어요.",
    work:
      "일에서는 문서·발표·계약·검수처럼 ‘맞춤’이 필요한 일이 늘기 쉬워요.",
    money:
      "돈에서는 숫자·조건·영수증을 다시 보는 쪽으로 손이 가기 쉬워요.",
    choice:
      "선택에서는 작은 어긋남이 크게 느껴지고, 한 번 더 확인하려는 흐름이 있어요.",
    emotion:
      "감정에서는 ‘내 말이 맞았는데’가 먼저 떠오르거나, 반대로 ‘내가 너무 했나’가 남을 수 있어요.",
    stressScene: "보낸 메시지를 다시 읽다가 잠이 늦어지는 밤",
    secretaryLine:
      "이번 달은 보내기 전에, 상대가 듣기 쉬운 말로 한 번만 바꿔 보세요.",
  },
  술: {
    label: "술월 · 마감의 황혼",
    environment:
      "술월에는 규칙·마감·경계 쪽으로 몰입하기 쉬워요. 혼자 끝까지 끌고 가는 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 ‘우리 뭐로 정리하면 돼?’가 먼저 나오거나, 애매한 상태를 오래 두지 않으려 해요.",
    work:
      "일에서는 마감·책임 단위로 일을 나누고, 끝까지 가져가려는 장면이 반복될 수 있어요.",
    money:
      "돈에서는 고정 지출·약속·계약을 지키려는 쪽으로 손이 먼저 갈 수 있어요.",
    choice:
      "선택에서는 끝을 정하려는 압박이 먼저 올라오기 쉬워요.",
    emotion:
      "감정에서는 부탁을 거절하고도 마음에 남는 밤이 있을 수 있어요.",
    stressScene: "혼자 다 끌고 가다가 주말에 몸이 먼저 무너지는 순간",
    secretaryLine:
      "이번 달은 맡을 범위를 문장으로 적고, 넘는 일은 미루세요.",
  },
  해: {
    label: "해월 · 깊어지는 밤",
    environment:
      "해월에는 생각·상상·정리가 안으로 깊어지기 쉬워요. 말하기 전에 머릿속에서 돌려보는 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 연락을 미루다 밤에 길게 쓰거나, 혼자 정리하는 시간이 늘 수 있어요.",
    work:
      "일에서는 아이디어·자료·메모가 쌓이고, 실행은 다음 날로 넘어가기 쉬워요.",
    money:
      "돈에서는 ‘나중에 보자’로 미루고, 통장만 여러 번 확인하는 날이 있을 수 있어요.",
    choice:
      "선택에서는 확신이 없으면 결정을 미루고, 대신 검색·메모만 늘어날 수 있어요.",
    emotion:
      "감정에서는 혼자 있을 때 생각이 커지고, 말하면 가벼워지는 날이 반복될 수 있어요.",
    stressScene: "머릿속만 바쁘고 손은 멈춰 있는 저녁",
    secretaryLine:
      "이번 달은 메모는 그대로 두고, 실행 한 칸만 체크해 보세요.",
  },
  자: {
    label: "자월 · 안으로 정리하는 밤",
    environment:
      "자월에는 속도를 늦추고 안에서 정리하려는 흐름이 먼저 눈에 들어오기 쉬워요. 밖보다 안쪽 정리 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 연락을 줄이고, 필요한 말만 남기려는 장면이 나올 수 있어요.",
    work:
      "일에서는 미뤄둔 정리·복기·계획을 손대기 쉬워요.",
    money:
      "돈에서는 통장·구독·고정비를 조용히 점검하는 쪽으로 손이 갈 수 있어요.",
    choice:
      "선택에서는 급하게 결정하기보다, 하루 더 두고 보는 흐름이 있어요.",
    emotion:
      "감정에서는 피곤할 때 말수가 줄고, 혼자만의 시간이 필요해지는 날이 있어요.",
    stressScene: "피곤한데 알림만 보다가 잠이 깨는 밤",
    secretaryLine:
      "이번 달은 밤에 할 일을 줄이고, 아침에 할 하나만 정하세요.",
  },
  축: {
    label: "축월 · 쌓아 두는 땅",
    environment:
      "축월에는 한 번에 크게 움직이기보다, 쌓아 둔 것을 다지고 버티는 쪽으로 에너지가 모이기 쉬워요. 낮은 리스크·누적 쪽으로 기울기 쉽습니다.",
    relationship:
      "관계에서는 오래 본 사람·오래 본 약속을 지키려는 장면이 반복될 수 있어요.",
    work:
      "일에서는 꾸준히 쌓는 일·반복 루틴이 편하고, 급격한 전환은 부담일 수 있어요.",
    money:
      "돈에서는 저축·고정비·생활비를 먼저 맞추고, 큰 지출은 미루는 흐름이 있어요.",
    choice:
      "선택에서는 ‘지금 꼭 필요한가’를 먼저 보고, 천천히 움직이기 쉬워요.",
    emotion:
      "감정에서는 불확실하면 몸을 단단히 잡으려 하고, 익숙한 루틴이 마음을 받쳐 주는 날이 있어요.",
    stressScene: "「이번만 참자」로 버티다가 한 번에 지치는 순간",
    secretaryLine:
      "이번 달은 큰 변화보다, 매일 같은 시간에 하는 작은 루틴 하나를 지켜 보세요.",
  },
};

const DEFAULT_BRANCH: MonthLordBranch = "진";

export function isMonthLordBranch(branch: string): branch is MonthLordBranch {
  return (MONTH_LORD_BRANCHES as readonly string[]).includes(branch);
}

export function getMonthLordAnchor(branch: string): MonthLordAnchor {
  if (isMonthLordBranch(branch)) {
    return MONTH_LORD_ANCHORS[branch];
  }
  return MONTH_LORD_ANCHORS[DEFAULT_BRANCH];
}

/** secretaryReading.environment 블록 */
export function buildEnvironmentFromMonthLord(branch: string): {
  label: string;
  text: string;
} {
  const anchor = getMonthLordAnchor(branch);
  return { label: anchor.label, text: anchor.environment };
}

type AxisKey = keyof Pick<
  MonthLordAnchor,
  "relationship" | "work" | "money" | "choice" | "emotion"
>;

const AXIS_KEYS: AxisKey[] = [
  "relationship",
  "work",
  "money",
  "choice",
  "emotion",
];

/** 월령 5축(바탕) + 십성(행동 보정) */
export function buildScenesFromMonthAndSipsin(
  monthBranch: string,
  mainSipsin: string[],
): SipsinFiveAxisScenes {
  const month = getMonthLordAnchor(monthBranch);
  const sipsin = buildScenesFromMainSipsin(mainSipsin);

  const out = {} as SipsinFiveAxisScenes;
  for (const key of AXIS_KEYS) {
    const base = month[key];
    const correction = sipsin[key];
    out[key] = correction
      ? `${base} ${correction}`
      : base;
  }
  return out;
}

export function buildStressFromMonthLord(monthBranch: string): {
  trigger: string;
  scene: string;
} {
  const month = getMonthLordAnchor(monthBranch);
  return {
    trigger: `${month.label}에서 흔들릴 때`,
    scene: month.stressScene,
  };
}

export function assertMonthLordCompleteness(): string[] {
  const missing: string[] = [];
  const required: (keyof MonthLordAnchor)[] = [
    "label",
    "environment",
    "relationship",
    "work",
    "money",
    "choice",
    "emotion",
    "stressScene",
    "secretaryLine",
  ];
  for (const branch of MONTH_LORD_BRANCHES) {
    const anchor = MONTH_LORD_ANCHORS[branch];
    for (const field of required) {
      const v = anchor[field];
      if (typeof v !== "string" || !v.trim()) {
        missing.push(`${branch}.${field}`);
      }
    }
  }
  return missing;
}

export function assertMonthLordForbiddenClean(): string[] {
  const blob = JSON.stringify(MONTH_LORD_ANCHORS);
  return MONTH_LORD_FORBIDDEN.filter((word) => blob.includes(word));
}
