# Claude Code 프로젝트 가이드

## 답변 전 검토 체크리스트 (매 응답 직전 필수)

1. 요구사항 해석이 정확한가? (모호하면 먼저 질문)
2. 기존 코드에서 문제 지점·연관 지점을 특정했는가?
3. 작업 유형에 맞는 구현안인가?
   - 버그 수정/리팩토링 → 최소 수정안
   - 신규 기능 → 요구사항을 충족하는 확실한 구현 (불필요한 추상화는 금지)
4. 회귀 테스트 관점에서 영향 범위를 점검했는가?

---

## 오케스트레이터 필수 규칙 (CRITICAL)

> **나(오케스트레이터)는 코드 작성·Bash 실행·파일 탐색·설치/검증 작업을 직접 수행하지 않는다. 항상 에이전트에 위임한다.**

요청 분류 및 에이전트 라우팅 → **`rules/agents.md` STEP 1 체크리스트** 참고

**직접 허용 예외 (단순 조회에 한함)**:
- `git status`, `ls`, 단일 파일 Read 등 1회성 상태 확인
- 에이전트 위임 범위를 파악하기 위한 최소한의 사전 조회 (Read 1회, grep 1회 수준)

**위반 예시 (반드시 에이전트 위임)**:
- `npm install`, `sh install.sh` 등 설치·빌드 → build-error-resolver
- `npm run build && npm run test` 등 다단계 검증 → tdd-guide
- 여러 파일 grep·find 탐색 → Explore 에이전트
- 서버 기동·포트 확인·프로세스 관리 → 전문 에이전트

---

## 기술 스택
- **프론트엔드**: React 19, Vite 7
- **백엔드**: Node.js, Express
- **DB**: PostgreSQL (pg/raw SQL 기본), MySQL 8.0 (WeCom), Prisma ORM (요청 시에만)
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
| `/dispatch` | 자동 도구 선택 |
| `/plan` | 구현 계획 수립 |
| `/tdd` | TDD 워크플로우 |
| `/code-review` | 코드 리뷰 |
| `/build-fix` | 빌드 에러 수정 |
| `/e2e` | E2E 테스트 |
| `/refactor-clean` | 리팩토링 |
| `/update-docs` | 문서 업데이트 |

## 스킬
| 스킬 | 역할 | 호출 방식 |
|------|------|----------|
| `code-reviewer` | 코드 리뷰 (context: fork) | 자동 + `/code-reviewer` |
| `feature-critic` | 기능 필요성 검토 | 자동 + `/feature-critic` |
| `dispatcher` | 자동 도구 선택 | 자동 + `/dispatcher` |
| `project-structure-guide` | 폴더구조/네이밍 컨벤션 | 자동 적용 |
| `verify` | 빌드/타입/린트/테스트 검증 | `/verify` (사용자만) |
| `checkpoint` | 체크포인트 생성/검증 | `/checkpoint` (사용자만) |
| `test-coverage` | 테스트 커버리지 분석 | 자동 + `/test-coverage` |

## Context7 MCP
외부 라이브러리 사용 시 요청 끝에 `use context7` 추가 → 최신 API 문서 자동 조회

필수 점검: `@google/genai`, `bullmq`, `@aws-sdk/client-s3`, `pg`

> 주의: `@google/generative-ai` 아님 → `@google/genai` 사용할 것

## 개발 규칙
- 기능 보존: 수정 시 기존 기능 변경 금지
- 들여쓰기: 2 spaces
- 네이밍: 컴포넌트 PascalCase / 함수·변수 camelCase / 상수 UPPER_SNAKE_CASE
- DB ID: UUID, 마이그레이션: Prisma
- 환경변수: `.env` 사용, 커밋 금지
- 테스트 커버리지: 핵심 기능 80% 이상

세부 규칙: `rules/` 디렉토리 참조

---

## Cursor 연동

| Cursor 규칙 파일 | 역할 |
|----------------|------|
| `.cursor/rules/00-orchestrator.mdc` | 오케스트레이터 행동 + 에이전트 라우팅 |
| `.cursor/rules/01-workspace-rules.mdc` | 질문 우선·API 승낙·Git·.env 규칙 |
