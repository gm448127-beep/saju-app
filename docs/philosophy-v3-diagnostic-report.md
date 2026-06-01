# 운명비서 v3 전환 — 진단 보고서

> **작업 범위:** 코드·프롬프트·규칙 카피 전수 스캔 (수정 없음)  
> **기준:** 사용자 제시 v3 철학 + 조사 자료 3종 + [`content-constitution-3.0.md`](./content-constitution-3.0.md) 초안  
> **일자:** 2026.05

---

## 0. 요약 (한 페이지)

| 구분 | 판정 |
|------|------|
| **이미 v3에 가까운 축** | 오늘 4단 규칙 엔진(`landing-insight-copy`), 프리미엄·오늘 **생성 프롬프트**(`unmyeong-generation-voice`, `saju-premium-prompts`, `today-secretary-prompts`) |
| **가장 큰 충돌원** | `/api/saju` **personalityMap·summary**, `/api/chat` **레거시 템플릿 전체**, 무료 **사주 UI**가 API 성격 문구 그대로 노출 |
| **문체 잔재** | 초기 **명리 설명체**(`interpretations.ts`, `triggerDict`, 사주 페이지 「기운」), **운세 예언체**(토정·채팅), **랜딩 chill hooks** 「당신은 ~」 |
| **월령 우선** | 프롬프트·코드 **어디에도 파이프라인 미구현** (문서만 존재) |
| **십성 장면 사전** | 프리미엄 프롬프트에 **금지·예시만** 있고 TS 사전 **없음** |

**결론:** 문장 몇 개 고치기가 아니라, **API 응답 레이어(`/api/saju`, `/api/chat`)와 무료 사주 노출**을 v3 데이터·프롬프트로 **교체**해야 철학이 일치한다.

---

## 1. 철학 충돌 — 영역별

### 1.1 「사주를 설명하는 서비스」 vs 「패턴 번역」

| 위치 | 충돌 문장/구조 | 유형 |
|------|----------------|------|
| `src/app/api/saju/route.ts` `personalityMap` | 「큰 나무처럼 곧고… **리더십이 강합니다**」「**표현력이 뛰어납니다**」 | 성격 진단 + 비유 |
| 동일 `sipsinDesc` | 「**자기주장이 강하고** 독립적입니다」 | 십성 라벨 |
| 동일 `ohaengDesc` | 「목이 **강하면** 리더십… **부족하면** 결단력이 약할」 | 강/약 |
| `src/app/saju/page.tsx` | 섹션 「🧠 **성격 분석**」+ `result.personality` 출력 | UI가 레거시 API 노출 |
| `src/data/interpretations.ts` | 「식신의 해: **타고난 재능과 표현력**…」 | 명리 설명·운세 혼합 |
| `src/data/triggerDict.ts` | 「사주 원국… **신호**」「귀인·협력의 **에너지**」 | 명리 설명 중심 |

### 1.2 「미래 예언」 vs 「지금 패턴」

| 위치 | 예시 | 유형 |
|------|------|------|
| `src/app/api/chat/route.ts` (다수) | 「**여름에 재물운이 가장 좋아요**」「**겨울에 운명적인 만남**」「**좋은 만남이 있을 가능성**」 | 사건·시기 예언 |
| 동일 | 「**재물운이 상승**」「**예상치 못한 곳에서 이익**」 | 운세 예언 |
| `src/lib/tojeong-calculator.ts` | 「**대길한 해**입니다. 모든 일이 잘 풀립니다」 | 사건 예언 |
| 동일 | 「**재물이 들어오는 운**입니다」 | 사건 예언 |
| `src/components/TodayOverviewSection.tsx` | 「**{label}운이 가장 살아납니다**」 | 운세 화법 |
| `src/app/api/saju/route.ts` 신살 UI 카피 | 「가까이하면 **운이 잘 풀려요**」 | 예언 |

### 1.3 교훈형 vs 장면형

| 위치 | 예시 | 유형 |
|------|------|------|
| `landing-insight-copy.ts` (다수 톤) | 「…하는 편이 **유리합니다**」「…**피하는 편이 좋습니다**」 | 교훈 (v2.1도 경계) |
| `src/app/api/chat/route.ts` | 「**충동 소비를 조심**하고」「**질투와 집착은 관계를 망칠**」「**건강관리에 신경**」 | 교훈 |
| `tojeong-calculator.ts` | 「**지출을 줄이고 절약**하세요」「**신중한 판단이 필요**」 | 교훈 |
| `compatibility/route.ts` | 「**갈등이 생기면 성격 문제로 단정하지 말고**…」 | 교훈 (일부는 v3 제안에 가깝으나 훈계 톤) |

### 1.4 성격 진단·라벨 vs 장면

| 위치 | 예시 | 유형 |
|------|------|------|
| `personalityMap` 전체 (10일간) | 「**완벽주의적**」「**우유부단**」「**낙천적**」 | 진단 |
| `landing-copy.ts` | 「당신은 **신중함을 중시**합니다」 | 라벨 |
| `landing-chill-hooks.ts` (22종) | 「당신은 **게으른 것이 아닙니다**」등 | 「당신은」 패턴 (장면 없이 단정) |
| `compatibility/route.ts` | 「**성격 궁합**」라벨, traits 「**책임감이 강해**」 | 진단 |
| `chat/route.ts` | 「**사교적인 성격**」「**쿨하면서도 속은 따뜻**」 | MBTI식 |

### 1.5 v3와 **정합**인 부분 (유지·확장)

| 위치 | 내용 |
|------|------|
| `unmyeong-generation-voice.ts` | 파이프라인 4단, 5축, 금지 목록, 좋은/나은 예 (식상→장면) |
| `saju-premium-prompts.ts` | fact only, 장면+근거, 해요체, 금지 목록 |
| `today-secretary-prompts.ts` | 4단 필드 매핑, voice block |
| `landing-insight-copy.ts` | 4단 라벨, 「이 정도는 말해도 되지」 장면, 비서 제안 |
| `tarot-generation-prompts.ts` | voice block, 사건 단정 금지 |
| `chat-generation-prompts.ts` | **system** 프롬프트만 — 3단 구조 (근거·흐름·제안) |

---

## 2. 문체 잔재 — 5계층

```
[5] 사용자 노출 UI     ← saju/page, compatibility, today 일부
[4] API 응답/템플릿   ← /api/saju, /api/chat, /api/compatibility, tojeong
[3] 규칙 카피/데이터   ← interpretations, triggerDict, landing-copy
[2] 생성 프롬프트       ← premium/today/chat/tarot (대체로 v3)
[1] 헌법 문서           ← v2.1 운영 + v3 초안 (불일치 §2)
```

| 잔재 유형 | 대표 파일 | v3와의 거리 |
|-----------|-----------|-------------|
| **초기 명리 설명** | `interpretations.ts`, `triggerDict`, 사주 페이지 오행/십성 설명 | 멀음 |
| **사주 설명·성격** | `api/saju/route.ts` | 정면 충돌 |
| **운세·MBTI 상담** | `api/chat/route.ts` 전체 fallback | 정면 충돌 |
| **인간 번역 (부분)** | premium/today 프롬프트 | 가까움 |
| **v2.1 헌법** | `content-constitution-2.1.md` §2 vs `saju-report-direction` 예시 | 문서 불일치 |

---

## 3. 카테고리별 목록 (대표 예시)

### 3.1 기존 철학과 충돌하는 문장

| # | 파일 | 문장(요약) | 충돌 항목 |
|---|------|------------|-----------|
| C1 | `api/saju/route.ts` | 일간 갑 = 「큰 나무처럼… 리더십이 강합니다」 | 사주 설명·낙인·비유 |
| C2 | `api/saju/route.ts` | summary에 personality 문단 **직결** | 성격 진단 노출 |
| C3 | `api/chat/route.ts` | 「불꽃처럼 화끈한 재물운! **기회가 올 때 확 잡는 타입**」 | 운세·타입 |
| C4 | `api/chat/route.ts` | 「**여름에** 재물운이 가장 강합니다」 | 시기 예언 |
| C5 | `saju/page.tsx` | 「🧠 성격 분석」+ personality 본문 | UI 철학 |
| C6 | `content-constitution-2.1.md` §2 | 「당신은 ~한 사람」**금지** | vs 조사1 「운명비서식 한 문장」 |
| C7 | `saju-report-direction.md` | 「당신은 생각만 할 때보다… **사람입니다**」 | vs v2.1 §2 (문서 간) |
| C8 | 사용자 v3 지시 | **월령→일간→십성** | 코드·프롬프트 **미반영** |

### 3.2 예언성 문장 (추가 샘플)

- `chat/route.ts`: 「올해는 **변화와 성장의 기운**」「**수확의 시기**」「**중요한 아이디어가 떠오를**」
- `tojeong-calculator.ts`: category 「**재물이 들어오는 운**」
- `TodayOverviewSection`: 「**운이 흐러지지 않습니다**」
- `interpretations.ts`: 「**안정적인 수입을 만들 수 있는 해**」 (미래 단정)

### 3.3 교훈형 문장 (추가 샘플)

- `landing-insight-copy` ORGANIZE: 「큰 결정은 정리한 뒤에 하는 편이 **유리합니다**」
- `chat/route.ts`: 「**우유부단함을 조심**하세요」「**번아웃을 조심**」
- `saju/page.tsx`: 「해당 시간·인연은 **신중하게**」

### 3.4 성격 진단형 문장 (추가 샘플)

- `personalityMap` 을: 「**예술적 감각**이 풍부」
- `sipsinDesc` 정관: 「**책임감이 강하고 도덕적**」
- `ohaengDesc` 금: 「**완벽주의적**」
- `compatibility`: 「성격 궁합」섹션 제목

### 3.5 장면으로 변환 가능한 문장 (진단 → 번역 후보)

| 원문 (레거시) | v3 장면 방향 (조사 3번 십성표 참고) |
|---------------|-------------------------------------|
| 「표현력이 뛰어납니다」 (식신) | 「말보다 밥·루틴으로 마음을 보이고, 일도 **오늘 계속 굴러가게** 만드는 손으로 풀어요」 |
| 「리더십이 강합니다」 (갑목) | 「자료가 덜 모여도 **판부터 깔기** 쉬운 편이에요. 지시가 길어지면 속도가 떨어져요」 |
| 「책임감이 강하고 도덕적」 (정관) | 「관계에서 **『우린 뭐로 정리하면 돼?』**를 먼저 묻는 편이에요」 |
| 「완벽주의적」 (금/신) | 「작은 모순이 보이면 **바로 받아치거나** 절차부터 맞추려 해요」 |
| landing-chill 「당신은 먼저 연락하지 않습니다」 | 「답장을 미루다가, 밤에 **왜 내가 먼저 안 했지** 반복하는 순간」 |

→ 변환은 **프롬프트가 아니라 `personalityMap` 제거 + `sipsin-scene-dictionary.ts` 교체**가 맞음.

---

## 4. 파일·모듈 우선순위 (수정 대기열)

| 우선순위 | 대상 | 이유 |
|----------|------|------|
| **P0** | `api/saju/route.ts` (`personalityMap`, `sipsinDesc`, `ohaengDesc`, `summary` 조립) | 무료 사주·프리미엄 fact 입력의 **오염원** |
| **P0** | `app/saju/page.tsx` (성격 분석 섹션, summary, 「기운」 카피) | 사용자 직접 노출 |
| **P0** | `api/chat/route.ts` (fallback 템플릿 ~200줄) | system 프롬프트와 **이중 체계** |
| **P1** | `data/interpretations.ts`, `tojeong-calculator.ts` | 토정·연간 해석 예언체 |
| **P1** | `api/compatibility/route.ts` | 성격 궁합·traits |
| **P1** | `landing-chill-hooks.ts`, `landing-copy.ts` | 랜딩 「당신은」·신중 라벨 |
| **P2** | `TodayOverviewSection`, `triggerDict` | 오늘 UI 잔여 운세 화법 |
| **P2** | `landing-insight-copy.ts` | 「유리/피하세요」 완화 |
| **P3** | 헌법 v3 확정 + `unmyeong-generation-voice` 파이프라인 8단·월령 순서 | 문서·프롬프트 단일화 |

---

## 5. 여성 사업가 원칙 — 현재 상태

| 요구 | 현재 |
|------|------|
| 성격 데이터 ❌ / **역할** 데이터 ⭕ | **미구현**. `persona-female-founder` 없음 |
| 대표·경영자·전문직·돌봄 제공자 패턴 | 조사 2번은 문서에만 (`content-constitution-3.0.md` §9) |
| 본질주의 금지 | `chat` 「사교적인 성격」, `compatibility` traits 등 **위반 잔재** |

---

## 6. 프롬프트 vs 실제 출력 괴리

| 경로 | 프롬프트 | 실제 사용자가 보는 것 |
|------|----------|------------------------|
| 프리미엄 사주 | v3.1 `saju-premium-prompts` | (AI 생성) 대체로 v3 — **단, fact에 personality 오염** |
| 오늘 AI 카피 | `today-secretary-prompts` + voice | secretaryCopy — 상대적으로 양호 |
| 오늘 무료 4단 | `landing-insight-copy` | 규칙 엔진 — **양호** |
| 채팅 | `chat-generation-prompts` | **fallback이 먼저** 타는 경로 많음 → 레거시 |
| 무료 사주 | (생성 프롬프트 없음) | **personalityMap** 100% |

---

## 7. 진단 결론

1. **프롬프트만 고쳐서는 부족** — `/api/saju`·`/api/chat` **응답 데이터**가 v3 이전 철학의 본체다.  
2. **v3 파이프라인 8단·월령 우선**은 문서·프리미엄 일부에만 있고, **공통 모듈·사전 데이터가 없다**.  
3. **충돌의 80%**는 성격 진단·운세 예언·교훈 3종이 **API/데이터 레이어**에 집중된다.  
4. **landing-insight-copy·premium prompts**는 v3 전환의 **씨앗** — 여기서 패턴을 표준화해 API로 내려야 한다.

**다음 문서:** [`philosophy-v3-prompt-redesign.md`](./philosophy-v3-prompt-redesign.md)
