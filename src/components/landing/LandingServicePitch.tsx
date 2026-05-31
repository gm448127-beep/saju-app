import { LANDING_SERVICE_PITCH } from "@/lib/landing-service-pitch";

function renderMultiline(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={`${line}-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

/** 랜딩 — 운명비서가 어떤 쇼킹한 서비스인지 설명 */
export function LandingServicePitch() {
  return (
    <section className="landing-service-pitch" aria-label={LANDING_SERVICE_PITCH.eyebrow}>
      <p className="landing-service-pitch__eyebrow">{LANDING_SERVICE_PITCH.eyebrow}</p>
      <h2 className="landing-service-pitch__headline">{renderMultiline(LANDING_SERVICE_PITCH.headline)}</h2>
      <ul className="landing-service-pitch__beats">
        {LANDING_SERVICE_PITCH.beats.map((beat) => (
          <li key={beat}>{beat}</li>
        ))}
      </ul>
      <p className="landing-service-pitch__punchline">{LANDING_SERVICE_PITCH.punchline}</p>
    </section>
  );
}
