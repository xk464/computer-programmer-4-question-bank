import { setTimeout as sleep } from "node:timers/promises";

const PORT = 9455;
const DEBUG = `http://127.0.0.1:${PORT}`;
const checks = [];
function check(name, pass, extra = "") {
  checks.push({ name, pass: !!pass, extra: String(extra || "") });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
}
class CDP {
  constructor(url) {
    this.ws = new WebSocket(url); this.id = 0; this.pending = new Map();
    this.ready = new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id) { const p = this.pending.get(m.id); if (!p) return; this.pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
    };
  }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pending.set(id, { resolve: res, reject: rej })); }
}
async function evalJS(cd, expression) {
  const r = await cd.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
async function waitFor(fn, timeout = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { try { if (await fn()) return true; } catch {} await sleep(200); }
  return false;
}
let target = null;
for (let i = 0; i < 30; i++) {
  try { const list = await fetch(DEBUG + "/json/list").then(r => r.json()); target = list.find(t => t.type === "page" && t.url.includes("app.local")); if (target) break; } catch {}
  await sleep(500);
}
if (!target) { console.error("no page"); process.exit(1); }
const cd = new CDP(target.webSocketDebuggerUrl);
await cd.ready;
cd.send("Runtime.enable").catch(() => {});
await sleep(800);
await evalJS(cd, "document.querySelector('[data-mode=docs]').click()");
await sleep(500);

const c3 = "document.querySelector('.code-sim[data-code-task=c3]')";
await evalJS(cd, `${c3}.querySelector('[data-code-run]').click()`);
check("C 填空留空编译失败", await waitFor(async () => (await evalJS(cd, `${c3}.querySelector('[data-code-status]').textContent`)).includes("编译失败")));
await evalJS(cd, `${c3}.querySelector('[data-code-answer]').click()`);
await evalJS(cd, `${c3}.querySelector('[data-code-run]').click()`);
check("C 填空运行通过", await waitFor(async () => (await evalJS(cd, `${c3}.querySelector('[data-code-status]').textContent`)).includes("符合预期"), 20000));
check("C 填空输出正确", (await evalJS(cd, `${c3}.querySelector('[data-code-output]').textContent`)).includes("新字符串是:abc"));

const c5 = "document.querySelector('.code-sim[data-code-task=c5]')";
await evalJS(cd, `${c5}.querySelector('[data-code-answer]').click()`);
await evalJS(cd, `${c5}.querySelector('[data-code-run]').click()`);
check("C 编程运行通过", await waitFor(async () => (await evalJS(cd, `${c5}.querySelector('[data-code-status]').textContent`)).includes("符合预期"), 20000));
check("C 编程输出正确", (await evalJS(cd, `${c5}.querySelector('[data-code-output]').textContent`)).includes("二进制结果：1010"));

const flow = "document.querySelector('[data-flow]')";
await evalJS(cd, `(()=>{const f=${flow};const l=f.querySelector('[data-flow-list]');['start','input','decision','end'].forEach(k=>l.appendChild(l.querySelector('[data-key='+k+']')));f.querySelector('[data-flow-yes]').value='even';f.querySelector('[data-flow-no]').value='odd';return true;})()`);
await evalJS(cd, `${flow}.querySelector('[data-flow-check]').click()`);
await sleep(200);
check("流程图检查通过", (await evalJS(cd, `${flow}.querySelector('[data-flow-result]').textContent`)).includes("正确"));

const design = "document.querySelector('[data-design]')";
const answers = {
  d1: "实现水电报修、卫生检查管理功能。",
  d2: "值班人员、楼号、单元号、楼层、宿舍号、备注、录入人员、日期。",
  d3: "汇总时间、班级、姓名、日期、贵重物品名称、当前页数、总页数、项数。",
  d4: "系部ID、系部名称、命令、页数、当前页数、项数。"
};
for (const [k, v] of Object.entries(answers)) {
  await evalJS(cd, `(()=>{const e=${design}.querySelector('[data-design-input=${k}]');e.value=${JSON.stringify(v)};e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
}
await evalJS(cd, `${design}.querySelector('[data-design-check]').click()`);
await sleep(200);
check("详细设计检查通过", (await evalJS(cd, `${design}.querySelector('[data-design-result]').textContent`)).includes("全部通过"));

const failed = checks.filter(c => !c.pass);
console.log(`\n===== RESULT: ${checks.length - failed.length}/${checks.length} passed =====`);
process.exit(failed.length ? 1 : 0);
