"""생성 결과가 참조 그림이나 이미 저장된 컷과 사실상 같은지 본다(생성기가 새 그림 대신 옛 타일을 잡은 경우). 같으면 종료 코드 1.
사용: python3 tools/nb/is_dup.py <결과 이미지> <참조 이미지...> [--dir <컷 폴더> ...]
--dir 폴더의 png 전부와 비교한다. 해시는 폴더 안 .dhash.json에 캐시한다.
"""
import json
import os
import sys

from PIL import Image


def dhash(path: str) -> int:
    im = Image.open(path).convert("L").resize((17, 16))
    p = list(im.getdata())
    return sum(1 << i for i in range(256) if p[(i // 16) * 17 + i % 16] > p[(i // 16) * 17 + i % 16 + 1])


def dir_hashes(d: str) -> dict:
    cache_path = os.path.join(d, ".dhash.json")
    try:
        cache = json.load(open(cache_path))
    except (OSError, ValueError):
        cache = {}
    out, changed = {}, False
    for f in os.listdir(d):
        if not f.endswith(".png"):
            continue
        fp = os.path.join(d, f)
        key = f"{f}:{int(os.path.getmtime(fp))}"
        if key not in cache:
            try:
                cache[key] = dhash(fp)
                changed = True
            except OSError:
                continue
        out[f] = cache[key]
    if changed:
        live = {f"{f}:{int(os.path.getmtime(os.path.join(d, f)))}" for f in out}
        json.dump({k: v for k, v in cache.items() if k in live}, open(cache_path, "w"))
    return out


args = sys.argv[1:]
dirs = [args[i + 1] for i, a in enumerate(args) if a == "--dir"]
refs = [a for i, a in enumerate(args[1:], 1) if a != "--dir" and args[i - 1] != "--dir"]
out = dhash(args[0])
for ref in refs:
    try:
        if bin(out ^ dhash(ref)).count("1") <= 12:
            print(f"참조와 같은 그림: {ref}")
            sys.exit(1)
    except OSError:
        continue
for d in dirs:
    if not os.path.isdir(d):
        continue
    for f, h in dir_hashes(d).items():
        if bin(out ^ h).count("1") <= 10:
            print(f"이미 있는 컷과 같은 그림: {d}/{f}")
            sys.exit(1)
sys.exit(0)
