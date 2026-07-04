# -*- coding: utf-8 -*-
"""SVC 대량 확충 — SVC-017~200 (+184). 12개 구조 패밀리 × 색 테마 × 노드수 스윕.

규칙:
- 색은 c.role()/c.C 만. 한글은 c.set_kfont/c.set_shape_text/c.add_text.
- 다중도형 에셋 → c.group_asset(slide, [도형들], aid) 자체완결 그룹.
- 1 슬라이드 = 1 에셋. 좌상단 c.id_caption(그룹 미포함). 페이지이미지·SmartArt 금지.
- 파일 분산: decks/07_service/SVC_bulk_<패밀리>_v1.pptx (패밀리당 ≤25슬라이드).
- 매니페스트 조각 1회: c.write_fragment('SVC_bulk', entries).
"""
import sys
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

R = c.role
CC = c.C
SW = 13.333
SH = 7.5
LEFT = PP_ALIGN.LEFT
CENTER = PP_ALIGN.CENTER

# 사전 조회한 MSO_SHAPE (철자 오류 방지)
RR = MSO_SHAPE.ROUNDED_RECTANGLE
RECT = MSO_SHAPE.RECTANGLE
CAN = MSO_SHAPE.CAN
CLOUD = MSO_SHAPE.CLOUD
CHEV = MSO_SHAPE.CHEVRON
R2 = MSO_SHAPE.ROUND_2_SAME_RECTANGLE


# ---------- 색 테마 (5) : role/C 조합만 ----------
def _theme(key, band, accent, cyc):
    return {"key": key, "band": band, "accent": accent, "cycle": cyc}


THEMES = [
    _theme("navy", CC["navy_800"], R("accent_primary"),
           [R("accent_primary"), R("accent_point"), R("accent_secondary"), R("sub_header")]),
    _theme("blue", CC["blue_500"], R("accent_primary"),
           [R("accent_point"), R("accent_primary"), R("accent_secondary"), R("sub_header")]),
    _theme("teal", CC["teal_500"], R("accent_secondary"),
           [R("accent_secondary"), R("accent_point"), R("accent_primary"), R("sub_header")]),
    _theme("purple", CC["purple_600"], R("sub_header"),
           [R("sub_header"), R("accent_primary"), R("accent_point"), R("accent_secondary")]),
    _theme("cyan", CC["cyan_500"], R("accent_point"),
           [R("accent_point"), R("accent_secondary"), R("accent_primary"), R("sub_header")]),
]


# ---------- 라벨 풀 (제안서 더미) ----------
DOMAINS = ["통합 플랫폼", "데이터 허브", "민원 서비스", "관제 시스템", "지원 사업",
           "연계 체계", "클라우드 기반", "스마트 서비스", "운영 관리", "대민 포털",
           "정보화 사업", "플랫폼 고도화", "디지털 전환", "공공데이터 개방",
           "업무 자동화", "보안 관제 체계"]

TECH_LAYERS = ["표현 계층 · Presentation", "애플리케이션 계층 · Application",
               "서비스 계층 · Service", "도메인 계층 · Domain",
               "데이터 접근 계층 · Data Access", "인프라 계층 · Infrastructure",
               "연계 계층 · Integration", "보안 계층 · Security"]
LAYER_ITEMS = ["웹 포털", "모바일 앱", "관리자 콘솔", "업무 서비스", "워크플로우",
               "알림 처리", "비즈니스 로직", "규칙 엔진", "도메인 모델", "데이터 매퍼",
               "캐시 저장소", "쿼리 엔진", "운영 DB", "파일 스토리지", "네트워크",
               "API 게이트웨이"]

TIERS3 = ["프레젠테이션 티어 · Web", "애플리케이션 티어 · WAS", "데이터 티어 · DB"]
TIER_ITEMS = ["웹 서버", "로드밸런서", "프록시", "앱 서버", "API 서비스", "배치 처리",
              "캐시 노드", "DB 마스터", "DB 복제본", "스토리지", "검색 엔진", "메시지 큐"]

FLOW_STEPS = ["요청 접수", "자격 검증", "데이터 수집", "업무 처리", "승인 심사",
              "결과 생성", "통보·발송", "이력 관리", "정산 처리", "모니터링"]

PIPE_STAGES = ["수집 · Ingest", "정제 · Cleanse", "변환 · Transform",
               "적재 · Load", "분석 · Analyze", "배포 · Serve"]
PIPE_ITEMS = ["로그 수집", "API 연동", "스트리밍", "정제·검증", "표준화", "가공·매핑",
              "DW 적재", "파티셔닝", "인덱싱", "집계·통계", "ML 모델", "리포트"]

SPOKE_NODES = ["그룹웨어", "ERP 시스템", "회계 시스템", "인사 시스템", "대외 기관",
               "SSO 인증", "민원 포털", "통계 시스템", "알림 센터", "전자결재"]

ACTORS = ["신청인", "접수 담당", "심사 위원", "승인권자", "운영 관리자",
          "시스템", "외부 기관", "정산 담당"]
LANE_STEPS = ["신청서 작성", "서류 접수", "자격 심사", "승인 처리", "결과 통보"]

MSA_SERVICES = ["사용자 서비스", "인증 서비스", "신청 서비스", "심사 서비스",
                "결제 서비스", "정산 서비스", "알림 서비스", "통계 서비스",
                "문서 서비스", "검색 서비스"]

SEC_ZONES = ["외부 구간 · Untrusted", "DMZ 구간 · Semi-Trusted", "내부 구간 · Trusted"]
SEC_ITEMS = ["일반 사용자", "외부 기관", "인터넷", "WAF", "리버스 프록시", "웹 서버",
             "WAS", "운영 DB", "내부 시스템", "백업 스토리지", "관리 콘솔", "로그 서버"]
SEC_FW = ["Perimeter Firewall", "Internal Firewall"]

CLOUD_SVC = ["로드밸런서", "컴퓨팅 (VM)", "컨테이너 (K8s)", "관리형 DB",
             "오브젝트 스토리지", "CDN · 캐시", "서버리스", "메시지 큐",
             "모니터링", "시크릿 관리"]

BA_BEFORE = ["시스템 분산 운영", "수기 데이터 입력", "데이터 사일로 고립",
             "실시간 처리 불가", "수동 모니터링", "반복 수작업", "종이 문서 관리"]
BA_AFTER = ["단일 통합 플랫폼", "자동 연계·수집", "통합 데이터 관리",
            "실시간 처리·분석", "지능형 관제·알림", "업무 자동화", "전자 문서 관리"]

JOURNEY_STAGES = ["인지", "탐색", "가입", "신청", "이용", "재방문"]
JOURNEY_TP = ["포털 배너·SNS", "홈페이지·검색", "회원가입·인증",
              "신청서·상담", "알림·마이페이지", "추천·재신청"]
JOURNEY_EMO = ["관심", "기대", "신중", "집중", "만족", "충성"]

CONTROL_DOMAINS = ["시설 관제", "보안 관제", "트래픽 관제", "품질 관제",
                   "장애 관제", "성능 관제", "자원 관제", "이벤트 관제"]


def pick(pool, off, n):
    return [pool[(off + i) % len(pool)] for i in range(n)]


def dom_of(vi):
    return DOMAINS[vi % len(DOMAINS)]


# ---------- 공용 도형 헬퍼 (그룹 대상 반환) ----------
def titles(slide, text, sub=None):
    out = [c.add_text(slide, 0.55, 0.5, 12.2, 0.5, text, size=18, bold=True,
                      color=R("header_fill"), align=LEFT, font=c.FONT_H)]
    if sub:
        out.append(c.add_text(slide, 0.55, 1.0, 12.2, 0.32, sub, size=11,
                              color=R("muted_text"), align=LEFT))
    return out


def node(slide, x, y, w, h, text, fill, tcolor=None, line=None, line_w=1.0,
         size=11, bold=True, shape=RR):
    box = c.add_box(slide, x, y, w, h, fill=fill, line=line or R("border"),
                    line_w=line_w, shape=shape)
    c.set_shape_text(box, text, size=size, bold=bold,
                     color=tcolor or R("header_text"))
    return box


def arrow(slide, x, y, w, h, direction="right", color=None, text=None, size=10):
    shp = {"right": MSO_SHAPE.RIGHT_ARROW, "down": MSO_SHAPE.DOWN_ARROW,
           "left": MSO_SHAPE.LEFT_ARROW, "up": MSO_SHAPE.UP_ARROW}[direction]
    a = c.add_box(slide, x, y, w, h, fill=color or R("accent_point"),
                  line=None, shape=shp)
    if text:
        c.set_shape_text(a, text, size=size, bold=True, color=R("header_text"))
    return a


def band_label(slide, x, y, w, h, text, fill, size=12):
    lb = c.add_box(slide, x, y, w, h, fill=fill, line=None, shape=RR)
    c.set_shape_text(lb, text, size=size, bold=True, color=R("header_text"))
    return lb


# =========================================================
# 패밀리 빌더 (각각 meta dict 반환: title, bindings)
# =========================================================
def build_layered(slide, aid, th, n, vi):
    dom = dom_of(vi)
    labs = pick(TECH_LAYERS, vi, n)
    title = "%s 레이어드 아키텍처 (%d계층)" % (dom, n)
    S = titles(slide, title, "상위 계층에서 하위 계층으로 수직 적층된 %d개 계층 구조" % n)
    x0, w, lab_w = 1.1, 11.1, 3.3
    ytop, ybot, gap = 1.55, 7.05, 0.24
    lh = (ybot - ytop - gap * (n - 1)) / n
    layers = []
    for i in range(n):
        ly = ytop + i * (lh + gap)
        col = th["cycle"][i % len(th["cycle"])]
        S.append(band_label(slide, x0, ly, lab_w, lh, labs[i], col, size=11))
        items = pick(LAYER_ITEMS, vi * 3 + i * 3, 3)
        gg = 0.2
        iw = (w - lab_w - 0.3 - gg * 2) / 3
        ix = x0 + lab_w + 0.3
        for j, it in enumerate(items):
            S.append(node(slide, ix + j * (iw + gg), ly, iw, lh, it,
                          fill=CC["gray_050"], tcolor=R("body_text"),
                          line=col, line_w=1.5, size=11))
        layers.append({"name": labs[i], "items": items})
        if i < n - 1:
            S.append(arrow(slide, x0 + w / 2 - 0.2, ly + lh + 0.01, 0.4,
                           gap - 0.02, "down", color=R("accent_point")))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {"layers": layers, "flow": "top-down"}}


def build_three_tier(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 3-티어 아키텍처" % dom
    S = titles(slide, title, "웹·애플리케이션·데이터 3계층 분리 구조 (티어당 %d개 노드)" % n)
    x0, w = 1.0, 11.3
    ytop, bh, gap = 1.6, 1.55, 0.5
    layers = []
    for i in range(3):
        ty = ytop + i * (bh + gap)
        col = th["cycle"][i % len(th["cycle"])]
        S.append(c.add_box(slide, x0, ty, w, bh, fill=CC["gray_050"],
                           line=col, line_w=1.5, shape=RR))
        S.append(band_label(slide, x0 + 0.12, ty + 0.16, 2.9, bh - 0.32,
                            TIERS3[i], col, size=12))
        items = pick(TIER_ITEMS, vi * 2 + i * 3, n)
        ax = x0 + 3.15
        aw = w - 3.35
        gg = 0.2
        iw = (aw - gg * (n - 1)) / n
        for j, it in enumerate(items):
            S.append(node(slide, ax + j * (iw + gg), ty + 0.22, iw, bh - 0.44,
                          it, fill=R("row_base"), tcolor=R("body_text"),
                          line=col, line_w=1.0, size=11))
        layers.append({"name": TIERS3[i], "items": items})
        if i < 2:
            S.append(arrow(slide, x0 + w / 2 - 0.2, ty + bh + 0.02, 0.4,
                           gap - 0.04, "down", color=R("accent_point")))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {"layers": layers, "flow": "top-down"}}


def build_dataflow(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 데이터 흐름도 (%d단계)" % (dom, n)
    S = titles(slide, title, "요청부터 처리·통보까지 %d단계 데이터 처리 흐름" % n)
    steps = pick(FLOW_STEPS, vi, n)
    x0, w = 0.8, 11.7
    y, bh, gap = 2.4, 1.4, 0.55
    cw = (w - gap * (n - 1)) / n
    centers = []
    for i, st in enumerate(steps):
        sx = x0 + i * (cw + gap)
        col = th["cycle"][i % len(th["cycle"])]
        S.append(node(slide, sx, y, cw, bh, "%d\n%s" % (i + 1, st),
                      fill=CC["gray_050"], tcolor=R("body_text"),
                      line=col, line_w=1.6, size=12))
        centers.append(sx + cw / 2)
        if i < n - 1:
            S.append(arrow(slide, sx + cw + 0.05, y + bh / 2 - 0.2, gap - 0.1,
                           0.4, "right", color=R("accent_point")))
    ds = c.add_box(slide, x0 + w / 2 - 2.0, y + bh + 1.4, 4.0, 1.0,
                   fill=CC["navy_800"], line=None, shape=CAN)
    c.set_shape_text(ds, "통합 데이터 저장소", size=12, bold=True, color=R("header_text"))
    S.append(ds)
    S.append(c.connector(slide, centers[0], y + bh, x0 + w / 2 - 1.2,
                         y + bh + 1.4, color=R("muted_text"), w=1.5))
    S.append(c.connector(slide, centers[-1], y + bh, x0 + w / 2 + 1.2,
                         y + bh + 1.4, color=R("muted_text"), w=1.5))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "steps": [{"name": s} for s in steps],
        "store": "통합 데이터 저장소", "flow": "left-right"}}


def build_pipeline(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 데이터 파이프라인 (%d단계)" % (dom, n)
    S = titles(slide, title, "수집→변환→적재→분석 등 %d단계 처리 + 데이터 웨어하우스" % n)
    stages = pick(PIPE_STAGES, vi, n)
    x0, w, agap = 0.8, 11.7, 0.6
    cw = (w - agap * (n - 1)) / n
    y, sh = 1.7, 2.05
    centers = []
    stg = []
    for i, name in enumerate(stages):
        sx = x0 + i * (cw + agap)
        col = th["cycle"][i % len(th["cycle"])]
        S.append(c.add_box(slide, sx, y, cw, sh, fill=CC["gray_050"],
                           line=col, line_w=1.75, shape=RR))
        hd = c.add_box(slide, sx, y, cw, 0.58, fill=col, line=None, shape=R2)
        c.set_shape_text(hd, name, size=12, bold=True, color=R("header_text"))
        S.append(hd)
        items = pick(PIPE_ITEMS, vi * 3 + i * 3, 3)
        for j, it in enumerate(items):
            S.append(node(slide, sx + 0.18, y + 0.7 + j * 0.42, cw - 0.36, 0.36,
                          it, fill=R("row_base"), tcolor=R("body_text"),
                          line=col, line_w=1.0, size=10))
        centers.append(sx + cw / 2)
        stg.append({"name": name, "items": items})
        if i < n - 1:
            S.append(arrow(slide, sx + cw + 0.04, y + sh / 2 - 0.22, agap - 0.08,
                           0.44, "right", color=R("accent_point")))
    dbw, dbh = 2.7, 1.3
    dbx = x0 + w / 2 - dbw / 2
    dby = 5.2
    db = c.add_box(slide, dbx, dby, dbw, dbh, fill=CC["navy_800"],
                   line=None, shape=CAN)
    c.set_shape_text(db, "데이터 웨어하우스", size=12, bold=True, color=R("header_text"))
    S.append(db)
    S.append(c.connector(slide, centers[0], y + sh, dbx + dbw * 0.3, dby,
                         color=R("accent_secondary"), w=1.6))
    S.append(c.connector(slide, centers[-1], y + sh, dbx + dbw * 0.7, dby,
                         color=R("sub_header"), w=1.6))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "stages": stg, "store": "데이터 웨어하우스", "flow": "left-right"}}


def build_hubspoke(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 허브 앤 스포크 연계맵 (%d개 연동)" % (dom, n)
    S = titles(slide, title, "중앙 통합 허브 ↔ %d개 연동 시스템 (표준 인터페이스 기반)" % n)
    cx, cy = SW / 2, 4.5
    cw, ch = 3.2, 1.6
    center = c.add_box(slide, cx - cw / 2, cy - ch / 2, cw, ch,
                       fill=CC["navy_800"], line=th["accent"], line_w=2.0, shape=RR)
    c.set_shape_text(center, "%s\n통합 허브" % dom, size=13, bold=True,
                     color=R("header_text"))
    S.append(center)
    nodes = pick(SPOKE_NODES, vi, n)
    mw, mh = 2.7, 0.95
    left = (n + 1) // 2
    right = n - left
    lx = 0.7
    rx = SW - 0.7 - mw

    def col_ys(k):
        if k <= 1:
            return [cy - mh / 2]
        top, bot = 1.9, 6.05
        return [top + i * ((bot - top - mh) / (k - 1)) for i in range(k)]

    idx = 0
    for side, xs, ys in [("l", lx, col_ys(left)), ("r", rx, col_ys(right) if right else [])]:
        for yy in ys:
            nm = nodes[idx]
            col = th["cycle"][idx % len(th["cycle"])]
            S.append(c.add_box(slide, xs, yy, mw, mh, fill=CC["gray_050"],
                               line=col, line_w=1.5, shape=RR))
            ic = c.add_box(slide, xs + 0.16, yy + mh / 2 - 0.28, 0.56, 0.56,
                           fill=col, line=None, shape=RR)
            c.set_shape_text(ic, nm[0], size=13, bold=True, color=R("header_text"))
            S.append(ic)
            S.append(c.add_text(slide, xs + 0.85, yy, mw - 0.95, mh, nm, size=11,
                                bold=True, color=R("body_text"), align=LEFT))
            if side == "l":
                S.append(c.connector(slide, xs + mw, yy + mh / 2, cx - cw / 2, cy,
                                     color=R("muted_text"), w=1.6))
            else:
                S.append(c.connector(slide, xs, yy + mh / 2, cx + cw / 2, cy,
                                     color=R("muted_text"), w=1.6))
            idx += 1
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "hub": "통합 허브", "spokes": [{"name": x} for x in nodes],
        "flow": "hub-radial"}}


def build_swimlane(slide, aid, th, n, vi):
    dom = dom_of(vi)
    sct = 5
    title = "%s 운영 스윔레인 (%d주체)" % (dom, n)
    S = titles(slide, title, "%d개 수행주체 × %d단계 업무 흐름 (레인별 역할 분담)" % (n, sct))
    x0, w, lab_w = 0.7, 11.9, 2.0
    ytop, ybot, gap = 1.85, 7.05, 0.18
    lh = (ybot - ytop - gap * (n - 1)) / n
    actors = pick(ACTORS, vi, n)
    stepnames = pick(LANE_STEPS, vi, sct)
    area_x = x0 + lab_w + 0.25
    area_w = w - lab_w - 0.25
    sgap = 0.22
    swid = (area_w - sgap * (sct - 1)) / sct
    for j in range(sct):
        hx = area_x + j * (swid + sgap)
        S.append(c.add_text(slide, hx, ytop - 0.36, swid, 0.32,
                            "%d.%s" % (j + 1, stepnames[j]), size=9, bold=True,
                            color=R("muted_text"), align=CENTER))
    lanes = []
    for i in range(n):
        ly = ytop + i * (lh + gap)
        col = th["cycle"][i % len(th["cycle"])]
        S.append(band_label(slide, x0, ly, lab_w, lh, actors[i], col, size=11))
        act = (i + vi) % sct
        for j in range(sct):
            bx = area_x + j * (swid + sgap)
            if j == act:
                S.append(node(slide, bx, ly + 0.1, swid, lh - 0.2, stepnames[j],
                              fill=col, tcolor=R("header_text"), line=None, size=10))
            else:
                S.append(c.add_box(slide, bx, ly + 0.14, swid, lh - 0.28,
                                   fill=R("row_base"), line=R("border"),
                                   line_w=0.75, shape=RR))
        lanes.append({"actor": actors[i], "step": stepnames[act]})
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "lanes": lanes, "steps": [{"name": s} for s in stepnames],
        "flow": "swimlane"}}


def build_msa(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 마이크로서비스 구성도 (%d개)" % (dom, n)
    S = titles(slide, title, "API 게이트웨이 · 독립 서비스 %d개 · 이벤트 버스 비동기 연계" % n)
    x0, w = 0.9, 11.5
    gw = c.add_box(slide, x0, 1.5, w, 0.68, fill=CC["navy_800"], line=None, shape=RR)
    c.set_shape_text(gw, "API Gateway (라우팅·인증·로드밸런싱)", size=13, bold=True,
                     color=R("header_text"))
    S.append(gw)
    svcs = pick(MSA_SERVICES, vi, n)
    cols = 3
    rows = (n + cols - 1) // cols
    g = 0.28
    cwid = (w - g * (cols - 1)) / cols
    gy0 = 2.55
    chh = min(1.0, (6.4 - gy0 - g * (rows - 1)) / rows)
    top_c, bot_c = [], []
    for k, name in enumerate(svcs):
        r, cc = divmod(k, cols)
        bx = x0 + cc * (cwid + g)
        by = gy0 + r * (chh + g)
        col = th["cycle"][k % len(th["cycle"])]
        S.append(node(slide, bx, by, cwid, chh, name + "\nREST · gRPC",
                      fill=R("row_base"), tcolor=R("body_text"),
                      line=col, line_w=1.5, size=11))
        if r == 0:
            top_c.append(bx + cwid / 2)
        if r == rows - 1:
            bot_c.append(bx + cwid / 2)
    for mx in top_c:
        S.append(c.connector(slide, mx, 2.18, mx, gy0, color=R("muted_text"), w=1.4))
    ebus_y = gy0 + rows * chh + (rows - 1) * g + 0.28
    eb = c.add_box(slide, x0, ebus_y, w, 0.66, fill=R("accent_secondary"),
                   line=None, shape=RR)
    c.set_shape_text(eb, "Event Bus / Message Queue (비동기 이벤트)", size=12,
                     bold=True, color=R("header_text"))
    S.append(eb)
    bot_start = gy0 + (rows - 1) * (chh + g) + chh
    for mx in bot_c:
        S.append(c.connector(slide, mx, bot_start, mx, ebus_y,
                             color=R("muted_text"), w=1.4))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "gateway": "API Gateway", "services": [{"name": s} for s in svcs],
        "bus": "Event Bus", "flow": "gateway-bus"}}


def build_security(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 보안 아키텍처 (구간 분리)" % dom
    S = titles(slide, title, "외부→DMZ→내부 3구간 분리 + 방화벽 계층 (구간당 %d개 노드)" % n)
    x0, w, lab_w = 1.0, 11.3, 3.0
    y, zh, fh, gap = 1.55, 1.15, 0.5, 0.15
    zcols = [R("warn"), R("sub_header"), R("accent_secondary")]
    cyc = y
    zi = 0
    layers = []
    for tok in ["z", "f", "z", "f", "z"]:
        if tok == "z":
            col = zcols[zi]
            S.append(c.add_box(slide, x0, cyc, w, zh, fill=CC["gray_050"],
                               line=col, line_w=1.5, shape=RR))
            S.append(band_label(slide, x0 + 0.12, cyc + 0.16, lab_w, zh - 0.32,
                                SEC_ZONES[zi], col, size=11))
            items = pick(SEC_ITEMS, vi + zi * 4, n)
            ax = x0 + lab_w + 0.3
            aw = w - lab_w - 0.5
            gg = 0.2
            bw = (aw - gg * (n - 1)) / n
            for j, it in enumerate(items):
                S.append(node(slide, ax + j * (bw + gg), cyc + 0.2, bw, zh - 0.4,
                              it, fill=R("row_base"), tcolor=R("body_text"),
                              line=col, line_w=1.0, size=11))
            layers.append({"name": SEC_ZONES[zi], "items": items})
            cyc += zh + gap
            zi += 1
        else:
            fwi = 0 if zi == 1 else 1
            fw = c.add_box(slide, x0, cyc, w, fh, fill=R("warn"), line=None, shape=RR)
            c.set_shape_text(fw, "\U0001F512 " + SEC_FW[fwi], size=12, bold=True,
                             color=R("header_text"))
            S.append(fw)
            S.append(arrow(slide, x0 + 0.7, cyc - gap - 0.02, 0.32, fh + 2 * gap,
                           "down", color=R("accent_primary")))
            S.append(arrow(slide, x0 + w - 1.02, cyc - gap - 0.02, 0.32,
                           fh + 2 * gap, "down", color=R("accent_primary")))
            cyc += fh + gap
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "zones": layers, "firewalls": [{"name": x} for x in SEC_FW],
        "flow": "top-down"}}


def build_cloud(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 클라우드 인프라 구성도 (%d블록)" % (dom, n)
    S = titles(slide, title, "클라우드 VPC 내 관리형 서비스 %d블록 + 온프레미스 전용선 연계" % n)
    cloud = c.add_box(slide, 1.2, 1.5, 10.9, 3.8, fill=CC["gray_050"],
                      line=th["accent"], line_w=2.0, shape=CLOUD)
    S.append(cloud)
    S.append(c.add_text(slide, 2.4, 1.66, 4.0, 0.35, "Cloud VPC", size=12,
                        bold=True, color=th["accent"], align=LEFT))
    svcs = pick(CLOUD_SVC, vi, n)
    cols = 3 if n > 4 else 2
    rows = (n + cols - 1) // cols
    gx0, gy0, gw, gh = 2.5, 2.25, 9.3, 2.7
    cwid = (gw - 0.3 * (cols - 1)) / cols
    chh = (gh - 0.3 * (rows - 1)) / rows
    for k, name in enumerate(svcs):
        r, cc = divmod(k, cols)
        bx = gx0 + cc * (cwid + 0.3)
        by = gy0 + r * (chh + 0.3)
        col = th["cycle"][k % len(th["cycle"])]
        S.append(node(slide, bx, by, cwid, chh, name, fill=R("row_base"),
                      tcolor=R("body_text"), line=col, line_w=1.5, size=11))
    onp = c.add_box(slide, SW / 2 - 2.3, 6.05, 4.6, 0.92, fill=CC["navy_800"],
                    line=None, shape=RR)
    c.set_shape_text(onp, "온프레미스 데이터센터 (전용선)", size=12, bold=True,
                     color=R("header_text"))
    S.append(onp)
    S.append(arrow(slide, SW / 2 - 0.26, 5.4, 0.52, 0.6, "up",
                   color=R("accent_point")))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "cloud": "Cloud VPC", "blocks": [{"name": s} for s in svcs],
        "onprem": "온프레미스 데이터센터", "flow": "bottom-up"}}


def build_beforeafter(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 개선 전·후 비교 (As-Is/To-Be)" % dom
    S = titles(slide, title, "기존 %d개 문제점 → 개선 후 %d개 효과 (통합·자동화 전환)" % (n, n))
    colw, y, chh, hh = 5.0, 1.7, 5.2, 0.72
    lx = 0.7
    rx = SW - 0.7 - colw
    pitch = (chh - hh - 0.3) / n
    bxh = pitch - 0.14
    before = pick(BA_BEFORE, vi, n)
    after = pick(BA_AFTER, vi, n)
    for x, ttl, items, col in [(lx, "As-Is (개선 전)", before, R("warn")),
                               (rx, "To-Be (개선 후)", after, R("accent_secondary"))]:
        S.append(c.add_box(slide, x, y, colw, chh, fill=CC["gray_050"],
                           line=col, line_w=1.5, shape=RR))
        S.append(band_label(slide, x, y, colw, hh, ttl, col, size=14))
        for j, it in enumerate(items):
            iy = y + hh + 0.2 + j * pitch
            S.append(node(slide, x + 0.28, iy, colw - 0.56, bxh, it,
                          fill=R("row_base"), tcolor=R("body_text"),
                          line=col, line_w=1.0, size=12))
    ax = (lx + colw + rx) / 2
    S.append(arrow(slide, ax - 0.78, y + chh / 2 - 0.5, 1.56, 1.0, "right",
                   color=R("accent_primary"), text="전환\n개선", size=12))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "before": [{"name": x} for x in before],
        "after": [{"name": x} for x in after], "flow": "left-right"}}


def build_journey(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 사용자 여정 맵 (%d단계)" % (dom, n)
    S = titles(slide, title, "%d단계 여정별 터치포인트·사용자 감정 매핑" % n)
    stages = pick(JOURNEY_STAGES, vi, n)
    tps = pick(JOURNEY_TP, vi, n)
    emos = pick(JOURNEY_EMO, vi, n)
    x0, w, g = 0.7, 11.9, 0.22
    cw = (w - g * (n - 1)) / n
    ch_y, ch_h = 1.7, 0.85
    tp_y, tp_h = 2.8, 1.6
    em_y, em_h = 4.75, 1.25
    for i in range(n):
        sx = x0 + i * (cw + g)
        col = th["cycle"][i % len(th["cycle"])]
        chev = c.add_box(slide, sx, ch_y, cw, ch_h, fill=col, line=None, shape=CHEV)
        c.set_shape_text(chev, "%d. %s" % (i + 1, stages[i]), size=13, bold=True,
                         color=R("header_text"))
        S.append(chev)
        S.append(node(slide, sx, tp_y, cw, tp_h, "터치포인트\n" + tps[i],
                      fill=CC["gray_050"], tcolor=R("body_text"),
                      line=col, line_w=1.5, size=11))
        S.append(node(slide, sx, em_y, cw, em_h, "감정\n" + emos[i],
                      fill=R("row_base"), tcolor=col, line=col, line_w=1.0, size=11))
        if i < n - 1:
            ax = sx + cw + (g - 0.3) / 2
            S.append(arrow(slide, ax, em_y + em_h / 2 - 0.15, 0.3, 0.3, "right",
                           color=R("muted_text")))
    S.append(arrow(slide, x0, em_y + em_h + 0.3, w, 0.32, "right",
                   color=R("accent_point"),
                   text="여정 흐름 (%s → %s)" % (stages[0], stages[-1])))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "stages": [{"name": s, "touchpoint": t, "emotion": e}
                   for s, t, e in zip(stages, tps, emos)],
        "flow": "left-right"}}


def build_control(slide, aid, th, n, vi):
    dom = dom_of(vi)
    title = "%s 통합 관제 구조 (%d개 관제영역)" % (dom, n)
    S = titles(slide, title, "중앙 통합관제센터 + %d개 관제영역 실시간 모니터링·대응" % n)
    cw, ch = 5.6, 1.15
    cxx = SW / 2 - cw / 2
    cy = 1.6
    center = c.add_box(slide, cxx, cy, cw, ch, fill=CC["navy_800"],
                       line=th["accent"], line_w=2.0, shape=RR)
    c.set_shape_text(center, "통합관제센터 (Integrated Control Center)", size=13,
                     bold=True, color=R("header_text"))
    S.append(center)
    x0, w, g = 0.7, 11.9, 0.28
    dw = (w - g * (n - 1)) / n
    dy, dh = 4.2, 1.5
    ccx = SW / 2
    doms = pick(CONTROL_DOMAINS, vi, n)
    for i in range(n):
        bx = x0 + i * (dw + g)
        col = th["cycle"][i % len(th["cycle"])]
        S.append(node(slide, bx, dy, dw, dh, doms[i], fill=CC["gray_050"],
                      tcolor=R("body_text"), line=col, line_w=1.5, size=11))
        S.append(c.connector(slide, ccx, cy + ch, bx + dw / 2, dy,
                             color=R("muted_text"), w=1.4))
    sb = c.add_box(slide, x0, 6.15, w, 0.8, fill=R("accent_secondary"),
                   line=None, shape=RR)
    c.set_shape_text(sb, "실시간 상태 대시보드 · 알림 · 로그 수집", size=12, bold=True,
                     color=R("header_text"))
    S.append(sb)
    for i in range(n):
        bx = x0 + i * (dw + g)
        S.append(c.connector(slide, bx + dw / 2, dy + dh, bx + dw / 2, 6.15,
                             color=R("muted_text"), w=1.2))
    c.group_asset(slide, S, aid)
    return {"title": title, "bindings": {
        "center": "통합관제센터", "domains": [{"name": x} for x in doms],
        "status": "실시간 상태 대시보드", "flow": "hub-monitor"}}


# =========================================================
# 패밀리 레지스트리 (합계 184 = SVC-017~200)
# =========================================================
FAMILIES = [
    {"key": "layered", "fn": build_layered, "count": 16, "ncs": [3, 4, 5, 6],
     "tags": ["레이어드", "아키텍처", "계층스택", "수직적층"],
     "editable": ["layer_labels", "layer_items", "layer_color", "arrows"],
     "use": ["시스템 구성", "기술 아키텍처", "계층 구조"]},
    {"key": "three-tier", "fn": build_three_tier, "count": 15, "ncs": [3, 4, 5, 6],
     "tags": ["3티어", "아키텍처", "웹WAS DB", "계층분리"],
     "editable": ["tier_labels", "tier_items", "tier_color", "arrows"],
     "use": ["시스템 구성", "인프라 구조", "3계층 설계"]},
    {"key": "dataflow", "fn": build_dataflow, "count": 16, "ncs": [3, 4, 5, 6],
     "tags": ["데이터흐름", "흐름도", "처리단계", "프로세스"],
     "editable": ["step_labels", "store_label", "step_color", "arrows", "connectors"],
     "use": ["처리 흐름", "업무 프로세스", "데이터 흐름"]},
    {"key": "pipeline", "fn": build_pipeline, "count": 15, "ncs": [3, 4, 5],
     "tags": ["데이터파이프라인", "ETL", "DW", "적재"],
     "editable": ["stage_labels", "stage_items", "stage_color", "db_label", "arrows", "connectors"],
     "use": ["데이터 처리", "파이프라인", "ETL 흐름"]},
    {"key": "hubspoke", "fn": build_hubspoke, "count": 16, "ncs": [4, 5, 6, 7, 8],
     "tags": ["허브스포크", "연계맵", "통합", "연동"],
     "editable": ["hub_label", "spoke_labels", "spoke_icons", "spoke_color", "connectors"],
     "use": ["시스템 통합", "연계 구조", "서비스 연동"]},
    {"key": "swimlane", "fn": build_swimlane, "count": 15, "ncs": [3, 4, 5],
     "tags": ["스윔레인", "운영프로세스", "역할분담", "업무흐름"],
     "editable": ["actor_labels", "step_labels", "lane_color", "step_cells"],
     "use": ["운영 프로세스", "역할 분담", "업무 절차"]},
    {"key": "msa", "fn": build_msa, "count": 16, "ncs": [6, 8, 9],
     "tags": ["마이크로서비스", "MSA", "격자", "이벤트버스"],
     "editable": ["gateway_label", "service_cards", "service_color", "bus_label", "connectors"],
     "use": ["MSA 구조", "서비스 구성", "시스템 아키텍처"]},
    {"key": "security", "fn": build_security, "count": 15, "ncs": [2, 3, 4],
     "tags": ["보안", "아키텍처", "구간분리", "방화벽"],
     "editable": ["zone_labels", "zone_items", "firewall_labels", "zone_color", "arrows"],
     "use": ["보안 아키텍처", "인프라 보안", "네트워크 구성"]},
    {"key": "cloud", "fn": build_cloud, "count": 16, "ncs": [4, 6, 8],
     "tags": ["클라우드", "인프라", "VPC", "온프레미스"],
     "editable": ["cloud_label", "service_blocks", "block_color", "onprem_label", "arrow"],
     "use": ["클라우드 구성", "인프라 아키텍처", "시스템 구성"]},
    {"key": "beforeafter", "fn": build_beforeafter, "count": 15, "ncs": [4, 5, 6],
     "tags": ["전후비교", "AsIs", "ToBe", "개선"],
     "editable": ["before_items", "after_items", "column_color", "center_arrow"],
     "use": ["개선 효과", "전후 비교", "사업 필요성"]},
    {"key": "journey", "fn": build_journey, "count": 16, "ncs": [4, 5, 6],
     "tags": ["사용자여정", "저니맵", "터치포인트", "UX"],
     "editable": ["stage_labels", "touchpoints", "emotions", "stage_color", "arrows"],
     "use": ["사용자 경험", "여정 설계", "서비스 기획"]},
    {"key": "control", "fn": build_control, "count": 13, "ncs": [4, 5, 6],
     "tags": ["통합관제", "관제구조", "모니터링", "대응체계"],
     "editable": ["center_label", "domain_labels", "domain_color", "status_label", "connectors"],
     "use": ["관제 구조", "운영 모니터링", "통합 관제"]},
]


def main():
    gid = 17
    entries = []
    files = []
    for fam in FAMILIES:
        filerel = "decks/07_service/SVC_bulk_%s_v1.pptx" % fam["key"]
        prs = c.new_deck()
        for v in range(fam["count"]):
            aid = "SVC-%03d" % gid
            th = THEMES[v % len(THEMES)]
            ncount = fam["ncs"][v % len(fam["ncs"])]
            s = c.blank_slide(prs)
            c.id_caption(s, aid)
            meta = fam["fn"](s, aid, th, ncount, v)
            tags = ["구조도"] + fam["tags"] + ["%d노드" % ncount, th["key"] + "톤"]
            params = {"family": fam["key"], "layout": fam["key"],
                      "nodes": ncount, "theme": th["key"], "variant": v}
            entries.append(c.entry(aid, "SVC", meta["title"], filerel, v + 1,
                                   tags, params, meta["bindings"], fam["editable"],
                                   recommended_use=fam["use"]))
            gid += 1
        c.save_deck(prs, filerel)
        files.append((filerel, fam["count"]))
    frag = c.write_fragment("SVC_bulk", entries)
    print("LAST_ID SVC-%03d" % (gid - 1))
    print("ENTRIES", len(entries))
    print("FRAG", frag)
    for f, cnt in files:
        print("FILE %s slides=%d" % (f, cnt))


if __name__ == "__main__":
    main()
