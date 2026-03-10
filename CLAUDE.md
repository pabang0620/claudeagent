# Claude Code 프로젝트 가이드

## 기술 스택
- **프론트엔드**: React 19, Vite 7
- **백엔드**: Node.js, Express
- **DB**: PostgreSQL (Supabase), Prisma ORM
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
| `/dispatch` | 자동 도구 선택 (추천) |
| `/plan` | 구현 계획 수립 |
| `/tdd` | TDD 워크플로우 |
| `/code-review` | 코드 리뷰 |
| `/build-fix` | 빌드 에러 수정 |
| `/verify` | 검증 루프 |
| `/e2e` | E2E 테스트 |
| `/learn` | 패턴 학습 |
| `/evolve` | 본능 → 스킬 진화 |
| `/orchestrate` | 복잡한 작업 |
| `/refactor-clean` | 리팩토링 |
| `/update-docs` | 문서 업데이트 |
| `/checkpoint` | 체크포인트 저장 |

## 에이전트
| 에이전트 | 역할 |
|---------|------|
| `dispatcher` | 자동 도구 선택 |
| `architect` | 아키텍처 설계 |
| `planner` | 작업 계획 |
| `code-reviewer` | 코드 리뷰 |
| `security-reviewer` | 보안 감사 |
| `tdd-guide` | TDD 가이드 |
| `build-error-resolver` | 빌드 에러 |
| `e2e-runner` | E2E 테스트 |
| `database-reviewer` | DB 리뷰 |
| `doc-updater` | 문서 업데이트 |
| `refactor-cleaner` | 코드 정리 |
| `jasoseo-writer` | 자소서 생성 |

## Context7 MCP
외부 라이브러리 사용 시 요청 끝에 `use context7` 추가 → 최신 API 문서 자동 조회

필수 점검: `@google/genai`, `bullmq`, `@aws-sdk/client-s3`, `pg`

> 주의: `@google/generative-ai` 아님 → `@google/genai` 사용할 것

## 개발 규칙
- 기능 보존: 수정 시 기존 기능 변경 금지
- 들여쓰기: 2 spaces
- 네이밍: 컴포넌트 PascalCase / 함수·변수 camelCase / 상수 UPPER_SNAKE_CASE
- DB ID: UUID (Supabase 기본), 마이그레이션: Prisma
- 환경변수: `.env` 사용, 커밋 금지
- 테스트 커버리지: 핵심 기능 80% 이상

세부 규칙: `rules/` 디렉토리 참조
