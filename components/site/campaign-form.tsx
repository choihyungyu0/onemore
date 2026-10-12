"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { campaign, sizeBands, type Country } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "./button";
import { ProposalCard } from "./proposal-card";
import { EASE, Lines, Reveal } from "./reveal";
import { Section, SectionHeader } from "./section";
import { useSelection } from "./selection-context";

/**
 * 캠페인 신청 — 3단계 폼 + 실시간 제안서
 * ① 브랜드(필수) ② 원하는 크리에이터 ③ 캠페인. 한 화면에 한 단계만 보여 짧게 느끼게 한다.
 * 왼쪽 제안서 카드는 입력하는 대로 채워지고, 제출하면 DRAFT 스탬프가 SENT로 바뀐다.
 */
const inputCls =
  "h-12 w-full rounded-[14px] border border-ink/12 bg-white px-4 text-[15.5px] text-ink placeholder:text-muted/70 transition-[border-color,box-shadow] focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,90,60,0.14)] focus:outline-none";

function Field({ id, label, required, hint, error, children }: { id: string; label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="group flex flex-col gap-2">
      <label htmlFor={id} className="flex items-center gap-2 text-[14px] font-bold text-ink transition-colors group-focus-within:text-brand">
        {label}
        {required && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-deep">{campaign.requiredBadge}</span>}
      </label>
      {hint && <p className="-mt-1 text-[13px] text-muted">{hint}</p>}
      {children}
      {error && <p className="text-[12.5px] font-semibold text-brand-deep">{error}</p>}
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition-[background-color,color,box-shadow,transform] duration-300 active:scale-95",
        active ? "bg-ink text-white" : "bg-white text-ink/75 ring-1 ring-inset ring-ink/12 hover:ring-ink/30"
      )}
    >
      {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CampaignForm() {
  const sel = useSelection();
  const f = campaign.fields;
  const steps = campaign.steps;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [brand, setBrand] = useState("");
  const [manager, setManager] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [keywords, setKeywords] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [overview, setOverview] = useState("");
  const [schedule, setSchedule] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [budget, setBudget] = useState("");
  const [undecided, setUndecided] = useState(false);
  const [tried, setTried] = useState<boolean[]>([false, false, false]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const errors = {
    brand: !brand.trim() ? campaign.errors.required : "",
    manager: !manager.trim() ? campaign.errors.required : "",
    email: !email.trim() ? campaign.errors.required : !EMAIL.test(email) ? campaign.errors.email : "",
    overview: !overview.trim() ? campaign.errors.required : "",
  };
  const stepValid = [!errors.brand && !errors.manager && !errors.email, true, !errors.overview];

  const go = (to: number) => {
    if (to > step && !stepValid[step]) {
      setTried((t) => t.map((v, i) => (i === step ? true : v)));
      return;
    }
    setDir(to > step ? 1 : -1);
    setStep(Math.max(0, Math.min(steps.length - 1, to)));
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepValid[2]) {
      setTried([true, true, true]);
      return;
    }
    const payload = {
      brand,
      manager,
      email,
      link,
      countries,
      keywords,
      sizes,
      selectedCreators: sel.selected.map((c) => ({ id: c.id, name: c.name })),
      overview,
      schedule: negotiable ? f.schedule.negotiable : schedule,
      budget: undecided ? f.budget.undecided : budget,
      submittedAt: new Date().toISOString(),
    };
    // 백엔드 연동 전: 콘솔 출력까지만
    console.log("[campaign-request]", payload);
    setSending(true);
    window.setTimeout(() => setDone(true), 900);
  }

  const values = { brand, manager, email, countries, keywords, sizes, selected: sel.selected, overview, schedule, negotiable, budget, undecided };
  const show = (i: number) => tried[i];

  return (
    <Section id="campaign" className="bg-brand text-ink">
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        {/* 왼쪽: 제목 + 실시간 제안서 */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeader
            index="05"
            kicker={campaign.kicker}
            title={campaign.title}
            description={campaign.description}
            titleClassName="text-white text-[clamp(1.9rem,3.6vw,3rem)]"
            className="[&_.kicker]:text-white/70 [&_p]:text-white/85 [&_p]:text-[15.5px] [&_span]:text-white/80"
          />
          <Reveal delay={0.15} className="mt-8 hidden lg:block">
            <ProposalCard values={values} step={step} sent={sending || done} />
          </Reveal>
        </div>

        {/* 오른쪽: 3단계 폼 */}
        <Reveal delay={0.1}>
          <div className="rounded-[28px] bg-white p-6 shadow-lift sm:p-8 lg:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="py-6 text-center sm:py-10">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-6 w-6" strokeWidth={3} />
                  </span>
                  <h3 className="display-md mt-6 text-[clamp(1.6rem,3vw,2.25rem)]">{campaign.success.title}</h3>
                  <p className="mx-auto mt-4 max-w-md text-[16px] leading-[1.75] text-muted">
                    <Lines text={campaign.success.description} />
                  </p>
                  <p className="mt-3 text-[15px] font-semibold text-ink">{campaign.success.thanks}</p>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <ButtonLink href={campaign.success.browse.href} variant="solid" size="lg">
                      {campaign.success.browse.label}
                    </ButtonLink>
                    <ButtonLink href={campaign.success.home.href} variant="ghost" size="lg">
                      {campaign.success.home.label}
                    </ButtonLink>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
                  {/* 단계 표시 + 진행선 */}
                  <ol className="grid grid-cols-3 gap-2">
                    {steps.map((s, i) => (
                      <li key={s.label}>
                        <button
                          type="button"
                          onClick={() => go(i)}
                          disabled={i > step && !stepValid[step]}
                          className={cn("flex w-full flex-col gap-2 text-left disabled:cursor-not-allowed", i === step ? "text-ink" : "text-muted")}
                          aria-current={i === step ? "step" : undefined}
                        >
                          <span className="relative block h-[3px] overflow-hidden rounded-full bg-ink/[0.08]">
                            <span className={cn("absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-700 ease-[var(--ease-expo)]", i < step ? "w-full" : i === step ? "w-1/2" : "w-0")} />
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] font-bold tracking-tight">
                            <span className={cn("font-display text-[10px] tracking-[0.12em]", i <= step ? "text-brand" : "text-muted")}>0{i + 1}</span>
                            {s.label}
                            {i < step && <Check className="h-3 w-3 text-brand" strokeWidth={3} />}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>

                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait" initial={false} custom={dir}>
                      <motion.div
                        key={step}
                        custom={dir}
                        initial={{ opacity: 0, x: dir * 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dir * -28 }}
                        transition={{ duration: 0.38, ease: EASE }}
                        className="flex flex-col gap-6"
                      >
                        <div>
                          <h3 className="text-[clamp(1.3rem,2vw,1.6rem)] font-extrabold tracking-tight text-ink">{steps[step].title}</h3>
                          <p className="mt-1.5 text-[13.5px] text-muted">{steps[step].note}</p>
                        </div>

                        {step === 0 && (
                          <>
                            <div className="grid gap-6 sm:grid-cols-2">
                              <Field id="brand" label={f.brand.label} required error={show(0) ? errors.brand : ""}>
                                <input id="brand" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={f.brand.placeholder} className={inputCls} autoComplete="organization" />
                              </Field>
                              <Field id="manager" label={f.manager.label} required error={show(0) ? errors.manager : ""}>
                                <input id="manager" name="manager" value={manager} onChange={(e) => setManager(e.target.value)} placeholder={f.manager.placeholder} className={inputCls} autoComplete="name" />
                              </Field>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                              <Field id="email" label={f.email.label} required error={show(0) ? errors.email : ""}>
                                <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={f.email.placeholder} className={inputCls} autoComplete="email" />
                              </Field>
                              <Field id="link" label={f.link.label}>
                                <input id="link" name="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder={f.link.placeholder} className={inputCls} />
                              </Field>
                            </div>
                          </>
                        )}

                        {step === 1 && (
                          <>
                            <Field id="countries" label={f.countries.label} hint={f.countries.hint}>
                              <div id="countries" className="flex flex-wrap gap-2" role="group" aria-label={f.countries.label}>
                                {f.countries.options.map((c) => (
                                  <ToggleChip key={c} active={countries.includes(c)} onClick={() => setCountries((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
                                    {c}
                                  </ToggleChip>
                                ))}
                              </div>
                            </Field>
                            <Field id="keywords" label={f.keywords.label}>
                              <input id="keywords" name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={f.keywords.placeholder} className={inputCls} />
                            </Field>
                            <Field id="sizes" label={f.sizes.label} hint={f.sizes.hint}>
                              <div id="sizes" className="flex flex-wrap gap-2" role="group" aria-label={f.sizes.label}>
                                {sizeBands.map((b) => (
                                  <ToggleChip key={b.label} active={sizes.includes(b.label)} onClick={() => setSizes((p) => (p.includes(b.label) ? p.filter((x) => x !== b.label) : [...p, b.label]))}>
                                    {b.label}
                                  </ToggleChip>
                                ))}
                              </div>
                            </Field>
                            <Field id="selected" label={f.selected.label} hint={f.selected.hint}>
                              <div id="selected" className="rounded-[14px] bg-mist p-3">
                                {sel.selected.length ? (
                                  <ul className="flex flex-wrap gap-2">
                                    {sel.selected.map((c) => (
                                      <li key={c.id} className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-3 pr-1 text-[13.5px] ring-1 ring-ink/[0.08]">
                                        <span className="font-semibold">{c.name}</span>
                                        <span className="text-muted">{c.country}</span>
                                        <button type="button" onClick={() => sel.remove(c.id)} aria-label={`${c.name} 제외`} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-mist">
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="flex flex-col gap-2 text-[13.5px] text-muted sm:flex-row sm:items-center sm:justify-between">
                                    <span>{f.selected.empty}</span>
                                    <a href={f.selected.browse.href} className="shrink-0 font-semibold text-ink underline underline-offset-4">
                                      {f.selected.browse.label}
                                    </a>
                                  </p>
                                )}
                              </div>
                            </Field>
                          </>
                        )}

                        {step === 2 && (
                          <>
                            <Field id="overview" label={f.overview.label} required hint={f.overview.hint} error={show(2) ? errors.overview : ""}>
                              <textarea id="overview" name="overview" rows={5} value={overview} onChange={(e) => setOverview(e.target.value)} placeholder={f.overview.placeholder} className={cn(inputCls, "h-auto resize-y py-3 leading-[1.65]")} />
                            </Field>
                            <div className="grid gap-6 sm:grid-cols-2">
                              <Field id="schedule" label={f.schedule.label}>
                                <input id="schedule" name="schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder={f.schedule.placeholder} disabled={negotiable} className={cn(inputCls, "disabled:bg-mist disabled:text-muted")} />
                                <label className="flex items-center gap-2 text-[13.5px] text-ink/80">
                                  <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
                                  {f.schedule.negotiable}
                                </label>
                              </Field>
                              <Field id="budget" label={f.budget.label}>
                                <input id="budget" name="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={f.budget.placeholder} disabled={undecided} className={cn(inputCls, "disabled:bg-mist disabled:text-muted")} />
                                <label className="flex items-center gap-2 text-[13.5px] text-ink/80">
                                  <input type="checkbox" checked={undecided} onChange={(e) => setUndecided(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
                                  {f.budget.undecided}
                                </label>
                              </Field>
                            </div>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* 모바일 제안서 미리보기 (데스크톱은 왼쪽 고정) */}
                  <div className="lg:hidden">
                    <ProposalCard values={values} step={step} sent={sending || done} />
                  </div>

                  {/* 이동 */}
                  <div className="flex items-center gap-3">
                    {step > 0 ? (
                      <Button type="button" variant="ghost" size="lg" onClick={() => go(step - 1)} className="shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                        {campaign.nav.prev}
                      </Button>
                    ) : null}
                    {step < steps.length - 1 ? (
                      <Button type="button" variant="solid" size="lg" onClick={() => go(step + 1)} className="flex-1">
                        {campaign.nav.next}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" variant="brand" size="lg" className="flex-1" disabled={sending}>
                        {sending ? campaign.sending : campaign.submit}
                      </Button>
                    )}
                  </div>
                  <ul className="-mt-3 space-y-1 text-center text-[12.5px] leading-snug text-muted">
                    {campaign.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
