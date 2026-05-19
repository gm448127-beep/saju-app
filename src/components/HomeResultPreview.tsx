import Link from "next/link";
import type { DailyFortuneContent } from "@/lib/today-content-engine";

function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

function getPreviewScores(seedKey: string) {
  const seed = hashSeed(seedKey);
  const overall = clampScore(58 + (seed % 30));
  return {
    overall,
    areas: [
      { label: "관계", score: clampScore(overall + ((seed >> 3) % 10) - 3) },
      { label: "결정", score: clampScore(overall + 2) },
      { label: "감정", score: clampScore(overall - 6) },
      { label: "균형", score: clampScore(overall - 4 + (seed % 8)) },
    ],
  };
}

function getTodayStatus(score: number) {
  if (score >= 85) return "상승";
  if (score >= 70) return "안정";
  if (score >= 55) return "보통";
  return "주의";
}

function ScoreBlocks({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 8);

  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-sm ${index < filled ? "bg-[#8B6F47]" : "bg-[#EDE4DC]"}`}
        />
      ))}
    </div>
  );
}

function formatTodayLabel(date = new Date()) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${weekdays[date.getDay()]})`;
}

interface HomeResultPreviewProps {
  content: DailyFortuneContent;
}

export default function HomeResultPreview({ content }: HomeResultPreviewProps) {
  const scores = getPreviewScores(content.seedKey);
  const statusLabel = getTodayStatus(scores.overall);
  const areaRows = [{ label: "종합", score: scores.overall }, ...scores.areas];

  return (
    <section className="overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white p-4 shadow-[0_18px_48px_rgba(61,51,56,0.07)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">TODAY PREVIEW</p>
          <h2 className="mt-1 text-xl leading-tight text-[#2F282B] sm:text-2xl" style={{ fontFamily: "Jua, sans-serif" }}>
            오늘의 흐름은 이렇게 읽힙니다
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#8A7E78]">
            {"한 줄 요약부터 감정과 행동까지\n오늘의 해석을 먼저 보여드립니다"}
          </p>
        </div>
        <Link
          href="/today"
          className="inline-flex items-center gap-2 rounded-full border border-[#D9C8C0] bg-[#FAF8F5] px-4 py-2 text-xs font-bold text-[#2F282B] transition hover:bg-white"
        >
          내 흐름 보기
          <span className="text-base leading-none">›</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <Link
          href="/today"
          className="group relative overflow-hidden rounded-[26px] border border-[#E8D7C4] bg-[#FFF8EE] px-5 py-5 shadow-[0_12px_32px_rgba(61,51,56,0.05)] transition hover:-translate-y-0.5"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-[#8B6F47]">
              <span className="rounded-full border border-[#E2D7D0] bg-white/70 px-2 py-0.5">오늘의 흐름</span>
              <span className="whitespace-nowrap text-[#6B5E58]">{formatTodayLabel()}</span>
              <span className="text-[#A09488]">·</span>
              <span className="whitespace-nowrap">{statusLabel}</span>
            </div>

            <div className="my-4 h-px bg-[#D9C8C0]/80" />

            <p className="text-xs font-bold text-[#8B6F47]">오늘의 한 줄</p>
            <h3 className="mt-2 text-2xl leading-tight text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
              {content.sentence}
            </h3>

            <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#E2D7D0] bg-white/80 px-4 py-4">
              <div className="pointer-events-none absolute inset-x-3 bottom-3 top-10 rounded-xl bg-white/25 backdrop-blur-[1px]" />
              <div className="relative space-y-2.5">
                {areaRows.map((area) => (
                  <div key={area.label} className="grid grid-cols-[42px_34px_1fr] items-center gap-3">
                    <p className={`text-sm font-bold ${area.label === "종합" ? "text-[#8B6F47]" : "text-[#3D3338]"}`}>{area.label}</p>
                    <p className="text-sm font-bold text-[#8B6F47]">{area.score}</p>
                    <ScoreBlocks score={area.score} />
                  </div>
                ))}
              </div>
              <p className="relative mt-3 text-[11px] text-[#8A7E78]">입력 후 내 사주 기준으로 다시 읽힙니다</p>
            </div>

            <div className="mt-4 rounded-2xl border border-[#E2D7D0] bg-white/70 px-4 py-3">
              <p className="text-xs font-bold text-[#8B6F47]">오늘의 흐름</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4A403B]">{content.flow}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/today"
          className="group flex flex-col rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_12px_32px_rgba(61,51,56,0.05)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-bold text-[#8B6F47]">지금 잘 맞는 움직임</p>
          <p className="mt-1 text-sm text-[#8A7E78]">오늘의 흐름에 맞게 바로 적용할 수 있는 선택들</p>

          <div className="mt-4 grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["권하는 움직임", content.actionGuide.dos],
              ["늦추는 편이 좋은 것", content.actionGuide.donts],
              ["관계의 결", content.actionGuide.relationTip],
              ["일과 돈의 기준", content.actionGuide.workMoneyTip],
            ].map(([label, text]) => (
              <div key={label} className="rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-3.5 py-3">
                <p className="text-[11px] font-semibold text-[#8B6F47]">{label}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#4A403B]">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#E2D7D0] bg-[#FFFDF9] px-4 py-3">
            <p className="text-xs font-bold text-[#8B6F47]">감정의 중심</p>
            <p className="mt-1 text-base text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {content.emotionPoint.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#5A4E48]">{content.emotionPoint.description}</p>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {content.timeSlots.map((slot) => (
              <div key={slot.label} className="rounded-xl border border-[#E2D7D0] bg-[#FAF8F5] px-2 py-2 text-center">
                <p className="text-[10px] text-[#8A7E78]">{slot.label}</p>
                <p className="mt-0.5 text-sm text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                  {slot.keyword}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs font-bold text-[#8B6F47] transition group-hover:translate-x-0.5">
            오늘의 리포트 이어 읽기 ›
          </p>
        </Link>
      </div>
    </section>
  );
}
