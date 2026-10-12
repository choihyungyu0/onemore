"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { brand, hero, images, intro as copy } from "@/content/landing";
import { Placeholder } from "./placeholder";
import { BrandMark } from "./brand-mark";

const AUTO_MS = 3200;
const LEAVE_MS = 1050;
// 인트로 사진 크기 — 히어로 인셋(최대 36vh)보다 한 단계 크게. 도착하며 살짝 줄어든다 (CSS clamp라 첫 페인트부터 정확)
const PHOTO_W = "clamp(200px, min(28vw, 42vh), 440px)";

/**
 * 오프닝 — 1막: 노리스식 다크 인트로(등고선·코랄 세리프 마퀴·흰 한글 마퀴·중앙 사진 프레임 전환·서명·하단 진행선).
 * 2막: realevate식 전환 — 진행선이 끝에 닿으면 중앙 사진이 히어로 인셋 자리로 날아가 안착하고,
 * 그 사이 커튼과 나머지 요소가 녹아 사라진다. 사진이 도착하는 순간 히어로의 인셋이 그 자리를 이어받는다.
 * 페이지를 열 때마다 재생. 클릭·스크롤·키로 건너뜀. 감속 모션이면 생략.
 */

function useContours() {
  return useMemo(() => {
    const rings: string[] = [];
    const cx = 600;
    const cy = 420;
    const seed = (n: number) => {
      const x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let r = 1; r <= 9; r++) {
      const base = r * 68;
      const pts: [number, number][] = [];
      const N = 36;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const wobble = 1 + (seed(r * 100 + i) - 0.5) * 0.28 + Math.sin(a * 3 + r) * 0.06;
        pts.push([cx + Math.cos(a) * base * 1.55 * wobble, cy + Math.sin(a) * base * wobble]);
      }
      let d = "";
      for (let i = 0; i < N; i++) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % N];
        const p2 = pts[(i + 2) % N];
        const mx = (p0[0] + p1[0]) / 2;
        const my = (p0[1] + p1[1]) / 2;
        const nx = (p1[0] + p2[0]) / 2;
        const ny = (p1[1] + p2[1]) / 2;
        d += i === 0 ? `M ${mx.toFixed(1)} ${my.toFixed(1)} ` : "";
        d += `Q ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)} `;
      }
      rings.push(d + "Z");
    }
    return rings;
  }, []);
}

const SIGNATURE =
  "M 48 262 C 150 150, 300 70, 470 44 C 560 30, 596 62, 540 118 C 470 190, 320 236, 190 268 " +
  "C 112 286, 76 258, 150 228 C 240 192, 380 190, 500 214 M 282 212 L 318 150 L 352 214 L 392 140 L 420 218 M 430 110 L 450 92";

type Phase = "idle" | "playing" | "leaving" | "done";

export function Intro() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>("idle");
  const photoRef = useRef<HTMLDivElement>(null);
  const rings = useContours();
  // 로더 프레임: 여행 사진 4장이 차례로 열리고, 마지막(히어로 인셋 사진)이 히어로로 날아간다
  const frames = [...hero.insetFrames, hero.insetImage];

  useEffect(() => {
    const html = document.documentElement;
    if (reduce) {
      html.classList.remove("preloading");
      setPhase("done");
      window.dispatchEvent(new Event("onemore:intro-done"));
      return;
    }

    setPhase("playing");
    html.classList.add("preloading", "intro-play");
    document.body.style.overflow = "hidden";
    // 새로고침 시 브라우저가 이전 스크롤 위치를 복원하면 인트로가 엉뚱한 곳에서 끝난다 → 항상 맨 위에서 시작
    try {
      history.scrollRestoration = "manual";
    } catch {}
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
    lenis?.stop();

    let finished = false;

    let leaveTimer = 0;
    const mountedAt = performance.now();
    const finish = (reason = "auto") => {
      if (finished) return;
      // 마운트 직후 0.6초 안에 들어오는 휠·포인터 이벤트는 무시 (스크롤 관성·합성 이벤트 오작동 방지)
      if (reason !== "auto" && performance.now() - mountedAt < 600) return;
      finished = true;
      console.debug("[intro] finish via", reason, Math.round(performance.now() - mountedAt), "ms");

      // 사진을 히어로 인셋 자리로 (FLIP: 현재 위치 → 목표 rect)
      const photo = photoRef.current;
      const target = document.getElementById("hero-inset");
      if (photo && target) {
        const r = target.getBoundingClientRect();
        photo.classList.add("intro-photo-fly");
        photo.style.left = `${r.left}px`;
        photo.style.top = `${r.top}px`;
        photo.style.width = `${r.width}px`;
        photo.style.height = `${r.height}px`;
      }

      setPhase("leaving");
      html.classList.add("intro-leaving");
      html.classList.remove("preloading");
      leaveTimer = window.setTimeout(() => {
        window.removeEventListener("wheel", block);
        window.removeEventListener("touchmove", block);
        html.classList.remove("intro-leaving", "intro-play");
        document.body.style.overflow = "";
        lenis?.start();
        setPhase("done");
        window.dispatchEvent(new Event("onemore:intro-done"));
      }, LEAVE_MS);
    };
    const auto = window.setTimeout(() => finish("auto"), AUTO_MS);
    const skip = (e: Event) => finish(e.type);
    // 인트로·전환 중에는 실제 스크롤이 일어나지 않게 막는다 (휠은 건너뛰기 신호로만 사용)
    const block = (e: Event) => e.preventDefault();
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.clearTimeout(auto);
      window.clearTimeout(leaveTimer);
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      html.classList.remove("preloading", "intro-leaving", "intro-play");
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  if (phase === "done") return null;
  const leaving = phase === "leaving";
  const leaveCls = leaving ? "intro-leave" : "";
  const serifRow = Array(4).fill(copy.serifLine).join("  ·  ");
  const sansRow = Array(4).fill(copy.sansLine).join("  ·  ");

  return (
    <>
      {/* 1막: 잉크 커튼 */}
      <div className={`intro fixed inset-0 z-[150] overflow-hidden bg-ink text-white ${leaveCls}`} aria-hidden>
        <svg
          className="intro-contours pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          {rings.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          ))}
        </svg>

        <div
          className="intro-in absolute inset-x-0 top-0 flex items-center justify-between px-5 py-6 sm:px-8 lg:px-12"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="flex items-center gap-2.5 text-[15px] font-extrabold tracking-tight">
            <BrandMark className="h-6 w-6" />
            {brand.name}
          </span>
          <span className="kicker text-white/50">{copy.label}</span>
        </div>

        {/* 중앙: 세리프 영문 줄 + 볼드 한글 줄 (사진 뒤) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="intro-in marquee-mask w-full overflow-hidden" style={{ animationDelay: "0.45s" }}>
            <div className="marquee-track intro-marquee-right">
              <span className="font-serif-accent whitespace-nowrap pr-10 text-[clamp(3rem,10.5vw,10.5rem)] uppercase leading-[0.92] text-brand">
                {serifRow}
              </span>
              <span className="font-serif-accent whitespace-nowrap pr-10 text-[clamp(3rem,10.5vw,10.5rem)] uppercase leading-[0.92] text-brand">
                {serifRow}
              </span>
            </div>
          </div>
          <div className="intro-in marquee-mask -mt-1 w-full overflow-hidden" style={{ animationDelay: "0.65s" }}>
            <div className="marquee-track intro-marquee-left">
              <span className="display-light whitespace-nowrap pr-10 text-[clamp(2.4rem,8.5vw,8.5rem)] leading-[1] text-white/95">
                {sansRow}
              </span>
              <span className="display-light whitespace-nowrap pr-10 text-[clamp(2.4rem,8.5vw,8.5rem)] leading-[1] text-white/95">
                {sansRow}
              </span>
            </div>
          </div>
        </div>

        {/* 하단: 라벨 + 건너뛰기 안내, 맨 아래 가장자리에 코랄 진행선(인트로 남은 시간) */}
        <div
          className="intro-in absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-7 sm:px-8 lg:px-12"
          style={{ animationDelay: "0.9s" }}
        >
          <span className="kicker text-white/40">{brand.latin}</span>
          <span className="kicker text-white/60">{copy.skip}</span>
        </div>
        <div className="intro-progress absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand" aria-hidden />
      </div>

      {/* 중앙 사진 — 커튼 위(z 160). 2막에서 히어로 인셋 자리로 날아간다 */}
      <div
        ref={photoRef}
        className="intro-photo intro-in-photo fixed z-[160] overflow-hidden rounded-[6px] shadow-lift"
        style={{
          left: `calc(50% - ${PHOTO_W} / 2)`,
          top: `calc(50% - ${PHOTO_W} * 1.25 / 2 - 16px)`,
          width: PHOTO_W,
          aspectRatio: "4 / 5",
          animationDelay: "0.35s",
        }}
        aria-hidden
      >
        {frames.map((key, k) => {
          const im = images[key];
          const delay = k === 0 ? undefined : { animationDelay: `${(0.35 + (k - 1) * 0.6).toFixed(2)}s` };
          return (
            <div key={key} className={k === 0 ? "absolute inset-0" : "intro-frame frame-in absolute inset-0"} style={delay}>
              <div className={k === 0 ? "absolute inset-0" : "frame-zoom absolute inset-0"} style={delay}>
                <Placeholder fill tone={1} src={im.src} alt="" sizes="260px" priority />
              </div>
            </div>
          );
        })}
      </div>

      {/* 코랄 서명 — 모든 것의 위 (z 165) */}
      <svg
        className={`intro-signature pointer-events-none fixed left-1/2 top-1/2 z-[165] w-[min(92vw,900px)] -translate-x-1/2 -translate-y-[46%] -rotate-[8deg] ${leaveCls}`}
        viewBox="0 0 640 320"
        fill="none"
        aria-hidden
      >
        <path d={SIGNATURE} pathLength={1} stroke="var(--brand)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
}
