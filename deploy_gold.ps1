# 커밋 & Vercel 배포
git add .
git status --short

git commit -m "feat: 금(金) 오행 상세 해석 강화 - 유무/다과별 일간 맞춤 분석, 개운법, 경금/신금 특성 추가"
git push

Write-Host "`n=== Vercel 배포 ===" -ForegroundColor Yellow
npx vercel --prod --force --yes

Write-Host "`nDONE! https://saju-app-vert.vercel.app" -ForegroundColor Green
