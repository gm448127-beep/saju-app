"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import HistoryEmptyPreviews from "@/components/pattern/HistoryEmptyPreviews";
import HistoryOtherRecords from "@/components/pattern/HistoryOtherRecords";
import HistoryPageSkeleton from "@/components/pattern/HistoryPageSkeleton";
import PatternLast7DaysStrip from "@/components/pattern/PatternLast7DaysStrip";
import {
  getSajuHistory,
  getTarotFavorites,
} from "@/lib/archive-storage";
import {
  HISTORY_ARCHIVE_COPY,
  HISTORY_FILTER_OPTIONS,
  HISTORY_FOOTER_COPY,
  HISTORY_HEADER_COPY,
  HISTORY_PAGE_EMPTY_COPY,
  HISTORY_SECTION_EMPTY_COPY,
  HISTORY_TOAST_COPY,
  LAST_7_DAYS_COPY,
  PATTERN_REPORT_COPY,
  RECENT_RECORDS_COPY,
  RECENT_RECORDS_SAVED_SUBCOPY,
  RECURRING_TONES_COPY,
  SAVED_SENTENCES_COPY,
} from "@/lib/history-copy";
import {
  buildLast7DaysFlow,
  buildSavedSentencesArchive,
  buildTodayTransitionLine,
  buildToneClusters,
  buildTopToneLabels,
  buildWeekInsight,
  dedupeRecordsByDate,
  dateKeyToSlug,
  filterTodayRecords,
  formatShortDate,
  getPatternEmptyState,
  getWeekdayShort,
  type HistoryFilter,
} from "@/lib/today-pattern-helpers";
import {
  deleteTodayRecord,
  getTodayHistory,
  getTodayStatus,
  getUnifiedArchiveStats,
  type SavedTodayRecord,
} from "@/lib/today-report-helpers";

const PATTERN_CARD_SURFACE =
  "rounded-[26px] border border-[#E8D7C4] bg-[#FAF5ED] px-5 py-6 shadow-[0_4px_18px_rgba(139,111,71,0.06)]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.14em] text-[#8B6F47]">{children}</p>
  );
}

function HistoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") as HistoryFilter) || "all";
  const initialTone = searchParams.get("tone");

  const [records, setRecords] = useState<SavedTodayRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>(initialFilter);
  const [toneFilter, setToneFilter] = useState<string | null>(initialTone);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);

  const loadRecords = () => {
    setRecords(getTodayHistory());
    setReady(true);
  };

  useEffect(() => {
    const skeletonTimer = window.setTimeout(() => setShowSkeleton(true), 200);
    const refresh = () => loadRecords();
    refresh();
    window.addEventListener("focus", refresh);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(skeletonTimer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const stats = getUnifiedArchiveStats(records, getSajuHistory().length, getTarotFavorites().length);
  const topTones = buildTopToneLabels(records, 3, 7);
  const clusters = buildToneClusters(records, 30);
  const last7 = buildLast7DaysFlow(records);
  const savedSentences = buildSavedSentencesArchive(records);
  const weekInsight = buildWeekInsight(records);
  const transitionLine = buildTodayTransitionLine(records);
  const emptyState = getPatternEmptyState(records);
  const recordCount = useMemo(() => dedupeRecordsByDate(records).length, [records]);
  const isFullyEmpty = recordCount === 0;
  const filterEnabled = recordCount > 0;

  const filteredRecords = useMemo(
    () => filterTodayRecords(records, filter, toneFilter),
    [records, filter, toneFilter],
  );

  const visibleRecords = showAllRecords ? filteredRecords : filteredRecords.slice(0, 5);

  const last7RecordCount = last7.filter((d) => d.hasRecord).length;
  const last7EmptyCount = last7.length - last7RecordCount;
  const showLast7WarmupHint = last7EmptyCount >= 4;
  const patternHeadline =
    emptyState?.headline ?? PATTERN_REPORT_COPY.headline;

  const toggleToneFilter = (label: string) => {
    setToneFilter((current) => (current === label ? null : label));
  };

  const applyFilter = (next: HistoryFilter) => {
    setFilter(next);
    setFilterOpen(false);
    const params = new URLSearchParams();
    if (next !== "all") params.set("filter", next);
    if (toneFilter) params.set("tone", toneFilter);
    const q = params.toString();
    router.replace(q ? `/history?${q}` : "/history", { scroll: false });
  };

  const handleDelete = (dateKey: string, birthKey: string) => {
    if (!window.confirm(HISTORY_TOAST_COPY.deleteConfirm)) return;
    deleteTodayRecord(dateKey, birthKey);
    loadRecords();
  };

  if (!ready) {
    if (showSkeleton) return <HistoryPageSkeleton />;
    return <div className="min-h-[40vh]" aria-hidden="true" />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 헤더 */}
      <section className={`relative overflow-hidden ${PATTERN_CARD_SURFACE} sm:px-7`}>
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#F1E7DE]/60" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link href="/" className="text-xs font-semibold text-[#8A7E78] hover:text-[#8B6F47]">
              {HISTORY_HEADER_COPY.backBrand}
            </Link>
            <h1 className="mt-2 text-2xl text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
              {HISTORY_HEADER_COPY.title}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#8A7E78]">{HISTORY_HEADER_COPY.subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Image
              src="/miin.png"
              alt="미인"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border border-[#E8D7C4] bg-[#FFF8EE] object-cover object-center shadow-[0_4px_12px_rgba(139,111,71,0.12)]"
            />
            {filterEnabled ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  className="rounded-full border border-[#D9C8C0] bg-white px-3 py-1.5 text-xs font-bold text-[#2F282B]"
                >
                  {HISTORY_HEADER_COPY.filterTrigger}
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-full z-20 mt-2 min-w-[160px] rounded-2xl border border-[#E2D7D0] bg-white py-2 shadow-lg">
                    {HISTORY_FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => applyFilter(opt.value)}
                        className={`block w-full px-4 py-2 text-left text-xs font-semibold ${
                          filter === opt.value ? "bg-[#FFF8EE] text-[#8B6F47]" : "text-[#5A4E48]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {isFullyEmpty ? (
        <>
          <section className="rounded-[26px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-8 text-center">
            <SectionLabel>{HISTORY_PAGE_EMPTY_COPY.sectionLabel}</SectionLabel>
            <h2 className="mt-3 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {HISTORY_PAGE_EMPTY_COPY.headline}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#6B5E58]">
              {HISTORY_PAGE_EMPTY_COPY.body}
            </p>
            <Link
              href="/today"
              className="mt-6 inline-flex rounded-2xl bg-[#2F282B] px-5 py-3 text-sm font-bold text-white"
            >
              {HISTORY_PAGE_EMPTY_COPY.cta}
            </Link>
            <p className="mt-6 border-t border-[#E2D7D0]/60 pt-5 text-xs leading-relaxed text-[#A09488]">
              {HISTORY_FOOTER_COPY.note}
            </p>
          </section>
          <HistoryEmptyPreviews />
        </>
      ) : (
        <>
          {/* 패턴 리포트 + 반복되는 결 (통합) */}
          <section className={PATTERN_CARD_SURFACE}>
            <SectionLabel>{PATTERN_REPORT_COPY.sectionLabel}</SectionLabel>
            <h2 className="mt-2 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {patternHeadline}
            </h2>
            {emptyState?.body && (
              <p className="mt-2 text-sm leading-relaxed text-[#6B5E58]">{emptyState.body}</p>
            )}
            {topTones.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">
                {PATTERN_REPORT_COPY.topTonesPrefix}{" "}
                <span className="font-bold text-[#8B6F47]">{topTones.join(" · ")}</span>{" "}
                {PATTERN_REPORT_COPY.topTonesSuffix}
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-[#6B5E58]">{weekInsight}</p>
            {transitionLine && (
              <p className="mt-3 rounded-2xl border border-[#E8D7C4] bg-white/80 px-4 py-3 text-sm text-[#4A403B]">
                {transitionLine}
              </p>
            )}

            <div className="mt-6 border-t border-[#E8D7C4] pt-5">
              <SectionLabel>{RECURRING_TONES_COPY.sectionLabel}</SectionLabel>
              <h3 className="mt-1 text-base text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {RECURRING_TONES_COPY.headline}
              </h3>
              <p className="mt-1 text-xs text-[#8A7E78]">{RECURRING_TONES_COPY.sub}</p>
              {clusters.length === 0 ? (
                <p className="mt-4 text-sm text-[#8A7E78]">{HISTORY_SECTION_EMPTY_COPY.recurringTones}</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {clusters.map((cluster) => (
                    <button
                      key={cluster.label}
                      type="button"
                      onClick={() => toggleToneFilter(cluster.label)}
                      aria-pressed={toneFilter === cluster.label}
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                        toneFilter === cluster.label
                          ? "border-[#8B6F47] bg-white text-[#2F282B]"
                          : "border-[#E8D7C4] bg-white/70 text-[#5A4E48]"
                      }`}
                    >
                      {cluster.label}
                      {toneFilter === cluster.label && (
                        <span className="sr-only"> {RECURRING_TONES_COPY.chipSelectedSuffix}</span>
                      )}
                      <span className="ml-1 text-xs text-[#8B6F47]">×{cluster.count}</span>
                    </button>
                  ))}
                  {toneFilter && (
                    <button
                      type="button"
                      onClick={() => setToneFilter(null)}
                      className="rounded-full border border-dashed border-[#C4B8AE] px-3 py-1.5 text-xs font-semibold text-[#8A7E78]"
                    >
                      {RECURRING_TONES_COPY.filterClear}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* LAST 7 DAYS */}
          <section className={PATTERN_CARD_SURFACE}>
            <SectionLabel>{LAST_7_DAYS_COPY.sectionLabel}</SectionLabel>
            <h2 className="mt-1 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {LAST_7_DAYS_COPY.headline}
            </h2>
            {last7RecordCount < 2 && (
              <p className="mt-3 text-sm leading-relaxed text-[#8A7E78]">
                {last7RecordCount === 1
                  ? LAST_7_DAYS_COPY.dailyAccumulate
                  : HISTORY_SECTION_EMPTY_COPY.last7Days}
              </p>
            )}
            <PatternLast7DaysStrip
              days={last7}
              onDayClick={(dateKey) => router.push(`/history/${dateKeyToSlug(dateKey)}`)}
            />
            {showLast7WarmupHint && (
              <p className="mt-4 text-center text-sm leading-relaxed text-[#8B6F47]">
                {LAST_7_DAYS_COPY.warmupHint}
              </p>
            )}
            <p className="mt-5 text-center text-[11px] leading-relaxed text-[#A09488]">
              {LAST_7_DAYS_COPY.footerHint}
            </p>
          </section>

          {/* 최근 기록 (+ 저장한 문장) */}
          <section className={`${PATTERN_CARD_SURFACE} space-y-5`}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <SectionLabel>{RECENT_RECORDS_COPY.sectionLabel}</SectionLabel>
                <h2 className="mt-1 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                  {RECENT_RECORDS_COPY.headline}
                </h2>
              </div>
              <Link href="/today" className="shrink-0 text-xs font-bold text-[#8B6F47]">
                {RECENT_RECORDS_COPY.readToday}
              </Link>
            </div>

            {savedSentences.length > 0 && (
              <div className="space-y-3 border-b border-[#E8D7C4] pb-5">
                <p className="text-xs font-bold text-[#8B6F47]">{RECENT_RECORDS_SAVED_SUBCOPY.subhead}</p>
                {savedSentences.slice(0, 3).map((item) => (
                  <Link
                    key={`${item.dateKey}-${item.text}`}
                    href={`/history/${dateKeyToSlug(item.dateKey)}`}
                    className="block rounded-2xl border border-[#E8D7C4] bg-white/80 px-4 py-3 transition hover:border-[#8B6F47]/40"
                  >
                    <p className="text-sm leading-relaxed text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <p className="mt-1.5 text-[11px] text-[#8B6F47]">
                      {SAVED_SENTENCES_COPY.formatMeta(item.shortDate, item.toneLabel)}
                    </p>
                  </Link>
                ))}
                {savedSentences.length > 3 && (
                  <Link href="/history/saved" className="inline-flex text-xs font-bold text-[#8B6F47]">
                    {RECENT_RECORDS_SAVED_SUBCOPY.viewAll}
                  </Link>
                )}
              </div>
            )}

            {filteredRecords.length === 0 ? (
              <p className="text-sm leading-relaxed text-[#6B5E58]">
                {toneFilter || filter !== "all"
                  ? RECENT_RECORDS_COPY.filterNoMatch
                  : HISTORY_SECTION_EMPTY_COPY.recentRecords}
              </p>
            ) : (
              <div className="space-y-3">
              {visibleRecords.map((item) => {
                const status = item.status || getTodayStatus(item.overall);
                const relation = item.areas?.relation ?? item.overall;
                const decision = item.areas?.decision ?? item.overall;
                return (
                  <article
                    key={`${item.dateKey}-${item.birthKey}`}
                    className="rounded-2xl border border-[#E8D7C4] bg-white/80 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#8B6F47]">
                        {RECENT_RECORDS_COPY.formatDateLine(
                          formatShortDate(item.dateKey),
                          getWeekdayShort(item.dateKey),
                          item.toneLabel || status,
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.dateKey, item.birthKey)}
                        className="text-[11px] text-[#8A7E78]"
                      >
                        {RECENT_RECORDS_COPY.delete}
                      </button>
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                      {item.sentence}
                    </p>
                    <p className="mt-2 text-xs text-[#8A7E78]">
                      {RECENT_RECORDS_COPY.formatScores(item.overall, relation, decision)}
                    </p>
                    <Link
                      href={`/history/${dateKeyToSlug(item.dateKey)}`}
                      className="mt-3 inline-flex text-xs font-bold text-[#8B6F47]"
                    >
                      {RECENT_RECORDS_COPY.viewDetail}
                    </Link>
                  </article>
                );
              })}
              </div>
            )}

            {filteredRecords.length > 5 && !showAllRecords && (
              <button
                type="button"
                onClick={() => setShowAllRecords(true)}
                className="w-full rounded-2xl border border-[#E8D7C4] bg-white/80 py-3 text-sm font-bold text-[#2F282B]"
              >
                {RECENT_RECORDS_COPY.loadMore}
              </button>
            )}
          </section>
        </>
      )}

      <HistoryOtherRecords
        sajuCount={stats.sajuCount}
        tarotCount={stats.tarotCount}
        muted={isFullyEmpty}
      />

      {!isFullyEmpty && (
        <p className="text-center text-xs text-[#A09488]">{HISTORY_FOOTER_COPY.note}</p>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryPageSkeleton />}>
      <HistoryPageContent />
    </Suspense>
  );
}
