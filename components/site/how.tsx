import { how } from "@/content/landing";
import { Lines, Reveal, RevealLines } from "./reveal";
import { Section, SectionHeader } from "./section";

export function How() {
  return (
    <Section id="how" className="bg-mist">
      <SectionHeader
        index="02"
        kicker={how.kicker}
        title={how.title}
        description={how.description}
      />

      <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-5">
        {how.steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08} className="h-full">
            <li className="flex h-full flex-col rounded-[24px] bg-white p-6 shadow-card ring-1 ring-ink/[0.05] lg:p-7">
              <span className="font-display text-[40px] font-extrabold leading-none tracking-tight text-brand lg:text-[48px]">
                0{i + 1}
              </span>
              <h3 className="mt-8 text-[20px] font-extrabold tracking-tight lg:mt-10">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                <Lines text={s.description} />
              </p>
            </li>
          </Reveal>
        ))}
      </ol>

      {/* 선언문 */}
      <div className="mt-20 grid gap-8 border-t border-ink/10 pt-14 lg:mt-28 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pt-20">
        <RevealLines
          as="h3"
          text={how.statement.title}
          className="display text-[clamp(1.9rem,4vw,3.25rem)] text-ink"
        />
        <Reveal delay={0.15} className="lg:pt-3">
          <p className="text-[19px] font-bold tracking-tight text-ink">{how.statement.lead}</p>
          <p className="mt-4 text-[16px] leading-[1.75] text-muted md:text-[17px]">
            <Lines text={how.statement.body} />
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
