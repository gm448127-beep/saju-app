// src/app/api/today/route.ts

import { NextRequest, NextResponse } from "next/server";
import { calculateSaju, type SajuInput } from "ssaju";
import { matchCharacter } from "@/data/matchCharacter";
import { HOURLY_FLOW_INTRO, SCORE_LABEL_DESC, SIJIN_META } from "@/data/sijinDict";
import { SIPSIN_DICT } from "@/data/wisdomDict";
import { buildSajuTriggers, triggersToLegacyLines } from "@/lib/saju-triggers";
import { buildDailyFortuneContent } from "@/lib/today-content-engine";

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

const SIPSIN_RELATION: Record<string,string> = {
  "비견": "동료·경쟁의 기운",
  "겁재": "경쟁·다툼의 기운",
  "식신": "표현·풍요의 기운",
  "상관": "재능발산·변화의 기운",
  "편재": "재물·활동의 기운",
  "정재": "안정적 재물·실리의 기운",
  "편관": "긴장·도전의 기운",
  "정관": "질서·책임의 기운",
  "편인": "영감·변화의 기운",
  "정인": "학문·인덕의 기운",
};

const SIPSIN_DETAIL: Record<string,string> = {
  "비견": "나와 같은 기운이 오는 날입니다. 협력도 되지만 경쟁도 생깁니다. 자기 주장을 세우되 독단은 피하세요.",
  "겁재": "예상치 못한 지출이나 경쟁이 생길 수 있습니다. 돈 관련 결정은 신중하게, 감정적 대응은 자제하세요.",
  "식신": "표현력과 즐거움이 넘치는 날입니다. 맛있는 것을 먹고, 창작활동을 하면 좋은 기운이 들어옵니다.",
  "상관": "뛰어난 아이디어와 재능이 빛나지만 말이 날카로워질 수 있습니다. 표현은 부드럽게, 행동은 대담하게 하세요.",
  "편재": "재물이 움직이는 날입니다. 사업·투자에 좋지만 과욕은 금물. 적극적인 활동이 돈을 부릅니다.",
  "정재": "꾸준한 노력이 보상받는 날입니다. 안정적인 수입과 차분한 재테크가 길합니다.",
  "편관": "압박과 긴장이 있지만 그만큼 성장의 기회입니다. 상사·제도와의 마찰에 주의하고 원칙을 지키세요.",
  "정관": "질서와 책임감이 빛나는 날입니다. 공적인 일, 계약, 면접에 유리합니다. 예의와 격식을 갖추세요.",
  "편인": "갑작스러운 영감이나 변화가 올 수 있습니다. 학습·명상에 좋지만 의심과 변덕은 줄이세요.",
  "정인": "어른의 도움, 학문적 성취, 자격 취득에 좋은 날입니다. 배우고 정리하는 시간을 가지세요.",
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
  opts: { gender?: string; isLunar?: boolean; hour?: number; minute?: number }
): SajuInput {
  const input: SajuInput = {
    year,
    month,
    day,
    gender: opts.gender === "여" ? "여" : "남",
    calendar: opts.isLunar ? "lunar" : "solar",
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
      bonus = 5; desc += "전반적으로 안정적이고 좋은 흐름"; break;
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

/* ─── 십성별 시간대 조언 ─── */
const TIME_ADVICE: Record<string,{morning:string,afternoon:string,evening:string}> = {
  "비견": {morning:"아침에 혼자만의 시간으로 컨디션 조절",afternoon:"오후엔 동료와 협력, 단 주도권 다툼 주의",evening:"저녁은 가벼운 운동으로 에너지 발산"},
  "겁재": {morning:"아침에 지갑과 카드 관리 점검",afternoon:"오후엔 감정적 대응 자제, 이성적 판단",evening:"저녁엔 조용한 휴식, 충동구매 주의"},
  "식신": {morning:"아침에 좋은 음식으로 하루 시작",afternoon:"오후엔 창작·발표·SNS 활동 최적",evening:"저녁은 맛집 탐방이나 요리 추천"},
  "상관": {morning:"아침에 메모·아이디어 정리",afternoon:"오후엔 회의·발표에서 빛나지만 말 조심",evening:"저녁엔 예술·음악 감상으로 감성 충전"},
  "편재": {morning:"아침에 재무 계획 점검",afternoon:"오후엔 적극적 영업·투자 활동",evening:"저녁엔 사교 모임에서 좋은 인연 가능"},
  "정재": {morning:"아침에 꾸준한 루틴으로 시작",afternoon:"오후엔 서류·계약·정산 업무 최적",evening:"저녁엔 가족과 함께하는 시간 추천"},
  "편관": {morning:"아침에 명상·심호흡으로 긴장 해소",afternoon:"오후엔 상사·거래처 미팅 주의, 원칙 준수",evening:"저녁엔 가벼운 산책으로 스트레스 해소"},
  "정관": {morning:"아침에 깔끔한 차림으로 자신감 UP",afternoon:"오후엔 공식적 업무·면접·계약 유리",evening:"저녁엔 자기계발 시간 활용"},
  "편인": {morning:"아침에 독서·뉴스로 정보 수집",afternoon:"오후엔 학습·연구에 집중",evening:"저녁엔 과도한 생각보다 행동으로 마무리"},
  "정인": {morning:"아침에 어른께 안부 인사",afternoon:"오후엔 학습·자격 공부 최적",evening:"저녁엔 감사 일기 작성 추천"},
};

/* ─── 십성별 Do / Don't ─── */
const TODAY_DOS: Record<string,string[]> = {
  "비견": ["자기만의 루틴 유지","동료와 정보 공유","가벼운 운동"],
  "겁재": ["지출 내역 기록","감정 일기 쓰기","혼자만의 시간 확보"],
  "식신": ["맛있는 식사","창작 활동","SNS·블로그 포스팅"],
  "상관": ["아이디어 메모","프레젠테이션 준비","예술 감상"],
  "편재": ["재무 점검","적극적 영업","새로운 인맥 만들기"],
  "정재": ["저축·적금 확인","계약서 꼼꼼히 읽기","가계부 정리"],
  "편관": ["규칙적 생활","원칙 준수","명상·요가"],
  "정관": ["공식 업무 처리","면접·시험 준비","예의 갖추기"],
  "편인": ["독서·학습","새로운 정보 탐색","직감을 메모"],
  "정인": ["어른 방문·안부","자격증 공부","감사 표현"],
};

const TODAY_DONTS: Record<string,string[]> = {
  "비견": ["독단적 결정","남과 비교","무리한 경쟁"],
  "겁재": ["충동구매","도박·투기","감정적 말다툼"],
  "식신": ["과식·과음","게으름","약속 미루기"],
  "상관": ["날카로운 말","상사에게 대들기","거짓 과장"],
  "편재": ["과도한 투자","무분별한 지출","사기 조심"],
  "정재": ["지나친 인색","변화 회피","융통성 부족"],
  "편관": ["법규 위반","상급자와 충돌","무리한 야근"],
  "정관": ["격식 무시","약속 어기기","불성실한 태도"],
  "편인": ["의심·변덕","생각만 하고 안 움직이기","식사 거르기"],
  "정인": ["의존적 태도","우유부단","현실 회피"],
};

/* ─── 십성별 팁·경고 ─── */
const TIPS: Record<string,string> = {
  "비견": "오늘은 '나다움'을 지키면서 남과 보조를 맞추면 최고의 하루가 됩니다.",
  "겁재": "지출 전 '이것이 정말 필요한가?' 3초만 생각하세요. 그 3초가 큰 돈을 지킵니다.",
  "식신": "오늘 먹은 것, 만든 것, 쓴 것이 내일의 행운을 만듭니다. 표현하세요!",
  "상관": "당신의 재능이 빛나는 날! 다만 '말'보다 '작품'으로 보여주면 더 강력합니다.",
  "편재": "돈이 움직이는 날입니다. 액션은 크게, 리스크 관리는 꼼꼼하게.",
  "정재": "차곡차곡 쌓은 것이 빛을 발합니다. 꾸준함이 당신의 무기!",
  "편관": "압박은 다이아몬드를 만드는 과정입니다. 버티면 성장합니다.",
  "정관": "격식을 갖추면 기회가 열립니다. 오늘은 '어른스러운 나'가 빛나는 날.",
  "편인": "직감이 강한 날! 떠오르는 아이디어를 반드시 메모하세요.",
  "정인": "배움에 열린 마음이 복을 부릅니다. 오늘 배운 것이 미래의 무기가 됩니다.",
};

const WARNINGS: Record<string,string> = {
  "비견": "나와 같은 기운끼리 부딪히면 예상치 못한 경쟁이 생깁니다. 양보의 미덕을 발휘하세요.",
  "겁재": "금전 손실 가능성이 있는 날입니다. 보증·대출·투기는 절대 피하세요.",
  "식신": "과식·과음의 유혹이 강합니다. 즐기되 절제를 잊지 마세요.",
  "상관": "말 한마디가 천냥 빚이 될 수 있습니다. 특히 윗사람에게 조심하세요.",
  "편재": "큰돈이 오가는 만큼 사기·손실 위험도 있습니다. 검증 없는 투자는 금물.",
  "정재": "지나친 절약은 인색으로 비춰질 수 있습니다. 필요한 곳엔 과감히 쓰세요.",
  "편관": "스트레스가 건강을 해칩니다. 가슴이 답답하면 멈추고 숨을 고르세요.",
  "정관": "형식에 얽매여 유연성을 잃지 마세요. 원칙 안에서도 창의성은 가능합니다.",
  "편인": "생각이 많아 행동이 늦어질 수 있습니다. '일단 시작'이 답입니다.",
  "정인": "남의 도움에만 기대면 자생력이 약해집니다. 스스로 결단하는 연습을 하세요.",
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
      return `형(刑) 작용 → 마찰·시비 조심`;
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
  rng: () => number
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
        ? `${time} 흐름이 좋습니다. 중요한 일은 ${peak.hour}(${peak.range}시) 전후에 배치하면 좋아요.`
        : score >= 55
          ? `${time}은 무난한 흐름입니다. ${peak.hour}(${peak.range}시)를 중심으로 차분히 움직이세요.`
          : `${time}은 속도를 줄이면 좋은 구간입니다. ${cautionSlot.hour}(${cautionSlot.range}시)에는 실수와 감정 소모를 조심하세요.`;

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
    화: "활력과 표현의 화 기운을 깨웁니다.",
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

const DO_DETAIL: Record<string, { reason: string; action: string }> = {
  "자기만의 루틴 유지": { reason: "비견의 기운은 나의 중심을 세울 때 안정됩니다.", action: "아침 루틴 하나만 정해서 끝까지 지켜보세요." },
  "동료와 정보 공유": { reason: "같은 기운은 협력하면 힘이 커집니다.", action: "필요한 정보 하나를 먼저 공유해보세요." },
  "가벼운 운동": { reason: "넘치는 자기 기운을 몸으로 풀어내면 균형이 잡힙니다.", action: "10분 산책이나 스트레칭이면 충분합니다." },
  "지출 내역 기록": { reason: "겁재는 돈이 새기 쉬운 기운이라 기록이 방어막이 됩니다.", action: "오늘 쓴 돈을 메모장에 바로 적어보세요." },
  "감정 일기 쓰기": { reason: "경쟁심과 조급함을 글로 빼내면 말실수를 줄입니다.", action: "화난 이유를 한 줄만 적고 답장은 늦추세요." },
  "혼자만의 시간 확보": { reason: "기운이 흔들릴 때는 거리 두기가 회복에 좋습니다.", action: "퇴근 후 20분은 알림을 꺼두세요." },
  "맛있는 식사": { reason: "식신은 먹고 즐기는 일에서 복이 살아납니다.", action: "좋은 한 끼를 천천히 먹으며 컨디션을 채우세요." },
  "창작 활동": { reason: "표현의 운이 열리는 날이라 결과물로 남기면 좋습니다.", action: "글·그림·기획안 중 하나를 작게 시작하세요." },
  "SNS·블로그 포스팅": { reason: "식신의 표현력은 밖으로 내보낼수록 행운이 됩니다.", action: "짧은 후기나 생각 하나를 공유해보세요." },
  "아이디어 메모": { reason: "상관은 순간적인 발상이 강한 날입니다.", action: "떠오른 생각은 판단하지 말고 먼저 적어두세요." },
  "프레젠테이션 준비": { reason: "말과 표현을 다듬으면 재능이 설득력으로 바뀝니다.", action: "핵심 문장 3개만 정리해보세요." },
  "예술 감상": { reason: "감각을 열면 상관의 날카로움이 창의성으로 풀립니다.", action: "음악·전시·영상 하나로 감성을 환기하세요." },
  "재무 점검": { reason: "편재는 돈이 움직이는 기운이라 점검이 기회를 만듭니다.", action: "수입·지출·투자 현황을 10분만 확인하세요." },
  "적극적 영업": { reason: "활동성이 커지는 날이라 먼저 움직이면 연결이 생깁니다.", action: "연락 한 통, 제안 하나를 먼저 보내보세요." },
  "새로운 인맥 만들기": { reason: "편재는 넓은 관계 속에서 기회가 생깁니다.", action: "가벼운 모임이나 대화에 열린 태도로 참여하세요." },
  "저축·적금 확인": { reason: "정재는 안정적인 재물 관리와 잘 맞습니다.", action: "자동이체와 저축 목표를 점검해보세요." },
  "계약서 꼼꼼히 읽기": { reason: "실리의 운은 세부 조건을 챙길 때 강해집니다.", action: "금액·날짜·책임 범위를 한 번 더 확인하세요." },
  "가계부 정리": { reason: "정재는 숫자를 정리할수록 마음도 안정됩니다.", action: "이번 주 고정비만 먼저 정리해보세요." },
  "규칙적 생활": { reason: "편관의 압박은 규칙으로 다스릴 때 힘이 됩니다.", action: "식사·수면 시간을 크게 흔들지 마세요." },
  "원칙 준수": { reason: "도전의 날일수록 기준을 지키면 평판이 올라갑니다.", action: "절차와 약속을 먼저 확인하세요." },
  "명상·요가": { reason: "긴장감이 올라오는 날이라 호흡이 운을 안정시킵니다.", action: "깊은 호흡 5번으로 시작하세요." },
  "공식 업무 처리": { reason: "정관은 공적 절차와 책임에서 빛납니다.", action: "보고·서류·신청 업무를 우선 처리하세요." },
  "면접·시험 준비": { reason: "격식과 준비성이 운을 끌어올립니다.", action: "예상 질문과 답변을 짧게 점검하세요." },
  "예의 갖추기": { reason: "정관의 핵심은 신뢰와 태도입니다.", action: "인사·시간·말투를 평소보다 반듯하게 해보세요." },
  "독서·학습": { reason: "편인은 정보와 영감이 들어오는 날입니다.", action: "새로운 글 한 편이나 강의 일부를 들어보세요." },
  "새로운 정보 탐색": { reason: "뜻밖의 힌트가 변화를 여는 실마리가 됩니다.", action: "관심 분야 뉴스를 10분만 살펴보세요." },
  "직감을 메모": { reason: "편인의 직감은 지나가면 흩어지기 쉽습니다.", action: "느낌이 온 이유를 한 문장으로 남기세요." },
  "어른 방문·안부": { reason: "정인은 윗사람·스승·보호자의 덕을 부릅니다.", action: "감사한 사람에게 짧게 안부를 전하세요." },
  "자격증 공부": { reason: "배움의 기운이 안정적으로 붙는 날입니다.", action: "문제 5개, 개념 1개처럼 작게 시작하세요." },
  "감사 표현": { reason: "정인의 인덕은 감사에서 커집니다.", action: "도움 받은 일을 구체적으로 말해보세요." },
};

const DONT_DETAIL: Record<string, { reason: string; action: string }> = {
  "독단적 결정": { reason: "비견이 강하면 내 주장만 커질 수 있습니다.", action: "결정 전 한 사람의 의견만 더 들어보세요." },
  "남과 비교": { reason: "비교는 경쟁심을 키워 하루 리듬을 흐립니다.", action: "오늘 기준은 어제의 나로 잡으세요." },
  "무리한 경쟁": { reason: "이기려는 마음이 과하면 관계 손실이 생깁니다.", action: "승부보다 협력 지점을 찾으세요." },
  "충동구매": { reason: "겁재는 돈이 빠르게 새는 기운입니다.", action: "장바구니에 넣고 24시간 뒤 결정하세요." },
  "도박·투기": { reason: "손실수가 커질 수 있는 날입니다.", action: "확률보다 원금 보존을 우선하세요." },
  "감정적 말다툼": { reason: "말이 격해지면 관계가 쉽게 상합니다.", action: "답장은 10분 뒤에 보내세요." },
  "과식·과음": { reason: "식신의 즐거움이 과하면 컨디션을 해칩니다.", action: "맛있게 먹되 양은 80%에서 멈추세요." },
  "게으름": { reason: "좋은 표현운이 흐르지 못하고 멈출 수 있습니다.", action: "작은 결과물 하나만 남기세요." },
  "약속 미루기": { reason: "즐거움에 치우치면 신뢰를 잃기 쉽습니다.", action: "못 지킬 약속은 먼저 조정하세요." },
  "날카로운 말": { reason: "상관은 표현이 강해져 구설을 만들 수 있습니다.", action: "비판보다 제안형 문장으로 바꿔보세요." },
  "상사에게 대들기": { reason: "위계와 충돌하기 쉬운 흐름입니다.", action: "의견은 근거와 대안으로 전달하세요." },
  "거짓 과장": { reason: "표현력이 과하면 신뢰가 손상됩니다.", action: "확실한 내용만 말하세요." },
  "과도한 투자": { reason: "편재는 큰돈이 움직이는 만큼 리스크도 큽니다.", action: "검증 전에는 금액을 줄이세요." },
  "무분별한 지출": { reason: "활동성이 소비로 이어질 수 있습니다.", action: "오늘 예산선을 먼저 정하세요." },
  "사기 조심": { reason: "좋은 제안처럼 보여도 검증이 필요합니다.", action: "계좌·계약·수익률을 반드시 확인하세요." },
  "지나친 인색": { reason: "정재가 과하면 필요한 지출도 막게 됩니다.", action: "가치 있는 곳에는 적정하게 쓰세요." },
  "변화 회피": { reason: "안정만 고집하면 기회를 놓칠 수 있습니다.", action: "작은 변화 하나는 허용하세요." },
  "융통성 부족": { reason: "원칙이 과하면 관계가 딱딱해집니다.", action: "상대 사정을 한 번 더 물어보세요." },
  "법규 위반": { reason: "편관의 날에는 규칙 위반이 크게 돌아올 수 있습니다.", action: "절차와 기준을 반드시 지키세요." },
  "상급자와 충돌": { reason: "압박감이 권위와 부딪힐 수 있습니다.", action: "감정보다 사실 중심으로 대응하세요." },
  "무리한 야근": { reason: "긴장 기운이 몸의 피로로 이어집니다.", action: "마감 기준을 정하고 끊어내세요." },
  "격식 무시": { reason: "정관은 태도와 형식을 중요하게 봅니다.", action: "자리와 상대에 맞는 표현을 쓰세요." },
  "약속 어기기": { reason: "오늘은 신뢰 손상이 크게 보일 수 있습니다.", action: "늦을 것 같으면 먼저 알리세요." },
  "불성실한 태도": { reason: "책임의 운이 강한 날이라 태도가 평가됩니다.", action: "작은 일도 마무리를 보여주세요." },
  "의심·변덕": { reason: "편인은 생각이 많아 방향이 흔들릴 수 있습니다.", action: "결정 기준 1개만 정하세요." },
  "생각만 하고 안 움직이기": { reason: "영감이 행동으로 이어지지 않으면 흩어집니다.", action: "5분짜리 첫 행동을 하세요." },
  "식사 거르기": { reason: "기운이 머리로만 올라가 몸이 지칠 수 있습니다.", action: "가벼운 식사라도 챙기세요." },
  "의존적 태도": { reason: "정인의 도움운이 과하면 자립이 약해집니다.", action: "조언은 듣되 결정은 직접 하세요." },
  "우유부단": { reason: "생각이 길어지면 기회를 놓칠 수 있습니다.", action: "마감 시간을 정하고 선택하세요." },
  "현실 회피": { reason: "배움과 이상에 머물면 실천이 늦어집니다.", action: "오늘 해야 할 현실 업무 하나를 먼저 처리하세요." },
};

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
    caution: "검증 없는 투자와 충동구매는 운을 새게 만듭니다.",
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
        ? "오늘은 작은 실수와 말의 온도를 특히 살피면 좋은 흐름입니다."
        : "주의 신호는 크지 않습니다. 기본 확인만 지켜도 안정적으로 지나갈 수 있습니다."
      : score >= 80
        ? `${domain.label}이 강하게 열려 있습니다. 평소보다 한 걸음 더 적극적으로 움직여도 좋습니다.`
        : score >= 60
          ? `${domain.label}은 안정권입니다. 무리한 확장보다 준비한 일을 차분히 진행하세요.`
          : `${domain.label}은 속도를 낮추면 좋습니다. 결과보다 손실을 줄이는 태도가 유리합니다.`;

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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute, isLunar, gender } = body;

    if (!year || !month || !day) {
      return NextResponse.json({ error: "생년월일을 입력해주세요." }, { status: 400 });
    }

    const today = new Date();
    const tY = today.getFullYear();
    const tM = today.getMonth() + 1;
    const tD = today.getDate();
    const dayOfWeek = ["일","월","화","수","목","금","토"][today.getDay()];
    const dateStr = `${tY}년 ${tM}월 ${tD}일 (${dayOfWeek}요일)`;

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
        isLunar: !!isLunar,
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
      siBonus = Math.round(siRelBonus.bonus * 0.5);
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

    const hourlyFlow = getHourlyFlow(myBranches, myDayOh, myGanIdx, scores.overall, rng);
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
    const dailyReport = buildDailyFortuneContent(today, {
      sipsin: todaySipsin,
      element: myDayOh,
      scores,
    });

    const response = {
      date: dateStr,
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
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("오늘의 운세 오류:", error);
    return NextResponse.json(
      { error: "운세 계산 중 오류가 발생했습니다: " + (error?.message || "알 수 없는 오류") },
      { status: 500 }
    );
  }
}
