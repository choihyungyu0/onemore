"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleRefresh } from "@/lib/scroll-refresh";
import { ChevronRight } from "lucide-react";
import { finale } from "@/content/landing";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./button";
import { FinaleHands } from "./finale-hands";
import { Magnetic } from "./magnetic";
import { Reveal, SweepLines } from "./reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * 마지막 제안 — 코타 "Let's get started!" 구도 + 인터랙션
 * - 노트북을 든 두 손이 스크롤로 떠오르고, 마우스를 움직이면 노트북이 살짝 기울어 따라온다(±4°)
 * - 커서를 따라 코랄 빛이 바닥에 번진다
 * - 제목은 스크롤에 따라 단어가 하나씩 채워지고, 핵심 구절(finale.titleAccent)은 코랄로 물든다
 * - 설명은 줄마다 채워지고, 태그라인 첫 줄엔 형광펜
 */
export function Finale() {
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);

  // 커서 — 섹션 안 좌표(%)와 기울기
  const px = useMotionValue(50);
  const py = useMotionValue(40);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const sx = useSpring(tx, { stiffness: 60, damping: 18 });
  const sy = useSpring(ty, { stiffness: 60, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-4, 4]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [3, -3]);
  const spot = useTransform([px, py], ([x, y]) => `radial-gradient(520px circle at ${x}% ${y}%, rgba(255,90,60,0.18), transparent 70%)`);

  useEffect(() => {
    const el = root.current;
    if (!el || reduce) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      px.set(x * 100);
      py.set(y * 100);
      tx.set(x - 0.5);
      ty.set(y - 0.5);
    };
    const onLeave = () => {
      tx.set(0);
      ty.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, px, py, tx, ty]);

  // 제목 단어 채우기 (스크롤 스크럽) + 설명 채우기 게이트
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const brand = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#FF5A3C";
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", el);
      gsap.set(words, { color: "rgba(11,18,32,0.14)" });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 48%", scrub: 0.5 },
      });
      words.forEach((w, i) => tl.to(w, { color: w.dataset.accent ? brand : "#0b1220", duration: 0.25 }, (i / words.length) * 0.8));
      scheduleRefresh();
    });
    return () => {
      io.disconnect();
      mm.revert();
    };
  }, []);

  const lines = finale.title.split("\n");
  const grouped = lines.length > 2 ? [lines[0], lines.slice(1).join(" ")] : lines;
  const accent = (finale.titleAccent ?? "").split(/\s+/).filter(Boolean);
  const wordLines = grouped.map((ln) => ln.split(/\s+/).filter(Boolean));
  const isAccent = (li: number, wi: number) => {
    if (!accent.length) return false;
    const ws = wordLines[li];
    for (let s = Math.max(0, wi - accent.length + 1); s <= wi; s++) {
      const seg = ws.slice(s, s + accent.length);
      if (seg.length === accent.length && seg.every((w, k) => w === accent[k])) return true;
    }
    return false;
  };
  const [tag1, tag2] = finale.tagline.split("\n");

  return (
    <section ref={root} className="finale relative overflow-hidden bg-[linear-gradient(180deg,#f7f6f3_0%,#ececef_100%)] pt-20 text-ink lg:pt-28">
      {/* 커서를 따라 번지는 코랄 빛 */}
      {!reduce && <motion.div className="pointer-events-none absolute inset-0" style={{ backgroundImage: spot }} aria-hidden />}

      <div className="relative mx-auto max-w-[1500px]">
        {/* 손 + 노트북 — 마우스를 따라 살짝 기운다. 모바일은 넓게 잘라 가운데만 */}
        <div className="relative mx-auto w-[150%] -translate-x-[16.7%] sm:w-[120%] sm:-translate-x-[8.3%] lg:w-full lg:translate-x-0" style={{ perspective: 1600 }}>
          <motion.div style={reduce ? undefined : { rotateX, rotateY, transformOrigin: "50% 80%" }}>
            <FinaleHands src="/images/hands-laptop-cut-v2.webp" />
          </motion.div>
        </div>

        {/* 제목·버튼 — 노트북 받침에 걸친다 */}
        <div className={cn("sweep-hold relative z-10 -mt-[22%] px-5 text-center sm:-mt-[17%] lg:-mt-[13.5%]", inView && "in-view")}>
          <h2
            ref={titleRef}
            className="display-md block text-[clamp(2rem,5.2vw,5.4rem)] leading-[1.04] tracking-[-0.04em] text-ink [text-shadow:0_0_28px_rgba(255,255,255,0.9),0_0_6px_rgba(255,255,255,0.8)]"
            aria-label={finale.title.replace(/\n/g, " ")}
          >
            {wordLines.map((ws, li) => (
              <Fragment key={li}>
                {ws.map((w, wi) => (
                  <Fragment key={`${li}-${wi}`}>
                    <span data-word data-accent={isAccent(li, wi) ? "1" : undefined} className={cn("inline-block", isAccent(li, wi) && "finale-accent")} aria-hidden>
                      {w}
                    </span>
                    {wi < ws.length - 1 ? " " : null}
                  </Fragment>
                ))}
                {li < wordLines.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.7] md:text-[17px]">
            <SweepLines text={finale.description} from={0.2} step={0.25} />
          </p>
          <Reveal delay={0.18}>
            <p className="mt-4 text-[15px] font-bold tracking-tight text-ink md:text-[16px]">
              <span className="marker">{tag1}</span>
              {tag2 && (
                <>
                  <br />
                  {tag2}
                </>
              )}
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-col justify-center gap-3 pb-24 sm:flex-row lg:pb-32">
            <Magnetic>
              <ButtonLink href={finale.primary.href} variant="solid" size="lg">
                {finale.primary.label}
                <ChevronRight className="h-4 w-4" />
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href={finale.secondary.href} variant="ghost" size="lg">
                {finale.secondary.label}
              </ButtonLink>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
