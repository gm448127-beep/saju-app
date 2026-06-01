import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "ssaju";
import {
  attachRouteLintMeta,
  collectTojeongDisplayFields,
} from "@/lib/unmyeong-route-lint";
import {
  HEXAGRAMS_V3 as HEXAGRAMS,
  M_THEMES_V3 as M_THEMES,
  CAT_TEXT_V3 as CAT_TEXT,
} from "@/lib/tojeong-content-v3";

/* ═══════════════════════════════════════════
   상수 테이블 (오늘의 운세 route.ts와 동일)
   ═══════════════════════════════════════════ */
const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"] as const;
const CHEONGAN_HANJA: Record<string,string> = {갑:"甲",을:"乙",병:"丙",정:"丁",무:"戊",기:"己",경:"庚",신:"辛",임:"壬",계:"癸"};
const JIJI = ["자","축","인","묘","진","사","오","미","신","유","술","해"] as const;
const JIJI_HANJA: Record<string,string> = {자:"子",축:"丑",인:"寅",묘:"卯",진:"辰",사:"巳",오:"午",미:"未",신:"申",유:"酉",술:"戌",해:"亥"};

const GAN_OHAENG: Record<string,string> = {갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수"};
const JI_OHAENG: Record<string,string> = {자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수"};
const OHAENG_EMOJI: Record<string,string> = {목:"🌳",화:"🔥",토:"🏔️",금:"⚔️",수:"💧"};
const DDI = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];

/* ─── 십성 판정 (오늘의 운세와 동일) ─── */
const SAENG_CYCLE: Record<string,string> = {목:"화",화:"토",토:"금",금:"수",수:"목"};
const GEUK_CYCLE: Record<string,string> = {목:"토",화:"금",토:"수",금:"목",수:"화"};
const SAENG_BY: Record<string,string> = {목:"수",화:"목",토:"화",금:"토",수:"금"};
const GEUK_BY: Record<string,string> = {목:"금",화:"수",토:"목",금:"화",수:"토"};

function getSipsin(myOh: string, targetOh: string, sameYY: boolean): string {
  if (myOh === targetOh) return sameYY ? "비견" : "겁재";
  if (SAENG_CYCLE[myOh] === targetOh) return sameYY ? "식신" : "상관";
  if (GEUK_CYCLE[myOh] === targetOh) return sameYY ? "편재" : "정재";
  if (GEUK_BY[myOh] === targetOh) return sameYY ? "편관" : "정관";
  if (SAENG_BY[myOh] === targetOh) return sameYY ? "편인" : "정인";
  return "비견";
}

/* ─── 지지 합충형 (오늘의 운세와 동일) ─── */
const YUKCHUNG: [string,string][] = [["자","오"],["축","미"],["인","신"],["묘","유"],["진","술"],["사","해"]];
const YUKHAP: [string,string,string][] = [["자","축","토"],["인","해","목"],["묘","술","화"],["진","유","금"],["사","신","수"],["오","미","화"]];
const SAMHAP: [string,string,string,string][] = [["신","자","진","수"],["해","묘","미","목"],["인","오","술","화"],["사","유","축","금"]];
const HYUNG: [string,string][] = [["인","사"],["사","신"],["신","인"],["축","술"],["술","미"],["미","축"],["자","묘"],["진","진"],["오","오"],["유","유"],["해","해"]];
const HAE_LIST: [string,string][] = [["자","미"],["축","오"],["인","사"],["묘","진"],["신","해"],["유","술"]];

function findBranchRelation(a: string, b: string): { type: string; score: number; desc: string } | null {
  for (const [x, y] of YUKCHUNG) {
    if ((a === x && b === y) || (a === y && b === x))
      return { type: "육충", score: -10, desc: `${a}${JIJI_HANJA[a]}-${b}${JIJI_HANJA[b]} 육충 → 변동·충돌 ⬇⬇` };
  }
  for (const [x, y, r] of YUKHAP) {
    if ((a === x && b === y) || (a === y && b === x))
      return { type: "육합", score: 8, desc: `${a}${JIJI_HANJA[a]}-${b}${JIJI_HANJA[b]} 육합(→${r}) → 조화·화합 ⬆` };
  }
  for (const [x, y, z, r] of SAMHAP) {
    if (([x,y,z].includes(a) && [x,y,z].includes(b)) && a !== b)
      return { type: "삼합", score: 6, desc: `${a}${JIJI_HANJA[a]}-${b}${JIJI_HANJA[b]} 삼합(→${r}) → 협력 에너지 ⬆` };
  }
  for (const [x, y] of HYUNG) {
    if (x === y && a === x && b === x)
      return { type: "자형", score: -5, desc: `${a}${JIJI_HANJA[a]}-${b}${JIJI_HANJA[b]} 자형 → 자기 갈등 ⬇` };
    if (x !== y && ((a === x && b === y) || (a === y && b === x)))
      return { type: "형", score: -7, desc: `${a}${JIJI_HANJA[a]}-${b}${JIJI_HANJA[b]} 형(刑) → 시련·갈등 ⬇` };
  }
  for (const [x, y] of HAE_LIST) {
    if ((a === x && b === y) || (a === y && b === x))
      return { type: "해", score: -4, desc: `${a}${JIJI_HANJA[a]}-${b}${JIJI_HANJA[b]} 해(害) → 은근한 방해 ⬇` };
  }
  return null;
}

/* ─── 천간합·충 ─── */
const CHUNGAN_HAP: [string,string,string][] = [["갑","기","토"],["을","경","금"],["병","신","수"],["정","임","목"],["무","계","화"]];
const CHUNGAN_CHUNG: [string,string][] = [["갑","경"],["을","신"],["병","임"],["정","계"]];

function findStemRelation(a: string, b: string): { type: string; score: number; desc: string } | null {
  for (const [x, y, r] of CHUNGAN_HAP) {
    if ((a === x && b === y) || (a === y && b === x))
      return { type: "천간합", score: 8, desc: `${a}${CHEONGAN_HANJA[a]}-${b}${CHEONGAN_HANJA[b]} 천간합(→${r}) → 귀인·협력 ⬆` };
  }
  for (const [x, y] of CHUNGAN_CHUNG) {
    if ((a === x && b === y) || (a === y && b === x))
      return { type: "천간충", score: -7, desc: `${a}${CHEONGAN_HANJA[a]}-${b}${CHEONGAN_HANJA[b]} 천간충 → 외부 갈등 ⬇` };
  }
  return null;
}

/* ─── 삼재 테이블 ─── */
const SAMJAE_TABLE: Record<string, string[]> = {
  신:["인","묘","진"], 자:["인","묘","진"], 진:["인","묘","진"],
  해:["사","오","미"], 묘:["사","오","미"], 미:["사","오","미"],
  인:["신","유","술"], 오:["신","유","술"], 술:["신","유","술"],
  사:["해","자","축"], 유:["해","자","축"], 축:["해","자","축"],
};

/* ─── 결정론적 시드 난수 ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

/* ─── 2026 세운 & 월간지 ─── */
const SEYUN_GAN = "병";
const SEYUN_JI = "오";
const SEYUN_GAN_OH = "화";
const SEYUN_JI_OH = "화";
const SEYUN_GAN_IDX = 2; // 병 = index 2

// 2026 병오년 월간지 (1월=경인 ~ 12월=신축)
const MONTHLY_2026: { gan: string; ji: string }[] = [
  {gan:"경",ji:"인"},{gan:"신",ji:"묘"},{gan:"임",ji:"진"},{gan:"계",ji:"사"},
  {gan:"갑",ji:"오"},{gan:"을",ji:"미"},{gan:"병",ji:"신"},{gan:"정",ji:"유"},
  {gan:"무",ji:"술"},{gan:"기",ji:"해"},{gan:"경",ji:"자"},{gan:"신",ji:"축"},
];

/* ─── 십성별 점수 가중치 ─── */
const SIPSIN_BASE: Record<string,{wealth:number,health:number,love:number,career:number,study:number}> = {
  "비견":  {wealth:50,health:60,love:50,career:50,study:55},
  "겁재":  {wealth:35,health:50,love:40,career:45,study:45},
  "식신":  {wealth:70,health:80,love:75,career:65,study:75},
  "상관":  {wealth:65,health:55,love:50,career:60,study:60},
  "편재":  {wealth:80,health:60,love:65,career:70,study:55},
  "정재":  {wealth:75,health:65,love:70,career:72,study:60},
  "편관":  {wealth:50,health:45,love:45,career:65,study:58},
  "정관":  {wealth:60,health:62,love:65,career:78,study:70},
  "편인":  {wealth:55,health:55,love:55,career:58,study:72},
  "정인":  {wealth:58,health:70,love:68,career:70,study:82},
};

/* ─── 30괘·월별·카테고리: @/lib/tojeong-content-v3 ─── */
/* ═══════════════════════════════════════════
   POST 핸들러
   ═══════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute, isLunar, gender } = body;

    if (!year || !month || !day) {
      return NextResponse.json({ error: "생년월일을 입력해주세요." }, { status: 400 });
    }

    const y = +year, m = +month, d = +day;
    const currentYear = new Date().getFullYear();
    const age = currentYear - y;
    const hasHour = hour !== undefined && hour !== null && hour !== "";
    const hasMinute = minute !== undefined && minute !== null && minute !== "";

    /* ═══ 1) ssaju로 정확한 사주 계산 (오늘의 운세와 동일) ═══ */
    const myCalc = calculateSaju({
      year: y, month: m, day: d,
      hour: hasHour ? +hour : 12,
      ...(hasMinute ? { minute: +minute } : {}),
      gender: gender === "여" ? "여" : "남",
      calendar: isLunar ? "lunar" : "solar",
      timezone: "Asia/Seoul",
      applyLocalMeanTime: true,
    });

    const myStems = [
      myCalc.pillarDetails.year.stemKo,
      myCalc.pillarDetails.month.stemKo,
      myCalc.pillarDetails.day.stemKo,
      myCalc.pillarDetails.hour.stemKo,
    ];
    const myBranches = [
      myCalc.pillarDetails.year.branchKo,
      myCalc.pillarDetails.month.branchKo,
      myCalc.pillarDetails.day.branchKo,
      myCalc.pillarDetails.hour.branchKo,
    ];

    const dayGan = myStems[2];
    const dayGanOh = GAN_OHAENG[dayGan];
    const dayGanIdx = CHEONGAN.indexOf(dayGan) as number;
    const yearJiKo = myBranches[0];
    const yearJiIdx = JIJI.indexOf(yearJiKo) as number;
    const yearGanKo = myStems[0];
    const yearGanIdx = CHEONGAN.indexOf(yearGanKo) as number;

    /* ═══ 2) 기본 정보 ═══ */
    const yearGanji = `${CHEONGAN_HANJA[yearGanKo]}${JIJI_HANJA[yearJiKo]}(${yearGanKo}${yearJiKo})`;
    const ddi = DDI[yearJiIdx];

    const pillarsDisplay = {
      year:  `${myStems[0]}${CHEONGAN_HANJA[myStems[0]]}${myBranches[0]}${JIJI_HANJA[myBranches[0]]}`,
      month: `${myStems[1]}${CHEONGAN_HANJA[myStems[1]]}${myBranches[1]}${JIJI_HANJA[myBranches[1]]}`,
      day:   `${myStems[2]}${CHEONGAN_HANJA[myStems[2]]}${myBranches[2]}${JIJI_HANJA[myBranches[2]]}`,
      hour:  hasHour
        ? `${myStems[3]}${CHEONGAN_HANJA[myStems[3]]}${myBranches[3]}${JIJI_HANJA[myBranches[3]]}`
        : "미입력",
    };

    /* ═══ 3) 토정비결 괘 계산 ═══ */
    const taesu = (yearGanIdx + yearJiIdx + y) % 10 + 1;
    const wolgeon = (m * 3 + d) % 12 + 1;
    const iljin = (d * 2 + m) % 8 + 1;
    const totalGwae = ((taesu + wolgeon + iljin - 1) % 30) + 1;
    const hex = HEXAGRAMS[totalGwae] || HEXAGRAMS[1];

    /* ═══ 4) 세운 십성 (내 일간 vs 2026 병) ═══ */
    const seyunSameYY = (dayGanIdx % 2) === (SEYUN_GAN_IDX % 2);
    const seyunSipsin = getSipsin(dayGanOh, SEYUN_GAN_OH, seyunSameYY);

    const sipsinScore: Record<string,number> = {
      비견:0, 겁재:-5, 식신:6, 상관:-2, 편재:4, 정재:7, 편관:-4, 정관:4, 편인:2, 정인:6,
    };
    const seyunBonus = sipsinScore[seyunSipsin] ?? 0;

    /* ═══ 5) 원국 4지지 vs 세운 지지(오) ═══ */
    let branchBonus = 0;
    const branchDescs: string[] = [];
    const labels = ["년지","월지","일지","시지"];
    for (let i = 0; i < 4; i++) {
      if (!hasHour && i === 3) continue;
      const rel = findBranchRelation(myBranches[i], SEYUN_JI);
      if (rel) {
        branchBonus += rel.score;
        branchDescs.push(`[흐름 3-${i+1}] 내 ${labels[i]}(${myBranches[i]}${JIJI_HANJA[myBranches[i]]}) × 세운(${SEYUN_JI}${JIJI_HANJA[SEYUN_JI]}) = ${rel.type} → ${rel.desc}`);
      }
    }

    /* ═══ 6) 원국 천간 vs 세운 천간(병) ═══ */
    let stemBonus = 0;
    const stemDescs: string[] = [];
    const sLabels = ["년간","월간","시간"];
    const sIdxs = [0, 1, 3];
    for (let i = 0; i < sIdxs.length; i++) {
      if (!hasHour && sIdxs[i] === 3) continue;
      const rel = findStemRelation(myStems[sIdxs[i]], SEYUN_GAN);
      if (rel) {
        stemBonus += rel.score;
        stemDescs.push(`[흐름 4] 내 ${sLabels[i]}(${myStems[sIdxs[i]]}${CHEONGAN_HANJA[myStems[sIdxs[i]]]}) × 세운(${SEYUN_GAN}${CHEONGAN_HANJA[SEYUN_GAN]}) = ${rel.desc}`);
      }
    }

    /* ═══ 7) 삼재 체크 ═══ */
    const samjaeYears = SAMJAE_TABLE[yearJiKo] || [];
    const samjaeActive = samjaeYears.includes(SEYUN_JI);
    const samjaeIdx = samjaeYears.indexOf(SEYUN_JI);
    const samjaeTypes = ["들삼재","눌삼재","날삼재"];
    const samjaeBonus = samjaeActive ? (samjaeIdx === 1 ? -8 : -5) : 0;
    const samjae = {
      active: samjaeActive,
      type: samjaeActive ? samjaeTypes[samjaeIdx] : "",
      description: samjaeActive
        ? `${yearJiKo}띠 2026년은 '${samjaeTypes[samjaeIdx]}'에 해당합니다. ${samjaeIdx === 1 ? "몸·돈·일정을 먼저 정리하는 해예요. 고정비·수면·검증 없는 지출을 줄이면 편해져요." : samjaeIdx === 0 ? "삼재가 시작되는 해로, 큰 전환보다 확인·정리를 먼저 두는 편이 좋아요." : "삼재가 끝나가는 해로, 미뤄둔 정리를 하나씩 끝내면 리듬이 돌아오기 쉬워요."}`
        : `${yearJiKo}띠는 2026년 삼재에 해당하지 않습니다.`,
    };

    /* ═══ 8) 기운의 상호작용 분석 텍스트 ═══ */
    // 세운 지지(午)의 지장간 정기 = 丁(정화)
    const seyunJiJeonggi = "정";
    const seyunJiJeonggiOh = GAN_OHAENG[seyunJiJeonggi]; // 화
    const seyunJiSameYY = (dayGanIdx % 2) === (CHEONGAN.indexOf(seyunJiJeonggi) % 2);
    const seyunJiSipsin = getSipsin(dayGanOh, seyunJiJeonggiOh, seyunJiSameYY);

    const gearAnalysis: string[] = [
      `⚙️ [흐름 1] 내 일간 ${dayGan}${CHEONGAN_HANJA[dayGan]}(${dayGanOh}) × 세운 천간 ${SEYUN_GAN}${CHEONGAN_HANJA[SEYUN_GAN]}(${SEYUN_GAN_OH}) = ${seyunSipsin} ${seyunBonus > 0 ? "⬆" : seyunBonus < 0 ? "⬇" : ""} (${seyunBonus > 0 ? "+" : ""}${seyunBonus}점)`,
      `⚙️ [흐름 2] 내 일간 ${dayGan}${CHEONGAN_HANJA[dayGan]}(${dayGanOh}) × 세운 지지 ${SEYUN_JI}${JIJI_HANJA[SEYUN_JI]}(정기 ${seyunJiJeonggi}${CHEONGAN_HANJA[seyunJiJeonggi]}·${seyunJiJeonggiOh}) = ${seyunJiSipsin}`,
      ...branchDescs.map(d => `⚙️ ${d}`),
      ...stemDescs.map(d => `⚙️ ${d}`),
    ];
    if (branchDescs.length === 0 && stemDescs.length === 0) {
      gearAnalysis.push("⚙️ [흐름 3-4] 원국과 세운 사이 특별한 합충형 없음 → 평온한 흐름");
    }
    if (samjaeActive) {
      gearAnalysis.push(`⚙️ [삼재] ${samjae.type} 해당 → ${samjaeIdx === 1 ? "가장 주의 필요 ⬇⬇" : "주의 필요 ⬇"} (${samjaeBonus}점)`);
    }
    if (!hasHour) {
      gearAnalysis.push("⚙️ [흐름 5] 시주 미입력 → 시간을 입력하면 더 정밀한 분석이 가능합니다");
    }

    /* ═══ 9) 최종 점수 계산 (결정론적) ═══ */
    const totalBonus = hex.baseBonus + seyunBonus + Math.round(branchBonus * 0.7) + Math.round(stemBonus * 0.7) + samjaeBonus;

    const seed = y * 10000 + m * 100 + d + (hasHour ? (+hour) * 31 : 0) + totalGwae * 7;
    const rng = seededRandom(seed);
    const jit = () => Math.round((rng() - 0.5) * 8);
    const clamp = (v: number) => Math.max(15, Math.min(95, v));

    const baseOh = SIPSIN_BASE[seyunSipsin] || SIPSIN_BASE["비견"];
    const overallBase = Math.round((baseOh.wealth + baseOh.health + baseOh.love + baseOh.career + baseOh.study) / 5);

    const overallScore = clamp(overallBase + totalBonus + jit());

    let grade = "C", gradeColor = "#6b7280", gradeEmoji = "😐";
    if (overallScore >= 85) { grade = "SSS"; gradeColor = "#FFD700"; gradeEmoji = "👑"; }
    else if (overallScore >= 78) { grade = "SS"; gradeColor = "#FF6B35"; gradeEmoji = "🌟"; }
    else if (overallScore >= 70) { grade = "S"; gradeColor = "#a855f7"; gradeEmoji = "⭐"; }
    else if (overallScore >= 62) { grade = "A"; gradeColor = "#3b82f6"; gradeEmoji = "😊"; }
    else if (overallScore >= 52) { grade = "B"; gradeColor = "#22c55e"; gradeEmoji = "🙂"; }
    else if (overallScore >= 40) { grade = "C"; gradeColor = "#6b7280"; gradeEmoji = "🌤️"; }
    else { grade = "D"; gradeColor = "#ef4444"; gradeEmoji = "😰"; }

    /* ═══ 10) 카테고리별 점수 (결정론적) ═══ */
    const catDefs = [
      { key: "재물", label: "재물운", emoji: "💰", field: "wealth" as const },
      { key: "건강", label: "건강운", emoji: "💪", field: "health" as const },
      { key: "애정", label: "애정운", emoji: "💕", field: "love" as const },
      { key: "직업", label: "직업운", emoji: "💼", field: "career" as const },
      { key: "학업", label: "학업운", emoji: "📚", field: "study" as const },
    ];
    const categories = catDefs.map(cat => {
      const score = clamp(baseOh[cat.field] + totalBonus + jit());
      const detail = CAT_TEXT[cat.key];
      return {
        label: cat.label, emoji: cat.emoji, score,
        description: score >= 55 ? detail.high : detail.low,
        tip: detail.tip,
      };
    });

    /* ═══ 11) 월별 운세 (월간지 기반 + 결정론적) ═══ */
    const monthlyFortunes = Array.from({ length: 12 }, (_, i) => {
      const mg = MONTHLY_2026[i];
      const mgOh = GAN_OHAENG[mg.gan];
      const mgIdx = CHEONGAN.indexOf(mg.gan);
      const mgSameYY = (dayGanIdx % 2) === (mgIdx % 2);
      const mSipsin = getSipsin(dayGanOh, mgOh, mgSameYY);
      const mSipBonus = sipsinScore[mSipsin] ?? 0;

      const dayJi = myBranches[2];
      const mBrRel = findBranchRelation(dayJi, mg.ji);
      const mBrBonus = mBrRel ? Math.round(mBrRel.score * 0.5) : 0;

      const score = clamp(overallBase + totalBonus + mSipBonus + mBrBonus + jit());

      let gearNote = `${i+1}월 월간(${mg.gan}${CHEONGAN_HANJA[mg.gan]}) → 내 일간과 ${mSipsin} 관계`;
      if (mBrRel) gearNote += ` / 월지(${mg.ji}${JIJI_HANJA[mg.ji]}) → ${mBrRel.type}`;

      return {
        month: i + 1,
        label: `${i + 1}월`,
        emoji: M_EMOJI[i],
        score,
        theme: M_THEMES[i].theme,
        description: M_THEMES[i].desc,
        gearNote,
      };
    });

    /* ═══ 12) 심화 해석 (있으면) ═══ */
    let deepContent: string | null = null;
    try {
      const { getInterpretation } = require("@/data/interpretations");
      const interp = getInterpretation(dayGan, 2026);
      if (interp) deepContent = interp.content || null;
    } catch { /* ignore */ }

    /* ═══ 13) 응답 ═══ */
    const payload = {
      birthDate: `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
      age,
      yearGanji,
      ddi,
      myElement: dayGanOh,
      myElementEmoji: OHAENG_EMOJI[dayGanOh] || "❓",
      pillars: pillarsDisplay,
      hasHour,
      dayGan,
      taesu, wolgeon, iljin, totalGwae,
      hexagram: hex.name,
      hexagramHanja: hex.hanja,
      grade, gradeColor, gradeEmoji,
      poem: hex.poem,
      meaning: hex.meaning,
      summary: hex.summary,
      advice: hex.advice,
      caution: hex.caution,
      samjae,
      gearAnalysis,
      deepContent,
      categories,
      monthlyFortunes,
    };

    return NextResponse.json(
      attachRouteLintMeta(
        payload,
        "tojeong",
        collectTojeongDisplayFields(payload),
      ),
    );
  } catch (error: any) {
    console.error("토정비결 오류:", error);
    return NextResponse.json(
      { error: "토정비결 계산 중 오류: " + (error?.message || "알 수 없는 오류") },
      { status: 500 }
    );
  }
}
