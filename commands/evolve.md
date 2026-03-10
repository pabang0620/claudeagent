---
name: evolve
description: 관련 본능들을 스킬, 커맨드, 에이전트로 클러스터링
command: /evolve
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve
---

# Evolve Command

## 구현

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

본능을 분석하고 관련된 것들을 상위 레벨 구조로 클러스터링합니다:
- **Commands**: 본능이 사용자 호출 액션을 설명할 때
- **Skills**: 본능이 자동 트리거 동작을 설명할 때
- **Agents**: 본능이 복잡한 다단계 프로세스를 설명할 때

## 사용법

```
/evolve                    # 모든 본능 분석 및 진화 제안
/evolve --domain testing   # testing 도메인의 본능만 진화
/evolve --dry-run          # 생성하지 않고 미리보기
/evolve --threshold 5      # 클러스터링을 위해 5개 이상의 관련 본능 필요
```

## 진화 규칙

### → Command (사용자 호출)
본능이 사용자가 명시적으로 요청할 액션을 설명할 때:
- "사용자가 ~를 요청할 때"에 대한 여러 본능
- "새 X를 생성할 때"와 같은 트리거가 있는 본능
- 반복 가능한 시퀀스를 따르는 본능

예시:
- `new-table-step1`: "데이터베이스 테이블 추가 시, 마이그레이션 생성"
- `new-table-step2`: "데이터베이스 테이블 추가 시, 스키마 업데이트"
- `new-table-step3`: "데이터베이스 테이블 추가 시, 타입 재생성"

→ 생성: `/new-table` 커맨드

### → Skill (자동 트리거)
본능이 자동으로 발생해야 하는 동작을 설명할 때:
- 패턴 매칭 트리거
- 에러 처리 응답
- 코드 스타일 강제

예시:
- `prefer-functional`: "함수 작성 시, 함수형 스타일 선호"
- `use-immutable`: "상태 수정 시, 불변 패턴 사용"
- `avoid-classes`: "모듈 설계 시, 클래스 기반 설계 피하기"

→ 생성: `functional-patterns` 스킬

### → Agent (깊이/격리 필요)
본능이 격리가 유용한 복잡한 다단계 프로세스를 설명할 때:
- 디버깅 워크플로우
- 리팩토링 시퀀스
- 리서치 작업

예시:
- `debug-step1`: "디버깅 시, 먼저 로그 확인"
- `debug-step2`: "디버깅 시, 실패하는 컴포넌트 격리"
- `debug-step3`: "디버깅 시, 최소 재현 케이스 생성"
- `debug-step4`: "디버깅 시, 테스트로 수정 검증"

→ 생성: `debugger` 에이전트

## 수행 작업

1. `~/.claude/homunculus/instincts/`에서 모든 본능 읽기
2. 다음 기준으로 본능 그룹화:
   - 도메인 유사성
   - 트리거 패턴 중복
   - 액션 시퀀스 관계
3. 3개 이상의 관련 본능 클러스터마다:
   - 진화 타입 결정 (command/skill/agent)
   - 적절한 파일 생성
   - `~/.claude/homunculus/evolved/{commands,skills,agents}/`에 저장
4. 진화된 구조를 소스 본능에 연결

## 출력 형식

```
🧬 진화 분석
============

진화 준비된 3개의 클러스터 발견:

## 클러스터 1: 데이터베이스 마이그레이션 워크플로우
본능: new-table-migration, update-schema, regenerate-types
타입: Command
신뢰도: 85% (12회 관찰 기반)

생성될 커맨드: /new-table
파일:
  - ~/.claude/homunculus/evolved/commands/new-table.md

## 클러스터 2: 함수형 코드 스타일
본능: prefer-functional, use-immutable, avoid-classes, pure-functions
타입: Skill
신뢰도: 78% (8회 관찰 기반)

생성될 스킬: functional-patterns
파일:
  - ~/.claude/homunculus/evolved/skills/functional-patterns.md

## 클러스터 3: 디버깅 프로세스
본능: debug-check-logs, debug-isolate, debug-reproduce, debug-verify
타입: Agent
신뢰도: 72% (6회 관찰 기반)

생성될 에이전트: debugger
파일:
  - ~/.claude/homunculus/evolved/agents/debugger.md

---
`/evolve --execute`를 실행하여 이 파일들을 생성하세요.
```

## 플래그

- `--execute`: 진화된 구조를 실제로 생성 (기본값은 미리보기)
- `--dry-run`: 생성하지 않고 미리보기
- `--domain <name>`: 지정된 도메인의 본능만 진화
- `--threshold <n>`: 클러스터를 형성하는 데 필요한 최소 본능 수 (기본값: 3)
- `--type <command|skill|agent>`: 지정된 타입만 생성

## 생성된 파일 형식

### Command
```markdown
---
name: new-table
description: 마이그레이션, 스키마 업데이트, 타입 생성으로 새 데이터베이스 테이블 생성
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Table Command

[클러스터링된 본능을 기반으로 생성된 내용]

## 단계
1. ...
2. ...
```

### Skill
```markdown
---
name: functional-patterns
description: 함수형 프로그래밍 패턴 강제
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patterns Skill

[클러스터링된 본능을 기반으로 생성된 내용]
```

### Agent
```markdown
---
name: debugger
description: 체계적인 디버깅 에이전트
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debugger Agent

[클러스터링된 본능을 기반으로 생성된 내용]
```
