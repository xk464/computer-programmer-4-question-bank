# 计算机程序设计员（四级）题库

一套离线题库，两种用法：

| 版本 | 位置 | 特点 |
| --- | --- | --- |
| 电脑版 | [`pc/index.html`](pc/index.html) | 本地即时判分、模拟考试、错题本、收藏、搜索、实操资料、深色模式、键盘快捷键 |
| 手机版 | [`mobile/index.html`](mobile/index.html) | **只有选择题**，大按钮点选即判、滑动切题、答题卡、可安装为 PWA 离线使用 |

在线访问：<https://xk464.github.io/computer-programmer-4-question-bank/>

## 功能

- **398 道题**：单选题 306 道 + 判断题 92 道（原始 Excel 400 题，2 题因缺图且无答案未收录）。
- **本地判分**：点选选项立即显示对错、正确答案与解析；「答案存疑」的题目标有 ⚠ 提示。
- **模拟考试**：随机组卷（20 / 50 / 100 / 全部），计时、交卷判分、成绩记录，错题自动入错题本。
- **错题本**：按错误次数归集，答对自动移除，可导出 TXT。
- **收藏与搜索**：星标重点题，按题干 / 选项 / 解析全文检索。
- **实操资料**：5 个实操考核要点，含 Sublime Text / VS Code 环境搭建、流程图、C 语言填空与递归题、详细设计说明。
- **完全离线**：无后端、无登录、无广告；答题记录保存在浏览器 `localStorage`，不上传任何数据。
- **PWA**：手机版支持「添加到主屏幕」，首次打开后可断网使用。

## 目录结构

```
├── index.html              # 落地页（两个版本入口）
├── pc/index.html           # 电脑版应用
├── mobile/index.html       # 手机版应用（PWA）
│   ├── manifest.webmanifest
│   ├── sw.js               # 离线缓存
│   └── icons/
├── assets/
│   ├── bank.js             # 由 data/ 生成的题库数据（window.QBANK）
│   ├── favicon.png
│   └── qr-mobile.png
├── data/
│   ├── questions.json      # 清洗后的题库
│   └── practical.json      # 实操资料
├── source/                 # 原始文件（Excel / Word）
├── dist/                   # 离线单文件版本
└── tools/                  # 数据构建、图标与二维码生成脚本
```

## 本地使用

直接用浏览器打开 `index.html` 即可（`file://` 也能运行，题库无需请求后端）。手机版建议通过 HTTP 访问以启用 PWA：

```bash
python -m http.server 8000
# 打开 http://localhost:8000/
```

## 重新构建数据

```bash
python tools/build_data.py      # Excel → data/questions.json
python tools/build_assets.py    # data/*.json → assets/bank.js
python tools/build_dist.py      # 生成 dist/ 离线单文件
```

需要 `openpyxl`、`python-docx`；图标与二维码脚本另需 `Pillow`、`qrcode`。

## 数据说明

- 原始题库：`source/question-bank.xlsx`（400 题）。
- 第 **168、299** 题引用了「如图所示的伪代码 / 程序框图」，源文件缺少配图且无答案，无法判分，未收录。
- 8 道题在原表中备注「答案存在歧义」或「选项疑有笔误」，界面中以 ⚠ 标记，请以教材与考官口径为准。
- 实操资料依据 `source/practical.docx` 整理，保留原题表述，仅修正明显录入错字。

## 许可

代码以 MIT 许可发布；题库内容版权归原作者 / 出版方所有，本项目仅供个人学习复习使用。
