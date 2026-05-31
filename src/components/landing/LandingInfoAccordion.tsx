"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export type LandingInfoBlock = {
  title: string;
  children: ReactNode;
};

type LandingInfoAccordionProps = {
  blocks: LandingInfoBlock[];
};

/** 랜딩 — 설명 3박스 (모바일 접기, 데스크톱 펼침) */
export function LandingInfoAccordion({ blocks }: LandingInfoAccordionProps) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section className="landing-info" aria-label="서비스 설명">
      {blocks.map((block) => (
        <details key={block.title} className="landing-info__item" open={desktop || undefined}>
          <summary className="landing-info__summary">{block.title}</summary>
          <div className="landing-info__content">{block.children}</div>
        </details>
      ))}
    </section>
  );
}
