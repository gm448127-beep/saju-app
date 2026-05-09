import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "ssaju";

// ★ 결정적 해시 함수 (점수 변동 방지)
function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // 32bit integer
  }
  return Math.abs(hash);
}

// ★ 시드 기반 유사난수 생성기 (0~1 사이 값 반환)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2 } = body;

    const p1 = person1;
    const p2 = person2;

    // ★ hasHour 판별: typeof === "number" 로 정확하게 체크
    const has1Hour = typeof p1.hour === "number";
    const has2Hour = typeof p2.hour === "number";

    console.log(`[compatibility] p1 hour: ${p1.hour} has1Hour: ${has1Hour}`);
    console.log(`[compatibility] p2 hour: ${p2.hour} has2Hour: ${has2Hour}`);

    // ★ saju1Input: applyLocalMeanTime + longitude 포함
    const saju1Input: Record<string, unknown> = {
      year: p1.year,
      month: p1.month,
      day: p1.day,
      gender: p1.gender === "male" ? "남" : "여",
      calendar: p1.isLunar ? "lunar" : "solar",
      applyLocalMeanTime: true,   // ★ 추가
      longitude: 126.9784,         // ★ 추가
    };
    if (has1Hour) {
      saju1Input.hour = p1.hour;
      if (typeof p1.minute === "number") {
        saju1Input.minute = p1.minute;
      }
    }

    // ★ saju2Input: applyLocalMeanTime + longitude 포함
    const saju2Input: Record<string, unknown> = {
      year: p2.year,
      month: p2.month,
      day: p2.day,
      gender: p2.gender === "male" ? "남" : "여",
      calendar: p2.isLunar ? "lunar" : "solar",
      applyLocalMeanTime: true,   // ★ 추가
      longitude: 126.9784,         // ★ 추가
    };
    if (has2Hour) {
      saju2Input.hour = p2.hour;
      if (typeof p2.minute === "number") {
        saju2Input.minute = p2.minute;
      }
    }

    const result1 = calculateSaju(saju1Input as Parameters<typeof calculateSaju>[0]);
    const result2 = calculateSaju(saju2Input as Parameters<typeof calculateSaju>[0]);

    // 사주 결과에서 기본 정보 추출
    const pillars1 = {
      year: result1.pillars?.year ?? "",
      month: result1.pillars?.month ?? "",
      day: result1.pillars?.day ?? "",
      hour: has1Hour ? (result1.pillars?.hour ?? null) : null,
    };
    const pillars2 = {
      year: result2.pillars?.year ?? "",
      month: result2.pillars?.month ?? "",
      day: result2.pillars?.day ?? "",
      hour: has2Hour ? (result2.pillars?.hour ?? null) : null,
    };

    const pillarDetails1 = result1.pillarDetails;
    const pillarDetails2 = result2.pillarDetails;

    // ★ 결정적 점수 계산 (seed 기반, Math.random 사용 안 함)
    const seedStr = [
      p1.year, p1.month, p1.day, p1.hour ?? "none",
      p2.year, p2.month, p2.day, p2.hour ?? "none",
      p1.gender, p2.gender,
      p1.isLunar ? "lunar" : "solar",
      p2.isLunar ? "lunar" : "solar",
    ].join("-");
    const seed = deterministicHash(seedStr);
    const rng = seededRandom(seed);

    // 오행 호환성 분석
    const elements1 = result1.fiveElements ?? {};
    const elements2 = result2.fiveElements ?? {};

    // 일간(Day Master) 비교
    const dayStem1 = pillarDetails1?.day?.stem ?? "";
    const dayStem2 = pillarDetails2?.day?.stem ?? "";

    // ★ 결정적 점수 산출
    let baseScore = 50;

    // 일간 상생/상극 관계 반영
    const stemElements: Record<string, string> = {
      "甲": "wood", "乙": "wood",
      "丙": "fire", "丁": "fire",
      "戊": "earth", "己": "earth",
      "庚": "metal", "辛": "metal",
      "壬": "water", "癸": "water",
    };
    const generating: Record<string, string> = {
      wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood",
    };
    const controlling: Record<string, string> = {
      wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire",
    };

    const el1 = stemElements[dayStem1] ?? "";
    const el2 = stemElements[dayStem2] ?? "";

    if (el1 && el2) {
      if (generating[el1] === el2 || generating[el2] === el1) {
        baseScore += 15; // 상생
      } else if (el1 === el2) {
        baseScore += 5; // 같은 오행
      } else if (controlling[el1] === el2 || controlling[el2] === el1) {
        baseScore -= 10; // 상극
      }
    }

    // 지지(Branch) 합/충 분석 - 일지 기준
    const dayBranch1 = pillarDetails1?.day?.branch ?? "";
    const dayBranch2 = pillarDetails2?.day?.branch ?? "";
    const sixHarmony: [string, string][] = [
      ["子", "丑"], ["寅", "亥"], ["卯", "戌"],
      ["辰", "酉"], ["巳", "申"], ["午", "未"],
    ];
    const sixClash: [string, string][] = [
      ["子", "午"], ["丑", "未"], ["寅", "申"],
      ["卯", "酉"], ["辰", "戌"], ["巳", "亥"],
    ];

    const isHarmony = sixHarmony.some(
      ([a, b]) => (dayBranch1 === a && dayBranch2 === b) || (dayBranch1 === b && dayBranch2 === a)
    );
    const isClash = sixClash.some(
      ([a, b]) => (dayBranch1 === a && dayBranch2 === b) || (dayBranch1 === b && dayBranch2 === a)
    );

    if (isHarmony) baseScore += 12;
    if (isClash) baseScore -= 12;

    // 시주 있으면 추가 가감
    if (has1Hour && has2Hour) {
      const hourBranch1 = pillarDetails1?.hour?.branch ?? "";
      const hourBranch2 = pillarDetails2?.hour?.branch ?? "";
      const hourHarmony = sixHarmony.some(
        ([a, b]) => (hourBranch1 === a && hourBranch2 === b) || (hourBranch1 === b && hourBranch2 === a)
      );
      const hourClash = sixClash.some(
        ([a, b]) => (hourBranch1 === a && hourBranch2 === b) || (hourBranch1 === b && hourBranch2 === a)
      );
      if (hourHarmony) baseScore += 5;
      if (hourClash) baseScore -= 5;
    }

    // 오행 균형 보완 점수
    const allElements = ["wood", "fire", "earth", "metal", "water"];
    const total1 = allElements.reduce((sum, e) => sum + ((elements1 as Record<string, number>)[e] ?? 0), 0);
    const total2 = allElements.reduce((sum, e) => sum + ((elements2 as Record<string, number>)[e] ?? 0), 0);
    if (total1 > 0 && total2 > 0) {
      // 상대방이 내게 부족한 오행을 보완하면 가점
      for (const el of allElements) {
        const v1 = (elements1 as Record<string, number>)[el] ?? 0;
        const v2 = (elements2 as Record<string, number>)[el] ?? 0;
        if (v1 === 0 && v2 >= 2) baseScore += 3;
        if (v2 === 0 && v1 >= 2) baseScore += 3;
      }
    }

    // ★ 약간의 결정적 변동 (seed 기반, 절대 Math.random 사용 안 함)
    const variation = Math.floor(rng() * 7) - 3; // -3 ~ +3
    baseScore += variation;

    // 점수 범위 제한
    const score = Math.max(20, Math.min(95, baseScore));

    // 궁합 등급 결정
    let grade: string;
    let gradeLabel: string;
    if (score >= 80) { grade = "excellent"; gradeLabel = "천생연분"; }
    else if (score >= 65) { grade = "good"; gradeLabel = "좋은 궁합"; }
    else if (score >= 50) { grade = "average"; gradeLabel = "보통 궁합"; }
    else if (score >= 35) { grade = "caution"; gradeLabel = "주의 필요"; }
    else { grade = "challenging"; gradeLabel = "노력 필요"; }

    // 분석 텍스트 생성
    const analysisItems: string[] = [];

    // 오행 분석
    if (el1 && el2) {
      const elKo: Record<string, string> = { wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)" };
      if (generating[el1] === el2) {
        analysisItems.push(`${elKo[el1]}이(가) ${elKo[el2]}을(를) 생하는 상생 관계로 서로에게 에너지를 줍니다.`);
      } else if (generating[el2] === el1) {
        analysisItems.push(`${elKo[el2]}이(가) ${elKo[el1]}을(를) 생하는 상생 관계로 서로에게 에너지를 줍니다.`);
      } else if (controlling[el1] === el2) {
        analysisItems.push(`${elKo[el1]}이(가) ${elKo[el2]}을(를) 극하는 상극 관계입니다. 서로의 차이를 이해하는 노력이 필요합니다.`);
      } else if (controlling[el2] === el1) {
        analysisItems.push(`${elKo[el2]}이(가) ${elKo[el1]}을(를) 극하는 상극 관계입니다. 서로의 차이를 이해하는 노력이 필요합니다.`);
      } else if (el1 === el2) {
        analysisItems.push(`두 사람 모두 ${elKo[el1]} 기운으로 비화(比和) 관계입니다. 공감대가 넓지만 경쟁이 생길 수 있습니다.`);
      }
    }

    // 일지 합충 분석
    if (isHarmony) {
      analysisItems.push("일지가 육합(六合) 관계로, 일상적인 생활에서 조화롭고 편안한 관계가 기대됩니다.");
    }
    if (isClash) {
      analysisItems.push("일지가 충(沖) 관계로, 생활 방식의 차이로 갈등이 생길 수 있습니다. 서로에 대한 이해와 양보가 중요합니다.");
    }

    // 오행 보완 분석
    const complementary: string[] = [];
    const elKo: Record<string, string> = { wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)" };
    for (const el of allElements) {
      const v1 = (elements1 as Record<string, number>)[el] ?? 0;
      const v2 = (elements2 as Record<string, number>)[el] ?? 0;
      if (v1 === 0 && v2 >= 2) complementary.push(`${p1.name ?? "첫째"}에게 부족한 ${elKo[el]}을(를) ${p2.name ?? "둘째"}가 보완`);
      if (v2 === 0 && v1 >= 2) complementary.push(`${p2.name ?? "둘째"}에게 부족한 ${elKo[el]}을(를) ${p1.name ?? "첫째"}가 보완`);
    }
    if (complementary.length > 0) {
      analysisItems.push(`오행 보완: ${complementary.join(", ")}합니다.`);
    }

    if (analysisItems.length === 0) {
      analysisItems.push("두 사람의 사주 구성이 무난한 관계를 나타냅니다.");
    }

    const response = {
      success: true,
      score,
      grade,
      gradeLabel,
      person1: {
        name: p1.name ?? "",
        gender: p1.gender,
        pillars: { year: pillarDetails1?.year ?? null, month: pillarDetails1?.month ?? null, day: pillarDetails1?.day ?? null, hour: has1Hour ? (pillarDetails1?.hour ?? null) : null },
        pillarDetails: {
          year: pillarDetails1?.year ?? null,
          month: pillarDetails1?.month ?? null,
          day: pillarDetails1?.day ?? null,
          hour: has1Hour ? (pillarDetails1?.hour ?? null) : null,
        },
        hasHour: has1Hour,
        fiveElements: elements1,
        compact: result1.toCompact(),
      },
      person2: {
        name: p2.name ?? "",
        gender: p2.gender,
        pillars: { year: pillarDetails2?.year ?? null, month: pillarDetails2?.month ?? null, day: pillarDetails2?.day ?? null, hour: has2Hour ? (pillarDetails2?.hour ?? null) : null },
        pillarDetails: {
          year: pillarDetails2?.year ?? null,
          month: pillarDetails2?.month ?? null,
          day: pillarDetails2?.day ?? null,
          hour: has2Hour ? (pillarDetails2?.hour ?? null) : null,
        },
        hasHour: has2Hour,
        fiveElements: elements2,
        compact: result2.toCompact(),
      },
      analysis: analysisItems,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("[compatibility] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
