"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { growth } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Lines } from "./reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 함께 성장하기 — 4단계 여정 + 마무리 문장 (스크롤에 묶인 연출)
 * - 여정: 코랄 선이 왼쪽에서 오른쪽으로 그려지고(모바일은 위→아래), 선이 닿는 순서대로 점이 튀어나오며
 *   번호·라벨·제목·설명이 차례로 올라온다. 점은 팔로워가 커지듯 단계마다 조금씩 커진다.
 *   각 칸 뒤에는 큰 번호 워터마크가 아주 옅게 깔린다.
 * - 마무리 문장: 스크롤에 따라 단어가 하나씩 흐림(16%)에서 흰색으로 채워지고,
 *   핵심 구절(growth.closingAccent)은 코랄로 물든다. 마지막엔 밑줄이 왼쪽에서 그어진다.
 * 감속 모션: 모두 완성된 상태로 정적 표시.
 */
export function GrowthJourney() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const brand = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#FF5A3C";
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const stagesWrap = el.querySelector<HTMLElement>("[data-stages]")!;
      const line = el.querySelector<HTMLElement>("[data-line]")!;
      const stages = gsap.utils.toArray<HTMLElement>("[data-stage]", el);

      // 초기 상태
      gsap.set(line, desktop ? { scaleX: 0, transformOrigin: "left center" } : { scaleY: 0, transformOrigin: "top center" });
      stages.forEach((s) => {
        gsap.set(s.querySelector("[data-dot]"), { scale: 0 });
        gsap.set(s.querySelectorAll("[data-reveal]"), { autoAlpha: 0, y: 26 });
        gsap.set(s.querySelector("[data-mark]"), { autoAlpha: 0, y: 30 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: stagesWrap, start: "top 82%", end: desktop ? "bottom 55%" : "bottom 65%", scrub: 0.6 },
      });
      tl.to(line, desktop ? { scaleX: 1, duration: 1 } : { scaleY: 1, duration: 1 }, 0);
      stages.forEach((s, i) => {
        const at = 0.04 + (i / stages.length) * 0.84;
        tl.to(s.querySelector("[data-mark]"), { autoAlpha: 1, y: 0, duration: 0.18 }, at);
        tl.to(s.querySelector("[data-dot]"), { scale: 1, duration: 0.08, ease: "back.out(2.5)" }, at);
        tl.to(s.querySelectorAll("[data-reveal]"), { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.035, ease: "power2.out" }, at + 0.03);
      });

      // 마무리 문장 — 단어 채우기
      const closing = el.querySelector<HTMLElement>("[data-closing]")!;
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", closing);
      const rule = closing.querySelector<HTMLElement>("[data-rule]")!;
      gsap.set(words, { color: "rgba(255,255,255,0.16)" });
      gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
      const tl2 = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: closing, start: "top 88%", end: "center 42%", scrub: 0.5 },
      });
      words.forEach((w, i) => {
        tl2.to(w, { color: w.dataset.accent ? brand : "#ffffff", duration: 0.22 }, (i / words.length) * 0.78);
      });
      tl2.to(rule, { scaleX: 1, duration: 0.2, ease: "power2.out" }, 0.8);

      const t = window.setTimeout(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, 400);
      return () => window.clearTimeout(t);
    });
    return () => mm.revert();
  }, []);

  // 마무리 문장을 단어로 쪼개고, 강조 구절의 단어에 표시
  const accent = (growth.closingAccent ?? "").split(/\s+/).filter(Boolean);
  const lines = growth.closing.split("\n").map((ln) => ln.split(/\s+/).filter(Boolean));
  const isAccent = (lineIdx: number, wordIdx: number, word: string) => {
    if (!accent.length) return false;
    const flat = lines[lineIdx];
    // 구절이 연속으로 맞는지 확인
    for (let start = Math.max(0, wordIdx - accent.length + 1); start <= wordIdx; start++) {
      const seg = flat.slice(start, start + accent.length);
      if (seg.length === accent.length && seg.every((w, k) => w === accent[k])) return true;
    }
    return word === "__never__";
  };

  return (
    <div ref={root}>
      {/* 4단계 여정 */}
      <div data-stages className="relative mt-4 border-t border-white/10 pt-12 lg:pt-16">
        <ol className="journey relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* 선 — 데스크톱은 점들을 가로지르는 가로선, 모바일은 왼쪽 세로선 */}
          <span data-line aria-hidden className="journey-line pointer-events-none absolute bg-gradient-to-r from-brand via-brand to-brand/40" />
          {growth.stages.map((s, i) => (
            <li key={s.label} data-stage className="relative pl-7 lg:pl-0">
              {/* 워터마크 번호 */}
              <span data-mark aria-hidden className="pointer-events-none absolute -top-4 right-0 select-none font-display text-[clamp(5rem,9vw,8rem)] font-extrabold leading-none tracking-[-0.06em] text-white/[0.045] lg:-top-8">
                0{i + 1}
              </span>
              {/* 점 — 단계마다 커진다 */}
              <span className="absolute left-0 top-[7px] flex items-center justify-center lg:relative lg:top-0 lg:mb-7 lg:h-6 lg:w-6" aria-hidden>
                <span data-dot className="journey-dot relative block rounded-full bg-brand" style={{ width: 8 + i * 4, height: 8 + i * 4 }}>
                  <span className="journey-halo absolute inset-0 rounded-full bg-brand" />
                </span>
              </span>
              <p data-reveal className="font-display text-[11px] font-bold tracking-[0.18em] text-white/50">
                0{i + 1}
              </p>
              <p data-reveal className="mt-1 text-[13.5px] font-semibold text-brand">
                {s.label}
              </p>
              <h3 data-reveal className="mt-2 text-[22px] font-extrabold tracking-tight text-white">
                {s.title}
              </h3>
              <p data-reveal className="mt-3 text-[15px] leading-[1.7] text-white/60">
                <Lines text={s.description} />
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* 마무리 문장 — 단어 채우기 */}
      <div data-closing className="relative mt-20 border-t border-white/10 pt-14 lg:mt-28 lg:pt-20">
        <p className="display-md mx-auto block max-w-4xl text-center text-[clamp(1.7rem,3.8vw,3.1rem)] leading-[1.25] text-white" aria-label={growth.closing}>
          {lines.map((ws, li) => (
            <Fragment key={li}>
              {ws.map((w, wi) => (
                <Fragment key={`${li}-${wi}`}>
                  <span data-word data-accent={isAccent(li, wi, w) ? "1" : undefined} className={cn("inline-block", isAccent(li, wi, w) && "journey-accent")} aria-hidden>
                    {w}
                  </span>
                  {wi < ws.length - 1 ? " " : null}
                </Fragment>
              ))}
              {li < lines.length - 1 ? <br /> : null}
            </Fragment>
          ))}
        </p>
        <span data-rule aria-hidden className="mx-auto mt-8 block h-[2px] w-[min(240px,40vw)] bg-brand" />
      </div>
    </div>
  );
}
