"""차단 문구가 최근 1시간 안에 있었고 그 뒤 성공 기록이 없는 계정은 뺀다(사용자 지시 2026-10-21: 막히면 1시간 뒤 다시 해 본다). 출력은 공백으로 구분한 계정 목록."""
import datetime as dt
import re
from pathlib import Path

NB = Path(__file__).resolve().parent
now = dt.datetime.now()
ok = []
for a in ["lwh970924", "lwh497", "pabang0620"]:
    log = NB / f"log_{a}.md"
    blocked = False
    if log.exists():
        for line in log.read_text(encoding="utf-8").splitlines():
            m = re.match(r"- (\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) (차단 문구|.* 성공)", line)
            if not m:
                continue
            if m[3].startswith("차단"):
                blocked = now - dt.datetime.fromisoformat(f"{m[1]} {m[2]}") < dt.timedelta(hours=1)
            else:
                blocked = False  # 차단 뒤에 성공했으면 풀린 것
    if not blocked:
        ok.append(a)
print(" ".join(ok))
