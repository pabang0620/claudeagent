# -*- coding: utf-8 -*-
"""
10_backgrounds (BGP) 대량 확충 생성기 — BGP-013 ~ BGP-200 (+188).
파라미터화 배치: 12개 구조 패밀리 × 6개 색 팔레트 × 3개 배치 변형을 스윕.
전부 python-pptx 네이티브 도형/그라데이션만 사용 — 외부 이미지(<p:pic>) 절대 금지.

- 1슬라이드 1에셋. 패밀리별 파일 분산(BGP_bulk_<family>_v1.pptx, ≤18슬라이드).
- 각 에셋 대표 도형(full-page 앵커 rect 또는 그라데이션 rect)에 asset:<ID> 이름 부여.
- 좌상단 c.id_caption. 텍스트는 더미("2026","사업명","PART 01","제목을 입력하세요").
- 색은 c.C[토큰]/c.role만. 그라데이션은 gbox()로 같은 계열 2~3 stop.
"""
import sys
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

R = c.role
RECT = MSO_SHAPE.RECTANGLE
TRI = MSO_SHAPE.RIGHT_TRIANGLE
PARA = MSO_SHAPE.PARALLELOGRAM
OVAL = MSO_SHAPE.OVAL
SW, SH = 13.333, 7.5

entries = []


def E(aid, name, file_rel, slide_idx, tags, params, bindings, editable, rec):
    entries.append(c.entry(aid, "BGP", name, file_rel, slide_idx,
                           tags, params, bindings, editable, recommended_use=rec))


def full_anchor(slide, aid, fill=None):
    box = c.add_box(slide, 0, 0, SW, SH, fill=fill, line=None, shape=RECT)
    c.name_asset(box, aid)
    return box


def gbox(slide, x, y, w, h, color1, color2, angle=90, shape=RECT):
    """같은 계열 2 stop 그라데이션 도형(<a:gradFill>). 이미지 아님."""
    sp = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sp.fill.gradient()
    stops = sp.fill.gradient_stops
    stops[0].position = 0.0; stops[0].color.rgb = color1
    stops[1].position = 1.0; stops[1].color.rgb = color2
    try:
        sp.fill.gradient_angle = angle
    except Exception:
        pass
    sp.line.fill.background()
    sp.shadow.inherit = False
    return sp


def dummy(slide, x, y, w, h, text, size=14, color=None, bold=False,
          align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE):
    return c.add_text(slide, x, y, w, h, text, size=size, bold=bold,
                      color=color or R("body_text"), align=align, anchor=anchor,
                      font=c.FONT_H)


def corner_tris(slide, corner, cols):
    """코너에 삼각형 레이어를 쌓는다(장식). cols: 큰→작은 순 RGBColor 리스트."""
    specs = {
        "br": [(7.6, 3.6, 5.73, 3.9), (9.3, 4.9, 4.03, 2.6), (10.7, 5.9, 2.63, 1.6)],
        "bl": [(0.0, 3.6, 5.73, 3.9), (0.0, 4.9, 4.03, 2.6), (0.0, 5.9, 2.63, 1.6)],
        "tr": [(7.6, 0.0, 5.73, 3.9), (9.3, 0.0, 4.03, 2.6), (10.7, 0.0, 2.63, 1.6)],
        "tl": [(0.0, 0.0, 5.73, 3.9), (0.0, 0.0, 4.03, 2.6), (0.0, 0.0, 2.63, 1.6)],
    }
    rot = {"br": 180, "bl": 90, "tr": 270, "tl": 0}[corner]
    for (x, y, w, h), col in zip(specs[corner], cols):
        t = c.add_box(slide, x, y, w, h, fill=col, line=None, shape=TRI)
        t.rotation = rot


# ══════════════════════════════════════════════════════════════════
# 색 팔레트 (6) — 같은 계열 그라데이션 대비 dark/mid, 악센트 accent/point
# ══════════════════════════════════════════════════════════════════
def _pal(key, dark, mid, accent, point):
    return {"key": key, "dark": c.C[dark], "mid": c.C[mid],
            "accent": c.C[accent], "point": c.C[point]}

PALETTES = [
    _pal("navy",   "navy_900", "navy_800", "blue_500",   "cyan_500"),
    _pal("blue",   "navy_800", "navy_600", "cyan_500",   "blue_500"),
    _pal("teal",   "navy_900", "navy_800", "teal_500",   "cyan_500"),
    _pal("purple", "navy_900", "navy_800", "purple_600", "cyan_500"),
    _pal("cyan",   "navy_800", "navy_600", "cyan_500",   "teal_500"),
    _pal("slate",  "gray_700", "gray_500", "blue_500",   "cyan_500"),
]

WHITE = c.C["white"]
G050 = c.C["gray_050"]
G100 = c.C["gray_100"]
G300 = c.C["gray_300"]
NAVY9 = c.C["navy_900"]


# ══════════════════════════════════════════════════════════════════
# 구조 패밀리 빌더 (12) — 각 (slide, aid, p=palette, plc=placement)
# ══════════════════════════════════════════════════════════════════
def b_cover_left(s, aid, p, plc):
    side, w = plc["side"], plc["w"]
    full_anchor(s, aid, fill=G050)
    x = 0.0 if side == "L" else SW - w
    c.add_box(s, x, 0, w, SH, fill=p["dark"], line=None, shape=RECT)
    ax = x + w - 0.14 if side == "L" else x
    c.add_box(s, ax, 0, 0.14, SH, fill=p["accent"], line=None, shape=RECT)
    tx = x + 0.6
    c.add_box(s, tx, 4.5, 1.4, 0.09, fill=p["point"], line=None, shape=RECT)
    dummy(s, tx, 1.2, w - 1.1, 0.5, "2026", 20, p["point"], True)
    dummy(s, tx, 3.2, w - 1.1, 1.1, "사업명", 34, WHITE, True)
    dummy(s, tx, 4.75, w - 1.1, 0.5, "제안서 제목을 입력하세요", 13, G300)


def b_cover_band(s, aid, p, plc):
    h = plc["h"]
    full_anchor(s, aid, fill=WHITE)
    gbox(s, 0, 0, SW, SH - h, WHITE, G050, angle=90)
    c.add_box(s, 0, SH - h - 0.1, SW, 0.1, fill=p["accent"], line=None, shape=RECT)
    gbox(s, 0, SH - h, SW, h, p["dark"], p["mid"], angle=0)
    dummy(s, 0, 1.5, SW, 0.5, "2026", 20, p["accent"], True, PP_ALIGN.CENTER)
    dummy(s, 0, 2.2, SW, 1.3, "사업명", 42, NAVY9, True, PP_ALIGN.CENTER)
    dummy(s, 0.9, SH - h + 0.25, 8.0, 0.6, "제안서 제목을 입력하세요", 16, WHITE, True)
    dummy(s, 9.0, SH - h + 0.35, 3.4, 0.6, "기관명을 입력하세요", 13, G300, False, PP_ALIGN.RIGHT)


def b_cover_diag(s, aid, p, plc):
    corner = plc["corner"]
    full_anchor(s, aid, fill=G050)
    corner_tris(s, corner, [p["dark"], p["mid"], p["accent"]])
    dummy(s, 0.9, 1.2, 6.0, 0.5, "2026", 20, p["accent"], True)
    dummy(s, 0.9, 2.6, 8.0, 1.2, "사업명", 42, NAVY9, True)
    dummy(s, 0.9, 4.0, 7.0, 0.5, "제안서 제목을 입력하세요", 15, R("muted_text"))


def b_sec_num(s, aid, p, plc):
    var = plc["bar"]
    full_anchor(s, aid, fill=G050)
    if var == "R":
        c.add_box(s, SW - 0.55, 0, 0.55, SH, fill=p["mid"], line=None, shape=RECT)
        c.add_box(s, SW - 0.67, 0, 0.12, SH, fill=p["accent"], line=None, shape=RECT)
    else:
        bw = 0.9 if var == "L2" else 0.55
        c.add_box(s, 0, 0, bw, SH, fill=p["mid"], line=None, shape=RECT)
        c.add_box(s, bw, 0, 0.12, SH, fill=p["accent"], line=None, shape=RECT)
    dummy(s, 1.4, 1.7, 6.0, 0.6, "PART 01", 22, p["accent"], True)
    dummy(s, 1.2, 2.3, 8.0, 2.6, "01", 170, NAVY9, True)
    dummy(s, 1.4, 5.2, 9.0, 0.9, "제목을 입력하세요", 32, p["dark"], True)


def b_sec_band(s, aid, p, plc):
    h = plc["h"]
    full_anchor(s, aid, fill=WHITE)
    c.add_box(s, 0, 0, SW, h, fill=p["mid"], line=None, shape=RECT)
    c.add_box(s, 0, h, SW, 0.1, fill=p["accent"], line=None, shape=RECT)
    dummy(s, 0.9, 0.9, 6.0, 0.6, "PART 01", 20, p["point"], True)
    dummy(s, 0.9, 1.5, 11.0, 0.9, "제목을 입력하세요", 34, WHITE, True)
    dummy(s, 0.9, h + 0.4, 11.5, 1.0, "본 섹션의 개요/부제를 입력하세요", 18, R("muted_text"))


def b_interstitial(s, aid, p, plc):
    w, side = plc["w"], plc["side"]
    full_anchor(s, aid, fill=WHITE)
    sx = 0.0 if side == "L" else SW - w
    c.add_box(s, sx, 0, w, SH, fill=p["mid"], line=None, shape=RECT)
    ax = sx + w if side == "L" else sx - 0.1
    c.add_box(s, ax, 0, 0.1, SH, fill=p["accent"], line=None, shape=RECT)
    dummy(s, sx + 0.5, 1.0, w - 0.9, 0.6, "PART 01", 18, p["point"], True)
    dummy(s, sx + 0.5, 1.7, w - 0.9, 1.4, "목차", 40, WHITE, True)
    dummy(s, sx + 0.5, 6.6, w - 0.9, 0.5, "2026 · 사업명", 13, G300)
    lx = (w + 0.6) if side == "L" else 0.6
    yy = 1.3
    for t in ["01", "02", "03", "04"]:
        c.add_box(s, lx, yy, 0.7, 0.7, fill=G050, line=G300, line_w=0.75, shape=RECT)
        dummy(s, lx, yy, 0.7, 0.7, t, 20, p["accent"], True, PP_ALIGN.CENTER)
        dummy(s, lx + 0.9, yy, 6.4, 0.7, "제목을 입력하세요", 18, NAVY9, True)
        c.add_box(s, lx + 0.9, yy + 0.78, 6.4, 0.02, fill=G300, line=None, shape=RECT)
        yy += 1.28


def b_header(s, aid, p, plc):
    h = plc["h"]
    full_anchor(s, aid, fill=WHITE)
    c.add_box(s, 0, 0, SW, h, fill=p["mid"], line=None, shape=RECT)
    c.add_box(s, 0, h, SW, 0.09, fill=p["accent"], line=None, shape=RECT)
    c.add_box(s, 0.4, h / 2 - 0.21, 0.14, 0.42, fill=p["point"], line=None, shape=RECT)
    dummy(s, 0.7, 0, 8.5, h, "제목을 입력하세요", 22, WHITE, True, PP_ALIGN.LEFT)
    dummy(s, 9.5, 0, 3.4, h, "2026 · PART 01", 14, G300, False, PP_ALIGN.RIGHT)
    dummy(s, 0.7, h + 0.5, 11.9, 4.0, "본문 콘텐츠 영역 — 반복 사용 헤더 밴드 배경입니다.",
          15, R("muted_text"), False, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)


def b_footer(s, aid, p, plc):
    style = plc["style"]
    full_anchor(s, aid, fill=WHITE)
    dummy(s, 0.9, 0.9, 11.0, 0.6, "제목을 입력하세요", 24, NAVY9, True)
    dummy(s, 0.9, 1.8, 11.5, 3.6, "본문 콘텐츠 영역 — 하단 푸터 바 배경입니다.",
          15, R("muted_text"), False, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)
    fy = SH - 0.55
    if style == "grad":
        bar = gbox(s, 0, fy, SW, 0.55, p["dark"], p["mid"], angle=0)
        c.name_asset(bar, aid)  # 그라데이션 바를 대표 도형으로 재지정
        dummy(s, 0.7, fy, 8.0, 0.55, "2026 · 사업명 · 기관명을 입력하세요", 12, WHITE)
        dummy(s, 11.8, fy, 1.2, 0.55, "01", 13, G300, True, PP_ALIGN.RIGHT)
    elif style == "line":
        c.add_box(s, 0, fy, SW, 0.03, fill=G300, line=None, shape=RECT)
        c.add_box(s, 0, fy, 0.35, 0.55, fill=p["accent"], line=None, shape=RECT)
        dummy(s, 0.6, fy, 8.0, 0.55, "사업명 · 기관명을 입력하세요", 12, R("muted_text"))
        dummy(s, 11.6, fy, 1.4, 0.55, "PART 01", 12, p["accent"], True, PP_ALIGN.RIGHT)
    else:  # solid
        c.add_box(s, 0, fy, SW, 0.55, fill=p["mid"], line=None, shape=RECT)
        c.add_box(s, 0, fy, 0.5, 0.55, fill=p["accent"], line=None, shape=RECT)
        dummy(s, 0.7, fy, 8.0, 0.55, "2026 · 사업명 · 기관명을 입력하세요", 12, WHITE)
        dummy(s, 11.8, fy, 1.2, 0.55, "01", 13, G300, True, PP_ALIGN.RIGHT)


def b_sidepanel(s, aid, p, plc):
    w, side = plc["w"], plc["side"]
    full_anchor(s, aid, fill=WHITE)
    px = 0.0 if side == "L" else SW - w
    c.add_box(s, px, 0, w, SH, fill=p["dark"], line=None, shape=RECT)
    c.add_box(s, px, 0, w, 0.5, fill=p["accent"], line=None, shape=RECT)
    dummy(s, px + 0.35, 0.9, w - 0.7, 0.5, "PART 01", 14, p["point"], True)
    dummy(s, px + 0.35, 1.5, w - 0.7, 2.0, "사업명", 24, WHITE, True, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)
    dummy(s, px + 0.35, 6.7, w - 0.7, 0.5, "01", 16, G300, True)
    cx = (w + 0.5) if side == "L" else 0.5
    dummy(s, cx, 0.8, SW - w - 0.9, 0.7, "제목을 입력하세요", 26, NAVY9, True)
    c.add_box(s, cx, 1.55, 2.0, 0.08, fill=p["accent"], line=None, shape=RECT)
    dummy(s, cx, 2.0, SW - w - 0.9, 3.5,
          "본문 내용을 입력하세요.\n세로 패널이 페이지 정체성을 잡아주는 본문 강조용 배경입니다.",
          15, R("muted_text"), False, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)


def b_corner(s, aid, p, plc):
    corner = plc["corner"]
    full_anchor(s, aid, fill=WHITE)
    corner_tris(s, corner, [p["dark"], p["accent"]])
    dummy(s, 0.9, 0.9, 6.0, 0.5, "2026 · PART 01", 15, p["accent"], True)
    dummy(s, 0.9, 2.6, 9.0, 1.0, "제목을 입력하세요", 34, NAVY9, True)
    dummy(s, 0.9, 3.7, 9.0, 0.6, "부제/개요를 입력하세요", 16, R("muted_text"))


def b_lightgray(s, aid, p, plc):
    var = plc["var"]
    full_anchor(s, aid, fill=G050)
    if var == "circles":
        c.add_box(s, 9.8, -1.2, 4.5, 4.5, fill=G100, line=None, shape=OVAL)
        c.add_box(s, -1.4, 5.2, 4.0, 4.0, fill=G100, line=None, shape=OVAL)
    elif var == "corner":
        t = c.add_box(s, 9.8, 0, 3.5, 2.4, fill=G100, line=None, shape=TRI); t.rotation = 270
    else:  # stripe
        c.add_box(s, 0, 0, SW, 0.35, fill=G100, line=None, shape=RECT)
        c.add_box(s, 0, SH - 0.35, SW, 0.35, fill=G100, line=None, shape=RECT)
    c.add_box(s, 0.9, 1.3, 0.12, 0.6, fill=p["accent"], line=None, shape=RECT)
    dummy(s, 1.2, 1.3, 9.0, 0.65, "제목을 입력하세요", 26, NAVY9, True)
    dummy(s, 1.2, 2.4, 11.0, 3.5,
          "본문 콘텐츠 영역 — 눈이 편한 라이트 그레이(F7F9FC) 콘텐츠 배경입니다.",
          15, R("muted_text"), False, PP_ALIGN.LEFT, MSO_ANCHOR.TOP)


def b_diaggrad(s, aid, p, plc):
    angle = plc["angle"]
    anchor = gbox(s, 0, 0, SW, SH, p["dark"], p["mid"], angle=angle)
    c.name_asset(anchor, aid)  # 그라데이션 전면 도형을 대표 도형으로
    band = c.add_box(s, -1.0, 4.7, SW + 2.0, 1.0, fill=p["accent"], line=None, shape=PARA)
    band.rotation = 360 - 12 if angle >= 90 else 12
    dummy(s, 0, 2.0, SW, 0.5, "2026", 20, p["point"], True, PP_ALIGN.CENTER)
    dummy(s, 0, 2.7, SW, 1.3, "사업명", 44, WHITE, True, PP_ALIGN.CENTER)
    dummy(s, 0, 6.4, SW, 0.5, "제안서 제목을 입력하세요", 15, G300, False, PP_ALIGN.CENTER)


# ══════════════════════════════════════════════════════════════════
# 패밀리 메타 + 배치 변형(3개씩) + 빌더 매핑
# ══════════════════════════════════════════════════════════════════
FAM = {
    "cover-left":   {"nm": "표지 좌패널",          "tags": ["표지", "배경", "네이비패널"],        "rec": ["표지"],                       "style": "cover-left-panel",       "grad": False},
    "cover-band":   {"nm": "표지 하단밴드",        "tags": ["표지", "배경", "그라데이션"],        "rec": ["표지"],                       "style": "cover-bottom-band",      "grad": True},
    "cover-diag":   {"nm": "표지 사선레이어",      "tags": ["표지", "배경", "기하"],              "rec": ["표지"],                       "style": "cover-diagonal-layers",  "grad": False},
    "sec-num":      {"nm": "섹션번호 배경",        "tags": ["섹션간지", "배경", "섹션번호"],      "rec": ["섹션 구분"],                  "style": "section-number-bg",      "grad": False},
    "sec-band":     {"nm": "섹션 상단밴드",        "tags": ["섹션간지", "배경", "헤더밴드"],      "rec": ["섹션 구분"],                  "style": "section-top-band",       "grad": False},
    "interstitial": {"nm": "간지 사이드바",        "tags": ["섹션간지", "배경", "목차"],          "rec": ["간지"],                       "style": "toc-sidebar",            "grad": False},
    "header":       {"nm": "헤더밴드",             "tags": ["배경", "헤더밴드"],                  "rec": ["콘텐츠 헤더", "반복 사용"],   "style": "header-band",            "grad": False},
    "footer":       {"nm": "푸터바",               "tags": ["배경", "푸터"],                      "rec": ["콘텐츠 푸터", "페이지 표기"], "style": "footer-bar",             "grad": False},
    "sidepanel":    {"nm": "사이드 패널",          "tags": ["배경", "사이드패널"],                "rec": ["본문 강조", "사이드 패널"],   "style": "side-panel",             "grad": False},
    "corner":       {"nm": "코너 기하장식",        "tags": ["배경", "기하", "블루악센트"],        "rec": ["코너 장식", "콘텐츠 배경"],   "style": "corner-geo",             "grad": False},
    "lightgray":    {"nm": "라이트그레이 콘텐츠배경", "tags": ["배경", "라이트", "콘텐츠배경"],    "rec": ["콘텐츠 배경", "섹션 배경"],   "style": "content-lightgray",      "grad": False},
    "diaggrad":     {"nm": "대각 그라데이션 표지",  "tags": ["표지", "배경", "그라데이션", "기하"], "rec": ["표지"],                      "style": "cover-diagonal-gradient", "grad": True},
}

PLACE = {
    "cover-left":   [{"label": "L-narrow", "side": "L", "w": 4.6}, {"label": "L-wide", "side": "L", "w": 5.6}, {"label": "R", "side": "R", "w": 5.0}],
    "cover-band":   [{"label": "h18", "h": 1.8}, {"label": "h24", "h": 2.4}, {"label": "h30", "h": 3.0}],
    "cover-diag":   [{"label": "br", "corner": "br"}, {"label": "bl", "corner": "bl"}, {"label": "tr", "corner": "tr"}],
    "sec-num":      [{"label": "barL", "bar": "L"}, {"label": "barR", "bar": "R"}, {"label": "barL2", "bar": "L2"}],
    "sec-band":     [{"label": "h22", "h": 2.2}, {"label": "h27", "h": 2.7}, {"label": "h32", "h": 3.2}],
    "interstitial": [{"label": "L-narrow", "w": 3.8, "side": "L"}, {"label": "L-wide", "w": 4.4, "side": "L"}, {"label": "R", "w": 4.0, "side": "R"}],
    "header":       [{"label": "h095", "h": 0.95}, {"label": "h12", "h": 1.2}, {"label": "h15", "h": 1.5}],
    "footer":       [{"label": "solid", "style": "solid"}, {"label": "line", "style": "line"}, {"label": "grad", "style": "grad", "grad": True}],
    "sidepanel":    [{"label": "L-narrow", "w": 2.3, "side": "L"}, {"label": "L-wide", "w": 2.8, "side": "L"}, {"label": "R", "w": 2.5, "side": "R"}],
    "corner":       [{"label": "tr", "corner": "tr"}, {"label": "tl", "corner": "tl"}, {"label": "br", "corner": "br"}],
    "lightgray":    [{"label": "circles", "var": "circles"}, {"label": "corner", "var": "corner"}, {"label": "stripe", "var": "stripe"}],
    "diaggrad":     [{"label": "a45", "angle": 45}, {"label": "a135", "angle": 135}, {"label": "a90", "angle": 90}],
}

BUILDERS = {
    "cover-left": b_cover_left, "cover-band": b_cover_band, "cover-diag": b_cover_diag,
    "sec-num": b_sec_num, "sec-band": b_sec_band, "interstitial": b_interstitial,
    "header": b_header, "footer": b_footer, "sidepanel": b_sidepanel,
    "corner": b_corner, "lightgray": b_lightgray, "diaggrad": b_diaggrad,
}

# 처리 순서 = ID 부여 순서. 앞 8패밀리 16개, 뒤 4패밀리 15개 → 총 188.
FAM_ORDER = ["cover-left", "cover-band", "cover-diag", "sec-num", "sec-band",
             "interstitial", "header", "footer", "sidepanel", "corner",
             "lightgray", "diaggrad"]


def main():
    aid_n = 13
    files = []
    for fi, fkey in enumerate(FAM_ORDER):
        target = 16 if fi < 8 else 15
        meta = FAM[fkey]
        combos = [(plc, pal) for plc in PLACE[fkey] for pal in PALETTES][:target]
        F = "decks/10_backgrounds/BGP_bulk_%s_v1.pptx" % fkey
        prs = c.new_deck()
        for si, (plc, pal) in enumerate(combos, start=1):
            aid = "BGP-%03d" % aid_n
            aid_n += 1
            s = c.blank_slide(prs)
            c.id_caption(s, "%s · %s(%s/%s)" % (aid, meta["nm"], pal["key"], plc["label"]))
            BUILDERS[fkey](s, aid, pal, plc)
            is_grad = bool(meta["grad"] or plc.get("grad", False))
            params = {"style": meta["style"], "palette": pal["key"],
                      "placement": plc["label"], "gradient": is_grad}
            editable = ["color", "text"] + (["gradient"] if is_grad else [])
            E(aid, "%s · %s/%s" % (meta["nm"], pal["key"], plc["label"]), F, si,
              meta["tags"] + [pal["key"]], params,
              {"title": "사업명", "year": "2026", "part": "01"},
              editable, meta["rec"])
        out = c.save_deck(prs, F)
        files.append((F, len(combos)))
    frag = c.write_fragment("BGP_bulk", entries)
    print("LAST_ID: BGP-%03d" % (aid_n - 1))
    print("ENTRIES:", len(entries))
    print("FRAGMENT:", frag)
    for f, n in files:
        print("FILE: %s  (%d slides)" % (f, n))


if __name__ == "__main__":
    main()
