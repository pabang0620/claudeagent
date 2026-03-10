---
name: continuous-learning-v2
description: 훅을 통해 세션을 관찰하고, 신뢰도 점수가 있는 원자적 본능을 생성하며, 스킬/명령/에이전트로 진화시키는 본능 기반 학습 시스템
version: 2.0.0
---

# 지속적 학습 v2 - 본능 기반 아키텍처

원자적 "본능"(신뢰도 점수가 있는 작은 학습된 행동)을 통해 Claude Code 세션을 재사용 가능한 지식으로 전환하는 고급 학습 시스템입니다.

## v2의 새로운 기능

| 기능 | v1 | v2 |
|------|----|----|
| 관찰 | Stop 훅 (세션 종료) | PreToolUse/PostToolUse (100% 신뢰) |
| 분석 | 메인 컨텍스트 | 백그라운드 에이전트 (Haiku) |
| 단위 | 전체 스킬 | 원자적 "본능" |
| 신뢰도 | 없음 | 0.3-0.9 가중치 |
| 진화 | 직접 스킬로 | 본능 → 클러스터 → 스킬/명령/에이전트 |
| 공유 | 없음 | 본능 내보내기/가져오기 |

## 본능 모델

본능은 작은 학습된 행동입니다:

```yaml
---
id: prefer-functional-style
trigger: "새 함수 작성 시"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# 함수형 스타일 선호

## 행동
적절한 경우 클래스보다 함수형 패턴을 사용합니다.

## 증거
- 함수형 패턴 선호를 5회 관찰
- 2025-01-15에 사용자가 클래스 기반 접근법을 함수형으로 수정
```

**속성:**
- **원자적** — 하나의 트리거, 하나의 행동
- **신뢰도 가중치** — 0.3 = 잠정적, 0.9 = 거의 확실
- **도메인 태그** — code-style, testing, git, debugging, workflow 등
- **증거 기반** — 생성 근거가 되는 관찰 추적

## 작동 방식

```
세션 활동
      │
      │ 훅이 프롬프트 + 도구 사용 캡처 (100% 신뢰)
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   (프롬프트, 도구 호출, 결과)             │
└─────────────────────────────────────────┘
      │
      │ 관찰자 에이전트 읽기 (백그라운드, Haiku)
      ▼
┌─────────────────────────────────────────┐
│          패턴 감지                        │
│   • 사용자 수정 → 본능                    │
│   • 에러 해결 → 본능                      │
│   • 반복 워크플로우 → 본능                │
└─────────────────────────────────────────┘
      │
      │ 생성/업데이트
      ▼
┌─────────────────────────────────────────┐
│         instincts/personal/             │
│   • prefer-functional.md (0.7)          │
│   • always-test-first.md (0.9)          │
│   • use-zod-validation.md (0.6)         │
└─────────────────────────────────────────┘
      │
      │ /evolve 클러스터링
      ▼
┌─────────────────────────────────────────┐
│              evolved/                   │
│   • commands/new-feature.md             │
│   • skills/testing-workflow.md          │
│   • agents/refactor-specialist.md       │
└─────────────────────────────────────────┘
```

## 빠른 시작

### 1. 관찰 훅 활성화

`~/.claude/settings.json`에 추가:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

### 2. 디렉토리 구조 초기화

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. 관찰자 에이전트 실행 (선택)

관찰자는 백그라운드에서 관찰 분석:

```bash
# 백그라운드 관찰자 시작
~/.claude/skills/continuous-learning-v2/agents/start-observer.sh
```

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/instinct-status` | 신뢰도와 함께 모든 학습된 본능 표시 |
| `/evolve` | 관련 본능을 스킬/명령으로 클러스터링 |
| `/instinct-export` | 공유용 본능 내보내기 |
| `/instinct-import <파일>` | 다른 사람의 본능 가져오기 |

## 설정

`config.json` 편집:

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## 파일 구조

```
~/.claude/homunculus/
├── identity.json           # 프로필, 기술 수준
├── observations.jsonl      # 현재 세션 관찰
├── observations.archive/   # 처리된 관찰
├── instincts/
│   ├── personal/           # 자동 학습된 본능
│   └── inherited/          # 다른 사람에게서 가져온 것
└── evolved/
    ├── agents/             # 생성된 전문 에이전트
    ├── skills/             # 생성된 스킬
    └── commands/           # 생성된 명령어
```

## 신뢰도 점수

신뢰도는 시간이 지남에 따라 진화합니다:

| 점수 | 의미 | 동작 |
|------|------|------|
| 0.3 | 잠정적 | 제안되지만 강제되지 않음 |
| 0.5 | 보통 | 관련 시 적용 |
| 0.7 | 강함 | 자동 승인 적용 |
| 0.9 | 거의 확실 | 핵심 행동 |

**신뢰도 증가** 조건:
- 패턴이 반복적으로 관찰됨
- 사용자가 제안된 행동을 수정하지 않음
- 다른 출처의 유사 본능이 동의함

**신뢰도 감소** 조건:
- 사용자가 명시적으로 행동을 수정함
- 오랜 기간 패턴이 관찰되지 않음
- 모순되는 증거 출현

## 왜 관찰에 스킬이 아닌 훅인가?

> "v1은 관찰에 스킬을 사용했습니다. 스킬은 확률적이어서 Claude의 판단에 따라 50-80%만 발동합니다."

훅은 **100%** 발동하며, 결정론적입니다. 이는:
- 모든 도구 호출이 관찰됨
- 패턴을 놓치지 않음
- 학습이 포괄적임

## 하위 호환성

v2는 v1과 완전히 호환됩니다:
- 기존 `~/.claude/skills/learned/` 스킬은 여전히 작동
- Stop 훅도 여전히 실행 (하지만 이제 v2에도 공급)
- 점진적 마이그레이션 경로: 둘 다 병렬로 실행

## 개인정보 보호

- 관찰은 머신에 **로컬**로 유지
- **본능**(패턴)만 내보낼 수 있음
- 실제 코드나 대화 내용은 공유되지 않음
- 내보낼 내용을 사용자가 제어

## 예시 본능

### 코드 스타일 본능
```yaml
---
id: use-korean-time-function
trigger: "Prisma로 시간 저장 시"
confidence: 0.9
domain: "code-style"
source: "session-observation"
created: 2026-01-30
---

# 한국 시간 함수 사용

## 행동
Prisma로 시간을 저장할 때 getKoreanTime() 함수 사용

## 이유
Prisma는 UTC로 저장하여 한국 시간과 9시간 차이 발생

## 코드
```javascript
const getKoreanTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  return now;
};
```

## 증거
- 10회 관찰
- 사용자가 명시적으로 요청 (2026-01-30)
- 프로젝트 전체에서 일관되게 사용
```

### 테스트 본능
```yaml
---
id: test-before-code
trigger: "새 기능 구현 시"
confidence: 0.8
domain: "testing"
source: "user-corrections"
---

# 코드 전에 테스트 작성

## 행동
구현 전에 항상 테스트 먼저 작성 (TDD)

## 증거
- 사용자가 3회 수정: "테스트를 먼저 작성해주세요"
- tdd-workflow 스킬과 일치
```

## 관련 자료

- [Skill Creator](https://skill-creator.app) - 저장소 히스토리에서 본능 생성
- [Homunculus](https://github.com/humanplane/homunculus) - v2 아키텍처 영감
- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - 지속적 학습 섹션

---

*본능 기반 학습: Claude에게 당신의 패턴을 한 번에 하나씩 가르칩니다.*
