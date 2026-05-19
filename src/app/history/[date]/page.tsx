"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  dedupeRecordsByDate,
  formatShortDate,
  getWeekdayShort,
  slugToDateKey,
} from "@/lib/today-pattern-helpers";
import { buildToneTransitionComment } from "@/lib/today-tone-engine";
import { HISTORY_DETAIL_COPY } from "@/lib/history-copy";
import {
  formatHistoryDate,
  getPreviousDayRecord,
  getTodayHistory,
  getTodayStatus,
  type SavedTodayRecord,
} from "@/lib/today-report-helpers";

export default function HistoryDateDetailPage() {
  const params = useParams();
  const slug = typeof params.date === "string" ? params.date : "";
  const dateKey = slugToDateKey(slug);

  const [record, setRecord] = useState<SavedTodayRecord | null>(null);
  const [previous, setPrevious] = useState<SavedTodayRecord | undefined>();
  const [transition, setTransition] = useState<string | null>(null);

  useEffect(() => {
    const all = getTodayHistory();
    const deduped = dedupeRecordsByDate(all);
    const found = deduped.find((r) => r.dateKey === dateKey) ?? null;
    setRecord(found);
    if (found) {
      const prev = getPreviousDayRecord(all, dateKey, found.birthKey);
      setPrevious(prev);
      if (prev?.toneKey && found.toneKey) {
        setTransition(buildToneTransitionComment(prev.toneKey, found.toneKey));
      } else {
        setTransition(null);
      }
    } else {
      setPrevious(undefined);
      setTransition(null);
    }
  }, [dateKey]);

  const status = record ? record.status || getTodayStatus(record.overall) : "";
  const areas = useMemo(() => {
    if (!record) return null;
    return {
      relation: record.areas?.relation ?? record.overall,
      decision: record.areas?.decision ?? record.overall,
      emotion: record.areas?.emotion ?? record.overall,
      balance: record.areas?.balance ?? record.overall,
    };
  }, [record]);

  if (!dateKey || dateKey.length !== 8) {
    return (
      <div className="rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-8 text-center">
        <p className="text-sm text-[#6B5E58]">{HISTORY_DETAIL_COPY.invalidDate}</p>
        <Link href="/history" className="mt-4 inline-flex text-sm font-bold text-[#8B6F47]">
          {HISTORY_DETAIL_COPY.backToPattern}
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-4">
        <Link href="/history" className="text-xs font-semibold text-[#8A7E78]">
          {HISTORY_DETAIL_COPY.back}
        </Link>
        <section className="rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-8 text-center">
          <p className="text-sm text-[#6B5E58]">
            {formatHistoryDate(dateKey)} {HISTORY_DETAIL_COPY.noRecordSuffix}
          </p>
          <Link href="/today" className="mt-4 inline-flex rounded-2xl bg-[#2F282B] px-4 py-2.5 text-sm font-bold text-white">
            {HISTORY_DETAIL_COPY.readToday}
          </Link>
        </section>
      </div>
    );
  }

  const flowHeadline = record.flow?.match(/[^.!?]+[.!?]+/)?.[0]?.trim() ?? record.flow;
  const flowBody = record.flow?.replace(flowHeadline ?? "", "").trim() ?? "";

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-[28px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-6">
        <Link href="/history" className="text-xs font-semibold text-[#8A7E78] hover:text-[#8B6F47]">
          {HISTORY_DETAIL_COPY.back}
        </Link>
        <p className="mt-3 text-xs font-bold text-[#8B6F47]">
          {formatHistoryDate(dateKey)} · {record.toneLabel || status}
        </p>
        <h1 className="mt-2 text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {formatShortDate(dateKey)} ({getWeekdayShort(dateKey)}) · {record.toneLabel || status}
        </h1>
      </section>

      <section className="rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5">
        <p className="text-[11px] font-bold text-[#8B6F47]">{HISTORY_DETAIL_COPY.oneLiner}</p>
        <p className="mt-3 text-xl leading-relaxed text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {record.sentence}
        </p>
      </section>

      {record.flow && (
        <section className="rounded-[26px] border border-[#E2D7D0] bg-[#F5EDE3] px-5 py-5">
          <p className="text-[11px] font-bold text-[#8B6F47]">{HISTORY_DETAIL_COPY.flow}</p>
          {flowHeadline && (
            <p className="mt-3 text-lg leading-snug text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {flowHeadline}
            </p>
          )}
          {flowBody && <p className="mt-2 text-sm leading-relaxed text-[#4A403B]">{flowBody}</p>}
        </section>
      )}

      {areas && (
        <section className="rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5">
          <p className="text-[11px] font-bold text-[#8B6F47]">{HISTORY_DETAIL_COPY.scores}</p>
          <p className="mt-2 text-4xl font-bold text-[#2F282B]">{record.overall}</p>
          <p className="mt-1 text-sm text-[#8B6F47]">
            {HISTORY_DETAIL_COPY.overallMeta} · {status}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-[#FAF8F5] px-3 py-2 text-center">
              <p className="text-[10px] text-[#8A7E78]">{HISTORY_DETAIL_COPY.areas.relation}</p>
              <p className="text-lg font-bold text-[#2F282B]">{areas.relation}</p>
            </div>
            <div className="rounded-xl bg-[#FAF8F5] px-3 py-2 text-center">
              <p className="text-[10px] text-[#8A7E78]">{HISTORY_DETAIL_COPY.areas.decision}</p>
              <p className="text-lg font-bold text-[#2F282B]">{areas.decision}</p>
            </div>
            <div className="rounded-xl bg-[#FAF8F5] px-3 py-2 text-center">
              <p className="text-[10px] text-[#8A7E78]">{HISTORY_DETAIL_COPY.areas.emotion}</p>
              <p className="text-lg font-bold text-[#2F282B]">{areas.emotion}</p>
            </div>
            <div className="rounded-xl bg-[#FAF8F5] px-3 py-2 text-center">
              <p className="text-[10px] text-[#8A7E78]">{HISTORY_DETAIL_COPY.areas.balance}</p>
              <p className="text-lg font-bold text-[#2F282B]">{areas.balance}</p>
            </div>
          </div>
        </section>
      )}

      {record.saveSentence && (
        <section className="rounded-[26px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-5">
          <p className="text-[11px] font-bold text-[#8B6F47]">{HISTORY_DETAIL_COPY.remember}</p>
          <p className="mt-3 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
            &ldquo;{record.saveSentence}&rdquo;
          </p>
        </section>
      )}

      {previous && (
        <section className="rounded-[26px] border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-5">
          <p className="text-[11px] font-bold text-[#8B6F47]">{HISTORY_DETAIL_COPY.compareSection}</p>
          <p className="mt-2 text-sm text-[#6B5E58]">
            {formatShortDate(previous.dateKey)} · {previous.toneLabel || getTodayStatus(previous.overall)}
            <span className="mx-2 text-[#A09488]">→</span>
            {formatShortDate(dateKey)} · {record.toneLabel || status}
          </p>
          {transition && <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">{transition}</p>}
          {previous.sentence && (
            <p className="mt-3 text-xs leading-relaxed text-[#8A7E78]">
              {HISTORY_DETAIL_COPY.yesterdayOneLiner} {previous.sentence}
            </p>
          )}
        </section>
      )}

      <Link
        href="/today"
        className="flex w-full items-center justify-center rounded-2xl bg-[#2F282B] py-3.5 text-sm font-bold text-white"
      >
        {HISTORY_DETAIL_COPY.readTodayAgain}
      </Link>
    </div>
  );
}
