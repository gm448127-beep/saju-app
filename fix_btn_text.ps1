# ============================================================
# 활성 버튼 텍스트: text-white -> text-[#5A4E48] (고동색)
# 모든 페이지의 선택된 버튼 글씨색 변경
# ============================================================

$files = @(
    ".\src\app\saju\page.tsx",
    ".\src\app\today\page.tsx",
    ".\src\app\tojeong\page.tsx",
    ".\src\app\compatibility\page.tsx",
    ".\src\app\chat\page.tsx"
)

$totalCount = 0

foreach ($f in $files) {
    if (!(Test-Path $f)) { continue }
    $c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
    
    # 패턴: 활성 버튼에서 text-white shadow-md
    $count = ([regex]::Matches($c, "text-white shadow-md")).Count
    $c = $c.Replace("text-white shadow-md", "text-[#5A4E48] shadow-md")
    
    # 토정비결 특수 패턴: text-white shadow-md 외에 text-white만 있는 경우
    # bg-[#DCEAF6] text-white, bg-[#F6DFDC] text-white 등
    $count2 = ([regex]::Matches($c, "bg-\[#(DCEAF6|F6DFDC|EAE5DA)\] text-white")).Count
    $c = [regex]::Replace($c, "bg-\[#(DCEAF6|F6DFDC|EAE5DA)\] text-white", 'bg-[#$1] text-[#5A4E48]')
    
    [System.IO.File]::WriteAllText($f, $c, (New-Object System.Text.UTF8Encoding $false))
    $replaced = $count + $count2
    $totalCount += $replaced
    Write-Host "  $f : $replaced replaced" -ForegroundColor Green
}

Write-Host "`nTotal: $totalCount replacements" -ForegroundColor Cyan

# ============================================================
# 검증
# ============================================================
Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
$remain = 0
foreach ($f in $files) {
    if (!(Test-Path $f)) { continue }
    $c = Get-Content $f -Encoding UTF8 -Raw
    $m = ([regex]::Matches($c, "text-white shadow-md")).Count
    $m2 = ([regex]::Matches($c, "bg-\[#(DCEAF6|F6DFDC|EAE5DA)\] text-white")).Count
    $remain += $m + $m2
}
Write-Host "  text-white (active buttons) remaining: $remain" -ForegroundColor $(if($remain -eq 0){"Green"}else{"Red"})

$newCount = 0
foreach ($f in $files) {
    if (!(Test-Path $f)) { continue }
    $c = Get-Content $f -Encoding UTF8 -Raw
    $newCount += ([regex]::Matches($c, "text-\[#5A4E48\]")).Count
}
Write-Host "  text-[#5A4E48] count: $newCount" -ForegroundColor Green

# ============================================================
# 빌드 & 배포
# ============================================================
Write-Host "`n=== BUILD ===" -ForegroundColor Cyan
npm run build 2>&1 | Select-Object -Last 10

Write-Host "`n=== DEPLOY ===" -ForegroundColor Yellow
git add .
git commit -m "style: active button text color white -> #5A4E48 (dark brown)"
git push
npx vercel --prod --force --yes

Write-Host "`nDONE! https://saju-app-vert.vercel.app" -ForegroundColor Green
