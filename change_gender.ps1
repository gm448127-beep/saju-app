# ============================================================
# 성별 버튼 색상 통일: 남 #DCEAF6, 여 #F6DFDC
# ============================================================

# === 1. saju/page.tsx ===
$f = ".\src\app\saju\page.tsx"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# 남자: #EAE5DA -> #DCEAF6 (성별 버튼만, 다른 EAE5DA는 유지해야 하므로 문맥으로 교체)
# L183: gender === "남" ? "bg-[#EAE5DA] text-white shadow-md"
$c = $c.Replace('gender === "남" ? "bg-[#EAE5DA] text-white shadow-md" : "bg-white border-2 border-[#D9C8C0] text-[#8A7E78]"', 'gender === "남" ? "bg-[#DCEAF6] text-[#3D3338] shadow-md" : "bg-white border-2 border-[#D9C8C0] text-[#8A7E78]"')

# 여자: #C4A8D8 -> #F6DFDC
# L184: gender === "여" ? "bg-[#C4A8D8] text-white shadow-md"
$c = $c.Replace('gender === "여" ? "bg-[#C4A8D8] text-white shadow-md" : "bg-white border-2 border-[#D9C8C0] text-[#8A7E78]"', 'gender === "여" ? "bg-[#F6DFDC] text-[#3D3338] shadow-md" : "bg-white border-2 border-[#D9C8C0] text-[#8A7E78]"')

[System.IO.File]::WriteAllText($f, $c, (New-Object System.Text.UTF8Encoding $false))
Write-Host "saju/page.tsx DONE" -ForegroundColor Green


# === 2. today/page.tsx ===
$f = ".\src\app\today\page.tsx"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# 남자: bg-[#EDE4DC] text-[#7EB3C8] border-[#7EB3C8] -> bg-[#DCEAF6] text-[#3D3338] border-[#DCEAF6]
$c = $c.Replace('"bg-[#EDE4DC] text-[#7EB3C8] border-[#7EB3C8]"', '"bg-[#DCEAF6] text-[#3D3338] border-[#DCEAF6]"')

# 여자: bg-[#F2E8DC] text-[#C8A0D0] border-[#C8A0D0] -> bg-[#F6DFDC] text-[#3D3338] border-[#F6DFDC]
$c = $c.Replace('"bg-[#F2E8DC] text-[#C8A0D0] border-[#C8A0D0]"', '"bg-[#F6DFDC] text-[#3D3338] border-[#F6DFDC]"')

[System.IO.File]::WriteAllText($f, $c, (New-Object System.Text.UTF8Encoding $false))
Write-Host "today/page.tsx DONE" -ForegroundColor Green


# === 3. tojeong/page.tsx ===
$f = ".\src\app\tojeong\page.tsx"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# 남자: #5B8AF0 -> #DCEAF6
$c = $c.Replace("#5B8AF0", "#DCEAF6")

# 여자: #F06292 -> #F6DFDC
$c = $c.Replace("#F06292", "#F6DFDC")

[System.IO.File]::WriteAllText($f, $c, (New-Object System.Text.UTF8Encoding $false))
Write-Host "tojeong/page.tsx DONE" -ForegroundColor Green


# === 4. compatibility/page.tsx ===
$f = ".\src\app\compatibility\page.tsx"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# 성별 버튼 색상 찾기 & 교체
$lines = $c -split "`n"
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "gender.*male|gender.*female|setGender|남.*bg-|여.*bg-") {
        Write-Host "  compatibility L$($i+1): $($lines[$i].TrimStart().Substring(0, [Math]::Min(100, $lines[$i].TrimStart().Length)))" -ForegroundColor Yellow
    }
}

# 일반적인 남여 색상 패턴 교체 (궁합은 person.gender 기반)
# text-white shadow-md 패턴의 남녀 버튼이 있으면 교체
if ($c -match '#C4A8D8') { $c = $c.Replace("#C4A8D8", "#F6DFDC"); Write-Host "  compatibility: #C4A8D8 -> #F6DFDC" -ForegroundColor Green }
if ($c -match '#5B8AF0') { $c = $c.Replace("#5B8AF0", "#DCEAF6"); Write-Host "  compatibility: #5B8AF0 -> #DCEAF6" -ForegroundColor Green }

[System.IO.File]::WriteAllText($f, $c, (New-Object System.Text.UTF8Encoding $false))
Write-Host "compatibility/page.tsx DONE" -ForegroundColor Green


# ============================================================
# 검증
# ============================================================
Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
$allFiles = Get-ChildItem -Path ".\src" -Recurse -Include "*.tsx"
$old1 = 0; $old2 = 0; $old3 = 0; $new1 = 0; $new2 = 0
foreach ($af in $allFiles) {
    $ac = Get-Content $af.FullName -Encoding UTF8 -Raw -ErrorAction SilentlyContinue
    $old1 += ([regex]::Matches($ac, "#C4A8D8")).Count
    $old2 += ([regex]::Matches($ac, "#5B8AF0")).Count
    $old3 += ([regex]::Matches($ac, "#F06292")).Count
    $new1 += ([regex]::Matches($ac, "#DCEAF6")).Count
    $new2 += ([regex]::Matches($ac, "#F6DFDC")).Count
}
Write-Host "  #C4A8D8 (old female): $old1" -ForegroundColor $(if($old1 -eq 0){"Green"}else{"Red"})
Write-Host "  #5B8AF0 (old male): $old2" -ForegroundColor $(if($old2 -eq 0){"Green"}else{"Red"})
Write-Host "  #F06292 (old female2): $old3" -ForegroundColor $(if($old3 -eq 0){"Green"}else{"Red"})
Write-Host "  #DCEAF6 (new male): $new1" -ForegroundColor Green
Write-Host "  #F6DFDC (new female): $new2" -ForegroundColor Green

# ============================================================
# 빌드 & 배포
# ============================================================
Write-Host "`n=== BUILD ===" -ForegroundColor Cyan
npm run build 2>&1 | Select-Object -Last 10

Write-Host "`n=== DEPLOY ===" -ForegroundColor Yellow
git add .
git commit -m "style: gender buttons - male #DCEAF6 (soft blue), female #F6DFDC (soft pink)"
git push
npx vercel --prod --force --yes

Write-Host "`nDONE! https://saju-app-vert.vercel.app" -ForegroundColor Green
