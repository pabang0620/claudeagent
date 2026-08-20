# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

## 병행 브랜치 핫픽스 중복 커밋 방지

핫픽스는 **단일 소스 브랜치에서만 커밋**하고, 다른 병행 브랜치에는 merge 또는 cherry-pick으로 반영한다. 각 브랜치에 동일 수정을 개별 커밋하면 완전히 동일한 커밋(같은 메시지·같은 diff)이 여러 개 생겨 히스토리가 오염된다.

병합 전 확인:
```bash
git log --oneline A..B   # A에는 없고 B에만 있는 커밋 - 동일 메시지 중복 여부 확인
```

사례: `b4dfe54` `cdffec2` `0deb2e9` - 동일 메시지·동일 타임스탬프(2026-04-29 08:58:55)·동일 diff가 `claude/claude_w`/`claude_img` 등 서로 다른 브랜치에 각각 커밋됨.

## 기능 구현 워크플로우

`rules/agents.md`의 "표준 워크플로우" 섹션이 SSOT다(planner → 전문 에이전트 → code-reviewer).
테스트 커버리지 수치는 개발 중 강제하지 않는다 - `rules/testing.md` 참조.
