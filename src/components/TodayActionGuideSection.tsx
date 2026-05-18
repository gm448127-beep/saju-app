"use client";

interface ActionGuide {
  text: string;
  reason?: string;
  action?: string;
}

interface LuckyItem {
  emoji: string;
  label: string;
  value: string;
  detail?: string;
  use?: string;
}

interface TodayActionGuideSectionProps {
  dos?: string[];
  donts?: string[];
  dosDetailed?: ActionGuide[];
  dontsDetailed?: ActionGuide[];
  luckyItems?: LuckyItem[];
  tip?: string;
  warning?: string;
  sipsinTitle?: string;
}

function toGuides(items?: string[], detailed?: ActionGuide[]) {
  if (detailed?.length) return detailed;
  return (items || []).map((text) => ({ text }));
}

function ActionCard({
  title,
  subtitle,
  guides,
  type,
}: {
  title: string;
  subtitle: string;
  guides: ActionGuide[];
  type: "do" | "dont";
}) {
  const isDo = type === "do";
  return (
    <div
      className="card"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E2D7D0" }}
    >
      <div className="mb-4">
        <h2 className="label mb-1">{title}</h2>
        <p className="text-xs text-[#8A7E78]">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {guides.map((item, i) => (
          <div key={`${item.text}-${i}`} className="rounded-xl bg-[#FAF8F5] border border-[#E2D7D0] px-3 py-2.5">
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 text-sm ${isDo ? "text-[#3D5838]" : "text-[#583838]"}`}>
                {isDo ? "✓" : "!"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#3D3338]">
                  {item.text}
                </p>
                {item.reason && <p className="text-xs text-[#5A4E48] mt-1 leading-relaxed">{item.reason}</p>}
                {item.action && (
                  <p className={`text-[11px] mt-1 ${isDo ? "text-[#3D5838]" : "text-[#583838]"}`}>
                    {isDo ? "실천" : "대신"}: {item.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TodayActionGuideSection({
  dos,
  donts,
  dosDetailed,
  dontsDetailed,
  luckyItems,
  tip,
  warning,
  sipsinTitle,
}: TodayActionGuideSectionProps) {
  const doGuides = toGuides(dos, dosDetailed);
  const dontGuides = toGuides(donts, dontsDetailed);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionCard
          title="오늘 하면 좋은 것"
          subtitle={sipsinTitle ? `${sipsinTitle} 기운을 잘 쓰는 방법` : "오늘의 기운을 잘 쓰는 방법"}
          guides={doGuides}
          type="do"
        />
        <ActionCard
          title="오늘 피할 것"
          subtitle="기운이 새거나 꼬이기 쉬운 지점"
          guides={dontGuides}
          type="dont"
        />
      </div>

      <div className="card">
        <div className="mb-5 flex justify-between items-end">
          <div>
            <h2 className="label mb-1">행운 아이템</h2>
            <p className="text-xs text-[#8A7E78]">오늘의 오행을 일상에서 가볍게 활용하는 방법입니다.</p>
          </div>
          <p className="text-xs text-[#B8A78D]">오늘의 활용 요소</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {luckyItems?.map((item) => (
            <div key={item.label} className="bg-white border border-[#E2D7D0] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs text-[#8A7E78]">{item.label}</p>
                  <p className="text-base font-bold text-[#3D3338] mt-0.5">{item.value}</p>
                  {item.detail && <p className="text-xs text-[#5A4E48] mt-2 leading-relaxed">{item.detail}</p>}
                  {item.use && (
                    <p className="text-[11px] text-[#8B6F47] mt-1 leading-relaxed">활용: {item.use}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card" style={{ backgroundColor: "#FFFFFF", borderColor: "#E2D7D0" }}>
          <h2 className="label mb-2">오늘의 팁</h2>
          <p className="text-base text-[#3D3338] leading-relaxed">{tip}</p>
          <p className="text-xs text-[#5A4E48] mt-3 pt-3 border-t border-[#E2D7D0]">
            핵심은 작게 실행하는 것입니다. 오늘 좋은 기운은 거창한 결심보다 한 가지 행동에서 살아납니다.
          </p>
        </div>
        <div className="card" style={{ backgroundColor: "#FFFFFF", borderColor: "#E2D7D0" }}>
          <h2 className="label mb-2">주의사항</h2>
          <p className="text-base text-[#3D3338] leading-relaxed">{warning}</p>
          <p className="text-xs text-[#5A4E48] mt-3 pt-3 border-t border-[#E2D7D0]">
            불편한 신호가 오면 바로 맞서기보다 속도를 늦추세요. 확인과 여유가 오늘의 방어운입니다.
          </p>
        </div>
      </div>
    </>
  );
}
