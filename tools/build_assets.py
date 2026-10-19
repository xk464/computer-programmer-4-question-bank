import json, os

ROOT = r"C:\Users\徐\Desktop\mc"
with open(os.path.join(ROOT, "data", "questions.json"), encoding="utf-8") as f:
    bank = json.load(f)
with open(os.path.join(ROOT, "data", "practical.json"), encoding="utf-8") as f:
    practical = json.load(f)

bank["practical"] = practical

os.makedirs(os.path.join(ROOT, "assets"), exist_ok=True)
body = json.dumps(bank, ensure_ascii=False, separators=(",", ":"))
body = body.replace("</script", "<\\/script")
js = "/* 自动生成：tools/build_assets.py，请勿直接编辑 */\nwindow.QBANK = " + body + ";\n"
with open(os.path.join(ROOT, "assets", "bank.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write(js)

single = sum(1 for q in bank["questions"] if q["type"] == "single")
judge = sum(1 for q in bank["questions"] if q["type"] == "judge")
print("bank.js bytes:", os.path.getsize(os.path.join(ROOT, "assets", "bank.js")))
print("questions:", len(bank["questions"]), "single:", single, "judge:", judge, "practical:", len(practical["tasks"]))
