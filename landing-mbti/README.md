# landing-mbti — 자기이해 타겟 랜딩

MBTI 관심 30대 여성용 출시 알림 단일 페이지.

## 로컬 실행

```bash
cd landing-mbti
npm install
npm run dev
```

http://localhost:3002

## Google Form 연결

`.env.local` 생성:

```
NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL=https://docs.google.com/forms/d/e/여기ID/viewform?embedded=true
```

## Vercel 배포

Vercel에서 **Root Directory**를 `landing-mbti`로 지정 후 배포.
