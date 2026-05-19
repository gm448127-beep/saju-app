# 운명비서 타로 카드 이미지 폴더

이 폴더는 타로 카드 실제 이미지 파일을 넣는 위치입니다.

## 파일 규칙

- 파일 형식: `webp`
- 권장 비율: 세로형 카드 비율 `2:3`
- 권장 크기: `800x1200` 이상
- 경로 예시: `/tarot/cards/major-00-fool.webp`

## 메이저 카드 파일명

- `major-00-fool.webp`
- `major-01-magician.webp`
- `major-02-high-priestess.webp`
- `major-03-empress.webp`
- `major-04-emperor.webp`
- `major-05-hierophant.webp`
- `major-06-lovers.webp`
- `major-07-chariot.webp`
- `major-08-strength.webp`
- `major-09-hermit.webp`
- `major-10-wheel-of-fortune.webp`
- `major-11-justice.webp`
- `major-12-hanged-man.webp`
- `major-13-death.webp`
- `major-14-temperance.webp`
- `major-15-devil.webp`
- `major-16-tower.webp`
- `major-17-star.webp`
- `major-18-moon.webp`
- `major-19-sun.webp`
- `major-20-judgement.webp`
- `major-21-world.webp`

## 마이너 카드 파일명

슈트별 접두사는 `wands`, `cups`, `swords`, `pentacles`입니다.

각 슈트 아래 파일명은 다음 규칙을 사용합니다.

- `{suit}-ace.webp`
- `{suit}-02.webp`
- `{suit}-03.webp`
- `{suit}-04.webp`
- `{suit}-05.webp`
- `{suit}-06.webp`
- `{suit}-07.webp`
- `{suit}-08.webp`
- `{suit}-09.webp`
- `{suit}-10.webp`
- `{suit}-page.webp`
- `{suit}-knight.webp`
- `{suit}-queen.webp`
- `{suit}-king.webp`

예:

- `wands-ace.webp`
- `cups-queen.webp`
- `swords-10.webp`
- `pentacles-king.webp`

## 동작 방식

이미지 파일이 있으면 실제 카드 이미지가 표시됩니다.
이미지 파일이 없으면 앱에서 자체 제작한 운명비서 스타일 카드가 자동으로 표시됩니다.
