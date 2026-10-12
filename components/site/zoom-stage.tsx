"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { images, type posters as postersType } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";
import { Lines } from "./reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const COLOR: Record<string, string> = {
  ink: "#0b1220",
  coral: "#ff5a3c",
  forest: "#1f3a2e",
  char: "#2a2630",
};

type Poster = (typeof postersType)[number];

/**
 * 첫 화면 줌아웃 스테이지 — 스크롤하면 첫 화면 전체가 카드처럼 축소되어 아래로 내려앉고,
 * 양옆에서 포스터 4장이 상단 한 줄로 들어온다. 데스크톱만 고정(pin); 모바일은 가로 스크롤 줄.
 * 인트로가 재생 중이면 끝난 뒤에 ScrollTrigger를 만든다(핀 스페이서로 레이아웃이 바뀌지 않도록).
 */
export function ZoomStage({ posters, children }: { posters: readonly Poster[]; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = stage.current;
    const hero = wrap.current;
    if (!el || !hero) return;
    const mm = gsap.matchMedia();
    const init = () => {
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-poster]", el);
        gsap.set(cards, { x: (i) => (i < 2 ? -window.innerWidth : window.innerWidth) });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => "+=170%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });
        tl.to(hero, { scale: 0.5, y: "26vh", borderRadius: 24, duration: 1 }, 0);
        tl.to(cards, { x: 0, duration: 0.7, stagger: { each: 0.08, from: "edges" } }, 0.18);
      });
    };
    if (document.documentElement.classList.contains("preloading")) {
      const h = () => init();
      window.addEventListener("onemore:intro-done", h, { once: true });
      return () => {
        window.removeEventListener("onemore:intro-done", h);
        mm.revert();
      };
    }
    init();
    return () => mm.revert();
  }, []);

  return (
    <div ref={stage} className="zoom-stage relative bg-mist">
      <div ref={wrap} className="zoom-hero relative origin-center overflow-hidden bg-paper">
        {children}
      </div>

      <ul
        className="zoom-posters flex gap-3 overflow-x-auto px-5 py-10 sm:px-8"
        aria-label="콘텐츠 키워드"
      >
        {posters.map((p) => {
          const im = images[p.image];
          return (
            <li
              key={p.tag}
              data-poster
              className="flex w-[clamp(170px,15.5vw,224px)] shrink-0 flex-col overflow-hidden rounded-[10px] shadow-card"
              style={{ aspectRatio: "3 / 4.4", backgroundColor: COLOR[p.color] }}
            >
              <div className="relative flex-1 p-4 text-white">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-white/15 font-display text-[9px] font-extrabold">
                  +1
                </span>
                <span
                  className="absolute right-4 top-4 text-[clamp(1.3rem,2vw,1.9rem)] font-bold tracking-tight"
                  style={{ writingMode: "vertical-rl", textOrientation: "upright", letterSpacing: "0.08em" }}
                >
                  {p.title}
                </span>
                <p className="absolute bottom-4 left-4 max-w-[55%] text-[11px] leading-snug text-white/80">
                  <Lines text={p.description} />
                </p>
              </div>
              <div className="relative h-[36%] w-full">
                <Placeholder fill tone={1} src={im.src} alt={im.alt} sizes="224px" className={cn("rounded-none")} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
