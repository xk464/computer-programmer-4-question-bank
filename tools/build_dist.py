import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = "https://xk464.github.io/computer-programmer-4-question-bank/"


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print("wrote", os.path.relpath(path, ROOT), len(text), "bytes")


def build():
    bank = read(os.path.join(ROOT, "assets", "bank.js")).strip()
    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)

    favicon_pc = '<link rel="icon" type="image/png" href="../assets/favicon.png">\n'
    favicon_mobile = '<link rel="icon" type="image/png" href="../assets/favicon.png">\n'

    # 电脑版单文件
    html = read(os.path.join(ROOT, "pc", "index.html"))
    html = html.replace('<script src="../assets/bank.js"></script>',
                        '<script>\n' + bank + '\n</script>')
    html = html.replace(favicon_pc, "")
    html = html.replace('href="../mobile/"', 'href="' + PAGES + 'mobile/"')
    html = html.replace('href="../"', 'href="' + PAGES + '"')
    write(os.path.join(ROOT, "dist", "题库-电脑版-离线.html"), html)

    # 手机版单文件
    html = read(os.path.join(ROOT, "mobile", "index.html"))
    html = html.replace('<script src="../assets/bank.js"></script>',
                        '<script>\n' + bank + '\n</script>')
    html = html.replace('<link rel="manifest" href="./manifest.webmanifest">\n', "")
    html = html.replace('<link rel="apple-touch-icon" href="./icons/icon-192.png">\n', "")
    html = html.replace(favicon_mobile, "")
    html = html.replace('href="../pc/"', 'href="' + PAGES + 'pc/"')
    html = html.replace('href="../"', 'href="' + PAGES + '"')
    write(os.path.join(ROOT, "dist", "题库-手机版-离线.html"), html)

    write(os.path.join(ROOT, ".nojekyll"), "")


if __name__ == "__main__":
    build()
