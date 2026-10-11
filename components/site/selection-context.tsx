"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { creators, type Creator } from "@/content/landing";

type Ctx = {
  selectedIds: string[];
  selected: Creator[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const SelectionContext = createContext<Ctx | null>(null);

/** 탐색 화면에서 고른 후보를 캠페인 폼까지 공유하는 전역 선택 상태 */
export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);
  const remove = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);
  const clear = useCallback(() => setSelectedIds([]), []);

  const value = useMemo<Ctx>(
    () => ({
      selectedIds,
      selected: selectedIds
        .map((id) => creators.find((c) => c.id === id))
        .filter((c): c is Creator => Boolean(c)),
      isSelected: (id) => selectedIds.includes(id),
      toggle,
      remove,
      clear,
    }),
    [selectedIds, toggle, remove, clear]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used inside <SelectionProvider>");
  return ctx;
}
