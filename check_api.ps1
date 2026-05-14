$premFile = ".\src\app\api\saju\premium\route.ts"
$premLines = Get-Content $premFile -Encoding UTF8

Write-Host "=== premium API: prompt 관련 줄 ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $premLines.Count; $i++) {
    $line = $premLines[$i]
    if ($line -match "prompt|system|user|content|messages|openai|gpt|claude|model") {
        $display = $line.TrimStart()
        if ($display.Length -gt 120) { $display = $display.Substring(0,120) + "..." }
        Write-Host "  L$($i+1): $display" -ForegroundColor Yellow
    }
}

Write-Host "`n=== premium API: L1~30 ===" -ForegroundColor Cyan
for ($i = 0; $i -lt 30 -and $i -lt $premLines.Count; $i++) {
    Write-Host "  L$($i+1): $($premLines[$i])"
}

Write-Host "`n=== premium API: L60~90 ===" -ForegroundColor Cyan
for ($i = 59; $i -lt 90 -and $i -lt $premLines.Count; $i++) {
    Write-Host "  L$($i+1): $($premLines[$i])"
}

Write-Host "`n=== premium API: L120~184 ===" -ForegroundColor Cyan
for ($i = 119; $i -lt 184 -and $i -lt $premLines.Count; $i++) {
    Write-Host "  L$($i+1): $($premLines[$i])"
}

# saju API summary 부분
$sajuFile = ".\src\app\api\saju\route.ts"
$sajuLines = Get-Content $sajuFile -Encoding UTF8

Write-Host "`n=== saju API L280~300 ===" -ForegroundColor Cyan
for ($i = 279; $i -lt 300 -and $i -lt $sajuLines.Count; $i++) {
    Write-Host "  L$($i+1): $($sajuLines[$i])"
}
