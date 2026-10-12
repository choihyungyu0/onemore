"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { how } from "@/content/landing";
import { cn } from "@/lib/utils";
import { DemoScreen, LaptopShell } from "./device-demo";
import { Kicker } from "./section";
import { EASE, Lines } from "./reveal";

/**
 * 매칭 4단계 — madebykota.com "Featured Templates" 구조 재현 (데스크톱)
 * - 단계마다 전체 화면 장면이 고정된 채, 다음 장면이 커튼처럼 위로 덮으며 넘어간다
 *   (각 패널: 100vh 클립 안에 300vh 트랙 + sticky 장면. 마지막 패널은 고정 없이 페이지와 함께 흘러나간다)
 * - 배경: 노트북을 크게 깔고 어둡게 가라앉힌다. 단계마다 그 단계의 핵심 UI가 화면 가운데에 오도록 노트북을 옮긴다
 * - 돋보기: 원형 렌즈가 마우스 커서를 따라다니며, 커서 아래 배경 화면을 1.45배 더 크고 선명하게 보여준다
 *   (호·숫자도 렌즈와 함께 움직인다). 커서가 없으면 화면 가운데로 돌아온다
 * - 전체에 걸친 sticky 오버레이: 호(진행), 네 숫자, 오른쪽 큰 단계 제목·설명, 아래 버튼
 * - 모바일은 how.tsx의 단계 카드가 맡는다
 */
const N = how.steps.length;
const LENS = "clamp(320px, 50vh, 520px)";
const W = 640;
const H = 400;
const MAG = 1.3; // 배경 화면 대비 돋보기 배율 (렌즈 안 글자 ≈ 설계 11px → 약 28px)
/* 단계별로 화면 가운데(렌즈가 쉬는 자리)에 둘 화면 지점 — 설계 좌표 640×400.
   렌즈가 보여주는 범위는 설계 기준 지름 약 150px이므로 글자가 몰린 곳(왼쪽 열)에 둔다 */
const FOCUS: { x: number; y: number }[] = [
  { x: 125, y: 95 }, // 검색어 타이핑 + 앞쪽 칩
  { x: 320, y: 235 }, // 카드 선택
  { x: 110, y: 135 }, // 제안서 항목(라벨+값)
  { x: 175, y: 120 }, // 대화 말풍선
];

export function HowScenes() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // 섹션 안에서 화면 가운데가 몇 번째 패널에 있는지
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const i = Math.floor((-r.top + vh * 0.5) / vh);
      setActive(Math.max(0, Math.min(N - 1, i)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 돋보기 위치 — 화면 가운데 기준 오프셋. 섹션이 보일 때 커서를 따라가고, 아니면 가운데
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const sx = useSpring(lx, { stiffness: 140, damping: 22, mass: 0.6 });
  const sy = useSpring(ly, { stiffness: 140, damping: 22, mass: 0.6 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const inView = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return r.top < vh * 0.4 && r.bottom > vh * 0.6;
    };
    const home = () => {
      lx.set(0);
      ly.set(0);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !inView()) return home();
      lx.set(e.clientX - window.innerWidth / 2);
      ly.set(e.clientY - window.innerHeight / 2);
    };
    const onScroll = () => {
      if (!inView()) home();
    };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", home);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", home);
      window.removeEventListener("scroll", onScroll);
    };
  }, [lx, ly]);

  const step = how.steps[active];
  const R = 100; // 호 반지름(viewBox 단위)
  const C = 2 * Math.PI * R;
  const angles = [45, 135, 225, 315]; // 숫자 위치 (12시 기준 시계방향)

  return (
    <section ref={root} id="how-scenes" className="how-scenes relative hidden bg-[#0b0b0d] text-white lg:block" style={{ height: `${N * 100}vh` }} aria-label={how.kicker}>
      {/* 전체 sticky 오버레이 — 호·숫자·제목·버튼 (섹션 높이의 래퍼 안에서만 고정) */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="sticky top-0 h-screen">
          <div className="absolute left-1/2 top-[calc(76px+1.5rem)] -translate-x-1/2">
            <Kicker index="02" label={how.kicker} invert />
          </div>

          {/* 호 + 숫자 — 렌즈와 함께 움직인다 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `calc(${LENS} + 150px)`, height: `calc(${LENS} + 150px)` }}>
            <motion.div className="relative h-full w-full" style={{ x: sx, y: sy }}>
              <svg viewBox="-120 -120 240 240" className="h-full w-full -rotate-90">
                <circle r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <circle
                  r={R}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - (active + 1) / N)}
                  style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
                />
              </svg>
              {angles.map((a, i) => (
                <span
                  key={i}
                  className={cn("absolute left-1/2 top-1/2 font-display text-[12px] font-semibold tracking-[0.12em] transition-colors duration-500", i === active ? "text-white" : "text-white/35")}
                  style={{ transform: `translate(-50%, -50%) rotate(${a}deg) translateY(calc(-1 * (${LENS} / 2 + 100px))) rotate(${-a}deg)` }}
                >
                  0{i + 1}
                </span>
              ))}
            </motion.div>
          </div>

          {/* 오른쪽 제목 */}
          <div className="absolute right-[6vw] top-1/2 w-[30vw] max-w-[420px] -translate-y-1/2 text-right">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.45, ease: EASE }}>
                <h3 className="display-light text-[clamp(2.6rem,5.2vw,5.4rem)] leading-[0.95] tracking-[-0.03em]">{step.title}</h3>
                <p className="kicker mt-5 text-white/55">
                  STEP {active + 1} / {N}
                </p>
                <p className="mt-3 text-[15px] leading-[1.7] text-white/65">
                  <Lines text={step.description} />
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 돋보기 안내 */}
          <p className="kicker absolute bottom-[calc(clamp(1.5rem,5vh,3rem)+4rem)] left-1/2 -translate-x-1/2 text-[10px] text-white/45">{how.demo.loupeHint}</p>

          {/* 아래 버튼 */}
          <a
            href={how.demo.cta.href}
            className="pointer-events-auto absolute bottom-[clamp(1.5rem,5vh,3rem)] left-1/2 inline-flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-ink transition-transform duration-300 hover:scale-[1.04]"
          >
            {how.demo.cta.label}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* 패널 — 장면은 고정, 다음 장면이 위로 덮는다 */}
      {how.steps.map((s, i) => (
        <Scene key={s.title} step={i} last={i === N - 1} lensX={sx} lensY={sy} />
      ))}
    </section>
  );
}

function Scene({ step, last, lensX, lensY }: { step: number; last?: boolean; lensX: MotionValue<number>; lensY: MotionValue<number> }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState(400);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const offRef = useRef(off);
  offRef.current = off;
  const f = FOCUS[step] ?? FOCUS[0];

  // 렌즈 지름
  useEffect(() => {
    const el = lensRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLens(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 배경 노트북 오프셋 — 이 단계의 초점이 장면 가운데에 오도록 (화면 사각형을 재서 계산)
  useEffect(() => {
    const bg = bgRef.current;
    const scene = sceneRef.current;
    if (!bg || !scene) return;
    const calc = () => {
      const box = bg.querySelector<HTMLElement>("[data-screen-box]");
      if (!box) return;
      const r = box.getBoundingClientRect();
      const sc = scene.getBoundingClientRect();
      const s = r.width / W;
      // 지금 적용된 오프셋을 뺀 기준 위치에서 초점의 좌표 → 장면 가운데와의 차이
      const fx = r.left - offRef.current.x + f.x * s - sc.left;
      const fy = r.top - offRef.current.y + f.y * s - sc.top;
      setOff({ x: Math.round(sc.width / 2 - fx), y: Math.round(sc.height / 2 - fy) });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(bg);
    return () => ro.disconnect();
  }, [f.x, f.y]);

  // 돋보기 내용: 렌즈 중심 아래의 배경 화면 지점을 MAG배 확대 — 커서가 움직일 때와 배경 오프셋·렌즈 크기가 바뀔 때 다시 계산
  const transform = useMotionValue("translate(-50%, -50%)");
  useEffect(() => {
    const update = () => {
      const box = bgRef.current?.querySelector<HTMLElement>("[data-screen-box]")?.getBoundingClientRect();
      const scene = sceneRef.current?.getBoundingClientRect();
      if (!box || !scene) return;
      const sBg = box.width / W;
      const S = sBg * MAG;
      const cx = scene.left + scene.width / 2 + lensX.get();
      const cy = scene.top + scene.height / 2 + lensY.get();
      const half = lens / S / 2;
      const dx = Math.min(W - half, Math.max(half, (cx - box.left) / sBg));
      const dy = Math.min(H - half, Math.max(half, (cy - box.top) / sBg));
      transform.set(`translate(${-dx * S}px, ${-dy * S}px) scale(${S})`);
    };
    update();
    const u1 = lensX.on("change", update);
    const u2 = lensY.on("change", update);
    window.addEventListener("resize", update);
    return () => {
      u1();
      u2();
      window.removeEventListener("resize", update);
    };
  }, [off, lens, lensX, lensY, transform]);

  const body = (
    <div ref={sceneRef} className={cn("h-screen overflow-clip", last ? "relative" : "sticky top-0")}>
      {/* 바닥·조명 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0b0b0d_0%,#141416_55%,#0b0b0d_100%)]" />
      <div className="absolute left-1/2 top-[34%] h-[90vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent_70%)]" />

      {/* 배경: 큰 노트북 — 초점이 가운데에 오도록 옮겨 두고 어둡게 */}
      <div className="absolute inset-0" aria-hidden>
        <div
          ref={bgRef}
          className="absolute left-1/2 top-1/2 w-[104vw] max-w-[1600px]"
          style={{ transform: `translate(calc(-50% + ${off.x}px), calc(-50% + ${off.y}px))` }}
        >
          <LaptopShell dark>
            <DemoScreen step={step} rootRef={sceneRef} />
          </LaptopShell>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,rgba(0,0,0,0.45),rgba(0,0,0,0.82))]" />

      {/* 돋보기 — 커서를 따라 움직이며 그 아래를 확대 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: LENS, height: LENS }}>
        <motion.div
          ref={lensRef}
          className="relative h-full w-full overflow-clip rounded-full bg-paper shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_50px_90px_-20px_rgba(0,0,0,0.9)]"
          style={{ x: lensX, y: lensY }}
        >
          <motion.div className="absolute left-1/2 top-1/2 origin-top-left" style={{ width: W, height: H, transform }}>
            <DemoScreen step={step} rootRef={sceneRef} />
          </motion.div>
          <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.18)]" aria-hidden />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.22),transparent_50%)]" aria-hidden />
        </motion.div>
      </div>
    </div>
  );
  if (last) return <div className="relative h-screen overflow-clip">{body}</div>;
  return (
    <div className="relative h-screen overflow-clip">
      <div className="relative h-[300vh]">{body}</div>
    </div>
  );
}
