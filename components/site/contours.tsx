import { useMemo } from "react";

/** 인트로와 같은 절차적 등고선 — 섹션 배경 텍스처용 (currentColor, 아주 옅게 쓴다) */
function rings() {
  const out: string[] = [];
  const cx = 600;
  const cy = 420;
  const seed = (n: number) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let r = 1; r <= 11; r++) {
    const base = r * 62;
    const pts: [number, number][] = [];
    const N = 36;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const wobble = 1 + (seed(r * 100 + i) - 0.5) * 0.28 + Math.sin(a * 3 + r) * 0.06;
      pts.push([cx + Math.cos(a) * base * 1.7 * wobble, cy + Math.sin(a) * base * wobble]);
    }
    let d = "";
    for (let i = 0; i < N; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % N];
      const p2 = pts[(i + 2) % N];
      const mx = (p0[0] + p1[0]) / 2;
      const my = (p0[1] + p1[1]) / 2;
      const nx = (p1[0] + p2[0]) / 2;
      const ny = (p1[1] + p2[1]) / 2;
      d += i === 0 ? `M ${mx.toFixed(1)} ${my.toFixed(1)} ` : "";
      d += `Q ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)} `;
    }
    out.push(d + "Z");
  }
  return out;
}

export function Contours({ className }: { className?: string }) {
  const paths = useMemo(rings, []);
  return (
    <svg className={className} viewBox="0 0 1200 840" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  );
}
