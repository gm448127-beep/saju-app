# 운명비서 — AI 생성 문체

헌법 v2.1 · `docs/saju-report-direction.md` 와 동일 철학을 **모든 LLM 생성 경로**에 적용한다.

## 단일 소스

| 모듈 | 역할 |
|------|------|
| `src/lib/unmyeong-generation-voice.ts` | 목표·파이프라인·금지·좋은/나쁜 예 · `buildUnmyeongGenerationVoiceBlock()` |
| `src/lib/today-secretary-voice.ts` | 생성 후 보고서체 완화 · `applySecretaryVoice` |

## 경로별 프롬프트

| 기능 | 프롬프트 모듈 | API / 엔진 |
|------|----------------|------------|
| 채팅 | `chat-generation-prompts.ts` | `src/app/api/chat/route.ts` |
| 타로 | `tarot-generation-prompts.ts` | `src/app/api/tarot/route.ts` |
| 꿈해몽 | `dream-generation-prompts.ts` | `src/app/api/dream/route.ts` |
| 오늘 운세 (유료 AI) | `today-secretary-prompts.ts` | `today-secretary-copy-engine.ts` |
| 프리미엄 사주 | `saju-premium-prompts.ts` | `src/app/api/saju/premium/route.ts` |

## 무료 UI (규칙 엔진)

랜딩·`/today` 무료 4단 카드는 LLM이 아니라 `landing-insight-copy.ts` + `UnmyeongFourCardInsights` 이다.

## 새 생성 경로 추가 시

1. 인라인 system prompt 작성 금지
2. `buildUnmyeongGenerationVoiceBlock()` 을 system prompt 상단 또는 직후에 포함
3. 제품별 섹션만 별도 파일에 정의
4. 필요 시 `applySecretaryVoice` 로 후처리

## 검수 체크

- [ ] 해요체, 보고서체 없음
- [ ] 「당신은 ~한 사람」·사건 예언·교훈 없음
- [ ] 명리 용어는 근거 괄호 또는 전문가 섹션
- [ ] 사용자가 「내 얘기」·「그래서 뭐 하지」를 느낄 수 있는지
