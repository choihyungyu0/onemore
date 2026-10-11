"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** 스크롤 진입 시 페이드 + 상승. 감속 모션 환경에서는 비활성. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 줄 단위 상승 리빌 — "\n"으로 나뉜 각 줄이 순차적으로 떠오름.
 * 큰 디스플레이 헤드라인용. as="h1"/"h2" 로 실제 heading 태그를 지정.
 */
export function RevealLines({
  text,
  className,
  lineClassName,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: ElementType;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");

  if (reduce) {
    return (
      <Tag className={className}>
        {lines.map((l, i) => (
          <span key={i} className={cn("block", lineClassName)}>
            {l}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={cn("block", lineClassName)}
            initial={{ opacity: 0, y: "60%" }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: delay + i * 0.1, ease: EASE }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** "\n" 줄바꿈을 <br/>로 렌더링하는 작은 헬퍼 (모션 없음) */
export function Lines({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i}>
          {l}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}
