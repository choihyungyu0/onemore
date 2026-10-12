import { brand, footer, imageCredits } from "@/content/landing";
import { Logo } from "./navbar";

export function Footer() {
  const year = new Date().getFullYear();
  // Unsplash 크레딧 — 촬영자 중복 제거
  const photographers = Array.from(
    new Map(Object.values(imageCredits).map((c) => [c.username, c])).values()
  );

  return (
    <footer className="bg-ink px-5 pb-28 pt-16 text-white sm:px-8 md:pb-16 lg:px-12 lg:pt-20">
      <div className="mx-auto max-w-[80rem]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo invert />
            <p className="mt-3 text-[14px] text-white/60">{brand.tagline}</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footer.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-[14px] text-white/75 transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-[12.5px] text-white/45 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-white/70">{footer.company.name}</span>
            {footer.company.items.map((it) => (
              <span key={it} className="before:mr-2 before:content-['·']">
                {it}
              </span>
            ))}
          </p>
          <p className="font-display text-[11px] tracking-[0.12em]">
            © {year} {footer.company.name}
          </p>
        </div>

        {photographers.length > 0 && (
          <p className="mt-4 text-[11.5px] leading-relaxed text-white/35">
            사진:{" "}
            {photographers.map((p, i) => (
              <span key={p.username}>
                <a href={p.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                  {p.photographer}
                </a>
                {i < photographers.length - 1 ? ", " : " "}
              </span>
            ))}
            on{" "}
            <a href="https://unsplash.com/?utm_source=onemore&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              Unsplash
            </a>
            {" · "}하늘 영상:{" "}
            <a href="https://mixkit.co/free-stock-video/clouds-moving-smoothly-in-the-sky-31459/" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              Mixkit
            </a>
            {", "}
            <a href="https://mixkit.co/free-stock-video/beautiful-coast-with-motorboats-and-a-pier-seen-from-the-5363/" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              Mixkit
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
