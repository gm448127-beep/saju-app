import Link from 'next/link';

const MENU_ITEMS = [
  { href: '/saju', emoji: '🔮', title: '사주팔자', description: '나의 타고난 운명을 알아보세요', color: '#8B7EC8', bg: '#F0EDF8' },
  { href: '/today', emoji: '🌤️', title: '오늘의 운세', description: '오늘 하루 어떤 기운이 함께할까요?', color: '#7EB3C8', bg: '#EDF5F8' },
  { href: '/tojeong', emoji: '📜', title: '토정비결', description: '올해 나의 운세를 확인하세요', color: '#7EC8A4', bg: '#EDF8F2' },
  { href: '/compatibility', emoji: '💕', title: '궁합 보기', description: '우리 둘의 궁합은 몇 점?', color: '#E88B9C', bg: '#F8EDF0' },
  { href: '/chat', emoji: '💬', title: 'AI 사주상담', description: 'AI에게 사주 이야기를 들어보세요', color: '#E8A87C', bg: '#F8F2ED' },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-16">
        <div className="text-6xl mb-6 animate-bounce-soft">🏮</div>
        <h1 style={{fontFamily:'Jua, sans-serif'}} className="text-4xl text-[#2D2D2D] mb-3">사주도우미</h1>
        <p className="text-[#6B6B6B] text-lg mb-2">오로지 당신만을 위한</p>
        <p className="text-[#6B6B6B] text-lg">맞춤형 사주 분석을 진행합니다.</p>
        <div className="mt-6 flex justify-center gap-3">
          <span className="tag">🔮 사주</span>
          <span className="tag">🌤️ 운세</span>
          <span className="tag">💬 AI상담</span>
        </div>
      </section>

      <section className="space-y-4">
        {MENU_ITEMS.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="card card-hover block animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: item.bg }}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 style={{fontFamily:'Jua, sans-serif'}} className="text-lg mb-0.5" >{item.title}</h3>
                <p className="text-[#9B9B9B] text-sm">{item.description}</p>
              </div>
              <div className="text-[#E8E2DC] text-xl shrink-0">→</div>
            </div>
          </Link>
        ))}
      </section>

      <footer className="text-center py-10 text-sm text-[#9B9B9B]">
        <p>사주도우미는 재미와 참고용입니다 ☺️</p>
        <p className="mt-1">중요한 결정은 전문가와 상담하세요.</p>
      </footer>
    </div>
  );
}
