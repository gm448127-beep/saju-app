"use client";

import Link from "next/link";
import { useState } from "react";

const FEATURE_SLIDES = [
  {
    href: "/saju",
    title: "사주보기",
    subtitle: "타고난 성향과 인생의 큰 방향",
    badge: "기본 분석",
    bg: "linear-gradient(135deg, #FFFDF9 0%, #F5EDE3 56%, #E8D7C4 100%)",
    accent: "#8B6F47",
  },
  {
    href: "/compatibility",
    title: "궁합보기",
    subtitle: "사랑, 관계, 합이 맞는 지점",
    badge: "관계 분석",
    bg: "linear-gradient(135deg, #FFF9F6 0%, #F1E0DA 58%, #E3C8BE 100%)",
    accent: "#9A685B",
  },
  {
    href: "/tojeong",
    title: "토정비결",
    subtitle: "올해 흐름과 월별 기회",
    badge: "연간 운세",
    bg: "linear-gradient(135deg, #FCFBF7 0%, #EEE7DC 58%, #D9C8B6 100%)",
    accent: "#6B5E58",
  },
  {
    href: "/tarot",
    title: "타로보기",
    subtitle: "선택 앞에서 필요한 조언",
    badge: "카드 조언",
    bg: "linear-gradient(135deg, #FFFDF8 0%, #F3E8D5 56%, #E6CF9F 100%)",
    accent: "#B89968",
  },
  {
    href: "/dream",
    title: "꿈해몽",
    subtitle: "꿈 이야기를 AI에게 풀어보기",
    badge: "AI 해석",
    bg: "linear-gradient(135deg, #FBFAFF 0%, #EDE6F4 58%, #D8C8E6 100%)",
    accent: "#7F6A8E",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const selectedSlide = FEATURE_SLIDES[activeSlide];

  const goToSlide = (index: number) => {
    setActiveSlide((index + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
  };

  const handleTouchEnd = (x: number) => {
    if (touchStartX === null) return;

    const distance = touchStartX - x;
    if (Math.abs(distance) > 40) {
      goToSlide(activeSlide + (distance > 0 ? 1 : -1));
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white p-4 shadow-[0_18px_48px_rgba(61,51,56,0.07)] sm:p-6">
        <div
          className="relative min-h-[310px] overflow-hidden rounded-[26px] border border-[#E2D7D0] px-6 py-7 text-[#2F282B] sm:min-h-[390px] sm:px-10 sm:py-10"
          style={{ background: selectedSlide.bg }}
          onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
        >
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/70" />
            <div className="absolute bottom-8 right-10 h-28 w-28 rounded-full bg-white/35" />
            <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-white/35" />
            <div className="absolute right-20 top-24 h-16 w-16 rounded-full" style={{ backgroundColor: `${selectedSlide.accent}22` }} />
          </div>

          <div className="relative flex min-h-[250px] flex-col justify-between sm:min-h-[310px]">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-xs font-semibold text-[#8B6F47] backdrop-blur">
                {selectedSlide.badge}
              </span>
              <span className="text-xs font-semibold tracking-[0.18em] text-[#8B6F47]">
                {String(activeSlide + 1).padStart(2, "0")} / {String(FEATURE_SLIDES.length).padStart(2, "0")}
              </span>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-[#6B5E58]">{selectedSlide.subtitle}</p>
              <h2 className="text-5xl leading-none text-[#2F282B] sm:text-7xl" style={{ fontFamily: "Jua, sans-serif" }}>
                {selectedSlide.title}
              </h2>
              <Link
                href={selectedSlide.href}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2F282B] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,40,43,0.18)] transition hover:-translate-y-0.5"
              >
                바로 살펴보기
                <span className="text-lg leading-none">›</span>
              </Link>
            </div>
          </div>

          <button
            type="button"
            aria-label="이전 메뉴"
            onClick={() => goToSlide(activeSlide - 1)}
            className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#2F282B] backdrop-blur transition hover:bg-white sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 메뉴"
            onClick={() => goToSlide(activeSlide + 1)}
            className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#2F282B] backdrop-blur transition hover:bg-white sm:flex"
          >
            ›
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {FEATURE_SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`${slide.title} 선택`}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all ${
                activeSlide === index ? "w-9 bg-[#8B6F47]" : "w-3 bg-[#D8D5D4]"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="relative min-h-[430px] overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white shadow-[0_18px_48px_rgba(61,51,56,0.07)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F1E7DE]" />
          <div className="absolute -bottom-28 left-8 h-80 w-80 rounded-full bg-[#F8F3EE]" />
          <div className="absolute bottom-16 right-14 hidden h-36 w-36 rounded-full border border-[#D9C8C0] sm:block" />
          <div className="absolute right-24 top-20 hidden h-20 w-20 rounded-full bg-[#EFE6DD] sm:block" />
        </div>

        <div className="relative flex min-h-[430px] items-center px-6 py-10 sm:px-10">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-1 text-xs font-semibold text-[#8B6F47]">
              매일 여는 나만의 운명 루틴
            </p>
            <h1 className="text-4xl leading-tight text-[#2F282B] sm:text-6xl" style={{ fontFamily: "Jua, sans-serif" }}>
              오늘의 선택을
              <br />
              운명비서가 먼저 정리해드릴게요
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4A403B] sm:text-lg">
              사주, 오늘의 운세, 토정비결, 궁합, AI상담을 매일 다시 열어보기 쉬운 홈으로 모았습니다.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/today"
                className="inline-flex items-center justify-center rounded-2xl bg-[#2F282B] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2F282B]/15 transition hover:-translate-y-0.5"
              >
                오늘의 운세 바로 보기
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-2xl border border-[#D9C8C0] bg-white px-5 py-3 text-sm font-bold text-[#2F282B] transition hover:bg-[#FAF8F5]"
              >
                AI에게 고민 물어보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-10 text-sm text-[#A09488]">
        <p>운명비서는 재미와 참고용입니다.</p>
        <p className="mt-1">중요한 결정은 전문가와 상담하세요.</p>
      </footer>
    </div>
  );
}