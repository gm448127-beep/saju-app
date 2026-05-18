"use client";

interface FortuneScores {
  overall: number;
  wealth: number;
  love: number;
  career: number;
  health: number;
  luck: number;
}

interface TodayOverviewSectionProps {
  date: string;
  todayGan: string;
  todayJi: string;
  todaySipsin?: string;
  todayJiSipsin?: string;
  sipsinTitle?: string;
  relation?: string;
  relationDetail?: string;
  summary?: string;
  scores: FortuneScores;
  grade: string;
  gradeColor: string;
  gradeEmoji: string;
  character?: {
    emoji: string;
    title: string;
    description: string;
  };
  todayQuote?: {
    text: string;
    author: string;
  };
}

const SCORE_META = [
  { key: "wealth", label: "재물" },
  { key: "love", label: "애정" },
  { key: "career", label: "직장" },
  { key: "health", label: "건강" },
  { key: "luck", label: "행운" },
] as const;

function getOverallLabel(score: number) {
  if (score >= 90) return "강한 길운";
  if (score >= 80) return "상승 운세";
  if (score >= 68) return "좋은 흐름";
  if (score >= 58) return "안정 흐름";
  if (score >= 48) return "조심 운세";
  return "회복 운세";
}

function getOverallMessage(score: number) {
  if (score >= 80) {
    return "오늘은 흐름이 좋은 편입니다. 기회가 보이면 너무 오래 재지 말고 차분히 실행해도 좋습니다.";
  }
  if (score >= 68) {
    return "기본 운은 안정적입니다. 중요한 일은 한 번 더 확인하며 진행하면 성과가 납니다.";
  }
  if (score >= 58) {
    return "무난한 하루입니다. 큰 승부보다 루틴과 정리에 집중하면 운이 흐트러지지 않습니다.";
  }
  return "오늘은 속도를 줄이는 편이 좋습니다. 무리한 결정은 피하고 회복과 점검을 우선하세요.";
}

function getScoreSummary(scores: FortuneScores) {
  const entries = SCORE_META.map((item) => ({
    ...item,
    score: scores[item.key],
  }));
  const strongest = entries.reduce((a, b) => (a.score > b.score ? a : b));
  const weakest = entries.reduce((a, b) => (a.score < b.score ? a : b));
  return { strongest, weakest };
}

export default function TodayOverviewSection({
  date,
  todayGan,
  todayJi,
  todaySipsin,
  todayJiSipsin,
  sipsinTitle,
  relation,
  relationDetail,
  summary,
  scores,
  grade,
  gradeColor,
  gradeEmoji,
  character,
  todayQuote,
}: TodayOverviewSectionProps) {
  const { strongest, weakest } = getScoreSummary(scores);

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 items-stretch">
          <div className="rounded-2xl p-5 text-center flex flex-col justify-center border border-[#E2D7D0] bg-[#FAF8F5]">
            <p className="text-xs text-[#8A7E78] mb-1">{date}</p>
            <p className="text-xs text-[#5A4E48] mb-4">
              오늘의 간지 · {todayGan}{todayJi}
            </p>
            <div className="inline-flex mx-auto items-center justify-center w-24 h-20 rounded-2xl mb-3 border border-[#D9C8C0] bg-white">
              <p className="text-4xl font-bold pixel-text" style={{ color: "#2F282B" }}>
                {grade}
              </p>
            </div>
            <p className="text-sm text-[#8A7E78]">{getOverallLabel(scores.overall)}</p>
            <p style={{ fontFamily: "Jua, sans-serif" }} className="text-2xl text-[#3D3338] mt-1">
              {scores.overall}점
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2 mb-3">
              {todaySipsin && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-[#5A4E48] bg-[#EDE4DC]">
                  일간 · {todaySipsin}{sipsinTitle ? ` (${sipsinTitle})` : ""}
                </span>
              )}
              {todayJiSipsin && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-[#5A4E48] bg-[#DCEAF6]">
                  일지 · {todayJiSipsin}
                </span>
              )}
            </div>

            <h2 className="text-xl text-[#3D3338] mb-2" style={{ fontFamily: "Jua, sans-serif" }}>
              오늘은 {strongest.label}운이 가장 살아납니다.
            </h2>
            <p className="text-sm text-[#5A4E48] leading-relaxed mb-4">
              {getOverallMessage(scores.overall)}
            </p>

            <div className="h-3 rounded-full bg-[#EDE4DC] overflow-hidden mb-4">
              <div
                className="h-full rounded-full"
                style={{ width: `${scores.overall}%`, backgroundColor: gradeColor }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2">
                <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">활용할 운</p>
                <p className="text-sm text-[#3D3338] mt-1">{strongest.label} {strongest.score}점</p>
              </div>
              <div className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2">
                <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">살필 운</p>
                <p className="text-sm text-[#3D3338] mt-1">{weakest.label} {weakest.score}점</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="card">
          <div className="mb-4">
            <h2 className="label mb-1">오늘의 핵심 해석</h2>
            <p className="text-xs text-[#8A7E78]">십성·일진·합충 흐름을 한 문장으로 정리했습니다.</p>
          </div>
          <p className="text-sm text-[#5A4E48] leading-relaxed">{summary}</p>

          {(relation || relationDetail) && (
            <div className="mt-4 pt-4 border-t border-[#D9C8C0]">
              {relation && (
                <p className="text-base text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
                  {relation}
                </p>
              )}
              {relationDetail && <p className="text-sm text-[#5A4E48] mt-1 leading-relaxed">{relationDetail}</p>}
            </div>
          )}

          {(character || todayQuote) && (
            <div className="mt-4 pt-4 border-t border-[#D9C8C0] grid grid-cols-1 sm:grid-cols-2 gap-3">
              {character && (
                <div className="rounded-xl bg-white border border-[#E2D7D0] p-3">
                  <div>
                    <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338]">
                      {character.title}
                    </p>
                    <p className="text-xs text-[#8A7E78] mt-0.5">{character.description}</p>
                  </div>
                </div>
              )}
              {todayQuote && (
                <div className="rounded-xl bg-white/60 border border-[#D4CCE8] p-3">
                  <p className="text-xs text-[#8A7E78] mb-1">오늘의 문장</p>
                  <p className="text-sm text-[#5A4E48] italic leading-relaxed">&ldquo;{todayQuote.text}&rdquo;</p>
                  <p className="text-xs text-[#8A7E78] mt-1">— {todayQuote.author}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
