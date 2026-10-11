"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { brand } from "@/content/landing";

const EASE = [0.76, 0, 0.24, 1] as const;
const DURATION = 1400;

/**
 * 진입 프리로더: 0→100 카운터 + 헤어라인 진행바, 끝나면 커튼이 위로 걷힌다.
 * 세션 내 재방문·감속 모션이면 생략. 걷히는 순간 html.preloading 을 제거해
 * 히어로 CSS 진입 모션(.rise)이 그때부터 재생된다.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("onemore-preloader") === "1";
    } catch {}
    if (reduce || seen) {
      setDone(true);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else
        window.setTimeout(() => {
          setDone(true);
          try {
            sessionStorage.setItem("onemore-preloader", "1");
          } catch {}
        }, 200);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  useEffect(() => {
    document.documentElement.classList.toggle("preloading", !done);
    document.body.style.overflow = done ? "" : "hidden";
    return () => {
      document.documentElement.classList.remove("preloading");
      document.body.style.overflow = "";
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[150] flex flex-col justify-between bg-ink text-white"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE }}
          aria-hidden
        >
          <div className="flex items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
            <span className="flex items-center gap-2.5 text-[15px] font-extrabold tracking-tight">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-brand font-display text-[9px] font-extrabold">
                +1
              </span>
              {brand.name}
            </span>
            <span className="kicker hidden text-white/50 sm:block">{brand.latin}</span>
          </div>

          <div className="flex flex-1 items-end justify-end px-5 sm:px-8 lg:px-12">
            <span className="display tnum leading-[0.8]" style={{ fontSize: "clamp(5rem, 20vw, 16rem)" }}>
              {pct}
              <span className="text-white/35">%</span>
            </span>
          </div>

          <div className="px-5 pb-8 sm:px-8 lg:px-12">
            <div className="h-px w-full overflow-hidden bg-white/15">
              <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
