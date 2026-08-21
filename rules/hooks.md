# Hooks System

## 실제 등록된 훅 (`~/.claude/settings.json`, 2026-08-21 실측)

**등록된 훅이 하나도 없다.** `settings.json`에 `hooks` 키 자체가 없다.

포맷·타입검사·console.log 점검·git push 리뷰는 자동으로 돌지 않는다. 훅이 있다고 가정하고 동작을 설계하지 말 것.

> 이력: skill-fog의 SessionStart/Stop 훅 2개가 유일한 등록 훅이었으나 2026-08-21 미사용으로 제거했다
> (`~/.skill-fog/`, `~/.claude/skills/skill-fog/`, `~/.local/bin/skill-fog` 심볼릭링크, 전역 `CLAUDE.md`
> 상단 지시문 전부 삭제). 되살릴 일은 없다고 보지만 백업은 `~/.claude/settings.json.backup.20260821_103203`,
> `~/.claude/CLAUDE.md.backup.20260821_103203`에 있다.

훅을 새로 추가하려면 `update-config` 스킬을 쓴다. 추가 후에는 이 표를 함께 갱신한다.

## Auto-Accept Permissions

- 신뢰할 수 있고 범위가 명확한 계획에만 사용
- 탐색적 작업에는 비활성화
- 권한은 `~/.claude/settings.json`의 `permissions.allow`로 설정한다 (`update-config` 스킬 사용)

## TodoWrite 활용

멀티스텝 작업의 진행 추적, 지시 이해도 확인, 실시간 조정에 사용한다.
할 일 목록은 순서 오류·누락 항목·불필요 항목·잘못된 단위·요구사항 오해를 드러낸다.
