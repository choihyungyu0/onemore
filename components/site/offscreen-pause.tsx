"use client";

import { useEffect } from "react";

/**
 * 화면 밖 섹션의 CSS 애니메이션 일시정지.
 * 깜빡임·핑·마퀴 같은 무한 애니메이션이 페이지 전체에 60개 넘게 깔려 있어, 보이지 않는 섹션 것까지 매 프레임 스타일을
 * 다시 계산하게 만들었다(가만히 있어도 초당 60회). 메인의 직계 자식(섹션·핀 래퍼)이 뷰포트(여유 25%) 밖이면
 * .off 를 붙이고, CSS(globals: .off *)가 그 안의 애니메이션을 멈춘다. 들어오면 이어서 재생된다.
 */
export function OffscreenPause() {
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) (e.target as HTMLElement).classList.toggle("off", !e.isIntersecting);
      },
      { rootMargin: "25% 0px" }
    );
    const observeAll = () => {
      for (const el of Array.from(main.children)) io.observe(el);
    };
    observeAll();
    // ScrollTrigger 핀이 섹션을 pin-spacer 로 감싸면 직계 자식이 바뀐다 → 다시 관찰
    const mo = new MutationObserver(() => {
      io.disconnect();
      for (const el of Array.from(main.querySelectorAll(".off"))) el.classList.remove("off");
      observeAll();
    });
    mo.observe(main, { childList: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      for (const el of Array.from(main.querySelectorAll(".off"))) el.classList.remove("off");
    };
  }, []);
  return null;
}
