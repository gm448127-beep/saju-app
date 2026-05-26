'use client';

import { useState } from 'react';

const DREAM_EXAMPLES = [
  '�?�? 물�? 건�???��? �?�?��???�?�? 커�???�?,
  '??�??�???�?족이 �?�?� 찾�???? 조�?�????�?? �?,
  '??군�??��? �?기?��? ???� 방�?� ?��?? �?,
  '??이 ??�?�?�? 줍고????려�?�? 고�???�?? �?,
  '�???????�? �???�???데 ?��?�??�? 무�?��? ??�? �?,
  '??�???��?� ??�? ??착??�????문�?�?�?�?�?�?? �?,
];

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

export default function DreamPage() {
  const [dream, setDream] = useState('');
  const [mood, setMood] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmedDream = dream.trim();
    if (trimmedDream.length < 5) {
      setError('�??��?�??조�? ???��?�???��?�주�?�??');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream: trimmedDream, mood }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '�?�?�몽�? �?�?�?��? 못�???��????');
        return;
      }

      setResult(data.interpretation || '');
    } catch (submitError) {
      console.error('�?�?��???청 ?��?�:', submitError);
      setError('?��?? ???��?? ??�??�주?��??.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white px-5 py-7 shadow-[0_18px_48px_rgba(61,51,56,0.07)] sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F1E7DE]" />
        <div className="absolute -bottom-28 left-6 h-72 w-72 rounded-full bg-[#F8F3EE]" />
        <div className="relative">
          <p className="mb-3 inline-flex rounded-full border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-1 text-xs font-semibold text-[#8B6F47]">
            DREAM REPORT
          </p>
          <h1 className="text-3xl leading-tight text-[#2F282B] sm:text-5xl" style={{ fontFamily: 'Jua, sans-serif' }}>
            �?이 ?�긴 ?��?��?            <br />
            차�???�? ???��??릴�???          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4A403B]">
            무�?��??��???�?? ?�몽????�???? �?�?� ?��????��????�?�?�?짐과 ??�?� 조�?�?��? ??리?��????
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="mb-4">
            <h2 className="label mb-1">�??��?� ??력</h2>
            <p className="text-xs text-[#8A7E78]">기�?�??�?? ?�면, ?��?�???��??, ?��??, 감�????��??�??��?�주�?�??</p>
          </div>

          <textarea
            value={dream}
            onChange={(event) => setDream(event.target.value)}
            placeholder="?? ???� �???�?�????군�?�?기�?�리�?��? �?�?��?�?�? �?이 ?�렸?��??. ?��?�??�? �?�????면??�? �?�???조�? ??련??�?�??�?�."
            className="min-h-[180px] w-full resize-none rounded-2xl border-2 border-[#D9C8C0] bg-white px-4 py-3 text-base text-[#2F282B] outline-none focus:border-[#8B6F47]"
          />

          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-[#2F282B]">�?�? �????��??</label>
            <input
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              placeholder="?? �?�???? ??련?? 그리??, ?��?�??�? ?��????
              className="w-full rounded-2xl border-2 border-[#D9C8C0] bg-white px-4 py-3 text-base text-[#2F282B] outline-none focus:border-[#8B6F47]"
            />
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
            {loading ? '�?�? ?��?�??�?? �?..' : '�?�?��?보기'}
          </button>
        </div>

        <aside className="self-start rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] p-5 shadow-[0_10px_30px_rgba(61,51,56,0.06)]">
          <p className="mb-2 text-xs tracking-[0.12em] text-[#8B6F47]">??력 ??�??</p>
          <h2 className="mb-3 text-xl text-[#2F282B]" style={{ fontFamily: 'Jua, sans-serif' }}>
            ?��?�???�???�보?��??
          </h2>
          <div className="space-y-2">
            {DREAM_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setDream(example)}
                className="w-full rounded-2xl border border-[#E2D7D0] bg-white px-3 py-2.5 text-left text-sm text-[#3D3338] transition hover:bg-[#FFFDF9]"
              >
                {example}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#6B5E58]">
            �?�?�몽�? 참고?��????�?�. �?�?�??�?�? ??�? ?�이 ?�긴?��?? ?��?��??��???�? ??고, ??�?� �?�????��?��?차�???보겠?��????
          </p>
        </aside>
      </section>

      {result && (
        <section className="card animate-fade-in">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.12em] text-[#8B6F47]">DREAM INTERPRETATION</p>
              <h2 className="label mt-1">?��?�?�?? �?�?��?리포??/h2>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
            {renderContent(result)}
          </div>
        </section>
      )}
    </div>
  );
}
