"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/saju", emoji: "🔮", label: "사주", color: "#EAE5DA" },
  { href: "/today", emoji: "🌤️", label: "오늘운세", color: "#8AAEC8" },
  { href: "/tojeong", emoji: "📜", label: "토정비결", color: "#8AC8A4" },
  { href: "/compatibility", emoji: "💕", label: "궁합", color: "#C88A9C" },
  { href: "/chat", emoji: "💬", label: "AI상담", color: "#B08AC8" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50" style={{
      background: 'rgba(245, 237, 232, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(204, 182, 176, 0.4)'
    }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">✨</span>
          <span
            style={{ fontFamily: "Jua, sans-serif" }}
            className="text-lg text-[#3D3338] group-hover:text-[#EAE5DA] transition-colors"
          >
            사주도우미
          </span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  isActive
                    ? "bg-white shadow-sm font-bold"
                    : "text-[#8A7E78] hover:bg-white/60"
                }`}
                style={
                  isActive
                    ? { color: item.color, border: `1.5px solid ${item.color}22` }
                    : {}
                }
              >
                <span className="mr-1">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#8A7E78] hover:text-[#3D3338] p-2"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden px-4 py-3" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(204, 182, 176, 0.3)'
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                  isActive
                    ? "bg-[#EFDED5] font-bold"
                    : "text-[#8A7E78] hover:bg-[#EFDED5]"
                }`}
                style={isActive ? { color: item.color } : {}}
              >
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