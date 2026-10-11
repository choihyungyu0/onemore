import Image from "next/image";
import { cn } from "@/lib/utils";

export type Ratio = "4/5" | "9/16" | "1/1" | "16/9" | "21/9" | "3/4";

/**
 * 이미지 자리 — `src`가 있으면 next/image(object-fit: cover), 없으면 색 블록 + 라벨.
 * 모든 이미지 영역이 이 컴포넌트를 통하므로 교체·톤 조정은 한 곳에서 끝납니다.
 * - `img-tone` 공통 클래스로 색감 통일(약한 웜톤 보정)
 * - `overlay` 로 하단 어두운 그라데이션(글자 대비 확보)
 */
const TONES: { bg: string; fg: string }[] = [
  { bg: "#1c2538", fg: "rgba(255,255,255,0.55)" }, // 네이비
  { bg: "#e8e0d2", fg: "rgba(11,18,32,0.5)" }, // 샌드
  { bg: "#f4d6cb", fg: "rgba(11,18,32,0.5)" }, // 코랄 틴트
  { bg: "#d4dbe6", fg: "rgba(11,18,32,0.5)" }, // 스틸
  { bg: "#dde4d8", fg: "rgba(11,18,32,0.5)" }, // 세이지
  { bg: "#2d3345", fg: "rgba(255,255,255,0.55)" }, // 차콜
];

const RATIO: Record<Ratio, string> = {
  "4/5": "4 / 5",
  "9/16": "9 / 16",
  "1/1": "1 / 1",
  "16/9": "16 / 9",
  "21/9": "21 / 9",
  "3/4": "3 / 4",
};

export function Placeholder({
  ratio = "4/5",
  ratioClassName,
  fill,
  tone = 0,
  label = "이미지 자리",
  src,
  alt = "",
  sizes,
  priority,
  overlay,
  className,
  children,
}: {
  ratio?: Ratio;
  /** 반응형 비율이 필요할 때 Tailwind aspect 클래스로 대체 (inline ratio 무시) */
  ratioClassName?: string;
  /** 부모를 꽉 채우는 배경 모드 */
  fill?: boolean;
  tone?: number;
  label?: string;
  src?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  /** 하단 어두운 오버레이 (글자 올릴 때) */
  overlay?: "bottom" | "full";
  className?: string;
  children?: React.ReactNode;
}) {
  const t = TONES[tone % TONES.length];
  const style = fill || ratioClassName ? { backgroundColor: t.bg } : { aspectRatio: RATIO[ratio], backgroundColor: t.bg };
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "absolute inset-0" : "w-full",
        ratioClassName,
        className
      )}
      style={style}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
          priority={priority}
          className="img-tone object-cover"
        />
      ) : (
        <div className="ph-pattern absolute inset-0 flex items-center justify-center" aria-hidden>
          <span
            className="font-display text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: t.fg }}
          >
            {label}
            {!fill && <span className="ml-2 opacity-70">{ratio}</span>}
          </span>
        </div>
      )}
      {overlay === "bottom" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink/85 via-ink/40 to-transparent"
        />
      )}
      {overlay === "full" && (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/65" />
      )}
      {children}
    </div>
  );
}
