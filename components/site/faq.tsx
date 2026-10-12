"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { faq } from "@/content/landing";
import { cn } from "@/lib/utils";
import { FaqStage, FaqVignette } from "./faq-vignettes";
import { EASE, Reveal } from "./reveal";
import { Section, SectionHeader } from "./section";

/**
 * FAQ — 질문을 열면 왼쪽 스테이지에 그 답에 해당하는 UI 조각이 그려진다.
 * 오른쪽은 번호가 붙은 큰 질문 목록(아코디언), 모바일은 펼쳐진 답변 안에 조각을 작게 붙인다.
 * 목록 끝에는 캠페인 문의로 되돌리는 작은 버튼.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-paper">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeader index="07" kicker={faq.kicker} title={faq.title} />
          <div className="hidden lg:block">
            <FaqStage open={open} />
          </div>
        </div>

        <Reveal delay={0.1}>
          <ul className="divide-y divide-line border-y border-line">
            {faq.items.map((it, i) => {
              const isOpen = open === i;
              const panelId = `faq-panel-${i}`;
              return (
                <li key={it.q} className={cn("transition-colors duration-500", isOpen && "bg-white/60")}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="group flex w-full items-start gap-5 px-1 py-5 text-left md:py-6"
                  >
                    <span className={cn("font-display mt-1 w-7 shrink-0 text-[11px] font-bold tracking-[0.12em] transition-colors", isOpen ? "text-brand" : "text-ink/35")}>0{i + 1}</span>
                    <span className={cn("flex-1 text-[17px] font-bold leading-snug tracking-tight transition-colors md:text-[19px]", isOpen ? "text-ink" : "text-ink/80 group-hover:text-ink")}>
                      {it.q}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-ink/15 transition-[transform,background-color,color] duration-400 ease-[var(--ease-out-expo)]",
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
                        <div className="pb-6 pl-12 pr-1">
                          <p className="max-w-2xl text-[15.5px] leading-[1.75] text-muted">{it.a}</p>
                          {/* 모바일·태블릿: 답변 아래 조각 */}
                          <div className="mt-4 lg:hidden">
                            <FaqVignette index={i} compact />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-[14px] text-muted">{faq.more.lead}</p>
            <a href={faq.more.href} className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-bold text-white transition-transform duration-300 hover:scale-[1.03]">
              {faq.more.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
