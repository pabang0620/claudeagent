# Claude Code 프로젝트 가이드

## 기술 스택
- **프론트엔드**: React 19, Vite 7
- **백엔드**: Node.js, Express
- **DB**: PostgreSQL (Supabase), Prisma ORM
  - **WeCom 프로젝트 전용**: MySQL 8.0, mysql2 (Prisma 미사용)
- **테스트**: Jest, Playwright
- **기타**: Python

## 프로젝트 구조
```
myapp/
├── frontend/     # React
├── backend/      # Express API
├── .claude/      # agents/ skills/ commands/ rules/
└── tests/        # E2E
```

## 슬래시 커맨드
| 커맨드 | 용도 |
|--------|------|
| `/dispatch` | 자동 도구 선택 (dispatcher 스킬 호출) |
| `/plan` | 구현 계획 수립 |
| `/tdd` | TDD 워크플로우 |
| `/code-review` | 코드 리뷰 |
| `/build-fix` | 빌드 에러 수정 |
| `/e2e` | E2E 테스트 |
| `/learn` | 패턴 학습 |
| `/evolve` | 본능 → 스킬 진화 |
| `/orchestrate` | 복잡한 작업 |
| `/refactor-clean` | 리팩토링 |
| `/update-docs` | 문서 업데이트 |

## 에이전트
| 에이전트 | 역할 |
|---------|------|
| `architect` | 아키텍처 설계 |
| `planner` | 작업 계획 |
| `security-reviewer` | 보안 감사 |
| `tdd-guide` | TDD 가이드 |
| `build-error-resolver` | 빌드 에러 |
| `e2e-runner` | E2E 테스트 |
| `database-reviewer` | DB 리뷰 |
| `doc-updater` | 문서 업데이트 |
| `refactor-cleaner` | 코드 정리 |
| `jasoseo-writer` | 자소서 생성 |
| `flutter-game-builder` | Flutter 게임 빌드 |
| `agent-evaluator` | 에이전트 품질 평가 |

## 스킬
| 스킬 | 역할 | 호출 방식 |
|------|------|----------|
| `code-reviewer` | 코드 리뷰 (context: fork) | 자동 + `/code-reviewer` |
| `feature-critic` | 기능 필요성 검토 (context: fork) | 자동 + `/feature-critic` |
| `dispatcher` | 자동 도구 선택 (context: fork) | 자동 + `/dispatcher` |
| `project-structure-guide` | 폴더구조/네이밍 컨벤션 | 자동 적용 (배경지식) |
| `verify` | 빌드/타입/린트/테스트 검증 | `/verify` (사용자만) |
| `checkpoint` | 체크포인트 생성/검증 | `/checkpoint` (사용자만) |
| `test-coverage` | 테스트 커버리지 분석 | 자동 + `/test-coverage` |

## Context7 MCP
외부 라이브러리 사용 시 요청 끝에 `use context7` 추가 → 최신 API 문서 자동 조회

필수 점검: `@google/genai`, `bullmq`, `@aws-sdk/client-s3`, `pg`

> 주의: `@google/generative-ai` 아님 → `@google/genai` 사용할 것

## 오케스트레이터 원칙 (CRITICAL)

> **오케스트레이터(메인 Claude)는 절대 코드를 직접 작성하거나 수정하지 않는다.**
> 모든 코드 변경은 반드시 에이전트에 위임한다. Edit·Write·NotebookEdit 도구를 코드 파일에 직접 사용 금지.

## 병렬 처리 & 에이전트 활용 원칙

### 병렬 처리 (MUST)
- **독립적인 작업은 반드시 병렬로 실행** — 순차 실행은 명시적 의존성이 있을 때만
- 파일 읽기, 검색, 에이전트 실행 등 서로 무관한 작업은 단일 메시지에 묶어서 동시 실행
- 예: 여러 파일 검토 → 파일별로 병렬 에이전트 실행 (파일 1개 = 에이전트 1개)

### 에이전트 적극 활용 (MUST)
- **복잡한 탐색·분석은 Explore 에이전트** — 단순 grep/read 보다 Agent 우선 고려
- **코드 작성 후 반드시 code-reviewer 스킬** — 리뷰 없는 코드 머지 금지
- **새 기능·리팩토링 시 planner 에이전트 먼저** — 계획 없는 구현 금지
- **여러 파일 동시 리뷰 시 파일 1개당 에이전트 1개 병렬 실행**
- 에이전트 목록: `agents/` 폴더 참조 / 모르면 `dispatcher` 스킬에 위임
- 일부 에이전트(code-reviewer, feature-critic, dispatcher 등)는 `context: fork` 스킬로 전환되어 효율적으로 실행됨

## 개발 규칙
- 기능 보존: 수정 시 기존 기능 변경 금지
- 들여쓰기: 2 spaces
- 네이밍: 컴포넌트 PascalCase / 함수·변수 camelCase / 상수 UPPER_SNAKE_CASE
- DB ID: UUID (Supabase 기본), 마이그레이션: Prisma
- 환경변수: `.env` 사용, 커밋 금지
- 테스트 커버리지: 핵심 기능 80% 이상

세부 규칙: `rules/` 디렉토리 참조
