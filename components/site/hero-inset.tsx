"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { hero, images } from "@/content/landing";
import { Placeholder } from "./placeholder";

const HOLD_MS = 3200;

/**
 * 히어로 인셋(#hero-inset) — 인트로의 사진이 날아와 안착하는 목적지.
 * 인트로가 끝나면 realevate 로더와 같은 방식으로 다음 사진이 가운데서 바깥으로 열리며(clip-path)
 * 줌아웃해 차례로 바뀐다. 감속 모션이면 첫 사진 고정.
 */
export function HeroInset() {
  const reduce = useReducedMotion();
  const keys = [hero.insetImage, ...hero.insetFrames];
  const [cur, setCur] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [armed, setArmed] = useState(false);

  // 인트로가 끝난 뒤부터 순환 시작
  useEffect(() => {
    if (reduce) return;
    const html = document.documentElement;
    const arm = () => setArmed(true);
    if (!html.classList.contains("preloading") && !html.classList.contains("intro-leaving")) arm();
    else window.addEventListener("onemore:intro-done", arm, { once: true });
    return () => window.removeEventListener("onemore:intro-done", arm);
  }, [reduce]);

  useEffect(() => {
    if (!armed || next !== null) return;
    const t = window.setTimeout(() => setNext((cur + 1) % keys.length), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [armed, cur, next, keys.length]);

  const im = images[keys[cur]];
  const nx = next === null ? null : images[keys[next]];

  return (
    <div id="hero-inset" className="hero-inset-inner pointer-events-auto relative overflow-hidden rounded-[6px] shadow-lift">
      <Placeholder ratio="4/5" tone={1} src={im.src} alt={im.alt} sizes="260px" priority>
        {nx && next !== null && (
          <div
            key={next}
            className="hero-frame frame-in is-in absolute inset-0 z-[1]"
            onAnimationEnd={(e) => {
              if (e.target !== e.currentTarget) return;
              setCur(next);
              setNext(null);
            }}
          >
            <div className="frame-zoom absolute inset-0">
              <Placeholder fill tone={1} src={nx.src} alt={nx.alt} sizes="260px" priority />
            </div>
          </div>
        )}
      </Placeholder>
    </div>
  );
}
