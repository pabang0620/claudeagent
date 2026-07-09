"""
독립 감사기 — manifest의 각 에셋을 실제 pptx에서 교차검증.
체크: (1)파일 존재 (2)슬라이드 존재 (3)앵커 shape name 존재 (4)페이지 이미지(<p:pic>) 부재
     (5)ID 중복 (6)네이티브 콘텐츠(sp/tbl/graphicFrame) 존재
사용: python3 generators/audit.py
"""
import json, os, zipfile, re, collections
from pptx import Presentation

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALLOW_PIC = {"BGP", "ICN", "MCK"}  # 이미지 정당 카테고리(배경/아이콘/목업)

def slide_xml(path, idx):
    z = zipfile.ZipFile(path)
    names = sorted([n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
                   key=lambda n: int(re.findall(r"\d+", n)[0]))
    if idx < 1 or idx > len(names):
        return None
    return z.read(names[idx-1]).decode("utf-8")

def main():
    man = json.load(open(os.path.join(ROOT, "manifest.json"), encoding="utf-8"))
    assets = man["assets"]
    problems = []
    ids = collections.Counter(a["id"] for a in assets)
    dups = [k for k, v in ids.items() if v > 1]
    if dups:
        problems.append(("DUP_ID", dups))

    ok = 0
    by_cat = collections.Counter()
    for a in assets:
        aid = a["id"]; f = os.path.join(ROOT, a["file"]); s = a.get("slide", 1)
        anchor = a.get("anchor", "asset:%s" % aid)
        if not os.path.exists(f):
            problems.append((aid, "FILE_MISSING", a["file"])); continue
        xml = slide_xml(f, s)
        if xml is None:
            problems.append((aid, "SLIDE_MISSING", s)); continue
        if ('name="%s"' % anchor) not in xml:
            problems.append((aid, "ANCHOR_MISSING", anchor))
        if a["category"] not in ALLOW_PIC and "<p:pic>" in xml:
            problems.append((aid, "PAGE_IMAGE_PIC", None))
        if not any(t in xml for t in ("<p:sp>", "<a:tbl>", "<p:graphicFrame>")):
            problems.append((aid, "NO_NATIVE_CONTENT", None))
        by_cat[a["category"]] += 1
        ok += 1

    print("=== AUDIT ===")
    print("총 에셋:", len(assets), "| 검증완료:", ok, "| 문제:", len(problems))
    print("카테고리별:", dict(by_cat))
    if problems:
        print("--- 문제 목록 ---")
        for p in problems[:60]:
            print(" ", p)
    else:
        print("문제 없음 — 전 에셋 네이티브·앵커·이미지부재 통과")

if __name__ == "__main__":
    main()
