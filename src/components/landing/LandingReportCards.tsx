export type LandingReportCardItem = {
  title: string;
  body: string;
  subLabel?: string;
  bullets?: string[];
};

type LandingReportCardsProps = {
  sectionTitle?: string;
  toneLabel?: string;
  items: LandingReportCardItem[];
  variant?: "example" | "personal";
};

/** 랜딩 — 오늘 리포트 3블록 (운세 · 좋은 시간 · 피할 행동) */
export function LandingReportCards({
  sectionTitle = "오늘의 리포트 예시",
  toneLabel,
  items,
  variant = "example",
}: LandingReportCardsProps) {
  return (
    <section
      className={`landing-report-cards${variant === "personal" ? " landing-report-cards--personal" : ""}`}
      aria-label={sectionTitle}
    >
      <h2 className="landing-report-cards__title">{sectionTitle}</h2>
      {toneLabel ? (
        <p className="landing-report-cards__tone">오늘의 결 : {toneLabel}</p>
      ) : null}
      <ol className="landing-report-cards__list">
        {items.map((item, index) => (
          <li key={item.title} className="landing-report-cards__item">
            <p className="landing-report-cards__item-num">{index + 1}</p>
            <div className="landing-report-cards__item-body">
              <h3 className="landing-report-cards__item-title">{item.title}</h3>
              <p className="landing-report-cards__text">{item.body}</p>
              {item.subLabel ? (
                <p className="landing-report-cards__sub-label">{item.subLabel}</p>
              ) : null}
              {item.bullets && item.bullets.length > 0 ? (
                <ul className="landing-report-cards__bullets">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export const LANDING_REPORT_EXAMPLE_ITEMS: LandingReportCardItem[] = [
  {
    title: "오늘의 운세",
    body: "오늘은 결과보다 순서가 중요한 날이에요.",
    subLabel:
      "새로운 일을 시작하기보다 이미 진행 중인 일을 정리할 때 더 좋은 흐름이 들어와요.",
  },
  {
    title: "오늘 가장 좋은 시간",
    body: "오전 10:00 ~ 11:30",
    subLabel: "추천 행동",
    bullets: ["제안하기", "연락하기", "결정 내리기"],
  },
  {
    title: "오늘 피해야 할 행동",
    body: "상대의 말만 믿고 결정하기",
    subLabel:
      "오늘은 좋은 조건보다 누가 그 조건을 가져왔는지가 더 중요해요.",
  },
];
