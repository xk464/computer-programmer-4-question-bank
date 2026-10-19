from PIL import Image, ImageDraw, ImageFont
import os

ROOT = r"C:\Users\徐\Desktop\mc"
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")
FONT = r"C:\Windows\Fonts\msyhbd.ttc"
if not os.path.exists(FONT):
    FONT = r"C:\Windows\Fonts\msyh.ttc"

DENSITIES = {
    "mdpi": 1.0,
    "hdpi": 1.5,
    "xhdpi": 2.0,
    "xxhdpi": 3.0,
    "xxxhdpi": 4.0,
}


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def gradient_icon(size):
    base = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(base)
    top = (99, 126, 255)
    bottom = (61, 84, 214)
    for y in range(size):
        t = y / max(1, size - 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        d.line([(0, y), (size, y)], fill=c)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), rounded_mask(size, int(size * 0.22)))
    return out


def draw_glyph(img, ratio):
    size = img.size[0]
    font_size = int(size * ratio)
    try:
        font = ImageFont.truetype(FONT, font_size)
    except Exception:
        font = ImageFont.load_default()
    d = ImageDraw.Draw(img)
    d.text((size / 2, size / 2 + size * 0.01), "题", font=font, fill=(255, 255, 255, 255), anchor="mm")
    return img


for name, scale in DENSITIES.items():
    folder = os.path.join(RES, "mipmap-" + name)
    os.makedirs(folder, exist_ok=True)
    legacy = draw_glyph(gradient_icon(int(48 * scale)), 0.54)
    legacy.save(os.path.join(folder, "ic_launcher.png"))
    # adaptive icon foreground: 108dp canvas, transparent, glyph inside safe zone
    fg = Image.new("RGBA", (int(108 * scale), int(108 * scale)), (0, 0, 0, 0))
    draw_glyph(fg, 0.50)
    fg.save(os.path.join(folder, "ic_launcher_foreground.png"))
    print("icons", name, legacy.size, fg.size)
