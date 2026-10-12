"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { how } from "@/content/landing";
import { Vignette } from "./how-vignettes";
import { Lines } from "./reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 매칭 4단계 — 데스크톱에서는 섹션을 화면에 고정(pin)하고
 * 스크롤 양에 비례해 왼쪽 단계 글과 오른쪽 UI 비네트가 함께 교차된다.
 * 비네트 안의 [data-pop] 요소는 단계가 켜질 때 차례로 떠오른다.
 * 감속 모션에서는 핀 없이 정적으로 보여준다.
 */
export function HowScrub() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", el);
      const cards = gsap.utils.toArray<HTMLElement>("[data-vignette]", el);
      const bar = el.querySelector<HTMLElement>("[data-bar]");
      const n = panels.length;
      const pops = (i: number) => gsap.utils.toArray<HTMLElement>("[data-pop]", cards[i]);

      gsap.set(panels.slice(1), { autoAlpha: 0, y: 40 });
      gsap.set(cards.slice(1), { autoAlpha: 0, y: 48, scale: 0.97 });
      for (let i = 1; i < n; i++) gsap.set(pops(i), { autoAlpha: 0, y: 10 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${n * 90}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      // 첫 단계는 핀 시작부터 완성된 상태로 보이고 잠시 머무른다
      tl.to({}, { duration: 0.5 });

      for (let i = 1; i < n; i++) {
        const at = `step${i}`;
        tl.to(panels[i - 1], { autoAlpha: 0, y: -40, duration: 0.5 }, at)
          .to(cards[i - 1], { autoAlpha: 0, y: -40, scale: 0.97, duration: 0.5 }, at)
          .fromTo(panels[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5 }, `${at}+=0.25`)
          .fromTo(cards[i], { autoAlpha: 0, y: 48, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, `${at}+=0.25`)
          .to(pops(i), { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.02 }, `${at}+=0.5`);
        if (i < n - 1) tl.to({}, { duration: 0.6 }); // 각 단계에서 잠시 머무름
      }
      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top top", end: () => `+=${n * 90}%`, scrub: true },
          }
        );
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="how-scrub relative hidden h-screen items-center overflow-hidden lg:flex">
      <div className="mx-auto grid w-full max-w-[80rem] grid-cols-[1fr_1.05fr] items-center gap-14 px-12 xl:gap-20">
        {/* 왼쪽: 단계 글 스택 */}
        <div className="relative h-[52vh] min-h-[320px]">
          {how.steps.map((s, i) => (
            <div key={s.title} data-panel className="absolute inset-0 flex flex-col justify-center">
              <p className="kicker text-brand">
                STEP {i + 1} / {how.steps.length}
              </p>
              <span className="font-display mt-4 block text-[clamp(3.5rem,7vw,6rem)] font-extrabold leading-none tracking-[-0.06em] text-ink">
                0{i + 1}
              </span>
              <h3 className="display-md mt-4 text-[clamp(1.9rem,3.2vw,2.8rem)] text-ink">{s.title}</h3>
              <p className="mt-5 max-w-md text-[16.5px] leading-[1.75] text-muted">
                <Lines text={s.description} />
              </p>
            </div>
          ))}
        </div>

        {/* 오른쪽: UI 비네트 카드 스택 */}
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px]" style={{ maxHeight: "68vh" }}>
          {how.steps.map((s, i) => (
            <div key={s.title} data-vignette className="absolute inset-0">
              <Vignette step={i} />
            </div>
          ))}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="absolute inset-x-12 bottom-10 h-px bg-ink/10">
        <div data-bar className="h-full w-full origin-left bg-brand" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}
