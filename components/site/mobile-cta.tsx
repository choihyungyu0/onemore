"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mobileCta } from "@/content/landing";
import { btnClass } from "./button";
import { EASE } from "./reveal";
import { useSelection } from "./selection-context";

/**
 * 모바일 하단 고정 CTA 바.
 * - 첫 화면을 지나면 등장
 * - 선택 바가 떠 있거나(선택 후보 있음), 신청 폼이 보일 때는 숨김
 */
export function MobileCta() {
  const sel = useSelection();
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById("campaign");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = pastHero && !formVisible && sel.selected.length === 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="mobile-cta"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden"
        >
          <div className="flex items-center gap-2">
            <a
              href={mobileCta.secondary.href}
              className={btnClass("ghost", "md", "h-12 shrink-0 px-4 text-[14px]")}
            >
              {mobileCta.secondary.label}
            </a>
            <a href={mobileCta.href} className={btnClass("brand", "md", "h-12 flex-1 text-[15px]")}>
              {mobileCta.label}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
