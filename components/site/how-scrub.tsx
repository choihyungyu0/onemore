"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { how } from "@/content/landing";
import { Lines } from "./reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 매칭 4단계 — 데스크톱에서는 섹션을 화면에 고정(pin)하고
 * 스크롤 양에 비례해 01→04 숫자·내용이 교차되는 스크럽 연출.
 * 감속 모션에서는 핀 없이 정적으로 보여준다.
 */
export function HowScrub() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(
      { desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)" },
      () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", el);
        const nums = gsap.utils.toArray<HTMLElement>("[data-num]", el);
        const bar = el.querySelector<HTMLElement>("[data-bar]");
        const n = panels.length;

        gsap.set(panels.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(nums.slice(1), { autoAlpha: 0, y: "30%" });

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

        for (let i = 1; i < n; i++) {
          tl.to(panels[i - 1], { autoAlpha: 0, y: -40, duration: 0.5 }, `step${i}`)
            .to(nums[i - 1], { autoAlpha: 0, y: "-30%", duration: 0.5 }, `step${i}`)
            .fromTo(panels[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5 }, `step${i}+=0.25`)
            .fromTo(nums[i], { autoAlpha: 0, y: "30%" }, { autoAlpha: 1, y: "0%", duration: 0.5 }, `step${i}+=0.25`);
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
      }
    );
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="relative hidden h-screen items-center overflow-hidden lg:flex">
      <div className="mx-auto grid w-full max-w-[80rem] grid-cols-[0.9fr_1.1fr] items-center gap-16 px-12">
        {/* 거대 숫자 스택 */}
        <div className="relative h-[42vh]">
          {how.steps.map((_, i) => (
            <span
              key={i}
              data-num
              className="font-display absolute left-0 top-1/2 -translate-y-1/2 text-[clamp(10rem,22vw,20rem)] font-extrabold leading-none tracking-[-0.06em] text-brand"
            >
              0{i + 1}
            </span>
          ))}
        </div>

        {/* 단계 내용 스택 */}
        <div className="relative h-[42vh]">
          {how.steps.map((s, i) => (
            <div key={s.title} data-panel className="absolute inset-0 flex flex-col justify-center">
              <p className="kicker text-muted">
                STEP {i + 1} / {how.steps.length}
              </p>
              <h3 className="display-md mt-5 text-[clamp(2.2rem,4.2vw,3.6rem)] text-ink">{s.title}</h3>
              <p className="mt-6 max-w-lg text-[18px] leading-[1.75] text-muted">
                <Lines text={s.description} />
              </p>
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
