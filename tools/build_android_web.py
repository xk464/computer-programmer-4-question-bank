import os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "android", "app", "src", "main", "assets")
os.makedirs(os.path.join(ASSETS, "assets"), exist_ok=True)

html = open(os.path.join(ROOT, "mobile", "index.html"), encoding="utf-8").read()

html = html.replace('<link rel="manifest" href="./manifest.webmanifest">\n', "")
html = html.replace('<link rel="icon" type="image/png" href="../assets/favicon.png">\n', "")
html = html.replace('<link rel="apple-touch-icon" href="./icons/icon-192.png">\n', "")
html = html.replace('<script src="../assets/bank.js"></script>', '<script src="assets/bank.js"></script>')

html = re.sub(
    r'\s*<p class="about">.*?</p>',
    '\n    <p class="about">数据仅保存在本机 · 版本 1.0.0</p>',
    html, count=1, flags=re.S)

# APK 内不注册 Service Worker（页面通过本地拦截提供，无需离线缓存）
html = re.sub(
    r'  // PWA\n  if \("serviceWorker" in navigator && location\.protocol\.startsWith\("http"\)\) \{\n.*?\n  \}\n',
    '  // APK 版本无需 Service Worker\n',
    html, count=1, flags=re.S)

# 保证没有遗留的外部相对链接
assert 'href="../' not in html, "仍有相对外链"
assert 'serviceWorker' not in html, "仍有 SW 注册"

with open(os.path.join(ASSETS, "index.html"), "w", encoding="utf-8", newline="\n") as f:
    f.write(html)
shutil.copyfile(os.path.join(ROOT, "assets", "bank.js"), os.path.join(ASSETS, "assets", "bank.js"))
print("android assets:", len(html), "chars")
