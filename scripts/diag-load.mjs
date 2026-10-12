/**
 * 첫 진입 진단 (CDP): node scripts/diag-load.mjs <url>
 * 콘솔 오류·경고, 50ms 이상 장기 작업(longtask), 레이아웃 시프트, 인트로 종료 시각을 기록한다.
 */
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const [url] = process.argv.slice(2);
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9300 + Math.floor(Math.random() * 300);
const profile = path.join(os.tmpdir(), "cdp-diag-" + port);
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "--window-size=1280,760", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ws() {
  for (let i = 0; i < 60; i++) {
    try { const list = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json(); const p = list.find((t) => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch {}
    await sleep(200);
  }
  throw new Error("no devtools");
}
const OBSERVER = `(() => {
  window.__diag = { long: [], cls: [], console: [], t0: performance.now() };
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__diag.long.push({ t: Math.round(e.startTime), d: Math.round(e.duration) }); }).observe({ type: "longtask", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__diag.cls.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4) }); }).observe({ type: "layout-shift", buffered: true }); } catch {}
  window.addEventListener("onemore:intro-done", () => { window.__diag.introDone = Math.round(performance.now()); });
})();`;
try {
  const sock = new WebSocket(await ws());
  await new Promise((r) => sock.addEventListener("open", r));
  let seq = 0; const pending = new Map(); const logs = [];
  sock.addEventListener("message", (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result); }
    if (d.method === "Runtime.consoleAPICalled" && (d.params.type === "error" || d.params.type === "warning")) logs.push(d.params.type + ": " + d.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 300));
    if (d.method === "Runtime.exceptionThrown") logs.push("exception: " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 300));
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); sock.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 760, deviceScaleFactor: 1, mobile: false });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVER });
  const t0 = Date.now();
  await send("Page.navigate", { url });
  await sleep(12000);
  const r = await evaluate(`JSON.stringify({ ...window.__diag, nav: performance.getEntriesByType("navigation")[0]?.toJSON?.(), fonts: document.fonts.status, lcp: performance.getEntriesByType("largest-contentful-paint").map(e=>({t:Math.round(e.startTime), el: e.element?.tagName})), res: performance.getEntriesByType("resource").filter(e=>e.duration>800).map(e=>({n:e.name.replace(location.origin,""), d:Math.round(e.duration), s:Math.round(e.startTime)})) })`);
  const d = JSON.parse(r);
  console.log("introDone(ms):", d.introDone, " fonts:", d.fonts);
  console.log("nav: domContentLoaded", Math.round(d.nav?.domContentLoadedEventEnd), " load", Math.round(d.nav?.loadEventEnd), " transferSize", d.nav?.transferSize);
  console.log("longtasks(>=50ms):", d.long.length, JSON.stringify(d.long.filter((x) => x.d >= 50).slice(0, 25)));
  console.log("layout shifts:", JSON.stringify(d.cls.slice(0, 15)));
  console.log("slow resources(>800ms):", JSON.stringify(d.res.slice(0, 12)));
  console.log("lcp:", JSON.stringify(d.lcp));
  console.log("console:", logs.length ? logs.join("\n  ") : "(none)");
  sock.close();
} finally { chrome.kill(); }
