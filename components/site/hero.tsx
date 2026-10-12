"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { hero, images } from "@/content/landing";
import { ButtonLink, btnClass } from "./button";
import { DistortImage } from "./distort-image";
import { Magnetic } from "./magnetic";
import { Placeholder } from "./placeholder";
import { Lines } from "./reveal";

/*
 * 첫 화면 — 화면을 가로지르는 거대 마퀴 문장 한가운데 4:5 사진이 끼워진 구성.
 * 마퀴 행(.hero-row)과 사진(.hero-inset-wrap)은 인트로 동안 오버레이 위로 올라와
 * 흰색·축소 상태로 보이다가, 커튼이 사라질 때 잉크색·원래 크기로 돌아온다(같은 요소).
 * 나머지 텍스트는 CSS .rise 로 그 뒤에 올라온다.
 */
const delay = (s: number) => ({ animationDelay: `${s}s` });

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const [fine, setFine] = useState(false);
  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);
  const im = images[hero.cards[0].image];
  const line = `${hero.marquee}  ·  `;
  const row = line.repeat(3);

  return (
    <section
      id="top"
      className="hero relative flex min-h-screen flex-col justify-center overflow-hidden bg-paper px-5 pb-24 pt-24 sm:px-8 lg:px-12 lg:pb-20 lg:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/10 blur-3xl"
      />

      {/* 거대 마퀴 + 사진 인셋 */}
      <div className="relative -mx-5 sm:-mx-8 lg:-mx-12">
        <h1 className="hero-row marquee-mask w-full overflow-hidden text-ink" aria-label={hero.marquee}>
          <div className="marquee-track hero-marquee">
            <span className="display whitespace-nowrap text-[clamp(4.4rem,12.5vw,13rem)]" aria-hidden>
              {row}
            </span>
            <span className="display whitespace-nowrap text-[clamp(4.4rem,12.5vw,13rem)]" aria-hidden>
              {row}
            </span>
          </div>
        </h1>

        <div className="hero-inset-wrap pointer-events-none absolute left-1/2 top-1/2 z-10 w-[clamp(140px,16vw,250px)] -translate-x-1/2 -translate-y-1/2">
          <div className="hero-inset-inner pointer-events-auto relative overflow-hidden rounded-[6px] shadow-lift">
            <Placeholder ratio="4/5" tone={0} src={im.src} alt={im.alt} sizes="250px" priority className="hero-inset-photo">
              {!reduce && fine && <DistortImage src={im.src} className="absolute inset-0 z-[1]" />}
            </Placeholder>
          </div>
        </div>
      </div>

      <p className="rise relative mt-10 text-center text-[13px] font-semibold text-brand md:text-[14px]" style={delay(0.2)}>
        {hero.eyebrow}
      </p>
      <p
        className="rise relative mx-auto mt-3 max-w-xl text-center text-[16px] leading-[1.7] text-muted md:text-[17px]"
        style={delay(0.3)}
      >
        <Lines text={hero.description} />
      </p>

      <div className="rise relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row" style={delay(0.42)}>
        <Magnetic>
          <ButtonLink href={hero.primary.href} variant="solid" size="lg">
            {hero.primary.label}
            <ChevronRight className="h-4 w-4" />
          </ButtonLink>
        </Magnetic>
        <Magnetic>
          <ButtonLink href={hero.secondary.href} variant="ghost" size="lg">
            {hero.secondary.label}
          </ButtonLink>
        </Magnetic>
      </div>

      <div className="rise relative mt-6 flex justify-center" style={delay(0.55)}>
        <span className="rounded-full border border-ink/15 px-4 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70">
          {hero.pill}
        </span>
      </div>

      {/* 하단 모서리 — 좌: 브랜드 연도 / 우: 선택 보기 */}
      <p
        className="rise absolute bottom-6 left-5 hidden font-display text-[11px] font-bold tracking-[0.14em] text-ink/50 sm:left-8 lg:left-12 lg:block"
        style={delay(0.7)}
      >
        {hero.cornerLeft}
      </p>
      <a
        href={hero.cornerRight.href}
        className={btnClass("ghost", "md", "rise absolute bottom-5 right-5 hidden h-10 px-4 text-[13px] sm:right-8 lg:right-12 lg:inline-flex")}
        style={delay(0.7)}
      >
        {hero.cornerRight.label}
        <ChevronRight className="h-3.5 w-3.5 rotate-90" />
      </a>
    </section>
  );
}
