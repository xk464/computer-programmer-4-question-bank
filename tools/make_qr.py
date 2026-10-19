import sys, os
sys.path.insert(0, r"C:\Users\徐\Desktop\mc\.pkg")
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer

ROOT = r"C:\Users\徐\Desktop\mc"
url = "https://xk464.github.io/computer-programmer-4-question-bank/mobile/"

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=14,
    border=3,
)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(
    image_factory=StyledPilImage,
    module_drawer=RoundedModuleDrawer(),
    fill_color="#3f55d6",
    back_color="white",
)
path = os.path.join(ROOT, "assets", "qr-mobile.png")
img.save(path)
print("wrote", path, img.size)
