import Link from "next/link";

const MENU_ITEMS = [
  { href: "/saju", emoji: "🔮", label: "사주팔자", desc: "나의 타고난 운명을 알아보세요", iconBg: "#F2E4DC" },
  { href: "/today", emoji: "🌤️", label: "오늘의 운세", desc: "오늘 하루 어떤 기운이 함께할까요?", iconBg: "#EDE4DC" },
  { href: "/tojeong", emoji: "📜", label: "토정비결", desc: "올해 나의 운세를 확인하세요", iconBg: "#E8EDE4" },
  { href: "/compatibility", emoji: "💕", label: "궁합 보기", desc: "우리 둘의 궁합은 몇 점?", iconBg: "#F2E4DC" },
  { href: "/chat", emoji: "💬", label: "AI 사주상담", desc: "AI에게 사주 이야기를 들어보세요", iconBg: "#F2E8DC" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-16 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-20 h-20 rounded-full opacity-20"
               style={{ background: "radial-gradient(circle, #D9C8C0 0%, transparent 70%)" }} />
          <div className="absolute top-20 right-1/4 w-16 h-16 rounded-full opacity-15"
               style={{ background: "radial-gradient(circle, #CCB6B0 0%, transparent 70%)" }} />
          <div className="absolute bottom-10 left-1/3 w-12 h-12 rounded-full opacity-20"
               style={{ background: "radial-gradient(circle, #D9C8C0 0%, transparent 70%)" }} />
        </div>
        <div className="relative">
          <div className="text-6xl mb-6 animate-float">✨</div>
          <h1 style={{ fontFamily: "Jua, sans-serif" }} className="text-4xl text-[#3D3338] mb-3">
            사주도우미
          </h1>
          <p className="text-[#8A7E78] text-lg mb-1">오로지 당신만을 위한</p>
          <p className="text-[#8A7E78] text-lg">맞춤형 사주 분석을 진행합니다.</p>
          <div className="mt-6 flex justify-center gap-3">
            <span className="tag">🔮 사주</span>
            <span className="tag">🌤️ 운세</span>
            <span className="tag">💬 AI상담</span>
          </div>
        </div>
      </section>

      {/* Menu Cards */}
      <section className="space-y-3">
        {MENU_ITEMS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="card card-hover block animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: item.iconBg }}
              >
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 style={{ fontFamily: "Jua, sans-serif" }} className="text-lg mb-0.5">
                  {item.label}
                </h3>
                <p className="text-[#8A7E78] text-sm">{item.desc}</p>
              </div>
              <div className="text-[#D9C8C0] text-xl shrink-0">→</div>
            </div>
          </Link>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-[#A09488]">
        <p>사주도우미는 재미와 참고용입니다 ☺️</p>
        <p className="mt-1">중요한 결정은 전문가와 상담하세요.</p>
      </footer>
    </div>
  );
}