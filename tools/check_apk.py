import zipfile, sys, os, hashlib

p = sys.argv[1]
z = zipfile.ZipFile(p)
names = z.namelist()
print("entries:", len(names))
required = ["AndroidManifest.xml", "classes.dex", "resources.arsc", "assets/index.html", "assets/assets/bank.js"]
for r in required:
    print(("OK  " if r in names else "MISS"), r)

html = z.read("assets/index.html").decode("utf-8")
print("html bytes:", len(html.encode("utf-8")))
print("has bank ref:", 'src="assets/bank.js"' in html)
print("has external relative:", 'href="../' in html)
print("has serviceWorker:", "serviceWorker" in html)
print("has manifest link:", "manifest.webmanifest" in html)

dex = z.read("classes.dex")
print("dex magic:", dex[:8])
print("bank bytes:", len(z.read("assets/assets/bank.js")))
print("icons:", len([n for n in names if n.startswith("res/mipmap")]))
print("sha256:", hashlib.sha256(open(p, "rb").read()).hexdigest())
print("size:", os.path.getsize(p))
