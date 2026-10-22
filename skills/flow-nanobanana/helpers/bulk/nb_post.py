"""Flow(나노바나나) 원본을 콘티 비율로 자르면서 오른쪽 아래 워터마크를 잘라낸다.

워터마크(반짝이)는 실측상 오른쪽 아래 모서리에서 약 75~125px 안쪽에 찍힌다(1200x896 기준).
왼쪽 위를 기준으로 남길 영역을 정하되, 남기는 폭이 (가로 - 170) 이하이거나 남기는 높이가 (세로 - 170) 이하가 되게
해서 워터마크가 들어 있는 모서리 사각형을 통째로 버린다. 그 조건을 만족하는 가장 큰 영역을 고른다.

사용: python3 tools/nb/nb_post.py <원본.jpg> <출력.png> <비율 3:2|2:3|1:1|full>
full은 캐릭터 시트용이다. 독자에게 보이지 않는 참조 그림이라 자르지 않고 그대로 저장한다(자르면 발이나 표정 칸이 잘린다).
"""
import sys
from pathlib import Path

from PIL import Image

MARGIN = 170  # 워터마크 모서리 사각형(약 125px) + 여유 45px
RATIO = {"3:2": 1.5, "2:3": 2 / 3, "1:1": 1.0}


def keep_box(w: int, h: int, r: float) -> tuple[int, int]:
    """비율 r(가로/세로), 왼쪽 위 기준으로 워터마크 모서리를 버리는 가장 큰 (폭, 높이)."""
    best = (0, 0)
    # 경우 1: 아래 MARGIN을 버린다 → 높이 h-MARGIN 이하
    hh = h - MARGIN
    ww = min(w, int(hh * r))
    hh = int(ww / r)
    if ww * hh > best[0] * best[1]:
        best = (ww, hh)
    # 경우 2: 오른쪽 MARGIN을 버린다 → 폭 w-MARGIN 이하
    ww = w - MARGIN
    hh = min(h, int(ww / r))
    ww = int(hh * r)
    if ww * hh > best[0] * best[1]:
        best = (ww, hh)
    return best


def post(src: Path, out: Path, ratio: str) -> tuple[int, int]:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if ratio == "full":
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out)
        return w, h
    kw, kh = keep_box(w, h, RATIO[ratio])
    if not (kw <= w - MARGIN or kh <= h - MARGIN):
        raise ValueError(f"워터마크 영역을 버리지 못함: {w}x{h} -> {kw}x{kh}")
    out.parent.mkdir(parents=True, exist_ok=True)
    im.crop((0, 0, kw, kh)).save(out)
    return kw, kh


if __name__ == "__main__":
    print(post(Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]))
