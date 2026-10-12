"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { brand, nav } from "@/content/landing";
import { cn } from "@/lib/utils";
import { useLenis } from "lenis/react";
import { btnClass } from "./button";
import { Magnetic } from "./magnetic";
import { EASE } from "./reveal";
import { BrandMark } from "./brand-mark";

export function Logo({ className, invert }: { className?: string; invert?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className="h-7 w-7" />
      <span className={cn("text-[17px] font-extrabold tracking-[-0.03em]", invert ? "text-white" : "text-ink")}>
        {brand.name}
      </span>
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  const solid = scrolled && !open;

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "transition-[background-color,border-color,backdrop-filter] duration-300",
          solid
            ? "border-b border-line bg-white/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[80rem] items-center justify-between gap-6 px-5 sm:px-8 lg:h-[76px] lg:px-12">
          <a href="#top" aria-label={brand.name} className="flex items-center gap-3">
            <Logo />
            <span className="hidden text-[12px] text-muted xl:inline">| {brand.tagline}</span>
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
            {nav.links.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[14.5px] font-medium text-ink/75 transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <a href={nav.secondary.href} className={btnClass("ghost", "md", "h-10 px-4 text-[14px]")}>
              {nav.secondary.label}
            </a>
            <Magnetic strength={0.2}>
              <a href={nav.primary.href} className={btnClass("solid", "md", "h-10 px-4 text-[14px]")}>
                {nav.primary.label}
              </a>
            </Magnetic>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-ink/15 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 top-16 z-40 flex flex-col bg-white px-5 pb-8 pt-4 lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <ul className="flex flex-col divide-y divide-line">
              {nav.links.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: EASE }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-[22px] font-bold tracking-tight"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-2.5">
              <a href={nav.secondary.href} onClick={() => setOpen(false)} className={btnClass("ghost", "lg")}>
                {nav.secondary.label}
              </a>
              <a href={nav.primary.href} onClick={() => setOpen(false)} className={btnClass("solid", "lg")}>
                {nav.primary.label}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
