"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { creators, how, images } from "@/content/landing";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";
import { EASE } from "./reveal";

/**
 * 매칭 1단계 "찾아보기" — 태블릿이 아래에서 떠오르며(rotateX 18°→0) 실제 찾기 화면을 보여준다.
 * - 화면 안 데모 루프: 검색어 타이핑 → 국가·키워드 칩 선택 → 결과 카드가 걸러짐 → 초기화 (화면에 있을 때만 돈다)
 * - 마우스 위치로 기기가 살짝 기울고(±7°), 주변 칩·미니 프로필이 반대로 움직여 깊이가 생긴다
 * - 화면 UI는 560×420 고정 설계를 컨테이너 폭에 맞춰 scale → 어떤 크기에서도 같은 비율
 */
const W = 560;
const H = 420;

type Phase = "idle" | "typing" | "typed" | "country" | "keyword" | "filtered" | "clearing";

export function TabletDemo({ className }: { className?: string }) {
  const d = how.demo;
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [inView, setInView] = useState(false);
  const [phase, setPhase] = useState<Phase>(reduce ? "filtered" : "idle");
  const [typed, setTyped] = useState(reduce ? d.query : "");

  // 화면(베젤 안쪽) 폭 → 화면 scale
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 화면에 있을 때만 데모를 돌린다
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => setInView(es.some((e) => e.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 데모 루프
  useEffect(() => {
    if (reduce || !inView) return;
    let alive = true;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    (async () => {
      while (alive) {
        setPhase("idle");
        setTyped("");
        await wait(1400);
        setPhase("typing");
        for (let i = 1; i <= d.query.length; i++) {
          if (!alive) return;
          setTyped(d.query.slice(0, i));
          await wait(95);
        }
        setPhase("typed");
        await wait(550);
        setPhase("country");
        await wait(520);
        setPhase("keyword");
        await wait(520);
        setPhase("filtered");
        await wait(3000);
        setPhase("clearing");
        await wait(500);
      }
    })();
    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduce, inView, d.query]);

  // 마우스 기울기 + 시차
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotY = useTransform(smx, [-0.5, 0.5], [-7, 7]);
  const rotX = useTransform(smy, [-0.5, 0.5], [6, -6]);
  const fx = useTransform(smx, [-0.5, 0.5], [16, -16]);
  const fy = useTransform(smy, [-0.5, 0.5], [12, -12]);
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  const countryOn = phase === "country" || phase === "keyword" || phase === "filtered";
  const keywordOn = phase === "keyword" || phase === "filtered";
  const list = phase === "filtered" ? creators.filter((c) => c.country === d.country && c.tags.includes(d.keyword)) : creators.slice(0, 6);

  return (
    <div ref={root} className={cn("relative aspect-[4/3] w-full", className)} style={{ perspective: 1400 }}>
      {/* 주변에 떠다니는 칩·미니 프로필 (데스크톱) */}
      <motion.div style={{ x: fx, y: fy }} className="pointer-events-none absolute inset-0 z-20 hidden md:block" aria-hidden>
        <span className="preview-float-0 absolute -left-[7%] -top-[4%] rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-ink shadow-card ring-1 ring-ink/[0.06]">
          {d.floats[0]}
        </span>
        <span className="preview-float-1 absolute -right-[7%] top-[30%] rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white shadow-card">
          {d.floats[1]}
        </span>
        <span className="preview-float-2 absolute -left-[6%] -bottom-[5%] flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[12px] font-semibold text-ink shadow-card ring-1 ring-ink/[0.06]">
          <span className="relative h-6 w-6 overflow-hidden rounded-full">
            <Placeholder fill tone={3} src={images[creators[4].image].src} alt="" sizes="24px" />
          </span>
          {d.floats[2]}
        </span>
      </motion.div>

      {/* 기기 — 아래에서 떠오른다 */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={reduce ? false : { opacity: 0, y: 90, rotateX: 18 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="h-full w-full">
          <div className="tablet relative h-full w-full rounded-[22px] bg-[#0f1115] p-[2.1%] shadow-[0_50px_90px_-30px_rgba(16,18,24,0.45),0_12px_30px_-12px_rgba(16,18,24,0.3)] ring-1 ring-white/10">
            <span className="absolute left-1/2 top-[1%] h-[1.1%] w-[1.1%] -translate-x-1/2 rounded-full bg-[#2a2d33] ring-1 ring-black/60" aria-hidden />
            <div ref={screenRef} className="relative h-full w-full overflow-hidden rounded-[13px] bg-white">
              {/* 560×420 고정 설계 화면 */}
              <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
                <Screen typed={typed} phase={phase} countryOn={countryOn} keywordOn={keywordOn} list={list} />
              </div>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" aria-hidden />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Screen({
  typed,
  phase,
  countryOn,
  keywordOn,
  list,
}: {
  typed: string;
  phase: Phase;
  countryOn: boolean;
  keywordOn: boolean;
  list: typeof creators;
}) {
  const d = how.demo;
  const caret = phase === "typing" || phase === "typed";
  return (
    <div className="flex h-full w-full flex-col bg-paper text-ink">
      {/* 상단 바 */}
      <div className="flex h-10 items-center justify-between border-b border-ink/[0.06] px-4">
        <span className="flex items-center gap-2 text-[13px] font-extrabold tracking-tight">
          <BrandMark className="h-5 w-5" />
          {d.title}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-mist ring-1 ring-ink/[0.06]" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-2.5">
        {/* 검색창 */}
        <div className="flex items-center gap-2">
          <div className={cn("flex h-9 flex-1 items-center gap-2 rounded-full bg-white px-4 ring-1 transition-shadow", caret ? "ring-brand/60 shadow-[0_0_0_3px_rgba(255,90,60,0.12)]" : "ring-ink/[0.08]")}>
            <Search className="h-4 w-4 text-ink/45" />
            <span className="text-[13px] font-medium">
              {typed || <span className="text-ink/35">{d.placeholder}</span>}
              {caret && <span className="ml-px inline-block h-[14px] w-px translate-y-[2px] animate-pulse bg-ink/70" />}
            </span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-ink/[0.08]">
            <SlidersHorizontal className="h-4 w-4 text-ink/60" />
          </span>
        </div>

        {/* 칩 */}
        <div className="flex flex-wrap gap-1.5">
          {d.countries.map((c, i) => {
            const on = c === d.country ? countryOn : i === 0 && !countryOn;
            return (
              <span key={c} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300", on ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-ink/[0.08]")}>
                {c}
              </span>
            );
          })}
          <span className="mx-1 h-6 w-px bg-ink/10" aria-hidden />
          {d.keywords.map((k) => {
            const on = k === d.keyword && keywordOn;
            return (
              <span key={k} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300", on ? "bg-brand text-white" : "bg-white text-ink/70 ring-1 ring-ink/[0.08]")}>
                #{k}
              </span>
            );
          })}
        </div>

        {/* 결과 */}
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>
            <span className="tnum font-semibold text-ink">{list.length}</span>명
          </span>
          <span>{d.sort}</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((c) => {
              const im = images[c.image];
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="overflow-hidden rounded-[10px] bg-white ring-1 ring-ink/[0.06]"
                >
                  <div className="relative">
                    <Placeholder ratioClassName="aspect-[16/9]" tone={c.tone} src={im.src} alt="" sizes="200px" />
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-white/92 px-1.5 py-0.5 text-[9px] font-semibold">
                      {c.country} · {c.city}
                    </span>
                  </div>
                  <div className="px-2 py-1">
                    <p className="text-[11px] font-bold tracking-tight">{c.name}</p>
                    <p className="text-[9.5px] text-muted">{formatFollowers(c.followers)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
