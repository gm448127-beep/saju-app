// src/app/api/today/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getLandingCorsHeaders } from "@/lib/api-cors";
import { calculateSaju, type SajuInput } from "ssaju";
import { matchCharacter } from "@/data/matchCharacter";
import { HOURLY_FLOW_INTRO, SCORE_LABEL_DESC, SIJIN_META } from "@/data/sijinDict";
import { SIPSIN_DICT } from "@/data/wisdomDict";
import { buildSajuTriggers, triggersToLegacyLines } from "@/lib/saju-triggers";
import {
  formatKstDateLabel,
  getKstDateParts,
  getTodayDateKeyKst,
  kstDateAnchor,
} from "@/lib/kst-date";
import { buildDailyFortuneContent } from "@/lib/today-content-engine";
import { resolveTodaySecretaryCopy } from "@/lib/today-secretary-copy-engine";
import { computeOhaengCountFromPillars } from "@/lib/today-tone-engine";
import {
  attachRouteLintMeta,
  collectTodayDisplayFields,
} from "@/lib/unmyeong-route-lint";
import {
  SIPSIN_RELATION_V3 as SIPSIN_RELATION,
  SIPSIN_DETAIL_V3 as SIPSIN_DETAIL,
  TIPS_V3 as TIPS,
  WARNINGS_V3 as WARNINGS,
  TIME_ADVICE_V3_MAP as TIME_ADVICE,
  TODAY_DOS_V3 as TODAY_DOS,
  TODAY_DONTS_V3 as TODAY_DONTS,
  DO_DETAIL_V3 as DO_DETAIL,
  DONT_DETAIL_V3 as DONT_DETAIL,
} from "@/lib/today-sipsin-copy-v3";

/* ─── 상수 정의 ─── */
const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"] as const;
const CHEONGAN_HANJA: Record<string,string> = {갑:"甲",을:"乙",병:"丙",정:"丁",무:"戊",기:"己",경:"庚",신:"辛",임:"壬",계:"癸"};
const JIJI = ["자","축","인","묘","진","사","오","미","신","유","술","해"] as const;
const JIJI_HANJA: Record<string,string> = {자:"子",축:"丑",인:"寅",묘:"卯",진:"辰",사:"巳",오:"午",미:"未",신:"申",유:"酉",술:"戌",해:"亥"};

const GAN_OHAENG: Record<string,string> = {갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수"};
const JI_OHAENG: Record<string,string> = {자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수"};
const OHAENG_EMOJI: Record<string,string> = {목:"🌳",화:"🔥",토:"🏔️",금:"⚔️",수:"💧"};

function cheonganIndex(stem: string) {
  return CHEONGAN.indexOf(stem as (typeof CHEONGAN)[number]);
}

function jijiIndex(branch: string) {
  return JIJI.indexOf(branch as (typeof JIJI)[number]);
}

/* ─── 십성 판정 ─── */
const SAENG_CYCLE: Record<string,string> = {목:"화",화:"토",토:"금",금:"수",수:"목"};
const GEUK_CYCLE: Record<string,string> = {목:"토",화:"금",토:"수",금:"목",수:"화"};
const SAENG_BY: Record<string,string> = {목:"수",화:"목",토:"화",금:"토",수:"금"};
const GEUK_BY: Record<string,string> = {목:"금",화:"수",토:"목",금:"화",수:"토"};

function getSipsin(myOhaeng: string, targetOhaeng: string, sameYinYang: boolean): string {
  if (myOhaeng === targetOhaeng) return sameYinYang ? "비견" : "겁재";
  if (SAENG_CYCLE[myOhaeng] === targetOhaeng) return sameYinYang ? "식신" : "상관";
  if (GEUK_CYCLE[myOhaeng] === targetOhaeng) return sameYinYang ? "편재" : "정재";
  if (GEUK_BY[myOhaeng] === targetOhaeng) return sameYinYang ? "편관" : "정관";
  if (SAENG_BY[myOhaeng] === targetOhaeng) return sameYinYang ? "편인" : "정인";
  return "비견";
}

/* ─── 지지 합·충·형·해·파 판정 ─── */
const YUKCHUNG: [string,string][] = [["자","오"],["축","미"],["인","신"],["묘","유"],["진","술"],["사","해"]];
const YUKHAP: [string,string,string][] = [["자","축","토"],["인","해","목"],["묘","술","화"],["진","유","금"],["사","신","수"],["오","미","화"]];
const SAMHAP: [string,string,string,string][] = [["신","자","진","수"],["해","묘","미","목"],["인","오","술","화"],["사","유","축","금"]];
const BANGHAP: [string,string,string,string][] = [["인","묘","진","목"],["사","오","미","화"],["신","유","술","금"],["해","자","축","수"]];
const HYUNG: [string,string][] = [["인","사"],["사","신"],["신","인"],["축","술"],["술","미"],["미","축"],["자","묘"],["진","진"],["오","오"],["유","유"],["해","해"]];
const HAE_LIST: [string,string][] = [["자","미"],["축","오"],["인","사"],["묘","진"],["신","해"],["유","술"]];
const PA_LIST: [string,string][] = [["자","유"],["축","진"],["인","해"],["묘","오"],["사","신"],["미","술"]];

interface JijiRelation {
  type: string;
  branches: string[];
  result?: string;
}

function findJijiRelations(myBranches: string[], targetBranch: string): JijiRelation[] {
  const relations: JijiRelation[] = [];

  for (const mb of myBranches) {
    for (const [a, b] of YUKCHUNG) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "육충", branches: [mb, targetBranch] });
      }
    }
    for (const [a, b, result] of YUKHAP) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "육합", branches: [mb, targetBranch], result });
      }
    }
    for (const [a, b] of HYUNG) {
      if (a === b && mb === a && targetBranch === a) {
        relations.push({ type: "자형", branches: [mb, targetBranch] });
      } else if (a !== b && ((mb === a && targetBranch === b) || (mb === b && targetBranch === a))) {
        relations.push({ type: "형", branches: [mb, targetBranch] });
      }
    }
    for (const [a, b] of HAE_LIST) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "해", branches: [mb, targetBranch] });
      }
    }
    for (const [a, b] of PA_LIST) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "파", branches: [mb, targetBranch] });
      }
    }
  }

  for (const [a, b, c, result] of SAMHAP) {
    const trio = [a, b, c];
    if (trio.includes(targetBranch)) {
      const needed = trio.filter(x => x !== targetBranch);
      if (needed.every(n => myBranches.includes(n))) {
        relations.push({ type: "삼합", branches: trio, result });
      }
    }
  }

  for (const [a, b, c, result] of BANGHAP) {
    const trio = [a, b, c];
    if (trio.includes(targetBranch)) {
      const needed = trio.filter(x => x !== targetBranch);
      if (needed.every(n => myBranches.includes(n))) {
        relations.push({ type: "방합", branches: trio, result });
      }
    }
  }

  return relations;
}

/* ─── 천간 합·충 판정 ─── */
const CHUNGAN_HAP: [string,string,string][] = [["갑","기","토"],["을","경","금"],["병","신","수"],["정","임","목"],["무","계","화"]];
const CHUNGAN_CHUNG: [string,string][] = [["갑","경"],["을","신"],["병","임"],["정","계"],["무","갑"]];

interface CheonganRelation {
  type: string;
  stems: string[];
  result?: string;
}

function findCheonganRelations(myStems: string[], targetStem: string): CheonganRelation[] {
  const relations: CheonganRelation[] = [];
  for (const ms of myStems) {
    for (const [a, b, result] of CHUNGAN_HAP) {
      if ((ms === a && targetStem === b) || (ms === b && targetStem === a)) {
        relations.push({ type: "천간합", stems: [ms, targetStem], result });
      }
    }
    for (const [a, b] of CHUNGAN_CHUNG) {
      if ((ms === a && targetStem === b) || (ms === b && targetStem === a)) {
        relations.push({ type: "천간충", stems: [ms, targetStem] });
      }
    }
  }
  return relations;
}

/* ─── 시드 기반 결정론적 난수 ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── 십성별 운세 기본 점수 ─── */
const SIPSIN_SCORE: Record<string,{base:number,wealth:number,love:number,career:number,health:number,luck:number}> = {
  "비견":  {base:60,wealth:50,love:55,career:55,health:65,luck:55},
  "겁재":  {base:50,wealth:40,love:45,career:50,health:55,luck:45},
  "식신":  {base:80,wealth:75,love:80,career:70,health:85,luck:80},
  "상관":  {base:65,wealth:70,love:55,career:65,health:60,luck:60},
  "편재":  {base:75,wealth:85,love:70,career:75,health:65,luck:75},
  "정재":  {base:78,wealth:80,love:75,career:78,health:70,luck:72},
  "편관":  {base:55,wealth:55,love:50,career:70,health:50,luck:50},
  "정관":  {base:72,wealth:65,love:70,career:80,health:68,luck:70},
  "편인":  {base:62,wealth:55,love:58,career:60,health:58,luck:60},
  "정인":  {base:75,wealth:60,love:72,career:75,health:75,luck:73},
};

/* ─── 합충형에 따른 점수 보정 ─── */
function getRelationBonus(relations: JijiRelation[], cheonganRels: CheonganRelation[]): {bonus:number, desc:string[]} {
  let bonus = 0;
  const desc: string[] = [];

  for (const r of relations) {
    switch (r.type) {
      case "육합":
        bonus += 8;
        desc.push(`${r.branches[0]}${JIJI_HANJA[r.branches[0]]}-${r.branches[1]}${JIJI_HANJA[r.branches[1]]} 육합(${r.result}) → 조화·화합의 기운 ⬆`);
        break;
      case "삼합":
        bonus += 12;
        desc.push(`${r.branches.map(b=>`${b}${JIJI_HANJA[b]}`).join("-")} 삼합(${r.result}) → 강력한 결합의 기운 ⬆⬆`);
        break;
      case "방합":
        bonus += 10;
        desc.push(`${r.branches.map(b=>`${b}${JIJI_HANJA[b]}`).join("-")} 방합(${r.result}) → 강한 오행 결집 ⬆`);
        break;
      case "육충":
        bonus -= 12;
        desc.push(`${r.branches[0]}${JIJI_HANJA[r.branches[0]]}-${r.branches[1]}${JIJI_HANJA[r.branches[1]]} 육충 → 변동·충돌 주의 ⬇⬇`);
        break;
      case "형":
        bonus -= 8;
        desc.push(`${r.branches[0]}${JIJI_HANJA[r.branches[0]]}-${r.branches[1]}${JIJI_HANJA[r.branches[1]]} 형(刑) → 마찰·시비 주의 ⬇`);
        break;
      case "자형":
        bonus -= 6;
        desc.push(`${r.branches[0]}${JIJI_HANJA[r.branches[0]]}-${r.branches[1]}${JIJI_HANJA[r.branches[1]]} 자형(自刑) → 자기반복·집착 주의 ⬇`);
        break;
      case "해":
        bonus -= 5;
        desc.push(`${r.branches[0]}${JIJI_HANJA[r.branches[0]]}-${r.branches[1]}${JIJI_HANJA[r.branches[1]]} 해(害) → 은근한 갈등 주의`);
        break;
      case "파":
        bonus -= 4;
        desc.push(`${r.branches[0]}${JIJI_HANJA[r.branches[0]]}-${r.branches[1]}${JIJI_HANJA[r.branches[1]]} 파(破) → 소소한 방해 주의`);
        break;
    }
  }

  for (const r of cheonganRels) {
    switch (r.type) {
      case "천간합":
        bonus += 10;
        desc.push(`${r.stems[0]}${CHEONGAN_HANJA[r.stems[0]]}-${r.stems[1]}${CHEONGAN_HANJA[r.stems[1]]} 천간합(${r.result}) → 귀인·협력의 기운 ⬆`);
        break;
      case "천간충":
        bonus -= 8;
        desc.push(`${r.stems[0]}${CHEONGAN_HANJA[r.stems[0]]}-${r.stems[1]}${CHEONGAN_HANJA[r.stems[1]]} 천간충 → 외부 갈등 주의 ⬇`);
        break;
    }
  }

  return { bonus, desc };
}

/* ─── 사주 입력 빌더 (사주 API와 동일 옵션) ─── */
function buildSajuInput(
  year: number,
  month: number,
  day: number,
  opts: { gender?: string; isLunar?: boolean; leap?: boolean; hour?: number; minute?: number }
): SajuInput {
  const input: SajuInput = {
    year,
    month,
    day,
    gender: opts.gender === "여" ? "여" : "남",
    calendar: opts.isLunar ? "lunar" : "solar",
    ...(opts.leap ? { leap: true } : {}),
    timezone: "Asia/Seoul",
    applyLocalMeanTime: true,
    longitude: 126.9784,
  };
  if (opts.hour !== undefined && opts.hour !== null) {
    input.hour = Number(opts.hour);
    input.minute =
      opts.minute !== undefined && opts.minute !== null
        ? Number(opts.minute)
        : 0;
  }
  return input;
}

/* ─── 세운(올해 연주) 반영 ─── */
function getSeyunEffect(
  myOhaeng: string,
  myGanIdx: number,
  refYear: number,
  refMonth: number,
  refDay: number
): { bonus: number; desc: string; seyunGan: string; seyunJi: string; seyunSipsin: string } {
  const seyunCalc = calculateSaju(
    buildSajuInput(refYear, refMonth, refDay, { gender: "남" })
  );
  const seyunGan = seyunCalc.pillarDetails.year.stemKo;
  const seyunJi = seyunCalc.pillarDetails.year.branchKo;
  const seyunGanOh = GAN_OHAENG[seyunGan];
  const seyunGanIdx = cheonganIndex(seyunGan);
  const sameYY = (myGanIdx % 2) === (seyunGanIdx % 2);
  const sipsin = getSipsin(myOhaeng, seyunGanOh, sameYY);

  let bonus = 0;
  let desc = `올해 ${seyunGan}${CHEONGAN_HANJA[seyunGan]}${seyunJi}${JIJI_HANJA[seyunJi]}(${seyunGan}${seyunJi})년은 나에게 [${sipsin}]의 해 → `;

  switch (sipsin) {
    case "식신": case "정재": case "정관": case "정인":
      bonus = 5; desc += "일·돈·관계에서 리듬을 맞추기 쉬운 해"; break;
    case "편재": case "편인":
      bonus = 3; desc += "변화 속 기회가 있는 해"; break;
    case "비견":
      bonus = 0; desc += "경쟁과 협력이 공존하는 해"; break;
    case "상관":
      bonus = -2; desc += "재능은 빛나지만 구설·변동 주의"; break;
    case "겁재":
      bonus = -4; desc += "재물 손실·경쟁 과열 주의"; break;
    case "편관":
      bonus = -3; desc += "압박·스트레스 있지만 성장 기회"; break;
    default:
      bonus = 0; desc += "평온한 흐름"; break;
  }

  return { bonus, desc, seyunGan, seyunJi, seyunSipsin: sipsin };
}

/* ─── 오행별 행운 아이템 ─── */
const LUCKY_MAP: Record<string,{color:string,number:string,direction:string,food:string,place:string,time:string}> = {
  "목": {color:"🟢 초록",number:"3, 8",direction:"동쪽",food:"신맛 (식초, 레몬)",place:"숲, 공원",time:"05~09시"},
  "화": {color:"🔴 빨강",number:"2, 7",direction:"남쪽",food:"쓴맛 (커피, 녹차)",place:"높은 곳, 전망대",time:"09~13시"},
  "토": {color:"🟡 노랑",number:"5, 10",direction:"중앙",food:"단맛 (꿀, 고구마)",place:"넓은 평지, 카페",time:"계절 전환기"},
  "금": {color:"⚪ 흰색",number:"4, 9",direction:"서쪽",food:"매운맛 (김치, 고추)",place:"도서관, 사무실",time:"15~19시"},
  "수": {color:"🔵 검정/파랑",number:"1, 6",direction:"북쪽",food:"짠맛 (해산물, 된장)",place:"바다, 강변",time:"21~01시"},
};

/* ─── 명언 (십성별) ─── */
const QUOTES: Record<string,{text:string,author:string}> = {
  "비견": {text:"나 자신을 아는 것이 모든 지혜의 시작이다.",author:"아리스토텔레스"},
  "겁재": {text:"절제는 최고의 약이다.",author:"히포크라테스"},
  "식신": {text:"창조는 곧 기쁨이다.",author:"앙리 베르그송"},
  "상관": {text:"천재란 1%의 영감과 99%의 노력이다.",author:"토마스 에디슨"},
  "편재": {text:"부는 바다와 같다. 한 곳에 머물지 않는다.",author:"탈무드"},
  "정재": {text:"작은 돈을 소홀히 하는 사람은 큰 돈을 모을 수 없다.",author:"벤자민 프랭클린"},
  "편관": {text:"고난은 영혼의 양식이다.",author:"빅토르 위고"},
  "정관": {text:"질서 속에서 자유를 찾아라.",author:"알베르 카뮈"},
  "편인": {text:"상상력은 지식보다 중요하다.",author:"알베르트 아인슈타인"},
  "정인": {text:"배움에는 끝이 없다.",author:"공자"},
};

/* ─── 12시진 흐름 계산 ─── */
const SIJIN: {branch: string, label: string, hanja: string, range: string}[] = [
  {branch:"자", label:"子시", hanja:"子", range:"23-01"},
  {branch:"축", label:"丑시", hanja:"丑", range:"01-03"},
  {branch:"인", label:"寅시", hanja:"寅", range:"03-05"},
  {branch:"묘", label:"卯시", hanja:"卯", range:"05-07"},
  {branch:"진", label:"辰시", hanja:"辰", range:"07-09"},
  {branch:"사", label:"巳시", hanja:"巳", range:"09-11"},
  {branch:"오", label:"午시", hanja:"午", range:"11-13"},
  {branch:"미", label:"未시", hanja:"未", range:"13-15"},
  {branch:"신", label:"申시", hanja:"申", range:"15-17"},
  {branch:"유", label:"酉시", hanja:"酉", range:"17-19"},
  {branch:"술", label:"戌시", hanja:"戌", range:"19-21"},
  {branch:"해", label:"亥시", hanja:"亥", range:"21-23"},
];

function formatSijinRelation(r: JijiRelation): string {
  const b = r.branches.map((x) => `${x}${JIJI_HANJA[x]}`).join("·");
  switch (r.type) {
    case "육합":
      return `원국 ${b}와 오늘 시지가 육합(六合) → 협력·화합에 유리`;
    case "삼합":
      return `삼합(三合·${r.result}) 성립 → 결실·연대의 기운`;
    case "방합":
      return `방합(方合·${r.result}) → 같은 오행이 힘을 모음`;
    case "육충":
      return `원국 ${b}와 육충(六沖) → 급한 변화·갈등 주의`;
    case "형":
      return `형(刑) 작용 → 마찰·시비 주의`;
    case "자형":
      return `자형(自刑) → 집착·반복 패턴 주의`;
    case "해":
      return `해(害) → 은근한 불편·오해 주의`;
    case "파":
      return `파(破) → 작은 방해·일정 변경 가능`;
    default:
      return "";
  }
}

function buildSijinAdvice(
  branch: string,
  sipsin: string,
  score: number,
  labelText: string,
  rels: JijiRelation[]
): string {
  const meta = SIJIN_META[branch];
  const sipsinInfo = SIPSIN_DICT[sipsin];
  const labelDesc = SCORE_LABEL_DESC[labelText] || "";
  const relNote = rels.map(formatSijinRelation).filter(Boolean).join(" ");
  const actionHint =
    score >= 70
      ? `이때는 ${meta.goodFor} 쪽으로 움직이면 흐름을 타기 쉽습니다.`
      : score < 50
        ? `${meta.avoid}은(는) 피하고 가볍게 쉬어 가세요.`
        : `무리하지 않고 ${meta.goodFor} 정도가 적당합니다.`;

  return [
    labelDesc,
    meta.meaning,
    `이 시진의 기운은 나에게 [${sipsin}${sipsinInfo ? ` · ${sipsinInfo.title}` : ""}]으로 읽힙니다.`,
    relNote,
    actionHint,
  ]
    .filter(Boolean)
    .join(" ");
}

function getHourlyFlow(
  myBranches: string[],
  myDayOh: string,
  myGanIdx: number,
  baseScore: number,
  rng: () => number,
  mySiBranch?: string,
) {
  return SIJIN.map(({ branch, label, hanja, range }) => {
    const meta = SIJIN_META[branch];
    const branchOh = JI_OHAENG[branch];
    const branchGanIdx = jijiIndex(branch);
    const sameYY = (myGanIdx % 2) === (branchGanIdx % 2);
    const sipsin = getSipsin(myDayOh, branchOh, sameYY);
    const sipsinBase = SIPSIN_SCORE[sipsin]?.base || 60;

    const rels = findJijiRelations(myBranches, branch);
    let relAdj = 0;
    for (const r of rels) {
      if (r.type === "육합" || r.type === "삼합" || r.type === "방합") relAdj += 5;
      if (r.type === "육충") relAdj -= 8;
      if (r.type === "형" || r.type === "자형") relAdj -= 4;
      if (r.type === "해" || r.type === "파") relAdj -= 2;
    }

    // 태어난 시지와 각 시진의 관계 (본인 시주 시간대 강조)
    if (mySiBranch) {
      if (branch === mySiBranch) {
        relAdj += 6;
      } else {
        const siRels = findJijiRelations([mySiBranch], branch);
        for (const r of siRels) {
          if (r.type === "육합" || r.type === "삼합" || r.type === "방합") relAdj += 4;
          if (r.type === "육충") relAdj -= 6;
          if (r.type === "형" || r.type === "자형") relAdj -= 3;
          if (r.type === "해" || r.type === "파") relAdj -= 2;
        }
      }
    }

    const raw = Math.round(sipsinBase * 0.5 + baseScore * 0.4 + relAdj + (rng() - 0.5) * 6);
    const score = Math.max(20, Math.min(99, raw));

    let labelText = "안정";
    if (score >= 80) labelText = "절정";
    else if (score >= 70) labelText = "상승";
    else if (score >= 55) labelText = "안정";
    else if (score >= 40) labelText = "주의";
    else labelText = "휴식";

    const relations = rels.map(formatSijinRelation).filter(Boolean);

    return {
      hour: label,
      hanja,
      range,
      score,
      label: labelText,
      branch,
      branchName: `${branch}${hanja}`,
      element: branchOh,
      keyword: meta.keyword,
      sipsin,
      sipsinTitle: SIPSIN_DICT[sipsin]?.title || SIPSIN_RELATION[sipsin],
      labelDesc: SCORE_LABEL_DESC[labelText],
      goodFor: meta.goodFor,
      avoid: meta.avoid,
      relations,
      advice: buildSijinAdvice(branch, sipsin, score, labelText, rels),
      isMyHour: mySiBranch ? branch === mySiBranch : false,
    };
  });
}

/* ─── 등급 판정 ─── */
function getGrade(score: number): {grade:string,color:string,emoji:string} {
  if (score >= 90) return {grade:"SSS",color:"#FFD700",emoji:"👑"};
  if (score >= 82) return {grade:"SS",color:"#FF6B35",emoji:"🌟"};
  if (score >= 75) return {grade:"S",color:"#FF4500",emoji:"⭐"};
  if (score >= 68) return {grade:"A",color:"#4CAF50",emoji:"🍀"};
  if (score >= 58) return {grade:"B",color:"#2196F3",emoji:"💫"};
  if (score >= 48) return {grade:"C",color:"#9E9E9E",emoji:"🌤️"};
  return {grade:"D",color:"#795548",emoji:"☁️"};
}

/* ─── 시간대별 조언 (12시진 흐름 기반) ─── */
function getPeriodScoreLabel(score: number) {
  if (score >= 80) return "강한 상승";
  if (score >= 70) return "상승";
  if (score >= 55) return "안정";
  if (score >= 40) return "주의";
  return "휴식";
}

function buildTimeAdviceFromFlow(
  hourlyFlow: {
    hour: string;
    range: string;
    score: number;
    label: string;
    keyword?: string;
    goodFor?: string;
    avoid?: string;
  }[],
  fallback: { morning: string; afternoon: string; evening: string }
) {
  const groups = [
    {
      time: "오전",
      label: "새벽부터 아침까지",
      hanjaRange: "子~卯",
      range: "23~07시",
      slice: hourlyFlow.slice(0, 4),
      fallback: fallback.morning,
    },
    {
      time: "오후",
      label: "업무와 활동의 중심",
      hanjaRange: "辰~未",
      range: "07~15시",
      slice: hourlyFlow.slice(4, 8),
      fallback: fallback.afternoon,
    },
    {
      time: "저녁",
      label: "마무리와 회복의 흐름",
      hanjaRange: "申~亥",
      range: "15~23시",
      slice: hourlyFlow.slice(8, 12),
      fallback: fallback.evening,
    },
  ];

  return groups.map(({ time, label, hanjaRange, range, slice, fallback: fb }) => {
    const score = Math.round(slice.reduce((s, x) => s + x.score, 0) / slice.length);
    const peak = slice.reduce((a, b) => (a.score > b.score ? a : b));
    const cautionSlot = slice.reduce((a, b) => (a.score < b.score ? a : b));
    const scoreLabel = getPeriodScoreLabel(score);
    const summary =
      score >= 70
        ? `${time}에 집중하기 쉬운 구간이에요. 중요한 일은 ${peak.hour}(${peak.range}시) 전후에 배치해 보세요.`
        : score >= 55
          ? `${time}은 무난한 흐름입니다. ${peak.hour}(${peak.range}시)를 중심으로 차분히 움직이세요.`
          : `${time}은 속도를 줄이면 편한 구간입니다. ${cautionSlot.hour}(${cautionSlot.range}시)에는 답장·결제를 한 박자 늦춰 보세요.`;

    return {
      time,
      label,
      hanjaRange,
      range,
      score,
      scoreLabel,
      peak: {
        hour: peak.hour,
        range: peak.range,
        score: peak.score,
        label: peak.label,
        keyword: peak.keyword,
      },
      cautionSlot: {
        hour: cautionSlot.hour,
        range: cautionSlot.range,
        score: cautionSlot.score,
        label: cautionSlot.label,
        keyword: cautionSlot.keyword,
      },
      slots: slice.map((slot) => ({
        hour: slot.hour,
        range: slot.range,
        score: slot.score,
        label: slot.label,
        keyword: slot.keyword,
      })),
      summary,
      advice: `${peak.hour}(${peak.label}, ${peak.score}점)이 ${time} 최고조입니다. ${fb}`,
      goodFor: peak.goodFor,
      caution: cautionSlot.avoid,
    };
  });
}

function formatLuckyItemsArray(myDayOh: string) {
  const raw = LUCKY_MAP[myDayOh] || LUCKY_MAP["토"];
  const elementReason: Record<string, string> = {
    목: "성장과 시작의 목 기운을 보충합니다.",
    화: "활력과 말·손으로 풀어내는 화 기운을 깨웁니다.",
    토: "안정과 균형의 토 기운을 잡아줍니다.",
    금: "정리와 결단의 금 기운을 도와줍니다.",
    수: "회복과 지혜의 수 기운을 살려줍니다.",
  };
  const reason = elementReason[myDayOh] || elementReason["토"];
  return [
    { emoji: "🎨", label: "행운의 색", value: raw.color, detail: reason, use: "옷·소품·배경색처럼 눈에 보이는 곳에 가볍게 써보세요." },
    { emoji: "🔢", label: "행운의 숫자", value: raw.number, detail: reason, use: "자리 번호, 알림 시간, 오늘의 작은 선택에 참고하면 좋아요." },
    { emoji: "🧭", label: "행운의 방향", value: raw.direction, detail: reason, use: "산책·이동·자리 배치에서 이 방향을 의식해보세요." },
    { emoji: "🍽️", label: "행운의 음식", value: raw.food, detail: reason, use: "한 끼 메뉴나 간식으로 가볍게 곁들이면 충분합니다." },
    { emoji: "📍", label: "행운의 장소", value: raw.place, detail: reason, use: "머무는 장소의 분위기를 이 기운에 맞추면 흐름이 편해집니다." },
    { emoji: "⏰", label: "행운의 시간", value: raw.time, detail: reason, use: "중요한 연락·정리·결정을 이 시간대에 맞춰보세요." },
  ];
}

function buildActionGuides(sipsin: string) {
  const reason = SIPSIN_DICT[sipsin]?.desc || SIPSIN_DETAIL[sipsin];
  const fallbackDo = { reason, action: "작게라도 바로 실행하면 오늘 기운을 쓰기 쉽습니다." };
  const fallbackDont = { reason, action: "한 박자 늦추고 확인하면 불필요한 손실을 줄일 수 있습니다." };
  return {
    dos: (TODAY_DOS[sipsin] || []).map((text) => ({ text, ...(DO_DETAIL[text] || fallbackDo) })),
    donts: (TODAY_DONTS[sipsin] || []).map((text) => ({ text, ...(DONT_DETAIL[text] || fallbackDont) })),
  };
}

function buildSummary(
  todaySipsin: string,
  todayJiSipsin: string,
  tdStem: string,
  tdBranch: string,
  relDesc: string[]
): string {
  const sipsinInfo = SIPSIN_DICT[todaySipsin];
  const jiInfo = SIPSIN_DICT[todayJiSipsin];
  const relationNote =
    relDesc.length > 0
      ? relDesc[0].replace(/^[^→]*→\s*/, "")
      : "원국과 오늘 일진 사이 뚜렷한 합·충은 없어 비교적 평온한 흐름입니다.";

  return (
    `오늘 일진 ${tdStem}${CHEONGAN_HANJA[tdStem]}${tdBranch}${JIJI_HANJA[tdBranch]}은 ` +
    `당신에게 [${todaySipsin}${sipsinInfo ? ` · ${sipsinInfo.title}` : ""}]의 기운입니다. ` +
    `${sipsinInfo?.desc || SIPSIN_DETAIL[todaySipsin]} ` +
    `일지로 보면 [${todayJiSipsin}${jiInfo ? ` · ${jiInfo.title}` : ""}]이 더해집니다. ` +
    relationNote
  );
}

function getScoreTone(score: number) {
  if (score >= 85) return "대길";
  if (score >= 70) return "길";
  if (score >= 55) return "평";
  if (score >= 40) return "주의";
  return "휴식";
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildBriefing(params: {
  dateStr: string;
  overall: number;
  todaySipsin: string;
  todayJiSipsin: string;
  summary: string;
  tip: string;
  warning: string;
  strongest: { label: string; score: number };
  weakest: { label: string; score: number };
  peakHour: string;
  cautionHour: string;
}) {
  const scoreTone = getScoreTone(params.overall);
  const headline =
    params.overall >= 80
      ? "오늘은 흐름을 적극적으로 활용해도 좋은 날입니다."
      : params.overall >= 60
        ? "오늘은 차분히 정리하며 성과를 쌓기 좋은 날입니다."
        : "오늘은 무리한 확장보다 점검과 회복이 먼저입니다.";

  return {
    title: "오늘의 운세 브리핑",
    date: params.dateStr,
    headline,
    scoreTone,
    oneLine: `${params.todaySipsin}과 ${params.todayJiSipsin}의 흐름이 함께 작용합니다. ${params.strongest.label}은 살리고, ${params.weakest.label}은 천천히 다루세요.`,
    executiveSummary: [
      params.summary,
      `가장 활용하기 좋은 영역은 ${params.strongest.label}(${params.strongest.score}점)입니다. 오늘 중요한 일은 ${params.peakHour} 전후에 배치하면 흐름을 타기 쉽습니다.`,
      `가장 세심하게 살필 영역은 ${params.weakest.label}(${params.weakest.score}점)입니다. ${params.cautionHour} 전후에는 속도를 줄이고 확인을 한 번 더 하세요.`,
    ],
    focus: params.tip,
    caution: params.warning,
  };
}

const DOMAIN_META: Record<string, { label: string; desc: string; action: string; caution: string }> = {
  career: {
    label: "직장운",
    desc: "업무, 보고, 협업, 성과가 얼마나 매끄럽게 이어지는지 보여줍니다.",
    action: "가장 중요한 업무를 먼저 처리하고, 보고 자료는 한 번 더 정리하세요.",
    caution: "성급한 확답이나 날 선 표현은 업무 흐름을 흔들 수 있습니다.",
  },
  exam: {
    label: "시험운",
    desc: "공부, 자격, 평가, 발표처럼 실력을 증명하는 흐름입니다.",
    action: "새로운 범위보다 이미 아는 내용을 정리하고 예상 질문을 점검하세요.",
    caution: "긴장감이 올라오면 쉬운 문제부터 차분히 풀어가는 편이 좋습니다.",
  },
  health: {
    label: "건강운",
    desc: "몸과 마음의 컨디션, 회복력, 하루 체력 배분을 보여줍니다.",
    action: "물을 자주 마시고, 짧은 산책이나 스트레칭으로 몸을 풀어주세요.",
    caution: "무리한 일정, 과식, 늦은 취침은 운의 흐름을 떨어뜨릴 수 있습니다.",
  },
  activity: {
    label: "활동운",
    desc: "외출, 이동, 새 시도, 사람을 만나는 흐름입니다.",
    action: "미뤄둔 연락이나 방문, 작은 실행을 하나 정해 움직여보세요.",
    caution: "계획 없이 움직이면 체력과 시간이 흩어질 수 있습니다.",
  },
  decision: {
    label: "결정운",
    desc: "선택, 판단, 계약, 방향 전환에 대한 감각입니다.",
    action: "선택지를 줄이고 기준을 하나 정하면 답이 더 선명해집니다.",
    caution: "감정이 올라온 상태에서의 즉흥 결정은 하루만 미루세요.",
  },
  people: {
    label: "대인운",
    desc: "주변 사람과의 협력, 귀인, 오해 가능성을 함께 봅니다.",
    action: "도움을 요청하거나 먼저 안부를 전하면 관계가 부드럽게 열립니다.",
    caution: "상대의 침묵을 부정적으로 단정하지 않는 것이 좋습니다.",
  },
  love: {
    label: "사랑운",
    desc: "연애, 호감, 가족과 가까운 관계의 정서 흐름입니다.",
    action: "짧고 따뜻한 표현 하나가 생각보다 큰 힘이 됩니다.",
    caution: "확인을 강요하거나 감정을 시험하는 말은 피하세요.",
  },
  wealth: {
    label: "재물운",
    desc: "돈, 거래, 소비, 정산, 기회비용의 흐름입니다.",
    action: "수입과 지출을 점검하고 필요한 결제만 차분히 진행하세요.",
    caution: "검증 없는 투자·충동구매는 나중에 정리 비용을 키울 수 있어요.",
  },
  hope: {
    label: "소망운",
    desc: "바라는 일, 기다리는 답, 작게 밀어붙일 수 있는 가능성입니다.",
    action: "큰 결론보다 첫 연락, 첫 정리, 첫 신청처럼 시작점을 만드세요.",
    caution: "기대만 키우고 행동이 없으면 흐름이 약해집니다.",
  },
  caution: {
    label: "주의운",
    desc: "실수, 구설, 손실, 컨디션 저하를 피하기 위한 경고 신호입니다.",
    action: "중요한 메시지와 금전 결정은 보내기 전 한 번 더 확인하세요.",
    caution: "서두름과 과장은 오늘의 가장 큰 변수입니다.",
  },
};

function buildDomainScores(scores: {
  overall: number;
  wealth: number;
  love: number;
  career: number;
  health: number;
  luck: number;
}) {
  const raw = {
    career: scores.career,
    exam: scores.career * 0.55 + scores.luck * 0.25 + scores.health * 0.2,
    health: scores.health,
    activity: scores.luck * 0.45 + scores.health * 0.3 + scores.career * 0.25,
    decision: scores.overall * 0.45 + scores.career * 0.35 + scores.luck * 0.2,
    people: scores.love * 0.45 + scores.luck * 0.35 + scores.overall * 0.2,
    love: scores.love,
    wealth: scores.wealth,
    hope: scores.luck * 0.5 + scores.overall * 0.35 + scores.love * 0.15,
    caution: 100 - Math.round((scores.overall + scores.health) / 2),
  };

  return Object.entries(raw).map(([key, score]) => ({
    key,
    ...DOMAIN_META[key],
    score: clampScore(score),
    grade: getScoreTone(key === "caution" ? 100 - score : score),
  }));
}

function buildDetailedFortunes(params: {
  domains: ReturnType<typeof buildDomainScores>;
  todaySipsin: string;
  todayJiSipsin: string;
  relationDetail: string;
  actionGuides: ReturnType<typeof buildActionGuides>;
  hourlyPeak: { hour: string; range: string; score: number; label: string };
  hourlyCaution: { hour: string; range: string; score: number; label: string };
}) {
  return params.domains.map((domain) => {
    const isCaution = domain.key === "caution";
    const score = domain.score;
    const opening = isCaution
      ? score >= 60
        ? "오늘은 작은 실수와 말의 온도를 특히 살피면 편한 하루가 될 수 있어요."
        : "주의 신호는 크지 않아요. 기본 확인만 지켜도 안정적으로 지나갈 수 있어요."
      : score >= 80
        ? `${domain.label}에서 손이 먼저 가기 쉬워요. 평소보다 한 걸음만 앞당겨 보세요.`
        : score >= 60
          ? `${domain.label}은 안정권이에요. 무리한 확장보다 준비한 일을 차분히 진행해 보세요.`
          : `${domain.label}은 속도를 낮추면 편해요. 결과보다 손실을 줄이는 쪽이 유리해요.`;

    const guide = params.actionGuides.dos[0]?.action || domain.action;
    const avoid = params.actionGuides.donts[0]?.action || domain.caution;

    return {
      ...domain,
      overview: opening,
      positive:
        `${params.todaySipsin} 기운이 ${domain.label}에 작용하면서 ${domain.action} ` +
        `특히 ${params.hourlyPeak.hour}(${params.hourlyPeak.range}시, ${params.hourlyPeak.score}점) 전후에는 작은 실행이 성과로 이어지기 쉽습니다.`,
      cautionText:
        `${params.todayJiSipsin} 흐름까지 함께 보면 ${domain.caution} ` +
        `${params.hourlyCaution.hour}(${params.hourlyCaution.range}시, ${params.hourlyCaution.label})에는 확인과 여유를 우선하세요.`,
      action: guide,
      avoid,
      basis: params.relationDetail,
    };
  });
}

function buildMyeongsikReport(params: {
  pillars: Record<string, string>;
  todayGan: string;
  todayJi: string;
  myDayGan: string;
  myDayBranch: string;
  myElement: string;
  todayGanOhaeng: string;
  todaySipsin: string;
  todayJiSipsin: string;
  sajuTriggers: ReturnType<typeof buildSajuTriggers>["triggers"];
  gearAnalysis: string[];
}) {
  const pillarRows = [
    { key: "hour", label: "시주", value: params.pillars.hour },
    { key: "day", label: "일주", value: params.pillars.day },
    { key: "month", label: "월주", value: params.pillars.month },
    { key: "year", label: "연주", value: params.pillars.year },
  ];

  return {
    title: "명식 기반 해석",
    today: {
      gan: params.todayGan,
      ji: params.todayJi,
      ohaeng: params.todayGanOhaeng,
      sipsin: params.todaySipsin,
      branchSipsin: params.todayJiSipsin,
    },
    natal: {
      dayGan: params.myDayGan,
      dayBranch: params.myDayBranch,
      element: params.myElement,
      pillars: pillarRows,
    },
    triggers: params.sajuTriggers.slice(0, 8),
    legacyLines: params.gearAnalysis.slice(0, 6),
  };
}

/* ═══════════════════════════════════════
   메인 핸들러
   ═══════════════════════════════════════ */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getLandingCorsHeaders(request),
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getLandingCorsHeaders(request);

  try {
    const body = await request.json();
    const { year, month, day, hour, minute, isLunar, leap, calendarType, gender } = body;
    const isLeapMonth = !!leap || calendarType === "lunarLeap";

    if (!year || !month || !day) {
      return NextResponse.json(
        { error: "생년월일을 입력해주세요." },
        { status: 400, headers: corsHeaders },
      );
    }

    const now = new Date();
    const {
      year: tY,
      month: tM,
      day: tD,
      dayOfWeek: tDow,
    } = getKstDateParts(now);
    const today = kstDateAnchor({ year: tY, month: tM, day: tD, dayOfWeek: tDow });
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][tDow];
    const dateStr = formatKstDateLabel(now);
    const calcDateKey = getTodayDateKeyKst(now);

    const todayCalc = calculateSaju(
      buildSajuInput(tY, tM, tD, { gender: "남", hour: 12, minute: 0 })
    );
    const tdStem = todayCalc.pillarDetails.day.stemKo;
    const tdBranch = todayCalc.pillarDetails.day.branchKo;
    const tdStemOh = GAN_OHAENG[tdStem];
    const tdBranchOh = JI_OHAENG[tdBranch];
    const tdGanIdx = cheonganIndex(tdStem);

    const hasHour = hour !== undefined && hour !== null && hour !== "";
    const hasMinute = minute !== undefined && minute !== null && minute !== "";
    const myCalc = calculateSaju(
      buildSajuInput(+year, +month, +day, {
        gender: gender || "남",
        isLunar: !!isLunar || isLeapMonth,
        leap: isLeapMonth,
        hour: hasHour ? +hour : undefined,
        minute: hasHour && hasMinute ? +minute : undefined,
      })
    );

    const pd = myCalc.pillarDetails;
    const myDayStem = pd.day.stemKo;
    const myDayBranch = pd.day.branchKo;
    const myDayOh = GAN_OHAENG[myDayStem];
    const myGanIdx = cheonganIndex(myDayStem);

    // 시주 미입력 시 시주는 합충 분석에서 제외 (정오 기본값 오염 방지)
    const myStems = [
      pd.year.stemKo,
      pd.month.stemKo,
      pd.day.stemKo,
      ...(hasHour ? [pd.hour.stemKo] : []),
    ];
    const myBranches = [
      pd.year.branchKo,
      pd.month.branchKo,
      pd.day.branchKo,
      ...(hasHour ? [pd.hour.branchKo] : []),
    ];

    const sameYY = (myGanIdx % 2) === (tdGanIdx % 2);
    const todaySipsin = getSipsin(myDayOh, tdStemOh, sameYY);

    const tdBranchGanIdx = jijiIndex(tdBranch);
    const tdBranchSameYY = (myGanIdx % 2) === (tdBranchGanIdx % 2);
    const todayJiSipsin = getSipsin(myDayOh, tdBranchOh, tdBranchSameYY);

    const jijiRels = findJijiRelations(myBranches, tdBranch);
    const cheonganRels = findCheonganRelations(myStems, tdStem);
    const seyunEffect = getSeyunEffect(myDayOh, myGanIdx, tY, tM, tD);
    const relBonus = getRelationBonus(jijiRels, cheonganRels);

    let siBonus = 0;
    let siStem: string | undefined;
    let siStemOh: string | undefined;
    let siBranch: string | undefined;
    let siVsTdSipsin: string | undefined;
    let siJijiRels: JijiRelation[] = [];
    let siCheonganRels: CheonganRelation[] = [];

    if (hasHour) {
      siStem = pd.hour.stemKo;
      siBranch = pd.hour.branchKo;
      siStemOh = GAN_OHAENG[siStem];
      const siGanIdx = cheonganIndex(siStem);
      const siSameYY = (siGanIdx % 2) === (tdGanIdx % 2);
      siVsTdSipsin = getSipsin(siStemOh, tdStemOh, siSameYY);
      siJijiRels = findJijiRelations([siBranch], tdBranch);
      siCheonganRels = findCheonganRelations([siStem], tdStem);
      const siRelBonus = getRelationBonus(siJijiRels, siCheonganRels);
      siBonus = Math.round(siRelBonus.bonus * 0.8);

      // 시주 천간이 일간에게 주는 십성 → 소폭 가중 (중심 60, 최대 ±5)
      const siVsMeSameYY = (siGanIdx % 2) === (myGanIdx % 2);
      const siVsMeSipsin = getSipsin(myDayOh, siStemOh, siVsMeSameYY);
      const siSelfScore = SIPSIN_SCORE[siVsMeSipsin]?.base ?? 60;
      siBonus += Math.round((siSelfScore - 60) / 8);
    }

    const totalBonus = relBonus.bonus + seyunEffect.bonus + siBonus;

    const seed = tY * 10000 + tM * 100 + tD + (+year) * 7 + (+month) * 13 + (+day) * 17 + (hasHour ? (+hour) * 31 : 0) + (hasMinute ? (+minute) * 3 : 0);

    const rng = seededRandom(seed);
    const jitter = () => Math.round((rng() - 0.5) * 6);

    const baseScores = SIPSIN_SCORE[todaySipsin] || SIPSIN_SCORE["비견"];

    const clamp = (v: number) => Math.max(20, Math.min(99, v));
    const scores = {
      overall: clamp(baseScores.base + totalBonus + jitter()),
      wealth:  clamp(baseScores.wealth + totalBonus + jitter()),
      love:    clamp(baseScores.love + totalBonus + jitter()),
      career:  clamp(baseScores.career + totalBonus + jitter()),
      health:  clamp(baseScores.health + totalBonus + jitter()),
      luck:    clamp(baseScores.luck + totalBonus + jitter()),
    };

    const gradeInfo = getGrade(scores.overall);

    const { intro: sajuTriggerIntro, triggers: sajuTriggers } = buildSajuTriggers({
      myDayStem,
      myDayOh,
      myStems,
      myBranches,
      tdStem,
      tdStemOh,
      tdBranch,
      tdBranchOh,
      todaySipsin,
      todayJiSipsin,
      jijiRels,
      cheonganRels,
      seyunDesc: seyunEffect.desc,
      seyunGan: seyunEffect.seyunGan,
      seyunJi: seyunEffect.seyunJi,
      seyunSipsin: seyunEffect.seyunSipsin,
      hasHour,
      siStem,
      siStemOh,
      siBranch,
      siVsTdSipsin,
      siJijiRels,
      siCheonganRels,
    });
    const gearAnalysis = triggersToLegacyLines(sajuTriggers);

    const pillarsDisplay = {
      year:  `${myStems[0]}${CHEONGAN_HANJA[myStems[0]]}${myBranches[0]}${JIJI_HANJA[myBranches[0]]}`,
      month: `${myStems[1]}${CHEONGAN_HANJA[myStems[1]]}${myBranches[1]}${JIJI_HANJA[myBranches[1]]}`,
      day:   `${myStems[2]}${CHEONGAN_HANJA[myStems[2]]}${myBranches[2]}${JIJI_HANJA[myBranches[2]]}`,
      hour: hasHour
        ? `${pd.hour.stemKo}${CHEONGAN_HANJA[pd.hour.stemKo]}${pd.hour.branchKo}${JIJI_HANJA[pd.hour.branchKo]}`
        : "미입력",
    };

    const hourlyFlow = getHourlyFlow(
      myBranches,
      myDayOh,
      myGanIdx,
      scores.overall,
      rng,
      hasHour ? siBranch : undefined,
    );
    const timeAdvice = buildTimeAdviceFromFlow(
      hourlyFlow,
      TIME_ADVICE[todaySipsin] || TIME_ADVICE["비견"]
    );
    const character = matchCharacter(myDayStem, todaySipsin);
    const summary = buildSummary(
      todaySipsin,
      todayJiSipsin,
      tdStem,
      tdBranch,
      relBonus.desc
    );
    const actionGuides = buildActionGuides(todaySipsin);
    const hourlyPeak = hourlyFlow.reduce((a, b) => (a.score > b.score ? a : b));
    const hourlyCaution = hourlyFlow.reduce((a, b) => (a.score < b.score ? a : b));
    const domainScores = buildDomainScores(scores);
    const visibleDomains = domainScores.filter((domain) => domain.key !== "caution");
    const strongestDomain = visibleDomains.reduce((a, b) => (a.score > b.score ? a : b));
    const weakestDomain = visibleDomains.reduce((a, b) => (a.score < b.score ? a : b));
    const briefing = buildBriefing({
      dateStr,
      overall: scores.overall,
      todaySipsin,
      todayJiSipsin,
      summary,
      tip: TIPS[todaySipsin],
      warning: WARNINGS[todaySipsin],
      strongest: { label: strongestDomain.label, score: strongestDomain.score },
      weakest: { label: weakestDomain.label, score: weakestDomain.score },
      peakHour: `${hourlyPeak.hour} ${hourlyPeak.range}시`,
      cautionHour: `${hourlyCaution.hour} ${hourlyCaution.range}시`,
    });
    const detailedFortunes = buildDetailedFortunes({
      domains: domainScores,
      todaySipsin,
      todayJiSipsin,
      relationDetail: SIPSIN_DETAIL[todaySipsin],
      actionGuides,
      hourlyPeak,
      hourlyCaution,
    });
    const myeongsikReport = buildMyeongsikReport({
      pillars: pillarsDisplay,
      todayGan: `${tdStem}(${CHEONGAN_HANJA[tdStem]})`,
      todayJi: `${tdBranch}(${JIJI_HANJA[tdBranch]})`,
      myDayGan: `${myDayStem}(${CHEONGAN_HANJA[myDayStem]})`,
      myDayBranch: `${myDayBranch}(${JIJI_HANJA[myDayBranch]})`,
      myElement: myDayOh,
      todayGanOhaeng: tdStemOh,
      todaySipsin,
      todayJiSipsin,
      sajuTriggers,
      gearAnalysis,
    });
    const ohaengCount = computeOhaengCountFromPillars(myStems, myBranches);
    const dailyReport = buildDailyFortuneContent(today, {
      sipsin: todaySipsin,
      dayElement: myDayOh,
      scores,
      ohaengCount,
    });

    const secretaryCopy = await resolveTodaySecretaryCopy(
      {
        scores,
        todaySipsin,
        todayJiSipsin,
        relationDetail: SIPSIN_DETAIL[todaySipsin],
        summary,
        warning: WARNINGS[todaySipsin],
        tip: TIPS[todaySipsin],
        briefing,
        sajuTriggers,
        gearAnalysis,
        todayDosDetailed: actionGuides.dos,
      },
      dailyReport,
    );

    const response = {
      date: dateStr,
      calcDateKey,
      calcTimezone: "Asia/Seoul",
      birthHourSent: hasHour ? { hour: +hour, minute: hasMinute ? +minute : 0 } : null,
      todayGan: `${tdStem}(${CHEONGAN_HANJA[tdStem]})`,
      todayJi: `${tdBranch}(${JIJI_HANJA[tdBranch]})`,
      todayGanOhaeng: tdStemOh,
      todayEmoji: OHAENG_EMOJI[tdStemOh],
      myDayGan: `${myDayStem}(${CHEONGAN_HANJA[myDayStem]})`,
      myDayBranch: `${myDayBranch}(${JIJI_HANJA[myDayBranch]})`,
      myElement: myDayOh,
      myEmoji: OHAENG_EMOJI[myDayOh],
      hasHour: hasHour,
      myHourGan: hasHour ? `${pd.hour.stemKo}(${CHEONGAN_HANJA[pd.hour.stemKo]})` : null,
      myHourBranch: hasHour ? `${pd.hour.branchKo}(${JIJI_HANJA[pd.hour.branchKo]})` : null,
      pillars: pillarsDisplay,
      todaySipsin: todaySipsin,
      todayJiSipsin: todayJiSipsin,
      sipsinTitle: SIPSIN_DICT[todaySipsin]?.title || SIPSIN_RELATION[todaySipsin],
      relation: SIPSIN_RELATION[todaySipsin],
      relationDetail: SIPSIN_DETAIL[todaySipsin],
      summary,
      character: {
        emoji: character.emoji,
        title: character.title,
        description: character.description,
      },
      sajuTriggerIntro,
      sajuTriggers,
      gearAnalysis,
      scores: scores,
      grade: gradeInfo.grade,
      gradeColor: gradeInfo.color,
      gradeEmoji: gradeInfo.emoji,
      luckyItems: formatLuckyItemsArray(myDayOh),
      tip: TIPS[todaySipsin],
      warning: WARNINGS[todaySipsin],
      timeAdvice,
      todayDos: TODAY_DOS[todaySipsin],
      todayDonts: TODAY_DONTS[todaySipsin],
      todayDosDetailed: actionGuides.dos,
      todayDontsDetailed: actionGuides.donts,
      todayQuote: QUOTES[todaySipsin],
      dailyReport,
      briefing,
      domainScores,
      detailedFortunes,
      myeongsikReport,
      hourlyFlowIntro: HOURLY_FLOW_INTRO,
      hourlyFlow,
      hourlyPeak,
      hourlyCaution,
      secretaryCopy,
      ohaengCount,
    };

    return NextResponse.json(
      attachRouteLintMeta(response, "today", collectTodayDisplayFields(response)),
      { headers: corsHeaders },
    );

  } catch (error: any) {
    console.error("오늘의 운세 오류:", error);
    return NextResponse.json(
      { error: "운세 계산 중 오류가 발생했습니다: " + (error?.message || "알 수 없는 오류") },
      { status: 500, headers: corsHeaders },
    );
  }
}
