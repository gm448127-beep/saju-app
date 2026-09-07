import type { ReactNode } from "react";

export default function PolicyPage({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper-elevated)] px-6 py-8 md:px-10">
        <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[var(--ink)] md:text-4xl">{title}</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">{description}</p>
      </header>
      <div className="policy-body mt-6 rounded-[1.75rem] border border-[var(--line)] bg-white px-6 py-8 md:px-10">
        {children}
      </div>
    </article>
  );
}
