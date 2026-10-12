"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { how } from "@/content/landing";
import { Contours } from "./contours";
import { DeviceDemo } from "./device-demo";
import { Lines } from "./reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 매칭 4단계 — 데스크톱에서는 섹션을 화면에 고정(pin)하고
 * 스크롤 양에 비례해 왼쪽 단계 글과 오른쪽 시각물이 함께 교차된다.
 * 오른쪽은 노트북 한 대(DeviceDemo)가 내내 머물고, 화면 안([data-screen])만 찾기→선택→제안→연결로 바뀐다.
 * 화면 안 [data-pop] 요소는 단계가 켜질 때 차례로 떠오르고, 기기 주변 [data-float] 칩도 단계마다 바뀐다.
 * 뒤에는 옅은 등고선과 코랄 글로우를 깔아 기기가 빛 속에 놓인 느낌을 준다.
 * 감속 모션에서는 핀 없이 정적으로 보여준다.
 */
export function HowScrub({ from = 0 }: { from?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const steps = how.steps.slice(from);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", el);
      const screens = gsap.utils.toArray<HTMLElement>("[data-screen]", el);
      const floats = gsap.utils.toArray<HTMLElement>("[data-float]", el);
      const bar = el.querySelector<HTMLElement>("[data-bar]");
      const n = panels.length;
      const pops = (i: number) => gsap.utils.toArray<HTMLElement>("[data-pop]", screens[i]);

      gsap.set(panels.slice(1), { autoAlpha: 0, y: 40 });
      gsap.set(screens.slice(1), { autoAlpha: 0, y: 24 });
      gsap.set(floats.slice(1), { autoAlpha: 0, y: 16 });
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
          .to(screens[i - 1], { autoAlpha: 0, y: -24, duration: 0.4 }, at)
          .to(floats[i - 1], { autoAlpha: 0, y: -16, duration: 0.4 }, at)
          .fromTo(panels[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5 }, `${at}+=0.25`)
          .fromTo(screens[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4 }, `${at}+=0.3`)
          .fromTo(floats[i], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 }, `${at}+=0.45`)
          .to(pops(i), { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.04 }, `${at}+=0.55`);
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
      {/* 배경 — 오른쪽 절반에 등고선 질감 + 기기 뒤 코랄 글로우 */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[64%]" aria-hidden>
        <Contours className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 text-ink/[0.05]" />
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,90,60,0.22),transparent)] blur-2xl" />
      </div>
      <div className="relative mx-auto grid w-full max-w-[80rem] grid-cols-[1fr_1.05fr] items-center gap-14 px-12 xl:gap-20">
        {/* 왼쪽: 단계 글 스택 */}
        <div className="relative h-[52vh] min-h-[320px]">
          {steps.map((s, i) => (
            <div key={s.title} data-panel className="absolute inset-0 flex flex-col justify-center">
              <p className="kicker text-brand">
                STEP {from + i + 1} / {how.steps.length}
              </p>
              <span className="font-display mt-4 block text-[clamp(3.5rem,7vw,6rem)] font-extrabold leading-none tracking-[-0.06em] text-ink">
                0{from + i + 1}
              </span>
              <h3 className="display-md mt-4 text-[clamp(1.9rem,3.2vw,2.8rem)] text-ink">{s.title}</h3>
              <p className="mt-5 max-w-md text-[16.5px] leading-[1.75] text-muted">
                <Lines text={s.description} />
              </p>
            </div>
          ))}
        </div>

        {/* 오른쪽: 노트북 한 대, 화면만 단계별로 교차 */}
        <div className="relative mx-auto w-full max-w-[600px]">
          <DeviceDemo />
        </div>
      </div>

      {/* 진행 바 */}
      <div className="absolute inset-x-12 bottom-10 h-px bg-ink/10">
        <div data-bar className="h-full w-full origin-left bg-brand" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}
