import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, birthData, chatHistory } = await request.json();
    if (!message) return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });

    // 사주 정보가 있으면 컨텍스트에 포함
    let sajuContext = '';
    if (birthData && birthData.year) {
      const CHEONGAN = ['갑','을','병','정','무','기','경','신','임','계'];
      const JIJI = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
      const GAN_OHAENG: Record<string,string> = {갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수'};
      const GAN_EUMYANG: Record<string,string> = {갑:'양',을:'음',병:'양',정:'음',무:'양',기:'음',경:'양',신:'음',임:'양',계:'음'};
      const DDI = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
      const SANGSAENG: Record<string,string> = {목:'화',화:'토',토:'금',금:'수',수:'목'};
      const SANGGEUK: Record<string,string> = {목:'토',화:'금',토:'수',금:'목',수:'화'};

      const y = Number(birthData.year), m = Number(birthData.month), d = Number(birthData.day);
      const baseDate = new Date(1900, 0, 1);
      const targetDate = new Date(y, m - 1, d);
      const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);

      const yearGanIdx = ((y - 4) % 10 + 10) % 10;
      const yearJiIdx = ((y - 4) % 12 + 12) % 12;
      const dayGanIdx = ((diffDays % 10) + 10) % 10;
      const dayJiIdx = ((diffDays % 12) + 12) % 12;

      const dayGan = CHEONGAN[dayGanIdx];
      const mainElement = GAN_OHAENG[dayGan];
      const eumyang = GAN_EUMYANG[dayGan];
      const ddi = DDI[yearJiIdx];
      const yearGanji = `${CHEONGAN[yearGanIdx]}${JIJI[yearJiIdx]}`;

      // 오행 카운트
      const monthGanBase = (yearGanIdx % 5) * 2 + 2;
      const monthGanIdx = (monthGanBase + (m - 1)) % 10;
      const monthJiIdx = (m + 1) % 12;
      const ohaengCount: Record<string,number> = {목:0,화:0,토:0,금:0,수:0};
      [
        { g: yearGanIdx, j: yearJiIdx },
        { g: monthGanIdx, j: monthJiIdx },
        { g: dayGanIdx, j: dayJiIdx },
      ].forEach(({ g, j }) => {
        ohaengCount[GAN_OHAENG[CHEONGAN[g % 10]]]++;
        const JI_OHAENG: Record<string,string> = {자:'수',축:'토',인:'목',묘:'목',진:'토',사:'화',오:'화',미:'토',신:'금',유:'금',술:'토',해:'수'};
        ohaengCount[JI_OHAENG[JIJI[j % 12]]]++;
      });

      const sorted = Object.entries(ohaengCount).sort((a,b) => b[1] - a[1]);
      const strongest = sorted[0][0];
      const weakest = sorted[sorted.length - 1][0];

      sajuContext = `
[상담자의 사주 정보]
- 생년월일: ${y}년 ${m}월 ${d}일 (${birthData.gender === '여' ? '여성' : '남성'})
- 연간지: ${yearGanji}
- 일간(주 오행): ${dayGan} (${mainElement}, ${eumyang})
- 띠: ${ddi}띠
- 오행 분포: 목=${ohaengCount['목']}, 화=${ohaengCount['화']}, 토=${ohaengCount['토']}, 금=${ohaengCount['금']}, 수=${ohaengCount['수']}
- 가장 강한 오행: ${strongest} / 가장 약한 오행: ${weakest}
- 상생 관계: ${mainElement} → ${SANGSAENG[mainElement]}
- 상극 관계: ${mainElement} → ${SANGGEUK[mainElement]}
`;
    }

    const systemPrompt = `당신은 '사주도우미'라는 이름의 친근하고 전문적인 사주/운세 상담 AI입니다.

당신의 성격과 말투:
- 친근하고 따뜻한 말투를 사용합니다 (존댓말 사용)
- 이모지를 적절히 사용하여 친근함을 더합니다
- 전문 용어를 쓸 때는 쉬운 설명을 함께 합니다
- 긍정적이고 희망적인 조언을 우선하되, 주의사항도 균형있게 전합니다
- 답변은 충분히 상세하게 하되, 읽기 쉽게 구성합니다

당신의 전문 분야:
1. 사주팔자 (四柱八字) 해석 - 년주, 월주, 일주, 시주 분석
2. 오행 (五行) 분석 - 목, 화, 토, 금, 수의 균형과 의미
3. 십신 (十神) 해석 - 비견, 식신, 재성, 관성, 인성
4. 음양 (陰陽) 조화
5. 오늘의 운세, 주간/월간 운세
6. 궁합 분석 - 연인, 친구, 사업 파트너
7. 토정비결 - 한 해 운세
8. 띠별 운세와 성격
9. 방위, 색상, 숫자 등 행운의 요소
10. 직업, 연애, 건강, 재물 관련 조언

답변 시 주의사항:
- 사주는 참고용이며 절대적인 것이 아님을 적절히 안내합니다
- 의학적, 법적 조언은 전문가 상담을 권합니다
- 부정적인 내용도 희망적인 대안과 함께 전달합니다
- 질문에 맞는 구체적이고 실용적인 조언을 합니다

${sajuContext}

위 사주 정보를 바탕으로 맞춤형 상담을 해주세요. 사주 정보가 없으면 일반적인 운세 상담을 해주세요.`;

    // 대화 히스토리 구성
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // 이전 대화 히스토리 추가 (최근 10개만)
    if (chatHistory && Array.isArray(chatHistory)) {
      const recentHistory = chatHistory.slice(-10);
      recentHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    messages.push({ role: 'user', content: message });

    // Claude API 호출
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // API 키가 없으면 내장 응답 사용
      const builtInResponse = getBuiltInResponse(message, sajuContext);
      return NextResponse.json({ reply: builtInResponse });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const builtInResponse = getBuiltInResponse(message, sajuContext);
      return NextResponse.json({ reply: builtInResponse });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '죄송합니다, 응답을 생성하지 못했습니다.';

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('채팅 오류:', error);
    return NextResponse.json({ error: '채팅 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// API 키가 없을 때 사용하는 내장 응답
function getBuiltInResponse(message: string, sajuContext: string): string {
  const msg = message.toLowerCase();

  // 사주 정보 파싱
  let element = '';
  let ddi = '';
  if (sajuContext) {
    const elementMatch = sajuContext.match(/일간.*?:\s*\S+\s*\((\S+),/);
    if (elementMatch) element = elementMatch[1];
    const ddiMatch = sajuContext.match(/띠:\s*(\S+)띠/);
    if (ddiMatch) ddi = ddiMatch[1];
  }

  const elementEmoji: Record<string,string> = {목:'🌳',화:'🔥',토:'🏔️',금:'⚔️',수:'💧'};
  const emoji = element ? (elementEmoji[element] || '✨') : '✨';

  // 재물운
  if (msg.includes('재물') || msg.includes('돈') || msg.includes('재산') || msg.includes('투자') || msg.includes('부자')) {
    if (element) {
      const wealth: Record<string,string> = {
        목: `${emoji} **${element} 기운의 재물운** 입니다!\n\n나무가 자라듯 당신의 재물도 서서히 성장하는 타입이에요. 단기간에 큰돈을 벌기보다 꾸준히 모으는 것이 유리합니다.\n\n💰 **재물 성향:**\n- 창의적인 아이디어로 수익을 만드는 능력이 있어요\n- 새로운 사업이나 부업에서 기회를 찾을 수 있습니다\n- 봄(3~5월)에 재물운이 가장 좋아요\n\n📌 **재물 조언:**\n- 동쪽 방향이 재물에 유리합니다\n- 초록색 지갑이나 소품이 행운을 가져와요\n- 급한 투자보다 장기 투자가 유리합니다\n- 숫자 3, 8이 재물에 좋은 숫자예요`,
        화: `${emoji} **${element} 기운의 재물운** 입니다!\n\n불꽃처럼 화끈한 재물운! 기회가 올 때 확 잡는 타입이에요. 직관이 좋아 투자 감각도 뛰어납니다.\n\n💰 **재물 성향:**\n- 사교적인 성격으로 인맥을 통한 수익이 많아요\n- 여름(6~8월)에 재물운이 가장 강합니다\n- 서비스업, 엔터테인먼트 관련 분야에서 돈이 들어와요\n\n📌 **재물 조언:**\n- 남쪽 방향에서 재물이 들어옵니다\n- 빨간색 소품이 재물운을 높여줘요\n- 충동 소비를 조심하고, 자동 저축을 활용하세요\n- 숫자 2, 7이 재물에 좋은 숫자예요`,
        토: `${emoji} **${element} 기운의 재물운** 입니다!\n\n대지처럼 든든한 재물운! 안정적으로 재산을 모으는 타입이에요. 부동산 운이 특히 좋습니다.\n\n💰 **재물 성향:**\n- 꾸준한 저축과 안정적인 투자에 강합니다\n- 부동산, 토지 관련 투자에서 좋은 결과를 얻어요\n- 환절기(3월, 6월, 9월, 12월)에 재물 기회가 옵니다\n\n📌 **재물 조언:**\n- 중앙이나 남서쪽 방향이 재물에 좋아요\n- 노란색, 갈색 소품이 재물운을 높여줍니다\n- 안전한 적금이나 채권 투자가 유리해요\n- 숫자 5, 10이 재물에 좋은 숫자예요`,
        금: `${emoji} **${element} 기운의 재물운** 입니다!\n\n금속처럼 빛나는 재물운! 결단력으로 큰 돈을 만드는 타입이에요. 금융 관련 감각이 뛰어납니다.\n\n💰 **재물 성향:**\n- 금융, 기술 분야에서 큰 수익을 올릴 수 있어요\n- 가을(9~11월)에 재물운이 가장 좋습니다\n- 정확한 분석과 판단으로 투자에 성공합니다\n\n📌 **재물 조언:**\n- 서쪽 방향이 재물에 유리합니다\n- 흰색, 금색 소품이 재물운을 높여줘요\n- 분산 투자로 리스크를 줄이세요\n- 숫자 4, 9가 재물에 좋은 숫자예요`,
        수: `${emoji} **${element} 기운의 재물운** 입니다!\n\n물처럼 유연한 재물운! 다양한 곳에서 수입이 들어오는 타입이에요. 부업이나 프리랜서에 유리합니다.\n\n💰 **재물 성향:**\n- 지적 활동이나 창작으로 수익을 만들어요\n- 겨울(12~2월)에 재물운이 강합니다\n- IT, 교육, 컨설팅 분야에서 좋은 결과를 얻어요\n\n📌 **재물 조언:**\n- 북쪽 방향이 재물에 좋습니다\n- 검은색, 파란색 소품이 재물운을 높여줘요\n- 여러 개의 수입원을 만드세요 (투잡 추천!)\n- 숫자 1, 6이 재물에 좋은 숫자예요`,
      };
      return wealth[element] || '재물운에 대해 자세히 알려드릴게요!';
    }
    return '✨ 재물운이 궁금하시군요!\n\n더 정확한 재물운 분석을 위해 **생년월일**을 먼저 입력해주시면, 맞춤형 재물 운세를 알려드릴 수 있어요! 상단의 생년월일 입력란에 정보를 넣어보세요. 💰';
  }

  // 연애운
  if (msg.includes('연애') || msg.includes('사랑') || msg.includes('결혼') || msg.includes('이성') || msg.includes('소개팅') || msg.includes('연인')) {
    if (element) {
      const love: Record<string,string> = {
        목: `${emoji} **${element} 기운의 연애운** 이에요!\n\n나무처럼 쭉쭉 뻗어나가는 연애 스타일! 솔직하고 진취적인 매력으로 상대를 사로잡아요.\n\n💕 **연애 성향:**\n- 첫눈에 반하는 타입이에요\n- 자유로운 연애를 좋아하고, 구속을 싫어해요\n- 상대방의 성장을 응원하는 파트너\n\n🔮 **이상적인 상대:**\n- 수(💧) 기운의 사람과 최고의 궁합!\n- 지적이고 유연한 사람에게 끌려요\n- 자신만의 세계가 있는 사람이 매력적\n\n📌 **연애 조언:**\n- 너무 급하게 진행하지 마세요\n- 상대방의 속도를 존중하면 더 좋아져요\n- 봄에 좋은 인연을 만날 가능성이 높아요`,
        화: `${emoji} **${element} 기운의 연애운** 이에요!\n\n불꽃 같은 사랑을 하는 타입! 열정적이고 로맨틱한 연애를 합니다.\n\n💕 **연애 성향:**\n- 분위기에 약하고 감성적이에요\n- 상대방에게 올인하는 타입\n- 표현력이 좋아 상대를 감동시켜요\n\n🔮 **이상적인 상대:**\n- 목(🌳) 기운의 사람과 환상의 궁합!\n- 자신의 열정을 함께 나눌 수 있는 사람\n- 진솔하고 솔직한 사람에게 끌려요\n\n📌 **연애 조언:**\n- 감정에 휩쓸리지 말고 이성적으로도 판단하세요\n- 질투와 집착은 관계를 망칠 수 있어요\n- 여름에 좋은 만남이 있을 가능성이 높아요`,
        토: `${emoji} **${element} 기운의 연애운** 이에요!\n\n대지처럼 넓고 깊은 사랑을 하는 타입! 한번 사랑하면 오래 가는 스타일이에요.\n\n💕 **연애 성향:**\n- 천천히 서로를 알아가는 연애를 좋아해요\n- 안정적이고 신뢰감 있는 파트너\n- 가정적이고 헌신적인 사랑을 해요\n\n🔮 **이상적인 상대:**\n- 화(🔥) 기운의 사람과 좋은 궁합!\n- 당신에게 활력을 주는 밝은 사람\n- 진지하고 책임감 있는 사람이 잘 맞아요\n\n📌 **연애 조언:**\n- 너무 신중해서 기회를 놓치지 마세요\n- 감정 표현을 더 적극적으로 하면 좋아요\n- 소개팅이나 모임에서 좋은 인연을 만나요`,
        금: `${emoji} **${element} 기운의 연애운** 이에요!\n\n카리스마 있는 연애 스타일! 쿨하면서도 속은 따뜻한 매력의 소유자예요.\n\n💕 **연애 성향:**\n- 외적으로 쿨해 보이지만 속은 다정해요\n- 한번 마음을 열면 깊이 사랑하는 타입\n- 의리 있고 책임감 있는 파트너\n\n🔮 **이상적인 상대:**\n- 토(🏔️) 기운의 사람과 안정적인 궁합!\n- 당신의 강함을 부드럽게 감싸주는 사람\n- 인내심 있고 이해력 있는 사람이 좋아요\n\n📌 **연애 조언:**\n- 차가운 인상이 상대를 멀리할 수 있어요\n- 먼저 다가가면 의외로 잘 풀려요\n- 가을에 좋은 인연이 찾아올 가능성이 높아요`,
        수: `${emoji} **${element} 기운의 연애운** 이에요!\n\n물처럼 깊고 잔잔한 사랑을 하는 타입! 감성적이고 배려심 깊은 연인이에요.\n\n💕 **연애 성향:**\n- 감정이 풍부하고 공감 능력이 뛰어나요\n- 상대방을 잘 이해하고 맞춰주는 타입\n- 지적인 대화를 나눌 수 있는 관계를 원해요\n\n🔮 **이상적인 상대:**\n- 금(⚔️) 기운의 사람과 좋은 궁합!\n- 결단력 있고 리더십 있는 사람에게 끌려요\n- 당신에게 안정감을 주는 사람이 잘 맞아요\n\n📌 **연애 조언:**\n- 우유부단함을 조심하세요\n- 마음이 정해지면 과감하게 고백하세요!\n- 겨울에 운명적인 만남이 있을 수 있어요`,
      };
      return love[element] || '연애운에 대해 알려드릴게요!';
    }
    return '💕 연애운이 궁금하시군요!\n\n생년월일을 입력해주시면 오행에 맞는 맞춤형 연애 상담을 해드릴 수 있어요! 상단에서 생년월일을 입력해보세요.';
  }

  // 직업운/취업
  if (msg.includes('직업') || msg.includes('취업') || msg.includes('이직') || msg.includes('승진') || msg.includes('커리어') || msg.includes('일') || msg.includes('회사')) {
    if (element) {
      const career: Record<string,string> = {
        목: `${emoji} **${element} 기운의 직업운** 이에요!\n\n창의력과 추진력이 강한 당신은 새로운 것을 만들어내는 분야에서 빛납니다!\n\n💼 **잘 맞는 직업:**\n- 교육, 문학, 언론, 출판\n- 패션, 디자인, 건축\n- 환경, 농업, 원예\n- 스타트업, 기획, 마케팅\n\n📈 **커리어 조언:**\n- 한 분야에서 전문성을 키우면 크게 성공해요\n- 팀 리더보다 독립적인 역할이 더 잘 맞을 수 있어요\n- 올해는 새로운 프로젝트를 시작하기 좋은 시기입니다`,
        화: `${emoji} **${element} 기운의 직업운** 이에요!\n\n열정과 표현력이 뛰어난 당신은 사람들 앞에서 빛나는 분야가 어울립니다!\n\n💼 **잘 맞는 직업:**\n- 엔터테인먼트, 방송, 유튜버\n- 영업, 마케팅, PR\n- 요리, 미용, 예술\n- 강연, 교육, 코칭\n\n📈 **커리어 조언:**\n- 당신의 열정을 살릴 수 있는 일을 하세요\n- 인맥을 활용한 영업이나 마케팅에 재능이 있어요\n- 번아웃을 조심하고 휴식도 중요합니다`,
        토: `${emoji} **${element} 기운의 직업운** 이에요!\n\n안정적이고 신뢰감 있는 당신은 조직에서 핵심 인재가 되는 타입!\n\n💼 **잘 맞는 직업:**\n- 공무원, 대기업, 공기업\n- 부동산, 건설, 인테리어\n- 회계, 세무, 법무\n- 의료, 복지, 상담\n\n📈 **커리어 조언:**\n- 한 직장에서 오래 근무하면 크게 인정받아요\n- 안정적인 직업이 당신의 능력을 최대로 발휘시켜요\n- 꾸준한 자기계발이 승진의 열쇠입니다`,
        금: `${emoji} **${element} 기운의 직업운** 이에요!\n\n결단력과 완벽주의로 어떤 분야든 정상에 오를 수 있는 타입!\n\n💼 **잘 맞는 직업:**\n- 금융, 투자, 경영\n- IT, 엔지니어링, 기술직\n- 법조계, 군인, 경찰\n- 의사, 약사, 연구원\n\n📈 **커리어 조언:**\n- 리더 역할을 맡으면 능력을 발휘합니다\n- 전문 자격증이나 기술을 갈고닦으세요\n- 너무 완벽을 추구하면 스트레스를 받을 수 있어요`,
        수: `${emoji} **${element} 기운의 직업운** 이에요!\n\n지혜롭고 창의적인 당신은 아이디어가 빛나는 분야에서 성공합니다!\n\n💼 **잘 맞는 직업:**\n- IT, 프로그래밍, 데이터 분석\n- 연구, 학문, 교수\n- 컨설팅, 기획, 전략\n- 작가, 번역, 통역\n\n📈 **커리어 조언:**\n- 지적 호기심을 살릴 수 있는 일이 최적이에요\n- 프리랜서나 원격근무가 잘 맞을 수 있어요\n- 다양한 경험이 커리어에 큰 자산이 됩니다`,
      };
      return career[element] || '직업운에 대해 알려드릴게요!';
    }
    return '💼 직업운이 궁금하시군요!\n\n생년월일을 입력해주시면 오행에 맞는 적성과 직업 분석을 해드릴 수 있어요!';
  }

  // 건강
  if (msg.includes('건강') || msg.includes('아프') || msg.includes('병') || msg.includes('운동') || msg.includes('다이어트')) {
    if (element) {
      const health: Record<string,string> = {
        목: `${emoji} **${element} 기운의 건강운** 이에요!\n\n목 기운은 간, 담, 눈, 근육과 관련이 있어요.\n\n🏥 **주의할 부분:**\n- 간 건강에 특히 신경 쓰세요\n- 눈의 피로를 자주 풀어주세요\n- 근육통이나 경련이 올 수 있어요\n\n💪 **건강 조언:**\n- 초록색 채소를 많이 드세요 (시금치, 브로콜리)\n- 산책이나 등산 등 자연 속 운동이 좋아요\n- 스트레칭을 매일 하면 건강이 좋아집니다\n- 봄에 건강관리를 시작하면 효과가 좋아요`,
        화: `${emoji} **${element} 기운의 건강운** 이에요!\n\n화 기운은 심장, 혈액순환, 소장과 관련이 있어요.\n\n🏥 **주의할 부분:**\n- 심장과 혈압에 주의하세요\n- 스트레스로 인한 불면증 조심\n- 여름철 더위에 특히 약해요\n\n💪 **건강 조언:**\n- 붉은 과일을 많이 드세요 (토마토, 석류)\n- 유산소 운동이 좋아요 (달리기, 수영)\n- 명상이나 요가로 마음의 평화를 찾으세요\n- 충분한 수면이 가장 중요합니다`,
        토: `${emoji} **${element} 기운의 건강운** 이에요!\n\n토 기운은 위장, 비장, 소화기관과 관련이 있어요.\n\n🏥 **주의할 부분:**\n- 소화 기능에 특히 신경 쓰세요\n- 과식을 조심하세요\n- 환절기에 면역력이 떨어질 수 있어요\n\n💪 **건강 조언:**\n- 노란 음식을 드세요 (고구마, 호박, 옥수수)\n- 규칙적인 식사 습관이 가장 중요해요\n- 걷기 운동이 소화에 좋습니다\n- 스트레스를 받으면 위가 아플 수 있어요`,
        금: `${emoji} **${element} 기운의 건강운** 이에요!\n\n금 기운은 폐, 호흡기, 피부, 대장과 관련이 있어요.\n\n🏥 **주의할 부분:**\n- 호흡기와 폐 건강에 주의하세요\n- 피부 관리에 신경 쓰세요\n- 가을, 겨울에 감기를 조심하세요\n\n💪 **건강 조언:**\n- 흰 음식을 드세요 (무, 배, 도라지)\n- 호흡 운동이나 명상이 좋아요\n- 깨끗한 공기가 중요하니 공기청정기를 사용하세요\n- 규칙적인 운동으로 폐활량을 키우세요`,
        수: `${emoji} **${element} 기운의 건강운** 이에요!\n\n수 기운은 신장, 방광, 뼈, 귀와 관련이 있어요.\n\n🏥 **주의할 부분:**\n- 신장과 비뇨기 건강에 주의하세요\n- 뼈와 관절을 잘 관리하세요\n- 겨울에 냉기를 조심하세요\n\n💪 **건강 조언:**\n- 검은 음식을 드세요 (검은콩, 흑미, 해조류)\n- 수영이 최고의 운동이에요\n- 물을 충분히 마시세요 (하루 8잔)\n- 몸을 따뜻하게 유지하는 것이 중요해요`,
      };
      return health[element] || '건강운에 대해 알려드릴게요!';
    }
    return '💪 건강운이 궁금하시군요!\n\n생년월일을 입력해주시면 오행에 맞는 맞춤형 건강 조언을 해드릴 수 있어요!';
  }

  // 오늘 운세
  if (msg.includes('오늘') || msg.includes('운세') || msg.includes('하루')) {
    const today = new Date();
    const dayNames = ['일','월','화','수','목','금','토'];
    const todayStr = `${today.getMonth()+1}월 ${today.getDate()}일 ${dayNames[today.getDay()]}요일`;

    if (element) {
      return `📅 **${todayStr} ${element} 기운의 운세**\n\n${emoji} 오늘은 ${element} 기운이 활발한 날이에요!\n\n⭐ **총운:** 전반적으로 긍정적인 에너지가 흐릅니다. 새로운 시도에 좋은 날이에요.\n\n💰 **재물운:** 예상치 못한 곳에서 작은 이익이 생길 수 있어요. 충동구매는 자제하세요.\n\n💕 **애정운:** 주변 사람들에게 따뜻한 말을 건네면 관계가 좋아집니다.\n\n💼 **직업운:** 오후에 중요한 아이디어가 떠오를 수 있어요. 메모해두세요!\n\n🍀 **행운 포인트:**\n- 행운의 색: ${element === '목' ? '초록' : element === '화' ? '빨강' : element === '토' ? '노랑' : element === '금' ? '흰색' : '파랑'}\n- 행운의 방향: ${element === '목' ? '동쪽' : element === '화' ? '남쪽' : element === '토' ? '중앙' : element === '금' ? '서쪽' : '북쪽'}\n- 행운의 숫자: ${element === '목' ? '3, 8' : element === '화' ? '2, 7' : element === '토' ? '5, 10' : element === '금' ? '4, 9' : '1, 6'}`;
    }
    return `📅 **${todayStr} 운세**\n\n오늘의 전체적인 기운은 밝고 활기차요! ✨\n\n생년월일을 입력해주시면 맞춤형 오늘의 운세를 알려드릴 수 있어요!`;
  }

  // 인사
  if (msg.includes('안녕') || msg.includes('하이') || msg.includes('hello') || msg.includes('시작')) {
    return `안녕하세요! 🙏 **사주도우미**에 오신 것을 환영합니다!\n\n저는 사주팔자, 운세, 궁합 등을 상담해드리는 AI 상담사예요. 😊\n\n${element ? `\n이미 생년월일을 입력해주셨네요! ${emoji} ${element} 기운의 ${ddi}띠시군요.\n\n` : '\n상단에서 **생년월일**을 입력하시면 더 정확한 맞춤 상담이 가능해요!\n\n'}💡 **이런 것들을 물어보실 수 있어요:**\n- "오늘의 운세 알려줘"\n- "내 재물운은 어때?"\n- "연애운이 궁금해"\n- "직업 적성이 뭘까?"\n- "건강 조심할 부분은?"\n- "올해 운세 전체적으로 어때?"\n\n무엇이든 편하게 물어보세요! 🔮`;
  }

  // 올해 운세
  if (msg.includes('올해') || msg.includes('2025') || msg.includes('2026') || msg.includes('한해') || msg.includes('신년')) {
    if (element) {
      return `${emoji} **올해 ${element} 기운의 종합 운세**\n\n올해는 전반적으로 변화와 성장의 기운이 있는 해입니다.\n\n📊 **분기별 운세:**\n\n🌸 **1~3월 (봄):** 새로운 시작에 좋은 시기! 계획을 세우고 첫 발을 내딛으세요.\n\n☀️ **4~6월 (여름):** 활발한 활동이 좋은 결과를 만들어요. 인맥을 넓히세요.\n\n🍂 **7~9월 (가을):** 상반기의 노력이 결실을 맺습니다. 수확의 시기!\n\n❄️ **10~12월 (겨울):** 정리와 내년 준비의 시기. 건강관리에 신경 쓰세요.\n\n💡 **올해의 키워드:** 도전, 성장, 인연\n\n⚠️ **주의사항:** 급한 결정은 피하고 신중하게 행동하세요. 건강관리도 잊지 마세요!`;
    }
    return '📅 올해의 운세가 궁금하시군요!\n\n생년월일을 입력해주시면 맞춤형 올해 운세를 상세히 알려드릴 수 있어요!';
  }

  // 감사
  if (msg.includes('고마') || msg.includes('감사') || msg.includes('ㄱㅅ') || msg.includes('thank')) {
    return '천만에요! 😊 도움이 되셨다면 기뻐요!\n\n더 궁금한 것이 있으시면 언제든 물어보세요. 재물운, 연애운, 건강운, 직업운 등 무엇이든 상담해드릴게요! 🔮✨';
  }

  // 기본 응답
  if (element) {
    return `${emoji} 좋은 질문이에요!\n\n${element} 기운의 ${ddi}띠이신 당신에게 맞는 답변을 드리고 싶어요. 조금 더 구체적으로 질문해주시면 더 정확한 상담이 가능합니다!\n\n💡 **이런 질문을 해보세요:**\n- "내 재물운은 어때?"\n- "연애운이 궁금해"\n- "올해 운세 알려줘"\n- "직업 적성이 뭘까?"\n- "건강 조심할 부분은?"\n- "오늘의 운세 알려줘"\n\n무엇이든 편하게 물어보세요! 😊`;
  }

  return '안녕하세요! 🔮 사주도우미입니다!\n\n더 정확한 맞춤 상담을 위해 **상단에서 생년월일을 입력**해주세요!\n\n입력 후 재물운, 연애운, 건강운, 직업운 등 무엇이든 물어보실 수 있어요. 😊\n\n💡 예시: "내 재물운 알려줘", "오늘 운세는?", "연애운이 궁금해"';
}
