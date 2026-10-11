"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/** Lenis 스크롤 이벤트를 GSAP ScrollTrigger에 연결 (핀·스크럽 정확도) */
function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    // 디버그·캡처 스크립트용 전역 핸들 (window.__lenis.scrollTo)
    (window as unknown as { __lenis?: typeof lenis }).__lenis = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
    };
  }, [lenis]);
  return null;
}

/**
 * Lenis 관성 스크롤 — 어워즈 사이트의 "무게감"은 대부분 여기서 시작한다.
 * 감속 모션 설정에서는 네이티브 스크롤 유지.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  if (reduce) return <>{children}</>;
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        wheelMultiplier: 0.95,
        autoRaf: false,
        anchors: { offset: -72 },
        prevent: (node) => node.closest?.("[data-lenis-prevent]") != null,
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
