import { empathy } from "@/content/landing";
import { BrandChat } from "./brand-chat";
import { Section } from "./section";

/** 브랜드 공감 — 브랜드 담당자의 메시지 스레드 (왼쪽 고정 제목 + 오른쪽 대화, 마지막 입력창이 CTA) */
export function Empathy() {
  return (
    <Section id="brands" className="bg-paper" aria-label={empathy.kicker}>
      <BrandChat />
    </Section>
  );
}
