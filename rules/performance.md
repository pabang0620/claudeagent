# Performance Optimization

## Model Selection Strategy (SONNET 기본 + 승인부 에스컬레이션)

> **기본값은 Sonnet이다.** 모든 에이전트 정의파일의 `model:` 필드는 `sonnet` 고정.
> - Claude가 자발적으로 opus/fable로 상향하지 않는다 (자발적 모델 상향 금지)
> - 비용 절감은 모델 다운그레이드가 아니라 **에이전트 위임(컨텍스트 격리) + 병렬 실행 + 프롬프트 슬림화**로 달성한다
> - 다만 막혔을 때는 아래 에스컬레이션 절차에 따라 사용자 승인을 받아 해당 작업 1건에 한해 상위 모델 서브에이전트를 스폰할 수 있다

**Sonnet (`claude-sonnet-5`)** - 기본 모델:
- Main development work
- Orchestrating multi-agent workflows
- All agents (workers, reviewers, evaluators)

> ⚠️ deprecated: Opus 4 베이스(claude-opus-4)는 2026-06-15 deprecated.

### 막혔을 때: 승인부 모델 에스컬레이션

**중요: 세션 모델을 바꾸는 것이 아니다.** `Agent` 도구의 `model` 파라미터로 그 작업 1건만 상위 모델 서브에이전트에 위임하는 것이다. 나머지 작업은 계속 Sonnet으로 돌아간다.

사다리:
```
[기본] Sonnet 서브에이전트
   |  막힘
   v
"Opus로 재검토할까요?"  → 사용자 승인 → Agent(model: 'opus')
   |  그래도 막힘
   v
"Fable로 갈까요?"       → 사용자 승인 → Agent(model: 'fable')
```

**Opus 제안 트리거** (하나라도 해당):
- 같은 문제에 서브에이전트를 2회 보냈는데 해결되지 않음
- 원인을 특정하지 못한 채 추측으로 수정하려 하고 있음
- 접근 방식 2개를 시도했는데 둘 다 실패
- 설계 판단인데 Claude의 확신도가 '하'

**Fable 제안 트리거**:
- Opus로 재검토했는데도 해결되지 않음
- 여러 파일·여러 시스템에 걸쳐 한 번에 봐야 하는 문제
- 오래 돌려야 하는 규모의 작업 (대규모 마이그레이션 등)

**제안 형식** (반드시 근거를 함께 제시할 것. "Opus 쓸까요"만 물으면 사용자가 판단할 근거가 없다):
> [문제 요약]. N회 시도했고 모두 실패했습니다.
> 시도 1: [무엇을 했고 어떻게 실패했는지]
> 시도 2: [무엇을 했고 어떻게 실패했는지]
> 원인 후보는 [A]와 [B]인데 둘 다 확증하지 못했습니다.
> **Opus 서브에이전트로 재검토할까요?** (이 건에만 적용)

**비용 참고** (100만 토큰당, 판단 근거로만 사용하고 시간 견적과 혼동하지 말 것):
- Sonnet 5: $3 / $15
- Opus 5: $5 / $25 (Sonnet의 약 1.7배)
- Fable 5: $10 / $50 (Sonnet의 약 3.3배, Opus의 2배)

**Fable 사용 시 주의**:
- thinking을 끌 수 없다 (항상 켜져 있음)
- 한 요청이 몇 분씩 걸릴 수 있다
- 보안·생명과학 주제에서 정상 요청도 거절될 수 있다

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
