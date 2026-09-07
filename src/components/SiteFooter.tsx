import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/about", label: "운명비서 소개" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/contact", label: "문의" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] px-4 py-8 text-center text-xs leading-6 text-[#81746d] md:px-8">
      <nav aria-label="운영 정책" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {LEGAL_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-[var(--accent)] hover:underline">
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4">운명비서는 재미와 참고를 위한 서비스이며 중요한 결정의 전문적 조언을 대신하지 않습니다.</p>
      <p className="mt-1">운영자 김수경 · unmyeong.team@gmail.com</p>
      <p className="mt-1">© 2026 운명비서</p>
    </footer>
  );
}
