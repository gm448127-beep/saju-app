/** SAJU TRIGGER 해설 사전 */

export const SAJU_TRIGGER_INTRO =
  "사주 원국(팔자)과 오늘 일진·올해 연운이 맞물릴 때 생기는 신호입니다. 아래 5가지 트리거가 오늘 운세 점수와 조언에 반영됩니다.";

export const TRIGGER_META: Record<
  number,
  { title: string; subtitle: string; emoji: string }
> = {
  1: {
    emoji: "☀️",
    title: "TRIGGER 1 · 오늘 하늘",
    subtitle: "오늘 일간(天干)이 나에게 주는 십성",
  },
  2: {
    emoji: "🌍",
    title: "TRIGGER 2 · 오늘 땅",
    subtitle: "오늘 일지(地支)가 나에게 주는 십성",
  },
  3: {
    emoji: "⚡",
    title: "TRIGGER 3 · 합·충·형",
    subtitle: "원국과 오늘 일진 사이의 특수 관계",
  },
  4: {
    emoji: "📅",
    title: "TRIGGER 4 · 올해 연운",
    subtitle: "올해 년주가 더하는 큰 흐름",
  },
  5: {
    emoji: "⏰",
    title: "TRIGGER 5 · 시주",
    subtitle: "말년·실행·자녀 방면의 오늘 기운",
  },
};

export const RELATION_PLAIN: Record<
  string,
  { label: string; desc: string; tone: "positive" | "negative" | "neutral"; action: string }
> = {
  육합: {
    label: "육합(六合)",
    desc: "두 지지가 서로 끌어당겨 조화롭게 흐릅니다.",
    tone: "positive",
    action: "협력·화해·만남을 적극적으로 잡아보세요.",
  },
  삼합: {
    label: "삼합(三合)",
    desc: "세 지지가 모여 강한 결속의 기운을 만듭니다.",
    tone: "positive",
    action: "팀·동업·큰 그림의 일에 유리합니다.",
  },
  방합: {
    label: "방합(方合)",
    desc: "같은 방향의 오행이 힘을 모읍니다.",
    tone: "positive",
    action: "한 가지 목표에 집중하면 성과가 큽니다.",
  },
  육충: {
    label: "육충(六沖)",
    desc: "정반대 기운이 부딪혀 변화·충돌이 생기기 쉽습니다.",
    tone: "negative",
    action: "급한 결정·이동·말다툼은 한 박자 늦추세요.",
  },
  형: {
    label: "형(刑)",
    desc: "마찰·시비·불편한 긴장이 생길 수 있습니다.",
    tone: "negative",
    action: "법적·계약·인간관계에서 예의를 지키세요.",
  },
  자형: {
    label: "자형(自刑)",
    desc: "스스로를 괴롭히는 반복·집착 패턴이 나타날 수 있습니다.",
    tone: "negative",
    action: "완벽주의·집착을 내려놓고 휴식하세요.",
  },
  해: {
    label: "해(害)",
    desc: "겉으로 드러나지 않는 은근한 갈등 신호입니다.",
    tone: "negative",
    action: "오해가 생기기 쉬우니 말과 메시지를 부드럽게.",
  },
  파: {
    label: "파(破)",
    desc: "작은 균열·일정 변경·소소한 방해가 올 수 있습니다.",
    tone: "negative",
    action: "Plan B를 준비하고 유연하게 대처하세요.",
  },
  천간합: {
    label: "천간합(天干合)",
    desc: "하늘 기운이 맞물려 귀인·협력의 에너지가 붙습니다.",
    tone: "positive",
    action: "도움 요청·네트워킹·공동 작업에 좋습니다.",
  },
  천간충: {
    label: "천간충",
    desc: "겉으로 드러나는 갈등·대립 신호입니다.",
    tone: "negative",
    action: "윗사람·외부와의 충돌에 특히 조심하세요.",
  },
};
