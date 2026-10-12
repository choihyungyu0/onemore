"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Check, Plus, Search, Send, SlidersHorizontal } from "lucide-react";
import { creators, how, images } from "@/content/landing";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";
import { EASE } from "./reveal";

/**
 * 매칭 4단계 데모 기기 — 노트북(알루미늄 받침·얇은 검은 베젤·카메라·힌지 그림자)이 아래에서 떠오르고,
 * 화면 안에서 찾기 → 선택 → 제안 → 연결 네 화면이 바뀐다.
 * - step 없이 쓰면(스크럽) 네 화면이 [data-screen]으로 겹쳐 있고 how-scrub 타임라인이 교차시킨다.
 *   화면 안 [data-pop] 요소는 그 단계가 켜질 때 차례로 떠오르고, 주변 [data-float] 칩도 단계마다 바뀐다.
 * - step을 주면(모바일 카드) 그 화면만 정적으로 보여준다.
 * - 1단계 화면은 검색어 타이핑 → 칩 선택 → 결과 걸러짐을 자동 반복한다 (화면에 있을 때만).
 * - 화면 UI는 640×400 고정 설계를 베젤 안쪽 폭에 맞춰 scale.
 */
const W = 640;
const H = 400;

/** 노트북 껍데기 — 덮개(얇은 베젤·카메라)·알루미늄 받침. 화면 안 640×400 설계를 베젤 안쪽 폭에 맞춰 scale */
export function LaptopShell({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={className}>
      {/* 덮개 */}
      <div className="relative mx-auto w-[88%]">
        <div className={cn("laptop-lid relative aspect-[16/10] rounded-t-[2.4%] rounded-b-[0.6%] bg-[#0a0b0e] p-[2.2%] pb-[3%] ring-1", dark ? "shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] ring-[#2a2d33]" : "shadow-[0_40px_70px_-30px_rgba(16,18,24,0.5)] ring-[#33363d]")}>
          <span className="absolute left-1/2 top-[0.9%] h-[0.9%] w-[0.9%] -translate-x-1/2 rounded-full bg-[#1d2027] ring-1 ring-[#3a3e47]" aria-hidden />
          <div ref={screenRef} className="relative h-full w-full overflow-hidden rounded-[4px] bg-white">
            <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
              {children}
            </div>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.18] via-transparent to-transparent" aria-hidden />
          </div>
        </div>
      </div>
      {/* 받침 (알루미늄) */}
      <div className={cn("laptop-base relative mx-auto h-[clamp(9px,1.5vw,16px)] w-full rounded-b-[10px] bg-gradient-to-b from-[#e6e8ed] via-[#c7cad2] to-[#9a9ea8]", dark ? "shadow-[0_30px_50px_-16px_rgba(0,0,0,0.9)]" : "shadow-[0_18px_30px_-12px_rgba(16,18,24,0.45)]")}>
        <span className="absolute inset-x-0 top-0 h-px bg-white/70" aria-hidden />
        <span className="absolute left-1/2 top-0 h-[40%] w-[14%] -translate-x-1/2 rounded-b-[5px] bg-[#7f848e]/70" aria-hidden />
      </div>
    </div>
  );
}

/** 단계별 화면 */
export function DemoScreen({ step, rootRef, still }: { step: number; rootRef: React.RefObject<HTMLDivElement | null>; still?: boolean }) {
  if (step === 0) return <ScreenSearch rootRef={rootRef} still={still} />;
  if (step === 1) return <ScreenSelect />;
  if (step === 2) return <ScreenPropose />;
  return <ScreenConnect />;
}

export function DeviceDemo({ step, className }: { step?: number; className?: string }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const scrub = step === undefined;

  // 마우스 기울기 + 시차
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotY = useTransform(smx, [-0.5, 0.5], [-6, 6]);
  const rotX = useTransform(smy, [-0.5, 0.5], [5, -5]);
  const fx = useTransform(smx, [-0.5, 0.5], [16, -16]);
  const fy = useTransform(smy, [-0.5, 0.5], [12, -12]);
  useEffect(() => {
    if (reduce || !scrub) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, scrub, mx, my]);

  const screens: ReactNode[] = [
    <ScreenSearch key="s0" rootRef={root} />,
    <ScreenSelect key="s1" />,
    <ScreenPropose key="s2" />,
    <ScreenConnect key="s3" />,
  ];
  const shown = scrub ? screens : [screens[Math.min(step ?? 0, 3)]];
  const d = how.demo;

  return (
    <div ref={root} className={cn("relative aspect-[4/3] w-full", className)} style={{ perspective: 1400 }}>
      {/* 주변에 떠다니는 칩 — 단계별 묶음 (데스크톱) */}
      {scrub && (
        <motion.div style={{ x: fx, y: fy }} className="pointer-events-none absolute inset-0 z-20 hidden md:block" aria-hidden>
          {d.floats.map((group, i) => (
            <div key={i} data-float={i} className="absolute inset-0">
              <span className="preview-float-0 absolute -left-[6%] top-[2%] rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-ink shadow-card ring-1 ring-ink/[0.06]">
                {group[0]}
              </span>
              <span className="preview-float-1 absolute -right-[6%] top-[28%] rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white shadow-card">
                {group[1]}
              </span>
              <span className="preview-float-2 absolute -left-[4%] bottom-[14%] flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[12px] font-semibold text-ink shadow-card ring-1 ring-ink/[0.06]">
                <Avatar c={creators[(i + 1) % creators.length]} size="h-6 w-6" />
                {group[2]}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* 노트북 — 아래에서 떠오른다 */}
      <motion.div
        className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2"
        initial={reduce || !scrub ? false : { opacity: 0, y: 90, rotateX: 16 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div style={scrub ? { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" } : undefined}>
          <LaptopShell>
            {shown.map((s, i) => (
              <div key={i} data-screen={scrub ? i : undefined} className="absolute inset-0">
                {s}
              </div>
            ))}
          </LaptopShell>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------- 공용 ---------- */
function Avatar({ c, size = "h-7 w-7" }: { c: (typeof creators)[number]; size?: string }) {
  const im = images[c.image];
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full", size)}>
      <Placeholder fill tone={c.tone} src={im.src} alt="" sizes="40px" />
    </span>
  );
}

function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-ink/[0.06] px-4">
      <span className="flex items-center gap-2 text-[13px] font-extrabold tracking-tight">
        <BrandMark className="h-5 w-5" />
        {title}
      </span>
      <span className="flex items-center gap-2">{right ?? <span className="h-6 w-6 rounded-full bg-mist ring-1 ring-ink/[0.06]" />}</span>
    </div>
  );
}

function Card({ c, badge, selected, pop }: { c: (typeof creators)[number]; badge?: boolean; selected?: boolean; pop?: boolean }) {
  const im = images[c.image];
  return (
    <div className={cn("relative overflow-hidden rounded-[10px] bg-white ring-1 ring-ink/[0.06] transition-shadow", selected && "ring-2 ring-brand")}>
      <div className="relative">
        <Placeholder ratioClassName="aspect-[16/9]" tone={c.tone} src={im.src} alt="" sizes="220px" />
        <span className="absolute left-1.5 top-1.5 rounded-full bg-white/92 px-1.5 py-0.5 text-[9px] font-semibold">
          {c.country} · {c.city}
        </span>
        {badge && (
          <span
            data-pop={pop ? "" : undefined}
            className={cn("absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full", selected ? "bg-brand text-white" : "bg-white/90 text-ink")}
          >
            {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </span>
        )}
      </div>
      <div className="px-2 py-1">
        <p className="text-[11px] font-bold tracking-tight">{c.name}</p>
        <p className="text-[9.5px] text-muted">{formatFollowers(c.followers)}</p>
      </div>
    </div>
  );
}

/* ---------- 01 찾아보기 (자동 데모) ---------- */
type Phase = "idle" | "typing" | "typed" | "country" | "keyword" | "filtered" | "clearing";

function ScreenSearch({ rootRef, still }: { rootRef: React.RefObject<HTMLDivElement | null>; still?: boolean }) {
  const d = how.demo;
  const reduce = useReducedMotion() || !!still; // still: 데모 루프 없이 걸러진 결과 상태로 고정
  const [inView, setInView] = useState(false);
  const [phase, setPhase] = useState<Phase>(reduce ? "filtered" : "idle");
  const [typed, setTyped] = useState(reduce ? d.query : "");

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => setInView(es.some((e) => e.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);

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

  const countryOn = phase === "country" || phase === "keyword" || phase === "filtered";
  const keywordOn = phase === "keyword" || phase === "filtered";
  const caret = phase === "typing" || phase === "typed";
  const list = phase === "filtered" ? creators.filter((c) => c.country === d.country && c.tags.includes(d.keyword)) : creators.slice(0, 6);

  return (
    <div className="flex h-full w-full flex-col bg-paper text-ink">
      <TopBar title={d.title} />
      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-2.5">
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
          {d.keywords.map((k) => (
            <span key={k} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300", k === d.keyword && keywordOn ? "bg-brand text-white" : "bg-white text-ink/70 ring-1 ring-ink/[0.08]")}>
              #{k}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>
            <span className="tnum font-semibold text-ink">{list.length}</span>명
          </span>
          <span>{d.sort}</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((c) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.45, ease: EASE }}>
                <Card c={c} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------- 02 선택하기 ---------- */
function ScreenSelect() {
  const d = how.demo.select;
  const picked = new Set(d.picked);
  const list = creators.slice(0, 6);
  return (
    <div className="relative flex h-full w-full flex-col bg-paper text-ink">
      <TopBar title={d.title} right={<span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold text-ink/70">{d.context}</span>} />
      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-2.5">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>{d.hint}</span>
          <span data-pop className="rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand">
            {d.count}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {list.map((c, i) => (
            <Card key={c.id} c={c} badge selected={picked.has(i)} pop={picked.has(i)} />
          ))}
        </div>
      </div>
      {/* 하단 선택 바 */}
      <div data-pop className="absolute inset-x-4 bottom-3 flex items-center justify-between rounded-[12px] bg-ink px-4 py-2.5 text-white shadow-lift">
        <span>
          <span className="block text-[12px] font-bold">{d.count}</span>
          <span className="block text-[10px] text-white/70">{d.barHint}</span>
        </span>
        <span className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-bold">{d.cta}</span>
      </div>
    </div>
  );
}

/* ---------- 03 협업 제안하기 ---------- */
function ScreenPropose() {
  const d = how.demo.propose;
  const picked = how.demo.select.picked.map((i) => creators[i]);
  return (
    <div className="flex h-full w-full flex-col bg-paper text-ink">
      <TopBar title={d.title} />
      <div className="grid flex-1 grid-cols-[1.25fr_1fr] gap-4 px-4 pt-3">
        <div className="flex flex-col gap-2">
          {d.fields.map((f) => (
            <div key={f.label} data-pop className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-ink/[0.06]">
              <p className="text-[9.5px] font-semibold text-muted">{f.label}</p>
              {Array.isArray(f.value) ? (
                <p className="mt-1 flex flex-wrap gap-1">
                  {f.value.map((v) => (
                    <span key={v} className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">
                      {v}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="mt-0.5 text-[12px] font-bold tracking-tight">{f.value}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col rounded-[12px] bg-white p-3 ring-1 ring-ink/[0.06]">
          <p className="text-[10px] font-semibold text-muted">{d.toLabel}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {picked.map((c) => (
              <li key={c.id} data-pop className="flex items-center gap-2">
                <Avatar c={c} />
                <span>
                  <span className="block text-[11px] font-bold">{c.name}</span>
                  <span className="block text-[9.5px] text-muted">
                    {c.country} · {formatFollowers(c.followers)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <span data-pop className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-brand py-2 text-[11.5px] font-bold text-white">
            <Send className="h-3.5 w-3.5" />
            {d.cta}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- 04 연결하기 ---------- */
function ScreenConnect() {
  const d = how.demo.connect;
  const c = creators[how.demo.select.picked[0]];
  return (
    <div className="flex h-full w-full flex-col bg-paper text-ink">
      <TopBar title={d.title} right={<span className="flex items-center gap-1.5 text-[10.5px] font-semibold"><Avatar c={c} size="h-5 w-5" />{c.name}</span>} />
      <div className="flex flex-1 flex-col gap-2 px-5 pt-3">
        {d.thread.map((m, i) => {
          const mine = m.from === "onemore";
          return (
            <div key={i} data-pop className={cn("flex max-w-[78%] items-end gap-2", mine ? "self-start" : "flex-row-reverse self-end")}>
              {mine ? <BrandMark className="h-6 w-6 shrink-0" /> : <Avatar c={c} size="h-6 w-6" />}
              <span className={cn("rounded-[14px] px-3 py-2 text-[11.5px] leading-snug", mine ? "rounded-bl-[4px] bg-white ring-1 ring-ink/[0.06]" : "rounded-br-[4px] bg-ink text-white")}>
                {m.text}
              </span>
            </div>
          );
        })}
        <div data-pop className="mt-auto mb-3 flex items-center gap-3 rounded-[12px] bg-brand px-4 py-3 text-white shadow-lift">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Check className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[12.5px] font-extrabold">{d.done}</span>
            <span className="block text-[10px] text-white/80">{d.doneHint}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
