# Performance Optimization

## Model Selection Strategy (2026-09-29 개정)

> - 에이전트 기본: `model: sonnet` + `effort: low|medium`.
> - **sonnet high는 쓰지 않는다.** high급이 필요하면 `model: opus` + `effort: low`로 한다. 더 강한 모델을 낮은 effort로 쓰는 편이 약한 모델을 세게 돌리는 것보다 품질·비용 모두 낫다(같은 블로그 글, 사용자 지시 2026-09-29).
> - high급은 **코드 검증에만** 쓴다: security-reviewer·database-reviewer·function-validator. 그 외 에이전트는 medium 이하.
> - 그 밖의 모델 상향은 막혔을 때 아래 절차로 승인받아 그 작업 1건에만 한다.

> 참고: Opus 4 베이스(claude-opus-4)는 2026-06-15 deprecated.

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

## 복잡한 작업

설계가 필요한 복잡한 작업은 Plan Mode로 계획을 먼저 확정한다. 사고량은 에이전트 `effort`로 조절하고, `ultrathink` 키워드·수동 사고 예산·"여러 차례 비평 라운드" 같은 고정 절차는 쓰지 않는다. 최신 모델은 자체 사고가 있어 이런 틀이 토큰만 늘린다 (근거: claude.com 블로그 "Reducing cost and improving performance with Claude Platform", 2026-09-08).

## 토큰 절약 운영 원칙 (같은 글 기준)

- **프롬프트 캐시 유지**: 세션 중간에 `/model`·effort를 바꾸면 캐시가 깨진다. 바꿀 일이 있으면 새 세션이나 compaction 직후에 바꾼다.
- **매 턴 로드되는 파일에 날짜·ID처럼 자주 바뀌는 값을 넣지 않는다** (CLAUDE.md, `rules/`). 가끔만 필요한 절차는 `rules/` 밖(`agent-refs/`, `docs/`)에 두고 필요할 때 읽는다.
- **서브에이전트 보고는 짧게 묶는다**: 스폰 프롬프트에 보고 줄 수 상한을 적는다 (`rules/agents.md` STEP 1-2). 긴 보고는 비싼 메인 모델 컨텍스트를 채운다.
- **effort는 양쪽으로 틀릴 수 있다**: 너무 높으면 증거가 없는데도 계속 고민하고, 너무 낮으면 첫 검색 결과로 답한다. 조사·탐색형 에이전트는 low로 내리지 않는다.
- **프롬프트 점검**: 에이전트·스킬·룰을 크게 고친 뒤에는 `/claude-api prompt-audit`으로 검증 의식·강조 남발·고정 사고 틀·모순 규칙이 다시 생겼는지 확인한다.

## Build Troubleshooting

If build fails:
1. Use **build-error-resolver** agent
2. Analyze error messages
3. Fix incrementally
4. Verify after each fix
