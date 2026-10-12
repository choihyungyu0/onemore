/**
 * Unsplash 검색 → 후보 선별 → 썸네일 컨택트 시트 생성
 *
 *   node scripts/unsplash-search.mjs
 *
 * - .env.local 의 UNSPLASH_ACCESS_KEY 사용
 * - 검색어마다 30장 받아 휴리스틱(정면 얼굴 의심 문구·차가운 톤·가로세로)으로 거른 뒤
 *   슬롯당 상위 6장을 scripts/.unsplash/candidates.json 에 저장
 * - 슬롯당 후보 썸네일을 모아 scripts/.unsplash/sheet-N.jpg 컨택트 시트 생성 (사람이 최종 확인)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { SLOTS } from "./unsplash-slots.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORK = path.join(ROOT, "scripts", ".unsplash");
const THUMBS = path.join(WORK, "thumbs");

async function loadEnv() {
  const p = path.join(ROOT, ".env.local");
  const txt = await fs.readFile(p, "utf8").catch(() => "");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const FACE_RE =
  /portrait|selfie|smil|\bface\b|looking at (the )?camera|headshot|close[- ]up of (a|an) (man|woman|person|girl|boy)|posing|eye contact|laughing/i;
const LOGO_RE = /logo|brand|coca|starbucks|apple store|nike|adidas|mcdonald/i;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** 따뜻한 톤 점수: R-B 차이(양수=웜). 너무 어두운/차가운 사진 감점 */
function warmth(hex) {
  const [r, g, b] = hexToRgb(hex || "#808080");
  return (r - b) / 255 + (r + g) / 2 / 255 - b / 255 * 0.5;
}

function score(p, slot) {
  const text = `${p.description ?? ""} ${p.alt_description ?? ""} ${(p.tags ?? []).map((t) => t.title).join(" ")}`;
  if (!slot.allowFaces && FACE_RE.test(text)) return null;
  if (LOGO_RE.test(text)) return null;
  const [r, , b] = hexToRgb(p.color || "#808080");
  if (!slot.allowBlue && b > r + 24) return null; // 뚜렷한 블루 톤 제외 (allowBlue 슬롯은 예외)
  const portrait = p.height >= p.width * 1.1;
  const square = Math.abs(p.height - p.width) < p.width * 0.1;
  let s = warmth(p.color) * 2;
  if (slot.ratio === "4/5") s += portrait ? 1 : square ? 0.6 : -1;
  else s += portrait ? -1 : 0.5;
  s += Math.min(p.likes ?? 0, 500) / 1000;
  return s;
}

async function search(query, orientation) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "30");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("content_filter", "high");
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`, "Accept-Version": "v1" },
  });
  const limit = res.headers.get("x-ratelimit-remaining");
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${query}) — ${await res.text()}`);
  const json = await res.json();
  return { results: json.results ?? [], remaining: limit };
}

async function fetchThumb(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`thumb ${res.status}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  await loadEnv();
  if (!process.env.UNSPLASH_ACCESS_KEY) throw new Error("UNSPLASH_ACCESS_KEY가 .env.local에 없습니다.");
  await fs.mkdir(THUMBS, { recursive: true });

  const only = process.argv.slice(2);
  let existing = [];
  try {
    existing = JSON.parse(await fs.readFile(path.join(WORK, "candidates.json"), "utf8"));
  } catch {}
  const out = [];
  let remaining = null;
  for (const slot of SLOTS) {
    if (only.length && !only.includes(slot.name)) {
      const prev = existing.find((e) => e.name === slot.name);
      if (prev) out.push(prev);
      continue;
    }
    const orientation = slot.ratio === "4/5" ? "portrait" : "landscape";
    const picked = [];
    for (const q of slot.queries) {
      const { results, remaining: rem } = await search(q, orientation);
      remaining = rem;
      const scored = results
        .map((p) => ({ p, s: score(p, slot) }))
        .filter((x) => x.s !== null)
        .sort((a, b) => b.s - a.s);
      const perQuery = Math.ceil(slot.take / slot.queries.length);
      let n = 0;
      for (const { p, s } of scored) {
        if (picked.length >= slot.take || n >= perQuery) break;
        if (picked.some((x) => x.id === p.id)) continue;
        n++;
        picked.push({
          id: p.id,
          score: Number(s.toFixed(2)),
          query: q,
          color: p.color,
          w: p.width,
          h: p.height,
          alt: p.alt_description,
          desc: p.description,
          thumb: p.urls.small,
          raw: p.urls.raw,
          download_location: p.links.download_location,
          html: p.links.html,
          user: { name: p.user.name, username: p.user.username, link: p.user.links.html },
        });
      }
    }
    console.log(`${slot.name}: ${picked.length} candidates (ratelimit remaining ${remaining})`);
    out.push({ ...slot, candidates: picked });
  }
  await fs.writeFile(path.join(WORK, "candidates.json"), JSON.stringify(out, null, 2));

  // 썸네일 다운로드
  for (const slot of out) {
    for (const c of slot.candidates) {
      const f = path.join(THUMBS, `${c.id}.jpg`);
      try {
        await fs.access(f);
      } catch {
        await fetchThumb(c.thumb, f);
      }
    }
  }

  // 컨택트 시트: 슬롯 6개 × 후보 6장
  const CELL = 220;
  const CELL_H = 275;
  const PER_SHEET = 6;
  const sheets = [];
  for (let i = 0; i < out.length; i += PER_SHEET) sheets.push(out.slice(i, i + PER_SHEET));
  let n = 0;
  for (const group of sheets) {
    n++;
    const cols = Math.max(...group.map((g) => g.candidates.length), 1);
    const W = cols * CELL + 160;
    const H = group.length * (CELL_H + 24);
    const composites = [];
    let y = 0;
    for (const slot of group) {
      composites.push({
        input: Buffer.from(
          `<svg width="150" height="${CELL_H}"><text x="6" y="24" font-size="16" font-family="sans-serif" font-weight="700" fill="#111">${slot.name}</text><text x="6" y="46" font-size="11" font-family="sans-serif" fill="#555">${slot.ratio}</text></svg>`
        ),
        left: 0,
        top: y,
      });
      let x = 160;
      let idx = 0;
      for (const c of slot.candidates) {
        idx++;
        const img = await sharp(path.join(THUMBS, `${c.id}.jpg`))
          .resize(CELL, CELL_H, { fit: "cover", position: "attention" })
          .toBuffer();
        composites.push({ input: img, left: x, top: y });
        composites.push({
          input: Buffer.from(
            `<svg width="${CELL}" height="26"><rect width="${CELL}" height="26" fill="rgba(0,0,0,0.6)"/><text x="6" y="18" font-size="13" font-family="sans-serif" font-weight="700" fill="#fff">#${idx} ${c.color} s=${c.score}</text></svg>`
          ),
          left: x,
          top: y + CELL_H - 26,
        });
        x += CELL;
      }
      y += CELL_H + 24;
    }
    await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
      .composite(composites)
      .jpeg({ quality: 82 })
      .toFile(path.join(WORK, `sheet-${n}.jpg`));
    console.log(`sheet-${n}.jpg: ${group.map((g) => g.name).join(", ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
