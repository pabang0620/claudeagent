# -*- coding: utf-8 -*-
"""SVC 카테고리 변형팩 v2 — SVC-009~SVC-016 (v1과 다른 구조).

- 네이티브 도형/커넥터/화살표만 사용 (SmartArt·페이지이미지 금지).
- 다중도형 에셋은 c.group_asset(slide, [도형들], "SVC-0NN") 로 그룹 앵커링.
- 색은 c.role()/c.C 만 사용. 한글은 c.set_kfont/c.set_shape_text/c.add_text.
- 1 슬라이드 = 1 에셋. 좌상단 c.id_caption (그룹에는 미포함).
"""
import sys
sys.path.insert(0, '/home/pabang/myapp/.claude/pptx-asset-library/generators/lib')
import common as c
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

R = c.role
CC = c.C
SW = 13.333


# ---------- 공용 헬퍼 (그룹 대상 도형 반환) ----------
def titles(slide, text, sub=None):
    out = [c.add_text(slide, 0.55, 0.52, 12.2, 0.5, text, size=18, bold=True,
                      color=R("header_fill"), align=PP_ALIGN.LEFT, font=c.FONT_H)]
    if sub:
        out.append(c.add_text(slide, 0.55, 1.02, 12.2, 0.32, sub, size=11,
                              color=R("muted_text"), align=PP_ALIGN.LEFT))
    return out


def node(slide, x, y, w, h, text, fill, tcolor=None, line=None, line_w=1.0,
         size=11, bold=True, shape=MSO_SHAPE.ROUNDED_RECTANGLE):
    box = c.add_box(slide, x, y, w, h, fill=fill, line=line or R("border"),
                    line_w=line_w, shape=shape)
    c.set_shape_text(box, text, size=size, bold=bold,
                     color=tcolor or R("header_text"))
    return box


def arrow(slide, x, y, w, h, direction="right", color=None, text=None, size=10):
    shp = {"right": MSO_SHAPE.RIGHT_ARROW, "down": MSO_SHAPE.DOWN_ARROW,
           "left": MSO_SHAPE.LEFT_ARROW, "up": MSO_SHAPE.UP_ARROW,
           "lr": MSO_SHAPE.LEFT_RIGHT_ARROW}[direction]
    a = c.add_box(slide, x, y, w, h, fill=color or R("accent_point"),
                  line=None, shape=shp)
    if text:
        c.set_shape_text(a, text, size=size, bold=True, color=R("header_text"))
    return a


def band_label(slide, x, y, w, h, text, fill, size=12):
    lb = c.add_box(slide, x, y, w, h, fill=fill, line=None,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(lb, text, size=size, bold=True, color=R("header_text"))
    return lb


# =========================================================
# SVC-009  레이어드 스택 (5계층 수직 적층 아키텍처)
# =========================================================
def layered_stack(slide, aid):
    S = titles(slide, "레이어드 아키텍처 (5계층 스택)",
               "표현 → 애플리케이션 → 도메인 → 데이터 접근 → 인프라 (상위 계층에서 하위 계층으로 적층)")
    x0, w = 1.35, 10.6
    y, lh, gap = 1.5, 0.92, 0.28
    lab_w = 3.5
    layers = [
        ("표현 계층 · Presentation", ["웹 UI", "모바일 UI", "관리자 콘솔"],
         CC["navy_800"], R("accent_primary")),
        ("애플리케이션 계층 · Application", ["업무 서비스", "워크플로우", "알림 처리"],
         CC["navy_600"], R("accent_point")),
        ("도메인 계층 · Domain", ["비즈니스 로직", "규칙 엔진", "도메인 모델"],
         R("accent_secondary"), R("accent_secondary")),
        ("데이터 접근 계층 · Data Access", ["ORM 매퍼", "캐시", "쿼리 빌더"],
         R("sub_header"), R("sub_header")),
        ("인프라 계층 · Infrastructure", ["데이터베이스", "스토리지", "네트워크"],
         R("accent_primary"), R("accent_primary")),
    ]
    for i, (lab, items, lfill, icol) in enumerate(layers):
        ly = y + i * (lh + gap)
        S.append(band_label(slide, x0, ly, lab_w, lh, lab, lfill, size=11))
        n = len(items); g = 0.2
        iw = (w - lab_w - 0.3 - g * (n - 1)) / n
        ix = x0 + lab_w + 0.3
        for j, it in enumerate(items):
            S.append(node(slide, ix + j * (iw + g), ly, iw, lh, it,
                          fill=CC["gray_050"], tcolor=R("body_text"),
                          line=icol, line_w=1.5, size=11))
        if i < len(layers) - 1:
            S.append(arrow(slide, x0 + w / 2 - 0.22, ly + lh + 0.01, 0.44,
                           gap - 0.02, "down", color=R("accent_point")))
    c.group_asset(slide, S, aid)


# =========================================================
# SVC-010  통합/연계 맵 (중앙 시스템 + 주변 연동 모듈 아이콘박스)
# =========================================================
def integration_map(slide, aid):
    S = titles(slide, "시스템 통합·연계 맵 (EAI / ESB)",
               "중앙 통합 버스 ↔ 주변 연동 시스템 (표준 인터페이스 기반 데이터 연계)")
    cx, cy = SW / 2, 4.45
    cw, ch = 3.3, 1.7
    center = c.add_box(slide, cx - cw / 2, cy - ch / 2, cw, ch, fill=CC["navy_800"],
                       line=R("accent_primary"), line_w=2.0,
                       shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(center, "통합 연계 버스\n(ESB / API Gateway)", size=13,
                     bold=True, color=R("header_text"))
    S.append(center)
    mods = [("그룹웨어", "G"), ("ERP", "E"), ("회계 시스템", "₩"),
            ("인사 시스템", "H"), ("대외 기관", "X"), ("SSO 인증", "A")]
    mw, mh = 2.8, 1.0
    lx, rx = 0.85, SW - 0.85 - mw
    ys = [2.15, 3.75, 5.35]
    positions = [(lx, ys[0]), (lx, ys[1]), (lx, ys[2]),
                 (rx, ys[0]), (rx, ys[1]), (rx, ys[2])]
    cols = [R("accent_primary"), R("accent_point"), R("accent_secondary"),
            R("sub_header"), R("accent_primary"), R("accent_secondary")]
    for k, ((mx, my), (label, ic)) in enumerate(zip(positions, mods)):
        S.append(c.add_box(slide, mx, my, mw, mh, fill=CC["gray_050"],
                           line=cols[k], line_w=1.5,
                           shape=MSO_SHAPE.ROUNDED_RECTANGLE))
        icon = c.add_box(slide, mx + 0.18, my + mh / 2 - 0.32, 0.64, 0.64,
                         fill=cols[k], line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        c.set_shape_text(icon, ic, size=15, bold=True, color=R("header_text"))
        S.append(icon)
        S.append(c.add_text(slide, mx + 0.95, my, mw - 1.05, mh, label, size=12,
                            bold=True, color=R("body_text"), align=PP_ALIGN.LEFT))
        if mx == lx:
            S.append(c.connector(slide, mx + mw, my + mh / 2, cx - cw / 2, cy,
                                 color=R("muted_text"), w=1.75))
        else:
            S.append(c.connector(slide, mx, my + mh / 2, cx + cw / 2, cy,
                                 color=R("muted_text"), w=1.75))
    c.group_asset(slide, S, aid)


# =========================================================
# SVC-011  보안 아키텍처 (영역 구분 + 방화벽 계층)
# =========================================================
def security_arch(slide, aid):
    S = titles(slide, "보안 아키텍처 (구간 분리 · 방화벽 계층)",
               "외부 → DMZ → 내부 3구간, 계층별 방화벽으로 트래픽 통제")
    x0, w = 1.1, 11.1
    y, zh, fh, gap = 1.55, 1.15, 0.55, 0.16
    lab_w = 3.1
    layout = [
        ("zone", "외부 구간 · Untrusted", ["일반 사용자", "외부 기관", "인터넷"], R("warn")),
        ("fw", "DMZ 방화벽 (Perimeter Firewall)"),
        ("zone", "DMZ 구간 · Semi-Trusted", ["WAF", "리버스 프록시", "웹 서버"], R("sub_header")),
        ("fw", "내부 방화벽 (Internal Firewall)"),
        ("zone", "내부 구간 · Trusted", ["WAS", "운영 DB", "내부 시스템"], R("accent_secondary")),
    ]
    cyc = y
    for item in layout:
        if item[0] == "zone":
            _, label, items, icol = item
            S.append(c.add_box(slide, x0, cyc, w, zh, fill=CC["gray_050"],
                               line=icol, line_w=1.5,
                               shape=MSO_SHAPE.ROUNDED_RECTANGLE))
            S.append(band_label(slide, x0 + 0.12, cyc + 0.16, lab_w, zh - 0.32,
                                label, icol, size=11))
            n = len(items); g = 0.2
            area_x = x0 + lab_w + 0.3
            area_w = w - lab_w - 0.5
            bw = (area_w - g * (n - 1)) / n
            for j, it in enumerate(items):
                S.append(node(slide, area_x + j * (bw + g), cyc + 0.2, bw, zh - 0.4,
                              it, fill=R("row_base"), tcolor=R("body_text"),
                              line=icol, line_w=1.0, size=11))
            cyc += zh + gap
        else:
            fw = c.add_box(slide, x0, cyc, w, fh, fill=R("warn"), line=None,
                           shape=MSO_SHAPE.ROUNDED_RECTANGLE)
            c.set_shape_text(fw, "\U0001F512 " + item[1], size=12, bold=True,
                             color=R("header_text"))
            S.append(fw)
            S.append(arrow(slide, x0 + 0.7, cyc - gap - 0.02, 0.34, fh + 2 * gap,
                           "down", color=R("navy_900") if False else R("accent_primary")))
            S.append(arrow(slide, x0 + w - 1.04, cyc - gap - 0.02, 0.34, fh + 2 * gap,
                           "down", color=R("accent_primary")))
            cyc += fh + gap
    c.group_asset(slide, S, aid)


# =========================================================
# SVC-012  클라우드 구성도 (클라우드 도형 안 서비스 블록)
# =========================================================
def cloud_arch(slide, aid):
    S = titles(slide, "클라우드 인프라 구성도",
               "클라우드 VPC 내 관리형 서비스 블록 구성 + 온프레미스 전용선 연계")
    cloud = c.add_box(slide, 1.2, 1.5, 10.9, 3.7, fill=CC["gray_050"],
                      line=R("accent_primary"), line_w=2.0, shape=MSO_SHAPE.CLOUD)
    S.append(cloud)
    S.append(c.add_text(slide, 2.4, 1.62, 4.0, 0.35, "Cloud VPC", size=12,
                        bold=True, color=R("accent_primary"), align=PP_ALIGN.LEFT))
    services = [("로드밸런서", "LB"), ("컴퓨팅 (VM)", "EC2"), ("컨테이너 (K8s)", "POD"),
                ("관리형 DB", "RDS"), ("오브젝트 스토리지", "S3"), ("CDN · 캐시", "CDN")]
    gx0, gy0, gw, gh = 2.5, 2.25, 9.3, 2.5
    cols, rows = 3, 2
    cw = (gw - 0.3 * (cols - 1)) / cols
    chh = (gh - 0.3 * (rows - 1)) / rows
    palette = [R("accent_point"), R("accent_primary"), R("accent_secondary"),
               R("sub_header"), R("accent_primary"), R("accent_point")]
    for k, (name, tag) in enumerate(services):
        r, cc = k // cols, k % cols
        bx = gx0 + cc * (cw + 0.3)
        by = gy0 + r * (chh + 0.3)
        S.append(node(slide, bx, by, cw, chh, name + "\n" + tag,
                      fill=R("row_base"), tcolor=R("body_text"),
                      line=palette[k], line_w=1.5, size=11))
    onp = c.add_box(slide, 4.35, 6.0, 4.6, 0.95, fill=CC["navy_800"], line=None,
                    shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(onp, "온프레미스 데이터센터 (전용선 연계)", size=12, bold=True,
                     color=R("header_text"))
    S.append(onp)
    S.append(arrow(slide, SW / 2 - 0.28, 5.35, 0.56, 0.62, "up",
                   color=R("accent_point")))
    c.group_asset(slide, S, aid)


# =========================================================
# SVC-013  Before/After 시스템 대비 (2열)
# =========================================================
def before_after(slide, aid):
    S = titles(slide, "시스템 개선 전·후 비교 (As-Is / To-Be)",
               "기존 분산·수기 환경에서 통합·자동화 플랫폼으로 전환")
    colw, y, chh = 5.0, 1.75, 4.95
    lx, rx = 0.7, SW - 0.7 - colw
    hh = 0.75
    before = ["시스템 분산 운영", "수기 데이터 입력", "데이터 사일로 고립",
              "실시간 처리 불가", "수동 모니터링"]
    after = ["단일 통합 플랫폼", "자동 연계·수집", "통합 데이터 관리",
             "실시간 처리·분석", "지능형 관제·알림"]
    for x, title_txt, items, col in [
            (lx, "As-Is (개선 전)", before, R("warn")),
            (rx, "To-Be (개선 후)", after, R("accent_secondary"))]:
        S.append(c.add_box(slide, x, y, colw, chh, fill=CC["gray_050"],
                           line=col, line_w=1.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE))
        S.append(band_label(slide, x, y, colw, hh, title_txt, col, size=14))
        for j, it in enumerate(items):
            iy = y + hh + 0.28 + j * 0.78
            S.append(node(slide, x + 0.28, iy, colw - 0.56, 0.62, it,
                          fill=R("row_base"), tcolor=R("body_text"),
                          line=col, line_w=1.0, size=12))
    ax = (lx + colw + rx) / 2
    S.append(arrow(slide, ax - 0.8, y + chh / 2 - 0.55, 1.6, 1.1, "right",
                   color=R("accent_primary"), text="전환\n개선", size=12))
    c.group_asset(slide, S, aid)


# =========================================================
# SVC-014  마이크로서비스 그리드 (모듈 카드 격자)
# =========================================================
def microservices(slide, aid):
    S = titles(slide, "마이크로서비스 구성도",
               "API Gateway · 독립 서비스 모듈 격자 · 이벤트 버스 (비동기 연계)")
    x0, w = 0.9, 11.5
    gw = c.add_box(slide, x0, 1.5, w, 0.72, fill=CC["navy_800"], line=None,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(gw, "API Gateway (라우팅 · 인증 · 로드밸런싱)", size=13,
                     bold=True, color=R("header_text"))
    S.append(gw)
    services = ["사용자 서비스", "주문 서비스", "결제 서비스",
                "상품 서비스", "배송 서비스", "정산 서비스",
                "알림 서비스", "검색 서비스", "리뷰 서비스"]
    palette = [R("accent_primary"), R("accent_point"), R("accent_secondary"),
               R("sub_header"), R("accent_primary"), R("accent_point"),
               R("accent_secondary"), R("sub_header"), R("accent_primary")]
    cols, rows = 3, 3
    g = 0.3
    cw = (w - g * (cols - 1)) / cols
    chh = 1.0
    gy0 = 2.65
    top_centers, bot_centers = [], []
    for k, name in enumerate(services):
        r, cc = k // cols, k % cols
        bx = x0 + cc * (cw + g)
        by = gy0 + r * (chh + 0.28)
        S.append(node(slide, bx, by, cw, chh, name + "\nREST · gRPC",
                      fill=R("row_base"), tcolor=R("body_text"),
                      line=palette[k], line_w=1.5, size=11))
        if r == 0:
            top_centers.append((bx + cw / 2, by))
        if r == rows - 1:
            bot_centers.append((bx + cw / 2, by + chh))
    for (mx, my) in top_centers:
        S.append(c.connector(slide, mx, 2.22, mx, my, color=R("muted_text"), w=1.5))
    ebus_y = gy0 + rows * chh + (rows - 1) * 0.28 + 0.3
    eb = c.add_box(slide, x0, ebus_y, w, 0.7, fill=R("accent_secondary"), line=None,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    c.set_shape_text(eb, "Event Bus / Message Queue (Kafka · 비동기 이벤트)",
                     size=12, bold=True, color=R("header_text"))
    S.append(eb)
    for (mx, my) in bot_centers:
        S.append(c.connector(slide, mx, my, mx, ebus_y, color=R("muted_text"), w=1.5))
    c.group_asset(slide, S, aid)


# =========================================================
# SVC-015  데이터 파이프라인 (수집→변환→적재→분석 + DB)
# =========================================================
def data_pipeline(slide, aid):
    S = titles(slide, "데이터 파이프라인 구성도",
               "수집 → 변환 → 적재 → 분석 4단계 처리 + 데이터 웨어하우스 적재/조회")
    x0, w = 0.9, 11.5
    stages = [
        ("수집 · Ingest", ["로그 수집", "API 연동", "스트리밍"], R("accent_primary")),
        ("변환 · Transform", ["정제·검증", "표준화", "가공·매핑"], R("accent_point")),
        ("적재 · Load", ["DW 적재", "파티셔닝", "인덱싱"], R("accent_secondary")),
        ("분석 · Analyze", ["집계·통계", "ML 모델", "리포트"], R("sub_header")),
    ]
    n = len(stages); agap = 0.62
    cw = (w - agap * (n - 1)) / n
    y, sh = 1.75, 2.05
    centers = []
    for i, (name, items, col) in enumerate(stages):
        sx = x0 + i * (cw + agap)
        S.append(c.add_box(slide, sx, y, cw, sh, fill=CC["gray_050"], line=col,
                           line_w=1.75, shape=MSO_SHAPE.ROUNDED_RECTANGLE))
        hd = c.add_box(slide, sx, y, cw, 0.6, fill=col, line=None,
                       shape=MSO_SHAPE.ROUND_2_SAME_RECTANGLE)
        c.set_shape_text(hd, name, size=12, bold=True, color=R("header_text"))
        S.append(hd)
        for j, it in enumerate(items):
            S.append(node(slide, sx + 0.2, y + 0.72 + j * 0.42, cw - 0.4, 0.36, it,
                          fill=R("row_base"), tcolor=R("body_text"),
                          line=col, line_w=1.0, size=10))
        centers.append((sx, sx + cw))
        if i < n - 1:
            S.append(arrow(slide, sx + cw + 0.04, y + sh / 2 - 0.24, agap - 0.08,
                           0.48, "right", color=R("accent_point")))
    # 데이터 웨어하우스 (원통) — 적재→DW, DW→분석
    db_w, db_h = 2.7, 1.35
    db_x = (centers[2][0] + centers[3][1]) / 2 - db_w / 2
    db_y = 5.15
    db = c.add_box(slide, db_x, db_y, db_w, db_h, fill=CC["navy_800"], line=None,
                   shape=MSO_SHAPE.CAN)
    c.set_shape_text(db, "데이터 웨어하우스", size=12, bold=True, color=R("header_text"))
    S.append(db)
    S.append(c.connector(slide, centers[2][0] + cw / 2, y + sh, db_x + db_w * 0.3,
                         db_y, color=R("accent_secondary"), w=1.75))
    S.append(c.connector(slide, db_x + db_w * 0.7, db_y, centers[3][0] + cw / 2,
                         y + sh, color=R("sub_header"), w=1.75))
    c.group_asset(slide, S, aid)


# =========================================================
# SVC-016  사용자 여정 맵 (단계별 터치포인트)
# =========================================================
def user_journey(slide, aid):
    S = titles(slide, "사용자 여정 맵 (User Journey Map)",
               "인지 → 탐색 → 가입 → 이용 → 재방문 단계별 터치포인트·사용자 감정")
    stages = [
        ("인지", "포털 배너 · SNS 광고", "관심", R("accent_primary")),
        ("탐색", "홈페이지 · 검색 · 후기", "기대", R("accent_point")),
        ("가입", "회원가입 · 본인인증", "신중", R("accent_secondary")),
        ("이용", "신청서 · 알림 · 상담", "만족", R("sub_header")),
        ("재방문", "마이페이지 · 추천", "충성", R("accent_primary")),
    ]
    x0, w = 0.7, 11.9
    n = len(stages); g = 0.25
    cw = (w - g * (n - 1)) / n
    ch_y, ch_h = 1.7, 0.85
    tp_y, tp_h = 2.85, 1.5
    em_y, em_h = 4.6, 1.2
    centers = []
    for i, (name, tp, em, col) in enumerate(stages):
        sx = x0 + i * (cw + g)
        chev = c.add_box(slide, sx, ch_y, cw, ch_h, fill=col, line=None,
                         shape=MSO_SHAPE.CHEVRON)
        c.set_shape_text(chev, "%d. %s" % (i + 1, name), size=13, bold=True,
                         color=R("header_text"))
        S.append(chev)
        S.append(node(slide, sx, tp_y, cw, tp_h, "터치포인트\n" + tp,
                      fill=CC["gray_050"], tcolor=R("body_text"),
                      line=col, line_w=1.5, size=11))
        S.append(node(slide, sx, em_y, cw, em_h, "사용자 감정\n" + em,
                      fill=R("row_base"), tcolor=col, line=col, line_w=1.0, size=11))
        centers.append((sx, sx + cw))
        if i < n - 1:
            ax = sx + cw + (g - 0.34) / 2
            S.append(arrow(slide, ax, em_y + em_h / 2 - 0.16, 0.34, 0.32, "right",
                           color=R("muted_text")))
    # 여정 진행선 (하단)
    S.append(arrow(slide, x0, em_y + em_h + 0.35, w, 0.34, "right",
                   color=R("accent_point"), text="사용자 여정 흐름 (인지 → 재방문)"))
    c.group_asset(slide, S, aid)


# =========================================================
# 빌드
# =========================================================
entries = []


def E(*a, **k):
    entries.append(c.entry(*a, **k))


# ---- FILE A: 아키텍처 (SVC-009~012) ----
pA = c.new_deck()
s = c.blank_slide(pA); c.id_caption(s, "SVC-009"); layered_stack(s, "SVC-009")
s = c.blank_slide(pA); c.id_caption(s, "SVC-010"); integration_map(s, "SVC-010")
s = c.blank_slide(pA); c.id_caption(s, "SVC-011"); security_arch(s, "SVC-011")
s = c.blank_slide(pA); c.id_caption(s, "SVC-012"); cloud_arch(s, "SVC-012")
FA = "decks/07_service/SVC_architecture_v2.pptx"
fA = c.save_deck(pA, FA)

# ---- FILE B: 흐름/대비 (SVC-013~016) ----
pB = c.new_deck()
s = c.blank_slide(pB); c.id_caption(s, "SVC-013"); before_after(s, "SVC-013")
s = c.blank_slide(pB); c.id_caption(s, "SVC-014"); microservices(s, "SVC-014")
s = c.blank_slide(pB); c.id_caption(s, "SVC-015"); data_pipeline(s, "SVC-015")
s = c.blank_slide(pB); c.id_caption(s, "SVC-016"); user_journey(s, "SVC-016")
FB = "decks/07_service/SVC_flow-compare_v2.pptx"
fB = c.save_deck(pB, FB)

# =========================================================
# 매니페스트 엔트리
# =========================================================
E("SVC-009", "service", "레이어드 아키텍처 (5계층 스택)", FA, 1,
  ["구조도", "아키텍처", "레이어드", "5계층", "스택", "수직적층"],
  {"layout": "layered-stack", "layers": 5, "flow": "top-down"},
  {"layers": [
      {"name": "표현", "items": ["웹 UI", "모바일 UI", "관리자 콘솔"]},
      {"name": "애플리케이션", "items": ["업무 서비스", "워크플로우", "알림 처리"]},
      {"name": "도메인", "items": ["비즈니스 로직", "규칙 엔진", "도메인 모델"]},
      {"name": "데이터 접근", "items": ["ORM 매퍼", "캐시", "쿼리 빌더"]},
      {"name": "인프라", "items": ["데이터베이스", "스토리지", "네트워크"]}],
   "flow": "top-down"},
  ["layer_labels", "layer_items", "layer_color", "arrows"],
  recommended_use=["시스템 구성", "기술 아키텍처", "계층 구조"])

E("SVC-010", "service", "시스템 통합·연계 맵 (EAI/ESB)", FA, 2,
  ["구조도", "통합", "연계", "EAI", "ESB", "연동맵"],
  {"layout": "center-hub-icons", "modules": 6, "flow": "bidirectional"},
  {"layers": [
      {"name": "통합버스", "items": ["ESB / API Gateway"]},
      {"name": "연동시스템", "items": ["그룹웨어", "ERP", "회계 시스템", "인사 시스템", "대외 기관", "SSO 인증"]}],
   "flow": "hub-radial-bidirectional"},
  ["center_label", "module_labels", "module_icons", "module_color", "connectors"],
  recommended_use=["시스템 통합", "연계 구조", "서비스 연동"])

E("SVC-011", "service", "보안 아키텍처 (구간 분리·방화벽)", FA, 3,
  ["구조도", "보안", "아키텍처", "방화벽", "구간분리", "DMZ"],
  {"layout": "security-zones", "zones": 3, "firewalls": 2, "flow": "top-down"},
  {"layers": [
      {"name": "외부 구간", "items": ["일반 사용자", "외부 기관", "인터넷"]},
      {"name": "DMZ 방화벽", "items": ["Perimeter Firewall"]},
      {"name": "DMZ 구간", "items": ["WAF", "리버스 프록시", "웹 서버"]},
      {"name": "내부 방화벽", "items": ["Internal Firewall"]},
      {"name": "내부 구간", "items": ["WAS", "운영 DB", "내부 시스템"]}],
   "flow": "top-down"},
  ["zone_labels", "zone_items", "firewall_labels", "zone_color", "arrows"],
  recommended_use=["보안 아키텍처", "인프라 보안", "네트워크 구성"])

E("SVC-012", "service", "클라우드 인프라 구성도", FA, 4,
  ["구조도", "클라우드", "인프라", "VPC", "아키텍처", "온프레미스"],
  {"layout": "cloud-container", "services": 6, "flow": "bottom-up"},
  {"layers": [
      {"name": "클라우드 VPC", "items": ["로드밸런서", "컴퓨팅 (VM)", "컨테이너 (K8s)", "관리형 DB", "오브젝트 스토리지", "CDN·캐시"]},
      {"name": "온프레미스", "items": ["온프레미스 데이터센터"]}],
   "flow": "bottom-up"},
  ["cloud_label", "service_blocks", "service_color", "onprem_label", "arrow"],
  recommended_use=["클라우드 구성", "인프라 아키텍처", "시스템 구성"])

E("SVC-013", "service", "시스템 개선 전·후 비교 (As-Is/To-Be)", FB, 1,
  ["구조도", "비교", "전후", "AsIs", "ToBe", "개선"],
  {"layout": "before-after", "columns": 2, "rows": 5, "flow": "left-right"},
  {"layers": [
      {"name": "As-Is", "items": ["시스템 분산 운영", "수기 데이터 입력", "데이터 사일로 고립", "실시간 처리 불가", "수동 모니터링"]},
      {"name": "To-Be", "items": ["단일 통합 플랫폼", "자동 연계·수집", "통합 데이터 관리", "실시간 처리·분석", "지능형 관제·알림"]}],
   "flow": "left-right"},
  ["before_items", "after_items", "column_color", "center_arrow"],
  recommended_use=["개선 효과", "전후 비교", "사업 필요성"])

E("SVC-014", "service", "마이크로서비스 구성도 (모듈 격자)", FB, 2,
  ["구조도", "마이크로서비스", "MSA", "격자", "게이트웨이", "이벤트버스"],
  {"layout": "msa-grid", "services": 9, "grid": "3x3", "flow": "gateway-bus"},
  {"layers": [
      {"name": "게이트웨이", "items": ["API Gateway"]},
      {"name": "서비스", "items": ["사용자", "주문", "결제", "상품", "배송", "정산", "알림", "검색", "리뷰"]},
      {"name": "이벤트버스", "items": ["Event Bus / Message Queue"]}],
   "flow": "gateway-services-bus"},
  ["gateway_label", "service_cards", "service_color", "bus_label", "connectors"],
  recommended_use=["MSA 구조", "서비스 구성", "시스템 아키텍처"])

E("SVC-015", "service", "데이터 파이프라인 구성도", FB, 3,
  ["구조도", "데이터파이프라인", "ETL", "흐름도", "DW", "적재"],
  {"layout": "pipeline-with-db", "stages": 4, "flow": "left-right"},
  {"layers": [
      {"name": "수집", "items": ["로그 수집", "API 연동", "스트리밍"]},
      {"name": "변환", "items": ["정제·검증", "표준화", "가공·매핑"]},
      {"name": "적재", "items": ["DW 적재", "파티셔닝", "인덱싱"]},
      {"name": "분석", "items": ["집계·통계", "ML 모델", "리포트"]},
      {"name": "저장소", "items": ["데이터 웨어하우스"]}],
   "flow": "left-right"},
  ["stage_labels", "stage_items", "stage_color", "db_label", "arrows", "connectors"],
  recommended_use=["데이터 처리", "파이프라인", "ETL 흐름"])

E("SVC-016", "service", "사용자 여정 맵 (User Journey)", FB, 4,
  ["구조도", "사용자여정", "저니맵", "터치포인트", "UX", "단계"],
  {"layout": "journey-map", "stages": 5, "flow": "left-right"},
  {"layers": [
      {"name": "단계", "items": ["인지", "탐색", "가입", "이용", "재방문"]},
      {"name": "터치포인트", "items": ["포털 배너·SNS", "홈페이지·검색·후기", "회원가입·본인인증", "신청서·알림·상담", "마이페이지·추천"]},
      {"name": "사용자감정", "items": ["관심", "기대", "신중", "만족", "충성"]}],
   "flow": "left-right"},
  ["stage_labels", "touchpoints", "emotions", "stage_color", "arrows"],
  recommended_use=["사용자 경험", "여정 설계", "서비스 기획"])

frag = c.write_fragment("SVC_v2", entries)

print("FILE_A", fA)
print("FILE_B", fB)
print("FRAG", frag)
print("ENTRIES", len(entries))
