"""
매니페스트 병합기 — _incoming/manifest_<CAT>.json 조각들을 manifest.json으로 통합하고
INDEX.md(사람용 인덱스)를 재생성한다. 매 웨이브 종료 후 실행. 중복 ID는 나중 것 우선.
사용: python3 generators/merge_manifest.py
"""
import json, os, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    man = json.load(open(os.path.join(ROOT, "manifest.json"), encoding="utf-8"))
    # 기존 + 조각 병합 (id 기준 dedupe, 조각이 최신)
    by_id = {a["id"]: a for a in man.get("assets", [])}
    frag_count = 0
    for fp in sorted(glob.glob(os.path.join(ROOT, "_incoming", "manifest_*.json"))):
        try:
            entries = json.load(open(fp, encoding="utf-8"))
        except Exception as e:
            print("SKIP(파싱실패):", fp, e); continue
        frag_count += 1
        valid_cats = set(man["categories"].keys())
        for e in entries:
            if "id" not in e:
                continue
            # 카테고리 코드 정규화 검증 (ID 접두어 = 정답)
            code = e["id"].split("-")[0]
            if code in valid_cats and e.get("category") != code:
                print("WARN category 교정: %s %s -> %s" % (e["id"], e.get("category"), code))
                e["category"] = code
            by_id[e["id"]] = e
    assets = sorted(by_id.values(), key=lambda a: a["id"])
    man["assets"] = assets

    # 카테고리 카운트 갱신
    cnt = collections.Counter(a["category"] for a in assets)
    for cat, meta in man["categories"].items():
        meta["count"] = cnt.get(cat, 0)
    man["updated"] = "2026-07-04"
    json.dump(man, open(os.path.join(ROOT, "manifest.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    # INDEX.md 재생성
    lines = ["# 에셋 라이브러리 인덱스", "",
             "> 자동 생성(merge_manifest.py). 총 **%d개** 에셋 / %d조각 병합." % (len(assets), frag_count), ""]
    total = len(assets)
    lines.append("## 카테고리별 현황")
    lines.append("")
    lines.append("| 코드 | 카테고리 | 개수 |")
    lines.append("|---|---|---|")
    for cat, meta in man["categories"].items():
        lines.append("| %s | %s | %d |" % (cat, meta["name"], meta["count"]))
    lines.append("| **합계** | | **%d** |" % total)
    lines.append("")
    # 카테고리별 상세
    for cat, meta in man["categories"].items():
        cat_assets = [a for a in assets if a["category"] == cat]
        if not cat_assets:
            continue
        lines.append("## %s — %s (%d)" % (cat, meta["name"], len(cat_assets)))
        lines.append("")
        lines.append("| ID | 이름 | 파일 | S | 태그 | 추천용도 | 라이선스 |")
        lines.append("|---|---|---|---|---|---|---|")
        for a in cat_assets:
            f = os.path.basename(a.get("file", ""))
            tags = ",".join(a.get("tags", [])[:5])
            use = ",".join(a.get("recommended_use", [])[:3])
            lines.append("| %s | %s | %s | %s | %s | %s | %s |" % (
                a["id"], a.get("name", ""), f, a.get("slide", ""), tags, use, a.get("license", "")))
        lines.append("")
    open(os.path.join(ROOT, "INDEX.md"), "w", encoding="utf-8").write("\n".join(lines))
    print("MERGED assets=%d fragments=%d" % (total, frag_count))
    print("per-category:", dict(cnt))

if __name__ == "__main__":
    main()
