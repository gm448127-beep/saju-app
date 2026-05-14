$file = ".\src\app\saju\page.tsx"
$lines = Get-Content $file -Encoding UTF8

Write-Host "=== saju/page.tsx 버튼 색상 관련 줄 ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "CCB6B0|EAE5DA|F6DFDC|C6D2C8|bg-|background|button|#[0-9A-Fa-f]{6}") {
        Write-Host "  L$($i+1): $($lines[$i].TrimStart())" -ForegroundColor Yellow
    }
}

# 모든 페이지에서 버튼 관련 색상 검색
Write-Host "`n=== 전체 프로젝트 버튼 색상 (#CCB6B0, #C6D2C8 등) ===" -ForegroundColor Cyan
$files = Get-ChildItem -Path ".\src" -Recurse -Include "*.tsx","*.css"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Encoding UTF8 -Raw -ErrorAction SilentlyContinue
    if ($content -match "#CCB6B0|#C6D2C8") {
        $shortName = $f.FullName.Replace((Get-Location).Path, ".")
        $matchCount = ([regex]::Matches($content, "#CCB6B0")).Count
        $matchCount2 = ([regex]::Matches($content, "#C6D2C8")).Count
        Write-Host "  $shortName  CCB6B0:$matchCount  C6D2C8:$matchCount2" -ForegroundColor Green
    }
}
