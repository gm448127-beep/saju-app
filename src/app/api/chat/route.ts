import { NextRequest, NextResponse } from 'next/server';
import { buildChatSajuContext } from '@/lib/chat-saju-context';
import { buildChatGenerationSystemPrompt } from '@/lib/chat-generation-prompts';
import { getChatFallbackV3Response } from '@/lib/chat-fallback-v3';
import { AI_CHAT_ENABLED } from '@/lib/feature-flags';

export async function POST(request: NextRequest) {
  try {
    if (!AI_CHAT_ENABLED) {
      return NextResponse.json(
        { error: 'AI 상담은 준비 중입니다. 잠시 후 다시 이용해 주세요.' },
        { status: 503 },
      );
    }

    const { message, birthData, chatHistory } = await request.json();
    if (!message) return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });

    // 사주 원국 맥락 (ssaju 엔진 — 사주·오늘의 흐름과 동일)
    let sajuContext = '';
    if (birthData?.year) {
      sajuContext = buildChatSajuContext(birthData) ?? '';
    }

    const systemPrompt = buildChatGenerationSystemPrompt(sajuContext);

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
      const builtInResponse = getChatFallbackV3Response(message, sajuContext, chatHistory);
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
        max_tokens: 2200,
        system: systemPrompt,
        messages: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const builtInResponse = getChatFallbackV3Response(message, sajuContext, chatHistory);
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
