"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { brand, hero, images, nav } from "@/content/landing";
import { ButtonLink, btnClass } from "./button";
import { DistortImage } from "./distort-image";
import { Magnetic } from "./magnetic";
import { Logo } from "./navbar";
import { Placeholder } from "./placeholder";
import { Lines } from "./reveal";

/*
 * 첫 화면(realevate 구조) — 화면 정중앙을 가로지르는 마퀴 문장 한가운데 4:5 사진 인셋,
 * 그 아래 부제·버튼·필, 하단 모서리 라벨. 마퀴는 중간 굵기·넓은 여백으로 가볍게.
 * 인셋(#hero-inset)은 인트로의 사진이 날아와 안착하는 목적지. 진입 텍스트는 CSS .rise.
 */
const delay = (s: number) => ({ animationDelay: `${s}s` });

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const [fine, setFine] = useState(false);
  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);
  const im = images[hero.insetImage];
  const line = `${hero.marquee}   ·   `;
  const row = line.repeat(3);

  return (
    <section
      id="top"
      className="hero relative grid min-h-screen grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr_auto] overflow-hidden bg-paper px-5 pb-14 pt-14 sm:px-8 lg:px-12 lg:pt-0"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/10 blur-3xl"
      />

      {/* 카드 안 헤더(realevate: About · 로고 · Contact) — 스테이지에서 상단 내비를 대신한다 */}
      <div
        className="hero-head rise absolute inset-x-0 top-0 z-20 items-center justify-between px-12 py-7"
        style={delay(0.15)}
      >
        <a href={nav.links[0].href} className="text-[13px] font-semibold text-ink/75 transition-colors hover:text-ink">
          {nav.links[0].label}
        </a>
        <a href="#top" aria-label={brand.name}>
          <Logo />
        </a>
        <a href={nav.primary.href} className="text-[13px] font-semibold text-ink/75 transition-colors hover:text-ink">
          {nav.primary.label}
        </a>
      </div>

      <div className="lg:h-20" aria-hidden />

      {/* 마퀴 + 사진 인셋 — 헤더와 아래 블록 사이 정중앙 (짧은 화면에서도 헤더와 겹치지 않게 vh로 제한) */}
      <div className="relative -mx-5 min-w-0 self-center sm:-mx-8 lg:-mx-12">
        <h1 className="hero-row marquee-mask w-full overflow-hidden text-ink" aria-label={hero.marquee}>
          <div className="marquee-track hero-marquee">
            <span className="display-light whitespace-nowrap text-[clamp(4rem,10.5vw,11rem)]" aria-hidden>
              {row}
            </span>
            <span className="display-light whitespace-nowrap text-[clamp(4rem,10.5vw,11rem)]" aria-hidden>
              {row}
            </span>
          </div>
        </h1>

        <div className="hero-inset-wrap pointer-events-none absolute left-1/2 top-1/2 z-10 w-[clamp(120px,min(14vw,22vh),210px)] -translate-x-1/2 -translate-y-1/2">
          <div id="hero-inset" className="hero-inset-inner pointer-events-auto relative overflow-hidden rounded-[6px] shadow-lift">
            <Placeholder ratio="4/5" tone={1} src={im.src} alt={im.alt} sizes="260px" priority>
              {!reduce && fine && <DistortImage src={im.src} className="absolute inset-0 z-[1]" />}
            </Placeholder>
          </div>
        </div>
      </div>

      {/* 아래 블록 — 부제·버튼·필 */}
      <div className="relative flex min-w-0 flex-col items-center pt-10 text-center lg:pt-[clamp(1.5rem,6vh,6rem)]">
        <p className="rise text-[13px] font-semibold text-brand md:text-[14px]" style={delay(0.2)}>
          {hero.eyebrow}
        </p>
        <p className="rise mt-3 max-w-xl text-[16px] leading-[1.7] text-muted md:text-[17px]" style={delay(0.3)}>
          <Lines text={hero.description} />
        </p>
        <div className="rise mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row" style={delay(0.42)}>
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
        <span
          className="rise mt-6 rounded-full border border-ink/15 px-4 py-1.5 text-[12px] font-semibold tracking-[0.02em] text-ink/70"
          style={delay(0.55)}
        >
          {hero.pill}
        </span>
      </div>

      {/* 하단 모서리 */}
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
