#!/bin/bash
# Continuous Learning v2 - Observation Hook
#
# Captures tool use events for pattern analysis.
# Claude Code passes hook data via stdin as JSON.
#
# Hook config (in ~/.claude/settings.json):
# {
#   "hooks": {
#     "PreToolUse": [{
#       "matcher": "*",
#       "hooks": [{ "type": "command", "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh" }]
#     }],
#     "PostToolUse": [{
#       "matcher": "*",
#       "hooks": [{ "type": "command", "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh" }]
#     }]
#   }
# }

# 버그 2 수정: set -e 제거 — 사소한 오류에도 훅 전체가 non-zero exit되는 문제 방지

SKILL_DIR="/home/pabang/myapp/.claude/skills/continuous-learning-v2"
CONFIG_DIR="${HOME}/.claude/homunculus"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
MAX_FILE_SIZE_MB=10

# Ensure directory exists
mkdir -p "$CONFIG_DIR"

# Skip if disabled
if [ -f "$CONFIG_DIR/disabled" ]; then
  exit 0
fi

# Read JSON from stdin (Claude Code hook format)
INPUT_JSON=$(cat)
# 환경변수 크기 안전장치 (ARG_MAX 2MB 한계 방어)
INPUT_JSON="${INPUT_JSON:0:100000}"

# Exit if no input
if [ -z "$INPUT_JSON" ]; then
  exit 0
fi

# 버그 1 수정: 삼중따옴표 injection → 환경변수 방식으로 교체
# $INPUT_JSON에 '''이 포함되면 Python SyntaxError가 발생하는 문제 수정
PARSED=$(INPUT_DATA="$INPUT_JSON" python3 << 'PYEOF'
import json
import os
import sys

try:
    data = json.loads(os.environ.get('INPUT_DATA', '{}'))

    # Extract fields - Claude Code hook format
    hook_type = data.get('hook_type', 'unknown')  # PreToolUse or PostToolUse
    tool_name = data.get('tool_name', data.get('tool', 'unknown'))
    tool_input = data.get('tool_input', data.get('input', {}))
    tool_output = data.get('tool_output', data.get('output', ''))
    session_id = data.get('session_id', 'unknown')

    # Truncate large inputs/outputs
    if isinstance(tool_input, dict):
        tool_input_str = json.dumps(tool_input)[:5000]
    else:
        tool_input_str = str(tool_input)[:5000]

    if isinstance(tool_output, dict):
        tool_output_str = json.dumps(tool_output)[:5000]
    else:
        tool_output_str = str(tool_output)[:5000]

    # Determine event type
    event = 'tool_start' if 'Pre' in hook_type else 'tool_complete'

    print(json.dumps({
        'parsed': True,
        'event': event,
        'tool': tool_name,
        'input': tool_input_str if event == 'tool_start' else None,
        'output': tool_output_str if event == 'tool_complete' else None,
        'session': session_id
    }))
except Exception as e:
    print(json.dumps({'parsed': False, 'error': str(e)}))
PYEOF
)

# Check if parsing succeeded
PARSED_OK=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin).get('parsed', False))" 2>/dev/null || echo "False")

if [ "$PARSED_OK" != "True" ]; then
  # Fallback: log raw input for debugging
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "{\"timestamp\":\"$timestamp\",\"event\":\"parse_error\",\"raw\":$(echo "$INPUT_JSON" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()[:1000]))')}" >> "$OBSERVATIONS_FILE" || true
  exit 0
fi

# Archive if file too large
if [ -f "$OBSERVATIONS_FILE" ]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]; then
    archive_dir="${CONFIG_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/observations-$(date +%Y%m%d-%H%M%S).jsonl" || true
  fi
fi

# Build and write observation
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 버그 1 수정(두 번째 Python 블록): 환경변수 방식으로 교체 + 추가: project 컨텍스트 기록
PARSED_DATA="$PARSED" TIMESTAMP="$timestamp" OBS_FILE="$OBSERVATIONS_FILE" PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}" python3 << 'PYEOF'
import json
import os

parsed = json.loads(os.environ.get('PARSED_DATA', '{}'))
timestamp = os.environ.get('TIMESTAMP', '')
obs_file = os.environ.get('OBS_FILE', '')
project_dir = os.environ.get('PROJECT_DIR', '')

observation = {
    'timestamp': timestamp,
    'event': parsed['event'],
    'tool': parsed['tool'],
    'session': parsed['session'],
    'project': project_dir
}

if parsed.get('input'):
    observation['input'] = parsed['input']
if parsed.get('output'):
    observation['output'] = parsed['output']

try:
    with open(obs_file, 'a') as f:
        f.write(json.dumps(observation) + '\n')
except Exception:
    pass
PYEOF

# Signal observer if running
OBSERVER_PID_FILE="${CONFIG_DIR}/.observer.pid"
if [ -f "$OBSERVER_PID_FILE" ]; then
  observer_pid=$(cat "$OBSERVER_PID_FILE")
  if kill -0 "$observer_pid" 2>/dev/null; then
    kill -USR1 "$observer_pid" 2>/dev/null || true
  fi
fi

# 버그 3 수정: 매 호출마다 전체 파일 읽기 → 카운터 파일 방식으로 교체
# 기존: observations.jsonl 전체를 순회해서 tool_complete 개수 카운팅 (느림)
# 수정: ~/.claude/homunculus/.complete_count 파일을 카운터로 사용 (빠름)
EVENT_TYPE=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin).get('event',''))" 2>/dev/null || echo "")

if [ "$EVENT_TYPE" = "tool_complete" ]; then
  COUNTER_FILE="${CONFIG_DIR}/.complete_count"
  # atomic increment
  count=$(cat "$COUNTER_FILE" 2>/dev/null || echo "0")
  count=$((count + 1))
  echo "$count" > "$COUNTER_FILE"

  if [ "$((count % 20))" -eq 0 ]; then
    bash "${SKILL_DIR}/hooks/auto-evolve.sh" &>/dev/null &
  fi
fi

exit 0
