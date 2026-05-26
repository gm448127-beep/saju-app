"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HISTORY_DETAIL_COPY,
  HISTORY_HEADER_COPY,
  SAVED_SENTENCES_COPY,
} from "@/lib/history-copy";
import { buildSavedSentencesArchive, dateKeyToSlug } from "@/lib/today-pattern-helpers";
import { getTodayHistory } from "@/lib/today-report-helpers";

export default function HistorySavedPage() {
  const [items, setItems] = useState<ReturnType<typeof buildSavedSentencesArchive>>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(buildSavedSentencesArchive(getTodayHistory()));
    setReady(true);
  }, []);

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-[28px] border border-[#E2D7D0] bg-white px-5 py-6">
        <Link href="/history" className="text-xs font-semibold text-[#8A7E78] hover:text-[#8B6F47]">
          {HISTORY_DETAIL_COPY.back}
        </Link>
        <p className="mt-3 text-[11px] font-bold tracking-[0.14em] text-[#8B6F47]">
          {SAVED_SENTENCES_COPY.sectionLabel}
        </p>
        <h1 className="mt-1 text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {SAVED_SENTENCES_COPY.headline}
        </h1>
        <p className="mt-2 text-sm text-[#6B5E58]">{SAVED_SENTENCES_COPY.pageSub}</p>
      </section>

      {!ready ? (
        <p className="text-center text-sm text-[#8A7E78]">{HISTORY_HEADER_COPY.loading}</p>
      ) : items.length === 0 ? (
        <section className="rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-8 text-center">
          <p className="text-sm leading-relaxed text-[#6B5E58]">{SAVED_SENTENCES_COPY.empty}</p>
          <Link
            href="/today"
            className="mt-4 inline-flex rounded-2xl bg-[#7B7355] px-4 py-2.5 text-sm font-bold text-white"
          >
            {SAVED_SENTENCES_COPY.pageEmptyCta}
          </Link>
        </section>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={`${item.dateKey}-${item.text}`}
              href={`/history/${dateKeyToSlug(item.dateKey)}`}
              className="block rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(61,51,56,0.04)] transition hover:border-[#8B6F47]/40"
            >
              <p className="text-lg leading-relaxed text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                &ldquo;{item.text}&rdquo;
              </p>
              <p className="mt-3 text-xs font-bold text-[#8B6F47]">
                {SAVED_SENTENCES_COPY.formatMeta(item.shortDate, item.toneLabel)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
