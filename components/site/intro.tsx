"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { brand, hero, images, intro as copy } from "@/content/landing";
import { Placeholder } from "./placeholder";

const EASE = [0.76, 0, 0.24, 1] as const;
const AUTO_MS = 3400;

/**
 * 오프닝 인트로 — 잉크 배경 위 등고선, 중앙 사진, 뒤로 흐르는 두 줄의 대형 타이포,
 * 그 위에 코랄 서명이 그려진 뒤 커튼이 위로 걷힌다. 세션당 1회, 클릭·스크롤·키로 건너뛸 수 있음.
 * 모든 자산(사진·서명·글꼴)은 우리 것. 커튼이 걷히는 순간 html.preloading 을 제거해
 * 히어로 CSS 진입 모션이 이어서 시작된다.
 */

/** 등고선 — 결정적 노이즈로 만든 울퉁불퉁한 동심 곡선 (SVG 1200×800 기준) */
function useContours() {
  return useMemo(() => {
    const rings: string[] = [];
    const cx = 600;
    const cy = 420;
    const seed = (n: number) => {
      const x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let r = 1; r <= 9; r++) {
      const base = r * 68;
      const pts: [number, number][] = [];
      const N = 36;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const wobble = 1 + (seed(r * 100 + i) - 0.5) * 0.28 + Math.sin(a * 3 + r) * 0.06;
        pts.push([cx + Math.cos(a) * base * 1.55 * wobble, cy + Math.sin(a) * base * wobble]);
      }
      // 부드러운 닫힌 곡선 (중점 기반 quadratic)
      let d = "";
      for (let i = 0; i < N; i++) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % N];
        const mx = (p0[0] + p1[0]) / 2;
        const my = (p0[1] + p1[1]) / 2;
        d += i === 0 ? `M ${mx.toFixed(1)} ${my.toFixed(1)} ` : "";
        const p2 = pts[(i + 2) % N];
        const nx = (p1[0] + p2[0]) / 2;
        const ny = (p1[1] + p2[1]) / 2;
        d += `Q ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)} `;
      }
      rings.push(d + "Z");
    }
    return rings;
  }, []);
}

/** 코랄 서명 — 손으로 그린 듯한 한 획의 플러리시 (pathLength=1 로 dash 애니메이션) */
const SIGNATURE =
  "M 48 262 C 150 150, 300 70, 470 44 C 560 30, 596 62, 540 118 C 470 190, 320 236, 190 268 " +
  "C 112 286, 76 258, 150 228 C 240 192, 380 190, 500 214 M 282 212 L 318 150 L 352 214 L 392 140 L 420 218 M 430 110 L 450 92";

export function Intro() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rings = useContours();
  const im = images[hero.cards[0].image];

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("onemore-intro") === "1";
    } catch {}
    if (reduce || seen) {
      setDone(true);
      return;
    }
    setMounted(true);
    const finish = () => {
      setDone(true);
      try {
        sessionStorage.setItem("onemore-intro", "1");
      } catch {}
    };
    const t = window.setTimeout(finish, AUTO_MS);
    const skip = () => finish();
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [reduce]);

  useEffect(() => {
    document.documentElement.classList.toggle("preloading", !done);
    document.body.style.overflow = done ? "" : "hidden";
    return () => {
      document.documentElement.classList.remove("preloading");
      document.body.style.overflow = "";
    };
  }, [done]);

  if (!mounted && done) return null;

  const serifRow = Array(4).fill(copy.serifLine).join("  ·  ");
  const sansRow = Array(4).fill(copy.sansLine).join("  ·  ");

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="intro fixed inset-0 z-[150] overflow-hidden bg-ink text-white"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: EASE }}
          aria-hidden
        >
          {/* 등고선 배경 */}
          <svg
            className="intro-contours pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            {rings.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            ))}
          </svg>

          {/* 상단 라벨 */}
          <div
            className="intro-in absolute inset-x-0 top-0 flex items-center justify-between px-5 py-6 sm:px-8 lg:px-12"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="flex items-center gap-2.5 text-[15px] font-extrabold tracking-tight">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-brand font-display text-[9px] font-extrabold">
                +1
              </span>
              {brand.name}
            </span>
            <span className="kicker text-white/50">{copy.label}</span>
          </div>

          {/* 뒤로 흐르는 대형 타이포 2줄 */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            <div className="intro-in marquee-mask w-full overflow-hidden" style={{ animationDelay: "0.5s" }}>
              <div className="marquee-track intro-marquee-left">
                <span className="font-serif-accent whitespace-nowrap pr-10 text-[clamp(3.2rem,11vw,11rem)] uppercase leading-[0.9] text-brand">
                  {serifRow}
                </span>
                <span className="font-serif-accent whitespace-nowrap pr-10 text-[clamp(3.2rem,11vw,11rem)] uppercase leading-[0.9] text-brand">
                  {serifRow}
                </span>
              </div>
            </div>
            <div className="intro-in marquee-mask -mt-2 w-full overflow-hidden" style={{ animationDelay: "0.7s" }}>
              <div className="marquee-track intro-marquee-right">
                <span className="display whitespace-nowrap pr-10 text-[clamp(2.6rem,9vw,9rem)] uppercase leading-[0.95] text-white/90">
                  {sansRow}
                </span>
                <span className="display whitespace-nowrap pr-10 text-[clamp(2.6rem,9vw,9rem)] uppercase leading-[0.95] text-white/90">
                  {sansRow}
                </span>
              </div>
            </div>
          </div>

          {/* 중앙 사진 */}
          <div className="absolute left-1/2 top-1/2 w-[min(58vw,340px)] -translate-x-1/2 -translate-y-1/2">
            <div className="intro-in-photo overflow-hidden rounded-[6px] shadow-lift" style={{ animationDelay: "0.35s" }}>
              <Placeholder ratio="4/5" tone={0} src={im.src} alt="" sizes="340px" priority className="intro-photo" />
            </div>
          </div>

          {/* 코랄 서명 */}
          <svg
            className="intro-signature pointer-events-none absolute left-1/2 top-1/2 w-[min(92vw,900px)] -translate-x-1/2 -translate-y-[46%] -rotate-[8deg]"
            viewBox="0 0 640 320"
            fill="none"
          >
            <path
              d={SIGNATURE}
              pathLength={1}
              stroke="var(--brand)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* 하단 안내 */}
          <div
            className="intro-in absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-7 sm:px-8 lg:px-12"
            style={{ animationDelay: "1.2s" }}
          >
            <span className="kicker text-white/40">{brand.latin}</span>
            <span className="kicker text-white/60">{copy.skip}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
