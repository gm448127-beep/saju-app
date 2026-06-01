"use client";

import Link from "next/link";
import { TOMORROW_PREVIEW_BASIS_NOTE, type TomorrowPreviewData } from "@/lib/tomorrow-preview";

type TomorrowPreviewTeaserProps = {
  preview: TomorrowPreviewData;
  /** 랜딩 등 — 앱 링크 숨김 */
  embedMode?: boolean;
};

export default function TomorrowPreviewTeaser({ preview, embedMode = false }: TomorrowPreviewTeaserProps) {
  return (
    <section className="tomorrow-preview" aria-label="내일 미리보기">
      <div className="tomorrow-preview__head">
        <div>
          <p className="tomorrow-preview__eyebrow">내일 미리보기</p>
          <p className="tomorrow-preview__date">{preview.dateLabel}</p>
        </div>
        <span className="tomorrow-preview__lock" aria-hidden>
          🔒
        </span>
      </div>

      <p className="tomorrow-preview__tone">
        <span className="tomorrow-preview__tone-label">내일의 결</span>
        <span className="tomorrow-preview__tone-value">{preview.toneLabel}</span>
      </p>

      <div className="tomorrow-preview__keywords" aria-label="내일 핵심 키워드">
        {preview.keywords.map((keyword) => (
          <span key={keyword} className="tomorrow-preview__keyword">
            {keyword}
          </span>
        ))}
      </div>

      <p className="tomorrow-preview__tease">한 줄·점수·행동 가이드는 내일 아침에 공개됩니다.</p>

      <p className="tomorrow-preview__basis">{TOMORROW_PREVIEW_BASIS_NOTE}</p>

      {embedMode ? (
        <div className="tomorrow-preview__cta tomorrow-preview__cta--locked" aria-disabled="true">
          <span>내일 전체 보기</span>
          <span className="tomorrow-preview__cta-sub">내일 아침에 열려요</span>
        </div>
      ) : (
        <Link
          href="/today"
          className="tomorrow-preview__cta tomorrow-preview__cta--locked"
          aria-disabled="true"
          onClick={(event) => event.preventDefault()}
          tabIndex={-1}
        >
          <span>내일 전체 보기</span>
          <span className="tomorrow-preview__cta-sub">내일 아침에 열려요</span>
        </Link>
      )}

      <p className="tomorrow-preview__footer">매일 아침 새 리포트와 함께 확인할 수 있어요.</p>
    </section>
  );
}
