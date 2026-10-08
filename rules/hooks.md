# Hooks System

## 실제 등록된 훅 (`~/.claude/settings.json`, 2026-08-21 실측)

**등록된 훅이 하나도 없다.** `settings.json`에 `hooks` 키 자체가 없다.

포맷·타입검사·console.log 점검·git push 리뷰는 자동으로 돌지 않는다. 훅이 있다고 가정하고 동작을 설계하지 말 것.

훅을 새로 추가하려면 `update-config` 스킬을 쓴다. 추가 후에는 이 표를 함께 갱신한다.

`.claude/hooks/hooks.json`은 everything-claude-code 템플릿 잔재로 어디에도 등록돼 있지 않다(존재하지 않는 `${CLAUDE_PLUGIN_ROOT}/scripts/hooks/*.js`를 가리키고, dev 서버 차단·md 생성 차단 등 이 사용자의 작업 방식과 충돌). 그대로 settings에 붙여 넣지 않는다.

## Auto-Accept Permissions

- 신뢰할 수 있고 범위가 명확한 계획에만 사용
- 탐색적 작업에는 비활성화
- 권한은 `~/.claude/settings.json`의 `permissions.allow`로 설정한다 (`update-config` 스킬 사용)
