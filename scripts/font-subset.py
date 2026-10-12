# Pretendard Variable 서브셋 생성 (2MB → 약 470KB)
#   python -I scripts/font-subset.py
# 포함: KS X 1001 한글 2,350자 + content/landing.ts에 쓰인 모든 글자 + 라틴/문장부호/화살표/괄호 범위
# 원본: scripts/fonts-src/PretendardVariable.woff2 (OFL) → public/fonts/PretendardVariable.subset.woff2
import pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "fonts-src" / "PretendardVariable.woff2"
OUT = ROOT / "public" / "fonts" / "PretendardVariable.subset.woff2"
CHARS = ROOT / "scripts" / ".font-chars.txt"

chars = set((ROOT / "content" / "landing.ts").read_text(encoding="utf-8"))
for cp in range(0xAC00, 0xD7A4):
    ch = chr(cp)
    try:
        if len(ch.encode("euc_kr")) == 2:  # 2바이트로 인코딩되는 것이 KS X 1001 2,350자
            chars.add(ch)
    except UnicodeEncodeError:
        pass
CHARS.write_text("".join(sorted(c for c in chars if ord(c) >= 0x20 and c not in "\r\n\t")), encoding="utf-8")

cmd = [
    sys.executable, "-m", "fontTools.subset", str(SRC),
    f"--text-file={CHARS}",
    "--unicodes=U+0020-007E,U+00A0-00FF,U+2000-206F,U+20A9,U+2190-21FF,U+2500-257F,U+3000-303F,U+3131-318E,U+FF01-FF60",
    "--layout-features=*", "--flavor=woff2", f"--output-file={OUT}",
]
subprocess.run(cmd, check=True)
print("wrote", OUT, OUT.stat().st_size, "bytes")
