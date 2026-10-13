"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleRefresh } from "@/lib/scroll-refresh";
import { createLoop, isFinePointer, settled, whenInView } from "@/lib/raf-loop";
import { Check, ChevronRight, Clock } from "lucide-react";
import { creatorJoin, creators, images } from "@/content/landing";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { ButtonLink } from "./button";
import { formatFollowers } from "./creator-card";
import { Magnetic } from "./magnetic";
import { Placeholder } from "./placeholder";
import { Lines, Reveal } from "./reveal";
import { Kicker, Section } from "./section";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 크리에이터 참여 — "당신의 프로필 카드가 완성되는 장면" (브랜드 쪽 05 제안서의 거울)
 * - 오른쪽: 뒤에 다른 크리에이터 카드 2장이 부채꼴로 깔리고(마우스 시차), 앞 카드가 스크롤에 따라 완성된다
 *   팔로워 작은 숫자 → 국가·키워드 칩 → "브랜드 제안 도착" 코랄 스탬프
 * - 카드 아래 타임라인 3천 → 1만 → 5만 → 10만 점이 스크롤로 하나씩 켜진다
 * - 제목의 "지금의 당신"엔 형광펜, 버튼 옆엔 신청 부담을 낮추는 한 줄
 */
export function CreatorJoin() {
  const s = creatorJoin.stage;
  const stage = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const [headIn, setHeadIn] = useState(false);

  useEffect(() => {
    const el = head.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setHeadIn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 스크롤 타임라인 — 카드 완성 + 타임라인 점
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", el);
      const line = el.querySelector<HTMLElement>("[data-line]");
      const stamp = el.querySelector<HTMLElement>("[data-stamp]");
      gsap.set(steps, { autoAlpha: 0, y: 14 });
      gsap.set(stamp, { autoAlpha: 0, scale: 2.2, rotate: -14 });
      gsap.set(dots, { scale: 0.6, opacity: 0.35 });
      if (line) gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 55%", scrub: 0.6 },
      });
      steps.forEach((st, i) => tl.to(st, { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.05 + i * 0.16));
      tl.to(stamp, { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.14, ease: "back.out(2)" }, 0.5);
      if (line) tl.to(line, { scaleX: 1, duration: 0.4 }, 0.55);
      dots.forEach((d, i) => tl.to(d, { scale: 1, opacity: 1, duration: 0.06, ease: "back.out(2.5)" }, 0.58 + i * 0.1));
      scheduleRefresh();
    });
    return () => mm.revert();
  }, []);

  // 마우스 시차 — 뒤 카드가 벌어진다
  useEffect(() => {
    const el = stage.current;
    if (!el || !isFinePointer() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0;
    let cx = 0;
    // 커서가 움직일 때만 돌고, 목표에 닿으면 멈춘다
    const loop = createLoop(() => {
      cx += (tx - cx) * 0.08;
      el.style.setProperty("--mx", cx.toFixed(3));
      return !settled(cx, tx);
    });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      loop.kick();
    };
    const onLeave = () => {
      tx = 0;
      loop.kick();
    };
    const off = whenInView(el, (v) => {
      if (!v) loop.stop();
    });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      off();
      loop.stop();
    };
  }, []);

  const me = creators[0];
  const back = [creators[3], creators[1]];
  const lines = creatorJoin.title.split("\n");
  const accent = creatorJoin.titleAccent ?? "";

  return (
    <Section id="creators" className="overflow-hidden bg-ink text-white">
      <div className="grain-local absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-brand/15 blur-3xl" aria-hidden />

      <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* 왼쪽 */}
        <div ref={head} className={cn("sweep-hold", headIn && "in-view")}>
          <Reveal>
            <Kicker index="06" label={creatorJoin.kicker} invert />
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-[15px] font-semibold text-brand md:text-base">{creatorJoin.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display mt-4 block text-[clamp(2rem,4.8vw,3.9rem)] text-white">
              {lines.map((ln, i) => (
                <Fragment key={i}>
                  {accent && ln.includes(accent) ? (
                    <>
                      {ln.split(accent)[0]}
                      <span className="marker marker--dark">{accent}</span>
                      {ln.split(accent)[1]}
                    </>
                  ) : (
                    ln
                  )}
                  {i < lines.length - 1 ? <br /> : null}
                </Fragment>
              ))}
            </h2>
          </Reveal>
          <div className="mt-8 flex flex-col gap-5 text-[16px] leading-[1.8] text-white/70 md:text-[17px]">
            {creatorJoin.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.1 + i * 0.08}>
                <p>
                  <Lines text={p} />
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.25} className="mt-9">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Magnetic>
                <ButtonLink href={creatorJoin.cta.href} variant="brand" size="lg">
                  {creatorJoin.cta.label}
                  <ChevronRight className="h-4 w-4" />
                </ButtonLink>
              </Magnetic>
              <span className="flex items-center gap-2 text-[13px] text-white/60">
                <Clock className="h-3.5 w-3.5" />
                {creatorJoin.ctaHint}
              </span>
            </div>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-white/45">
              <Lines text={creatorJoin.note} />
            </p>
          </Reveal>
        </div>

        {/* 오른쪽: 프로필 카드 무대 */}
        <div ref={stage} className="join-stage relative mx-auto w-full max-w-[420px] lg:ml-auto" style={{ ["--mx" as string]: 0 }}>
          <div className="relative aspect-[4/5]">
            {/* 뒤 카드 2장 — 부채꼴 */}
            {back.map((c, i) => {
              const im = images[c.image];
              const dir = i === 0 ? -1 : 1;
              return (
                <div
                  key={c.id}
                  className="join-back absolute inset-0 hidden overflow-hidden rounded-[24px] ring-1 ring-white/10 sm:block"
                  style={{ ["--dir" as string]: dir, zIndex: 1 }}
                  aria-hidden
                >
                  <Placeholder fill tone={c.tone} src={im.src} alt="" sizes="420px" className="opacity-70" />
                  <span className="absolute inset-0 bg-ink/40" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink">
                    {c.country} · {c.city}
                  </span>
                </div>
              );
            })}

            {/* 앞 카드 — 당신의 프로필 */}
            <div className="absolute inset-0 z-10 overflow-hidden rounded-[24px] bg-ink-2 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15">
              <Placeholder fill tone={me.tone} src={images[me.image].src} alt={images[me.image].alt} sizes="420px" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" aria-hidden />
              <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1.5 pr-3 text-[11px] font-bold text-ink">
                <BrandMark className="h-5 w-5" />
                {s.label}
              </span>

              {/* 스탬프 */}
              <span data-stamp className="absolute right-4 top-4 rounded-[8px] border-2 border-brand bg-ink/40 px-3 py-1.5 font-display text-[11px] font-extrabold tracking-[0.18em] text-brand backdrop-blur-sm" aria-hidden>
                {s.stamp}
              </span>

              <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3">
                <span data-step className="inline-flex w-max items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
                  {formatFollowers(me.followers)}
                </span>
                <span data-step className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-ink">
                    {me.country} · {me.city}
                  </span>
                  {me.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded-full bg-ink/70 px-2.5 py-1 text-[12px] font-semibold text-white ring-1 ring-white/20">
                      #{t}
                    </span>
                  ))}
                </span>
                <span data-step className="flex items-center gap-2.5 rounded-[14px] bg-white p-2.5 pr-3 text-ink shadow-lift">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold leading-tight">{s.proposal}</span>
                    <span className="block text-[11px] text-muted">{s.proposalHint}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 타임라인 */}
          <div className="relative mt-7 px-1">
            <div className="relative h-px bg-white/15">
              <span data-line className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-brand to-brand/40" aria-hidden />
            </div>
            <ol className="relative -mt-[5px] flex justify-between">
              {s.timeline.map((t, i) => (
                <li key={t} className="flex flex-col items-center gap-2">
                  <span data-dot className="block rounded-full bg-brand ring-4 ring-ink" style={{ width: 9 + i * 2, height: 9 + i * 2 }} aria-hidden />
                  <span className="text-[11px] font-semibold text-white/70">{t}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-center text-[12.5px] text-white/55">{s.timelineLabel}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
