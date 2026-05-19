import { HISTORY_ARCHIVE_COPY } from "@/lib/history-copy";

type Props = {
  sajuCount: number;
  tarotCount: number;
  muted?: boolean;
};

/** OTHER RECORDS — 사주·타로 보조 카드 */
export default function HistoryOtherRecords({ sajuCount, tarotCount, muted = false }: Props) {
  const total = sajuCount + tarotCount;
  const isEmpty = total === 0;

  return (
    <section
      className={`rounded-[26px] border px-5 py-5 ${
        muted
          ? "border-dashed border-[#E2D7D0] bg-[#FAFAF8]/90"
          : "border-[#E2D7D0] bg-white shadow-[0_8px_22px_rgba(61,51,56,0.04)]"
      }`}
    >
      <p className="text-[11px] font-bold tracking-[0.14em] text-[#8B6F47]/80">
        {HISTORY_ARCHIVE_COPY.sectionLabel}
      </p>
      <h2 className="mt-1 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
        {HISTORY_ARCHIVE_COPY.headline}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6B5E58]">
        {HISTORY_ARCHIVE_COPY.body}
        {isEmpty && (
          <>
            <br />
            <span className="text-[#8A7E78]">{HISTORY_ARCHIVE_COPY.emptyBody}</span>
          </>
        )}
      </p>
      {!isEmpty && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#8B6F47]">
            {HISTORY_ARCHIVE_COPY.sajuCount(sajuCount)}
          </span>
          <span className="rounded-full bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#6B5E58]">
            {HISTORY_ARCHIVE_COPY.tarotCount(tarotCount)}
          </span>
        </div>
      )}
    </section>
  );
}
