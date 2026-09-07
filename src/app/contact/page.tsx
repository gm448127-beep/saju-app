import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "문의",
  description: "운명비서 서비스 이용, 오류, 개인정보 및 광고 관련 문의 안내입니다.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PolicyPage eyebrow="CONTACT" title="운명비서에 문의하기" description="서비스 이용 중 불편한 점이나 개인정보 관련 요청을 이메일로 보내주세요.">
      <section>
        <h2>이메일 문의</h2>
        <p><a href="mailto:unmyeong.team@gmail.com?subject=운명비서 문의">unmyeong.team@gmail.com</a></p>
        <p>문의 내용과 이용한 화면, 발생 시각을 함께 적어주시면 확인에 도움이 됩니다. 민감한 개인정보나 비밀번호는 보내지 마세요.</p>
      </section>
      <section>
        <h2>문의할 수 있는 내용</h2>
        <ul>
          <li>서비스 오류와 이용 방법</li>
          <li>개인정보 열람·정정·삭제 요청</li>
          <li>콘텐츠 또는 저작권 관련 제보</li>
          <li>광고와 제휴 문의</li>
        </ul>
      </section>
      <section>
        <h2>운영 안내</h2>
        <p>운영자 김수경이 내용을 확인한 뒤 이메일로 답변합니다. 문의량에 따라 답변까지 시간이 걸릴 수 있습니다.</p>
      </section>
    </PolicyPage>
  );
}
