"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Plus } from "lucide-react";
import { discover, images, type Creator } from "@/content/landing";
import { cn } from "@/lib/utils";
import { formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const PX_PER_CARD = 280; // 핀 고정 중 카드 한 장을 넘기는 데 쓰는 스크롤 양
const CARD_RATIO = 0.75; // 카드 4:3
const NAV_H = 76;

/**
 * 크리에이터 3D 링 (imersion.io "Currently on" 구도)
 * - 원근 1600px 장면 안에 카드가 원형으로 서 있고(rotateY(k·step) translateZ(r)), 링은 -r 만큼 물러나 정면 카드가 z=0
 * - 장면이 화면에 닿으면 고정(pin)되고, 스크롤에 따라 링이 돌며 마지막 카드까지 보여준 뒤 풀린다
 * - 마우스 위치로 살짝 기울고, ←→ 키나 옆 카드 클릭으로 한 칸씩
 * - 정면 카드를 누르면 프로필 상세, 카드의 +로 선택. 뒷면은 같은 카드가 거울처럼 비친다(backface)
 * 데스크톱 전용 — 모바일은 그리드.
 */
export function CreatorRing({
  list,
  isSelected,
  onToggle,
  onView,
}: {
  list: Creator[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  onView: (c: Creator) => void;
}) {
  const reduce = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const n = list.length;
  const step = 360 / Math.max(n, 1);
  const st = useRef({ cur: 0, target: 0, offset: 0, scroll: 0, mx: 0, my: 0, tx: 0, ty: 0, front: 0 });
  const [front, setFront] = useState(0);
  const [dims, setDims] = useState({ w: 680, r: 760 });

  // 치수 — 카드 폭 = min(680px, 53vw, 내비 아래 화면 높이에 들어가는 폭), 반지름은 이웃 카드가 겹치지 않는 최소 × 1.12
  useEffect(() => {
    const calc = () => {
      const fitH = (window.innerHeight - NAV_H - 96 - 24) / CARD_RATIO;
      const w = Math.round(Math.max(360, Math.min(680, window.innerWidth * 0.53, fitH)));
      const r = Math.round((w / (2 * Math.sin(Math.PI / Math.max(n, 3)))) * 1.12);
      setDims({ w, r });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [n]);

  // 핀 고정 — 장면이 내비 아래에 닿으면 멈추고, 스크롤 진행도에 따라 첫 카드에서 마지막 카드까지 돈다
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || n < 2) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const trigger = ScrollTrigger.create({
        trigger: scene,
        start: `top ${NAV_H}px`,
        end: () => `+=${(n - 1) * PX_PER_CARD}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          st.current.scroll = self.progress * (n - 1) * step;
        },
      });
      // 핀 공간이 문서에 끼어들었으니 다른 섹션(매칭 4단계 등)의 트리거 위치도 다시 계산.
      // 재계산은 생성 순이 아니라 문서 순으로 해야 뒤 섹션이 앞 섹션의 핀 공간을 반영한다 → sort 먼저
      const refreshAll = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };
      refreshAll();
      const t = window.setTimeout(refreshAll, 400);
      return () => {
        window.clearTimeout(t);
        trigger.kill();
        // 핀 공간이 사라지니 뒤 섹션 위치도 다시 계산
        requestAnimationFrame(refreshAll);
      };
    });
    return () => mm.revert();
  }, [n, step, dims.w]);

  // 프레임 루프 — 스크롤·키·클릭·마우스를 합쳐 링 각도를 부드럽게 따라간다
  useEffect(() => {
    let raf = 0;
    const s = st.current;
    const loop = () => {
      const ring = ringRef.current;
      const scene = sceneRef.current;
      // 핀 고정 중엔 position: fixed라 offsetParent가 null → 표시 여부는 getClientRects로 판단
      if (ring && scene && scene.getClientRects().length > 0) {
        s.target = s.scroll + s.offset;
        s.cur += (s.target - s.cur) * (reduce ? 1 : 0.1);
        s.tx += (s.mx - s.tx) * 0.08;
        s.ty += (s.my - s.ty) * 0.08;
        ring.style.transform = `translate3d(0,0,${-dims.r}px) rotateX(${(-s.ty * 3).toFixed(2)}deg) rotateY(${(-s.cur + s.tx * 8).toFixed(2)}deg) rotate(${(s.tx * 0.6).toFixed(2)}deg)`;
        // 앞/뒷면 표시는 각도로 직접 결정 (크롬이 backface-visibility를 합성 레이어에서 무시하는 경우 대비)
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
  }, [dims.r, n, step, reduce]);

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

  // ←→ 키 — 링이 화면에 있을 때만
  useEffect(() => {
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
  }, [step]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    st.current.mx = e.clientX / window.innerWidth - 0.5;
    st.current.my = e.clientY / window.innerHeight - 0.5;
  };
  const onLeave = () => {
    st.current.mx = 0;
    st.current.my = 0;
  };

  const h = Math.round(dims.w * CARD_RATIO);

  return (
    <div className="creator-ring hidden lg:block">
      <div className="flex items-center justify-between">
        <span className="kicker flex items-center gap-4 text-[11px] text-ink/60">
          <span aria-hidden className="h-px w-12 bg-ink/40" />
          {discover.ring.label}
        </span>
        <span className="text-[12.5px] text-muted">{discover.ring.hint}</span>
      </div>

      {/* 장면 — 섹션 여백까지 펼치고 가장자리에서 잘린다(imersion처럼 옆 카드가 화면 밖으로 이어짐). 가로 스크롤은 생기지 않게 */}
      <div
        ref={sceneRef}
        className="ring-scene relative mt-6 overflow-hidden lg:-mx-12"
        style={{ height: h + 96 }}
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
                selected={isSelected(c.id)}
                onToggle={() => onToggle(c.id)}
                onClick={() => (k === st.current.front ? onView(c) : rotateTo(k))}
              />
              <Face
                creator={c}
                index={k}
                back
                selected={isSelected(c.id)}
                onToggle={() => onToggle(c.id)}
                onClick={() => rotateTo(k)}
              />
            </div>
          ))}
        </div>

        {/* 우측 세로 인덱스 — 정면 카드 / 전체 */}
        <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 xl:right-10">
          <span className="kicker text-[10px] text-ink/60" style={{ writingMode: "vertical-rl" }}>
            {String(front + 1).padStart(2, "0")}
          </span>
          <span aria-hidden className="h-10 w-px bg-ink/30" />
          <span className="kicker text-[10px] text-ink/60" style={{ writingMode: "vertical-rl" }}>
            {String(n).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

function Face({
  creator,
  index,
  back,
  selected,
  onToggle,
  onClick,
}: {
  creator: Creator;
  index: number;
  back?: boolean;
  selected: boolean;
  onToggle: () => void;
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
        <Placeholder fill tone={creator.tone} src={im.src} alt={im.alt} sizes="700px" />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" aria-hidden />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-ink">
          {creator.country} · {creator.city}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-ink/75 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white">
          {discover.card.example}
        </span>
        <span className="absolute bottom-5 left-5 right-24 text-white">
          <span className="kicker block text-[10px] text-white/70">{String(index + 1).padStart(2, "0")}</span>
          <span className="mt-1.5 block text-[clamp(1.15rem,1.7vw,1.5rem)] font-extrabold tracking-tight">
            {creator.name}
          </span>
          <span className="mt-1 block text-[12.5px] text-white/85">
            {creator.platform} · {formatFollowers(creator.followers)}
          </span>
          <span className="mt-1.5 block text-[12px] text-white/70">{creator.tags.map((t) => `#${t}`).join("  ")}</span>
        </span>
      </button>
      {!back && (
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
