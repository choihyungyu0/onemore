"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
 * - 배경: 같은 노트북을 크게 확대해 어둡게 깔고, 가운데 원형 렌즈에는 노트북 전체가 또렷하게 보인다
 *   (코타: 배경 = 확대·암전된 같은 장면, 렌즈 = 원래 크기의 선명한 장면)
 * - 전체에 걸친 sticky 오버레이: 바깥 호(진행), 네 숫자, 오른쪽 큰 단계 제목·설명, 아래 버튼
 * - 모바일은 how.tsx의 단계 카드가 맡는다
 */
const N = how.steps.length;
const LENS = "clamp(320px, 50vh, 520px)";

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

  const step = how.steps[active];
  const R = 100; // 호 반지름(렌즈 반지름 100 기준의 viewBox 단위)
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

        {/* 호 + 숫자 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `calc(${LENS} + 150px)`, height: `calc(${LENS} + 150px)` }}>
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
        <Scene key={s.title} step={i} last={i === N - 1} />
      ))}
    </section>
  );
}

function Scene({ step, last }: { step: number; last?: boolean }) {
  const lensRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const body = (
    <div ref={sceneRef} className={cn("h-screen overflow-clip", last ? "relative" : "sticky top-0")}>
      {/* 바닥·조명 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0b0b0d_0%,#141416_55%,#0b0b0d_100%)]" />
      <div className="absolute left-1/2 top-[34%] h-[90vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent_70%)]" />

      {/* 배경: 같은 노트북을 크게, 위에서 내려다본 각도 — 어둡게 가라앉힌다 */}
      <div className="absolute left-1/2 top-[58%] w-[104vw] max-w-[1600px] -translate-x-1/2 -translate-y-1/2" style={{ perspective: 2200 }} aria-hidden>
        <div style={{ transform: "rotateX(16deg) rotateY(-8deg) rotateZ(2deg)", transformStyle: "preserve-3d" }}>
          <LaptopShell dark>
            <DemoScreen step={step} rootRef={sceneRef} still />
          </LaptopShell>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_45%,rgba(0,0,0,0.55),rgba(0,0,0,0.84))]" />
      <div className="absolute left-1/2 top-[88%] h-[14vh] w-[70vw] -translate-x-1/2 rounded-full bg-black/80 blur-3xl" />

      {/* 렌즈 — 노트북 전체가 또렷하게 */}
      <div ref={lensRef} className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-clip rounded-full bg-[#17181b] shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_50px_90px_-20px_rgba(0,0,0,0.9)]" style={{ width: LENS, height: LENS }}>
        <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent_80%)]" aria-hidden />
        <div className="relative w-[118%] translate-y-[4%]" style={{ perspective: 1400 }}>
          <div style={{ transform: "rotateX(8deg)", transformStyle: "preserve-3d" }}>
            <LaptopShell dark>
              <DemoScreen step={step} rootRef={lensRef} />
            </LaptopShell>
          </div>
        </div>
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.12),transparent_55%)]" aria-hidden />
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
