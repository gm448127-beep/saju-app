"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type TouchEvent } from "react";
import { INTRO_SLIDE2_IMAGE } from "@/lib/intro-onboarding-assets";

const SLIDE_COUNT = 3;
const SWIPE_THRESHOLD_PX = 48;

interface IntroOnboardingProps {
  onSkip: () => void;
  onStart: () => void;
}

function SlideCaptionBlock({
  caption,
  subcaption,
  className = "",
}: {
  caption: string;
  subcaption: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 text-center ${className}`}>
      <p className="text-xl font-bold leading-snug text-[#2F282B] sm:text-2xl">{caption}</p>
      <p className="text-sm leading-relaxed text-[#2F282B]/75 sm:text-base">{subcaption}</p>
    </div>
  );
}

/** 1장: 이미지 풀블리드 + 반투명 흰 텍스트 패널 */
function Slide1Hero({
  src,
  alt,
  caption,
  subcaption,
}: {
  src: string;
  alt: string;
  caption: string;
  subcaption: string;
}) {
  return (
    <section className="relative h-full w-full shrink-0 overflow-hidden bg-[#F5F1EB]">
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#F5F1EB]/80 to-transparent pb-36 pt-16 sm:pb-40"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-36 z-10 px-5 sm:bottom-40 sm:px-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white/72 px-5 py-4 shadow-[0_8px_28px_rgba(47,40,43,0.08)] backdrop-blur-[2px] sm:px-6 sm:py-5">
          <SlideCaptionBlock caption={caption} subcaption={subcaption} />
        </div>
      </div>
    </section>
  );
}

/** 2장: 상단 70% 이미지 · 하단 30% 베이지 텍스트 */
function Slide2Split({
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
    <section className="flex h-full w-full shrink-0 flex-col overflow-hidden bg-[#F5F1EB]">
      <div className="relative h-[70%] min-h-0 w-full shrink-0">
        {!hasError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-top"
            sizes="100vw"
            onError={onError}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#2F282B]/50">
            이미지를 불러오지 못했습니다
          </div>
        )}
      </div>

      <div className="flex h-[30%] min-h-0 shrink-0 flex-col justify-center bg-[#F5F1EB] px-6 pb-2 pt-1">
        <SlideCaptionBlock caption={caption} subcaption={subcaption} />
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

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#F5F1EB] text-[#2F282B]"
      style={{
        fontFamily: "Noto Sans KR, sans-serif",
        paddingBottom: "env(safe-area-inset-bottom)",
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
        className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-20 min-h-11 rounded-full bg-[#F5F1EB]/75 px-4 py-2 text-sm font-semibold text-[#2F282B]/80 backdrop-blur-sm transition hover:bg-[#F5F1EB] hover:text-[#2F282B] sm:right-6"
      >
        건너뛰기
      </button>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          <Slide1Hero
            src="/miim.png"
            alt="운명비서 안내"
            caption="매일 아침, 오늘의 나를 읽어드립니다"
            subcaption="결정·관계·감정·균형 — 사주로 정리하는 차분한 리포트"
          />

          <Slide2Split
            src={INTRO_SLIDE2_IMAGE}
            alt="매일 받아보는 리포트"
            caption="이런 리포트를 매일 받아보세요"
            subcaption="매거진 톤으로 정리해드립니다"
            hasError={slide2Error}
            onError={() => setSlide2Error(true)}
          />

          {/* 3장 */}
          <section className="relative flex h-full w-full shrink-0 flex-col items-center justify-center overflow-hidden bg-[#F5F1EB] px-6 pb-8 text-center sm:px-10">
            <div
              className="pointer-events-none absolute inset-0 select-none overflow-hidden"
              style={{ fontFamily: "serif" }}
              aria-hidden
            >
              <div className="absolute -left-[8%] top-[18%] h-48 w-48 rounded-full bg-[#2F282B]/[0.03] sm:h-64 sm:w-64" />
              <div className="absolute -right-[6%] bottom-[28%] h-56 w-56 rounded-full bg-[#2F282B]/[0.04] sm:h-72 sm:w-72" />
              <span className="absolute left-[6%] top-[22%] text-[min(36vw,168px)] font-bold leading-none text-[#2F282B] opacity-[0.08] sm:left-[10%]">
                運
              </span>
              <span className="absolute right-[4%] top-[32%] text-[min(52vw,260px)] font-bold leading-none text-[#2F282B] opacity-[0.11] sm:right-[8%]">
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

              <div className="pt-6">
                <p className="mb-3 text-xs font-medium tracking-wide text-[#2F282B]/60 sm:text-sm">
                  오늘의 결 · 5축 점수 · 명리 근거까지
                </p>
                <button
                  type="button"
                  onClick={onStart}
                  className="min-h-12 w-full rounded-2xl bg-[#2F282B] px-6 py-4 text-lg font-bold text-[#F5F1EB] shadow-[0_14px_32px_rgba(47,40,43,0.22)] transition active:scale-[0.98]"
                >
                  내 결로 시작하기
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="relative z-10 shrink-0 space-y-4 bg-[#F5F1EB] px-6 pb-6 pt-2 sm:pb-8">
        {activeIndex < SLIDE_COUNT - 1 && (
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="min-h-11 w-full rounded-2xl border-2 border-[#2F282B]/15 bg-white/60 py-3 text-sm font-bold text-[#2F282B] backdrop-blur-sm transition hover:border-[#2F282B]/25"
          >
            다음
          </button>
        )}

        <div className="flex items-center justify-center gap-2" aria-hidden>
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
