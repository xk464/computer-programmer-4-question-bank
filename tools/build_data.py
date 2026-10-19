import json, re, html, os, datetime
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "source", "question-bank.xlsx")
OUT = os.path.join(ROOT, "data", "questions.json")

FLAG = {
    23: "答案存疑，建议核对教材",
    72: "答案存疑，建议核对教材",
    76: "原题选项疑有笔误",
    116: "答案存疑，建议核对教材",
    185: "答案存疑，建议核对教材",
    240: "答案存疑，建议核对教材",
    360: "答案存疑，建议核对教材",
    376: "答案存疑，建议核对教材",
}


def clean(text):
    if text is None:
        return ""
    s = str(text)
    # 题库原文把 < 转义成了 &lt;，展示时需要还原成字面量
    s = html.unescape(s)
    s = s.replace("\u3000", " ")
    s = s.replace("\r", "")
    s = re.sub(r"[ \t]+\n", "\n", s)
    return s.strip()


wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb.worksheets[0]
rows = list(ws.iter_rows(values_only=True))
header = [str(x) for x in rows[0]]
assert header[:6] == ["序号", "题型", "题目", "选项", "正确答案", "答案内容"], header

questions, excluded = [], []
for row in rows[1:]:
    if row[0] is None:
        continue
    no = int(row[0])
    qtype = str(row[1]).strip()
    qtext = clean(row[2])
    ans_raw = clean(row[4])
    explain = clean(row[5])
    note = clean(row[6]) if len(row) > 6 else ""
    opts_raw = [x for x in str(row[3]).split("\n") if x.strip()]

    if qtype == "判断题":
        options = ["正确", "错误"]
        if ans_raw == "正确":
            answer = 0
        elif ans_raw == "错误":
            answer = 1
        else:
            excluded.append({"no": no, "reason": note or "原始答案为空"})
            continue
        kind = "judge"
    else:
        options = [re.sub(r"^[A-Z][．.]\s*", "", clean(x)) for x in opts_raw]
        keys = [x.strip()[0] for x in opts_raw]
        if not ans_raw or ans_raw not in keys or len(options) < 2:
            excluded.append({"no": no, "reason": note or "原始答案缺失"})
            continue
        answer = keys.index(ans_raw)
        kind = "single"

    questions.append({
        "id": no,
        "type": kind,
        "q": qtext,
        "options": options,
        "answer": answer,
        "explain": explain,
        "flag": FLAG.get(no, ""),
    })

meta = {
    "title": "计算机程序设计员（四级）题库",
    "total": len(questions),
    "single": sum(1 for q in questions if q["type"] == "single"),
    "judge": sum(1 for q in questions if q["type"] == "judge"),
    "excluded": excluded,
    "updated": datetime.date.today().isoformat(),
}
bank = {"meta": meta, "questions": questions}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(bank, f, ensure_ascii=False, indent=1)

print(json.dumps(meta, ensure_ascii=False, indent=1))
print("wrote", OUT)
