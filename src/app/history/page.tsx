"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import HistoryEmptyPreviews from "@/components/pattern/HistoryEmptyPreviews";
import HistoryOtherRecords from "@/components/pattern/HistoryOtherRecords";
import HistoryPageSkeleton from "@/components/pattern/HistoryPageSkeleton";
import PatternDots from "@/components/pattern/PatternDots";
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
    loadRecords();
    return () => window.clearTimeout(skeletonTimer);
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
    <div className="space-y-5 pb-8">
      {/* 헤더 */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#E2D7D0] bg-white px-5 py-6 shadow-[0_14px_38px_rgba(61,51,56,0.06)] sm:px-7">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#F1E7DE]/80" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <Link href="/" className="text-xs font-semibold text-[#8A7E78] hover:text-[#8B6F47]">
              {HISTORY_HEADER_COPY.backBrand}
            </Link>
            <h1 className="mt-2 text-2xl text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
              {HISTORY_HEADER_COPY.title}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#8A7E78]">{HISTORY_HEADER_COPY.subtitle}</p>
          </div>
          {filterEnabled ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="rounded-full border border-[#D9C8C0] bg-[#FAF8F5] px-3 py-1.5 text-xs font-bold text-[#2F282B]"
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
          {emptyState && !emptyState.showCta && (
            <section className="rounded-[26px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-4">
              <h2 className="text-base text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {emptyState.headline}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5E58]">{emptyState.body}</p>
            </section>
          )}

          {/* PATTERN REPORT */}
          <section className="rounded-[26px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-5">
            <SectionLabel>{PATTERN_REPORT_COPY.sectionLabel}</SectionLabel>
            <h2 className="mt-2 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {PATTERN_REPORT_COPY.headline}
            </h2>
            {topTones.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">
                {PATTERN_REPORT_COPY.topTonesPrefix}{" "}
                <span className="font-bold text-[#8B6F47]">{topTones.join(" · ")}</span>{" "}
                {PATTERN_REPORT_COPY.topTonesSuffix}
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-[#6B5E58]">{weekInsight}</p>
            {transitionLine && (
              <p className="mt-3 rounded-2xl border border-[#E2D7D0]/80 bg-white/80 px-4 py-3 text-sm text-[#4A403B]">
                {transitionLine}
              </p>
            )}
          </section>

          {/* RECURRING TONES */}
          <section className="rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(61,51,56,0.04)]">
            <SectionLabel>{RECURRING_TONES_COPY.sectionLabel}</SectionLabel>
            <h2 className="mt-1 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {RECURRING_TONES_COPY.headline}
            </h2>
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
                        ? "border-[#8B6F47] bg-[#FFF8EE] text-[#2F282B]"
                        : "border-[#E2D7D0] bg-[#FAF8F5] text-[#5A4E48]"
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
          </section>

          {/* LAST 7 DAYS */}
          <section className="rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(61,51,56,0.04)]">
            <SectionLabel>{LAST_7_DAYS_COPY.sectionLabel}</SectionLabel>
            <h2 className="mt-1 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {LAST_7_DAYS_COPY.headline}
            </h2>
            {last7RecordCount < 2 && (
              <p className="mt-3 text-sm text-[#8A7E78]">{HISTORY_SECTION_EMPTY_COPY.last7Days}</p>
            )}
            <div className="mt-4 space-y-2">
              {last7.map((day) => (
                <button
                  key={day.dateKey}
                  type="button"
                  disabled={!day.hasRecord}
                  onClick={() => day.hasRecord && router.push(`/history/${dateKeyToSlug(day.dateKey)}`)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    day.hasRecord
                      ? "border-[#E2D7D0] bg-[#FFFDF9] hover:border-[#8B6F47]/40"
                      : "border-[#F0EBE6] bg-[#FAFAF8] opacity-60"
                  }`}
                >
                  <span className="text-xs font-semibold text-[#6B5E58]">
                    {day.shortDate}
                    <span className="ml-1 text-[#A09488]">({day.weekday})</span>
                  </span>
                  <div className="flex items-center gap-3">
                    {day.hasRecord ? (
                      <>
                        <PatternDots filled={day.dotsFilled} />
                        <span className="text-xs font-bold text-[#8B6F47]">{day.toneLabel}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#C4B8AE]">{LAST_7_DAYS_COPY.rowNoRecord}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#6B5E58]">{weekInsight}</p>
          </section>

          {/* SAVED SENTENCES */}
          <section className="rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(61,51,56,0.04)]">
            <SectionLabel>{SAVED_SENTENCES_COPY.sectionLabel}</SectionLabel>
            <h2 className="mt-1 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {SAVED_SENTENCES_COPY.headline}
            </h2>
            {savedSentences.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-[#6B5E58]">{HISTORY_SECTION_EMPTY_COPY.savedSentences}</p>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  {savedSentences.slice(0, 3).map((item) => (
                    <Link
                      key={`${item.dateKey}-${item.text}`}
                      href={`/history/${dateKeyToSlug(item.dateKey)}`}
                      className="block rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4 transition hover:border-[#8B6F47]/40"
                    >
                      <p className="text-base leading-relaxed text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                        &ldquo;{item.text}&rdquo;
                      </p>
                      <p className="mt-2 text-xs text-[#8B6F47]">
                        {SAVED_SENTENCES_COPY.formatMeta(item.shortDate, item.toneLabel)}
                      </p>
                    </Link>
                  ))}
                </div>
                {savedSentences.length > 3 && (
                  <Link href="/history/saved" className="mt-3 inline-flex text-xs font-bold text-[#8B6F47]">
                    {SAVED_SENTENCES_COPY.viewAll}
                  </Link>
                )}
              </>
            )}
          </section>

          {/* RECENT RECORDS */}
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <SectionLabel>{RECENT_RECORDS_COPY.sectionLabel}</SectionLabel>
                <h2 className="mt-1 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                  {RECENT_RECORDS_COPY.headline}
                </h2>
              </div>
              <Link href="/today" className="text-xs font-bold text-[#8B6F47]">
                {RECENT_RECORDS_COPY.readToday}
              </Link>
            </div>

            {filteredRecords.length === 0 ? (
              <p className="rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-5 text-sm text-[#6B5E58]">
                {RECENT_RECORDS_COPY.filterNoMatch}
              </p>
            ) : (
              visibleRecords.map((item) => {
                const status = item.status || getTodayStatus(item.overall);
                const relation = item.areas?.relation ?? item.overall;
                const decision = item.areas?.decision ?? item.overall;
                return (
                  <article
                    key={`${item.dateKey}-${item.birthKey}`}
                    className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(61,51,56,0.04)]"
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
              })
            )}

            {filteredRecords.length > 5 && !showAllRecords && (
              <button
                type="button"
                onClick={() => setShowAllRecords(true)}
                className="w-full rounded-2xl border border-[#E2D7D0] bg-white py-3 text-sm font-bold text-[#2F282B]"
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
