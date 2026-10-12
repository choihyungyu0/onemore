"use client";

import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { brand, hero, nav } from "@/content/landing";
import { ButtonLink, btnClass } from "./button";
import { Magnetic } from "./magnetic";
import { Logo } from "./navbar";
import { HeroInset } from "./hero-inset";

/*
 * 첫 화면(realevate 구조) — 화면 정중앙을 가로지르는 마퀴 문장 한가운데 4:5 사진 인셋,
 * 그 아래 부제·버튼·필, 하단 모서리 라벨. 마퀴는 중간 굵기·넓은 여백으로 가볍게.
 * 인셋(#hero-inset)은 인트로의 사진이 날아와 안착하는 목적지. 진입 텍스트는 CSS .rise.
 */
const delay = (s: number) => ({ animationDelay: `${s}s` });

/** 설명 줄 — 줄마다 연한 회색에서 잉크색으로 왼쪽→오른쪽 채워진다 (인트로 뒤 CSS 타이밍) */
function SweepLines({ text, from = 1.1, step = 0.3 }: { text: string; from?: number; step?: number }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className="sweep-line" style={{ animationDelay: `${(from + i * step).toFixed(2)}s` }}>
            {line}
          </span>
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

/** 마퀴 한 줄 — 강조 단어만 코랄 */
function MarqueeRow() {
  const [a, b] = hero.marquee.split(hero.marqueeAccent);
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i}>
          {a}
          <span className="text-brand">{hero.marqueeAccent}</span>
          {b}
          {"   ·   "}
        </span>
      ))}
    </>
  );
}

export function Hero() {

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
              <MarqueeRow />
            </span>
            <span className="display-light whitespace-nowrap text-[clamp(4rem,10.5vw,11rem)]" aria-hidden>
              <MarqueeRow />
            </span>
          </div>
        </h1>

        <div className="hero-inset-wrap pointer-events-none absolute left-1/2 top-1/2 z-10 w-[clamp(150px,min(16vw,28vh),250px)] -translate-x-1/2 -translate-y-1/2">
          {/* 호버: 살짝 커지며 라벨, 클릭: 크리에이터 찾기로 */}
          <a href={hero.cornerRight.href} className="pointer-events-auto relative block" aria-label={hero.cornerRight.label}>
            <HeroInset />
            <span className="hero-inset-label pointer-events-none absolute inset-x-0 bottom-3 z-[2] text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.45)]">
              {hero.cornerRight.label}
            </span>
          </a>
        </div>
      </div>

      {/* 아래 블록 — 부제·버튼·필 */}
      <div className="relative flex min-w-0 flex-col items-center pt-10 text-center lg:pt-[clamp(1.5rem,6vh,6rem)]">
        <p className="rise text-[13px] font-semibold text-brand md:text-[14px]" style={delay(0.2)}>
          <span className="marker">{hero.eyebrow}</span>
        </p>
        <p className="rise mt-3 max-w-xl text-[16px] leading-[1.6] md:text-[17px]" style={delay(0.3)}>
          <SweepLines text={hero.description} />
        </p>
        <div className="rise mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" style={delay(0.42)}>
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
        <span className="rise mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-ink/60" style={delay(0.55)}>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
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
