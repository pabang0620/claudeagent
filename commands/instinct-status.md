---
name: instinct-status
description: 신뢰도 수준과 함께 학습된 모든 본능 표시
command: /instinct-status
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
---

# Instinct Status Command

신뢰도 점수와 함께 학습된 모든 본능을 도메인별로 그룹화하여 표시합니다.

## 구현

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## 사용법

```
/instinct-status
/instinct-status --domain code-style
/instinct-status --low-confidence
```

## 수행 작업

1. `~/.claude/homunculus/instincts/personal/`에서 모든 본능 파일 읽기
2. `~/.claude/homunculus/instincts/inherited/`에서 상속된 본능 읽기
3. 도메인별로 그룹화하여 신뢰도 막대와 함께 표시

## 출력 형식

```
📊 본능 상태
============

## 코드 스타일 (4 instincts)

### prefer-functional-style
트리거: 새 함수 작성 시
액션: 클래스보다 함수형 패턴 사용
신뢰도: ████████░░ 80%
소스: session-observation | 마지막 업데이트: 2025-01-22

### use-path-aliases
트리거: 모듈 임포트 시
액션: 상대 경로 대신 @/ 경로 별칭 사용
신뢰도: ██████░░░░ 60%
소스: repo-analysis (github.com/acme/webapp)

## 테스팅 (2 instincts)

### test-first-workflow
트리거: 새 기능 추가 시
액션: 구현 전 테스트 먼저 작성
신뢰도: █████████░ 90%
소스: session-observation

## 워크플로우 (3 instincts)

### grep-before-edit
트리거: 코드 수정 시
액션: Grep으로 검색, Read로 확인, 그다음 Edit
신뢰도: ███████░░░ 70%
소스: session-observation

---
총계: 9 instincts (개인 4개, 상속 5개)
Observer: 실행 중 (마지막 분석: 5분 전)
```

## 플래그

- `--domain <name>`: 도메인별 필터링 (code-style, testing, git 등)
- `--low-confidence`: 신뢰도 < 0.5인 본능만 표시
- `--high-confidence`: 신뢰도 >= 0.7인 본능만 표시
- `--source <type>`: 소스별 필터링 (session-observation, repo-analysis, inherited)
- `--json`: 프로그래밍 사용을 위해 JSON으로 출력
