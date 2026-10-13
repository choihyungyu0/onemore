/** 가만히 있을 때 누가 일하는지 분해: node scripts/perf-idle.mjs <url>  (VIEW, CPU 환경변수) — 조건별로 3초 idle 측정 */
import { spawn } from "node:child_process"; import os from "node:os"; import path from "node:path";
const [url] = process.argv.slice(2); const [VW, VH] = (process.env.VIEW || "390x844").split("x").map(Number);
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe"; const port = 9300 + Math.floor(Math.random() * 300);
const chrome = spawn(CHROME, ["--headless=new", "--hide-scrollbars", "--no-first-run", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=" + port, "--user-data-dir=" + path.join(os.tmpdir(), "cdp-idle-" + port), "--window-size=" + VW + "," + VH, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ws() { for (let i = 0; i < 60; i++) { try { const l = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json(); const p = l.find((t) => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch {} await sleep(200); } throw new Error("no devtools"); }
try {
  const sock = new WebSocket(await ws()); await new Promise((r) => sock.addEventListener("open", r)); let seq = 0; const pending = new Map();
  sock.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); sock.send(JSON.stringify({ id, method, params })); });
  const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  await send("Page.enable"); await send("Runtime.enable"); await send("Performance.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: VW, height: VH, deviceScaleFactor: VW < 768 ? 3 : 1, mobile: VW < 768 });
  if (process.env.CPU) await send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU) });
  await send("Page.navigate", { url });
  for (let i = 0; i < 100; i++) { if (await ev("!!window.__lenis && !document.documentElement.classList.contains('preloading') && !document.documentElement.classList.contains('intro-leaving')")) break; await sleep(300); }
  await sleep(3000);
  if (process.env.Y) { await ev(`window.__lenis.scrollTo(${process.env.Y}, { immediate: true, force: true })`); await sleep(1500); }
  const metrics = async () => { const r = await send("Performance.getMetrics"); const o = {}; for (const m of r.metrics) o[m.name] = m.value; return o; };
  const measure = async (label) => { const a = await metrics(); await sleep(3000); const b = await metrics(); console.log(label.padEnd(34), "script", Math.round((b.ScriptDuration - a.ScriptDuration) * 1000) + "ms", " style", Math.round((b.RecalcStyleDuration - a.RecalcStyleDuration) * 1000) + "ms", " layout", Math.round((b.LayoutDuration - a.LayoutDuration) * 1000) + "ms", " layouts", b.LayoutCount - a.LayoutCount, " styleRecalcs", b.RecalcStyleCount - a.RecalcStyleCount); };
  console.log("animations running:", await ev("document.getAnimations().length"), " css:", await ev("document.getAnimations().filter(a=>a.constructor.name==='CSSAnimation').map(a=>a.animationName).reduce((m,n)=>(m[n]=(m[n]||0)+1,m),{})"), " web-animations:", await ev("document.getAnimations().filter(a=>a.constructor.name==='Animation').length"));
  await measure("baseline");
  await ev("window.__paused=document.getAnimations(); window.__paused.forEach(a=>a.pause())"); await measure("css/web animations paused");
  await ev("window.__lenis.stop()"); await measure("+ lenis stopped");
  await ev("(window.gsap||{}).ticker && gsap.ticker.sleep()"); 
  const hasGsap = await ev("!!window.gsap"); await measure("+ gsap ticker sleep" + (hasGsap ? "" : " (gsap not global)"));
  await ev("document.querySelectorAll('video').forEach(v=>v.pause())"); await measure("+ video paused");
  await ev("window.__raf=window.requestAnimationFrame; window.requestAnimationFrame=()=>0"); await measure("+ all rAF blocked");
  sock.close();
} finally { chrome.kill(); }
