import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sajuData } = await request.json();
    
    if (!sajuData) {
      return NextResponse.json({ error: "사주 데이터가 없습니다." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    const prompt = "당신은 사주팔자 전문가입니다. 아래 사주 데이터를 바탕으로 상세한 프리미엄 사주 해설을 작성해주세요. 운세, 성격, 재물운, 건강운, 연애운, 직업운을 각각 자세히 분석해주세요.\n\n사주 데이터:\n" + JSON.stringify(sajuData, null, 2);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return NextResponse.json({ error: "AI 분석 오류: " + response.status }, { status: 500 });
    }

    const data = await response.json();
    const report = data.candidates?.[0]?.content?.parts?.[0]?.text || "분석 결과를 생성하지 못했습니다.";

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Premium API Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "서버 오류: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}