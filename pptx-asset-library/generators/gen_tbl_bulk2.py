# -*- coding: utf-8 -*-
"""TBL 2차 대량 확충 — TBL-201 ~ TBL-400 (표 에셋 200종, 총 400 도달).

전략: 기존 gen_tbl_bulk.py 의 14개 구조패밀리 렌더러를 그대로 재사용하되,
  (1) 콘텐츠 풀(THEMES/라벨/내용/조직)을 새 주제군으로 교체(monkeypatch),
  (2) 헤더색을 6색 전체 + navy 명암 3계조로 확장,
  (3) 열수 3~7 / 행수 4~8 / 밀도·정렬 스윕을 넓혀 반복을 제거,
  (4) seed 베이스를 201로 이동해 bulk1(seed 23~) 과도 회전 오프셋을 달리 함.

규칙(기존과 동일):
- 색은 c.role()/c.C[...] 만. 헤더 스윕은 모두 white 헤더텍스트와 대비 확보되는 어두운색.
- 한글은 c.set_kfont / c.add_text 경유. 페이지이미지·SmartArt 금지.
- 단일표: graphicFrame.name='asset:TBL-0NNN'. 결합형(칩/카드): c.group_asset, id_caption은 그룹 밖.
- 파일당 ≤25 슬라이드. 1슬라이드 1에셋. 마지막에 c.write_fragment('TBL_bulk2', entries) 1회.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import gen_tbl_bulk as g  # 14개 패밀리 렌더러 + 헬퍼 재사용

CC = c.C

# =========================================================
# (1) 콘텐츠 풀 교체 — 스마트공장·관광·바이오·ICT·문화콘텐츠·그린뉴딜
#     gen_tbl_bulk 의 모듈 전역을 rebind 하면 패밀리 함수가 새 풀을 참조한다.
# =========================================================
g.THEMES = [
    "스마트공장 고도화", "지능형 생산라인", "지역관광 활성화", "관광 콘텐츠 개발",
    "바이오 신소재", "정밀의료 플랫폼", "ICT 융합 서비스", "클라우드 전환",
    "문화콘텐츠 제작", "실감콘텐츠 확산", "그린뉴딜 전환", "탄소중립 공정",
    "스마트 물류센터", "디지털 트윈", "K-관광 브랜딩", "차세대 통신",
]
g.LABEL_HEADERS = ["구분", "항목", "공정", "영역", "과업", "지표", "부문", "단계",
                   "분류", "기능", "대상", "범주"]
g.ATTR_HEADERS = ["주요 내용", "담당 조직", "추진 일정", "핵심 산출물", "목표 수준",
                  "추진 실적", "가중치", "우선순위", "진행 상태", "비고",
                  "책임자", "기대 효과", "성과 지표", "리스크", "대응 방안"]
g.NUM_HEADERS = ["2024년", "2025년", "2026년(E)", "1분기", "2분기", "3분기",
                 "4분기", "상반기", "하반기", "누적 실적", "연 목표", "달성률", "증감률"]
g.ROW_LABELS = [
    "공정 자동화", "설비 예지보전", "생산 데이터 수집", "품질 검사 고도화", "관광 상품 기획",
    "체험 콘텐츠 운영", "방문객 데이터 분석", "바이오 소재 합성", "임상 데이터 관리", "맞춤형 진단 서비스",
    "ICT 인프라 구축", "클라우드 이관", "API 게이트웨이", "실감 영상 제작", "가상현실 전시",
    "저작권 관리 체계", "탄소배출 저감", "에너지 효율화", "폐자원 순환", "친환경 인증 획득",
    "스마트 센서 배치", "통합 관제 운영", "디지털 트윈 구축", "공급망 최적화", "현지화 마케팅",
]
g.CONTENTS = [
    "공정 데이터 실시간 수집 및 이상 탐지 체계 구축",
    "국내외 관광 수요 분석 기반 상품 라인업 확장",
    "바이오 소재 물성 검증과 인증 절차 병행 추진",
    "클라우드 네이티브 전환으로 확장성·가용성 확보",
    "실감형 콘텐츠 제작과 다국어 현지화 동시 진행",
    "탄소중립 목표 대비 공정별 배출량 저감 이행",
    "AI 품질검사 도입으로 불량률 선제 관리",
    "통합 관제 플랫폼 구축으로 설비 가동률 개선",
    "이해관계자 협의체 운영으로 리스크 선제 대응",
    "성과지표 기반 정량 측정 및 개선과제 도출",
]
g.DEPTS = ["생산기술팀", "스마트공장팀", "관광기획팀", "바이오연구소", "ICT융합팀",
           "클라우드팀", "콘텐츠제작팀", "그린전환팀", "품질관리팀", "데이터분석팀"]

# =========================================================
# (2) 헤더색 확장 — 6색 전체 + navy 명암 3계조(900/800/600)
#     모두 white 헤더텍스트 대비 확보(어두운 색만 선정, cyan 제외)
# =========================================================
HEADER_COLORS2 = [
    ("navy_900", CC["navy_900"]),
    ("navy_800", CC["navy_800"]),
    ("navy_600", CC["navy_600"]),
    ("blue_500", CC["blue_500"]),
    ("teal_500", CC["teal_500"]),
    ("purple_600", CC["purple_600"]),
    ("red_500", CC["red_500"]),
]

FAM_TITLE = g.FAM_TITLE
FAM_FN = g.FAM_FN

# =========================================================
# (3) 스윕 계획 — 200 스펙 (열수 3~7 / 행수 4~8 / 밀도·정렬 확대)
# =========================================================
def build_specs():
    specs = []
    # striped 24: 컴팩트~여유 밀도를 열/행 스윕으로 표현 (3~7열, 4~8행)
    striped_cr = [(3, 5), (3, 7), (4, 4), (4, 6), (4, 8), (5, 5),
                  (5, 7), (6, 4), (6, 6), (6, 8), (7, 5), (7, 7)]
    for (cols, rows) in striped_cr:
        specs.append({"fam": "striped", "cols": cols, "rows": rows})
    for (cols, rows) in striped_cr:  # 헤더색 오프셋이 달라 실질 차이
        specs.append({"fam": "striped", "cols": cols, "rows": rows})

    # (fam, count, [cols opts], [rows opts]) — cols×rows 격자를 순회해 반복 제거
    plan = [
        ("borderless", 16, [3, 4, 5],       [4, 5, 6]),
        ("underline",  16, [3, 4, 5, 6],    [4, 5, 6]),
        ("group2",     14, [5],             [4, 5, 6, 7]),
        ("leftlabel",  16, [4, 5, 6],       [4, 5, 6, 7]),
        ("totalrow",   16, [4, 5, 6],       [4, 5, 6]),
        ("signal",     16, [4, 5, 6],       [4, 5, 6]),
        ("check",      14, [4, 5, 6],       [4, 5, 6]),
        ("kpichip",    12, [4],             [4, 5, 6]),
        ("cardrow",    12, [1],             [3, 4, 5]),
        ("budget",     12, [5],             [4, 5, 6]),
        ("schedule",   12, [4],             [4, 5, 6]),
        ("compact",    12, [6, 7, 8],       [6, 7, 8]),
        ("numeric",     8, [4, 5, 6],       [5, 6, 7]),
    ]
    for fam, cnt, cols_opts, rows_opts in plan:
        for k in range(cnt):
            cols = cols_opts[k % len(cols_opts)]
            rows = rows_opts[(k // len(cols_opts)) % len(rows_opts)]
            specs.append({"fam": fam, "cols": cols, "rows": rows})
    return specs


def build():
    specs = build_specs()
    assert len(specs) == 200, f"spec count={len(specs)} (expected 200)"
    # id/seed/color 부여 — TBL-201 시작, seed 베이스 201
    for idx, sp in enumerate(specs):
        sp["id"] = f"TBL-{201 + idx:03d}"
        sp["seed"] = 201 + idx
        cname, ccol = HEADER_COLORS2[idx % len(HEADER_COLORS2)]
        sp["hcname"] = cname
        sp["hcol"] = ccol

    # 파일 분할: 패밀리별, ≤25 슬라이드 (최대 striped 24)
    from collections import OrderedDict
    by_fam = OrderedDict()
    for sp in specs:
        by_fam.setdefault(sp["fam"], []).append(sp)

    entries = []
    saved_files = []
    for fam, items in by_fam.items():
        chunks = [items[i:i + 24] for i in range(0, len(items), 24)]
        for vi, chunk in enumerate(chunks, start=1):
            frel = f"decks/01_tables/TBL_bulk2_{fam}_v{vi}.pptx"
            prs = c.new_deck()
            fn = FAM_FN[fam]
            for si, sp in enumerate(chunk, start=1):
                slide = c.blank_slide(prs)
                tags, params, bindings, editable, rec = fn(
                    slide, sp["id"], sp["hcname"], sp["hcol"],
                    sp["cols"], sp["rows"], sp["seed"])
                entries.append(c.entry(
                    sp["id"], "TBL",
                    f"{g.THEMES[sp['seed'] % len(g.THEMES)]} {FAM_TITLE[fam]} "
                    f"({sp['hcname']}·{sp['cols']}열)",
                    frel, si, tags, params, bindings, editable, recommended_use=rec))
            out = c.save_deck(prs, frel)
            saved_files.append(frel)
            print("SAVED:", out, f"({len(chunk)} slides)")

    entries.sort(key=lambda e: e["id"])
    frag = c.write_fragment("TBL_bulk2", entries)
    print("FRAGMENT:", frag)
    print("ENTRIES:", len(entries))
    print("FILES:", len(saved_files))


if __name__ == "__main__":
    build()
