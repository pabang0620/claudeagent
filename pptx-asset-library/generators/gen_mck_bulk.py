# -*- coding: utf-8 -*-
"""MCK 대량 확충 생성기 — MCK-011 ~ MCK-200 (+190).

- 디바이스 종류 × 프레임색 × 화면비/구성 스윕으로 190개 자체생성.
- 네이티브 도형만 (외부 이미지·<p:pic> 금지).
- 각 프레임 = 자체완결 그룹(c.group_asset, asset:<ID>). id_caption 은 그룹 밖(좌상단).
- 색은 c.role / c.C 만 사용. 프레임색 스윕 = gray_700 / navy_800 / gray_500 / navy_600.
- 화면 안에 흰 "삽입 영역" placeholder(치환 대상) 배치.
- 파일은 ≤25 슬라이드로 분산 저장. 1슬라이드 1에셋.
"""
import sys
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

R = c.role
CC = c.C
RR = MSO_SHAPE.ROUNDED_RECTANGLE
RR2 = MSO_SHAPE.ROUND_2_SAME_RECTANGLE
TRAP = MSO_SHAPE.TRAPEZOID
OVAL = MSO_SHAPE.OVAL
TRI = MSO_SHAPE.ISOSCELES_TRIANGLE
RECT = MSO_SHAPE.RECTANGLE
LEFT = PP_ALIGN.LEFT
CENTER = PP_ALIGN.CENTER

BAND_TOP = 1.3
BAND_H = 6.0
SW = 13.333


# ---------- 공용 헬퍼 ----------
def set_round(sp, r):
    try:
        sp.adjustments[0] = r
    except Exception:
        pass
    return sp


def rd(ratio):
    a, b = ratio.split(":")
    return float(a), float(b)


def fit(ratio, maxw, maxh):
    """화면비를 유지하며 maxw×maxh 안에 들어가는 (w,h)."""
    a, b = rd(ratio)
    w = maxw
    h = w * b / a
    if h > maxh:
        h = maxh
        w = h * a / b
    return w, h


def place(W, H, top=BAND_TOP, band=BAND_H):
    x = (SW - W) / 2.0
    y = top + max(0.0, (band - H) / 2.0)
    return x, y


def dot(s, x, y, d, fill):
    return c.add_box(s, x, y, d, d, fill=fill, line=None, shape=OVAL)


def iarea(s, x, y, w, h, label, note="삽입 영역", size=11):
    """흰 화면 + 옅은 삽입 영역 placeholder(치환 대상). [screen, placeholder] 반환."""
    scr = c.add_box(s, x, y, w, h, fill=CC["white"], line=R("border"), line_w=1.0)
    pad = min(0.16, w * 0.045, h * 0.06)
    ph = c.add_box(s, x + pad, y + pad, w - 2 * pad, h - 2 * pad,
                   fill=CC["gray_050"], line=R("accent_primary"), line_w=1.0)
    c.set_shape_text(ph, "%s\n(%s)" % (label, note), size=size, bold=False,
                     color=R("muted_text"))
    return [scr, ph]


def chrome_dots(s, x, y, h):
    out = []
    for i, col in enumerate([R("warn"), R("accent_point"), R("accent_secondary")]):
        out.append(dot(s, x + 0.22 + i * 0.24, y + h / 2 - 0.075, 0.15, col))
    return out


# =========================================================
# 디바이스 빌더 — 각각 그룹에 넣을 shape 리스트 A 반환
# =========================================================
def f_browser(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 10.4, 4.6)
    hdr, addr, pad = 0.5, 0.44, 0.16
    W = sw + 2 * pad
    H = hdr + addr + sh + 2 * pad
    x, y = place(W, H)
    fr = c.add_box(s, x, y, W, H, fill=CC["white"], line=fc, line_w=1.5, shape=RR)
    set_round(fr, 0.02); A.append(fr)
    A.append(c.add_box(s, x, y, W, hdr, fill=fc, line=None))
    A += chrome_dots(s, x, y, hdr)
    tab = c.add_box(s, x + 1.05, y + 0.08, min(2.4, W * 0.28), hdr - 0.14,
                    fill=CC["gray_050"], line=None, shape=RR2)
    c.set_shape_text(tab, "탭 · 제목", size=9, color=R("body_text")); A.append(tab)
    ab = c.add_box(s, x + 0.2, y + hdr + 0.05, W - 0.4, addr - 0.08, fill=CC["white"],
                   line=R("border"), line_w=1.0, shape=RR)
    c.set_shape_text(ab, "https://  주소 표시줄", size=9, color=R("muted_text"), align=LEFT)
    A.append(ab)
    A += iarea(s, x + pad, y + hdr + addr + 0.02, W - 2 * pad, sh, "브라우저 화면", size=12)
    return A


def f_laptop(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 7.6, 4.3)
    pad = 0.18
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H + 0.55)
    bez = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(bez, 0.03); A.append(bez)
    A += iarea(s, x + pad, y + pad, sw, sh, "노트북 화면", size=12)
    bw = W + 1.6
    base = c.add_box(s, x + W / 2 - bw / 2, y + H, bw, 0.42, fill=CC["gray_300"],
                     line=fc, line_w=1.0, shape=TRAP)
    set_round(base, 0.06); A.append(base)
    A.append(c.add_box(s, x + W / 2 - 0.7, y + H + 0.06, 1.4, 0.12,
                       fill=CC["gray_500"], line=None, shape=RR))
    return A


def f_desktop(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 8.4, 4.5)
    pad = 0.2
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H + 0.9)
    bez = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(bez, 0.02); A.append(bez)
    A += iarea(s, x + pad, y + pad, sw, sh, "모니터 화면", size=12)
    neck = 0.6
    A.append(c.add_box(s, x + W / 2 - neck / 2, y + H, neck, 0.5, fill=CC["gray_500"], line=None))
    stw = min(3.0, W * 0.42)
    A.append(c.add_box(s, x + W / 2 - stw / 2, y + H + 0.5, stw, 0.28, fill=CC["gray_300"],
                       line=CC["gray_500"], line_w=1.0, shape=TRAP))
    return A


def f_wide(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 11.2, 3.6)
    pad = 0.16
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H + 0.85)
    bez = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(bez, 0.02); A.append(bez)
    A += iarea(s, x + pad, y + pad, sw, sh, "와이드 화면", size=12)
    neck = 0.7
    A.append(c.add_box(s, x + W / 2 - neck / 2, y + H, neck, 0.48, fill=CC["gray_500"], line=None))
    stw = min(3.6, W * 0.34)
    A.append(c.add_box(s, x + W / 2 - stw / 2, y + H + 0.48, stw, 0.28, fill=CC["gray_300"],
                       line=CC["gray_500"], line_w=1.0, shape=TRAP))
    return A


def f_mobile(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 2.9, 5.4)
    pad = 0.12
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H)
    body = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(body, 0.16); A.append(body)
    A += iarea(s, x + pad, y + pad, sw, sh, "모바일 화면", note="세로", size=9)
    nw = W * 0.42
    A.append(c.add_box(s, x + W / 2 - nw / 2, y + pad, nw, 0.2, fill=fc, line=None, shape=RR))
    return A


def f_mobile_land(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 5.6, 3.0)
    pad = 0.12
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H)
    body = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(body, 0.12); A.append(body)
    A += iarea(s, x + pad, y + pad, sw, sh, "가로 모바일 화면", note="가로", size=10)
    nh = H * 0.4
    A.append(c.add_box(s, x + W - pad + 0.0 - 0.0, y + H / 2 - nh / 2, 0.0, 0.0, fill=fc, line=None)
             if False else c.add_box(s, x + pad - 0.02, y + H / 2 - nh / 2, 0.16, nh,
                                     fill=fc, line=None, shape=RR))
    return A


def f_tablet(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 6.4, 4.8)
    pad = 0.3
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H)
    body = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(body, 0.05); A.append(body)
    A += iarea(s, x + pad, y + pad, sw, sh, "태블릿 화면", size=12)
    A.append(dot(s, x + W / 2 - 0.05, y + 0.12, 0.1, CC["gray_500"]))
    A.append(dot(s, x + W / 2 - 0.11, y + H - 0.24, 0.22, CC["gray_700"]))
    return A


def f_watch(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 2.5, 2.9)
    pad = 0.16
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H + 1.4)
    # 상·하단 밴드(사다리꼴)
    bw = W * 0.62
    top_band = c.add_box(s, x + W / 2 - bw / 2, y - 0.7, bw, 0.75, fill=CC["gray_500"],
                         line=None, shape=TRAP)
    top_band.rotation = 180; A.append(top_band)
    bot_band = c.add_box(s, x + W / 2 - bw / 2, y + H - 0.05, bw, 0.75, fill=CC["gray_500"],
                         line=None, shape=TRAP)
    A.append(bot_band)
    body = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(body, 0.28); A.append(body)
    # 우측 용두(크라운)
    A.append(c.add_box(s, x + W, y + H / 2 - 0.14, 0.14, 0.28, fill=CC["gray_700"],
                       line=None, shape=RR))
    A += iarea(s, x + pad, y + pad, sw, sh, "워치 화면", note="원형앱", size=8)
    return A


def f_dashboard(s, fc, v):
    A = []
    comp = v["comp"]
    W, H = 10.7, 5.3
    x, y = place(W, H)
    fr = c.add_box(s, x, y, W, H, fill=CC["gray_050"], line=fc, line_w=1.5, shape=RR)
    set_round(fr, 0.02); A.append(fr)
    hd = c.add_box(s, x, y, W, 0.6, fill=fc, line=None)
    c.set_shape_text(hd, "대시보드", size=13, bold=True, color=R("header_text"), align=LEFT)
    A.append(hd)
    A.append(dot(s, x + W - 0.4, y + 0.21, 0.18, R("accent_point")))
    A.append(dot(s, x + W - 0.72, y + 0.21, 0.18, R("accent_secondary")))
    gy = y + 0.8
    m = 0.28
    if comp == "grid3":
        kw = (W - 2 * m - 2 * 0.25) / 3
        for i in range(3):
            A += iarea(s, x + m + i * (kw + 0.25), gy, kw, 1.15, "KPI 위젯", note="삽입", size=9)
        wy = gy + 1.15 + 0.25
        ww = (W - 2 * m - 0.25) / 2
        wh = y + H - wy - 0.28
        for i in range(2):
            A += iarea(s, x + m + i * (ww + 0.25), wy, ww, wh, "차트·표 위젯", size=11)
    elif comp == "grid4":
        kw = (W - 2 * m - 3 * 0.22) / 4
        for i in range(4):
            A += iarea(s, x + m + i * (kw + 0.22), gy, kw, 1.15, "KPI", note="삽입", size=9)
        wy = gy + 1.15 + 0.25
        A += iarea(s, x + m, wy, W - 2 * m, y + H - wy - 0.28, "메인 차트 위젯", size=12)
    elif comp == "sidebar":
        nav = 2.3
        nb = c.add_box(s, x, gy - 0.0, nav, y + H - gy, fill=fc, line=None)
        A.append(nb)
        for i in range(4):
            it = c.add_box(s, x + 0.2, gy + 0.15 + i * 0.6, nav - 0.4, 0.44,
                           fill=CC["white"], line=None, shape=RR)
            c.set_shape_text(it, "메뉴 %d" % (i + 1), size=9, color=R("body_text"), align=LEFT)
            A.append(it)
        A += iarea(s, x + nav + 0.2, gy, W - nav - 0.2 - m, y + H - gy - 0.28,
                   "메인 콘텐츠 위젯", size=12)
    else:  # kanban
        cw = (W - 2 * m - 2 * 0.25) / 3
        for i in range(3):
            A += iarea(s, x + m + i * (cw + 0.25), gy, cw, y + H - gy - 0.28,
                       "칸반 열 %d" % (i + 1), note="카드 삽입", size=10)
    return A


def f_multiwindow(s, fc, v):
    A = []
    comp = v["comp"]

    def win(x, y, w, h, main=False):
        out = []
        fr = c.add_box(s, x, y, w, h, fill=CC["white"], line=fc, line_w=1.4, shape=RR)
        set_round(fr, 0.03); out.append(fr)
        out.append(c.add_box(s, x, y, w, 0.4, fill=fc, line=None))
        out += chrome_dots(s, x, y, 0.4)
        out += iarea(s, x + 0.15, y + 0.5, w - 0.3, h - 0.65,
                     "주 화면" if main else "보조 화면", size=(12 if main else 10))
        return out, fr

    if comp == "split":
        w = 5.1; h = 4.4; gap = 0.4
        tot = 2 * w + gap; x0 = (SW - tot) / 2; y0 = place(tot, h)[1]
        o, _ = win(x0, y0, w, h); A += o
        o, front = win(x0 + w + gap, y0, w, h, main=True); A += o
    elif comp == "3win":
        o, _ = win(1.7, 1.55, 7.4, 4.0); A += o
        o, _ = win(2.8, 2.35, 7.4, 4.0); A += o
        o, front = win(3.9, 3.1, 7.4, 4.0, main=True); A += o
    elif comp == "cascade":
        o, _ = win(2.0, 1.5, 7.6, 3.7); A += o
        o, _ = win(2.9, 2.35, 7.6, 3.7); A += o
        o, front = win(3.8, 3.2, 7.6, 3.7, main=True); A += o
    else:  # 2win
        o, _ = win(1.9, 1.7, 8.2, 4.3); A += o
        o, front = win(3.3, 2.7, 8.2, 4.2, main=True); A += o
    c.name_asset(front, "_front")  # placeholder rename overwritten by group
    return A


def f_mapview(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 10.4, 5.3)
    W, H = sw, sh
    x, y = place(W, H)
    fr = c.add_box(s, x, y, W, H, fill=CC["white"], line=fc, line_w=1.5, shape=RR)
    set_round(fr, 0.02); A.append(fr)
    A += iarea(s, x + 0.16, y + 0.16, W - 0.32, H - 0.32, "지도 화면", note="맵 삽입", size=12)
    sb = c.add_box(s, x + 0.4, y + 0.4, min(3.4, W * 0.4), 0.44, fill=CC["white"],
                   line=R("border"), line_w=1.0, shape=RR)
    c.set_shape_text(sb, "장소 검색", size=9, color=R("muted_text"), align=LEFT); A.append(sb)
    pins = [(0.32, 0.36, R("warn"), "1"), (0.6, 0.62, R("accent_primary"), "2"),
            (0.78, 0.34, R("accent_secondary"), "3"), (0.46, 0.74, R("sub_header"), "4")]
    for fx, fy, col, lab in pins:
        px, py = x + W * fx, y + H * fy
        tail = c.add_box(s, px + 0.11, py + 0.26, 0.22, 0.3, fill=col, line=None, shape=TRI)
        tail.rotation = 180; A.append(tail)
        head = c.add_box(s, px, py, 0.46, 0.46, fill=col, line=CC["white"], line_w=1.5, shape=OVAL)
        c.set_shape_text(head, lab, size=10, bold=True, color=CC["white"]); A.append(head)
    return A


def f_fileview(s, fc, v):
    A = []
    comp = v["comp"]
    W, H = 10.7, 5.3
    x, y = place(W, H)
    fr = c.add_box(s, x, y, W, H, fill=CC["white"], line=fc, line_w=1.5, shape=RR)
    set_round(fr, 0.02); A.append(fr)
    hd = c.add_box(s, x, y, W, 0.5, fill=fc, line=None)
    c.set_shape_text(hd, "파일 탐색기 · 산출물", size=12, bold=True, color=R("header_text"), align=LEFT)
    A.append(hd)
    sy = y + 0.5
    labels = {"grid": ("파일 목록", "그리드 삽입"), "list": ("파일 리스트", "행 목록 삽입"),
              "tiles": ("파일 타일", "큰 타일 삽입"), "columns": ("컬럼 뷰", "다단 삽입")}
    lab, note = labels[comp]
    sbw = 2.6
    sb = c.add_box(s, x, sy, sbw, y + H - sy, fill=CC["gray_050"], line=R("border"), line_w=1.0)
    A.append(sb)
    for i, f in enumerate(["\U0001F4C1 제안서", "\U0001F4C1 설계", "\U0001F4C1 시험", "\U0001F4C1 매뉴얼"]):
        row = c.add_box(s, x + 0.12, sy + 0.2 + i * 0.6, sbw - 0.24, 0.48, fill=CC["white"],
                        line=R("border"), line_w=0.75, shape=RR)
        c.set_shape_text(row, f, size=9, color=R("body_text"), align=LEFT); A.append(row)
    gx = x + sbw + 0.2
    A += iarea(s, gx, sy + 0.2, x + W - gx - 0.2, (y + H) - (sy + 0.2) - 0.2, lab, note=note, size=12)
    return A


def f_presentation(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 9.6, 4.7)
    x, y = place(sw, sh + 0.75)
    fr = c.add_box(s, x - 0.12, y - 0.12, sw + 0.24, sh + 0.24, fill=fc, line=None, shape=RR)
    set_round(fr, 0.02); A.append(fr)
    A += iarea(s, x, y, sw, sh, "발표 화면", note=v["ratio"], size=12)
    cap = c.add_box(s, x, y + sh + 0.2, sw, 0.5, fill=fc, line=None, shape=RR)
    c.set_shape_text(cap, "발표 제목 · 캡션", size=12, bold=True, color=R("header_text"))
    A.append(cap)
    return A


def f_kiosk(s, fc, v):
    A = []
    sw, sh = fit(v["ratio"], 3.4, 4.9)
    pad = 0.22
    W, H = sw + 2 * pad, sh + 2 * pad
    x, y = place(W, H + 0.6)
    bez = c.add_box(s, x, y, W, H, fill=fc, line=None, shape=RR)
    set_round(bez, 0.04); A.append(bez)
    A += iarea(s, x + pad, y + pad, sw, sh, "키오스크 화면", note="세로터치", size=11)
    # 하단 받침대
    bw = W + 1.0
    A.append(c.add_box(s, x + W / 2 - bw / 2, y + H, bw, 0.32, fill=CC["gray_300"],
                       line=CC["gray_500"], line_w=1.0, shape=TRAP))
    A.append(c.add_box(s, x + W / 2 - 0.25, y + H - 0.02, 0.5, 0.36, fill=CC["gray_500"], line=None))
    return A


# =========================================================
# 패밀리 정의 (빌더 + 변형 + 메타)
# =========================================================
def RV(ratio=None, comp=None):
    return {"ratio": ratio, "comp": comp, "vlabel": comp or ratio}


FAM = [
    {"key": "browser", "name": "브라우저 창 목업", "device": "browser", "builder": f_browser,
     "tags": ["브라우저", "웹", "탭바", "주소창"], "rec": ["웹 화면 예시", "시스템 UI 소개", "산출물 미리보기"],
     "variants": [RV("16:9"), RV("4:3"), RV("3:2"), RV("16:10")]},
    {"key": "laptop", "name": "노트북 목업", "device": "laptop", "builder": f_laptop,
     "tags": ["디바이스", "노트북", "랩탑"], "rec": ["제품 화면 예시", "웹 서비스 소개", "산출물 미리보기"],
     "variants": [RV("16:9"), RV("16:10"), RV("3:2"), RV("4:3")]},
    {"key": "desktop", "name": "데스크톱 모니터 목업", "device": "desktop", "builder": f_desktop,
     "tags": ["디바이스", "모니터", "데스크톱"], "rec": ["관리자 화면", "대시보드 소개", "산출물 미리보기"],
     "variants": [RV("16:9"), RV("4:3"), RV("16:10"), RV("5:4")]},
    {"key": "wide", "name": "와이드 모니터 목업", "device": "wide-monitor", "builder": f_wide,
     "tags": ["디바이스", "와이드", "울트라와이드", "모니터"], "rec": ["대형 대시보드", "관제 화면", "가로 산출물"],
     "variants": [RV("21:9"), RV("32:9"), RV("24:10"), RV("21:10")]},
    {"key": "mobile", "name": "모바일 폰 목업(세로)", "device": "mobile", "builder": f_mobile,
     "tags": ["디바이스", "모바일", "폰", "세로", "반응형"], "rec": ["모바일 앱 화면", "반응형 소개", "앱 미리보기"],
     "variants": [RV("9:19"), RV("9:18"), RV("9:20"), RV("9:16")]},
    {"key": "mobile_land", "name": "모바일 폰 목업(가로)", "device": "mobile-landscape", "builder": f_mobile_land,
     "tags": ["디바이스", "모바일", "폰", "가로", "반응형"], "rec": ["가로 모드 화면", "동영상 앱", "게임 화면"],
     "variants": [RV("16:9"), RV("18:9"), RV("20:9"), RV("4:3")]},
    {"key": "tablet", "name": "태블릿 목업", "device": "tablet", "builder": f_tablet,
     "tags": ["디바이스", "태블릿", "패드"], "rec": ["태블릿 화면", "산출물 미리보기", "카탈로그"],
     "variants": [RV("4:3"), RV("3:4"), RV("16:10"), RV("10:16")]},
    {"key": "watch", "name": "스마트워치 목업", "device": "smartwatch", "builder": f_watch,
     "tags": ["디바이스", "스마트워치", "웨어러블"], "rec": ["워치 앱 화면", "알림 UI", "헬스 지표"],
     "variants": [RV("1:1"), RV("5:6"), RV("6:5"), RV("4:5")]},
    {"key": "dashboard", "name": "대시보드 카드 목업", "device": "dashboard", "builder": f_dashboard,
     "tags": ["대시보드", "위젯", "카드", "KPI"], "rec": ["대시보드 소개", "KPI·차트 배치", "관리 화면"],
     "variants": [RV(comp="grid3"), RV(comp="grid4"), RV(comp="sidebar"), RV(comp="kanban")]},
    {"key": "multiwindow", "name": "멀티 윈도우 목업", "device": "multi-window", "builder": f_multiwindow,
     "tags": ["멀티윈도우", "창겹침", "비교"], "rec": ["다중 화면 비교", "워크플로우 소개", "전후 비교"],
     "variants": [RV(comp="2win"), RV(comp="3win"), RV(comp="cascade"), RV(comp="split")]},
    {"key": "mapview", "name": "지도·맵 뷰 목업", "device": "map", "builder": f_mapview,
     "tags": ["지도", "맵", "핀", "위치"], "rec": ["지도 화면", "위치 기반 서비스", "권역 소개"],
     "variants": [RV("16:9"), RV("4:3"), RV("3:2"), RV("9:12")]},
    {"key": "fileview", "name": "폴더·파일 뷰 목업", "device": "folder", "builder": f_fileview,
     "tags": ["폴더", "파일", "탐색기", "산출물"], "rec": ["산출물 목록", "파일 구조 소개", "자료 배치"],
     "variants": [RV(comp="grid"), RV(comp="list"), RV(comp="tiles"), RV(comp="columns")]},
    {"key": "presentation", "name": "프레젠테이션 화면 목업", "device": "presentation", "builder": f_presentation,
     "tags": ["프레젠테이션", "발표", "스크린"], "rec": ["발표 슬라이드", "산출물 미리보기", "화면 예시"],
     "variants": [RV("16:9"), RV("4:3"), RV("16:10"), RV("3:2")]},
    {"key": "kiosk", "name": "키오스크 목업", "device": "kiosk", "builder": f_kiosk,
     "tags": ["키오스크", "터치", "세로", "무인기기"], "rec": ["키오스크 UI", "무인 안내", "터치 화면"],
     "variants": [RV("9:16"), RV("10:16"), RV("9:18"), RV("3:4")]},
]

FRAME_COLORS = [("gray_700", "다크그레이"), ("navy_800", "네이비"),
                ("gray_500", "그레이"), ("navy_600", "블루네이비")]

BASE_TAGS = ["목업", "화면삽입", "프레임"]
EDITABLE = ["screen-image", "frame-color", "caption"]

# ---- 스펙 생성: 패밀리별 (변형×색) → 라운드로빈 인터리브 → 190 슬라이스 ----
fam_lists = []
for fam in FAM:
    lst = []
    for v in fam["variants"]:
        for ck, ckn in FRAME_COLORS:
            lst.append((fam, v, ck, ckn))
    fam_lists.append(lst)

merged = []
maxlen = max(len(l) for l in fam_lists)
for i in range(maxlen):
    for lst in fam_lists:
        if i < len(lst):
            merged.append(lst[i])

TARGET = 190
specs = merged[:TARGET]
assert len(specs) == TARGET, "specs=%d" % len(specs)

# ---- 파일 분산 (≤25 슬라이드/파일) ----
CHUNK = 24
DECK_DIR = "decks/12_mockups"
entries = []
file_of = {}
n_files = (len(specs) + CHUNK - 1) // CHUNK

built = 0
for fi in range(n_files):
    prs = c.new_deck()
    frel = "%s/MCK_bulk_g%02d_v1.pptx" % (DECK_DIR, fi + 1)
    chunk = specs[fi * CHUNK:(fi + 1) * CHUNK]
    for si, (fam, v, ck, ckn) in enumerate(chunk):
        idx = fi * CHUNK + si
        aid = "MCK-%03d" % (11 + idx)
        s = c.blank_slide(prs)
        c.id_caption(s, aid)                       # 그룹 밖 라벨
        fc = CC[ck]
        A = fam["builder"](s, fc, v)
        c.group_asset(s, A, aid)                   # 자체완결 그룹
        ratio = v["ratio"] or "16:9"
        vlabel = v["vlabel"]
        name = "%s [%s/%s]" % (fam["name"], vlabel, ckn)
        tags = BASE_TAGS + fam["tags"] + [ckn, ratio]
        entries.append(c.entry(
            asset_id=aid, category="MCK", name=name, file_rel=frel, slide_idx=si + 1,
            tags=tags,
            params={"device": fam["device"], "screen_ratio": ratio,
                    "frame_color": ck, "composition": v["comp"] or "default"},
            bindings={"screen": "이미지 자리", "caption": "화면 스크린샷 삽입"},
            editable=EDITABLE, recommended_use=fam["rec"]))
        built += 1
    c.save_deck(prs, frel)

frag = c.write_fragment("MCK_bulk", entries)

print("BUILT", built)
print("FILES", n_files)
print("FRAG", frag)
print("ENTRIES", len(entries))
print("IDS", entries[0]["id"], "..", entries[-1]["id"])
