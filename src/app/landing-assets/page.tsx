import type { Metadata } from "next";
import "./landing-assets.css";

export const metadata: Metadata = {
  title: "랜딩 이미지 다운로드 · 운명비서",
  robots: { index: false, follow: false },
};

const LANDING_ASSETS = [
  {
    id: "restart-moon",
    title: "재시작 랜딩 — 달·여성 일러스트",
    description: "캔버스형 히어로(우하단 원형)에 사용하는 이미지입니다.",
    previewSrc: "/landing/landing-hero-moon.png",
    downloadSrc: "/landing/landing-hero-moon.png",
    downloadName: "unmyeong-restart-moon-woman.png",
  },
  {
    id: "mbti-flowers",
    title: "MBTI 랜딩 — 꽃·여성 일러스트",
    description: "자기이해 페르소나 히어로 이미지입니다.",
    previewSrc: "/landing/landing-hero.png",
    downloadSrc: "/landing/landing-hero.png",
    downloadName: "unmyeong-mbti-flowers-woman.png",
  },
  {
    id: "decision-cat",
    title: "결정장애 랜딩 — 고양이 일러스트",
    description: "결정장애 페르소나 히어로 이미지입니다.",
    previewSrc: "/landing/landing-hero-cat.png",
    downloadSrc: "/landing/landing-hero-cat.png",
    downloadName: "unmyeong-decision-cat.png",
  },
] as const;

export default function LandingAssetsPage() {
  return (
    <div className="landing-assets">
      <header className="landing-assets__header">
        <p className="landing-assets__brand">
          <span aria-hidden>命</span> 운명비서
        </p>
        <h1 className="landing-assets__title">랜딩 일러스트 다운로드</h1>
        <p className="landing-assets__lead">
          랜딩 페이지에 쓰는 PNG 원본입니다. 아래 「PNG 다운로드」를 누르거나 이미지를 길게 눌러 저장하세요.
        </p>
      </header>

      <ul className="landing-assets__list">
        {LANDING_ASSETS.map((asset) => (
          <li key={asset.id} className="landing-assets__card">
            <div className="landing-assets__preview-wrap">
              <img
                className="landing-assets__preview"
                src={asset.previewSrc}
                alt=""
                width={280}
                height={280}
                loading="lazy"
              />
            </div>
            <div className="landing-assets__meta">
              <h2 className="landing-assets__card-title">{asset.title}</h2>
              <p className="landing-assets__card-desc">{asset.description}</p>
              <a
                className="landing-assets__download"
                href={asset.downloadSrc}
                download={asset.downloadName}
              >
                PNG 다운로드
              </a>
              <p className="landing-assets__direct">
                직접 링크:{" "}
                <a href={asset.downloadSrc} target="_blank" rel="noopener noreferrer">
                  {asset.downloadSrc}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="landing-assets__note">
        정적 페이지(배포 즉시): <code>/landing-download/</code>
      </p>
    </div>
  );
}
