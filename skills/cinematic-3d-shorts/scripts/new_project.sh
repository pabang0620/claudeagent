#!/usr/bin/env bash
# 새 작업 폴더를 만든다. 렌더 결과물은 복사하지 않는다.
# 사용법: new_project.sh <slug> [single|process]
#   single  (기본) 10~20초 반전형: sugar-cube 복제
#   process 30~90초 공정형 팀 모드: tower-rise의 공용 엔진(world·mats·timeline·hud·city·render·harness·mix 틀)만 복제
set -euo pipefail
SLUG="${1:?usage: new_project.sh <slug> [single|process]}"; MODE="${2:-single}"
BASE=/home/lee/project/claude-animation/showcase
DST=$BASE/$SLUG
if [ -e "$DST" ]; then echo "이미 존재: $DST (덮어쓰지 않음)" >&2; exit 1; fi
if [ "$MODE" = single ]; then
  SRC=$BASE/sugar-cube
  mkdir -p "$DST/audio" "$DST/build"
  cp -r "$SRC/src" "$DST/src"
  cp "$SRC/index.html" "$SRC/render.js" "$SRC/audio.py" "$SRC/package.json" "$DST/"
  (cd "$DST" && npm i --silent three@0.170.0 playwright-core@1.49 >/dev/null)
  echo "생성: $DST"
  echo "다음: src/timeline.js(K) -> src/scene.js·build.js(장면) -> src/hud.js(자막) -> audio.py 순서로 고친다"
else
  SRC=$BASE/tower-rise
  mkdir -p "$DST/src" "$DST/tests" "$DST/audio/narr" "$DST/research" "$DST/build"
  cp "$SRC/render.js" "$SRC/package.json" "$SRC/package-lock.json" "$SRC/fetch_assets.py" "$SRC/index.html" "$DST/"
  cp "$SRC/src/world.js" "$SRC/src/mats.js" "$SRC/src/timeline.js" "$SRC/src/hud.js" "$SRC/src/city.js" "$DST/src/"
  cp "$SRC/tests/harness.html" "$SRC/tests/smoke_test.js" "$DST/tests/"
  cp "$SRC/audio/mix.py" "$DST/audio/mix_template.py"
  cp "$SRC/CONTRACT.md" "$DST/CONTRACT_example.md"
  cp -al "$SRC/assets" "$DST/assets"           # 하드링크: 디스크 추가 사용 없음. 새 텍스처는 fetch_assets.py에 추가
  (cd "$DST" && npm ci --silent >/dev/null)
  echo "생성: $DST (공정형 팀 모드)"
  echo "다음: CONTRACT.md 작성(CONTRACT_example.md 참고) -> GPU 스모크(tests/smoke_test.js) -> fork 스폰. 절차는 agent-refs/cinematic-team-mode.md"
fi
