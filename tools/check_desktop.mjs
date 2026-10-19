import { setTimeout as sleep } from "node:timers/promises";
import { writeFileSync } from "node:fs";

const PORT = 9455;
const DEBUG = `http://127.0.0.1:${PORT}`;

const checks = [];
function check(name, pass, extra = "") {
  checks.push({ name, pass: !!pass, extra: String(extra || "") });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    this.ready = new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id) {
        const p = this.pending.get(m.id);
        if (!p) return;
        this.pending.delete(m.id);
        m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
      } else (this.handlers.get(m.method) || []).forEach((f) => f(m.params));
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pending.set(id, { resolve: res, reject: rej }));
  }
}

async function evalJS(cd, expression) {
  const r = await cd.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

let target = null;
for (let i = 0; i < 40; i++) {
  try {
    const list = await fetch(DEBUG + "/json/list").then((r) => r.json());
    target = list.find((t) => t.type === "page" && (t.url.includes("app.local") || t.url.startsWith("https://app")));
    if (target) break;
  } catch {}
  await sleep(500);
}
if (!target) { console.error("FAIL: 未找到 WebView2 页面"); process.exit(1); }

const cd = new CDP(target.webSocketDebuggerUrl);
await cd.ready;
const errors = [];
cd.send("Runtime.enable").catch(() => {});
const { writeFileSync: wf } = await import("node:fs");

await sleep(1200);
const title = await evalJS(cd, "document.title");
const url = await evalJS(cd, "location.href");
check("桌面版加载页面", url.includes("app.local"), url);
check("桌面版标题", title.includes("题库"), title);
check("桌面版题干渲染", (await evalJS(cd, "document.querySelector('.qtext').textContent")).includes("程序设计语言"));
check("桌面版 398 题", (await evalJS(cd, "document.querySelectorAll('.gbtn').length")) === 398);

await evalJS(cd, "document.querySelectorAll('.option')[2].click()");
await sleep(300);
check("桌面版本地判分", (await evalJS(cd, "document.querySelectorAll('.badge.ok').length")) === 1);
check("桌面版解析显示", await evalJS(cd, "!!document.querySelector('.explain')"));
check("桌面版记录写入", (await evalJS(cd, "JSON.parse(localStorage.getItem('mc_tiku_pc_v1')).answers['1'].correct")) === true);

// 用固定 CSS 视口截图，避免高 DPI 导致侧栏折行
await cd.send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
await sleep(400);
const shot = await cd.send("Page.captureScreenshot", { format: "png" });
wf("C:\\Users\\徐\\Desktop\\mc\\docs\\preview-desktop-app.png", Buffer.from(shot.data, "base64"));
check("桌面版截图", true);

const failed = checks.filter((c) => !c.pass);
console.log(`\n===== RESULT: ${checks.length - failed.length}/${checks.length} passed =====`);
process.exit(failed.length ? 1 : 0);
