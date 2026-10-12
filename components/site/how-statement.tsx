"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Check, MousePointer2 } from "lucide-react";
import { creators, how, images, showcase } from "@/content/landing";
import { requestFilter } from "@/lib/filter-events";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { Placeholder } from "./placeholder";
import { Lines, Reveal, RevealLines } from "./reveal";

/**
 * 매칭 방식 마무리 — landonorris.com "PARTNERS & CAMPAIGNS" 구도
 * - 왼쪽 두 줄 제목, 오른쪽에 설명. 제목의 "협업." 둘레에 손으로 그린 동그라미가 그려지고 옆에 작은 손글씨 "Collab" 주석
 * - 가운데 "서로 선택" 장면: 브랜드 카드·크리에이터 카드가 양쪽에서 들어와 점선이 그려지고 "연결됨" 스탬프가 찍힌다
 * - 아래는 활동 국가 워드마크 줄(둥근 현지 사진 + 나라 이름 + 도시 + 활동 중 점)이 오른쪽으로 흐르고, 스크롤 속도에 따라
 *   빨라지며, 올리면 멈춘다. 올린 나라의 사진이 커서를 따라 떠오르고, 누르면 그 나라로 크리에이터 찾기. 첫 항목엔 커서 힌트
 */
export function HowStatement() {
  const root = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const st = how.statement;
  const [line1, line2] = st.title.split("\n");
  const circled = st.circled ?? "";
  const head2 = circled && line2.endsWith(circled) ? line2.slice(0, -circled.length) : line2;

  return (
    <section ref={root} className={cn("how-statement relative overflow-hidden bg-mist", on && "in-view")} aria-label={st.lead}>
      <div className="relative z-10 mx-auto max-w-[80rem] px-5 pb-4 pt-24 sm:px-8 lg:px-12 lg:pt-36">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-16">
          <h3 className="text-[clamp(2.1rem,4.1vw,3.9rem)] leading-[0.98] tracking-[-0.04em] text-ink">
            <RevealLines as="span" text={line1} className="display block" />
            <Reveal delay={0.08} className="display-light mt-1 block">
              {head2}
              {circled && (
                <span className="relative inline-block whitespace-nowrap">
                  {circled}
                  {/* 손으로 그린 동그라미 — 글자 바깥을 넉넉히 돌도록 뒤에 넓게 */}
                  <svg className="stmt-circle pointer-events-none absolute -inset-x-[0.34em] -inset-y-[0.2em] -z-10 h-[calc(100%+0.4em)] w-[calc(100%+0.68em)] overflow-visible" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden>
                    <path d="M14 54 C 6 20, 66 6, 112 8 C 164 10, 198 26, 192 56 C 186 88, 118 98, 76 94 C 36 90, 2 78, 18 44" fill="none" stroke="var(--brand)" strokeWidth="2.6" strokeLinecap="round" pathLength={1} vectorEffect="non-scaling-stroke" />
                  </svg>
                  <span className="stmt-note font-brush pointer-events-none absolute -right-[1.9em] top-[-0.35em] text-[0.5em] leading-none text-brand" aria-hidden>
                    {st.scribble}
                  </span>
                </span>
              )}
            </Reveal>
          </h3>
          <Reveal delay={0.15} className="max-w-md lg:pt-2">
            <p className="text-[17px] font-bold tracking-tight text-ink">{st.lead}</p>
            <p className="mt-3 text-[16px] leading-[1.7] text-muted">
              <Lines text={st.body} />
            </p>
          </Reveal>
        </div>

        {/* 서로 선택 장면 */}
        <MatchScene />
      </div>

      {/* 활동 국가 워드마크 마퀴 */}
      <div className="stmt-bg relative z-10 pb-24 pt-8 lg:pb-36 lg:pt-12">
        <p className="kicker mx-auto flex max-w-[80rem] flex-wrap items-center gap-3 px-5 text-ink/45 sm:px-8 lg:px-12">
          {st.marqueeLabel}
          <span className="hidden items-center gap-1 rounded-full bg-ink px-2 py-1 text-[9px] font-semibold tracking-normal text-white lg:inline-flex" aria-hidden>
            <MousePointer2 className="h-3 w-3" />
            {st.marqueeHint}
          </span>
        </p>
        <CountryMarquee />
      </div>
    </section>
  );
}

/** 브랜드 카드 ←점선→ 크리에이터 카드, 가운데 "연결됨" 스탬프 */
function MatchScene() {
  const m = how.statement.match;
  const me = creators[0];
  const im = images[me.image];
  return (
    <div className="mt-12 grid items-center gap-4 lg:mt-14 lg:grid-cols-[1fr_minmax(160px,0.8fr)_1fr] lg:gap-6" aria-hidden>
      {/* 브랜드 */}
      <div className="stmt-card flex items-center gap-4 rounded-[18px] bg-white p-4 pr-5 shadow-card ring-1 ring-ink/5" style={{ ["--from" as string]: "-48px" }}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-white">
          <BrandMark className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="kicker block text-[9.5px] text-brand">{m.brand.label}</span>
          <span className="mt-1 block text-[15px] font-bold leading-snug tracking-tight text-ink">{m.brand.line}</span>
        </span>
      </div>
      {/* 점선 + 스탬프 */}
      <div className="relative hidden h-12 items-center lg:flex">
        <span className="stmt-line absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2" />
        <span className="stmt-stamp relative mx-auto inline-flex items-center gap-1.5 rounded-[8px] border-2 border-brand bg-mist px-3 py-1.5 font-display text-[11px] font-extrabold tracking-[0.16em] text-brand">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          {m.link}
        </span>
        <span className="absolute inset-x-0 top-full mt-2 text-center text-[11.5px] text-ink/45">{m.linkHint}</span>
      </div>
      {/* 크리에이터 */}
      <div className="stmt-card flex items-center gap-4 rounded-[18px] bg-white p-4 pr-5 shadow-card ring-1 ring-ink/5 lg:flex-row-reverse lg:text-right" style={{ ["--from" as string]: "48px" }}>
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
          <Placeholder fill tone={me.tone} src={im.src} alt="" sizes="48px" />
        </span>
        <span className="min-w-0">
          <span className="kicker block text-[9.5px] text-brand">{m.creator.label}</span>
          <span className="mt-1 block text-[15px] font-bold leading-snug tracking-tight text-ink">{m.creator.line}</span>
        </span>
      </div>
    </div>
  );
}

/** 오른쪽으로 흐르는 워드마크 줄 — 기본 70px/s, 스크롤 속도만큼 가속, 올리면 멈춤 + 커서 옆 사진 미리보기 */
function CountryMarquee() {
  const track = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const paused = useRef(false);
  const [hover, setHover] = useState<number | null>(null);

  // 마퀴 이동
  useEffect(() => {
    const el = track.current;
    if (!el || reduce) return;
    let raf = 0;
    let x = 0;
    let boost = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = Math.abs(lenisRef.current?.velocity ?? 0);
      boost = Math.max(boost * 0.92, Math.min(v * 12, 900));
      if (!paused.current) x += (70 + boost) * dt;
      const half = el.scrollWidth / 2;
      if (half > 0 && x >= half) x -= half;
      el.style.transform = `translate3d(${(x - half).toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  // 커서 옆 사진 미리보기 — 스프링으로 따라간다
  useEffect(() => {
    const w = wrap.current;
    const p = preview.current;
    if (!w || !p || reduce) return;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let armed = false; // 처음 들어올 때는 커서 자리에서 바로 시작 (화면 구석에서 날아오지 않게)
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!armed) {
        armed = true;
        cx = tx;
        cy = ty;
      }
    };
    const onLeave = () => {
      armed = false;
    };
    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      const w2 = p.offsetWidth || 240;
      const h2 = p.offsetHeight || 220;
      const x = Math.min(window.innerWidth - w2 - 12, cx + 24);
      const y = cy - h2 - 16 < 12 ? cy + 24 : cy - h2 - 16;
      p.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${((cx - tx) * 0.04).toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    w.addEventListener("pointermove", onMove);
    w.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      w.removeEventListener("pointermove", onMove);
      w.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const items = [...showcase.slides, ...showcase.slides];
  const cities = (d: string) => d.split("\n")[0].replace(/[,，]\s*$/, "");
  const current = hover === null ? null : showcase.slides[hover % showcase.slides.length];

  return (
    <div
      ref={wrap}
      className="marquee-mask relative mt-7 w-full overflow-hidden"
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
        setHover(null);
      }}
    >
      {/* 커서를 따라오는 사진 미리보기 (데스크톱) */}
      <div
        ref={preview}
        className={cn(
          "country-peek pointer-events-none fixed left-0 top-0 z-[60] hidden w-[240px] origin-bottom-left rounded-[14px] bg-white p-2 shadow-[0_30px_60px_-20px_rgba(11,18,32,0.45)] transition-[opacity,scale] duration-300 lg:block",
          current ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
        aria-hidden
      >
        <div className="relative overflow-hidden rounded-[9px]">
          {showcase.slides.map((sl, i) => {
            const im = images[sl.image];
            const on = current?.key === sl.key;
            return (
              <div key={sl.key} className={cn("aspect-[4/3]", i > 0 && "absolute inset-0", on ? "opacity-100" : "opacity-0")}>
                <Placeholder fill tone={1} src={im.src} alt="" sizes="240px" />
              </div>
            );
          })}
        </div>
        <p className="flex items-center justify-between px-1.5 pb-0.5 pt-2 text-[12px] font-semibold text-ink">
          <span>{current?.title}</span>
          <span className="kicker text-[9px] text-brand">{showcase.more.label}</span>
        </p>
      </div>

      <div ref={track} className="flex w-max items-center will-change-transform">
        {items.map((s, i) => {
          const im = images[s.image];
          const on = hover === i;
          return (
            <button
              key={`${s.key}-${i}`}
              type="button"
              onClick={() => requestFilter({ country: s.country })}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${s.title} ${showcase.more.label}`}
              aria-hidden={i >= showcase.slides.length || undefined}
              tabIndex={i >= showcase.slides.length ? -1 : 0}
              className="group relative flex shrink-0 items-center gap-4 px-[clamp(1.2rem,2.4vw,2.4rem)] py-4 text-left"
            >
              <span className={cn("relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-card transition-transform duration-500", on && "scale-110 -rotate-6")}>
                <Placeholder fill tone={1} src={im.src} alt="" sizes="64px" />
                <span className="stmt-live absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className={cn("display-light text-[clamp(1.6rem,2.4vw,2.3rem)] leading-none tracking-[-0.03em] transition-colors duration-300", on ? "text-ink" : "text-ink/80")}>
                  {s.title}
                </span>
                <span className="mt-1.5 flex items-center gap-2">
                  <span className={cn("kicker text-[9.5px] transition-colors duration-300", on ? "text-brand" : "text-ink/40")}>{cities(s.description)}</span>
                  <span className="kicker hidden text-[9px] text-green-600 sm:inline">{how.statement.live}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
