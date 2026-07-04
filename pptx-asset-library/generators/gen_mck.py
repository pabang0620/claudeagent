# -*- coding: utf-8 -*-
"""MCK 카테고리(목업/디바이스 프레임) 에셋 생성 — MCK-001~MCK-010.

- 네이티브 도형만 사용 (외부 이미지·<p:pic> 금지).
- 프레임은 그레이/네이비 테두리 + 흰 화면.
- 각 프레임 화면 안에 "화면 삽입 영역(스크린샷 삽입)" placeholder 흰 사각형 배치 → 사용자가 이미지/표를 얹을 자리.
- 대표 프레임 도형에 c.name_asset("MCK-0NN"), 좌상단 c.id_caption.
- 색은 c.role/c.C 만 사용.
"""
import sys
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

R = c.role
CC = c.C


# ---------- 공용 헬퍼 ----------
def title_block(slide, text, sub=None):
    c.add_text(slide, 0.55, 0.5, 12.2, 0.5, text, size=18, bold=True,
               color=R("header_fill"), align=PP_ALIGN.LEFT, font=c.FONT_H)
    if sub:
        c.add_text(slide, 0.55, 1.0, 12.2, 0.32, sub, size=11,
                   color=R("muted_text"), align=PP_ALIGN.LEFT)


def set_round(sp, r):
    try:
        sp.adjustments[0] = r
    except Exception:
        pass
    return sp


def insert_area(slide, x, y, w, h, label="화면 삽입 영역", note="스크린샷 삽입", size=12):
    """흰 화면 + 옅은 '삽입 영역' 안내(치환 대상). 흰 화면 도형을 반환."""
    scr = c.add_box(slide, x, y, w, h, fill=CC["white"], line=R("border"), line_w=1.0)
    pad = min(0.16, w * 0.045, h * 0.06)
    ph = c.add_box(slide, x + pad, y + pad, w - 2 * pad, h - 2 * pad,
                   fill=CC["gray_050"], line=R("accent_primary"), line_w=1.0)
    c.set_shape_text(ph, "%s\n(%s)" % (label, note), size=size, bold=False,
                     color=R("muted_text"))
    return scr


def dot(slide, x, y, d, fill):
    return c.add_box(slide, x, y, d, d, fill=fill, line=None, shape=MSO_SHAPE.OVAL)


# =========================================================
# MCK-001  브라우저 창 프레임 (탭바 + 주소창 + 화면영역)
# =========================================================
def browser(slide, asset_id):
    title_block(slide, "브라우저 창 목업",
                "상단 탭바 + 주소 표시줄 + 화면 영역 (웹 화면 스크린샷 삽입)")
    x0, y0, w, h = 1.25, 1.55, 10.83, 5.4
    frame = c.add_box(slide, x0, y0, w, h, fill=CC["white"], line=CC["gray_500"],
                      line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(frame, 0.03)
    c.name_asset(frame, asset_id)
    # 탭바
    tb_h = 0.52
    c.add_box(slide, x0, y0, w, tb_h, fill=CC["navy_800"], line=None)
    for i, col in enumerate([R("warn"), R("accent_point"), R("accent_secondary")]):
        dot(slide, x0 + 0.28 + i * 0.28, y0 + tb_h / 2 - 0.09, 0.18, col)
    tab = c.add_box(slide, x0 + 1.25, y0 + 0.1, 2.3, tb_h - 0.1, fill=CC["gray_050"],
                    line=None, shape=MSO_SHAPE.ROUND_2_SAME_RECTANGLE)
    c.set_shape_text(tab, "탭 · 화면 제목", size=10, bold=False, color=R("body_text"))
    # 주소창
    ab_y = y0 + tb_h + 0.1
    ab = c.add_box(slide, x0 + 0.25, ab_y, w - 0.5, 0.42, fill=CC["white"],
                   line=R("border"), line_w=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(ab, "https://  주소 표시줄", size=10, bold=False,
                     color=R("muted_text"), align=PP_ALIGN.LEFT)
    # 화면영역
    sc_y = ab_y + 0.55
    insert_area(slide, x0 + 0.18, sc_y, w - 0.36, y0 + h - sc_y - 0.18,
                label="브라우저 화면 삽입 영역", size=13)


# =========================================================
# MCK-002  노트북 프레임 (화면 + 하단 베이스 사다리꼴)
# =========================================================
def notebook(slide, asset_id):
    title_block(slide, "노트북 목업",
                "화면(베젤) + 하단 베이스 사다리꼴 (제품·서비스 화면 삽입)")
    sx, sy, sw, sh = 2.75, 1.55, 7.8, 4.3
    bezel = c.add_box(slide, sx, sy, sw, sh, fill=CC["navy_900"], line=CC["gray_700"],
                      line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(bezel, 0.03)
    c.name_asset(bezel, asset_id)
    pad = 0.2
    insert_area(slide, sx + pad, sy + pad, sw - 2 * pad, sh - 2 * pad,
                label="노트북 화면 삽입 영역", size=13)
    # 하단 베이스(사다리꼴, 위가 좁음 → 뒤집어 넓은 아래)
    base_w = sw + 1.7
    base_x = sx + sw / 2 - base_w / 2
    base = c.add_box(slide, base_x, sy + sh, base_w, 0.5, fill=CC["gray_300"],
                     line=CC["gray_500"], line_w=1.0, shape=MSO_SHAPE.TRAPEZOID)
    set_round(base, 0.06)
    # 트랙패드 홈
    c.add_box(slide, sx + sw / 2 - 0.7, sy + sh + 0.08, 1.4, 0.14,
              fill=CC["gray_500"], line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)


# =========================================================
# MCK-003  데스크톱 모니터 프레임 (화면 + 스탠드)
# =========================================================
def desktop(slide, asset_id):
    title_block(slide, "데스크톱 모니터 목업",
                "모니터 화면(베젤) + 넥 + 스탠드 (관리자·대시보드 화면 삽입)")
    mx, my, mw, mh = 2.6, 1.5, 8.1, 4.35
    bezel = c.add_box(slide, mx, my, mw, mh, fill=CC["navy_900"], line=CC["gray_700"],
                      line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(bezel, 0.03)
    c.name_asset(bezel, asset_id)
    pad = 0.22
    insert_area(slide, mx + pad, my + pad, mw - 2 * pad, mh - 2 * pad,
                label="모니터 화면 삽입 영역", size=13)
    # 넥
    neck_w = 0.7
    c.add_box(slide, mx + mw / 2 - neck_w / 2, my + mh, neck_w, 0.55,
              fill=CC["gray_500"], line=None)
    # 스탠드(사다리꼴)
    st_w = 3.2
    c.add_box(slide, mx + mw / 2 - st_w / 2, my + mh + 0.5, st_w, 0.32,
              fill=CC["gray_300"], line=CC["gray_500"], line_w=1.0,
              shape=MSO_SHAPE.TRAPEZOID)


# =========================================================
# MCK-004  모바일 폰 프레임 (라운드 + 노치 + 화면)
# =========================================================
def mobile(slide, asset_id):
    title_block(slide, "모바일 폰 목업",
                "라운드 바디 + 노치 + 세로 화면 (모바일 앱·반응형 화면 삽입)")
    bx, by, bw, bh = 5.55, 1.5, 2.55, 5.4
    body = c.add_box(slide, bx, by, bw, bh, fill=CC["navy_900"], line=CC["gray_700"],
                     line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(body, 0.14)
    c.name_asset(body, asset_id)
    pad = 0.14
    insert_area(slide, bx + pad, by + pad, bw - 2 * pad, bh - 2 * pad,
                label="모바일 화면\n삽입 영역", note="스크린샷 삽입", size=10)
    # 노치
    nw = 1.0
    c.add_box(slide, bx + bw / 2 - nw / 2, by + pad, nw, 0.22, fill=CC["navy_900"],
              line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)


# =========================================================
# MCK-005  태블릿 프레임 (화면 + 카메라/홈 인디케이터)
# =========================================================
def tablet(slide, asset_id):
    title_block(slide, "태블릿 목업",
                "라운드 바디 + 화면 + 카메라 도트 (4:3 화면·산출물 미리보기 삽입)")
    bw, bh = 6.6, 5.0
    bx = (13.333 - bw) / 2
    by = 1.65
    body = c.add_box(slide, bx, by, bw, bh, fill=CC["navy_900"], line=CC["gray_700"],
                     line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(body, 0.05)
    c.name_asset(body, asset_id)
    pad = 0.32
    insert_area(slide, bx + pad, by + pad, bw - 2 * pad, bh - 2 * pad,
                label="태블릿 화면 삽입 영역", size=13)
    # 카메라 도트(상단 중앙)
    dot(slide, bx + bw / 2 - 0.05, by + 0.12, 0.1, CC["gray_500"])
    # 홈 인디케이터(하단 중앙)
    dot(slide, bx + bw / 2 - 0.11, by + bh - 0.24, 0.22, CC["gray_700"])


# =========================================================
# MCK-006  대시보드 카드 프레임 (헤더바 + 위젯 자리 그리드)
# =========================================================
def dashboard(slide, asset_id):
    title_block(slide, "대시보드 카드 목업",
                "헤더바 + 위젯 자리 그리드 (KPI·차트 위젯 스크린샷 삽입)")
    x0, y0, w, h = 1.25, 1.55, 10.83, 5.35
    frame = c.add_box(slide, x0, y0, w, h, fill=CC["gray_050"], line=CC["gray_500"],
                      line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(frame, 0.02)
    c.name_asset(frame, asset_id)
    # 헤더바
    hd = c.add_box(slide, x0, y0, w, 0.62, fill=CC["navy_800"], line=None)
    c.set_shape_text(hd, "대시보드", size=13, bold=True, color=R("header_text"),
                     align=PP_ALIGN.LEFT)
    for i, col in enumerate([R("accent_point"), R("accent_secondary")]):
        dot(slide, x0 + w - 0.4 - i * 0.32, y0 + 0.31 - 0.09, 0.18, col)
    # KPI 3열
    gy = y0 + 0.85
    m = 0.28
    kw = (w - 2 * m - 2 * 0.25) / 3
    kh = 1.15
    for i in range(3):
        insert_area(slide, x0 + m + i * (kw + 0.25), gy, kw, kh,
                    label="KPI 위젯", note="삽입", size=10)
    # 하단 2 위젯(넓은 차트 자리)
    wy = gy + kh + 0.25
    ww = (w - 2 * m - 0.25) / 2
    wh = y0 + h - wy - 0.28
    for i in range(2):
        insert_area(slide, x0 + m + i * (ww + 0.25), wy, ww, wh,
                    label="차트·표 위젯", note="스크린샷 삽입", size=11)


# =========================================================
# MCK-007  멀티 윈도우 (창 2개 겹침)
# =========================================================
def multiwindow(slide, asset_id):
    title_block(slide, "멀티 윈도우 목업",
                "창 2개 겹침 (다중 화면·비교 스크린샷 삽입)")

    def win(x, y, w, h, main=False):
        fr = c.add_box(slide, x, y, w, h, fill=CC["white"], line=CC["gray_500"],
                       line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        set_round(fr, 0.03)
        c.add_box(slide, x, y, w, 0.42, fill=CC["navy_800"], line=None)
        for i, col in enumerate([R("warn"), R("accent_point"), R("accent_secondary")]):
            dot(slide, x + 0.22 + i * 0.24, y + 0.21 - 0.075, 0.15, col)
        insert_area(slide, x + 0.16, y + 0.52, w - 0.32, h - 0.68,
                    label=("주 화면 삽입 영역" if main else "보조 화면 삽입"),
                    note="스크린샷 삽입", size=(13 if main else 11))
        return fr
    # 뒤 창
    win(1.9, 1.75, 8.4, 4.5)
    # 앞 창 (대표)
    front = win(3.35, 2.75, 8.4, 4.3, main=True)
    c.name_asset(front, asset_id)


# =========================================================
# MCK-008  지도/맵 뷰 프레임 (테두리 + 핀 자리)
# =========================================================
def mapview(slide, asset_id):
    title_block(slide, "지도·맵 뷰 목업",
                "지도 영역 + 검색바 + 핀 자리 (지도·위치 화면 스크린샷 삽입)")
    x0, y0, w, h = 1.25, 1.55, 10.83, 5.4
    frame = c.add_box(slide, x0, y0, w, h, fill=CC["white"], line=CC["gray_500"],
                      line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(frame, 0.02)
    c.name_asset(frame, asset_id)
    # 지도 영역(삽입)
    insert_area(slide, x0 + 0.18, y0 + 0.18, w - 0.36, h - 0.36,
                label="지도 화면 삽입 영역", note="맵 스크린샷 삽입", size=13)
    # 검색바(좌상단 오버레이)
    sb = c.add_box(slide, x0 + 0.45, y0 + 0.45, 3.6, 0.45, fill=CC["white"],
                   line=R("border"), line_w=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(sb, "장소 검색", size=10, bold=False, color=R("muted_text"),
                     align=PP_ALIGN.LEFT)
    # 핀 자리 (마커)
    pins = [(x0 + 3.6, y0 + 2.1, R("warn"), "1"),
            (x0 + 6.4, y0 + 3.4, R("accent_primary"), "2"),
            (x0 + 8.7, y0 + 1.9, R("accent_secondary"), "3"),
            (x0 + 5.2, y0 + 4.4, R("sub_header"), "4")]
    for px, py, col, lab in pins:
        # 핀 꼬리(하향 삼각) + 원형 헤드로 마커 구성
        c.add_box(slide, px + 0.13, py + 0.28, 0.24, 0.34, fill=col, line=None,
                  shape=MSO_SHAPE.ISOSCELES_TRIANGLE).rotation = 180
        head = c.add_box(slide, px, py, 0.5, 0.5, fill=col, line=CC["white"],
                         line_w=1.5, shape=MSO_SHAPE.OVAL)
        c.set_shape_text(head, lab, size=11, bold=True, color=CC["white"])


# =========================================================
# MCK-009  폴더/파일 뷰 프레임
# =========================================================
def fileview(slide, asset_id):
    title_block(slide, "폴더·파일 뷰 목업",
                "탐색기 창 + 좌측 폴더 트리 + 우측 파일 그리드 (산출물 목록 삽입)")
    x0, y0, w, h = 1.25, 1.55, 10.83, 5.35
    frame = c.add_box(slide, x0, y0, w, h, fill=CC["white"], line=CC["gray_500"],
                      line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(frame, 0.02)
    c.name_asset(frame, asset_id)
    # 상단 바
    hd = c.add_box(slide, x0, y0, w, 0.5, fill=CC["navy_800"], line=None)
    c.set_shape_text(hd, "파일 탐색기 · 산출물", size=12, bold=True,
                     color=R("header_text"), align=PP_ALIGN.LEFT)
    # 좌측 폴더 트리
    sb_w = 2.7
    sy = y0 + 0.5
    c.add_box(slide, x0, sy, sb_w, y0 + h - sy, fill=CC["gray_050"], line=R("border"),
              line_w=1.0)
    folders = ["\U0001F4C1 제안서", "\U0001F4C1 설계 산출물", "\U0001F4C1 시험 결과", "\U0001F4C1 매뉴얼"]
    for i, f in enumerate(folders):
        row = c.add_box(slide, x0 + 0.12, sy + 0.2 + i * 0.62, sb_w - 0.24, 0.5,
                        fill=CC["white"], line=R("border"), line_w=0.75,
                        shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(row, f, size=10, bold=False, color=R("body_text"),
                         align=PP_ALIGN.LEFT)
    # 우측 파일 그리드(삽입)
    gx = x0 + sb_w + 0.2
    gw = x0 + w - gx - 0.2
    insert_area(slide, gx, sy + 0.2, gw, (y0 + h) - (sy + 0.2) - 0.2,
                label="파일 목록 삽입 영역", note="파일 그리드 스크린샷 삽입", size=12)


# =========================================================
# MCK-010  프레젠테이션 화면 프레임 (16:9 스크린 + 하단 캡션바)
# =========================================================
def presentation(slide, asset_id):
    title_block(slide, "프레젠테이션 화면 목업",
                "16:9 스크린 + 하단 캡션바 (발표 슬라이드·산출물 미리보기 삽입)")
    sw = 9.4
    sh = sw * 9 / 16  # 16:9
    sx = (13.333 - sw) / 2
    sy = 1.7
    frame = c.add_box(slide, sx - 0.12, sy - 0.12, sw + 0.24, sh + 0.24,
                      fill=CC["navy_900"], line=CC["gray_700"], line_w=1.5,
                      shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    set_round(frame, 0.02)
    c.name_asset(frame, asset_id)
    insert_area(slide, sx, sy, sw, sh, label="발표 화면 삽입 영역 (16:9)",
                note="슬라이드 스크린샷 삽입", size=13)
    # 하단 캡션바
    cap = c.add_box(slide, sx, sy + sh + 0.2, sw, 0.55, fill=CC["navy_800"],
                    line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(cap, "발표 제목 · 캡션 (치환)", size=12, bold=True,
                     color=R("header_text"))


# =========================================================
# 빌드
# =========================================================
entries = []


def E(*a, **k):
    entries.append(c.entry(*a, **k))


F1 = "decks/12_mockups/MCK_device-frames_v1.pptx"
F2 = "decks/12_mockups/MCK_ui-frames_v1.pptx"

BASE_TAGS = ["목업", "화면삽입", "프레임"]
EDITABLE = ["screen-image", "frame-color", "caption"]
REC = ["화면 예시", "시스템 UI 소개", "산출물 미리보기"]

# ---- FILE 1: 디바이스류 (노트북/데스크톱/모바일/태블릿/프레젠테이션) ----
p1 = c.new_deck()
s = c.blank_slide(p1); c.id_caption(s, "MCK-002"); notebook(s, "MCK-002")
s = c.blank_slide(p1); c.id_caption(s, "MCK-003"); desktop(s, "MCK-003")
s = c.blank_slide(p1); c.id_caption(s, "MCK-004"); mobile(s, "MCK-004")
s = c.blank_slide(p1); c.id_caption(s, "MCK-005"); tablet(s, "MCK-005")
s = c.blank_slide(p1); c.id_caption(s, "MCK-010"); presentation(s, "MCK-010")
f1 = c.save_deck(p1, F1)

# ---- FILE 2: UI 프레임류 (브라우저/대시보드/멀티윈도우/맵/폴더) ----
p2 = c.new_deck()
s = c.blank_slide(p2); c.id_caption(s, "MCK-001"); browser(s, "MCK-001")
s = c.blank_slide(p2); c.id_caption(s, "MCK-006"); dashboard(s, "MCK-006")
s = c.blank_slide(p2); c.id_caption(s, "MCK-007"); multiwindow(s, "MCK-007")
s = c.blank_slide(p2); c.id_caption(s, "MCK-008"); mapview(s, "MCK-008")
s = c.blank_slide(p2); c.id_caption(s, "MCK-009"); fileview(s, "MCK-009")
f2 = c.save_deck(p2, F2)

# =========================================================
# 매니페스트 엔트리 (파일 내 슬라이드 순서에 맞춰 slide 인덱스 부여)
# =========================================================
E("MCK-001", "MCK", "브라우저 창 목업", F2, 1,
  BASE_TAGS + ["브라우저", "웹", "탭바", "주소창"],
  {"device": "browser", "screen_ratio": "16:9"},
  {"screen": "이미지 자리", "caption": "브라우저 화면 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-002", "MCK", "노트북 목업", F1, 1,
  BASE_TAGS + ["디바이스", "노트북", "랩탑"],
  {"device": "laptop", "screen_ratio": "16:10"},
  {"screen": "이미지 자리", "caption": "노트북 화면 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-003", "MCK", "데스크톱 모니터 목업", F1, 2,
  BASE_TAGS + ["디바이스", "모니터", "데스크톱"],
  {"device": "desktop", "screen_ratio": "16:9"},
  {"screen": "이미지 자리", "caption": "모니터 화면 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-004", "MCK", "모바일 폰 목업", F1, 3,
  BASE_TAGS + ["디바이스", "모바일", "폰", "반응형"],
  {"device": "mobile", "screen_ratio": "9:19.5"},
  {"screen": "이미지 자리", "caption": "모바일 화면 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-005", "MCK", "태블릿 목업", F1, 4,
  BASE_TAGS + ["디바이스", "태블릿", "패드"],
  {"device": "tablet", "screen_ratio": "4:3"},
  {"screen": "이미지 자리", "caption": "태블릿 화면 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-006", "MCK", "대시보드 카드 목업", F2, 2,
  BASE_TAGS + ["대시보드", "위젯", "카드", "KPI"],
  {"device": "dashboard", "screen_ratio": "16:9"},
  {"screen": "이미지 자리", "caption": "위젯·차트 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-007", "MCK", "멀티 윈도우 목업", F2, 3,
  BASE_TAGS + ["멀티윈도우", "창겹침", "브라우저", "비교"],
  {"device": "multi-window", "screen_ratio": "16:9"},
  {"screen": "이미지 자리", "caption": "다중 화면 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-008", "MCK", "지도·맵 뷰 목업", F2, 4,
  BASE_TAGS + ["지도", "맵", "핀", "위치"],
  {"device": "map", "screen_ratio": "4:3"},
  {"screen": "이미지 자리", "caption": "지도 화면 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-009", "MCK", "폴더·파일 뷰 목업", F2, 5,
  BASE_TAGS + ["폴더", "파일", "탐색기", "산출물"],
  {"device": "folder", "screen_ratio": "16:9"},
  {"screen": "이미지 자리", "caption": "파일 목록 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

E("MCK-010", "MCK", "프레젠테이션 화면 목업", F1, 5,
  BASE_TAGS + ["프레젠테이션", "발표", "스크린", "16:9"],
  {"device": "presentation", "screen_ratio": "16:9"},
  {"screen": "이미지 자리", "caption": "발표 슬라이드 스크린샷 삽입"},
  EDITABLE, recommended_use=REC)

frag = c.write_fragment("MCK", entries)

print("FILE1", f1)
print("FILE2", f2)
print("FRAG", frag)
print("ENTRIES", len(entries))
