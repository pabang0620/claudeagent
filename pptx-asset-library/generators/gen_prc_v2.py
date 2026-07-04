# -*- coding: utf-8 -*-
"""PRC v2 변형팩 — PRC-013~PRC-020.

v1(셰브론/박스흐름/원형·세로)과 구조가 겹치지 않는 8개 프로세스 변형.
단계색 차등은 쿨블루 '같은 계열 명도' 램프(네온 금지)로만 처리하고,
색은 c.role / c.C 만 사용한다. 다중 도형은 group_asset 으로 asset:<ID> 그룹화.
페이지 이미지·SmartArt 금지. 1 슬라이드 1 에셋.

파일(스타일별 1파일 1에셋):
  PRC-013 퍼널              decks/03_process/PRC_funnel_v2.pptx
  PRC-014 게이트 파이프라인  decks/03_process/PRC_gated-pipeline_v2.pptx
  PRC-015 세로 번호 스텝     decks/03_process/PRC_numbered-steps_v2.pptx
  PRC-016 허브앤스포크       decks/03_process/PRC_hub-spoke_v2.pptx
  PRC-017 지그재그 흐름      decks/03_process/PRC_zigzag_v2.pptx
  PRC-018 하강 계단 화살표   decks/03_process/PRC_descending-stairs_v2.pptx
  PRC-019 분기/병합 흐름     decks/03_process/PRC_branch-merge_v2.pptx
  PRC-020 원형 5단계 순환    decks/03_process/PRC_circular5_v2.pptx
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

# 쿨블루 '같은 계열 명도' 램프 (dark -> light), 모두 c.C 원색 (raw 금지)
RAMP = [CC['navy_900'], CC['navy_800'], CC['navy_600'], CC['blue_500'], CC['cyan_500']]


def tone(i):
    return RAMP[min(i, len(RAMP) - 1)]


def arrowize(cn, head=False, tail=True):
    """커넥터 라인에 삼각 화살촉 부여."""
    ln = cn.line._get_or_add_ln()
    if head:
        ln.append(ln.makeelement(qn('a:headEnd'), {'type': 'triangle', 'w': 'med', 'len': 'med'}))
    if tail:
        ln.append(ln.makeelement(qn('a:tailEnd'), {'type': 'triangle', 'w': 'med', 'len': 'med'}))
    return cn


# =========================================================
# PRC-013 퍼널 (깔때기 사다리꼴 4단, 위→아래 좁아짐)
# =========================================================
def build_funnel():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-013'); S = []
    stages = [('도달', '전체 노출 모수 확보'),
              ('관심', '콘텐츠 유입·탐색'),
              ('검토', '상세 확인 및 문의'),
              ('전환', '최종 계약·구매 성사')]
    cx = 4.9
    top_w, bot_w = 6.4, 2.4
    n = len(stages); y0 = 1.45; bh = 1.12; gap = 0.14
    last_y = y0
    for i, (lab, desc) in enumerate(stages):
        w = top_w - (top_w - bot_w) * (i / (n - 1))
        y = y0 + i * (bh + gap); last_y = y
        tz = c.add_box(s, cx - w / 2, y, w, bh, fill=tone(i), line=None, shape=MSO_SHAPE.TRAPEZOID)
        tz.rotation = 180  # 넓은 변이 위로 (깔때기 단)
        c.set_shape_text(tz, lab, size=15, bold=True, color=R('header_text'))
        S.append(tz)
        lt = c.add_text(s, cx + top_w / 2 + 0.55, y, 4.4, bh, desc, size=12,
                        color=R('body_text'), align=PP_ALIGN.LEFT)
        S.append(lt)
        cn = c.connector(s, cx + w / 2 - 0.05, y + bh / 2, cx + top_w / 2 + 0.5, y + bh / 2,
                         color=R('border'), w=1.0)
        S.append(cn)
    da = c.add_box(s, cx - 0.35, last_y + bh + 0.06, 0.7, 0.5, fill=tone(4), line=None,
                   shape=MSO_SHAPE.DOWN_ARROW)
    S.append(da)
    c.group_asset(s, S, 'PRC-013')
    return c.save_deck(prs, DECK + '/PRC_funnel_v2.pptx')


# =========================================================
# PRC-014 게이트형 파이프라인 (박스 + 마름모 판단 게이트 + 반려 경로)
# =========================================================
def build_gated_pipeline():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-014'); S = []
    ymid = 3.25
    bw, bh = 1.8, 1.05
    dw = 1.55
    aw = 0.6
    x = 1.15
    # 순서: box - arrow - diamond - arrow - box - arrow - diamond - arrow - box
    def box(label, tn):
        nonlocal x
        sp = c.add_box(s, x, ymid - bh / 2, bw, bh, fill=tone(tn), line=None,
                       shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(sp, label, size=12, bold=True, color=R('header_text'))
        S.append(sp); x += bw
        return sp

    def diamond(label, tn):
        nonlocal x
        sp = c.add_box(s, x, ymid - dw / 2, dw, dw, fill=tone(tn), line=None,
                       shape=MSO_SHAPE.DIAMOND)
        c.set_shape_text(sp, label, size=11, bold=True, color=R('header_text'))
        S.append(sp); x += dw
        return sp

    def arrow():
        nonlocal x
        sp = c.add_box(s, x + 0.03, ymid - 0.22, aw, 0.44, fill=tone(2), line=None,
                       shape=MSO_SHAPE.RIGHT_ARROW)
        S.append(sp); x += aw + 0.06

    box('요구 정의', 1); arrow()
    d1 = diamond('요건\n검토', 3); arrow()
    box('설계·구현', 1); arrow()
    d2 = diamond('품질\n승인', 3); arrow()
    box('배포·이관', 1)

    # 반려 경로: 품질 승인 게이트에서 아래로
    from pptx.util import Emu
    d2cx = Emu(d2.left).inches + Emu(d2.width).inches / 2
    reject_top = ymid + dw / 2 + 0.05
    da = c.add_box(s, d2cx - 0.22, reject_top, 0.44, 0.55, fill=R('muted_text'),
                   line=None, shape=MSO_SHAPE.DOWN_ARROW)
    S.append(da)
    rb = c.add_box(s, d2cx - bw / 2, reject_top + 0.6, bw, 0.85,
                   fill=R('muted_text'), line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(rb, '반려·보완', size=12, bold=True, color=R('header_text'))
    S.append(rb)
    c.group_asset(s, S, 'PRC-014')
    return c.save_deck(prs, DECK + '/PRC_gated-pipeline_v2.pptx')


# =========================================================
# PRC-015 세로 번호 스텝 (좌 번호원 + 우 설명 카드, 5)
# =========================================================
def build_numbered_steps():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-015'); S = []
    rows = [('요구 분석', '현황·요구사항을 조사하고 과업 범위를 확정한다'),
            ('설계', '정보구조·프로세스·산출물 체계를 설계한다'),
            ('구축', '설계 기준에 따라 시스템·콘텐츠를 구현한다'),
            ('검증', '정합성·품질을 교차 점검하고 결함을 보정한다'),
            ('운영·확산', '안정화 후 성과를 활용하고 대외로 확산한다')]
    dia = 0.92
    cxc = 1.55
    x0 = cxc - dia / 2
    y0 = 1.05; step = 1.17
    n = len(rows)
    # 세로 연결선 (원 뒤로)
    cn = c.connector(s, cxc, y0 + dia / 2, cxc, y0 + (n - 1) * step + dia / 2,
                     color=R('border'), w=2.0)
    S.append(cn)
    card_x = 2.55; card_w = 9.9; card_h = 0.98
    for i, (lab, desc) in enumerate(rows):
        y = y0 + i * step
        card = c.add_box(s, card_x, y, card_w, card_h, fill=R('panel_bg'),
                         line=R('border'), line_w=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        S.append(card)
        lb = c.add_text(s, card_x + 0.25, y, 2.9, card_h, lab, size=13, bold=True,
                        color=R('body_text'), align=PP_ALIGN.LEFT)
        S.append(lb)
        de = c.add_text(s, card_x + 3.2, y, card_w - 3.4, card_h, desc, size=11.5,
                        color=R('muted_text'), align=PP_ALIGN.LEFT)
        S.append(de)
        circ = c.add_box(s, x0, y + (card_h - dia) / 2, dia, dia, fill=tone(i),
                         line=CC['white'], line_w=2.5, shape=MSO_SHAPE.OVAL)
        c.set_shape_text(circ, str(i + 1), size=16, bold=True, color=R('header_text'))
        S.append(circ)
    c.group_asset(s, S, 'PRC-015')
    return c.save_deck(prs, DECK + '/PRC_numbered-steps_v2.pptx')


# =========================================================
# PRC-016 허브앤스포크 (중앙 허브 + 방사 6단계)
# =========================================================
def build_hub_spoke():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-016'); S = []
    cx, cy = 6.665, 4.0
    hub_d = 2.05; spoke_d = 1.5; radius = 2.55
    spokes = ['데이터 수집', '정제·표준화', '품질 검증', '분석·활용', '성과 관리', '대외 연계']
    n = len(spokes)
    pos = []
    for i in range(n):
        ang = math.radians(-90 + i * (360 / n))
        pos.append((cx + radius * math.cos(ang), cy + radius * math.sin(ang)))
    # 연결선 먼저 (허브 중심 -> 스포크 중심), 노드 뒤로 깔림
    for (sx, sy) in pos:
        cn = c.connector(s, cx, cy, sx, sy, color=R('border'), w=1.5)
        S.append(cn)
    # 허브
    hub = c.add_box(s, cx - hub_d / 2, cy - hub_d / 2, hub_d, hub_d, fill=tone(0),
                    line=CC['white'], line_w=2.5, shape=MSO_SHAPE.OVAL)
    c.set_shape_text(hub, '통합 관리\n플랫폼', size=13, bold=True, color=R('header_text'))
    S.append(hub)
    # 스포크
    for i, (sx, sy) in enumerate(pos):
        sp = c.add_box(s, sx - spoke_d / 2, sy - spoke_d / 2, spoke_d, spoke_d,
                       fill=tone(1 + (i % 4)), line=CC['white'], line_w=2.0, shape=MSO_SHAPE.OVAL)
        c.set_shape_text(sp, spokes[i], size=11, bold=True, color=R('header_text'))
        S.append(sp)
    c.group_asset(s, S, 'PRC-016')
    return c.save_deck(prs, DECK + '/PRC_hub-spoke_v2.pptx')


# =========================================================
# PRC-017 지그재그 흐름 (좌우 교차 4, S자)
# =========================================================
def build_zigzag():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-017'); S = []
    bw, bh = 3.1, 1.5
    xl, xr = 1.2, 9.05
    yt, yb = 1.5, 4.45
    steps = [('기획', '과업 정의·범위 확정', xl, yt),
             ('개발', '설계 기반 구현', xr, yt),
             ('검증', '품질·정합성 점검', xr, yb),
             ('배포', '이관·안정화', xl, yb)]
    for i, (lab, desc, bx, by) in enumerate(steps):
        box = c.add_box(s, bx, by, bw, bh, fill=tone(i), line=None,
                        shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(box, lab + '\n' + desc, size=12, bold=True, color=R('header_text'))
        S.append(box)
    # s1 -> s2 (오른쪽), s2 -> s3 (아래), s3 -> s4 (왼쪽)
    a1 = c.add_box(s, xl + bw, yt + bh / 2 - 0.25, xr - (xl + bw), 0.5, fill=tone(1),
                   line=None, shape=MSO_SHAPE.RIGHT_ARROW)
    S.append(a1)
    a2 = c.add_box(s, xr + bw / 2 - 0.25, yt + bh, 0.5, yb - (yt + bh), fill=tone(2),
                   line=None, shape=MSO_SHAPE.DOWN_ARROW)
    S.append(a2)
    a3 = c.add_box(s, xl + bw, yb + bh / 2 - 0.25, xr - (xl + bw), 0.5, fill=tone(3),
                   line=None, shape=MSO_SHAPE.LEFT_ARROW)
    S.append(a3)
    c.group_asset(s, S, 'PRC-017')
    return c.save_deck(prs, DECK + '/PRC_zigzag_v2.pptx')


# =========================================================
# PRC-018 하강 계단 화살표 (우하향 4단, v1 우상향과 반대)
# =========================================================
def build_descending_stairs():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-018'); S = []
    steps = [('리스크 식별', '전 영역 위험요인 도출'),
             ('영향 분석', '발생확률·영향도 평가'),
             ('완화 조치', '대응방안 실행·통제'),
             ('잔여 관리', '모니터링·지속 저감')]
    pw, ph = 2.65, 0.85
    x0, y0 = 0.95, 1.35
    dx, dy = 2.95, 1.28
    plats = []
    for i, (lab, desc) in enumerate(steps):
        px = x0 + i * dx; py = y0 + i * dy
        # 계단 라이저(수직 기둥) — 다음 단으로 하강 느낌
        if i < len(steps) - 1:
            riser = c.add_box(s, px + pw - 0.5, py + ph, 0.5, dy, fill=tone(i), line=None,
                              shape=MSO_SHAPE.RECTANGLE)
            S.append(riser)
        plat = c.add_box(s, px, py, pw, ph, fill=tone(i), line=CC['white'], line_w=1.5,
                         shape=MSO_SHAPE.RECTANGLE)
        c.set_shape_text(plat, lab, size=13, bold=True, color=R('header_text'))
        S.append(plat)
        de = c.add_text(s, px, py + ph + 0.02, pw, 0.4, desc, size=9.5,
                        color=R('muted_text'), align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP)
        S.append(de)
        plats.append((px, py))
    # 하강 방향 화살촉 커넥터 (단→단)
    for i in range(len(plats) - 1):
        (px, py) = plats[i]
        (nx, ny) = plats[i + 1]
        cn = c.connector(s, px + pw - 0.25, py + ph + dy * 0.5, nx + 0.25, ny + ph / 2,
                         color=R('accent_primary'), w=1.5)
        arrowize(cn)
        S.append(cn)
    # 하강 방향 표식
    da = c.add_box(s, x0 + (len(steps) - 1) * dx + pw + 0.15,
                   y0 + (len(steps) - 1) * dy + ph, 0.55, 0.7, fill=tone(3), line=None,
                   shape=MSO_SHAPE.DOWN_ARROW)
    S.append(da)
    c.group_asset(s, S, 'PRC-018')
    return c.save_deck(prs, DECK + '/PRC_descending-stairs_v2.pptx')


# =========================================================
# PRC-019 분기/병합 흐름 (1 -> 2갈래 -> 합류)
# =========================================================
def build_branch_merge():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-019'); S = []
    ymid = 3.7
    # 노드
    start = c.add_box(s, 0.9, ymid - 0.6, 2.3, 1.2, fill=tone(0), line=None,
                      shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(start, '요청 접수', size=13, bold=True, color=R('header_text'))
    S.append(start)
    ba = c.add_box(s, 5.15, 1.55, 3.0, 1.2, fill=tone(2), line=None,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(ba, '자동 처리 경로', size=12, bold=True, color=R('header_text'))
    S.append(ba)
    bb = c.add_box(s, 5.15, 4.75, 3.0, 1.2, fill=tone(3), line=None,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(bb, '수동 검토 경로', size=12, bold=True, color=R('header_text'))
    S.append(bb)
    merge = c.add_box(s, 10.15, ymid - 0.6, 2.3, 1.2, fill=tone(1), line=None,
                      shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(merge, '결과 통합', size=13, bold=True, color=R('header_text'))
    S.append(merge)
    # 분기/병합 커넥터 (화살촉)
    conns = [
        (3.2, ymid, 5.15, 2.15),   # start -> A
        (3.2, ymid, 5.15, 5.35),   # start -> B
        (8.15, 2.15, 10.15, ymid), # A -> merge
        (8.15, 5.35, 10.15, ymid), # B -> merge
    ]
    for (x1, y1, x2, y2) in conns:
        cn = c.connector(s, x1, y1, x2, y2, color=R('accent_primary'), w=2.0)
        arrowize(cn)
        S.append(cn)
    c.group_asset(s, S, 'PRC-019')
    return c.save_deck(prs, DECK + '/PRC_branch-merge_v2.pptx')


# =========================================================
# PRC-020 원형 5단계 순환 (v1은 4단계 PDCA, v2는 5단계)
# =========================================================
def build_circular5():
    prs = c.new_deck(); s = c.blank_slide(prs); c.id_caption(s, 'PRC-020'); S = []
    cx, cy = 6.665, 4.0
    radius = 2.35; node_d = 1.8
    labels = ['계획', '실행', '점검', '개선', '확산']
    n = len(labels)
    pos = []
    for i in range(n):
        ang = math.radians(-90 + i * (360 / n))
        pos.append((cx + radius * math.cos(ang), cy + radius * math.sin(ang)))
    # 중앙 라벨
    core = c.add_box(s, cx - 1.0, cy - 0.75, 2.0, 1.5, fill=R('panel_bg'),
                     line=R('border'), line_w=1.25, shape=MSO_SHAPE.OVAL)
    c.set_shape_text(core, '지속 개선\n순환체계', size=12, bold=True, color=R('muted_text'))
    S.append(core)
    # 순환 화살촉 커넥터 (i -> i+1, 시계방향) — 노드 뒤로
    for i in range(n):
        x1, y1 = pos[i]; x2, y2 = pos[(i + 1) % n]
        dxx, dyy = x2 - x1, y2 - y1
        d = math.hypot(dxx, dyy); ux, uy = dxx / d, dyy / d
        off = node_d / 2 + 0.06
        cn = c.connector(s, x1 + ux * off, y1 + uy * off, x2 - ux * off, y2 - uy * off,
                         color=R('accent_primary'), w=2.0)
        arrowize(cn)
        S.append(cn)
    # 노드
    for i, (nx, ny) in enumerate(pos):
        nd = c.add_box(s, nx - node_d / 2, ny - node_d / 2, node_d, node_d, fill=tone(i),
                       line=CC['white'], line_w=2.5, shape=MSO_SHAPE.OVAL)
        c.set_shape_text(nd, str(i + 1) + '. ' + labels[i], size=12, bold=True,
                         color=R('header_text'))
        S.append(nd)
    c.group_asset(s, S, 'PRC-020')
    return c.save_deck(prs, DECK + '/PRC_circular5_v2.pptx')


# =========================================================
# 매니페스트 조각
# =========================================================
def manifest():
    E = c.entry
    ed_full = ['step-text', 'step-desc', 'step-count', 'color']
    return [
        E('PRC-013', 'PRC', '퍼널 깔때기 4단', DECK + '/PRC_funnel_v2.pptx', 1,
          ['프로세스', '퍼널', '깔때기', '4단계', '전환'],
          {'count': 4, 'style': 'funnel'},
          {'steps': [{'label': '도달'}, {'label': '관심'}, {'label': '검토'}, {'label': '전환'}],
           'count': 4, 'direction': 'top-down'}, ed_full,
          recommended_use=['전환흐름', '고객여정', '단계별축소']),
        E('PRC-014', 'PRC', '게이트형 파이프라인 (박스+판단)', DECK + '/PRC_gated-pipeline_v2.pptx', 1,
          ['프로세스', '파이프라인', '게이트', '판단', '반려'],
          {'count': 5, 'style': 'gated-pipeline'},
          {'steps': [{'label': '요구 정의'}, {'label': '요건 검토', 'type': 'gate'},
                     {'label': '설계·구현'}, {'label': '품질 승인', 'type': 'gate'},
                     {'label': '배포·이관'}], 'count': 5, 'direction': 'horizontal'}, ed_full,
          recommended_use=['품질게이트', '검수절차', '승인프로세스']),
        E('PRC-015', 'PRC', '세로 번호 스텝 5 (번호원+설명)', DECK + '/PRC_numbered-steps_v2.pptx', 1,
          ['프로세스', '5단계', '세로', '번호', '설명카드'],
          {'count': 5, 'style': 'numbered-steps'},
          {'steps': [{'label': '요구 분석'}, {'label': '설계'}, {'label': '구축'},
                     {'label': '검증'}, {'label': '운영·확산'}], 'count': 5, 'direction': 'vertical'},
          ed_full, recommended_use=['수행절차', '추진단계', '방법론']),
        E('PRC-016', 'PRC', '허브앤스포크 프로세스 (중앙+방사 6)', DECK + '/PRC_hub-spoke_v2.pptx', 1,
          ['프로세스', '허브앤스포크', '방사형', '중앙집중', '연계'],
          {'count': 6, 'style': 'hub-spoke'},
          {'hub': '통합 관리 플랫폼',
           'spokes': [{'label': '데이터 수집'}, {'label': '정제·표준화'}, {'label': '품질 검증'},
                      {'label': '분석·활용'}, {'label': '성과 관리'}, {'label': '대외 연계'}],
           'count': 6, 'direction': 'radial'}, ['hub-text', 'spoke-text', 'spoke-count', 'color'],
          recommended_use=['통합체계', '연계구조', '플랫폼중심']),
        E('PRC-017', 'PRC', '지그재그 흐름 4 (좌우 교차)', DECK + '/PRC_zigzag_v2.pptx', 1,
          ['프로세스', '4단계', '지그재그', 'S자', '교차흐름'],
          {'count': 4, 'style': 'zigzag'},
          {'steps': [{'label': '기획'}, {'label': '개발'}, {'label': '검증'}, {'label': '배포'}],
           'count': 4, 'direction': 'snake'}, ed_full,
          recommended_use=['추진절차', '업무흐름', '단계흐름']),
        E('PRC-018', 'PRC', '하강 계단 화살표 4 (우하향)', DECK + '/PRC_descending-stairs_v2.pptx', 1,
          ['프로세스', '4단계', '계단식', '우하향', '저감'],
          {'count': 4, 'style': 'descending-stairs'},
          {'steps': [{'label': '리스크 식별'}, {'label': '영향 분석'}, {'label': '완화 조치'},
                     {'label': '잔여 관리'}], 'count': 4, 'direction': 'down-right'}, ed_full,
          recommended_use=['리스크저감', '단계적축소', '하향절차']),
        E('PRC-019', 'PRC', '분기/병합 흐름 (1→2갈래→합류)', DECK + '/PRC_branch-merge_v2.pptx', 1,
          ['프로세스', '분기', '병합', '병렬경로', '합류'],
          {'count': 4, 'style': 'branch-merge'},
          {'steps': [{'label': '요청 접수'}, {'label': '자동 처리 경로', 'branch': 'A'},
                     {'label': '수동 검토 경로', 'branch': 'B'}, {'label': '결과 통합'}],
           'count': 4, 'direction': 'split-merge'}, ed_full,
          recommended_use=['병렬처리', '분기흐름', '통합처리']),
        E('PRC-020', 'PRC', '원형 5단계 순환', DECK + '/PRC_circular5_v2.pptx', 1,
          ['프로세스', '5단계', '순환', '사이클', '환류'],
          {'count': 5, 'style': 'circular'},
          {'steps': [{'label': '계획'}, {'label': '실행'}, {'label': '점검'}, {'label': '개선'},
                     {'label': '확산'}], 'count': 5, 'direction': 'cyclic'}, ed_full,
          recommended_use=['환류체계', '지속개선', '운영사이클']),
    ]


if __name__ == '__main__':
    outs = [build_funnel(), build_gated_pipeline(), build_numbered_steps(), build_hub_spoke(),
            build_zigzag(), build_descending_stairs(), build_branch_merge(), build_circular5()]
    frag = c.write_fragment('PRC_v2', manifest())
    for o in outs:
        print('OK', o)
    print('FRAGMENT', frag)
