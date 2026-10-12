"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus } from "lucide-react";
import { images, showcase } from "@/content/landing";
import { Placeholder } from "./placeholder";
import { Lines } from "./reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 콘텐츠 쇼케이스(columbus-travel "Services" 구도) — 핀 고정 한 화면.
 * 1) 큰 헤드라인 마퀴 위에 아치형 창처럼 뚫린 사진이 스크롤에 따라 카드 전체로 커지고
 * 2) 제목·설명·(Scroll)·진행선·+버튼이 나타난 뒤
 * 3) 다음 사진이 아래에서 밀고 올라오며 슬라이드가 넘어간다(제목은 마스크 안에서 위로).
 * 데스크톱·모션 허용 시에만 핀; 그 외(모바일·감속 모션)엔 세로로 쌓인 카드 목록.
 */
export function Showcase() {
  const root = useRef<HTMLElement>(null);
  const slides = showcase.slides;
  const n = slides.length;
  const row = Array(4).fill(showcase.headline).join("  ·  ") + "  ·  ";

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const stage = el.querySelector<HTMLElement>(".show-stage");
      const frame = el.querySelector<HTMLElement>(".show-frame");
      const headline = el.querySelector<HTMLElement>(".show-headline");
      const ui = el.querySelector<HTMLElement>(".show-ui");
      const bar = el.querySelector<HTMLElement>(".show-bar-fill");
      const imgs = gsap.utils.toArray<HTMLElement>(".show-img", el);
      const titles = gsap.utils.toArray<HTMLElement>(".show-title", el);
      const descs = gsap.utils.toArray<HTMLElement>(".show-desc", el);
      if (!stage || !frame || !headline || !ui || !bar || imgs.length < 2) return;

      // 초기 상태 — 아치형 창 사진 하나, 나머지 슬라이드·UI는 숨김
      gsap.set(frame, { width: "28vw", height: "70vh", borderRadius: "14vw 14vw 12px 12px" });
      gsap.set(imgs.slice(1), { yPercent: 100 });
      gsap.set(titles.slice(1), { yPercent: 110, opacity: 0 });
      gsap.set(descs.slice(1), { opacity: 0 });
      gsap.set(ui, { opacity: 0, y: 24 });
      gsap.set(bar, { scaleX: 1 / n });

      const STEP = 0.6; // 슬라이드 한 장당 스크롤 배분
      const total = 1.3 + (n - 1) * STEP + 0.3;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${Math.round(total * 100)}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      // 1) 창 → 카드 전체. 헤드라인은 사진 위에 옅게 남았다가 사라진다
      tl.to(frame, { width: "100%", height: "100%", borderRadius: "10px 10px 10px 10px", duration: 1 }, 0);
      tl.to(headline, { opacity: 0.22, duration: 0.7 }, 0);
      tl.to(headline, { opacity: 0, duration: 0.2 }, 0.8);
      // 2) 첫 슬라이드 UI 등장
      tl.to(ui, { opacity: 1, y: 0, duration: 0.3 }, 1.0);
      // 3) 슬라이드 전환 — 다음 사진이 아래에서 올라오고, 제목은 마스크 안에서 위로 교체
      for (let i = 1; i < n; i++) {
        const at = 1.3 + (i - 1) * STEP + 0.2;
        tl.to(imgs[i], { yPercent: 0, duration: 0.4 }, at);
        tl.to(titles[i - 1], { yPercent: -110, opacity: 0, duration: 0.4 }, at);
        tl.to(titles[i], { yPercent: 0, opacity: 1, duration: 0.4 }, at);
        tl.to(descs[i - 1], { opacity: 0, duration: 0.15 }, at);
        tl.to(descs[i], { opacity: 1, duration: 0.2 }, at + 0.2);
        tl.to(bar, { scaleX: (i + 1) / n, duration: 0.4 }, at);
      }
    });
    return () => mm.revert();
  }, [n]);

  return (
    <section ref={root} id="showcase" className="bg-cream" aria-label={showcase.headline}>
      {/* 데스크톱: 핀 스테이지 */}
      <div className="show-stage relative hidden h-screen overflow-hidden lg:block">
        {/* 카드 — 상단은 고정 내비(76px) 아래부터 */}
        <div className="absolute inset-x-5 bottom-5 top-[88px]">
          {/* 사진 프레임 — 처음엔 아치형 창, 스크롤하면 카드 전체 */}
          <div className="show-frame absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-mist">
            {slides.map((s) => {
              const im = images[s.image];
              return (
                <div key={s.key} className="show-img absolute inset-0">
                  <Placeholder fill tone={1} src={im.src} alt={im.alt} sizes="100vw" />
                </div>
              );
            })}
          </div>

          {/* 헤드라인 마퀴 — 사진 앞 */}
          <div className="show-headline marquee-mask pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 overflow-hidden">
            <div className="marquee-track show-marquee">
              <span className="display-light whitespace-nowrap text-[clamp(3rem,6.5vw,7rem)] leading-none text-ink">
                {row}
              </span>
              <span className="display-light whitespace-nowrap text-[clamp(3rem,6.5vw,7rem)] leading-none text-ink">
                {row}
              </span>
            </div>
          </div>

          {/* 슬라이드 UI — 카드가 다 커진 뒤 등장 */}
          <div className="show-ui absolute inset-0 z-30 text-white">
            <div className="pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />

            {/* 제목 — 마스크 안에서 위로 교체 */}
            <div className="absolute left-[clamp(1.5rem,3.6vw,4rem)] top-1/2 -translate-y-1/2 overflow-hidden">
              <div className="relative h-[1.15em] w-[60vw] text-[clamp(2.6rem,6vw,6.5rem)] leading-none">
                {slides.map((s) => (
                  <h3 key={s.key} className="show-title display-light absolute left-0 top-0 whitespace-nowrap">
                    {s.title}
                  </h3>
                ))}
              </div>
            </div>

            <span className="display-light absolute right-[clamp(1.5rem,3.6vw,4rem)] top-1/2 -translate-y-1/2 text-[clamp(2rem,5vw,5.5rem)] leading-none text-white/55">
              {showcase.hint}
            </span>

            {/* 하단: + 버튼 + 설명 */}
            <div className="absolute bottom-[clamp(1.5rem,6vh,4rem)] left-[clamp(1.5rem,3.6vw,4rem)] flex items-end gap-5">
              <a
                href={showcase.more.href}
                aria-label={showcase.more.label}
                className="flex h-[clamp(64px,7vw,96px)] w-[clamp(64px,7vw,96px)] shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 hover:scale-105"
              >
                <Plus className="h-8 w-8" strokeWidth={1.5} />
              </a>
              <div className="relative h-[3.3em] w-[min(40vw,460px)] text-[15px] leading-[1.55] text-white/90">
                {slides.map((s) => (
                  <p key={s.key} className="show-desc absolute left-0 top-0">
                    <Lines text={s.description} />
                  </p>
                ))}
              </div>
            </div>

            {/* 진행선 */}
            <div className="absolute bottom-[clamp(1.5rem,6vh,4rem)] right-[clamp(1.5rem,3.6vw,4rem)] h-[2px] w-[min(32vw,420px)] bg-white/30">
              <div className="show-bar-fill h-full w-full origin-left bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일·감속 모션: 세로 목록 */}
      <div className="show-list px-5 py-14 sm:px-8 lg:hidden">
        <h2 className="display-light mb-8 text-[clamp(2rem,8vw,3.5rem)] leading-[1.05] text-ink">{showcase.headline}</h2>
        <ul className="flex flex-col gap-4">
          {slides.map((s) => {
            const im = images[s.image];
            return (
              <li key={s.key} className="relative overflow-hidden rounded-[12px]">
                <Placeholder ratio="16/9" tone={1} overlay="bottom" src={im.src} alt={im.alt} sizes="100vw" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="display-light text-[1.9rem] leading-none">{s.title}</h3>
                  <p className="mt-2 text-[14px] leading-snug text-white/85">
                    <Lines text={s.description} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <a href={showcase.more.href} className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
            <Plus className="h-4 w-4" />
          </span>
          {showcase.more.label}
        </a>
      </div>
    </section>
  );
}
