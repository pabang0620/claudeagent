# -*- coding: utf-8 -*-
"""
06_org (ORG) 카테고리 생성기 — 조직도 / 추진체계도 / 역할구조도
ORG-001 ~ ORG-008. 복잡 대형 에셋이므로 1슬라이드 1에셋.
박스(shape) + 커넥터(cxnSp) + 텍스트 조합. SmartArt 미사용.
각 에셋의 대표 컨테이너(투명 rect)를 asset:<ID> 앵커로 그룹핑.

파일 분산:
  ORG_hierarchy_v1.pptx           : 위계(001)/매트릭스(002)/R&R(005)/거버넌스(006)
  ORG_governance-network_v1.pptx  : 추진체계(003)/자문(004)/네트워크(007)/컨소시엄(008)
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
import common as c
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
import math

R = c.role
RR = MSO_SHAPE.ROUNDED_RECTANGLE
RECT = MSO_SHAPE.RECTANGLE
OVAL = MSO_SHAPE.OVAL

F1 = "decks/06_org/ORG_hierarchy_v1.pptx"
F2 = "decks/06_org/ORG_governance-network_v1.pptx"

entries = []
def E(asset_id, name, file_rel, slide_idx, tags, params, bindings, editable, rec):
    entries.append(c.entry(asset_id, "ORG", name, file_rel, slide_idx,
                           tags, params, bindings, editable, recommended_use=rec))

# ─────────────────────────────────────────────────────────────
# 저수준 헬퍼
# ─────────────────────────────────────────────────────────────
def anchor(slide, asset_id, x, y, w, h):
    """에셋 바운드를 감싸는 투명 컨테이너(그룹 앵커)."""
    box = c.add_box(slide, x, y, w, h, fill=None, line=None, shape=RECT)
    c.name_asset(box, asset_id)
    return box

def node(slide, x, y, w, h, text, fill, txt=None, size=12, bold=True,
         line=None, shape=RR, radius=0.10):
    sp = c.add_box(slide, x, y, w, h, fill=fill, line=line,
                   line_w=1.0, shape=shape)
    if shape == RR:
        sp.adjustments[0] = radius
    c.set_shape_text(sp, text, size=size, bold=bold,
                     color=txt or R("header_text"), align=PP_ALIGN.CENTER,
                     font=c.FONT_H)
    return sp

def cx(sp):  # 도형 중심 X (inch)
    return sp.left / 914400.0 + sp.width / 914400.0 / 2
def top(sp):
    return sp.top / 914400.0
def bot(sp):
    return sp.top / 914400.0 + sp.height / 914400.0
def cy(sp):
    return sp.top / 914400.0 + sp.height / 914400.0 / 2
def right(sp):
    return sp.left / 914400.0 + sp.width / 914400.0
def left(sp):
    return sp.left / 914400.0

def line(slide, x1, y1, x2, y2, color=None, w=1.5, dashed=False,
         head=False, tail=False):
    cn = c.connector(slide, x1, y1, x2, y2, color=color or R("muted_text"), w=w)
    ln = cn.line._get_or_add_ln()
    if dashed:
        d = ln.makeelement(qn('a:prstDash'), {'val': 'dash'})
        ln.append(d)
    if head:
        ln.append(ln.makeelement(qn('a:headEnd'),
                                 {'type': 'triangle', 'w': 'med', 'len': 'med'}))
    if tail:
        ln.append(ln.makeelement(qn('a:tailEnd'),
                                 {'type': 'triangle', 'w': 'med', 'len': 'med'}))
    return cn

def tree_edges(slide, parent, children, color=None, bus_gap=0.45):
    """부모 하단 → 버스 → 각 자식 상단 (직교 트리 커넥터)."""
    col = color or R("muted_text")
    py = bot(parent)
    busy = py + bus_gap
    pcx = cx(parent)
    # 부모 → 버스
    line(slide, pcx, py, pcx, busy, color=col)
    xs = [cx(ch) for ch in children]
    # 수평 버스
    line(slide, min(xs + [pcx]), busy, max(xs + [pcx]), busy, color=col)
    # 버스 → 각 자식
    for ch in children:
        line(slide, cx(ch), busy, cx(ch), top(ch), color=col)

def rr_box(slide, x, y, w, h, title, bullets, accent, bg=None):
    """R&R 팀 카드: 헤더밴드 + 역할 불릿."""
    bg = bg or c.C["gray_050"]
    card = c.add_box(slide, x, y, w, h, fill=bg, line=c.C["gray_300"],
                     line_w=0.75, shape=RR)
    card.adjustments[0] = 0.05
    band = c.add_box(slide, x, y, w, 0.44, fill=accent, line=None, shape=RECT)
    c.set_shape_text(band, title, size=12, bold=True, color=R("header_text"),
                     align=PP_ALIGN.CENTER, font=c.FONT_H)
    yy = y + 0.56
    for b in bullets:
        c.add_text(slide, x + 0.16, yy, 0.22, 0.3, "•", size=11, bold=True,
                   color=accent, align=PP_ALIGN.LEFT)
        c.add_text(slide, x + 0.36, yy, w - 0.5, 0.3, b, size=10.5,
                   color=R("body_text"), align=PP_ALIGN.LEFT)
        yy += 0.33
    return card

# ═════════════════════════════════════════════════════════════
# FILE 1 — ORG_hierarchy_v1
# ═════════════════════════════════════════════════════════════
prs = c.new_deck()

# ── ORG-001 : 표준 위계 조직도 ──────────────────────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-001 · 표준 위계 조직도")
anchor(s, "ORG-001", 0.5, 0.9, 12.33, 6.3)
n_own = node(s, 5.17, 1.15, 3.0, 0.75, "발주기관\n(콘텐츠진흥원)", R("header_fill"), size=13)
n_pm  = node(s, 5.17, 2.75, 3.0, 0.72, "총괄PM", R("accent_primary"), size=14)
teams = [
    node(s, 1.7,  4.55, 2.7, 0.95, "분석팀\n현황·수요 분석", R("accent_secondary"), size=12),
    node(s, 5.32, 4.55, 2.7, 0.95, "개발팀\n플랫폼·기능 구현", c.C["navy_600"], size=12),
    node(s, 8.95, 4.55, 2.7, 0.95, "품질관리(QA)팀\n검수·안정화", R("sub_header"), size=12),
]
line(s, cx(n_own), bot(n_own), cx(n_pm), top(n_pm), color=R("muted_text"), w=1.75)
tree_edges(s, n_pm, teams, color=R("muted_text"))
E("ORG-001", "표준 위계 조직도 (발주기관-PM-팀3)", F1, 1,
  ["조직도", "위계", "수행조직", "트리"],
  {"levels": 3, "teams": 3, "orient": "vertical"},
  {"nodes": [{"role": "발주기관", "level": 1}, {"role": "총괄PM", "level": 2},
             {"role": "분석팀", "level": 3}, {"role": "개발팀", "level": 3},
             {"role": "품질관리(QA)팀", "level": 3}],
   "levels": 3,
   "edges": [["발주기관", "총괄PM"], ["총괄PM", "분석팀"],
             ["총괄PM", "개발팀"], ["총괄PM", "품질관리(QA)팀"]]},
  ["node-text", "add-node", "color", "connector"],
  ["수행조직", "위계 조직", "역할분담"])

# ── ORG-002 : 총괄+분야별 팀 매트릭스형 ────────────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-002 · 총괄+분야별 팀 매트릭스형")
anchor(s, "ORG-002", 0.5, 0.9, 12.33, 6.3)
n_pm2 = node(s, 4.67, 1.4, 4.0, 0.8, "총괄PM (Project Manager)", R("accent_primary"), size=14)
labels = ["기획팀", "기술지원팀", "현지화팀", "품질관리팀"]
subs   = ["전략·기획", "개발·인프라", "번역·현지화", "검수·품질"]
fills  = [c.C["navy_600"], R("accent_secondary"), R("sub_header"), R("accent_point")]
tm = []
tw, gap = 2.7, 0.35
x0 = (13.333 - (tw * 4 + gap * 3)) / 2
for i, lab in enumerate(labels):
    xx = x0 + i * (tw + gap)
    tm.append(node(s, xx, 3.55, tw, 1.15, lab + "\n" + subs[i], fills[i], size=12.5))
tree_edges(s, n_pm2, tm, color=R("muted_text"))
E("ORG-002", "총괄+분야별 팀 매트릭스형 (PM+4팀)", F1, 2,
  ["조직도", "매트릭스", "총괄", "수행조직"],
  {"levels": 2, "teams": 4, "orient": "matrix"},
  {"nodes": [{"role": "총괄PM", "level": 1}] +
            [{"role": t, "team": s2, "level": 2} for t, s2 in zip(labels, subs)],
   "levels": 2,
   "edges": [["총괄PM", t] for t in labels]},
  ["node-text", "add-node", "color", "connector"],
  ["수행조직", "팀 구성", "역할분담"])

# ── ORG-005 : 역할·책임(R&R) 구조도 ────────────────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-005 · 역할·책임(R&R) 구조도")
anchor(s, "ORG-005", 0.5, 0.9, 12.33, 6.3)
n_head = node(s, 5.17, 1.1, 3.0, 0.68, "총괄PM", R("accent_primary"), size=13)
rr_specs = [
    (1.15, "기획·총괄", ["사업 총괄 관리", "일정·리스크 관리", "발주처 협의"], c.C["navy_600"]),
    (4.17, "기술지원팀", ["플랫폼 구축", "API 연동", "인프라 운영"], R("accent_secondary")),
    (7.19, "현지화팀", ["다국어 번역", "문화 현지화", "현지 검수"], R("sub_header")),
    (10.21, "품질관리", ["QA 테스트", "산출물 검수", "안정화 지원"], R("accent_point")),
]
rr_cards = []
for xx, tt, bl, ac in rr_specs:
    rr_cards.append((rr_box(s, xx, 2.75, 2.5, 1.95, tt, bl, ac), xx + 1.25))
# 총괄 → 각 카드 상단 커넥터
busy = 2.4
line(s, cx(n_head), bot(n_head), cx(n_head), busy, color=R("muted_text"))
line(s, rr_specs[0][0] + 1.25, busy, rr_specs[-1][0] + 1.25, busy, color=R("muted_text"))
for card, ccx in rr_cards:
    line(s, ccx, busy, ccx, 2.75, color=R("muted_text"))
E("ORG-005", "역할·책임(R&R) 구조도 (팀별 역할 불릿)", F1, 3,
  ["조직도", "R&R", "역할책임", "역할분담"],
  {"levels": 2, "teams": 4, "style": "role-card"},
  {"nodes": [{"role": "총괄PM", "level": 1}] +
            [{"role": t, "duties": b, "level": 2} for _, t, b, _ in rr_specs],
   "levels": 2,
   "edges": [["총괄PM", t] for _, t, _, _ in rr_specs]},
  ["node-text", "add-node", "color", "connector"],
  ["역할분담", "R&R 정의", "책임 명세"])

# ── ORG-006 : 거버넌스 체계 (3층) ──────────────────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-006 · 거버넌스 체계 (운영위/실무협의체/실행조직)")
anchor(s, "ORG-006", 0.5, 0.9, 12.33, 6.3)
g_gov = node(s, 4.17, 1.15, 5.0, 0.8, "운영위원회\n(의사결정·정책)", R("header_fill"), size=13)
g_ops = node(s, 4.17, 2.95, 5.0, 0.8, "실무협의체\n(조정·검수·소통)", c.C["navy_600"], size=13)
exec_labels = [("분석·기획", R("accent_secondary")), ("개발·구축", R("accent_primary")),
               ("현지화·운영", R("sub_header"))]
g_exec = []
ew, egap = 2.9, 0.4
ex0 = (13.333 - (ew * 3 + egap * 2)) / 2
for i, (lab, fc) in enumerate(exec_labels):
    xx = ex0 + i * (ew + egap)
    g_exec.append(node(s, xx, 4.75, ew, 0.95, "실행조직\n" + lab, fc, size=12.5))
line(s, cx(g_gov), bot(g_gov), cx(g_ops), top(g_ops), color=R("muted_text"), w=1.75)
tree_edges(s, g_ops, g_exec, color=R("muted_text"))
E("ORG-006", "거버넌스 체계 3층 (운영위/실무/실행)", F1, 4,
  ["조직도", "거버넌스", "체계도", "3층"],
  {"levels": 3, "tiers": ["운영위", "실무협의체", "실행조직"]},
  {"nodes": [{"role": "운영위원회", "level": 1}, {"role": "실무협의체", "level": 2},
             {"role": "실행조직-분석기획", "level": 3},
             {"role": "실행조직-개발구축", "level": 3},
             {"role": "실행조직-현지화운영", "level": 3}],
   "levels": 3,
   "edges": [["운영위원회", "실무협의체"], ["실무협의체", "실행조직-분석기획"],
             ["실무협의체", "실행조직-개발구축"], ["실무협의체", "실행조직-현지화운영"]]},
  ["node-text", "add-node", "color", "connector"],
  ["거버넌스", "추진체계", "운영 구조"])

c.save_deck(prs, F1)

# ═════════════════════════════════════════════════════════════
# FILE 2 — ORG_governance-network_v1
# ═════════════════════════════════════════════════════════════
prs = c.new_deck()

# ── ORG-003 : 추진체계도 (3주체 + 양방향) ─────────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-003 · 추진체계도 (발주처-수행사-협력사)")
anchor(s, "ORG-003", 0.5, 0.9, 12.33, 6.3)
p_own = node(s, 0.9,  3.1, 3.0, 1.15, "발주처\n(사업 발주·관리)", R("header_fill"), size=13)
p_do  = node(s, 5.17, 3.1, 3.0, 1.15, "수행사\n(총괄 수행)", R("accent_primary"), size=13)
p_co  = node(s, 9.43, 3.1, 3.0, 1.15, "협력사\n(분야 협력)", R("accent_secondary"), size=13)
# 발주처 ↔ 수행사 : 보고/검수 (양방향)
line(s, right(p_own), cy(p_own), left(p_do), cy(p_do),
     color=R("muted_text"), w=1.75, head=True, tail=True)
c.add_text(s, right(p_own) + 0.02, cy(p_own) - 0.5, left(p_do) - right(p_own) - 0.04, 0.35,
           "보고", size=11, bold=True, color=R("accent_primary"), align=PP_ALIGN.CENTER)
c.add_text(s, right(p_own) + 0.02, cy(p_own) + 0.18, left(p_do) - right(p_own) - 0.04, 0.35,
           "검수", size=11, bold=True, color=R("warn"), align=PP_ALIGN.CENTER)
# 수행사 ↔ 협력사 : 위탁/납품 (양방향)
line(s, right(p_do), cy(p_do), left(p_co), cy(p_co),
     color=R("muted_text"), w=1.75, head=True, tail=True)
c.add_text(s, right(p_do) + 0.02, cy(p_do) - 0.5, left(p_co) - right(p_do) - 0.04, 0.35,
           "위탁", size=11, bold=True, color=R("accent_primary"), align=PP_ALIGN.CENTER)
c.add_text(s, right(p_do) + 0.02, cy(p_do) + 0.18, left(p_co) - right(p_do) - 0.04, 0.35,
           "납품", size=11, bold=True, color=R("accent_secondary"), align=PP_ALIGN.CENTER)
E("ORG-003", "추진체계도 (발주처-수행사-협력사 양방향)", F2, 1,
  ["추진체계", "체계도", "3주체", "양방향"],
  {"actors": 3, "orient": "horizontal", "edge_labels": ["보고/검수", "위탁/납품"]},
  {"nodes": [{"role": "발주처"}, {"role": "수행사"}, {"role": "협력사"}],
   "levels": 1,
   "edges": [["발주처", "수행사"], ["수행사", "협력사"]]},
  ["node-text", "add-node", "color", "connector"],
  ["추진체계", "역할분담", "협업 구조"])

# ── ORG-004 : 자문위원회 포함형 (점선 연결) ────────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-004 · 자문위원회 포함형")
anchor(s, "ORG-004", 0.5, 0.9, 12.33, 6.3)
a_own = node(s, 2.9, 1.15, 3.0, 0.72, "발주기관", R("header_fill"), size=13)
a_pm  = node(s, 2.9, 2.75, 3.0, 0.72, "총괄PM", R("accent_primary"), size=14)
a_teams = [
    node(s, 0.9,  4.5, 2.6, 0.9, "기술지원팀", c.C["navy_600"], size=12),
    node(s, 5.3,  4.5, 2.6, 0.9, "현지화팀", R("sub_header"), size=12),
]
line(s, cx(a_own), bot(a_own), cx(a_pm), top(a_pm), color=R("muted_text"), w=1.75)
tree_edges(s, a_pm, a_teams, color=R("muted_text"))
# 우측 자문단 (점선)
a_adv = node(s, 9.4, 2.6, 3.1, 1.05, "자문위원회\n(전문가 자문·검토)", R("warn"), size=12.5)
line(s, right(a_pm), cy(a_pm), left(a_adv), cy(a_adv),
     color=R("warn"), w=1.75, dashed=True)
c.add_text(s, right(a_pm) + 0.05, cy(a_pm) - 0.42, left(a_adv) - right(a_pm) - 0.1, 0.32,
           "자문", size=10.5, bold=True, color=R("warn"), align=PP_ALIGN.CENTER)
E("ORG-004", "자문위원회 포함형 (본조직+자문단 점선)", F2, 2,
  ["조직도", "자문위원", "위계", "점선연결"],
  {"levels": 3, "teams": 2, "advisory": True, "advisory_link": "dashed"},
  {"nodes": [{"role": "발주기관", "level": 1}, {"role": "총괄PM", "level": 2},
             {"role": "기술지원팀", "level": 3}, {"role": "현지화팀", "level": 3},
             {"role": "자문위원회", "level": 2, "type": "advisory"}],
   "levels": 3,
   "edges": [["발주기관", "총괄PM"], ["총괄PM", "기술지원팀"],
             ["총괄PM", "현지화팀"], ["총괄PM", "자문위원회"]]},
  ["node-text", "add-node", "color", "connector"],
  ["수행조직", "자문 구조", "거버넌스"])

# ── ORG-007 : 협업 네트워크형 (허브+방사형) ────────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-007 · 협업 네트워크형 (허브+방사형 파트너)")
anchor(s, "ORG-007", 0.5, 0.9, 12.33, 6.3)
hub_cx, hub_cy, hub_r = 6.667, 4.1, 0.95
hub = node(s, hub_cx - hub_r, hub_cy - hub_r * 0.72, hub_r * 2, hub_r * 1.44,
           "총괄\n플랫폼", R("accent_primary"), size=13, shape=OVAL)
partners = ["현지 파트너", "배급사", "제작 스튜디오", "마케팅 대행", "번역 전문", "법무·자문"]
pfills = [c.C["navy_600"], R("accent_secondary"), R("sub_header"),
          R("accent_point"), c.C["navy_800"], R("warn")]
pw, ph, rad = 2.1, 0.85, 3.15
n = len(partners)
pcards = []
for i, lab in enumerate(partners):
    ang = math.radians(-90 + i * (360.0 / n))
    pxc = hub_cx + rad * math.cos(ang) * 1.35
    pyc = hub_cy + rad * math.sin(ang) * 0.78
    pcards.append((c.add_box(s, pxc - pw / 2, pyc - ph / 2, pw, ph,
                             fill=pfills[i], line=None, shape=RR), pxc, pyc, lab))
    pcards[-1][0].adjustments[0] = 0.12
    c.set_shape_text(pcards[-1][0], lab, size=11.5, bold=True,
                     color=R("header_text"), align=PP_ALIGN.CENTER, font=c.FONT_H)
for _, pxc, pyc, _ in pcards:
    line(s, hub_cx, hub_cy, pxc, pyc, color=c.C["gray_300"], w=1.5)
# 허브를 맨 위로 (커넥터가 원을 덮지 않게) — 다시 그림
hub2 = node(s, hub_cx - hub_r, hub_cy - hub_r * 0.72, hub_r * 2, hub_r * 1.44,
            "총괄\n플랫폼", R("accent_primary"), size=13, shape=OVAL)
E("ORG-007", "협업 네트워크형 (중앙 허브+방사형 파트너)", F2, 3,
  ["조직도", "네트워크", "허브", "협업"],
  {"hub": 1, "partners": 6, "orient": "radial"},
  {"nodes": [{"role": "총괄 플랫폼", "type": "hub"}] +
            [{"role": p, "type": "partner"} for p in partners],
   "levels": 2,
   "edges": [["총괄 플랫폼", p] for p in partners]},
  ["node-text", "add-node", "color", "connector"],
  ["협업 구조", "파트너 네트워크", "생태계"])

# ── ORG-008 : 컨소시엄 구성도 (주관+참여 병렬) ─────────────
s = c.blank_slide(prs); c.id_caption(s, "ORG-008 · 컨소시엄 구성도 (주관사+참여사 분담)")
anchor(s, "ORG-008", 0.5, 0.9, 12.33, 6.3)
lead = node(s, 4.17, 1.2, 5.0, 0.95, "주관사\n(사업 총괄·계약 주체)", R("header_fill"), size=13)
members = [
    ("참여사 A", "플랫폼 개발", "40%", R("accent_primary")),
    ("참여사 B", "현지화·운영", "35%", R("accent_secondary")),
    ("참여사 C", "마케팅·배급", "25%", R("sub_header")),
]
mw, mgap = 3.1, 0.5
mx0 = (13.333 - (mw * 3 + mgap * 2)) / 2
mcards = []
for i, (nm, role_txt, share, fc) in enumerate(members):
    xx = mx0 + i * (mw + mgap)
    card = c.add_box(s, xx, 3.6, mw, 1.6, fill=c.C["gray_050"],
                     line=c.C["gray_300"], line_w=0.9, shape=RR)
    card.adjustments[0] = 0.06
    band = c.add_box(s, xx, 3.6, mw, 0.5, fill=fc, line=None, shape=RECT)
    c.set_shape_text(band, nm, size=12.5, bold=True, color=R("header_text"),
                     align=PP_ALIGN.CENTER, font=c.FONT_H)
    c.add_text(s, xx, 4.2, mw, 0.4, role_txt, size=11.5, bold=True,
               color=R("body_text"), align=PP_ALIGN.CENTER)
    c.add_text(s, xx, 4.62, mw, 0.5, "분담 " + share, size=14, bold=True,
               color=fc, align=PP_ALIGN.CENTER)
    mcards.append((card, xx + mw / 2))
# 주관사 → 각 참여사 (병렬 트리 커넥터)
busy = 3.25
line(s, cx(lead), bot(lead), cx(lead), busy, color=R("muted_text"), w=1.75)
line(s, mcards[0][1], busy, mcards[-1][1], busy, color=R("muted_text"), w=1.75)
for _, mcx in mcards:
    line(s, mcx, busy, mcx, 3.6, color=R("muted_text"), w=1.75)
E("ORG-008", "컨소시엄 구성도 (주관사+참여사 분담)", F2, 4,
  ["조직도", "컨소시엄", "분담", "참여사"],
  {"levels": 2, "members": 3, "show_share": True},
  {"nodes": [{"role": "주관사", "level": 1}] +
            [{"role": nm, "duty": rt, "share": sh, "level": 2}
             for nm, rt, sh, _ in members],
   "levels": 2,
   "edges": [["주관사", nm] for nm, _, _, _ in members]},
  ["node-text", "add-node", "color", "connector"],
  ["컨소시엄", "역할분담", "수행조직"])

c.save_deck(prs, F2)

# ─────────────────────────────────────────────────────────────
frag = c.write_fragment("ORG", entries)
print("SAVED:", F1, F2)
print("FRAGMENT:", frag)
print("ENTRIES:", len(entries))
