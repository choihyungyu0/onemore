/**
 * 스크롤 성능 진단 (CDP, GPU 사용): node scripts/perf-scroll.mjs <url>
 * 페이지를 위에서 아래로 Lenis로 흘려보내며 구간별 긴 프레임(>50ms)·평균 프레임·스크립트/레이아웃/스타일 시간을 기록하고,
 * 마지막에 3초 동안 가만히 두었을 때(idle) 메인 스레드가 얼마나 일하는지 잰다. VIEW=390x844 로 모바일.
 */
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
const [url] = process.argv.slice(2);
const [VW, VH] = (process.env.VIEW || "1440x900").split("x").map(Number);
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9300 + Math.floor(Math.random() * 300);
const profile = path.join(os.tmpdir(), "cdp-perf-" + port);
const args = ["--headless=new", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "--window-size=" + VW + "," + VH, "about:blank"];
if (process.env.NOGPU) args.splice(1, 0, "--disable-gpu");
const chrome = spawn(CHROME, args, { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ws() { for (let i = 0; i < 60; i++) { try { const l = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json(); const p = l.find((t) => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch {} await sleep(200); } throw new Error("no devtools"); }
try {
  const sock = new WebSocket(await ws()); await new Promise((r) => sock.addEventListener("open", r));
  let seq = 0; const pending = new Map();
  sock.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); sock.send(JSON.stringify({ id, method, params })); });
  const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  await send("Page.enable"); await send("Runtime.enable"); await send("Performance.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: VW, height: VH, deviceScaleFactor: VW < 768 ? 3 : 1, mobile: VW < 768 });
  if (process.env.CPU) await send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU) });
  await send("Page.navigate", { url });
  for (let i = 0; i < 100; i++) { if (await ev("!!window.__lenis && !document.documentElement.classList.contains('preloading') && !document.documentElement.classList.contains('intro-leaving')")) break; await sleep(300); }
  await sleep(2500);
  const metrics = async () => { const r = await send("Performance.getMetrics"); const o = {}; for (const m of r.metrics) o[m.name] = m.value; return o; };
  const sections = await ev(`JSON.stringify([...document.querySelectorAll('section, .growth-camera[data-variant=desktop], .zoom-stage, main > div')].filter(e=>e.offsetHeight>200).map(e=>({name:(e.id||e.className.split(' ').slice(0,2).join('.')||e.tagName).slice(0,28), top:Math.round(e.getBoundingClientRect().top+scrollY), h:Math.round(e.offsetHeight)})))`);
  const list = JSON.parse(sections);
  const total = await ev("document.documentElement.scrollHeight - innerHeight");
  await ev(`window.__fr=[]; (function(){let last=performance.now(); function f(t){window.__fr.push(t-last); last=t; requestAnimationFrame(f);} requestAnimationFrame(f);})();`);
  const STEP = Math.round(VH * 0.5);
  console.log("viewport", VW + "x" + VH, "scrollable", total, "px, step", STEP, process.env.NOGPU ? "(no gpu)" : "(gpu)", process.env.CPU ? "cpu x" + process.env.CPU : "");
  let y = 0; let m0 = await metrics(); let f0 = 0; let cur = 0;
  const rows = [];
  const flush = async (label) => { const fr = await ev("JSON.stringify(window.__fr)"); const arr = JSON.parse(fr).slice(f0); f0 += arr.length; const m1 = await metrics(); const longf = arr.filter((d) => d > 50).length; const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; rows.push({ section: label, frames: arr.length, avgMs: +avg.toFixed(1), long: longf, worst: Math.round(Math.max(0, ...arr)), script: +((m1.ScriptDuration - m0.ScriptDuration) * 1000).toFixed(0), layout: +((m1.LayoutDuration - m0.LayoutDuration) * 1000).toFixed(0), style: +((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000).toFixed(0), layouts: m1.LayoutCount - m0.LayoutCount }); m0 = m1; };
  while (y < total) {
    y = Math.min(total, y + STEP);
    await ev(`window.__lenis.scrollTo(${y}, { duration: 0.45, force: true })`);
    await sleep(520);
    const sec = list.filter((s) => s.top <= y + VH * 0.5).pop();
    const label = sec ? sec.name : "top";
    if (label !== cur) { if (cur) await flush(cur); cur = label; }
  }
  await flush(cur);
  // idle: 3초 가만히
  await sleep(800); f0 = JSON.parse(await ev("JSON.stringify(window.__fr)")).length; m0 = await metrics();
  await sleep(3000); await flush("idle@bottom");
  await ev(`window.__lenis.scrollTo(0, { immediate: true, force: true })`); await sleep(1200);
  f0 = JSON.parse(await ev("JSON.stringify(window.__fr)")).length; m0 = await metrics(); await sleep(3000); await flush("idle@top");
  console.table(rows);
  const live = await ev(`(function(){const o={}; o.rafs='n/a'; o.layers=document.querySelectorAll('[style*="will-change"], .will-change-transform').length; o.imgs=document.images.length; o.imgsDecoding=[...document.images].filter(i=>!i.complete).length; o.compositorHints=document.querySelectorAll('[class*="backdrop-blur"], [class*="blur-"], .grain-local, [class*="mix-blend"]').length; return JSON.stringify(o)})()`);
  console.log("dom:", live);
  sock.close();
} finally { chrome.kill(); }
