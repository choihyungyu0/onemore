"use client";

import { creators, how } from "@/content/landing";
import { CreatorRing } from "./creator-ring";
import { Lines } from "./reveal";

/**
 * 매칭 1단계 "찾아보기" — 전폭 3D 링(imersion.io 구도)이 섹션을 연다.
 * 화면에 고정된 채 스크롤로 돌고, 정면 카드를 누르면 그 나라로 크리에이터 찾기가 실행된다.
 * 2~4단계는 이어지는 HowScrub(from={1})가 맡는다. 데스크톱 전용.
 */
export function HowRing() {
  const s = how.steps[0];
  const total = how.steps.length;
  return (
    <CreatorRing
      variant="pinned"
      list={creators}
      className="how-ring pt-6"
      header={
        <div className="flex items-end justify-between gap-10 pb-6">
          <div>
            <p className="kicker text-brand">
              STEP 1 / {total}
            </p>
            <div className="mt-3 flex items-baseline gap-5">
              <span className="font-display block text-[clamp(3rem,5.5vw,4.5rem)] font-extrabold leading-none tracking-[-0.06em] text-ink">
                01
              </span>
              <h3 className="display-md text-[clamp(1.9rem,3.2vw,2.8rem)] text-ink">{s.title}</h3>
            </div>
          </div>
          <div className="max-w-md pb-1 text-right">
            <p className="text-[16px] leading-[1.7] text-muted">
              <Lines text={s.description} />
            </p>
            <p className="mt-2 text-[12.5px] text-muted/80">{how.ringHint}</p>
          </div>
        </div>
      }
    />
  );
}
