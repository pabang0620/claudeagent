# -*- coding: utf-8 -*-
"""TML_gov — 정부보고서(gov) 트랙 대형 간트/스케줄 그리드 2종. TML-201 ~ TML-202.

캔버스: gov 비율 11.93×8.50in (EMU 10905360×7772400) — prs.slide_width/height 직접 override.
색·폰트: design-tokens.json 최상위 gov_theme(color/role/font/size_pt) 만 참조. 매직 헥스 금지.
shape 기반(도형+라인) 그리드 — 네이티브 차트/표 금지, TML 카테고리 표준(BUILD_SPEC 자체생성 원칙)을 따름.
다중 도형이므로 c.group_asset(...) 으로 asset:<ID> 그룹 앵커 1개로 묶는다.

구조 정밀화 결과 (2026-07-09 정답지 실측 재파싱 — lxml로 a:tbl gridCol/gridSpan/rowSpan/hMerge/
vMerge와 a:t 원문을 직접 파싱해 확정, 근사치 아님):
  정답지 원본: "콘텐츠 해외진출 기업정보 구축 기획(1단계) 위탁용역 실행계획서(28주차)_20260708 (1).pptx"
  (사본 보관: reference/_refdoc/, 원본은 READ ONLY). unzip 후 ppt/slides/slide4.xml, slide6.xml 실측:

  slide4.xml (표 26행×30물리컬럼) → TML-201 근거:
    row0: "구분"(물리 2컬럼, gridSpan=2·rowSpan=2 좌상단 병합) + 월 카테고리 7개
      6월(gridSpan=1) / 7월(gridSpan=5) / 8월(gridSpan=4) / 9월(gridSpan=4) / 10월(gridSpan=5) /
      11월(gridSpan=4) / 12월(gridSpan=4) = 합 27 + "비고"(물리 1컬럼, rowSpan=2).
    row1(리프 헤더): 리프 값 = 26,27,...,52 → **ISO 주차(week-of-year) 번호, 27개 컬럼 전부 유일값.**
    row2~25: 24개 작업행(첫 행 "주요 마일스톤" + 이하 5개 카테고리 세부행 5/4/2/4/8=23행,
      카테고리명 열은 rowSpan으로 묶임). 물리 30컬럼 = 구분(2) + 리프(27) + 비고(1).
    → 확정: n_leaf=27, phase_spans=[(6월,1),(7월,5),(8월,4),(9월,4),(10월,5),(11월,4),(12월,4)],
      leaf_labels="26".."52"(월 단위 아님, 그대로 유일 주차번호), 좌측 "구분" 헤더 + 우측 "비고" 컬럼,
      작업행 24개.

  slide6.xml (표 7행×52물리컬럼) → TML-202 근거:
    row0: "구분"(물리 1컬럼, rowSpan=2, gridSpan 없음 — slide4와 달리 병합 안 됨) + 월 카테고리 3개
      6월(gridSpan=7) / 7월(gridSpan=23) / 8월(gridSpan=21) = 합 51. "비고" 컬럼 없음.
    row1(리프 헤더): 리프 값 = 6월[22,23,24,25,26,29,30] / 7월[1,2,3,6,7,8,9,10,13,14,15,16,17,20,
      21,22,23,24,27,28,29,30,31] / 8월[3,4,5,6,7,10,11,12,13,14,17,18,19,20,21,24,25,26,27,28,31]
      → **영업일(business day) 날짜, 51개 컬럼, 주말 스킵 패턴.** 월이 바뀌면 일자 값이 재사용되므로
      (예: 7월/8월 모두 "3" 존재) 유일성은 상단 월 카테고리 헤더가 보장 — 리프 텍스트 자체는 일자만.
    row2~6: 5개 작업행("1-1."~"1-5." 세부 자문 프로세스), 좌측 라벨 컬럼은 단일(병합 없음).
    → 확정: n_leaf=51, phase_spans=[(6월,7),(7월,23),(8월,21)], leaf_labels=상기 51개 일자 문자열,
      좌측 "구분" 헤더만(비고 없음), 작업행 5개.

  두 에셋 모두 리프 문자열 자체(주차번호/일자)는 정답지 실측값을 그대로 사용한다. 좌측 작업행 라벨
  텍스트(과업명)는 재사용 가능한 라이브러리 에셋 성격상 정답지 원문을 그대로 베끼지 않고 일반화한
  표현으로 대체했으나, 행 개수·카테고리 그룹핑 패턴(5/4/2/4/8, 1+23)은 정답지 구조를 따른다.
  본 asset은 shape 기반(실제 a:tbl 아님)이라 gridSpan/rowSpan은 python-pptx table merge가 아니라
  박스 폭·위치로 시각 재현한다 — 병합셀 표 원칙(compose.mjs 패딩 래퍼 등)은 이 에셋에 해당 없음.

출력: decks/05_timeline/TML_gov_v1.pptx (자기 생성물 갱신). 매니페스트: _incoming/manifest_TML_gov.json.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import common as c
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

GOV = c.TOKENS["gov_theme"]
GC = {k: RGBColor.from_string(v) for k, v in GOV["color"].items()}
def GR(name):
    return GC[GOV["role"][name]]
GOV_FONT = GOV["font"]
GOV_SZ = GOV["size_pt"]
F_HEAD = GOV_FONT["heading"]["typeface"]
F_SUB = GOV_FONT["subheading"]["typeface"]
F_BODY = GOV_FONT["body"]["typeface"]
F_CAP = GOV_FONT["caption"]["typeface"]
F_LABEL = GOV_FONT["label"]["typeface"]

GOV_W = Emu(10905360)
GOV_H = Emu(7772400)
GOV_W_IN = 10905360 / 914400.0
GOV_H_IN = 7772400 / 914400.0

L = PP_ALIGN.LEFT; Ct = PP_ALIGN.CENTER


def new_gov_deck():
    prs = c.new_deck()
    prs.slide_width = GOV_W
    prs.slide_height = GOV_H
    return prs


def title_block(S, slide, text, sub=None):
    S.append(c.add_text(slide, 0.5, 0.35, GOV_W_IN - 1.0, 0.5, text, size=GOV_SZ["heading"],
                        bold=True, color=GR("accent_primary"), align=L, font=F_HEAD))
    if sub:
        S.append(c.add_text(slide, 0.5, 0.85, GOV_W_IN - 1.0, 0.32, sub, size=GOV_SZ["caption"],
                            color=GC["shape_fill_gray"], align=L, font=F_CAP))


def BOX(S, slide, x, y, w, h, fill=None, line=None, line_w=1.0, shape=MSO_SHAPE.RECTANGLE):
    sp = c.add_box(slide, x, y, w, h, fill=fill, line=line, line_w=line_w, shape=shape)
    S.append(sp)
    return sp


def TXT(S, slide, x, y, w, h, text, size=10, bold=False, color=None, align=Ct, font=None, vert=None):
    tb = c.add_text(slide, x, y, w, h, text, size=size, bold=bold, color=color, align=align,
                    anchor=MSO_ANCHOR.MIDDLE, font=font or F_BODY)
    if vert:
        bodyPr = tb.text_frame._txBody.find(qn('a:bodyPr'))
        bodyPr.set('vert', vert)
    S.append(tb)
    return tb


def CN(S, slide, x1, y1, x2, y2, color, w=0.75):
    cn = c.connector(slide, x1, y1, x2, y2, color=color, w=w)
    S.append(cn)
    return cn


GRID_LINE = GC["bg_panel"]  # 저채도 그리드 구분선 — gov_theme에 별도 회색 보더 토큰이 없어 패널배경색 재사용(룰5)
PHASE_BAR_PALETTE = [GR("accent_primary"), GR("category"), GR("header_fill")]


def gantt_grid(slide, aid, title, sub, n_leaf, phase_spans, row_labels, label_w, leaf_labels,
               rot_leaf=False, remark_w=0.0, left_header="구분"):
    """gov 대형 스케줄 그리드 공통 빌더.
    n_leaf: 리프 컬럼 수. phase_spans: [(라벨, span_cols), ...] 합이 n_leaf 와 같아야 함(비균등 gridSpan 재현).
    leaf_labels: 리프 컬럼별 실제 텍스트 리스트(len == n_leaf) — 정답지 실측값(주차번호/영업일) 그대로.
    row_labels: 바디(작업) 행 라벨 리스트. label_w: 좌측 라벨열 폭(in).
    remark_w: 0보다 크면 그리드 우측에 "비고" 컬럼을 추가(TML-201 전용, slide4 실측 반영)."""
    assert sum(sp for _, sp in phase_spans) == n_leaf, "phase_spans 합이 n_leaf와 달라야 안 됨"
    assert len(leaf_labels) == n_leaf, "leaf_labels 길이가 n_leaf와 일치해야 함"
    S = []
    title_block(S, slide, title, sub)
    x0 = 0.5
    grid_x0 = x0 + label_w
    grid_x1 = GOV_W_IN - 0.4
    remark_x0 = grid_x1 - remark_w if remark_w > 0 else grid_x1
    gw = remark_x0 - grid_x0
    colw = gw / n_leaf

    cat_h = 0.4
    leaf_h = 0.55 if rot_leaf else 0.4
    grid_y0 = 1.35
    cat_y = grid_y0
    leaf_y = grid_y0 + cat_h
    body_y0 = leaf_y + leaf_h

    n_rows = len(row_labels)
    avail_h = GOV_H_IN - 0.3 - body_y0
    row_h = min(0.55, avail_h / n_rows)

    # 좌측 라벨열 헤더(카테고리+리프 두 행 병합 시각효과 — 실제로는 두 개 박스를 이어붙임, slide4/6 "구분")
    BOX(S, slide, x0, cat_y, label_w, cat_h + leaf_h, fill=GR("header_fill"),
        line=GC["bg_primary"], line_w=1.0)
    TXT(S, slide, x0, cat_y, label_w, cat_h + leaf_h, left_header, size=GOV_SZ["label"],
        bold=True, color=GC["bg_primary"], font=F_SUB)

    # 카테고리 헤더 행 (76829E — slide4/6 실측 2단강조색, 전 구간 동일색 — grep 근거대로 균일). 비균등 gridSpan 폭 재현.
    cx = grid_x0
    for label, span in phase_spans:
        w = span * colw
        BOX(S, slide, cx, cat_y, w, cat_h, fill=GR("header_fill_2"), line=GC["bg_primary"], line_w=1.0)
        TXT(S, slide, cx, cat_y, w, cat_h, label, size=GOV_SZ["label"], bold=True,
            color=GC["bg_primary"], font=F_SUB)
        cx += w

    # 리프 컬럼 헤더 행 — 정답지 실측 리프 텍스트(주차번호/영업일) 그대로 사용
    for j in range(n_leaf):
        px = grid_x0 + j * colw
        BOX(S, slide, px, leaf_y, colw, leaf_h, fill=GR("header_fill"), line=GC["bg_primary"], line_w=0.5)
        TXT(S, slide, px, leaf_y, colw, leaf_h, leaf_labels[j], size=GOV_SZ["label"] - 2,
            bold=False, color=GC["bg_primary"], font=F_LABEL, vert=("vert270" if rot_leaf else None))

    # 우측 "비고" 컬럼(slide4 실측 — TML-201 전용, remark_w>0 일 때만)
    if remark_w > 0:
        BOX(S, slide, remark_x0, cat_y, remark_w, cat_h + leaf_h, fill=GR("header_fill"),
            line=GC["bg_primary"], line_w=1.0)
        TXT(S, slide, remark_x0, cat_y, remark_w, cat_h + leaf_h, "비고", size=GOV_SZ["label"],
            bold=True, color=GC["bg_primary"], font=F_SUB)

    # 바디 행 + 간트 막대
    for i, lab in enumerate(row_labels):
        ry = body_y0 + i * row_h
        base = GC["bg_panel"] if i % 2 == 0 else GC["bg_primary"]
        BOX(S, slide, x0, ry, label_w, row_h, fill=base, line=GRID_LINE, line_w=0.75)
        TXT(S, slide, x0 + 0.08, ry, label_w - 0.14, row_h, lab, size=GOV_SZ["label"], bold=True,
            color=GC["text"], align=L, font=F_BODY)
        BOX(S, slide, grid_x0, ry, gw, row_h, fill=base, line=None)
        if remark_w > 0:
            BOX(S, slide, remark_x0, ry, remark_w, row_h, fill=base, line=GRID_LINE, line_w=0.75)
        start = min(i * max(1, n_leaf // len(row_labels) // 2), n_leaf - max(2, n_leaf // 8))
        span = max(2, n_leaf // 8)
        if start + span > n_leaf:
            span = n_leaf - start
        phase_idx = 0
        acc = 0
        for pi, (_, sp) in enumerate(phase_spans):
            if start < acc + sp:
                phase_idx = pi
                break
            acc += sp
        bar_color = PHASE_BAR_PALETTE[phase_idx % len(PHASE_BAR_PALETTE)]
        bx = grid_x0 + start * colw
        bw = span * colw
        BOX(S, slide, bx + colw * 0.06, ry + row_h * 0.22, bw - colw * 0.12, row_h * 0.56,
            fill=bar_color, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)

    # 세로 그리드선 (헤더+바디 전체 관통)
    total_h = (cat_h + leaf_h) + row_h * n_rows
    for j in range(n_leaf + 1):
        gxj = grid_x0 + j * colw
        CN(S, slide, gxj, cat_y, gxj, cat_y + total_h, GRID_LINE, w=0.5)
    # 좌측 라벨열 세로선 + (비고 있으면) 비고열 좌측 경계선
    CN(S, slide, x0, cat_y, x0, cat_y + total_h, GRID_LINE, w=0.5)
    CN(S, slide, grid_x1, cat_y, grid_x1, cat_y + total_h, GRID_LINE, w=0.5)

    c.group_asset(slide, S, aid)
    c.id_caption(slide, aid)


# =========================================================
# TML-201  gov 대형 스케줄 그리드 (slide4 실측 구조: 7개월 비균등 gridSpan × 27리프 컬럼(주차) + 비고열)
# =========================================================
def tml201(slide):
    gantt_grid(
        slide, "TML-201",
        "gov 대형 실행 스케줄 그리드",
        "2단 헤더(월 카테고리 1/5/4/4/5/4/4 비균등 gridSpan × 27리프 컬럼, slide4 실측 구조) · "
        "리프=ISO 주차 26~52 · 좌측 구분 + 우측 비고 컬럼",
        n_leaf=27,
        phase_spans=[("6월", 1), ("7월", 5), ("8월", 4), ("9월", 4), ("10월", 5), ("11월", 4), ("12월", 4)],
        leaf_labels=[str(w) for w in range(26, 53)],
        row_labels=[
            "주요 마일스톤",
            "사전 자문 결과 및 전략",
            "분야별 학계 전문가 자문",
            "분야별 업계 전문가 자문",
            "자문위원회 개최(오프라인)",
            "적합성 검토(온라인)",
            "정량 검증 방안 수립",
            "대상 정보 취합",
            "1차 정량 검증 결과",
            "신용도 조회",
            "2차 검증 체크리스트",
            "체크리스트 수집 결과",
            "분류 기준 수립",
            "분류 체계 개편",
            "분류 체계 완성",
            "활용 방안 마련",
            "신규 항목 반영",
            "활성화 방안 수립",
            "개편 카테고리 반영",
            "데이터베이스 반영",
            "운영 정책 기획(1)",
            "운영 정책 기획(2)",
            "등급 제도 기획",
            "인증마크 도입 기획",
        ],
        label_w=1.9,
        rot_leaf=False,
        remark_w=0.7,
        left_header="구분",
    )


# =========================================================
# TML-202  gov 초대형 열 그리드 (slide6 실측 구조: 3개월 비균등 gridSpan × 51리프 컬럼(영업일))
# =========================================================
def tml202(slide):
    jun_days = [22, 23, 24, 25, 26, 29, 30]
    jul_days = [1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 27, 28, 29, 30, 31]
    aug_days = [3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 31]
    gantt_grid(
        slide, "TML-202",
        "gov 초대형 열 스케줄 그리드",
        "2단 헤더(월 카테고리 7/23/21 비균등 gridSpan × 51리프 컬럼, slide6 실측 구조) · "
        "리프=영업일 날짜(주말 스킵) · 세로회전(과밀 방지)",
        n_leaf=51,
        phase_spans=[("6월", len(jun_days)), ("7월", len(jul_days)), ("8월", len(aug_days))],
        leaf_labels=[str(d) for d in jun_days + jul_days + aug_days],
        row_labels=[
            "사전 검토 및 실행 전략 수립",
            "1차 전문가 자문 실시",
            "2차 전문가 자문 실시",
            "자문위원회 개최(오프라인)",
            "적합성 검토(온라인)",
        ],
        label_w=1.6,
        rot_leaf=True,
        remark_w=0.0,
        left_header="구분",
    )


# =========================================================
# 빌드
# =========================================================
def build():
    prs = new_gov_deck()
    for fn in (tml201, tml202):
        fn(c.blank_slide(prs))
    out_rel = "decks/05_timeline/TML_gov_v1.pptx"
    path = c.save_deck(prs, out_rel)

    E = c.entry
    entries = [
        E("TML-201", "TML", "gov 대형 실행 스케줄 그리드 (7개월 비균등×27컬럼, 주차 단위, 비고열 포함)", out_rel, 1,
          ["timeline", "gov", "gantt", "grid", "정부", "실행계획", "대형그리드", "주단위", "비고열"],
          {"rows": 24, "leaf_cols": 27, "phase_groups": 7, "shape_based": True,
           "leaf_unit": "week",
           "leaf_unit_note": "정답지 slide4.xml 실측 그대로 정밀 재현: 월 카테고리 gridSpan "
                             "6월(1)/7월(5)/8월(4)/9월(4)/10월(5)/11월(4)/12월(4)=27, 리프 라벨은 "
                             "ISO 주차번호 26~52 실측값 그대로. 좌측 '구분' + 우측 '비고' 컬럼 포함, "
                             "작업행 24개(마일스톤 1행 + 세부행 5/4/2/4/8=23행, 정답지 그룹핑 패턴 반영). "
                             "행 라벨 텍스트는 재사용 가능한 일반화 표현으로 대체(원문 그대로 아님)"},
          ["phase_header", "leaf_header", "task_label", "gantt_bar", "remark_col"],
          ["phase_header", "leaf_header", "task_label", "gantt_bar", "remark_col"],
          recommended_use=["실행계획서", "대형 스케줄표", "정부보고서"], master="gov",
          quality="approved"),
        E("TML-202", "TML", "gov 초대형 열 스케줄 그리드 (3개월 비균등×51컬럼, 영업일 단위)", out_rel, 2,
          ["timeline", "gov", "gantt", "grid", "정부", "초대형열", "세로라벨", "일단위"],
          {"rows": 5, "leaf_cols": 51, "phase_groups": 3, "shape_based": True,
           "leaf_unit": "day",
           "leaf_unit_note": "정답지 slide6.xml 실측 그대로 정밀 재현: 월 카테고리 gridSpan "
                             "6월(7)/7월(23)/8월(21)=51, 리프 라벨은 영업일 날짜(주말 스킵) 실측값 "
                             "그대로(월별 재사용되는 일자값 포함, 유일성은 상단 월 헤더가 보장). 좌측 "
                             "'구분' 컬럼만(비고 없음), 작업행 5개(정답지 1-1~1-5 세부행 개수 반영). "
                             "행 라벨 텍스트는 재사용 가능한 일반화 표현으로 대체(원문 그대로 아님)"},
          ["phase_header", "leaf_header", "task_label", "gantt_bar"],
          ["phase_header", "leaf_header", "task_label", "gantt_bar"],
          recommended_use=["초대형 스케줄표", "세부일정 그리드", "정부보고서"], master="gov",
          quality="approved"),
    ]
    frag = c.write_fragment("TML_gov", entries)
    print("SAVED:", path)
    print("FRAGMENT:", frag)


if __name__ == "__main__":
    build()
