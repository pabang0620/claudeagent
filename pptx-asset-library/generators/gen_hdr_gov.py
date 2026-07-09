# -*- coding: utf-8 -*-
"""
HDR_gov — 정부 트랙(gov) 챕터 브레드크럼 내비게이션 + 진행률 숫자 트래커. HDR-201 ~ HDR-205.
캔버스: EMU 10905360x7772400(=base_gov.pptx와 동일, 11.9262x8.5in) — 표준 16:9(common.SLIDE_W/H)와
다르므로 이 생성기는 자체 new_deck_gov()로 슬라이드 크기를 세팅한다.

원칙 준수:
- 색·폰트·크기는 design-tokens.json 최상위 "gov_theme"(color/role/font/size_pt)만 참조. 매직 헥스 금지.
- HDR은 audit.py ALLOW_PIC 대상이 아니므로 <p:pic> 전혀 사용하지 않음(전부 네이티브 도형/텍스트).
- 다중 도형 에셋은 생성 직후 c.group_asset(slide, shapes, ID)로 그룹화(id_caption 제외).
- master="gov"로 entry() 태깅. 프래그먼트는 _incoming/manifest_HDR_gov.json 전용(기존 manifest_HDR*.json 무변경).
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import common as c
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

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
FONT_NUM = GT["font"]["number_emphasis"]["typeface"]

RECT = MSO_SHAPE.RECTANGLE
RR = MSO_SHAPE.ROUNDED_RECTANGLE
OVAL = MSO_SHAPE.OVAL
CHEVRON = MSO_SHAPE.CHEVRON

GOV_W_EMU = Emu(10905360)
GOV_H_EMU = Emu(7772400)
SW = GOV_W_EMU / 914400
SH = GOV_H_EMU / 914400

def new_deck_gov():
    prs = Presentation()
    prs.slide_width = GOV_W_EMU
    prs.slide_height = GOV_H_EMU
    return prs

CHAPTERS = ["사업 개요", "추진 전략", "추진 체계", "세부 추진계획", "기대효과"]

entries = []

def E(asset_id, name, file_rel, slide_idx, tags, params, bindings, editable, rec):
    entries.append(c.entry(asset_id, "HDR", name, file_rel, slide_idx,
                           tags, params, bindings, editable,
                           recommended_use=rec, master="gov"))

# ─────────────────────────────────────────────────────────────
# 빌더 헬퍼 — 챕터 브레드크럼 3종
# ─────────────────────────────────────────────────────────────
def build_breadcrumb_pills(slide, x, y, chapters, current_idx, w_each=2.05, h=0.5, gap=0.12):
    """알약형 브레드크럼: 챕터 나열 + 현재 위치 강조(네이비 filled) + 셰브론 구분자."""
    shp = []
    for i, name in enumerate(chapters):
        px = x + i * (w_each + gap)
        active = (i == current_idx)
        fill = grole("accent_primary") if active else grole("panel_bg")
        txt_c = grole("bg") if active else grole("body_text")
        pill = c.add_box(slide, px, y, w_each, h, fill=fill,
                         line=None if active else grole("line"),
                         line_w=GEOM["border_pt"], shape=RR)
        pill.adjustments[0] = GEOM["badge_pill_adj_pct"]
        c.set_shape_text(pill, name, size=GSIZE["label"], bold=active, color=txt_c,
                         align=PP_ALIGN.CENTER, font=FONT_LABEL)
        shp.append(pill)
        if i < len(chapters) - 1:
            cx = px + w_each + gap / 2 - 0.06
            chev = c.add_box(slide, cx, y + h / 2 - 0.06, 0.12, 0.12, fill=grole("line"),
                             line=None, shape=CHEVRON)
            shp.append(chev)
    return shp

def build_breadcrumb_circles(slide, x, y, chapters, current_idx, d=0.62, span=9.6):
    """번호원 브레드크럼: 완료(퍼플)/현재(네이비)/예정(아웃라인) 구분 + 연결선 + 하단 챕터명."""
    shp = []
    n = len(chapters)
    step = span / (n - 1)
    line = c.add_box(slide, x + d / 2, y + d / 2 - 0.02, span - d, 0.04, fill=grole("line"),
                     line=None, shape=RECT)
    shp.append(line)
    for i, name in enumerate(chapters):
        cx = x + i * step
        if i < current_idx:
            fill, txt_c, ln = grole("category"), grole("bg"), None
        elif i == current_idx:
            fill, txt_c, ln = grole("accent_primary"), grole("bg"), None
        else:
            fill, txt_c, ln = grole("bg"), grole("body_text"), grole("line")
        circ = c.add_box(slide, cx, y, d, d, fill=fill, line=ln, line_w=GEOM["border_pt"], shape=OVAL)
        c.set_shape_text(circ, str(i + 1), size=GSIZE["subheading"], bold=True, color=txt_c,
                         align=PP_ALIGN.CENTER, font=FONT_HEAD)
        shp.append(circ)
        active = (i == current_idx)
        lbl = c.add_text(slide, cx - 0.55, y + d + 0.08, d + 1.1, 0.4, name, size=GSIZE["label"],
                         bold=active, color=grole("accent_primary") if active else grole("body_text"),
                         align=PP_ALIGN.CENTER, font=FONT_LABEL)
        shp.append(lbl)
    return shp

def build_breadcrumb_strip(slide, x, y, chapters, current_idx, w=10.7, h=0.5):
    """컴팩트 상단 스트립 브레드크럼: 세그먼트 + 세로 구분선 + 현재 세그먼트 하단 언더라인(반복 배치용)."""
    shp = []
    seg_w = w / len(chapters)
    bar = c.add_box(slide, x, y, w, h, fill=grole("panel_bg"), line=None, shape=RECT)
    shp.append(bar)
    for i, name in enumerate(chapters):
        sx = x + i * seg_w
        active = (i == current_idx)
        label = "%d. %s" % (i + 1, name)
        txt_c = grole("accent_primary") if active else grole("body_text")
        t = c.add_text(slide, sx + 0.08, y, seg_w - 0.16, h, label, size=GSIZE["label"], bold=active,
                       color=txt_c, align=PP_ALIGN.CENTER, font=FONT_LABEL)
        shp.append(t)
        if active:
            ul = c.add_box(slide, sx, y + h - 0.06, seg_w, 0.06, fill=grole("line"), line=None, shape=RECT)
            shp.append(ul)
        if i > 0:
            dv = c.add_box(slide, sx, y + 0.08, 0.012, h - 0.16, fill=grole("line"), line=None, shape=RECT)
            shp.append(dv)
    return shp

# ─────────────────────────────────────────────────────────────
# 빌더 헬퍼 — 진행률 숫자 트래커 위젯 2종 (브레드크럼과 별개 신규 컴포넌트)
# ─────────────────────────────────────────────────────────────
def build_progress_tracker(slide, x, y, statuses, chapters, w_each=1.7, h=1.15, gap=0.2):
    """5챕터 숫자 뱃지(1=완료/0=예정, Paperlogy) + 챕터 라벨 + 범례."""
    shp = []
    total_w = w_each * len(statuses) + gap * (len(statuses) - 1)
    title = c.add_text(slide, x, y - 0.5, total_w, 0.4, "챕터 진행현황", size=GSIZE["subheading"],
                       bold=True, color=grole("accent_primary"), align=PP_ALIGN.LEFT, font=FONT_SUB)
    shp.append(title)
    for i, (st, name) in enumerate(zip(statuses, chapters)):
        bx = x + i * (w_each + gap)
        done = (st == 1)
        fill = grole("accent_primary") if done else grole("bg")
        txt_c = grole("bg") if done else grole("accent_primary")
        badge = c.add_box(slide, bx, y, w_each, h * 0.62, fill=fill,
                          line=None if done else grole("line"), line_w=GEOM["line_accent_pt"], shape=RR)
        badge.adjustments[0] = GEOM["round_radius_pct"]
        c.set_shape_text(badge, str(st), size=28, bold=True, color=txt_c,
                         align=PP_ALIGN.CENTER, font=FONT_NUM)
        shp.append(badge)
        lbl = c.add_text(slide, bx, y + h * 0.62 + 0.06, w_each, 0.3, "Ch.%d %s" % (i + 1, name),
                         size=GSIZE["label"], bold=False, color=grole("body_text"),
                         align=PP_ALIGN.CENTER, font=FONT_CAP)
        shp.append(lbl)
    ly = y + h * 0.62 + 0.42
    lx = x
    chip1 = c.add_box(slide, lx, ly, 0.22, 0.22, fill=grole("accent_primary"), line=None, shape=RECT)
    shp.append(chip1)
    t1 = c.add_text(slide, lx + 0.30, ly - 0.05, 0.9, 0.3, "완료(1)", size=GSIZE["label"],
                    color=grole("body_text"), align=PP_ALIGN.LEFT, font=FONT_CAP)
    shp.append(t1)
    chip2 = c.add_box(slide, lx + 1.35, ly, 0.22, 0.22, fill=grole("bg"), line=grole("line"),
                      line_w=GEOM["border_pt"], shape=RECT)
    shp.append(chip2)
    t2 = c.add_text(slide, lx + 1.65, ly - 0.05, 0.9, 0.3, "예정(0)", size=GSIZE["label"],
                    color=grole("body_text"), align=PP_ALIGN.LEFT, font=FONT_CAP)
    shp.append(t2)
    return shp

def build_progress_inline(slide, x, y, statuses, chapters, dot_d=0.30, gap=0.14):
    """컴팩트 인라인 진행률 스트립(푸터 반복 배치용): "진행 N/5" + 점 뱃지(숫자 1/0)."""
    shp = []
    done_n = sum(statuses)
    total = len(statuses)
    lbl = c.add_text(slide, x, y, 1.3, dot_d, "진행 %d/%d" % (done_n, total), size=GSIZE["label"],
                     bold=True, color=grole("accent_primary"), align=PP_ALIGN.LEFT, font=FONT_LABEL)
    shp.append(lbl)
    dx = x + 1.35
    for i, st in enumerate(statuses):
        done = (st == 1)
        fill = grole("accent_primary") if done else grole("bg")
        dot = c.add_box(slide, dx + i * (dot_d + gap), y, dot_d, dot_d, fill=fill,
                        line=None if done else grole("line"), line_w=GEOM["border_pt"], shape=OVAL)
        c.set_shape_text(dot, str(st), size=10, bold=True,
                         color=grole("bg") if done else grole("accent_primary"),
                         align=PP_ALIGN.CENTER, font=FONT_NUM)
        shp.append(dot)
        lbl2 = c.add_text(slide, dx + i * (dot_d + gap) - 0.12, y + dot_d + 0.03, dot_d + 0.24, 0.24,
                          "Ch%d" % (i + 1), size=7, bold=False, color=grole("body_text"),
                          align=PP_ALIGN.CENTER, font=FONT_CAP)
        shp.append(lbl2)
    return shp

# ══════════════════════════════════════════════════════════════════
# DECK 1: HDR_gov_breadcrumb_v1.pptx — 챕터 브레드크럼 내비게이션 3종 (HDR-201~203)
# ══════════════════════════════════════════════════════════════════
F1 = "decks/09_headers/HDR_gov_breadcrumb_v1.pptx"
prs = new_deck_gov()

s = c.blank_slide(prs); c.id_caption(s, "HDR-201 · gov 브레드크럼A(알약형+셰브론, 현재=추진전략)")
shp = build_breadcrumb_pills(s, (SW - (5 * 2.05 + 4 * 0.12)) / 2, 3.9, CHAPTERS, 1)
c.group_asset(s, shp, "HDR-201")
E("HDR-201", "gov 챕터 브레드크럼A · 알약형 + 셰브론 구분자", F1, 1,
  ["브레드크럼", "gov", "챕터", "내비게이션", "알약형"],
  {"count": 5, "current_idx": 1, "w_each_in": 2.05},
  {"chapters": CHAPTERS, "current": CHAPTERS[1]},
  ["text", "color"], ["챕터 반복 내비게이션", "목차 대체 헤더"])

s = c.blank_slide(prs); c.id_caption(s, "HDR-202 · gov 브레드크럼B(번호원+연결선, 현재=추진체계)")
shp = build_breadcrumb_circles(s, (SW - 9.6) / 2, 3.4, CHAPTERS, 2)
c.group_asset(s, shp, "HDR-202")
E("HDR-202", "gov 챕터 브레드크럼B · 번호원 + 연결선(완료/현재/예정 구분)", F1, 2,
  ["브레드크럼", "gov", "챕터", "내비게이션", "번호원"],
  {"count": 5, "current_idx": 2, "d_in": 0.62},
  {"chapters": CHAPTERS, "current": CHAPTERS[2]},
  ["text", "color"], ["챕터 반복 내비게이션", "진행 단계 표시"])

s = c.blank_slide(prs); c.id_caption(s, "HDR-203 · gov 브레드크럼C(상단 컴팩트 스트립, 현재=세부추진계획)")
shp = build_breadcrumb_strip(s, (SW - 10.7) / 2, 0.5, CHAPTERS, 3)
c.group_asset(s, shp, "HDR-203")
E("HDR-203", "gov 챕터 브레드크럼C · 상단 컴팩트 스트립(반복 배치형)", F1, 3,
  ["브레드크럼", "gov", "챕터", "내비게이션", "상단스트립"],
  {"count": 5, "current_idx": 3, "w_in": 10.7},
  {"chapters": CHAPTERS, "current": CHAPTERS[3]},
  ["text", "color"], ["콘텐츠 슬라이드 상단 반복 헤더", "챕터 위치 안내"])

c.save_deck(prs, F1)

# ══════════════════════════════════════════════════════════════════
# DECK 2: HDR_gov_progress-tracker_v1.pptx — 진행률 숫자 트래커 2종 (HDR-204~205)
# ══════════════════════════════════════════════════════════════════
F2 = "decks/09_headers/HDR_gov_progress-tracker_v1.pptx"
prs = new_deck_gov()

STATUSES = [1, 0, 1, 0, 0]

s = c.blank_slide(prs); c.id_caption(s, "HDR-204 · gov 진행률 트래커A(뱃지 5개+라벨+범례)")
total_w = 1.7 * 5 + 0.2 * 4
shp = build_progress_tracker(s, (SW - total_w) / 2, 3.3, STATUSES, CHAPTERS)
c.group_asset(s, shp, "HDR-204")
E("HDR-204", "gov 진행률 숫자 트래커A · 뱃지 5개(1/0) + 챕터 라벨 + 범례", F2, 1,
  ["진행률", "gov", "트래커", "숫자뱃지", "위젯"],
  {"count": 5, "statuses": STATUSES, "font": "number_emphasis"},
  {"chapters": CHAPTERS, "statuses": STATUSES},
  ["text", "color"], ["진행 현황 위젯", "소형 재사용 컴포넌트"])

s = c.blank_slide(prs); c.id_caption(s, "HDR-205 · gov 진행률 트래커B(인라인 컴팩트, 푸터용)")
shp = build_progress_inline(s, (SW - 4.6) / 2, 3.9, STATUSES, CHAPTERS)
c.group_asset(s, shp, "HDR-205")
E("HDR-205", "gov 진행률 숫자 트래커B · 인라인 컴팩트(푸터 반복 배치용)", F2, 2,
  ["진행률", "gov", "트래커", "숫자뱃지", "인라인", "푸터"],
  {"count": 5, "statuses": STATUSES, "font": "number_emphasis"},
  {"chapters": CHAPTERS, "statuses": STATUSES},
  ["text", "color"], ["푸터 반복 배치", "소형 재사용 컴포넌트"])

c.save_deck(prs, F2)

# ══════════════════════════════════════════════════════════════════
frag = c.write_fragment("HDR_gov", entries)  # -> _incoming/manifest_HDR_gov.json (기존 manifest_HDR*.json 무변경)
print("SAVED:", F1, F2)
print("FRAGMENT:", frag)
print("ENTRIES:", len(entries))
for e in entries:
    print(" ", e["id"], e["name"])
