// src/app/api/today/route.ts

import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "ssaju";

/* ─── 상수 정의 ─── */
const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"] as const;
const CHEONGAN_HANJA: Record<string,string> = {갑:"甲",을:"乙",병:"丙",정:"丁",무:"戊",기:"己",경:"庚",신:"辛",임:"壬",계:"癸"};
const JIJI = ["자","축","인","묘","진","사","오","미","신","유","술","해"] as const;
const JIJI_HANJA: Record<string,string> = {자:"子",축:"丑",인:"寅",묘:"卯",진:"辰",사:"巳",오:"午",미:"未",신:"申",유:"酉",술:"戌",해:"亥"};

const GAN_OHAENG: Record<string,string> = {갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수"};
const JI_OHAENG: Record<string,string> = {자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수"};
const OHAENG_EMOJI: Record<string,string> = {목:"🌳",화:"🔥",토:"🏔️",금:"⚔️",수:"💧"};

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
    // 육충
    for (const [a, b] of YUKCHUNG) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "육충", branches: [mb, targetBranch] });
      }
    }
    // 육합
    for (const [a, b, result] of YUKHAP) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "육합", branches: [mb, targetBranch], result });
      }
    }
    // 형
    for (const [a, b] of HYUNG) {
      if (a === b && mb === a && targetBranch === a) {
        relations.push({ type: "자형", branches: [mb, targetBranch] });
      } else if (a !== b && ((mb === a && targetBranch === b) || (mb === b && targetBranch === a))) {
        relations.push({ type: "형", branches: [mb, targetBranch] });
      }
    }
    // 해
    for (const [a, b] of HAE_LIST) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "해", branches: [mb, targetBranch] });
      }
    }
    // 파
    for (const [a, b] of PA_LIST) {
      if ((mb === a && targetBranch === b) || (mb === b && targetBranch === a)) {
        relations.push({ type: "파", branches: [mb, targetBranch] });
      }
    }
  }

  // 삼합 (원국 지지 중 2개 + 일진 1개 = 3개)
  for (const [a, b, c, result] of SAMHAP) {
    const trio = [a, b, c];
    if (trio.includes(targetBranch)) {
      const needed = trio.filter(x => x !== targetBranch);
      if (needed.every(n => myBranches.includes(n))) {
        relations.push({ type: "삼합", branches: trio, result });
      }
    }
  }

  // 방합
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

/* ─── 세운(2026 병오) 반영 ─── */
function getSeyunEffect(myOhaeng: string, myGanIdx: number): {bonus:number, desc:string} {
  const seyunGan = "병";
  const seyunGanOh = "화";
  const seyunGanIdx = CHEONGAN.indexOf(seyunGan);
  const sameYY = (myGanIdx % 2) === (seyunGanIdx % 2);
  const sipsin = getSipsin(myOhaeng, seyunGanOh, sameYY);

  let bonus = 0;
  let desc = `올해 병오(丙午)년은 나에게 [${sipsin}]의 해 → `;

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

  return { bonus, desc };
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

    /* ─── 1) 오늘 날짜 & 요일 ─── */
    const today = new Date();
    const tY = today.getFullYear();
    const tM = today.getMonth() + 1;
    const tD = today.getDate();
    const dayOfWeek = ["일","월","화","수","목","금","토"][today.getDay()];
    const dateStr = `${tY}년 ${tM}월 ${tD}일 (${dayOfWeek}요일)`;

    /* ─── 2) ssaju로 오늘 일진 계산 ─── */
    const todayCalc = calculateSaju({
      year: tY, month: tM, day: tD, hour: 12,
      gender: "남", calendar: "solar", timezone: "Asia/Seoul"
    });
    const tdStem = todayCalc.pillarDetails.day.stemKo;
    const tdBranch = todayCalc.pillarDetails.day.branchKo;
    const tdStemOh = GAN_OHAENG[tdStem];
    const tdBranchOh = JI_OHAENG[tdBranch];
    const tdGanIdx = CHEONGAN.indexOf(tdStem);

    /* ─── 3) ssaju로 사용자 사주 계산 ─── */
    const hasHour = hour !== undefined && hour !== null && hour !== "";
const hasMinute = minute !== undefined && minute !== null && minute !== "";
const myCalc = calculateSaju({
      year: +year, month: +month, day: +day,
      hour: hasHour ? +hour : 12,
      gender: gender || "남",
      calendar: isLunar ? "lunar" : "solar",
      timezone: "Asia/Seoul"
    });

    const myDayStem = myCalc.pillarDetails.day.stemKo;
    const myDayBranch = myCalc.pillarDetails.day.branchKo;
    const myDayOh = GAN_OHAENG[myDayStem];
    const myGanIdx = CHEONGAN.indexOf(myDayStem);

    // 원국 4기둥
    const myStems = [
      myCalc.pillarDetails.year.stemKo,
      myCalc.pillarDetails.month.stemKo,
      myCalc.pillarDetails.day.stemKo,
      myCalc.pillarDetails.hour.stemKo
    ];
    const myBranches = [
      myCalc.pillarDetails.year.branchKo,
      myCalc.pillarDetails.month.branchKo,
      myCalc.pillarDetails.day.branchKo,
      myCalc.pillarDetails.hour.branchKo
    ];

    /* ─── 4) 톱니바퀴 ① : 내 일간 vs 오늘 일간 → 십성 ─── */
    const sameYY = (myGanIdx % 2) === (tdGanIdx % 2);
    const todaySipsin = getSipsin(myDayOh, tdStemOh, sameYY);

    /* ─── 5) 톱니바퀴 ② : 내 일간 vs 오늘 일지 오행 ─── */
    const tdBranchGanIdx = JIJI.indexOf(tdBranch);
    const tdBranchSameYY = (myGanIdx % 2) === (tdBranchGanIdx % 2);
    const todayJiSipsin = getSipsin(myDayOh, tdBranchOh, tdBranchSameYY);

    /* ─── 6) 톱니바퀴 ③ : 원국 4지지 vs 오늘 지지 합충형 ─── */
    const jijiRels = findJijiRelations(myBranches, tdBranch);

    /* ─── 7) 톱니바퀴 ③-2 : 원국 4천간 vs 오늘 천간 합충 ─── */
    const cheonganRels = findCheonganRelations(myStems, tdStem);

    /* ─── 8) 톱니바퀴 ④ : 세운(2026 병오) 효과 ─── */
    const seyunEffect = getSeyunEffect(myDayOh, myGanIdx);

    /* ─── 9) 합충형에 따른 보정 (원국 전체) ─── */
    const relBonus = getRelationBonus(jijiRels, cheonganRels);

    /* ─── 10) 톱니바퀴 ⑤ : 시주 분석 & 보정 ─── */
    let siBonus = 0;
    const siGearLines: string[] = [];

    if (hasHour) {
      const siStem = myStems[3];
      const siBranch = myBranches[3];
      const siStemOh = GAN_OHAENG[siStem];
      const siGanIdx = CHEONGAN.indexOf(siStem);
      const siSameYY = (siGanIdx % 2) === (tdGanIdx % 2);
      const siVsTdSipsin = getSipsin(siStemOh, tdStemOh, siSameYY);

      siGearLines.push(
        `⚙️ [톱니 5] 내 시간(時干) ${siStem}${CHEONGAN_HANJA[siStem]}(${siStemOh}) × 오늘 일간 ${tdStem}${CHEONGAN_HANJA[tdStem]}(${tdStemOh}) = ${siVsTdSipsin} → 말년운·자녀운 관점의 오늘 기운`
      );

      // 시지 vs 오늘 일지 특수 관계
      const siJijiRels = findJijiRelations([siBranch], tdBranch);
      const siCheonganRels = findCheonganRelations([siStem], tdStem);

      for (const r of siJijiRels) {
        let detail = "";
        switch (r.type) {
          case "육합":
            detail = `시지 ${siBranch}${JIJI_HANJA[siBranch]}-${tdBranch}${JIJI_HANJA[tdBranch]} 육합(${r.result}) → 말년·자녀 방면 조화 ⬆`; break;
          case "삼합":
            detail = `시지 포함 삼합(${r.result}) 성립 → 강력한 결합 ⬆⬆`; break;
          case "육충":
            detail = `시지 ${siBranch}${JIJI_HANJA[siBranch]}-${tdBranch}${JIJI_HANJA[tdBranch]} 육충 → 말년·자녀 방면 변동 주의 ⬇⬇`; break;
          case "형":
            detail = `시지 ${siBranch}${JIJI_HANJA[siBranch]}-${tdBranch}${JIJI_HANJA[tdBranch]} 형(刑) → 자녀·건강 주의 ⬇`; break;
          case "자형":
            detail = `시지 ${siBranch}${JIJI_HANJA[siBranch]}-${tdBranch}${JIJI_HANJA[tdBranch]} 자형(自刑) → 집착·반복 패턴 주의 ⬇`; break;
          case "해":
            detail = `시지 ${siBranch}${JIJI_HANJA[siBranch]}-${tdBranch}${JIJI_HANJA[tdBranch]} 해(害) → 은근한 갈등 주의`; break;
          case "파":
            detail = `시지 ${siBranch}${JIJI_HANJA[siBranch]}-${tdBranch}${JIJI_HANJA[tdBranch]} 파(破) → 소소한 방해 주의`; break;
        }
        if (detail) {
          siGearLines.push(`⚙️ [톱니 5] ${detail}`);
        }
      }

      for (const r of siCheonganRels) {
        if (r.type === "천간합") {
          siGearLines.push(`⚙️ [톱니 5] 시간 ${siStem}${CHEONGAN_HANJA[siStem]}-${tdStem}${CHEONGAN_HANJA[tdStem]} 천간합(${r.result}) → 말년 방면 귀인 ⬆`);
        } else if (r.type === "천간충") {
          siGearLines.push(`⚙️ [톱니 5] 시간 ${siStem}${CHEONGAN_HANJA[siStem]}-${tdStem}${CHEONGAN_HANJA[tdStem]} 천간충 → 말년 방면 갈등 ⬇`);
        }
      }

      // 시주 점수 보정 (영향력 50%)
      const siRelBonus = getRelationBonus(siJijiRels, siCheonganRels);
      siBonus = Math.round(siRelBonus.bonus * 0.5);
    } else {
      siGearLines.push(
        `⚙️ [톱니 5] 태어난 시간 미입력 → 시주(時柱) 분석 생략. 시간을 입력하면 더 정밀한 분석이 가능합니다.`
      );
    }

    /* ─── 11) 최종 점수 계산 ─── */
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

    /* ─── 12) 톱니바퀴 해석 텍스트 조합 ─── */
    const gearAnalysis: string[] = [
      `⚙️ [톱니 1] 내 일간 ${myDayStem}${CHEONGAN_HANJA[myDayStem]}(${myDayOh}) × 오늘 일간 ${tdStem}${CHEONGAN_HANJA[tdStem]}(${tdStemOh}) = ${todaySipsin}`,
      `⚙️ [톱니 2] 내 일간 ${myDayStem}${CHEONGAN_HANJA[myDayStem]}(${myDayOh}) × 오늘 일지 ${tdBranch}${JIJI_HANJA[tdBranch]}(${tdBranchOh}) = ${todayJiSipsin}`,
      ...relBonus.desc.map(d => `⚙️ [톱니 3] ${d}`),
      ...(cheonganRels.length === 0 && jijiRels.length === 0
        ? [`⚙️ [톱니 3] 원국과 오늘 일진 사이 특별한 합충형 없음 → 평온한 흐름`]
        : []),
      `⚙️ [톱니 4] ${seyunEffect.desc}`,
      ...siGearLines,
    ];

    /* ─── 13) 원국 4기둥 표시용 ─── */
    const pillarsDisplay = {
      year:  `${myStems[0]}${CHEONGAN_HANJA[myStems[0]]}${myBranches[0]}${JIJI_HANJA[myBranches[0]]}`,
      month: `${myStems[1]}${CHEONGAN_HANJA[myStems[1]]}${myBranches[1]}${JIJI_HANJA[myBranches[1]]}`,
      day:   `${myStems[2]}${CHEONGAN_HANJA[myStems[2]]}${myBranches[2]}${JIJI_HANJA[myBranches[2]]}`,
      hour:  hasHour
        ? `${myStems[3]}${CHEONGAN_HANJA[myStems[3]]}${myBranches[3]}${JIJI_HANJA[myBranches[3]]}`
        : "미입력",
    };

    /* ─── 14) 응답 조립 ─── */
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
      myHourGan: hasHour ? `${myStems[3]}(${CHEONGAN_HANJA[myStems[3]]})` : null,
      myHourBranch: hasHour ? `${myBranches[3]}(${JIJI_HANJA[myBranches[3]]})` : null,
      pillars: pillarsDisplay,
      todaySipsin: todaySipsin,
      relation: SIPSIN_RELATION[todaySipsin],
      relationDetail: SIPSIN_DETAIL[todaySipsin],
      gearAnalysis: gearAnalysis,
      scores: scores,
      grade: gradeInfo.grade,
      gradeColor: gradeInfo.color,
      gradeEmoji: gradeInfo.emoji,
      luckyItems: LUCKY_MAP[myDayOh] || LUCKY_MAP["토"],
      tip: TIPS[todaySipsin],
      warning: WARNINGS[todaySipsin],
      timeAdvice: TIME_ADVICE[todaySipsin],
      todayDos: TODAY_DOS[todaySipsin],
      todayDonts: TODAY_DONTS[todaySipsin],
      todayQuote: QUOTES[todaySipsin],
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
