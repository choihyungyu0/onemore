"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Lock, Mail, Send } from "lucide-react";
import { creators, faq, images, sizeBands } from "@/content/landing";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { formatFollowers } from "./creator-card";
import { Placeholder } from "./placeholder";
import { EASE } from "./reveal";

/**
 * FAQ 답변 스테이지 — 질문을 열면 그 질문에 맞는 UI 조각이 카드로 나타난다.
 * 0 팔로워 범위가 넓어짐 / 1 여러 명 선택 + 선택 바 / 2 선택→제안→확인→확정 진행 / 3 제공 조건 칩
 * 4 받는 크리에이터만 비운 제안서 / 5 캠페인 내용 → 비용 안내 봉투 / 6 연락처 자물쇠 + 오엠엘 전달
 * 데스크톱은 왼쪽 고정 스테이지, 모바일은 펼쳐진 답변 안에 작게.
 */
export function FaqStage({ open }: { open: number | null }) {
  const v = open === null ? null : faq.vignettes[open];
  return (
    <div className="faq-stage relative mt-10 overflow-hidden rounded-[22px] bg-white p-5 shadow-lift ring-1 ring-ink/[0.05]">
      <div className="flex items-center justify-between">
        <span className="kicker text-[10px] text-ink/50">{faq.stageLabel}</span>
        <span className="kicker tnum text-[10px] text-brand">
          {open === null ? "— / 0" + faq.items.length : `0${open + 1} / 0${faq.items.length}`}
        </span>
      </div>
      <div className="relative mt-4 h-[280px]">
        <AnimatePresence mode="wait" initial={false}>
          {open === null ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex h-full items-center justify-center text-[13.5px] text-muted">
              {faq.stageIdle}
            </motion.div>
          ) : (
            <motion.div
              key={open}
              initial={{ opacity: 0, rotateY: -10, x: 14 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: 8, x: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ transformPerspective: 900 }}
              className="h-full"
            >
              <FaqVignette index={open} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {v && (
        <p className="mt-4 flex items-center gap-2 text-[12.5px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
          {v.caption}
        </p>
      )}
    </div>
  );
}

export function FaqVignette({ index, compact }: { index: number; compact?: boolean }) {
  const V = [VRange, VMulti, VSteps, VTerms, VProposal, VEnvelope, VContact][index] ?? VRange;
  return (
    <div className={cn("flex h-full flex-col justify-center", compact && "faq-compact")}>
      <V />
    </div>
  );
}

/* ---------- 조각 ---------- */
function Pop({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={cn("chat-pop", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Avatar({ i, size = "h-8 w-8" }: { i: number; size?: string }) {
  const c = creators[i % creators.length];
  const im = images[c.image];
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-card", size)}>
      <Placeholder fill tone={c.tone} src={im.src} alt="" sizes="40px" />
    </span>
  );
}

/** 0 — 팔로워 범위가 3천 이하에서 10만 초과까지 넓어진다 */
function VRange() {
  const t = faq.vignettes[0];
  return (
    <div className="rounded-[14px] bg-paper p-4 ring-1 ring-ink/[0.05]">
      <p className="kicker text-[9.5px] text-ink/45">{t.label}</p>
      <div className="relative mt-4 h-2 rounded-full bg-ink/[0.07]">
        <span className="faq-grow absolute inset-y-0 left-0 rounded-full bg-brand" />
        <span className="faq-knob absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-2 ring-brand shadow-card" />
      </div>
      <div className="mt-2.5 flex justify-between text-[10.5px] text-muted">
        {sizeBands.map((b) => (
          <span key={b.label}>{b.label}</span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {sizeBands.map((b, i) => (
          <Pop key={b.label} delay={300 + i * 120}>
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-ink px-2.5 text-[11px] font-semibold text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
              {b.label}
            </span>
          </Pop>
        ))}
      </div>
    </div>
  );
}

/** 1 — 카드 3장이 차례로 체크되고 선택 바가 올라온다 */
function VMulti() {
  const t = faq.vignettes[1];
  return (
    <div className="relative rounded-[14px] bg-paper p-4 pb-16 ring-1 ring-ink/[0.05]">
      <p className="kicker text-[9.5px] text-ink/45">{t.label}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => {
          const c = creators[i];
          const im = images[c.image];
          return (
            <div key={c.id} className="relative overflow-hidden rounded-[10px] bg-white ring-2 ring-brand">
              <Placeholder ratioClassName="aspect-[4/3]" tone={c.tone} src={im.src} alt="" sizes="140px" />
              <Pop delay={250 + i * 260} className="absolute right-1.5 top-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              </Pop>
              <div className="px-2 py-1.5">
                <p className="text-[11px] font-bold tracking-tight">{c.name}</p>
                <p className="text-[9.5px] text-muted">{formatFollowers(c.followers)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <Pop delay={1100} className="absolute inset-x-3 bottom-3">
        <div className="flex items-center justify-between rounded-[12px] bg-ink px-3.5 py-2 text-white shadow-lift">
          <span className="text-[12px] font-bold">{t.bar}</span>
          <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold">{t.cta}</span>
        </div>
      </Pop>
    </div>
  );
}

/** 2 — 선택 → 제안 전달 → 참여 의사 확인 → 매칭 확정, 첫 칸만 켜짐 */
function VSteps() {
  const t = faq.vignettes[2];
  return (
    <div className="rounded-[14px] bg-paper p-4 ring-1 ring-ink/[0.05]">
      <p className="kicker text-[9.5px] text-ink/45">{t.label}</p>
      <ol className="mt-5 grid grid-cols-4 gap-2">
        {(t.steps ?? []).map((s, i) => (
          <li key={s} className="relative">
            {i < (t.steps ?? []).length - 1 && <span className="absolute left-[calc(50%+14px)] right-[calc(-50%+14px)] top-[14px] h-px bg-ink/15" aria-hidden />}
            <Pop delay={150 + i * 180} className="flex flex-col items-center gap-2 text-center">
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full font-display text-[10px] font-bold", i === 0 ? "bg-brand text-white" : "bg-white text-ink/50 ring-1 ring-ink/15")}>
                {i === 0 ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("text-[11px] font-semibold leading-tight", i === 0 ? "text-ink" : "text-muted")}>{s}</span>
            </Pop>
          </li>
        ))}
      </ol>
      <Pop delay={900} className="mt-5">
        <p className="rounded-[10px] bg-white px-3 py-2 text-[12px] text-ink/80 ring-1 ring-ink/[0.06]">{t.note}</p>
      </Pop>
    </div>
  );
}

/** 3 — 제공 조건 칩 */
function VTerms() {
  const t = faq.vignettes[3];
  return (
    <div className="rounded-[14px] bg-paper p-4 ring-1 ring-ink/[0.05]">
      <p className="kicker text-[9.5px] text-ink/45">{t.label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(t.terms ?? []).map((term, i) => (
          <Pop key={term} delay={150 + i * 160}>
            <span className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold", i === 0 ? "bg-ink text-white" : "bg-white text-ink/75 ring-1 ring-inset ring-ink/12")}>
              {i === 0 && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              {term}
            </span>
          </Pop>
        ))}
      </div>
      <Pop delay={800} className="mt-5 flex items-center gap-3 rounded-[12px] bg-white p-3 ring-1 ring-ink/[0.06]">
        <Avatar i={1} />
        <span className="text-[12px] leading-snug text-ink/80">{t.note}</span>
      </Pop>
    </div>
  );
}

/** 4 — 받는 크리에이터만 비운 제안서 */
function VProposal() {
  const t = faq.vignettes[4];
  return (
    <div className="rounded-[14px] bg-paper p-4 ring-1 ring-ink/[0.05]">
      <div className="flex items-center gap-2">
        <BrandMark className="h-5 w-5" />
        <span className="kicker text-[9.5px] text-ink/45">{t.label}</span>
      </div>
      <dl className="mt-3 flex flex-col divide-y divide-ink/[0.06]">
        {(t.rows ?? []).map(([k, val], i) => (
          <Pop key={k} delay={120 + i * 110} className="grid grid-cols-[84px_1fr] items-center gap-2 py-2">
            <dt className="text-[10.5px] font-semibold text-muted">{k}</dt>
            <dd className="text-[12px] font-semibold text-ink">{val}</dd>
          </Pop>
        ))}
        <Pop delay={600} className="grid grid-cols-[84px_1fr] items-center gap-2 py-2">
          <dt className="text-[10.5px] font-semibold text-muted">{t.emptyKey}</dt>
          <dd className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full border border-dashed border-ink/25 proposal-blink" aria-hidden />
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10.5px] font-semibold text-brand">{t.emptyBadge}</span>
          </dd>
        </Pop>
      </dl>
    </div>
  );
}

/** 5 — 캠페인 내용을 보내면 진행 방식·비용 안내가 돌아온다 */
function VEnvelope() {
  const t = faq.vignettes[5];
  return (
    <div className="rounded-[14px] bg-paper p-4 ring-1 ring-ink/[0.05]">
      <p className="kicker text-[9.5px] text-ink/45">{t.label}</p>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Pop delay={100}>
          <div className="rounded-[12px] bg-ink p-3 text-white">
            <Mail className="h-4 w-4 text-brand" />
            <p className="mt-2 text-[12px] font-bold">{t.send}</p>
            <p className="mt-1 text-[10.5px] text-white/70">{t.sendHint}</p>
          </div>
        </Pop>
        <Pop delay={500}>
          <ArrowRight className="h-5 w-5 text-brand" />
        </Pop>
        <Pop delay={800}>
          <div className="rounded-[12px] bg-white p-3 ring-1 ring-ink/[0.06]">
            <span className="flex items-center gap-1.5">
              <BrandMark className="h-4 w-4" />
              <span className="kicker text-[9px] text-brand">{t.replyFrom}</span>
            </span>
            <p className="mt-2 text-[12px] font-bold text-ink">{t.reply}</p>
            <p className="mt-1 text-[10.5px] text-muted">{t.replyHint}</p>
          </div>
        </Pop>
      </div>
      <Pop delay={1200} className="mt-4">
        <p className="text-[12px] text-ink/80">{t.note}</p>
      </Pop>
    </div>
  );
}

/** 6 — 연락처는 잠기고, 오엠엘가 제안을 전달한다 */
function VContact() {
  const t = faq.vignettes[6];
  return (
    <div className="rounded-[14px] bg-paper p-4 ring-1 ring-ink/[0.05]">
      <p className="kicker text-[9.5px] text-ink/45">{t.label}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Pop delay={100} className="flex flex-col items-center gap-1.5">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-[12px] bg-white ring-1 ring-ink/[0.08]">
            <span className="text-[10px] font-bold text-ink/60">010-</span>
            <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white ring-2 ring-paper">
              <Lock className="h-3 w-3" />
            </span>
          </span>
          <span className="text-[10.5px] font-semibold text-muted">{t.locked}</span>
        </Pop>
        <Pop delay={400} className="flex flex-1 items-center">
          <span className="faq-dash h-px flex-1 bg-ink/20" />
        </Pop>
        <Pop delay={600} className="flex flex-col items-center gap-1.5">
          <BrandMark className="h-12 w-12 rounded-full shadow-card ring-2 ring-white" />
          <span className="text-[10.5px] font-semibold text-ink">{t.via}</span>
        </Pop>
        <Pop delay={800} className="flex flex-1 items-center">
          <span className="faq-dash h-px flex-1 bg-brand" />
          <Send className="ml-1 h-3.5 w-3.5 text-brand" />
        </Pop>
        <Pop delay={1000} className="flex flex-col items-center gap-1.5">
          <Avatar i={0} size="h-12 w-12" />
          <span className="text-[10.5px] font-semibold text-muted">{t.to}</span>
        </Pop>
      </div>
      <Pop delay={1300} className="mt-5">
        <p className="rounded-[10px] bg-white px-3 py-2 text-[12px] text-ink/80 ring-1 ring-ink/[0.06]">{t.note}</p>
      </Pop>
    </div>
  );
}
