import Link from 'next/link';

const MENU_ITEMS = [
  { href: '/saju', emoji: '🔮', title: '사주팔자', description: '나의 타고난 운명을 알아보세요', gradient: 'from-[#E8E4F0] to-[#D7D3E7]', iconBg: '#F0EDF8' },
  { href: '/today', emoji: '🌤️', title: '오늘의 운세', description: '오늘 하루 어떤 기운이 함께할까요?', gradient: 'from-[#E4EBF0] to-[#D3DBE7]', iconBg: '#EDF2F8' },
  { href: '/tojeong', emoji: '📜', title: '토정비결', description: '올해 나의 운세를 확인하세요', gradient: 'from-[#E4F0E8] to-[#D3E7DB]', iconBg: '#EDF8F0' },
  { href: '/compatibility', emoji: '💕', title: '궁합 보기', description: '우리 둘의 궁합은 몇 점?', gradient: 'from-[#F0E4EA] to-[#E7D3DD]', iconBg: '#F8EDF2' },
  { href: '/chat', emoji: '💬', title: 'AI 사주상담', description: 'AI에게 사주 이야기를 들어보세요', gradient: 'from-[#EDE4F0] to-[#E0D3E7]', iconBg: '#F5EDF8' },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-16 relative">
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-20 h-20 rounded-full opacity-20" style={{background: 'radial-gradient(circle, #D7D3E7 0%, transparent 70%)'}}></div>
          <div className="absolute top-20 right-1/4 w-16 h-16 rounded-full opacity-15" style={{background: 'radial-gradient(circle, #C5B9E8 0%, transparent 70%)'}}></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 rounded-full opacity-20" style={{background: 'radial-gradient(circle, #D7D3E7 0%, transparent 70%)'}}></div>
        </div>

        <div className="relative">
          <div className="text-6xl mb-6 animate-float">✨</div>
          <h1 style={{fontFamily:'Jua, sans-serif'}} className="text-4xl text-[#2D2D2D] mb-3">사주도우미</h1>
          <p className="text-[#8A8498] text-lg mb-1">오로지 당신만을 위한</p>
          <p className="text-[#8A8498] text-lg">맞춤형 사주 분석을 진행합니다.</p>
          <div className="mt-6 flex justify-center gap-3">
            <span className="tag">🔮 사주</span>
            <span className="tag">🌤️ 운세</span>
            <span className="tag">💬 AI상담</span>
          </div>
        </div>
      </section>

      {/* 메뉴 카드 */}
      <section className="space-y-3">
        {MENU_ITEMS.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="card card-hover block animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                   style={{ backgroundColor: item.iconBg }}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 style={{fontFamily:'Jua, sans-serif'}} className="text-lg mb-0.5">{item.title}</h3>
                <p className="text-[#8A8498] text-sm">{item.description}</p>
              </div>
              <div className="text-[#D7D3E7] text-xl shrink-0">→</div>
            </div>
          </Link>
        ))}
      </section>

      <footer className="text-center py-10 text-sm text-[#A09AAE]">
        <p>사주도우미는 재미와 참고용입니다 ☺️</p>
        <p className="mt-1">중요한 결정은 전문가와 상담하세요.</p>
      </footer>
    </div>
  );
}