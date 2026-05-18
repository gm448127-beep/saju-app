// 운명비서 캐릭터 타이틀 50선
// 사주 일주 + 십성 조합에 따라 자동 매칭됩니다

export type Character = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  matchKey: string; // 매칭 키 (일주 + 십성 강함)
};

export const CHARACTERS: Character[] = [
  // 🌳 갑목(甲木) 계열 — 큰 나무형
  {
    id: "gap-mok-1",
    emoji: "🌳",
    title: "곧게 자란 큰 나무형",
    description: "흔들림 없이 자기 길을 가는, 신뢰의 사람",
    matchKey: "갑목+비견",
  },
  {
    id: "gap-mok-2",
    emoji: "🌲",
    title: "하늘로 뻗는 소나무형",
    description: "한번 결심하면 끝까지 가는 추진가",
    matchKey: "갑목+편관",
  },
  {
    id: "gap-mok-3",
    emoji: "🎤",
    title: "표현하는 큰 나무형",
    description: "곧고 단단하지만, 말과 글로 마음을 펼치는 사람",
    matchKey: "갑목+상관",
  },
  {
    id: "gap-mok-4",
    emoji: "📚",
    title: "지혜를 품은 거목형",
    description: "깊이 공부하고 천천히 가르치는 어른형",
    matchKey: "갑목+정인",
  },
  {
    id: "gap-mok-5",
    emoji: "🦁",
    title: "숲의 리더형",
    description: "동료와 함께 큰 그림을 그리는 카리스마",
    matchKey: "갑목+겁재",
  },

  // 🌿 을목(乙木) 계열 — 들풀·꽃형
  {
    id: "eul-mok-1",
    emoji: "🌿",
    title: "바람결의 들풀형",
    description: "유연하고 적응력 좋은, 어디서나 살아남는 사람",
    matchKey: "을목+식상",
  },
  {
    id: "eul-mok-2",
    emoji: "🌸",
    title: "활짝 피는 봄꽃형",
    description: "다정하고 매력적인, 인기 많은 사람",
    matchKey: "을목+도화",
  },
  {
    id: "eul-mok-3",
    emoji: "🍀",
    title: "부드러운 덩굴형",
    description: "곁에 있는 사람을 감싸 안는 다정한 사람",
    matchKey: "을목+정인",
  },
  {
    id: "eul-mok-4",
    emoji: "🌷",
    title: "섬세한 꽃잎형",
    description: "감각이 예민하고 흐름을 읽는 직관가",
    matchKey: "을목+편인",
  },
  {
    id: "eul-mok-5",
    emoji: "🌱",
    title: "끈질긴 들풀형",
    description: "부드럽지만 절대 꺾이지 않는 인내의 사람",
    matchKey: "을목+비견",
  },  // ☀️ 병화(丙火) 계열 — 태양형
  {
    id: "byeong-hwa-1",
    emoji: "☀️",
    title: "모두를 비추는 태양형",
    description: "밝고 환한 에너지로 주변을 데우는 사람",
    matchKey: "병화+식상",
  },
  {
    id: "byeong-hwa-2",
    emoji: "🔆",
    title: "무대 위의 스포트라이트형",
    description: "카리스마로 시선을 끄는, 빛나는 사람",
    matchKey: "병화+상관",
  },
  {
    id: "byeong-hwa-3",
    emoji: "🌅",
    title: "새벽을 여는 빛형",
    description: "새로운 시작을 만드는 추진가",
    matchKey: "병화+편관",
  },
  {
    id: "byeong-hwa-4",
    emoji: "🌞",
    title: "든든한 한낮의 빛형",
    description: "변함없이 책임지는 신뢰의 사람",
    matchKey: "병화+정관",
  },
  {
    id: "byeong-hwa-5",
    emoji: "✨",
    title: "창의의 빛형",
    description: "독창적인 아이디어로 세상을 비추는 사람",
    matchKey: "병화+편인",
  },

  // 🕯 정화(丁火) 계열 — 촛불·등불형
  {
    id: "jeong-hwa-1",
    emoji: "🕯",
    title: "따뜻한 촛불형",
    description: "은은하게 주변을 데우는, 다정한 사람",
    matchKey: "정화+정인",
  },
  {
    id: "jeong-hwa-2",
    emoji: "🪔",
    title: "밤하늘의 등불형",
    description: "누군가의 길잡이가 되는, 깊이 있는 사람",
    matchKey: "정화+천문성",
  },
  {
    id: "jeong-hwa-3",
    emoji: "🎨",
    title: "영감의 불꽃형",
    description: "예술적 감각이 살아있는, 섬세한 표현가",
    matchKey: "정화+상관",
  },
  {
    id: "jeong-hwa-4",
    emoji: "🔮",
    title: "신비의 빛형",
    description: "직관과 통찰이 남다른, 점성가형",
    matchKey: "정화+편인",
  },
  {
    id: "jeong-hwa-5",
    emoji: "🌌",
    title: "별빛 같은 사람형",
    description: "조용하지만 깊이 있는 매력의 사람",
    matchKey: "정화+인성",
  },

  // 🏔 무토(戊土) 계열 — 큰 산형
  {
    id: "mu-to-1",
    emoji: "🏔",
    title: "묵직한 큰 산형",
    description: "변하지 않는 신뢰의 기둥 같은 사람",
    matchKey: "무토+정관",
  },
  {
    id: "mu-to-2",
    emoji: "🗻",
    title: "흔들리지 않는 대지형",
    description: "어떤 상황에서도 단단한 중심을 가진 사람",
    matchKey: "무토+비견",
  },
  {
    id: "mu-to-3",
    emoji: "🏛",
    title: "신뢰의 기둥형",
    description: "책임감 강하고 명예를 중시하는 사람",
    matchKey: "무토+정관강",
  },
  {
    id: "mu-to-4",
    emoji: "🛡",
    title: "든든한 보호자형",
    description: "곁에 있는 사람을 끝까지 지키는 사람",
    matchKey: "무토+편관",
  },
  {
    id: "mu-to-5",
    emoji: "🏞",
    title: "고요한 분지형",
    description: "깊이 생각하고 천천히 결정하는 사람",
    matchKey: "무토+인성",
  },

  // 🌾 기토(己土) 계열 — 정원·논밭형
  {
    id: "gi-to-1",
    emoji: "🌾",
    title: "따뜻한 정원지기형",
    description: "사람을 품고 키우는, 깊이 있는 배려가 매력",
    matchKey: "기토+정인",
  },
  {
    id: "gi-to-2",
    emoji: "🌱",
    title: "촉촉한 논밭형",
    description: "누군가를 자라게 하는, 헌신적인 사람",
    matchKey: "기토+식신",
  },
  {
    id: "gi-to-3",
    emoji: "💝",
    title: "다정한 흙형",
    description: "마음이 따뜻해 신뢰받기 쉬운, 진심형",
    matchKey: "기토+편관",
  },
  {
    id: "gi-to-4",
    emoji: "🌷",
    title: "꽃을 피우는 흙형",
    description: "재능을 결실로 바꾸는, 차근차근형",
    matchKey: "기토+식상생재",
  },
  {
    id: "gi-to-5",
    emoji: "🎁",
    title: "숨겨진 보물의 땅형",
    description: "시간이 흐를수록 깊어지는 매력의 사람",
    matchKey: "기토+재고",
  },

  // ⚔️ 경금(庚金) 계열 — 강철·도구형
  {
    id: "gyeong-geum-1",
    emoji: "⚔️",
    title: "단단한 강철형",
    description: "결단력 있고 추진력 강한, 리더형",
    matchKey: "경금+편관",
  },
  {
    id: "gyeong-geum-2",
    emoji: "🔨",
    title: "잘 벼린 도구형",
    description: "정확하고 효율적인, 프로페셔널형",
    matchKey: "경금+정재",
  },
  {
    id: "gyeong-geum-3",
    emoji: "🐅",
    title: "호랑이 같은 추진가형",
    description: "도전과 돌파의 카리스마형",
    matchKey: "경금+백호살",
  },
  {
    id: "gyeong-geum-4",
    emoji: "⚡",
    title: "번개 같은 결단가형",
    description: "빠르게 판단하고 즉시 움직이는 사람",
    matchKey: "경금+양인살",
  },
  {
    id: "gyeong-geum-5",
    emoji: "🛠",
    title: "장인의 손길형",
    description: "묵묵히 자기 분야를 갈고닦는 전문가",
    matchKey: "경금+식신",
  },

  // 💎 신금(辛金) 계열 — 보석·은빛형
  {
    id: "sin-geum-1",
    emoji: "💎",
    title: "귀한 보석형",
    description: "세련되고 가치 있는, 자존감 높은 사람",
    matchKey: "신금+정재",
  },
  {
    id: "sin-geum-2",
    emoji: "✨",
    title: "빛나는 은빛형",
    description: "깔끔하고 단정한, 정제된 매력의 사람",
    matchKey: "신금+정관",
  },
  {
    id: "sin-geum-3",
    emoji: "🌟",
    title: "섬세한 칼끝형",
    description: "정확하고 예리한 감각의 분석가",
    matchKey: "신금+상관",
  },
  {
    id: "sin-geum-4",
    emoji: "💫",
    title: "고요한 별빛형",
    description: "조용하지만 단단한 내면의 사람",
    matchKey: "신금+인성",
  },
  {
    id: "sin-geum-5",
    emoji: "🔍",
    title: "날카로운 통찰가형",
    description: "본질을 꿰뚫는, 디테일의 사람",
    matchKey: "신금+편인",
  },

  // 🌊 임수(壬水) 계열 — 바다·강형
  {
    id: "im-su-1",
    emoji: "🌊",
    title: "넓은 바다형",
    description: "포용력 깊고 지혜로운, 큰 그릇의 사람",
    matchKey: "임수+식상",
  },
  {
    id: "im-su-2",
    emoji: "🏞",
    title: "큰 강의 흐름형",
    description: "멀리 보고 흐르는, 비전형 사람",
    matchKey: "임수+편재",
  },
  {
    id: "im-su-3",
    emoji: "🌌",
    title: "깊이 있는 호수형",
    description: "조용하지만 모든 것을 담아내는 통찰가",
    matchKey: "임수+정인",
  },
  {
    id: "im-su-4",
    emoji: "🐋",
    title: "거대한 흐름의 사람형",
    description: "큰 판을 읽고 움직이는, 전략가형",
    matchKey: "임수+편관",
  },
  {
    id: "im-su-5",
    emoji: "🎭",
    title: "유연한 물결형",
    description: "어떤 상황도 자연스럽게 적응하는 사람",
    matchKey: "임수+상관",
  },

  // 💧 계수(癸水) 계열 — 이슬·비형
  {
    id: "gye-su-1",
    emoji: "💧",
    title: "새벽 이슬형",
    description: "섬세하고 직관 좋은, 영감 가득한 사람",
    matchKey: "계수+편인",
  },
  {
    id: "gye-su-2",
    emoji: "🌧",
    title: "부드러운 비형",
    description: "조용히 스며드는, 따뜻한 위로형",
    matchKey: "계수+식신",
  },
  {
    id: "gye-su-3",
    emoji: "🌙",
    title: "고요한 한밤형",
    description: "깊이 사유하는, 내면이 풍부한 사람",
    matchKey: "계수+화개살",
  },
  {
    id: "gye-su-4",
    emoji: "🔮",
    title: "신비로운 안개형",
    description: "영감과 직관이 빛나는, 예술가형",
    matchKey: "계수+천문성",
  },
  {
    id: "gye-su-5",
    emoji: "🌫",
    title: "깊은 우물형",
    description: "평소엔 잔잔하지만 진심은 깊은 사람",
    matchKey: "계수+정관",
  },

];
