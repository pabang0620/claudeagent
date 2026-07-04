# -*- coding: utf-8 -*-
"""
09_headers (HDR) v2 변형팩 — HDR-017 ~ HDR-024
아젠다 행 세트 / 인용 블록 / 통계 콜아웃 밴드 / 구분선 2종 /
리본 배지 세트 / 탭 헤더 세트 / 스텝 라벨 / 인라인 KPI 헤더.
각 에셋은 생성 직후 c.group_asset(slide, shapes, ID)로 개별 그룹화(id_caption 제외).
페이지 이미지 금지 — 전부 네이티브 shape/textbox.
"""
import sys
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

R = c.role
RR = MSO_SHAPE.ROUNDED_RECTANGLE
RECT = MSO_SHAPE.RECTANGLE
OVAL = MSO_SHAPE.OVAL

entries = []

def E(asset_id, name, file_rel, slide_idx, tags, params, bindings, editable, rec):
    entries.append(c.entry(asset_id, "HDR", name, file_rel, slide_idx,
                           tags, params, bindings, editable, recommended_use=rec))

def gradient_bar(slide, x, y, w, h, c1, c2):
    """좌→우 그라데이션 얇은 바 (c1 → c2 페이드아웃)."""
    sp = c.add_box(slide, x, y, w, h, fill=c.C["white"], line=None, shape=RECT)
    sp.fill.gradient()
    gs = sp.fill.gradient_stops
    gs[0].color.rgb = c1; gs[0].position = 0.0
    gs[1].color.rgb = c2; gs[1].position = 1.0
    sp.fill.gradient_angle = 0.0
    return sp

# ─────────────────────────────────────────────────────────────
# 에셋 빌더 — 각 함수는 생성한 도형 리스트를 반환(그룹 대상)
# ─────────────────────────────────────────────────────────────
def build_agenda_rows(slide, x, y, items, accent, row_h=1.0, w=8.4):
    """아젠다 항목 행 세트: [번호원 + 제목 + 설명] 행 리스트."""
    shp = []
    for i, (num, title, desc) in enumerate(items):
        ry = y + i * row_h
        # 번호 원
        circ = c.add_box(slide, x, ry + 0.06, 0.62, 0.62, fill=accent, line=None, shape=OVAL)
        c.set_shape_text(circ, num, size=18, bold=True, color=R("header_text"),
                         align=PP_ALIGN.CENTER, font=c.FONT_H)
        shp.append(circ)
        # 제목
        t = c.add_text(slide, x + 0.82, ry, w - 0.82, 0.42, title, size=15, bold=True,
                       color=R("body_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.BOTTOM, font=c.FONT_H)
        shp.append(t)
        # 설명
        d = c.add_text(slide, x + 0.82, ry + 0.44, w - 0.82, 0.4, desc, size=11, bold=False,
                       color=R("muted_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP)
        shp.append(d)
        # 행 구분선(마지막 제외)
        if i < len(items) - 1:
            ln = c.add_box(slide, x + 0.82, ry + row_h - 0.06, w - 0.82, 0.012,
                           fill=c.C["gray_300"], line=None, shape=RECT)
            shp.append(ln)
    return shp

def build_quote_block(slide, x, y, quote, author, accent, w=6.6, h=1.9):
    """인용 블록: 패널 + 좌측 강조바 + 큰 따옴표 글리프 + 인용문 + 출처."""
    shp = []
    panel = c.add_box(slide, x, y, w, h, fill=c.C["gray_050"], line=c.C["gray_300"],
                      line_w=0.75, shape=RR)
    panel.adjustments[0] = 0.045
    shp.append(panel)
    bar = c.add_box(slide, x, y + 0.12, 0.10, h - 0.24, fill=accent, line=None, shape=RECT)
    shp.append(bar)
    # 큰 따옴표 글리프
    qm = c.add_text(slide, x + 0.24, y + 0.02, 1.0, 0.9, "“", size=54, bold=True,
                    color=accent, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=c.FONT_H)
    shp.append(qm)
    # 인용문
    q = c.add_text(slide, x + 0.95, y + 0.24, w - 1.25, h - 0.85, quote, size=15, bold=True,
                   color=R("body_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=c.FONT_H)
    shp.append(q)
    # 출처
    au = c.add_text(slide, x + 0.95, y + h - 0.5, w - 1.25, 0.36, "— " + author, size=11,
                    bold=False, color=R("muted_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP)
    shp.append(au)
    return shp

def build_stat_band(slide, x, y, number, unit, desc, fill_color, w=7.2, h=1.15):
    """통계 콜아웃 밴드: 가로 컬러 띠 + 큰 숫자 + 설명."""
    shp = []
    band = c.add_box(slide, x, y, w, h, fill=fill_color, line=None, shape=RR)
    band.adjustments[0] = 0.08
    shp.append(band)
    # 좌측 포인트 컬러 세로 강조
    pt = c.add_box(slide, x + 0.02, y + 0.02, 0.12, h - 0.04, fill=R("accent_point"),
                   line=None, shape=RECT)
    shp.append(pt)
    # 큰 숫자
    numbox = c.add_text(slide, x + 0.32, y, 2.7, h, number, size=44, bold=True,
                        color=R("header_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE, font=c.FONT_H)
    shp.append(numbox)
    # 단위
    ub = c.add_text(slide, x + 0.32, y + h - 0.42, 2.7, 0.34, unit, size=13, bold=True,
                    color=R("accent_point"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=c.FONT_H)
    shp.append(ub)
    # 설명
    db = c.add_text(slide, x + 3.1, y, w - 3.3, h, desc, size=14, bold=True,
                    color=R("header_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE, font=c.FONT_H)
    shp.append(db)
    return shp

def build_dividers(slide, x, y, w, accent):
    """구분선 변형 2종: 그라데이션 라인 + 도트 라인 (한 에셋)."""
    shp = []
    # 1) 그라데이션 라인
    grad = gradient_bar(slide, x, y, w, 0.06, accent, c.C["white"])
    shp.append(grad)
    # 중앙 다이아 마커
    dia = c.add_box(slide, x + w / 2 - 0.08, y - 0.05, 0.16, 0.16, fill=accent,
                    line=None, shape=MSO_SHAPE.DIAMOND)
    shp.append(dia)
    # 2) 도트 라인
    dy = y + 0.55
    n = 24
    gap = w / (n - 1)
    for i in range(n):
        dot = c.add_box(slide, x + i * gap - 0.035, dy, 0.07, 0.07, fill=c.C["gray_500"],
                        line=None, shape=OVAL)
        shp.append(dot)
    return shp

def build_ribbon_set(slide, x, y, items, w_each=1.55, h=0.56, gap=0.28):
    """리본 배지 세트: 우향 태그(펜타곤) 3종."""
    shp = []
    for i, (text, col) in enumerate(items):
        bx = x + i * (w_each + gap)
        tag = c.add_box(slide, bx, y, w_each, h, fill=col, line=None, shape=MSO_SHAPE.PENTAGON)
        c.set_shape_text(tag, text, size=13, bold=True, color=R("header_text"),
                         align=PP_ALIGN.CENTER, font=c.FONT_H)
        shp.append(tag)
    return shp

def build_tab_header(slide, x, y, tabs, active_idx, accent, tab_w=2.1, h=0.52, gap=0.12):
    """탭 헤더 세트: 활성 1 + 비활성 N (상단 라운드), 하단 베이스라인."""
    shp = []
    total_w = len(tabs) * tab_w + (len(tabs) - 1) * gap
    for i, txt in enumerate(tabs):
        tx = x + i * (tab_w + gap)
        active = (i == active_idx)
        fill = accent if active else c.C["gray_100"]
        tab = c.add_box(slide, tx, y, tab_w, h, fill=fill,
                        line=None if active else c.C["gray_300"], line_w=0.75,
                        shape=MSO_SHAPE.ROUND_2_SAME_RECTANGLE)
        tab.adjustments[0] = 0.28
        c.set_shape_text(tab, txt, size=12.5, bold=active, color=R("header_text") if active else R("muted_text"),
                         align=PP_ALIGN.CENTER, font=c.FONT_H)
        shp.append(tab)
    base = c.add_box(slide, x, y + h, total_w, 0.05, fill=accent, line=None, shape=RECT)
    shp.append(base)
    return shp

def build_step_label(slide, x, y, step_no, kicker, title, accent, w=5.4):
    """스텝 라벨: STEP 번호 원형 + STEP NN 소캡션 + 제목."""
    shp = []
    circ = c.add_box(slide, x, y, 0.86, 0.86, fill=accent, line=None, shape=OVAL)
    c.set_shape_text(circ, step_no, size=26, bold=True, color=R("header_text"),
                     align=PP_ALIGN.CENTER, font=c.FONT_H)
    shp.append(circ)
    k = c.add_text(slide, x + 1.06, y + 0.02, w - 1.06, 0.32, kicker, size=11, bold=True,
                   color=accent, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.BOTTOM, font=c.FONT_H)
    shp.append(k)
    t = c.add_text(slide, x + 1.06, y + 0.36, w - 1.06, 0.46, title, size=16, bold=True,
                   color=R("body_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=c.FONT_H)
    shp.append(t)
    return shp

def build_inline_kpi_header(slide, x, y, title, metric, metric_label, accent, w=8.6, h=0.9):
    """인라인 KPI 헤더: 좌측 제목(강조 밑줄) + 우측 지표(숫자+라벨)."""
    shp = []
    # 좌측 제목
    t = c.add_text(slide, x, y, w * 0.58, h, title, size=17, bold=True,
                   color=R("body_text"), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE, font=c.FONT_H)
    shp.append(t)
    ul = c.add_box(slide, x + 0.02, y + h - 0.14, 2.2, 0.06, fill=accent, line=None, shape=RECT)
    shp.append(ul)
    # 우측 지표 값
    mx = x + w * 0.58
    mval = c.add_text(slide, mx, y - 0.02, w * 0.42, 0.58, metric, size=30, bold=True,
                      color=accent, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.BOTTOM, font=c.FONT_H)
    shp.append(mval)
    mlab = c.add_text(slide, mx, y + 0.56, w * 0.42, 0.3, metric_label, size=11, bold=False,
                      color=R("muted_text"), align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.TOP)
    shp.append(mlab)
    return shp

# ─────────────────────────────────────────────────────────────
# DECK 1: HDR_agenda-quote_v2  (아젠다 행 / 인용 블록)
# ─────────────────────────────────────────────────────────────
F1 = "decks/09_headers/HDR_agenda-quote_v2.pptx"
prs = c.new_deck()

s = c.blank_slide(prs); c.id_caption(s, "HDR-017 · 아젠다 항목 행 세트")
shp = build_agenda_rows(s, 1.2, 1.3, [
    ("01", "사업 추진 배경 및 필요성", "글로벌 콘텐츠 시장 환경 변화와 진출 기회 분석"),
    ("02", "핵심 추진 전략 및 실행 방안", "권역별 현지화·배급 파트너십 기반 단계별 실행"),
    ("03", "기대효과 및 성과 활용 계획", "신규 해외 매출 파이프라인 확보와 IP 가치 제고"),
], R("accent_primary"))
c.group_asset(s, shp, "HDR-017")
E("HDR-017", "아젠다 항목 행 세트 (번호+제목+설명)", F1, 1,
  ["아젠다","목차","행세트","번호원","리스트"],
  {"accent":"blue_500","count":3,"row_h_in":1.0},
  {"items":[["01","사업 추진 배경 및 필요성","글로벌 콘텐츠 시장 환경..."],
            ["02","핵심 추진 전략 및 실행 방안","권역별 현지화·배급..."],
            ["03","기대효과 및 성과 활용 계획","신규 해외 매출..."]]},
  ["text","color"], ["아젠다","목차 본문","항목 나열"])

s = c.blank_slide(prs); c.id_caption(s, "HDR-018 · 인용 블록")
shp = build_quote_block(s, 1.2, 1.6,
    "현지 시청자의 문화적 맥락을 재해석한 콘텐츠만이\n글로벌 OTT에서 지속 가능한 경쟁력을 갖는다.",
    "한국콘텐츠진흥원, 2025 해외 콘텐츠시장 분석보고서", R("sub_header"))
c.group_asset(s, shp, "HDR-018")
E("HDR-018", "인용 블록 (따옴표+문구+출처)", F1, 2,
  ["인용","쿼트","따옴표","블록","강조"],
  {"accent":"purple_600","w_in":6.6,"h_in":1.9},
  {"quote":"현지 시청자의 문화적 맥락을...","author":"한국콘텐츠진흥원, 2025..."},
  ["text","color"], ["인용","전문가 코멘트","핵심 문구 강조"])

c.save_deck(prs, F1)

# ─────────────────────────────────────────────────────────────
# DECK 2: HDR_stat-divider_v2  (통계 밴드 / 구분선 2종)
# ─────────────────────────────────────────────────────────────
F2 = "decks/09_headers/HDR_stat-divider_v2.pptx"
prs = c.new_deck()

s = c.blank_slide(prs); c.id_caption(s, "HDR-019 · 통계 콜아웃 밴드")
shp = build_stat_band(s, 1.2, 1.6, "127%", "전년 대비", "해외 콘텐츠 수출액 성장률", R("header_fill"))
c.group_asset(s, shp, "HDR-019")
E("HDR-019", "통계 콜아웃 밴드 (가로 띠+큰 숫자)", F2, 1,
  ["통계","콜아웃","밴드","지표","강조띠"],
  {"fill":"navy_800","w_in":7.2,"h_in":1.15},
  {"number":"127%","unit":"전년 대비","desc":"해외 콘텐츠 수출액 성장률"},
  ["text","color"], ["핵심 지표","성과 강조","수치 헤드라인"])

s = c.blank_slide(prs); c.id_caption(s, "HDR-020 · 구분선 2종 (그라데이션/도트)")
shp = build_dividers(s, 1.2, 2.4, 8.8, R("accent_primary"))
c.group_asset(s, shp, "HDR-020")
E("HDR-020", "구분선 변형 2종 (그라데이션 라인+도트 라인)", F2, 2,
  ["구분선","디바이더","그라데이션","도트","세퍼레이터"],
  {"accent":"blue_500","w_in":8.8,"variants":["gradient","dot"]},
  {},
  ["color","width"], ["섹션 구분","단락 구분","시각 분리"])

c.save_deck(prs, F2)

# ─────────────────────────────────────────────────────────────
# DECK 3: HDR_ribbon-tab_v2  (리본 배지 세트 / 탭 헤더 세트)
# ─────────────────────────────────────────────────────────────
F3 = "decks/09_headers/HDR_ribbon-tab_v2.pptx"
prs = c.new_deck()

s = c.blank_slide(prs); c.id_caption(s, "HDR-021 · 리본 배지 세트 (핵심/필수/신규)")
shp = build_ribbon_set(s, 1.2, 2.0, [
    ("핵심", R("header_fill")),
    ("필수", R("warn")),
    ("신규", R("accent_point")),
])
c.group_asset(s, shp, "HDR-021")
E("HDR-021", "리본 배지 세트 (핵심/필수/신규)", F3, 1,
  ["배지","리본","태그","핵심","필수","신규","세트"],
  {"count":3,"w_each_in":1.55,"h_in":0.56},
  {"items":[["핵심","navy_800"],["필수","red_500"],["신규","cyan_500"]]},
  ["text","color"], ["우선순위 표시","상태 라벨","분류 태그"])

s = c.blank_slide(prs); c.id_caption(s, "HDR-022 · 탭 헤더 세트 (활성/비활성)")
shp = build_tab_header(s, 1.2, 2.0, ["추진 전략", "추진 체계", "기대효과"], 0, R("header_fill"))
c.group_asset(s, shp, "HDR-022")
E("HDR-022", "탭 헤더 세트 (활성/비활성)", F3, 2,
  ["탭","헤더","네비","활성","비활성","세트"],
  {"accent":"navy_800","count":3,"active_idx":0,"tab_w_in":2.1},
  {"tabs":["추진 전략","추진 체계","기대효과"],"active":"추진 전략"},
  ["text","color"], ["탭 네비게이션","카테고리 전환","섹션 헤더"])

c.save_deck(prs, F3)

# ─────────────────────────────────────────────────────────────
# DECK 4: HDR_step-kpi_v2  (스텝 라벨 / 인라인 KPI 헤더)
# ─────────────────────────────────────────────────────────────
F4 = "decks/09_headers/HDR_step-kpi_v2.pptx"
prs = c.new_deck()

s = c.blank_slide(prs); c.id_caption(s, "HDR-023 · 스텝 라벨 (STEP 01)")
shp = build_step_label(s, 1.2, 1.8, "01", "STEP 01", "시장 조사 및 현황 진단", R("accent_secondary"))
c.group_asset(s, shp, "HDR-023")
E("HDR-023", "스텝 라벨 (STEP 01 원형+텍스트)", F4, 1,
  ["스텝","단계","STEP","원형","라벨"],
  {"accent":"teal_500","w_in":5.4},
  {"step_no":"01","kicker":"STEP 01","title":"시장 조사 및 현황 진단"},
  ["text","color"], ["단계 표시","프로세스 라벨","순서 헤더"])

s = c.blank_slide(prs); c.id_caption(s, "HDR-024 · 인라인 KPI 헤더")
shp = build_inline_kpi_header(s, 1.2, 2.0, "해외사업 성과 요약", "84.2억 원", "누적 수출 매출", R("accent_primary"))
c.group_asset(s, shp, "HDR-024")
E("HDR-024", "인라인 KPI 헤더 (제목+우측 지표)", F4, 2,
  ["KPI","헤더","인라인","지표","제목"],
  {"accent":"blue_500","w_in":8.6,"h_in":0.9},
  {"title":"해외사업 성과 요약","metric":"84.2억 원","metric_label":"누적 수출 매출"},
  ["text","color"], ["섹션 헤더","성과 헤더","지표 병기 제목"])

c.save_deck(prs, F4)

# ─────────────────────────────────────────────────────────────
frag = c.write_fragment("HDR_v2", entries)
print("SAVED:", F1, F2, F3, F4)
print("FRAGMENT:", frag)
print("ENTRIES:", len(entries))
for e in entries:
    print(" ", e["id"], e["name"])
