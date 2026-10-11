import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal, RevealLines, Lines } from "./reveal";

export function Section({
  id,
  className,
  inner,
  children,
}: {
  id?: string;
  className?: string;
  inner?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-20 px-5 py-20 sm:px-8 md:py-28 lg:px-12 lg:py-36",
        className
      )}
    >
      <div className={cn("mx-auto w-full max-w-[80rem]", inner)}>{children}</div>
    </section>
  );
}

/** 섹션 번호 + 캡션 (Syne 숫자, 작은 대문자 트래킹) */
export function Kicker({
  index,
  label,
  invert,
  className,
}: {
  index?: string;
  label: string;
  invert?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-[0.72rem] font-semibold tracking-[0.18em]",
        invert ? "text-white/60" : "text-muted",
        className
      )}
    >
      {index && (
        <>
          <span className="font-display text-[0.78rem] font-bold tracking-[0.1em] text-brand">
            {index}
          </span>
          <span
            className={cn("h-px w-6", invert ? "bg-white/25" : "bg-ink/20")}
            aria-hidden
          />
        </>
      )}
      <span>{label}</span>
    </span>
  );
}

export function SectionHeader({
  index,
  kicker,
  title,
  description,
  invert,
  align = "left",
  className,
  titleClassName,
}: {
  index?: string;
  kicker: string;
  title: string;
  description?: string;
  invert?: boolean;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Reveal>
        <Kicker index={index} label={kicker} invert={invert} />
      </Reveal>
      <RevealLines
        as="h2"
        text={title}
        className={cn(
          "display mt-5 block text-[clamp(2rem,4.6vw,3.75rem)]",
          invert ? "text-white" : "text-ink",
          titleClassName
        )}
      />
      {description && (
        <Reveal delay={0.12}>
          <p
            className={cn(
              "mt-6 max-w-xl text-[17px] leading-[1.7] md:text-lg",
              align === "center" && "mx-auto",
              invert ? "text-white/70" : "text-muted"
            )}
          >
            <Lines text={description} />
          </p>
        </Reveal>
      )}
    </div>
  );
}
