"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Plus } from "lucide-react";
import { discover, images, type Creator } from "@/content/landing";
import { requestFilter } from "@/lib/filter-events";
import { cn } from "@/lib/utils";
import { formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const PX_PER_CARD = 200; // 핀 고정 중 카드 한 장을 넘기는 데 쓰는 스크롤 양
const AUTO_DEG_PER_FRAME = 0.16; // 자동 회전 속도 (≈10°/s)
const CARD_RATIO = 0.75; // 카드 4:3
const NAV_H = 76;

/**
 * 크리에이터 3D 링 (imersion.io "Currently on" 구도)
 * - 원근 1600px 장면 안에 카드가 원형으로 서 있고(rotateY(k·step) translateZ(r)), 링은 -r 만큼 물러나 정면 카드가 z=0
 * - variant "pinned": 헤더(header)와 전폭 장면이 함께 화면에 고정되고, 스크롤에 따라 돌며 마지막 카드까지 보여준 뒤 풀린다
 * - variant "auto": 핀 없이 천천히 자동 회전 (매칭 1단계 "찾아보기" 시각물)
 * - 마우스 위치로 살짝 기울고, ←→ 키(핀)나 옆 카드 클릭으로 한 칸씩
 * - 정면 카드를 누르면 onView(없으면 그 국가로 크리에이터 찾기), +로 선택(onToggle이 있을 때)
 * - 뒷면은 같은 카드가 거울처럼 비친다. 앞/뒷면 표시는 각도로 직접 제어(크롬 backface 미적용 대응)
 * 데스크톱 전용 — 모바일은 그리드.
 */
export function CreatorRing({
  list,
  isSelected,
  onToggle,
  onView,
  variant = "pinned",
  cardWidth,
  className,
  header,
}: {
  list: Creator[];
  isSelected?: (id: string) => boolean;
  onToggle?: (id: string) => void;
  onView?: (c: Creator) => void;
  variant?: "pinned" | "auto";
  cardWidth?: number;
  className?: string;
  /** 핀 변형의 상단 내용(단계 카피 등). 없으면 기본 라벨 행 */
  header?: ReactNode;
}) {
  const auto = variant === "auto";
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const n = list.length;
  const step = 360 / Math.max(n, 1);
  const st = useRef({ cur: 0, target: 0, offset: 0, scroll: 0, mx: 0, my: 0, tx: 0, ty: 0, front: 0 });
  const [front, setFront] = useState(0);
  const [dims, setDims] = useState({ w: cardWidth ?? 680, r: 760 });

  // 치수 — 카드 폭 = min(680px, 53vw, 내비 아래 화면 높이에 들어가는 폭) 또는 지정값, 반지름은 이웃 카드가 겹치지 않는 최소 × 1.12
  useEffect(() => {
    const calc = () => {
      const headH = headRef.current?.offsetHeight ?? 0;
      const fitH = (window.innerHeight - NAV_H - headH - 64 - 24) / CARD_RATIO;
      const w = cardWidth ?? Math.round(Math.max(360, Math.min(680, window.innerWidth * 0.53, fitH)));
      const r = Math.round((w / (2 * Math.sin(Math.PI / Math.max(n, 3)))) * 1.12);
      setDims({ w, r });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [n, cardWidth]);

  // 핀 고정(pinned) — 장면이 내비 아래에 닿으면 멈추고, 스크롤 진행도에 따라 첫 카드에서 마지막 카드까지 돈다
  useEffect(() => {
    const scene = sceneRef.current;
    if (auto || !scene || n < 2) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const trigger = ScrollTrigger.create({
        trigger: rootRef.current ?? scene,
        start: `top ${NAV_H}px`,
        end: () => `+=${(n - 1) * PX_PER_CARD}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          st.current.scroll = self.progress * (n - 1) * step;
        },
      });
      // 핀 공간이 문서에 끼어들었으니 다른 섹션의 트리거 위치도 문서 순으로 다시 계산
      const refreshAll = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };
      refreshAll();
      const t = window.setTimeout(refreshAll, 400);
      return () => {
        window.clearTimeout(t);
        trigger.kill();
        requestAnimationFrame(refreshAll);
      };
    });
    return () => mm.revert();
  }, [auto, n, step, dims.w]);

  // 프레임 루프 — 스크롤/자동 회전·키·클릭·마우스를 합쳐 링 각도를 부드럽게 따라간다
  useEffect(() => {
    let raf = 0;
    const s = st.current;
    const loop = () => {
      const ring = ringRef.current;
      const scene = sceneRef.current;
      // 핀 고정 중엔 position: fixed라 offsetParent가 null → 표시 여부는 getClientRects로 판단
      if (ring && scene && scene.getClientRects().length > 0) {
        if (auto && !reduce) s.scroll += AUTO_DEG_PER_FRAME;
        s.target = s.scroll + s.offset;
        s.cur += (s.target - s.cur) * (reduce ? 1 : 0.1);
        s.tx += (s.mx - s.tx) * 0.08;
        s.ty += (s.my - s.ty) * 0.08;
        ring.style.transform = `translate3d(0,0,${-dims.r}px) rotateX(${(-s.ty * 3).toFixed(2)}deg) rotateY(${(-s.cur + s.tx * 8).toFixed(2)}deg) rotate(${(s.tx * 0.6).toFixed(2)}deg)`;
        const cells = ring.children as HTMLCollectionOf<HTMLElement>;
        for (let k = 0; k < cells.length; k++) {
          const rel = ((((k * step - s.cur) % 360) + 540) % 360) - 180;
          const facing = Math.abs(rel) < 90;
          const f = cells[k].children[0] as HTMLElement | undefined;
          const b = cells[k].children[1] as HTMLElement | undefined;
          if (f) f.style.visibility = facing ? "" : "hidden";
          if (b) b.style.visibility = facing ? "hidden" : "";
        }
        const a = ((s.cur % 360) + 360) % 360;
        const idx = n ? Math.round(a / step) % n : 0;
        if (idx !== s.front) {
          s.front = idx;
          setFront(idx);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [dims.r, n, step, reduce, auto]);

  // k번 카드를 정면으로 (가까운 방향으로)
  const rotateTo = useCallback(
    (k: number) => {
      const s = st.current;
      let want = k * step;
      while (want < s.cur - 180) want += 360;
      while (want > s.cur + 180) want -= 360;
      s.offset += want - s.target;
    },
    [step]
  );

  // ←→ 키 — 핀 변형에서 링이 화면에 있을 때만
  useEffect(() => {
    if (auto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const scene = sceneRef.current;
      if (!scene || scene.getClientRects().length === 0) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const r = scene.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      e.preventDefault();
      st.current.offset += e.key === "ArrowRight" ? step : -step;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, auto]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    st.current.mx = e.clientX / window.innerWidth - 0.5;
    st.current.my = e.clientY / window.innerHeight - 0.5;
  };
  const onLeave = () => {
    st.current.mx = 0;
    st.current.my = 0;
  };

  const pick = (c: Creator) => (onView ? onView(c) : requestFilter({ country: c.country }));
  const h = Math.round(dims.w * CARD_RATIO);

  return (
    <div ref={rootRef} className={cn("creator-ring", auto ? "h-full w-full" : "hidden w-full lg:block", className)}>
      {!auto && (
        <div ref={headRef} className="mx-auto w-full max-w-[80rem] px-12">
          {header ?? (
            <div className="flex items-center justify-between pb-6">
              <span className="kicker flex items-center gap-4 text-[11px] text-ink/60">
                <span aria-hidden className="h-px w-12 bg-ink/40" />
                {discover.ring.label}
              </span>
              <span className="text-[12.5px] text-muted">{discover.ring.hint}</span>
            </div>
          )}
        </div>
      )}

      {/* 장면 — 화면 전폭, 가장자리에서 잘린다(imersion처럼 옆 카드가 바깥으로 이어짐) */}
      <div
        ref={sceneRef}
        className={cn("ring-scene relative overflow-hidden", auto ? "h-full w-full" : "w-full")}
        style={auto ? undefined : { height: h + 64 }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div
          ref={ringRef}
          className="ring-body absolute left-1/2 top-1/2"
          style={{ width: dims.w, height: h, marginLeft: -dims.w / 2, marginTop: -h / 2 }}
        >
          {list.map((c, k) => (
            <div
              key={c.id}
              className="ring-cell absolute inset-0"
              style={{ transform: `rotateY(${k * step}deg) translateZ(${dims.r}px)` }}
            >
              <Face
                creator={c}
                index={k}
                compact={auto}
                selected={isSelected?.(c.id) ?? false}
                onToggle={onToggle ? () => onToggle(c.id) : undefined}
                onClick={() => (k === st.current.front ? pick(c) : rotateTo(k))}
              />
              <Face
                creator={c}
                index={k}
                back
                compact={auto}
                selected={isSelected?.(c.id) ?? false}
                onClick={() => rotateTo(k)}
              />
            </div>
          ))}
        </div>

        {/* 우측 세로 인덱스 — 정면 카드 / 전체 (핀 변형) */}
        {!auto && (
          <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 xl:right-10">
            <span className="kicker text-[10px] text-ink/60" style={{ writingMode: "vertical-rl" }}>
              {String(front + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="h-10 w-px bg-ink/30" />
            <span className="kicker text-[10px] text-ink/60" style={{ writingMode: "vertical-rl" }}>
              {String(n).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Face({
  creator,
  index,
  back,
  compact,
  selected,
  onToggle,
  onClick,
}: {
  creator: Creator;
  index: number;
  back?: boolean;
  compact?: boolean;
  selected: boolean;
  onToggle?: () => void;
  onClick: () => void;
}) {
  const im = images[creator.image];
  return (
    <div
      className={cn(
        "ring-face absolute inset-0 overflow-hidden rounded-[6px] bg-mist",
        back && "ring-face--back",
        selected && "ring-2 ring-brand"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        tabIndex={back ? -1 : 0}
        aria-hidden={back || undefined}
        className="absolute inset-0 block h-full w-full cursor-pointer text-left"
        aria-label={`${creator.name} ${discover.card.view}`}
      >
        <Placeholder fill tone={creator.tone} src={im.src} alt={im.alt} sizes={compact ? "360px" : "700px"} />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" aria-hidden />
        <span className={cn("absolute left-4 top-4 rounded-full bg-white/92 font-semibold text-ink", compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]")}>
          {creator.country} · {creator.city}
        </span>
        {!compact && (
          <span className="absolute right-4 top-4 rounded-full bg-ink/75 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white">
            {discover.card.example}
          </span>
        )}
        <span className={cn("absolute text-white", compact ? "bottom-3 left-3 right-3" : "bottom-5 left-5 right-24")}>
          {!compact && <span className="kicker block text-[10px] text-white/70">{String(index + 1).padStart(2, "0")}</span>}
          <span className={cn("block font-extrabold tracking-tight", compact ? "text-[14px]" : "mt-1.5 text-[clamp(1.15rem,1.7vw,1.5rem)]")}>
            {creator.name}
          </span>
          <span className={cn("block text-white/85", compact ? "text-[11px]" : "mt-1 text-[12.5px]")}>
            {creator.platform} · {formatFollowers(creator.followers)}
          </span>
          {!compact && <span className="mt-1.5 block text-[12px] text-white/70">{creator.tags.map((t) => `#${t}`).join("  ")}</span>}
        </span>
      </button>
      {!back && onToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-pressed={selected}
          aria-label={`${creator.name} ${selected ? discover.card.deselect : discover.card.select}`}
          className={cn(
            "absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            selected ? "bg-brand text-white" : "bg-white/90 text-ink hover:bg-white"
          )}
        >
          {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
