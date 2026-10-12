"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleRefresh } from "@/lib/scroll-refresh";
import { useLenis } from "lenis/react";
import { growth, images } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";
import { Lines, Reveal, RevealLines } from "./reveal";
import { Kicker } from "./section";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 함께 성장하기 — "카메라로 찍는 순간, 그 사진 속으로 들어간다"
 * 데스크톱(핀 고정, 스크롤 260%):
 *  1) 뷰파인더: 오른쪽 카드에 사진이 흐릿하게 보이고 스크롤할수록 초점이 맞는다. 초점 상자는 커서를 따라가고
 *     노출값·거리 표시가 바뀐다. 왼쪽엔 "유명해진 다음에만 만나지 않습니다."
 *  2) 셔터: 플래시가 터지며 사진이 잠깐 흑백으로 멈추고, 카드가 화면 전체로 빨려 들어가듯 커진다
 *  3) 사진 속: 천천히 줌인(켄 번즈)되는 사진 위로 "시작하는 순간부터 함께합니다."와 본문이 떠오른다
 *  셔터 버튼이나 사진을 누르면 셔터 지점까지 스크롤이 자동으로 간다.
 * 모바일·감속 모션: 정적 레이아웃 (뷰파인더 카드 → 탭하면 플래시 후 사진 속 문구)
 */
const SCROLL = 2.6; // 핀 길이 (화면 높이 배수)
const SHUTTER_AT = 0.44; // 셔터가 터지는 진행도

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
function Hud({ dist, ev, className }: { dist: string; ev: string; className?: string }) {
  const h = growth.camera.hud;
  return (
    <div className={cn("cam-hud pointer-events-none absolute inset-0 text-white", className)} aria-hidden>
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
      {/* 상단 */}
      <span className="absolute left-7 top-7 flex items-center gap-2 font-display text-[11px] font-bold tracking-[0.18em]">
        <span className="cam-rec h-2 w-2 rounded-full bg-brand" />
        {h.rec}
        <span className="ml-2 text-white/60">{h.mode}</span>
      </span>
      <span className="absolute right-7 top-7 flex items-center gap-2 font-display text-[11px] font-bold tracking-[0.18em] text-white/70">
        {h.af}
        <span className="relative ml-1 inline-block h-[10px] w-[20px] rounded-[2px] border border-white/60 after:absolute after:inset-[2px] after:right-[5px] after:rounded-[1px] after:bg-white/80" />
      </span>
      {/* 하단 */}
      <span className="absolute bottom-7 left-7 flex gap-4 font-display text-[11px] font-bold tracking-[0.14em] text-white/75">
        {h.readouts.map((r) => (
          <span key={r}>{r}</span>
        ))}
        <span className="text-brand">{ev}</span>
      </span>
      <span className="absolute bottom-7 right-7 font-display text-[11px] font-bold tracking-[0.14em] text-white/75">{dist}</span>
    </div>
  );
}

/* ---------- 데스크톱 ---------- */
function DesktopScene({ im, lines }: { im: { src: string; alt: string }; lines: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const stRef = useRef<ScrollTrigger | null>(null);
  const [dist, setDist] = useState("1.2m");
  const [ev, setEv] = useState("EV 0.0");

  // 초점 상자 — 커서를 따라간다 (카드 안에서만)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const box = el.querySelector<HTMLElement>("[data-focus]");
    if (!card || !box) return;
    let tx = 0.5;
    let ty = 0.5;
    let cx = 0.5;
    let cy = 0.5;
    let raf = 0;
    let lastDist = "";
    const loop = () => {
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
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      tx = Math.min(0.92, Math.max(0.08, (e.clientX - r.left) / r.width));
      ty = Math.min(0.9, Math.max(0.1, (e.clientY - r.top) / r.height));
    };
    const onLeave = () => {
      tx = 0.5;
      ty = 0.5;
    };
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
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
      const textB = q("[data-text-b]");
      const paras = gsap.utils.toArray<HTMLElement>("[data-para]", el);
      const tag = q("[data-tag]");

      const rect = () => {
        const s = slot.getBoundingClientRect();
        const g = stage.getBoundingClientRect();
        return { left: s.left - g.left, top: s.top - g.top, width: s.width, height: s.height };
      };

      gsap.set(textB, { autoAlpha: 0, y: 48 });
      gsap.set(paras, { autoAlpha: 0, y: 28 });
      gsap.set(shade, { autoAlpha: 0 });
      gsap.set(flash, { autoAlpha: 0 });
      gsap.set(tag, { autoAlpha: 0, y: 10 });

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
      // 3) 사진 속: 켄 번즈 + 문구
      tl.fromTo(img, { scale: 1 }, { scale: 1.14, duration: 1 - (SHUTTER_AT + 0.18) }, SHUTTER_AT + 0.18);
      tl.to(shade, { autoAlpha: 1, duration: 0.1 }, SHUTTER_AT + 0.12);
      tl.to(tag, { autoAlpha: 1, y: 0, duration: 0.06 }, SHUTTER_AT + 0.18);
      tl.to(textB, { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" }, SHUTTER_AT + 0.2);
      tl.to(paras, { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.06, ease: "power2.out" }, SHUTTER_AT + 0.3);
      tl.to({}, { duration: 0.1 });

      scheduleRefresh();
      return () => {
        stRef.current = null;
      };
    });
    return () => mm.revert();
  }, []);

  // 셔터 누르기 — 셔터 지점 너머로 부드럽게 스크롤
  const shoot = () => {
    const st = stRef.current;
    if (!st) return;
    const target = st.start + (st.end - st.start) * (SHUTTER_AT + 0.34);
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div ref={root} data-variant="desktop" className="growth-camera hidden lg:block motion-reduce:hidden">
      <div data-stage className="relative h-screen overflow-hidden bg-ink text-white">
        <div className="grain-local absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-brand/15 blur-3xl" aria-hidden />

        {/* 1) 왼쪽 글 + 오른쪽 카드 자리 */}
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
          {/* 뷰파인더 HUD + 초점 상자 + 셔터 버튼 */}
          <div data-hud className="absolute inset-0">
            <Hud dist={dist} ev={ev} />
            <span data-focus className="cam-focus pointer-events-none absolute" style={{ left: "50%", top: "50%" }} aria-hidden>
              <span className="cam-corner left-0 top-0 border-l border-t" />
              <span className="cam-corner right-0 top-0 border-r border-t" />
              <span className="cam-corner bottom-0 left-0 border-b border-l" />
              <span className="cam-corner bottom-0 right-0 border-b border-r" />
            </span>
            <span className="cam-shutter absolute bottom-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/90" aria-hidden>
              <span className="h-8 w-8 rounded-full bg-white/90 transition-transform duration-300" />
            </span>
          </div>
          {/* 사진 속 문구 */}
          <div data-shade className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(11,18,32,0.88)_0%,rgba(11,18,32,0.35)_45%,rgba(11,18,32,0.1)_100%)]" aria-hidden />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto grid w-full max-w-[80rem] grid-cols-[1.1fr_0.9fr] items-end gap-16 px-12 pb-[clamp(2.5rem,8vh,5rem)]">
              <div>
                <p data-tag className="kicker flex items-center gap-2 text-white/70">
                  <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
                  {growth.camera.captured}
                </p>
                <h2 data-text-b className="display mt-5 text-[clamp(2.4rem,5.4vw,5.2rem)] leading-[1.02] text-white">
                  {lines[2]}
                </h2>
              </div>
              <div className="flex flex-col gap-5 text-[15.5px] leading-[1.75] text-white/80">
                {growth.paragraphs.map((p, i) => (
                  <p key={i} data-para>
                    <Lines text={p} />
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div data-flash className="pointer-events-none absolute inset-0 bg-white" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/* ---------- 모바일·감속 모션 ---------- */
function MobileScene({ im, lines }: { im: { src: string; alt: string }; lines: string[] }) {
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
                <>
                  <Hud dist="1.2m" ev="EV 0.0" />
                  <span className="cam-focus pointer-events-none absolute" style={{ left: "50%", top: "50%" }} aria-hidden>
                    <span className="cam-corner left-0 top-0 border-l border-t" />
                    <span className="cam-corner right-0 top-0 border-r border-t" />
                    <span className="cam-corner bottom-0 left-0 border-b border-l" />
                    <span className="cam-corner bottom-0 right-0 border-b border-r" />
                  </span>
                  <span className="cam-shutter absolute bottom-5 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/90" aria-hidden>
                    <span className="h-8 w-8 rounded-full bg-white/90" />
                  </span>
                </>
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
        </Reveal>

        <div className="mt-10 flex flex-col gap-6 text-[16px] leading-[1.8] text-white/70">
          {growth.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.08}>
              <p>
                <Lines text={p} />
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
