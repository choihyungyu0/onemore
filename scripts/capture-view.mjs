/**
 * 뷰포트 캡처 (CDP): node scripts/capture-view.mjs <url> <selector> <out.png> [offsetY]
 * 하이드레이션 후 selector 위치로 스크롤(Lenis 전역 핸들 사용)해 현재 뷰포트만 저장한다.
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const [url, selector, out, offsetArg] = process.argv.slice(2);
const offset = Number(offsetArg || 0);
const [VW, VH] = (process.env.VIEW || "1280x760").split("x").map(Number); // VIEW=375x812 로 모바일 캡처
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9300 + Math.floor(Math.random() * 300);
const profile = path.join(os.tmpdir(), "cdp-view-" + port);
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "--window-size=" + VW + "," + VH, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ws() {
  for (let i = 0; i < 60; i++) {
    try { const list = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json(); const p = list.find((t) => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch {}
    await sleep(200);
  }
  throw new Error("no devtools");
}
try {
  const sock = new WebSocket(await ws());
  await new Promise((r) => sock.addEventListener("open", r));
  let seq = 0; const pending = new Map();
  sock.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); sock.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: VW, height: VH, deviceScaleFactor: 1, mobile: VW < 768 });
  await send("Page.navigate", { url });
  for (let i = 0; i < 100; i++) { if (await evaluate("!!window.__lenis && !document.documentElement.classList.contains(\"preloading\") && !document.documentElement.classList.contains(\"intro-leaving\")")) break; await sleep(300); }
  await sleep(1500);
  await evaluate("(() => { const el = document.querySelector(" + JSON.stringify(selector) + "); if (!el) return false; const y = el.getBoundingClientRect().top + window.scrollY + " + offset + "; window.__lenis.scrollTo(y, { immediate: true, force: true }); return true; })()");
  if (process.env.PRE) await evaluate("(async () => { " + process.env.PRE + " })()"); // PRE=JS 로 캡처 전에 조작(입력·클릭)
  await sleep(Number(process.env.WAIT || 2500)); // WAIT=ms 로 연출이 끝날 때까지 더 기다림
  if (process.env.PROBE) console.log("PROBE:", JSON.stringify(await evaluate("(() => { " + process.env.PROBE + " })()"))); // PROBE=JS 식 결과 출력
  const shot = await send("Page.captureScreenshot", { format: "png" });
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, Buffer.from(shot.data, "base64"));
  console.log("saved " + out);
  sock.close();
} finally { chrome.kill(); }
