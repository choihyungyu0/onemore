import { marquee } from "@/content/landing";
import { ContentTile } from "./creator-card";

/** 해시태그 줄(오른쪽으로) + 콘텐츠 타일 줄(왼쪽으로)이 흐르는 밴드 */
export function Marquee() {
  const tags = [...marquee.hashtags, ...marquee.hashtags];
  const tiles = [...marquee.tiles, ...marquee.tiles];

  return (
    <section className="overflow-hidden bg-cream py-14 md:py-20" aria-label={marquee.label}>
      <p className="mb-8 px-5 text-center text-[12px] font-semibold text-muted sm:px-8">
        {marquee.label}
      </p>

      <div className="marquee-mask mb-5 w-full overflow-hidden">
        <div className="marquee-track marquee-right gap-2.5 pr-2.5">
          {tags.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-ink/75 ring-1 ring-ink/[0.06]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="marquee-mask w-full overflow-hidden py-3">
        <div className="marquee-track marquee-left gap-4 pr-4">
          {tiles.map((t, i) => (
            <ContentTile key={`${t.image}-${i}`} image={t.image} tone={t.tone} tag={t.tag} />
          ))}
        </div>
      </div>
    </section>
  );
}
