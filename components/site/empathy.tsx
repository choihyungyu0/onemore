import { ChevronRight } from "lucide-react";
import { empathy, images, type ImageKey } from "@/content/landing";
import { ButtonLink } from "./button";
import { Placeholder } from "./placeholder";
import { Lines, Reveal } from "./reveal";
import { Section, SectionHeader } from "./section";

const FIT_IMAGES: ImageKey[] = ["fit-01", "fit-02", "fit-03"];
const FIT_TONES = [2, 1, 4];

export function Empathy() {
  return (
    <Section id="brands" className="bg-paper">
      <SectionHeader
        index="04"
        kicker={empathy.kicker}
        title={empathy.title}
        description={empathy.description}
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5 lg:mt-20">
        {empathy.items.map((it, i) => {
          const im = images[FIT_IMAGES[i]];
          return (
            <Reveal key={it.label} delay={i * 0.1} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-cream ring-1 ring-ink/[0.04] transition-[transform,box-shadow,background-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:bg-white hover:shadow-lift">
                <Placeholder
                  ratioClassName="aspect-[4/5] md:aspect-[4/3]"
                  tone={FIT_TONES[i]}
                  src={im.src}
                  alt={im.alt}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <p className="text-[13px] font-semibold text-brand">{it.label}</p>
                  <blockquote className="display-md mt-4 text-[clamp(1.3rem,1.9vw,1.6rem)] text-ink">
                    “<Lines text={it.quote} />”
                  </blockquote>
                  <p className="mt-auto pt-7 text-[15px] leading-[1.7] text-muted">
                    <Lines text={it.description} />
                  </p>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.2} className="mt-12 flex justify-center lg:mt-16">
        <ButtonLink href={empathy.cta.href} variant="solid" size="lg">
          {empathy.cta.label}
          <ChevronRight className="h-4 w-4" />
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
