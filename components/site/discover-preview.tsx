"use client";

import { createLoop, isFinePointer, settled, whenInView } from "@/lib/raf-loop";

import { useEffect, useRef, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { discover, images, type Creator } from "@/content/landing";
import { Placeholder } from "./placeholder";
import { EASE } from "./reveal";

/** 세 장의 자리: 가로 오프셋·세로 오프셋·기울기·쌓임·시차 깊이 */
const SLOTS = [
  { x: -118, y: 26, r: -9, z: 1, d: 0.55 },
  { x: 0, y: -16, r: 3, z: 3, d: 1 },
  { x: 122, y: 32, r: 10, z: 2, d: 0.75 },
];

/**
 * 크리에이터 찾기 프리뷰 스택 — 제목 옆 빈 공간에 사진 3장이 겹쳐 떠 있다.
 * 마우스를 따라 깊이별로 살짝 움직이고(시차), 천천히 부유하며,
 * 필터 칩에 마우스를 올리거나 누르면 그 조건에 맞는 사람들로 바뀐다. 데스크톱 전용.
 */
export function DiscoverPreview({ list, label }: { list: Creator[]; label: string }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !isFinePointer()) return;
    const el = root.current;
    if (!el) return;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let visible = false;
    // 화면 안에서 커서가 움직일 때만 돌고, 목표에 닿으면 멈춘다
    const loop = createLoop(() => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty("--px", cx.toFixed(3));
      el.style.setProperty("--py", cy.toFixed(3));
      return !(settled(cx, tx) && settled(cy, ty));
    });
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (visible) loop.kick();
    };
    const off = whenInView(el, (v) => {
      visible = v;
      if (v) loop.kick();
      else loop.stop();
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      off();
      loop.stop();
    };
  }, [reduce]);

  const shown = list.slice(0, 3);

  return (
    <div ref={root} className="preview-stack relative hidden h-[320px] w-full lg:block" aria-label={label}>
      <div aria-hidden className="preview-glow pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <AnimatePresence mode="popLayout">
        {shown.map((c, i) => {
          const s = SLOTS[i];
          const im = images[c.image];
          return (
            <motion.div
              key={c.id}
              className="preview-card absolute left-1/2 top-1/2 w-[clamp(150px,13vw,190px)]"
              style={
                {
                  zIndex: s.z,
                  "--sx": `${s.x}px`,
                  "--sy": `${s.y}px`,
                  "--sr": `${s.r}deg`,
                  "--sd": s.d,
                } as CSSProperties
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: i * 0.05 }}
            >
              <div className={`preview-float-${i} overflow-hidden rounded-[14px] bg-white p-1.5 shadow-lift ring-1 ring-ink/[0.06]`}>
                <Placeholder ratio="4/5" tone={c.tone} src={im.src} alt={im.alt} sizes="200px" className="rounded-[10px]" />
                <div className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-2">
                  <span className="truncate text-[11.5px] font-bold tracking-tight text-ink">{c.name}</span>
                  <span className="shrink-0 text-[10px] text-muted">
                    {c.country} · {c.city}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {shown.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-[13px] text-muted">
          {discover.empty.title.split("\n")[0]}
        </p>
      )}
    </div>
  );
}
