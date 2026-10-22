#!/bin/bash
# 계정별 일꾼. 남은 일(시트 -> 장 순서)을 장면 단위로 몫을 나눠 맡고, 목록을 끝내면 다시 남은 일을 확인해 이어서 한다.
# 막히면(차단 문구) 이 계정은 1시간 쉬었다가 돌아온다. 다른 계정은 영향 없이 계속한다.
# 사용: bash tools/nb/nb_worker.sh <계정> <장 키들...>   예: bash tools/nb/nb_worker.sh lwh497 03 01 04 04_5 05
# 몫 나누기: 지금 쉬지 않는 계정 수 N과 내 순번 k로 `--part k/N` (남은 작업 기준이라 늦게 돌아온 계정도 자동으로 몫을 가진다)
cd "$(dirname "$0")/../.."
ME=$1; shift
for target in sheets "$@"; do
  # 이미 다 끝난 대상은 기다리지 않고 바로 넘어간다(끝난 장마다 1분씩 허비하던 것)
  total=$(python3 tools/nb/nb_jobs.py "$ME" --only "$target" | head -1 | sed -E 's/.*남은 컷 ([0-9]+)장.*/\1/')
  if [ "$total" == "0" ]; then echo "$ME 건너뜀(이미 완료): $target"; continue; fi
  empty=0
  while [ $empty -lt 2 ]; do
    ACT=($(python3 tools/nb/active_accounts.py))
    k=0; for i in "${!ACT[@]}"; do [ "${ACT[$i]}" == "$ME" ] && k=$((i+1)); done
    if [ $k -eq 0 ]; then sleep 120; continue; fi   # 내가 차단 휴식 중
    out=$(python3 tools/nb/nb_jobs.py "$ME" --only "$target" --part $k/${#ACT[@]} | head -1)
    cnt=$(echo "$out" | sed -E 's/.*남은 컷 ([0-9]+)장.*/\1/')
    if [ "$cnt" == "0" ]; then empty=$((empty+1)); sleep 30; continue; fi
    empty=0
    rm -f ~/.flow_profiles/$ME/Singleton*
    node tools/nb/nb_gen.mjs "$ME" > tools/nb/run_$ME.out 2>&1
    # 시트는 한 번만 훑는다(계속 실패하는 시트 하나가 장 그리기를 막지 않게)
    [ "$target" == "sheets" ] && break
  done
  echo "$ME 끝: $target"
done
echo "$ME 전부 끝"
