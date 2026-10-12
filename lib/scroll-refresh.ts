import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

let timer = 0;

/**
 * ScrollTrigger 재계산을 한곳에서 모아 실행한다 (120ms 안에 들어온 요청은 한 번으로).
 * 재계산은 핀된 요소를 잠깐 떼었다 붙여 측정하므로(그 안의 CSS 애니메이션이 처음부터 다시 재생됨)
 * 섹션마다 따로 부르면 첫 화면이 여러 번 "다시 로딩"되는 것처럼 보인다.
 */
export function scheduleRefresh() {
  if (typeof window === "undefined") return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, 120);
}
