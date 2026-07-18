# Performance Optimization

## Model Selection Strategy (SONNET-ONLY POLICY)

> **이 프로젝트는 Sonnet 단일 모델 정책이다. 사용자 지시(2026-07-02): "소넷 외에는 쓰지 않는다."**
> - 모든 에이전트 정의파일 `model:` 필드 = `sonnet` (예외 없음)
> - 에이전트 평가·생성 시 다른 모델(opus/haiku/fable) 권장 금지
> - 비용 절감은 모델 다운그레이드가 아니라 **에이전트 위임(컨텍스트 격리) + 병렬 실행 + 프롬프트 슬림화**로 달성한다

**Sonnet (`claude-sonnet-5`)** — 유일 사용 모델:
- Main development work
- Orchestrating multi-agent workflows
- All agents (workers, reviewers, evaluators)

> ⚠️ deprecated: Opus 4 베이스(claude-opus-4)는 2026-06-15 deprecated.
> opus/haiku/fable은 정책상 미사용 — 에이전트 frontmatter에서 발견 시 즉시 `sonnet`으로 교체.

## Context Window Management

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

## Ultrathink + Plan Mode

For complex tasks requiring deep reasoning:
1. Use `ultrathink` for enhanced thinking
2. Enable **Plan Mode** for structured approach
3. "Rev the engine" with multiple critique rounds
4. Use split role sub-agents for diverse analysis

## Build Troubleshooting

If build fails:
1. Use **build-error-resolver** agent
2. Analyze error messages
3. Fix incrementally
4. Verify after each fix
