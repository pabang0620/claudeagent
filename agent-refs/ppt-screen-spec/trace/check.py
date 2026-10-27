import re, os, sys, collections
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
from rules_data import R
ORIG = os.path.join(D, "..", "..", "backup", "spec_20261026_정리전.md")
core_p = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "..", "..", "agents", "spec.md")
ref_p = sys.argv[2] if len(sys.argv) > 2 else os.path.join(D, "spec_ref.md")
core = open(core_p, encoding="utf-8").read()
ref = open(ref_p, encoding="utf-8").read()
orig = open(ORIG, encoding="utf-8").read()
tag = lambda t: set(re.findall(r"\b(?:R\d{3}|M\d\d|N\d\d)\b", t))
ct, rt = tag(core), tag(ref)
ids = [r[0] for r in R]
st = collections.Counter(r[4] for r in R)
loc = collections.Counter(r[5] for r in R)
src = collections.Counter(r[1].split(":")[0] for r in R)
errs = []
if len(ids) != len(set(ids)): errs.append("번호 중복")
for rid, s, ln, summ, stt, lc, note in R:
    if lc == "core" and rid not in ct: errs.append(f"{rid} core에 없음")
    if lc == "ref" and rid not in rt: errs.append(f"{rid} ref에 없음")
    if lc == "삭제" and not note: errs.append(f"{rid} 삭제 이유 없음")
    if stt in ("옛", "중복", "충돌") and not note: errs.append(f"{rid} {stt}인데 비고 없음")
missing = [r[0] for r in R if r[5] != "삭제" and r[0] not in ct | rt]
unknown = sorted((ct | rt) - set(ids))
# 원본 spec.md 줄 덮음: 내용 있는 줄이 어떤 R 범위에도 안 들어가는지
cov = set()
for r in R:
    if r[1] != "spec": continue
    for part in r[2].split(","):
        a, *b = part.split("-"); cov.update(range(int(a), int(b[0] if b else a) + 1))
olines = orig.splitlines()
skip = re.compile(r"^\s*$|^#|^---$")
uncov = [i + 1 for i, l in enumerate(olines) if (i + 1) not in cov and not skip.match(l)]
oc, cc, rc = len(orig), len(core), len(ref)
out = ["# 누락 검증표 (coverage)", "",
       "원본: `.claude\\backup\\spec_20261026_정리전.md` (spec.md 정리 전 그대로) + 메모리 9건(M) + 2026-10-26 작업 요령 15건(N)", "",
       "| 번호 | 출처 | 원본 줄 | 규칙 요약 | 상태 | 새 위치 | 비고·대체 |", "|---|---|---|---|---|---|---|"]
for r in R:
    out.append("| " + " | ".join(x.replace("|", "/") for x in r) + " |")
out += ["", "## 자동 검사 결과 (check.py)", "",
        f"- 규칙 개수: **{len(R)}** (spec {src['spec']} · 메모리 {src['mem']} · 세션 {src['세션']})",
        f"- 위치별: core {loc['core']} + ref {loc['ref']} + 삭제 {loc['삭제']} = {loc['core']+loc['ref']+loc['삭제']} → {'일치' if loc['core']+loc['ref']+loc['삭제']==len(R) else '불일치'}",
        f"- 상태별: 유효 {st['유효']} / 신규 {st['신규']} / 옛 {st['옛']} / 중복 {st['중복']} / 충돌 {st['충돌']}",
        f"- 남겨야 할 규칙 중 core·ref 어디에도 없는 것: **{len(missing)}건** {missing if missing else ''}",
        f"- 위치 표시와 태그 불일치·비고 누락: **{len(errs)}건** {errs if errs else ''}",
        f"- 초안에 있으나 목록에 없는 번호: **{len(unknown)}건** {unknown if unknown else ''}",
        f"- 원본 spec.md에서 내용 있는 줄 중 어떤 규칙에도 매핑 안 된 줄: **{len(uncov)}건** {uncov if uncov else ''}",
        f"- 글자 수: 원본 {oc:,} / core {cc:,} ({100*cc/oc:.0f}%) / ref {rc:,}", ""]
open(os.path.join(D, "coverage.md"), "w", encoding="utf-8").write("\n".join(out))
print(f"orig {oc} core {cc} ({100*cc/oc:.0f}%) ref {rc}")
print(dict(st), dict(loc), "missing", missing, "errs", errs, "unknown", unknown, "uncov", uncov)
