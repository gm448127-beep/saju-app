'use client';

import { useState } from 'react';

interface TarotCard {
  name: string;
  english: string;
  isReversed: boolean;
  position: string;
  meaning: string;
  advice: string;
  suit?: string;
  rank?: string;
}

const CARD_VISUALS: Record<string, { symbol: string; motif: string; tone: string }> = {
  바보: { symbol: '旅', motif: '새로운 길', tone: 'from-[#FFF8E8] to-[#E8D7B8]' },
  마법사: { symbol: '術', motif: '의지와 도구', tone: 'from-[#FFF7EF] to-[#E7CDB6]' },
  여사제: { symbol: '月', motif: '조용한 직감', tone: 'from-[#F8F5FF] to-[#D9CDE8]' },
  여황제: { symbol: '豊', motif: '풍요와 성장', tone: 'from-[#FFF7F2] to-[#E8C9BC]' },
  황제: { symbol: '權', motif: '기준과 책임', tone: 'from-[#F7F1EA] to-[#D8C0A6]' },
  교황: { symbol: '導', motif: '조언과 기준', tone: 'from-[#FBF8EF] to-[#E1D4B7]' },
  연인: { symbol: '緣', motif: '마음의 선택', tone: 'from-[#FFF4F4] to-[#E9C2C2]' },
  전차: { symbol: '進', motif: '전진과 승부', tone: 'from-[#F3F7FF] to-[#C8D4E8]' },
  힘: { symbol: '柔', motif: '부드러운 힘', tone: 'from-[#FFF8EC] to-[#E6CEAA]' },
  은둔자: { symbol: '燈', motif: '내면의 등불', tone: 'from-[#F8F7F2] to-[#D9D1C2]' },
  '운명의 수레바퀴': { symbol: '輪', motif: '흐름의 전환', tone: 'from-[#FFF9EE] to-[#E3D1A8]' },
  정의: { symbol: '衡', motif: '균형과 판단', tone: 'from-[#F7FAF8] to-[#C9D8CF]' },
  '매달린 사람': { symbol: '待', motif: '멈춤의 의미', tone: 'from-[#F8F5EF] to-[#D9CCB8]' },
  죽음: { symbol: '轉', motif: '끝과 전환', tone: 'from-[#F7F3F1] to-[#CDBFB9]' },
  절제: { symbol: '和', motif: '조율과 회복', tone: 'from-[#F7FBF8] to-[#CBE0D1]' },
  악마: { symbol: '執', motif: '집착의 확인', tone: 'from-[#F9F2EF] to-[#D8B8AE]' },
  탑: { symbol: '破', motif: '균열과 각성', tone: 'from-[#F8F4EF] to-[#D6BCA2]' },
  별: { symbol: '星', motif: '희망과 회복', tone: 'from-[#F7FAFF] to-[#C9D8EA]' },
  달: { symbol: '夢', motif: '불확실한 감정', tone: 'from-[#FAF7FF] to-[#D6C7E4]' },
  태양: { symbol: '日', motif: '밝은 성취', tone: 'from-[#FFF8E4] to-[#E9CF88]' },
  심판: { symbol: '醒', motif: '다시 부름', tone: 'from-[#F9F7F2] to-[#D9CBB4]' },
  세계: { symbol: '完', motif: '완성과 다음 문', tone: 'from-[#F7FBF8] to-[#CBDCCF]' },
};

const TOPICS = ['일반', '연애', '재물', '직업', '관계', '선택'];

const QUESTION_GUIDE = [
  '예/아니오보다 “어떤 태도가 좋을까요?”처럼 물어보면 더 선명합니다.',
  '상대의 마음을 단정하기보다 “이 관계에서 내가 볼 점은?”처럼 물어보세요.',
  '기간을 넣으면 좋습니다. 예: 이번 달, 지금 단계, 앞으로 3개월.',
];

const SAMPLE_QUESTIONS = [
  '지금 이 선택을 해도 괜찮을까요?',
  '그 사람과의 관계 흐름이 궁금합니다.',
  '지금 하는 일을 계속 밀고 가도 될까요?',
  '돈 문제에서 조심해야 할 점이 있을까요?',
];

const SUIT_ART = {
  완드: { icon: '✦', line: 'bg-[#B89968]', mark: 'WANDS' },
  컵: { icon: '◡', line: 'bg-[#7EA4B8]', mark: 'CUPS' },
  소드: { icon: '◇', line: 'bg-[#8C9AAE]', mark: 'SWORDS' },
  펜타클: { icon: '◆', line: 'bg-[#9B875E]', mark: 'PENTACLES' },
} as const;

function renderContent(content: string) {
  return content.split('\n').map((line, index) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIndex} className="text-[#2F282B]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={partIndex}>{part}</span>;
    });

    if (line.trim() === '') return <br key={index} />;
    if (line.startsWith('- ')) {
      return (
        <p key={index} className="mb-1 pl-3 text-sm leading-relaxed text-[#4A403B]">
          {rendered}
        </p>
      );
    }
    return (
      <p key={index} className="mb-1 text-sm leading-relaxed text-[#4A403B]">
        {rendered}
      </p>
    );
  });
}

function getCardVisual(name: string) {
  if (CARD_VISUALS[name]) return CARD_VISUALS[name];
  if (name.startsWith('완드')) return { symbol: '火', motif: '의지와 추진력', tone: 'from-[#FFF8E8] to-[#E7C28F]' };
  if (name.startsWith('컵')) return { symbol: '水', motif: '감정과 관계', tone: 'from-[#F3FAFF] to-[#BFD8E8]' };
  if (name.startsWith('소드')) return { symbol: '風', motif: '생각과 판단', tone: 'from-[#F7FAFF] to-[#CBD3E4]' };
  if (name.startsWith('펜타클')) return { symbol: '土', motif: '현실과 결과', tone: 'from-[#FAF7EE] to-[#D8C6A4]' };
  return { symbol: '命', motif: '선택의 신호', tone: 'from-[#FFFDF8] to-[#E8D7C4]' };
}

function getRankLabel(rank?: string) {
  if (!rank) return '';
  const labels: Record<string, string> = {
    에이스: 'A',
    페이지: 'P',
    나이트: 'N',
    퀸: 'Q',
    킹: 'K',
  };
  return labels[rank] ?? rank;
}

function TarotCardArtwork({ card }: { card: TarotCard }) {
  const visual = getCardVisual(card.name);
  const suitArt = card.suit ? SUIT_ART[card.suit as keyof typeof SUIT_ART] : null;
  const rankLabel = getRankLabel(card.rank);
  const isCourt = ['페이지', '나이트', '퀸', '킹'].includes(card.rank ?? '');
  const numericCount = card.rank && /^\d+$/.test(card.rank) ? Number(card.rank) : card.rank === '에이스' ? 1 : 0;

  return (
    <div className={`relative mt-3 min-h-[310px] overflow-hidden rounded-[24px] border border-[#D9C8C0] bg-gradient-to-br ${visual.tone} px-4 py-5 text-center shadow-[0_16px_34px_rgba(61,51,56,0.10)]`}>
      <div className="absolute inset-3 rounded-[20px] border border-white/80" />
      <div className="absolute inset-6 rounded-[16px] border border-[#8B6F47]/15" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/35" />
      <div className="absolute -bottom-12 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full border border-white/75" />

      <div className="relative flex min-h-[270px] flex-col justify-between">
        <div className="flex items-center justify-between text-[#8B6F47]">
          <div className="text-left">
            <p className="text-[10px] font-bold tracking-[0.18em]">UNMYEONG</p>
            <p className="text-[9px] font-semibold tracking-[0.14em]">TAROT DECK</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/50 text-sm font-bold">
            {rankLabel || visual.symbol}
          </div>
        </div>

        <div className={`${card.isReversed ? 'rotate-180' : ''} relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-white/85 bg-white/35 shadow-inner transition-transform`}>
          <div className="absolute h-32 w-32 rounded-full border border-[#8B6F47]/20" />
          <div className="absolute h-px w-28 bg-[#8B6F47]/20" />
          <div className="absolute h-28 w-px bg-[#8B6F47]/20" />

          {suitArt && numericCount > 0 && !isCourt ? (
            <div className="grid max-w-[118px] grid-cols-3 gap-2">
              {Array.from({ length: numericCount }).map((_, index) => (
                <span
                  key={index}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/55 text-sm font-bold text-[#2F282B]"
                >
                  {suitArt.icon}
                </span>
              ))}
            </div>
          ) : suitArt && isCourt ? (
            <div className="space-y-2 text-[#2F282B]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-white/60 text-4xl">
                {card.rank === '페이지' ? '書' : card.rank === '나이트' ? '馬' : card.rank === '퀸' ? '后' : '王'}
              </div>
              <div className={`mx-auto h-1 w-20 rounded-full ${suitArt.line}`} />
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#8B6F47]">{suitArt.mark}</p>
            </div>
          ) : (
            <div className="space-y-2 text-[#2F282B]">
              <div className="text-7xl" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {visual.symbol}
              </div>
              <div className="mx-auto h-1 w-20 rounded-full bg-[#8B6F47]/45" />
            </div>
          )}
        </div>

        <div>
          <p className="text-2xl text-[#2F282B]" style={{ fontFamily: 'Jua, sans-serif' }}>
            {card.name}
          </p>
          <p className="mt-1 text-xs text-[#6B5E58]">{card.english}</p>
          <p className="mt-2 text-[11px] font-semibold text-[#8B6F47]">{visual.motif}</p>
          {card.isReversed && (
            <p className="mt-2 inline-flex rounded-full bg-white/75 px-2 py-1 text-[10px] font-bold text-[#8B6F47]">
              역방향
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TarotPage() {
  const [topic, setTopic] = useState('일반');
  const [question, setQuestion] = useState('');
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3) {
      setError('타로로 보고 싶은 질문을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setCards([]);
    setReading('');

    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuestion, topic }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '타로 리딩을 불러오지 못했습니다.');
        return;
      }

      setCards(data.cards || []);
      setReading(data.reading || '');
    } catch (submitError) {
      console.error('타로 요청 실패:', submitError);
      setError('잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white px-5 py-7 shadow-[0_18px_48px_rgba(61,51,56,0.07)] sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F3E8D5]" />
        <div className="absolute -bottom-28 left-6 h-72 w-72 rounded-full bg-[#FFF7E8]" />
        <div className="relative">
          <p className="mb-3 inline-flex rounded-full border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-1 text-xs font-semibold text-[#8B6F47]">
            TAROT REPORT
          </p>
          <h1 className="text-3xl leading-tight text-[#2F282B] sm:text-5xl" style={{ fontFamily: 'Jua, sans-serif' }}>
            선택 앞에서 필요한 조언을
            <br />
            세 장의 카드로 정리해드릴게요
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4A403B]">
            78장 전체 덱으로 현재 상황과 다음 행동을 정리합니다. 타로를 무서운 예언이 아니라 선택 기준을 세우는 상징 리포트로 풀어드립니다.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="mb-4">
            <h2 className="label mb-1">타로 질문 입력</h2>
            <p className="text-xs text-[#8A7E78]">한 가지 질문을 구체적으로 적을수록 리딩이 선명해집니다.</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  topic === item
                    ? 'border-[#8B6F47] bg-[#2F282B] text-white'
                    : 'border-[#D9C8C0] bg-white text-[#5A4E48] hover:bg-[#FAF8F5]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="예: 지금 이 사람과 관계를 더 이어가도 괜찮을까요?"
            className="min-h-[150px] w-full resize-none rounded-2xl border-2 border-[#D9C8C0] bg-white px-4 py-3 text-base text-[#2F282B] outline-none focus:border-[#8B6F47]"
          />

          <div className="mt-4 rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.12em] text-[#8B6F47]">CARD PICKING</p>
                <p className="text-sm font-bold text-[#2F282B]">질문을 떠올리고 카드를 섞어주세요</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#8B6F47]">78장 덱</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex min-h-[110px] items-center justify-center rounded-2xl border border-[#D9C8C0] bg-gradient-to-br from-[#2F282B] to-[#8B6F47] shadow-[0_8px_18px_rgba(61,51,56,0.08)]"
                  style={{ transform: `rotate(${item === 0 ? -2 : item === 1 ? 1 : 2}deg)` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F4E7D6]/45 text-xl font-bold text-[#F4E7D6]">
                    命
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6B5E58]">
              버튼을 누르면 전체 78장 중 세 장이 섞여 뽑히고, 현재 상황 · 다가오는 흐름 · 조언으로 펼쳐집니다.
            </p>
          </div>

          {error && (
            <p className="mt-3 rounded-2xl border border-[#D9C8C0] bg-[#FAF8F5] px-4 py-3 text-sm text-[#8A4A3D]">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-[#2F282B] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2F282B]/15 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? '카드를 섞고 뽑는 중...' : '카드 섞고 3장 뽑기'}
          </button>
        </div>

        <aside className="self-start rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] p-5 shadow-[0_10px_30px_rgba(61,51,56,0.06)]">
          <p className="mb-2 text-xs tracking-[0.12em] text-[#8B6F47]">질문 가이드</p>
          <h2 className="mb-3 text-xl text-[#2F282B]" style={{ fontFamily: 'Jua, sans-serif' }}>
            질문이 좋아야 리딩이 선명합니다
          </h2>
          <div className="mb-4 space-y-2">
            {QUESTION_GUIDE.map((guide) => (
              <p key={guide} className="rounded-2xl border border-[#E2D7D0] bg-white px-3 py-2.5 text-xs leading-relaxed text-[#4A403B]">
                {guide}
              </p>
            ))}
          </div>
          <p className="mb-2 text-xs tracking-[0.12em] text-[#8B6F47]">질문 예시</p>
          <div className="space-y-2">
            {SAMPLE_QUESTIONS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setQuestion(sample)}
                className="w-full rounded-2xl border border-[#E2D7D0] bg-white px-3 py-2.5 text-left text-sm text-[#3D3338] transition hover:bg-[#FFFDF9]"
              >
                {sample}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#6B5E58]">
            타로는 결정 대신 선택 기준을 정리하는 도구입니다. 중요한 결정은 현실 정보와 함께 판단해주세요.
          </p>
        </aside>
      </section>

      {cards.length > 0 && (
        <section className="card animate-fade-in">
          <div className="mb-4">
            <p className="text-xs tracking-[0.12em] text-[#8B6F47]">THREE CARD SPREAD</p>
            <h2 className="label mt-1">뽑힌 카드</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cards.map((card) => {
              return (
                <div key={`${card.position}-${card.name}`} className="rounded-[22px] border border-[#E2D7D0] bg-[#FAF8F5] p-4">
                  <p className="text-xs font-semibold text-[#8B6F47]">{card.position}</p>
                  <TarotCardArtwork card={card} />
                  <p className="mt-3 text-sm font-bold text-[#2F282B]">{card.meaning}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#6B5E58]">{card.advice}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {reading && (
        <section className="card animate-fade-in">
          <div className="mb-4">
            <p className="text-xs tracking-[0.12em] text-[#8B6F47]">TAROT INTERPRETATION</p>
            <h2 className="label mt-1">운명비서 타로 리딩</h2>
          </div>
          <div className="rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
            {renderContent(reading)}
          </div>
        </section>
      )}
    </div>
  );
}
