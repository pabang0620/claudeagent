# Orchestrate Command

복잡한 작업을 위한 순차적 에이전트 워크플로우.

## 사용법

`/orchestrate [workflow-type] [task-description]`

## 워크플로우 타입

### feature
전체 기능 구현 워크플로우:
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix
버그 조사 및 수정 워크플로우:
```
explorer -> tdd-guide -> code-reviewer
```

### refactor
안전한 리팩토링 워크플로우:
```
architect -> code-reviewer -> tdd-guide
```

### security
보안 중심 리뷰:
```
security-reviewer -> code-reviewer -> architect
```

## 실행 패턴

워크플로우의 각 에이전트에 대해:

1. **에이전트 호출** - 이전 에이전트의 컨텍스트와 함께
2. **출력 수집** - 구조화된 인계 문서로
3. **다음 에이전트에 전달** - 체인의 다음 에이전트로
4. **결과 집계** - 최종 보고서로

## 인계 문서 형식

에이전트 간에 인계 문서 생성:

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### 컨텍스트
[수행된 작업 요약]

### 발견사항
[주요 발견 또는 결정 사항]

### 수정된 파일
[수정된 파일 목록]

### 미해결 질문
[다음 에이전트를 위한 미해결 항목]

### 권장사항
[제안된 다음 단계]
```

## 예시: 기능 워크플로우

```
/orchestrate feature "사용자 인증 추가"
```

실행:

1. **Planner Agent**
   - 요구사항 분석
   - 구현 계획 생성
   - 의존성 식별
   - 출력: `HANDOFF: planner -> tdd-guide`

2. **TDD Guide Agent**
   - planner 인계 읽기
   - 테스트 먼저 작성
   - 테스트 통과를 위해 구현
   - 출력: `HANDOFF: tdd-guide -> code-reviewer`

3. **Code Reviewer Agent**
   - 구현 검토
   - 이슈 확인
   - 개선사항 제안
   - 출력: `HANDOFF: code-reviewer -> security-reviewer`

4. **Security Reviewer Agent**
   - 보안 감사
   - 취약점 확인
   - 최종 승인
   - 출력: 최종 보고서

## 최종 보고서 형식

```
오케스트레이션 보고서
==================
워크플로우: feature
작업: 사용자 인증 추가
에이전트: planner -> tdd-guide -> code-reviewer -> security-reviewer

요약
----
[한 문단 요약]

에이전트 출력
-----------
Planner: [요약]
TDD Guide: [요약]
Code Reviewer: [요약]
Security Reviewer: [요약]

변경된 파일
----------
[수정된 모든 파일 목록]

테스트 결과
----------
[테스트 통과/실패 요약]

보안 상태
--------
[보안 발견사항]

권장사항
--------
[배포 / 추가 작업 필요 / 차단됨]
```

## 병렬 실행

독립적인 확인의 경우 에이전트를 병렬로 실행:

```markdown
### 병렬 단계
동시 실행:
- code-reviewer (품질)
- security-reviewer (보안)
- architect (설계)

### 결과 병합
출력을 단일 보고서로 결합
```

## 인자

$ARGUMENTS:
- `feature <description>` - 전체 기능 워크플로우
- `bugfix <description>` - 버그 수정 워크플로우
- `refactor <description>` - 리팩토링 워크플로우
- `security <description>` - 보안 리뷰 워크플로우
- `custom <agents> <description>` - 커스텀 에이전트 시퀀스

## 커스텀 워크플로우 예시

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "캐싱 레이어 재설계"
```

## 팁

1. **planner로 시작** - 복잡한 기능의 경우
2. **항상 code-reviewer 포함** - 머지 전
3. **security-reviewer 사용** - 인증/결제/개인정보의 경우
4. **인계를 간결하게** - 다음 에이전트에 필요한 것에 집중
5. **에이전트 간 필요시 검증 실행**
