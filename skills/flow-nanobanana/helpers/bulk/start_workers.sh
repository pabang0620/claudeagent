#!/bin/bash
# 돌고 있는 큐·일꾼·생성기를 모두 멈추고, 계정별 일꾼 세 개를 시작한다.
# 사용: bash tools/nb/start_workers.sh 03 01 04 04_5 05   (장 키는 두 번 훑는다: 첫 바퀴에서 시트 대기로 건너뛴 컷을 둘째 바퀴가 채운다)
cd "$(dirname "$0")/../.."
export NB_HEADLESS=${NB_HEADLESS:-1}   # 기본은 창 없이 백그라운드. 창을 보려면 NB_HEADLESS=0
for p in $(pgrep -f "run_queue_v2[.]sh|run_chapter2[.]sh|nb_worker[.]sh|node tools/nb/nb_gen[.]mjs"); do
  [ "$p" != "$$" ] && kill "$p" 2>/dev/null
done
sleep 3
for a in lwh970924 lwh497 pabang0620; do
  setsid nohup bash tools/nb/nb_worker.sh "$a" "$@" "$@" > "tools/nb/worker_$a.out" 2>&1 < /dev/null &
  sleep 5
done
