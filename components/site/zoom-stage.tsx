"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { images, type posters as postersType } from "@/content/landing";
import { requestFilter } from "@/lib/filter-events";
import { Placeholder } from "./placeholder";
import { SkyVideo } from "./sky-video";
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
 * 첫 화면 줌아웃 스테이지(realevate 구도) — 스크롤하면 첫 화면 전체가 카드로 축소되어
 * 포스터 줄 아래(가운데 두 칸 폭)로 내려앉고, 양옆에서 포스터 4장이 상단 한 줄(4열 전폭)로 들어온다.
 * 핀이 끝나면 카드 아랫부분이 이어서 드러난다. 데스크톱만 고정(pin); 모바일은 가로 스크롤 줄.
 * 스테이지에 머무는 동안 상단 내비는 숨기고(히어로 카드 안의 작은 헤더가 대신) 다음 섹션에 닿으면 내려온다.
 */
export function ZoomStage({ posters, children }: { posters: readonly Poster[]; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = stage.current;
    const hero = wrap.current;
    if (!el || !hero) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const html = document.documentElement;
      const cards = gsap.utils.toArray<HTMLElement>("[data-poster]", el);
      const row = el.querySelector<HTMLElement>(".zoom-posters");
      const next = el.nextElementSibling as HTMLElement | null;
      if (!row || !cards.length) return;

      // realevate 치수 — 포스터 4열(여백 3.125vw·간격 1.875vw·비율 0.616은 CSS),
      // 히어로 카드 폭 = 가운데 두 칸 + 간격, 카드 상단 = 포스터 줄 아래 + 간격.
      // 스테이지 높이는 카드가 끝까지 드러나도록 늘린다(핀 중에는 아랫부분이 화면 아래에 걸쳐 보임).
      const metrics = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const colW = cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(row).columnGap) || vw * 0.01875;
        const top = row.offsetTop;
        const scale = (2 * colW + gap) / vw;
        const heroTop = top + cards[0].offsetHeight + gap;
        return { scale, y: heroTop - ((1 - scale) * vh) / 2, stageH: heroTop + scale * vh + top };
      };
      const setHeight = () => {
        el.style.height = Math.round(metrics().stageH) + "px";
      };
      setHeight();
      ScrollTrigger.addEventListener("refreshInit", setHeight);

      gsap.set(cards, { x: (i) => (i < 2 ? -window.innerWidth : window.innerWidth) });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=250%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.to(hero, { scale: () => metrics().scale, y: () => metrics().y, duration: 1 }, 0);
      const sky = el.querySelector<HTMLElement>(".zoom-sky");
      if (sky) {
        gsap.set(sky, { scale: 1.12 });
        tl.to(sky, { scale: 1, duration: 1 }, 0);
      }
      // 안쪽 카드가 먼저, 바깥 카드가 뒤따르게 — 이동 중 서로 겹치지 않는다
      tl.to(cards, { x: 0, duration: 0.7, stagger: { each: 0.07, from: "center" } }, 0.18);
      // 포스터가 다 도착한 뒤 한 화면 분량쯤 머무른다 — 카드를 볼 시간
      tl.to({}, { duration: 0.8 });
      tl.eventCallback("onUpdate", () => {
        hero.toggleAttribute("data-zooming", tl.progress() > 0.001);
      });

      // 상단 내비: 스테이지에 있는 동안 숨김 → 다음 섹션이 상단에 닿으면 내려온다
      html.setAttribute("data-nav-hidden", "");
      const navTrigger = next
        ? ScrollTrigger.create({
            trigger: next,
            start: "top 80px",
            onEnter: () => html.removeAttribute("data-nav-hidden"),
            onLeaveBack: () => html.setAttribute("data-nav-hidden", ""),
          })
        : null;

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", setHeight);
        navTrigger?.kill();
        html.removeAttribute("data-nav-hidden");
        el.style.height = "";
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={stage} className="zoom-stage relative bg-mist">
      {/* 하늘 배경 — 첫 화면이 카드로 물러나면 드러나는 "바깥" (여행 느낌). 구름이 천천히 흐르는 루프 영상(Mixkit),
          모바일·감속 모션에서는 첫 프레임 이미지. 줌아웃 동안 살짝 당겨진다 */}
      <div className="zoom-sky absolute inset-0 overflow-hidden" aria-hidden>
        <SkyVideo src="/video/sky.mp4" poster="/images/sky-poster.webp" className="absolute inset-0" />
        <div className="absolute inset-0 bg-white/10" />
      </div>
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
              role="button"
              tabIndex={0}
              aria-label={`${p.title} 콘텐츠 크리에이터 찾기`}
              onClick={() => requestFilter({ keyword: p.keyword })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  requestFilter({ keyword: p.keyword });
                }
              }}
              className="flex aspect-[3/4.4] w-[clamp(170px,15.5vw,224px)] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[10px] shadow-card transition-transform duration-500 hover:-translate-y-1"
              style={{ backgroundColor: COLOR[p.color] }}
            >
              <div className="relative flex-1 p-4 text-white">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-white/15 font-display text-[9px] font-extrabold">
                  +1
                </span>
                {/* 제목: 옆으로 눕힌 세로쓰기, 아래→위로 읽힘 (realevate) */}
                <span className="poster-title absolute bottom-4 right-4 text-[clamp(1.3rem,2.27vw,2.9rem)] font-medium leading-none tracking-[-0.02em]">
                  {p.title}
                </span>
                <p className="absolute bottom-4 left-4 max-w-[55%] text-[12px] leading-snug text-white">
                  <Lines text={p.description} />
                </p>
              </div>
              <div className="relative h-[29%] w-full">
                <Placeholder fill tone={1} src={im.src} alt={im.alt} sizes="(min-width: 1024px) 25vw, 224px" className="rounded-none" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
