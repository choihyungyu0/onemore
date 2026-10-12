"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { DemoScreen } from "./device-demo";

/**
 * 마지막 제안 — madebykota.com "Let's get started!" 구도
 * 노트북을 받쳐 든 두 손(누끼 사진)이 스크롤에 따라 아래에서 떠오르고,
 * 사진 속 빈 화면 자리에 실제 찾기 화면(데모)이 켜진다. 손목은 아래로 갈수록 배경에 녹는다.
 * 사진: Unsplash(Lorin Both) 1600×900 — 화면 사각형은 원본 기준 % 로 고정
 */
const SCREEN = { left: 27.5, top: 14.1, width: 41.2, height: 50.6 }; // %
const W = 640;
const H = Math.round(W / ((SCREEN.width * 16) / (SCREEN.height * 9))); // 사진 속 화면 비율(≈1.45)에 맞춘 설계 높이

export function FinaleHands({ src }: { src: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 60%"] });
  const y = useTransform(scrollYProgress, [0, 1], ["30%", "0%"]);
  const glow = useTransform(scrollYProgress, [0.3, 1], [0, 1]);

  return (
    <motion.div ref={ref} className="finale-hands relative mx-auto w-full" style={reduce ? undefined : { y }} aria-hidden>
      <img src={src} alt="" className="block h-auto w-full select-none" draggable={false} decoding="async" />
      {/* 선명한 베젤 — 사진 속 노트북 덮개 테두리(누끼라 가장자리가 흐림)를 또렷한 CSS 테두리로 덮는다. 실측: 1600×900 기준 426,106 → 1114,590 */}
      <div
        className="pointer-events-none absolute rounded-[1.1vw] bg-[#0b0c10] shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_40px_-20px_rgba(11,18,32,0.6)] ring-1 ring-[#2a2d34]"
        style={{ left: "26.6%", top: "11.8%", width: "43%", height: "53.8%" }}
        aria-hidden
      >
        <span className="absolute left-1/2 top-[1.6%] h-[1.3%] w-[0.9%] -translate-x-1/2 rounded-full bg-[#1d2027] ring-1 ring-[#3a3e47]" />
      </div>
      {/* 사진 속 화면 자리 */}
      <div ref={box} className="absolute overflow-hidden bg-paper" style={{ left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` }}>
        <motion.div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})`, opacity: reduce ? 1 : glow }}>
          <DemoScreen step={0} rootRef={box} />
        </motion.div>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.22] via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}
