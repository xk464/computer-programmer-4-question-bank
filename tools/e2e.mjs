import { spawn, spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = "C:\\Users\\徐\\Desktop\\mc";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const DEBUG = `http://127.0.0.1:${PORT}`;
const BASE = process.env.BASE || "http://127.0.0.1:8765";
const SHOTS = path.join(ROOT, "shots");
const PROFILE = path.join(ROOT, ".edge-e2e");

mkdirSync(SHOTS, { recursive: true });
rmSync(PROFILE, { recursive: true, force: true });

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
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id) {
        const p = this.pending.get(m.id);
        if (!p) return;
        this.pending.delete(m.id);
        m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
      } else {
        (this.handlers.get(m.method) || []).forEach((fn) => fn(m.params));
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
  once(method) {
    return new Promise((resolve) => {
      const fn = (p) => {
        const arr = this.handlers.get(method);
        arr.splice(arr.indexOf(fn), 1);
        resolve(p);
      };
      this.on(method, fn);
    });
  }
  close() { try { this.ws.close(); } catch {} }
}

async function evalJS(cd, expression) {
  const r = await cd.send("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true, userGesture: true
  });
  if (r.exceptionDetails) {
    throw new Error("eval failed: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  }
  return r.result.value;
}

async function cookie() { return null; }

async function withPage(opts, fn) {
  const target = await fetch(`${DEBUG}/json/new?${encodeURIComponent(opts.url)}`, { method: "PUT" }).then((r) => r.json());
  const cd = new CDP(target.webSocketDebuggerUrl);
  await cd.ready;
  const errors = [];
  cd.on("Runtime.exceptionThrown", (p) => errors.push("exception: " + (p.exceptionDetails.exception?.description || p.exceptionDetails.text)));
  cd.on("Runtime.consoleAPICalled", (p) => {
    if (p.type === "error") errors.push("console.error: " + p.args.map((a) => a.value ?? a.description).join(" "));
  });
  cd.on("Log.entryAdded", (p) => { if (p.entry.level === "error") errors.push("log: " + p.entry.text); });
  await cd.send("Page.enable");
  await cd.send("Runtime.enable");
  await cd.send("Log.enable");
  await cd.send("Emulation.setDeviceMetricsOverride", opts.metrics);
  const features = opts.media || [{ name: "prefers-reduced-motion", value: "reduce" }];
  await cd.send("Emulation.setEmulatedMedia", { features });

  async function nav() {
    const loaded = cd.once("Page.loadEventFired");
    await cd.send("Page.navigate", { url: opts.url });
    await Promise.race([loaded, sleep(8000)]);
    await sleep(opts.wait ?? 500);
  }
  await nav();
  if (opts.clean) {
    await evalJS(cd, "localStorage.clear()");
    await nav();
  }
  try {
    await fn(cd, { errors, nav });
  } finally {
    cd.close();
    await fetch(`${DEBUG}/json/close/${target.id}`).catch(() => {});
  }
  return errors;
}

async function shot(cd, name, full = true) {
  let clip;
  if (full) {
    const lm = await cd.send("Page.getLayoutMetrics");
    const size = lm.cssContentSize || lm.contentSize;
    clip = { x: 0, y: 0, width: Math.ceil(size.width), height: Math.ceil(size.height), scale: 1 };
  }
  const { data } = await cd.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, clip, fromSurface: true });
  const file = path.join(SHOTS, name + ".png");
  writeFileSync(file, Buffer.from(data, "base64"));
  return file;
}

function text(cd, sel) {
  return evalJS(cd, `(document.querySelector(${JSON.stringify(sel)})||{}).textContent||""`);
}

/* ---------------- launch edge ---------------- */
const edge = spawn(EDGE, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--disable-extensions", "--hide-scrollbars", "--mute-audio",
  "--remote-debugging-port=" + PORT,
  "--remote-allow-origins=*",
  "--user-data-dir=" + PROFILE,
  "about:blank"
], { stdio: "ignore" });

let up = false;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(DEBUG + "/json/version");
    if (r.ok) { up = true; break; }
  } catch {}
  await sleep(250);
}
if (!up) { console.error("Edge CDP did not start"); process.exit(1); }

try {
  /* ================= PC ================= */
  const pcErrors = await withPage({
    url: BASE + "/pc/", clean: true,
    metrics: { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
    media: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "prefers-color-scheme", value: "light" }
    ]
  }, async (cd, { nav }) => {
    const overflow = await evalJS(cd, "document.documentElement.scrollWidth - window.innerWidth");
    check("PC 无横向溢出", overflow <= 1, "delta=" + overflow);
    check("PC 题干渲染", (await text(cd, ".qtext")).includes("程序设计语言"));
    check("PC 首题不预显示答案", (await evalJS(cd, "document.querySelectorAll('.explain').length")) === 0);
    const optCount = await evalJS(cd, "document.querySelectorAll('.option').length");
    check("PC 首页 4 个选项", optCount === 4, "count=" + optCount);
    check("PC 侧边答题卡 398", (await evalJS(cd, "document.querySelectorAll('.gbtn').length")) === 398);
    check("PC 进度卡渲染", (await text(cd, "#progressPanel")).includes("学习进度"));
    await shot(cd, "pc-practice");

    // 答对第 1 题（C）
    await evalJS(cd, "document.querySelectorAll('.option')[2].click()");
    await sleep(250);
    check("PC 判分正确标记", (await evalJS(cd, "document.querySelectorAll('.badge.ok').length")) === 1);
    check("PC 显示解析", (await evalJS(cd, "!!document.querySelector('.explain')")));
    const stored = await evalJS(cd, "JSON.parse(localStorage.getItem('mc_tiku_pc_v1')).answers['1'].correct");
    check("PC 答题写入本地存储", stored === true, String(stored));
    await shot(cd, "pc-answered");

    // 下一题
    await evalJS(cd, "document.querySelector('#nextBtn').click()");
    await sleep(200);
    check("PC 下一题切换", (await text(cd, ".qindex")).includes("第 2 / 398"));

    // 收藏
    await evalJS(cd, "document.querySelector('#starInline').click()");
    await sleep(200);
    check("PC 收藏写入", (await evalJS(cd, "Object.keys(JSON.parse(localStorage.getItem('mc_tiku_pc_v1')).fav).length")) === 1);
    check("PC 收藏按钮高亮", (await evalJS(cd, "document.querySelector('#starInline').classList.contains('on')")));

    // 错题本（空）
    await evalJS(cd, "document.querySelector('[data-mode=wrong]').click()");
    await sleep(200);
    check("PC 错题本空状态", (await evalJS(cd, "!!document.querySelector('.empty')")));

    // 模拟考试
    await evalJS(cd, "document.querySelector('[data-mode=exam]').click()");
    await sleep(200);
    check("PC 考试开始面板", (await evalJS(cd, "!!document.querySelector('.exam-start')")));
    await evalJS(cd, "document.querySelector('#startExamBtn').click()");
    await sleep(300);
    check("PC 考试生成 50 题", (await evalJS(cd, "document.querySelectorAll('.gbtn').length")) === 50);
    await evalJS(cd, "document.querySelectorAll('.option')[0].click()");
    await sleep(150);
    check("PC 考试选项可选中", (await evalJS(cd, "document.querySelectorAll('.option.selected').length")) === 1);
    await evalJS(cd, "document.querySelector('#submitExamBtn').click()");
    await sleep(250);
    await evalJS(cd, "document.querySelector('#okSubmit').click()");
    await sleep(400);
    check("PC 交卷显示成绩", (await evalJS(cd, "!!document.querySelector('.score-ring')")));
    check("PC 成绩写入历史", (await evalJS(cd, "JSON.parse(localStorage.getItem('mc_tiku_pc_v1')).history.length")) === 1);
    await shot(cd, "pc-exam-result", false);
    await evalJS(cd, "document.querySelector('[data-close]').click()");
    await sleep(150);

    // 重新加载：不回放已交卷考试，也不停在已答过的第 1 题
    await nav();
    check("PC 重载后不显示答案", (await evalJS(cd, "document.querySelectorAll('.explain').length")) === 0);
    check("PC 重载后跳到未答题", (await text(cd, ".qindex")).includes("第 2 / 398"));
    check("PC 已交卷考试不回放", (await evalJS(cd, "document.querySelector('[data-mode=practice]').classList.contains('active') && !document.querySelector('[data-mode=exam]').classList.contains('active')")));

    // 实操资料
    await evalJS(cd, "document.querySelector('[data-mode=docs]').click()");
    await sleep(200);
    check("PC 实操资料 5 个任务", (await evalJS(cd, "document.querySelectorAll('.task').length")) === 5);
    check("PC 代码块与答案", (await evalJS(cd, "document.querySelectorAll('.code-box').length >= 3 && document.querySelectorAll('.answer-row').length === 3")));
    await evalJS(cd, "document.querySelector('#task-2').scrollIntoView()");
    await sleep(200);
    await shot(cd, "pc-docs");

    // 搜索
    await evalJS(cd, "document.querySelector('[data-mode=practice]').click()");
    await sleep(150);
    await evalJS(cd, "(()=>{const i=document.querySelector('#searchInput');i.value='MYSQL';i.dispatchEvent(new Event('input',{bubbles:true}));return true;})()");
    await sleep(500);
    check("PC 搜索过滤命中", (await text(cd, ".qtext")).toLowerCase().includes("mysql"));
    const filtered = await evalJS(cd, "document.querySelectorAll('.gbtn').length");
    check("PC 搜索结果少于全量", filtered > 0 && filtered < 398, "count=" + filtered);
  });
  check("PC 无 JS 报错", pcErrors.length === 0, pcErrors.join(" | "));

  const pcDarkErrors = await withPage({
    url: BASE + "/pc/", clean: true,
    metrics: { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
    media: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "prefers-color-scheme", value: "dark" }
    ]
  }, async (cd) => {
    check("PC 深色模式生效", (await evalJS(cd, "document.documentElement.dataset.theme")) === "dark");
    check("PC 深色题干可读", (await evalJS(cd, "getComputedStyle(document.querySelector('.qtext')).color")) !== "rgb(15, 26, 46)");
    await shot(cd, "pc-dark");
  });
  check("PC 深色无 JS 报错", pcDarkErrors.length === 0, pcDarkErrors.join(" | "));

  /* ================= Mobile ================= */
  const mobErrors = await withPage({
    url: BASE + "/mobile/", clean: true,
    metrics: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
    media: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "prefers-color-scheme", value: "light" }
    ]
  }, async (cd, { nav }) => {
    const overflow = await evalJS(cd, "document.documentElement.scrollWidth - window.innerWidth");
    check("手机版无横向溢出", overflow <= 1, "delta=" + overflow);
    check("手机版题干渲染", (await text(cd, ".qtext")).includes("程序设计语言"));
    check("手机版首题不预显示答案", (await evalJS(cd, "document.querySelectorAll('.explain').length")) === 0);
    check("手机版 4 个选项", (await evalJS(cd, "document.querySelectorAll('.option').length")) === 4);
    const footRect = await evalJS(cd, "(()=>{const r=document.querySelector('#gridBtn').getBoundingClientRect();return {l:r.left,r:r.right,w:innerWidth}})()");
    check("手机版底部按钮在视口内", footRect.l >= 0 && footRect.r <= footRect.w + 1, JSON.stringify(footRect));
    const cardRect = await evalJS(cd, "(()=>{const r=document.querySelector('.card').getBoundingClientRect();return {l:r.left,r:r.right,w:innerWidth}})()");
    check("手机版卡片在视口内", cardRect.l >= 0 && cardRect.r <= cardRect.w + 1, JSON.stringify(cardRect));
    await shot(cd, "mobile-practice", false);

    await evalJS(cd, "document.querySelectorAll('.option')[2].click()");
    await sleep(250);
    check("手机版判分正确", (await evalJS(cd, "document.querySelectorAll('.badge.ok').length")) === 1);
    check("手机版显示解析", (await evalJS(cd, "!!document.querySelector('.explain')")));
    check("手机版写入本地存储", (await evalJS(cd, "JSON.parse(localStorage.getItem('mc_tiku_mobile_v1')).answers['1'].correct")) === true);
    await shot(cd, "mobile-answered", false);

    await evalJS(cd, "document.querySelector('#nextBtn').click()");
    await sleep(200);
    check("手机版下一题", (await text(cd, "#posText")) === "2 / 398");

    // 答题卡
    await evalJS(cd, "document.querySelector('#sheetBtn').click()");
    await sleep(350);
    check("手机版答题卡打开", (await evalJS(cd, "document.querySelector('#sheet').classList.contains('show')")));
    check("手机版答题卡 398 格", (await evalJS(cd, "document.querySelectorAll('#qgrid button').length")) === 398);
    const sheetRect = await evalJS(cd, "(()=>{const r=document.querySelector('#sheet').getBoundingClientRect();return {l:r.left,r:r.right,w:innerWidth}})()");
    check("手机版弹层在视口内", sheetRect.l >= 0 && sheetRect.r <= sheetRect.w + 1, JSON.stringify(sheetRect));
    await shot(cd, "mobile-sheet", false);

    await evalJS(cd, "document.querySelector('#qgrid button[data-jump=\"4\"]').click()");
    await sleep(350);
    check("手机版跳题", (await text(cd, "#posText")) === "5 / 398");
    check("手机版跳题后关闭弹层", (await evalJS(cd, "!document.querySelector('#sheet').classList.contains('show')")));

    // 题型筛选
    await evalJS(cd, "document.querySelector('#sheetBtn').click()");
    await sleep(250);
    await evalJS(cd, "document.querySelector('#typeSeg button[data-filter=single]').click()");
    await sleep(300);
    check("手机版单选筛选 306", (await text(cd, "#filterCount")) === "306");
    await evalJS(cd, "document.querySelector('#closeSheet').click()");
    await sleep(300);
    check("手机版筛选后题目数", (await text(cd, "#posText")).endsWith("/ 306"));

    // 刷新后持久化
    await nav();
    check("手机版刷新后记录保留", (await text(cd, "#answeredCount")) === "1", await text(cd, "#answeredCount"));
    check("手机版刷新后定位未答题", (await text(cd, "#posText")).startsWith("2 /"), await text(cd, "#posText"));
    check("手机版刷新后不显示答案", (await evalJS(cd, "document.querySelectorAll('.explain').length")) === 0);
  });
  check("手机版无 JS 报错", mobErrors.length === 0, mobErrors.join(" | "));

  /* ================= Landing ================= */
  const landErrors = await withPage({
    url: BASE + "/",
    metrics: { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
    media: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "prefers-color-scheme", value: "light" }
    ]
  }, async (cd) => {
    const overflow = await evalJS(cd, "document.documentElement.scrollWidth - window.innerWidth");
    check("首页无横向溢出", overflow <= 1, "delta=" + overflow);
    check("首页统计数字", (await text(cd, "[data-count=total]")) === "398");
    check("首页两个版本入口", (await evalJS(cd, "document.querySelectorAll('.version').length")) === 2);
    const qrWidth = await evalJS(cd, "new Promise(r=>{const i=new Image();i.onload=()=>r(i.naturalWidth);i.onerror=()=>r(0);i.src='./assets/qr-mobile.png';})");
    check("首页二维码加载", qrWidth > 0, "width=" + qrWidth);
    await shot(cd, "landing-light");
  });
  check("首页无 JS 报错", landErrors.length === 0, landErrors.join(" | "));

  const darkErrors = await withPage({
    url: BASE + "/",
    metrics: { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
    media: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "prefers-color-scheme", value: "dark" }
    ]
  }, async (cd) => {
    check("首页深色模式背景", (await evalJS(cd, "getComputedStyle(document.body).backgroundColor")) !== "rgb(255, 255, 255)");
    await shot(cd, "landing-dark");
  });
  check("首页深色无 JS 报错", darkErrors.length === 0, darkErrors.join(" | "));

  /* ================= Standalone ================= */
  const standalone = pathToFileURL(path.join(ROOT, "dist", "题库-电脑版-离线.html")).href;
  const fileErrors = await withPage({
    url: standalone,
    metrics: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false },
    media: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "prefers-color-scheme", value: "light" }
    ]
  }, async (cd) => {
    check("离线单文件题干", (await text(cd, ".qtext")).includes("程序设计语言"));
    check("离线单文件 398 题", (await evalJS(cd, "document.querySelectorAll('.gbtn').length")) === 398);
    await evalJS(cd, "document.querySelectorAll('.option')[2].click()");
    await sleep(200);
    check("离线单文件判分", (await evalJS(cd, "document.querySelectorAll('.badge.ok').length")) === 1);
    await shot(cd, "standalone-pc", false);
  });
  check("离线单文件无 JS 报错", fileErrors.length === 0, fileErrors.join(" | "));

} catch (e) {
  check("测试执行未中断", false, e.stack || String(e));
} finally {
  spawnSync("taskkill", ["/PID", String(edge.pid), "/T", "/F"], { stdio: "ignore" });
}

const failed = checks.filter((c) => !c.pass);
console.log("\n===== RESULT: " + (checks.length - failed.length) + "/" + checks.length + " passed =====");
writeFileSync(path.join(SHOTS, "e2e-result.json"), JSON.stringify({ checks, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);
