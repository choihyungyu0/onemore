"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { createLoop, isFinePointer, settled, whenInView } from "@/lib/raf-loop";
import { how, images, showcase } from "@/content/landing";
import { requestFilter } from "@/lib/filter-events";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";
import { Reveal, RevealLines, SweepLines } from "./reveal";

/**
 * 매칭 방식 마무리 — landonorris.com "PARTNERS & CAMPAIGNS" 실측 재현
 * - 왼쪽 두 줄 제목(굵은 줄 + 가벼운 줄, ≈4.3vw), 오른쪽 절반에 설명(16.7px)
 * - 뒤에 큰 손글씨 "Collab"(브러시 서체, 코랄)이 왼쪽 밖에서부터 걸쳐 있고(−9rem·4rem, ≈80rem 폭),
 *   화면에 들어올 때 펜으로 쓰듯 왼쪽→오른쪽으로 그려지며, 스크롤에 따라 살짝 떠오른다
 * - 아래 줄은 노리스의 파트너 로고 마퀴 자리 — 가짜 로고 대신 활동 국가 워드마크(둥근 현지 사진 + 나라 이름 + 도시)가
 *   오른쪽으로 흐르고, 스크롤 속도에 따라 빨라지며, 올리면 멈춘다. 올린 나라의 큰 사진이 커서를 따라 폴라로이드처럼 떠오르고,
 *   누르면 그 나라로 크리에이터 찾기
 */
export function HowStatement() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
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
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 손글씨 패럴랙스 — 섹션이 지나가는 동안 위로 60px
  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const [line1, line2] = how.statement.title.split("\n");
  const accent = how.statement.titleAccent ?? "";

  return (
    <section ref={root} className={cn("how-statement stmt-bg relative overflow-hidden bg-mist", on && "in-view")} aria-label={how.statement.lead}>
      {/* 손글씨 — 텍스트 뒤 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[-3vw] top-[9rem] z-0 w-[112vw] select-none sm:top-[7rem] lg:left-[-5rem] lg:top-[17rem] lg:w-[80rem]"
        style={reduce ? undefined : { y }}
      >
        <span className="scribble font-brush block origin-left -rotate-[14deg] whitespace-nowrap text-[clamp(4.5rem,23vw,21rem)] opacity-80 lg:opacity-100 leading-none text-brand">
          {how.statement.scribble}
        </span>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[80rem] px-5 pb-10 pt-24 sm:px-8 lg:px-12 lg:pb-16 lg:pt-44">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-16">
          <h3 className="text-[clamp(2.1rem,4.1vw,3.9rem)] leading-[0.98] tracking-[-0.04em] text-ink">
            <RevealLines as="span" text={line1} className="display block" />
            {/* 둘째 줄 — 마지막 단어("협업.")가 낙서가 다 그려진 뒤 코랄로 물든다 */}
            <Reveal delay={0.08} className="display-light mt-1 block">
              {accent && line2.endsWith(accent) ? (
                <>
                  {line2.slice(0, -accent.length)}
                  <span className="stmt-accent">{accent}</span>
                </>
              ) : (
                line2
              )}
            </Reveal>
          </h3>
          <Reveal delay={0.15} className={cn("sweep-hold max-w-md lg:pt-2", on && "in-view")}>
            <p className="text-[17px] font-bold tracking-tight text-ink">
              <span className="marker">{how.statement.lead}</span>
            </p>
            <p className="mt-3 text-[16px] leading-[1.7]">
              <SweepLines text={how.statement.body} from={0.9} step={0.3} />
            </p>
          </Reveal>
        </div>
      </div>

      {/* 활동 국가 워드마크 마퀴 — 노리스의 파트너 로고 줄 자리 */}
      <div className="relative z-10 pb-24 pt-6 lg:pb-44 lg:pt-10">
        <p className="kicker mx-auto max-w-[80rem] px-5 text-ink/45 sm:px-8 lg:px-12">{how.statement.marqueeLabel}</p>
        <CountryMarquee />
      </div>
    </section>
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
    let x = 0;
    let boost = 0;
    // 화면에 보일 때만 흐른다
    const loop = createLoop((dt) => {
      const v = Math.abs(lenisRef.current?.velocity ?? 0);
      boost = Math.max(boost * 0.92, Math.min(v * 12, 900));
      if (!paused.current) x += (70 + boost) * dt;
      const half = el.scrollWidth / 2;
      if (half > 0 && x >= half) x -= half;
      el.style.transform = `translate3d(${(x - half).toFixed(2)}px,0,0)`;
      return true;
    });
    const off = whenInView(el, (v) => (v ? loop.kick() : loop.stop()), "0px");
    return () => {
      off();
      loop.stop();
    };
  }, [reduce]);

  // 커서 옆 사진 미리보기 — 스프링으로 따라간다
  useEffect(() => {
    const w = wrap.current;
    const p = preview.current;
    if (!w || !p || reduce || !isFinePointer()) return;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let armed = false; // 처음 들어올 때는 커서 자리에서 바로 시작 (화면 구석에서 날아오지 않게)
    // 커서가 움직일 때만 돌고, 미리보기가 커서를 따라잡으면 멈춘다
    const loop = createLoop(() => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      // 커서 오른쪽 위에 띄우되 화면 위로 나가면 아래쪽으로
      const w2 = p.offsetWidth || 240;
      const h2 = p.offsetHeight || 220;
      const x = Math.min(window.innerWidth - w2 - 12, cx + 24);
      const y = cy - h2 - 16 < 12 ? cy + 24 : cy - h2 - 16;
      p.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${((cx - tx) * 0.04).toFixed(2)}deg)`;
      return !(settled(cx, tx, 0.2) && settled(cy, ty, 0.2));
    });
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!armed) {
        armed = true;
        cx = tx;
        cy = ty;
      }
      loop.kick();
    };
    const onLeave = () => {
      armed = false;
    };
    w.addEventListener("pointermove", onMove, { passive: true });
    w.addEventListener("pointerleave", onLeave);
    return () => {
      w.removeEventListener("pointermove", onMove);
      w.removeEventListener("pointerleave", onLeave);
      loop.stop();
    };
  }, [reduce]);

  const items = [...showcase.slides, ...showcase.slides];
  const cities = (d: string) => d.split("\n")[0].replace(/[,，]\s*$/, "");
  const current = hover === null ? null : showcase.slides[hover % showcase.slides.length];

  return (
    <div
      ref={wrap}
      className="marquee-mask relative mt-6 w-full overflow-hidden"
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
              className="group flex shrink-0 items-center gap-4 px-[clamp(1.2rem,2.4vw,2.4rem)] py-3 text-left"
            >
              <span className={cn("relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-card transition-transform duration-500", on && "scale-110 -rotate-6")}>
                <Placeholder fill tone={1} src={im.src} alt="" sizes="56px" />
                <span className="stmt-live absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" aria-hidden />
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
