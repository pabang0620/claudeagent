# Checkpoint Command

작업 워크플로우에서 체크포인트를 생성하거나 검증합니다.

## 사용법

`/checkpoint [create|verify|list] [name]`

## 체크포인트 생성

체크포인트 생성 시:

1. `/verify quick` 실행하여 현재 상태가 깨끗한지 확인
2. 체크포인트 이름으로 git stash 또는 commit 생성
3. `.claude/checkpoints.log`에 체크포인트 기록:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. 체크포인트 생성 보고

## 체크포인트 검증

체크포인트 검증 시:

1. 로그에서 체크포인트 읽기
2. 현재 상태와 체크포인트 비교:
   - 체크포인트 이후 추가된 파일
   - 체크포인트 이후 수정된 파일
   - 테스트 통과율 (이전 vs 현재)
   - 커버리지 (이전 vs 현재)

3. 보고:
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## 체크포인트 목록

다음 정보와 함께 모든 체크포인트 표시:
- 이름
- 타임스탬프
- Git SHA
- 상태 (current, behind, ahead)

## 워크플로우

일반적인 체크포인트 흐름:

```
[시작] --> /checkpoint create "feature-start"
   |
[구현] --> /checkpoint create "core-done"
   |
[테스트] --> /checkpoint verify "core-done"
   |
[리팩토링] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## 인자

$ARGUMENTS:
- `create <name>` - 이름 지정하여 체크포인트 생성
- `verify <name>` - 이름 지정한 체크포인트와 검증
- `list` - 모든 체크포인트 표시
- `clear` - 오래된 체크포인트 제거 (최근 5개 유지)
