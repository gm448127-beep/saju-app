import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sajuData } = await request.json();

    if (!sajuData) {
      return NextResponse.json({ error: '사주 데이터가 필요합니다.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const systemPrompt = `당신은 30년 경력의 명리학 대가이자, 현대적 해석에 능한 사주 전문가입니다.
주어진 사주 데이터를 바탕으로 깊이 있고 개인 맞춤형 프리미엄 사주 리포트를 작성합니다.

작성 규칙:
- 반드시 아래 10개 챕터 구조를 지켜주세요
- 각 챕터는 최소 200자 이상 상세하게 작성하세요
- 전문 용어를 쓸 때는 괄호 안에 쉬운 설명을 병기하세요
- 긍정적이되 현실적인 조언을 포함하세요
- 마크다운 형식으로 작성하세요 (## 챕터 제목, **강조** 등)
- 이모지를 적절히 활용하여 가독성을 높이세요

10개 챕터 구조:
## 🌟 1장. 타고난 성격과 기질
## 💰 2장. 재물운과 금전 흐름
## 💼 3장. 직업운과 사회적 성취
## ❤️ 4장. 애정운과 대인관계
## 🏥 5장. 건강운과 체질 분석
## 📅 6장. 2026년 병오년 운세 총론
## 🔮 7장. 대운(大運) 흐름 분석
## ⚖️ 8장. 격국(格局)과 용신(用神) 심화
## 🛡️ 9장. 신살(神煞)과 특수 기운
## 💎 10장. 종합 조언과 행운 키워드`;

    // 사주 데이터를 텍스트로 변환
    const pillars = sajuData.pillars || {};
    const ohaengEntries = sajuData.ohaengCount ? Object.entries(sajuData.ohaengCount).map(([k,v]: [string, unknown]) => `${k}: ${v}`).join(', ') : '데이터 없음';
    const ohaengAnalysisText = sajuData.ohaengAnalysis ? sajuData.ohaengAnalysis.map((a: any) => `${a.name}(${a.count}): ${a.desc}`).join('\n') : '';
    const sipsinEntries = sajuData.sipsinCount ? Object.entries(sajuData.sipsinCount).map(([k,v]: [string, unknown]) => `${k}: ${v}`).join(', ') : '데이터 없음';
    const sipsinAnalysisText = sajuData.sipsinAnalysis ? sajuData.sipsinAnalysis.map((a: any) => `${a.name}(${a.count}): ${a.desc}`).join('\n') : '';
    const stemRelText = sajuData.stemRelations ? sajuData.stemRelations.map((r: any) => `${r.type}: ${r.desc}`).join('\n') : '없음';
    const branchRelText = sajuData.branchRelations ? sajuData.branchRelations.map((r: any) => `${r.type}: ${JSON.stringify(r.details)}`).join('\n') : '없음';
    const salsText = sajuData.salsSummary ? sajuData.salsSummary.map((s: any) => `${s.pillar} - 12신살: ${s.twelveSal}${s.specialSals?.length ? ', 특수살: ' + s.specialSals.join(',') : ''}`).join('\n') : '없음';
    const daeunText = sajuData.daeun ? sajuData.daeun.map((d: any) => `${d.age}세: ${d.ganzhi}`).join(' → ') : '없음';
    const seyunText = sajuData.seyun ? sajuData.seyun.map((s: any) => `${s.year}년 ${s.ganzhi}`).join(', ') : '없음';
    const wolunText = sajuData.wolun ? sajuData.wolun.map((w: any) => `${w.month}월: ${w.ganzhi}`).join(', ') : '없음';
    const currentDaeun = sajuData.daeunCurrent ? `${sajuData.daeunCurrent.ganzhi} (${sajuData.daeunCurrent.ganKo}/${sajuData.daeunCurrent.jiKo})` : '없음';

    const userPrompt = `아래 사주 분석 데이터를 바탕으로 프리미엄 사주 리포트를 작성해주세요.

[기본 정보]
- 생년월일: ${sajuData.birthDate}
- 출생시간: ${sajuData.birthTime || '미입력'}
- 성별: ${sajuData.gender}
- 나이: ${sajuData.age}세
- 띠: ${sajuData.ddi?.name || ''}
- 음양: ${sajuData.eumyang || ''}

[사주 원국]
- 일간(나): ${sajuData.dayGan} (${sajuData.mainElement})
- 신강/신약: ${sajuData.strength} (점수: ${sajuData.strengthScore})
- 격국: ${sajuData.gyeok || '없음'}
- 용신: ${sajuData.yongshin || '없음'}
- 길신: ${sajuData.gilsin?.join(', ') || '없음'}
- 흉신: ${sajuData.hyungsin?.join(', ') || '없음'}

[사주 팔자 (연주/월주/일주/시주)]
- 연주: ${pillars.year?.sky || ''}${pillars.year?.earth || ''}
- 월주: ${pillars.month?.sky || ''}${pillars.month?.earth || ''}
- 일주: ${pillars.day?.sky || ''}${pillars.day?.earth || ''}
- 시주: ${pillars.hour?.sky || ''}${pillars.hour?.earth || ''}

[오행 분포]
${ohaengEntries}

[오행 분석]
${ohaengAnalysisText}

[십성 분포]
${sipsinEntries}

[십성 분석]
${sipsinAnalysisText}

[성격 특성]
${sajuData.personality || ''}

[천간 관계]
${stemRelText}

[지지 관계]
${branchRelText}

[신살]
${salsText}

[공망]
${sajuData.gongmang || '없음'}

[대운 정보]
- 대운 시작 나이: ${sajuData.daeunStartAge}세
- 현재 대운: ${currentDaeun}
- 전체 대운: ${daeunText}

[2026년 세운]
${seyunText}

[2026년 월운]
${wolunText}

[기존 해석 요약]
${sajuData.interpretation || ''}
${sajuData.summary || ''}

위 데이터를 종합하여, 10개 챕터 구조의 프리미엄 사주 리포트를 작성해주세요.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API Error:', errorData);
      return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const reportContent = data.content?.[0]?.text || '';

    return NextResponse.json({
      success: true,
      report: reportContent,
      model: 'claude-sonnet-4-20250514',
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Premium API Error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
