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
    (window as unknown as { __ST?: typeof ScrollTrigger }).__ST = ScrollTrigger;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    // 인트로가 끝나 스크롤이 풀리면 핀 공간까지 포함해 트리거 위치를 다시 계산
    const onIntroDone = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    window.addEventListener("onemore:intro-done", onIntroDone);
    // 폰트·이미지가 늦게 와서 레이아웃이 바뀌어도 핀 위치가 어긋나지 않게 몇 번 더 재계산
    document.fonts?.ready.then(onIntroDone).catch(() => {});
    window.addEventListener("load", onIntroDone);
    const later = [1500, 4000, 8000].map((ms) => window.setTimeout(onIntroDone, ms));
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.off("scroll", onScroll);
      window.removeEventListener("onemore:intro-done", onIntroDone);
      window.removeEventListener("load", onIntroDone);
      later.forEach((t) => window.clearTimeout(t));
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
