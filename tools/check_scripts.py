import re, subprocess, sys, os

root = r"C:\Users\徐\Desktop\mc"
node = r"C:\Users\徐\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
for rel in [r"pc\index.html", r"mobile\index.html", r"index.html"]:
    p = os.path.join(root, rel)
    s = open(p, encoding="utf-8").read()
    blocks = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", s, re.S)
    print("===", rel, "inline blocks:", len(blocks))
    for i, b in enumerate(blocks):
        tmp = os.path.join(root, "tools", "_check_%d.js" % i)
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(b)
        r = subprocess.run([node, "--check", tmp], capture_output=True, text=True)
        print(" block", i, "ok" if r.returncode == 0 else "FAIL")
        if r.returncode != 0:
            print(r.stderr[:2000])
        os.remove(tmp)
