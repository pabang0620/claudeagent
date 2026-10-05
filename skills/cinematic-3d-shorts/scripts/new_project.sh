#!/usr/bin/env bash
# 기준 샘플(sugar-cube)을 새 작업 폴더로 복제한다. 렌더 결과물·node_modules는 복사하지 않는다.
# 사용법: new_project.sh <slug>   -> /home/lee/project/claude-animation/showcase/<slug>/
set -euo pipefail
SLUG="${1:?usage: new_project.sh <slug>}"
SRC=/home/lee/project/claude-animation/showcase/sugar-cube
DST=/home/lee/project/claude-animation/showcase/$SLUG
if [ -e "$DST" ]; then echo "이미 존재: $DST (덮어쓰지 않음)" >&2; exit 1; fi
mkdir -p "$DST/audio" "$DST/build"
cp -r "$SRC/src" "$DST/src"
cp "$SRC/index.html" "$SRC/render.js" "$SRC/audio.py" "$SRC/package.json" "$DST/"
(cd "$DST" && npm i --silent three@0.170.0 playwright-core@1.49 >/dev/null)
echo "생성: $DST"
echo "다음: src/timeline.js(K) -> src/scene.js·build.js(장면) -> src/hud.js(자막) -> audio.py 순서로 고친다"
