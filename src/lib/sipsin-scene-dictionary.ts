/**
 * 십성 × 5축 장면 사전 — 헌법 v3.0
 * @see docs/content-constitution-3.0.md
 * 성격 진단이 아니라 행동·선택·장면 데이터
 */

export type SipsinFiveAxisScenes = {
  relationship: string;
  work: string;
  money: string;
  choice: string;
  emotion: string;
};

export type SipsinStressPattern = {
  trigger: string;
  scene: string;
};

export type SipsinSuggestion = {
  title: string;
  action: string;
  reason: string;
};

export const SIPSIN_NAMES = [
  "비견",
  "겁재",
  "식신",
  "상관",
  "편재",
  "정재",
  "편관",
  "정관",
  "편인",
  "정인",
] as const;

export type SipsinName = (typeof SIPSIN_NAMES)[number];

export type SipsinAxisKey = keyof SipsinFiveAxisScenes;

export type SipsinScenePack = {
  scenes: SipsinFiveAxisScenes;
  stressPattern: SipsinStressPattern;
  suggestion: SipsinSuggestion;
};

/** v3 금지어 — 사전 전체 스캔용 */
export const SIPSIN_DICTIONARY_FORBIDDEN = [
  "강하다",
  "약하다",
  "강합니다",
  "약합니다",
  "리더십",
  "표현력",
  "창의력",
  "신중함",
  "책임감",
  "완벽주의",
  "조심하세요",
  "신중하세요",
  "침착하세요",
] as const;

export const SIPSIN_SCENE_DICTIONARY: Record<SipsinName, SipsinScenePack> = {
  비견: {
    scenes: {
      relationship:
        "연락에서 ‘내 말이 맞는데’가 먼저 떠오르고, 상대가 다르게 말하면 바로 따지고 싶어지는 날이 있어요.",
      work:
        "회의에서 내안이 먼저 나오고, 끝나고 나서 ‘혼자 다시 정리할 걸’ 하며 노트를 여는 장면이 반복될 수 있어요.",
      money:
        "공동 지출에서 영수증을 나누는 순간, 내가 더 냈다고 느껴지면 표정이 굳어지기 쉬워요.",
      choice:
        "선택할 때 남 의견을 듣기 전에 이미 방향을 잡아 두고, 나중에 조율이 필요해지는 흐름이 있어요.",
      emotion:
        "인정받지 못했다고 느끼면, 말은 줄고 몸이 먼저 답답해지는 순간이 올 수 있어요.",
    },
    stressPattern: {
      trigger: "주도권이 흔들릴 때",
      scene: "「왜 내 말이 안 통하지」라고 혼자 중얼거리는 순간",
    },
    suggestion: {
      title: "말하기 전 한 줄 적기",
      action: "보내기 전에 ‘상대가 듣기 쉬운 말’로 바꿀 한 줄만 적어 보세요.",
      reason: "비견 — 내 기준이 먼저 나올 때",
    },
  },
  겁재: {
    scenes: {
      relationship:
        "친한 사람과 같은 일을 하면, 누가 먼저 했다고 따지고 싶어지거나 연락을 줄이는 날이 있어요.",
      work:
        "프로젝트가 갈라지면, 내 쪽만 끝까지 붙잡다가 손이 두 갈래로 나가는 장면이 나올 수 있어요.",
      money:
        "같이 쓴 돈에서 ‘내가 더 냈다’가 쌓이면, 다음 약속부터 계산이 먼저 나오기 쉬워요.",
      choice:
        "빠르게 예라고 말했다가, 밤에 ‘그때 다른 선택이었는데’ 하고 다시 뒤집는 날이 있어요.",
      emotion:
        "불공평하다고 느끼면, 한 번에 말이 세게 나가고 나서 후회하는 패턴이 반복될 수 있어요.",
    },
    stressPattern: {
      trigger: "손해·밀림이 겹칠 때",
      scene: "「이번만 참자」가 쌓이다가 한 번에 터지는 순간",
    },
    suggestion: {
      title: "돈·역할 숫자로 적기",
      action: "같이 쓰는 돈이나 역할은 말로만 하지 말고, 메모 한 줄로 맞춰 보세요.",
      reason: "겁재 — 나눔·경계가 흔들릴 때",
    },
  },
  식신: {
    scenes: {
      relationship:
        "말보다 밥 한 끼·짧은 안부·도와준 일로 마음을 보이고, 상대는 그걸로 안심하는 장면이 있어요.",
      work:
        "오늘 굴러가게 만드는 손으로 풀고, 미루던 체크리스트를 하나씩 지우는 날이 반복될 수 있어요.",
      money:
        "생활비·먹는 것·당장 필요한 것 쪽으로 손이 먼저 가고, 큰 결정은 나중으로 미루기 쉬워요.",
      choice:
        "「일단 해보자」로 시작하고, 하다 보면 방향이 보이는 쪽으로 움직이기 쉬워요.",
      emotion:
        "밥·잠·쉬는 시간이 밀리면, 일은 되는데 마음만 비는 날이 올 수 있어요.",
    },
    stressPattern: {
      trigger: "루틴이 깨질 때",
      scene: "「밥은 나중에」가 쌓이다가 몸이 먼저 예민해지는 순간",
    },
    suggestion: {
      title: "오늘 하나만 끝내기",
      action: "여러 갈래 중 ‘오늘 손댈 하나’만 정하고, 나머지는 목록에만 남겨 두세요.",
      reason: "식신 — 손으로 풀 때 흐름이 열릴 때",
    },
  },
  상관: {
    scenes: {
      relationship:
        "답장을 보내고도 다시 읽고, ‘이 말투 괜찮나’ 하며 수정하는 장면이 반복될 수 있어요.",
      work:
        "기존 방식이 맞지 않다고 느끼면, 중간에 절차나 문서를 바꾸고 싶어져서 일정이 늘어나기 쉬워요.",
      money:
        "조건이 마음에 안 들면, 계약서·견적을 다시 열어보고 말로 바로 짚는 날이 있어요.",
      choice:
        "확신이 서면 빠르게 말하고 움직이고, 주변은 ‘벌써 결정했어?’ 하고 놀라기도 해요.",
      emotion:
        "막히면 말이 앞서가고, 나중에 ‘그때 왜 그렇게 말했지’ 하고 돌아보는 날이 있어요.",
    },
    stressPattern: {
      trigger: "막히거나 통제받을 때",
      scene: "「왜 이렇게까지 해야 하지」라고 말이 앞서는 순간",
    },
    suggestion: {
      title: "보내기 전 30초 멈추기",
      action: "말이나 메시지를 보내기 전에, 상대 입장에서 한 번만 읽어 보세요.",
      reason: "상관 — 말이 앞서갈 때",
    },
  },
  편재: {
    scenes: {
      relationship:
        "새로운 사람·연락·제안이 오면, 기존 관계보다 그쪽에 먼저 관심이 가는 날이 있어요.",
      work:
        "일을 여러 갈래로 잡다가, 어느 것도 마무리가 안 된 채로 주말이 지나가는 장면이 나올 수 있어요.",
      money:
        "들어올 만한 길을 넓히려다, 지출도 같이 늘고 통장을 자주 여는 날이 반복될 수 있어요.",
      choice:
        "「지금이 기회」라고 느끼면, 확인 전에 손이 먼저 움직이기 쉬워요.",
      emotion:
        "지루하면 바꾸고 싶어지고, 같은 일을 오래 하면 손이 다른 일로 가기 쉬워요.",
    },
    stressPattern: {
      trigger: "수입·기회가 불안할 때",
      scene: "여러 갈래를 동시에 잡다가 어느 것도 끝나지 않는 저녁",
    },
    suggestion: {
      title: "이번 주 마감 하나만",
      action: "새 제안은 적어 두고, 이번 주에 끝낼 하나만 먼저 정하세요.",
      reason: "편재 — 손이 분산될 때",
    },
  },
  정재: {
    scenes: {
      relationship:
        "약속·역할·연락 주기를 맞추려고, ‘우리 이렇게 하기로 했지’ 하고 다시 확인하는 날이 있어요.",
      work:
        "꾸준히 쌓는 쪽이 편하고, 갑작스런 방향 전환은 일정표를 다시 짜야 해서 부담이 될 수 있어요.",
      money:
        "고정비·저축·생활비를 먼저 맞추고, 그다음에 쓸 돈을 정하는 흐름이 반복될 수 있어요.",
      choice:
        "결정 직전에 숫자·날짜를 한 번 더 보고, ‘이 정도면 되겠지’보다 확인이 먼저 나올 수 있어요.",
      emotion:
        "불확실하면 몸을 단단히 잡으려 하고, 잠·식사 리듬을 지키려는 날이 늘어날 수 있어요.",
    },
    stressPattern: {
      trigger: "계획이 어긋날 때",
      scene: "「이번 달은 이렇게 맞춰놨는데」가 흔들리는 순간",
    },
    suggestion: {
      title: "고정비 한 줄 점검",
      action: "이번 달 고정비·저축·생활비만 한 줄로 적고, 나머지는 그다음에 보세요.",
      reason: "정재 — 숫자·리듬이 흔들릴 때",
    },
  },
  편관: {
    scenes: {
      relationship:
        "누가 무엇까지 하는지 적혀 있지 않으면, 대화가 길어지고 마음이 먼저 답답해지는 날이 있어요.",
      work:
        "압박이 오면 오히려 속도를 내고, 밤에 혼자 마감을 끌고 가는 장면이 반복될 수 있어요.",
      money:
        "돈이 목표·실적·성과와 묶이면, 숫자가 안 맞을 때 몸이 먼저 긴장하는 날이 있어요.",
      choice:
        "결단이 필요하면 빠르게 자르고, 끝낸 뒤에 ‘너무 빨랐나’ 하고 돌아보기도 해요.",
      emotion:
        "스트레스가 쌓이면 말수가 줄고, 몸·어깨가 먼저 무거워지는 순간이 올 수 있어요.",
    },
    stressPattern: {
      trigger: "통제·평가가 겹칠 때",
      scene: "「또 내가 끝까지 해야 하나」라고 몸이 먼저 답답해지는 순간",
    },
    suggestion: {
      title: "맡을 범위 문장으로 적기",
      action: "‘내가 할 일 / 맡기지 않을 일’을 문장 두 개로 적고 공유해 보세요.",
      reason: "편관 — 범위가 불명확할 때",
    },
  },
  정관: {
    scenes: {
      relationship:
        "관계에서 ‘우린 뭐로 정리하면 돼?’를 먼저 묻고, 애매한 상태를 오래 두지 않으려는 날이 있어요.",
      work:
        "회의가 끝난 뒤 혼자 다시 검토하고, 마감·절차·담당을 메모에 적는 장면이 반복될 수 있어요.",
      money:
        "대가·계약·영수증이 맞는지 확인한 뒤에야 마음이 놓이는 흐름이 있어요.",
      choice:
        "결정 직전에 역할·기준·날짜를 한 번 더 확인하려는 흐름이 반복될 수 있어요.",
      emotion:
        "불공정하다고 느끼면, 그날 밤에 같은 장면이 머릿속을 맴도는 날이 있어요.",
    },
    stressPattern: {
      trigger: "부탁이 겹칠 때",
      scene: "부탁을 거절하고도 마음에 남는 밤",
    },
    suggestion: {
      title: "결정 전 체크 3칸",
      action: "결정 직전에 ‘누가·언제·어디까지’만 적고 시작해 보세요.",
      reason: "정관 — 기준·역할을 맞출 때",
    },
  },
  편인: {
    scenes: {
      relationship:
        "깊은 대화보다 혼자 정리하는 시간이 필요하고, 연락을 미루다 밤에 답장을 쓰는 날이 있어요.",
      work:
        "아이디어·자료·검색이 늘고, 실행은 다음 날로 넘어가는 장면이 반복될 수 있어요.",
      money:
        "당장 쓰기보다 ‘나중에’로 미루고, 통장 앱만 여러 번 열어보는 날이 있어요.",
      choice:
        "확신이 없으면 결정을 미루고, 대신 메모와 검색만 늘어나기 쉬워요.",
      emotion:
        "생각이 많아질수록 몸이 무거워지고, 말하기 전에 혼자 오래 고민하는 날이 반복될 수 있어요.",
    },
    stressPattern: {
      trigger: "정보·감정 과부하",
      scene: "검색·메모만 늘고 실행은 안 되는 저녁",
    },
    suggestion: {
      title: "실행 한 칸만",
      action: "메모는 그대로 두고, ‘오늘 할 실행’ 한 칸만 체크해 보세요.",
      reason: "편인 — 머릿속만 커질 때",
    },
  },
  정인: {
    scenes: {
      relationship:
        "조언·배움·돌봄이 오가는 쪽으로 관계가 묶이고, 상대 일정까지 챙기다 내 일이 밀리는 날이 있어요.",
      work:
        "배우고 정리한 뒤에야 보내기 편하고, 초안을 여러 번 고치는 장면이 반복될 수 있어요.",
      money:
        "교육·자격·장기 준비 쪽으로 손이 가고, 당장 쓸 돈은 줄이려는 흐름이 있어요.",
      choice:
        "‘맞는지’를 여러 번 확인한 뒤에 움직이고, 시작이 늦어지기도 해요.",
      emotion:
        "인정·격려가 있으면 금방 풀리고, 혼자일 때는 다시 무거워지는 날이 있어요.",
    },
    stressPattern: {
      trigger: "준비만 길어질 때",
      scene: "「아직 부족한 것 같아」로 시작을 미루는 반복",
    },
    suggestion: {
      title: "70%면 보내기",
      action: "완벽하지 않아도, ‘지금 버전’을 한 번 보내고 피드백을 받아 보세요.",
      reason: "정인 — 준비가 길어질 때",
    },
  },
};

const DEFAULT_SIPSIN: SipsinName = "식신";

export function isSipsinName(name: string): name is SipsinName {
  return (SIPSIN_NAMES as readonly string[]).includes(name);
}

export function getSipsinScenePack(name: string): SipsinScenePack | null {
  if (!isSipsinName(name)) return null;
  return SIPSIN_SCENE_DICTIONARY[name];
}

/** mainSipsin 1~2개로 5축 장면 조합 (전면 2개 이하, 축별 보정) */
export function buildScenesFromMainSipsin(
  mainSipsin: string[],
): SipsinFiveAxisScenes {
  const primary = mainSipsin[0];
  const secondary = mainSipsin[1];
  const a = getSipsinScenePack(primary ?? DEFAULT_SIPSIN) ?? SIPSIN_SCENE_DICTIONARY[DEFAULT_SIPSIN];
  const b = secondary ? getSipsinScenePack(secondary) : null;

  if (!b) {
    return { ...a.scenes };
  }

  // 2번째 십성: 관계·일 축만 짧게 보정 (문장 덧붙임 최소화)
  return {
    relationship: b.scenes.relationship,
    work: a.scenes.work,
    money: a.scenes.money,
    choice: b.scenes.choice ?? a.scenes.choice,
    emotion: a.scenes.emotion,
  };
}

export function buildStressFromMainSipsin(mainSipsin: string[]): SipsinStressPattern {
  const primary = mainSipsin[0] ?? DEFAULT_SIPSIN;
  const pack = getSipsinScenePack(primary) ?? SIPSIN_SCENE_DICTIONARY[DEFAULT_SIPSIN];
  return pack.stressPattern;
}

export function buildSuggestionsFromMainSipsin(
  mainSipsin: string[],
  extra?: SipsinSuggestion,
): SipsinSuggestion[] {
  const out: SipsinSuggestion[] = [];
  for (const name of mainSipsin.slice(0, 2)) {
    const pack = getSipsinScenePack(name);
    if (pack) out.push(pack.suggestion);
  }
  if (out.length === 0) {
    out.push(SIPSIN_SCENE_DICTIONARY[DEFAULT_SIPSIN].suggestion);
  }
  if (extra) out.push(extra);
  return out.slice(0, 4);
}

/** 십성 분석 한 줄 (work 우선) */
export function buildSipsinSceneLine(sipsinName: string): string {
  const pack = getSipsinScenePack(sipsinName);
  if (!pack) {
    return "원국에서 이 십성이 작용하는 장면은 개별 팩트와 함께 봐야 해요.";
  }
  return pack.scenes.work;
}

/** 사전 전체 금지어 검사 (테스트·CI) */
export function assertDictionaryForbiddenClean(): string[] {
  const blob = JSON.stringify(SIPSIN_SCENE_DICTIONARY);
  return SIPSIN_DICTIONARY_FORBIDDEN.filter((word) => blob.includes(word));
}

/** 10십성 × 5축 완전성 검사 */
export function assertDictionaryCompleteness(): string[] {
  const missing: string[] = [];
  const axes: SipsinAxisKey[] = [
    "relationship",
    "work",
    "money",
    "choice",
    "emotion",
  ];
  for (const name of SIPSIN_NAMES) {
    const pack = SIPSIN_SCENE_DICTIONARY[name];
    for (const axis of axes) {
      if (!pack.scenes[axis]?.trim()) {
        missing.push(`${name}.${axis}`);
      }
    }
    if (!pack.stressPattern.trigger || !pack.stressPattern.scene) {
      missing.push(`${name}.stress`);
    }
    if (!pack.suggestion.title || !pack.suggestion.action) {
      missing.push(`${name}.suggestion`);
    }
  }
  return missing;
}
