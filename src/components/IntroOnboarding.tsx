"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type TouchEvent } from "react";
import { INTRO_SLIDE2_IMAGE } from "@/lib/intro-onboarding-assets";

const SLIDE_COUNT = 3;
const SWIPE_THRESHOLD_PX = 48;
const BG = "#F5F1EB";

interface IntroOnboardingProps {
  onSkip: () => void;
  onStart: () => void;
}

function SlideCaptionBlock({ caption, subcaption }: { caption: string; subcaption: string }) {
  return (
    <div className="mx-auto w-full max-w-md space-y-2 text-center">
      <p className="text-xl font-bold leading-snug text-[#2F282B] sm:text-2xl">{caption}</p>
      <p className="text-sm leading-relaxed text-[#2F282B]/80 sm:text-base">{subcaption}</p>
    </div>
  );
}

/** 1·2장: 이미지 전체 노출 + 하단 30% 베이지 블러 그라데이션 + 텍스트 오버레이 */
function FullImageSlide({
  src,
  alt,
  caption,
  subcaption,
  onError,
  hasError,
}: {
  src: string;
  alt: string;
  caption: string;
  subcaption: string;
  onError?: () => void;
  hasError?: boolean;
}) {
  return (
    <section
      className="relative h-full w-full shrink-0 overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      <div className="absolute inset-0">
        {!hasError ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={src.includes("miim")}
            className="object-contain object-top"
            sizes="100vw"
            onError={onError}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-sm text-[#2F282B]/50"
            style={{ backgroundColor: BG }}
          >
            이미지를 불러오지 못했습니다
          </div>
        )}
      </div>

      {/* 하단 30%: 베이지 블러 그라데이션 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[30%] backdrop-blur-md"
        style={{
          background:
            "linear-gradient(to top, #F5F1EB 0%, rgba(245, 241, 235, 0.94) 38%, rgba(245, 241, 235, 0.55) 68%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* 그라데이션 위 텍스트 (한 단계 아래) */}
      <div className="absolute inset-x-0 bottom-1 z-10 px-5 sm:bottom-2 sm:px-8">
        <SlideCaptionBlock caption={caption} subcaption={subcaption} />
      </div>
    </section>
  );
}

function Slide3Center() {
  return (
    <section
      className="relative flex h-full w-full shrink-0 flex-col items-center justify-center overflow-hidden px-6 text-center sm:px-10"
      style={{ backgroundColor: BG }}
    >
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        style={{ fontFamily: "serif" }}
        aria-hidden
      >
        <div className="absolute -left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#2F282B]/[0.03] sm:h-56 sm:w-56" />
        <div className="absolute -right-[6%] bottom-[22%] h-48 w-48 rounded-full bg-[#2F282B]/[0.04] sm:h-64 sm:w-64" />
        <span className="absolute left-[6%] top-[18%] text-[min(36vw,168px)] font-bold leading-none text-[#2F282B] opacity-[0.08] sm:left-[10%]">
          運
        </span>
        <span className="absolute right-[4%] top-[26%] text-[min(52vw,260px)] font-bold leading-none text-[#2F282B] opacity-[0.11] sm:right-[8%]">
          命
        </span>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-4">
        <p className="text-2xl font-bold leading-snug text-[#2F282B] sm:text-3xl">
          생년월일만 알려주시면 돼요
        </p>
        <p className="text-base leading-relaxed text-[#2F282B]/75 sm:text-lg">
          한 번만 입력하면 매일 자동으로
        </p>
      </div>
    </section>
  );
}

export default function IntroOnboarding({ onSkip, onStart }: IntroOnboardingProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slide2Error, setSlide2Error] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(SLIDE_COUNT - 1, index)));
  }, []);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(activeIndex + (delta > 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const isLastSlide = activeIndex === SLIDE_COUNT - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden text-[#2F282B]"
      style={{
        fontFamily: "Noto Sans KR, sans-serif",
        backgroundColor: BG,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="운명비서 소개"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onSkip}
        className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 min-h-11 rounded-full px-4 py-2 text-sm font-semibold text-[#2F282B]/80 transition hover:text-[#2F282B] sm:right-6"
        style={{ backgroundColor: `${BG}bf` }}
      >
        건너뛰기
      </button>

      {/* 슬라이드 영역: 100dvh − 고정 푸터 */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          <FullImageSlide
            src="/miim.png"
            alt="운명비서 안내"
            caption="매일 아침, 오늘의 나를 읽어드립니다"
            subcaption="결정·관계·감정·균형 — 사주로 정리하는 차분한 리포트"
          />

          <FullImageSlide
            src={INTRO_SLIDE2_IMAGE}
            alt="매일 받아보는 리포트"
            caption="이런 리포트를 매일 받아보세요"
            subcaption="매거진 톤으로 정리해드립니다"
            hasError={slide2Error}
            onError={() => setSlide2Error(true)}
          />

          <Slide3Center />
        </div>
      </div>

      {/* 고정 하단: 버튼 → 인디케이터 */}
      <footer
        className="z-20 shrink-0 px-6 pt-3"
        style={{
          backgroundColor: BG,
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        {isLastSlide && (
          <p className="mb-2 text-center text-xs font-medium tracking-wide text-[#2F282B]/60 sm:text-sm">
            오늘의 결 · 5축 점수 · 명리 근거까지
          </p>
        )}

        {isLastSlide ? (
          <button
            type="button"
            onClick={onStart}
            className="min-h-12 w-full rounded-2xl bg-[#2F282B] px-6 py-3.5 text-lg font-bold text-[#F5F1EB] shadow-[0_14px_32px_rgba(47,40,43,0.22)] transition active:scale-[0.98]"
          >
            내 결로 시작하기
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="min-h-12 w-full rounded-2xl border-2 border-[#2F282B]/15 bg-white/70 py-3.5 text-sm font-bold text-[#2F282B] transition hover:border-[#2F282B]/25"
          >
            다음
          </button>
        )}

        <div className="mt-3 flex items-center justify-center gap-2">
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-[#2F282B]" : "w-2 bg-[#2F282B]/25"
              }`}
              aria-label={`${i + 1}번째 소개`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
