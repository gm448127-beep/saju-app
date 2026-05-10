import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "ssaju";

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

/* ─── 30괘 데이터 ─── */
const HEXAGRAMS: Record<number,{name:string,hanja:string,poem:string,meaning:string,summary:string,advice:string,caution:string,baseBonus:number}> = {
  1:{name:"건",hanja:"乾",poem:"하늘이 맑고 용이 승천하니\n만사형통하여 뜻을 이루리라\n봄바람이 불어 꽃이 만발하고\n귀인이 도와 큰 복을 누리리",meaning:"건괘는 하늘의 기운으로, 강건하고 진취적인 에너지를 뜻합니다.",summary:"올해는 하늘의 기운이 충만하여 하는 일마다 순조롭습니다. 적극적으로 움직일수록 좋은 결과를 얻습니다.",advice:"자신감을 가지고 적극적으로 행동하세요.",caution:"자만하거나 독단적으로 행동하면 좋은 기운을 놓칩니다.",baseBonus:12},
  2:{name:"곤",hanja:"坤",poem:"대지가 만물을 품듯이\n넓은 마음으로 포용하면 복이 오리\n급히 서두르지 말고 때를 기다리니\n가을이 되면 풍성한 수확이 있으리",meaning:"곤괘는 대지의 기운으로, 포용력과 인내를 상징합니다.",summary:"차분하게 내실을 다지는 해입니다. 하반기로 갈수록 운이 상승합니다.",advice:"인내심을 가지고 기초를 탄탄히 다지세요.",caution:"급한 결정이나 큰 투자는 삼가세요.",baseBonus:4},
  3:{name:"준",hanja:"屯",poem:"새싹이 땅을 뚫고 나오듯이\n어려움을 겪으나 결국 이루리라\n초반의 고생은 나중의 복이 되니\n포기하지 말고 꿋꿋이 나아가라",meaning:"준괘는 초기 어려움이 있으나 결국 성공하는 괘입니다.",summary:"올해 초반에는 어려움이 있지만 중반 이후 상황이 호전됩니다.",advice:"초반의 어려움에 좌절하지 마세요.",caution:"무리한 확장이나 과욕을 부리면 어려움이 길어집니다.",baseBonus:-2},
  4:{name:"몽",hanja:"蒙",poem:"산 아래 샘물이 솟아나듯\n배움과 깨달음의 해가 되리\n어리석음을 벗고 지혜를 얻으면\n밝은 미래가 활짝 열리리",meaning:"몽괘는 배움과 계몽을 의미합니다.",summary:"올해는 배움의 해입니다. 새로운 기술, 지식을 익히면 큰 발전을 이룹니다.",advice:"겸손한 마음으로 배우세요.",caution:"아는 척하거나 남의 조언을 무시하면 기회를 놓칩니다.",baseBonus:3},
  5:{name:"수",hanja:"需",poem:"비가 오기를 기다리는 농부처럼\n때가 오면 풍년을 맞이하리\n조급함을 버리고 준비를 갖추면\n반드시 좋은 기회가 찾아오리",meaning:"수괘는 기다림의 괘로, 준비하며 때를 기다리면 기회가 옵니다.",summary:"준비의 해입니다. 꾸준히 실력을 쌓으면 적절한 때에 기회가 찾아옵니다.",advice:"서두르지 말고 체계적으로 준비하세요.",caution:"조급해서 준비 없이 뛰어들면 실패합니다.",baseBonus:1},
  6:{name:"송",hanja:"訟",poem:"말을 조심하고 다툼을 피하면\n후에 평안을 얻으리라\n양보할 줄 아는 것이 진정한 승리\n마음을 비우면 복이 들어오리",meaning:"송괘는 다툼과 갈등을 주의해야 하는 괘입니다.",summary:"대인관계에서 갈등이 생길 수 있습니다. 말조심이 중요합니다.",advice:"감정적으로 대응하지 말고 이성적으로 판단하세요.",caution:"승부욕을 과하게 내면 손해를 봅니다.",baseBonus:-6},
  7:{name:"사",hanja:"師",poem:"큰 뜻을 품은 장수처럼\n리더십을 발휘하면 많은 이가 따르리",meaning:"사괘는 리더십과 통솔력을 의미합니다.",summary:"리더십이 빛나는 해입니다. 팀을 이끌면 좋은 성과를 냅니다.",advice:"소통과 협력으로 이끄세요.",caution:"권위적이면 반발을 삽니다.",baseBonus:5},
  8:{name:"비",hanja:"比",poem:"물이 땅 위에 있어 서로 친밀하니\n친구와 동료의 도움이 크리라",meaning:"비괘는 친밀함과 협력을 의미합니다.",summary:"인간관계가 핵심인 해입니다. 협업을 통해 큰 성과를 낼 수 있습니다.",advice:"주변 사람들에게 진심으로 다가가세요.",caution:"고립되면 기회를 놓칩니다.",baseBonus:6},
  9:{name:"소축",hanja:"小畜",poem:"작은 것을 모아 큰 것을 이루니\n소소한 행복이 모여 대복이 되리",meaning:"소축괘는 소소한 노력이 큰 결과를 만드는 괘입니다.",summary:"작은 것에서 큰 행복을 찾는 해입니다. 꾸준히 쌓아가세요.",advice:"매일 조금씩 저축하고 건강한 습관을 만드세요.",caution:"한탕주의나 과소비를 조심하세요.",baseBonus:2},
  10:{name:"이",hanja:"履",poem:"호랑이 꼬리를 밟아도 조심하면 무사하니\n겸손하게 행동하면 귀인이 나타나리",meaning:"이괘는 예의와 처세를 상징합니다.",summary:"처세술이 중요한 해입니다. 겸손하게 행동하면 위기도 넘어갑니다.",advice:"겸손하고 예의 바르게 행동하세요.",caution:"오만하면 화를 부릅니다.",baseBonus:0},
  11:{name:"태",hanja:"泰",poem:"하늘과 땅이 서로 통하니\n태평성대의 기운이 가득하리\n만사형통 기쁨이 넘치리라",meaning:"태괘는 가장 길한 괘 중 하나입니다.",summary:"최고의 운세를 가진 해입니다! 모든 분야에서 좋은 결과를 기대할 수 있습니다.",advice:"이 좋은 기운을 최대한 활용하세요!",caution:"방심하지 마세요. 기본에 충실하세요.",baseBonus:15},
  12:{name:"비(否)",hanja:"否",poem:"하늘과 땅이 막혀 소통이 안 되니\n잠시 멈추고 내면을 돌아보라",meaning:"비괘는 막힘의 괘로, 인내가 필요합니다.",summary:"일시적인 정체기입니다. 무리하지 말고 내실을 다지세요.",advice:"자기계발과 건강관리에 투자하세요.",caution:"큰 변화는 내년이 더 좋습니다.",baseBonus:-10},
  13:{name:"동인",hanja:"同人",poem:"같은 뜻을 품은 사람들이 모이니\n힘을 합치면 못할 일이 없으리",meaning:"동인괘는 함께함의 괘입니다.",summary:"좋은 동료나 파트너를 만나는 해입니다.",advice:"같은 목표를 가진 사람들과 적극 교류하세요.",caution:"신뢰할 수 있는 사람을 가려 사귀세요.",baseBonus:7},
  14:{name:"대유",hanja:"大有",poem:"태양이 하늘 높이 빛나듯이\n큰 재물과 명예가 따르리라",meaning:"대유괘는 재물과 명예가 모두 따르는 매우 길한 괘입니다.",summary:"물질적으로 풍요로운 해입니다! 수입이 증가하고 사회적 인정도 받습니다.",advice:"들어오는 재물을 잘 관리하고 나누세요.",caution:"과시하거나 사치를 부리면 복이 줄어듭니다.",baseBonus:14},
  15:{name:"겸",hanja:"謙",poem:"산이 땅 아래에 있으니\n겸손한 자에게 복이 넘치리",meaning:"겸괘는 겸손의 괘입니다.",summary:"겸손함이 최고의 무기인 해입니다.",advice:"말보다 행동으로 보여주세요.",caution:"자신감은 유지하되 오만함은 버리세요.",baseBonus:5},
  16:{name:"예",hanja:"豫",poem:"즐거움이 넘치는 한 해\n좋아하는 일을 하면 복이 오리",meaning:"예괘는 즐거움과 기쁨의 괘입니다.",summary:"즐거움이 가득한 해입니다!",advice:"좋아하는 일에 시간을 투자하세요.",caution:"쾌락에 빠져 중요한 일을 소홀히 하지 마세요.",baseBonus:8},
  17:{name:"수(隨)",hanja:"隨",poem:"물이 흐르듯 자연스럽게\n흐름을 따르면 좋은 곳에 이르리",meaning:"수괘는 흐름에 순응하면 좋은 결과를 얻는 괘입니다.",summary:"흐름을 읽고 순응하는 것이 중요합니다.",advice:"변화를 두려워하지 마세요.",caution:"너무 수동적이면 기회를 놓칩니다.",baseBonus:3},
  18:{name:"고",hanja:"蠱",poem:"오래된 것을 고치면 새로워지니\n낡은 습관을 버리면 새 길이 열리리",meaning:"고괘는 개혁과 쇄신의 괘입니다.",summary:"정리와 개혁의 해입니다. 낡은 것을 과감히 정리하세요.",advice:"하나씩 차근차근 개선하세요.",caution:"모든 것을 한꺼번에 바꾸려 하지 마세요.",baseBonus:-1},
  19:{name:"임",hanja:"臨",poem:"높은 곳에서 넓게 내려다보니\n큰 뜻을 품고 다가가면 사람들이 따르리",meaning:"임괘는 적극적으로 다가가면 좋은 결과를 얻는 길한 괘입니다.",summary:"적극성이 빛나는 해입니다!",advice:"기다리지 말고 먼저 움직이세요.",caution:"적극적인 것과 무례한 것은 다릅니다.",baseBonus:9},
  20:{name:"관",hanja:"觀",poem:"멀리서 관찰하면 진실이 보이니\n섣불리 판단하지 말고 지켜보라",meaning:"관괘는 관찰의 괘입니다.",summary:"관찰과 분석의 해입니다.",advice:"급하게 결정하지 말고 충분히 관찰하세요.",caution:"너무 신중해서 기회를 놓치지 마세요.",baseBonus:0},
  21:{name:"서합",hanja:"噬嗑",poem:"장애물을 깨물어 부수면\n막혔던 길이 뻥 뚫리리",meaning:"서합괘는 장애물을 극복하는 괘입니다.",summary:"장애물이 있지만 극복할 수 있는 해입니다.",advice:"문제를 회피하지 마세요.",caution:"과도한 무력이나 강압은 역효과를 냅니다.",baseBonus:-3},
  22:{name:"비(賁)",hanja:"賁",poem:"산 아래 불이 빛나듯이\n아름다움과 재능이 빛나리라",meaning:"비괘는 재능과 매력이 빛나는 시기입니다.",summary:"매력과 재능이 빛나는 해입니다!",advice:"자신을 가꾸고 표현하세요.",caution:"겉모습에만 치중하면 내실이 부족해집니다.",baseBonus:7},
  23:{name:"박",hanja:"剝",poem:"나뭇잎이 떨어져 겨울이 되니\n잠시 쉬면서 봄을 기다리라",meaning:"박괘는 잠시 쉬어가는 것이 필요한 시기입니다.",summary:"정리와 쉼의 해입니다. 건강 관리에 신경 쓰세요.",advice:"무리하지 마세요.",caution:"무리하게 추진하면 오히려 잃습니다.",baseBonus:-12},
  24:{name:"복",hanja:"復",poem:"겨울이 지나고 봄이 돌아오니\n새로운 희망이 싹트리라",meaning:"복괘는 좋은 운이 돌아오는 전환점입니다.",summary:"운이 회복되는 해입니다! 새로운 시작의 에너지가 넘칩니다.",advice:"새로운 마음으로 시작하세요.",caution:"아직 완전히 회복되지 않은 상태에서 무리하지 마세요.",baseBonus:6},
  25:{name:"무망",hanja:"無妄",poem:"꾸미지 않아도 진실하면 통하리\n정직하게 살면 하늘이 돕고",meaning:"무망괘는 진실하게 살면 좋은 결과를 얻는 괘입니다.",summary:"정직과 진실이 힘을 발휘하는 해입니다.",advice:"솔직하고 진실하게 행동하세요.",caution:"계산적이거나 거짓된 행동은 들통납니다.",baseBonus:4},
  26:{name:"대축",hanja:"大畜",poem:"큰 산이 하늘을 품듯이\n큰 것을 축적하면 대성하리",meaning:"대축괘는 실력과 재물을 크게 모을 수 있는 길한 괘입니다.",summary:"크게 모으는 해입니다! 모든 것이 축적됩니다.",advice:"아낌없이 투자하고 배우세요.",caution:"모으기만 하면 균형이 깨집니다.",baseBonus:10},
  27:{name:"이(頤)",hanja:"頤",poem:"입을 잘 관리하면 건강하리\n먹는 것과 말하는 것을 조심하면",meaning:"이괘는 건강과 섭생에 주의를 기울이는 괘입니다.",summary:"건강관리가 핵심인 해입니다.",advice:"규칙적인 식사와 운동을 생활화하세요.",caution:"폭식, 과음, 불규칙한 생활을 조심하세요.",baseBonus:-4},
  28:{name:"대과",hanja:"大過",poem:"큰 파도가 밀려와도\n중심을 잡으면 넘어지지 않으리",meaning:"대과괘는 큰 도전이 있지만 감당하면 크게 성장합니다.",summary:"평소보다 큰 도전이 찾아옵니다.",advice:"두려워하지 말고 도전하세요.",caution:"혼자 감당하려 하지 마세요.",baseBonus:-5},
  29:{name:"감",hanja:"坎",poem:"물이 겹겹이 흐르는 험한 길이나\n지혜로우면 빠져나올 수 있으리",meaning:"감괘는 어려움이 있지만 지혜로 극복할 수 있습니다.",summary:"도전적인 해입니다. 침착하게 대처하세요.",advice:"주변에 도움을 요청하세요.",caution:"무모한 도전이나 위험한 투자는 절대 삼가세요.",baseBonus:-8},
  30:{name:"리",hanja:"離",poem:"불이 밝게 타올라 세상을 비추니\n재능이 빛나고 인정받으리라",meaning:"리괘는 재능과 열정이 빛나는 매우 길한 괘입니다.",summary:"재능이 세상에 빛나는 해입니다!",advice:"열정을 다해 몰두하세요.",caution:"번아웃에 주의하세요. 휴식도 잊지 마세요.",baseBonus:11},
};

/* ─── 월별 테마·이모지 ─── */
const M_THEMES = [
  {theme:"새해 새 출발",desc:"새로운 목표를 세우고 계획을 짜기 좋은 달입니다."},
  {theme:"기반 다지기",desc:"기초를 단단히 하는 달입니다."},
  {theme:"봄의 시작",desc:"새로운 기운이 솟아오릅니다."},
  {theme:"성장과 발전",desc:"노력한 만큼 결과가 보이기 시작합니다."},
  {theme:"인연의 달",desc:"좋은 사람을 만나거나 기존 인연이 깊어집니다."},
  {theme:"활력 충전",desc:"에너지가 넘치는 달! 적극적으로 행동하세요."},
  {theme:"중간 점검",desc:"상반기를 돌아보고 하반기를 준비하세요."},
  {theme:"수확의 시작",desc:"상반기에 뿌린 씨앗이 열매를 맺기 시작합니다."},
  {theme:"도약의 기회",desc:"새로운 기회가 찾아올 수 있는 달입니다."},
  {theme:"풍성한 결실",desc:"한 해의 노력이 결실을 맺는 달입니다."},
  {theme:"정리와 준비",desc:"남은 한 해를 정리하고 내년을 준비하세요."},
  {theme:"마무리의 지혜",desc:"한 해를 잘 마무리하세요."},
];
const M_EMOJI = ["❄️","🌸","🌷","🌱","🌞","☀️","🌊","🍃","🍂","🎃","🍁","⛄"];

/* ─── 카테고리 텍스트 ─── */
const CAT_TEXT: Record<string,{high:string,low:string,tip:string}> = {
  재물:{high:"재물운이 좋습니다! 투자나 사업에서 좋은 수익을 기대할 수 있습니다.",low:"지출이 많을 수 있습니다. 불필요한 소비를 줄이고 큰 투자는 신중하게.",tip:"매달 일정 금액을 저축하고, 충동구매를 줄이세요."},
  건강:{high:"건강운이 좋아 활력이 넘칩니다!",low:"건강에 주의가 필요합니다. 정기 검진을 받으세요.",tip:"일주일에 3번 이상 운동하고 충분히 수면하세요."},
  애정:{high:"연애운이 빛납니다! 좋은 인연을 만날 수 있습니다.",low:"연애에서 시련이 있을 수 있습니다. 대화를 많이 하세요.",tip:"마음을 솔직하게 표현하세요."},
  직업:{high:"직업운이 상승합니다! 승진·이직에 좋은 소식이 있을 수 있습니다.",low:"직장에서 변화가 있을 수 있습니다. 실력을 쌓으세요.",tip:"자기계발에 투자하면 좋은 기회가 옵니다."},
  학업:{high:"학업운이 좋습니다! 시험·자격증에서 좋은 성과를 기대할 수 있습니다.",low:"집중력이 떨어질 수 있습니다. 공부 환경을 정리하세요.",tip:"아침 시간 활용 공부가 효과적입니다."},
};

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
        branchDescs.push(`[톱니 3-${i+1}] 내 ${labels[i]}(${myBranches[i]}${JIJI_HANJA[myBranches[i]]}) × 세운(${SEYUN_JI}${JIJI_HANJA[SEYUN_JI]}) = ${rel.type} → ${rel.desc}`);
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
        stemDescs.push(`[톱니 4] 내 ${sLabels[i]}(${myStems[sIdxs[i]]}${CHEONGAN_HANJA[myStems[sIdxs[i]]]}) × 세운(${SEYUN_GAN}${CHEONGAN_HANJA[SEYUN_GAN]}) = ${rel.desc}`);
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
        ? `${yearJiKo}띠 2026년은 '${samjaeTypes[samjaeIdx]}'에 해당합니다. ${samjaeIdx === 1 ? "가장 주의가 필요한 해입니다. 건강·재물 관리에 신중하세요." : samjaeIdx === 0 ? "삼재가 시작되는 해로, 새로운 일에 주의가 필요합니다." : "삼재가 끝나가는 해로, 조금만 더 인내하면 좋은 시기가 옵니다."}`
        : `${yearJiKo}띠는 2026년 삼재에 해당하지 않습니다.`,
    };

    /* ═══ 8) 톱니바퀴 분석 텍스트 ═══ */
    // 세운 지지(午)의 지장간 정기 = 丁(정화)
    const seyunJiJeonggi = "정";
    const seyunJiJeonggiOh = GAN_OHAENG[seyunJiJeonggi]; // 화
    const seyunJiSameYY = (dayGanIdx % 2) === (CHEONGAN.indexOf(seyunJiJeonggi) % 2);
    const seyunJiSipsin = getSipsin(dayGanOh, seyunJiJeonggiOh, seyunJiSameYY);

    const gearAnalysis: string[] = [
      `⚙️ [톱니 1] 내 일간 ${dayGan}${CHEONGAN_HANJA[dayGan]}(${dayGanOh}) × 세운 천간 ${SEYUN_GAN}${CHEONGAN_HANJA[SEYUN_GAN]}(${SEYUN_GAN_OH}) = ${seyunSipsin} ${seyunBonus > 0 ? "⬆" : seyunBonus < 0 ? "⬇" : ""} (${seyunBonus > 0 ? "+" : ""}${seyunBonus}점)`,
      `⚙️ [톱니 2] 내 일간 ${dayGan}${CHEONGAN_HANJA[dayGan]}(${dayGanOh}) × 세운 지지 ${SEYUN_JI}${JIJI_HANJA[SEYUN_JI]}(정기 ${seyunJiJeonggi}${CHEONGAN_HANJA[seyunJiJeonggi]}·${seyunJiJeonggiOh}) = ${seyunJiSipsin}`,
      ...branchDescs.map(d => `⚙️ ${d}`),
      ...stemDescs.map(d => `⚙️ ${d}`),
    ];
    if (branchDescs.length === 0 && stemDescs.length === 0) {
      gearAnalysis.push("⚙️ [톱니 3-4] 원국과 세운 사이 특별한 합충형 없음 → 평온한 흐름");
    }
    if (samjaeActive) {
      gearAnalysis.push(`⚙️ [삼재] ${samjae.type} 해당 → ${samjaeIdx === 1 ? "가장 주의 필요 ⬇⬇" : "주의 필요 ⬇"} (${samjaeBonus}점)`);
    }
    if (!hasHour) {
      gearAnalysis.push("⚙️ [톱니 5] 시주 미입력 → 시간을 입력하면 더 정밀한 분석이 가능합니다");
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
    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("토정비결 오류:", error);
    return NextResponse.json(
      { error: "토정비결 계산 중 오류: " + (error?.message || "알 수 없는 오류") },
      { status: 500 }
    );
  }
}
