"use client";

import { useEffect } from "react";

export default function TodayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/today]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-[#E8D7C4] bg-[#FFFDF8] px-6 py-8 text-center shadow-[0_14px_38px_rgba(61,51,56,0.08)]">
      <p className="text-xs font-bold tracking-[0.12em] text-[#8B6F47]">오늘의 운세</p>
      <h1 className="mt-3 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
        화면을 불러오지 못했어요
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#5A4E48]">
        잠시 연결이 끊겼거나 데이터를 읽는 중 문제가 생겼습니다. 다시 시도해 주세요.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-11 rounded-xl bg-[#2F282B] px-5 py-2.5 text-sm font-bold text-white"
        >
          다시 불러오기
        </button>
        <a
          href="/today"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E8D7C4] bg-white px-5 py-2.5 text-sm font-bold text-[#2F282B]"
        >
          처음으로
        </a>
      </div>
      <p className="mt-4 text-xs text-[#8A7E78]">
        계속 안 되면{" "}
        <a href="https://www.unmyeongbiseo.kr/today" className="font-semibold text-[#8B6F47] underline">
          www.unmyeongbiseo.kr/today
        </a>
        에서 열어 보세요.
      </p>
    </div>
  );
}
