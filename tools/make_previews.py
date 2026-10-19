from PIL import Image
import os

ROOT = r"C:\Users\徐\Desktop\mc"
os.makedirs(os.path.join(ROOT, "docs"), exist_ok=True)

pc = Image.open(os.path.join(ROOT, "shots", "pc-answered.png")).convert("RGB")
pc = pc.resize((1280, round(pc.height * 1280 / pc.width)), Image.LANCZOS)
pc.save(os.path.join(ROOT, "docs", "preview-pc.png"), optimize=True)

mob = Image.open(os.path.join(ROOT, "shots", "mobile-answered.png")).convert("RGB")
mob = mob.resize((390, round(mob.height * 390 / mob.width)), Image.LANCZOS)
mob.save(os.path.join(ROOT, "docs", "preview-mobile.png"), optimize=True)
print("ok", os.path.getsize(os.path.join(ROOT, "docs", "preview-pc.png")), os.path.getsize(os.path.join(ROOT, "docs", "preview-mobile.png")))
