/**
 * 채팅 API 내장 fallback — 헌법 v3.0
 * @see docs/content-constitution-3.0.md
 */

export type FiveAxis = "relationship" | "work" | "money" | "choice" | "emotion";

export type FallbackContext = {
  element: "" | "목" | "화" | "토" | "금" | "수";
  ddi: string;
  previousAssistant?: string;
};

type AxisCopy = {
  core: string;
  scene: string;
  shaken: string;
  action: string;
  closing: string;
};

const AXIS_COPY: Record<FiveAxis, AxisCopy> = {
  money: {
    core: "지금 질문은 돈·지출·수입을 어떻게 다룰지에 가깝게 읽혀요.",
    scene:
      "「이번엔 괜찮겠지」하고 조건 확인 전에 손이 먼저 움직이거나, 반대로 숫자만 다시 보다가 결정이 미뤄지는 날이 반복될 수 있어요.",
    shaken:
      "흔들릴 때는 ‘놓치면 안 된다’와 ‘잃을까 봐’가 동시에 올라와서, 같은 계좌·같은 대화를 여러 번 여는 선택이 나올 수 있어요.",
    action:
      "오늘은 큰 결정 대신, 이번 주 고정비·현금흐름 숫자 하나만 적어 두고 끝내 보세요.",
    closing:
      "돈 흐름은 한 번에 정리되기보다, 작은 확인이 쌓이면서 안정되는 편이에요. 지금은 그 한 걸음만 해도 충분해요.",
  },
  relationship: {
    core: "지금 질문은 관계·연락·거리·말투 쪽에 가깝게 읽혀요.",
    scene:
      "「이 정도면 되겠지」라고 생각하며 말이 앞서가거나, 답장을 미루다 밤에 ‘왜 내가 먼저 안 했지’가 반복되는 순간이 있을 수 있어요.",
    shaken:
      "흔들릴 때는 상대의 반응을 과하게 해석하거나, 내 감정을 설명하지 않고 거리만 두는 선택이 나올 수 있어요.",
    action:
      "오늘은 긴 대화 대신, 보낼 메시지 한 줄을 적고 한 번 더 읽은 뒤에 보내 보세요.",
    closing:
      "관계는 맞추기보다, 같은 장면이 반복되는지 보는 쪽이 도움이 될 때가 많아요. 지금은 단정하기 어려운 부분도 있을 수 있어요.",
  },
  work: {
    core: "지금 질문은 일·역할·마감·협업 쪽에 가깝게 읽혀요.",
    scene:
      "할 일이 겹치면 우선순위 정리가 늦어지고, ‘일단 내가 한다’로 끝까지 끌고 가다 지치는 패턴이 나올 수 있어요.",
    shaken:
      "흔들릴 때는 범위를 넓히거나, 완벽하게 준비된 뒤에만 시작하려다 속도가 멈추는 선택이 나올 수 있어요.",
    action:
      "오늘은 ‘오늘 끝낼 하나’만 정하고, 나머지는 목록에만 남겨 두세요.",
    closing:
      "일 흐름은 한 번에 바뀌기보다, 범위를 줄였을 때 다시 보이는 편이에요. 지금 상황 전체를 단정하긴 어려워요.",
  },
  choice: {
    core: "지금 질문은 예·아니오·타이밍·방향을 가르는 선택에 가깝게 읽혀요.",
    scene:
      "결정 직전에 같은 자료를 또 열어보거나, ‘조금만 더 알아보자’로 시작만 미뤄지는 날이 반복될 수 있어요.",
    shaken:
      "흔들릴 때는 확신이 서면 빠르게 말하고, 불확실하면 완전히 멈추는 양극단 선택이 나올 수 있어요.",
    action:
      "오늘은 ‘이번에 확인할 것 3가지’만 적고, 그걸 채우면 결정한다고 스스로 정해 보세요.",
    closing:
      "선택은 맞다/틀리다보다, 지금 정보로 감당할 수 있는 크기인지 보는 편이에요. 아직 열린 변수도 있을 수 있어요.",
  },
  emotion: {
    core: "지금 질문은 감정·불안·후회·에너지 쪽에 가깝게 읽혀요.",
    scene:
      "겉으로는 괜찮은데, 혼자 있을 때 같은 생각이 돌거나, 몸이 먼저 무거워지는 날이 반복될 수 있어요.",
    shaken:
      "흔들릴 때는 감정을 설명하지 않고 일만 더 하거나, 반대로 모든 걸 한꺼번에 정리하려는 선택이 나올 수 있어요.",
    action:
      "오늘은 10분만 걷거나, 물 한 잔 마시고 화면을 한 번 끄는 것부터 해 보세요.",
    closing:
      "감정은 바로 풀리기보다, 몸과 리듬이 먼저 돌아오는 경우가 많아요. 지금 느낌 전체를 한 가지로 단정하긴 어려워요.",
  },
};

/** 일간 오행 — 장면 힌트만 (진단·예언 없음) */
const ELEMENT_HINT: Partial<
  Record<NonNullable<FallbackContext["element"]>, Partial<AxisCopy>>
> = {
  목: {
    work: {
      core: "지금 질문은 일·방향을 잡는 쪽인데, 먼저 판을 깔고 싶은 흐름이 섞여 있어요.",
      scene:
        "자료가 덜 모여도 방향을 정하고 움직이기 쉬운 날과, 중간 조율이 길어져 답답해지는 날이 번갈아 나올 수 있어요.",
      shaken: "흔들릴 때는 속도를 더 내거나, 반대로 혼자 끝까지 끌고 가는 선택이 나올 수 있어요.",
      action: "오늘은 ‘누구에게 확인할지’ 한 사람만 정해 보세요.",
      closing: "지금은 시작과 조율 사이에서 리듬을 찾는 쪽에 가까울 수 있어요.",
    },
  },
  화: {
    relationship: {
      scene:
        "말하거나 표현을 시작할 때는 흐름이 열리는데, 속도가 빠르면 상대가 부담스러워할 수 있는 장면이 나올 수 있어요.",
    },
  },
  토: {
    money: {
      scene:
        "고정비·생활비·저축 쪽을 먼저 맞추려다, 다른 지출이 겹치면 손이 분산되는 날이 반복될 수 있어요.",
    },
  },
  금: {
    choice: {
      scene:
        "작은 모순이 보이면 바로 정리하려 하거나, 혼자 다시 검토하는 시간이 길어지는 날이 있을 수 있어요.",
    },
  },
  수: {
    emotion: {
      scene:
        "말하기 전에 머릿속에서 여러 번 거르다, 실행은 늦어지는 패턴이 반복될 수 있어요.",
    },
  },
};

function mergeCopy(base: AxisCopy, patch?: Partial<AxisCopy>): AxisCopy {
  if (!patch) return base;
  return {
    core: patch.core ?? base.core,
    scene: patch.scene ?? base.scene,
    shaken: patch.shaken ?? base.shaken,
    action: patch.action ?? base.action,
    closing: patch.closing ?? base.closing,
  };
}

export function parseChatSajuContext(sajuContext: string): {
  element: FallbackContext["element"];
  ddi: string;
} {
  let element: FallbackContext["element"] = "";
  let ddi = "";
  if (!sajuContext) return { element, ddi };
  const elementMatch = sajuContext.match(/일간:\s*\S+\s*\((\S+),/);
  if (elementMatch?.[1] && ["목", "화", "토", "금", "수"].includes(elementMatch[1])) {
    element = elementMatch[1] as FallbackContext["element"];
  }
  const ddiMatch = sajuContext.match(/띠:\s*(\S+)띠/);
  if (ddiMatch) ddi = ddiMatch[1];
  return { element, ddi };
}

export function classifyFiveAxis(message: string): FiveAxis {
  const msg = message.toLowerCase();

  if (
    /연애|사랑|결혼|이성|소개팅|연인|사귀|남친|여친|애인|썸|헤어|이별|상대|만남|좋아하는|짝사랑|관계|연락|답장/.test(
      msg,
    )
  ) {
    return "relationship";
  }
  if (/재물|돈|재산|투자|수입|지출|가격|월급|대출|저축|부자/.test(msg)) {
    return "money";
  }
  if (
    /직업|취업|이직|승진|커리어|회사|사업|창업|앱|개발|서비스|출시|프로젝트|일|업무|마감/.test(
      msg,
    )
  ) {
    return "work";
  }
  if (
    /건강|아프|병|운동|다이어트|불안|우울|스트레스|감정|후회|힘들|지쳐|번아웃/.test(
      msg,
    )
  ) {
    return "emotion";
  }
  if (
    /선택|결정|할까|될까|맞는|방향|타이밍|이직할|그만둘|고민|어떻게 해|뭐가 나을/.test(
      msg,
    )
  ) {
    return "choice";
  }
  if (/오늘|운세|하루|올해|2025|2026|신년|한해/.test(msg)) {
    return "choice";
  }
  return "choice";
}

const AXIS_LABEL: Record<FiveAxis, string> = {
  relationship: "관계",
  work: "일",
  money: "돈",
  choice: "선택",
  emotion: "감정",
};

function formatV3Reply(copy: AxisCopy, axis: FiveAxis, ctx: FallbackContext): string {
  const intro =
    ctx.element && ctx.ddi
      ? `원국 흐름(일간 ${ctx.element}, ${ctx.ddi}띠)을 참고했어요. 아래는 **${AXIS_LABEL[axis]}** 축에서 읽은 패턴이에요.\n\n`
      : `지금 말씀은 **${AXIS_LABEL[axis]}** 축에서 읽는 편이에요.\n\n`;

  const continuity = ctx.previousAssistant
    ? `\n\n이전에 나눈 이야기도 이어서 보면, 이번 질문과 같은 맥락일 수 있어요.`
    : "";

  return `${intro}**1. 지금 질문의 핵심**\n${copy.core}\n\n**2. 반복될 수 있는 장면**\n${copy.scene}\n\n**3. 흔들릴 때 나타나는 선택**\n${copy.shaken}\n\n**4. 오늘 할 수 있는 작은 행동**\n${copy.action}\n\n**5. 마무리**\n${copy.closing}${continuity}`;
}

function buildAxisReply(axis: FiveAxis, ctx: FallbackContext): string {
  const base = AXIS_COPY[axis];
  const patch =
    ctx.element && ELEMENT_HINT[ctx.element]
      ? ELEMENT_HINT[ctx.element]![axis]
      : undefined;
  return formatV3Reply(mergeCopy(base, patch), axis, ctx);
}

function greetingReply(ctx: FallbackContext): string {
  const known =
    ctx.element && ctx.ddi
      ? `생년월일 정보가 있어요. 일간 ${ctx.element}, ${ctx.ddi}띠 기준으로 대화할 수 있어요.\n\n`
      : "상단에서 **생년월일**을 입력하시면, 원국 팩트를 바탕으로 더 구체적으로 이야기할 수 있어요.\n\n";
  return `안녕하세요. **운명비서**예요. 미래를 맞추기보다, 지금 반복되는 패턴을 함께 읽는 대화예요.\n\n${known}이렇게 물어보실 수 있어요.\n- 연락·관계가 자꾸 신경 쓰일 때\n- 일·마감·역할이 겹칠 때\n- 돈·지출 결정 전에\n- 선택을 미루게 될 때\n- 요즘 감정·에너지가 무너질 때\n\n편하게 한 문장으로 적어 주세요.`;
}

function thanksReply(): string {
  return "도움이 되었다면 다행이에요. 같은 고민이 다시 올라오면, 그때 장면만 짧게 적어 주셔도 이어서 볼 수 있어요.";
}

function needBirthReply(): string {
  return "원국 팩트가 있으면 더 정확히 패턴을 읽을 수 있어요. 상단 **생년월일**을 입력한 뒤, 고민을 한 문장으로 다시 보내 주세요. (관계·일·돈·선택·감정 중 어디에 가까운지 알려주시면 좋아요.)";
}

/**
 * API 키 없음·LLM 실패 시 v3 fallback 응답
 */
export function getChatFallbackV3Response(
  message: string,
  sajuContext: string,
  chatHistory?: Array<{ role: string; content: string }>,
): string {
  const { element, ddi } = parseChatSajuContext(sajuContext);
  const ctx: FallbackContext = {
    element,
    ddi,
    previousAssistant: chatHistory
      ?.slice()
      .reverse()
      .find((item) => item.role === "assistant")
      ?.content?.replace(/\*\*/g, "")
      .slice(0, 200),
  };

  const msg = message.toLowerCase();

  if (/안녕|하이|hello|시작/.test(msg)) {
    return greetingReply(ctx);
  }
  if (/고마|감사|ㄱㅅ|thank/.test(msg)) {
    return thanksReply();
  }

  if (!element && !sajuContext) {
    if (
      /재물|돈|연애|직업|건강|운세|올해/.test(msg) &&
      !/이름|뭐야|누구/.test(msg)
    ) {
      return needBirthReply();
    }
  }

  const axis = classifyFiveAxis(message);
  return buildAxisReply(axis, ctx);
}
