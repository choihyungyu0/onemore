"use client";

import { useRef, type MouseEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { discover, images, type Creator } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";

export function formatFollowers(n: number) {
  return discover.card.followers.replace("{n}", n.toLocaleString("ko-KR"));
}

/** 인스타 피드 썸네일 느낌의 세로형 프로필 카드 (4:5 고정, cover) */
export function CreatorCard({
  creator,
  selected,
  onToggle,
  onView,
  className,
}: {
  creator: Creator;
  selected: boolean;
  onToggle: () => void;
  onView: () => void;
  className?: string;
}) {
  const im = images[creator.image];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // 커서 위치를 따라 살짝 기우는 3D 틸트 (마우스 환경에서만)
  function onMove(e: MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) translateY(-6px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] bg-white shadow-card ring-1 ring-ink/[0.06] transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-lift",
        selected && "ring-2 ring-brand",
        className
      )}
    >
      <button
        type="button"
        onClick={onView}
        className="relative block w-full text-left"
        aria-label={`${creator.name} ${discover.card.view}`}
      >
        <div className="overflow-hidden">
          <Placeholder
            ratio="4/5"
            tone={creator.tone}
            src={im.src}
            alt={im.alt}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 220px"
            className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
        </div>
        {/* 국가 태그 */}
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-ink backdrop-blur">
          {creator.country} · {creator.city}
        </span>
        {/* 예시 표시 */}
        <span className="absolute right-3 top-3 rounded-full bg-ink/75 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
          {discover.card.example}
        </span>
        {selected && (
          <span className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-lift">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h3 className="text-[15px] font-bold leading-tight tracking-tight">{creator.name}</h3>
        <p className="tnum mt-1 text-[12.5px] text-muted">
          {creator.platform} · {formatFollowers(creator.followers)}
        </p>
        <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="해시태그">
          {creator.tags.map((t) => (
            <li
              key={t}
              className="rounded-full bg-mist px-2 py-0.5 text-[11.5px] font-medium text-ink/70"
            >
              #{t}
            </li>
          ))}
        </ul>
        <p className="mt-3 line-clamp-2 text-[13.5px] leading-[1.55] text-ink/80">
          “{creator.bio}”
        </p>

        <div className="mt-auto flex gap-2 pt-4">
          <button
            type="button"
            onClick={onView}
            className="h-9 flex-1 rounded-full text-[13px] font-semibold text-ink ring-1 ring-inset ring-ink/15 transition-colors hover:bg-ink/[0.04]"
          >
            {discover.card.view}
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-full text-[13px] font-semibold transition-colors",
              selected ? "bg-brand text-white" : "bg-ink text-white hover:bg-ink-2"
            )}
          >
            {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5" strokeWidth={3} />}
            {selected ? discover.card.selected : discover.card.select}
          </button>
        </div>
      </div>
    </article>
  );
}

/** 마퀴용 콘텐츠 타일 — 사진 + 해시태그 + 짧은 캡션 (하단 오버레이로 대비 확보) */
export function ContentTile({
  image,
  tone,
  tag,
  className,
}: {
  image: keyof typeof images;
  tone: number;
  tag: string;
  className?: string;
}) {
  const im = images[image];
  return (
    <div
      className={cn(
        "relative w-[180px] shrink-0 overflow-hidden rounded-[18px] bg-white shadow-card ring-1 ring-ink/[0.06] sm:w-[210px]",
        className
      )}
    >
      <Placeholder ratio="4/5" tone={tone} src={im.src} alt={im.alt} sizes="210px" overlay="bottom">
        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5 text-white">
          <p className="text-[13px] font-bold leading-tight">{im.alt}</p>
          <p className="mt-0.5 text-[11.5px] text-white/80">{tag}</p>
        </div>
      </Placeholder>
    </div>
  );
}
