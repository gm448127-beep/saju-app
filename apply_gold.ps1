# ==============================
# 1. saju/route.ts - 오행 설명 강화 (L64)
# ==============================
$sajuFile = ".\src\app\api\saju\route.ts"
$sajuContent = [System.IO.File]::ReadAllText($sajuFile, [System.Text.Encoding]::UTF8)

# 기존 금(金) 한 줄 설명을 상세 설명으로 교체
$oldGoldDesc = '"결단·의리·정의를 상징합니다. 금이 강하면 실행력이 뛰어나지만, 과하면 냉정할 수 있습니다."'
$newGoldDesc = @"
"결단·의리·정의를 상징합니다. 금이 강하면 완벽주의적이고 자기관리에 뛰어나며 책임감이 강합니다. 언행이 명확하고 일처리가 꼼꼼합니다. 과하면 예민하고 인간관계에서 손절이 빠르며 내재된 날카로움이 나타날 수 있습니다. 금이 없으면 결단력이 부족하고 우유부단해질 수 있으며, 재물 관리와 현실 감각이 약해질 수 있습니다. 금은 폐·호흡기와 관련이 깊고, 계절로는 가을, 색상은 흰색, 방향은 서쪽에 해당합니다."
"@

if ($sajuContent.Contains($oldGoldDesc)) {
    $sajuContent = $sajuContent.Replace($oldGoldDesc, $newGoldDesc)
    Write-Host "[1] saju/route.ts L64: gold desc REPLACED" -ForegroundColor Green
} else {
    Write-Host "[1] saju/route.ts: old gold desc NOT FOUND - checking..." -ForegroundColor Red
}

# ==============================
# 2. saju/route.ts - summary에 금 분석 추가 (L288 이후)
# ==============================
$oldMinOhaeng = 'if (minOhaeng) summary += `${minOhaeng[0]}이(가) ${minOhaeng[1]}개로 가장 약합니다.\n`;'
$newMinOhaeng = @"
if (minOhaeng) summary += ``${minOhaeng[0]}이(가) ``${minOhaeng[1]}개로 가장 약합니다.\n``;

    // 금(金) 상세 분석 추가
    const goldCount = ohaengCount["금(金)"] || 0;
    if (goldCount === 0) {
      const dayElement = dayGanData.element || "";
      let goldAdvice = "이 사주에는 금(金)의 기운이 없습니다. ";
      if (dayElement === "목(木)") goldAdvice += "목 일간에 금이 없으면 현실 감각이 떨어지거나 이상을 더 추구하는 경향이 있습니다. ";
      else if (dayElement === "화(火)") goldAdvice += "화 일간에 금이 없으면 일의 성취와 결과를 가져가기 어려울 수 있으니 방향성을 뚜렷하게 잡아야 합니다. ";
      else if (dayElement === "토(土)") goldAdvice += "토 일간에 금이 없으면 표현력 발현을 위해 꾸준히 노력해야 합니다. ";
      else if (dayElement === "금(金)") goldAdvice += "금 일간인데 금이 부족하면 의견을 잘 표출하지 못하고 생각만 하고 끝나는 경우가 있습니다. ";
      else if (dayElement === "수(水)") goldAdvice += "수 일간에 금이 없으면 인복을 스스로 키워나가는 노력이 필요합니다. ";
      goldAdvice += "개운법: 흰색/금속 소재 활용, 호흡기 건강 관리, 결단력 훈련이 도움됩니다.";
      summary += goldAdvice + "\n";
    } else if (goldCount >= 3) {
      summary += "금(金)이 " + goldCount + "개로 매우 강합니다. 완벽주의 성향과 예리한 판단력이 장점이지만, 인간관계에서 유연함을 기르고 타인을 수용하는 자세가 필요합니다. 스트레스·예민함 관리에 신경 쓰세요.\n";
    }
"@

if ($sajuContent.Contains('if (minOhaeng) summary += `${minOhaeng[0]}')) {
    # 정확한 문자열 매칭이 어려우므로 정규식 사용
    $pattern = 'if \(minOhaeng\) summary \+= `\$\{minOhaeng\[0\]\}이\(가\) \$\{minOhaeng\[1\]\}개로 가장 약합니다\.\\n`;'
    if ($sajuContent -match 'minOhaeng\[0\]\}이\(가\).*가장 약합니다') {
        Write-Host "[2] saju/route.ts: minOhaeng line FOUND - will insert after it" -ForegroundColor Green
    }
}

# 줄 단위로 처리
$sajuLines = $sajuContent -split "`n"
$newLines = @()
$inserted = $false
foreach ($line in $sajuLines) {
    $newLines += $line
    if (!$inserted -and $line -match 'minOhaeng\[0\]\}이\(가\).*가장 약합니다') {
        $goldBlock = @"

    // === 금(金) 상세 분석 (유튜브 참고: 팔자에 金이 있고 없고의 큰 차이점) ===
    const goldCount = ohaengCount["\uAE08(\u91D1)"] || 0;
    if (goldCount === 0) {
      const dayEl = dayGanData?.element || "";
      let goldMsg = "\uC774 \uC0AC\uC8FC\uC5D0\uB294 \uAE08(\u91D1)\uC758 \uAE30\uC6B4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. ";
      if (dayEl.includes("\uBAA9")) goldMsg += "\uBAA9 \uC77C\uAC04\uC5D0 \uAE08\uC774 \uC5C6\uC73C\uBA74 \uD604\uC2E4 \uAC10\uAC01\uC774 \uB5A8\uC5B4\uC9C0\uAC70\uB098 \uC774\uC0C1\uC744 \uB354 \uCD94\uAD6C\uD558\uB294 \uACBD\uD5A5\uC774 \uC788\uC2B5\uB2C8\uB2E4. ";
      else if (dayEl.includes("\uD654")) goldMsg += "\uD654 \uC77C\uAC04\uC5D0 \uAE08\uC774 \uC5C6\uC73C\uBA74 \uC77C\uC758 \uC131\uCDE8\uC640 \uACB0\uACFC\uB97C \uAC00\uC838\uAC00\uAE30 \uC5B4\uB824\uC6B8 \uC218 \uC788\uC73C\uB2C8 \uBC29\uD5A5\uC131\uC744 \uBB50\uB837\uD558\uAC8C \uC7A1\uC544\uC57C \uD569\uB2C8\uB2E4. ";
      else if (dayEl.includes("\uD1A0")) goldMsg += "\uD1A0 \uC77C\uAC04\uC5D0 \uAE08\uC774 \uC5C6\uC73C\uBA74 \uD45C\uD604\uB825 \uBC1C\uD604\uC744 \uC704\uD574 \uAFB8\uC900\uD788 \uB178\uB825\uD574\uC57C \uD569\uB2C8\uB2E4. ";
      else if (dayEl.includes("\uAE08")) goldMsg += "\uAE08 \uC77C\uAC04\uC778\uB370 \uAE08\uC774 \uBD80\uC871\uD558\uBA74 \uC758\uACAC \uD45C\uCD9C\uC774 \uC5B4\uB835\uACE0 \uC0DD\uAC01\uB9CC \uD558\uACE0 \uB05D\uB098\uB294 \uACBD\uC6B0\uAC00 \uC788\uC2B5\uB2C8\uB2E4. ";
      else if (dayEl.includes("\uC218")) goldMsg += "\uC218 \uC77C\uAC04\uC5D0 \uAE08\uC774 \uC5C6\uC73C\uBA74 \uC778\uBCF5\uC744 \uC2A4\uC2A4\uB85C \uD0A4\uC6CC\uB098\uAC00\uB294 \uB178\uB825\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. ";
      goldMsg += "\uAC1C\uC6B4\uBC95: \uD770\uC0C9/\uAE08\uC18D \uC18C\uC7AC \uD65C\uC6A9, \uD638\uD761\uAE30 \uAC74\uAC15 \uAD00\uB9AC, \uACB0\uB2E8\uB825 \uD6C8\uB828\uC774 \uB3C4\uC6C0\uB429\uB2C8\uB2E4.";
      summary += goldMsg + "\\n";
    } else if (goldCount >= 3) {
      summary += "\uAE08(\u91D1)\uC774 " + goldCount + "\uAC1C\uB85C \uB9E4\uC6B0 \uAC15\uD569\uB2C8\uB2E4. \uC644\uBCBD\uC8FC\uC758 \uC131\uD5A5\uACFC \uC608\uB9AC\uD55C \uD310\uB2E8\uB825\uC774 \uC7A5\uC810\uC774\uC9C0\uB9CC, \uC778\uAC04\uAD00\uACC4\uC5D0\uC11C \uC720\uC5F0\uD568\uC744 \uAE30\uB974\uACE0 \uD0C0\uC778\uC744 \uC218\uC6A9\uD558\uB294 \uC790\uC138\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uC2A4\uD2B8\uB808\uC2A4\xB7\uC608\uBBFC\uD568 \uAD00\uB9AC\uC5D0 \uC2E0\uACBD \uC4F0\uC138\uC694.\\n";
    }
"@
        $newLines += $goldBlock
        $inserted = $true
        Write-Host "[2] saju/route.ts: gold analysis block INSERTED after minOhaeng line" -ForegroundColor Green
    }
}

if ($inserted) {
    $sajuContent = $newLines -join "`n"
}

[System.IO.File]::WriteAllText($sajuFile, $sajuContent, (New-Object System.Text.UTF8Encoding $false))
Write-Host "[1+2] saju/route.ts SAVED" -ForegroundColor Green

# ==============================
# 3. premium/route.ts - 프롬프트에 금 해석 가이드 추가
# ==============================
$premFile = ".\src\app\api\saju\premium\route.ts"
$premContent = [System.IO.File]::ReadAllText($premFile, [System.Text.Encoding]::UTF8)

# L88 앞에 금(金) 해석 전문 가이드 삽입
# "위 데이터를 바탕으로 만세력을 계산하여" 앞에 삽입
$insertBefore = "위 데이터를 바탕으로 만세력을 계산하여"

$goldGuide = @"

[금(金) 오행 해석 특별 가이드]
- 금이 0개: 결단력 부족, 우유부단, 재물운 약화 가능. 일간별 차이를 반드시 설명할 것 (목일간: 현실감각 부족, 화일간: 성취 어려움, 토일간: 표현력 부족, 금일간: 의견표출 어려움, 수일간: 인복 키워야 함)
- 금이 1~2개: 균형잡힌 결단력과 의리. 적절한 자기관리 능력
- 금이 3개 이상: 완벽주의, 예리한 판단력, 자기관리 뛰어남. 단, 인간관계 손절 빠름, 예민함, 날카로운 언행 주의
- 금 관련 건강: 폐, 대장, 호흡기 관련 (금이 없으면 호흡기 취약, 금이 과하면 스트레스/불면 주의)
- 금 관련 개운법: 흰색/금색/은색 활용, 금속 소재 장신구, 호흡 운동, 배/무/마늘 등 백색 음식, 숫자 4와 9
- 금 관련 직업: 법조계, 군검경, 공무원, 기자/작가, 비평가, 정밀 작업 분야
- 경금일간(庚): 제련되지 않은 금속처럼 호불호 명확, 경험주의, 냉철하고 주도적, 하나에 꽂히면 끝까지
- 신금일간(辛): 보석처럼 시선을 사로잡는 매력, 예민하고 섬세, 깔끔하고 논리적인 언어 선호

$insertBefore
"@

if ($premContent.Contains($insertBefore)) {
    $premContent = $premContent.Replace($insertBefore, $goldGuide)
    Write-Host "[3] premium/route.ts: gold guide INSERTED" -ForegroundColor Green
} else {
    Write-Host "[3] premium/route.ts: insert point NOT FOUND" -ForegroundColor Red
}

[System.IO.File]::WriteAllText($premFile, $premContent, (New-Object System.Text.UTF8Encoding $false))
Write-Host "[3] premium/route.ts SAVED" -ForegroundColor Green

# ==============================
# 4. 검증
# ==============================
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Cyan
$sajuCheck = [System.IO.File]::ReadAllText($sajuFile, [System.Text.Encoding]::UTF8)
$premCheck = [System.IO.File]::ReadAllText($premFile, [System.Text.Encoding]::UTF8)

$checks = @(
    @("saju: goldCount", ($sajuCheck -match "goldCount")),
    @("saju: dayEl.includes", ($sajuCheck -match "dayEl\.includes")),
    @("prem: gold guide", ($premCheck -match "금\(金\) 오행 해석 특별 가이드")),
    @("prem: 경금일간", ($premCheck -match "경금일간")),
    @("prem: 개운법", ($premCheck -match "금 관련 개운법"))
)

foreach ($c in $checks) {
    $icon = if ($c[1]) { "OK" } else { "MISSING" }
    $color = if ($c[1]) { "Green" } else { "Red" }
    Write-Host "  $icon : $($c[0])" -ForegroundColor $color
}

# ==============================
# 5. 빌드 테스트
# ==============================
Write-Host "`n=== BUILD TEST ===" -ForegroundColor Cyan
npm run build 2>&1 | Select-Object -Last 10
