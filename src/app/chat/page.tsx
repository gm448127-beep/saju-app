'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { AI_CHAT_ENABLED } from '@/lib/feature-flags';
import BirthDateNumberInputs, { isValidBirthDate } from '@/components/BirthDateNumberInputs';
import StoredProfileBar from '@/components/StoredProfileBar';
import { useUserProfile } from '@/components/UserProfileProvider';
import {
  getUserProfile,
  profileToChatBirthData,
  type UserBirthProfile,
} from '@/lib/user-profile-storage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BirthData {
  year: string;
  month: string;
  day: string;
  gender: string;
  calendarType: 'solar' | 'lunar' | 'lunarLeap';
  isLunar: boolean;
  timeMode: 'none' | 'slot' | 'exact';
  slotHour: string;
  exactHour: string;
  exactMinute: string;
}

const QUICK_QUESTIONS = [
  { text: '내 재물운은 어때?' },
  { text: '연애운이 궁금해' },
  { text: '직업 적성이 뭘까?' },
  { text: '건강 조심할 부분은?' },
  { text: '오늘의 운세 알려줘' },
  { text: '올해 운세 전체적으로 어때?' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const TIME_SLOTS = [
  { value: 23, label: '자시 (23:00~01:00)' },
  { value: 1, label: '축시 (01:00~03:00)' },
  { value: 3, label: '인시 (03:00~05:00)' },
  { value: 5, label: '묘시 (05:00~07:00)' },
  { value: 7, label: '진시 (07:00~09:00)' },
  { value: 9, label: '사시 (09:00~11:00)' },
  { value: 11, label: '오시 (11:00~13:00)' },
  { value: 13, label: '미시 (13:00~15:00)' },
  { value: 15, label: '신시 (15:00~17:00)' },
  { value: 17, label: '유시 (17:00~19:00)' },
  { value: 19, label: '술시 (19:00~21:00)' },
  { value: 21, label: '해시 (21:00~23:00)' },
];

function ChatComingSoon() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">AI 상담</p>
      <h1 className="mt-3 text-2xl text-[#2F282B]" style={{ fontFamily: 'Jua, sans-serif' }}>
        준비 중입니다
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B5E58]">
        AI 상담 기능을 더 안정적으로 다듬는 중입니다.
        <br />
        오늘의 흐름·사주·궁합은 그대로 이용하실 수 있습니다.
      </p>
      <Link
        href="/today"
        className="mt-8 inline-flex rounded-2xl bg-[#2F282B] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
      >
        오늘의 흐름 보기
      </Link>
    </div>
  );
}

export default function ChatPage() {
  if (!AI_CHAT_ENABLED) return <ChatComingSoon />;
  return <ChatPageActive />;
}

function ChatPageActive() {
  const { profile, saveProfile, displayName } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [birthData, setBirthData] = useState<BirthData>({
    year: '',
    month: '',
    day: '',
    gender: '남',
    calendarType: 'solar',
    isLunar: false,
    timeMode: 'none',
    slotHour: '9',
    exactHour: '9',
    exactMinute: '0',
  });
  const [showBirthForm, setShowBirthForm] = useState(true);
  const [birthSaved, setBirthSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatHydratedRef = useRef<string | null>(null);

  function getBirthTimeLabel(data: BirthData) {
    if (data.timeMode === 'slot') {
      return TIME_SLOTS.find((slot) => String(slot.value) === data.slotHour)?.label || '시간대 선택';
    }
    if (data.timeMode === 'exact') {
      return `${String(data.exactHour).padStart(2, '0')}:${String(data.exactMinute).padStart(2, '0')}`;
    }
    return '출생시간 모름';
  }

  const startChatWithBirth = useCallback((data: BirthData, savedProfile?: UserBirthProfile | null) => {
    setBirthSaved(true);
    setShowBirthForm(false);
    const nameLine = savedProfile?.name?.trim()
      ? `${savedProfile.name.trim()}님, `
      : '';
    setMessages([{
      role: 'assistant',
      content: `안녕하세요. **운명비서**입니다.\n\n${nameLine}${data.year}년 ${data.month}월 ${data.day}일생 (${data.gender === '남' ? '남성' : '여성'}, ${data.calendarType === 'solar' ? '양력' : data.calendarType === 'lunarLeap' ? '윤달' : '음력'}, ${getBirthTimeLabel(data)}) 기준으로 맞춤 상담을 시작합니다.\n\n아래 버튼을 누르거나 직접 질문해 주세요.`,
    }]);
  }, []);

  const persistBirthToProfile = (data: BirthData) => {
    const stored: Omit<UserBirthProfile, 'savedAt'> = {
      year: data.year,
      month: data.month,
      day: data.day,
      gender: data.gender as '남' | '여',
      calendarType: data.calendarType,
      timeMode: data.timeMode,
      slotHour: Number(data.slotHour),
      exactHour: Number(data.exactHour),
      exactMinute: Number(data.exactMinute),
    };
    saveProfile(stored);
  };

  const saveBirthData = () => {
    if (!isValidBirthDate(birthData.year, birthData.month, birthData.day)) {
      alert('생년월일을 숫자로 정확히 입력해주세요!');
      return;
    }
    persistBirthToProfile(birthData);
    startChatWithBirth(birthData, profile);
  };

  useEffect(() => {
    if (birthSaved) return;
    const stored = profile ?? getUserProfile();
    if (!stored || chatHydratedRef.current === stored.savedAt) return;
    chatHydratedRef.current = stored.savedAt;
    const chatBirth = profileToChatBirthData(stored);
    setBirthData(chatBirth);
    startChatWithBirth(chatBirth, stored);
  }, [profile, birthSaved, startChatWithBirth]);

  const skipBirthData = () => {
    setShowBirthForm(false);
    setMessages([{
      role: 'assistant',
      content: '안녕하세요. **운명비서**입니다.\n\n생년월일 없이도 일반적인 운세 상담이 가능합니다.\n더 정확한 맞춤 상담을 원하시면 언제든 상단의 "생년월일 입력" 버튼을 눌러주세요.\n\n무엇이 궁금하신가요?',
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
      setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' }]);
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
    const plainContent = content.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/[•]{2,}/g, '•').trim();
    return plainContent.split('\n').map((line, i) => {
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
      <div className="mx-4 mb-3 rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(61,51,56,0.05)] shrink-0">
        <p className="text-xs tracking-[0.08em] text-[#B8A78D] mb-1">대화형 운명 상담</p>
        <h1 style={{ fontFamily: 'Jua, sans-serif' }} className="text-xl text-[#2F282B]">
          {profile ? `${displayName}의 AI 상담` : 'AI 사주 상담'}
        </h1>
        {birthSaved && profile && (
          <div className="mt-2">
            <StoredProfileBar
              profile={profile}
              onEdit={() => setShowBirthForm(true)}
            />
          </div>
        )}
        {birthSaved && !profile && (
          <p className="text-xs text-[#8A7E78] mt-1">
            {birthData.year}년 {birthData.month}월 {birthData.day}일 ({birthData.gender === '남' ? '남' : '여'}, {birthData.calendarType === 'solar' ? '양력' : birthData.calendarType === 'lunarLeap' ? '윤달' : '음력'}, {getBirthTimeLabel(birthData)})
            <button onClick={() => setShowBirthForm(true)} className="ml-2 text-[#8B6F47] underline">수정</button>
          </p>
        )}
        {!birthSaved && !showBirthForm && (
          <button onClick={() => setShowBirthForm(true)} className="text-xs text-[#8B6F47] underline mt-1">
            생년월일 입력하기
          </button>
        )}
      </div>

      {/* 생년월일 입력 폼 */}
      {showBirthForm && !birthSaved && (
        <div className="mx-4 mb-3 card shrink-0">
          <p style={{ fontFamily: 'Jua, sans-serif' }} className="text-base text-[#3D3338] mb-3">생년월일을 입력하면 맞춤 상담이 가능합니다.</p>
          <div className="space-y-3">
            <div className="flex gap-2">
              {['남', '여'].map((g) => (
                <button
                  key={g}
                  onClick={() => setBirthData(prev => ({ ...prev, gender: g }))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                    birthData.gender === g ? 'border-[#8B6F47] bg-[#FAF8F5] text-[#2F282B]' : 'border-[#D9C8C0] bg-white text-[#5A4E48]'
                  }`}
                  style={{ fontFamily: 'Jua, sans-serif' }}
                >
                  {g}
                </button>
              ))}
              {[
                { value: 'solar' as const, label: '양력' },
                { value: 'lunar' as const, label: '음력' },
                { value: 'lunarLeap' as const, label: '윤달' },
              ].map((calendar) => (
                <button
                  key={calendar.value}
                  onClick={() => setBirthData(prev => ({
                    ...prev,
                    calendarType: calendar.value,
                    isLunar: calendar.value !== 'solar',
                  }))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                    birthData.calendarType === calendar.value ? 'border-[#8B6F47] bg-[#FAF8F5] text-[#2F282B]' : 'border-[#D9C8C0] bg-white text-[#5A4E48]'
                  }`}
                  style={{ fontFamily: 'Jua, sans-serif' }}
                >
                  {calendar.label}
                </button>
              ))}
            </div>
            <BirthDateNumberInputs
              year={birthData.year}
              month={birthData.month}
              day={birthData.day}
              onYearChange={(value) => setBirthData(prev => ({ ...prev, year: value }))}
              onMonthChange={(value) => setBirthData(prev => ({ ...prev, month: value }))}
              onDayChange={(value) => setBirthData(prev => ({ ...prev, day: value }))}
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#5A4E48]">태어난 시간</p>
              <div className="flex gap-2">
                {[
                  { value: 'none' as const, label: '모름' },
                  { value: 'slot' as const, label: '시간대' },
                  { value: 'exact' as const, label: '정확히' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setBirthData(prev => ({ ...prev, timeMode: mode.value }))}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      birthData.timeMode === mode.value ? 'border-[#8B6F47] bg-[#FAF8F5] text-[#2F282B]' : 'border-[#D9C8C0] bg-white text-[#5A4E48]'
                    }`}
                    style={{ fontFamily: 'Jua, sans-serif' }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              {birthData.timeMode === 'slot' && (
                <select
                  value={birthData.slotHour}
                  onChange={(e) => setBirthData(prev => ({ ...prev, slotHour: e.target.value }))}
                  className="w-full p-2 rounded-xl text-sm"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              )}
              {birthData.timeMode === 'exact' && (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={birthData.exactHour}
                    onChange={(e) => setBirthData(prev => ({ ...prev, exactHour: e.target.value }))}
                    className="p-2 rounded-xl text-sm"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, '0')}시</option>)}
                  </select>
                  <select
                    value={birthData.exactMinute}
                    onChange={(e) => setBirthData(prev => ({ ...prev, exactMinute: e.target.value }))}
                    className="p-2 rounded-xl text-sm"
                  >
                    {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>)}
                  </select>
                </div>
              )}
              {birthData.timeMode === 'none' && (
                <p className="rounded-xl border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-2 text-xs text-[#8A7E78]">
                  출생 시간을 모르면 시주는 제외하고 상담합니다.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveBirthData}
                className="flex-1 py-2 rounded-xl text-white text-sm font-bold"
                style={{ fontFamily: 'Jua, sans-serif', backgroundColor: '#7B7355' }}
              >
                저장하고 상담 시작
              </button>
              <button
                onClick={skipBirthData}
                className="py-2 px-4 rounded-xl text-sm font-bold border border-[#D9C8C0] text-[#8A7E78]"
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
            <p style={{ fontFamily: 'Jua, sans-serif' }} className="text-lg text-[#3D3338]">운명비서와 대화해보세요!</p>
            <p className="text-sm text-[#8A7E78]">아래 버튼이나 직접 입력으로 질문하세요</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E2D7D0] shrink-0 mr-2 mt-1" />
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#2F282B] text-white rounded-br-md'
                  : 'bg-white border border-[#E2D7D0] text-[#3D3338] rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E2D7D0] shrink-0 mr-2" />
            <div className="bg-white border border-[#E2D7D0] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#8B6F47] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#8B6F47] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#8B6F47] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                className="px-3 py-1.5 rounded-full border border-[#D9C8C0] bg-white text-sm text-[#5A4E48] hover:border-[#8B6F47] hover:bg-[#FAF8F5] transition-all disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      {!showBirthForm && (
        <div className="px-4 py-3 shrink-0 border-t border-[#E2D7D0] bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 것을 물어보세요..."
              disabled={loading}
              className="flex-1 p-3 rounded-2xl border border-[#D9C8C0] bg-white text-[#3D3338] focus:border-[#8B6F47] outline-none disabled:opacity-50"
              style={{ fontSize: '16px', fontWeight: 500 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl text-white text-base disabled:opacity-50 transition-all active:scale-95"
              style={{ fontFamily: 'Jua, sans-serif', backgroundColor: '#7B7355' }}
            >
              {loading ? '...' : '전송'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
