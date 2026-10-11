"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { faq } from "@/content/landing";
import { cn } from "@/lib/utils";
import { EASE, Reveal } from "./reveal";
import { Section, SectionHeader } from "./section";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-paper">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeader index="07" kicker={faq.kicker} title={faq.title} className="lg:sticky lg:top-28 lg:self-start" />

        <Reveal delay={0.1}>
          <ul className="divide-y divide-line border-y border-line">
            {faq.items.map((it, i) => {
              const isOpen = open === i;
              const panelId = `faq-panel-${i}`;
              return (
                <li key={it.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left md:py-6"
                  >
                    <span className="text-[16.5px] font-bold leading-snug tracking-tight md:text-[18px]">
                      {it.q}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-ink/15 transition-transform duration-400 ease-[var(--ease-out-expo)]",
                        isOpen && "rotate-45 bg-ink text-white ring-ink"
                      )}
                      aria-hidden
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-[15.5px] leading-[1.75] text-muted">{it.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
