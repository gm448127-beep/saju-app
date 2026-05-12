import { NextRequest, NextResponse } from "next/server";

// 간단한 메모리 캐시 (같은 사주 데이터 반복 요청 방지)
const cache = new Map<string, { report: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1시간

export async function POST(request: NextRequest) {
  try {
    const { sajuData, name } = await request.json();

    if (!sajuData) {
      return NextResponse.json({ error: "사주 데이터가 없습니다." }, { status: 400 });
    }

    const userName = name || sajuData.userName || sajuData.name || "회원";

    // 캐시 키 생성
    const cacheKey = JSON.stringify({
      birthDate: sajuData.birthDate,
      gender: sajuData.gender,
      birthTime: sajuData.birthTime,
      userName
    });

    // 캐시 확인
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("캐시에서 리포트 반환:", userName);
      return NextResponse.json({ success: true, report: cached.report });
    }

    const birthDate = sajuData.birthDate || "";
    const gender = sajuData.gender === "male" ? "남성" : "여성";
    const birthTime = sajuData.birthTime || "미상";

    const prompt = `당신은 20년 경력의 따뜻하고 친근한 사주 상담사입니다. 이름은 '사주멘토'입니다.

아래 규칙을 반드시 지켜서 사주 해설을 작성하세요:

[톤앤매너 규칙]
1. 반드시 "${userName}님"이라고 이름을 불러주며 1:1 대면 상담하듯 대화체로 작성하세요.
2. 어려운 한자 용어를 쓸 때는 반드시 괄호 안에 쉬운 설명을 붙이세요. 예: "식신(食神, 먹고 표현하는 기운)"
3. 추상적인 설명 대신 일상적인 비유와 은유를 적극 활용하세요. 예: "비유한 눈밭 같은 성격", "마른 대지에 내리는 단비 같은 운"
4. 각 섹션마다 이모지 제목을 붙여 시각적으로 구분하세요.
5. "~입니다", "~합니다"체를 기본으로 하되, 중간중간 "~이지요", "~셈이에요", "~보세요" 등 부드러운 존댓말을 섞으세요.
6. 매 섹션 끝에 바로 실천 가능한 조언을 반드시 포함하세요. "좋은 운이 옵니다" 같은 추상적 표현은 금지합니다.
7. 전체적으로 보고서가 아니라, 역술가가 차 한잔 마시며 이야기해주는 느낌으로 작성하세요.

[작성 구조 - 아래 순서대로 작성]

🌟 ${userName}님의 사주 이야기
- 사주팔자 원국을 소개하며, 일간(나를 상징하는 오행)을 비유적으로 설명
- "${userName}님은 ○○을 상징하는 △△ 일간으로 태어나셨습니다" 형태로 시작

🌸 타고난 성격과 매력
- 사주 구조에서 드러나는 성격적 특징을 구체적 상황 예시와 함께 설명
- 장점과 주의할 점을 균형있게 서술

💰 재물운: 돈의 그릇과 흐름
- 재물의 크기보다는 돈과 나가는 동료를 비유적으로 설명
- 재물을 지키고 키우는 구체적 실천 조언 포함

❤️ 연애운과 인간관계
- 사주에서 보이는 인연의 특징을 이야기하듯 풀어서 설명
- 좋은 인연을 만나는 시기와 관계에서 주의할 점

💼 직업운과 적성
- 어떤 분야에서 빛나는 사주인지 구체적 직업군과 함께 설명
- 현재 시점에서의 커리어 조언

🏥 건강운: 몸과 마음의 균형
- 오행 균형에서 보이는 건강 취약점을 쉽게 설명
- 구체적인 건강 관리 팁 (색깔, 음식, 활동 등)

📅 현재 대운과 올해(2026년, 병오년)의 흐름
- 현재 인생의 큰 흐름(대운)과 올해 운의 특징
- 상반기와 하반기를 나눠서 설명

✨ ${userName}님을 위한 종합 조언
- 전체를 아우르는 따뜻한 마무리 메시지
- 3가지 핵심 실천 조언 (바로 행동으로 옮길 수 있는 것)

[사주 데이터]
생년월일: ${birthDate}
성별: ${gender}
태어난 시간: ${birthTime}

위 데이터를 바탕으로 만세력을 계산하여 사주팔자(연주, 월주, 일주, 시주의 천간과 지지)를 도출한 후, 위 구조에 맞게 상세하고 따뜻한 사주 해설을 작성해주세요. 최소 2000자 이상으로 충분히 길고 상세하게 작성하세요.`;

    let report = null;

    // 방법 1: Gemini API 시도
    const geminiKey = process.env.GEMINI_API_KEY_PREMIUM || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const models = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
      for (const model of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.85, maxOutputTokens: 8192 }
              })
            }
          );
          if (response.ok) {
            const data = await response.json();
            report = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (report) {
              console.log("Gemini 성공:", model);
              break;
            }
          } else if (response.status === 429) {
            console.log(`Gemini ${model} 429, 다음 모델 시도...`);
            continue;
          }
        } catch (e) {
          console.log(`Gemini ${model} 오류:`, e);
        }
      }
    }

    // 방법 2: OpenRouter API (Gemini 실패 시)
    if (!report) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        console.log("OpenRouter로 전환...");
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openRouterKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://saju-app-vert.vercel.app",
              "X-Title": "Saju App"
            },
            body: JSON.stringify({
              model: "google/gemini-2.0-flash-exp:free",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 8192,
              temperature: 0.85
            })
          });
          if (response.ok) {
            const data = await response.json();
            report = data.choices?.[0]?.message?.content;
            if (report) console.log("OpenRouter 성공!");
          } else {
            const errText = await response.text();
            console.error("OpenRouter 오류:", response.status, errText);
          }
        } catch (e) {
          console.error("OpenRouter 오류:", e);
        }
      }
    }

    if (!report) {
      return NextResponse.json({ error: "AI 분석 오류: 모든 API가 응답하지 않습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }

    // 캐시에 저장
    cache.set(cacheKey, { report, timestamp: Date.now() });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Premium API Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "서버 오류: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
