// 운명비서 우리말 풀이 사전
// 한자·전문 용어 → 일상어 변환

// 📜 격국 풀이 사전
export const GYEOK_DICT: Record<string, { title: string; desc: string; emoji: string }> = {
  "정관격": {
    emoji: "🏛",
    title: "책임감 강한 리더형",
    desc: "원칙을 지키고 신뢰받는 사주예요. 안정적인 길에서 큰 그릇을 만들어가요."
  },
  "편관격": {
    emoji: "⚔️",
    title: "추진력 강한 도전가형",
    desc: "어려움을 뚫고 나아가는 강한 의지의 사주예요. 큰일을 해내는 힘이 있어요."
  },
  "정재격": {
    emoji: "💰",
    title: "성실한 재물 관리형",
    desc: "꾸준히 모으고 안정적으로 키우는 사주예요. 신뢰받는 재물 운이 흘러요."
  },
  "편재격": {
    emoji: "💎",
    title: "감각적인 사업가형",
    desc: "기회를 포착하고 큰 흐름을 만드는 사주예요. 큰 재물을 다루는 그릇이에요."
  },
  "식신격": {
    emoji: "🍀",
    title: "여유롭고 따뜻한 표현가형",
    desc: "재능을 자연스럽게 풀어내는 사주예요. 사람을 끌어당기는 매력이 있어요."
  },
  "상관격": {
    emoji: "🎤",
    title: "창의적인 표현·창조형",
    desc: "말과 글, 예술로 빛나는 사주예요. 자기만의 색을 강하게 표현해요."
  },
  "식상격": {
    emoji: "🌿",
    title: "표현하고 창조하는 사주",
    desc: "말·글·재능으로 세상에 자신을 펼치는 기운이 강해요. 표현할수록 빛나요."
  },
  "정인격": {
    emoji: "📚",
    title: "지혜롭고 학구적인 사주",
    desc: "배움과 사유 속에서 깊어지는 사주예요. 가르치고 이끄는 힘이 있어요."
  },
  "편인격": {
    emoji: "🔮",
    title: "직관적인 통찰가형",
    desc: "남다른 감각과 통찰을 가진 사주예요. 보이지 않는 것을 보는 힘이 있어요."
  },
  "비견격": {
    emoji: "🤝",
    title: "독립적이고 자존감 강한 사주",
    desc: "스스로 길을 만드는 사주예요. 동료와 함께할 때 큰 시너지가 나요."
  },
  "겁재격": {
    emoji: "🦁",
    title: "경쟁심 강한 추진가형",
    desc: "도전을 즐기고 빠르게 성취하는 사주예요. 큰 무대에서 빛나요."
  },
};

// 💎 천간 풀이 (이름 + 일상 의미)
export const CHEONGAN_DICT: Record<string, { meaning: string; emoji: string; vibe: string }> = {
  "甲": { emoji: "🌳", meaning: "큰 나무", vibe: "곧고 강한 추진력" },
  "乙": { emoji: "🌿", meaning: "들풀·꽃", vibe: "부드러운 유연함" },
  "丙": { emoji: "☀️", meaning: "태양", vibe: "밝고 활력 넘침" },
  "丁": { emoji: "🕯", meaning: "촛불·등불", vibe: "은은한 영감·통찰" },
  "戊": { emoji: "🏔", meaning: "큰 산", vibe: "묵직한 안정감" },
  "己": { emoji: "🌾", meaning: "정원·논밭", vibe: "따뜻한 베풂" },
  "庚": { emoji: "⚔️", meaning: "강철·도구", vibe: "예리한 결단력" },
  "辛": { emoji: "💎", meaning: "보석", vibe: "세련된 가치" },
  "壬": { emoji: "🌊", meaning: "바다·강", vibe: "넓은 포용력" },
  "癸": { emoji: "💧", meaning: "이슬·비", vibe: "섬세한 직관" },
};


// 💪 강약 풀이 사전
export const STRENGTH_DICT: Record<string, { title: string; desc: string }> = {
  "신강": {
    title: "에너지가 강한 사주",
    desc: "추진력과 자신감이 넘쳐요. 큰 일을 시도할 때 빛나요."
  },
  "신왕": {
    title: "기운이 매우 강한 사주",
    desc: "주도적이고 카리스마 있어요. 적당히 나누면 더 좋아져요."
  },
  "신약": {
    title: "섬세하고 신중한 사주",
    desc: "깊이 생각하고 세심한 면이 있어요. 좋은 사람과 함께할 때 빛나요."
  },
  "극신약": {
    title: "유연하고 부드러운 사주",
    desc: "주변의 도움을 잘 받으며 성장해요. 인복이 강한 사주예요."
  },
  "중화": {
    title: "균형 잡힌 안정적인 사주",
    desc: "강함과 부드러움이 적절히 어우러진 좋은 사주예요. 어떤 상황에도 적응해요."
  },
};

// 🌀 공망 풀이 사전 (지지 → 일상어)
export const GONGMANG_DICT: Record<string, string> = {
  "자": "쥐띠 해", "축": "소띠 해", "인": "호랑이띠 해", "묘": "토끼띠 해",
  "진": "용띠 해", "사": "뱀띠 해", "오": "말띠 해", "미": "양띠 해",
  "신": "원숭이띠 해", "유": "닭띠 해", "술": "개띠 해", "해": "돼지띠 해",
};

// ✨ 길신 풀이 사전
export const GILSIN_DICT: Record<string, { title: string; desc: string; emoji: string }> = {
  "천을귀인": { emoji: "🌟", title: "귀인의 도움", desc: "어려울 때 도와주는 사람이 나타나요" },
  "태극귀인": { emoji: "✨", title: "큰 그릇의 운", desc: "위기를 기회로 바꾸는 힘이 있어요" },
  "문창귀인": { emoji: "📚", title: "학문·예술의 복", desc: "공부와 창작 활동에서 빛나요" },
  "문곡귀인": { emoji: "✍️", title: "글재주의 복", desc: "글과 말로 인정받는 운이에요" },
  "월덕귀인": { emoji: "🌙", title: "어머니의 덕", desc: "여성 인연·인복이 좋아요" },
  "천덕귀인": { emoji: "☀️", title: "하늘의 덕", desc: "전반적인 운이 따뜻하게 흘러요" },
  "복성귀인": { emoji: "🍀", title: "복의 별", desc: "예상치 못한 행운이 찾아와요" },
  "암록귀인": { emoji: "💰", title: "숨은 재물의 복", desc: "보이지 않는 곳에서 도움이 와요" },
  "금여록": { emoji: "💎", title: "재물의 안정", desc: "재물 운이 단단하게 받쳐줘요" },
  "관귀학관": { emoji: "🎓", title: "공직·학문의 복", desc: "공식적인 자리에서 인정받아요" },
  "역마": { emoji: "🚗", title: "이동·변화의 기운", desc: "여행·이주·해외에서 기회가 와요" },
  "도화": { emoji: "🌸", title: "매력의 기운", desc: "인기와 호감이 따라다녀요" },
  "화개": { emoji: "🎨", title: "예술·종교의 복", desc: "감성과 영감이 풍부해요" },
};

// ⚡ 흉신 풀이 사전 (부정→강점 변환)
export const HYUNGSIN_DICT: Record<string, { title: string; desc: string; emoji: string }> = {
  "양인": { emoji: "⚔️", title: "강한 추진력", desc: "결단력이 강해요. 단, 욕심은 조심하세요" },
  "겁살": { emoji: "💪", title: "도전 정신", desc: "어려움을 뚫는 힘이 있어요. 신중함도 함께" },
  "재살": { emoji: "🎯", title: "집중력", desc: "한 가지에 깊이 빠지는 재능, 균형이 중요해요" },
  "천살": { emoji: "🌌", title: "남다른 시야", desc: "큰 그림을 보는 눈이 있어요. 현실도 챙기기" },
  "지살": { emoji: "🚶", title: "이동의 기운", desc: "변화 속에서 성장하는 사주예요" },
  "월살": { emoji: "🌒", title: "신중함", desc: "조심스러운 만큼 실수가 적어요" },
  "망신살": { emoji: "🔍", title: "통찰력", desc: "본질을 꿰뚫는 힘, 단 말은 신중하게" },
  "장성살": { emoji: "🛡", title: "강한 리더십", desc: "이끄는 힘이 있어요. 듣는 귀도 함께" },
  "반안살": { emoji: "🏇", title: "도약의 기운", desc: "큰 도약의 시기가 와요" },
  "역마살": { emoji: "🚗", title: "변화·이동", desc: "활동적인 삶, 안정도 함께 챙겨요" },
  "육해살": { emoji: "🌊", title: "감수성", desc: "마음이 풍부해요. 휴식이 중요해요" },
  "화개살": { emoji: "🎨", title: "예술·영감", desc: "감성과 직관이 빛나는 기운이에요" },
  "백호살": { emoji: "🐅", title: "카리스마", desc: "강한 존재감, 부드러움도 함께" },
  "괴강살": { emoji: "⚡", title: "비범한 기운", desc: "남다른 길을 가는 힘이 있어요" },
  "양착살": { emoji: "🌗", title: "양면의 매력", desc: "독특한 매력의 양면성이 있어요" },
  "음착살": { emoji: "🌓", title: "깊은 내면", desc: "겉과 속이 다른 깊이가 있어요" },
  "홍염살": { emoji: "🌹", title: "강한 매력", desc: "이성에게 인기가 많아요" },
  "공망살": { emoji: "🌀", title: "비움의 지혜", desc: "비울수록 채워지는 사주예요" },
  "급각살": { emoji: "🏃", title: "민첩함", desc: "빠른 판단력, 신중함도 더해요" },
  "곡각살": { emoji: "🦴", title: "끈기", desc: "꺾이지 않는 의지가 있어요" },
  "낙정관살": { emoji: "🕳", title: "조심성", desc: "위험을 미리 보는 눈이 있어요" },
  "원진살": { emoji: "💢", title: "감정의 깊이", desc: "감정에 솔직해요. 표현 방식 조심" },
  "귀문관살": { emoji: "🔮", title: "예민한 직감", desc: "남다른 감각, 휴식이 중요" },
  "탕화살": { emoji: "🔥", title: "열정", desc: "강한 에너지, 균형이 중요해요" },
  "단교관살": { emoji: "🌉", title: "전환의 힘", desc: "새로운 시작을 만드는 운" },
};

// 🔮 십성 풀이 사전 (오늘의 운세·일진 해석용)
export const SIPSIN_DICT: Record<string, { title: string; desc: string; emoji: string }> = {
  "비견": { emoji: "🤝", title: "동료·자립의 날", desc: "나와 같은 기운이 흐릅니다. 협력은 좋지만 경쟁·고집은 조심하세요." },
  "겁재": { emoji: "⚡", title: "경쟁·변동의 날", desc: "예상 밖 지출·경쟁이 생길 수 있어요. 돈·감정 결정은 한 박자 늦추세요." },
  "식신": { emoji: "🍀", title: "표현·풍요의 날", desc: "창작·맛·즐거움이 빛나는 날입니다. 편하게 표현할수록 운이 열려요." },
  "상관": { emoji: "🎤", title: "재능·변화의 날", desc: "아이디어가 샘솟지만 말이 날카로워질 수 있어요. 재능으로 보여주세요." },
  "편재": { emoji: "💎", title: "활동·재물의 날", desc: "돈과 기회가 움직입니다. 적극적으로 움직이되 과욕은 금물이에요." },
  "정재": { emoji: "💰", title: "안정·실리의 날", desc: "꾸준한 노력이 보상받는 날입니다. 계약·저축·정리에 좋아요." },
  "편관": { emoji: "⚔️", title: "도전·압박의 날", desc: "긴장과 책임이 따르지만 성장의 기회입니다. 원칙을 지키세요." },
  "정관": { emoji: "🏛", title: "질서·책임의 날", desc: "공적인 일·면접·약속에 유리합니다. 예의와 신뢰가 핵심이에요." },
  "편인": { emoji: "🔮", title: "영감·학습의 날", desc: "직감과 정보가 살아납니다. 배움은 좋고 의심·변덕은 줄이세요." },
  "정인": { emoji: "📚", title: "인덕·성장의 날", desc: "어른의 도움·자격·공부운이 좋습니다. 감사와 정리가 복을 부릅니다." },
};

// 🌳 오행 풀이 사전
export const OHAENG_DICT: Record<string, {
  emoji: string;
  keywords: string;
  strong: string;
  weak: string;
  color: string;
}> = {
  "목": {
    emoji: "🌳",
    keywords: "성장·발전·인자함",
    strong: "리더십과 추진력이 있습니다",
    weak: "결단력이 약할 수 있습니다",
    color: "#5C8B6F"
  },
  "화": {
    emoji: "🔥",
    keywords: "열정·예의·표현력",
    strong: "활동적이고 밝습니다",
    weak: "소극적일 수 있습니다",
    color: "#B85C4C"
  },
  "토": {
    emoji: "🏔",
    keywords: "신뢰·중재·포용력",
    strong: "안정적이고 듬직합니다",
    weak: "과하면 고집이 셀 수 있습니다",
    color: "#B89968"
  },
  "금": {
    emoji: "⚔️",
    keywords: "결단·의리·정의",
    strong: "완벽주의적이고 책임감이 강합니다",
    weak: "우유부단해질 수 있습니다",
    color: "#9B9591"
  },
  "수": {
    emoji: "💧",
    keywords: "지혜·유연함·창의력",
    strong: "총명하고 직관이 뛰어납니다",
    weak: "과하면 우유부단할 수 있습니다",
    color: "#3D4A5C"
  }
};
