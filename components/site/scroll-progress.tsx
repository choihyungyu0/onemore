"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** 화면 상단 2px 진행바 — 페이지 스크롤에 연동 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-brand"
    />
  );
}
