import { growth } from "@/content/landing";
import { GrowthCamera } from "./growth-camera";
import { GrowthJourney } from "./growth-journey";
import { Section } from "./section";

export function Growth() {
  return (
    <>
      {/* 카메라 장면 — 뷰파인더 → 셔터 → 사진 속 (킥커·제목·본문 포함) */}
      <div id="growth" className="scroll-mt-20">
        <GrowthCamera />
      </div>

    <Section className="bg-ink !pt-0 text-white">
      <div className="grain-local absolute inset-0" aria-hidden />

      {/* 4단계 여정 + 마무리 문장 — 스크롤에 묶인 선 그리기·단어 채우기 */}
      <GrowthJourney />
    </Section>
    </>
  );
}
