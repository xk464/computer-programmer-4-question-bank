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

async function waitFor(fn, timeout = 12000, interval = 250) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await fn()) return true; } catch {}
    await sleep(interval);
  }
  return false;
}

let target = null;
for (let i = 0; i < 40; i++) {
  try {
    const list = await fetch(DEBUG + "/json/list").then((r) => r.json());
    target = list.find((t) => t.type === "page" && t.url.includes("app.local"));
    if (target) break;
  } catch {}
  await sleep(500);
}
if (!target) { console.error("FAIL: 未找到 WebView2 页面"); process.exit(1); }

const cd = new CDP(target.webSocketDebuggerUrl);
await cd.ready;
cd.send("Runtime.enable").catch(() => {});
await sleep(1200);

const url = await evalJS(cd, "location.href");
check("桌面版页面加载", url.includes("app.local"), url);

// 打开实操资料
await evalJS(cd, "document.querySelector('[data-mode=docs]').click()");
await sleep(500);
check("互动实操面板数量", (await evalJS(cd, "document.querySelectorAll('.sim-panel').length")) === 5,
  String(await evalJS(cd, "document.querySelectorAll('.sim-panel').length")));
check("安装模拟入口", await evalJS(cd, "!!document.querySelector('[data-install-sim]')"));
check("C 代码面板 2 个", (await evalJS(cd, "document.querySelectorAll('.code-sim').length")) === 2);

// F11 全屏
const beforeH = await evalJS(cd, "window.innerHeight");
await cd.send("Input.dispatchKeyEvent", { type: "keyDown", key: "F11", code: "F11", windowsVirtualKeyCode: 122, nativeVirtualKeyCode: 122 });
await cd.send("Input.dispatchKeyEvent", { type: "keyUp", key: "F11", code: "F11", windowsVirtualKeyCode: 122, nativeVirtualKeyCode: 122 });
await sleep(800);
const fullH = await evalJS(cd, "window.innerHeight");
check("F11 进入全屏", fullH > beforeH + 50, `before=${beforeH} after=${fullH}`);
await cd.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
await cd.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
await sleep(800);
const backH = await evalJS(cd, "window.innerHeight");
check("Esc 退出全屏", backH < fullH - 20, `full=${fullH} back=${backH}`);

// 安装模拟
await evalJS(cd, "document.querySelector('[data-install-sim]').click()");
await sleep(300);
check("模拟桌面打开", await evalJS(cd, "!!document.querySelector('.sim-overlay')"));
await evalJS(cd, "document.querySelector('[data-sim-icon=installer]').click()");
await sleep(200);
check("安装向导欢迎页", await evalJS(cd, "!!document.querySelector('[data-sim-next=\"2\"]')"));
await evalJS(cd, "document.querySelector('[data-sim-next=\"2\"]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('#simAccept').click()");
await evalJS(cd, "document.querySelector('[data-sim-next=\"3\"]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('[data-sim-next=\"4\"]').click()");
check("安装进度开始", await evalJS(cd, "!!document.querySelector('#simBar')"));
await sleep(1600);
check("安装完成页", await evalJS(cd, "!!document.querySelector('[data-sim-next=\"6\"]')"));
await evalJS(cd, "document.querySelector('[data-sim-next=\"6\"]').click()");
await sleep(300);
check("桌面出现快捷方式", await evalJS(cd, "!!document.querySelector('[data-sim-icon=shortcut]')"));
await evalJS(cd, "document.querySelector('[data-sim-icon=shortcut]').click()");
await sleep(300);
check("编辑器打开", await evalJS(cd, "!!document.querySelector('#simCode')"));
await evalJS(cd, "document.querySelector('[data-sim-lang]').click()");
await sleep(200);
check("语言切换为 HTML", (await evalJS(cd, "document.querySelector('[data-sim-lang]').textContent")).trim() === "HTML");
const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Hello</title></head><body><h1>Hello World</h1></body></html>";
await evalJS(cd, `(()=>{const e=document.querySelector('#simCode');e.value=${JSON.stringify(html)};e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
await evalJS(cd, "document.querySelector('[data-sim-file]').click()");
await sleep(300);
check("另存为对话框", await evalJS(cd, "!!document.querySelector('#simFileName')"));
await evalJS(cd, "document.querySelector('[data-sim-save]').click()");
await sleep(300);
check("桌面出现 hello.html", await evalJS(cd, "!!document.querySelector('[data-sim-icon=html]')"));
await evalJS(cd, "document.querySelector('[data-sim-icon=html]').click()");
await sleep(500);
check("浏览器预览渲染", (await evalJS(cd, "document.querySelector('.sim-preview')?.srcdoc || ''")).includes("Hello World"));
check("安装清单全部完成", (await evalJS(cd, "document.querySelectorAll('.sim-steps li.done').length")) === 7);
await evalJS(cd, "document.querySelector('[data-sim-close]').click()");
await sleep(300);
check("模拟桌面关闭", await evalJS(cd, "!document.querySelector('.sim-overlay')"));

// C 填空：先编译失败，再填答案成功
await evalJS(cd, "document.querySelector('#task-2').scrollIntoView()");
const c3 = "document.querySelector('.code-sim[data-code-task=c3]')";
await evalJS(cd, `${c3}.querySelector('[data-code-run]').click()`);
const failed = await waitFor(async () => (await evalJS(cd, `${c3}.querySelector('[data-code-status]').textContent`)).includes("编译失败"), 15000);
check("C 填空未填写时编译失败", failed, await evalJS(cd, `${c3}.querySelector('[data-code-status]').textContent`));
await evalJS(cd, `${c3}.querySelector('[data-code-answer]').click()`);
await sleep(200);
await evalJS(cd, `${c3}.querySelector('[data-code-run]').click()`);
const c3ok = await waitFor(async () => (await evalJS(cd, `${c3}.querySelector('[data-code-status]').textContent`)).includes("符合预期"), 20000);
check("C 填空参考答案运行通过", c3ok, await evalJS(cd, `${c3}.querySelector('[data-code-status]').textContent`));
check("C 填空输出正确", (await evalJS(cd, `${c3}.querySelector('[data-code-output]').textContent`)).includes("新字符串是:abc"));

// C 编程
const c5 = "document.querySelector('.code-sim[data-code-task=c5]')";
await evalJS(cd, `${c5}.querySelector('[data-code-answer]').click()`);
await evalJS(cd, `${c5}.querySelector('[data-code-run]').click()`);
const c5ok = await waitFor(async () => (await evalJS(cd, `${c5}.querySelector('[data-code-status]').textContent`)).includes("符合预期"), 20000);
check("C 编程参考答案运行通过", c5ok, await evalJS(cd, `${c5}.querySelector('[data-code-status]').textContent`));
check("C 编程输出正确", (await evalJS(cd, `${c5}.querySelector('[data-code-output]').textContent`)).includes("二进制结果：1010"));

// 流程图
const flow = "document.querySelector('[data-flow]')";
await evalJS(cd, `(()=>{const f=${flow};const l=f.querySelector('[data-flow-list]');['start','input','decision','end'].forEach(k=>l.appendChild(l.querySelector('[data-key='+k+']')));f.querySelector('[data-flow-yes]').value='even';f.querySelector('[data-flow-no]').value='odd';return true;})()`);
await evalJS(cd, `${flow}.querySelector('[data-flow-check]').click()`);
await sleep(200);
check("流程图检查通过", (await evalJS(cd, `${flow}.querySelector('[data-flow-result]').textContent`)).includes("正确"));

// 详细设计
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

const shot = await cd.send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:\\Users\\徐\\Desktop\\mc\\docs\\preview-practical.png", Buffer.from(shot.data, "base64"));

const failedChecks = checks.filter((c) => !c.pass);
console.log(`\n===== RESULT: ${checks.length - failedChecks.length}/${checks.length} passed =====`);
process.exit(failedChecks.length ? 1 : 0);
