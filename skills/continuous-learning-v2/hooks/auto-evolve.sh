#!/bin/bash
# Continuous Learning v2 - Auto-Evolve Hook
#
# Triggered by:
#   - Stop 훅 (세션 종료 시)
#   - observe.sh (20개 tool_complete 마다)
#
# 역할:
#   1. observations.jsonl에 10개 이상의 tool_complete 이벤트가 있으면
#   2. claude -p (headless) 로 observer 에이전트를 실행하여 instinct 파일 생성
#   3. instinct 파일이 3개 이상이면 evolve --generate 실행
#   4. 결과를 evolution-log.jsonl에 기록
#
# 항상 exit 0 반환 (훅 실패 방지)

SKILL_DIR="/home/pabang/myapp/.claude/skills/continuous-learning-v2"
CONFIG_DIR="${HOME}/.claude/homunculus"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
INSTINCTS_DIR="${CONFIG_DIR}/instincts/personal"
EVOLUTION_LOG="${CONFIG_DIR}/evolution-log.jsonl"
LOCK_FILE="${CONFIG_DIR}/.auto-evolve.lock"

# Ensure base directories exist
mkdir -p "$CONFIG_DIR" "$INSTINCTS_DIR" "${CONFIG_DIR}/instincts/inherited"

# Skip if disabled
if [ -f "${CONFIG_DIR}/disabled" ]; then
  exit 0
fi

# Prevent concurrent runs via lock file (max 5 min TTL)
if [ -f "$LOCK_FILE" ]; then
  lock_age=$(( $(date +%s) - $(date -r "$LOCK_FILE" +%s 2>/dev/null || echo 0) ))
  if [ "$lock_age" -lt 300 ]; then
    exit 0
  fi
  rm -f "$LOCK_FILE"
fi
touch "$LOCK_FILE"

cleanup() {
  rm -f "$LOCK_FILE"
}
trap cleanup EXIT

NOW_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ─────────────────────────────────────────────
# Step 1: observations.jsonl에 10개 이상의 tool_complete 이벤트 확인
# ─────────────────────────────────────────────

if [ ! -f "$OBSERVATIONS_FILE" ]; then
  exit 0
fi

COUNTER_FILE="${CONFIG_DIR}/.complete_count"
COMPLETE_COUNT=$(cat "$COUNTER_FILE" 2>/dev/null || echo "0")

if [ "${COMPLETE_COUNT:-0}" -lt 10 ]; then
  exit 0
fi

# ─────────────────────────────────────────────
# Step 2: claude -p (headless) 로 observer 에이전트 실행
# ─────────────────────────────────────────────

OBSERVER_MD="${SKILL_DIR}/agents/observer.md"
OBSERVER_PROMPT="Analyze the recent observations in ${OBSERVATIONS_FILE} and create instinct YAML files in ${INSTINCTS_DIR}/. Focus on patterns with 3+ occurrences. Follow the format specified in ${OBSERVER_MD}."

CLAUDE_BIN=$(command -v claude 2>/dev/null || echo "")

if [ -n "$CLAUDE_BIN" ]; then
  "$CLAUDE_BIN" -p "$OBSERVER_PROMPT" \
    --model haiku \
    --output-format text \
    2>/dev/null || true
fi

# ─────────────────────────────────────────────
# Step 3: instinct 파일이 3개 이상이면 evolve --generate 실행
# ─────────────────────────────────────────────

INSTINCT_COUNT=$(find "$INSTINCTS_DIR" -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')

GENERATED_FILES=""
if [ "${INSTINCT_COUNT:-0}" -ge 3 ]; then
  CLI_SCRIPT="${SKILL_DIR}/scripts/instinct-cli.py"
  if [ -f "$CLI_SCRIPT" ]; then
    GENERATED_FILES=$(python3 "$CLI_SCRIPT" evolve --generate 2>/dev/null || echo "")
  fi
fi

# ─────────────────────────────────────────────
# Step 4: evolution-log.jsonl에 기록
# ─────────────────────────────────────────────

GEN_OUTPUT="$GENERATED_FILES" NOW="$NOW_ISO" CNT="$COMPLETE_COUNT" ICNT="$INSTINCT_COUNT" CLAUDE_OK="$( [ -n "$CLAUDE_BIN" ] && echo "true" || echo "false" )" EVOLOG="$EVOLUTION_LOG" python3 - << 'PYEOF' 2>/dev/null || true
import json, os

log_entry = {
    'timestamp': os.environ.get('NOW', ''),
    'trigger': 'auto-evolve',
    'complete_count': int(os.environ.get('CNT', '0') or '0'),
    'instinct_count': int(os.environ.get('ICNT', '0') or '0'),
    'claude_available': os.environ.get('CLAUDE_OK', 'false') == 'true',
    'generated_output': os.environ.get('GEN_OUTPUT', '')[:2000],
}

log_path = os.environ.get('EVOLOG', '')
try:
    if log_path:
        with open(log_path, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
except Exception:
    pass
PYEOF

exit 0
