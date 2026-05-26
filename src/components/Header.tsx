"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getProfileDisplayName,
  getUserProfile,
  PROFILE_UPDATED_EVENT,
} from "@/lib/user-profile-storage";
import { AI_CHAT_ENABLED } from "@/lib/feature-flags";

const NAV_ITEMS = [
  { href: "/today", label: "오늘운세", color: "#3D3338" },
  { href: "/saju", label: "사주", color: "#3D3338" },
  { href: "/tojeong", label: "토정비결", color: "#3D3338" },
  { href: "/compatibility", label: "궁합", color: "#3D3338" },
  { href: "/tarot", label: "타로", color: "#3D3338" },
  { href: "/dream", label: "꿈해몽", color: "#3D3338" },
  // AI_CHAT_ENABLED가 true일 때만 노출
  ...(AI_CHAT_ENABLED ? [{ href: "/chat", label: "AI상담", color: "#3D3338" }] : []),
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileLabel, setProfileLabel] = useState<string | null>(null);
  const isHistoryActive = pathname === "/history";

  useEffect(() => {
    const sync = () => {
      const profile = getUserProfile();
      setProfileLabel(profile ? getProfileDisplayName(profile) : null);
    };
    sync();
    window.addEventListener(PROFILE_UPDATED_EVENT, sync);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, sync);
  }, []);

  return (
    <header className="sticky top-0 z-50" style={{
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(217, 200, 192, 0.55)'
    }}>
      <div className="flex h-14 w-full items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2F282B] text-lg font-bold text-[#F4E7D6] shadow-[0_8px_18px_rgba(47,40,43,0.18)] transition-all group-hover:-translate-y-0.5 group-hover:bg-[#8B6F47]">
            <span className="absolute inset-1 rounded-[14px] border border-[#F4E7D6]/25" />
            <span className="relative" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              命
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span
              style={{ fontFamily: "Jua, sans-serif" }}
              className="text-lg tracking-[-0.03em] text-[#2F282B] transition-colors group-hover:text-[#8B6F47]"
            >
              운명비서
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold tracking-[0.16em] text-[#B8A78D] @sm:block">
              AI SAJU REPORT
            </span>
          </span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden @md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1.5 rounded-full text-xs transition-all @lg:px-3 @lg:text-sm ${
                  isActive
                    ? "bg-white shadow-sm font-bold"
                    : "text-[#8A7E78] hover:bg-[#F8F3EE]"
                }`}
                style={
                  isActive
                    ? { color: item.color, border: `1.5px solid ${item.color}22` }
                    : {}
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          {profileLabel && (
            <span className="hidden rounded-full border border-[#E8D7C4] bg-[#FFF8EE] px-2.5 py-1 text-[10px] font-bold text-[#8B6F47] @sm:inline">
              {profileLabel}
            </span>
          )}
          <Link
            href="/history"
            aria-label="나의 패턴"
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold transition-all ${
              isHistoryActive
                ? "border-[#2F282B] bg-[#2F282B] text-[#F4E7D6]"
                : "border-[#D9C8C0] bg-[#FAF8F5] text-[#3D3338] hover:border-[#8B6F47] hover:text-[#8B6F47]"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v15l-7-3-7 3v-15Z" />
              <path d="M8.5 8h7M8.5 12h5" />
            </svg>
            <span className="hidden @lg:inline">나의 패턴</span>
          </Link>

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="@md:hidden text-[#8A7E78] hover:text-[#3D3338] p-2"
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
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="@md:hidden px-4 py-3" style={{
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
                    ? "bg-[#F8F3EE] font-bold"
                    : "text-[#8A7E78] hover:bg-[#F8F3EE]"
                }`}
                style={isActive ? { color: item.color } : {}}
              >
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}