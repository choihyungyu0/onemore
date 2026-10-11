"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { campaign, sizeBands, type Country } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "./button";
import { EASE, Lines, Reveal } from "./reveal";
import { Section, SectionHeader } from "./section";
import { useSelection } from "./selection-context";

const inputCls =
  "h-12 w-full rounded-[14px] border border-ink/12 bg-white px-4 text-[15.5px] text-ink placeholder:text-muted/70 transition-colors focus:border-ink focus:outline-none";

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-center gap-2 text-[14px] font-bold text-ink">
        {label}
        {required && (
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-deep">
            {campaign.requiredBadge}
          </span>
        )}
      </label>
      {hint && <p className="-mt-1 text-[13px] text-muted">{hint}</p>}
      {children}
    </div>
  );
}

function ToggleChip({
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
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition-colors",
        active ? "bg-ink text-white" : "bg-white text-ink/75 ring-1 ring-inset ring-ink/12 hover:ring-ink/30"
      )}
    >
      {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}

export function CampaignForm() {
  const sel = useSelection();
  const f = campaign.fields;
  const [countries, setCountries] = useState<Country[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [negotiable, setNegotiable] = useState(false);
  const [undecided, setUndecided] = useState(false);
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      brand: fd.get("brand"),
      manager: fd.get("manager"),
      email: fd.get("email"),
      link: fd.get("link"),
      countries,
      keywords: fd.get("keywords"),
      sizes,
      selectedCreators: sel.selected.map((c) => ({ id: c.id, name: c.name })),
      overview: fd.get("overview"),
      schedule: negotiable ? f.schedule.negotiable : fd.get("schedule"),
      budget: undecided ? f.budget.undecided : fd.get("budget"),
      submittedAt: new Date().toISOString(),
    };
    // 백엔드 연동 전: 콘솔 출력까지만
    console.log("[campaign-request]", payload);
    setDone(true);
  }

  return (
    <Section id="campaign" className="bg-brand text-ink">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            index="05"
            kicker={campaign.kicker}
            title={campaign.title}
            description={campaign.description}
            titleClassName="text-white"
            className="[&_.kicker]:text-white/70 [&_p]:text-white/85 [&_span]:text-white/80"
          />
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[28px] bg-white p-6 shadow-lift sm:p-8 lg:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="py-6 text-center sm:py-10"
                >
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
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={onSubmit}
                  className="flex flex-col gap-6"
                  noValidate={false}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field id="brand" label={f.brand.label} required>
                      <input id="brand" name="brand" required placeholder={f.brand.placeholder} className={inputCls} />
                    </Field>
                    <Field id="manager" label={f.manager.label} required>
                      <input id="manager" name="manager" required placeholder={f.manager.placeholder} className={inputCls} />
                    </Field>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field id="email" label={f.email.label} required>
                      <input id="email" name="email" type="email" required placeholder={f.email.placeholder} className={inputCls} />
                    </Field>
                    <Field id="link" label={f.link.label}>
                      <input id="link" name="link" type="url" placeholder={f.link.placeholder} className={inputCls} />
                    </Field>
                  </div>

                  <Field id="countries" label={f.countries.label} hint={f.countries.hint}>
                    <div id="countries" className="flex flex-wrap gap-2" role="group" aria-label={f.countries.label}>
                      {f.countries.options.map((c) => (
                        <ToggleChip
                          key={c}
                          active={countries.includes(c)}
                          onClick={() =>
                            setCountries((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))
                          }
                        >
                          {c}
                        </ToggleChip>
                      ))}
                    </div>
                  </Field>

                  <Field id="keywords" label={f.keywords.label}>
                    <input id="keywords" name="keywords" placeholder={f.keywords.placeholder} className={inputCls} />
                  </Field>

                  <Field id="sizes" label={f.sizes.label} hint={f.sizes.hint}>
                    <div id="sizes" className="flex flex-wrap gap-2" role="group" aria-label={f.sizes.label}>
                      {sizeBands.map((b) => (
                        <ToggleChip
                          key={b.label}
                          active={sizes.includes(b.label)}
                          onClick={() =>
                            setSizes((p) => (p.includes(b.label) ? p.filter((x) => x !== b.label) : [...p, b.label]))
                          }
                        >
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
                            <li
                              key={c.id}
                              className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-3 pr-1 text-[13.5px] ring-1 ring-ink/[0.08]"
                            >
                              <span className="font-semibold">{c.name}</span>
                              <span className="text-muted">{c.country}</span>
                              <button
                                type="button"
                                onClick={() => sel.remove(c.id)}
                                aria-label={`${c.name} 제외`}
                                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-mist"
                              >
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

                  <Field id="overview" label={f.overview.label} required hint={f.overview.hint}>
                    <textarea
                      id="overview"
                      name="overview"
                      required
                      rows={5}
                      placeholder={f.overview.placeholder}
                      className={cn(inputCls, "h-auto resize-y py-3 leading-[1.65]")}
                    />
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field id="schedule" label={f.schedule.label}>
                      <input
                        id="schedule"
                        name="schedule"
                        placeholder={f.schedule.placeholder}
                        disabled={negotiable}
                        className={cn(inputCls, "disabled:bg-mist disabled:text-muted")}
                      />
                      <label className="flex items-center gap-2 text-[13.5px] text-ink/80">
                        <input
                          type="checkbox"
                          checked={negotiable}
                          onChange={(e) => setNegotiable(e.target.checked)}
                          className="h-4 w-4 accent-[var(--brand)]"
                        />
                        {f.schedule.negotiable}
                      </label>
                    </Field>
                    <Field id="budget" label={f.budget.label}>
                      <input
                        id="budget"
                        name="budget"
                        placeholder={f.budget.placeholder}
                        disabled={undecided}
                        className={cn(inputCls, "disabled:bg-mist disabled:text-muted")}
                      />
                      <label className="flex items-center gap-2 text-[13.5px] text-ink/80">
                        <input
                          type="checkbox"
                          checked={undecided}
                          onChange={(e) => setUndecided(e.target.checked)}
                          className="h-4 w-4 accent-[var(--brand)]"
                        />
                        {f.budget.undecided}
                      </label>
                    </Field>
                  </div>

                  <div className="mt-2">
                    <Button type="submit" variant="brand" size="lg" className="w-full">
                      {campaign.submit}
                    </Button>
                    <ul className="mt-4 space-y-1 text-center text-[12.5px] leading-snug text-muted">
                      {campaign.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
