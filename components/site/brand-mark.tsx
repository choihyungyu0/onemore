import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * 워홀원모어 마스코트 마크 — 지구본 위 파일럿 캐릭터(브랜드 프로필 아이콘)를 벡터로 옮긴 것.
 * 같은 도형이 app/icon.svg(파비콘, 둥근 사각)과 public/brand/mark.svg(원형)에도 들어 있다 — 바꿀 때 함께 수정.
 * shape: circle(기본, 내비·본문) | square(앱 아이콘 느낌)
 */
export const MARK_SKY = "#3AB4E9";
export const MARK_NAVY = "#0B2B6C";
const INK = "#111111";

export function BrandMark({
  className,
  shape = "circle",
  title,
}: {
  className?: string;
  shape?: "circle" | "square";
  title?: string;
}) {
  const id = `mk${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 900 900"
      className={cn("block shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={id}>
          {shape === "square" ? <rect width="900" height="900" rx="190" /> : <circle cx="450" cy="450" r="450" />}
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="900" height="900" fill={MARK_SKY} />
        <g fill="none" stroke="#fff" strokeWidth="24" strokeLinecap="round">
          <circle cx="450" cy="460" r="400" />
          <ellipse cx="450" cy="460" rx="268" ry="400" />
          <path d="M 70 262 Q 450 96 830 262" />
          <path d="M 50 452 Q 450 436 850 452" />
          <path d="M 66 626 Q 450 760 834 626" />
        </g>
      </g>
      <g transform="rotate(-6 450 470)">
        <ellipse cx="352" cy="492" rx="118" ry="182" fill="#fff" />
        <ellipse cx="566" cy="466" rx="112" ry="166" fill="#fff" />
        <ellipse cx="380" cy="474" rx="56" ry="86" fill={INK} />
        <ellipse cx="546" cy="462" rx="52" ry="80" fill={INK} />
      </g>
      <g transform="rotate(-5 445 276)">
        <ellipse cx="440" cy="222" rx="258" ry="112" fill={MARK_NAVY} />
        <path d="M 184 222 L 696 222 L 690 292 Q 450 246 190 318 Z" fill={MARK_NAVY} />
        <path d="M 236 312 Q 445 332 654 312 Q 445 410 236 312 Z" fill={MARK_NAVY} />
        <rect x="265" y="250" width="360" height="60" rx="22" fill="#fff" />
        <circle cx="445" cy="186" r="24" fill="#fff" />
        <g stroke="#fff" strokeWidth="14" strokeLinecap="round">
          <path d="M 404 168 L 338 158" />
          <path d="M 404 186 L 346 184" />
          <path d="M 404 204 L 356 208" />
          <path d="M 486 168 L 552 158" />
          <path d="M 486 186 L 544 184" />
          <path d="M 486 204 L 534 208" />
        </g>
      </g>
      <g fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round">
        <path d="M 440 650 Q 482 706 526 654" />
        <path d="M 222 636 Q 292 642 332 692" />
        <path d="M 602 668 Q 662 652 722 598" />
      </g>
    </svg>
  );
}
