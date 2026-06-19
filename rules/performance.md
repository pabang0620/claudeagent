# Performance Optimization

## Model Selection Strategy

> ⚠️ Opus 4 베이스(claude-opus-4)는 2026-06-15 deprecated — 사용 금지.

**Haiku (`claude-haiku-4-5-20251001`)** — 경량·고빈도 호출 (90% of Sonnet capability, 3x cost savings):
- Lightweight agents with frequent invocation
- Pair programming and code generation
- Worker agents in multi-agent systems

**Sonnet (`claude-sonnet-4-6`)** — 최적 코딩 모델:
- Main development work
- Orchestrating multi-agent workflows
- Complex coding tasks

**Opus (`claude-opus-4-7`)** — 최심층 추론:
- Complex architectural decisions
- Maximum reasoning requirements
- Research and analysis tasks

**Fable (`claude-fable-5`)** — 최상위 특수 용도 (선택적):
- Specialized high-complexity tasks requiring maximum capability

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
