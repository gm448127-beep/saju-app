"use client";

import type { TodayExpertBasisGuide } from "@/lib/today-expert-basis-guide";

type TodayExpertBasisAccordionProps = {
  guide: TodayExpertBasisGuide | null;
};

/** 왜 이런 해석이 나왔나요 — 4단계 명리 이해 가이드 */
export default function TodayExpertBasisAccordion({ guide }: TodayExpertBasisAccordionProps) {
  if (!guide) return null;

  return (
    <section className="today-secretary__expert" aria-label="왜 이런 해석이 나왔나요">
      <details>
        <summary>
          <div>
            <p className="today-secretary__section-label" style={{ margin: 0 }}>
              명리 이해
            </p>
            <p
              className="today-secretary__card-title"
              style={{ marginTop: "0.25rem", fontSize: "0.9375rem", color: "#5a4e48" }}
            >
              왜 이런 해석이 나왔나요?
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#E2D7D0] bg-white px-2.5 py-1 text-[11px] font-bold text-[#8B6F47]">
            ▼
          </span>
        </summary>

        <div className="today-secretary__expert-body">
          <p className="today-secretary__expert-intro">
            용어만 던지지 않아요. 오늘 기운이 현실에서 어떻게 보이는지, 그래서 어떤 조언이 나왔는지 순서대로
            풀어 드릴게요.
          </p>

          <div className="today-secretary__expert-step">
            <h4 className="today-secretary__expert-step-title">{guide.step1.title}</h4>
            {guide.step1.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="today-secretary__expert-para">
                {p}
              </p>
            ))}
          </div>

          <div className="today-secretary__expert-step">
            <h4 className="today-secretary__expert-step-title">{guide.step2.title}</h4>
            <ul className="today-secretary__expert-bullets">
              {guide.step2.bullets.map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="today-secretary__expert-step">
            <h4 className="today-secretary__expert-step-title">{guide.step3.title}</h4>
            {guide.step3.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="today-secretary__expert-para">
                {p}
              </p>
            ))}
          </div>

          <div className="today-secretary__expert-step">
            <h4 className="today-secretary__expert-step-title">{guide.step4.title}</h4>
            <div className="today-secretary__expert-table-wrap">
              <table className="today-secretary__expert-table">
                <tbody>
                  {guide.step4.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>
                        <span className="today-secretary__expert-table-value">{row.value}</span>
                        {row.note && (
                          <span className="today-secretary__expert-table-note">{row.note}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="today-secretary__expert-footnote">
            참고용 명리 요약이에요. 마지막 선택은 오늘 상황이랑 본인 판단을 같이 보세요.
          </p>
        </div>
      </details>
    </section>
  );
}
