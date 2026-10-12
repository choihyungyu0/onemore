import { ChevronRight } from "lucide-react";
import { finale } from "@/content/landing";
import { ButtonLink } from "./button";
import { FinaleHands } from "./finale-hands";
import { Magnetic } from "./magnetic";
import { Lines, Reveal, RevealLines } from "./reveal";

/**
 * 마지막 제안 — 코타 "Let's get started!" 구도.
 * 밝은 회색 무대 위로 노트북을 든 두 손이 떠오르고, 큰 제목이 노트북 받침에 걸치며, 아래에 버튼.
 */
export function Finale() {
  const lines = finale.title.split("\n");
  const head = lines.length > 2 ? [lines[0], lines.slice(1).join(" ")] : lines;
  return (
    <section className="finale relative overflow-hidden bg-[linear-gradient(180deg,#f7f6f3_0%,#ececef_100%)] pt-20 text-ink lg:pt-28">
      <div className="relative mx-auto max-w-[1500px]">
        {/* 손 + 노트북 — 모바일은 넓게 잘라 가운데만 */}
        <div className="relative mx-auto w-[150%] -translate-x-[16.7%] sm:w-[120%] sm:-translate-x-[8.3%] lg:w-full lg:translate-x-0">
          <FinaleHands src="/images/hands-laptop-cut-v2.webp" />
        </div>

        {/* 제목·버튼 — 노트북 받침에 걸친다 */}
        <div className="relative z-10 -mt-[22%] px-5 text-center sm:-mt-[17%] lg:-mt-[13.5%]">
          <RevealLines
            as="h2"
            text={head.join("\n")}
            className="display-md block text-[clamp(2rem,5.2vw,5.4rem)] leading-[1.04] tracking-[-0.04em] text-ink [text-shadow:0_0_28px_rgba(255,255,255,0.9),0_0_6px_rgba(255,255,255,0.8)]"
          />
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.7] text-muted md:text-[17px]">
              <Lines text={finale.description} />
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-4 text-[15px] font-bold tracking-tight text-ink md:text-[16px]">
              <Lines text={finale.tagline} />
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-col justify-center gap-3 pb-24 sm:flex-row lg:pb-32">
            <Magnetic>
              <ButtonLink href={finale.primary.href} variant="solid" size="lg">
                {finale.primary.label}
                <ChevronRight className="h-4 w-4" />
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href={finale.secondary.href} variant="ghost" size="lg">
                {finale.secondary.label}
              </ButtonLink>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
