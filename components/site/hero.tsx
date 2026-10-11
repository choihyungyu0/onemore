"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { hero, images } from "@/content/landing";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./button";
import { DistortImage } from "./distort-image";
import { Magnetic } from "./magnetic";
import { Placeholder } from "./placeholder";
import { Lines } from "./reveal";

/*
 * 첫 화면 진입 모션은 CSS 키프레임(.rise / .rise-line)으로 처리한다.
 * JS 하이드레이션 전에도 서버 HTML이 그대로 보이고, 느린 회선에서 히어로가
 * 비어 보이는 일이 없다. 플로트·패럴랙스만 framer-motion.
 */
const delay = (s: number) => ({ animationDelay: `${s}s` });

type HeroCard = (typeof hero.cards)[number];

/** 오른쪽에 떠 있는 4:5 콘텐츠 카드 — 살짝 겹치고 기울기 없음, 호흡 플로트 + 스크롤 패럴랙스 */
function FloatingCard({
  card,
  className,
  width,
  drift,
  enter,
  parallax,
  reduce,
  priority,
}: {
  card: HeroCard;
  className?: string;
  width: string;
  drift: number;
  enter: number;
  parallax: MotionValue<number>;
  reduce: boolean;
  priority?: boolean;
}) {
  const im = images[card.image];
  return (
    <div className={cn("rise absolute", className)} style={{ width, ...delay(enter) }}>
      <motion.div style={{ y: reduce ? 0 : parallax }}>
        <motion.div
          animate={reduce ? undefined : { y: [0, -drift, 0] }}
          transition={{ duration: 6 + enter * 4, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden rounded-[22px] bg-white shadow-lift ring-1 ring-ink/[0.06]"
        >
          <Placeholder
            ratio="4/5"
            tone={card.tone}
            src={im.src}
            alt={im.alt}
            sizes="260px"
            priority={priority}
          >
            {/* WebGL 왜곡 레이어 (사진이 있을 때만, 마우스 환경) */}
            {!reduce && <DistortImage src={im.src} className="absolute inset-0 z-[1]" />}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[55%] bg-gradient-to-t from-ink/85 via-ink/40 to-transparent"
            />
            <span className="absolute left-3 top-3 z-[3] rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">
              {card.chip}
            </span>
            <span className="absolute bottom-3 left-3 z-[3] text-[12px] font-semibold text-white">
              {card.tag}
            </span>
          </Placeholder>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const p2 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const p3 = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const p4 = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative overflow-hidden bg-paper px-5 pb-16 pt-28 sm:px-8 md:pt-36 lg:px-12 lg:pb-24 lg:pt-44"
    >
      {/* 아주 연한 코랄 광원 — 한 점만 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[80rem] items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
        <div className="max-w-[46rem]">
          <p className="rise text-[14px] font-semibold text-brand md:text-[15px]" style={delay(0.05)}>
            {hero.eyebrow}
          </p>

          <h1 className="display mt-5 text-[clamp(3rem,7.4vw,6rem)] text-ink">
            {hero.title.split("\n").map((line, li) => (
              <span key={li} className="block overflow-hidden whitespace-nowrap">
                {Array.from(line).map((ch, ci) => (
                  <span
                    key={ci}
                    className="rise-char"
                    style={delay(0.15 + li * 0.14 + ci * 0.035)}
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p
            className="rise mt-7 max-w-xl text-[17px] leading-[1.7] text-muted md:text-lg"
            style={delay(0.45)}
          >
            <Lines text={hero.description} />
          </p>

          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={delay(0.58)}>
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

          <p
            className="rise mt-8 flex flex-wrap gap-x-3 gap-y-1 text-[14px] font-medium text-ink/60"
            style={delay(0.7)}
          >
            {hero.tagline.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
        </div>

        {/* 데스크톱: 살짝 겹치는 카드 4장 */}
        <div className="relative hidden h-[640px] lg:block" aria-hidden>
          <FloatingCard card={hero.cards[0]} className="left-[2%] top-[8%] z-[2]" width="232px" drift={10} enter={0.35} parallax={p1} reduce={reduce} priority />
          <FloatingCard card={hero.cards[1]} className="left-[40%] top-[0%] z-[3]" width="224px" drift={14} enter={0.5} parallax={p2} reduce={reduce} priority />
          <FloatingCard card={hero.cards[2]} className="left-[22%] top-[52%] z-[4]" width="216px" drift={8} enter={0.65} parallax={p3} reduce={reduce} />
          <FloatingCard card={hero.cards[3]} className="left-[66%] top-[46%] z-[1]" width="206px" drift={12} enter={0.8} parallax={p4} reduce={reduce} />
        </div>

        {/* 모바일·태블릿: 한 줄로 스치는 카드 3장 */}
        <div className="rise flex gap-3 lg:hidden" style={delay(0.5)} aria-hidden>
          {hero.cards.slice(0, 3).map((card, i) => {
            const im = images[card.image];
            return (
              <div
                key={card.image}
                className={cn(
                  "min-w-0 flex-1 overflow-hidden rounded-[18px] bg-white shadow-card ring-1 ring-ink/[0.06]",
                  i === 1 && "translate-y-4"
                )}
              >
                <Placeholder ratio="4/5" tone={card.tone} src={im.src} alt={im.alt} sizes="33vw" priority={i < 2} overlay="bottom">
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/92 px-2 py-0.5 text-[10.5px] font-semibold text-ink">
                    {card.chip}
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 text-[11px] font-semibold text-white">
                    {card.tag}
                  </span>
                </Placeholder>
              </div>
            );
          })}
        </div>
      </div>

      {/* 발견 → 선택 → 매칭 → 성장 */}
      <ol
        className="rise relative mx-auto mt-16 flex max-w-[80rem] items-center gap-3 overflow-x-auto border-t border-line pt-6 text-[14px] font-semibold text-ink/70 lg:mt-20"
        style={delay(0.85)}
        aria-label="서비스 흐름"
      >
        {hero.flow.map((f, i) => (
          <li key={f} className="flex shrink-0 items-center gap-3">
            <span className="font-display text-[11px] font-bold tracking-[0.12em] text-brand">
              0{i + 1}
            </span>
            <span>{f}</span>
            {i < hero.flow.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 text-ink/30" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
