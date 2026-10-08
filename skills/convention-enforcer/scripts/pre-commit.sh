#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# ce-002: Admin 라우트 권한 검증
node backend/scripts/verifyAdminRoutes.js || exit 1

# ce-001: staged JSX/TSX 파일에서 경로 리터럴 탐지
STAGED=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(jsx|tsx|js|ts)$' || true)
if [ -n "$STAGED" ]; then
  VIOLATION=0
  for f in $STAGED; do
    if grep -nE "(navigate\s*\(|<Link[^>]+to=|<Navigate[^>]+to=|href=)\{?[\"'\`][/]" "$f" 2>/dev/null \
       | grep -vE "(http|https|mailto|tel|^[[:space:]]*//)"; then
      echo "[ce-001] $f: 경로 리터럴 감지 - ROUTES 상수 사용"
      VIOLATION=1
    fi
    # ce-003: Zustand 전체 구독 (macOS BSD grep 호환 POSIX 문자 클래스)
    if grep -nE "use[A-Z][a-zA-Z]*Store[[:space:]]*\([[:space:]]*\)|use[A-Z][a-zA-Z]*Store[[:space:]]*\([[:space:]]*\([a-z]\)[[:space:]]*=>[[:space:]]*[a-z][[:space:]]*\)" "$f" 2>/dev/null; then
      echo "[ce-003] $f: Zustand 전체 구독 감지 - 개별 셀렉터 사용"
      VIOLATION=1
    fi
  done
  [ $VIOLATION -eq 1 ] && exit 1
fi
