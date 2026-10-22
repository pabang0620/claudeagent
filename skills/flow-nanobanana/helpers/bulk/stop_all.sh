#!/bin/bash
# 모든 생성(일꾼, 큐, 생성기, 한 번 제출 창)을 멈춘다.
for p in $(pgrep -f "nb_worker[.]sh|run_queue_v2[.]sh|run_chapter2[.]sh|node tools/nb/nb_gen[.]mjs|nb_once[.]mjs"); do
  [ "$p" != "$$" ] && kill "$p" 2>/dev/null
done
sleep 3
rm -f ~/.flow_profiles/*/Singleton*
