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
    ".ts-icons{position:absolute;left:18px;top:18px;display:flex;flex-direction:column;gap:12px;z-index:2}",
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
    ".ts-shortcut-note{background:#eef4ff;border:1px solid #c9d8f2;border-radius:8px;padding:10px 12px;font-size:12px;color:#3d5273;line-height:1.6;margin-top:10px}"
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
      path: "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code",
      menu: "Visual Studio Code"
    }
  };

  var overlay = null;
  var s = null;

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
      tip: ""
    };
    s.tip = s.variant === "sublime"
      ? "双击桌面上的 Sublime Text 安装包开始"
      : "双击桌面上的 VS Code 安装包开始";

    overlay = document.createElement("div");
    overlay.className = "ts-overlay";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    overlay.addEventListener("click", onClick);
    overlay.addEventListener("input", onInput);
    overlay.addEventListener("change", onChange);
    overlay.addEventListener("keydown", onKeyDown);
    render();
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    s = null;
    document.body.style.overflow = "";
  }

  function product() { return PRODUCT[s.variant]; }

  function setTip(text) { s.tip = text; render(); }

  function render() {
    if (!overlay) return;
    var p = product();
    var icons = '<button class="ts-icon" data-icon="installer"><span class="g">⚙️</span><span>' + esc(p.setup) + '</span></button>' +
      '<button class="ts-icon" data-icon="pc"><span class="g">🖥️</span><span>此电脑</span></button>';
    if (s.shortcut) icons += '<button class="ts-icon" data-icon="shortcut"><span class="g">📝</span><span>' + esc(p.name) + '</span></button>';
    if (s.saved) icons += '<button class="ts-icon" data-icon="html"><span class="g">🌐</span><span>' + esc(s.fileName) + '</span></button>';

    var list = checklist();
    var current = list.findIndex(function (t) { return !t.done; });
    var steps = list.map(function (t, i) {
      return '<li class="' + (t.done ? "done" : (i === current ? "cur" : "")) + '">' + esc(t.text) + '</li>';
    }).join("");

    overlay.innerHTML =
      '<div class="ts-desk">' +
        '<div class="ts-icons">' + icons + '</div>' +
        windowHtml() +
        '<div class="ts-tip">' + esc(s.tip || "按右侧步骤完成实操") + '</div>' +
      '</div>' +
      '<aside class="ts-side">' +
        '<h4>' + esc(p.name) + ' 安装全流程</h4>' +
        '<div class="sub">依据实操要求与安装器实际向导页</div>' +
        '<ul class="ts-steps">' + steps + '</ul>' +
        '<button class="close" data-close>退出模拟</button>' +
      '</aside>';
  }

  function checklist() {
    if (s.variant === "sublime") {
      return [
        { text: "双击安装包，进入向导", done: s.installerStarted },
        { text: "接受许可协议", done: s.accept },
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
      { text: "附加任务勾选“创建桌面图标”", done: s.tasks.desktop },
      { text: "完成安装", done: s.installed },
      { text: "双击桌面图标打开编辑器", done: s.editorOpened },
      { text: "File → New Text File 并设为 HTML", done: s.newFile && s.lang === "HTML" },
      { text: "输入 Hello World", done: /hello\s*world/i.test(s.code) },
      { text: "F5 保存到桌面并运行", done: s.saved },
      { text: "浏览器显示 Hello World", done: s.browser }
    ];
  }

  function windowHtml() {
    if (s.stage === "desktop") return "";
    if (["welcome", "license", "dest", "startmenu", "tasks", "ready", "installing", "finish"].indexOf(s.stage) >= 0) return installerHtml();
    if (s.stage === "shortcut") return shortcutHtml();
    if (s.stage === "editor") return editorHtml();
    if (s.stage === "save") return saveHtml();
    if (s.stage === "runpicker") return runPickerHtml();
    if (s.stage === "browser") return browserHtml();
    return "";
  }

  function installerHtml() {
    var p = product();
    var stepOrder = s.variant === "sublime"
      ? ["welcome", "license", "dest", "startmenu", "ready", "installing", "finish"]
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
        actions([btn("← 上一步", "back", "ghost"), btn("下一步 →", "to-startmenu", "primary")]);
    } else if (s.stage === "startmenu") {
      body = '<h3>选择开始菜单文件夹</h3>' +
        '<p>安装程序将在下面的开始菜单文件夹中创建程序的快捷方式。</p>' +
        '<input class="ts-field" value="' + esc(p.menu) + '" readonly>' +
        actions([btn("← 上一步", "back", "ghost"), btn(s.variant === "vscode" ? "下一步 →" : "安装", s.variant === "vscode" ? "to-tasks" : "to-ready", "primary")]);
    } else if (s.stage === "tasks") {
      var t = s.tasks;
      body = '<h3>选择附加任务</h3>' +
        '<p>请选择安装程序要执行的附加任务。</p>' +
        '<label class="ts-check"><input type="checkbox" data-task="desktop"' + (t.desktop ? " checked" : "") + '> 创建桌面图标<small>考试要求：在桌面生成快捷方式</small></label>' +
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
        '<p>正在复制文件并创建快捷方式，请稍候。</p>' +
        '<div class="ts-progress"><i id="ts-progress"></i></div>' +
        '<p style="font-size:11.5px;color:#7a879c">安装过程中请不要关闭窗口。</p>';
    } else if (s.stage === "finish") {
      body = '<h3>完成 ' + esc(p.name) + ' 安装向导</h3>' +
        '<p>' + esc(p.name) + ' 已安装到你的电脑。</p>' +
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
      '<div class="ts-shortcut-note">如果页面显示 Hello World，本题完成。文件已保存在桌面。</div>' +
      actions([btn("完成", "finish-close", "primary")]) +
      '</div></div>';
  }

  function onClick(e) {
    var t = e.target;
    var closeBtn = t.closest("[data-close]");
    if (closeBtn) { close(); return; }

    var icon = t.closest("[data-icon]");
    if (icon) {
      var name = icon.getAttribute("data-icon");
      if (name === "installer" && s.stage === "desktop") {
        s.installerStarted = true;
        s.stage = s.variant === "sublime" ? "welcome" : "license";
        s.tip = s.variant === "sublime" ? "点击“下一步”继续" : "勾选接受协议后点“下一步”";
        render();
      } else if (name === "shortcut" && s.stage === "desktop" && s.shortcut) {
        s.stage = "editor"; s.editorOpened = true;
        s.tip = s.variant === "sublime" ? "修改语言并输入 hello world" : "File → New Text File，然后输入代码";
        render();
        focusEditor();
      } else if (name === "html" && s.stage === "desktop" && s.saved) {
        s.stage = "browser"; s.browser = true; render();
      } else if (name === "pc") {
        setTip("此电脑里没有安装包，双击桌面上的安装程序");
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
        if (!s.tasks.desktop) { s.tip = "考试要求在桌面生成快捷方式，请勾选“创建桌面图标”"; render(); return; }
      }
      if (s.stage === "startmenu") s.startMenuChosen = true;
      s.stage = "ready"; s.tip = "点击“安装”开始"; render();
    }
    else if (a === "install") {
      s.stage = "installing"; s.tip = "正在安装，请稍候"; render();
      setTimeout(function () {
        if (!overlay) return;
        s.installed = true; s.stage = "finish"; s.tip = "点击“完成”结束安装"; render();
      }, 1300);
    }
    else if (a === "finish") {
      s.installed = true;
      if (s.variant === "sublime") {
        s.stage = "shortcut"; s.shortcutStep = 0;
        s.tip = "安装完成，但桌面还没有快捷方式，按步骤创建";
      } else {
        s.shortcut = true; s.stage = "desktop";
        s.tip = "安装完成，桌面已有 VS Code 图标，双击打开";
      }
      render();
    }
    else if (a === "shortcut-1") { s.shortcutStep = 1; s.tip = "右键 sublime_text.exe，选择“发送到 → 桌面快捷方式”"; render(); }
    else if (a === "shortcut-2") { s.shortcut = true; s.shortcutStep = 2; s.tip = "快捷方式已创建"; render(); }
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
    if (s.variant === "vscode") {
      s.stage = "runpicker"; s.tip = "保存成功，选择“浏览器”运行";
    } else {
      s.browser = true; s.stage = "browser"; s.tip = "保存成功，桌面已生成 HTML 文件";
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
