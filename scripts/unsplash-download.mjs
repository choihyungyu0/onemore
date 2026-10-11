/**
 * 선택한 Unsplash 사진 다운로드 → WebP 변환 → public/images/ 저장 → content/images.generated.ts 생성
 *
 *   node scripts/unsplash-download.mjs            # picks.json 기준 (없는 슬롯은 후보 #1)
 *   node scripts/unsplash-download.mjs hero-01    # 특정 슬롯만
 *
 * Unsplash API 가이드라인:
 *   1) links.download_location 을 먼저 호출(다운로드 집계)  2) urls.raw 로 원본 수신
 * 결과: 긴 변 1600px, 슬롯 비율로 크롭(cover/attention), WebP 품질 80
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const WORK = path.join(ROOT, "scripts", ".unsplash");
const OUT = path.join(ROOT, "public", "images");
const GENERATED = path.join(ROOT, "content", "images.generated.ts");

const SIZES = {
  "4/5": [1280, 1600],
  "16/9": [1600, 900],
  "21/9": [1600, 686],
  "1/1": [1600, 1600],
};

async function loadEnv() {
  const txt = await fs.readFile(path.join(ROOT, ".env.local"), "utf8").catch(() => "");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function readJson(p, fallback) {
  try {
    return JSON.parse(await fs.readFile(p, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  await loadEnv();
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error("UNSPLASH_ACCESS_KEY가 .env.local에 없습니다.");
  const only = process.argv.slice(2);

  const slots = await readJson(path.join(WORK, "candidates.json"), null);
  if (!slots) throw new Error("먼저 node scripts/unsplash-search.mjs 를 실행하세요.");
  const picks = await readJson(path.join(WORK, "picks.json"), {});
  const existing = await readJson(path.join(WORK, "generated.json"), {});
  await fs.mkdir(OUT, { recursive: true });

  const headers = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };
  const result = { ...existing };

  for (const slot of slots) {
    if (only.length && !only.includes(slot.name)) continue;
    const pick = picks[slot.name];
    let cand = null;
    if (typeof pick === "number") cand = slot.candidates[pick - 1];
    else if (typeof pick === "string") cand = slot.candidates.find((c) => c.id === pick);
    else cand = slot.candidates[0];
    if (!cand) {
      console.warn(`skip ${slot.name}: 후보 없음`);
      continue;
    }

    // 1) 다운로드 집계 엔드포인트 호출 (가이드라인 필수)
    const dl = await fetch(cand.download_location, { headers });
    if (!dl.ok) throw new Error(`download_location ${dl.status} (${slot.name})`);
    await dl.json().catch(() => null);

    // 2) 원본 수신 (raw + 최대 폭 제한)
    const rawUrl = `${cand.raw}${cand.raw.includes("?") ? "&" : "?"}fm=jpg&q=92&w=2400&fit=max`;
    const res = await fetch(rawUrl);
    if (!res.ok) throw new Error(`raw ${res.status} (${slot.name})`);
    const buf = Buffer.from(await res.arrayBuffer());

    // 3) 리사이즈·크롭·WebP
    const [w, h] = SIZES[slot.ratio] ?? SIZES["4/5"];
    const file = `${slot.name}.webp`;
    await sharp(buf)
      .rotate()
      .resize(w, h, { fit: "cover", position: "attention" })
      .webp({ quality: 80 })
      .toFile(path.join(OUT, file));

    result[slot.name] = {
      src: `/images/${file}`,
      width: w,
      height: h,
      photographer: cand.user.name,
      username: cand.user.username,
      photographerUrl: `${cand.user.link}?utm_source=onemore&utm_medium=referral`,
      photoUrl: `${cand.html}?utm_source=onemore&utm_medium=referral`,
      id: cand.id,
    };
    console.log(`✓ ${slot.name} ← ${cand.id} by ${cand.user.name}`);
  }

  await fs.writeFile(path.join(WORK, "generated.json"), JSON.stringify(result, null, 2));

  const body = Object.entries(result)
    .map(
      ([k, v]) =>
        `  ${JSON.stringify(k)}: { src: ${JSON.stringify(v.src)}, width: ${v.width}, height: ${v.height}, photographer: ${JSON.stringify(v.photographer)}, username: ${JSON.stringify(v.username)}, photographerUrl: ${JSON.stringify(v.photographerUrl)}, photoUrl: ${JSON.stringify(v.photoUrl)} },`
    )
    .join("\n");
  const ts = `/**
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

export const generated: Record<string, GeneratedImage> = {
${body}
};
`;
  await fs.writeFile(GENERATED, ts);
  console.log(`content/images.generated.ts 갱신 (${Object.keys(result).length} slots)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
