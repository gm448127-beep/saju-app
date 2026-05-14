# ============================================================
# 버튼 색상 일괄 교체: #CCB6B0 -> #EAE5DA
# ============================================================

$targetFiles = @(
    ".\src\app\chat\page.tsx",
    ".\src\app\compatibility\page.tsx",
    ".\src\app\saju\page.tsx",
    ".\src\app\today\page.tsx",
    ".\src\app\tojeong\page.tsx",
    ".\src\app\globals.css",
    ".\src\app\page.tsx",
    ".\src\components\Header.tsx"
)

$totalReplaced = 0

foreach ($f in $targetFiles) {
    if (!(Test-Path $f)) {
        Write-Host "  SKIP (not found): $f" -ForegroundColor Gray
        continue
    }
    $content = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
    $count = ([regex]::Matches($content, "#CCB6B0", "IgnoreCase")).Count
    
    if ($count -gt 0) {
        $content = $content.Replace("#CCB6B0", "#EAE5DA")
        [System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "  OK: $f  ($count replaced)" -ForegroundColor Green
        $totalReplaced += $count
    } else {
        Write-Host "  SKIP (0 matches): $f" -ForegroundColor Gray
    }
}

Write-Host "`nTotal #CCB6B0 -> #EAE5DA: $totalReplaced replacements" -ForegroundColor Cyan

# ============================================================
# 검증
# ============================================================
Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
$allFiles = Get-ChildItem -Path ".\src" -Recurse -Include "*.tsx","*.css"
$oldRemain = 0
$newCount = 0
foreach ($f in $allFiles) {
    $c = Get-Content $f.FullName -Encoding UTF8 -Raw -ErrorAction SilentlyContinue
    $oldRemain += ([regex]::Matches($c, "#CCB6B0", "IgnoreCase")).Count
    $newCount += ([regex]::Matches($c, "#EAE5DA", "IgnoreCase")).Count
}
Write-Host "  #CCB6B0 remaining: $oldRemain" -ForegroundColor $(if ($oldRemain -eq 0) {"Green"} else {"Red"})
Write-Host "  #EAE5DA count: $newCount" -ForegroundColor Green

# ============================================================
# 빌드 & 배포
# ============================================================
Write-Host "`n=== BUILD ===" -ForegroundColor Cyan
npm run build 2>&1 | Select-Object -Last 10

Write-Host "`n=== DEPLOY ===" -ForegroundColor Yellow
git add .
git commit -m "style: button color #CCB6B0 -> #EAE5DA (warm beige)"
git push
npx vercel --prod --force --yes

Write-Host "`nDONE! https://saju-app-vert.vercel.app" -ForegroundColor Green
