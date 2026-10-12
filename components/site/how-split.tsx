"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { how, images } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Contours } from "./contours";
import { Lines } from "./reveal";
import { Kicker } from "./section";

/**
 * 매칭 방식 오프너 — landonorris.com "ON TRACK / OFF TRACK" 실측 재현
 * - 등고선 크림 배경 위, 양 끝에서 안쪽을 바라보는 두 인물(누끼) + 가운데 두 열(오른 정렬 / 왼 정렬)
 * - 처음 화면에 들어올 때: 인물은 바깥(−65%)에서 미끄러져 들어오고, 두 열은 ±47px에서 모인다 (1.2s expo)
 * - 섹션에 마우스를 올리면 인물은 2.3vw 바깥으로, 두 열은 0.77vw씩 벌어진다 (노리스 호버 상태)
 * - 왼쪽 굵은 단어 위에 형광펜 낙서가 그려진다 (노리스의 Rive "ON" 스크리블 → SVG 선 그리기)
 * - 아래 단계(링·스크럽)는 그대로 이어진다
 */
export function HowSplit() {
  const root = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const s = how.split;
  const left = images["split-brand"];
  const right = images["split-creator"];

  return (
    <section
      ref={root}
      id="how"
      className={cn("how-split relative isolate scroll-mt-20 overflow-hidden bg-cream", on && "in-view")}
      aria-label={how.kicker}
    >
      <Contours className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 text-ink/[0.08]" />

      {/* 섹션 번호 — 가운데 위 */}
      <div className="absolute left-1/2 top-[calc(64px+1.25rem)] z-20 -translate-x-1/2 lg:top-[calc(76px+1.5rem)]">
        <Kicker index="02" label={how.kicker} />
      </div>

      {/* 두 인물 — 바닥에 붙고, 등은 화면 밖으로 살짝 잘린다 */}
      <div className="split-fig split-fig--l pointer-events-none absolute bottom-0 left-[-14vw] z-0 h-[34vh] lg:left-[-6vw] lg:h-[min(86vh,40vw)]">
        <img src={left.src} alt={left.alt} className="h-full w-auto max-w-none" loading="lazy" decoding="async" />
      </div>
      <div className="split-fig split-fig--r pointer-events-none absolute bottom-0 right-[-14vw] z-0 h-[34vh] lg:right-[-6vw] lg:h-[min(86vh,40vw)]">
        <img src={right.src} alt={right.alt} className="h-full w-auto max-w-none" loading="lazy" decoding="async" />
      </div>

      {/* 가운데 두 열 */}
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-5 pb-[36vh] pt-32 lg:px-12 lg:pb-0 lg:pt-0">
        <div className="flex flex-col items-center gap-10 text-center lg:flex-row lg:items-start lg:gap-[3.5vw] lg:text-left">
          <Col side="l" line1={s.left.line1} line2={s.left.line2} description={s.left.description} cta={s.left.cta} scribble />
          <Col side="r" line1={s.right.line1} line2={s.right.line2} description={s.right.description} cta={s.right.cta} />
        </div>
      </div>
    </section>
  );
}

function Col({
  side,
  line1,
  line2,
  description,
  cta,
  scribble,
}: {
  side: "l" | "r";
  line1: string;
  line2: string;
  description: string;
  cta: { label: string; href: string };
  scribble?: boolean;
}) {
  const l = side === "l";
  return (
    <div className={cn("split-col flex flex-col items-center", l ? "split-col--l lg:items-end lg:text-right" : "split-col--r lg:items-start lg:text-left")}>
      <h2 className="text-[clamp(2.6rem,5.4vw,6.75rem)] leading-[0.9] tracking-[-0.035em] text-ink">
        <span className="display-light block">{line1}</span>
        <span className="display relative block">
          {line2}
          {scribble && (
            <svg className="split-scribble pointer-events-none absolute -inset-x-[10%] -inset-y-[16%] h-[132%] w-[120%] text-brand" viewBox="0 0 320 130" fill="none" aria-hidden>
              <path
                d="M 24 78 C 52 128, 262 126, 296 72 C 316 38, 236 10, 122 16 C 56 20, 10 44, 26 80 C 42 110, 196 118, 284 92"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
              />
            </svg>
          )}
        </span>
      </h2>
      <p className="mt-[1.1em] max-w-[21rem] text-[clamp(14px,1.15vw,21px)] leading-[1.4] text-ink/80">
        <Lines text={description} />
      </p>
      <a
        href={cta.href}
        aria-label={cta.label}
        title={cta.label}
        className="split-btn mt-5 inline-flex h-[clamp(40px,3.4vw,62px)] w-[clamp(40px,3.4vw,62px)] items-center justify-center rounded-[7px] bg-brand text-white transition-transform duration-300 hover:scale-105"
      >
        {l ? <ArrowDownRight className="h-[45%] w-[45%]" strokeWidth={2.25} /> : <ArrowUpRight className="h-[45%] w-[45%]" strokeWidth={2.25} />}
      </a>
    </div>
  );
}
