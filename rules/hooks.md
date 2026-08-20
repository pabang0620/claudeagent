# Hooks System

## Hook Types

- **PreToolUse**: 도구 실행 전 (검증, 파라미터 수정, 차단)
- **PostToolUse**: 도구 실행 후 (자동 포맷, 검사)
- **SessionStart**: 세션 시작 시
- **Stop**: 세션 종료 시

## 실제 등록된 훅 (`~/.claude/settings.json`, 2026-08-20 실측)

| 시점 | 명령 | 역할 |
|------|------|------|
| SessionStart | `bash ~/.skill-fog/hooks/session-start.sh` | skill-fog 미처리 패턴을 세션 시작 시 주입 |
| Stop | `bash ~/.skill-fog/hooks/stop.sh` | 세션 종료 시 요청 패턴 기록 |

**등록된 훅은 위 2개가 전부다.** 이 문서에는 한때 tmux 리마인더, git push 리뷰, doc blocker,
Prettier 자동 포맷, tsc 검사, console.log 경고 등 8개 훅이 있다고 적혀 있었으나
`settings.json` 실측 결과 **하나도 존재하지 않았다** (2026-08-20 정정).
훅이 있다고 가정하고 동작을 설계하지 말 것 - 포맷·타입검사·console.log 점검은 자동으로 돌지 않는다.

훅을 새로 추가하려면 `update-config` 스킬을 쓴다. 추가 후에는 이 표를 함께 갱신한다.

## Auto-Accept Permissions

- 신뢰할 수 있고 범위가 명확한 계획에만 사용
- 탐색적 작업에는 비활성화
- `dangerously-skip-permissions` 플래그는 쓰지 않는다
- 대신 `~/.claude.json`의 `allowedTools`를 설정한다

## TodoWrite 활용

멀티스텝 작업의 진행 추적, 지시 이해도 확인, 실시간 조정에 사용한다.
할 일 목록은 순서 오류·누락 항목·불필요 항목·잘못된 단위·요구사항 오해를 드러낸다.
