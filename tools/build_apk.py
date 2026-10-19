import os, glob, shutil, subprocess, zipfile, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SDK = r"C:\android-sdk"  # aapt2 无法处理中文路径，使用 ASCII 构建目录
BT = os.path.join(SDK, "build-tools", "34.0.0")
ANDROID_JAR = os.path.join(SDK, "platforms", "android-34", "android.jar")
JAVA_HOME = r"D:\java\jdk"
KEYTOOL = os.path.join(JAVA_HOME, "bin", "keytool.exe")
APP_SRC = os.path.join(ROOT, "android", "app", "src", "main")
STAGE = r"C:\tiku-apk"
APP = os.path.join(STAGE, "app")
BUILD = os.path.join(STAGE, "build")
KS = os.path.join(STAGE, "debug.keystore")
OUT_STAGE = os.path.join(STAGE, "Tiku-Android-1.0.0.apk")
OUT = os.path.join(ROOT, "release", "Tiku-Android-1.0.0.apk")

env = os.environ.copy()
env["JAVA_HOME"] = JAVA_HOME
env["PATH"] = os.path.join(JAVA_HOME, "bin") + os.pathsep + env.get("PATH", "")


def run(cmd, cwd=None):
    print(">>", " ".join(str(c) for c in cmd[:5]), "...")
    subprocess.run(cmd, check=True, cwd=cwd, env=env)


def bat(path):
    return ["cmd", "/c", path]


for p in [BT, ANDROID_JAR, KEYTOOL]:
    if not os.path.exists(p):
        sys.exit("缺少构建依赖: " + p)

# 0. 复制工程到 ASCII 路径
if os.path.isdir(APP):
    shutil.rmtree(APP)
shutil.copytree(APP_SRC, APP)
if os.path.isdir(BUILD):
    shutil.rmtree(BUILD)
os.makedirs(BUILD)
os.makedirs(os.path.join(ROOT, "release"), exist_ok=True)

# 1. 资源编译
res_zip = os.path.join(BUILD, "res.zip")
run([os.path.join(BT, "aapt2.exe"), "compile", "--dir", os.path.join(APP, "res"), "-o", res_zip], cwd=STAGE)

# 2. 链接资源 + 清单 + assets
unsigned = os.path.join(BUILD, "unsigned.apk")
gen = os.path.join(BUILD, "gen")
os.makedirs(gen)
run([
    os.path.join(BT, "aapt2.exe"), "link",
    "-o", unsigned,
    "-I", ANDROID_JAR,
    "--manifest", os.path.join(APP, "AndroidManifest.xml"),
    "-A", os.path.join(APP, "assets"),
    "--java", gen,
    "--min-sdk-version", "23",
    "--target-sdk-version", "34",
    "--version-code", "1",
    "--version-name", "1.0.0",
    res_zip,
], cwd=STAGE)

# 3. 编译 Java
classes = os.path.join(BUILD, "classes")
os.makedirs(classes)
src_java = glob.glob(os.path.join(APP, "java", "**", "*.java"), recursive=True)
run([
    os.path.join(JAVA_HOME, "bin", "javac.exe"),
    "-encoding", "UTF-8", "-source", "8", "-target", "8", "-Xlint:-options",
    "-classpath", ANDROID_JAR, "-d", classes,
] + src_java, cwd=STAGE)

# 4. dex
dex_dir = os.path.join(BUILD, "dex")
os.makedirs(dex_dir)
class_files = glob.glob(os.path.join(classes, "**", "*.class"), recursive=True)
run(bat(os.path.join(BT, "d8.bat")) + [
    "--lib", ANDROID_JAR, "--min-api", "23", "--output", dex_dir,
] + class_files, cwd=STAGE)
dex = os.path.join(dex_dir, "classes.dex")

# 5. 打包 classes.dex
packed = os.path.join(BUILD, "packed.apk")
shutil.copyfile(unsigned, packed)
with zipfile.ZipFile(packed, "a", zipfile.ZIP_DEFLATED) as z:
    z.write(dex, "classes.dex")

# 6. 对齐
aligned = os.path.join(BUILD, "aligned.apk")
run([os.path.join(BT, "zipalign.exe"), "-f", "-p", "4", packed, aligned], cwd=STAGE)

# 7. 签名（首次自动生成 debug keystore）
if not os.path.exists(KS):
    run([
        KEYTOOL, "-genkeypair", "-keystore", KS,
        "-storepass", "android", "-keypass", "android",
        "-alias", "androiddebugkey", "-keyalg", "RSA", "-keysize", "2048",
        "-validity", "10000", "-dname", "CN=Android Debug,O=Android,C=US",
    ], cwd=STAGE)

run(bat(os.path.join(BT, "apksigner.bat")) + [
    "sign", "--ks", KS, "--ks-key-alias", "androiddebugkey",
    "--ks-pass", "pass:android", "--key-pass", "pass:android",
    "--out", OUT_STAGE, aligned,
], cwd=STAGE)
run(bat(os.path.join(BT, "apksigner.bat")) + ["verify", "--verbose", "--print-certs", OUT_STAGE], cwd=STAGE)

shutil.copyfile(OUT_STAGE, OUT)
print("APK:", OUT, os.path.getsize(OUT), "bytes")
badging = subprocess.run(
    [os.path.join(BT, "aapt2.exe"), "dump", "badging", OUT_STAGE],
    capture_output=True, text=True, encoding="utf-8", errors="replace", env=env)
print("\n".join(badging.stdout.splitlines()[:12]))
