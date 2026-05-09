'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/saju', label: '사주', emoji: '🔮', color: '#8B7EC8' },
  { href: '/today', label: '오늘운세', emoji: '📊', color: '#7EB3C8' },
  { href: '/tojeong', label: '토정비결', emoji: '📜', color: '#7EC8A4' },
  { href: '/compatibility', label: '궁합', emoji: '💕', color: '#E88B9C' },
  { href: '/chat', label: 'AI상담', emoji: '🤖', color: '#E8A87C' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F5F0EB]/95 backdrop-blur-sm border-b-2 border-[#E8E2DC]">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🏮</span>
          <span style={{fontFamily:'Jua, sans-serif'}} className="text-lg text-[#2D2D2D] group-hover:text-[#8B7EC8] transition-colors">사주도우미</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  isActive ? 'bg-white border-2 shadow-sm font-bold' : 'text-[#6B6B6B] hover:bg-white/60'
                }`}
                style={isActive ? { color: item.color, borderColor: item.color } : {fontFamily:'Gaegu, cursive'}}>
                <span className="mr-1">{item.emoji}</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#6B6B6B] hover:text-[#2D2D2D] p-2">
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t-2 border-[#E8E2DC] px-4 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                  isActive ? 'bg-[#F5F0EB] font-bold' : 'text-[#6B6B6B] hover:bg-[#F5F0EB]'
                }`}
                style={isActive ? { color: item.color } : {}}>
                <span className="text-lg">{item.emoji}</span>
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
