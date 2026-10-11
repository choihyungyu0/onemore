/**
 * 전체 페이지 스크린샷 (Chrome DevTools Protocol, 추가 의존성 없음)
 *
 *   node scripts/capture.mjs <url> <width> <out.png>
 *   예) node scripts/capture.mjs http://localhost:3700/ 1440 shots/desktop.png
 *
 * - 하이드레이션 완료를 기다린 뒤 페이지를 끝까지 스크롤해 진입 모션을 모두 트리거
 * - 뷰포트를 문서 높이로 늘려 한 장으로 캡처 (Next dev 배지는 제거)
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const [url, widthArg, out] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: node scripts/capture.mjs <url> <width> <out.png>");
  process.exit(1);
}
const width = Number(widthArg || 1440);
const CHROME =
  process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9300 + Math.floor(Math.random() * 300);
const profile = path.join(os.tmpdir(), `cdp-profile-${port}`);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},900`,
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
    (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result
      .value;

  await send("Page.enable");
  await send("Runtime.enable");
  // 진입 모션을 끈 상태로 캡처(스크롤 패럴랙스·whileInView 간섭 방지)
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  const mobile = width < 768;
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile,
  });
  await send("Page.navigate", { url });

  // 로드 + 하이드레이션(클라이언트 컴포넌트의 aria-pressed 버튼이 생기면 완료로 간주)
  for (let i = 0; i < 150; i++) {
    if (
      await evaluate(
        "document.readyState === 'complete' && !!document.querySelector('[aria-pressed]')"
      )
    )
      break;
    await sleep(200);
  }
  await sleep(1500);

  // 끝까지 스크롤해 whileInView 트리거
  const h1 = await evaluate("document.documentElement.scrollHeight");
  const scrollTo = (y) =>
    evaluate(
      `(window.__lenis ? window.__lenis.scrollTo(${y}, { immediate: true, force: true }) : window.scrollTo(0, ${y})); true`
    );
  for (let y = 0; y < h1; y += 500) {
    await scrollTo(y);
    await sleep(90);
  }
  await scrollTo(0);
  await sleep(1200);

  // dev 배지 제거 후 전체 높이로 캡처
  await evaluate("document.querySelector('nextjs-portal')?.remove(); true");
  const h2 = await evaluate("document.documentElement.scrollHeight");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: h2,
    deviceScaleFactor: 1,
    mobile,
  });
  await sleep(1500);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, Buffer.from(shot.data, "base64"));
  console.log(`saved ${out} (${width}x${h2})`);
  ws.close();
} finally {
  chrome.kill();
}
