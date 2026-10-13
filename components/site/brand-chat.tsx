"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUp, Check, Send } from "lucide-react";
import { creators, discover, empathy, images, type ImageKey } from "@/content/landing";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";
import { Lines, Reveal, SweepLines } from "./reveal";
import { Kicker } from "./section";

/**
 * 브랜드 공감 — "브랜드 담당자의 메시지" 스레드
 * - 왼쪽 제목은 고정(sticky): 형광펜 강조 제목 + 설명, 그 아래 "누가 말하는 중인지" 상태판(세 브랜드 담당자가
 *   대화 진행에 따라 순서대로 켜지고, 입력 중/답장 완료 표시). 뒤에는 큰 따옴표 글리프가 옅게 깔린다
 * - 브랜드 메시지(오른쪽, 잉크색): 타이핑 점 → 글자 단위로 채워짐
 * - 오엠엘 답장(왼쪽, 흰색): 설명 문장 + 실제 UI 조각(조건 칩 / 팔로워 범위·비교 카드 / 다음 협업 알림)
 * - 마지막엔 입력창이 나타나고 전송 버튼이 CTA(캠페인 문의)로 이어진다
 * - 말풍선에 올리면 살짝 기울며 떠오른다. 감속 모션은 모두 완성 상태로 표시
 */
const AVATARS: ImageKey[] = ["fit-01", "fit-02", "fit-03"];
type Phase = "idle" | "youTyping" | "you" | "usTyping" | "us";

export function BrandChat() {
  const reduce = useReducedMotion();
  const [phases, setPhases] = useState<Phase[]>(() => empathy.items.map(() => "idle"));
  const headRef = useRef<HTMLDivElement>(null);
  const [headIn, setHeadIn] = useState(false);
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setHeadIn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const setPhaseAt = (i: number, p: Phase) => setPhases((prev) => (prev[i] === p ? prev : prev.map((x, k) => (k === i ? p : x))));
  const [title1, title2] = empathy.title.split("\n");
  const done = phases.filter((p) => p === "us").length;

  return (
    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
      {/* 왼쪽: 고정 제목 + 상태판 */}
      <div ref={headRef} className={cn("sweep-hold relative lg:sticky lg:top-28 lg:self-start", headIn && "in-view")}>
        {/* 큰 따옴표 글리프 — "브랜드의 목소리" */}
        <span aria-hidden className="font-serif-accent pointer-events-none absolute -left-3 -top-6 select-none text-[clamp(8rem,13vw,13rem)] leading-none text-brand/[0.12] lg:-left-6 lg:-top-9">
          “
        </span>
        <div className="relative">
          <Reveal>
            <Kicker index="04" label={empathy.kicker} />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display mt-5 text-[clamp(2rem,4.6vw,3.75rem)] text-ink">
              <span className="marker">{title1}</span>
              <br />
              {title2}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-md text-[17px] leading-[1.7] md:text-lg">
              <SweepLines text={empathy.description} from={0.9} step={0.25} />
            </p>
          </Reveal>

          {/* 상태판 — 누가 말하는 중인지 */}
          <Reveal delay={0.18} className="mt-10">
            <div className="flex items-start justify-between gap-4">
              <p className="kicker min-w-0 flex-1 text-ink/50">{empathy.chat.hint}</p>
              <span className="kicker tnum shrink-0 whitespace-nowrap text-[10px] text-brand">
                {String(done).padStart(2, "0")} / {String(empathy.items.length).padStart(2, "0")}
              </span>
            </div>
            <ol className="relative mt-4 flex flex-col">
              <span aria-hidden className="absolute bottom-5 left-[19px] top-5 w-px bg-ink/10" />
              {empathy.items.map((it, i) => {
                const p = phases[i];
                const active = p !== "idle" && p !== "us";
                const finished = p === "us";
                const im = images[AVATARS[i]];
                return (
                  <li key={it.label} className={cn("relative flex items-center gap-4 py-2.5 transition-opacity duration-500", p === "idle" ? "opacity-45" : "opacity-100")}>
                    <span className={cn("relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 transition-[box-shadow,transform] duration-500", active ? "scale-105 ring-brand" : "ring-white", finished && "ring-ink/15")}>
                      <Placeholder fill tone={1} src={im.src} alt="" sizes="40px" />
                      {active && <span className="chat-ping absolute inset-0 rounded-full ring-2 ring-brand" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[14px] font-semibold tracking-tight transition-colors duration-300", p === "idle" ? "text-ink/60" : "text-ink")}>{it.label}</span>
                      <span className={cn("mt-0.5 flex items-center gap-1.5 text-[11.5px] transition-colors duration-300", active ? "text-brand" : "text-muted")}>
                        {finished && <Check className="h-3 w-3" strokeWidth={3} />}
                        {p === "idle" && empathy.chat.status.idle}
                        {(p === "youTyping" || p === "you") && (
                          <>
                            <span className="chat-dots chat-dots--brand inline-flex items-center gap-[3px]" aria-hidden>
                              <i /><i /><i />
                            </span>
                            {empathy.chat.status.you}
                          </>
                        )}
                        {p === "usTyping" && (
                          <>
                            <span className="chat-dots chat-dots--brand inline-flex items-center gap-[3px]" aria-hidden>
                              <i /><i /><i />
                            </span>
                            {empathy.chat.status.us}
                          </>
                        )}
                        {finished && empathy.chat.status.done}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </div>

      {/* 오른쪽: 스레드 */}
      <div className="relative">
        <ol className="flex flex-col gap-10 lg:gap-14">
          {empathy.items.map((it, i) => (
            <Exchange key={it.label} index={i} item={it} reduce={!!reduce} onPhase={(p) => setPhaseAt(i, p)} />
          ))}
        </ol>

        {/* 입력창 → CTA */}
        <Reveal delay={0.1} className="mt-12 lg:mt-16">
          <a
            href={empathy.cta.href}
            className="group flex items-center gap-3 rounded-full bg-white p-2 pl-6 shadow-lift ring-1 ring-ink/[0.06] transition-[box-shadow,transform] duration-500 ease-[var(--ease-expo)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-20px_rgba(11,18,32,0.35)]"
          >
            <span className="flex-1 text-[15px] text-ink/45">
              {empathy.chat.composer}
              <span className="chat-caret ml-0.5 inline-block h-[16px] w-px translate-y-[3px] bg-ink/50" aria-hidden />
            </span>
            <span className="hidden text-[14px] font-bold text-ink sm:inline">{empathy.cta.label}</span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-transform duration-300 group-hover:scale-105">
              <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
            </span>
          </a>
        </Reveal>
      </div>
    </div>
  );
}

function Exchange({ index, item, reduce, onPhase }: { index: number; item: (typeof empathy.items)[number]; reduce: boolean; onPhase: (p: Phase) => void }) {
  const root = useRef<HTMLLIElement>(null);
  const [phase, setPhaseRaw] = useState<Phase>("idle");
  const onPhaseRef = useRef(onPhase);
  onPhaseRef.current = onPhase;
  const setPhase = (p: Phase) => {
    setPhaseRaw(p);
    onPhaseRef.current(p);
  };
  const [typed, setTyped] = useState(0);
  const im = images[AVATARS[index]];

  useEffect(() => {
    if (reduce) {
      // 감속 모션: 완성 상태로 (첫 렌더는 서버와 같게 두고 effect에서 바꾼다)
      setTyped(item.quote.length);
      setPhase("us");
      return;
    }
    const el = root.current;
    if (!el) return;
    let alive = true;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    const run = async () => {
      setPhase("youTyping");
      await wait(650);
      if (!alive) return;
      setPhase("you");
      for (let n = 1; n <= item.quote.length; n++) {
        if (!alive) return;
        setTyped(n);
        await wait(item.quote[n - 1] === "\n" ? 140 : 26);
      }
      await wait(380);
      if (!alive) return;
      setPhase("usTyping");
      await wait(620);
      if (!alive) return;
      setPhase("us");
    };
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          void run();
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduce, item.quote]);

  const youVisible = phase !== "idle";
  const youText = phase === "youTyping";
  const usVisible = phase === "usTyping" || phase === "us";
  const usReady = phase === "us";

  return (
    <li ref={root} className="flex flex-col gap-4">
      {/* 브랜드 메시지 — 오른쪽 */}
      <div className={cn("flex flex-row-reverse items-end gap-3 transition-opacity duration-500", youVisible ? "opacity-100" : "opacity-0")}>
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-card" aria-hidden>
          <Placeholder fill tone={1} src={im.src} alt="" sizes="36px" />
        </span>
        <div className="flex max-w-[82%] flex-col items-end">
          <span className="kicker mb-2 text-[9.5px] text-ink/45">{item.label}</span>
          <div className="chat-bubble chat-bubble--you relative rounded-[20px] rounded-br-[6px] bg-ink px-5 py-4 text-white shadow-lift">
            {/* 크기 고정용 전체 문장(보이지 않음) + 실제 타이핑 문장 */}
            <p className="display-md invisible whitespace-pre-line text-[clamp(1.1rem,1.5vw,1.3rem)] leading-[1.45]" aria-hidden>
              “{item.quote}”
            </p>
            <p className="display-md absolute inset-x-5 top-4 whitespace-pre-line text-[clamp(1.1rem,1.5vw,1.3rem)] leading-[1.45]">
              {youText ? (
                <span className="chat-dots inline-flex items-center gap-1 py-2" aria-label="…">
                  <i /><i /><i />
                </span>
              ) : (
                <>
                  “{item.quote.slice(0, typed)}
                  {typed >= item.quote.length ? "”" : <span className="chat-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-white/80" aria-hidden />}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 오엠엘 답장 — 왼쪽 */}
      <div className={cn("flex items-end gap-3 transition-[opacity,transform] duration-600 ease-[var(--ease-expo)]", usVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
        <BrandMark className="h-9 w-9 shrink-0 rounded-full ring-2 ring-white shadow-card" />
        <div className="flex max-w-[88%] flex-col items-start lg:max-w-[82%]">
          <span className="kicker mb-2 text-[9.5px] text-brand">{empathy.chat.us}</span>
          <div className="chat-bubble chat-bubble--us relative rounded-[20px] rounded-bl-[6px] bg-white p-5 shadow-lift ring-1 ring-ink/[0.05]">
            {!usReady ? (
              <span className="chat-dots chat-dots--dark inline-flex items-center gap-1 py-1" aria-label="…">
                <i /><i /><i />
              </span>
            ) : (
              <>
                <p className="text-[15px] leading-[1.7] text-ink/80">
                  <Lines text={item.description} />
                </p>
                <div className="chat-snippet mt-4">
                  {index === 0 && <SnippetFilter />}
                  {index === 1 && <SnippetRange />}
                  {index === 2 && <SnippetNext />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/* ---------- 답장 속 UI 조각 ---------- */
function Panel({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[14px] bg-paper p-3.5 ring-1 ring-ink/[0.05]", className)}>
      <p className="kicker text-[9.5px] text-ink/45">{label}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Chip({ on, children, delay }: { on?: boolean; children: ReactNode; delay: number }) {
  return (
    <span
      className={cn("chat-pop inline-flex h-7 items-center rounded-full px-2.5 text-[11.5px] font-semibold", on ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/10")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </span>
  );
}

/** 01 — 국가·키워드 칩으로 걸러진 후보 수 (실제 예시 데이터 기준) */
function SnippetFilter() {
  const s = empathy.chat.filter;
  const n = creators.filter((c) => c.country === s.country && c.tags.includes(s.keyword)).length;
  const countries = discover.filters.country.options.slice(0, 4);
  const keywords = discover.filters.keyword.options.slice(0, 4);
  return (
    <Panel label={s.label}>
      <div className="flex flex-wrap gap-1.5">
        {countries.map((c, i) => (
          <Chip key={c} on={c === s.country} delay={i * 60}>
            {c}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {keywords.map((k, i) => (
          <Chip key={k} on={k === s.keyword} delay={240 + i * 60}>
            #{k}
          </Chip>
        ))}
      </div>
      <p className="chat-pop mt-3 flex items-center justify-between text-[12.5px] text-muted" style={{ animationDelay: "520ms" }}>
        <span>
          {s.country} · #{s.keyword}
        </span>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand">{s.count.replace("{n}", String(n))}</span>
      </p>
    </Panel>
  );
}

/** 02 — 팔로워 범위 + 비교 카드 2장 */
function SnippetRange() {
  const s = empathy.chat.range;
  const pair = [creators[0], creators[1]];
  return (
    <Panel label={s.label}>
      <div className="chat-pop relative h-6" style={{ animationDelay: "40ms" }} aria-hidden>
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
        <span className="absolute left-[18%] right-[46%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-brand" />
        <span className="absolute left-[18%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-2 ring-brand shadow-card" />
        <span className="absolute right-[46%] top-1/2 h-4 w-4 translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-2 ring-brand shadow-card" />
      </div>
      <p className="chat-pop flex justify-between text-[11px] text-muted" style={{ animationDelay: "120ms" }}>
        <span>{s.from}</span>
        <span className="font-semibold text-ink">{s.range}</span>
        <span>{s.to}</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {pair.map((c, i) => {
          const im = images[c.image];
          return (
            <div key={c.id} className="chat-pop overflow-hidden rounded-[10px] bg-white ring-1 ring-ink/[0.06]" style={{ animationDelay: `${260 + i * 120}ms` }}>
              <Placeholder ratioClassName="aspect-[16/10]" tone={c.tone} src={im.src} alt="" sizes="180px" />
              <div className="px-2.5 py-2">
                <p className="text-[11.5px] font-bold tracking-tight">{c.name}</p>
                <p className="text-[10px] text-muted">{formatFollowers(c.followers)}</p>
                <p className="mt-1 text-[10px] text-ink/60">{c.tags.map((t) => `#${t}`).join(" ")}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="chat-pop mt-2.5 text-[11.5px] text-muted" style={{ animationDelay: "560ms" }}>
        {s.compare}
      </p>
    </Panel>
  );
}

/** 03 — 다음 협업 알림 */
function SnippetNext() {
  const s = empathy.chat.next;
  const c = creators[1];
  const im = images[c.image];
  return (
    <Panel label={s.label}>
      <div className="chat-pop flex items-center gap-3" style={{ animationDelay: "60ms" }}>
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-card">
          <Placeholder fill tone={c.tone} src={im.src} alt="" sizes="44px" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white ring-2 ring-white">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        </span>
        <span>
          <span className="block text-[13px] font-bold tracking-tight text-ink">
            {c.name} · {s.title}
          </span>
          <span className="block text-[11.5px] text-muted">{s.body}</span>
        </span>
      </div>
      <div className="chat-pop mt-3 flex items-center gap-2" style={{ animationDelay: "240ms" }}>
        <span className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink text-[12.5px] font-bold text-white">
          <Send className="h-3.5 w-3.5" />
          {s.cta}
        </span>
        <span className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[12.5px] font-semibold text-ink/70 ring-1 ring-inset ring-ink/10">{s.later}</span>
      </div>
    </Panel>
  );
}
