<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:brand-colors -->
# 브랜드 컬러

`src/styles/brand-tokens.css` · `src/lib/brand-colors.ts` · `docs/brand-color-system.md`

- **paper / ink / accent** — CTA `--accent` (#7A5D35), 차트·점수 `--data-accent` (#C79A5A), `docs/brand-color-audit.md` 참고
- 오행·등급은 `brand-colors.ts` 스케일 사용 (네온·무지개 금지)
<!-- END:brand-colors -->

<!-- BEGIN:content-constitution -->
# 운명비서 콘텐츠 (헌법 v2.1)

카피·해석 작성 시 **`docs/content-constitution-2.1.md`** 를 따른다. 구현: `src/lib/landing-insight-copy.ts`, `src/components/UnmyeongFourCardInsights.tsx`

- **정체성**: 미래 맞추기 ❌ · 오늘 이해·선택 ⭕ · 「나 얘기 같은데?」 목표
- **4단 고정**: 오늘의 흐름 · 행동하기 좋은 타이밍(무엇을 할 시간) · 실수 장면(따옴표) · 비서 제안(행동 1개)
- **절대 금지**: `당신은 ~한 사람입니다` · 교훈(신중하세요 등) · 사건 예언 · 의미 없는 행운 나열
- **5축**: 관계 · 일 · 돈 · 선택 · 감정
- **행운**: 유지, 값+오늘 의미 한 줄
- **재작성 대상**: 오늘의 운세 · 사주 · 궁합 · 타로 · 토정비결 (동일 철학)
- **사주 리포트**: `docs/saju-report-direction.md` — 원국 근거 필수, 본문은 인간 언어·전문가는 근거 납득·사용자는 공감 (둘 다)
- **프리미엄 사주 AI**: `docs/saju-premium-prompt-draft.md` · `src/lib/saju-premium-prompts.ts` — 레거시 사주멘토 프롬프트 사용 금지
- **생성 문체 (LLM 공통)**: `src/lib/unmyeong-generation-voice.ts` — 모든 AI 생성 프롬프트에 `buildUnmyeongGenerationVoiceBlock()` 포함. 경로별: `chat-generation-prompts.ts`, `tarot-generation-prompts.ts`, `dream-generation-prompts.ts`, `today-secretary-prompts.ts`, `saju-premium-prompts.ts`. 후처리: `today-secretary-voice.ts` 의 `applySecretaryVoice`
<!-- END:content-constitution -->
