import { growth } from "@/content/landing";
import { GrowthCamera } from "./growth-camera";
import { Lines, Reveal, RevealLines } from "./reveal";
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

      {/* 4단계 여정 */}
      <ol className="relative grid gap-8 border-t border-white/10 pt-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:pt-14">
        {growth.stages.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <li className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-[calc(100%-0.5rem)] before:w-px before:bg-white/15 lg:pl-0 lg:before:hidden">
              <span className="absolute -left-[3px] top-1.5 h-[7px] w-[7px] rounded-full bg-brand lg:hidden" aria-hidden />
              <div className="hidden items-center gap-3 lg:flex" aria-hidden>
                <span className="h-[7px] w-[7px] rounded-full bg-brand" />
                <span className="h-px flex-1 bg-white/15" />
              </div>
              <p className="font-display text-[11px] font-bold tracking-[0.18em] text-white/50 lg:mt-6">
                0{i + 1}
              </p>
              <p className="mt-1 text-[13.5px] font-semibold text-brand">{s.label}</p>
              <h3 className="mt-2 text-[22px] font-extrabold tracking-tight text-white">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-white/60">
                <Lines text={s.description} />
              </p>
            </li>
          </Reveal>
        ))}
      </ol>

      {/* 마무리 인용 */}
      <div className="relative mt-20 border-t border-white/10 pt-14 lg:mt-28 lg:pt-20">
        <RevealLines
          as="p"
          text={growth.closing}
          className="display-md mx-auto block max-w-4xl text-center text-[clamp(1.6rem,3.6vw,2.9rem)] text-white"
        />
      </div>
    </Section>
    </>
  );
}
