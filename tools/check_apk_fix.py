import zipfile, sys, hashlib, os

p = sys.argv[1]
z = zipfile.ZipFile(p)
html = z.read("assets/index.html").decode("utf-8")
print("firstUnansweredIndex:", "firstUnansweredIndex" in html)
print("submitted restore guard:", "已交卷的考试不再自动回放答案" in html)
print("sha256:", hashlib.sha256(open(p, "rb").read()).hexdigest())
print("size:", os.path.getsize(p))
