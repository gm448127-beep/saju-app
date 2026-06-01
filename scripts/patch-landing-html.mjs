import fs from "fs";
import path from "path";

const base = "c:/Users/user/Downloads/files";
const patches = [
  {
    file: "landing_with_moon.html",
    pairs: [
      ["시간대별 흐름도<br>당신 기준으로 달라집니다", "같은 시간대도<br>당신에겐 다르게 흐립니다"],
      [
        "머무는 자리보다 움직이는 자리에<br>운이 흘러옵니다.",
        "지금 당신은 움직임의 시기예요.<br>새로운 시도를 하기 좋은 때입니다.",
      ],
    ],
  },
  {
    file: "landing_divorced_persona.html",
    pairs: [
      [
        "<div class=\"t\">끌리는 사람을 따라갔어요</div><div class=\"d\">그래서 실패했던 경험이 있어요</div>",
        "<div class=\"t\">감정적으로 끌리는 사람을 선택했어요</div><div class=\"d\">좋았던 기분은 식었고, 남은 건 후회뿐</div>",
      ],
      [
        "<div class=\"t\">지금 나에게 맞는 사람을 봐요</div><div class=\"d\">사주가 그 차이를 알려줘요</div>",
        "<div class=\"t\">당신의 현재 흐름에 맞는 사람을 찾아요</div><div class=\"d\">시간이 갈수록 더 편해지는 관계</div>",
      ],
      [
        "서두르지 않아도 됩니다. 천천히 알아가는 사람이 오래 남아요.",
        "지금은 서두를 때가 아니에요. 차근차근 신뢰를 쌓는 시기입니다.",
      ],
      [
        "서두르지 않아도 됩니다.<br>천천히 알아가는 사람이 오래 남아요.",
        "지금은 서두를 때가 아니에요.<br>차근차근 신뢰를 쌓는 시기입니다.",
      ],
    ],
  },
  {
    file: "landing_decision_persona.html",
    pairs: [
      [
        "<div class=\"t\">둘 다 괜찮은데 뭘 골라야 하지?</div><div class=\"d\">이렇게 고민하다 기회를 놓칠 수 있어요</div>",
        "<div class=\"t\">두 길 다 맞는 것 같은데...</div><div class=\"d\">고민만 하다 기회를 놓칠 수 있어요</div>",
      ],
      [
        "<div class=\"t\">지금의 나에게는 어느 쪽이 맞아?</div><div class=\"d\">사주가 그 답을 보여줍니다</div>",
        "<div class=\"t\">지금의 나에게는 명확한 답이 있어요</div><div class=\"d\">사주가 그 신호를 보여줍니다</div>",
      ],
      [
        "빠른 결정보다는 확신 있는 결정을 선호하시는 타입이에요. 지금이 그 때입니다.",
        "당신은 신중함을 중시합니다. 지금이 확신 있게 결정하기 좋은 때예요.",
      ],
      [
        "빠른 결정보다는 확신 있는 결정을<br>선호하시는 타입이에요. 지금이 그 때입니다.",
        "당신은 신중함을 중시합니다.<br>지금이 확신 있게 결정하기 좋은 때예요.",
      ],
    ],
  },
];

for (const { file, pairs } of patches) {
  const fp = path.join(base, file);
  let t = fs.readFileSync(fp, "utf8");
  for (const [from, to] of pairs) {
    if (!t.includes(from)) console.warn("skip (not found):", file, from.slice(0, 40));
    else t = t.replace(from, to);
  }
  // decision WHY body shorten
  if (file === "landing_decision_persona.html") {
    const oldBody =
      /사주의 대운과 시주를 보면[\s\S]*?사주는 당신의 '지금'을 읽어줘요\./;
    const newBody =
      "선택지들이 똑같이 좋아 보일 때, 사주는 당신의 지금 흐름이 어느 쪽으로 향하는지 보여줍니다.";
    if (oldBody.test(t)) t = t.replace(oldBody, newBody);
    else console.warn("decision body block not found");
  }
  fs.writeFileSync(fp, t, "utf8");
  console.log("patched", file);
}
