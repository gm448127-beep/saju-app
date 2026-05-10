import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "ssaju";

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const generating: Record<string, string> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const controlling: Record<string, string> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
const sixHarmony: [string, string][] = [["자","축"],["인","해"],["묘","술"],["진","유"],["사","신"],["오","미"]];
const sixClash: [string, string][] = [["자","오"],["축","미"],["인","신"],["묘","유"],["진","술"],["사","해"]];
const elKo: Record<string, string> = { wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)" };
const elEmoji: Record<string, string> = { wood: "🌳", fire: "🔥", earth: "⛰️", metal: "⚔️", water: "💧" };
const elColor: Record<string, string> = { wood: "#22c55e", fire: "#ef4444", earth: "#a16207", metal: "#94a3b8", water: "#3b82f6" };

function getEumyang(stem: string): string {
  const yang = ["갑","병","무","경","임"];
  return yang.includes(stem) ? "양(陽)" : "음(陰)";
}

function getDdi(year: number): { emoji: string; name: string } {
  const animals = [
    { emoji: "🐀", name: "쥐띠" }, { emoji: "🐂", name: "소띠" },
    { emoji: "🐅", name: "범띠" }, { emoji: "🐇", name: "토끼띠" },
    { emoji: "🐉", name: "용띠" }, { emoji: "🐍", name: "뱀띠" },
    { emoji: "🐴", name: "말띠" }, { emoji: "🐑", name: "양띠" },
    { emoji: "🐵", name: "원숭이띠" }, { emoji: "🐔", name: "닭띠" },
    { emoji: "🐶", name: "개띠" }, { emoji: "🐷", name: "돼지띠" },
  ];
  return animals[(year - 4) % 12];
}

function getMainElement(elements: Record<string, number>): string {
  let max = 0;
  let main = "wood";
  for (const [k, v] of Object.entries(elements)) {
    if (v > max) { max = v; main = k; }
  }
  return main;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2 } = body;
    const p1 = person1;
    const p2 = person2;

    const has1Hour = typeof p1.hour === "number";
    const has2Hour = typeof p2.hour === "number";

    const saju1Input: Record<string, unknown> = {
      year: p1.year, month: p1.month, day: p1.day,
      gender: p1.gender === "male" ? "남" : "여",
      calendar: p1.isLunar ? "lunar" : "solar",
      applyLocalMeanTime: true,
      longitude: 126.9784,
    };
    if (has1Hour) {
      saju1Input.hour = p1.hour;
      if (typeof p1.minute === "number") saju1Input.minute = p1.minute;
    }

    const saju2Input: Record<string, unknown> = {
      year: p2.year, month: p2.month, day: p2.day,
      gender: p2.gender === "male" ? "남" : "여",
      calendar: p2.isLunar ? "lunar" : "solar",
      applyLocalMeanTime: true,
      longitude: 126.9784,
    };
    if (has2Hour) {
      saju2Input.hour = p2.hour;
      if (typeof p2.minute === "number") saju2Input.minute = p2.minute;
    }

    const result1 = calculateSaju(saju1Input as Parameters<typeof calculateSaju>[0]);
    const result2 = calculateSaju(saju2Input as Parameters<typeof calculateSaju>[0]);

    const pillars1 = {
      year: result1.pillars?.year ?? "",
      month: result1.pillars?.month ?? "",
      day: result1.pillars?.day ?? "",
      hour: has1Hour ? (result1.pillars?.hour ?? "") : "",
    };
    const pillars2 = {
      year: result2.pillars?.year ?? "",
      month: result2.pillars?.month ?? "",
      day: result2.pillars?.day ?? "",
      hour: has2Hour ? (result2.pillars?.hour ?? "") : "",
    };

    const pillarDetails1 = result1.pillarDetails ?? { year: null, month: null, day: null, hour: null };
    const pillarDetails2 = result2.pillarDetails ?? { year: null, month: null, day: null, hour: null };

    const elements1 = result1.fiveElements ?? {};
    const elements2 = result2.fiveElements ?? {};

    const dayStem1 = pillarDetails1.day?.stem ?? "";
    const dayStem2 = pillarDetails2.day?.stem ?? "";
    const dayBranch1 = pillarDetails1.day?.branch ?? "";
    const dayBranch2 = pillarDetails2.day?.branch ?? "";

    const stemToElement: Record<string, string> = {
      "갑": "wood", "을": "wood", "병": "fire", "정": "fire",
      "무": "earth", "기": "earth", "경": "metal", "신": "metal",
      "임": "water", "계": "water"
    };
    const el1 = stemToElement[dayStem1] ?? "wood";
    const el2 = stemToElement[dayStem2] ?? "wood";

    const hashInput = `${p1.year}-${p1.month}-${p1.day}-${p1.hour ?? "x"}-${p2.year}-${p2.month}-${p2.day}-${p2.hour ?? "x"}`;
    const seed = deterministicHash(hashInput);
    const rng = seededRandom(seed);

    let baseScore = 50;

    if (generating[el1] === el2 || generating[el2] === el1) baseScore += 15;
    if (controlling[el1] === el2 || controlling[el2] === el1) baseScore -= 10;
    if (el1 === el2) baseScore += 5;

    const isHarmony = sixHarmony.some(([a, b]) => (dayBranch1 === a && dayBranch2 === b) || (dayBranch1 === b && dayBranch2 === a));
    const isClash = sixClash.some(([a, b]) => (dayBranch1 === a && dayBranch2 === b) || (dayBranch1 === b && dayBranch2 === a));
    if (isHarmony) baseScore += 12;
    if (isClash) baseScore -= 12;

    if (has1Hour && has2Hour) {
      const hb1 = pillarDetails1.hour?.branch ?? "";
      const hb2 = pillarDetails2.hour?.branch ?? "";
      if (sixHarmony.some(([a, b]) => (hb1 === a && hb2 === b) || (hb1 === b && hb2 === a))) baseScore += 5;
      if (sixClash.some(([a, b]) => (hb1 === a && hb2 === b) || (hb1 === b && hb2 === a))) baseScore -= 5;
    }

    const allElements = ["wood", "fire", "earth", "metal", "water"];
    for (const el of allElements) {
      const v1 = (elements1 as Record<string, number>)[el] ?? 0;
      const v2 = (elements2 as Record<string, number>)[el] ?? 0;
      if (v1 === 0 && v2 >= 2) baseScore += 3;
      if (v2 === 0 && v1 >= 2) baseScore += 3;
    }

    const variation = Math.floor(rng() * 7) - 3;
    baseScore += variation;
    const score = Math.max(20, Math.min(95, baseScore));

    let grade: string;
    let gradeLabel: string;
    let gradeEmoji: string;
    let gradeColor: string;
    if (score >= 80) { grade = "excellent"; gradeLabel = "천생연분"; gradeEmoji = "💕"; gradeColor = "#ec4899"; }
    else if (score >= 65) { grade = "good"; gradeLabel = "좋은 궁합"; gradeEmoji = "😊"; gradeColor = "#22c55e"; }
    else if (score >= 50) { grade = "average"; gradeLabel = "보통 궁합"; gradeEmoji = "🤝"; gradeColor = "#eab308"; }
    else if (score >= 35) { grade = "caution"; gradeLabel = "주의 필요"; gradeEmoji = "⚠️"; gradeColor = "#f97316"; }
    else { grade = "challenging"; gradeLabel = "노력 필요"; gradeEmoji = "💪"; gradeColor = "#ef4444"; }

    const main1 = getMainElement(elements1 as Record<string, number>);
    const main2 = getMainElement(elements2 as Record<string, number>);
    const ddi1 = getDdi(p1.year);
    const ddi2 = getDdi(p2.year);
    const eumyang1 = dayStem1 ? getEumyang(dayStem1) : "양(陽)";
    const eumyang2 = dayStem2 ? getEumyang(dayStem2) : "음(陰)";

    const analysisItems: string[] = [];
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

    if (isHarmony) analysisItems.push("일지가 육합(六合) 관계로, 일상적인 생활에서 조화롭고 편안한 관계가 기대됩니다.");
    if (isClash) analysisItems.push("일지가 충(沖) 관계로, 생활 방식의 차이로 갈등이 생길 수 있습니다. 서로에 대한 이해와 양보가 중요합니다.");

    const complementary: string[] = [];
    for (const el of allElements) {
      const v1 = (elements1 as Record<string, number>)[el] ?? 0;
      const v2 = (elements2 as Record<string, number>)[el] ?? 0;
      if (v1 === 0 && v2 >= 2) complementary.push(`${p1.name ?? "첫째"}에게 부족한 ${elKo[el]}을(를) ${p2.name ?? "둘째"}가 보완해줍니다.`);
      if (v2 === 0 && v1 >= 2) complementary.push(`${p2.name ?? "둘째"}에게 부족한 ${elKo[el]}을(를) ${p1.name ?? "첫째"}가 보완해줍니다.`);
    }
    if (complementary.length > 0) analysisItems.push(...complementary);

    const eumyangMatch = eumyang1 !== eumyang2;
    const eumyangDesc = eumyangMatch
      ? "음양이 조화를 이루어 서로 보완하는 관계입니다."
      : "음양이 같아 비슷한 에너지를 가졌습니다. 서로 다른 역할 분담이 중요합니다.";

    let ohaengRelation: string;
    let ohaengChemistry: string;
    let ohaengStrength: string;
    let ohaengWeakness: string;
    let ohaengTip: string;

    if (generating[el1] === el2 || generating[el2] === el1) {
      ohaengRelation = `${elKo[el1]} - ${elKo[el2]} 상생`;
      ohaengChemistry = "서로의 기운을 살려주는 이상적인 조합";
      ohaengStrength = "자연스럽게 서로를 돕고 성장시킬 수 있습니다";
      ohaengWeakness = "한쪽이 지나치게 의존할 수 있습니다";
      ohaengTip = "균형 있는 관계를 유지하세요";
    } else if (controlling[el1] === el2 || controlling[el2] === el1) {
      ohaengRelation = `${elKo[el1]} - ${elKo[el2]} 상극`;
      ohaengChemistry = "긴장감이 있지만 성장의 원동력이 되는 조합";
      ohaengStrength = "서로 다른 관점으로 시야를 넓혀줍니다";
      ohaengWeakness = "갈등이 잦을 수 있습니다";
      ohaengTip = "상대의 다름을 인정하고 존중하세요";
    } else {
      ohaengRelation = `${elKo[el1]} - ${elKo[el2]} 비화`;
      ohaengChemistry = "비슷한 기운으로 공감대가 큰 조합";
      ohaengStrength = "서로를 잘 이해하고 공감할 수 있습니다";
      ohaengWeakness = "변화나 자극이 부족할 수 있습니다";
      ohaengTip = "함께 새로운 경험을 시도해보세요";
    }

    const ddiTitle = `${ddi1.emoji} ${ddi1.name} - ${ddi2.emoji} ${ddi2.name}`;
    const iljuTitle = `${dayStem1}${dayBranch1}일주 - ${dayStem2}${dayBranch2}일주`;
    const iljuDesc = isHarmony ? "일지가 육합하여 생활의 조화가 기대됩니다." : isClash ? "일지가 충하여 생활 습관 차이에 주의가 필요합니다." : "일지 관계가 평이하여 서로 무난한 관계입니다.";

    const personalityMap: Record<string, { title: string; traits: string[] }> = {
      wood: { title: "성장과 인자함의 기운", traits: ["진취적", "관대함", "창의적", "리더십"] },
      fire: { title: "열정과 예의의 기운", traits: ["열정적", "활발함", "표현력", "사교적"] },
      earth: { title: "안정과 신뢰의 기운", traits: ["신중함", "성실함", "포용력", "안정적"] },
      metal: { title: "결단과 의리의 기운", traits: ["결단력", "정의감", "깔끔함", "원칙적"] },
      water: { title: "지혜와 유연함의 기운", traits: ["지혜로움", "유연함", "적응력", "통찰력"] },
    };

    let ohaengScore = 50;
    if (generating[el1] === el2 || generating[el2] === el1) ohaengScore = 85;
    else if (controlling[el1] === el2 || controlling[el2] === el1) ohaengScore = 35;
    else if (el1 === el2) ohaengScore = 65;

    let iljuScore = 50;
    if (isHarmony) iljuScore = 88;
    if (isClash) iljuScore = 30;

    const eumyangScore = eumyangMatch ? 80 : 45;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const tips: string[] = [];

    if (generating[el1] === el2 || generating[el2] === el1) strengths.push("오행이 상생하여 자연스럽게 서로를 돕습니다");
    if (el1 === el2) strengths.push("같은 오행으로 깊은 공감대를 형성합니다");
    if (isHarmony) strengths.push("일지 육합으로 일상의 조화가 뛰어납니다");
    if (eumyangMatch) strengths.push("음양이 조화로워 균형 잡힌 관계입니다");
    if (complementary.length > 0) strengths.push("부족한 오행을 서로 보완해줍니다");
    if (strengths.length === 0) strengths.push("서로 다른 특성으로 새로운 시각을 제공합니다");

    if (controlling[el1] === el2 || controlling[el2] === el1) weaknesses.push("오행 상극으로 의견 충돌 가능성이 있습니다");
    if (isClash) weaknesses.push("일지 충으로 생활 습관 차이에 갈등이 생길 수 있습니다");
    if (!eumyangMatch) weaknesses.push("같은 음양이라 역할 분담이 필요합니다");
    if (weaknesses.length === 0) weaknesses.push("큰 약점은 없으나 서로에 대한 지속적 관심이 필요합니다");

    tips.push("서로의 장점을 인정하고 칭찬을 아끼지 마세요");
    tips.push("주기적으로 솔직한 대화 시간을 가지세요");
    if (controlling[el1] === el2 || controlling[el2] === el1) tips.push("상대의 다른 관점을 존중하는 연습이 필요합니다");
    if (isClash) tips.push("생활 습관의 차이를 미리 조율하세요");

    const gearAnalysis = [
      { label: "일간 관계", desc: `${dayStem1}(${elKo[el1]}) - ${dayStem2}(${elKo[el2]})`, score: ohaengScore },
      { label: "일지 관계", desc: isHarmony ? "육합(六合) - 조화" : isClash ? "육충(六沖) - 갈등" : "평범한 관계", score: iljuScore },
    ];

    const response = {
      success: true,
      score,
      overallScore: score,
      grade,
      gradeLabel,
      gradeEmoji,
      gradeColor,
      mainAdvice: analysisItems[0] ?? "두 사람의 사주를 종합적으로 분석한 결과입니다.",
      eumyangMatch,
      eumyangDesc,
      ohaengCombo: {
        title: ohaengRelation,
        chemistry: ohaengChemistry,
        strength: ohaengStrength,
        weakness: ohaengWeakness,
        tip: ohaengTip,
      },
      ddiCombo: { title: ddiTitle },
      ilju: { title: iljuTitle, desc: iljuDesc },
      gearAnalysis,
      categories: [
        { name: "오행 궁합", score: ohaengScore },
        { name: "일주 궁합", score: iljuScore },
        { name: "음양 조화", score: eumyangScore },
      ],
      strengths,
      weaknesses,
      tips,
      person1: {
        name: p1.name ?? "첫째",
        gender: p1.gender,
        pillars: pillars1,
        pillarDetails: pillarDetails1,
        hasHour: has1Hour,
        fiveElements: elements1,
        compact: result1.toCompact(),
        mainElement: main1,
        mainElementEmoji: elEmoji[main1] ?? "🌳",
        mainElementColor: elColor[main1] ?? "#22c55e",
        mainElementKo: elKo[main1] ?? "목(木)",
        eumyang: eumyang1,
        ddiEmoji: ddi1.emoji,
        ddi: ddi1.name,
        personality: personalityMap[main1] ?? personalityMap.wood,
      },
      person2: {
        name: p2.name ?? "둘째",
        gender: p2.gender,
        pillars: pillars2,
        pillarDetails: pillarDetails2,
        hasHour: has2Hour,
        fiveElements: elements2,
        compact: result2.toCompact(),
        mainElement: main2,
        mainElementEmoji: elEmoji[main2] ?? "🌳",
        mainElementColor: elColor[main2] ?? "#22c55e",
        mainElementKo: elKo[main2] ?? "목(木)",
        eumyang: eumyang2,
        ddiEmoji: ddi2.emoji,
        ddi: ddi2.name,
        personality: personalityMap[main2] ?? personalityMap.wood,
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
