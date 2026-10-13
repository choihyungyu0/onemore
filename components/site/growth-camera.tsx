"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleRefresh } from "@/lib/scroll-refresh";
import { createLoop, isFinePointer, settled, whenInView } from "@/lib/raf-loop";
import { useLenis } from "lenis/react";
import { growth, images, type ImageKey, type SiteImage } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";
import { Reveal, RevealLines } from "./reveal";
import { Kicker } from "./section";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 함께 성장하기 — "카메라로 찍는 순간, 그 사진 속으로 들어간다"
 * 데스크톱(핀 고정, 스크롤 260%):
 *  1) 뷰파인더: 오른쪽 카드에 사진이 흐릿하게 보이고 스크롤할수록 초점이 맞는다. 초점 상자는 커서를 따라가고
 *     노출값·거리 표시가 바뀐다. 타임코드가 실제로 흐르고, 초점이 잡히면 상자가 초록으로 두 번 깜빡이며 잠긴다.
 *     왼쪽엔 "유명해진 다음에만 만나지 않습니다." + 필름 스트립(이미 찍은 세 컷 + 비어 있는 네 번째 컷)
 *  2) 셔터: 플래시가 터지며 사진이 잠깐 흑백으로 멈추고, 카드가 화면 전체로 빨려 들어가듯 커진다
 *  3) 사진 속: 천천히 줌인(켄 번즈)되는 사진 위로 제목이 단어마다 떠오르고, 필름 스트립에 방금 찍은 네 번째 컷이
 *     찍히며(CUT 003 → 004), 인화지 캡션 카드(촬영 메타 + 본문)가 열린다. 더 내리면 본문 1 → 본문 2로 바뀐다.
 *  셔터 버튼이나 사진을 누르면 셔터 지점 너머로 스크롤이 자동으로 간다.
 * 모바일·감속 모션: 정적 레이아웃 (뷰파인더 카드 → 탭하면 플래시 후 사진 속 문구, 스트립에 네 번째 컷 추가)
 */
const SCROLL = 2.6; // 핀 길이 (화면 높이 배수)
const SHUTTER_AT = 0.44; // 셔터가 터지는 진행도
const LOCK_AT = 0.34; // 초점 잠금
const NEW_CUT_AT = SHUTTER_AT + 0.26; // 필름 스트립에 네 번째 컷이 찍히는 지점
const SWAP_AT = 0.84; // 캡션 본문 1 → 2

export function GrowthCamera() {
  const im = images[growth.camera.image];
  const [line1, line2, line3] = growth.title.split("\n");
  return (
    <>
      <DesktopScene im={im} lines={[line1, line2, line3]} />
      <MobileScene im={im} lines={[line1, line2, line3]} />
    </>
  );
}

/* ---------- HUD (뷰파인더 표시) ---------- */
function Hud({ dist, ev, live }: { dist: string; ev: string; live?: boolean }) {
  const h = growth.camera.hud;
  const tc = useRef<HTMLSpanElement>(null);

  // 타임코드 — 마운트 시각부터 시:분:초:프레임(24fps). React 상태가 아니라 텍스트 노드만 바꾼다
  useEffect(() => {
    const el = tc.current;
    if (!el || !live) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!el.getClientRects().length) return; // display:none 변형(모바일/데스크톱 중 숨은 쪽)에선 돌리지 않는다
    const t0 = performance.now();
    const pad = (n: number) => String(n).padStart(2, "0");
    let last = "";
    // 화면에 보일 때만 센다
    const loop = createLoop(() => {
      const s = (performance.now() - t0) / 1000;
      const txt = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * 24))}`;
      if (txt !== last) {
        last = txt;
        el.textContent = txt;
      }
      return true;
    });
    const off = whenInView(el, (v) => (v ? loop.kick() : loop.stop()), "0px");
    return () => {
      off();
      loop.stop();
    };
  }, [live]);

  return (
    <div className="cam-hud pointer-events-none absolute inset-0 text-white" aria-hidden>
      {/* 모서리 브래킷 */}
      <span className="cam-corner left-4 top-4 border-l border-t" />
      <span className="cam-corner right-4 top-4 border-r border-t" />
      <span className="cam-corner bottom-4 left-4 border-b border-l" />
      <span className="cam-corner bottom-4 right-4 border-b border-r" />
      {/* 삼분할선 */}
      <span className="absolute inset-y-6 left-1/3 w-px bg-white/15" />
      <span className="absolute inset-y-6 left-2/3 w-px bg-white/15" />
      <span className="absolute inset-x-6 top-1/3 h-px bg-white/15" />
      <span className="absolute inset-x-6 top-2/3 h-px bg-white/15" />
      {/* 상단 — REC · 타임코드 · 모드 */}
      <span className="absolute left-7 top-7 flex items-center gap-2 font-display text-[11px] font-bold tracking-[0.18em]">
        <span className="cam-rec h-2 w-2 rounded-full bg-brand" />
        {h.rec}
        <span ref={tc} className="ml-1 tabular-nums text-white/85">
          00:00:00:00
        </span>
        <span className="ml-2 text-white/60">{h.mode}</span>
      </span>
      {/* 상단 오른쪽 — AF(잠기면 초록) · 배터리 */}
      <span className="absolute right-7 top-7 flex items-center gap-2 font-display text-[11px] font-bold tracking-[0.18em] text-white/70">
        <span data-af-dot className="h-1.5 w-1.5 rounded-full" />
        <span data-af>{h.af}</span>
        <span className="relative ml-1 inline-block h-[10px] w-[20px] rounded-[2px] border border-white/60 after:absolute after:inset-[2px] after:right-[5px] after:rounded-[1px] after:bg-white/80" />
      </span>
      {/* 하단 — 노출 읽기값 · 거리 */}
      <span className="absolute bottom-7 left-7 flex gap-4 font-display text-[11px] font-bold tracking-[0.14em] text-white/75">
        {h.readouts.map((r, i) => (
          <span key={r} className={cn(i >= 2 && "max-sm:hidden")}>
            {r}
          </span>
        ))}
        <span className="tabular-nums text-brand">{ev}</span>
      </span>
      <span className="absolute bottom-7 right-7 font-display text-[11px] font-bold tracking-[0.14em] tabular-nums text-white/75">{dist}</span>
    </div>
  );
}

/* ---------- 초점 상자 ---------- */
function FocusBox({ className, ...rest }: { className?: string; [k: string]: unknown }) {
  return (
    <span className={cn("cam-focus pointer-events-none absolute", className)} style={{ left: "50%", top: "50%" }} aria-hidden {...rest}>
      <span className="cam-corner left-0 top-0 border-l border-t" />
      <span className="cam-corner right-0 top-0 border-r border-t" />
      <span className="cam-corner bottom-0 left-0 border-b border-l" />
      <span className="cam-corner bottom-0 right-0 border-b border-r" />
    </span>
  );
}

/* ---------- 셔터 그립 (오른쪽 세로) ---------- */
function Grip() {
  return (
    <span className="cam-grip" aria-hidden>
      <span className="cam-grip-tick" />
      <span className="cam-shutter">
        <span />
      </span>
      <span className="cam-grip-tick" />
    </span>
  );
}

/* ---------- 필름 스트립 — 이미 찍은 세 컷 + 네 번째 컷 ---------- */
function FilmStrip({ im, captured, className }: { im: SiteImage; captured?: boolean; className?: string }) {
  const f = growth.camera.film;
  return (
    <div className={cn("cam-film", className)} aria-hidden>
      <div className="mb-2 flex items-center justify-between font-display text-[10px] font-bold tracking-[0.18em] text-white/55">
        <span>{f.label}</span>
        <span>
          {f.counterLabel}{" "}
          <span data-count className="tabular-nums text-brand">
            {captured ? "004" : "003"}
          </span>
        </span>
      </div>
      <ol className="flex gap-2">
        {f.frames.map((fr, i) => {
          const fim = images[fr.image as ImageKey];
          return (
            <li key={fr.label} className="cam-frame">
              <Placeholder fill tone={i + 1} src={fim.src} alt="" sizes="140px" className="opacity-80" />
              <span className="absolute left-1.5 top-1 font-display text-[9px] font-bold tracking-[0.12em] text-white/75">{String(i + 1).padStart(3, "0")}</span>
              <span className="absolute bottom-1 left-1.5 text-[10px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{fr.label}</span>
            </li>
          );
        })}
        <li className="cam-frame cam-frame--next">
          <span className="absolute left-1.5 top-1 font-display text-[9px] font-bold tracking-[0.12em] text-white/60">004</span>
          <span className="absolute bottom-1 left-1.5 text-[10px] font-semibold text-white/60">{f.next}</span>
          {captured && (
            <span data-new className="absolute inset-0 overflow-hidden rounded-[inherit]">
              <Placeholder fill tone={5} src={im.src} alt="" sizes="140px" />
              <span className="absolute right-1 top-1 rounded-[3px] bg-brand px-1 py-[2px] font-display text-[8px] font-extrabold tracking-[0.14em] text-white">{f.stamp}</span>
            </span>
          )}
        </li>
      </ol>
    </div>
  );
}

/* ---------- 본문 — 지정 구절에 형광펜 ---------- */
function Accented({ text, accents }: { text: string; accents: string[] }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((ln, i) => {
        const hit = accents.find((a) => ln.includes(a));
        const parts = hit ? ln.split(hit) : [ln];
        return (
          <Fragment key={i}>
            {hit ? (
              <>
                {parts[0]}
                <span className="marker marker--dark">{hit}</span>
                {parts.slice(1).join(hit)}
              </>
            ) : (
              ln
            )}
            {i < lines.length - 1 ? <br /> : null}
          </Fragment>
        );
      })}
    </>
  );
}

/* ---------- 캡션 카드 메타 줄 ---------- */
function CaptionMeta() {
  const c = growth.camera.caption;
  return (
    <div className="flex flex-wrap items-center gap-x-2 font-display text-[10.5px] font-bold tracking-[0.16em] text-white/55">
      {c.meta.map((m, i) => (
        <Fragment key={m}>
          {i > 0 && <span className="text-white/30">·</span>}
          <span className={cn("tabular-nums", i === 0 && "text-brand")}>{m}</span>
        </Fragment>
      ))}
    </div>
  );
}

/* ---------- 데스크톱 ---------- */
function DesktopScene({ im, lines }: { im: SiteImage; lines: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const stRef = useRef<ScrollTrigger | null>(null);
  const [dist, setDist] = useState("1.2m");
  const [ev, setEv] = useState("EV 0.0");
  const words = lines[2].split(/\s+/).filter(Boolean);

  // 초점 상자 — 커서를 따라간다 (카드 안에서만)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const box = el.querySelector<HTMLElement>("[data-focus]");
    if (!card || !box) return;
    if (!isFinePointer()) return;
    let tx = 0.5;
    let ty = 0.5;
    let cx = 0.5;
    let cy = 0.5;
    let lastDist = "";
    // 커서가 움직일 때만 돌고, 상자가 목표에 닿으면 멈춘다
    const loop = createLoop(() => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      box.style.left = `${(cx * 100).toFixed(2)}%`;
      box.style.top = `${(cy * 100).toFixed(2)}%`;
      const d = (0.9 + Math.hypot(cx - 0.5, cy - 0.5) * 3.2).toFixed(1) + "m";
      if (d !== lastDist) {
        lastDist = d;
        setDist(d);
        setEv(`EV ${((cy - 0.5) * -1.4).toFixed(1).replace("-0.0", "0.0")}`);
      }
      return !(settled(cx, tx) && settled(cy, ty));
    });
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      tx = Math.min(0.92, Math.max(0.08, (e.clientX - r.left) / r.width));
      ty = Math.min(0.9, Math.max(0.1, (e.clientY - r.top) / r.height));
      loop.kick();
    };
    const onLeave = () => {
      tx = 0.5;
      ty = 0.5;
      loop.kick();
    };
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      loop.stop();
    };
  }, []);

  // 스크롤 타임라인
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const q = (s: string) => el.querySelector<HTMLElement>(s)!;
      const stage = q("[data-stage]");
      const slot = q("[data-slot]");
      const card = q("[data-card]");
      const img = q("[data-img]");
      const hud = q("[data-hud]");
      const flash = q("[data-flash]");
      const shade = q("[data-shade]");
      const textA = q("[data-text-a]");
      const tag = q("[data-tag]");
      const wordEls = gsap.utils.toArray<HTMLElement>("[data-word]", el);
      const film = q("[data-film]");
      const newCut = film.querySelector<HTMLElement>("[data-new]");
      const count = film.querySelector<HTMLElement>("[data-count]");
      const caption = q("[data-caption]");
      const paras = gsap.utils.toArray<HTMLElement>("[data-para]", caption);
      const pg = gsap.utils.toArray<HTMLElement>("[data-pg]", caption);
      const brand = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#FF5A3C";
      const dim = "rgba(255,255,255,0.25)";

      const rect = () => {
        const s = slot.getBoundingClientRect();
        const g = stage.getBoundingClientRect();
        return { left: s.left - g.left, top: s.top - g.top, width: s.width, height: s.height };
      };

      gsap.set([shade, flash], { autoAlpha: 0 });
      gsap.set(tag, { autoAlpha: 0, y: 10 });
      gsap.set(wordEls, { autoAlpha: 0, y: "0.6em" });
      gsap.set(film, { autoAlpha: 0, y: 16 });
      if (newCut) gsap.set(newCut, { autoAlpha: 0, scale: 0.5, rotate: -8 });
      gsap.set(caption, { autoAlpha: 0, y: 24 });
      gsap.set(paras, { autoAlpha: 0, y: 14 });
      gsap.set(pg, { backgroundColor: dim });
      if (count) count.textContent = "003";

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${SCROLL * 100}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // 진행도에 따라 바뀌는 상태(클래스·텍스트) — 되감아도 되돌아간다
          onUpdate: (self) => {
            const pr = self.progress;
            card.classList.toggle("is-locked", pr >= LOCK_AT && pr < SHUTTER_AT + 0.02);
            if (count) count.textContent = pr >= NEW_CUT_AT ? "004" : "003";
            paras[0]?.classList.toggle("in-view", pr >= SHUTTER_AT + 0.32);
            paras[1]?.classList.toggle("in-view", pr >= SWAP_AT + 0.03);
          },
        },
      });
      stRef.current = tl.scrollTrigger ?? null;

      // 1) 초점 맞추기
      tl.fromTo(img, { filter: "blur(10px)", scale: 1.06 }, { filter: "blur(0px)", scale: 1, duration: 0.36 }, 0);
      tl.fromTo(q("[data-focus]"), { scale: 1.35, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.36 }, 0);
      // 2) 셔터: 글 퇴장 → 플래시 + 흑백 정지 → 카드가 화면 전체로
      tl.to(textA, { autoAlpha: 0, y: -40, duration: 0.08 }, SHUTTER_AT - 0.06);
      tl.to(hud, { autoAlpha: 0, duration: 0.03 }, SHUTTER_AT);
      tl.to(flash, { autoAlpha: 1, duration: 0.02, ease: "power4.in" }, SHUTTER_AT);
      tl.to(flash, { autoAlpha: 0, duration: 0.08, ease: "power2.out" }, SHUTTER_AT + 0.02);
      tl.to(img, { filter: "grayscale(1) contrast(1.25)", duration: 0.02 }, SHUTTER_AT);
      tl.to(img, { filter: "grayscale(0) contrast(1)", duration: 0.1 }, SHUTTER_AT + 0.06);
      tl.fromTo(
        card,
        { left: () => rect().left, top: () => rect().top, width: () => rect().width, height: () => rect().height, borderRadius: 22 },
        { left: 0, top: 0, width: () => stage.clientWidth, height: () => stage.clientHeight, borderRadius: 0, duration: 0.16, ease: "power3.inOut", immediateRender: true },
        SHUTTER_AT + 0.02
      );
      // 3) 사진 속: 켄 번즈 + 제목 단어 → 필름 스트립(새 컷) → 캡션 카드
      tl.fromTo(img, { scale: 1 }, { scale: 1.14, duration: 1 - (SHUTTER_AT + 0.18) }, SHUTTER_AT + 0.18);
      tl.to(shade, { autoAlpha: 1, duration: 0.1 }, SHUTTER_AT + 0.12);
      tl.to(tag, { autoAlpha: 1, y: 0, duration: 0.06 }, SHUTTER_AT + 0.18);
      tl.to(wordEls, { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.035, ease: "power2.out" }, SHUTTER_AT + 0.2);
      tl.to(film, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, SHUTTER_AT + 0.22);
      if (newCut) tl.to(newCut, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.06, ease: "back.out(2.2)" }, NEW_CUT_AT);
      tl.to(caption, { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" }, SHUTTER_AT + 0.28);
      tl.to(paras[0], { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, SHUTTER_AT + 0.32);
      tl.to(pg[0], { backgroundColor: brand, duration: 0.02 }, SHUTTER_AT + 0.32);
      // 4) 본문 1 → 2
      tl.to(paras[0], { autoAlpha: 0, y: -12, duration: 0.04 }, SWAP_AT);
      tl.to(pg[0], { backgroundColor: dim, duration: 0.02 }, SWAP_AT);
      tl.to(paras[1], { autoAlpha: 1, y: 0, duration: 0.07, ease: "power2.out" }, SWAP_AT + 0.03);
      tl.to(pg[1], { backgroundColor: brand, duration: 0.02 }, SWAP_AT + 0.03);

      scheduleRefresh();
      return () => {
        stRef.current = null;
      };
    });
    return () => mm.revert();
  }, []);

  // 셔터 누르기 — 셔터 지점 너머(캡션 본문 1이 다 보이는 곳)로 부드럽게 스크롤
  const shoot = () => {
    const st = stRef.current;
    if (!st) return;
    const target = st.start + (st.end - st.start) * (SHUTTER_AT + 0.36);
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div ref={root} data-variant="desktop" className="growth-camera hidden lg:block motion-reduce:hidden">
      <div data-stage className="relative h-screen overflow-hidden bg-ink text-white">
        <div className="grain-local absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-brand/15 blur-3xl" aria-hidden />

        {/* 1) 왼쪽 글 + 필름 스트립, 오른쪽 카드 자리 */}
        <div className="relative mx-auto grid h-full max-w-[80rem] grid-cols-[0.95fr_1.05fr] items-center gap-14 px-12 xl:gap-20">
          <div data-text-a>
            <Kicker index="03" label={growth.kicker} invert />
            <p className="mt-6 text-[15px] font-semibold text-brand md:text-base">{growth.lead}</p>
            <h2 className="display mt-4 text-[clamp(2.1rem,4.4vw,4rem)] leading-[1.02] text-white">
              {lines[0]}
              <br />
              {lines[1]}
            </h2>
            <p className="mt-8 flex items-center gap-3 text-[13px] text-white/55">
              <span className="h-px w-10 bg-white/30" aria-hidden />
              {growth.camera.hint}
            </p>
            <FilmStrip im={im} className="mt-9 max-w-[400px]" />
          </div>
          <div data-slot className="relative aspect-[16/10] w-full" aria-hidden />
        </div>

        {/* 카드(뷰파인더) — 처음엔 오른쪽 자리에, 셔터 뒤 화면 전체 */}
        <div
          data-card
          role="button"
          tabIndex={0}
          aria-label={growth.camera.shutter}
          onClick={shoot}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              shoot();
            }
          }}
          className="cam-card absolute cursor-none overflow-hidden rounded-[22px] bg-black shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
          style={{ left: "52%", top: "20%", width: "42%", height: "60%" }}
        >
          <div data-img className="absolute inset-0 will-change-transform">
            <Placeholder fill tone={5} src={im.src} alt={im.alt} sizes="100vw" />
          </div>
          {/* 뷰파인더 HUD + 초점 상자 + 셔터 그립 */}
          <div data-hud className="absolute inset-0">
            <Hud dist={dist} ev={ev} live />
            <FocusBox data-focus />
            <Grip />
          </div>

          {/* 사진 속 — 인물(왼쪽, 오른쪽을 바라봄)이 바라보는 오른쪽 벽 위에 글을 쌓는다. 사진은 받을 때 좌우 반전(slots flop) */}
          <div data-shade className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
            <span className="absolute inset-0 bg-[linear-gradient(to_left,rgba(11,18,32,0.84)_0%,rgba(11,18,32,0.6)_34%,rgba(11,18,32,0.12)_62%,rgba(11,18,32,0)_100%)]" />
            <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,18,32,0.72)_0%,rgba(11,18,32,0.2)_40%,rgba(11,18,32,0)_70%)]" />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-[80rem] px-12 pb-[clamp(2rem,5.5vh,3.5rem)]">
              <div className="ml-auto max-w-[540px]">
                <p data-tag className="kicker flex items-center gap-2 text-white/70 opacity-0">
                  <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
                  {growth.camera.captured}
                </p>
                <h2 className="display mt-4 text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[1.02] text-white" aria-label={lines[2]}>
                  {words.map((w, i) => (
                    <Fragment key={i}>
                      <span data-word className="inline-block opacity-0" aria-hidden>
                        {w}
                      </span>
                      {i < words.length - 1 ? " " : null}
                    </Fragment>
                  ))}
                </h2>
                <div data-caption className="cam-caption mt-6 max-w-[560px] opacity-0">
                  <CaptionMeta />
                  <div className="mt-3 grid text-[15.5px] leading-[1.75] text-white/85">
                    {growth.paragraphs.map((p, i) => (
                      <p key={i} data-para className="sweep-hold [grid-area:1/1] opacity-0">
                        <Accented text={p} accents={growth.camera.accents} />
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-1.5" aria-hidden>
                    {growth.camera.caption.pager.map((n) => (
                      <span key={n} data-pg className="h-[3px] w-7 rounded-full" />
                    ))}
                  </div>
                </div>
                <div data-film className="mt-6 max-w-[400px] opacity-0">
                  <FilmStrip im={im} captured />
                </div>
              </div>
            </div>
          </div>
          <div data-flash className="pointer-events-none absolute inset-0 bg-white opacity-0" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/* ---------- 모바일·감속 모션 ---------- */
function MobileScene({ im, lines }: { im: SiteImage; lines: string[] }) {
  const [shot, setShot] = useState(false);
  const [flash, setFlash] = useState(false);
  const shoot = () => {
    if (shot) return;
    setFlash(true);
    window.setTimeout(() => setShot(true), 120);
    window.setTimeout(() => setFlash(false), 420);
  };
  return (
    <div data-variant="mobile" className="growth-camera relative bg-ink px-5 pb-12 pt-20 text-white sm:px-8 lg:hidden motion-reduce:block motion-reduce:lg:px-12">
      <div className="grain-local absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[80rem]">
        <Reveal>
          <Kicker index="03" label={growth.kicker} invert />
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 text-[15px] font-semibold text-brand">{growth.lead}</p>
        </Reveal>
        <RevealLines as="h2" text={`${lines[0]}\n${lines[1]}`} className="display mt-4 block text-[clamp(2.1rem,7vw,3.4rem)] text-white" />

        <Reveal delay={0.1} className="mt-10">
          <button type="button" onClick={shoot} aria-label={growth.camera.shutter} className={cn("relative block w-full overflow-hidden rounded-[18px] bg-black text-left ring-1 ring-white/10 transition-[border-radius] duration-500", shot && "rounded-[10px]")}>
            <div className="relative aspect-[4/5] sm:aspect-[16/10]">
              <div className={cn("absolute inset-0 transition-[filter,transform] duration-700", shot ? "scale-105 blur-0" : "blur-[3px]")}>
                <Placeholder fill tone={5} src={im.src} alt={im.alt} sizes="100vw" />
              </div>
              {!shot && (
                <div className="cam-card absolute inset-0">
                  <Hud dist="1.2m" ev="EV 0.0" live />
                  <FocusBox />
                  <Grip />
                </div>
              )}
              <div className={cn("absolute inset-0 bg-[linear-gradient(to_top,rgba(11,18,32,0.9)_0%,rgba(11,18,32,0.3)_55%,transparent_100%)] transition-opacity duration-700", shot ? "opacity-100" : "opacity-0")} aria-hidden />
              <div className={cn("absolute inset-x-0 bottom-0 p-5 transition-all duration-700", shot ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}>
                <p className="kicker flex items-center gap-2 text-white/70">
                  <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
                  {growth.camera.captured}
                </p>
                <p className="display mt-3 text-[clamp(1.6rem,6vw,2.6rem)] leading-[1.05] text-white">{lines[2]}</p>
              </div>
              <div className={cn("pointer-events-none absolute inset-0 bg-white transition-opacity", flash ? "opacity-100 duration-75" : "opacity-0 duration-300")} aria-hidden />
            </div>
          </button>
          {!shot && <p className="mt-3 text-center text-[12.5px] text-white/55">{growth.camera.hintMobile}</p>}
          <FilmStrip im={im} captured={shot} className="mt-6" />
        </Reveal>

        <Reveal delay={0.1} className="cam-caption mt-8">
          <CaptionMeta />
          <div className="mt-3 flex flex-col gap-5 text-[15.5px] leading-[1.8] text-white/85">
            {growth.paragraphs.map((p, i) => (
              <p key={i}>
                <Accented text={p} accents={growth.camera.accents} />
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
