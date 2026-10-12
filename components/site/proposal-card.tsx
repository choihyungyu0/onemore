"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { campaign, images, showcase, sizeBands, type Country, type Creator } from "@/content/landing";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { Placeholder } from "./placeholder";

/**
 * 협업 제안서 카드 — 폼을 채우는 대로 실시간으로 완성된다.
 * 빈 칸은 점선으로 "여기가 채워집니다"를 보여주고, 값이 바뀐 줄은 코랄로 잠깐 반짝인다.
 * 국가는 현지 사진 스탬프, 팔로워 규모는 범위 바, 받는 크리에이터는 탐색에서 고른 프로필.
 * 제출되면 DRAFT 스탬프가 SENT로 바뀐다.
 */
export type ProposalValues = {
  brand: string;
  manager: string;
  email: string;
  countries: Country[];
  keywords: string;
  sizes: string[];
  selected: Creator[];
  overview: string;
  schedule: string;
  negotiable: boolean;
  budget: string;
  undecided: boolean;
};

const COUNTRY_IMAGE = Object.fromEntries(showcase.slides.map((s) => [s.country, s.image])) as Record<Country, keyof typeof images>;

export function ProposalCard({ values, step, sent, className }: { values: ProposalValues; step: number; sent: boolean; className?: string }) {
  const p = campaign.proposal;
  const f = campaign.fields;
  // 날짜는 브라우저에서만 계산 (서버 렌더와 달라지면 하이드레이션 불일치 → 전체 재렌더)
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }));
  }, []);
  const keywords = values.keywords.split(/[,，\s]+/).map((k) => k.trim()).filter(Boolean).slice(0, 6);
  const bandIdx = values.sizes.map((l) => sizeBands.findIndex((b) => b.label === l)).filter((i) => i >= 0);
  const lo = bandIdx.length ? Math.min(...bandIdx) : -1;
  const hi = bandIdx.length ? Math.max(...bandIdx) : -1;
  const n = sizeBands.length;
  const filled = [values.brand, values.manager, values.email, values.countries.length, keywords.length, values.sizes.length, values.selected.length, values.overview, values.negotiable || values.schedule, values.undecided || values.budget].filter(Boolean).length;

  return (
    <div className={cn("proposal relative", className)}>
      <div className={cn("relative overflow-hidden rounded-[22px] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(11,18,32,0.45)] ring-1 ring-ink/[0.06] transition-transform duration-700 ease-[var(--ease-expo)] sm:p-7", sent && "-rotate-1")}>
        {/* 스탬프 */}
        <span
          className={cn(
            "proposal-stamp pointer-events-none absolute right-4 top-4 rounded-[6px] border-2 px-2 py-0.5 font-display text-[10px] font-extrabold tracking-[0.18em] sm:right-5 sm:top-5 sm:px-2.5 sm:py-1 sm:text-[11px]",
            sent ? "proposal-stamp--sent rotate-[-8deg] border-brand text-brand" : "rotate-[6deg] border-ink/25 text-ink/35"
          )}
          aria-hidden
        >
          {sent ? p.sent : p.draft}
        </span>

        {/* 머리 */}
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-6 w-6" />
          <span className="kicker whitespace-nowrap text-[10px] text-ink/50">{p.kicker}</span>
          <span className="ml-auto mr-16 hidden whitespace-nowrap text-[11px] text-muted sm:inline">{today}</span>
        </div>
        <h3 className="mt-5 text-[clamp(1.35rem,1.9vw,1.7rem)] font-extrabold leading-[1.25] tracking-[-0.03em] text-ink">
          <Blank value={values.brand} placeholder={p.blankBrand} active={step === 0} />
          <span className="text-ink/70">{p.titleSuffix}</span>
        </h3>

        {/* 줄들 */}
        <dl className="mt-6 flex flex-col divide-y divide-ink/[0.06]">
          <Row label={p.rows.from} watch={`${values.manager}|${values.email}`}>
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <Blank value={values.manager} placeholder={f.manager.label} active={step === 0} small />
              <Blank value={values.email} placeholder={f.email.label} active={step === 0} small muted />
            </span>
          </Row>

          <Row label={p.rows.countries} watch={values.countries.join(",")}>
            <span className="flex flex-wrap items-center gap-2">
              {values.countries.length ? (
                values.countries.map((c) => {
                  const im = images[COUNTRY_IMAGE[c]];
                  return (
                    <span key={c} className="proposal-pop flex items-center gap-1.5 rounded-full bg-paper py-1 pl-1 pr-2.5 text-[12.5px] font-semibold text-ink ring-1 ring-ink/[0.06]">
                      <span className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-white">
                        <Placeholder fill tone={1} src={im?.src ?? ""} alt="" sizes="24px" />
                      </span>
                      {c}
                    </span>
                  );
                })
              ) : (
                <span className="flex gap-1.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={cn("h-7 w-7 rounded-full border border-dashed border-ink/20", step === 1 && "proposal-blink")} style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </span>
              )}
            </span>
          </Row>

          <Row label={p.rows.keywords} watch={keywords.join(",")}>
            {keywords.length ? (
              <span className="flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <span key={k} className="proposal-pop rounded-full bg-ink px-2.5 py-0.5 text-[12px] font-semibold text-white">
                    #{k.replace(/^#/, "")}
                  </span>
                ))}
              </span>
            ) : (
              <Dash active={step === 1} w="w-2/3" />
            )}
          </Row>

          <Row label={p.rows.sizes} watch={values.sizes.join(",")}>
            <span className="block">
              <span className="relative block h-2 overflow-hidden rounded-full bg-ink/[0.07]">
                {lo >= 0 && (
                  <span
                    className="proposal-range absolute inset-y-0 rounded-full bg-brand"
                    style={{ left: `${(lo / n) * 100}%`, width: `${((hi - lo + 1) / n) * 100}%` }}
                  />
                )}
              </span>
              <span className="mt-1.5 flex justify-between text-[10.5px] text-muted">
                <span>{sizeBands[0].label}</span>
                <span className={cn("font-semibold", lo >= 0 ? "text-ink" : "text-muted/70")}>
                  {lo >= 0 ? (lo === hi ? sizeBands[lo].label : `${sizeBands[lo].label.split("-")[0].replace(" 이하", "")} – ${sizeBands[hi].label.split("-").pop()}`) : "—"}
                </span>
                <span>{sizeBands[n - 1].label}</span>
              </span>
            </span>
          </Row>

          <Row label={p.rows.to} watch={values.selected.map((c) => c.id).join(",")}>
            {values.selected.length ? (
              <span className="flex items-center">
                <span className="flex -space-x-2.5">
                  {values.selected.slice(0, 5).map((c) => {
                    const im = images[c.image];
                    return (
                      <span key={c.id} className="proposal-pop relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white">
                        <Placeholder fill tone={c.tone} src={im.src} alt={c.name} sizes="32px" />
                      </span>
                    );
                  })}
                </span>
                <span className="ml-3 text-[12.5px] font-semibold text-ink">
                  {values.selected.length > 5 ? `+${values.selected.length - 5} · ` : ""}
                  {p.toCount.replace("{n}", String(values.selected.length))}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[12px] text-muted/80">
                <span className={cn("h-8 w-8 rounded-full border border-dashed border-ink/20", step === 1 && "proposal-blink")} aria-hidden />
                {p.emptyTo}
              </span>
            )}
          </Row>

          <Row label={p.rows.overview} watch={values.overview.slice(0, 40)}>
            {values.overview ? (
              <span className="line-clamp-3 text-[13px] leading-[1.6] text-ink/85">{values.overview}</span>
            ) : (
              <span className="flex flex-col gap-1.5">
                <Dash active={step === 2} w="w-full" />
                <Dash active={step === 2} w="w-5/6" />
                <Dash active={step === 2} w="w-1/2" />
              </span>
            )}
          </Row>

          <Row label={`${p.rows.schedule} · ${p.rows.budget}`} watch={`${values.negotiable}|${values.schedule}|${values.undecided}|${values.budget}`}>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
              <span className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-muted">{p.rows.schedule}</span>
                <Blank value={values.negotiable ? f.schedule.negotiable : values.schedule} placeholder="—" active={step === 2} small />
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-muted">{p.rows.budget}</span>
                <Blank value={values.undecided ? f.budget.undecided : values.budget} placeholder="—" active={step === 2} small />
              </span>
            </span>
          </Row>
        </dl>

        {/* 바닥: 진행 */}
        <div className="mt-6 flex items-center justify-between">
          <span className="kicker text-[9.5px] text-ink/45">{p.progress.replace("{n}", String(filled)).replace("{t}", "10")}</span>
          <span className="flex gap-1" aria-hidden>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={cn("h-1.5 w-3 rounded-full transition-colors duration-500", i < filled ? "bg-brand" : "bg-ink/10")} />
            ))}
          </span>
        </div>

        {sent && (
          <div className="proposal-sent absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]" aria-hidden>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lift">
              <Check className="h-6 w-6" strokeWidth={3} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 조각 ---------- */
function Row({ label, watch, children }: { label: string; watch: string; children: ReactNode }) {
  // 값이 바뀌면 코랄로 잠깐 반짝 (처음 마운트는 제외)
  const [flash, setFlash] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setFlash((v) => v + 1);
  }, [watch]);
  return (
    <div key={flash} className={cn("grid grid-cols-[88px_1fr] items-start gap-3 py-3 first:pt-0 last:pb-0", flash > 0 && "proposal-flash")}>
      <dt className="pt-0.5 text-[11px] font-semibold tracking-[0.02em] text-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function Blank({ value, placeholder, active, small, muted }: { value: string; placeholder: string; active?: boolean; small?: boolean; muted?: boolean }) {
  if (value) return <span className={cn(small ? "text-[13.5px] font-semibold" : "", muted && "font-normal text-muted")}>{value}</span>;
  return (
    <span className={cn("inline-flex items-center border-b border-dashed border-ink/30 text-muted/60", small ? "text-[13px]" : "", active && "proposal-blink")}>
      {placeholder}
      {active && <span className="chat-caret ml-0.5 inline-block h-[0.9em] w-px translate-y-[1px] bg-brand" aria-hidden />}
    </span>
  );
}

function Dash({ active, w }: { active?: boolean; w: string }) {
  return <span className={cn("block h-[9px] rounded-full border-b border-dashed border-ink/25", w, active && "proposal-blink")} aria-hidden />;
}
