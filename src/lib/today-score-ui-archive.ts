/**
 * `/today` 점수 UI 복원용 아카이브 (2026-05)
 *
 * 화면에서 숫자·등급·막대 등 점수 표현을 제거했습니다.
 * API `scores`, `hourlyFlow[].score` 등 계산 데이터는 그대로 두었습니다.
 *
 * 복원 순서:
 * 1. `TODAY_SHOW_SCORES_UI` 를 `true` 로 변경 (아래)
 * 2. 각 컴포넌트에서 `showScores` 분기 복구 또는 git에서 해당 파일 diff 참고
 * 3. `page.tsx` 에 `TodayScoreBasisBar` 다시 연결
 *
 * @see src/components/today/TodayScoreBasisBar.tsx — 종합 점수 바 (미사용, 파일 유지)
 * @see src/components/TodayStatsSection.tsx — 5대운 (유료에서 제거됨)
 * @see src/components/TodayFiveCardReport.tsx — 4축 점수 카드 (구 핵심 탭)
 * @see src/components/AxisScorePanel.tsx
 * @see src/components/TodayScoreHero.tsx
 */

/** `true` 로 바꾸면 점수 UI 분기를 다시 켤 수 있도록 설계 (현재는 표시만 숨김) */
export const TODAY_SHOW_SCORES_UI = false;

/** 제거된 UI 위치 요약 */
export const TODAY_SCORE_UI_REMOVED_FROM = [
  "src/app/today/page.tsx — TodayScoreBasisBar(종합 N점), scoreStale·다시계산",
  "src/components/today/TodayDomainFortuneAccordion.tsx — N점·등급(주의/평) 배지",
  "src/components/today/TodayDetailedFortuneReport.tsx — 큰 숫자, 진행 막대, 등급 배지",
  "src/components/HourlyFlowSection.tsx — 시진 카드·툴팁·가장좋은/조심할 시간의 N점",
  "src/components/TimeAdviceSection.tsx — 시간대별 N점·평균 N점·진행 막대",
  "src/components/today/TodayPremiumDetailSections.tsx — 5대운(TodayStatsSection) 블록",
] as const;

/** 복원 시 page.tsx 에 다시 넣을 블록 (요약) */
export const TODAY_SCORE_BASIS_BAR_RESTORE_SNIPPET = `
{result?.scores?.overall != null && lastFetchedPayload && (
  <TodayScoreBasisBar
    overall={clampFortuneScore(result.scores.overall)}
    calcDateKey={result.calcDateKey}
    payload={lastFetchedPayload}
    stale={scoreStale}
    onRecalculate={() => void recalculateFromForm()}
  />
)}
`;

/** 분야별 요약 카드 — 점수·등급 표시 (복원용) */
export const TODAY_DOMAIN_SCORE_SUMMARY_SNIPPET = `
<span className="today-secretary__domain-score">
  {card.score}점 · {card.grade}
</span>
`;

/** 분야별 상세 — 점수 헤더·막대 (복원용) */
export const TODAY_DETAILED_FORTUNE_SCORE_SNIPPET = `
<div className="text-right">
  <p className="text-3xl font-bold">{item.score}</p>
  {item.grade && <p className="text-xs">{item.grade}</p>}
</div>
<div className="h-2.5 rounded-full bg-[#EDE4DC]">
  <div style={{ width: \`\${item.score}%\` }} />
</div>
`;
