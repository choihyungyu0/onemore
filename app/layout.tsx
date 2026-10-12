import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Mona_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { brand, seo } from "@/content/landing";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Intro } from "@/components/site/intro";
import { Cursor } from "@/components/site/cursor";
import { ScrollProgress } from "@/components/site/scroll-progress";

// 한글 본문·헤드라인: Pretendard Variable (self-hosted, OFL)
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--font-pretendard",
  display: "swap",
  preload: true,
});

// 영문 디스플레이·캡션·숫자: Mona Sans (GitHub, OFL) — 가변 굵기 + 폭(wdth) 축
const mona = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

// 편집 디자인 느낌의 세리프 이탤릭 액센트: Instrument Serif (OFL)
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: seo.title,
  description: seo.description,
  applicationName: brand.name,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: seo.url,
    siteName: brand.name,
    title: seo.ogTitle,
    description: seo.ogDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.ogTitle,
    description: seo.ogDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/**
 * 첫 페인트 전에 실행 — 감속 모션이 아니면
 * html.preloading 을 붙여 히어로 CSS 진입 모션을 커튼이 걷힐 때까지 멈춰 둔다.
 */
const PRELOAD_SCRIPT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('preloading')}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${mona.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOAD_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <SmoothScroll>
          <Intro />
          {children}
        </SmoothScroll>
        <Cursor />
        <ScrollProgress />
      </body>
    </html>
  );
}
