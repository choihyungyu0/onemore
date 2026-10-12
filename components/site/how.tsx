import { how } from "@/content/landing";
import { HowScenes } from "./how-scenes";
import { HowSplit } from "./how-split";
import { HowStatement } from "./how-statement";
import { DeviceDemo } from "./device-demo";
import { Lines, Reveal } from "./reveal";
import { Section } from "./section";

export function How() {
  return (
    <>
      {/* 오프너 — 노리스 ON/OFF TRACK 구도: 두 인물 + 브랜드는 고른다 / 크리에이터는 답한다 */}
      <HowSplit />

      {/* 모바일·태블릿: 단계 카드 그리드 */}
      <Section className="bg-mist !py-14 lg:hidden">
        <ol className="how-grid grid gap-4 md:grid-cols-2">
          {how.steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className="h-full">
              <li className="flex h-full flex-col rounded-[24px] bg-white p-6 shadow-card ring-1 ring-ink/[0.05]">
                <div className="mb-6">
                  <DeviceDemo step={i} />
                </div>
                <span className="font-display text-[40px] font-extrabold leading-none tracking-tight text-brand">
                  0{i + 1}
                </span>
                <h3 className="mt-8 text-[20px] font-extrabold tracking-tight">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                  <Lines text={s.description} />
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* 데스크톱: 코타식 장면 4개 — 고정 장면 + 가운데 렌즈 + 호 진행 */}
      <HowScenes />

      {/* 마무리 — 노리스 PARTNERS & CAMPAIGNS 구도: 손글씨 Collab + 두 줄 제목 + 국가 워드마크 마퀴 */}
      <HowStatement />
    </>
  );
}
