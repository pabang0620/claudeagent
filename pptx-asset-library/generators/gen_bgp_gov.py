# -*- coding: utf-8 -*-
"""
BGP_gov — 정부 트랙(gov) 표지·섹션간지 배경. BGP-201 ~ BGP-205.
캔버스: EMU 10905360x7772400(=base_gov.pptx와 동일, 11.9262x8.5in) — 표준 16:9(common.SLIDE_W/H)와
다르므로 이 생성기는 자체 new_deck_gov()로 슬라이드 크기를 세팅한다.

원칙 준수:
- 색·폰트·크기는 design-tokens.json 최상위 "gov_theme"(color/role/font/size_pt)만 참조. 매직 헥스 금지.
- 표지 풀블리드 실사는 "번들 스톡사진 없이" 프레임+아이콘+안내문 플레이스홀더로 대체
  (<p:pic> 전혀 사용하지 않음 — BGP가 ALLOW_PIC 대상이라도 라이선스-클린을 위해 이번 배치는 이미지 자체를 배제).
- 다중 도형 에셋은 생성 직후 c.group_asset(slide, shapes, ID)로 그룹화(id_caption 제외).
- master="gov"로 entry() 태깅. 프래그먼트는 _incoming/manifest_BGP_gov.json 전용(기존 manifest_BGP*.json 무변경).
"""
import sys
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.dml import MSO_LINE_DASH_STYLE

# ── gov 테마 토큰 로더 (design-tokens.json 최상위 "gov_theme" — additive, 기존 common.C/role과 별개) ──
GT = c.TOKENS["gov_theme"]
GC = {k: RGBColor.from_string(v) for k, v in GT["color"].items()}
def grole(name):
    return GC[GT["role"][name]]
GSIZE = GT["size_pt"]
GEOM = GT["geom"]
FONT_HEAD = GT["font"]["heading"]["typeface"]
FONT_SUB = GT["font"]["subheading"]["typeface"]
FONT_BODY = GT["font"]["body"]["typeface"]
FONT_CAP = GT["font"]["caption"]["typeface"]
FONT_LABEL = GT["font"]["label"]["typeface"]

RECT = MSO_SHAPE.RECTANGLE
RR = MSO_SHAPE.ROUNDED_RECTANGLE
OVAL = MSO_SHAPE.OVAL
TRI = MSO_SHAPE.ISOSCELES_TRIANGLE

# ── gov 캔버스 (base_gov.pptx 실측 EMU와 정확히 일치) ──
GOV_W_EMU = Emu(10905360)
GOV_H_EMU = Emu(7772400)
SW = GOV_W_EMU / 914400  # 11.926246719160105
SH = GOV_H_EMU / 914400  # 8.5

def new_deck_gov():
    prs = Presentation()
    prs.slide_width = GOV_W_EMU
    prs.slide_height = GOV_H_EMU
    return prs

entries = []

def E(asset_id, name, file_rel, slide_idx, tags, params, bindings, editable, rec):
    entries.append(c.entry(asset_id, "BGP", name, file_rel, slide_idx,
                           tags, params, bindings, editable,
                           recommended_use=rec, master="gov"))

# ─────────────────────────────────────────────────────────────
# 빌더 헬퍼
# ─────────────────────────────────────────────────────────────
def photo_placeholder(slide, x, y, w, h, label="실사 이미지 삽입 영역",
                       note="(제안 시점 라이선스 확보 사진으로 교체)", fill=None):
    """라이선스-클린 사진 플레이스홀더: 실제 이미지 없이 대시 프레임 + 산/해 아이콘(네이티브 도형) + 안내문."""
    shp = []
    frame = c.add_box(slide, x, y, w, h, fill=fill or grole("panel_bg"), line=grole("line"),
                      line_w=GEOM["line_accent_pt"], shape=RECT)
    frame.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    shp.append(frame)
    icon_w = min(w * 0.26, 1.5)
    icon_h = icon_w * 0.62
    icx = x + w / 2 - icon_w / 2
    icy = y + h / 2 - icon_h / 2 - 0.22
    sun = c.add_box(slide, icx + icon_w * 0.60, icy, icon_h * 0.46, icon_h * 0.46,
                    fill=grole("category"), line=None, shape=OVAL)
    shp.append(sun)
    mtn = c.add_box(slide, icx, icy + icon_h * 0.28, icon_w * 0.74, icon_h * 0.72,
                    fill=grole("accent_primary"), line=None, shape=TRI)
    shp.append(mtn)
    lbl = c.add_text(slide, x, y + h / 2 + icon_h * 0.30, w, 0.32, label,
                     size=GSIZE["caption"], bold=True, color=grole("accent_primary"),
                     align=PP_ALIGN.CENTER, font=FONT_CAP)
    shp.append(lbl)
    sub = c.add_text(slide, x, y + h / 2 + icon_h * 0.30 + 0.30, w, 0.3, note,
                     size=GSIZE["label"], bold=False, color=grole("accent_primary"),
                     align=PP_ALIGN.CENTER, font=FONT_CAP)
    shp.append(sub)
    return shp

def corner_marks(slide, x, y, w, h, size=0.32, thick=0.045, color=None):
    """프레임 네 모서리 L자 브래킷(카메라 뷰파인더 느낌) — 순수 도형."""
    color = color or grole("line")
    shp = []
    corners = [(x, y, 'tl'), (x + w, y, 'tr'), (x, y + h, 'bl'), (x + w, y + h, 'br')]
    for px, py, corner in corners:
        if corner == 'tl':
            h1 = c.add_box(slide, px, py, size, thick, fill=color, line=None, shape=RECT)
            v1 = c.add_box(slide, px, py, thick, size, fill=color, line=None, shape=RECT)
        elif corner == 'tr':
            h1 = c.add_box(slide, px - size, py, size, thick, fill=color, line=None, shape=RECT)
            v1 = c.add_box(slide, px - thick, py, thick, size, fill=color, line=None, shape=RECT)
        elif corner == 'bl':
            h1 = c.add_box(slide, px, py - thick, size, thick, fill=color, line=None, shape=RECT)
            v1 = c.add_box(slide, px, py - size, thick, size, fill=color, line=None, shape=RECT)
        else:
            h1 = c.add_box(slide, px - size, py - thick, size, thick, fill=color, line=None, shape=RECT)
            v1 = c.add_box(slide, px - thick, py - size, thick, size, fill=color, line=None, shape=RECT)
        shp += [h1, v1]
    return shp

# ══════════════════════════════════════════════════════════════════
# DECK 1: BGP_gov_cover_v1.pptx — 표지 3종 (BGP-201~203)
# ══════════════════════════════════════════════════════════════════
F1 = "decks/10_backgrounds/BGP_gov_cover_v1.pptx"
prs = new_deck_gov()

# ── slide 1 · BGP-201 표지A: 네이비 풀블리드 + 흰 제목(상단) + 하단 사진 플레이스홀더 밴드 ──
s = c.blank_slide(prs); c.id_caption(s, "BGP-201 · gov 표지A(네이비 풀블리드+하단 사진영역)")
shp = []
shp.append(c.add_box(s, 0, 0, SW, SH, fill=grole("accent_primary"), line=None, shape=RECT))
shp.append(c.add_text(s, 0.85, 0.55, 6.0, 0.35, "정부 제안서 표지", size=GSIZE["label"], bold=True,
                       color=grole("bg"), align=PP_ALIGN.LEFT, font=FONT_LABEL))
shp.append(c.add_text(s, 0.85, 0.92, SW - 1.7, 0.85, "사업명을 입력하세요",
                       size=GSIZE["section_divider"], bold=True, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_HEAD))
shp.append(c.add_text(s, 0.85, 1.80, SW - 1.7, 0.5, "제안서 부제목을 입력하세요",
                       size=GSIZE["subheading"], bold=False, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_BODY))
shp.append(c.add_box(s, 0.85, 2.35, 2.3, 0.06, fill=grole("line"), line=None, shape=RECT))
shp += photo_placeholder(s, 0.85, 2.75, SW - 1.7, 4.55)
shp.append(c.add_text(s, 0.85, 7.55, 6.0, 0.4, "2026 · 기관명을 입력하세요", size=GSIZE["caption"],
                       color=grole("bg"), align=PP_ALIGN.LEFT, font=FONT_CAP))
shp.append(c.add_text(s, SW - 4.85, 7.55, 4.0, 0.4, "PART 00 · 표지", size=GSIZE["caption"],
                       bold=True, color=grole("bg"), align=PP_ALIGN.RIGHT, font=FONT_CAP))
c.group_asset(s, shp, "BGP-201")
E("BGP-201", "gov 표지A · 네이비 풀블리드 + 하단 사진 플레이스홀더", F1, 1,
  ["표지", "gov", "네이비풀블리드", "사진플레이스홀더"],
  {"style": "gov-cover-navy-bottom-photo", "canvas": "gov"},
  {"title": "사업명을 입력하세요", "subtitle": "제안서 부제목을 입력하세요",
   "year": "2026", "agency": "기관명을 입력하세요", "part": "00"},
  ["color", "text"], ["표지"])

# ── slide 2 · BGP-202 표지B: 대각 그라데이션(네이비→퍼플) + 좌 흰 제목 + 우 세로 사진 플레이스홀더 ──
s = c.blank_slide(prs); c.id_caption(s, "BGP-202 · gov 표지B(대각 그라데이션+우 세로 사진영역)")
shp = []
bg = c.add_box(s, 0, 0, SW, SH, fill=grole("bg"), line=None, shape=RECT)
bg.fill.gradient()
gs = bg.fill.gradient_stops
gs[0].position = 0.0; gs[0].color.rgb = grole("accent_primary")
gs[1].position = 1.0; gs[1].color.rgb = grole("category")
try:
    bg.fill.gradient_angle = 45
except Exception:
    pass
bg.line.fill.background(); bg.shadow.inherit = False
shp.append(bg)
left_w = SW * 0.58 - 0.85
shp.append(c.add_text(s, 0.85, 0.75, left_w, 0.35, "정부 제안서 표지", size=GSIZE["label"], bold=True,
                       color=grole("bg"), align=PP_ALIGN.LEFT, font=FONT_LABEL))
shp.append(c.add_text(s, 0.85, 1.15, left_w, 1.55, "사업명을 입력하세요",
                       size=GSIZE["section_divider"], bold=True, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_HEAD))
shp.append(c.add_text(s, 0.85, 2.85, left_w, 0.5, "제안서 부제목을 입력하세요",
                       size=GSIZE["subheading"], bold=False, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_BODY))
shp.append(c.add_box(s, 0.85, 3.45, 2.0, 0.06, fill=grole("bg"), line=None, shape=RECT))
shp.append(c.add_text(s, 0.85, 7.55, left_w, 0.4, "2026 · 기관명을 입력하세요", size=GSIZE["caption"],
                       color=grole("bg"), align=PP_ALIGN.LEFT, font=FONT_CAP))
panel_x = SW * 0.66
panel_w = SW - 0.85 - panel_x
shp += photo_placeholder(s, panel_x, 0.85, panel_w, SH - 1.70, fill=grole("bg"))
c.group_asset(s, shp, "BGP-202")
E("BGP-202", "gov 표지B · 대각 그라데이션(네이비→퍼플) + 우 세로 사진 플레이스홀더", F1, 2,
  ["표지", "gov", "그라데이션", "사진플레이스홀더"],
  {"style": "gov-cover-diagonal-gradient-right-photo", "canvas": "gov", "gradient": True},
  {"title": "사업명을 입력하세요", "subtitle": "제안서 부제목을 입력하세요",
   "year": "2026", "agency": "기관명을 입력하세요", "part": "00"},
  ["color", "text", "gradient"], ["표지"])

# ── slide 3 · BGP-203 표지C: 네이비 상단 밴드 + 라이트 패널 + 중앙하단 코너브래킷 사진 프레임 ──
s = c.blank_slide(prs); c.id_caption(s, "BGP-203 · gov 표지C(상단 밴드+코너브래킷 사진프레임)")
shp = []
shp.append(c.add_box(s, 0, 0, SW, 3.0, fill=grole("accent_primary"), line=None, shape=RECT))
shp.append(c.add_box(s, 0, 3.0, SW, SH - 3.0, fill=grole("panel_bg"), line=None, shape=RECT))
shp.append(c.add_text(s, 0.85, 0.55, 6.0, 0.35, "정부 제안서 표지", size=GSIZE["label"], bold=True,
                       color=grole("bg"), align=PP_ALIGN.LEFT, font=FONT_LABEL))
shp.append(c.add_text(s, 0.85, 0.95, SW - 1.7, 0.9, "사업명을 입력하세요",
                       size=GSIZE["section_divider"], bold=True, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_HEAD))
shp.append(c.add_text(s, 0.85, 3.25, SW - 1.7, 0.45, "제안서 부제목을 입력하세요",
                       size=GSIZE["subheading"], bold=False, color=grole("accent_primary"),
                       align=PP_ALIGN.LEFT, font=FONT_BODY))
fw, fh = 5.4, 3.5
fx, fy = SW / 2 - fw / 2, 3.95
shp += photo_placeholder(s, fx, fy, fw, fh, fill=grole("bg"))
shp += corner_marks(s, fx, fy, fw, fh)
shp.append(c.add_text(s, 0.85, SH - 0.55, 6.0, 0.4, "2026 · 기관명을 입력하세요", size=GSIZE["caption"],
                       color=grole("accent_primary"), align=PP_ALIGN.LEFT, font=FONT_CAP))
c.group_asset(s, shp, "BGP-203")
E("BGP-203", "gov 표지C · 상단 네이비 밴드 + 코너브래킷 사진 프레임", F1, 3,
  ["표지", "gov", "상단밴드", "코너브래킷", "사진플레이스홀더"],
  {"style": "gov-cover-top-band-corner-frame", "canvas": "gov"},
  {"title": "사업명을 입력하세요", "subtitle": "제안서 부제목을 입력하세요",
   "year": "2026", "agency": "기관명을 입력하세요", "part": "00"},
  ["color", "text"], ["표지"])

c.save_deck(prs, F1)

# ══════════════════════════════════════════════════════════════════
# DECK 2: BGP_gov_interstitial_v1.pptx — 섹션 간지 2종 (BGP-204~205)
# ══════════════════════════════════════════════════════════════════
F2 = "decks/10_backgrounds/BGP_gov_interstitial_v1.pptx"
prs = new_deck_gov()

# ── slide 1 · BGP-204 섹션 간지A: 네이비 풀블리드 + 대형 번호 + 섹션 대제목(36pt) ──
s = c.blank_slide(prs); c.id_caption(s, "BGP-204 · gov 섹션간지A(네이비+대형번호)")
shp = []
shp.append(c.add_box(s, 0, 0, SW, SH, fill=grole("accent_primary"), line=None, shape=RECT))
shp.append(c.add_text(s, 0.9, 1.1, 4.0, 0.4, "PART 01", size=GSIZE["caption"], bold=True,
                       color=grole("category"), align=PP_ALIGN.LEFT, font=FONT_CAP))
shp.append(c.add_text(s, 0.9, 1.55, 4.0, 3.0, "01", size=170, bold=True, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_HEAD))
shp.append(c.add_text(s, 5.3, 2.55, SW - 5.3 - 0.9, 1.3, "제목을 입력하세요",
                       size=GSIZE["section_divider"], bold=True, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_HEAD))
shp.append(c.add_box(s, 5.3, 4.0, 2.4, 0.07, fill=grole("line"), line=None, shape=RECT))
shp.append(c.add_text(s, 5.3, 4.25, SW - 5.3 - 0.9, 0.6, "본 섹션의 개요를 입력하세요.",
                       size=GSIZE["subheading"], bold=False, color=grole("bg"),
                       align=PP_ALIGN.LEFT, font=FONT_BODY))
shp.append(c.add_text(s, 0.9, SH - 0.55, 6.0, 0.4, "2026 · 사업명을 입력하세요", size=GSIZE["caption"],
                       color=grole("bg"), align=PP_ALIGN.LEFT, font=FONT_CAP))
c.group_asset(s, shp, "BGP-204")
E("BGP-204", "gov 섹션 간지A · 네이비 풀블리드 + 대형 번호 + 섹션 대제목", F2, 1,
  ["섹션간지", "gov", "네이비풀블리드", "대형번호"],
  {"style": "gov-interstitial-navy-bignum", "canvas": "gov"},
  {"part": "01", "number": "01", "title": "제목을 입력하세요",
   "desc": "본 섹션의 개요를 입력하세요.", "year": "2026", "program": "사업명을 입력하세요"},
  ["color", "text"], ["섹션 구분", "간지"])

# ── slide 2 · BGP-205 섹션 간지B: 라이트 패널 + 퍼플 번호 배지 + 섹션 대제목(36pt) ──
s = c.blank_slide(prs); c.id_caption(s, "BGP-205 · gov 섹션간지B(라이트패널+퍼플번호배지)")
shp = []
shp.append(c.add_box(s, 0, 0, SW, SH, fill=grole("panel_bg"), line=None, shape=RECT))
badge = c.add_box(s, 0.9, 1.6, 2.2, 2.2, fill=grole("category"), line=None, shape=RR)
badge.adjustments[0] = GEOM["round_radius_pct"]
c.set_shape_text(badge, "02", size=110, bold=True, color=grole("bg"), align=PP_ALIGN.CENTER, font=FONT_HEAD)
shp.append(badge)
shp.append(c.add_text(s, 3.5, 1.72, 6.0, 0.4, "PART 02", size=GSIZE["caption"], bold=True,
                       color=grole("category"), align=PP_ALIGN.LEFT, font=FONT_CAP))
shp.append(c.add_text(s, 3.5, 2.15, SW - 3.5 - 0.9, 1.3, "제목을 입력하세요",
                       size=GSIZE["section_divider"], bold=True, color=grole("accent_primary"),
                       align=PP_ALIGN.LEFT, font=FONT_HEAD))
shp.append(c.add_box(s, 3.5, 3.55, 2.4, 0.07, fill=grole("line"), line=None, shape=RECT))
shp.append(c.add_text(s, 3.5, 3.80, SW - 3.5 - 0.9, 0.6, "본 섹션의 개요를 입력하세요.",
                       size=GSIZE["subheading"], bold=False, color=grole("body_text"),
                       align=PP_ALIGN.LEFT, font=FONT_BODY))
shp.append(c.add_text(s, 0.9, SH - 0.55, 6.0, 0.4, "2026 · 사업명을 입력하세요", size=GSIZE["caption"],
                       color=grole("body_text"), align=PP_ALIGN.LEFT, font=FONT_CAP))
c.group_asset(s, shp, "BGP-205")
E("BGP-205", "gov 섹션 간지B · 라이트 패널 + 퍼플 번호 배지 + 섹션 대제목", F2, 2,
  ["섹션간지", "gov", "라이트패널", "퍼플배지"],
  {"style": "gov-interstitial-panel-badge", "canvas": "gov"},
  {"part": "02", "number": "02", "title": "제목을 입력하세요",
   "desc": "본 섹션의 개요를 입력하세요.", "year": "2026", "program": "사업명을 입력하세요"},
  ["color", "text"], ["섹션 구분", "간지"])

c.save_deck(prs, F2)

# ══════════════════════════════════════════════════════════════════
frag = c.write_fragment("BGP_gov", entries)  # -> _incoming/manifest_BGP_gov.json (기존 manifest_BGP*.json 무변경)
print("SAVED:", F1, F2)
print("FRAGMENT:", frag)
print("ENTRIES:", len(entries))
for e in entries:
    print(" ", e["id"], e["name"])
