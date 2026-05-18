"use client";

interface TojeongResultSectionProps {
  result: any;
  selectedMonth: number | null;
  setSelectedMonth: (month: number | null) => void;
}

function scoreColor(score: number) {
  if (score >= 80) return "#B89968";
  if (score >= 65) return "#8B6F47";
  if (score >= 50) return "#9B9591";
  return "#6B5E58";
}

function scoreLabel(score: number) {
  if (score >= 80) return "강한 상승";
  if (score >= 65) return "좋은 흐름";
  if (score >= 50) return "안정 흐름";
  if (score >= 35) return "주의 구간";
  return "회복 필요";
}

function categoryTone(score: number) {
  if (score >= 70) return "오늘 적극적으로 활용해도 좋은 영역입니다.";
  if (score >= 50) return "무리하지 않으면 안정적으로 가져갈 수 있습니다.";
  return "서두르기보다 점검과 보완이 필요한 영역입니다.";
}

function monthlyTone(score: number) {
  if (score >= 80) {
    return "이번 달은 한 해 중에서도 기운이 또렷하게 살아나는 시기입니다. 미뤄둔 일이나 새롭게 시작하고 싶은 일이 있다면 작은 준비에만 머물기보다 실제 행동으로 옮겨보는 편이 좋습니다.";
  }
  if (score >= 70) {
    return "이번 달은 전반적으로 좋은 흐름에 들어와 있습니다. 일, 관계, 계획 중 하나를 정해서 집중하면 기대보다 안정적인 성과를 만들 수 있습니다.";
  }
  if (score >= 60) {
    return "이번 달은 무난하게 가져갈 수 있는 안정 구간입니다. 큰 욕심을 내기보다 기존 계획을 정리하고 꾸준히 이어가는 쪽이 유리합니다.";
  }
  return "이번 달은 속도를 조금 낮추는 편이 좋습니다. 무리하게 밀어붙이기보다 손실을 줄이고, 약속과 지출, 건강 상태를 한 번 더 확인하는 데 집중하세요.";
}

function monthlyAction(score: number, theme?: string) {
  if (score >= 75) {
    return `${theme || "좋은 흐름"}의 기운을 살려 중요한 연락, 제안, 실행 계획을 앞쪽에 배치해보세요. 주변의 도움도 들어오기 쉬우니 혼자 해결하려 하기보다 함께 움직이면 더 좋습니다.`;
  }
  if (score >= 60) {
    return "새로운 일을 크게 벌이기보다는 이미 잡아둔 계획을 현실적으로 다듬어보세요. 일정표를 정리하고 우선순위를 세우면 이번 달 흐름을 안정적으로 사용할 수 있습니다.";
  }
  return "이번 달에는 급한 결정, 큰 지출, 감정적인 말실수를 특히 줄이는 것이 좋습니다. 결과를 빨리 내려고 하기보다 다음 달을 위한 정리와 회복의 달로 쓰면 손실을 줄일 수 있습니다.";
}

function pickStrongest<T extends { score: number }>(items: T[]) {
  return items.reduce((a, b) => (a.score > b.score ? a : b));
}

function pickWeakest<T extends { score: number }>(items: T[]) {
  return items.reduce((a, b) => (a.score < b.score ? a : b));
}

const GAN_OHAENG: Record<string, string> = {
  갑: "목",
  을: "목",
  병: "화",
  정: "화",
  무: "토",
  기: "토",
  경: "금",
  신: "금",
  임: "수",
  계: "수",
};

const JI_OHAENG: Record<string, string> = {
  자: "수",
  축: "토",
  인: "목",
  묘: "목",
  진: "토",
  사: "화",
  오: "화",
  미: "토",
  신: "금",
  유: "금",
  술: "토",
  해: "수",
};

const ELEMENT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  목: { bg: "#5C8B6F", text: "#FFFFFF", label: "목(木)" },
  화: { bg: "#B85C4C", text: "#FFFFFF", label: "화(火)" },
  토: { bg: "#B89968", text: "#FFFFFF", label: "토(土)" },
  금: { bg: "#9B9591", text: "#FFFFFF", label: "금(金)" },
  수: { bg: "#3D4A5C", text: "#FFFFFF", label: "수(水)" },
};

const PILLAR_LABELS: Record<string, { ko: string; hanja: string }> = {
  hour: { ko: "시주", hanja: "時柱" },
  day: { ko: "일주", hanja: "日柱" },
  month: { ko: "월주", hanja: "月柱" },
  year: { ko: "년주", hanja: "年柱" },
};

function parsePillar(value?: string) {
  if (!value || value === "미입력") return null;
  const chars = Array.from(value);
  const stemKo = chars[0];
  const stemHanja = chars[1];
  const branchKo = chars[2];
  const branchHanja = chars[3];
  if (!stemKo || !stemHanja || !branchKo || !branchHanja) return null;
  const stemElement = GAN_OHAENG[stemKo] || "";
  const branchElement = JI_OHAENG[branchKo] || "";
  return {
    stemKo,
    stemHanja,
    branchKo,
    branchHanja,
    stemElement,
    branchElement,
  };
}

function PillarCard({
  type,
  value,
  highlight = false,
}: {
  type: "hour" | "day" | "month" | "year";
  value?: string;
  highlight?: boolean;
}) {
  const parsed = parsePillar(value);
  const label = PILLAR_LABELS[type];

  if (!parsed) {
    return (
      <div className="rounded-xl border border-[#D9C8C0] bg-white/75 p-2 text-center">
        <p className="text-[11px] font-semibold text-[#3D3338]">{label.ko}</p>
        <p className="text-[10px] text-[#8A7E78] mt-0.5">{label.hanja}</p>
        <div className="mt-2 rounded-lg border border-dashed border-[#D9C8C0] py-6">
          <p className="text-xs text-[#8A7E78]">미입력</p>
        </div>
        <p className="text-[10px] text-[#8A7E78] mt-2">시간 입력 시 표시</p>
      </div>
    );
  }

  const stemStyle = ELEMENT_STYLE[parsed.stemElement] || ELEMENT_STYLE.토;
  const branchStyle = ELEMENT_STYLE[parsed.branchElement] || ELEMENT_STYLE.토;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
        highlight ? "border-[#B89968] ring-2 ring-[#B89968]/20" : "border-[#E2D7D0]"
      }`}
    >
      <div className="bg-white px-1.5 py-2 text-center">
        <p className="text-[11px] font-semibold text-[#3D3338]">
          {label.ko}
        </p>
        <p className="mt-0.5 text-[10px] text-[#8A7E78]">{label.hanja}</p>
      </div>

      <div className="py-3 text-center sm:py-4" style={{ backgroundColor: stemStyle.bg, color: stemStyle.text }}>
        <p className="text-3xl font-bold leading-none sm:text-4xl">{parsed.stemHanja}</p>
        <p className="mt-1 text-[10px] font-semibold sm:text-xs">
          {parsed.stemKo}:{stemStyle.label}
        </p>
      </div>

      <div className="border-t border-white/30 py-3 text-center sm:py-4" style={{ backgroundColor: branchStyle.bg, color: branchStyle.text }}>
        <p className="text-3xl font-bold leading-none sm:text-4xl">{parsed.branchHanja}</p>
        <p className="mt-1 text-[10px] font-semibold sm:text-xs">
          {parsed.branchKo}:{branchStyle.label}
        </p>
      </div>

      <div className="border-t border-[#D9C8C0] bg-[#F8F3EE] px-1.5 py-2 text-center">
        <p className="text-[10px] text-[#8A7E78]">간지</p>
        <p className="mt-0.5 text-xs font-semibold text-[#3D3338] sm:text-sm">{value}</p>
      </div>
    </div>
  );
}

export default function TojeongResultSection({
  result,
  selectedMonth,
  setSelectedMonth,
}: TojeongResultSectionProps) {
  const bestCategory = result.categories?.length ? pickStrongest(result.categories) : null;
  const careCategory = result.categories?.length ? pickWeakest(result.categories) : null;
  const bestMonth = result.monthlyFortunes?.length ? pickStrongest(result.monthlyFortunes) : null;
  const careMonth = result.monthlyFortunes?.length ? pickWeakest(result.monthlyFortunes) : null;
  const selected = selectedMonth
    ? result.monthlyFortunes?.find((m: any) => m.month === selectedMonth)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-stretch">
          <div className="rounded-3xl bg-[#FAF8F5] border border-[#E2D7D0] p-6 text-center flex flex-col justify-center">
            <p className="text-xs tracking-[0.08em] text-[#B8A78D] mb-3">올해의 괘</p>
            <p className="text-sm text-[#8A7E78] mb-1">제 {result.totalGwae}괘</p>
            <h2 className="text-3xl text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
              {result.hexagram}
              <span className="ml-1 text-[#8B6F47]">{result.hexagramHanja}</span>
            </h2>
            <p className="text-xs text-[#8A7E78] mt-2">
              태수 {result.taesu} · 월건 {result.wolgeon} · 일진 {result.iljin}
            </p>
            <div
              className="mt-5 mx-auto inline-flex items-center gap-3 rounded-2xl border border-[#E2D7D0] bg-white px-5 py-3"
            >
              <div className="text-left">
                <p className="text-2xl leading-none" style={{ color: "#2F282B", fontFamily: "Jua, sans-serif" }}>
                  {result.grade}
                </p>
                <p className="text-xs text-[#8A7E78] mt-1">{scoreLabel(result.categories?.[0]?.score ?? 60)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                ["생년월일", result.birthDate],
                ["나이", `${result.age}세`],
                ["연간지", `${result.yearGanji} (${result.ddi}띠)`],
                ["일간 오행", result.myElement],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2">
                  <p className="text-[10px] text-[#8A7E78]">{label}</p>
                  <p className="text-sm font-semibold text-[#3D3338]">{value}</p>
                </div>
              ))}
            </div>

            <h3 className="text-xl text-[#3D3338] mb-2" style={{ fontFamily: "Jua, sans-serif" }}>
              {result.summary}
            </h3>
            <p className="text-sm text-[#5A4E48] leading-relaxed mb-4">{result.meaning}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {bestCategory && (
                <div className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2">
                  <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">강점 운</p>
                  <p className="text-sm text-[#3D3338] mt-1">
                    {bestCategory.label} {bestCategory.score}점
                  </p>
                </div>
              )}
              {careCategory && (
                <div className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2">
                  <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">보완 운</p>
                  <p className="text-sm text-[#3D3338] mt-1">
                    {careCategory.label} {careCategory.score}점
                  </p>
                </div>
              )}
              <div
                className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2"
              >
                <p className="text-[10px] tracking-[0.08em] text-[#8A7E78]">삼재</p>
                <p className="text-sm text-[#3D3338] mt-1">
                  {result.samjae?.active ? result.samjae.type : "비해당"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-5 flex justify-between items-end">
          <div>
            <h2 className="label mb-1">올해의 핵심 해석</h2>
            <p className="text-xs text-[#8A7E78]">괘의 뜻을 올해 실제 행동으로 옮긴 요약입니다.</p>
          </div>
          <p className="text-xs text-[#B8A78D]">연간 해석</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="rounded-2xl border border-[#E2D7D0] bg-white p-5">
            <p className="text-sm text-[#5A4E48] leading-relaxed mb-4">{result.meaning}</p>
            <p className="text-base text-[#3D3338] leading-relaxed" style={{ fontFamily: "Jua, sans-serif" }}>
              {result.summary}
            </p>
            {result.deepContent && (
              <div className="mt-4 pt-4 border-t border-[#D9C8C0]">
                {result.deepContent.split("\n\n").slice(0, 2).map((para: string, i: number) => (
                  <p key={i} className="text-sm text-[#5A4E48] leading-relaxed mb-2">{para}</p>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#E2D7D0] bg-white p-4">
              <p className="text-xs text-[#8B6F47] font-semibold mb-1">좋은 선택</p>
              <p className="text-sm text-[#3D3338] leading-relaxed">{result.advice}</p>
            </div>
            <div className="rounded-2xl border border-[#E2D7D0] bg-white p-4">
              <p className="text-xs text-[#8B6F47] font-semibold mb-1">주의할 점</p>
              <p className="text-sm text-[#3D3338] leading-relaxed">{result.caution}</p>
            </div>
            {result.samjae && (
              <div className="rounded-2xl border border-[#D9C8C0] bg-white/70 p-4">
                <p className="text-xs text-[#8A7E78] font-semibold mb-1">삼재 메모</p>
                <p className="text-sm text-[#5A4E48] leading-relaxed">{result.samjae.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
            사주 원국
          </h2>
          <p className="text-xs tracking-[0.35em] text-[#8A7E78] mt-2">四 柱 原 局</p>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <PillarCard type="hour" value={result.pillars?.hour} />
          <PillarCard type="day" value={result.pillars?.day} highlight />
          <PillarCard type="month" value={result.pillars?.month} />
          <PillarCard type="year" value={result.pillars?.year} />
        </div>

      </div>

      {result.gearAnalysis?.length > 0 && (
        <div className="card">
          <div className="mb-4">
            <h2 className="label mb-1">기운의 상호작용</h2>
            <p className="text-xs text-[#8A7E78]">내 사주와 2026 병오년이 만나는 지점을 간단히 보여줍니다.</p>
          </div>
          <div className="space-y-2">
            {result.gearAnalysis.map((line: string, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2.5"
              >
                <p className="text-sm text-[#3D3338] leading-relaxed">
                  {line.replace(/^⚙️\s*/, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-5 flex justify-between items-end">
          <div>
            <h2 className="label mb-1">분야별 운세</h2>
            <p className="text-xs text-[#8A7E78]">한 해를 다섯 영역으로 나누어 강약과 실천 포인트를 정리했습니다.</p>
          </div>
          <p className="text-xs text-[#B8A78D]">다섯 영역</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.categories.map((cat: any) => (
            <div key={cat.label} className="rounded-2xl border border-[#E2D7D0] bg-white p-4">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p className="text-base text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
                    {cat.label}
                  </p>
                  <p className="text-xs text-[#8A7E78] mt-0.5">{scoreLabel(cat.score)}</p>
                </div>
                <p className="text-lg font-bold" style={{ color: scoreColor(cat.score) }}>{cat.score}</p>
              </div>
              <div className="h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: `${cat.score}%`, backgroundColor: scoreColor(cat.score) }} />
              </div>
              <p className="text-sm text-[#5A4E48] leading-relaxed mb-2">{cat.description}</p>
              <p className="text-xs text-[#8B6F47]">{categoryTone(cat.score)} {cat.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="mb-5 flex justify-between items-end">
          <div>
            <h2 className="label mb-1">월별 운세 흐름</h2>
            <p className="text-xs text-[#8A7E78]">높은 달에는 실행, 낮은 달에는 정리와 점검에 힘을 주세요.</p>
          </div>
          <p className="text-xs text-[#B8A78D]">월별 흐름</p>
        </div>

        {(bestMonth || careMonth) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {bestMonth && (
              <div className="rounded-xl border border-[#E2D7D0] bg-white p-3">
                <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">가장 좋은 달</p>
                <p className="text-sm text-[#3D3338] mt-1">{bestMonth.label} · {bestMonth.theme} · {bestMonth.score}점</p>
              </div>
            )}
            {careMonth && (
              <div className="rounded-xl border border-[#E2D7D0] bg-white p-3">
                <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">조심할 달</p>
                <p className="text-sm text-[#3D3338] mt-1">{careMonth.label} · {careMonth.theme} · {careMonth.score}점</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {result.monthlyFortunes.map((mf: any) => (
            <button
              key={mf.month}
              onClick={() => setSelectedMonth(selectedMonth === mf.month ? null : mf.month)}
              className={`rounded-2xl border p-3 text-center transition-all ${
                selectedMonth === mf.month
                  ? "bg-[#3D3338] border-[#3D3338] text-white"
                  : "bg-white border-[#E2D7D0] text-[#3D3338] hover:border-[#8B6F47]"
              }`}
            >
              <span
                className="block text-xs font-semibold"
                style={{ color: selectedMonth === mf.month ? "#EDE4DC" : undefined }}
              >
                {mf.month}월
              </span>
              <span className="mt-1 block text-sm font-bold" style={{ color: selectedMonth === mf.month ? "#EDE4DC" : scoreColor(mf.score) }}>
                {mf.score}
              </span>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="rounded-2xl border border-[#E2D7D0] bg-white p-4">
            <div className="flex justify-between gap-3 mb-3">
              <div>
                <p className="text-lg text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
                  {selected.label} · {selected.theme}
                </p>
                <p className="text-sm text-[#8A7E78] mt-0.5">{selected.description}</p>
              </div>
              <p className="text-xl font-bold shrink-0" style={{ color: scoreColor(selected.score) }}>{selected.score}</p>
            </div>
            <div className="h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full" style={{ width: `${selected.score}%`, backgroundColor: scoreColor(selected.score) }} />
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#4A403B]">
              <p>{monthlyTone(selected.score)}</p>
              <p>{monthlyAction(selected.score, selected.theme)}</p>
              {selected.gearNote && (
                <p className="rounded-xl border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-2 text-xs text-[#6B5E58]">
                  사주 흐름으로 보면 {selected.gearNote.replace(/→/g, "와 연결되어")}로 읽힙니다. 어렵게 생각하기보다, 이 달에 어떤 관계와 일이 더 잘 움직이는지 보는 참고 신호로 활용하면 됩니다.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-[#8A7E78]">월을 선택하면 해당 월의 해석을 볼 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
