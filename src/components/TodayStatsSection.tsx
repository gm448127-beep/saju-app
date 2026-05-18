"use client";

type StatKey = "wealth" | "love" | "career" | "health" | "luck";

export interface TodayStatItem {
  key: StatKey;
  label: string;
  emoji?: string;
  color: string;
  score: number;
}

interface TodayStatsSectionProps {
  items: TodayStatItem[];
  overall: number;
}

const STAT_COPY: Record<
  StatKey,
  {
    title: string;
    high: string;
    mid: string;
    low: string;
    action: string;
    caution: string;
  }
> = {
  wealth: {
    title: "돈의 흐름",
    high: "재물이 움직이기 좋은 날입니다. 제안·영업·정산에서 성과가 보일 수 있어요.",
    mid: "큰 변동보다는 관리가 중요한 날입니다. 쓰는 돈보다 지키는 돈에 집중하세요.",
    low: "충동 지출과 손실수가 생기기 쉬워요. 큰 결제·투자는 하루 더 살펴보세요.",
    action: "가계부 확인, 미수금 정리, 필요한 결제만 진행",
    caution: "충동구매, 보증, 검증 없는 투자",
  },
  love: {
    title: "관계와 애정",
    high: "호감과 대화운이 살아납니다. 먼저 따뜻하게 말을 건네면 관계가 부드러워져요.",
    mid: "무난한 관계운입니다. 표현은 하되 상대의 속도를 맞추는 것이 좋아요.",
    low: "오해가 생기기 쉬운 흐름입니다. 감정적인 말보다 짧고 분명한 표현이 안전해요.",
    action: "안부 연락, 칭찬, 약속 시간 지키기",
    caution: "떠보기, 과한 기대, 감정적 답장",
  },
  career: {
    title: "일과 성과",
    high: "일의 추진력이 강합니다. 회의·보고·계약처럼 결과가 필요한 일에 유리해요.",
    mid: "꾸준히 처리하면 성과가 쌓이는 날입니다. 새 일보다 기존 업무 마감에 좋아요.",
    low: "업무 마찰이나 실수가 생기기 쉬워요. 문서·일정·약속을 한 번 더 확인하세요.",
    action: "중요 업무 우선 처리, 체크리스트 작성, 보고 정리",
    caution: "성급한 확답, 상사·거래처와의 날 선 표현",
  },
  health: {
    title: "몸과 컨디션",
    high: "컨디션이 받쳐주는 날입니다. 가벼운 운동이나 활동량을 늘리기 좋아요.",
    mid: "무난하지만 과로하면 금방 떨어질 수 있어요. 식사와 수면 리듬을 지키세요.",
    low: "피로가 쌓이기 쉬운 날입니다. 무리한 운동·야근보다 회복을 우선하세요.",
    action: "물 마시기, 산책, 스트레칭, 일찍 쉬기",
    caution: "과식, 과음, 무리한 일정",
  },
  luck: {
    title: "기회와 우연",
    high: "우연한 도움과 타이밍이 좋은 날입니다. 제안이 오면 열린 마음으로 살펴보세요.",
    mid: "작은 행운이 들어오는 흐름입니다. 평소 루틴 안에서 기회를 발견할 수 있어요.",
    low: "운에 기대기보다 안전한 선택이 좋습니다. 확인된 길을 택하면 손실을 줄여요.",
    action: "새 정보 탐색, 가벼운 시도, 감사 표현",
    caution: "요행수, 무리한 확장, 즉흥 결정",
  },
};

function getScoreLabel(score: number) {
  if (score >= 85) return { label: "매우 좋음", desc: "오늘 강하게 활용할 수 있는 운입니다." };
  if (score >= 70) return { label: "좋음", desc: "흐름이 우호적입니다. 적극적으로 써도 좋아요." };
  if (score >= 55) return { label: "보통", desc: "안정권입니다. 무리하지 않으면 충분합니다." };
  if (score >= 40) return { label: "주의", desc: "작은 변수에 조심하면 큰 문제는 피할 수 있어요." };
  return { label: "낮음", desc: "오늘은 쉬어가며 손실을 줄이는 쪽이 좋습니다." };
}

function getStatMessage(item: TodayStatItem) {
  const copy = STAT_COPY[item.key];
  if (item.score >= 70) return copy.high;
  if (item.score >= 50) return copy.mid;
  return copy.low;
}

export default function TodayStatsSection({ items, overall }: TodayStatsSectionProps) {
  return (
    <div className="card">
      <div className="mb-5 flex justify-between items-end">
        <div>
          <h2 className="label mb-1">세부 운세 스탯</h2>
          <p className="text-xs text-[#8A7E78]">
            종합 {overall}점을 다섯 영역으로 나눈 오늘의 활용 지도입니다.
          </p>
        </div>
        <p className="text-xs text-[#B8A78D]">다섯 영역</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const scoreInfo = getScoreLabel(item.score);
          const copy = STAT_COPY[item.key];
          return (
            <div key={item.key} className="rounded-xl border border-[#E2D7D0] bg-white p-3">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p className="text-sm text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
                    {item.label}
                    <span className="ml-2 text-xs text-[#8A7E78]">{copy.title}</span>
                  </p>
                  <p className="text-xs text-[#8A7E78] mt-0.5">{scoreInfo.label} · {scoreInfo.desc}</p>
                </div>
                <p className="text-lg font-bold shrink-0" style={{ color: item.color }}>
                  {item.score}
                </p>
              </div>

              <div className="h-2.5 rounded-full bg-[#EDE4DC] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.score}%`, backgroundColor: item.color }}
                />
              </div>

              <p className="text-xs text-[#5A4E48] leading-relaxed mb-2">{getStatMessage(item)}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 border-t border-[#EDE4DC]">
                <p className="text-[11px] text-[#3D5838]">좋은 선택: {copy.action}</p>
                <p className="text-[11px] text-[#583838]">주의: {copy.caution}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
