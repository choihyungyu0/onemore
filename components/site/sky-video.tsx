"use client";

import { useEffect, useState } from "react";
import { Placeholder } from "./placeholder";

/**
 * 하늘 배경 영상 — 소리 없는 자동재생 루프.
 * 포스터(첫 프레임) 이미지를 먼저 깔고, 데스크톱·모션 허용·데이터 절약 아님일 때만
 * 인트로가 끝난 뒤 영상을 얹는다. 그 외(모바일·감속 모션·데이터 절약)는 이미지만.
 */
export function SkyVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || !desktop || saveData) return;
    const t = window.setTimeout(() => setOn(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={className} aria-hidden>
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
