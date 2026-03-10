---
name: instinct-import
description: 팀원, Skill Creator 또는 다른 소스에서 본능 가져오기
command: /instinct-import
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file>
---

# Instinct Import Command

## 구현

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

다음에서 본능 가져오기:
- 팀원의 내보내기
- Skill Creator (저장소 분석)
- 커뮤니티 컬렉션
- 이전 머신 백업

## 사용법

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

## 수행 작업

1. 본능 파일 가져오기 (로컬 경로 또는 URL)
2. 형식 파싱 및 유효성 검사
3. 기존 본능과 중복 확인
4. 새 본능 병합 또는 추가
5. `~/.claude/homunculus/instincts/inherited/`에 저장

## 가져오기 프로세스

```
📥 본능 가져오는 중: team-instincts.yaml
============================================

가져올 12개의 본능 발견.

충돌 분석 중...

## 새 본능 (8)
추가될 본능:
  ✓ use-zod-validation (신뢰도: 0.7)
  ✓ prefer-named-exports (신뢰도: 0.65)
  ✓ test-async-functions (신뢰도: 0.8)
  ...

## 중복 본능 (3)
이미 유사한 본능 존재:
  ⚠️ prefer-functional-style
     로컬: 0.8 신뢰도, 12회 관찰
     가져오기: 0.7 신뢰도
     → 로컬 유지 (더 높은 신뢰도)

  ⚠️ test-first-workflow
     로컬: 0.75 신뢰도
     가져오기: 0.9 신뢰도
     → 가져오기로 업데이트 (더 높은 신뢰도)

## 충돌하는 본능 (1)
로컬 본능과 충돌:
  ❌ use-classes-for-services
     충돌: avoid-classes
     → 건너뛰기 (수동 해결 필요)

---
8개 추가, 1개 업데이트, 3개 건너뛰기?
```

## 병합 전략

### 중복 처리
이미 존재하는 본능과 일치하는 본능 가져오기 시:
- **더 높은 신뢰도 우선**: 신뢰도가 높은 것 유지
- **증거 병합**: 관찰 횟수 결합
- **타임스탬프 업데이트**: 최근 검증으로 표시

### 충돌 처리
기존 본능과 모순되는 본능 가져오기 시:
- **기본적으로 건너뛰기**: 충돌하는 본능 가져오지 않음
- **검토용 플래그**: 둘 다 주의 필요로 표시
- **수동 해결**: 사용자가 어느 것을 유지할지 결정

## 소스 추적

가져온 본능은 다음으로 표시됨:
```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # 또는 "repo-analysis"
```

## Skill Creator 통합

Skill Creator에서 가져오기:

```
/instinct-import --from-skill-creator acme/webapp
```

저장소 분석에서 생성된 본능을 가져옵니다:
- 소스: `repo-analysis`
- 더 높은 초기 신뢰도 (0.7+)
- 소스 저장소에 연결

## 플래그

- `--dry-run`: 가져오지 않고 미리보기
- `--force`: 충돌이 있어도 가져오기
- `--merge-strategy <higher|local|import>`: 중복 처리 방법
- `--from-skill-creator <owner/repo>`: Skill Creator 분석에서 가져오기
- `--min-confidence <n>`: 임계값 이상의 본능만 가져오기

## 출력

가져오기 후:
```
✅ 가져오기 완료!

추가: 8 instincts
업데이트: 1 instinct
건너뛰기: 3 instincts (중복 2개, 충돌 1개)

새 본능 저장 위치: ~/.claude/homunculus/instincts/inherited/

모든 본능을 보려면 /instinct-status를 실행하세요.
```
