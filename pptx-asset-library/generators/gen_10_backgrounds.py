# -*- coding: utf-8 -*-
"""
10_backgrounds (BGP) 카테고리 생성기 — 표지/섹션/간지 배경 · 사이드/헤더/푸터/코너 패널
BGP-001 ~ BGP-012. 전부 python-pptx 네이티브 도형(그라데이션 포함)만 사용 — 외부 이미지(<p:pic>) 금지.
원본 PDF 톤(네이비 다크 패널 + 블루 악센트 바)을 복제가 아닌 추상화로 재구성.

- 배경은 대형 에셋 → 원칙적으로 1슬라이드 1에셋(푸터 2종만 예외로 1슬라이드 공유).
- 각 에셋의 대표 도형(페이지 전체 앵커 rect 또는 바 rect)에 asset:<ID> 이름 부여.
- 텍스트 자리는 더미("2026","사업명","PART 01","제목을 입력하세요").
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
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
    """페이지 전체를 덮는 대표 도형(앵커). fill=None이면 투명. 맨 처음(뒤) 배치."""
    box = c.add_box(slide, 0, 0, SW, SH, fill=fill, line=None, shape=RECT)
    c.name_asset(box, aid)
    return box

def gbox(slide, x, y, w, h, color1, color2, angle=90, shape=RECT):
    """2-stop 그라데이션 도형(같은 계열). <p:sp>+<a:gradFill> — 이미지 아님."""
    sp = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sp.fill.gradient()
    stops = sp.fill.gradient_stops
    stops[0].position = 0.0
    stops[0].color.rgb = color1
    stops[1].position = 1.0
    stops[1].color.rgb = color2
    try:
        sp.fill.gradient_angle = angle
    except Exception:
        pass
    sp.line.fill.background()
    sp.shadow.inherit = False
    return sp

def dummy(slide, x, y, w, h, text, size=14, color=None, bold=False,
          align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE, font=None):
    return c.add_text(slide, x, y, w, h, text, size=size, bold=bold,
                      color=color or R("body_text"), align=align, anchor=anchor,
                      font=font or c.FONT_H)

# ══════════════════════════════════════════════════════════════════
# DECK 1: BGP_cover_v1.pptx  (표지 3종 + 섹션 구분 2종)
# ══════════════════════════════════════════════════════════════════
F1 = "decks/10_backgrounds/BGP_cover_v1.pptx"
prs = c.new_deck()

# ── slide 1 · BGP-001 표지 배경A: 좌측 네이비 세로/대각 패널 + 우측 제목 여백 + 블루 악센트 바
s = c.blank_slide(prs); c.id_caption(s, "BGP-001 · 표지 배경A(좌 네이비 패널)")
full_anchor(s, "BGP-001")
c.add_box(s, 0, 0, 5.4, SH, fill=c.C["navy_900"], line=None, shape=RECT)        # 좌 네이비 패널
c.add_box(s, 5.0, 0, 0.9, SH, fill=c.C["navy_800"], line=None, shape=TRI).rotation = 90  # 대각 레이어
c.add_box(s, 5.5, 0, 0.14, SH, fill=R("accent_primary"), line=None, shape=RECT) # 블루 세로 악센트 바
c.add_box(s, 0.9, 4.55, 1.5, 0.09, fill=R("accent_point"), line=None, shape=RECT)  # 소 악센트
dummy(s, 0.9, 1.2, 3.8, 0.5, "2026", size=22, color=R("accent_point"), bold=True)
dummy(s, 0.9, 3.4, 3.9, 1.1, "사업명", size=40, color=c.C["white"], bold=True)
dummy(s, 0.9, 4.8, 3.9, 0.5, "제안서 표지 제목을 입력하세요", size=14, color=c.C["gray_300"])
dummy(s, 6.4, 6.5, 6.2, 0.5, "제출처 · 기관명을 입력하세요", size=13, color=R("muted_text"),
      align=PP_ALIGN.RIGHT)
E("BGP-001", "표지 배경A · 좌 네이비 패널 + 블루 악센트", F1, 1,
  ["표지","배경","네이비패널","블루악센트"],
  {"style": "cover-left-navy", "gradient": False},
  {"title": "사업명", "year": "2026", "part": "01"},
  ["color", "text"], ["표지"])

# ── slide 2 · BGP-002 표지 배경B: 하단 네이비 밴드 + 상단 라이트 그라데이션
s = c.blank_slide(prs); c.id_caption(s, "BGP-002 · 표지 배경B(하단 밴드+상단 그라데)")
full_anchor(s, "BGP-002")
gbox(s, 0, 0, SW, 5.3, c.C["white"], c.C["gray_050"], angle=90)                 # 상단 라이트 그라데
c.add_box(s, 0, 5.3, SW, 0.1, fill=R("accent_primary"), line=None, shape=RECT)  # 블루 구분 바
c.add_box(s, 0, 5.4, SW, 2.1, fill=c.C["navy_800"], line=None, shape=RECT)      # 하단 네이비 밴드
dummy(s, 0, 1.6, SW, 0.5, "2026", size=20, color=R("accent_primary"), bold=True,
      align=PP_ALIGN.CENTER)
dummy(s, 0, 2.3, SW, 1.4, "사업명", size=44, color=c.C["navy_900"], bold=True,
      align=PP_ALIGN.CENTER)
dummy(s, 0.9, 5.75, 8.0, 0.6, "제안서 표지 제목을 입력하세요", size=16, color=c.C["white"], bold=True)
dummy(s, 9.0, 5.9, 3.4, 0.6, "기관명을 입력하세요", size=13, color=c.C["gray_300"],
      align=PP_ALIGN.RIGHT)
E("BGP-002", "표지 배경B · 하단 네이비 밴드 + 상단 그라데이션", F1, 2,
  ["표지","배경","그라데이션","네이비패널"],
  {"style": "cover-bottom-band", "gradient": True},
  {"title": "사업명", "year": "2026", "part": "01"},
  ["color", "text", "gradient"], ["표지"])

# ── slide 3 · BGP-003 표지 배경C: 우하단 사선 기하 레이어(절제)
s = c.blank_slide(prs); c.id_caption(s, "BGP-003 · 표지 배경C(우하단 사선 레이어)")
full_anchor(s, "BGP-003", fill=c.C["gray_050"])
t1 = c.add_box(s, 7.6, 3.6, 5.73, 3.9, fill=c.C["navy_900"], line=None, shape=TRI)  # 우하단 삼각
t1.rotation = 180
t2 = c.add_box(s, 9.3, 4.9, 4.03, 2.6, fill=c.C["navy_800"], line=None, shape=TRI)  # 레이어2
t2.rotation = 180
t3 = c.add_box(s, 10.7, 5.9, 2.63, 1.6, fill=R("accent_primary"), line=None, shape=TRI)  # 블루 악센트
t3.rotation = 180
dummy(s, 0.9, 1.2, 6.0, 0.5, "2026", size=20, color=R("accent_primary"), bold=True)
dummy(s, 0.9, 2.6, 8.0, 1.2, "사업명", size=42, color=c.C["navy_900"], bold=True)
dummy(s, 0.9, 4.0, 7.0, 0.5, "제안서 표지 제목을 입력하세요", size=15, color=R("muted_text"))
E("BGP-003", "표지 배경C · 우하단 사선 기하 레이어", F1, 3,
  ["표지","배경","기하","네이비패널"],
  {"style": "cover-diagonal-layers", "gradient": False},
  {"title": "사업명", "year": "2026", "part": "01"},
  ["color", "text"], ["표지"])

# ── slide 4 · BGP-004 섹션 구분 배경A: 좌 컬러바 + 중앙 대형 섹션번호 자리
s = c.blank_slide(prs); c.id_caption(s, "BGP-004 · 섹션 구분A(좌 컬러바+대형 번호)")
full_anchor(s, "BGP-004", fill=c.C["gray_050"])
c.add_box(s, 0, 0, 0.55, SH, fill=c.C["navy_800"], line=None, shape=RECT)       # 좌 컬러바
c.add_box(s, 0.55, 0, 0.12, SH, fill=R("accent_primary"), line=None, shape=RECT)  # 블루 악센트
dummy(s, 1.4, 1.7, 6.0, 0.6, "PART 01", size=22, color=R("accent_primary"), bold=True)
dummy(s, 1.2, 2.3, 8.0, 2.6, "01", size=180, color=c.C["navy_900"], bold=True)
dummy(s, 1.4, 5.2, 9.0, 0.9, "제목을 입력하세요", size=32, color=c.C["navy_800"], bold=True)
E("BGP-004", "섹션 구분 배경A · 좌 컬러바 + 대형 섹션번호", F1, 4,
  ["섹션간지","배경","네이비패널","섹션번호"],
  {"style": "section-number-left-bar", "gradient": False},
  {"title": "제목을 입력하세요", "year": "2026", "part": "01"},
  ["color", "text"], ["섹션 구분"])

# ── slide 5 · BGP-005 섹션 구분 배경B: 상단 네이비 밴드 + 큰 제목 자리
s = c.blank_slide(prs); c.id_caption(s, "BGP-005 · 섹션 구분B(상단 밴드+큰 제목)")
full_anchor(s, "BGP-005", fill=c.C["white"])
c.add_box(s, 0, 0, SW, 2.7, fill=c.C["navy_800"], line=None, shape=RECT)        # 상단 네이비 밴드
c.add_box(s, 0, 2.7, SW, 0.1, fill=R("accent_primary"), line=None, shape=RECT)  # 블루 악센트 바
dummy(s, 0.9, 0.9, 6.0, 0.6, "PART 01", size=20, color=R("accent_point"), bold=True)
dummy(s, 0.9, 1.5, 11.0, 0.9, "제목을 입력하세요", size=34, color=c.C["white"], bold=True)
dummy(s, 0.9, 3.4, 11.5, 1.0, "본 섹션의 개요/부제를 입력하세요", size=18, color=R("muted_text"))
E("BGP-005", "섹션 구분 배경B · 상단 네이비 밴드 + 큰 제목", F1, 5,
  ["섹션간지","배경","네이비패널","헤더밴드"],
  {"style": "section-top-band", "gradient": False},
  {"title": "제목을 입력하세요", "year": "2026", "part": "01"},
  ["color", "text"], ["섹션 구분"])

c.save_deck(prs, F1)

# ══════════════════════════════════════════════════════════════════
# DECK 2: BGP_section-panel_v1.pptx  (간지/사이드/헤더/푸터×2/코너/라이트그레이)
# ══════════════════════════════════════════════════════════════════
F2 = "decks/10_backgrounds/BGP_section-panel_v1.pptx"
prs = c.new_deck()

# ── slide 1 · BGP-006 간지 배경(목차형): 좌 네이비 사이드바 + 우 리스트 자리
s = c.blank_slide(prs); c.id_caption(s, "BGP-006 · 간지 목차형(좌 사이드바+우 리스트)")
full_anchor(s, "BGP-006", fill=c.C["white"])
c.add_box(s, 0, 0, 4.3, SH, fill=c.C["navy_800"], line=None, shape=RECT)        # 좌 네이비 사이드바
c.add_box(s, 4.3, 0, 0.1, SH, fill=R("accent_primary"), line=None, shape=RECT)  # 블루 악센트
dummy(s, 0.6, 1.0, 3.4, 0.6, "PART 01", size=18, color=R("accent_point"), bold=True)
dummy(s, 0.6, 1.7, 3.4, 1.4, "목차", size=40, color=c.C["white"], bold=True)
dummy(s, 0.6, 6.6, 3.4, 0.5, "2026 · 사업명", size=13, color=c.C["gray_300"])
yy = 1.3
for i, t in enumerate(["01", "02", "03", "04"], 0):
    c.add_box(s, 4.9, yy, 0.7, 0.7, fill=c.C["gray_050"], line=c.C["gray_300"], line_w=0.75, shape=RECT)
    dummy(s, 4.9, yy, 0.7, 0.7, t, size=20, color=R("accent_primary"), bold=True, align=PP_ALIGN.CENTER)
    dummy(s, 5.8, yy, 6.8, 0.7, "제목을 입력하세요", size=18, color=c.C["navy_900"], bold=True)
    c.add_box(s, 5.8, yy + 0.78, 6.8, 0.02, fill=c.C["gray_300"], line=None, shape=RECT)
    yy += 1.28
E("BGP-006", "간지 배경 · 좌 네이비 사이드바 + 우 목차 리스트", F2, 1,
  ["섹션간지","배경","네이비패널","목차"],
  {"style": "toc-sidebar-left", "gradient": False},
  {"title": "목차", "year": "2026", "part": "01"},
  ["color", "text"], ["간지"])

# ── slide 2 · BGP-007 사이드 패널(좌측 세로 네이비, 본문 강조용)
s = c.blank_slide(prs); c.id_caption(s, "BGP-007 · 사이드 패널(좌 세로 네이비)")
full_anchor(s, "BGP-007", fill=c.C["white"])
c.add_box(s, 0, 0, 2.5, SH, fill=c.C["navy_900"], line=None, shape=RECT)        # 좌 세로 네이비 패널
c.add_box(s, 0, 0, 2.5, 0.5, fill=R("accent_primary"), line=None, shape=RECT)   # 상단 블루 악센트
dummy(s, 0.35, 0.9, 1.9, 0.5, "PART 01", size=14, color=R("accent_point"), bold=True)
dummy(s, 0.35, 1.5, 1.9, 2.0, "사업명", size=24, color=c.C["white"], bold=True,
      anchor=MSO_ANCHOR.TOP)
dummy(s, 0.35, 6.7, 1.9, 0.5, "01", size=16, color=c.C["gray_300"], bold=True)
dummy(s, 3.0, 0.8, 9.5, 0.7, "제목을 입력하세요", size=26, color=c.C["navy_900"], bold=True)
c.add_box(s, 3.0, 1.55, 2.0, 0.08, fill=R("accent_primary"), line=None, shape=RECT)
dummy(s, 3.0, 2.0, 9.6, 3.5, "본문 내용을 입력하세요.\n좌측 세로 네이비 패널이 페이지 정체성을 잡아주는\n본문 강조용 사이드 패널 배경입니다.",
      size=15, color=R("muted_text"), anchor=MSO_ANCHOR.TOP)
E("BGP-007", "사이드 패널 · 좌측 세로 네이비(본문 강조)", F2, 2,
  ["배경","네이비패널","사이드패널"],
  {"style": "side-panel-left", "gradient": False},
  {"title": "사업명", "year": "2026", "part": "01"},
  ["color", "text"], ["본문 강조", "사이드 패널"])

# ── slide 3 · BGP-008 헤더 밴드(상단 가로 네이비 + 악센트, 반복 사용)
s = c.blank_slide(prs); c.id_caption(s, "BGP-008 · 헤더 밴드(상단 가로 네이비)")
full_anchor(s, "BGP-008", fill=c.C["white"])
c.add_box(s, 0, 0, SW, 1.05, fill=c.C["navy_800"], line=None, shape=RECT)       # 상단 네이비 밴드
c.add_box(s, 0, 1.05, SW, 0.09, fill=R("accent_primary"), line=None, shape=RECT)  # 블루 악센트
c.add_box(s, 0.4, 0.32, 0.14, 0.42, fill=R("accent_point"), line=None, shape=RECT)  # 좌 포인트
dummy(s, 0.7, 0.2, 8.5, 0.65, "제목을 입력하세요", size=22, color=c.C["white"], bold=True)
dummy(s, 9.5, 0.2, 3.4, 0.65, "2026 · PART 01", size=14, color=c.C["gray_300"],
      align=PP_ALIGN.RIGHT)
dummy(s, 0.7, 1.7, 11.9, 4.0, "본문 콘텐츠 영역 — 반복 사용 헤더 밴드 배경입니다.",
      size=15, color=R("muted_text"), anchor=MSO_ANCHOR.TOP)
E("BGP-008", "헤더 밴드 · 상단 가로 네이비 + 블루 악센트(반복)", F2, 3,
  ["배경","네이비패널","헤더밴드","블루악센트"],
  {"style": "header-band-top", "gradient": False},
  {"title": "제목을 입력하세요", "year": "2026", "part": "01"},
  ["color", "text"], ["콘텐츠 헤더", "반복 사용"])

# ── slide 4 · BGP-009 + BGP-010 푸터 바 2종(한 슬라이드 공유)
s = c.blank_slide(prs); c.id_caption(s, "BGP-009/010 · 콘텐츠 하단 푸터 바 2종")
# 푸터A(네이비 solid 바) — 상단에 배치
fa = c.add_box(s, 0, 2.4, SW, 0.55, fill=c.C["navy_800"], line=None, shape=RECT)
c.name_asset(fa, "BGP-009")
c.add_box(s, 0, 2.4, 0.5, 0.55, fill=R("accent_primary"), line=None, shape=RECT)
dummy(s, 0.7, 2.4, 8.0, 0.55, "2026 · 사업명 · 기관명을 입력하세요", size=12, color=c.C["white"])
dummy(s, 11.8, 2.4, 1.2, 0.55, "01", size=13, color=c.C["gray_300"], bold=True, align=PP_ALIGN.RIGHT)
c.add_text(s, 0.6, 2.05, 4.0, 0.25, "BGP-009 · 푸터 바(네이비 solid)", size=8, bold=True,
           color=c.C["gray_500"], align=PP_ALIGN.LEFT)
# 푸터B(라인+블루 블록) — 하단에 배치
fb = c.add_box(s, 0, 5.0, SW, 0.5, fill=c.C["white"], line=None, shape=RECT)
c.name_asset(fb, "BGP-010")
c.add_box(s, 0, 5.0, SW, 0.03, fill=c.C["gray_300"], line=None, shape=RECT)     # 상단 구분선
c.add_box(s, 0, 5.0, 0.35, 0.5, fill=R("accent_primary"), line=None, shape=RECT)  # 좌 블루 블록
dummy(s, 0.6, 5.0, 8.0, 0.5, "사업명 · 기관명을 입력하세요", size=12, color=R("muted_text"))
dummy(s, 11.6, 5.0, 1.4, 0.5, "PART 01", size=12, color=R("accent_primary"), bold=True,
      align=PP_ALIGN.RIGHT)
c.add_text(s, 0.6, 4.65, 4.0, 0.25, "BGP-010 · 푸터 바(라인+블루 블록)", size=8, bold=True,
           color=c.C["gray_500"], align=PP_ALIGN.LEFT)
E("BGP-009", "콘텐츠 푸터 바 · 네이비 solid", F2, 4,
  ["배경","네이비패널","푸터"],
  {"style": "footer-navy-bar", "gradient": False},
  {"title": "사업명", "year": "2026", "part": "01"},
  ["color", "text"], ["콘텐츠 푸터", "페이지 표기"])
E("BGP-010", "콘텐츠 푸터 바 · 라인 + 블루 블록", F2, 4,
  ["배경","푸터","블루악센트"],
  {"style": "footer-line-accent", "gradient": False},
  {"title": "사업명", "year": "2026", "part": "01"},
  ["color", "text"], ["콘텐츠 푸터", "페이지 표기"])

# ── slide 5 · BGP-011 코너 장식(우상단 기하 삼각 레이어, 절제형)
s = c.blank_slide(prs); c.id_caption(s, "BGP-011 · 코너 장식(우상단 기하 삼각)")
full_anchor(s, "BGP-011", fill=c.C["white"])
c1 = c.add_box(s, 9.5, 0, 3.83, 2.6, fill=c.C["navy_900"], line=None, shape=TRI)   # 우상단 삼각
c1.rotation = 270
c2 = c.add_box(s, 10.9, 0, 2.43, 1.7, fill=R("accent_primary"), line=None, shape=TRI)  # 블루 악센트
c2.rotation = 270
dummy(s, 0.9, 0.9, 6.0, 0.5, "2026 · PART 01", size=15, color=R("accent_primary"), bold=True)
dummy(s, 0.9, 2.6, 9.0, 1.0, "제목을 입력하세요", size=34, color=c.C["navy_900"], bold=True)
dummy(s, 0.9, 3.7, 9.0, 0.6, "부제/개요를 입력하세요", size=16, color=R("muted_text"))
E("BGP-011", "코너 장식 · 우상단 기하 삼각 레이어(절제)", F2, 5,
  ["배경","기하","네이비패널","블루악센트"],
  {"style": "corner-geo-topright", "gradient": False},
  {"title": "제목을 입력하세요", "year": "2026", "part": "01"},
  ["color", "text"], ["코너 장식", "콘텐츠 배경"])

# ── slide 6 · BGP-012 라이트 그레이 콘텐츠 배경(F7F9FC + 미세 도형)
s = c.blank_slide(prs); c.id_caption(s, "BGP-012 · 라이트 그레이 콘텐츠 배경")
bg = full_anchor(s, "BGP-012", fill=c.C["gray_050"])                            # 앵커=라이트그레이 배경
c.add_box(s, 9.8, -1.2, 4.5, 4.5, fill=c.C["gray_100"], line=None, shape=OVAL)  # 미세 원(우상)
c.add_box(s, -1.4, 5.2, 4.0, 4.0, fill=c.C["gray_100"], line=None, shape=OVAL)  # 미세 원(좌하)
c.add_box(s, 0.9, 1.3, 0.12, 0.6, fill=R("accent_primary"), line=None, shape=RECT)  # 블루 포인트
dummy(s, 1.2, 1.3, 9.0, 0.65, "제목을 입력하세요", size=26, color=c.C["navy_900"], bold=True)
dummy(s, 1.2, 2.4, 11.0, 3.5, "본문 콘텐츠 영역 — 눈이 편한 라이트 그레이(F7F9FC) 콘텐츠 배경입니다.\n미세 도형으로 여백에 은은한 깊이를 더합니다.",
      size=15, color=R("muted_text"), anchor=MSO_ANCHOR.TOP)
E("BGP-012", "라이트 그레이 콘텐츠 배경 · F7F9FC + 미세 도형", F2, 6,
  ["배경","라이트","콘텐츠배경"],
  {"style": "content-lightgray", "gradient": False, "bg_hex": "F7F9FC"},
  {"title": "제목을 입력하세요", "year": "2026", "part": "01"},
  ["color", "text"], ["콘텐츠 배경", "섹션 배경"])

c.save_deck(prs, F2)

# ══════════════════════════════════════════════════════════════════
frag = c.write_fragment("BGP", entries)
print("SAVED:", F1, F2)
print("FRAGMENT:", frag)
print("ENTRIES:", len(entries))
