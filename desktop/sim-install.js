/* 实操安装模拟（仅 Windows 桌面版加载）
   依据实操原文与 Sublime Text / VS Code Windows 安装器实际向导页实现。 */
(function () {
  "use strict";
  if (window.TikuInstallSim) return;

  var HTML5_TEMPLATE = [
    "<!DOCTYPE html>",
    "<html lang=\"zh-CN\">",
    "<head>",
    "  <meta charset=\"UTF-8\">",
    "  <title>Hello World</title>",
    "</head>",
    "<body>",
    "  ",
    "</body>",
    "</html>"
  ].join("\n");

  var CSS = [
    ".ts-overlay{position:fixed;inset:0;z-index:200;display:flex;background:#07101f;color:#e8eef9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;font-size:13px}",
    ".ts-desk{position:relative;flex:1;min-width:0;background:radial-gradient(900px 520px at 68% 8%,#2452a8 0%,#13294f 45%,#071326 100%);overflow:hidden}",
    ".ts-icons{position:absolute;left:18px;top:54px;display:flex;flex-direction:column;gap:12px;z-index:2}",
    ".ts-icon{width:96px;border:0;background:transparent;color:#fff;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11.5px;line-height:1.3;text-align:center;padding:6px 3px;border-radius:8px;cursor:pointer}",
    ".ts-icon:hover{background:rgba(255,255,255,.13)}",
    ".ts-icon .g{font-size:32px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.45))}",
    ".ts-win{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);width:min(720px,90%);border-radius:10px;overflow:hidden;background:#f4f6fb;color:#15213a;box-shadow:0 40px 100px rgba(0,0,0,.65);z-index:5}",
    ".ts-win.dark{background:#1b1b1b;color:#e6e6e6}",
    ".ts-head{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#e4eaf5;font-size:12px;font-weight:700}",
    ".ts-win.dark .ts-head{background:#2c2c2c;color:#eee}",
    ".ts-body{padding:18px 20px;max-height:60vh;overflow:auto}",
    ".ts-body h3{margin:0 0 8px;font-size:17px}",
    ".ts-body p{margin:0 0 10px;line-height:1.7;font-size:12.8px;color:#4a5a74}",
    ".ts-win.dark .ts-body p{color:#bbb}",
    ".ts-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;flex-wrap:wrap}",
    ".ts-btn{border:1px solid #c9d4e8;background:#fff;color:#1a2740;border-radius:8px;padding:7px 14px;font-size:12.5px;font-weight:600;cursor:pointer}",
    ".ts-btn:hover{border-color:#7d92ff;color:#4056d6}",
    ".ts-btn.primary{background:#4a63e7;border-color:#4a63e7;color:#fff}",
    ".ts-btn.primary:hover{background:#3b52d4;color:#fff}",
    ".ts-btn.ghost{background:transparent;border-color:#d6deed;color:#4a5a74}",
    ".ts-win.dark .ts-btn{background:#2d2d2d;color:#e6e6e6;border-color:#444}",
    ".ts-win.dark .ts-btn.primary{background:#4a63e7;border-color:#4a63e7;color:#fff}",
    ".ts-field{width:100%;padding:8px 10px;border:1px solid #c9d4e8;border-radius:6px;background:#fff;color:#22304a;font-size:12.5px;box-sizing:border-box}",
    ".ts-check{display:flex;gap:8px;align-items:flex-start;margin:7px 0;font-size:12.8px;line-height:1.5;color:#2b3a55;cursor:pointer}",
    ".ts-check input{margin-top:2px}",
    ".ts-check small{display:block;color:#7a879c;font-size:11.5px;font-weight:400}",
    ".ts-progress{height:12px;border-radius:7px;background:#dde5f2;overflow:hidden;margin:12px 0}",
    ".ts-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#4a63e7,#8fa8ff);transition:width 1s ease}",
    ".ts-tip{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);max-width:78%;background:rgba(5,13,27,.92);border:1px solid #35507e;color:#dbe6ff;padding:9px 15px;border-radius:10px;font-size:12.5px;line-height:1.55;text-align:center;z-index:6}",
    ".ts-side{width:318px;flex:none;background:#0a1222;border-left:1px solid #1d2b45;padding:18px 16px;display:flex;flex-direction:column;gap:12px;overflow:auto}",
    ".ts-side h4{margin:0;font-size:14px;color:#fff}",
    ".ts-side .sub{font-size:11.5px;color:#8fa3c5;margin:-6px 0 0}",
    ".ts-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}",
    ".ts-steps li{position:relative;padding-left:18px;font-size:12px;line-height:1.45;color:#9fb1cc}",
    ".ts-steps li::before{content:'○';position:absolute;left:0;color:#5f7bff}",
    ".ts-steps li.done{color:#8fd6b0}.ts-steps li.done::before{content:'✓';color:#3ecf8e}",
    ".ts-steps li.cur{color:#fff;font-weight:700}.ts-steps li.cur::before{content:'●';color:#8fa8ff}",
    ".ts-side .close{margin-top:auto;background:#16294a;border:1px solid #35507e;color:#dbe6ff;border-radius:9px;padding:8px;cursor:pointer}",
    ".ts-editor{width:100%;min-height:240px;background:#1e1e1e;color:#d4d4d4;border:1px solid #333;border-radius:6px;padding:10px;font-family:'Cascadia Code',Consolas,monospace;font-size:12.5px;line-height:1.65;white-space:pre;tab-size:4;resize:vertical;box-sizing:border-box}",
    ".ts-editor:focus{outline:2px solid #4a63e7;outline-offset:1px}",
    ".ts-editor-bar{display:flex;align-items:center;gap:8px;position:relative;margin-bottom:8px;flex-wrap:wrap}",
    ".ts-menu{position:absolute;top:32px;left:0;background:#252526;border:1px solid #454545;border-radius:6px;min-width:190px;padding:4px;z-index:10;box-shadow:0 16px 34px rgba(0,0,0,.5)}",
    ".ts-menu button{display:block;width:100%;text-align:left;background:transparent;border:0;color:#ddd;padding:7px 10px;border-radius:4px;font-size:12px;cursor:pointer}",
    ".ts-menu button:hover{background:#094771;color:#fff}",
    ".ts-menu .sep{height:1px;background:#444;margin:4px 6px}",
    ".ts-lang{margin-left:auto;border:1px solid #555;background:#2d2d2d;color:#ddd;border-radius:5px;padding:4px 9px;font-size:11.5px;cursor:pointer}",
    ".ts-lang-menu{position:absolute;right:0;bottom:34px;background:#252526;border:1px solid #454545;border-radius:6px;min-width:150px;padding:4px;z-index:10}",
    ".ts-lang-menu button{display:block;width:100%;text-align:left;background:transparent;border:0;color:#ddd;padding:6px 10px;border-radius:4px;font-size:12px;cursor:pointer}",
    ".ts-lang-menu button:hover{background:#094771;color:#fff}",
    ".ts-hint{font-size:11.5px;color:#8a8a8a;margin-top:8px;line-height:1.5}",
    ".ts-start{position:absolute;left:18px;bottom:54px;width:330px;background:#101b2e;border:1px solid #2e4266;border-radius:10px;padding:12px;z-index:6;box-shadow:0 20px 50px rgba(0,0,0,.55)}",
    ".ts-start input{width:100%;box-sizing:border-box;padding:7px 9px;border-radius:7px;border:1px solid #35507e;background:#0a1526;color:#dbe6ff;font-size:12.5px}",
    ".ts-result{margin-top:8px;background:#172a49;border:1px solid #35507e;border-radius:8px;padding:9px 10px;display:flex;align-items:center;gap:9px;font-size:12.5px}",
    ".ts-result .g{font-size:20px}",
    ".ts-context{margin-top:8px;background:#1d2f4f;border:1px solid #3d5b8c;border-radius:6px;padding:4px}",
    ".ts-context button{display:block;width:100%;text-align:left;background:transparent;border:0;color:#dbe6ff;padding:6px 8px;border-radius:4px;font-size:12px;cursor:pointer}",
    ".ts-context button:hover{background:#2b4a7a}",
    ".ts-explorer{width:100%;border:1px solid #cfd8e8;border-radius:8px;overflow:hidden;background:#fff;color:#22304a}",
    ".ts-explorer .bar{padding:6px 9px;background:#e8eef8;font-size:11.5px;color:#42536e;border-bottom:1px solid #d6deeb}",
    ".ts-file{display:flex;align-items:center;gap:8px;padding:10px;font-size:12.5px;background:#eef4ff;border:1px solid #b9cdf2;border-radius:6px;margin:10px}",
    ".ts-iframe{width:100%;height:260px;border:1px solid #cfd8e8;border-radius:8px;background:#fff}",
    ".ts-runpick button{display:flex;align-items:center;gap:9px;width:100%;text-align:left;margin:6px 0;padding:10px 12px;border:1px solid #c9d4e8;border-radius:8px;background:#fff;color:#22304a;font-size:12.5px;cursor:pointer}",
    ".ts-runpick button:hover{border-color:#4a63e7;background:#eef1ff}",
    ".ts-shortcut-note{background:#eef4ff;border:1px solid #c9d8f2;border-radius:8px;padding:10px 12px;font-size:12px;color:#3d5273;line-height:1.6;margin-top:10px}",
    ".ts-gallery{display:grid;gap:12px}",
    ".ts-gallery figure{margin:0;border:1px solid #c9d4e8;border-radius:8px;overflow:hidden;background:#fff}",
    ".ts-gallery img{display:block;width:100%;height:auto}",
    ".ts-gallery figcaption{padding:7px 10px;font-size:11.5px;color:#54708f;background:#f4f7fc;border-top:1px solid #dbe4f2}",
    ".ts-sandbox-note{background:#0f2a24;border:1px solid #2c6b58;color:#9fe3c8;border-radius:8px;padding:8px 10px;font-size:11.5px;line-height:1.55}",
    ".ts-table{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0 10px}",
    ".ts-table th{text-align:left;background:#e8eef8;color:#42536e;padding:6px 8px;border:1px solid #d6deeb;font-weight:600}",
    ".ts-table td{padding:6px 8px;border:1px solid #e1e8f3;color:#2b3a55;vertical-align:top}",
    ".ts-table .path{font-family:Consolas,monospace;font-size:11px;color:#344a6b;word-break:break-all}",
    ".ts-install-log{background:#0d1b2e;border:1px solid #2b4468;border-radius:8px;padding:8px 10px;font-family:Consolas,monospace;font-size:11.5px;color:#9fd6b8;line-height:1.7;min-height:52px;margin-top:8px}",
    ".ts-vmbar{position:absolute;top:0;left:0;right:0;height:38px;z-index:7;display:flex;align-items:center;gap:12px;padding:0 14px;background:rgba(3,10,22,.85);border-bottom:1px solid #223a5e;font-size:12px;color:#cfe0ff}",
    ".ts-vmbar .ts-snap{margin-left:auto;color:#8fd6b0;font-size:11.5px}",
    ".ts-vmbar button{border:1px solid #35507e;background:#16294a;color:#dbe6ff;border-radius:6px;padding:4px 9px;font-size:11.5px;cursor:pointer}",
    ".ts-vmbar button:hover{border-color:#6f8dff}",
    ".ts-boot{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:radial-gradient(600px 400px at 50% 35%,#102446 0%,#050b14 70%);color:#dbe6ff;text-align:center}",
    ".ts-boot-logo{font-size:58px;filter:drop-shadow(0 0 24px rgba(90,140,255,.55))}",
    ".ts-boot h2{margin:0;font-size:20px}",
    ".ts-boot p{margin:0;font-size:12.5px;color:#9fb3d1}",
    ".ts-boot .ts-progress{width:min(420px,62%)}",
    ".ts-boot .ts-boot-small{font-size:11px;color:#6f86a8;margin-top:4px}"
  ].join("\n");

  function injectCss() {
    if (document.getElementById("ts-sim-css")) return;
    var style = document.createElement("style");
    style.id = "ts-sim-css";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  var PRODUCT = {
    sublime: {
      name: "Sublime Text",
      setup: "sublime_text_build_4152_x64_setup.exe",
      path: "C:\\Program Files\\Sublime Text",
      menu: "Sublime Text"
    },
    vscode: {
      name: "Visual Studio Code",
      setup: "VSCodeUserSetup-x64-1.94.2.exe",
      path: "C:\\Users\\考生\\AppData\\Local\\Programs\\Microsoft VS Code",
      menu: "Visual Studio Code"
    }
  };

  var overlay = null;
  var s = null;

  var SHOTS = {
    sublime: [
      { src: "sim-assets/sublime-dest.png", caption: "Select Destination Location · 真实安装器第一页（无欢迎/许可页）" }
    ],
    vscode: [
      { src: "sim-assets/vscode-license.png", caption: "许可协议（我同意此协议）" },
      { src: "sim-assets/vscode-tasks.png", caption: "选择附加任务（默认未勾选“创建桌面快捷方式”）" },
      { src: "sim-assets/vscode-ready.png", caption: "准备安装（附加任务汇总）" }
    ]
  };

  var SANDBOX_USER = "C:\\Users\\考生";
  var SANDBOX_DESKTOP = SANDBOX_USER + "\\Desktop";
  var SANDBOX_START = "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs";

  function defaultSandbox(variant) {
    var sb = { files: [], shortcuts: [], registry: [], installedApp: false };
    if (variant === "sublime") {
      sb.files.push({ path: SANDBOX_DESKTOP + "\\SublimeText.zip", size: "15.8 MB", kind: "压缩文件" });
    } else {
      sb.files.push({ path: SANDBOX_DESKTOP + "\\VSCodeUserSetup-x64-1.94.2.exe", size: "96.8 MB", kind: "安装程序" });
    }
    return sb;
  }

  function addSandboxFile(path, size, kind, content) {
    if (!s || !s.sandbox) return;
    var hit = s.sandbox.files.find(function (f) { return f.path === path; });
    if (hit) { hit.size = size; hit.kind = kind; hit.content = content || hit.content; return; }
    s.sandbox.files.push({ path: path, size: size, kind: kind, content: content || "" });
  }

  function addSandboxShortcut(name, target, place) {
    if (!s || !s.sandbox) return;
    var dir = place === "desktop" ? SANDBOX_DESKTOP : SANDBOX_START;
    var path = dir + "\\" + name + ".lnk";
    if (s.sandbox.shortcuts.some(function (x) { return x.path === path; })) return;
    s.sandbox.shortcuts.push({ name: name, target: target, place: place, path: path });
  }

  function addSandboxRegistry(key, value) {
    if (!s || !s.sandbox) return;
    if (s.sandbox.registry.some(function (x) { return x.key === key; })) return;
    s.sandbox.registry.push({ key: key, value: value });
  }

  function installAppIntoSandbox() {
    if (!s || !s.sandbox || s.sandbox.installedApp) return;
    if (s.variant === "sublime") {
      addSandboxFile("C:\\Program Files\\Sublime Text\\sublime_text.exe", "14.2 MB", "应用程序");
      addSandboxFile("C:\\Program Files\\Sublime Text\\sublime_plugin.py", "186 KB", "Python 脚本");
      addSandboxFile("C:\\Program Files\\Sublime Text\\Packages\\Default.sublime-package", "1.6 MB", "资源包");
      addSandboxFile("C:\\Program Files\\Sublime Text\\unins000.exe", "1.1 MB", "卸载程序");
      addSandboxShortcut("Sublime Text", "C:\\Program Files\\Sublime Text\\sublime_text.exe", "start");
      addSandboxRegistry("HKLM\\SOFTWARE\\Sublime Text", "InstallDir = C:\\Program Files\\Sublime Text");
    } else {
      var dir = "C:\\Users\\考生\\AppData\\Local\\Programs\\Microsoft VS Code";
      addSandboxFile(dir + "\\Code.exe", "128 MB", "应用程序");
      addSandboxFile(dir + "\\resources\\app\\out\\main.js", "2.4 MB", "JavaScript");
      addSandboxFile(dir + "\\Uninstall.exe", "1.3 MB", "卸载程序");
      addSandboxShortcut("Visual Studio Code", dir + "\\Code.exe", "start");
      if (s.tasks.desktop) addSandboxShortcut("Visual Studio Code", dir + "\\Code.exe", "desktop");
      addSandboxRegistry("HKCU\\Software\\Microsoft\\VS Code", "InstallLocation = " + dir);
    }
    s.sandbox.installedApp = true;
  }

  function resetSandbox() {
    if (!s) return;
    if (s.installTimer) { clearInterval(s.installTimer); s.installTimer = null; }
    if (s.extractTimer) { clearInterval(s.extractTimer); s.extractTimer = null; }
    if (s.bootTimer) { clearInterval(s.bootTimer); s.bootTimer = null; }
    var variant = s.variant;
    s.sandbox = defaultSandbox(variant);
    s.stage = "desktop";
    s.installerStarted = false;
    s.accept = false;
    s.destChosen = false;
    s.startMenuChosen = false;
    s.tasks = { desktop: false, file: false, dir: false, register: false, path: false };
    s.installed = false;
    s.shortcut = false;
    s.shortcutStep = 0;
    s.lang = "Plain Text";
    s.code = "";
    s.newFile = false;
    s.saved = false;
    s.browser = false;
    s.editorOpened = false;
    s.fileMenu = false;
    s.langMenu = false;
    s.fileName = "hello.html";
    s.explorerOpen = false;
    s.galleryOpen = false;
    s.installLog = [];
    s.installPct = 0;
    s.extracted = false;
    s.extractPct = 0;
    s.extractLog = [];
    s.bootPct = 0;
    s.variant = variant;
    s.tip = "快照已恢复：考试起始状态（内置 zip / 安装包已就位）";
    render();
  }

  function open(variant) {
    if (overlay) return;
    injectCss();
    s = {
      variant: variant === "vscode" ? "vscode" : "sublime",
      stage: "desktop",
      installerStarted: false,
      accept: false,
      destChosen: false,
      startMenuChosen: false,
      tasks: { desktop: false, file: false, dir: false, register: false, path: false },
      installed: false,
      shortcut: false,
      shortcutStep: 0,
      lang: "Plain Text",
      code: "",
      newFile: false,
      saved: false,
      browser: false,
      editorOpened: false,
      fileMenu: false,
      langMenu: false,
      fileName: "hello.html",
      tip: "",
      galleryOpen: false,
      sandbox: null,
      explorerOpen: false,
      installLog: [],
      installPct: 0,
      installTimer: null,
      bootPct: 0,
      bootTimer: null,
      extracted: false,
      extractPct: 0,
      extractLog: [],
      extractTimer: null
    };
    s.sandbox = defaultSandbox(s.variant);
    s.tip = "正在启动虚拟机并恢复考试起始快照";

    overlay = document.createElement("div");
    overlay.className = "ts-overlay";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    overlay.addEventListener("click", onClick);
    overlay.addEventListener("input", onInput);
    overlay.addEventListener("change", onChange);
    overlay.addEventListener("keydown", onKeyDown);
    startBoot();
  }

  function close() {
    if (!overlay) return;
    if (s && s.installTimer) { clearInterval(s.installTimer); s.installTimer = null; }
    if (s && s.extractTimer) { clearInterval(s.extractTimer); s.extractTimer = null; }
    if (s && s.bootTimer) { clearInterval(s.bootTimer); s.bootTimer = null; }
    overlay.remove();
    overlay = null;
    s = null;
    document.body.style.overflow = "";
  }

  function product() { return PRODUCT[s.variant]; }

  function setTip(text) { s.tip = text; render(); }

  function startBoot() {
    if (!s) return;
    s.stage = "booting";
    s.bootPct = 0;
    s.tip = "正在启动虚拟机并恢复考试起始快照";
    render();
    if (s.bootTimer) clearInterval(s.bootTimer);
    s.bootTimer = setInterval(function () {
      if (!overlay || s.stage !== "booting") {
        if (s.bootTimer) clearInterval(s.bootTimer);
        s.bootTimer = null;
        return;
      }
      s.bootPct = Math.min(100, (s.bootPct || 0) + 20);
      render();
      if (s.bootPct >= 100) {
        clearInterval(s.bootTimer); s.bootTimer = null;
        setTimeout(function () {
          if (!overlay || s.stage !== "booting") return;
          s.stage = "desktop";
          s.tip = "虚拟机已启动：快照“考试起始状态”已恢复";
          render();
        }, 300);
      }
    }, 220);
  }

  function bootHtml() {
    return '<div class="ts-boot">' +
      '<div class="ts-boot-logo">🖥️</div>' +
      '<h2>虚拟机正在启动</h2>' +
      '<p>正在恢复快照：考试起始状态</p>' +
      '<div class="ts-progress"><i style="width:' + (s.bootPct || 0) + '%"></i></div>' +
      '<p class="ts-boot-small">虚拟磁盘 C:\\TikuVM\\disk.vhd · 快照 disk-考试起始状态</p>' +
      '</div>';
  }

  function render() {
    if (!overlay) return;
    var p = product();
    var booting = s.stage === "booting";
    var icons = "";
    if (!booting) {
      if (s.variant === "sublime") {
        icons += s.extracted
          ? '<button class="ts-icon" data-icon="folder"><span class="g">📁</span><span>SublimeText</span></button>'
          : '<button class="ts-icon" data-icon="zip"><span class="g">📦</span><span>SublimeText.zip</span></button>';
      } else {
        icons += '<button class="ts-icon" data-icon="setup"><span class="g">⚙️</span><span>' + esc(p.setup) + '</span></button>';
      }
      icons += '<button class="ts-icon" data-icon="pc"><span class="g">🖥️</span><span>此电脑</span></button>';
      if (s.shortcut) icons += '<button class="ts-icon" data-icon="shortcut"><span class="g">📝</span><span>' + esc(p.name) + '</span></button>';
      if (s.saved) icons += '<button class="ts-icon" data-icon="html"><span class="g">🌐</span><span>' + esc(s.fileName) + '</span></button>';
    }
    var vmbar = booting ? "" :
      '<div class="ts-vmbar"><span>🖥 虚拟机 · Windows 10</span><span class="ts-snap">快照：考试起始状态</span><button data-act="reset-sandbox">恢复快照</button></div>';

    var list = checklist();
    var current = list.findIndex(function (t) { return !t.done; });
    var steps = list.map(function (t, i) {
      return '<li class="' + (t.done ? "done" : (i === current ? "cur" : "")) + '">' + esc(t.text) + '</li>';
    }).join("");

    overlay.innerHTML =
      '<div class="ts-desk">' +
        vmbar +
        (icons ? '<div class="ts-icons">' + icons + '</div>' : '') +
        windowHtml() +
        (booting ? '' : '<div class="ts-tip">' + esc(s.tip || "按右侧步骤完成实操") + '</div>') +
      '</div>' +
      '<aside class="ts-side">' +
        '<h4>' + esc(p.name) + ' 安装全流程</h4>' +
        '<div class="sub">依据实操要求与安装器实际向导页</div>' +
        '<div class="ts-sandbox-note">🖥️ 应用内虚拟机 · 快照恢复<br>虚拟磁盘、内置 zip/安装包，关机后丢弃改动</div>' +
        '<ul class="ts-steps">' + steps + '</ul>' +
        '<button class="close" data-act="explorer" style="margin-top:auto">虚拟机文件</button>' +
        '<button class="close" data-act="gallery" style="margin-top:0">查看真实安装界面</button>' +
        '<button class="close" data-close style="margin-top:0">关机并丢弃更改</button>' +
      '</aside>';
  }

  function checklist() {
    if (s.variant === "sublime") {
      return [
        { text: "解压 SublimeText.zip", done: s.extracted },
        { text: "运行安装程序，进入向导", done: s.installerStarted },
        { text: "选择安装位置", done: s.destChosen },
        { text: "选择开始菜单文件夹", done: s.startMenuChosen },
        { text: "完成安装", done: s.installed },
        { text: "发送到 → 桌面快捷方式", done: s.shortcut },
        { text: "双击快捷方式打开编辑器", done: s.editorOpened },
        { text: "右下角语言改为 HTML", done: s.lang === "HTML" },
        { text: "输入 Hello World", done: /hello\s*world/i.test(s.code) },
        { text: "File → Save As 保存到桌面", done: s.saved },
        { text: "浏览器显示 Hello World", done: s.browser }
      ];
    }
    return [
      { text: "双击安装包，进入向导", done: s.installerStarted },
      { text: "接受许可协议", done: s.accept },
      { text: "选择安装位置", done: s.destChosen },
      { text: "选择开始菜单文件夹", done: s.startMenuChosen },
      { text: "附加任务勾选“创建桌面快捷方式”", done: s.tasks.desktop },
      { text: "完成安装", done: s.installed },
      { text: "双击桌面图标打开编辑器", done: s.editorOpened },
      { text: "File → New Text File 并设为 HTML", done: s.newFile && s.lang === "HTML" },
      { text: "输入 Hello World", done: /hello\s*world/i.test(s.code) },
      { text: "F5 保存到桌面并运行", done: s.saved },
      { text: "浏览器显示 Hello World", done: s.browser }
    ];
  }

  function windowHtml() {
    if (s.stage === "booting") return bootHtml();
    if (s.galleryOpen) return galleryHtml();
    if (s.explorerOpen) return explorerHtml();
    if (s.stage === "desktop") return "";
    if (s.stage === "extract") return extractHtml();
    if (s.stage === "folder") return folderHtml();
    if (["welcome", "license", "dest", "startmenu", "tasks", "ready", "installing", "finish"].indexOf(s.stage) >= 0) return installerHtml();
    if (s.stage === "shortcut") return shortcutHtml();
    if (s.stage === "editor") return editorHtml();
    if (s.stage === "save") return saveHtml();
    if (s.stage === "runpicker") return runPickerHtml();
    if (s.stage === "browser") return browserHtml();
    return "";
  }

  function extractHtml() {
    return '<div class="ts-win"><div class="ts-head">解压文件 - SublimeText.zip</div><div class="ts-body">' +
      '<h3>解压到</h3>' +
      '<p>目标文件夹：' + esc(SANDBOX_DESKTOP + "\\SublimeText") + '</p>' +
      '<div class="ts-progress"><i style="width:' + (s.extractPct || 0) + '%"></i></div>' +
      '<div class="ts-install-log">' + (s.extractLog || []).map(function (x) {
        return '<div>✓ ' + esc(x) + '</div>';
      }).join("") + '</div>' +
      '<p style="font-size:11.5px;color:#7a879c">解压会在虚拟磁盘中生成 SublimeText 文件夹和安装程序，不会改动真实文件。</p>' +
      actions([btn("取消", "extract-cancel", "ghost"), btn("解压", "extract-start", "primary")]) +
      '</div></div>';
  }

  function folderHtml() {
    var folder = SANDBOX_DESKTOP + "\\SublimeText";
    var files = (s.sandbox.files || []).filter(function (f) { return f.path.indexOf(folder + "\\") === 0; });
    var rows = files.length ? files.map(function (f) {
      return '<tr><td class="path">' + esc(f.path) + '</td><td>' + esc(f.size) + '</td><td>' + esc(f.kind) + '</td></tr>';
    }).join("") : '<tr><td colspan="3" style="color:#7a879c">文件夹为空</td></tr>';
    return '<div class="ts-win"><div class="ts-head">📁 SublimeText - 文件资源管理器</div><div class="ts-body">' +
      '<p>路径：' + esc(folder) + '</p>' +
      '<table class="ts-table"><thead><tr><th>名称</th><th>大小</th><th>类型</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p style="font-size:11.5px;color:#7a879c">双击文件夹里的 <b>sublime_text_build_4152_x64_setup.exe</b> 开始安装。</p>' +
      actions([btn("返回桌面", "folder-close", "ghost"), btn("运行 sublime_text_build_4152_x64_setup.exe", "run-setup", "primary")]) +
      '</div></div>';
  }

  function startExtract() {
    var steps = [
      "读取 C:\\Users\\考生\\Desktop\\SublimeText.zip",
      "解压 sublime_text_build_4152_x64_setup.exe（15.6 MB）",
      "解压 Readme.txt",
      "创建文件夹 C:\\Users\\考生\\Desktop\\SublimeText"
    ];
    if (s.extractTimer) clearInterval(s.extractTimer);
    s.extractPct = 0; s.extractLog = []; render();
    var i = 0;
    s.extractTimer = setInterval(function () {
      if (!overlay || s.stage !== "extract") {
        if (s.extractTimer) clearInterval(s.extractTimer);
        s.extractTimer = null;
        return;
      }
      i++;
      s.extractPct = Math.min(100, Math.round(i * 100 / steps.length));
      if (steps[i - 1]) s.extractLog.push(steps[i - 1]);
      render();
      if (i >= steps.length) {
        clearInterval(s.extractTimer); s.extractTimer = null;
        addSandboxFile("C:\\Users\\考生\\Desktop\\SublimeText\\sublime_text_build_4152_x64_setup.exe", "15.6 MB", "安装程序");
        addSandboxFile("C:\\Users\\考生\\Desktop\\SublimeText\\Readme.txt", "2 KB", "文本文件");
        s.extracted = true;
        s.stage = "desktop";
        s.tip = "解压完成：SublimeText 文件夹已生成在虚拟桌面";
        render();
      }
    }, 260);
  }

  function startInstaller() {
    s.installerStarted = true;
    s.stage = s.variant === "sublime" ? "dest" : "license";
    s.tip = s.variant === "sublime" ? "Sublime 安装器第一页就是选择安装位置，点“下一步”" : "勾选接受协议后点“下一步”";
    render();
  }

  function installerHtml() {
    var p = product();
    var stepOrder = s.variant === "sublime"
      ? ["dest", "startmenu", "installing", "finish"]
      : ["license", "dest", "startmenu", "tasks", "ready", "installing", "finish"];
    var stepIndex = stepOrder.indexOf(s.stage) + 1;

    var body = "";
    if (s.stage === "welcome") {
      body = '<h3>欢迎使用 ' + esc(p.name) + ' 安装向导</h3>' +
        '<p>这个向导将引导你完成 ' + esc(p.name) + ' 的安装。</p>' +
        '<p style="font-size:11.5px;color:#7a879c">安装向导第 1 步，共 7 步</p>' +
        actions([btn("下一步 →", "to-license", "primary")]);
    } else if (s.stage === "license") {
      body = '<h3>许可协议</h3>' +
        '<p>请阅读以下许可协议。安装前必须接受协议中的条款。</p>' +
        '<div class="ts-shortcut-note" style="max-height:110px;overflow:auto;background:#f7f9fd">' +
          'This license agreement is a legal agreement between you and the software publisher. ' +
          'By installing and using this software you agree to be bound by the terms of this agreement.' +
        '</div>' +
        '<label class="ts-check" style="margin-top:10px"><input type="checkbox" id="ts-accept"' + (s.accept ? " checked" : "") + '> 我接受许可协议中的条款</label>' +
        actions([btn("← 上一步", "back", "ghost"), btn("下一步 →", "to-dest", "primary")]);
    } else if (s.stage === "dest") {
      body = '<h3>选择安装位置</h3>' +
        '<p>安装程序将把 ' + esc(p.name) + ' 安装到下面的文件夹。点击“下一步”继续，或点击“浏览”选择其他位置。</p>' +
        '<input class="ts-field" value="' + esc(p.path) + '" readonly>' +
        '<p style="font-size:11.5px;color:#7a879c;margin-top:8px">目标文件夹：' + esc(p.path) + '</p>' +
        actions([s.variant === "sublime" ? btn("取消", "cancel-install", "ghost") : btn("← 上一步", "back", "ghost"), btn("下一步 →", "to-startmenu", "primary")]);
    } else if (s.stage === "startmenu") {
      body = '<h3>选择开始菜单文件夹</h3>' +
        '<p>安装程序将在下面的开始菜单文件夹中创建程序的快捷方式。</p>' +
        '<input class="ts-field" value="' + esc(p.menu) + '" readonly>' +
        actions([btn("← 上一步", "back", "ghost"), btn(s.variant === "vscode" ? "下一步 →" : "安装", s.variant === "vscode" ? "to-tasks" : "install", "primary")]);
    } else if (s.stage === "tasks") {
      var t = s.tasks;
      body = '<h3>选择附加任务</h3>' +
        '<p>请选择安装程序要执行的附加任务。</p>' +
        '<label class="ts-check"><input type="checkbox" data-task="desktop"' + (t.desktop ? " checked" : "") + '> 创建桌面快捷方式<small>考试要求：在桌面生成快捷方式</small></label>' +
        '<label class="ts-check"><input type="checkbox" data-task="file"' + (t.file ? " checked" : "") + '> 将“通过 Code 打开”操作添加到 Windows 资源管理器文件上下文菜单</label>' +
        '<label class="ts-check"><input type="checkbox" data-task="dir"' + (t.dir ? " checked" : "") + '> 将“通过 Code 打开”操作添加到 Windows 资源管理器目录上下文菜单</label>' +
        '<label class="ts-check"><input type="checkbox" data-task="register"' + (t.register ? " checked" : "") + '> 将 Code 注册为受支持的文件类型的编辑器</label>' +
        '<label class="ts-check"><input type="checkbox" data-task="path"' + (t.path ? " checked" : "") + '> 添加到 PATH（重启后生效）</label>' +
        actions([btn("← 上一步", "back", "ghost"), btn("下一步 →", "to-ready", "primary")]);
    } else if (s.stage === "ready") {
      body = '<h3>准备安装</h3>' +
        '<p>安装程序现在准备开始安装 ' + esc(p.name) + ' 到你的电脑。</p>' +
        '<p style="font-size:11.5px;color:#7a879c">位置：' + esc(p.path) + '<br>开始菜单文件夹：' + esc(p.menu) + '</p>' +
        actions([btn("← 上一步", "back", "ghost"), btn("安装", "install", "primary")]);
    } else if (s.stage === "installing") {
      body = '<h3>正在安装…</h3>' +
        '<p>正在向沙盒虚拟 C 盘复制文件并创建开始菜单快捷方式。</p>' +
        '<div class="ts-progress"><i style="width:' + (s.installPct || 0) + '%"></i></div>' +
        '<div class="ts-install-log">' + (s.installLog || []).map(function (x) {
          return '<div>✓ ' + esc(x) + '</div>';
        }).join("") + '</div>' +
        '<p style="font-size:11.5px;color:#7a879c">安装位置：' + esc(p.path) + '（沙盒虚拟路径，不会写入真实 C 盘）</p>';
    } else if (s.stage === "finish") {
      body = '<h3>完成 ' + esc(p.name) + ' 安装向导</h3>' +
        '<p>' + esc(p.name) + ' 已安装到沙盒的虚拟 C 盘。</p>' +
        '<div class="ts-shortcut-note">已创建：' + (s.variant === "sublime"
          ? "C:\\Program Files\\Sublime Text\\sublime_text.exe<br>开始菜单：Sublime Text"
          : "C:\\Users\\考生\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe<br>开始菜单：Visual Studio Code") +
        '<br>这些内容只存在于本次模拟沙盒，退出后自动还原。</div>' +
        '<label class="ts-check"><input type="checkbox" checked disabled> 运行 ' + esc(p.name) + '</label>' +
        actions([btn("完成", "finish", "primary")]);
    }

    return '<div class="ts-win"><div class="ts-head">' + esc(p.name) + ' 安装程序 · 第 ' + stepIndex + ' 步</div>' +
      '<div class="ts-body">' + body + '</div></div>';
  }

  function actions(buttons) {
    return '<div class="ts-actions">' + buttons.join("") + '</div>';
  }
  function btn(text, act, cls) {
    return '<button class="ts-btn ' + (cls || "") + '" data-act="' + act + '">' + esc(text) + '</button>';
  }

  function shortcutHtml() {
    var p = product();
    var body = "";
    if (s.shortcutStep === 0) {
      body = '<h3>创建桌面快捷方式 · 第 1 步</h3>' +
        '<p>安装器不会自动创建桌面快捷方式。请打开开始菜单，搜索“' + esc(p.name) + '”。</p>' +
        '<div class="ts-start" style="position:static;width:100%;box-shadow:none">' +
          '<input value="' + esc(p.name) + '" readonly>' +
          '<div class="ts-result"><span class="g">📝</span><span>' + esc(p.name) + '</span></div>' +
          '<div class="ts-context"><button data-act="shortcut-1">右键 → 打开文件所在位置</button></div>' +
        '</div>' +
        '<div class="ts-shortcut-note">对应实操步骤：在开始菜单搜索到 ' + esc(p.name) + '，右键 → 打开文件所在位置。</div>';
    } else if (s.shortcutStep === 1) {
      body = '<h3>创建桌面快捷方式 · 第 2 步</h3>' +
        '<p>在打开的文件夹中，右键单击 <b>' + (s.variant === "sublime" ? "sublime_text.exe" : "Code.exe") + '</b>，选择“发送到 → 桌面快捷方式”。</p>' +
        '<div class="ts-explorer">' +
          '<div class="bar">' + esc(p.path) + '</div>' +
          '<div class="ts-file">📄 ' + (s.variant === "sublime" ? "sublime_text.exe" : "Code.exe") + '</div>' +
          '<div class="ts-context" style="margin:0 10px 10px"><button data-act="shortcut-2">右键 → 发送到 → 桌面快捷方式</button></div>' +
        '</div>' +
        '<div class="ts-shortcut-note">完成后，桌面上会出现 ' + esc(p.name) + ' 快捷方式。</div>';
    } else {
      body = '<h3>桌面快捷方式已创建</h3>' +
        '<p>桌面上已经出现 ' + esc(p.name) + ' 快捷方式，双击它即可打开编辑器。</p>' +
        '<div class="ts-shortcut-note">✓ 快捷方式：' + esc(p.name) + ' - 快捷方式</div>' +
        actions([btn("返回桌面", "shortcut-done", "primary")]);
    }
    return '<div class="ts-win"><div class="ts-head">创建桌面快捷方式</div><div class="ts-body">' + body + '</div></div>';
  }

  function editorHtml() {
    var isSublime = s.variant === "sublime";
    var menus = s.fileMenu
      ? '<div class="ts-menu">' +
          (isSublime
            ? '<button data-act="save-as">Save As…</button><div class="sep"></div><button data-act="file-menu">关闭菜单</button>'
            : '<button data-act="new-file">New Text File</button><div class="sep"></div><button data-act="save-as">Save As…</button>') +
        '</div>'
      : "";
    var langMenu = s.langMenu
      ? '<div class="ts-lang-menu">' +
          ["Plain Text", "HTML", "CSS", "JavaScript"].map(function (x) {
            return '<button data-lang="' + x + '">' + x + '</button>';
          }).join("") +
        '</div>'
      : "";

    var header = isSublime
      ? '<div class="ts-head">Sublime Text — 未命名</div>'
      : '<div class="ts-head">Visual Studio Code — 未命名</div>';

    return '<div class="ts-win dark"><div class="ts-head">' + esc(product().name) + ' — 未命名</div>' +
      '<div class="ts-body">' +
        '<div class="ts-editor-bar">' +
          '<button class="ts-btn" data-act="file-menu" style="background:#2d2d2d;border-color:#444;color:#ddd">File</button>' +
          (isSublime ? '' : '<button class="ts-btn" data-act="run" style="background:#2d2d2d;border-color:#444;color:#ddd">▶ 运行 (F5)</button>') +
          '<button class="ts-lang" data-act="lang-menu">' + esc(s.lang) + '</button>' +
          menus + langMenu +
        '</div>' +
        '<textarea class="ts-editor" id="ts-code" spellcheck="false" placeholder="' + (isSublime ? "输入 html 后按 Tab 生成 HTML5 框架" : "输入 HTML 代码，或按 F5 运行") + '">' + esc(s.code) + '</textarea>' +
        '<div class="ts-hint">' + (isSublime
          ? '操作：右下角把 Plain Text 改为 HTML → 输入 html 后按 Tab 生成框架 → 在 &lt;body&gt; 中输入 hello world → File → Save As 保存到桌面。'
          : '操作：File → New Text File → 右下角改为 HTML → 输入 &lt;HTML&gt; &lt;BODY&gt;&lt;p&gt;hello world!&lt;/p&gt;&lt;/BODY&gt;&lt;/HTML&gt; → 按 F5 保存并运行。') + '</div>' +
      '</div></div>';
  }

  function saveHtml() {
    return '<div class="ts-win"><div class="ts-head">另存为</div><div class="ts-body">' +
      '<h3>另存为</h3>' +
      '<p>保存位置：桌面</p>' +
      '<label style="font-size:12.5px">文件名：<input class="ts-field" id="ts-file-name" value="' + esc(s.fileName) + '" style="width:60%;display:inline-block;margin-left:6px"></label>' +
      '<p style="font-size:11.5px;color:#7a879c;margin-top:6px">扩展名使用 .html</p>' +
      actions([btn("取消", "back-editor", "ghost"), btn("保存", "save", "primary")]) +
      '</div></div>';
  }

  function runPickerHtml() {
    return '<div class="ts-win"><div class="ts-head">选择运行环境</div><div class="ts-body">' +
      '<h3>选择运行环境</h3>' +
      '<p>选择用哪个环境运行这个 HTML 文件。</p>' +
      '<div class="ts-runpick">' +
        '<button data-act="run-browser">🌐 浏览器（Edge / Chrome）</button>' +
        '<button data-act="run-node">Node.js</button>' +
      '</div>' +
      '</div></div>';
  }

  function browserHtml() {
    return '<div class="ts-win"><div class="ts-head">' + esc(s.fileName) + ' - Microsoft Edge</div><div class="ts-body">' +
      '<iframe class="ts-iframe" sandbox="" srcdoc="' + esc(s.code) + '"></iframe>' +
      '<div class="ts-shortcut-note">如果页面显示 Hello World，本题完成。文件已保存在沙盒桌面。</div>' +
      actions([btn("完成", "finish-close", "primary")]) +
      '</div></div>';
  }

  function explorerHtml() {
    var files = (s.sandbox && s.sandbox.files) || [];
    var shortcuts = (s.sandbox && s.sandbox.shortcuts) || [];
    var reg = (s.sandbox && s.sandbox.registry) || [];

    var fileRows = files.length ? files.map(function (f) {
      return '<tr><td class="path">' + esc(f.path) + '</td><td>' + esc(f.size) + '</td><td>' + esc(f.kind) + '</td></tr>';
    }).join("") : '<tr><td colspan="3" style="color:#7a879c">尚未安装任何程序，先完成安装向导</td></tr>';

    var scRows = shortcuts.length ? shortcuts.map(function (x) {
      return '<tr><td>' + (x.place === "desktop" ? "桌面" : "开始菜单") + '</td><td>' + esc(x.name) + '.lnk</td><td class="path">' + esc(x.target) + '</td></tr>';
    }).join("") : '<tr><td colspan="3" style="color:#7a879c">暂无快捷方式</td></tr>';

    var regRows = reg.length ? reg.map(function (x) {
      return '<tr><td class="path">' + esc(x.key) + '</td><td class="path">' + esc(x.value) + '</td></tr>';
    }).join("") : '<tr><td colspan="2" style="color:#7a879c">暂无注册表项</td></tr>';

    return '<div class="ts-win"><div class="ts-head">🖥️ 虚拟机文件管理器 · 虚拟磁盘 C:</div><div class="ts-body">' +
      '<p>这里的文件、快捷方式和注册表来自虚拟机快照“考试起始状态”，本次操作只写入虚拟磁盘。关机或恢复快照后全部丢弃，不会改动真实电脑。</p>' +
      '<h3>已安装文件</h3>' +
      '<table class="ts-table"><thead><tr><th>路径</th><th>大小</th><th>类型</th></tr></thead><tbody>' + fileRows + '</tbody></table>' +
      '<h3>快捷方式</h3>' +
      '<table class="ts-table"><thead><tr><th>位置</th><th>名称</th><th>目标</th></tr></thead><tbody>' + scRows + '</tbody></table>' +
      '<h3>注册表</h3>' +
      '<table class="ts-table"><thead><tr><th>键</th><th>值</th></tr></thead><tbody>' + regRows + '</tbody></table>' +
      actions([btn("恢复快照", "reset-sandbox", "ghost"), btn("返回", "explorer-close", "primary")]) +
      '</div></div>';
  }

  function galleryHtml() {
    var shots = SHOTS[s.variant] || [];
    return '<div class="ts-win"><div class="ts-head">真实安装界面 · ' + esc(product().name) + '</div><div class="ts-body">' +
      '<p>以下截图来自官方安装包的实际向导页，可与上面的模拟步骤对照。</p>' +
      '<div class="ts-gallery">' + shots.map(function (x) {
        return '<figure><img src="' + esc(x.src) + '" alt="' + esc(x.caption) + '"><figcaption>' + esc(x.caption) + '</figcaption></figure>';
      }).join("") + '</div>' +
      actions([btn("返回模拟", "gallery-close", "primary")]) +
      '</div></div>';
  }

  function onClick(e) {
    var t = e.target;
    var closeBtn = t.closest("[data-close]");
    if (closeBtn) { close(); return; }

    var icon = t.closest("[data-icon]");
    if (icon) {
      var name = icon.getAttribute("data-icon");
      if (name === "zip" && s.stage === "desktop") {
        s.stage = "extract"; s.extractPct = 0; s.extractLog = [];
        s.tip = "把 SublimeText.zip 解压到虚拟桌面";
        render();
      } else if (name === "setup" && s.stage === "desktop") {
        startInstaller();
      } else if (name === "folder" && s.stage === "desktop" && s.extracted) {
        s.stage = "folder";
        s.tip = "打开 SublimeText 文件夹，运行安装程序";
        render();
      } else if (name === "shortcut" && s.stage === "desktop" && s.shortcut) {
        s.stage = "editor"; s.editorOpened = true;
        s.tip = s.variant === "sublime" ? "修改语言并输入 hello world" : "File → New Text File，然后输入代码";
        render();
        focusEditor();
      } else if (name === "html" && s.stage === "desktop" && s.saved) {
        s.stage = "browser"; s.browser = true; render();
      } else if (name === "pc") {
        s.explorerOpen = true;
        s.tip = "沙盒文件管理器：这里能看到虚拟 C 盘中的安装结果";
        render();
      }
      return;
    }

    var el = t.closest("[data-act]");
    if (el) { act(el.getAttribute("data-act")); return; }

    var lang = t.closest("[data-lang]");
    if (lang) {
      s.lang = lang.getAttribute("data-lang");
      s.langMenu = false;
      s.tip = "语言已改为 " + s.lang;
      render();
      focusEditor();
      return;
    }
  }

  function act(a) {
    if (a === "to-license") { s.stage = "license"; s.tip = "阅读并接受许可协议"; render(); }
    else if (a === "to-dest") {
      if (!s.accept) { s.tip = "请先勾选“我接受许可协议中的条款”"; render(); return; }
      s.stage = "dest"; s.tip = "确认安装位置后点“下一步”"; render();
    }
    else if (a === "to-startmenu") { s.destChosen = true; s.stage = "startmenu"; s.tip = "确认开始菜单文件夹"; render(); }
    else if (a === "to-tasks") { s.startMenuChosen = true; s.stage = "tasks"; s.tip = "附加任务中勾选“创建桌面图标”"; render(); }
    else if (a === "to-ready") {
      if (s.stage === "tasks") {
        if (!s.tasks.desktop) { s.tip = "考试要求在桌面生成快捷方式，请勾选“创建桌面快捷方式”"; render(); return; }
      }
      if (s.stage === "startmenu") s.startMenuChosen = true;
      s.stage = "ready"; s.tip = "点击“安装”开始"; render();
    }
    else if (a === "install") {
      if (s.stage === "startmenu") s.startMenuChosen = true;
      s.stage = "installing"; s.installPct = 0; s.installLog = [];
      s.tip = "正在写入沙盒虚拟 C 盘"; render();
      var steps = s.variant === "sublime"
        ? [
            "创建目录 C:\\Program Files\\Sublime Text",
            "复制 sublime_text.exe（14.2 MB）",
            "复制 Packages\\Default.sublime-package",
            "创建开始菜单快捷方式 Sublime Text",
            "写入注册表 HKLM\\SOFTWARE\\Sublime Text"
          ]
        : [
            "创建目录 " + product().path,
            "复制 Code.exe（128 MB）",
            "复制 resources\\app\\out\\main.js",
            "创建开始菜单快捷方式 Visual Studio Code",
            "写入注册表 HKCU\\Software\\Microsoft\\VS Code"
          ];
      var i = 0;
      if (s.installTimer) clearInterval(s.installTimer);
      s.installTimer = setInterval(function () {
        if (!overlay || s.stage !== "installing") {
          if (s.installTimer) clearInterval(s.installTimer);
          s.installTimer = null;
          return;
        }
        i++;
        s.installPct = Math.min(100, Math.round(i * 100 / steps.length));
        if (steps[i - 1]) s.installLog.push(steps[i - 1]);
        render();
        if (i >= steps.length) {
          clearInterval(s.installTimer); s.installTimer = null;
          setTimeout(function () {
            if (!overlay || s.stage !== "installing") return;
            installAppIntoSandbox();
            s.installed = true;
            s.stage = "finish";
            s.tip = "安装完成，文件已写入沙盒虚拟 C 盘";
            render();
          }, 350);
        }
      }, 260);
    }
    else if (a === "finish") {
      installAppIntoSandbox();
      s.installed = true;
      if (s.variant === "sublime") {
        s.stage = "shortcut"; s.shortcutStep = 0;
        s.tip = "安装完成，但桌面还没有快捷方式，按步骤创建";
      } else {
        s.shortcut = true;
        if (s.tasks.desktop) addSandboxShortcut("Visual Studio Code", product().path + "\\Code.exe", "desktop");
        s.stage = "desktop";
        s.tip = "安装完成，沙盒桌面已有 VS Code 图标，双击打开";
      }
      render();
    }
    else if (a === "shortcut-1") { s.shortcutStep = 1; s.tip = "右键 sublime_text.exe，选择“发送到 → 桌面快捷方式”"; render(); }
    else if (a === "shortcut-2") {
      s.shortcut = true; s.shortcutStep = 2;
      addSandboxShortcut("Sublime Text", "C:\\Program Files\\Sublime Text\\sublime_text.exe", "desktop");
      s.tip = "快捷方式已创建到沙盒桌面"; render();
    }
    else if (a === "shortcut-done") {
      s.stage = "desktop"; s.tip = "双击桌面上的快捷方式打开编辑器"; render();
    }
    else if (a === "file-menu") { s.fileMenu = !s.fileMenu; s.langMenu = false; render(); }
    else if (a === "lang-menu") { s.langMenu = !s.langMenu; s.fileMenu = false; render(); }
    else if (a === "new-file") {
      s.newFile = true; s.fileMenu = false; s.tip = "已新建文件，请把右下角语言改为 HTML"; render(); focusEditor();
    }
    else if (a === "save-as") { s.fileMenu = false; openSave(); }
    else if (a === "run") { runVSCode(); }
    else if (a === "save") { saveFile(); }
    else if (a === "back-editor") { s.langMenu = false; s.fileMenu = false; s.stage = "editor"; render(); focusEditor(); }
    else if (a === "run-browser") {
      s.browser = true; s.stage = "browser"; s.tip = "浏览器已打开，检查 Hello World"; render();
    }
    else if (a === "run-node") { s.tip = "HTML 页面应选择浏览器运行"; render(); }
    else if (a === "finish-close") { close(); }
    else if (a === "cancel-install") { close(); }
    else if (a === "gallery") { s.galleryOpen = true; render(); }
    else if (a === "gallery-close") { s.galleryOpen = false; render(); }
    else if (a === "explorer") { s.explorerOpen = true; s.tip = "虚拟机文件管理器"; render(); }
    else if (a === "explorer-close") { s.explorerOpen = false; s.tip = ""; render(); }
    else if (a === "extract-cancel") { s.stage = "desktop"; s.tip = "已取消解压"; render(); }
    else if (a === "extract-start") { startExtract(); }
    else if (a === "folder-close") { s.stage = "desktop"; s.tip = "已返回虚拟桌面"; render(); }
    else if (a === "run-setup") { startInstaller(); }
    else if (a === "reset-sandbox") { resetSandbox(); }
    else if (a === "back") {
      var backMap = { license: s.variant === "sublime" ? "welcome" : "license", dest: "license", startmenu: "dest", tasks: "startmenu", ready: s.variant === "vscode" ? "tasks" : "startmenu" };
      if (s.stage === "license" && s.variant === "vscode") { s.tip = "这是安装向导第一步"; render(); return; }
      s.stage = backMap[s.stage] || "desktop"; s.tip = ""; render();
    }
  }

  function openSave() {
    if (s.lang !== "HTML") { s.tip = "请先把右下角语言改为 HTML"; s.stage = "editor"; render(); return; }
    if (!/hello\s*world/i.test(s.code)) { s.tip = "代码中还没有 Hello World"; s.stage = "editor"; render(); return; }
    if (s.variant === "sublime" && !/<!doctype\s+html>/i.test(s.code)) {
      s.tip = "HTML5 页面需要 <!DOCTYPE html>，可输入 html 后按 Tab 自动生成";
      s.stage = "editor"; render(); return;
    }
    if (!/<html[\s>]/i.test(s.code) || !/<body[\s>]/i.test(s.code)) {
      s.tip = "页面需要 <html> 和 <body> 标签";
      s.stage = "editor"; render(); return;
    }
    s.stage = "save";
    s.tip = "文件名使用 .html，保存到桌面";
    render();
  }

  function saveFile() {
    var name = s.fileName.trim();
    if (!/\.html?$/i.test(name)) { s.tip = "文件名需要以 .html 结尾"; render(); return; }
    s.saved = true;
    addSandboxFile(SANDBOX_DESKTOP + "\\" + name,
      Math.max(1, Math.round(s.code.length / 1024)) + " KB", "HTML 文档", s.code);
    if (s.variant === "vscode") {
      s.stage = "runpicker"; s.tip = "保存成功，文件已写入沙盒桌面；选择“浏览器”运行";
    } else {
      s.browser = true; s.stage = "browser"; s.tip = "保存成功，沙盒桌面已生成 HTML 文件";
    }
    render();
  }

  function runVSCode() {
    if (!s.newFile) { s.tip = "先点 File → New Text File 新建文件"; render(); return; }
    if (s.lang !== "HTML") { s.tip = "请把右下角语言改为 HTML"; render(); return; }
    openSave();
  }

  function focusEditor() {
    var ta = overlay && overlay.querySelector("#ts-code");
    if (!ta) return;
    ta.focus();
    if (s.caret != null) {
      ta.selectionStart = ta.selectionEnd = s.caret;
      s.caret = null;
    } else if (s.code.length === 0) {
      ta.selectionStart = ta.selectionEnd = 0;
    }
  }

  function onInput(e) {
    if (e.target.id === "ts-code") s.code = e.target.value;
    if (e.target.id === "ts-file-name") s.fileName = e.target.value;
  }

  function onChange(e) {
    if (e.target.id === "ts-accept") s.accept = e.target.checked;
    var task = e.target.getAttribute("data-task");
    if (task) s.tasks[task] = e.target.checked;
  }

  function onKeyDown(e) {
    if (!overlay) return;
    if (e.key === "F5" && s.stage === "editor" && s.variant === "vscode") {
      e.preventDefault();
      runVSCode();
      return;
    }
    if (e.key === "Tab" && e.target.id === "ts-code" && s.variant === "sublime") {
      var ta = e.target;
      var pos = ta.selectionStart;
      var before = ta.value.slice(0, pos);
      if (/html$/i.test(before)) {
        e.preventDefault();
        var prefix = before.replace(/html$/i, "");
        var rest = ta.value.slice(ta.selectionEnd);
        ta.value = prefix + HTML5_TEMPLATE + rest;
        s.code = ta.value;
        var idx = (prefix + HTML5_TEMPLATE).indexOf("<body>") + 6;
        ta.selectionStart = ta.selectionEnd = idx;
        s.caret = idx;
        s.tip = "HTML5 框架已生成，在 <body> 中输入 hello world";
        render();
        focusEditor();
      } else {
        e.preventDefault();
        var start = ta.selectionStart, end = ta.selectionEnd;
        ta.value = ta.value.slice(0, start) + "    " + ta.value.slice(end);
        ta.selectionStart = ta.selectionEnd = start + 4;
        s.code = ta.value;
      }
    }
  }

  window.TikuInstallSim = { open: open };
})();
