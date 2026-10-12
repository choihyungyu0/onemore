"use client";

import { useEffect, useRef, useState } from "react";
import { Placeholder } from "./placeholder";

/**
 * 하늘 배경 영상 — 소리 없는 자동재생 루프.
 * 포스터(첫 프레임) 이미지를 먼저 깔고, 데스크톱·모션 허용·데이터 절약 아님일 때만 영상을 얹는다.
 * 첫 진입이 끊기지 않도록: 인트로가 끝난 뒤 + 이 블록이 화면 근처(위아래 한 화면)에 올 때 + 1.2초 뒤에 로드한다.
 * (두 영상을 인트로 종료 순간에 동시에 디코딩하던 멈칫거림 방지)
 */
export function SkyVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || !desktop || saveData) return;

    let timer = 0;
    let near = false;
    let introDone = !document.documentElement.classList.contains("preloading");
    const arm = () => {
      if (!near || !introDone || timer) return;
      timer = window.setTimeout(() => setOn(true), 1200);
    };
    const io = new IntersectionObserver(
      (entries) => {
        near = entries.some((e) => e.isIntersecting);
        arm();
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    io.observe(el);
    const onIntro = () => {
      introDone = true;
      arm();
    };
    window.addEventListener("onemore:intro-done", onIntro);
    // 인트로 없이 열린 경우(감속 모션·재방문)를 대비한 안전장치
    const fallback = window.setTimeout(() => {
      introDone = true;
      arm();
    }, 7000);
    return () => {
      io.disconnect();
      window.removeEventListener("onemore:intro-done", onIntro);
      window.clearTimeout(timer);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden>
      <Placeholder fill tone={1} src={poster} alt="" sizes="100vw" />
      {on && (
        <video
          className="img-tone absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
    </div>
  );
}
