import { NextRequest, NextResponse } from 'next/server';

const DREAM_SYMBOL_GUIDE = [
  {
    keywords: ['물', '바다', '강', '비', '홍수', '파도', '수영'],
    title: '물과 바다',
    meaning: '감정, 흐름, 정화, 재물의 움직임을 뜻합니다. 맑은 물은 마음의 회복과 좋은 기회, 풍성한 물은 재물과 일이 커지는 흐름, 흙탕물이나 거친 파도는 감정 기복과 주변 상황의 압박을 살펴야 하는 신호로 봅니다.',
    advice: '오늘은 기회가 와도 감정적으로 서두르지 말고, 흐름이 맑은지 탁한지 먼저 확인하는 태도가 좋습니다.',
  },
  {
    keywords: ['불', '화재', '타는', '연기', '폭발'],
    title: '불과 화재',
    meaning: '강한 의지, 분노, 변화, 새 출발의 에너지를 뜻합니다. 불이 통제되면 추진력이고, 번지면 감정이나 일이 과열된 신호일 수 있습니다.',
    advice: '하고 싶은 말이나 결정이 있더라도 속도를 조절하면 좋은 결과로 이어집니다.',
  },
  {
    keywords: ['집', '방', '문', '창문', '이사', '아파트'],
    title: '집과 공간',
    meaning: '나의 내면, 가족, 생활 기반, 안정감을 상징합니다. 낯선 집은 새로운 환경을, 어수선한 방은 마음의 정리가 필요한 상태를 보여줍니다.',
    advice: '오늘은 주변 정리나 가족, 가까운 사람과의 대화를 통해 마음의 중심을 잡는 것이 좋습니다.',
  },
  {
    keywords: ['돈', '지갑', '금', '보석', '동전', '복권', '통장'],
    title: '돈과 귀중품',
    meaning: '재물뿐 아니라 자존감, 기회, 인정 욕구를 뜻합니다. 돈을 줍거나 받는 꿈은 기회와 도움, 지갑이 두툼한 꿈은 자원 확보, 돈을 잃는 꿈은 불안이나 가치 판단의 흔들림을 보여줄 수 있습니다.',
    advice: '오늘은 들어오는 제안이나 작은 수익 기회를 가볍게 넘기지 말고, 조건을 확인한 뒤 차분히 잡는 편이 좋습니다.',
  },
  {
    keywords: ['소', '황소', '송아지', '젖소', '검은소', '흰소'],
    title: '소',
    meaning: '소는 재산, 인내, 집안의 기반, 꾸준히 쌓이는 복을 상징합니다. 건강하고 큰 소는 안정적인 재물과 성실한 결실, 송아지는 새롭게 자라는 기회, 소가 달아나거나 아픈 꿈은 관리해야 할 재산과 책임을 뜻할 수 있습니다.',
    advice: '오늘은 단번에 얻는 성과보다 꾸준히 관리해온 일에서 답을 찾는 것이 좋습니다. 계약, 저축, 일의 기본기를 다시 확인해보세요.',
  },
  {
    keywords: ['뱀', '구렁이', '독사'],
    title: '뱀',
    meaning: '직감, 재물, 유혹, 숨은 긴장감을 함께 상징합니다. 뱀이 위협적이면 부담스러운 관계나 불안을, 차분히 지나가면 변화의 신호로 볼 수 있습니다.',
    advice: '겉으로 보이는 말보다 분위기와 직감을 함께 살피되, 의심만으로 관계를 단정하지 마세요.',
  },
  {
    keywords: ['개', '강아지', '고양이', '새', '새끼', '동물'],
    title: '동물',
    meaning: '본능, 보호받고 싶은 마음, 가까운 관계의 감정을 뜻합니다. 순한 동물은 안정감과 호감, 공격적인 동물은 방어심이나 불편한 관계를 보여줍니다.',
    advice: '오늘은 본능적으로 불편한 일과 편안한 일을 구분하고, 무리한 약속은 줄이는 것이 좋습니다.',
  },
  {
    keywords: ['죽은', '죽음', '장례', '무덤', '돌아가신', '조상'],
    title: '죽음과 조상',
    meaning: '실제 불길함보다 끝맺음, 전환, 오래된 감정의 정리를 뜻하는 경우가 많습니다. 돌아가신 분이나 조상이 밝은 표정으로 나오는 꿈은 보호와 조언의 상징, 걱정스러운 표정이나 말이 있는 꿈은 생활 태도와 건강, 가족 문제를 돌아보라는 신호로 볼 수 있습니다.',
    advice: '오늘은 과거의 걱정을 붙잡기보다, 가족과 생활의 기본을 살피고 감사한 마음으로 정리할 것은 정리하는 쪽이 좋습니다.',
  },
  {
    keywords: ['이빨', '치아', '이가', '빠지는', '피'],
    title: '이빨과 신체',
    meaning: '체력, 말, 가족 걱정, 자신감과 관련이 깊습니다. 이가 빠지는 꿈은 몸과 마음의 피로, 말실수에 대한 부담, 가까운 사람에 대한 걱정을 나타낼 수 있습니다.',
    advice: '오늘은 무리한 일정과 날 선 표현을 줄이고, 컨디션을 먼저 챙기는 편이 좋습니다.',
  },
  {
    keywords: ['임신', '아기', '아이', '출산'],
    title: '임신과 아기',
    meaning: '새로운 일, 아이디어, 가능성의 탄생을 뜻합니다. 실제 임신을 단정하기보다 내 안에서 자라고 있는 계획이나 책임을 보여주는 꿈으로 볼 수 있습니다.',
    advice: '아직 완성되지 않은 계획이라도 메모하고 작게 시작하면 좋은 흐름을 만들 수 있습니다.',
  },
  {
    keywords: ['시험', '학교', '지각', '면접', '발표', '회사'],
    title: '시험과 일',
    meaning: '평가받는 느낌, 책임감, 준비 부족에 대한 걱정을 뜻합니다. 실제 실패 예고라기보다 잘하고 싶은 마음이 강할 때 자주 나타납니다.',
    advice: '오늘은 완벽하게 하려 하기보다 체크리스트를 만들고 하나씩 처리하는 방식이 유리합니다.',
  },
  {
    keywords: ['쫓', '도망', '숨는', '괴물', '귀신'],
    title: '쫓김과 도망',
    meaning: '피하고 싶은 일, 미뤄둔 대화, 마음속 압박을 뜻합니다. 무서운 존재는 현실의 특정 사람보다 부담 자체를 상징하는 경우가 많습니다.',
    advice: '오늘은 가장 부담스러운 일을 전부 해결하려 하지 말고, 시작할 수 있는 작은 단계 하나만 정해보세요.',
  },
  {
    keywords: ['떨어', '추락', '높은 곳', '엘리베이터', '계단'],
    title: '높은 곳과 추락',
    meaning: '불안정함, 통제감 상실, 목표에 대한 부담을 뜻합니다. 반대로 높은 곳에 안정적으로 서 있었다면 시야가 넓어지고 있다는 신호로도 볼 수 있습니다.',
    advice: '오늘은 큰 결정을 서두르기보다 안전장치와 대안을 먼저 확인하는 것이 좋습니다.',
  },
  {
    keywords: ['날아', '하늘', '비행기', '구름'],
    title: '하늘과 비행',
    meaning: '자유, 상승, 새로운 시야를 뜻합니다. 기분 좋게 날았다면 확장운, 불안했다면 현실의 부담에서 벗어나고 싶은 마음으로 볼 수 있습니다.',
    advice: '오늘은 시야를 넓히되, 너무 멀리 있는 목표보다 바로 실행할 수 있는 계획을 잡아보세요.',
  },
  {
    keywords: ['결혼', '웨딩', '신부', '신랑', '반지'],
    title: '결혼과 약속',
    meaning: '관계의 변화, 계약, 책임, 중요한 선택을 뜻합니다. 연애뿐 아니라 일이나 삶의 방향에서 새로운 약속을 맺는 흐름으로도 볼 수 있습니다.',
    advice: '오늘은 마음이 앞서기보다 조건과 책임을 함께 확인하는 태도가 필요합니다.',
  },
  {
    keywords: ['화장실', '대변', '소변', '똥'],
    title: '화장실과 배출',
    meaning: '불필요한 감정, 스트레스, 오래된 문제를 밖으로 내보내는 상징입니다. 대변이나 똥이 많이 나오는 꿈은 전통적으로 재물과 막힌 운이 풀리는 신호로 보기도 하며, 화장실을 찾지 못하는 꿈은 해소할 곳을 찾지 못한 답답함을 뜻합니다.',
    advice: '오늘은 쌓아둔 일이나 감정을 정리하면 의외로 홀가분한 전환이 생길 수 있습니다. 돈과 관련된 일은 작게라도 흐름을 열어보세요.',
  },
  {
    keywords: ['길', '차', '버스', '기차', '운전', '역', '공항'],
    title: '길과 이동수단',
    meaning: '인생 방향, 선택지, 이동과 변화의 속도를 뜻합니다. 길을 잃었다면 방향 점검, 순조롭게 이동했다면 계획이 자연스럽게 진행되는 흐름입니다.',
    advice: '오늘은 목적지를 다시 확인하고, 해야 할 일의 순서를 정리하는 것이 좋습니다.',
  },
];

function getMatchedSymbols(dream: string) {
  const normalizedDream = dream.toLowerCase();
  return DREAM_SYMBOL_GUIDE.filter((item) =>
    item.keywords.some((keyword) => normalizedDream.includes(keyword))
  ).slice(0, 5);
}

function buildDreamGuidePrompt(dream: string) {
  const matched = getMatchedSymbols(dream);
  const guide = matched.length > 0 ? matched : DREAM_SYMBOL_GUIDE.slice(0, 8);

  return guide
    .map((item) => `- ${item.title}: ${item.meaning} 조언: ${item.advice}`)
    .join('\n');
}

function buildFallbackInterpretation(dream: string, mood: string) {
  const symbols = getMatchedSymbols(dream);

  const symbolText = symbols.length > 0
    ? symbols.map((item) => `- **${item.title}**: ${item.meaning} ${item.advice}`).join('\n')
    : '- 이 꿈은 특정한 길몽/흉몽으로 단정하기보다, 현재 마음속 긴장과 기대가 섞여 나온 꿈으로 보는 것이 좋습니다.\n- 꿈에서 가장 선명했던 장면은 지금 현실에서 가장 신경 쓰이는 문제와 연결되어 있을 가능성이 큽니다.';

  const moodAdvice = mood
    ? `꿈을 꾼 뒤의 느낌이 "${mood}" 쪽이었다면, 오늘은 그 감정을 억누르기보다 왜 그런 느낌이 남았는지 차분히 적어보는 것이 좋습니다.`
    : '꿈을 꾼 뒤의 느낌을 함께 보면 해석이 더 정확해집니다. 편안했는지, 불안했는지, 이상하게 후련했는지 떠올려보세요.';

  return `**운명비서 꿈해몽 리포트**

**전체 해석**
이 꿈은 지금 마음속에서 정리하고 싶은 일, 또는 앞으로의 선택을 더 분명히 보고 싶은 마음이 반영된 꿈으로 보입니다. 꿈은 미래를 단정하는 예언이라기보다, 내가 이미 느끼고 있던 신호를 상징으로 보여주는 경우가 많습니다.

**주요 상징**
${symbolText}

**오늘의 메시지**
${moodAdvice}

**조심할 점**
- 꿈이 불편했더라도 나쁜 일이 생긴다는 뜻으로 받아들이지 마세요.
- 오늘은 성급한 판단보다, 미뤄둔 일 하나를 작게 정리하는 쪽이 좋습니다.
- 사람과 관련된 꿈이었다면 직접 단정하지 말고 대화의 여지를 남기는 것이 좋습니다.

**운명비서의 조언**
오늘은 큰 결론을 내리기보다 마음을 안정시키고, 꿈에서 가장 선명했던 장면을 한 문장으로 적어보세요. 그 문장이 지금 필요한 선택의 힌트가 될 수 있습니다.`;
}

export async function POST(request: NextRequest) {
  try {
    const { dream, mood } = await request.json();

    if (!dream || typeof dream !== 'string' || dream.trim().length < 5) {
      return NextResponse.json({ error: '꿈 내용을 조금 더 자세히 입력해주세요.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const trimmedDream = dream.trim().slice(0, 2000);
    const trimmedMood = typeof mood === 'string' ? mood.trim().slice(0, 80) : '';

    if (!apiKey) {
      return NextResponse.json({ interpretation: buildFallbackInterpretation(trimmedDream, trimmedMood) });
    }

    const dreamGuide = buildDreamGuidePrompt(trimmedDream);

    const systemPrompt = `당신은 '운명비서'의 꿈해몽 전문 비서입니다.

역할:
- 무섭고 단정적인 예언이 아니라, 품격 있고 차분한 수석비서처럼 꿈의 상징을 현실 조언으로 풀어줍니다.
- 길몽/흉몽을 자극적으로 말하지 않습니다.
- 꿈을 심리, 관계, 일상, 선택의 신호로 해석합니다.
- 사용자가 오늘 바로 활용할 수 있는 조언을 줍니다.
- 아래 꿈 상징 자료를 우선 참고하되, 사용자의 꿈 내용에 맞게 자연스럽게 풀어냅니다.

꿈 상징 참고 자료:
${dreamGuide}

답변 형식:
**운명비서 꿈해몽 리포트**

**전체 해석**
2~4문장으로 꿈의 큰 흐름을 설명합니다.

**주요 상징**
- 꿈속 상징 3~5개를 쉬운 말로 해석합니다.

**오늘의 메시지**
오늘 어떤 마음가짐이 좋은지 안내합니다.

**조심할 점**
- 과한 해석, 관계 단정, 충동적인 결정을 피하도록 안내합니다.

**운명비서의 조언**
마지막에 현실적인 행동 조언을 2~3문장으로 정리합니다.

주의:
- 이모지는 사용하지 않습니다.
- 불길한 예언처럼 겁주지 않습니다.
- 의학, 법률, 투자 판단은 전문가 상담을 권합니다.
- 한국어 존댓말로 답합니다.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1600,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `꿈 내용:\n${trimmedDream}\n\n꿈을 꾼 뒤 느낌:\n${trimmedMood || '미입력'}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ interpretation: buildFallbackInterpretation(trimmedDream, trimmedMood) });
    }

    const data = await response.json();
    const interpretation = data.content?.[0]?.text || buildFallbackInterpretation(trimmedDream, trimmedMood);

    return NextResponse.json({ interpretation });
  } catch (error) {
    console.error('꿈해몽 오류:', error);
    return NextResponse.json({ error: '꿈해몽 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
