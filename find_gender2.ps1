# 성별 선택 버튼 (입력 폼) 찾기
$files = @(
    ".\src\app\saju\page.tsx",
    ".\src\app\today\page.tsx",
    ".\src\app\tojeong\page.tsx",
    ".\src\app\compatibility\page.tsx"
)

foreach ($f in $files) {
    if (!(Test-Path $f)) { continue }
    $lines = Get-Content $f -Encoding UTF8
    Write-Host "`n=== $f ===" -ForegroundColor Cyan
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        # 성별 관련: male, female, gender, 남성, 여성, 남, 여
        if ($line -match "male|female|gender|남성|여성|setGender") {
            Write-Host "  L$($i+1): $($line.TrimStart())" -ForegroundColor Yellow
        }
    }
}
