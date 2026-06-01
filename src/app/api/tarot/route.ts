import { NextRequest, NextResponse } from 'next/server';
import { drawTarotCards, type DrawnTarotCard } from '@/lib/tarot-cards';
import { buildTarotGenerationSystemPrompt } from '@/lib/tarot-generation-prompts';
import {
  attachRouteLintMeta,
  collectTarotDisplayFields,
} from '@/lib/unmyeong-route-lint';

const TOPIC_GUIDES: Record<string, string> = {
  일반: '현재 고민의 핵심, 다음 흐름, 오늘 취할 태도를 중심으로 읽습니다.',
  연애: '상대 마음을 단정하지 말고 관계의 온도, 내 태도, 확인해야 할 신호를 중심으로 읽습니다.',
  재물: '수익 예언보다 돈의 흐름, 조건, 리스크, 관리 태도를 중심으로 읽습니다.',
  직업: '커리어 방향, 실행력, 협업, 지속 가능성을 중심으로 읽습니다.',
  관계: '말의 온도, 경계, 신뢰 회복, 거리 조절을 중심으로 읽습니다.',
  선택: 'A/B를 대신 골라주기보다 선택 기준, 감정과 현실의 균형, 후속 행동을 중심으로 읽습니다.',
};

const TIME_HORIZON_GUIDES: Record<string, string> = {
  지금: '지금 이 순간의 선택과 태도에 초점을 맞춥니다.',
  '3개월 후': '가까운 미래의 흐름을 장면처럼 그려, 단정이 아닌 가능성의 방향으로 읽습니다.',
  '1년 후': '1년 뒤의 모습을 한 장면으로 묘사하되, 지금의 선택이 어떻게 연결되는지 함께 짚습니다.',
  '2년 후': '2년 후 당신의 모습을 수호신이 비추듯 서사적으로 풀되, 공포나 단정은 피하고 성장의 풍경으로 제시합니다.',
};

function isFutureHorizon(timeHorizon: string) {
  return timeHorizon !== '지금';
}

function buildFallbackReading(
  question: string,
  topic: string,
  timeHorizon: string,
  cards: DrawnTarotCard[],
) {
  const cardText = cards
    .map((card) => `- **${card.position} · ${card.name}${card.isReversed ? ' 역방향' : ''}**: ${card.meaning}. ${card.advice}`)
    .join('\n');
  const topicGuide = TOPIC_GUIDES[topic] ?? TOPIC_GUIDES['일반'];
  const horizonGuide = TIME_HORIZON_GUIDES[timeHorizon] ?? TIME_HORIZON_GUIDES['지금'];
  const futureSection = isFutureHorizon(timeHorizon)
    ? `\n\n**${timeHorizon}의 풍경**\n카드가 비추는 ${timeHorizon}의 모습은 한 장면의 가능성입니다. 지금의 선택과 태도가 그 풍경을 부드럽게 바꿀 수 있다는 점을 함께 기억해주세요.`
    : '';

  return `**운명비서 타로 리딩**

**질문**
${question}

**리딩 기준**
${topicGuide}
${horizonGuide}

**뽑힌 카드**
${cardText}

**전체 흐름**
이번 리딩은 지금의 고민을 당장 단정하기보다, 상황을 차분히 정리하고 다음 행동을 고르는 데 초점이 있습니다. 첫 번째 카드는 출발점, 두 번째 카드는 변화의 흐름, 세 번째 카드는 ${isFutureHorizon(timeHorizon) ? `${timeHorizon}의 가능한 모습` : '오늘 취하면 좋은 태도'}을 보여줍니다. 특히 "${topic}" 관점에서는 카드의 상징을 현실 조건과 감정의 균형으로 함께 보는 것이 중요합니다.${futureSection}

**오늘의 조언**
카드가 말하는 핵심은 무리하게 결과를 끌어내기보다, 지금 내가 통제할 수 있는 선택부터 정리하라는 것입니다. 오늘은 큰 결론을 내리기 전에 조건, 감정, 상대의 반응을 분리해서 보는 것이 좋습니다.`;
}

export async function POST(request: NextRequest) {
  try {
    const { question, topic, timeHorizon } = await request.json();
    const trimmedQuestion = typeof question === 'string' ? question.trim().slice(0, 500) : '';
    const trimmedTopic = typeof topic === 'string' ? topic.trim().slice(0, 40) : '일반';
    const trimmedHorizon =
      typeof timeHorizon === 'string' && TIME_HORIZON_GUIDES[timeHorizon.trim()]
        ? timeHorizon.trim()
        : '지금';

    if (trimmedQuestion.length < 3) {
      return NextResponse.json({ error: '타로로 보고 싶은 질문을 입력해주세요.' }, { status: 400 });
    }

    const cards = drawTarotCards(trimmedHorizon);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const topicGuide = TOPIC_GUIDES[trimmedTopic] ?? TOPIC_GUIDES['일반'];
    const horizonGuide = TIME_HORIZON_GUIDES[trimmedHorizon] ?? TIME_HORIZON_GUIDES['지금'];
    const futureNarrativeGuide = isFutureHorizon(trimmedHorizon)
      ? '미래 시점 질문이므로 "수호신이 비추는 풍경", "카드가 보여주는 가능한 모습"처럼 서사적으로 풀되, 공포·단정·운명론은 피하고 성장과 선택의 여지를 남깁니다.'
      : '';

    if (!apiKey) {
      const payload = {
        cards,
        reading: buildFallbackReading(trimmedQuestion, trimmedTopic, trimmedHorizon, cards),
        timeHorizon: trimmedHorizon,
      };
      return NextResponse.json(
        attachRouteLintMeta(payload, 'tarot', collectTarotDisplayFields(payload)),
      );
    }

    const cardPrompt = cards
      .map((card) => `${card.position}: ${card.name}${card.isReversed ? ' 역방향' : ''} (${card.english}) - ${card.meaning} / 조언: ${card.advice}`)
      .join('\n');

    const systemPrompt = buildTarotGenerationSystemPrompt({
      isFutureHorizon: isFutureHorizon(trimmedHorizon),
      horizonLabel: trimmedHorizon,
    });

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
            content: `분야: ${trimmedTopic}\n분야별 리딩 기준: ${topicGuide}\n시간축: ${trimmedHorizon}\n시간축 리딩 기준: ${horizonGuide}\n${futureNarrativeGuide}\n질문: ${trimmedQuestion}\n\n뽑힌 카드:\n${cardPrompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const payload = {
        cards,
        reading: buildFallbackReading(trimmedQuestion, trimmedTopic, trimmedHorizon, cards),
        timeHorizon: trimmedHorizon,
      };
      return NextResponse.json(
        attachRouteLintMeta(payload, 'tarot', collectTarotDisplayFields(payload)),
      );
    }

    const data = await response.json();
    const reading =
      data.content?.[0]?.text ||
      buildFallbackReading(trimmedQuestion, trimmedTopic, trimmedHorizon, cards);

    const payload = { cards, reading, timeHorizon: trimmedHorizon };
    return NextResponse.json(
      attachRouteLintMeta(payload, 'tarot', collectTarotDisplayFields(payload)),
    );
  } catch (error) {
    console.error('타로 오류:', error);
    return NextResponse.json({ error: '타로 리딩 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
