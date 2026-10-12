"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronRight, LayoutGrid, Orbit, Search, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { creators, discover, images, sizeBands, type Country, type Creator } from "@/content/landing";
import { FILTER_EVENT, type FilterRequest } from "@/lib/filter-events";
import { cn } from "@/lib/utils";
import { ButtonLink, Button, btnClass } from "./button";
import { CreatorCard, formatFollowers } from "./creator-card";
import { CreatorRing } from "./creator-ring";
import { DiscoverPreview } from "./discover-preview";
import { Placeholder } from "./placeholder";
import { EASE, Lines, Reveal, SweepLines } from "./reveal";
import { Kicker, Section } from "./section";
import { useSelection } from "./selection-context";

function Chip({
  active,
  onClick,
  onHover,
  children,
}: {
  active: boolean;
  onClick: () => void;
  /** 마우스를 올리면 그 조건으로 프리뷰 (누르기 전 미리 보기) */
  onHover?: (on: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-full px-3 text-[13px] font-semibold transition-[color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 active:scale-95",
        active
          ? "bg-ink text-white"
          : "bg-white text-ink/75 ring-1 ring-inset ring-ink/12 hover:ring-ink/30"
      )}
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-6">
      <span className="w-28 shrink-0 pt-2 text-[13px] font-semibold text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** 검색창 자리표시자 — 예시 검색어가 한 글자씩 타이핑되고 지워지며 순환한다 */
function useTypewriter(words: string[], active: boolean) {
  const [text, setText] = useState(words[0] ?? "");
  useEffect(() => {
    if (!active || words.length === 0) return;
    let w = 0;
    let i = 0;
    let dir = 1;
    let t = 0;
    const tick = () => {
      const word = words[w];
      i += dir;
      setText(word.slice(0, Math.max(0, i)));
      let delay = dir > 0 ? 70 : 35;
      if (dir > 0 && i >= word.length) {
        dir = -1;
        delay = 1600;
      } else if (dir < 0 && i <= 0) {
        dir = 1;
        w = (w + 1) % words.length;
        delay = 350;
      }
      t = window.setTimeout(tick, delay);
    };
    t = window.setTimeout(tick, 900);
    return () => window.clearTimeout(t);
  }, [words, active]);
  return text;
}

function matches(c: Creator, q: string, country: Country | null, keywords: string[], band: number | null) {
  if (country && c.country !== country) return false;
  if (keywords.length && !keywords.some((k) => c.tags.some((t) => t.includes(k)))) return false;
  if (band !== null) {
    const b = sizeBands[band];
    if (c.followers < b.min || (b.max !== null && c.followers > b.max)) return false;
  }
  if (q.trim()) {
    const hay = [c.name, c.country, c.city, c.bio, ...c.tags].join(" ").toLowerCase();
    const terms = q.toLowerCase().split(/[\s,]+/).filter(Boolean);
    if (!terms.some((t) => hay.includes(t))) return false;
  }
  return true;
}

export function Discover() {
  const sel = useSelection();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [country, setCountry] = useState<Country | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [band, setBand] = useState<number | null>(null);
  const [detail, setDetail] = useState<Creator | null>(null);
  const [view, setView] = useState<"ring" | "grid">("ring");
  const [peek, setPeek] = useState<Creator[] | null>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const headInView = useInView(headRef, { once: true, margin: "-15% 0px" });
  const [focused, setFocused] = useState(false);
  const lenis = useLenis();

  const examples = useMemo(
    () => discover.search.placeholder.replace(/^예:\s*/, "").split(/,\s*/).filter(Boolean),
    []
  );
  const typed = useTypewriter(examples, !reduce && query === "" && !focused);
  const placeholder = !reduce && query === "" && !focused ? `예: ${typed}` : discover.search.placeholder;

  // 칩에 마우스를 올리면 그 조건을 적용했을 때의 사람들로 프리뷰
  const peekWith = (patch: { country?: Country | null; keyword?: string; band?: number | null }) => {
    const ctry = patch.country === undefined ? country : patch.country;
    const kws = patch.keyword ? [patch.keyword] : keywords;
    const b = patch.band === undefined ? band : patch.band;
    setPeek(creators.filter((c) => matches(c, applied, ctry, kws, b)));
  };
  const endPeek = () => setPeek(null);

  // 포스터("키워드")·쇼케이스("국가")에서 보낸 필터 요청 → 적용하고 검색 패널로 스크롤
  useEffect(() => {
    const onFilter = (e: Event) => {
      const req = (e as CustomEvent<FilterRequest>).detail ?? {};
      // 요청한 조건 하나만 남기고 나머지는 초기화 (포스터는 키워드, 쇼케이스는 국가)
      setCountry(req.country ? (req.country as Country) : null);
      setKeywords(req.keyword ? [req.keyword] : []);
      setBand(null);
      setQuery("");
      setApplied("");
      setView("ring");
      const el = document.getElementById("discover-panel");
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -96 });
      else el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener(FILTER_EVENT, onFilter);
    return () => window.removeEventListener(FILTER_EVENT, onFilter);
  }, [lenis]);

  const list = useMemo(
    () => creators.filter((c) => matches(c, applied, country, keywords, band)),
    [applied, country, keywords, band]
  );

  const reset = () => {
    setQuery("");
    setApplied("");
    setCountry(null);
    setKeywords([]);
    setBand(null);
  };

  return (
    <Section id="discover" className="bg-paper">
      <div
        ref={headRef}
        className={cn("sweep-hold grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center", headInView && "in-view")}
      >
        <div className="max-w-3xl">
          <Reveal>
            <Kicker index="01" label={discover.kicker} />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-light mt-5 text-[clamp(2.3rem,3.9vw,3.4rem)] text-ink">
              {discover.title.split("\n").map((line, i, arr) => {
                const acc = discover.titleAccent;
                const at = acc ? line.indexOf(acc) : -1;
                return (
                  <span key={i}>
                    {at < 0 ? (
                      line
                    ) : (
                      <>
                        {line.slice(0, at)}
                        <span className="marker">{acc}</span>
                        {line.slice(at + acc.length)}
                      </>
                    )}
                    {i < arr.length - 1 && <br />}
                  </span>
                );
              })}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.7] md:text-lg">
              <SweepLines text={discover.description} from={0.5} step={0.3} />
            </p>
          </Reveal>
        </div>
        {/* 필터에 반응하는 사진 프리뷰 — 누르기 전에도 누가 있는지 보인다 */}
        <DiscoverPreview list={peek ?? list} label={discover.results.title.replace("\n", " ")} />
      </div>

      {/* 검색 + 필터 — 한 패널로 */}
      <div id="discover-panel" className="mt-10 rounded-[28px] bg-mist p-4 md:p-6">
      <Reveal delay={0.1}>
        <form
          className="flex flex-col gap-3 rounded-[20px] bg-white p-2 ring-1 ring-ink/[0.06] md:flex-row md:items-center md:rounded-full md:pl-6"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(query);
          }}
          role="search"
        >
          <label htmlFor="creator-search" className="sr-only">
            {discover.search.label}
          </label>
          <div className="flex flex-1 items-center gap-3 px-3 md:px-0">
            <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
            <input
              id="creator-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="h-11 w-full bg-transparent text-[16px] text-ink placeholder:text-muted/80 focus:outline-none"
            />
          </div>
          <Button type="submit" variant="solid" size="lg" className="md:shrink-0">
            {discover.search.button}
          </Button>
        </form>
      </Reveal>

      {/* 필터 */}
      <Reveal delay={0.15} className="mt-5 flex flex-col gap-3">
        <FilterRow label={discover.filters.country.label}>
          <Chip active={country === null} onClick={() => setCountry(null)} onHover={(on) => (on ? peekWith({ country: null }) : endPeek())}>
            {discover.filters.country.all}
          </Chip>
          {discover.filters.country.options.map((c) => (
            <Chip
              key={c}
              active={country === c}
              onClick={() => setCountry(country === c ? null : c)}
              onHover={(on) => (on ? peekWith({ country: c }) : endPeek())}
            >
              {c}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label={discover.filters.keyword.label}>
          {discover.filters.keyword.options.map((k) => (
            <Chip
              key={k}
              active={keywords.includes(k)}
              onClick={() =>
                setKeywords((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
              }
              onHover={(on) => (on ? peekWith({ keyword: k }) : endPeek())}
            >
              {k}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label={discover.filters.size.label}>
          <Chip active={band === null} onClick={() => setBand(null)} onHover={(on) => (on ? peekWith({ band: null }) : endPeek())}>
            {discover.filters.size.all}
          </Chip>
          {sizeBands.map((b, i) => (
            <Chip
              key={b.label}
              active={band === i}
              onClick={() => setBand(band === i ? null : i)}
              onHover={(on) => (on ? peekWith({ band: i }) : endPeek())}
            >
              {b.label}
            </Chip>
          ))}
        </FilterRow>
      </Reveal>

      </div>

      {/* 결과 툴바 — 섹션 제목과 겹치지 않게 한 줄 리드 + 인원·예시 표기·보기 전환 */}
      <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
        <Reveal>
          <p className="text-[18px] font-bold tracking-tight text-ink md:text-[19px]">
            {discover.results.title.replace("\n", " ")}
          </p>
          <p className="mt-1 text-[14px] text-muted">{discover.results.description}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <span className="tnum rounded-full bg-mist px-3 py-1 font-semibold text-ink/70">
            {discover.results.count.replace("{n}", String(list.length))}
          </span>
          <span>{discover.results.exampleNote}</span>
          <div className="hidden items-center rounded-full bg-mist p-1 lg:inline-flex" role="group" aria-label={discover.view.label}>
            {(["ring", "grid"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition-colors",
                  view === v ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
                )}
              >
                {v === "ring" ? <Orbit className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                {discover.view[v]}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* 결과: 3D 링(데스크톱) · 그리드(모바일) / 빈 결과 */}
      <div className="mt-8">
        <AnimatePresence mode="wait" initial={false}>
          {list.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 데스크톱 기본: imersion식 3D 링 — 고정된 채 스크롤로 돌고, 정면 카드를 누르면 상세 */}
              {view === "ring" && (
                <CreatorRing list={list} isSelected={sel.isSelected} onToggle={sel.toggle} onView={setDetail} />
              )}

              {/* 모바일·태블릿은 항상 그리드, 데스크톱은 "카드로 한번에 보기"일 때 */}
              <div
                className={cn(
                  "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5",
                  view === "grid" ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:hidden"
                )}
              >
              {list.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }}
                >
                  <CreatorCard
                    creator={c}
                    selected={sel.isSelected(c.id)}
                    onToggle={() => sel.toggle(c.id)}
                    onView={() => setDetail(c)}
                    className="h-full"
                  />
                </motion.div>
              ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="rounded-[24px] bg-cream px-6 py-16 text-center md:py-24"
            >
              <h4 className="display-md text-[clamp(1.5rem,3vw,2.25rem)]">
                <Lines text={discover.empty.title} />
              </h4>
              <p className="mx-auto mt-4 max-w-md text-muted">{discover.empty.description}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="ghost" onClick={reset}>
                  {discover.empty.reset}
                </Button>
                <ButtonLink href={discover.empty.inquire.href} variant="solid">
                  {discover.empty.inquire.label}
                  <ChevronRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SelectionBar />
      <ProfileModal creator={detail} onClose={() => setDetail(null)} />
    </Section>
  );
}

/** 여러 명 선택 시 하단 고정 영역 */
function SelectionBar() {
  const sel = useSelection();
  const [open, setOpen] = useState(false);
  const n = sel.selected.length;

  useEffect(() => {
    if (n === 0) setOpen(false);
  }, [n]);

  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.div
          key="bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5 sm:pb-5"
          role="region"
          aria-label="선택한 크리에이터"
        >
          <div className="mx-auto max-w-[60rem] rounded-[22px] bg-ink text-white shadow-bar ring-1 ring-white/10">
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  key="list"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 pt-4 pb-3 sm:px-5">
                    {sel.selected.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-3 pr-1 text-[13px]"
                      >
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-white/50">{c.country}</span>
                        <button
                          type="button"
                          onClick={() => sel.remove(c.id)}
                          aria-label={`${c.name} ${discover.selection.remove}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/15"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={sel.clear}
                        className="h-8 rounded-full px-3 text-[12.5px] font-semibold text-white/60 hover:text-white"
                      >
                        {discover.selection.clear}
                      </button>
                    </li>
                  </div>
                </motion.ul>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="text-[15px] font-bold">
                  {discover.selection.title.replace("{n}", String(n))}
                </p>
                <p className="text-[13px] text-white/60">{discover.selection.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  className={btnClass("outline-white", "md", "h-10 flex-1 px-4 text-[13.5px] sm:flex-none")}
                >
                  {discover.selection.list}
                </button>
                <a
                  href={discover.selection.propose.href}
                  className={btnClass("brand", "md", "h-10 flex-1 px-4 text-[13.5px] sm:flex-none")}
                >
                  {discover.selection.propose.label}
                </a>
              </div>
            </div>
            <p className="hidden border-t border-white/10 px-5 py-2 text-[11.5px] leading-snug text-white/45 sm:block">
              {discover.selection.note.replace("\n", " ")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 프로필 상세 모달 */
function ProfileModal({ creator, onClose }: { creator: Creator | null; onClose: () => void }) {
  const sel = useSelection();
  const lenis = useLenis();

  useEffect(() => {
    if (!creator) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [creator, onClose, lenis]);

  const rows = creator
    ? {
        basic: `${creator.name} · ${creator.country} · ${creator.city} · ${creator.platform} · “${creator.bio}”`,
        topics: creator.tags.map((t) => `#${t}`).join("  "),
        scale: `${formatFollowers(creator.followers)} · 확인 기준일 표시 예정`,
        content: discover.detail.contentPlaceholder,
        interest: "크리에이터가 직접 밝힌 관심 카테고리·협업 형식 (등록 후 표시)",
      }
    : null;

  return (
    <AnimatePresence>
      {creator && rows && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            data-lenis-prevent
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white sm:rounded-[28px]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid sm:grid-cols-[240px_1fr]">
              <div className="relative">
                <Placeholder
                  ratio="4/5"
                  tone={creator.tone}
                  src={images[creator.image].src}
                  alt={images[creator.image].alt}
                  sizes="240px"
                  className="h-full sm:min-h-full"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink">
                  {creator.country} · {creator.city}
                </span>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="kicker text-brand">{discover.detail.title}</p>
                    <h3 id="profile-title" className="mt-2 text-[22px] font-extrabold tracking-tight">
                      {creator.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={discover.detail.close}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-ink/15 hover:bg-mist"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <dl className="mt-6 divide-y divide-line">
                  {discover.detail.rows.map((r) => (
                    <div key={r.key} className="grid gap-1 py-3.5 sm:grid-cols-[120px_1fr] sm:gap-4">
                      <dt className="text-[13px] font-semibold text-muted">{r.label}</dt>
                      <dd className="text-[14.5px] leading-relaxed text-ink/85">
                        {rows[r.key as keyof typeof rows]}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant={sel.isSelected(creator.id) ? "ghost" : "brand"}
                    size="lg"
                    onClick={() => sel.toggle(creator.id)}
                    className="flex-1"
                  >
                    {sel.isSelected(creator.id) ? discover.detail.deselect : discover.detail.select}
                  </Button>
                </div>
                <p className="mt-4 text-[12px] leading-snug text-muted">
                  <Lines text={discover.selection.note} />
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
