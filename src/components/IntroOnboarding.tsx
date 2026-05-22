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
      style={{ fontFamily: "Noto Sans KR, sans-serif", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      role="dialog"
      aria-modal="true"
      aria-label="운명비서 소개"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="flex shrink-0 items-center justify-end px-4 pt-3 sm:px-6">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-11 rounded-full px-4 py-2 text-sm font-semibold text-[#2F282B]/70 transition hover:bg-[#2F282B]/5 hover:text-[#2F282B]"
        >
          건너뛰기
        </button>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {/* 1장 */}
          <section className="flex h-full w-full shrink-0 flex-col px-5 pb-4 sm:px-8">
            <div className="relative mx-auto mt-2 h-[min(52vh,420px)] w-full max-w-sm flex-1">
              <Image
                src="/miim.png"
                alt="운명비서 안내"
                fill
                priority
                className="object-contain object-top"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
            <p className="shrink-0 pb-6 text-center text-xl font-bold leading-snug text-[#2F282B] sm:text-2xl">
              매일 아침, 오늘의 나를 읽어드립니다
            </p>
          </section>

          {/* 2장 */}
          <section className="flex h-full w-full shrink-0 flex-col px-5 pb-4 sm:px-8">
            <div className="relative mx-auto mt-2 h-[min(52vh,420px)] w-full max-w-sm flex-1 overflow-hidden rounded-2xl border border-[#2F282B]/10 bg-white/60 shadow-[0_12px_40px_rgba(47,40,43,0.08)]">
              {!slide2Error ? (
                <Image
                  src={INTRO_SLIDE2_IMAGE}
                  alt="매일 받아보는 리포트"
                  fill
                  className="object-contain object-center p-3"
                  sizes="(max-width: 640px) 100vw, 400px"
                  onError={() => setSlide2Error(true)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-[#2F282B]/55">
                  <p className="font-semibold text-[#2F282B]/70">이미지를 불러오지 못했습니다</p>
                  <p className="text-xs leading-relaxed">잠시 후 다시 시도해 주세요.</p>
                </div>
              )}
            </div>
            <p className="shrink-0 pb-6 text-center text-xl font-bold leading-snug text-[#2F282B] sm:text-2xl">
              이런 리포트를 매일 받아보세요
            </p>
          </section>

          {/* 3장 */}
          <section className="flex h-full w-full shrink-0 flex-col items-center justify-center px-6 pb-8 text-center sm:px-10">
            <div className="w-full max-w-sm space-y-4">
              <p className="text-2xl font-bold leading-snug text-[#2F282B] sm:text-3xl">
                생년월일만 알려주시면 돼요
              </p>
              <p className="text-base leading-relaxed text-[#2F282B]/75 sm:text-lg">
                한 번만 입력하면 매일 자동으로
              </p>
              <button
                type="button"
                onClick={onStart}
                className="mt-6 min-h-12 w-full rounded-2xl bg-[#2F282B] px-6 py-4 text-lg font-bold text-[#F5F1EB] shadow-[0_14px_32px_rgba(47,40,43,0.22)] transition active:scale-[0.98]"
              >
                시작하기
              </button>
            </div>
          </section>
        </div>
      </div>

      <footer className="shrink-0 space-y-4 px-6 pb-6 pt-2 sm:pb-8">
        {activeIndex < SLIDE_COUNT - 1 && (
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="min-h-11 w-full rounded-2xl border-2 border-[#2F282B]/15 bg-white/50 py-3 text-sm font-bold text-[#2F282B] transition hover:border-[#2F282B]/25"
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
