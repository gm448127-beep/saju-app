"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteSajuRecord,
  deleteTarotFavorite,
  getSajuHistory,
  getTarotFavorites,
  type SavedSajuRecord,
  type SavedTarotFavorite,
} from "@/lib/archive-storage";
import {
  deleteTodayRecord,
  formatHistoryDate,
  getRecentTrend,
  getTodayHistory,
  getTodayStatus,
  getUnifiedArchiveStats,
  type SavedTodayRecord,
} from "@/lib/today-report-helpers";

function formatSavedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}월 ${date.getDate()}일 저장`;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<SavedTodayRecord[]>([]);
  const [sajuRecords, setSajuRecords] = useState<SavedSajuRecord[]>([]);
  const [tarotFavorites, setTarotFavorites] = useState<SavedTarotFavorite[]>([]);
  const [ready, setReady] = useState(false);

  const loadRecords = () => {
    setRecords(getTodayHistory());
    setSajuRecords(getSajuHistory());
    setTarotFavorites(getTarotFavorites());
    setReady(true);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const stats = getUnifiedArchiveStats(records, sajuRecords.length, tarotFavorites.length);
  const trend = getRecentTrend(records, 7);
  const todayIndex = trend.length - 1;

  const handleDeleteToday = (dateKey: string, birthKey: string) => {
    deleteTodayRecord(dateKey, birthKey);
    loadRecords();
  };

  const handleDeleteSaju = (birthKey: string) => {
    deleteSajuRecord(birthKey);
    loadRecords();
  };

  const handleDeleteTarot = (id: string) => {
    deleteTarotFavorite(id);
    loadRecords();
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white px-5 py-7 shadow-[0_18px_48px_rgba(61,51,56,0.07)] sm:px-8 sm:py-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F1E7DE]" />
        <div className="absolute -bottom-28 left-6 h-72 w-72 rounded-full bg-[#F8F3EE]" />
        <div className="relative">
          <p className="mb-3 inline-flex rounded-full border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-1 text-xs font-semibold text-[#8B6F47]">
            ARCHIVE
          </p>
          <h1 className="text-3xl leading-tight text-[#2F282B] sm:text-4xl" style={{ fontFamily: "Jua, sans-serif" }}>
            쌓인 흐름
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4A403B]">
            오늘의 리포트, 사주 분석, 타로 즐겨찾기가
            <br />
            이 브라우저에 조용히 기록됩니다.
          </p>
          {ready && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#E2D7D0] bg-white px-3 py-1 text-xs font-bold text-[#8B6F47]">
                오늘의 흐름 {stats.todayCount}건
              </span>
              <span className="rounded-full border border-[#E2D7D0] bg-white px-3 py-1 text-xs font-bold text-[#6B5E58]">
                사주 {stats.sajuCount}건
              </span>
              <span className="rounded-full border border-[#E2D7D0] bg-white px-3 py-1 text-xs font-bold text-[#6B5E58]">
                타로 {stats.tarotCount}건
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_10px_28px_rgba(61,51,56,0.05)]">
        <p className="text-xs font-bold tracking-[0.12em] text-[#8B6F47]">7일 흐름</p>
        {!ready ? (
          <p className="mt-3 text-sm text-[#8A7E78]">기록을 불러오는 중...</p>
        ) : trend.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-[#6B5E58]">
            아직 쌓인 흐름이 없습니다. 오늘의 리포트를 읽으면 그래프가 채워집니다.
          </p>
        ) : (
          <div className="mt-4 flex h-16 items-end gap-1.5">
            {trend.map((item, index) => (
              <div key={`${item.dateKey}-${item.birthKey}`} className="relative flex flex-1 flex-col items-center gap-1">
                {index === todayIndex && (
                  <span className="absolute -top-3 h-2 w-2 rounded-full bg-[#2F282B] ring-2 ring-[#F3E8D5]" />
                )}
                <div
                  className="w-full rounded-t-full bg-[#C49A4A]"
                  style={{ height: `${Math.max(item.overall / 2, 12)}px`, opacity: 0.45 + index * 0.06 }}
                />
                <span className="text-[10px] text-[#A09488]">{item.dateKey.slice(6, 8)}일</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[#8B6F47]">TODAY LOG</p>
            <h2 className="mt-1 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              지난 오늘의 흐름
            </h2>
          </div>
          <Link href="/today" className="text-xs font-bold text-[#8B6F47]">
            오늘 읽기 ›
          </Link>
        </div>

        {!ready ? null : records.length === 0 ? (
          <div className="rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-6">
            <p className="text-sm leading-relaxed text-[#4A403B]">
              오늘의 리포트를 읽는 순간
              <br />
              기록은 조용히 이어집니다.
            </p>
            <Link
              href="/today"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#2F282B] px-4 py-2.5 text-sm font-bold text-white"
            >
              오늘의 흐름 읽기
            </Link>
          </div>
        ) : (
          records.map((item) => {
            const status = item.status || getTodayStatus(item.overall);
            return (
              <article
                key={`${item.dateKey}-${item.birthKey}-${item.savedAt}`}
                className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(61,51,56,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#8B6F47]">{formatHistoryDate(item.dateKey)}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm font-bold text-[#2F282B]">
                      <span>{item.overall}</span>
                      <span className="text-[#A09488]">·</span>
                      <span className="text-[#8B6F47]">{status}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteToday(item.dateKey, item.birthKey)}
                    className="rounded-full border border-[#E2D7D0] px-2.5 py-1 text-[11px] font-semibold text-[#8A7E78]"
                  >
                    삭제
                  </button>
                </div>
                <p className="mt-3 text-base leading-relaxed text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                  {item.sentence}
                </p>
                {item.flow && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5A4E48]">{item.flow}</p>}
                <Link href="/today" className="mt-3 inline-flex text-xs font-bold text-[#8B6F47]">
                  다시 읽기 ›
                </Link>
              </article>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[#8B6F47]">SAJU LOG</p>
            <h2 className="mt-1 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              지난 사주 결과
            </h2>
          </div>
          <Link href="/saju" className="text-xs font-bold text-[#8B6F47]">
            사주 보기 ›
          </Link>
        </div>

        {!ready ? null : sajuRecords.length === 0 ? (
          <div className="rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-6">
            <p className="text-sm leading-relaxed text-[#4A403B]">
              사주 분석을 완료하면
              <br />
              리포트가 자동으로 저장됩니다.
            </p>
            <Link
              href="/saju"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#2F282B] px-4 py-2.5 text-sm font-bold text-white"
            >
              사주 분석하기
            </Link>
          </div>
        ) : (
          sajuRecords.map((item) => (
            <article
              key={`${item.birthKey}-${item.savedAt}`}
              className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(61,51,56,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#8B6F47]">{formatSavedAt(item.savedAt)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-[#2F282B]">
                    <span>{item.name}</span>
                    <span className="text-[#A09488]">·</span>
                    <span>{item.birthDate}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSaju(item.birthKey)}
                  className="rounded-full border border-[#E2D7D0] px-2.5 py-1 text-[11px] font-semibold text-[#8A7E78]"
                >
                  삭제
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#8B6F47]">
                  일간 {item.dayGan}
                </span>
                <span className="rounded-full bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#6B5E58]">
                  {item.gyeok}
                </span>
                <span className="rounded-full bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#6B5E58]">
                  {item.mainElement}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#5A4E48]">{item.summary}</p>
              <Link href="/saju" className="mt-3 inline-flex text-xs font-bold text-[#8B6F47]">
                다시 분석하기 ›
              </Link>
            </article>
          ))
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[#8B6F47]">TAROT FAVORITE</p>
            <h2 className="mt-1 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              즐겨찾기 한 카드
            </h2>
          </div>
          <Link href="/tarot" className="text-xs font-bold text-[#8B6F47]">
            타로 보기 ›
          </Link>
        </div>

        {!ready ? null : tarotFavorites.length === 0 ? (
          <div className="rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-6">
            <p className="text-sm leading-relaxed text-[#4A403B]">
              타로 리딩에서 마음에 남는 메시지를
              <br />
              즐겨찾기로 저장할 수 있습니다.
            </p>
            <Link
              href="/tarot"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#2F282B] px-4 py-2.5 text-sm font-bold text-white"
            >
              타로 리딩하기
            </Link>
          </div>
        ) : (
          tarotFavorites.map((item) => (
            <article
              key={item.id}
              className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(61,51,56,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#8B6F47]">{formatSavedAt(item.savedAt)}</p>
                  {item.timeHorizon !== "지금" && (
                    <span className="mt-1 inline-flex rounded-full border border-[#C49A4A]/30 bg-[#FFF8EE] px-2 py-0.5 text-[10px] font-bold text-[#8B6F47]">
                      {item.timeHorizon}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTarot(item.id)}
                  className="rounded-full border border-[#E2D7D0] px-2.5 py-1 text-[11px] font-semibold text-[#8A7E78]"
                >
                  삭제
                </button>
              </div>
              <p className="mt-3 text-base leading-relaxed text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {item.question}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#8B6F47]">{item.cardNames.join(" · ")}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5A4E48]">{item.excerpt}</p>
              <Link href="/tarot" className="mt-3 inline-flex text-xs font-bold text-[#8B6F47]">
                다시 뽑기 ›
              </Link>
            </article>
          ))
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-1">
        <Link
          href="/chat"
          className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_10px_28px_rgba(61,51,56,0.05)] transition hover:-translate-y-0.5 hover:bg-[#FFFDF9]"
        >
          <p className="inline-flex rounded-full bg-[#FAF8F5] px-2.5 py-1 text-xs font-bold text-[#8B6F47]">준비 중</p>
          <h2 className="mt-2 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
            상담 메모
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4A403B]">
            AI상담 중 남기고 싶은 조언을 내 메모로 정리할 수 있게 됩니다.
          </p>
        </Link>
      </section>
    </div>
  );
}
