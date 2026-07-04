# -*- coding: utf-8 -*-
"""PRC 대량 확충 — PRC-021 ~ PRC-200 (+180).

파라미터화 배치 생성기: 12개 구조 패밀리 × 4팔레트 × 단계수(3~6) 스윕.
- 색은 c.role / c.C 만. 단계색 = 같은계열 명도램프(navy_900→…→cyan_500 등). 네온 금지.
- 다중 도형은 c.group_asset 으로 asset:<ID> 자체완결 그룹. id_caption 은 그룹 밖.
- 페이지 이미지·SmartArt 금지. 화살표는 RIGHT/LEFT/DOWN_ARROW·CHEVRON·DIAMOND 네이티브 + 커넥터 화살촉.
- 파일: decks/03_process/PRC_bulk_<family>_v1.pptx (패밀리별 1파일, ≤25슬라이드). 1슬라이드 1에셋.

분포(합계 180):
  9개 패밀리 × 4팔레트 × 4단계 = 144  (chevron,numbered,boxarrow,vertical,circular,funnel,zigzag,stairs,colorband)
  3개 패밀리 × 3팔레트 × 4단계 =  36  (gated,hubspoke,compare)
"""
import sys, math
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

R = c.role
CC = c.C
DECK = 'decks/03_process'

# ---------------------------------------------------------------
# 팔레트 — 모두 c.C 토큰만. 각각 dark→light 같은계열 램프 + accent.
# ---------------------------------------------------------------
PALETTES = {
    'COOL':  {'kor': '쿨블루',   'ramp': [CC['navy_900'], CC['navy_800'], CC['navy_600'], CC['blue_500'], CC['cyan_500']], 'accent': CC['blue_500']},
    'SLATE': {'kor': '슬레이트', 'ramp': [CC['navy_900'], CC['navy_800'], CC['gray_700'], CC['gray_500'], CC['gray_300']], 'accent': CC['navy_600']},
    'TEAL':  {'kor': '틸',       'ramp': [CC['navy_900'], CC['navy_800'], CC['navy_600'], CC['teal_500'], CC['cyan_500']], 'accent': CC['teal_500']},
    'ROYAL': {'kor': '로열',     'ramp': [CC['navy_900'], CC['purple_600'], CC['navy_600'], CC['blue_500'], CC['cyan_500']], 'accent': CC['purple_600']},
}
PAL_ORDER_4 = ['COOL', 'SLATE', 'TEAL', 'ROYAL']
PAL_ORDER_3 = ['COOL', 'SLATE', 'TEAL']
STEPS = [3, 4, 5, 6]


def _lum(col):
    h = str(col)
    return 0.299 * int(h[0:2], 16) + 0.587 * int(h[2:4], 16) + 0.114 * int(h[4:6], 16)


def text_on(col):
    return CC['white'] if _lum(col) < 150 else CC['text_900']


def tone(P, i, n):
    ramp = P['ramp']
    if n <= 1:
        return ramp[0]
    idx = int(round(i / (n - 1) * (len(ramp) - 1)))
    return ramp[min(idx, len(ramp) - 1)]


def arrowize(cn, head=False, tail=True):
    ln = cn.line._get_or_add_ln()
    if head:
        ln.append(ln.makeelement(qn('a:headEnd'), {'type': 'triangle', 'w': 'med', 'len': 'med'}))
    if tail:
        ln.append(ln.makeelement(qn('a:tailEnd'), {'type': 'triangle', 'w': 'med', 'len': 'med'}))
    return cn


# 제안서 더미 라벨 풀 (단계 라벨, 설명)
POOL = [
    ('현황 분석', '과업 현황과 요구사항을 진단한다'),
    ('전략 수립', '추진 방향과 핵심 과제를 정의한다'),
    ('체계 설계', '정보구조와 프로세스를 설계한다'),
    ('구축·개발', '설계 기준에 따라 시스템을 구현한다'),
    ('검증·안정화', '품질을 점검하고 결함을 보정한다'),
    ('운영·확산', '성과를 활용하고 대외로 확산한다'),
]
SUB2 = [
    '세부 과업을 정의하고 산출물을 도출한다',
    '담당 조직과 역할·일정을 배정한다',
    '표준 지표로 진척과 성과를 관리한다',
    '이해관계자 협의로 리스크를 통제한다',
    '정합성 검증으로 품질을 확보한다',
    '성과를 자산화하고 재사용한다',
]
AS_IS = ['수작업 기반 처리', '분절된 개별 시스템', '사후 대응 중심', '경험 의존 의사결정', '산발적 성과 관리', '제한된 대외 연계']
TO_BE = ['자동화 파이프라인', '통합 관리 플랫폼', '선제적 예방 체계', '데이터 기반 의사결정', '지표 기반 성과 관리', '개방형 협력 생태계']


def lbl(i):
    return POOL[i % len(POOL)]


# =========================================================
# 패밀리 빌더 — 각 (slide, n, P) → 도형 리스트 S 반환
# =========================================================
def b_chevron(s, n, P):
    S = []
    x0, y, h = 0.6, 3.0, 1.55
    total = 12.13
    overlap = 0.34
    seg = (total + overlap * (n - 1)) / n
    for i in range(n):
        cx = x0 + i * (seg - overlap)
        f = tone(P, i, n)
        sp = c.add_box(s, cx, y, seg, h, fill=f, line=None, shape=MSO_SHAPE.CHEVRON)
        c.set_shape_text(sp, '%d. %s' % (i + 1, lbl(i)[0]), size=13, bold=True, color=text_on(f))
        S.append(sp)
    return S


def b_numbered(s, n, P):
    S = []
    d = 1.25
    y = 2.75
    total, x0 = 12.13, 0.6
    gap = (total - d) / (n - 1) if n > 1 else 0
    centers = [x0 + d / 2 + i * gap for i in range(n)]
    cn = c.connector(s, centers[0], y + d / 2, centers[-1], y + d / 2, color=R('border'), w=2.0)
    S.append(cn)
    for i in range(n):
        cxp = centers[i]
        f = tone(P, i, n)
        circ = c.add_box(s, cxp - d / 2, y, d, d, fill=f, line=CC['white'], line_w=2.5, shape=MSO_SHAPE.OVAL)
        c.set_shape_text(circ, str(i + 1), size=18, bold=True, color=text_on(f))
        S.append(circ)
        lb = c.add_text(s, cxp - 1.15, y + d + 0.12, 2.3, 1.5, lbl(i)[0] + '\n' + lbl(i)[1],
                        size=11, color=R('body_text'), align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.TOP)
        S.append(lb)
    return S


def b_boxarrow(s, n, P):
    S = []
    y, h = 3.0, 1.55
    total, x0, aw = 12.13, 0.6, 0.55
    bw = (total - (n - 1) * aw) / n
    for i in range(n):
        bx = x0 + i * (bw + aw)
        f = tone(P, i, n)
        box = c.add_box(s, bx, y, bw, h, fill=f, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(box, '%d. %s' % (i + 1, lbl(i)[0]), size=12, bold=True, color=text_on(f))
        S.append(box)
        if i < n - 1:
            ar = c.add_box(s, bx + bw + 0.03, y + h / 2 - 0.22, aw - 0.06, 0.44,
                           fill=P['accent'], line=None, shape=MSO_SHAPE.RIGHT_ARROW)
            S.append(ar)
    return S


def b_vertical(s, n, P):
    S = []
    x, w = 3.2, 6.9
    y0, ah, avail = 1.15, 0.4, 5.9
    bh = (avail - (n - 1) * ah) / n
    for i in range(n):
        by = y0 + i * (bh + ah)
        f = tone(P, i, n)
        box = c.add_box(s, x, by, w, bh, fill=f, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(box, '%d. %s — %s' % (i + 1, lbl(i)[0], lbl(i)[1]),
                         size=12, bold=True, color=text_on(f))
        S.append(box)
        if i < n - 1:
            ar = c.add_box(s, x + w / 2 - 0.22, by + bh + 0.02, 0.44, ah - 0.04,
                           fill=P['accent'], line=None, shape=MSO_SHAPE.DOWN_ARROW)
            S.append(ar)
    return S


def b_circular(s, n, P):
    S = []
    cx, cy = 6.665, 4.05
    radius = 2.35
    node_d = 1.7 if n <= 4 else 1.45
    pos = [(cx + radius * math.cos(math.radians(-90 + i * (360 / n))),
            cy + radius * math.sin(math.radians(-90 + i * (360 / n)))) for i in range(n)]
    core = c.add_box(s, cx - 1.05, cy - 0.75, 2.1, 1.5, fill=R('panel_bg'),
                     line=R('border'), line_w=1.25, shape=MSO_SHAPE.OVAL)
    c.set_shape_text(core, '지속 개선\n순환 체계', size=12, bold=True, color=R('muted_text'))
    S.append(core)
    for i in range(n):
        x1, y1 = pos[i]
        x2, y2 = pos[(i + 1) % n]
        dxx, dyy = x2 - x1, y2 - y1
        dist = math.hypot(dxx, dyy)
        ux, uy = dxx / dist, dyy / dist
        off = node_d / 2 + 0.07
        cn = c.connector(s, x1 + ux * off, y1 + uy * off, x2 - ux * off, y2 - uy * off,
                         color=P['accent'], w=2.0)
        arrowize(cn)
        S.append(cn)
    for i, (nx, ny) in enumerate(pos):
        f = tone(P, i, n)
        nd = c.add_box(s, nx - node_d / 2, ny - node_d / 2, node_d, node_d, fill=f,
                       line=CC['white'], line_w=2.5, shape=MSO_SHAPE.OVAL)
        c.set_shape_text(nd, '%d. %s' % (i + 1, lbl(i)[0]), size=11, bold=True, color=text_on(f))
        S.append(nd)
    return S


def b_funnel(s, n, P):
    S = []
    cx = 4.85
    top_w, bot_w = 6.4, 2.2
    y0, gap = 1.3, 0.14
    bh = (5.7 - (n - 1) * gap) / n
    for i in range(n):
        w = top_w - (top_w - bot_w) * (i / (n - 1)) if n > 1 else top_w
        y = y0 + i * (bh + gap)
        f = tone(P, i, n)
        tz = c.add_box(s, cx - w / 2, y, w, bh, fill=f, line=None, shape=MSO_SHAPE.TRAPEZOID)
        tz.rotation = 180
        c.set_shape_text(tz, lbl(i)[0], size=14, bold=True, color=text_on(f))
        S.append(tz)
        de = c.add_text(s, cx + top_w / 2 + 0.5, y, 4.6, bh, lbl(i)[1], size=11.5,
                        color=R('body_text'), align=PP_ALIGN.LEFT)
        S.append(de)
        cn = c.connector(s, cx + w / 2 - 0.05, y + bh / 2, cx + top_w / 2 + 0.45, y + bh / 2,
                         color=R('border'), w=1.0)
        S.append(cn)
    return S


def b_zigzag(s, n, P):
    S = []
    per = math.ceil(n / 2)
    total, x0, gap = 12.13, 0.6, 0.55
    bw = min((total - (per - 1) * gap) / per, 3.1)
    bh = 1.5
    yt, yb = 1.45, 4.45
    xs = [x0 + i * (bw + gap) for i in range(per)]
    coords = []
    for i in range(n):
        if i < per:
            x, y = xs[i], yt
        else:
            col = per - 1 - (i - per)
            x, y = xs[col], yb
        coords.append((x, y))
        f = tone(P, i, n)
        box = c.add_box(s, x, y, bw, bh, fill=f, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(box, '%d. %s' % (i + 1, lbl(i)[0]), size=12, bold=True, color=text_on(f))
        S.append(box)
    for i in range(n - 1):
        x1, y1 = coords[i]
        x2, y2 = coords[i + 1]
        if y1 == y2 and x2 > x1:
            ar = c.add_box(s, x1 + bw + 0.03, y1 + bh / 2 - 0.2, gap - 0.06, 0.4,
                           fill=P['accent'], line=None, shape=MSO_SHAPE.RIGHT_ARROW)
        elif y1 == y2 and x2 < x1:
            ar = c.add_box(s, x2 + bw + 0.03, y1 + bh / 2 - 0.2, gap - 0.06, 0.4,
                           fill=P['accent'], line=None, shape=MSO_SHAPE.LEFT_ARROW)
        else:
            ar = c.add_box(s, x1 + bw / 2 - 0.2, y1 + bh + 0.03, 0.4, (yb - yt - bh) - 0.06,
                           fill=P['accent'], line=None, shape=MSO_SHAPE.DOWN_ARROW)
        S.append(ar)
    return S


def b_stairs(s, n, P):
    S = []
    pw, ph = 2.5, 0.85
    x0, y0 = 0.55, 1.2
    dx = (12.0 - pw) / (n - 1) if n > 1 else 0
    dy = min((5.6 - ph) / (n - 1), 1.3) if n > 1 else 0
    plats = []
    for i in range(n):
        px, py = x0 + i * dx, y0 + i * dy
        f = tone(P, i, n)
        if i < n - 1:
            riser = c.add_box(s, px + pw - 0.45, py + ph, 0.45, dy, fill=f, line=None, shape=MSO_SHAPE.RECTANGLE)
            S.append(riser)
        plat = c.add_box(s, px, py, pw, ph, fill=f, line=CC['white'], line_w=1.5, shape=MSO_SHAPE.RECTANGLE)
        c.set_shape_text(plat, '%d. %s' % (i + 1, lbl(i)[0]), size=12, bold=True, color=text_on(f))
        S.append(plat)
        de = c.add_text(s, px, py + ph + 0.02, pw + 0.4, 0.5, lbl(i)[1], size=9.5,
                        color=R('muted_text'), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP)
        S.append(de)
        plats.append((px, py))
    for i in range(n - 1):
        px, py = plats[i]
        nx, ny = plats[i + 1]
        cn = c.connector(s, px + pw - 0.22, py + ph + dy * 0.5, nx + 0.22, ny + ph / 2,
                         color=P['accent'], w=1.5)
        arrowize(cn)
        S.append(cn)
    return S


def b_colorband(s, n, P):
    S = []
    total, x0, gap = 12.13, 0.6, 0.35
    cw = (total - (n - 1) * gap) / n
    y, ch, hh = 1.6, 3.7, 0.9
    for i in range(n):
        cx = x0 + i * (cw + gap)
        f = tone(P, i, n)
        card = c.add_box(s, cx, y, cw, ch, fill=R('panel_bg'), line=R('border'), line_w=1.0, shape=MSO_SHAPE.RECTANGLE)
        S.append(card)
        head = c.add_box(s, cx, y, cw, hh, fill=f, line=None, shape=MSO_SHAPE.RECTANGLE)
        c.set_shape_text(head, '%d. %s' % (i + 1, lbl(i)[0]), size=13, bold=True, color=text_on(f))
        S.append(head)
        body = c.add_text(s, cx + 0.15, y + hh + 0.15, cw - 0.3, ch - hh - 0.3,
                          lbl(i)[1] + '\n\n' + SUB2[i % len(SUB2)], size=11,
                          color=R('body_text'), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP)
        S.append(body)
    return S


def b_gated(s, n, P):
    S = []
    ymid = 3.55
    total, x0, aw = 12.13, 0.6, 0.5
    nw = min((total - (n - 1) * aw) / n, 2.2)
    reject_gate = None
    for i in range(n):
        nx = x0 + i * (nw + aw)
        f = tone(P, i, n)
        if i % 2 == 1:  # 판단 게이트 (마름모)
            dw = min(nw, 1.5)
            sp = c.add_box(s, nx + (nw - dw) / 2, ymid - dw / 2, dw, dw, fill=f, line=None, shape=MSO_SHAPE.DIAMOND)
            c.set_shape_text(sp, lbl(i)[0], size=10, bold=True, color=text_on(f))
            S.append(sp)
            reject_gate = (nx + nw / 2, ymid + dw / 2)
        else:
            bh = 1.1
            sp = c.add_box(s, nx, ymid - bh / 2, nw, bh, fill=f, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
            c.set_shape_text(sp, '%d. %s' % (i + 1, lbl(i)[0]), size=11, bold=True, color=text_on(f))
            S.append(sp)
        if i < n - 1:
            ar = c.add_box(s, nx + nw + 0.03, ymid - 0.2, aw - 0.06, 0.4,
                           fill=P['accent'], line=None, shape=MSO_SHAPE.RIGHT_ARROW)
            S.append(ar)
    if reject_gate:
        rx, ry = reject_gate
        da = c.add_box(s, rx - 0.2, ry + 0.05, 0.4, 0.5, fill=R('muted_text'), line=None, shape=MSO_SHAPE.DOWN_ARROW)
        S.append(da)
        rb = c.add_box(s, rx - 1.0, ry + 0.6, 2.0, 0.8, fill=R('muted_text'), line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(rb, '반려·보완', size=11, bold=True, color=CC['white'])
        S.append(rb)
    return S


def b_hubspoke(s, n, P):
    S = []
    cx, cy = 6.665, 4.0
    hub_d = 2.05
    spoke_d = 1.5 if n <= 5 else 1.35
    radius = 2.55
    pos = [(cx + radius * math.cos(math.radians(-90 + i * (360 / n))),
            cy + radius * math.sin(math.radians(-90 + i * (360 / n)))) for i in range(n)]
    for sx, sy in pos:
        cn = c.connector(s, cx, cy, sx, sy, color=R('border'), w=1.5)
        S.append(cn)
    hub = c.add_box(s, cx - hub_d / 2, cy - hub_d / 2, hub_d, hub_d, fill=tone(P, 0, n),
                    line=CC['white'], line_w=2.5, shape=MSO_SHAPE.OVAL)
    c.set_shape_text(hub, '통합 관리\n플랫폼', size=13, bold=True, color=text_on(tone(P, 0, n)))
    S.append(hub)
    for i, (sx, sy) in enumerate(pos):
        f = tone(P, i + 1, n + 1)
        sp = c.add_box(s, sx - spoke_d / 2, sy - spoke_d / 2, spoke_d, spoke_d, fill=f,
                       line=CC['white'], line_w=2.0, shape=MSO_SHAPE.OVAL)
        c.set_shape_text(sp, lbl(i)[0], size=10.5, bold=True, color=text_on(f))
        S.append(sp)
    return S


def b_compare(s, n, P):
    S = []
    colw = 5.0
    lx, rx = 0.7, 7.63
    y0, gap, avail = 1.75, 0.25, 4.85
    rh = (avail - (n - 1) * gap) / n
    lh = c.add_box(s, lx, 1.1, colw, 0.55, fill=R('muted_text'), line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(lh, 'As-Is  현재', size=13, bold=True, color=CC['white'])
    S.append(lh)
    rhh = c.add_box(s, rx, 1.1, colw, 0.55, fill=P['accent'], line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(rhh, 'To-Be  개선', size=13, bold=True, color=text_on(P['accent']))
    S.append(rhh)
    for i in range(n):
        y = y0 + i * (rh + gap)
        lb = c.add_box(s, lx, y, colw, rh, fill=R('panel_bg'), line=R('border'), line_w=1.0, shape=MSO_SHAPE.RECTANGLE)
        c.set_shape_text(lb, AS_IS[i % len(AS_IS)], size=11, color=R('body_text'))
        S.append(lb)
        f = tone(P, i, n)
        rb = c.add_box(s, rx, y, colw, rh, fill=f, line=None, shape=MSO_SHAPE.RECTANGLE)
        c.set_shape_text(rb, TO_BE[i % len(TO_BE)], size=11, bold=True, color=text_on(f))
        S.append(rb)
    ar = c.add_box(s, lx + colw + 0.15, y0 + avail / 2 - 0.35, (rx - (lx + colw)) - 0.3, 0.7,
                   fill=P['accent'], line=None, shape=MSO_SHAPE.RIGHT_ARROW)
    S.append(ar)
    return S


# =========================================================
# 패밀리 메타 (빌더, 파일접미, 스타일, 방향, 태그, 추천용도, 팔레트셋)
# =========================================================
FAMILIES = [
    ('chevron',   b_chevron,   'chevron',    'chevron-band',      'horizontal',
     ['프로세스', '셰브론', '밴드', '단계흐름'], ['추진단계', '업무흐름', '절차'], PAL_ORDER_4),
    ('numbered',  b_numbered,  'numbered',   'numbered-steps',    'horizontal',
     ['프로세스', '번호스텝', '원형번호', '단계'], ['수행절차', '추진단계', '방법론'], PAL_ORDER_4),
    ('boxarrow',  b_boxarrow,  'boxarrow',   'box-arrow',         'horizontal',
     ['프로세스', '박스흐름', '수평', '화살표'], ['업무흐름', '처리절차', '단계흐름'], PAL_ORDER_4),
    ('vertical',  b_vertical,  'vertical',   'vertical-flow',     'vertical',
     ['프로세스', '세로', '수직흐름', '단계'], ['수행절차', '추진체계', '단계흐름'], PAL_ORDER_4),
    ('circular',  b_circular,  'circular',   'circular',          'cyclic',
     ['프로세스', '순환', '사이클', '환류'], ['환류체계', '지속개선', '운영사이클'], PAL_ORDER_4),
    ('funnel',    b_funnel,    'funnel',     'funnel',            'top-down',
     ['프로세스', '퍼널', '깔때기', '전환'], ['전환흐름', '고객여정', '단계별축소'], PAL_ORDER_4),
    ('zigzag',    b_zigzag,    'zigzag',     'zigzag',            'snake',
     ['프로세스', '지그재그', 'S자', '교차흐름'], ['추진절차', '업무흐름', '단계흐름'], PAL_ORDER_4),
    ('stairs',    b_stairs,    'stairs',     'descending-stairs', 'down-right',
     ['프로세스', '계단식', '하강', '우하향'], ['단계적축소', '리스크저감', '하향절차'], PAL_ORDER_4),
    ('colorband', b_colorband, 'colorband',  'header-band',       'horizontal',
     ['프로세스', '컬러헤더', '설명밴드', '카드'], ['단계설명', '추진체계', '영역구분'], PAL_ORDER_4),
    ('gated',     b_gated,     'gated',      'gated-pipeline',    'horizontal',
     ['프로세스', '게이트', '판단', '반려'], ['품질게이트', '검수절차', '승인프로세스'], PAL_ORDER_3),
    ('hubspoke',  b_hubspoke,  'hubspoke',   'hub-spoke',         'radial',
     ['프로세스', '허브앤스포크', '방사형', '연계'], ['통합체계', '연계구조', '플랫폼중심'], PAL_ORDER_3),
    ('compare',   b_compare,   'compare',    'as-is-to-be',       'left-right',
     ['프로세스', '좌우대비', 'As-Is', 'To-Be'], ['현재대비개선', '전후비교', '개선효과'], PAL_ORDER_3),
]

ED_FULL = ['step-text', 'step-desc', 'step-count', 'color']


def steps_binding(fam_key, n):
    if fam_key == 'compare':
        return {'steps': [{'as_is': AS_IS[i % len(AS_IS)], 'to_be': TO_BE[i % len(TO_BE)]} for i in range(n)],
                'count': n, 'direction': 'left-right'}
    if fam_key == 'hubspoke':
        return {'hub': '통합 관리 플랫폼',
                'spokes': [{'label': lbl(i)[0]} for i in range(n)], 'count': n, 'direction': 'radial'}
    return {'steps': [{'label': lbl(i)[0]} for i in range(n)], 'count': n,
            'direction': dict((f[0], f[4]) for f in FAMILIES)[fam_key]}


def main():
    entries = []
    counter = 21  # PRC-021 시작
    outs = []
    for fam_key, builder, suffix, style, direction, base_tags, rec_use, pals in FAMILIES:
        prs = c.new_deck()
        slide_idx = 0
        file_rel = '%s/PRC_bulk_%s_v1.pptx' % (DECK, suffix)
        for pal_name in pals:
            P = PALETTES[pal_name]
            for n in STEPS:
                aid = 'PRC-%03d' % counter
                s = c.blank_slide(prs)
                slide_idx += 1
                c.id_caption(s, aid)
                S = builder(s, n, P)
                c.group_asset(s, S, aid)
                fam_kor = {'chevron': '셰브론 밴드', 'numbered': '원형 번호 스텝', 'boxarrow': '박스+화살표 수평',
                           'vertical': '세로 프로세스', 'circular': '원형 순환', 'funnel': '퍼널 깔때기',
                           'zigzag': '지그재그 흐름', 'stairs': '하강 계단', 'colorband': '컬러헤더 설명밴드',
                           'gated': '게이트형 파이프라인', 'hubspoke': '허브앤스포크', 'compare': '좌우대비'}[fam_key]
                name = '%s %d단계 (%s)' % (fam_kor, n, P['kor'])
                tags = base_tags + ['%d단계' % n, P['kor']]
                params = {'count': n, 'style': style, 'palette': pal_name}
                entries.append(c.entry(aid, 'PRC', name, file_rel, slide_idx, tags, params,
                                       steps_binding(fam_key, n), ED_FULL,
                                       recommended_use=rec_use))
                counter += 1
        out = c.save_deck(prs, file_rel)
        outs.append((out, slide_idx))
    frag = c.write_fragment('PRC_bulk', entries)
    for out, cnt in outs:
        print('OK %2d slides  %s' % (cnt, out))
    print('TOTAL entries:', len(entries))
    print('ID range: PRC-021 .. PRC-%03d' % (counter - 1))
    print('FRAGMENT', frag)


if __name__ == '__main__':
    main()
