# 워홀원모어 — 브랜드용 랜딩페이지

해외에서 활동하는 한국인 크리에이터와 브랜드를 연결하는 인플루언서 시딩·매칭 서비스(주식회사 오엠엘) 랜딩페이지.

## 실행

```bash
npm install
npm run dev
```

## 구조

- `content/landing.ts` — **모든 카피·링크·예시 프로필**. 문구 교체는 이 파일만 수정.
- `components/site/placeholder.tsx` — 이미지 자리 컴포넌트. `src`를 넘기면 `next/image`로 전환.
- `components/site/*` — 섹션 컴포넌트 (hero → marquee → discover → how → growth → empathy → campaign-form → creator-join → faq → finale → footer).
- `components/site/selection-context.tsx` — 탐색 화면에서 고른 후보를 신청 폼까지 공유.
- `app/layout.tsx` — SEO 메타데이터(검색 제목·설명·공유 미리보기), 폰트(Pretendard + Syne).

## 아직 연결 전인 것

- 폼 제출: `console.log` + 접수 완료 화면까지만. 백엔드 연동 시 `campaign-form.tsx`의 `onSubmit` 교체.
- 크리에이터 참여 신청 링크: `content/landing.ts`의 `creatorJoin.cta.href`.
- 푸터 회사 정보(대표자명·사업자등록번호·소재지·이메일): `content/landing.ts`의 `footer.company.items`.
- 배포 도메인: `content/landing.ts`의 `seo.url`.
