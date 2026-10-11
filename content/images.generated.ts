/**
 * scripts/unsplash-download.mjs 가 생성하는 파일 — 직접 수정하지 마세요.
 * 슬롯별 저장 경로와 촬영자 크레딧. 비어 있으면 placeholder 색 블록이 표시됩니다.
 */
export type GeneratedImage = {
  src: string;
  width: number;
  height: number;
  photographer: string;
  username: string;
  photographerUrl: string;
  photoUrl: string;
};

export const generated: Record<string, GeneratedImage> = {};
