import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "이용약관",
  description: "운명비서 서비스 이용 조건과 이용자의 권리 및 책임을 안내합니다.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyPage eyebrow="TERMS OF SERVICE" title="이용약관" description="운명비서를 이용하기 전에 아래 내용을 확인해 주세요. 시행일: 2026년 9월 2일">
      <section><h2>1. 목적과 운영자</h2><p>본 약관은 운영자 김수경이 제공하는 운명비서 웹서비스의 이용 조건을 정합니다. 문의는 <a href="mailto:unmyeong.team@gmail.com">unmyeong.team@gmail.com</a>으로 보내주세요.</p></section>
      <section><h2>2. 서비스의 성격</h2><p>운명비서는 명리 계산과 AI 생성 기술을 활용해 사주, 오늘의 운세, 궁합, 토정비결, 타로, 꿈해몽 등의 참고 콘텐츠를 제공합니다.</p><p>결과는 오락과 자기 이해를 위한 참고 정보이며 미래의 사건, 성과 또는 정확성을 보장하지 않습니다. 의료·법률·세무·재무·심리 상담 등 전문 서비스의 진단이나 조언을 대신하지 않습니다.</p></section>
      <section><h2>3. 이용자의 책임</h2><ul><li>타인의 개인정보를 동의 없이 입력하거나 불법적인 목적으로 서비스를 이용해서는 안 됩니다.</li><li>서비스를 방해하거나 결과 및 시스템을 무단으로 복제·변조·재판매해서는 안 됩니다.</li><li>중요한 결정에 결과를 그대로 의존하지 않고 필요한 경우 전문가의 조언을 받아야 합니다.</li></ul></section>
      <section><h2>4. AI 생성 결과</h2><p>AI가 생성한 문장에는 부정확하거나 예상하지 못한 내용이 포함될 수 있습니다. 운영자는 품질 개선을 위해 결과 생성 방식과 제공 범위를 변경할 수 있습니다.</p></section>
      <section><h2>5. 서비스 변경과 중단</h2><p>점검, 장애, 외부 서비스 변경 또는 운영상 필요에 따라 일부 기능이 변경되거나 일시 중단될 수 있습니다. 가능한 경우 중요한 변경 사항을 서비스 화면으로 안내합니다.</p></section>
      <section><h2>6. 지식재산권</h2><p>운명비서의 브랜드, 화면, 설명문, 데이터 구성 및 자체 제작 콘텐츠에 관한 권리는 운영자 또는 정당한 권리자에게 있습니다. 개인적인 이용을 넘어 복제·배포·판매하려면 사전 허락이 필요합니다.</p></section>
      <section><h2>7. 유료 서비스</h2><p>현재 또는 향후 유료 기능이 제공되는 경우 가격, 제공 내용, 결제, 청약철회와 환불 조건은 결제 전에 별도로 명확히 안내합니다.</p></section>
      <section><h2>8. 약관 변경</h2><p>관련 법령과 서비스 변경에 따라 약관이 수정될 수 있습니다. 이용자에게 불리한 중요한 변경은 적용 전에 서비스 화면을 통해 알립니다.</p></section>
    </PolicyPage>
  );
}
