"use client";

import Image from "next/image";
import Link from "next/link";
import type { LandingPersonaCopy } from "@/lib/landing-copy";

function TitleLines({
  lines,
  emIndex,
}: {
  lines: string[];
  emIndex?: number;
}) {
  return (
    <h1
      className="font-[family-name:var(--font-jua)] text-[1.65rem] leading-[1.35] tracking-tight text-[#2F282B] sm:text-[2.4rem]"
      style={{ fontFamily: "Jua, sans-serif" }}
    >
      {lines.map((line, i) => (
        <span key={line}>
          {i > 0 && <br />}
          {i === emIndex ? <span className="text-[#8B6F47]">{line}</span> : line}
        </span>
      ))}
    </h1>
  );
}

function CompareRows({ rows }: { rows: LandingPersonaCopy["hook"]["compare"] }) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {rows.map((row) => (
        <div
          key={row.title}
          className="flex items-center gap-3.5 rounded-2xl border border-[rgba(47,40,43,0.1)] bg-[#FBF8F3] px-4 py-4"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[17px] ${
              row.variant === "brand"
                ? "bg-[#2F282B] font-[family-name:var(--font-jua)] text-[#F5F1EB]"
                : "bg-[#EAE2D5] font-serif text-[#9a8c76]"
            }`}
            style={row.variant === "brand" ? { fontFamily: "Jua, sans-serif" } : undefined}
          >
            {row.badge}
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-medium text-[#2F282B]">{row.title}</p>
            <p className="mt-0.5 text-[12.5px] text-[#6B6159]">{row.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportPreview({ report }: { report: LandingPersonaCopy["report"] }) {
  return (
    <div className="relative mt-7 overflow-hidden rounded-[22px] border border-[rgba(47,40,43,0.1)] bg-[#FBF8F3] p-5 shadow-[0_16px_36px_-14px_rgba(47,40,43,0.22)]">
      <span
        className="pointer-events-none absolute -bottom-7 -right-3 select-none font-serif text-[130px] leading-none text-[#8B6F47] opacity-[0.05]"
        aria-hidden
      >
        命
      </span>
      <p className="text-[11px] tracking-wide text-[#a89c8d]">{report.date}</p>
      <p className="mt-1 text-base text-[#8B6F47]" style={{ fontFamily: "Jua, sans-serif" }}>
        {report.flow}
      </p>
      <p
        className="mt-3 whitespace-pre-line font-serif text-[15.5px] font-medium leading-relaxed text-[#2F282B]"
      >
        {report.line}
      </p>
      <div className="mt-4 flex items-end gap-1.5">
        <span className="text-4xl font-bold text-[#2F282B]">{report.score}</span>
        <span className="pb-1 text-sm text-[#8A7E78]">/ 100 · 종합</span>
      </div>
      <div className="mt-4 space-y-2">
        {report.bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2 text-xs">
            <span className="w-10 shrink-0 text-[#6B6159]">{bar.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EDE6DB]">
              <div
                className="h-full rounded-full bg-[#8B6F47]"
                style={{ width: `${bar.value}%` }}
              />
            </div>
            <span className="w-6 text-right font-semibold text-[#2F282B]">{bar.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PersonaLanding({ copy }: { copy: LandingPersonaCopy }) {
  return (
    <div
      className="-mx-4 min-h-[calc(100dvh-3.5rem)] bg-[#F5F1EB] text-[#2F282B] sm:-mx-0"
      style={{ fontFamily: "Noto Sans KR, sans-serif" }}
    >
      {/* HERO */}
      <section className="relative grid min-h-[min(600px,90dvh)] grid-cols-1 items-center gap-8 overflow-hidden px-6 py-10 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-16 lg:py-14">
        <span
          className="pointer-events-none absolute bottom-[15%] right-[8%] z-0 select-none font-serif text-[min(140px,28vw)] font-semibold leading-[0.8] text-[#8B6F47] opacity-[0.08]"
          aria-hidden
        >
          命
        </span>
        <div className="relative z-10">
          <span className="inline-block rounded-full border border-[rgba(139,111,71,0.4)] bg-[rgba(251,248,243,0.7)] px-4 py-1.5 text-xs tracking-[0.2em] text-[#8B6F47]">
            {copy.heroTag}
          </span>
          <div className="mt-5">
            <TitleLines lines={copy.heroTitleLines} emIndex={copy.heroTitleEmIndex} />
          </div>
          <p className="mt-4 max-w-lg text-base leading-[1.8] text-[#6B6159]">{copy.heroLead}</p>
          <Link
            href={copy.capture.ctaHref}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2F282B] px-8 py-3.5 text-sm font-bold text-[#F5F1EB] shadow-[0_14px_32px_rgba(47,40,43,0.22)] transition hover:brightness-110"
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            {copy.capture.ctaLabel}
          </Link>
        </div>
        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="relative aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-[20px] shadow-[0_30px_60px_-20px_rgba(47,40,43,0.15)]">
            <Image
              src={copy.heroImage}
              alt=""
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 520px"
              priority
            />
          </div>
        </div>
      </section>

      {/* HOOK */}
      <section className="px-6 py-12 lg:px-20">
        <p className="text-xs tracking-[0.14em] text-[#8B6F47]">{copy.hook.kicker}</p>
        <h2
          className="mt-3 whitespace-pre-line text-[1.65rem] leading-snug text-[#2F282B] sm:text-[1.75rem]"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          {copy.hook.title}
        </h2>
        {copy.hook.body.map((para) => (
          <p key={para.slice(0, 24)} className="mt-4 text-[15.5px] font-light leading-[1.85] text-[#6B6159]">
            {para}
          </p>
        ))}
        <CompareRows rows={copy.hook.compare} />
      </section>

      {/* REPORT */}
      <section className="bg-[#EDE6DB] px-6 py-12 lg:px-20">
        <p className="text-xs tracking-[0.14em] text-[#8B6F47]">{copy.report.kicker}</p>
        <h2
          className="mt-3 whitespace-pre-line text-[1.65rem] leading-snug text-[#2F282B] sm:text-[1.75rem]"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          {copy.report.title}
        </h2>
        <ReportPreview report={copy.report} />
      </section>

      {/* CTA */}
      <section className="px-6 py-14 pb-20 lg:px-20" id="signup">
        <div className="relative mx-auto max-w-lg overflow-hidden rounded-[28px] border border-[rgba(47,40,43,0.1)] bg-[#FBF8F3] px-6 py-10 text-center shadow-[0_20px_48px_-16px_rgba(47,40,43,0.2)]">
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2F282B] font-serif text-lg text-[#F5F1EB]"
            aria-hidden
          >
            命
          </span>
          <h2
            className="mt-4 whitespace-pre-line text-2xl leading-snug text-[#2F282B]"
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            {copy.capture.title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#6B6159]">
            {copy.capture.subtitle}
          </p>
          <Link
            href={copy.capture.ctaHref}
            className="mt-8 flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#2F282B] px-6 py-3.5 text-base font-bold text-[#F5F1EB] transition hover:brightness-110"
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            {copy.capture.ctaLabel}
          </Link>
          <Link href="/" className="mt-4 inline-block text-xs text-[#8A7E78] underline-offset-2 hover:underline">
            운명비서 홈으로
          </Link>
        </div>
      </section>
    </div>
  );
}
