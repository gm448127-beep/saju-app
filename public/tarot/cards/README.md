# 운명비서 타로 카드 이미지 폴더

이 폴더에 **메이저 아르카나 22장** 이미지를 넣으면 타로 리딩 화면에 자동 표시됩니다.

## 파일 규칙

- 파일 형식: `webp` 권장 ( `png` 도 지원 )
- 권장 비율: 세로형 카드 비율 `2:3`
- 권장 크기: `800x1200` 이상
- 경로: `public/tarot/cards/` → URL `/tarot/cards/…`

## 메이저 22장 — 카드명 ↔ 파일명

| 번호 | 카드명 | 파일명 |
|------|--------|--------|
| 0 | 바보 | `major-00-fool` |
| 1 | 마법사 | `major-01-magician` |
| 2 | 여사제 | `major-02-high-priestess` |
| 3 | 여황제 | `major-03-empress` |
| 4 | 황제 | `major-04-emperor` |
| 5 | 교황 | `major-05-hierophant` |
| 6 | 연인 | `major-06-lovers` |
| 7 | 전차 | `major-07-chariot` |
| 8 | 힘 | `major-08-strength` |
| 9 | 은둔자 | `major-09-hermit` |
| 10 | 운명의 수레바퀴 | `major-10-wheel-of-fortune` |
| 11 | 정의 | `major-11-justice` |
| 12 | 매달린 사람 | `major-12-hanged-man` |
| 13 | 죽음 | `major-13-death` |
| 14 | 절제 | `major-14-temperance` |
| 15 | 악마 | `major-15-devil` |
| 16 | 탑 | `major-16-tower` |
| 17 | 별 | `major-17-star` |
| 18 | 달 | `major-18-moon` |
| 19 | 태양 | `major-19-sun` |
| 20 | 심판 | `major-20-judgement` |
| 21 | 세계 | `major-21-world` |

예: `major-00-fool.webp` 또는 `major-00-fool.png`

## 검사 명령

```bash
node scripts/verify-tarot-cards.mjs
```

## 동작

- 메이저 카드: 위 파일이 있으면 **실제 일러스트** 표시
- 마이너(완드·컵·소드·펜타클 56장): 이미지 없으면 앱 **자체 카드 UI** 표시
