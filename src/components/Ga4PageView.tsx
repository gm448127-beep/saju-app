"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackGa4PageView } from "@/lib/ga4";

/** 앱 라우트 변경 시 GA4 page_view (초기 로드는 gtag config가 처리) */
export default function Ga4PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const pagePath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackGa4PageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}
