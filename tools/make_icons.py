from PIL import Image, ImageDraw, ImageFont
import os

ROOT = r"C:\Users\徐\Desktop\mc"
OUT = os.path.join(ROOT, "mobile", "icons")
os.makedirs(OUT, exist_ok=True)

FONT = r"C:\Windows\Fonts\msyhbd.ttc"
if not os.path.exists(FONT):
    FONT = r"C:\Windows\Fonts\msyh.ttc"


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def make(size, filename, pad_ratio=0.0):
    base = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(base)
    top = (99, 126, 255)
    bottom = (61, 84, 214)
    for y in range(size):
        t = y / max(1, size - 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        d.line([(0, y), (size, y)], fill=c)

    # 顶部轻微光泽（限制在图标范围内，低透明度）
    # 使用线性渐变叠加，避免出现明显的椭圆边缘
    gloss = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(gloss)
    for y in range(int(size * 0.45)):
        a = int(34 * (1 - y / (size * 0.45)))
        gd.line([(0, y), (size, y)], fill=(255, 255, 255, a))
    base = Image.alpha_composite(base.convert("RGBA"), gloss)

    # 圆角
    mask = rounded_mask(size, int(size * 0.225))
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)

    # 白色“题”字，居中对齐
    font_size = int(size * (0.54 - pad_ratio * 0.6))
    try:
        font = ImageFont.truetype(FONT, font_size)
    except Exception:
        font = ImageFont.load_default()
    td = ImageDraw.Draw(out)
    td.text((size / 2, size / 2 + size * 0.012), "题", font=font, fill=(255, 255, 255, 255), anchor="mm")

    out.save(os.path.join(OUT, filename), "PNG")
    print("wrote", filename, size, font_size)


make(192, "icon-192.png")
make(512, "icon-512.png")
make(512, "icon-maskable-512.png", pad_ratio=0.12)

# 站点图标：根目录 favicon.ico + assets/favicon.png
import shutil
shutil.copyfile(os.path.join(OUT, "icon-192.png"), os.path.join(ROOT, "assets", "favicon.png"))
ico = Image.open(os.path.join(OUT, "icon-512.png"))
ico.save(os.path.join(ROOT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("wrote favicon.ico / assets/favicon.png")
