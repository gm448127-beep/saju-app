import type { LandingTodaySheetData } from "../lib/landing-today-sheet";

function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

function firstGuideLine(text: string) {
  return text.split(/\n+/).map((line) => line.trim()).find(Boolean) ?? text;
}

export function LandingTodaySheet({ data }: { data: LandingTodaySheetData }) {
  const { report, dateLabel, overall } = data;
  const axes = [
    { label: "愿怨?, score: clampScore(report.axisScores.relation) },
    { label: "寃곗젙", score: clampScore(report.axisScores.decision) },
    { label: "媛먯젙", score: clampScore(report.axisScores.emotion) },
    { label: "洹좏삎", score: clampScore(report.axisScores.balance) },
  ];

  return (
    <section id="landing-today-sheet" className="landing-sheet" aria-label="?ㅻ뒛???댁꽭 由ы룷??>
      <p className="landing-sheet__eyebrow">MY TODAY</p>
      <p className="landing-sheet__date">{dateLabel}</p>
      <span className="landing-sheet__tone">?ㅻ뒛??寃?쨌 {report.toneLabel}</span>
      <p className="landing-sheet__headline">{report.sentence}</p>

      <div className="landing-sheet__score-box">
        <div className="landing-sheet__score-row">
          <div>
            <p className="landing-sheet__score-label">醫낇빀</p>
            <p className="landing-sheet__score-value">{overall}</p>
          </div>
          <p className="landing-sheet__score-status">{report.toneLabel}</p>
        </div>
        <div className="landing-sheet__axes">
          {axes.map((axis) => (
            <div key={axis.label} className="landing-sheet__axis">
              <p className="landing-sheet__axis-label">{axis.label}</p>
              <p className="landing-sheet__axis-value">{axis.score}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="landing-sheet__guide">
        <strong>?ㅻ뒛 ?대젃寃??대낫?몄슂</strong>
        <br />
        {firstGuideLine(report.actionGuide.dos)}
      </p>

      <p className="landing-sheet__footer">留ㅼ씪 ?꾩묠, ?대윴 ????由ы룷?몃? 諛쏆븘蹂댁떎 ???덉뼱??</p>
    </section>
  );
}

