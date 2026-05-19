import { NextRequest, NextResponse } from 'next/server';
import { getTarotCardImagePath } from '@/data/tarotCardImages';

interface BaseTarotCard {
  name: string;
  english: string;
  upright: string;
  reversed: string;
  advice: string;
  suit?: string;
  rank?: string;
}

const TAROT_CARDS: BaseTarotCard[] = [
  {
    name: '바보',
    english: 'The Fool',
    upright: '새로운 시작, 가능성, 순수한 용기',
    reversed: '준비 부족, 충동, 방향 없는 선택',
    advice: '시작 자체는 좋지만, 최소한의 계획과 안전장치는 갖추는 편이 좋습니다.',
  },
  {
    name: '마법사',
    english: 'The Magician',
    upright: '실행력, 재능, 말과 설득의 힘',
    reversed: '말뿐인 계획, 산만함, 능력의 낭비',
    advice: '이미 가진 도구를 믿고, 작게라도 바로 실행하는 것이 중요합니다.',
  },
  {
    name: '여사제',
    english: 'The High Priestess',
    upright: '직감, 숨은 정보, 조용한 관찰',
    reversed: '불안한 예감, 비밀, 판단 유보',
    advice: '겉으로 드러난 말보다 분위기와 내면의 신호를 함께 살피세요.',
  },
  {
    name: '여황제',
    english: 'The Empress',
    upright: '풍요, 관계의 따뜻함, 성장',
    reversed: '과한 기대, 감정적 의존, 돌봄의 피로',
    advice: '무리하게 애쓰기보다 자연스럽게 자라나는 흐름을 지켜보는 편이 좋습니다.',
  },
  {
    name: '황제',
    english: 'The Emperor',
    upright: '기준, 책임, 안정적인 결정',
    reversed: '고집, 통제, 권위의 부담',
    advice: '원칙을 세우되, 상대나 상황을 지나치게 밀어붙이지 않는 균형이 필요합니다.',
  },
  {
    name: '교황',
    english: 'The Hierophant',
    upright: '조언, 전통, 신뢰할 수 있는 기준',
    reversed: '답답한 관습, 타인의 시선, 형식주의',
    advice: '혼자 결정하기보다 믿을 만한 사람의 조언을 참고하면 좋습니다.',
  },
  {
    name: '연인',
    english: 'The Lovers',
    upright: '끌림, 선택, 관계의 조화',
    reversed: '갈등, 우유부단, 마음과 현실의 불일치',
    advice: '감정만 보지 말고 선택 뒤에 따라오는 책임까지 함께 보세요.',
  },
  {
    name: '전차',
    english: 'The Chariot',
    upright: '전진, 승부, 의지로 밀고 나감',
    reversed: '방향 상실, 과속, 감정적 충돌',
    advice: '움직이되 목적지를 분명히 해야 힘이 흩어지지 않습니다.',
  },
  {
    name: '힘',
    english: 'Strength',
    upright: '부드러운 통제, 인내, 내면의 힘',
    reversed: '감정 폭발, 자신감 저하, 참는 척하는 피로',
    advice: '강하게 이기려 하기보다 부드럽게 버티는 태도가 더 유리합니다.',
  },
  {
    name: '은둔자',
    english: 'The Hermit',
    upright: '숙고, 거리두기, 깊은 통찰',
    reversed: '고립, 지나친 생각, 기회 회피',
    advice: '잠시 혼자 정리하는 시간은 필요하지만, 너무 오래 닫혀 있지는 마세요.',
  },
  {
    name: '운명의 수레바퀴',
    english: 'Wheel of Fortune',
    upright: '전환점, 흐름 변화, 뜻밖의 기회',
    reversed: '타이밍 어긋남, 반복되는 패턴, 흐름 지연',
    advice: '억지로 밀기보다 흐름이 바뀌는 신호를 잘 포착하는 것이 중요합니다.',
  },
  {
    name: '정의',
    english: 'Justice',
    upright: '공정함, 계약, 균형 잡힌 판단',
    reversed: '불공정, 책임 회피, 판단 오류',
    advice: '감정보다 사실, 약속, 조건을 기준으로 판단해야 합니다.',
  },
  {
    name: '매달린 사람',
    english: 'The Hanged Man',
    upright: '멈춤, 관점 전환, 기다림의 의미',
    reversed: '헛된 희생, 답답한 정체, 미련',
    advice: '지금 당장 움직이지 못하는 상황에도 배울 점이 있습니다.',
  },
  {
    name: '죽음',
    english: 'Death',
    upright: '끝맺음, 전환, 새 단계',
    reversed: '놓지 못함, 변화 거부, 미완의 정리',
    advice: '불길한 카드가 아니라, 오래된 흐름을 정리하라는 신호로 보세요.',
  },
  {
    name: '절제',
    english: 'Temperance',
    upright: '조율, 회복, 적당한 속도',
    reversed: '균형 붕괴, 과로, 감정의 치우침',
    advice: '지금은 빠른 결론보다 속도와 균형을 맞추는 것이 우선입니다.',
  },
  {
    name: '악마',
    english: 'The Devil',
    upright: '집착, 유혹, 벗어나기 어려운 패턴',
    reversed: '해방, 의존에서 벗어남, 현실 자각',
    advice: '무엇에 묶여 있는지 인정하는 순간부터 선택권이 돌아옵니다.',
  },
  {
    name: '탑',
    english: 'The Tower',
    upright: '충격, 갑작스러운 변화, 무너지는 착각',
    reversed: '위기 회피, 작은 균열, 늦어진 변화',
    advice: '불편한 진실을 빨리 확인할수록 더 큰 손실을 막을 수 있습니다.',
  },
  {
    name: '별',
    english: 'The Star',
    upright: '희망, 회복, 긴 호흡의 가능성',
    reversed: '실망, 자신감 저하, 희망의 지연',
    advice: '당장 결과가 작아 보여도 회복의 방향은 열려 있습니다.',
  },
  {
    name: '달',
    english: 'The Moon',
    upright: '불확실성, 감정, 숨은 두려움',
    reversed: '오해 해소, 진실이 드러남, 불안의 정리',
    advice: '아직 모든 정보가 보이지 않습니다. 추측으로 결론 내리지 마세요.',
  },
  {
    name: '태양',
    english: 'The Sun',
    upright: '성공, 밝은 에너지, 분명한 기쁨',
    reversed: '기쁨의 지연, 과한 낙관, 체력 소모',
    advice: '좋은 흐름입니다. 다만 너무 들떠서 세부를 놓치지 않게 하세요.',
  },
  {
    name: '심판',
    english: 'Judgement',
    upright: '결론, 부름, 다시 기회가 오는 순간',
    reversed: '미루는 결정, 자기비판, 과거에 묶임',
    advice: '이미 알고 있던 답을 더 이상 미루지 않는 것이 좋습니다.',
  },
  {
    name: '세계',
    english: 'The World',
    upright: '완성, 성취, 다음 단계로 이동',
    reversed: '마무리 부족, 미완성, 다음 단계 지연',
    advice: '거의 끝까지 왔습니다. 마무리와 정리가 다음 문을 엽니다.',
  },
];

const SUIT_GUIDES = [
  {
    suit: '완드',
    english: 'Wands',
    element: '불',
    theme: '의지, 추진력, 일의 시작',
    advice: '생각만 하기보다 작게라도 움직이면 흐름이 살아납니다.',
  },
  {
    suit: '컵',
    english: 'Cups',
    element: '물',
    theme: '감정, 관계, 마음의 만족',
    advice: '상대의 말보다 감정의 온도와 내 마음의 편안함을 함께 살피세요.',
  },
  {
    suit: '소드',
    english: 'Swords',
    element: '공기',
    theme: '생각, 판단, 갈등과 정리',
    advice: '감정에 휩쓸리기보다 사실과 논리를 분리해서 보는 것이 좋습니다.',
  },
  {
    suit: '펜타클',
    english: 'Pentacles',
    element: '흙',
    theme: '현실, 돈, 몸, 결과',
    advice: '실제 조건과 숫자, 시간표를 확인하면 판단이 훨씬 선명해집니다.',
  },
];

const RANK_GUIDES = [
  { rank: '에이스', english: 'Ace', upright: '새로운 씨앗과 시작', reversed: '시작 지연과 준비 부족' },
  { rank: '2', english: 'Two', upright: '균형, 선택, 두 흐름 사이의 조율', reversed: '우유부단과 균형의 흔들림' },
  { rank: '3', english: 'Three', upright: '확장, 협력, 첫 성과', reversed: '협업의 어긋남과 기대 차이' },
  { rank: '4', english: 'Four', upright: '안정, 정리, 기반 마련', reversed: '정체, 닫힌 태도, 변화 거부' },
  { rank: '5', english: 'Five', upright: '갈등, 손실, 조정이 필요한 순간', reversed: '회복의 시작과 갈등 완화' },
  { rank: '6', english: 'Six', upright: '도움, 회복, 균형이 돌아오는 흐름', reversed: '주고받음의 불균형과 미련' },
  { rank: '7', english: 'Seven', upright: '전략, 경계, 버티는 힘', reversed: '방어 과다와 판단 흐림' },
  { rank: '8', english: 'Eight', upright: '속도, 집중, 반복을 통한 진전', reversed: '지연, 산만함, 속도 조절 필요' },
  { rank: '9', english: 'Nine', upright: '완성 직전, 독립, 내면의 힘', reversed: '피로 누적과 지나친 경계' },
  { rank: '10', english: 'Ten', upright: '완성, 부담, 다음 단계로 넘어갈 문턱', reversed: '과부하, 내려놓아야 할 책임' },
  { rank: '페이지', english: 'Page', upright: '새 소식, 배움, 서툴지만 진심 있는 시작', reversed: '미숙함, 가벼운 말, 집중 부족' },
  { rank: '나이트', english: 'Knight', upright: '움직임, 추구, 방향성 있는 행동', reversed: '과속, 감정적 행동, 방향 상실' },
  { rank: '퀸', english: 'Queen', upright: '성숙한 수용, 감각, 돌보는 힘', reversed: '감정 소모, 과한 배려, 흔들리는 중심' },
  { rank: '킹', english: 'King', upright: '통제력, 결정, 책임 있는 완성', reversed: '고집, 통제 과잉, 책임 회피' },
];

const MINOR_CARD_DETAILS: Record<string, Record<string, { upright: string; reversed: string; advice: string }>> = {
  완드: {
    에이스: {
      upright: '새로운 열정, 기회, 시작할 힘이 생기는 카드',
      reversed: '의욕은 있지만 방향이 흐릿하거나 시작이 늦어지는 카드',
      advice: '아이디어를 오래 붙잡기보다 작게라도 시작해 불씨를 살리는 것이 좋습니다.',
    },
    '2': {
      upright: '가능성을 넓게 보고 다음 계획을 세우는 카드',
      reversed: '큰 그림은 있지만 결정을 미루거나 시야가 좁아지는 카드',
      advice: '선택지를 펼쳐놓고, 지금 내가 통제할 수 있는 첫 단계부터 정하세요.',
    },
    '3': {
      upright: '준비한 일이 밖으로 확장되고 첫 반응이 오는 카드',
      reversed: '기대만큼 속도가 나지 않거나 협력이 늦어지는 카드',
      advice: '당장 결과보다 다음 연결, 제안, 확장의 가능성을 확인하세요.',
    },
    '4': {
      upright: '축하, 안정, 작은 성취와 기반이 잡히는 카드',
      reversed: '겉으로는 안정적이나 마음 한편이 허전하거나 불안한 카드',
      advice: '이미 만든 성과를 인정하고, 주변과 나눌 수 있는 부분을 찾아보세요.',
    },
    '5': {
      upright: '경쟁, 의견 충돌, 에너지가 한곳에 모이지 않는 카드',
      reversed: '불필요한 싸움에서 빠져나오거나 갈등을 정리하는 카드',
      advice: '이기려 하기보다 목표를 다시 맞추는 것이 더 빠른 해결책입니다.',
    },
    '6': {
      upright: '인정, 승리, 노력의 결과가 드러나는 카드',
      reversed: '인정이 늦어지거나 자존심 때문에 흐름이 꼬이는 카드',
      advice: '성과를 드러내되 과시보다 신뢰를 남기는 방식이 좋습니다.',
    },
    '7': {
      upright: '방어, 버티기, 내 입장을 지켜야 하는 카드',
      reversed: '지나친 방어로 피로해지거나 물러설 타이밍을 놓치는 카드',
      advice: '모든 것을 방어하지 말고 정말 지켜야 할 기준만 분명히 하세요.',
    },
    '8': {
      upright: '빠른 소식, 속도, 갑작스럽게 일이 움직이는 카드',
      reversed: '연락 지연, 일정 꼬임, 속도 조절이 필요한 카드',
      advice: '기회가 빨리 움직일 수 있으니 답변과 준비를 미루지 마세요.',
    },
    '9': {
      upright: '끝까지 버티는 힘, 경계, 마지막 고비를 넘는 카드',
      reversed: '피로 누적, 의심 과다, 더 버티기 어려운 카드',
      advice: '버티는 것만 답은 아닙니다. 도움을 받을 지점도 함께 살피세요.',
    },
    '10': {
      upright: '책임 과중, 혼자 짊어진 부담, 마무리 직전의 압박 카드',
      reversed: '짐을 내려놓거나 책임을 나누어야 하는 카드',
      advice: '혼자 다 해결하려 하지 말고 위임하거나 우선순위를 줄이세요.',
    },
    페이지: {
      upright: '새로운 소식, 호기심, 배움을 시작하는 카드',
      reversed: '가벼운 말, 준비 부족, 흥미가 쉽게 식는 카드',
      advice: '초보자의 마음은 좋지만 약속과 실행 계획은 구체적으로 잡으세요.',
    },
    나이트: {
      upright: '열정적인 돌진, 빠른 행동, 강한 추진력의 카드',
      reversed: '충동, 성급함, 방향 없는 질주를 뜻하는 카드',
      advice: '속도는 장점이지만 오늘은 목적지를 확인한 뒤 움직이세요.',
    },
    퀸: {
      upright: '당당함, 매력, 사람을 끌어들이는 따뜻한 에너지의 카드',
      reversed: '자존심 상처, 감정 기복, 인정 욕구가 커지는 카드',
      advice: '자신감을 잃지 않되 상대의 반응에 지나치게 흔들리지 마세요.',
    },
    킹: {
      upright: '리더십, 결단, 큰 그림을 밀고 가는 카드',
      reversed: '고집, 독단, 내 방식만 옳다고 보는 카드',
      advice: '결정권을 갖되, 주변이 따라올 수 있는 설명도 함께 준비하세요.',
    },
  },
  컵: {
    에이스: {
      upright: '새로운 감정, 사랑, 마음이 열리는 시작의 카드',
      reversed: '감정이 막히거나 표현하지 못해 답답한 카드',
      advice: '마음이 움직였다면 부드럽게 표현하되 상대의 속도도 존중하세요.',
    },
    '2': {
      upright: '상호 호감, 화해, 마음이 맞는 관계의 카드',
      reversed: '마음의 엇갈림, 관계 균형의 흔들림을 뜻하는 카드',
      advice: '관계에서는 승패보다 서로 같은 방향을 보는지가 중요합니다.',
    },
    '3': {
      upright: '축하, 모임, 좋은 소식과 관계의 즐거움 카드',
      reversed: '소문, 과한 친목, 관계 속 피로가 생기는 카드',
      advice: '즐거움은 좋지만 말이 많아지는 자리에서는 선을 지키세요.',
    },
    '4': {
      upright: '권태, 무심함, 이미 있는 기회를 못 보는 카드',
      reversed: '닫힌 마음이 열리고 새 제안을 받아들이는 카드',
      advice: '불만만 보지 말고 지금 들어와 있는 선택지를 다시 확인하세요.',
    },
    '5': {
      upright: '실망, 후회, 잃은 것에 마음이 머무는 카드',
      reversed: '상처 회복, 남아 있는 가능성을 보는 카드',
      advice: '끝난 일보다 아직 남아 있는 관계와 기회를 먼저 보세요.',
    },
    '6': {
      upright: '추억, 과거 인연, 순수한 마음이 되살아나는 카드',
      reversed: '과거에 묶이거나 미련이 현재를 방해하는 카드',
      advice: '추억은 참고하되 지금의 현실과 상대를 새롭게 보세요.',
    },
    '7': {
      upright: '상상, 선택지 과다, 환상과 현실이 섞이는 카드',
      reversed: '환상이 걷히고 현실적인 선택이 보이는 카드',
      advice: '좋아 보이는 것보다 실제로 가능한 것을 기준으로 고르세요.',
    },
    '8': {
      upright: '떠남, 미련을 뒤로하고 더 나은 길로 가는 카드',
      reversed: '떠나야 하는데 망설이거나 감정적으로 붙잡는 카드',
      advice: '마음이 이미 떠난 일이라면 정리의 이유를 인정해야 합니다.',
    },
    '9': {
      upright: '만족, 소원 성취, 마음의 여유가 생기는 카드',
      reversed: '겉으론 괜찮지만 내면의 공허가 남는 카드',
      advice: '원하는 결과만 보지 말고 그것이 정말 나를 편안하게 하는지 확인하세요.',
    },
    '10': {
      upright: '가족적 행복, 관계의 안정, 감정적 완성의 카드',
      reversed: '겉보기 행복과 실제 마음 사이의 거리 카드',
      advice: '관계의 모양보다 실제 대화와 정서적 안정감을 먼저 보세요.',
    },
    페이지: {
      upright: '감성적 소식, 고백, 섬세한 마음의 카드',
      reversed: '감정 미숙, 오해, 어린 마음으로 반응하는 카드',
      advice: '마음은 솔직하게 전하되 해석을 앞서가지 않는 것이 좋습니다.',
    },
    나이트: {
      upright: '로맨틱한 제안, 감정의 이동, 매력적인 접근 카드',
      reversed: '달콤한 말과 현실의 차이, 감정적 흔들림 카드',
      advice: '말의 분위기보다 실제 행동이 이어지는지 확인하세요.',
    },
    퀸: {
      upright: '공감, 돌봄, 깊은 감정 이해의 카드',
      reversed: '감정 소모, 과한 배려, 마음의 경계 부족 카드',
      advice: '상대를 이해하되 내 감정을 희생하지 않는 선을 세우세요.',
    },
    킹: {
      upright: '감정을 성숙하게 다루는 안정적 리더십 카드',
      reversed: '감정 억압, 냉정한 척하는 불안, 회피 카드',
      advice: '감정을 통제하는 것과 숨기는 것은 다릅니다. 차분히 표현하세요.',
    },
  },
  소드: {
    에이스: {
      upright: '명확한 판단, 진실, 새로운 결론이 서는 카드',
      reversed: '혼란, 말실수, 판단이 흐려지는 카드',
      advice: '감정보다 사실을 먼저 정리하면 답이 선명해집니다.',
    },
    '2': {
      upright: '결정 보류, 마음의 차단, 두 선택 사이의 카드',
      reversed: '억눌렀던 문제가 드러나며 결정을 피하기 어려운 카드',
      advice: '보지 않으려 했던 정보를 마주해야 선택이 쉬워집니다.',
    },
    '3': {
      upright: '상처, 실망, 마음 아픈 진실을 마주하는 카드',
      reversed: '상처 회복, 아픈 말을 정리하는 카드',
      advice: '아픈 결론이라도 사실을 인정하면 회복이 시작됩니다.',
    },
    '4': {
      upright: '휴식, 회복, 잠시 멈춰 생각을 정리하는 카드',
      reversed: '쉬지 못한 피로, 회복 지연, 다시 움직여야 하는 카드',
      advice: '답을 내기 전에 몸과 생각을 쉬게 하는 시간이 필요합니다.',
    },
    '5': {
      upright: '말다툼, 이겨도 상처가 남는 갈등의 카드',
      reversed: '갈등에서 물러나거나 화해 가능성이 생기는 카드',
      advice: '논리로 이기는 것보다 관계와 손실을 함께 계산하세요.',
    },
    '6': {
      upright: '이동, 회복을 위한 거리두기, 조용한 전환 카드',
      reversed: '과거 문제에서 벗어나지 못하거나 이동이 지연되는 카드',
      advice: '완벽한 해결보다 안전한 방향으로 천천히 이동하는 것이 좋습니다.',
    },
    '7': {
      upright: '전략, 비밀스러운 움직임, 조심스러운 선택 카드',
      reversed: '숨긴 일이 드러나거나 스스로 속임을 깨닫는 카드',
      advice: '영리함은 필요하지만 신뢰를 해치는 방식은 피하세요.',
    },
    '8': {
      upright: '제약, 두려움, 스스로 갇힌 듯한 느낌의 카드',
      reversed: '묶인 생각에서 벗어나 선택권을 회복하는 카드',
      advice: '정말 막힌 것과 내가 두려워서 못 하는 것을 분리해보세요.',
    },
    '9': {
      upright: '걱정, 불면, 과도한 불안이 커지는 카드',
      reversed: '불안을 말로 꺼내며 회복이 시작되는 카드',
      advice: '머릿속에서만 반복하지 말고 종이에 적어 현실 크기로 줄이세요.',
    },
    '10': {
      upright: '끝, 바닥, 더는 버티기 어려운 상황의 카드',
      reversed: '최악을 지나 회복의 빛이 들어오는 카드',
      advice: '끝난 것을 붙잡기보다 회복 계획을 세우는 쪽이 낫습니다.',
    },
    페이지: {
      upright: '관찰, 정보 수집, 날카로운 호기심의 카드',
      reversed: '소문, 의심, 말이 앞서 문제를 키우는 카드',
      advice: '확인되지 않은 말보다 직접 확인한 정보를 기준으로 삼으세요.',
    },
    나이트: {
      upright: '빠른 판단, 직설적 행동, 돌파의 카드',
      reversed: '성급한 말, 공격적 태도, 앞뒤 안 보는 결정 카드',
      advice: '정확함은 좋지만 말의 온도를 낮춰야 결과가 좋아집니다.',
    },
    퀸: {
      upright: '냉철한 판단, 독립성, 진실을 보는 카드',
      reversed: '차가운 말, 상처에서 나온 방어적 판단 카드',
      advice: '명확함은 유지하되 사람을 베는 말은 피하세요.',
    },
    킹: {
      upright: '이성적 결론, 원칙, 전문적 판단의 카드',
      reversed: '권위적 판단, 냉정함의 과잉, 말의 압박 카드',
      advice: '원칙은 세우되 상대가 납득할 근거를 함께 제시하세요.',
    },
  },
  펜타클: {
    에이스: {
      upright: '새로운 재물 기회, 현실적 시작, 좋은 제안의 카드',
      reversed: '기회 지연, 돈 관리 부족, 현실 검토가 필요한 카드',
      advice: '좋은 기회일수록 조건과 숫자를 꼼꼼히 확인하세요.',
    },
    '2': {
      upright: '두 가지 일을 조율하고 현실 균형을 잡는 카드',
      reversed: '일정, 돈, 책임이 흔들리며 우선순위가 필요한 카드',
      advice: '동시에 다 하려 하지 말고 가장 중요한 하나부터 정리하세요.',
    },
    '3': {
      upright: '협업, 실력 인정, 함께 만드는 성과의 카드',
      reversed: '역할 혼선, 기준 미달, 협업의 불균형 카드',
      advice: '혼자 해결보다 역할과 기준을 명확히 나누는 것이 좋습니다.',
    },
    '4': {
      upright: '소유, 안정, 지키려는 마음이 강한 카드',
      reversed: '집착을 내려놓거나 돈의 흐름이 막히는 카드',
      advice: '지키는 것도 중요하지만 너무 움켜쥐면 기회가 막힐 수 있습니다.',
    },
    '5': {
      upright: '부족감, 경제적 불안, 소외감을 느끼는 카드',
      reversed: '도움이 보이고 회복의 길을 찾는 카드',
      advice: '혼자 버티지 말고 받을 수 있는 도움과 자원을 찾아보세요.',
    },
    '6': {
      upright: '도움, 나눔, 공정한 주고받음의 카드',
      reversed: '불공정한 거래, 의존, 주고받음의 불균형 카드',
      advice: '도움은 받되 조건과 경계를 분명히 하면 좋습니다.',
    },
    '7': {
      upright: '기다림, 투자한 것의 성장, 중간 점검의 카드',
      reversed: '성과 지연, 조급함, 방향 재검토가 필요한 카드',
      advice: '당장 결과가 작아도 무엇이 자라고 있는지 점검하세요.',
    },
    '8': {
      upright: '실력 향상, 반복, 성실한 작업의 카드',
      reversed: '숙련 부족, 반복 피로, 집중력 저하 카드',
      advice: '화려한 선택보다 꾸준한 연습과 루틴이 답입니다.',
    },
    '9': {
      upright: '자립, 여유, 스스로 만든 성취의 카드',
      reversed: '겉보기 안정 뒤의 의존, 만족감 부족 카드',
      advice: '내 힘으로 만든 성과를 인정하되 과소비나 과시를 조심하세요.',
    },
    '10': {
      upright: '가족, 자산, 장기적 안정과 유산의 카드',
      reversed: '가족/돈 문제의 균열, 장기 계획의 재정비 카드',
      advice: '단기 이익보다 오래 남을 구조와 신뢰를 우선하세요.',
    },
    페이지: {
      upright: '공부, 실무 시작, 현실적인 기회 탐색의 카드',
      reversed: '계획만 하고 실행이 늦거나 기초가 부족한 카드',
      advice: '배우는 단계라면 작게 실습하며 몸에 익히는 것이 중요합니다.',
    },
    나이트: {
      upright: '성실함, 꾸준한 전진, 느리지만 확실한 카드',
      reversed: '고집, 정체, 변화 없는 반복 카드',
      advice: '느린 속도는 문제가 아니지만 방향 점검은 필요합니다.',
    },
    퀸: {
      upright: '현실 감각, 돌봄, 안정적인 풍요의 카드',
      reversed: '과로, 돈 걱정, 돌봄의 부담이 커지는 카드',
      advice: '남을 챙기기 전에 내 생활과 몸의 기반을 먼저 안정시키세요.',
    },
    킹: {
      upright: '사업 감각, 재정 안정, 책임 있는 성취의 카드',
      reversed: '물질 집착, 보수적 고집, 돈으로 통제하는 카드',
      advice: '성과를 키우되 사람과 신뢰를 숫자보다 아래에 두지 마세요.',
    },
  },
};

function buildMinorArcana(): BaseTarotCard[] {
  return SUIT_GUIDES.flatMap((suit) =>
    RANK_GUIDES.map((rank) => {
      const detail = MINOR_CARD_DETAILS[suit.suit][rank.rank];

      return {
        name: `${suit.suit} ${rank.rank}`,
        english: `${rank.english} of ${suit.english}`,
        upright: detail.upright,
        reversed: detail.reversed,
        advice: detail.advice,
        suit: suit.suit,
        rank: rank.rank,
      };
    })
  );
}

const FULL_TAROT_DECK = [...TAROT_CARDS, ...buildMinorArcana()];

type TarotCard = BaseTarotCard & {
  isReversed: boolean;
  position: string;
  meaning: string;
  image: string;
};

const POSITIONS_BY_HORIZON: Record<string, string[]> = {
  지금: ['현재 상황', '다가오는 흐름', '운명비서의 조언'],
  '3개월 후': ['지금의 씨앗', '3개월 안의 변화', '3개월 후의 흐름'],
  '1년 후': ['현재의 출발점', '1년 안의 전환', '1년 후의 모습'],
  '2년 후': ['지금 숨은 가능성', '다가올 변화', '2년 후 당신의 모습'],
};

const TOPIC_GUIDES: Record<string, string> = {
  일반: '현재 고민의 핵심, 다음 흐름, 오늘 취할 태도를 중심으로 읽습니다.',
  연애: '상대 마음을 단정하지 말고 관계의 온도, 내 태도, 확인해야 할 신호를 중심으로 읽습니다.',
  재물: '수익 예언보다 돈의 흐름, 조건, 리스크, 관리 태도를 중심으로 읽습니다.',
  직업: '커리어 방향, 실행력, 협업, 지속 가능성을 중심으로 읽습니다.',
  관계: '말의 온도, 경계, 신뢰 회복, 거리 조절을 중심으로 읽습니다.',
  선택: 'A/B를 대신 골라주기보다 선택 기준, 감정과 현실의 균형, 후속 행동을 중심으로 읽습니다.',
};

const TIME_HORIZON_GUIDES: Record<string, string> = {
  지금: '지금 이 순간의 선택과 태도에 초점을 맞춥니다.',
  '3개월 후': '가까운 미래의 흐름을 장면처럼 그려, 단정이 아닌 가능성의 방향으로 읽습니다.',
  '1년 후': '1년 뒤의 모습을 한 장면으로 묘사하되, 지금의 선택이 어떻게 연결되는지 함께 짚습니다.',
  '2년 후': '2년 후 당신의 모습을 수호신이 비추듯 서사적으로 풀되, 공포나 단정은 피하고 성장의 풍경으로 제시합니다.',
};

function getPositions(timeHorizon: string) {
  return POSITIONS_BY_HORIZON[timeHorizon] ?? POSITIONS_BY_HORIZON['지금'];
}

function isFutureHorizon(timeHorizon: string) {
  return timeHorizon !== '지금';
}

function drawCards(timeHorizon = '지금') {
  const positions = getPositions(timeHorizon);
  const deck = [...FULL_TAROT_DECK].sort(() => Math.random() - 0.5);
  return deck.slice(0, 3).map((card, index) => {
    const isReversed = Math.random() > 0.72;
    return {
      ...card,
      isReversed,
      position: positions[index],
      meaning: isReversed ? card.reversed : card.upright,
      image: getTarotCardImagePath(card),
    };
  });
}

function buildFallbackReading(
  question: string,
  topic: string,
  timeHorizon: string,
  cards: TarotCard[],
) {
  const cardText = cards
    .map((card) => `- **${card.position} · ${card.name}${card.isReversed ? ' 역방향' : ''}**: ${card.meaning}. ${card.advice}`)
    .join('\n');
  const topicGuide = TOPIC_GUIDES[topic] ?? TOPIC_GUIDES['일반'];
  const horizonGuide = TIME_HORIZON_GUIDES[timeHorizon] ?? TIME_HORIZON_GUIDES['지금'];
  const futureSection = isFutureHorizon(timeHorizon)
    ? `\n\n**${timeHorizon}의 풍경**\n카드가 비추는 ${timeHorizon}의 모습은 한 장면의 가능성입니다. 지금의 선택과 태도가 그 풍경을 부드럽게 바꿀 수 있다는 점을 함께 기억해주세요.`
    : '';

  return `**운명비서 타로 리딩**

**질문**
${question}

**리딩 기준**
${topicGuide}
${horizonGuide}

**뽑힌 카드**
${cardText}

**전체 흐름**
이번 리딩은 지금의 고민을 당장 단정하기보다, 상황을 차분히 정리하고 다음 행동을 고르는 데 초점이 있습니다. 첫 번째 카드는 출발점, 두 번째 카드는 변화의 흐름, 세 번째 카드는 ${isFutureHorizon(timeHorizon) ? `${timeHorizon}의 가능한 모습` : '오늘 취하면 좋은 태도'}을 보여줍니다. 특히 "${topic}" 관점에서는 카드의 상징을 현실 조건과 감정의 균형으로 함께 보는 것이 중요합니다.${futureSection}

**오늘의 조언**
카드가 말하는 핵심은 무리하게 결과를 끌어내기보다, 지금 내가 통제할 수 있는 선택부터 정리하라는 것입니다. 오늘은 큰 결론을 내리기 전에 조건, 감정, 상대의 반응을 분리해서 보는 것이 좋습니다.`;
}

export async function POST(request: NextRequest) {
  try {
    const { question, topic, timeHorizon } = await request.json();
    const trimmedQuestion = typeof question === 'string' ? question.trim().slice(0, 500) : '';
    const trimmedTopic = typeof topic === 'string' ? topic.trim().slice(0, 40) : '일반';
    const trimmedHorizon =
      typeof timeHorizon === 'string' && TIME_HORIZON_GUIDES[timeHorizon.trim()]
        ? timeHorizon.trim()
        : '지금';

    if (trimmedQuestion.length < 3) {
      return NextResponse.json({ error: '타로로 보고 싶은 질문을 입력해주세요.' }, { status: 400 });
    }

    const cards = drawCards(trimmedHorizon);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const topicGuide = TOPIC_GUIDES[trimmedTopic] ?? TOPIC_GUIDES['일반'];
    const horizonGuide = TIME_HORIZON_GUIDES[trimmedHorizon] ?? TIME_HORIZON_GUIDES['지금'];
    const futureNarrativeGuide = isFutureHorizon(trimmedHorizon)
      ? '미래 시점 질문이므로 "수호신이 비추는 풍경", "카드가 보여주는 가능한 모습"처럼 서사적으로 풀되, 공포·단정·운명론은 피하고 성장과 선택의 여지를 남깁니다.'
      : '';

    if (!apiKey) {
      return NextResponse.json({
        cards,
        reading: buildFallbackReading(trimmedQuestion, trimmedTopic, trimmedHorizon, cards),
        timeHorizon: trimmedHorizon,
      });
    }

    const cardPrompt = cards
      .map((card) => `${card.position}: ${card.name}${card.isReversed ? ' 역방향' : ''} (${card.english}) - ${card.meaning} / 조언: ${card.advice}`)
      .join('\n');

    const systemPrompt = `당신은 '운명비서'의 타로 리딩 전문 비서입니다.

성격:
- 권위적이거나 무섭게 말하지 않습니다.
- 재벌가 수석비서처럼 차분하고 품격 있게, 사용자가 올바른 선택을 하도록 안내합니다.
- 타로를 절대적인 예언이 아니라 현재 상황을 정리하는 상징 도구로 설명합니다.
- 미래 시점(3개월·1년·2년 후) 질문에는 "수호신이 비추는 풍경", "카드가 보여주는 가능한 모습"처럼 서사적으로 풀되, 공포·단정·운명론은 피합니다.
- 이모지는 사용하지 않습니다.

답변 형식:
**운명비서 타로 리딩**

**질문**
사용자의 질문을 한 줄로 정리합니다.

**뽑힌 카드**
- 첫 번째 카드(출발점/현재) 해석
- 두 번째 카드(변화/흐름) 해석
- 세 번째 카드(조언 또는 미래의 모습) 해석

**전체 흐름**
3~5문장으로 질문에 대한 흐름을 정리합니다.

${isFutureHorizon(trimmedHorizon) ? `**${trimmedHorizon}의 풍경**\n미래의 한 장면을 2~4문장으로 묘사합니다. 가능성의 방향으로 쓰고, 지금의 선택이 그 풍경을 바꿀 수 있음을 한 문장으로 덧붙입니다.\n\n` : ''}**오늘의 조언**
오늘 바로 할 수 있는 행동 조언을 2~4개 문장으로 제시합니다.

주의:
- 불안감을 자극하지 않습니다.
- 연애, 재물, 직업 질문도 단정하지 말고 선택 기준을 제시합니다.
- 분야별·시간축 리딩 기준을 지킵니다.
- 법률, 의료, 투자 판단은 전문가 상담을 권합니다.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1600,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `분야: ${trimmedTopic}\n분야별 리딩 기준: ${topicGuide}\n시간축: ${trimmedHorizon}\n시간축 리딩 기준: ${horizonGuide}\n${futureNarrativeGuide}\n질문: ${trimmedQuestion}\n\n뽑힌 카드:\n${cardPrompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        cards,
        reading: buildFallbackReading(trimmedQuestion, trimmedTopic, trimmedHorizon, cards),
        timeHorizon: trimmedHorizon,
      });
    }

    const data = await response.json();
    const reading =
      data.content?.[0]?.text ||
      buildFallbackReading(trimmedQuestion, trimmedTopic, trimmedHorizon, cards);

    return NextResponse.json({ cards, reading, timeHorizon: trimmedHorizon });
  } catch (error) {
    console.error('타로 오류:', error);
    return NextResponse.json({ error: '타로 리딩 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
