"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * 커스텀 커서: 즉답하는 점 + 뒤따르는 링. 링크·버튼 위에서 링이 커진다.
 * mix-blend-mode: difference 라 밝은/어두운 섹션 모두에서 보인다.
 * 마우스(pointer: fine) 환경에서만, 감속 모션이면 비활성.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);

    let mx = -100,
      my = -100,
      rx = -100,
      ry = -100,
      raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const setHover = (e: Event, v: boolean) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest("a, button, [data-cursor]")) {
        document.documentElement.classList.toggle("cursor-hover", v);
      }
    };
    const onOver = (e: Event) => setHover(e, true);
    const onOut = (e: Event) => setHover(e, false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.documentElement.classList.add("has-cursor");
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.documentElement.classList.remove("has-cursor", "cursor-hover");
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (!on) return null;
  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}
