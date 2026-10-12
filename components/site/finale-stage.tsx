"use client";

import { Fragment, useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";
import { finale } from "@/content/landing";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./button";
import { Contours } from "./contours";
import { DemoScreen, LaptopShell } from "./device-demo";
import { Magnetic } from "./magnetic";
import { Lines, Reveal } from "./reveal";
import { Kicker } from "./section";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 마지막 제안 — 선명한 노트북(매칭 섹션과 같은 CSS 기기)이 스크롤로 떠오르고(살짝 기울었다 바로 서며),
 * 화면 안에서 찾기 데모가 돈다. 큰 제목이 받침에 걸치며 스크롤에 따라 단어가 하나씩 채워지고,
 * 핵심 구절(finale.titleAccent)은 코랄로 물든다. 뒤에는 코랄 글로우 + 등고선 질감.
 */
export function FinaleStage() {
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 노트북 등장 — 아래에서 올라오며 바로 선다
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "center 55%"] });
  const y = useTransform(scrollYProgress, [0, 1], [140, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 2]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  // 제목 단어 채우기 (스크롤 스크럽)
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const brand = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#FF5A3C";
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", el);
      gsap.set(words, { color: "rgba(11,18,32,0.16)" });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 92%", end: "bottom 45%", scrub: 0.5 },
      });
      words.forEach((w, i) => tl.to(w, { color: w.dataset.accent ? brand : "#0b1220", duration: 0.25 }, (i / words.length) * 0.8));
      const t = window.setTimeout(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, 400);
      return () => window.clearTimeout(t);
    });
    return () => mm.revert();
  }, []);

  const lines = finale.title.split("\n");
  const grouped = lines.length > 2 ? [lines[0], lines.slice(1).join(" ")] : lines;
  const accent = (finale.titleAccent ?? "").split(/\s+/).filter(Boolean);
  const wordLines = grouped.map((ln) => ln.split(/\s+/).filter(Boolean));
  const isAccent = (li: number, wi: number) => {
    if (!accent.length) return false;
    const ws = wordLines[li];
    for (let s = Math.max(0, wi - accent.length + 1); s <= wi; s++) {
      const seg = ws.slice(s, s + accent.length);
      if (seg.length === accent.length && seg.every((w, k) => w === accent[k])) return true;
    }
    return false;
  };

  return (
    <section ref={root} className="finale relative overflow-hidden bg-[linear-gradient(180deg,#f7f6f3_0%,#eeeef1_100%)] pt-20 text-ink lg:pt-28" aria-label={finale.kicker}>
      {/* 배경 — 등고선 + 코랄 글로우 */}
      <Contours className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 text-ink/[0.05]" />
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[70vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,90,60,0.22),transparent_70%)] blur-2xl" aria-hidden />

      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="flex justify-center">
          <Kicker index="06" label={finale.kicker} />
        </Reveal>

        {/* 노트북 — 선명한 CSS 기기 */}
        <div ref={stage} className="relative mx-auto mt-10 w-[min(92vw,980px)] lg:mt-14" style={{ perspective: 1800 }}>
          <motion.div style={reduce ? undefined : { y, rotateX, scale, transformOrigin: "50% 100%" }}>
            <LaptopShell>
              <DemoScreen step={0} rootRef={stage} />
            </LaptopShell>
          </motion.div>
          {/* 바닥 그림자 */}
          <div className="pointer-events-none absolute left-1/2 top-full h-10 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/25 blur-2xl" aria-hidden />
        </div>

        {/* 제목·버튼 — 받침에 걸친다 */}
        <div className="relative z-10 mt-3 text-center lg:-mt-[1%]">
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(247,246,243,0.95),transparent_75%)]" aria-hidden />
          <h2 ref={titleRef} className="display relative block text-[clamp(2rem,5.2vw,5.4rem)] leading-[1.06] tracking-[-0.04em] text-ink" aria-label={finale.title.replace(/\n/g, " ")}>
            {wordLines.map((ws, li) => (
              <Fragment key={li}>
                {ws.map((w, wi) => (
                  <Fragment key={`${li}-${wi}`}>
                    <span data-word data-accent={isAccent(li, wi) ? "1" : undefined} className={cn("inline-block", isAccent(li, wi) && "finale-accent")} aria-hidden>
                      {w}
                    </span>
                    {wi < ws.length - 1 ? " " : null}
                  </Fragment>
                ))}
                {li < wordLines.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </h2>
          <Reveal delay={0.12}>
            <p className="relative mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.7] text-muted md:text-[17px]">
              <Lines text={finale.description} />
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="relative mt-4 text-[15px] font-bold tracking-tight text-ink md:text-[16px]">
              <Lines text={finale.tagline} />
            </p>
          </Reveal>
          <Reveal delay={0.24} className="relative mt-8 flex flex-col justify-center gap-3 pb-24 sm:flex-row lg:pb-32">
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
