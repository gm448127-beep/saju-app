"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LANDING_CHILL_HOOKS,
  LANDING_CHILL_HOOK_DISPLAY_COUNT,
  pickRandomChillHooks,
  type LandingChillHook,
} from "@/lib/landing-chill-hooks";

function ChillHookQuote({ hook, variant }: { hook: LandingChillHook; variant: "main" | "sub" }) {
  return (
    <blockquote className={`landing-chill-hook${variant === "sub" ? " landing-chill-hook--sub" : ""}`}>
      <p className="landing-chill-hook__line">{hook.line1}</p>
      <p className="landing-chill-hook__punch">{hook.line2}</p>
    </blockquote>
  );
}

/** 첫 화면 — 소름 훅 문장 여러 개 */
export function LandingChillHookDisplay() {
  const [hooks, setHooks] = useState<LandingChillHook[]>(() =>
    LANDING_CHILL_HOOKS.slice(0, LANDING_CHILL_HOOK_DISPLAY_COUNT),
  );

  const refreshHooks = useCallback(() => {
    setHooks(pickRandomChillHooks(LANDING_CHILL_HOOK_DISPLAY_COUNT));
  }, []);

  useEffect(() => {
    refreshHooks();
  }, [refreshHooks]);

  return (
    <div className="landing-chill-hooks" aria-live="polite">
      {hooks.map((hook, index) => (
        <ChillHookQuote key={`${hook.line1}-${index}`} hook={hook} variant={index === 0 ? "main" : "sub"} />
      ))}
      <button type="button" className="landing-chill-hooks__refresh" onClick={refreshHooks}>
        다른 문장 보기
      </button>
    </div>
  );
}
