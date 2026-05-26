'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildTarotFavoriteId,
  deleteTarotFavorite,
  extractTarotExcerpt,
  hasTarotFavorite,
  saveTarotFavorite,
} from '@/lib/archive-storage';

interface TarotCard {
  name: string;
  english: string;
  isReversed: boolean;
  position: string;
  meaning: string;
  advice: string;
  image?: string;
  suit?: string;
  rank?: string;
}

const CARD_VISUALS: Record<string, { symbol: string; motif: string; tone: string }> = {
  �?보: { symbol: '??, motif: '??�???�?, tone: 'from-[#FFF8E8] to-[#E8D7B8]' },
  �?�??? { symbol: '�?, motif: '??�??? ??구', tone: 'from-[#FFF7EF] to-[#E7CDB6]' },
  ?��?�?? { symbol: '??, motif: '조�?�??직감', tone: 'from-[#F8F5FF] to-[#D9CDE8]' },
  ?��?�?? { symbol: '�?, motif: '?��???? ?��?�', tone: 'from-[#FFF7F2] to-[#E8C9BC]' },
  ?��?: { symbol: '�?, motif: '기�?�?�?�??', tone: 'from-[#F7F1EA] to-[#D8C0A6]' },
  교�?�: { symbol: '�?, motif: '조�?��?기�?', tone: 'from-[#FBF8EF] to-[#E1D4B7]' },
  ?�인: { symbol: '�?, motif: '�?�????��?�', tone: 'from-[#FFF4F4] to-[#E9C2C2]' },
  ??차: { symbol: '??, motif: '??�?�??��?', tone: 'from-[#F3F7FF] to-[#C8D4E8]' },
  ?? { symbol: '??, motif: '�???�?�????, tone: 'from-[#FFF8EC] to-[#E6CEAA]' },
  ????�?�: { symbol: '??, motif: '?�면???��?', tone: 'from-[#F8F7F2] to-[#D9D1C2]' },
  '?��?????�?�?�??: { symbol: '�?, motif: '?��?????�??', tone: 'from-[#FFF9EE] to-[#E3D1A8]' },
  ??�?: { symbol: '�?, motif: '균�??�??��?�', tone: 'from-[#F7FAF8] to-[#C9D8CF]' },
  '매�?��??��??': { symbol: '�?, motif: '�?춤????�?', tone: 'from-[#F8F5EF] to-[#D9CCB8]' },
  죽�?: { symbol: '�?, motif: '?�과 ??�??', tone: 'from-[#F7F3F1] to-[#CDBFB9]' },
  ??�?: { symbol: '??, motif: '조�?��???복', tone: 'from-[#F7FBF8] to-[#CBE0D1]' },
  ??�?: { symbol: '??, motif: '�?착????인', tone: 'from-[#F9F2EF] to-[#D8B8AE]' },
  ?? { symbol: '??, motif: '균�?��?각�?�', tone: 'from-[#F8F4EF] to-[#D6BCA2]' },
  �? { symbol: '??, motif: '?�망�???복', tone: 'from-[#F7FAFF] to-[#C9D8EA]' },
  ?? { symbol: '�?, motif: '�?�???��?? 감�?', tone: 'from-[#FAF7FF] to-[#D6C7E4]' },
  ??�??: { symbol: '??, motif: '밝�? ?�취', tone: 'from-[#FFF8E4] to-[#E9CF88]' },
  ?��?�: { symbol: '??, motif: '?��?? �?�?, tone: 'from-[#F9F7F2] to-[#D9CBB4]' },
  ?��?: { symbol: '�?, motif: '??�?��??��? �?, tone: 'from-[#F7FBF8] to-[#CBDCCF]' },
};

const TOPICS = ['?��?', '?��?�', '?�물', '직�??', '�?�?, '?��?�'];

const TIME_HORIZONS = ['�?�?, '3�?�?? ??, '1????, '2????] as const;

const QUESTION_GUIDE = [
  '????�???�보????�?�????�?�? �?�?�?�????��???물�?�보면 ???��??��????',
  '?��???�?�????��???기보�?� ??이 �?�?�?�???��? �??��???��???물�?�보�?�??',
  '기�????��?��?�?�?�??�?�. ?? ?��? ?? 3�?�?? ?? 1???? 2????�? 모�?�.',
  '미�?? �?문?? ??�???��?�??�?�???�??��?? ?�경?��????��?�?�고 물�?�보면 리�?�??�?�?��?�????',
];

const SAMPLE_QUESTIONS = [
  '�?�????��?�???��? �?찮??�???',
  '3�?�?? ?????��? ?��?� ?��??��???',
  '1????�? ??�?? ?��?� 모�?�??�?�?�?��?�???',
  '2?????��?�??모�?�, 카�??�? 보�?�주�?? 방�?�???',
  '�??��??과�? �?�??��???궁�??��????',
];

function getHorizonFromQuestion(text: string): (typeof TIME_HORIZONS)[number] {
  if (text.includes('2????)) return '2????;
  if (text.includes('1????)) return '1????;
  if (text.includes('3�?�?? ??)) return '3�?�?? ??;
  return '�?�?;
}

const SUIT_ART = {
  ??�??: { icon: '??, line: 'bg-[#B89968]', mark: 'WANDS' },
  �? { icon: '??, line: 'bg-[#7EA4B8]', mark: 'CUPS' },
  ??�??: { icon: '??, line: 'bg-[#8C9AAE]', mark: 'SWORDS' },
  ??�??? { icon: '??, line: 'bg-[#9B875E]', mark: 'PENTACLES' },
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
  if (name.startsWith('??�??')) return { symbol: '??, motif: '??�??? �?�???, tone: 'from-[#FFF8E8] to-[#E7C28F]' };
  if (name.startsWith('�?)) return { symbol: '�?, motif: '감�?�?�?�?, tone: 'from-[#F3FAFF] to-[#BFD8E8]' };
  if (name.startsWith('??�??')) return { symbol: '�?, motif: '?�각�??��?�', tone: 'from-[#F7FAFF] to-[#CBD3E4]' };
  if (name.startsWith('??�???)) return { symbol: '??, motif: '??�?��?결과', tone: 'from-[#FAF7EE] to-[#D8C6A4]' };
  return { symbol: '??, motif: '?��?�???��?�', tone: 'from-[#FFFDF8] to-[#E8D7C4]' };
}

function getRankLabel(rank?: string) {
  if (!rank) return '';
  const labels: Record<string, string> = {
    ?�이?? 'A',
    ??이�?: 'P',
    ??이?? 'N',
    ?? 'Q',
    ?? 'K',
  };
  return labels[rank] ?? rank;
}

function TarotCardArtwork({ card }: { card: TarotCard }) {
  const [imageFailed, setImageFailed] = useState(false);
  const visual = getCardVisual(card.name);
  const suitArt = card.suit ? SUIT_ART[card.suit as keyof typeof SUIT_ART] : null;
  const rankLabel = getRankLabel(card.rank);
  const isCourt = ['??이�?', '??이??, '??, '??].includes(card.rank ?? '');
  const numericCount = card.rank && /^\d+$/.test(card.rank) ? Number(card.rank) : card.rank === '?�이?? ? 1 : 0;
  const shouldShowImage = Boolean(card.image && !imageFailed);

  return (
    <div className={`relative mt-3 min-h-[310px] overflow-hidden rounded-[24px] border border-[#D9C8C0] bg-gradient-to-br ${visual.tone} px-4 py-5 text-center shadow-[0_16px_34px_rgba(61,51,56,0.10)]`}>
      <div className="absolute inset-3 rounded-[20px] border border-white/80" />
      <div className="absolute inset-6 rounded-[16px] border border-[#8B6F47]/15" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/35" />
      <div className="absolute -bottom-12 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full border border-white/75" />

      {shouldShowImage ? (
        <div className="relative min-h-[270px] overflow-hidden rounded-[18px] border border-white/80 bg-white/30">
          <img
            src={card.image}
            alt={`${card.name} ??�?카�?? ?��?�?`}
            className={`${card.isReversed ? 'rotate-180' : ''} h-[270px] w-full object-cover transition-transform`}
            draggable={false}
            onError={() => setImageFailed(true)}
          />
          <div className="pointer-events-none absolute inset-2 rounded-[14px] border border-white/70" />
          {card.isReversed && (
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-[#8B6F47]">
              ??��??            </p>
          )}
        </div>
      ) : (
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
                {card.rank === '??이�?' ? '?? : card.rank === '??이?? ? '�? : card.rank === '?? ? '?? : '??}
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
              ??��??            </p>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default function TarotPage() {
  const [topic, setTopic] = useState('?��?');
  const [timeHorizon, setTimeHorizon] = useState<(typeof TIME_HORIZONS)[number]>('�?�?);
  const [question, setQuestion] = useState('');
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const favoriteId = useMemo(() => {
    if (!reading || cards.length === 0) return '';
    return buildTarotFavoriteId(question.trim(), timeHorizon, cards.map((card) => card.name));
  }, [reading, cards, question, timeHorizon]);

  useEffect(() => {
    if (!favoriteId) {
      setIsFavorite(false);
      return;
    }
    setIsFavorite(hasTarotFavorite(favoriteId));
  }, [favoriteId]);

  const toggleFavorite = () => {
    if (!favoriteId || !reading) return;
    if (isFavorite) {
      deleteTarotFavorite(favoriteId);
      setIsFavorite(false);
      return;
    }
    saveTarotFavorite({
      savedAt: new Date().toISOString(),
      id: favoriteId,
      question: question.trim(),
      timeHorizon,
      cardNames: cards.map((card) => card.name),
      excerpt: extractTarotExcerpt(reading),
    });
    setIsFavorite(true);
  };

  const handleSubmit = async () => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3) {
      setError('??�?�? 보고 ?��? �?문????력?�주?��??.');
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
        body: JSON.stringify({ question: trimmedQuestion, topic, timeHorizon }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '??�?리�?�??�?�?�?��? 못�???��????');
        return;
      }

      setCards(data.cards || []);
      setReading(data.reading || '');
    } catch (submitError) {
      console.error('??�???청 ?��?�:', submitError);
      setError('?��?? ???��?? ??�??�주?��??.');
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
            ?��?� ??�?�????�????조�?�??            <br />
            ???��? 카�??�???리?��??릴�???          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4A403B]">
            78????체 ?��?��???�?�?? 미�?????��?????리?��???? 3�?�??·1??�?????�? 모�?�??카�??�? �?�???�??��?? ?�경?��? ???��??립�????
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="mb-4">
            <h2 className="label mb-1">??�?�?문 ??력</h2>
            <p className="text-xs text-[#8A7E78]">??�?�? �?문??구체?��?��??��???록 리�?�???��??��???�?�.</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  topic === item
                    ? 'border-[#8B6F47] bg-[#7B7355] text-white'
                    : 'border-[#D9C8C0] bg-white text-[#5A4E48] hover:bg-[#FAF8F5]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-bold text-[#8B6F47]">??�?�?/p>
            <div className="flex flex-wrap gap-2">
              {TIME_HORIZONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTimeHorizon(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    timeHorizon === item
                      ? 'border-[#C49A4A] bg-[#FFF8EE] text-[#8B6F47]'
                      : 'border-[#D9C8C0] bg-white text-[#5A4E48] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            {timeHorizon !== '�?�? && (
              <p className="mt-2 text-xs leading-relaxed text-[#6B5E58]">
                {timeHorizon}�??��?�??면 카�?? ??�?�? 미�?? ??�?� ?��????�??�?�?�??고, ??�?�?�이 �?�????�경�?�?� ??�?�?��?��????��??립�????
              </p>
            )}
          </div>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="?? �?�????��??�?�?�?�? ???��?��???�?찮??�???"
            className="min-h-[150px] w-full resize-none rounded-2xl border-2 border-[#D9C8C0] bg-white px-4 py-3 text-base text-[#2F282B] outline-none focus:border-[#8B6F47]"
          />

          <div className="mt-4 rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.12em] text-[#8B6F47]">CARD PICKING</p>
                <p className="text-sm font-bold text-[#2F282B]">�?문???��?�리고 카�??�???�?�주�?�??/p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#8B6F47]">78????/span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex min-h-[110px] items-center justify-center rounded-2xl border border-[#D9C8C0] bg-gradient-to-br from-[#2F282B] to-[#8B6F47] shadow-[0_8px_18px_rgba(61,51,56,0.08)]"
                  style={{ transform: `rotate(${item === 0 ? -2 : item === 1 ? 1 : 2}deg)` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F4E7D6]/45 text-xl font-bold text-[#F4E7D6]">
                    ??                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6B5E58]">
              {timeHorizon === '�?�?
                ? '�?�?�????르�???체 78??�????�이 ??�?� �?�??�? ??�?� ?��?� · ?��??��?? ?��? · 조�?�?��? ?�쳐�?�????'
                : `�?�?�????르�?${timeHorizon} ??�?� ?��????�??�????�이 ?�쳐�?�????`}
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
            className="mt-5 w-full rounded-2xl bg-[#7B7355] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7B7355]/15 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? '카�??�???고 �?�?? �?..' : '카�?? ??고 3??�?기'}
          </button>
        </div>

        <aside className="self-start rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] p-5 shadow-[0_10px_30px_rgba(61,51,56,0.06)]">
          <p className="mb-2 text-xs tracking-[0.12em] text-[#8B6F47]">�?문 �??��??</p>
          <h2 className="mb-3 text-xl text-[#2F282B]" style={{ fontFamily: 'Jua, sans-serif' }}>
            �?문??�?�????리�?�???��??��????          </h2>
          <div className="mb-4 space-y-2">
            {QUESTION_GUIDE.map((guide) => (
              <p key={guide} className="rounded-2xl border border-[#E2D7D0] bg-white px-3 py-2.5 text-xs leading-relaxed text-[#4A403B]">
                {guide}
              </p>
            ))}
          </div>
          <p className="mb-2 text-xs tracking-[0.12em] text-[#8B6F47]">�?문 ??�??</p>
          <div className="space-y-2">
            {SAMPLE_QUESTIONS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuestion(sample);
                  setTimeHorizon(getHorizonFromQuestion(sample));
                }}
                className="w-full rounded-2xl border border-[#E2D7D0] bg-white px-3 py-2.5 text-left text-sm text-[#3D3338] transition hover:bg-[#FFFDF9]"
              >
                {sample}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#6B5E58]">
            ??�?�?? 결�? ?????��?� 기�?????리??�?? ??구??�???? �?�????결�??? ??�?� ??보?? ?��? ?��?�?�주?��??.
          </p>
        </aside>
      </section>

      {cards.length > 0 && (
        <section className="card animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div>
              <p className="text-xs tracking-[0.12em] text-[#8B6F47]">THREE CARD SPREAD</p>
              <h2 className="label mt-1">�?�?? 카�??</h2>
            </div>
            {timeHorizon !== '�?�? && (
              <span className="rounded-full border border-[#C49A4A]/30 bg-[#FFF8EE] px-2.5 py-1 text-[10px] font-bold text-[#8B6F47]">
                {timeHorizon} ??�?�
              </span>
            )}
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.12em] text-[#8B6F47]">TAROT INTERPRETATION</p>
              <h2 className="label mt-1">?��?�?�?? ??�?리�?�</h2>
            </div>
            <button
              type="button"
              onClick={toggleFavorite}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                isFavorite
                  ? 'border-[#C49A4A] bg-[#FFF8EE] text-[#8B6F47]'
                  : 'border-[#E2D7D0] bg-white text-[#6B5E58] hover:bg-[#FFFDF9]'
              }`}
            >
              {isFavorite ? '즐겨찾기 ?��?' : '즐겨찾기 ????}
            </button>
          </div>
          <div className="rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
            {renderContent(reading)}
          </div>
        </section>
      )}
    </div>
  );
}
