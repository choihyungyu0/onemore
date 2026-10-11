import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "brand" | "ghost" | "white" | "outline-white";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,color,box-shadow] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-white hover:bg-ink-2 hover:shadow-lift",
  brand: "bg-brand text-white hover:bg-brand-deep hover:shadow-lift",
  ghost:
    "bg-transparent text-ink ring-1 ring-inset ring-ink/15 hover:bg-ink/[0.04] hover:ring-ink/30",
  white: "bg-white text-ink hover:bg-cream hover:shadow-lift",
  "outline-white":
    "bg-transparent text-white ring-1 ring-inset ring-white/30 hover:bg-white/10 hover:ring-white/60",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function btnClass(variant: Variant = "solid", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: ComponentProps<"a"> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <a className={btnClass(variant, size, className)} {...rest}>
      {children}
    </a>
  );
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <button type={type} className={btnClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
