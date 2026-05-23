# 운명비서 — 핵심 운세 계산·입력 로직 (복사용)

> 이 문서는 **오늘의 흐름** 명리 규칙 엔진과 **생년월일 입력** UI의 핵심만 모았습니다.  
> 전체 원본은 아래 경로의 파일을 IDE에서 열면 됩니다.

---

## 1. 처리 흐름 (한눈에)

```
[생년월일 폼] BirthDateNumberInputs / TodayPersonalizeForm
       ↓ POST JSON { year, month, day, hour?, minute?, isLunar, gender }
[/api/today/route.ts]
       ├─ ssaju.calculateSaju() → 내 사주 원국 + 오늘 일진
       ├─ getSipsin(내 일간 오행 × 오늘 천간/지지 오행)
       ├─ findJijiRelations / findCheonganRelations → 합·충·형·해·파 보정
       ├─ SIPSIN_SCORE + totalBonus → wealth/love/career… 점수
       └─ buildDailyFortuneContent() ← today-content-engine + today-tone-engine
              → dailyReport (5축, 오늘의 결, 가이드 문장)
```

- **LLM 없음** — `/api/today`와 `today-tone-engine`은 규칙·시드·문장 풀만 사용
- **신살** — 오늘 API에는 미포함 (사주 페이지 별도)

---

## 2. 핵심 파일 맵

| 역할 | 경로 | 비고 |
|------|------|------|
| **명리 점수 API (메인)** | `src/app/api/today/route.ts` | ~1250줄, 십성·합충·점수·POST |
| **5축·오늘의 결 조립** | `src/lib/today-content-engine.ts` | `buildDailyFortuneContent` |
| **톤·5축 점수·문장 풀** | `src/lib/today-tone-engine.ts` | `generateTodayToneReport` |
| **톤 정의·문장 데이터** | `src/lib/today-tone-data.ts` | TONE_DEFINITIONS |
| **명리 근거 UI** | `src/lib/today-basis-helpers.ts` | 툴팁·근거 블록 |
| **생년월일 입력** | `src/components/BirthDateNumberInputs.tsx` | 숫자 키패드·자동 포커스 |
| **오늘 맞춤 폼** | `src/components/TodayPersonalizeForm.tsx` | 위 컴포넌트 래핑 |
| **사주 계산 라이브러리** | `ssaju` (npm) | `calculateSaju` |

---

## 3. 십성 판정 (API 핵심 — 복사)

`src/app/api/today/route.ts` 에서 그대로 사용:

```typescript
const SAENG_CYCLE: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
const GEUK_CYCLE: Record<string, string> = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" };
const SAENG_BY: Record<string, string> = { 목: "수", 화: "목", 토: "화", 금: "토", 수: "금" };
const GEUK_BY: Record<string, string> = { 목: "금", 화: "수", 토: "목", 금: "화", 수: "토" };

function getSipsin(myOhaeng: string, targetOhaeng: string, sameYinYang: boolean): string {
  if (myOhaeng === targetOhaeng) return sameYinYang ? "비견" : "겁재";
  if (SAENG_CYCLE[myOhaeng] === targetOhaeng) return sameYinYang ? "식신" : "상관";
  if (GEUK_CYCLE[myOhaeng] === targetOhaeng) return sameYinYang ? "편재" : "정재";
  if (GEUK_BY[myOhaeng] === targetOhaeng) return sameYinYang ? "편관" : "정관";
  if (SAENG_BY[myOhaeng] === targetOhaeng) return sameYinYang ? "편인" : "정인";
  return "비견";
}
```

**점수 산식 요약 (POST 내부):**

```typescript
const todaySipsin = getSipsin(myDayOh, tdStemOh, sameYY);           // 일간 × 오늘 천간
const todayJiSipsin = getSipsin(myDayOh, tdBranchOh, tdBranchSameYY); // 일간 × 오늘 지지
const jijiRels = findJijiRelations(myBranches, tdBranch);
const cheonganRels = findCheonganRelations(myStems, tdStem);
const relBonus = getRelationBonus(jijiRels, cheonganRels);          // 합·충 가중치
const totalBonus = relBonus.bonus + seyunEffect.bonus + siBonus;
const baseScores = SIPSIN_SCORE[todaySipsin];
scores.overall = clamp(baseScores.base + totalBonus + jitter());
// …
const dailyReport = buildDailyFortuneContent(today, {
  sipsin: todaySipsin,
  dayElement: myDayOh,
  scores,
  ohaengCount: computeOhaengCountFromPillars(myStems, myBranches),
});
```

전체 POST 핸들러: `src/app/api/today/route.ts` **986~1256행** `export async function POST`.

---

## 4. `today-tone-engine.ts` (전체 — 복사)

```typescript
// src/lib/today-tone-engine.ts — 핵심 export
// generateTodayToneReport(date, profile) → toneKey, 5축 점수, oneLiner, guides, timeFlow
// resolveFinalTone — 날짜 + 오행 편향으로 「평/좋/주의」 톤 결정
// buildToneScores — API overall 있으면 종합에 반영, 없으면 4축 가중 평균
```

파일 전체가 167줄 — IDE에서 `src/lib/today-tone-engine.ts` 열어 복사 권장.

**진입 함수:**

```typescript
export function generateTodayToneReport(
  date = new Date(),
  profile: UserSajuProfile = {},
  options?: { yesterdayTone?: ToneKey },
): TodayToneReport {
  const seedKey = `${dateKey(date)}-${profile.sipsin ?? "default"}-${profile.dayElement ?? "none"}`;
  const toneKey = resolveFinalTone(date, profile);
  const scores = buildToneScores(toneKey, hashSeed(seedKey), profile);
  // … 문장 풀에서 pickFromPool로 선택
}
```

---

## 5. `today-content-engine.ts` (전체 — 복사)

```typescript
// src/lib/today-content-engine.ts
export function buildDailyFortuneContent(
  date = new Date(),
  profile: DailyProfile = {},
  options?: { yesterdayTone?: ToneKey },
): DailyFortuneContent {
  const toneReport = generateTodayToneReport(date, profile, options);
  return {
    toneKey, toneLabel, axisScores: { relation, decision, emotion, balance },
    sentence, flow, actionGuide, timeSlots, weekly, recommendation, …
  };
}
```

파일 전체 138줄 — `src/lib/today-content-engine.ts`.

---

## 6. `BirthDateNumberInputs.tsx` (전체 — 복사)

경로: **`src/components/BirthDateNumberInputs.tsx`** (216줄)

- `inputMode="numeric"` + `pattern="[0-9]*"`
- 년 4자리 → 월, 월 2자리(또는 2~9 한 자리) → 일 자동 포커스
- `export function isValidBirthDate(year, month, day)`

사용처: `/today`, `/saju`, `/tojeong`, `/compatibility`, `/chat`, `OnboardingModal`

---

## 7. 폼에서 API 호출 예시

`src/app/today/page.tsx`:

```typescript
const res = await fetch("/api/today", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(profileToTodayPayload(profile)),
});
const json = await res.json();
// json.dailyReport → 5장 리포트
// json.scores.overall → 종합 점수
// json.todaySipsin, json.myDayGan → 명리 근거
```

`src/lib/user-profile-storage.ts` 의 `profileToTodayPayload()` 가 birth 필드를 API body로 변환.

---

## 8. 명리 근거 한 줄 (UI)

`src/lib/today-basis-helpers.ts`:

```typescript
export function buildToneChipTooltip(result, toneLabel): string | null {
  // 「갑목 일간 × 오늘 일진(병오일) → 식신(표현·풍요) 작용 → ○○의 결」
}
```

---

## 9. 빠른 로컬 확인

```bash
npm run dev
# POST http://localhost:3000/api/today
# Body: {"year":1995,"month":8,"day":17,"gender":"여","isLunar":false}
```

---

*문서 생성: 운명비서 코드베이스 기준. 수정 시 이 파일도 함께 갱신하면 좋습니다.*
