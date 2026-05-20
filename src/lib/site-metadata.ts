import type { Metadata } from "next";

export const SITE_NAME = "운명비서";

const DEFAULT_OG_IMAGE = "/kakao-og-20260518.png";

/** 프로덕션 URL (커스텀 도메인 연결 시 NEXT_PUBLIC_SITE_URL 설정) */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://saju-app-vert.vercel.app";
}

type PageMetaKey =
  | "home"
  | "today"
  | "saju"
  | "tojeong"
  | "compatibility"
  | "tarot"
  | "dream"
  | "chat"
  | "history"
  | "historySaved";

const PAGE_META: Record<
  PageMetaKey,
  { title: string; description: string; path: string }
> = {
  home: {
    title: "AI 맞춤 사주·오늘의 운세",
    description:
      "오늘의 한 줄, 5축 점수, 행동 가이드부터 사주·토정·궁합까지. 매일 다시 보고 싶은 AI 운명 리포트 운명비서.",
    path: "/",
  },
  today: {
    title: "오늘의 운세 – 내 사주 기준 5축 리포트",
    description:
      "생년월일 기준 오늘의 결, 관계·결정·감정·균형 점수, 권하는 움직임과 어제 비교까지 한눈에 읽는 오늘의 흐름.",
    path: "/today",
  },
  saju: {
    title: "사주팔자 분석 – AI 사주 리포트",
    description:
      "생년월일시로 사주 원국, 십성, 오행, 대운·세운을 정리한 맞춤 사주 분석. 운명비서에서 무료로 확인하세요.",
    path: "/saju",
  },
  tojeong: {
    title: "토정비결 – 올해·신년 운세",
    description:
      "생년월일 기준 토정비결로 한 해의 흐름과 조심할 시기를 읽는 연간 운세 리포트.",
    path: "/tojeong",
  },
  compatibility: {
    title: "궁합 – 두 사람 사주 궁합 분석",
    description:
      "두 분의 생년월일로 관계 온도, 잘 맞는 점, 조율이 필요한 결을 AI 사주 궁합 리포트로 확인합니다.",
    path: "/compatibility",
  },
  tarot: {
    title: "타로 – 마음의 결 읽기",
    description:
      "지금 마음에 닿는 타로 카드로 오늘의 흐름과 선택의 힌트를 짧은 리포트로 받아보세요.",
    path: "/tarot",
  },
  dream: {
    title: "꿈해몽 – 꿈의 상징 해석",
    description:
      "꾼 꿈의 키워드를 바탕으로 오늘의 마음과 흐름에 맞는 꿈해몽 해석을 제공합니다.",
    path: "/dream",
  },
  chat: {
    title: "AI 사주 상담 – 맞춤 운세 대화",
    description:
      "생년월일을 반영한 AI 사주 상담. 재물·연애·직장·건강 등 궁금한 점을 대화로 물어보세요.",
    path: "/chat",
  },
  history: {
    title: "나의 패턴 – 운세 기록·저장 문장",
    description:
      "읽은 오늘의 흐름, 저장한 문장, 주간 패턴을 모아 나만의 운세 기록을 확인합니다.",
    path: "/history",
  },
  historySaved: {
    title: "저장한 문장 – 나의 패턴",
    description: "오늘의 흐름에서 마음에 닿아 저장한 문장 모음.",
    path: "/history/saved",
  },
};

function buildOgImages(siteUrl: string) {
  return [
    {
      url: `${siteUrl}${DEFAULT_OG_IMAGE}`,
      width: 1200,
      height: 630,
      alt: `${SITE_NAME} – AI 맞춤 사주 분석`,
    },
  ];
}

/** 라우트별 title / description / canonical / OG */
export function pageMetadata(key: PageMetaKey): Metadata {
  const page = PAGE_META[key];
  const siteUrl = getSiteUrl();

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.path,
    },
    openGraph: {
      title: `${page.title} | ${SITE_NAME}`,
      description: page.description,
      url: page.path,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
      images: buildOgImages(siteUrl),
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | ${SITE_NAME}`,
      description: page.description,
      images: [`${siteUrl}${DEFAULT_OG_IMAGE}`],
    },
  };
}

/** 루트 layout 기본 메타 */
export function rootMetadata(): Metadata {
  const home = PAGE_META.home;
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} - ${home.title}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: home.description,
    applicationName: SITE_NAME,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${SITE_NAME} - ${home.title}`,
      description: home.description,
      url: "/",
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
      images: buildOgImages(siteUrl),
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} - ${home.title}`,
      description: home.description,
      images: [`${siteUrl}${DEFAULT_OG_IMAGE}`],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}
