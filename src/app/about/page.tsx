import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "운명비서 소개",
  description: "명리 계산과 AI를 바탕으로 오늘의 흐름을 이해하고 선택을 정리하도록 돕는 운명비서를 소개합니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PolicyPage eyebrow="ABOUT UNMYEONG BISEO" title="미래를 단정하지 않고, 오늘의 선택을 정리합니다" description="운명비서는 사주와 오늘의 흐름을 어려운 점술 용어 대신 생활의 언어로 풀어내는 개인 맞춤 리포트 서비스입니다.">
      <section>
        <h2>운명비서가 하는 일</h2>
        <p>생년월일과 태어난 시간을 바탕으로 명리 규칙을 계산하고, 관계·일·돈·선택·감정의 다섯 축으로 오늘의 흐름을 정리합니다.</p>
        <p>오늘의 운세, 사주, 궁합, 토정비결, 타로와 꿈해몽을 한곳에서 읽고 나의 기록을 이어갈 수 있습니다.</p>
      </section>
      <section>
        <h2>우리가 지키는 원칙</h2>
        <ul>
          <li>특정 사건이나 미래를 확정적으로 예언하지 않습니다.</li>
          <li>불안과 공포를 이용해 결제나 행동을 유도하지 않습니다.</li>
          <li>사용자가 오늘 적용할 수 있는 작고 구체적인 선택을 제안합니다.</li>
          <li>건강·법률·재무 등 중요한 결정은 해당 분야 전문가의 판단을 우선합니다.</li>
        </ul>
      </section>
      <section>
        <h2>운영 정보</h2>
        <p>운영자: 김수경</p>
        <p>문의: <a href="mailto:unmyeong.team@gmail.com">unmyeong.team@gmail.com</a></p>
        <p><Link href="/contact">문의 페이지 바로가기</Link></p>
      </section>
    </PolicyPage>
  );
}
