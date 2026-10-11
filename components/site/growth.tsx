import { growth, images } from "@/content/landing";
import { Placeholder } from "./placeholder";
import { Lines, Reveal, RevealLines } from "./reveal";
import { Kicker, Section } from "./section";

export function Growth() {
  const im = images["growth-01"];
  return (
    <Section id="growth" className="bg-ink text-white">
      <div className="grain-local absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-brand/15 blur-3xl"
      />

      <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <Reveal>
            <Kicker index="03" label={growth.kicker} invert />
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-[15px] font-semibold text-brand md:text-base">{growth.lead}</p>
          </Reveal>
          <RevealLines
            as="h2"
            text={growth.title}
            className="display mt-4 block text-[clamp(2.1rem,5vw,4.2rem)] text-white"
          />
        </div>
        <div className="flex flex-col gap-6 text-[16px] leading-[1.8] text-white/70 md:text-[17px] lg:pt-16">
          {growth.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.08}>
              <p>
                <Lines text={p} />
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 16:9 이미지 */}
      <Reveal delay={0.1} className="relative mt-16 lg:mt-24">
        <Placeholder
          ratio="16/9"
          tone={5}
          src={im.src}
          alt={im.alt}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="rounded-[24px] ring-1 ring-white/10 lg:rounded-[32px]"
        />
      </Reveal>

      {/* 4단계 여정 */}
      <ol className="relative mt-16 grid gap-8 border-t border-white/10 pt-12 md:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-6 lg:pt-14">
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
  );
}
