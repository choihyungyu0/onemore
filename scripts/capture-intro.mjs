/**
 * 오프닝 인트로 프레임 캡처 (CDP) — 새 프로필이라 세션 플래그 없이 인트로가 재생된다.
 *
 *   node scripts/capture-intro.mjs <url> <outDir> [width] [height]
 *   → outDir/intro-1.png … intro-5.png (하이드레이션 후 0.4s 간격), intro-after.png (커튼 걷힌 뒤)
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const [url, outDir, wArg, hArg] = process.argv.slice(2);
if (!url || !outDir) {
  console.error("usage: node scripts/capture-intro.mjs <url> <outDir> [width] [height]");
  process.exit(1);
}
const width = Number(wArg || 1440);
const height = Number(hArg || 900);
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9700 + Math.floor(Math.random() * 200);
const profile = path.join(os.tmpdir(), `cdp-intro-${port}`);
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("DevTools endpoint not ready");
}

try {
  await fs.mkdir(outDir, { recursive: true });
  const ws = new WebSocket(await getWsUrl());
  await new Promise((r) => ws.addEventListener("open", r));
  let seq = 0;
  const pending = new Map();
  ws.addEventListener("message", (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) {
      const { res, rej } = pending.get(d.id);
      pending.delete(d.id);
      d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = ++seq;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  const shot = async (name) => {
    const r = await send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(path.join(outDir, name), Buffer.from(r.data, "base64"));
    console.log("saved", name);
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url });
  // 하이드레이션 대기 (클라이언트 컴포넌트 마운트)
  for (let i = 0; i < 150; i++) {
    if (await evaluate("document.readyState === 'complete' && !!document.querySelector('.intro') && !!document.querySelector('[aria-pressed]')")) break;
    await sleep(100);
  }
  await evaluate("document.querySelector('nextjs-portal')?.remove(); true");
  for (let i = 1; i <= 5; i++) {
    await sleep(450);
    await shot(`intro-${i}.png`);
  }
  await sleep(2500);
  await shot("intro-after.png");
  ws.close();
} finally {
  chrome.kill();
}
