# 운명비서 v3 — 프롬프트·데이터 재설계안 (제안)

> **전제:** [`philosophy-v3-diagnostic-report.md`](./philosophy-v3-diagnostic-report.md) 진단 반영  
> **상태:** 제안만 — 구현 전 검토용  
> **목표:** 문장 수정이 아닌 **철학 단일화** (팩트 → 환경 → 반응 → 장면 → …)

---

## 1. 아키텍처 — 3층

```
┌─────────────────────────────────────────┐
│  A. 헌법 블록 (공통)                      │
│     buildUnmyeongConstitutionV3Block()   │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ B. 데이터     │ │ C. 제품   │ │ D. 후처리   │
│ 사전·팩트     │ │ 어댑터    │ │ voice lint  │
│ 월령·십성     │ │ today/   │ │ 금지어 스캔 │
│              │ │ saju/    │ │             │
│              │ │ chat…    │ │             │
└──────────────┘ └──────────┘ └──────────────┘
```

**원칙:** LLM에게 「성격 써줘」가 아니라, **팩트 시트 + 장면 사전 + 헌법**만 준다.

---

## 2. A층 — 공통 헌법 블록 (신규·통합)

`src/lib/unmyeong-constitution-v3.ts` (제안) — 기존 `unmyeong-generation-voice.ts` **대체·확장**

### 2.1 포함 내용

```ts
// 제안 구조 (의사코드)

export const V3_INTERPRETATION_ORDER = [
  "fact",           // 팩트 — AI 추측 금지
  "environment",    // 환경 — 월령/일진 공기·압력
  "response",       // 반응 — 일간 자세
  "scenes_five",    // 관계·일·돈·선택·감정
  "when_shaken",    // 흔들릴 때
  "secretary",      // 비서 제안 — 구조·행동
  "one_liner",      // 한 문장 — 패턴 서술만
  "evidence_fold",  // 근거 접이
] as const;

export const V3_SAJU_ORDER = ["month_command", "day_master", "ten_gods"] as const;

export function buildUnmyeongConstitutionV3Block(opts?: {
  product: "today" | "saju" | "premium" | "chat" | "tarot" | "compat";
  includeMonthLord?: boolean;
  includePersonaModule?: "female_founder" | null;
}): string;
```

### 2.2 사용자 제시 「절대 금지」전량 편입

- 사주 용어 **본문** 나열 · MBTI · 강/약 · 리더형 · 성격 진단 · 교훈 · 명언 · 예언 · 「원래 ~한 사람」

### 2.3 「당신은」 규칙 (v3 통합)

| 금지 | 허용 |
|------|------|
| 당신은 원래 ~한 사람입니다 | 당신은 ~하는 편 / ~쪽으로 움직이기 쉽습니다 |
| (장면 없이) 당신은 X입니다 | 직전 5축 장면 또는 `(근거: …)` 필수 |

### 2.4 장면 우선 원칙 — 프롬프트 내 few-shot

사용자 제시 3쌍 + 조사 3번 십성 1줄씩 **고정 예시**로 블록에 포함 (모델별 drift 방지).

---

## 3. B층 — 데이터 사전 (신규)

### 3.1 `src/lib/myungri/sipsin-scene-dictionary.ts`

- 조사 3번 **10십성 × 5축** (+ `when_shaken`)  
- 키: `비견.relation`, `비견.work`, …  
- 값: `{ scene: string; micro?: string }` — **형용사 진단 없음**  
- 생성 시: **전면 십성 1~2개**만 본문에, 나머지 접이

### 3.2 `src/lib/myungri/month-lord-anchors.ts` (P1)

- 조사 1번: **갑·을 × 12월령** `environment` + `one_liner` 템플릿  
- 이후 병·정·무… 확장

### 3.3 `src/lib/myungri/build-chart-facts.ts`

- `saju-premium-context.ts` **유지·강화**  
- **제거:** `personality`, `summary`, `compactText` 를 fact에 **넣지 않음**  
- **추가:** 월령 한 줄 환경 요약 (규칙 또는 앵커 lookup)

### 3.4 `/api/saju` 응답 스키마 변경 (제안)

| 필드 | v3 |
|------|-----|
| `personality` | **삭제** 또는 `patternScenes: { relation, work, money, choice, emotion }` |
| `summary` | **삭제** → `environmentLine` + `responseLine` + `oneLiner` |
| `sipsinDesc` | **삭제** — UI는 사전 lookup |
| `ohaengDesc` | **접이 전용** 짧은 팩트만 (강/약 문구 제거) |

---

## 4. C층 — 제품별 어댑터

### 4.1 오늘의 운세

| 구분 | 현재 | v3 제안 |
|------|------|---------|
| 무료 4단 | `landing-insight-copy` TONE_EXPOSURE | **유지** — 「유리/피하세요」→「~하기 쉬운 날이에요」로 톤만 v3화 |
| AI `secretaryCopy` | `today-secretary-prompts` | + `buildUnmyeongConstitutionV3Block({ product: "today" })` |
| 파이프라인 | 4단 = 흐름·타이밍·실수·제안 | §1 **8단 중 2·4·5·6·7**에 매핑 명시 |

**출력 JSON** (유지): `coreMessage`, `flowNarrative`, `warningLine`, `strategy` — 필드 설명만 v3 블록으로 통일.

### 4.2 사주 무료 (`/saju` UI)

| 구분 | v3 제안 |
|------|---------|
| 「성격 분석」 섹션 | → **「오늘의 나의 패턴」** 또는 5축 카드 |
| 본문 | `personalityMap` 대신 **API가 반환한 5축 장면** 또는 규칙 엔진이 일간+월령+주 십성으로 사전 lookup |
| 십성/오행 설명 | 본문 **접이** 「왜 이렇게 읽었는지」 |

**무료 사주용 프롬프트 (신규, 선택):**  
짧은 리포트만 필요 시 `buildSajuFreePrompt()` — premium과 동일 헌법, 섹션 3개만 (환경+반응 / 5축 / 비서 1개).

### 4.3 사주 프리미엄

| 구분 | v3 제안 |
|------|---------|
| `SAJU_PREMIUM_PROMPT_VERSION` | `v4.0` (헌법 v3 정렬) |
| `buildSajuPremiumSystemPrompt` | 상단에 `buildUnmyeongConstitutionV3Block({ product: "premium", includeMonthLord: true })` |
| 해석 순서 | **[월령→일간→십성]** 명시 + 섹션 instruction에 5축·장면 반복 |
| `SAJU_PREMIUM_SECTIONS` | 유지 — 이미 장면·근거 구조와 정합 |
| userPrompt | facts **only** — personality 오염 제거 후 |

### 4.4 채팅

| 구분 | v3 제안 |
|------|---------|
| `chat-generation-prompts` | v3 블록으로 교체 |
| **`api/chat/route.ts` fallback** | **폐기 또는 비활성** — LLM 실패 시 「생년월일 입력 후 다시」만 |
| 구조 | 유지: 근거 → 흐름 → 제안 (3단) = v3 8단의 축약 |

### 4.5 타로 · 꿈 · 궁합 · 토정

| 제품 | v3 제안 |
|------|---------|
| 타로 | `tarot-generation-prompts` + v3 블록 (이미 유사) |
| 꿈 | `dream-generation-prompts` 동일 |
| 궁합 | **신규** `compat-generation-prompts` — 두 사람 fact + 5축 관계·일·돈, 「성격 궁합」라벨 제거 |
| 토정 | LLM 아님 — `tojeong-calculator` **문장 테이블** v3 장면형으로 교체 (예언 제거) |

### 4.6 랜딩

| 파일 | v3 제안 |
|------|---------|
| `landing-chill-hooks.ts` | 「당신은 ~」→ **장면 1줄** + 선택적 「~하는 편」 (v3 §2) |
| `landing-copy.ts` | MBTI 비교 카피 유지 가능, **「신중함 타입」** 삭제 |

### 4.7 페르소나 모듈 (선택)

`buildUnmyeongConstitutionV3Block({ includePersonaModule: "female_founder" })`

- 조사 2번: 과잉책임·증거축적·정서노동·신중확장·자율보호 **역할 장면**  
- **금지:** 여성 본질, 성격 유형  
- 사주 fact와 **교차**할 때만 append (명식 없으면 미사용)

---

## 5. D층 — 후처리 (린트)

`src/lib/unmyeong-output-lint.ts` (제안)

- 정규식/키워드: `~합니다`, `신중하세요`, `조심`, `운이 올`, `좋은 일`, `리더십`, `표현력이`, `강하`, `약하`, `MBTI`  
- 실패 시: 재생성 1회 또는 해당 문단 `[재작성 필요]` (프로덕션은 재생성 권장)  
- premium·today secretaryCopy에 **필수** 적용

---

## 6. `buildUnmyeongGenerationVoiceBlock` 마이그레이션

| 항목 | 조치 |
|------|------|
| 기존 4단 파이프라인 | v3 **8단**으로 확장 |
| `UNMYEONG_INTERPRETATION_PIPELINE` | `V3_INTERPRETATION_ORDER`에 흡수 |
| 참조 v2.1 주석 | → v3 |
| 모든 import 경로 | `buildUnmyeongConstitutionV3Block` (alias로 구버전 deprecated 1 release) |

**import 대상:**  
`saju-premium-prompts`, `today-secretary-prompts`, `chat-generation-prompts`, `tarot-generation-prompts`, `dream-generation-prompts`, (신규) `compat-generation-prompts`

---

## 7. 구현 단계 (제안 순서)

| 단계 | 작업 | 효과 |
|------|------|------|
| **1** | 헌법 v3 확정 + `unmyeong-constitution-v3.ts` | 기준 고정 |
| **2** | `/api/saju` personalityMap 제거 → 5축 장면 API | 무료 사주 철학 일치 |
| **3** | `saju/page.tsx` UI 섹션 교체 | 사용자 노출 |
| **4** | `/api/chat` fallback 제거 + v3 블록 | 채팅 일치 |
| **5** | `sipsin-scene-dictionary` + premium/userPrompt | 생성 품질 |
| **6** | `month-lord-anchors` (갑·을) | 월령 우선 |
| **7** | 토정·궁합·랜딩 chill | 잔여 제거 |
| **8** | output-lint | 회귀 방지 |

---

## 8. 프롬프트 샘플 — 프리미엄 system (요약)

```markdown
[운명비서 헌법 v3]
- 미래 맞추기·사주 설명·성격 진단 금지
- 해석 순서: 월령 환경 → 일간 반응 → 십성 장면(1~2) → 5축 → 흔들릴 때 → 비서 제안 → 한 문장 → 근거 접이
- 팩트에 없는 내용 금지

[제품: 프리미엄 사주]
섹션: (기존 SAJU_PREMIUM_SECTIONS)
말투: 해요체만
...

[장면 예시 3쌍]
(사용자 제시 책임감/신중/표현력 → 장면)

[절대 금지 목록]
...
```

user 메시지는 **현행과 동일** — `buildSajuPremiumChartFacts(chart)` only.

---

## 9. 성공 기준 (v3 전환 완료 정의)

- [ ] `/saju` 응답에 personality/summary **진단 문단 0**  
- [ ] `/chat` fallback **레거시 운세 템플릿 0**  
- [ ] 무료·유료 생성물 린트 **금지어 0** (또는 재생성 후 0)  
- [ ] 모든 LLM system에 **동일 v3 블록**  
- [ ] 월령 환경 1문장이 사주·프리미엄 fact/본문에 **존재**  
- [ ] 전문가 접이에만 십성·월령 용어  
- [ ] 여성 경영 페르소나는 **opt-in** 모듈만  

---

## 10. 문서 정리

| 문서 | 역할 |
|------|------|
| `content-constitution-3.0.md` | 헌법 확정본 (검토 후) |
| `philosophy-v3-diagnostic-report.md` | 본 진단 (스냅샷) |
| `philosophy-v3-prompt-redesign.md` | 본 제안 |
| `saju-report-direction.md` | v3 §2와 **당신은** 규칙 정렬 필요 |
| `content-constitution-2.1.md` | superseded 표기 (v3 확정 후) |

---

**요청 시 다음 단계:** P0 (`api/saju` + `saju/page`) 코드 수정안을 **별도 PR 단위**로 작성 (이번 지시는 진단·제안만).
