// ==================== 천간 ====================
export const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const CHEONGAN_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// ==================== 지지 ====================
export const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export const JIJI_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// ==================== 띠 ====================
export const DDI = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'] as const;

// ==================== 오행 ====================
export const GAN_OHAENG: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
};

export const JI_OHAENG: Record<string, string> = {
  자: '수', 축: '토', 인: '목', 묘: '목', 진: '토',
  사: '화', 오: '화', 미: '토', 신: '금', 유: '금',
  술: '토', 해: '수',
};

/** 브랜드 오행 팔레트 — 네온 색 금지 */
export const OHAENG_COLOR: Record<string, string> = {
  목: '#5C8B6F',
  화: '#B85C4C',
  토: '#B89968',
  금: '#9B9591',
  수: '#3D4A5C',
};

export const OHAENG_EMOJI: Record<string, string> = {
  목: '🌳', 화: '🔥', 토: '⛰️', 금: '⚙️', 수: '💧',
};

// ==================== 음양 ====================
export const GAN_EUMYANG: Record<string, string> = {
  갑: '양', 을: '음', 병: '양', 정: '음', 무: '양',
  기: '음', 경: '양', 신: '음', 임: '양', 계: '음',
};

// ==================== 십신 ====================
export const SIPSIN_MAP: Record<string, Record<string, string>> = {
  목: { 목: '비견', 화: '식신', 토: '재성', 금: '관성', 수: '인성' },
  화: { 화: '비견', 토: '식신', 금: '재성', 수: '관성', 목: '인성' },
  토: { 토: '비견', 금: '식신', 수: '재성', 목: '관성', 화: '인성' },
  금: { 금: '비견', 수: '식신', 목: '재성', 화: '관성', 토: '인성' },
  수: { 수: '비견', 목: '식신', 화: '재성', 토: '관성', 금: '인성' },
};

// ==================== 상생/상극 ====================
export const SANGSAENG: Record<string, string> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
};

export const SANGGEUK: Record<string, string> = {
  목: '토', 화: '금', 토: '수', 금: '목', 수: '화',
};

// ==================== 60갑자 ====================
export const SIXTY_GANJI: string[] = [];
for (let i = 0; i < 60; i++) {
  SIXTY_GANJI.push(`${CHEONGAN[i % 10]}${JIJI[i % 12]}`);
}

// ==================== 토정비결 수 ====================
export const CHEONGAN_TAESU: Record<string, number> = {
  갑: 9, 을: 8, 병: 7, 정: 6, 무: 5, 기: 9, 경: 8, 신: 7, 임: 6, 계: 5,
};

export const JIJI_TAESU: Record<string, number> = {
  자: 11, 축: 13, 인: 10, 묘: 10, 진: 13, 사: 9,
  오: 9, 미: 13, 신: 12, 유: 12, 술: 13, 해: 11,
};

export const JIJI_WOLGEON: Record<string, number> = {
  자: 1, 축: 5, 인: 9, 묘: 3, 진: 7, 사: 2,
  오: 6, 미: 4, 신: 8, 유: 3, 술: 7, 해: 10,
};

export const JIJI_ILJIN: Record<string, number> = {
  자: 1, 축: 2, 인: 3, 묘: 4, 진: 5, 사: 6,
  오: 7, 미: 8, 신: 9, 유: 10, 술: 11, 해: 12,
};

