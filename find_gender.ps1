# ============================================================
# 성별 버튼 색상 변경 + 남자 버튼 색상 추가
# ============================================================

# 성별 버튼이 있는 파일들 검색
$files = @(
    ".\src\app\saju\page.tsx",
    ".\src\app\today\page.tsx",
    ".\src\app\tojeong\page.tsx",
    ".\src\app\compatibility\page.tsx"
)

foreach ($f in $files) {
    if (!(Test-Path $f)) { continue }
    $lines = Get-Content $f -Encoding UTF8
    Write-Host "=== $f ===" -ForegroundColor Cyan
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "male|female|gender|[^\w]?[eE]?[yY]?[\s]|[nN]am|[yY]eo") {
            if ($lines[$i] -match "color|bg|background|#[0-9A-Fa-f]") {
                Write-Host "  L$($i+1): $($lines[$i].TrimStart())" -ForegroundColor Yellow
            }
        }
        # 남/여/성별 한글 검색
        if ($lines[$i] -match "남|여|성별") {
            if ($lines[$i] -match "color|bg|background|#[0-9A-Fa-f]|EAE5DA") {
                Write-Host "  L$($i+1): $($lines[$i].TrimStart())" -ForegroundColor Green
            }
        }
    }
}
