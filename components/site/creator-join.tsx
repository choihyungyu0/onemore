import { ChevronRight } from "lucide-react";
import { creatorJoin, images } from "@/content/landing";
import { ButtonLink } from "./button";
import { Placeholder } from "./placeholder";
import { Lines, Reveal, RevealLines } from "./reveal";
import { Kicker, Section } from "./section";

export function CreatorJoin() {
  const im = images["creator-01"];
  return (
    <Section id="creators" className="overflow-hidden bg-ink text-white">
      <div className="grain-local absolute inset-0" aria-hidden />
      <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <Reveal>
            <Kicker index="06" label={creatorJoin.kicker} invert />
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-[15px] font-semibold text-brand md:text-base">{creatorJoin.eyebrow}</p>
          </Reveal>
          <RevealLines
            as="h2"
            text={creatorJoin.title}
            className="display mt-4 block text-[clamp(2rem,4.8vw,3.9rem)] text-white"
          />
          <div className="mt-8 flex flex-col gap-5 text-[16px] leading-[1.8] text-white/70 md:text-[17px]">
            {creatorJoin.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.1 + i * 0.08}>
                <p>
                  <Lines text={p} />
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.25} className="mt-9">
            <ButtonLink href={creatorJoin.cta.href} variant="brand" size="lg">
              {creatorJoin.cta.label}
              <ChevronRight className="h-4 w-4" />
            </ButtonLink>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-white/45">
              <Lines text={creatorJoin.note} />
            </p>
          </Reveal>
        </div>

        {/* 4:5 사진 한 장 */}
        <Reveal delay={0.2} className="mx-auto w-full max-w-[440px] lg:ml-auto">
          <Placeholder
            ratio="4/5"
            tone={5}
            src={im.src}
            alt={im.alt}
            sizes="(max-width: 1024px) 90vw, 440px"
            overlay="bottom"
            className="rounded-[24px] shadow-lift ring-1 ring-white/10"
          >
            <span className="absolute bottom-4 left-4 text-[13px] font-semibold text-white">
              {im.alt}
            </span>
          </Placeholder>
        </Reveal>
      </div>
    </Section>
  );
}
