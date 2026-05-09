'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BirthData {
  year: string;
  month: string;
  day: string;
  gender: string;
  isLunar: boolean;
}

const QUICK_QUESTIONS = [
  { emoji: '💰', text: '내 재물운은 어때?' },
  { emoji: '💕', text: '연애운이 궁금해' },
  { emoji: '💼', text: '직업 적성이 뭘까?' },
  { emoji: '💪', text: '건강 조심할 부분은?' },
  { emoji: '📅', text: '오늘의 운세 알려줘' },
  { emoji: '🌟', text: '올해 운세 전체적으로 어때?' },
];

const YEARS = Array.from({ length: 80 }, (_, i) => 2010 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [birthData, setBirthData] = useState<BirthData>({ year: '', month: '', day: '', gender: '남', isLunar: false });
  const [showBirthForm, setShowBirthForm] = useState(true);
  const [birthSaved, setBirthSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveBirthData = () => {
    if (!birthData.year || !birthData.month || !birthData.day) {
      alert('생년월일을 모두 입력해주세요!');
      return;
    }
    setBirthSaved(true);
    setShowBirthForm(false);
    // 환영 메시지
    setMessages([{
      role: 'assistant',
      content: `안녕하세요! 🙏 **사주도우미**입니다!\n\n${birthData.year}년 ${birthData.month}월 ${birthData.day}일생 (${birthData.gender === '남' ? '남성' : '여성'}, ${birthData.isLunar ? '음력' : '양력'}) 정보를 확인했어요!\n\n이제 맞춤형 사주 상담을 받으실 수 있습니다. 😊\n\n💡 아래 버튼을 눌러 빠르게 질문하거나, 궁금한 점을 직접 입력해보세요!`,
    }]);
  };

  const skipBirthData = () => {
    setShowBirthForm(false);
    setMessages([{
      role: 'assistant',
      content: '안녕하세요! 🙏 **사주도우미**입니다!\n\n생년월일 없이도 일반적인 운세 상담이 가능해요.\n더 정확한 맞춤 상담을 원하시면 언제든 상단의 "생년월일 입력" 버튼을 눌러주세요!\n\n💡 무엇이 궁금하신가요?',
    }]);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          birthData: birthSaved ? birthData : null,
          chatHistory: messages.slice(-10),
        }),
      });
      const data = await res.json();
      const assistantMessage: Message = { role: 'assistant', content: data.reply || data.error || '응답을 받지 못했습니다.' };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다, 오류가 발생했어요. 다시 시도해주세요! 🙏' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 마크다운 간단 렌더링
  function renderContent(content: string) {
    return content.split('\n').map((line, i) => {
      // 볼드 처리
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-[#3D3338]">{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });

      if (line.startsWith('- ')) {
        return <p key={i} className="ml-2 mb-0.5">{rendered.slice(1)}{line.slice(2).includes('**') ? null : line.slice(2)}</p>;
      }
      if (line === '') return <br key={i} />;
      return <p key={i} className="mb-0.5">{rendered}</p>;
    });
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* 헤더 */}
      <div className="text-center py-3 shrink-0">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🔮</span>
          <h1 style={{ fontFamily: 'Jua, sans-serif' }} className="text-xl text-[#3D3338]">AI 사주 상담</h1>
        </div>
        {birthSaved && (
          <p className="text-xs text-[#847A80] mt-1">
            {birthData.year}년 {birthData.month}월 {birthData.day}일 ({birthData.gender === '남' ? '남' : '여'}, {birthData.isLunar ? '음력' : '양력'})
            <button onClick={() => setShowBirthForm(true)} className="ml-2 text-[#8B7EC8] underline">수정</button>
          </p>
        )}
        {!birthSaved && !showBirthForm && (
          <button onClick={() => setShowBirthForm(true)} className="text-xs text-[#8B7EC8] underline mt-1">
            생년월일 입력하기
          </button>
        )}
      </div>

      {/* 생년월일 입력 폼 */}
      {showBirthForm && (
        <div className="mx-4 mb-3 card shrink-0" style={{ backgroundColor: '#F8F5FF', borderColor: '#D4CCE8' }}>
          <p style={{ fontFamily: 'Jua, sans-serif' }} className="text-base text-[#5C4B8A] mb-3">🎂 생년월일을 입력하면 맞춤 상담이 가능해요!</p>
          <div className="space-y-3">
            <div className="flex gap-2">
              {['남', '여'].map((g) => (
                <button
                  key={g}
                  onClick={() => setBirthData(prev => ({ ...prev, gender: g }))}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                    birthData.gender === g ? 'border-[#8B7EC8] bg-[#8B7EC8] text-white' : 'border-[#E8E2DC] bg-white text-[#5C5358]'
                  }`}
                  style={{ fontFamily: 'Jua, sans-serif' }}
                >
                  {g === '남' ? '👨 남' : '👩 여'}
                </button>
              ))}
              {[false, true].map((lunar) => (
                <button
                  key={String(lunar)}
                  onClick={() => setBirthData(prev => ({ ...prev, isLunar: lunar }))}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                    birthData.isLunar === lunar ? 'border-[#D8986C] bg-[#D8986C] text-white' : 'border-[#E8E2DC] bg-white text-[#5C5358]'
                  }`}
                  style={{ fontFamily: 'Jua, sans-serif' }}
                >
                  {lunar ? '🌙 음력' : '☀️ 양력'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select value={birthData.year} onChange={(e) => setBirthData(prev => ({ ...prev, year: e.target.value }))} className="p-2 rounded-xl text-sm">
                <option value="">년도</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
              </select>
              <select value={birthData.month} onChange={(e) => setBirthData(prev => ({ ...prev, month: e.target.value }))} className="p-2 rounded-xl text-sm">
                <option value="">월</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}월</option>)}
              </select>
              <select value={birthData.day} onChange={(e) => setBirthData(prev => ({ ...prev, day: e.target.value }))} className="p-2 rounded-xl text-sm">
                <option value="">일</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}일</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveBirthData}
                className="flex-1 py-2 rounded-xl text-white text-sm font-bold"
                style={{ fontFamily: 'Jua, sans-serif', backgroundColor: '#8B7EC8' }}
              >
                ✅ 저장하고 상담 시작
              </button>
              <button
                onClick={skipBirthData}
                className="py-2 px-4 rounded-xl text-sm font-bold border-2 border-[#E8E2DC] text-[#847A80]"
                style={{ fontFamily: 'Jua, sans-serif' }}
              >
                건너뛰기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {messages.length === 0 && !showBirthForm && (
          <div className="text-center py-10">
            <span className="text-5xl block mb-3">🔮</span>
            <p style={{ fontFamily: 'Jua, sans-serif' }} className="text-lg text-[#3D3338]">사주도우미와 대화해보세요!</p>
            <p className="text-sm text-[#847A80]">아래 버튼이나 직접 입력으로 질문하세요</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#F8F5FF] flex items-center justify-center text-sm shrink-0 mr-2 mt-1">
                🔮
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#8B7EC8] text-white rounded-br-md'
                  : 'bg-white border-2 border-[#E8E2DC] text-[#3D3338] rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#F8F5FF] flex items-center justify-center text-sm shrink-0 mr-2">
              🔮
            </div>
            <div className="bg-white border-2 border-[#E8E2DC] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#8B7EC8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#8B7EC8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#8B7EC8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 질문 버튼 */}
      {messages.length <= 1 && !showBirthForm && (
        <div className="px-4 py-2 shrink-0">
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full border-2 border-[#E8E2DC] bg-white text-sm text-[#5C5358] hover:border-[#8B7EC8] hover:bg-[#F8F5FF] transition-all disabled:opacity-50"
                style={{ fontFamily: 'Gaegu, cursive', fontWeight: 700 }}
              >
                {q.emoji} {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      {!showBirthForm && (
        <div className="px-4 py-3 shrink-0 border-t-2 border-[#E8E2DC] bg-[#FAF7F4]">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 것을 물어보세요..."
              disabled={loading}
              className="flex-1 p-3 rounded-2xl border-2 border-[#E8E2DC] bg-white text-[#3D3338] focus:border-[#8B7EC8] outline-none disabled:opacity-50"
              style={{ fontFamily: 'Gaegu, cursive', fontSize: '16px', fontWeight: 700 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl text-white text-base disabled:opacity-50 transition-all active:scale-95"
              style={{ fontFamily: 'Jua, sans-serif', backgroundColor: '#8B7EC8' }}
            >
              {loading ? '...' : '전송'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
