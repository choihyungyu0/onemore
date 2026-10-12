"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { discover, images, type Creator } from "@/content/landing";
import { cn } from "@/lib/utils";
import { formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";
import { EASE } from "./reveal";

/**
 * 크리에이터 부채꼴 (landonorris.com "What's up on socials" 실측)
 * - 중앙 카드가 앞, 양옆으로 갈수록 7°씩 더 기울고 0.93배씩 작아지며 아래로 처진다
 *   (가로 130·261·356px, 세로 15·47·87px — 0.5 단위 보간으로 짝수 장도 대응)
 * - 마우스 위치에 따라 전체가 살짝 기울고(시차), 카드에 올리면 8% 커지며 떠오른다
 * - 화면에 들어올 때 가운데 더미에서 펼쳐진다. 카드를 누르면 프로필 상세, +로 선택
 * 데스크톱 전용 — 모바일은 그리드.
 */
const X = [0, 65, 130, 196, 261, 309, 356, 395, 430];
const Y = [0, 4, 15, 30, 47, 66, 87, 110, 135];
const at = (t: number[], u: number) => {
  const i = Math.min(t.length - 1, Math.floor(u));
  const j = Math.min(t.length - 1, i + 1);
  return t[i] + (t[j] - t[i]) * (u - i);
};
function slot(k: number, n: number) {
  const u = Math.abs(k) * 2;
  const squeeze = Math.min(1, 7 / n); // 8장 이상이면 좌우 간격을 줄여 컨테이너 안에 담는다
  return {
    x: Math.sign(k) * at(X, u) * squeeze,
    y: at(Y, u) * squeeze,
    r: 7 * k,
    s: Math.pow(0.93, Math.abs(k)),
    z: 10 - Math.round(Math.abs(k) * 2),
  };
}

export function CreatorFan({
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
  const root = useRef<HTMLDivElement>(null);

  // 마우스 시차 — 루트에 --mx/--my를 두고 카드가 상속받는다
  useEffect(() => {
    if (reduce) return;
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.setProperty("--mx", cx.toFixed(3));
      el.style.setProperty("--my", cy.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const n = list.length;
  const center = (n - 1) / 2;

  return (
    <div ref={root} className="creator-fan relative mx-auto hidden h-[clamp(390px,56vh,480px)] w-full lg:block">
      {list.map((c, i) => {
        const k = i - center;
        const p = slot(k, n);
        const im = images[c.image];
        const selected = isSelected(c.id);
        return (
          <motion.div
            key={c.id}
            className="fan-card absolute left-1/2 top-2 w-[clamp(200px,19vw,250px)]"
            style={
              {
                zIndex: p.z,
                "--fx": `${p.x}px`,
                "--fy": `${p.y}px`,
                "--fr": `${p.r}deg`,
                "--fs": p.s,
              } as CSSProperties
            }
            initial={reduce ? false : ({ opacity: 0, "--spread": 0 } as never)}
            whileInView={{ opacity: 1, "--spread": 1 } as never}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 + Math.abs(k) * 0.07 }}
          >
            <div className={cn("fan-inner relative overflow-hidden rounded-[28px] bg-white shadow-lift ring-1 ring-ink/[0.06]", selected && "ring-2 ring-brand")}>
              <button
                type="button"
                onClick={() => onView(c)}
                className="relative block w-full text-left"
                aria-label={`${c.name} ${discover.card.view}`}
              >
                <Placeholder ratio="4/5" tone={c.tone} src={im.src} alt={im.alt} sizes="260px" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" aria-hidden />
                <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-ink">
                  {c.country} · {c.city}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-ink/75 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                  {discover.card.example}
                </span>
                <span className="absolute bottom-4 left-4 right-14 text-white">
                  <span className="kicker block text-[10px] text-white/70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block text-[17px] font-extrabold tracking-tight">{c.name}</span>
                  <span className="mt-0.5 block text-[11.5px] text-white/85">
                    {c.platform} · {formatFollowers(c.followers)}
                  </span>
                  <span className="mt-1 block text-[11px] text-white/70">{c.tags.map((t) => `#${t}`).join(" ")}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(c.id);
                }}
                aria-pressed={selected}
                aria-label={`${c.name} ${selected ? discover.card.deselect : discover.card.select}`}
                className={cn(
                  "absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  selected ? "bg-brand text-white" : "bg-white/90 text-ink hover:bg-white"
                )}
              >
                {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
