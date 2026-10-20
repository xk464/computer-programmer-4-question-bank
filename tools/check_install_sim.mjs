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
async function waitFor(fn, timeout = 15000, interval = 200) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
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
if (!target) { console.error("FAIL: 页面未找到"); process.exit(1); }

const cd = new CDP(target.webSocketDebuggerUrl);
await cd.ready;
const errors = [];
cd.send("Runtime.enable").catch(() => {});
cd.send("Log.enable").catch(() => {});
cd.on?.("Runtime.exceptionThrown", () => {});
await sleep(1500);

await evalJS(cd, "document.querySelector('[data-mode=docs]').click()");
await sleep(500);
check("实操按钮：Sublime", await evalJS(cd, "!!document.querySelector('[data-install-sim=sublime]')"));
check("实操按钮：VS Code", await evalJS(cd, "!!document.querySelector('[data-install-sim=vscode]')"));

/* ---------------- Sublime ---------------- */
await evalJS(cd, "document.querySelector('[data-install-sim=sublime]').click()");
await sleep(300);
check("Sublime 模拟桌面打开", await evalJS(cd, "!!document.querySelector('.ts-overlay')"));
await evalJS(cd, "document.querySelector('[data-icon=installer]').click()");
await sleep(250);
check("Sublime 欢迎页", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("欢迎"));
await evalJS(cd, "document.querySelector('[data-act=to-license]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('#ts-accept').click()");
await evalJS(cd, "document.querySelector('[data-act=to-dest]').click()");
await sleep(200);
check("Sublime 安装位置页", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("C:\\Program Files\\Sublime Text"));
await evalJS(cd, "document.querySelector('[data-act=to-startmenu]').click()");
await sleep(200);
check("Sublime 开始菜单页", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("开始菜单"));
await evalJS(cd, "document.querySelector('[data-act=to-ready]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('[data-act=install]').click()");
await sleep(1800);
check("Sublime 完成安装页", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("安装向导"));
check("Sublime 步骤数 7", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("第 7 步"));
await evalJS(cd, "document.querySelector('[data-act=finish]').click()");
await sleep(300);
check("Sublime 安装后无桌面图标", !(await evalJS(cd, "!!document.querySelector('[data-icon=shortcut]')")));
await evalJS(cd, "document.querySelector('[data-act=shortcut-1]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('[data-act=shortcut-2]').click()");
await sleep(200);
check("Sublime 发送到桌面快捷方式", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("桌面快捷方式"));
await evalJS(cd, "document.querySelector('[data-act=shortcut-done]').click()");
await sleep(300);
check("Sublime 桌面出现快捷方式", await evalJS(cd, "!!document.querySelector('[data-icon=shortcut]')"));
await evalJS(cd, "document.querySelector('[data-icon=shortcut]').click()");
await sleep(300);
check("Sublime 编辑器打开", await evalJS(cd, "!!document.querySelector('#ts-code')"));
await evalJS(cd, "document.querySelector('[data-act=lang-menu]').click()");
await sleep(150);
await evalJS(cd, "document.querySelector('[data-lang=HTML]').click()");
await sleep(200);
check("Sublime 语言 HTML", (await evalJS(cd, "document.querySelector('[data-act=lang-menu]').textContent")).includes("HTML"));
await evalJS(cd, "(()=>{const t=document.querySelector('#ts-code');t.value='html';t.dispatchEvent(new Event('input',{bubbles:true}));t.focus();t.selectionStart=t.selectionEnd=4;return true;})()");
await cd.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
await cd.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
await sleep(400);
check("Sublime html+Tab 生成 HTML5 框架", (await evalJS(cd, "document.querySelector('#ts-code').value")).includes("<!DOCTYPE html>"));
const html = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head><meta charset=\"UTF-8\"><title>Hello</title></head>\n<body>\n  hello world\n</body>\n</html>";
await evalJS(cd, `(()=>{const t=document.querySelector('#ts-code');t.value=${JSON.stringify(html)};t.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
await evalJS(cd, "document.querySelector('[data-act=file-menu]').click()");
await sleep(150);
await evalJS(cd, "document.querySelector('[data-act=save-as]').click()");
await sleep(250);
check("Sublime 另存为对话框", await evalJS(cd, "!!document.querySelector('#ts-file-name')"));
await evalJS(cd, "document.querySelector('[data-act=save]').click()");
await sleep(400);
check("Sublime 浏览器预览", (await evalJS(cd, "document.querySelector('.ts-iframe')?.srcdoc || ''")).includes("hello world"));
check("Sublime 清单全部完成", (await evalJS(cd, "document.querySelectorAll('.ts-steps li.done').length")) === 11);
await evalJS(cd, "document.querySelector('[data-act=finish-close]').click()");
await sleep(300);
check("Sublime 模拟关闭", !(await evalJS(cd, "!!document.querySelector('.ts-overlay')")));

/* ---------------- VS Code ---------------- */
await evalJS(cd, "document.querySelector('[data-install-sim=vscode]').click()");
await sleep(300);
await evalJS(cd, "document.querySelector('[data-icon=installer]').click()");
await sleep(250);
check("VSCode 许可协议页", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("许可协议"));
check("VSCode 步骤数 1", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("第 1 步"));
await evalJS(cd, "document.querySelector('#ts-accept').click()");
await evalJS(cd, "document.querySelector('[data-act=to-dest]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('[data-act=to-startmenu]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('[data-act=to-tasks]').click()");
await sleep(200);
check("VSCode 附加任务页", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("创建桌面图标"));
// 不勾选桌面图标时不应进入下一步
await evalJS(cd, "document.querySelector('[data-act=to-ready]').click()");
await sleep(200);
check("VSCode 未勾选桌面图标被拦截", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("附加任务"));
await evalJS(cd, "document.querySelector('[data-task=desktop]').click()");
await evalJS(cd, "document.querySelector('[data-act=to-ready]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('[data-act=install]').click()");
await sleep(1800);
await evalJS(cd, "document.querySelector('[data-act=finish]').click()");
await sleep(300);
check("VSCode 桌面图标已创建", await evalJS(cd, "!!document.querySelector('[data-icon=shortcut]')"));
await evalJS(cd, "document.querySelector('[data-icon=shortcut]').click()");
await sleep(300);
await evalJS(cd, "document.querySelector('[data-act=file-menu]').click()");
await sleep(150);
await evalJS(cd, "document.querySelector('[data-act=new-file]').click()");
await sleep(200);
await evalJS(cd, "document.querySelector('[data-act=lang-menu]').click()");
await sleep(150);
await evalJS(cd, "document.querySelector('[data-lang=HTML]').click()");
await sleep(200);
const vscodeHtml = "<HTML> <BODY><p>hello world!</p></BODY></HTML>";
await evalJS(cd, `(()=>{const t=document.querySelector('#ts-code');t.value=${JSON.stringify(vscodeHtml)};t.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
await evalJS(cd, "document.querySelector('[data-act=run]').click()");
await sleep(300);
check("VSCode F5 后保存对话框", await evalJS(cd, "!!document.querySelector('#ts-file-name')"));
await evalJS(cd, "document.querySelector('[data-act=save]').click()");
await sleep(300);
check("VSCode 运行环境选择", (await evalJS(cd, "document.querySelector('.ts-win').textContent")).includes("浏览器"));
await evalJS(cd, "document.querySelector('[data-act=run-browser]').click()");
await sleep(400);
check("VSCode 浏览器预览", (await evalJS(cd, "document.querySelector('.ts-iframe')?.srcdoc || ''")).includes("hello world"));
check("VSCode 清单全部完成", (await evalJS(cd, "document.querySelectorAll('.ts-steps li.done').length")) === 11);
await evalJS(cd, "document.querySelector('[data-act=finish-close]').click()");
await sleep(200);

const failed = checks.filter((c) => !c.pass);
console.log(`\n===== RESULT: ${checks.length - failed.length}/${checks.length} passed =====`);
process.exit(failed.length ? 1 : 0);
