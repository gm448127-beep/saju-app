# 운명비서 — 브랜드 컬러 시스템

근거: [brand-color-audit.md](./brand-color-audit.md) (스크린샷 색채 심층 진단 PDF)

## 단일 소스

| 파일 | 용도 |
|------|------|
| `src/styles/brand-tokens.css` | CSS 변수 (`:root`) |
| `src/lib/brand-colors.ts` | 차트·점수·등급 등 JS |

## 서피스 · 텍스트 · 보더

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--paper` | `#F5F0E8` | 페이지 베이스 |
| `--paper-elevated` | `#FFFDFC` | 카드·입력 |
| `--paper-selected` | `#F2EBE3` | 선택 칩 배경 |
| `--ink` | `#2F282B` | 제목·다크 CTA |
| `--ink-body` | `#5A504B` | 본문 (AAA) |
| `--ink-muted` | `#726963` | 마이크로카피 (AA) |
| `--line` | `#DCCFBE` | 섹션·카드 보더 |
| `--line-interactive` | `#917D63` | 입력·포커스 보더 |

## 액션 · 데이터 (분리 필수)

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--accent` | `#7A5D35` | 골드 CTA·링크·라벨 강조 |
| `--primary-dark` | `#2F282B` | 주요 다크 버튼 |
| `--data-accent` | `#C79A5A` | 그래프·점수·등급 (CTA 아님) |

## 금지

- CTA에 `#8B6F47`, `#b5562e`, `#C79A5A` 혼용 금지 — CTA는 `--accent`만
- 차트·점수에 `--accent` 쓰지 않음 — `--data-accent` / `brandScoreColor()`
- 오행 네온색 금지 — `--ohaeng-*`만

## 사용 예

```css
.card {
  background: var(--paper-elevated);
  border: 1px solid var(--line);
  color: var(--ink-body);
}
input:focus {
  border-color: var(--line-interactive);
}
.cta-gold {
  background: var(--accent);
  color: var(--on-accent);
}
.chart-bar {
  background: var(--data-accent);
}
```

```ts
import { brandScoreColor, OHAENG_BRAND_COLORS } from "@/lib/brand-colors";
```

레거시 Tailwind `text-[#8B6F47]` 등은 `globals.css`에서 토큰으로 매핑 중 — 신규 코드는 `text-accent`, `border-line` 유틸 또는 CSS 변수 사용.
