import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "운명비서의 개인정보 수집, 이용, 보관, 외부 서비스 전송 및 이용자 권리를 안내합니다.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage eyebrow="PRIVACY POLICY" title="개인정보처리방침" description="운명비서는 필요한 정보만 사용하고, 이용자가 자신의 정보를 통제할 수 있도록 운영합니다. 시행일: 2026년 9월 2일">
      <section><h2>1. 운영자</h2><p>운명비서의 개인정보 처리 책임자는 운영자 김수경입니다. 개인정보 관련 문의는 <a href="mailto:unmyeong.team@gmail.com">unmyeong.team@gmail.com</a>으로 보내주세요.</p></section>
      <section><h2>2. 처리하는 정보와 목적</h2><ul>
        <li>생년월일, 출생시간, 성별 및 달력 구분: 사주·오늘의 운세·궁합·토정비결 등 맞춤 결과 생성</li>
        <li>사용자가 입력한 질문과 꿈 내용: AI 상담, 타로 및 꿈해몽 결과 생성</li>
        <li>저장한 문장과 이용 기록: 사용자의 기기에서 기록·패턴 기능 제공</li>
        <li>접속·이용 정보: 서비스 품질 및 방문 통계 분석</li>
        <li>이메일 주소: 사용자가 랜딩페이지에서 신청하거나 문의할 때 안내 및 답변</li>
      </ul></section>
      <section><h2>3. 저장 위치와 보유 기간</h2><p>프로필과 저장 기록의 상당 부분은 사용자의 브라우저 저장공간에 보관됩니다. 이용자는 브라우저 데이터 삭제 또는 서비스 내 삭제 기능으로 이를 지울 수 있습니다.</p><p>서버와 외부 AI 서비스에 전달된 요청 정보는 결과 생성과 오류 대응에 필요한 기간 동안 각 서비스의 정책에 따라 처리될 수 있습니다. 문의 이메일은 문의 처리와 분쟁 대응에 필요한 기간 동안 보관한 뒤 삭제합니다.</p></section>
      <section><h2>4. 외부 서비스 이용</h2><p>운명비서는 기능 제공을 위해 Vercel(웹 호스팅), Google Analytics(이용 통계), Google Gemini·Anthropic·OpenRouter(AI 결과 생성), Google Forms(신청 접수)를 사용할 수 있습니다. Meta Pixel은 운영 설정이 활성화된 경우 광고 성과 측정에 사용될 수 있습니다.</p><p>입력 내용은 선택한 기능을 처리하기 위해 해당 사업자의 시스템으로 전송될 수 있습니다. 건강정보, 주민등록번호, 계좌번호, 비밀번호 등 민감한 정보는 입력하지 마세요.</p></section>
      <section><h2>5. 쿠키와 광고</h2><p>방문 통계와 서비스 개선을 위해 쿠키 또는 유사 기술이 사용될 수 있습니다. Google AdSense가 적용되면 Google과 광고 파트너가 광고 제공, 빈도 관리 및 성과 측정을 위해 쿠키를 사용할 수 있습니다.</p><p>이용자는 브라우저 설정이나 Google 광고 설정을 통해 쿠키 및 맞춤 광고를 관리할 수 있습니다.</p></section>
      <section><h2>6. 이용자의 권리</h2><p>이용자는 자신의 개인정보에 대한 열람, 정정, 삭제 및 처리 중지를 요청할 수 있습니다. 이메일로 요청하면 본인 확인 후 필요한 조치를 안내합니다.</p></section>
      <section><h2>7. 아동의 이용</h2><p>운명비서는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다. 법정대리인의 동의 없이 아동 정보가 제공된 사실을 알게 되면 삭제를 요청해 주세요.</p></section>
      <section><h2>8. 방침 변경</h2><p>서비스 또는 법령 변경에 따라 이 방침이 수정될 수 있습니다. 중요한 변경은 서비스 화면을 통해 알립니다.</p></section>
    </PolicyPage>
  );
}
