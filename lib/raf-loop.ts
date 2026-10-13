/**
 * 필요할 때만 도는 rAF 루프.
 * 사이트의 마우스 시차·커서·마퀴 같은 보간 루프가 "항상" 돌면, 값이 하나도 안 바뀌어도 매 프레임 스타일 재계산·레이아웃이 일어나
 * 가만히 있어도 메인 스레드가 초당 수십 번 일한다(모바일 발열·버벅임의 원인). 그래서
 *  - step()이 false를 돌려주면(목표에 도달) 루프를 멈추고, kick()으로 다시 깨운다
 *  - whenInView()로 섹션이 화면에 있을 때만 돌린다
 *  - 마우스 시차는 pointer: fine 환경에서만 의미가 있다
 */
export function createLoop(step: (dt: number) => boolean) {
  let raf = 0;
  let last = 0;
  const tick = (t: number) => {
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
    last = t;
    raf = step(dt) ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  };
  return {
    kick() {
      if (!raf) raf = requestAnimationFrame(tick);
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    },
    get running() {
      return raf !== 0;
    },
  };
}

/** 섹션이 뷰포트(여유 10%) 안에 있는지 콜백. 해제 함수를 돌려준다 */
export function whenInView(el: Element, cb: (visible: boolean) => void, rootMargin = "10% 0px") {
  const io = new IntersectionObserver((es) => cb(es.some((e) => e.isIntersecting)), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

export function isFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

/** 보간이 사실상 끝났는지 (목표와 현재 차이가 작으면 true) */
export function settled(a: number, b: number, eps = 0.0005) {
  return Math.abs(a - b) < eps;
}
