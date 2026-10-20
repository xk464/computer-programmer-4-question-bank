import os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "pc", "index.html"), encoding="utf-8").read()

# 桌面端：本地资源使用相对 web 根目录的路径
src = src.replace('<link rel="icon" type="image/png" href="../assets/favicon.png">',
                  '<link rel="icon" type="image/png" href="assets/favicon.png">')
src = src.replace('<script src="../assets/bank.js"></script>',
                  '<script>window.__DESKTOP_APP__ = true;</script>\n<script src="assets/bank.js"></script>')

# 桌面端不需要跳转到手机版/首页的链接
src = src.replace('      <a class="ghost-link" href="../mobile/" title="手机版（仅选择题）">手机版</a>\n', '')
src = src.replace('      <a class="ghost-link" href="../" title="返回首页">首页</a>\n', '')

# 提示这是桌面版
src = src.replace("本地判分 · 完全离线 · 数据仅存本机", "桌面版 · 本地判分 · 完全离线 · 数据仅存本机")

web = os.path.join(ROOT, "desktop", "web")
os.makedirs(os.path.join(web, "assets"), exist_ok=True)
with open(os.path.join(web, "index.html"), "w", encoding="utf-8", newline="\n") as f:
    f.write(src)
shutil.copyfile(os.path.join(ROOT, "assets", "bank.js"), os.path.join(web, "assets", "bank.js"))
shutil.copyfile(os.path.join(ROOT, "assets", "favicon.png"), os.path.join(web, "assets", "favicon.png"))
shutil.copyfile(os.path.join(ROOT, "favicon.ico"), os.path.join(ROOT, "desktop", "app.ico"))
print("desktop web:", len(src), "chars")
