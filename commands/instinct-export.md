---
name: instinct-export
description: 팀원이나 다른 프로젝트와 공유하기 위해 본능을 내보내기
command: /instinct-export
---

# Instinct Export Command

본능을 공유 가능한 형식으로 내보냅니다. 다음에 적합:
- 팀원과 공유
- 새 머신으로 전환
- 프로젝트 컨벤션에 기여

## 사용법

```
/instinct-export                           # 모든 개인 본능 내보내기
/instinct-export --domain testing          # testing 본능만 내보내기
/instinct-export --min-confidence 0.7      # 높은 신뢰도 본능만 내보내기
/instinct-export --output team-instincts.yaml
```

## 수행 작업

1. `~/.claude/homunculus/instincts/personal/`에서 본능 읽기
2. 플래그 기반 필터링
3. 민감 정보 제거:
   - 세션 ID 제거
   - 파일 경로 제거 (패턴만 유지)
   - "지난주"보다 오래된 타임스탬프 제거
4. 내보내기 파일 생성

## 출력 형식

YAML 파일 생성:

```yaml
# Instincts Export
# Generated: 2025-01-22
# Source: personal
# Count: 12 instincts

version: "2.0"
exported_by: "continuous-learning-v2"
export_date: "2025-01-22T10:30:00Z"

instincts:
  - id: prefer-functional-style
    trigger: "새 함수 작성 시"
    action: "클래스보다 함수형 패턴 사용"
    confidence: 0.8
    domain: code-style
    observations: 8

  - id: test-first-workflow
    trigger: "새 기능 추가 시"
    action: "구현 전 테스트 먼저 작성"
    confidence: 0.9
    domain: testing
    observations: 12

  - id: grep-before-edit
    trigger: "코드 수정 시"
    action: "Grep으로 검색, Read로 확인, 그다음 Edit"
    confidence: 0.7
    domain: workflow
    observations: 6
```

## 개인정보 고려사항

내보내기에 포함:
- ✅ 트리거 패턴
- ✅ 액션
- ✅ 신뢰도 점수
- ✅ 도메인
- ✅ 관찰 횟수

내보내기에 포함되지 않음:
- ❌ 실제 코드 스니펫
- ❌ 파일 경로
- ❌ 세션 트랜스크립트
- ❌ 개인 식별자

## 플래그

- `--domain <name>`: 지정된 도메인만 내보내기
- `--min-confidence <n>`: 최소 신뢰도 임계값 (기본값: 0.3)
- `--output <file>`: 출력 파일 경로 (기본값: instincts-export-YYYYMMDD.yaml)
- `--format <yaml|json|md>`: 출력 형식 (기본값: yaml)
- `--include-evidence`: 증거 텍스트 포함 (기본값: 제외)
