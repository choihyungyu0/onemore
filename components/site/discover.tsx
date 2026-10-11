"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Search, X } from "lucide-react";
import { creators, discover, images, sizeBands, type Country, type Creator } from "@/content/landing";
import { cn } from "@/lib/utils";
import { ButtonLink, Button, btnClass } from "./button";
import { CreatorCard, formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";
import { EASE, Lines, Reveal } from "./reveal";
import { Section, SectionHeader } from "./section";
import { useSelection } from "./selection-context";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-full px-3.5 text-[13.5px] font-semibold transition-colors",
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
      <SectionHeader
        index="01"
        kicker={discover.kicker}
        title={discover.title}
        description={discover.description}
      />

      {/* 검색창 */}
      <Reveal delay={0.1} className="mt-12">
        <form
          className="flex flex-col gap-3 rounded-[24px] bg-mist p-3 md:flex-row md:items-center md:rounded-full md:p-2 md:pl-6"
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
              placeholder={discover.search.placeholder}
              className="h-11 w-full bg-transparent text-[16px] text-ink placeholder:text-muted/80 focus:outline-none"
            />
          </div>
          <Button type="submit" variant="solid" size="lg" className="md:shrink-0">
            {discover.search.button}
          </Button>
        </form>
      </Reveal>

      {/* 필터 */}
      <Reveal delay={0.15} className="mt-8 flex flex-col gap-5">
        <FilterRow label={discover.filters.country.label}>
          <Chip active={country === null} onClick={() => setCountry(null)}>
            {discover.filters.country.all}
          </Chip>
          {discover.filters.country.options.map((c) => (
            <Chip key={c} active={country === c} onClick={() => setCountry(country === c ? null : c)}>
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
            >
              {k}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label={discover.filters.size.label}>
          <Chip active={band === null} onClick={() => setBand(null)}>
            {discover.filters.size.all}
          </Chip>
          {sizeBands.map((b, i) => (
            <Chip key={b.label} active={band === i} onClick={() => setBand(band === i ? null : i)}>
              {b.label}
            </Chip>
          ))}
        </FilterRow>
      </Reveal>

      {/* 결과 헤더 */}
      <div className="mt-16 flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <h3 className="display-md text-[clamp(1.5rem,3vw,2.25rem)]">
            <Lines text={discover.results.title} />
          </h3>
          <p className="mt-3 text-muted">{discover.results.description}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex items-center gap-3 text-[13px] text-muted">
          <span className="tnum rounded-full bg-mist px-3 py-1 font-semibold text-ink/70">
            {discover.results.count.replace("{n}", String(list.length))}
          </span>
          <span>{discover.results.exampleNote}</span>
        </Reveal>
      </div>

      {/* 카드 그리드 / 빈 결과 */}
      <div className="mt-8">
        <AnimatePresence mode="wait" initial={false}>
          {list.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-6"
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

  useEffect(() => {
    if (!creator) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [creator, onClose]);

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
