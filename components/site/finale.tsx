import { ChevronRight } from "lucide-react";
import { finale, images } from "@/content/landing";
import { ButtonLink } from "./button";
import { Placeholder } from "./placeholder";
import { Lines, Reveal, RevealLines } from "./reveal";

/** 마지막 제안 — 21:9 사진을 배경으로, 어두운 오버레이 위에 흰 글자 */
export function Finale() {
  const im = images["final-01"];
  return (
    <section className="relative overflow-hidden bg-ink px-5 py-28 text-white sm:px-8 md:py-40 lg:px-12 lg:py-48">
      <Placeholder
        fill
        tone={0}
        label="배경 이미지 자리 21/9"
        src={im.src}
        alt={im.alt}
        sizes="100vw"
        overlay="full"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <RevealLines
          as="h2"
          text={finale.title}
          className="display block text-[clamp(2.2rem,5.6vw,4.6rem)] text-white"
        />
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-[17px] leading-[1.75] text-white/80 md:text-lg">
            <Lines text={finale.description} />
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-[16px] font-bold tracking-tight text-white md:text-[17px]">
            <Lines text={finale.tagline} />
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={finale.primary.href} variant="white" size="lg">
            {finale.primary.label}
            <ChevronRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={finale.secondary.href} variant="brand" size="lg">
            {finale.secondary.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
