'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildTarotFavoriteId,
  deleteTarotFavorite,
  extractTarotExcerpt,
  hasTarotFavorite,
  saveTarotFavorite,
} from '@/lib/archive-storage';
import { getTarotImageCandidates } from '@/lib/tarot-assets';

interface TarotCard {
  id?: number;
  name: string;
  english: string;
  isReversed: boolean;
  position: string;
  meaning: string;
  advice: string;
  image: string;
  keywordsLeft?: string[];
  keywordsRight?: string[];
}

const TOPICS = ['일반', '연애', '재물', '직업', '관계', '선택'];

const TIME_HORIZONS = ['지금', '3개월 후', '1년 후', '2년 후'] as const;

const QUESTION_GUIDE = [
  '예/아니오보다 “어떤 태도가 좋을까요?”처럼 물어보면 더 선명합니다.',
  '상대의 마음을 단정하기보다 “이 관계에서 내가 볼 점은?”처럼 물어보세요.',
  '기간을 넣으면 좋습니다. 예: 이번 달, 3개월 후, 1년 후, 2년 후의 모습.',
  '미래 질문은 “수호신이 비추는 가능한 풍경”처럼 열어두고 물어보면 리딩이 깊어집니다.',
];

const SAMPLE_QUESTIONS = [
  '지금 이 선택을 해도 괜찮을까요?',
  '3개월 후 이 일은 어떤 흐름일까요?',
  '1년 후의 나는 어떤 모습에 가까울까요?',
  '2년 후 당신의 모습, 카드가 보여주는 방향은?',
  '그 사람과의 관계 흐름이 궁금합니다.',
];

function getHorizonFromQuestion(text: string): (typeof TIME_HORIZONS)[number] {
  if (text.includes('2년 후')) return '2년 후';
  if (text.includes('1년 후')) return '1년 후';
  if (text.includes('3개월 후')) return '3개월 후';
  return '지금';
}

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

function TarotCardArtwork({ card }: { card: TarotCard }) {
  const imageCandidates = useMemo(
    () => getTarotImageCandidates(card.image, card.english),
    [card.image, card.english],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const imageSrc = imageCandidates[imageIndex];
  const shouldShowImage = Boolean(imageSrc && imageIndex < imageCandidates.length);

  useEffect(() => {
    setImageIndex(0);
  }, [card.image, card.english]);

  const handleImageError = () => {
    setImageIndex((current) => current + 1);
  };

  return (
    <div className="relative mt-3 min-h-[310px] overflow-hidden rounded-[24px] border border-[#D9C8C0] bg-[#FAF8F5] px-4 py-5 text-center shadow-[0_16px_34px_rgba(61,51,56,0.10)]">
      {shouldShowImage ? (
        <div className="relative min-h-[270px] overflow-hidden rounded-[18px] border border-[#E2D7D0] bg-white">
          <img
            src={imageSrc}
            alt={`${card.name} 타로 카드`}
            className={`${card.isReversed ? 'rotate-180' : ''} mx-auto h-[270px] w-full max-w-[200px] object-contain transition-transform`}
            draggable={false}
            onError={handleImageError}
          />
          {card.isReversed && (
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-[#8B6F47] shadow-sm">
              역방향
            </p>
          )}
        </div>
      ) : (
        <div className="flex min-h-[270px] flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#D9C8C0] bg-white/80 px-4">
          <p className="text-2xl text-[#2F282B]" style={{ fontFamily: 'Jua, sans-serif' }}>
            {card.name}
          </p>
          <p className="text-xs text-[#6B5E58]">{card.english}</p>
          <p className="text-[11px] text-[#8A7E78]">카드 이미지를 준비 중이에요</p>
        </div>
      )}
      <p className="mt-3 text-sm font-bold text-[#2F282B]">{card.name}</p>
      {(card.keywordsLeft?.length || card.keywordsRight?.length) ? (
        <p className="mt-1 text-[10px] text-[#8B6F47]">
          {[...(card.keywordsLeft ?? []), ...(card.keywordsRight ?? [])].join(' · ')}
        </p>
      ) : null}
      {card.isReversed && !shouldShowImage && (
        <p className="mt-1 text-[10px] font-bold text-[#8B6F47]">역방향</p>
      )}
    </div>
  );
}

export default function TarotPage() {
  const [topic, setTopic] = useState('일반');
  const [timeHorizon, setTimeHorizon] = useState<(typeof TIME_HORIZONS)[number]>('지금');
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
        body: JSON.stringify({ question: trimmedQuestion, topic, timeHorizon }),
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
      <section className="relative overflow-hidden rounded-[22px] border border-[#E2D7D0] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(61,51,56,0.06)] sm:px-5 sm:py-5">
        <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#F3E8D5]/80" />
        <div className="absolute -bottom-16 left-4 h-36 w-36 rounded-full bg-[#FFF7E8]/90" />
        <div className="relative">
          <p className="mb-2 inline-flex rounded-full border border-[#E2D7D0] bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-semibold text-[#8B6F47]">
            TAROT REPORT
          </p>
          <h1 className="text-xl leading-snug text-[#2F282B] sm:text-2xl" style={{ fontFamily: 'Jua, sans-serif' }}>
            선택 앞에서 필요한 조언을
            <br />
            세 장의 카드로 정리해드릴게요
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#4A403B]">
            22장 덱으로 현재와 미래의 흐름을 정리합니다. 3개월·1년·2년 후의 모습도 카드가 비추는 가능한 풍경으로 풀어드립니다.
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

          <div className="mb-4">
            <p className="mb-2 text-xs font-bold text-[#8B6F47]">시간축</p>
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
            {timeHorizon !== '지금' && (
              <p className="mt-2 text-xs leading-relaxed text-[#6B5E58]">
                {timeHorizon}를 선택하면 카드 위치가 미래 예언 스프레드로 바뀌고, 수호신이 비추는 풍경처럼 서사적으로 풀어드립니다.
              </p>
            )}
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
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#8B6F47]">22장 덱</span>
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
              {timeHorizon === '지금'
                ? '버튼을 누르면 22장 중 세 장이 섞여 뽑히고, 현재 상황 · 다가오는 흐름 · 조언으로 펼쳐집니다.'
                : `버튼을 누르면 ${timeHorizon} 예언 스프레드로 세 장이 펼쳐집니다.`}
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
            타로는 결정 대신 선택 기준을 정리하는 도구입니다. 중요한 결정은 현실 정보와 함께 판단해주세요.
          </p>
        </aside>
      </section>

      {cards.length > 0 && (
        <section className="card animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div>
              <p className="text-xs tracking-[0.12em] text-[#8B6F47]">THREE CARD SPREAD</p>
              <h2 className="label mt-1">뽑힌 카드</h2>
            </div>
            {timeHorizon !== '지금' && (
              <span className="rounded-full border border-[#C49A4A]/30 bg-[#FFF8EE] px-2.5 py-1 text-[10px] font-bold text-[#8B6F47]">
                {timeHorizon} 예언
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
              <h2 className="label mt-1">운명비서 타로 리딩</h2>
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
              {isFavorite ? '즐겨찾기 해제' : '즐겨찾기 저장'}
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
