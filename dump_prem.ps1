$premFile = ".\src\app\api\saju\premium\route.ts"
$premLines = Get-Content $premFile -Encoding UTF8

Write-Host "=== premium API 전체 ($($premLines.Count) lines) ===" -ForegroundColor Cyan

for ($i = 0; $i -lt $premLines.Count; $i++) {
    Write-Host "L$($i+1): $($premLines[$i])"
}
