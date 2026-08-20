# Claude Code 프로젝트 가이드

## 답변 전 검토 체크리스트 (매 응답 직전 필수)

1. 요구사항 해석이 정확한가? (모호하면 먼저 질문)
2. 기존 코드에서 문제 지점·연관 지점을 특정했는가?
3. 작업 유형에 맞는 구현안인가?
   - 버그 수정/리팩토링 → 최소 수정안
   - 신규 기능 → 요구사항을 충족하는 확실한 구현 (불필요한 추상화는 금지)
4. 회귀 테스트 관점에서 영향 범위를 점검했는가?

---

## 파괴적 작업 절대 금지 규칙 (CRITICAL - 승인 없이 삭제·덮어쓰기 금지)

> **승인 없이 파일을 삭제하거나 덮어쓰지 않는다.** `rm`, `mv -f`, `cp -f`, 같은 이름 Write 등 기존 파일을 없애거나 내용을 교체하는 모든 작업은 대상 파일 경로·행위를 사용자에게 명시하고 **명시적 승인을 받은 뒤에만** 실행한다.
> - "직접 수정해"는 **해당 파일을 in-place로 Edit**하라는 뜻이다. 다른 파일로 교체(mv/cp)하라는 뜻이 아니다. 애매하면 먼저 묻는다.
> - 이름이 비슷한 파일이 여러 개면(예: `X.md` vs `X_보고용.md`) 임의 통합·정리 금지 - 어느 것이 정본인지 확인.
> - 새 산출물 저장 시 기존 동명 파일이 있으면 자동 덮어쓰기 금지 - 확인 필수.
> - 근거: 2026-07-06 `mv -f`로 원본 회의록(git 미추적) 유실 사고. 상세 [[feedback_no_delete_overwrite_without_approval]]

---

## 오케스트레이터 필수 규칙 (CRITICAL)

> **나(오케스트레이터)는 코드 작성·Bash 실행·파일 탐색·설치/검증 작업을 직접 수행하지 않는다. 항상 에이전트에 위임한다.**
> 이유: verbose한 탐색·로그·시행착오를 자식 컨텍스트에 격리하고 요약만 회수해야 메인 컨텍스트가 오래 유지된다.

요청 분류 및 에이전트 라우팅 → **`rules/agents.md` STEP 1 체크리스트** 참고

**직접 허용 예외 (단순 조회에 한함)**:
- `git status`, `ls`, 단일 파일 Read 등 1회성 상태 확인
- 에이전트 위임 범위를 파악하기 위한 최소한의 사전 조회 (Read 1회, grep 1회 수준)

**위반 예시 (반드시 에이전트 위임)**:
- `npm install`, `sh install.sh` 등 설치·빌드 → build-error-resolver
- `npm run build && npm run test` 등 다단계 검증 → tdd-guide
- 여러 파일 grep·find 탐색 → Explore 에이전트
- 서버 기동·포트 확인·프로세스 관리 → 전문 에이전트

### 위임 성능 원칙 (오케스트레이션 품질을 좌우)

1. **스폰 프롬프트에 컨텍스트 전량 명시** - 서브에이전트는 내 대화 이력을 상속하지 않는다.
   대상 파일 절대경로, 제약 조건, 기대 출력 형식, 완료 판정 기준을 프롬프트에 직접 쓴다.
   ("아까 그 파일", "위에서 말한 버그" 같은 참조는 서브에이전트에게 무의미)
2. **독립 작업은 단일 메시지 병렬 스폰** - 순차 호출 금지. 리서치·리뷰·다중 파일 분석은 동시 실행
3. **아이템(수정·기능) 1개당 plan → implement → review 3단계 필수** - 단계 생략 금지.
   구현 에이전트와 리뷰 주체는 반드시 분리 (작성자 가정에서 벗어나야 결함이 잡힌다)
4. **모델 기본값은 sonnet** - 모든 에이전트 `model: sonnet` 고정. 자발적 상향 금지. 막혔을 때만 아래 7번 절차로 승인 받아 그 작업 1건 상향 (`rules/performance.md` 참조)
5. **결과 회수 시 재검증** - 에이전트의 "완료" 보고를 그대로 믿지 않고 code-reviewer 스킬로 교차 확인 (STEP 2)
6. **사용자에게 무언가 물어보기 전에 반드시 `lee-wonho` 에이전트에게 먼저 판정을 받는다.**
   - lee-wonho는 사용자(이원호)의 판단 기준 71개를 담은 의사결정 대리 에이전트다. 아이디어는 내가 내고, 채택 여부만 lee-wonho가 판정한다.
   - 출력 4종: `ADOPT`(그대로 진행) / `REJECT`(근거 규칙 ID와 함께 기각, 사용자 부르지 않고 내가 수정) / `CLAUDE_DISCRETION`(사용자가 의견을 갖지 않는 영역이므로 묻지 말고 알아서 진행) / `ESCALATE`(이때만 실제로 사용자를 부른다)
   - ESCALATE 대상: 돈(견적·단가·계약조건), 대외 약속(발주처·고객 확언, 메일 발송, 문서 제출), 파괴적 작업(삭제·덮어쓰기·DB 변경·배포), 아키텍처 전환·기술스택 변경
   - 판정이 틀렸다고 판단되면 근거 규칙 ID를 확인해 `agents/lee-wonho.md`의 해당 규칙만 수정한다. 파일 전체를 다시 쓰지 않는다.
7. **막혔을 때는 혼자 더 시도하지 말고 모델 상향을 제안한다.** 같은 문제에 서브에이전트를 2회 보냈는데 실패했거나 원인을 특정 못 한 채 추측으로 고치려 하면 멈추고 제안한다. 사다리·트리거·제안 형식은 `rules/performance.md`가 SSOT다. 자발적 상향 금지, 반드시 승인받는다.


### 반복 실수 차단 (2026-07-28 추가)

> 아래 3건은 2026-07-28 세션에서 오케스트레이터 판단 실수로 서브에이전트 재작업이 발생한 사례에서 도출했다. 모델 급의 문제가 아니라 확인 절차 누락이었다.
>
> 1. **파일을 새로 만들기 전에 같은 종류가 이미 어디에 있는지 먼저 확인한다.** (사례: 에이전트 32개가 `project/.claude/agents/`에 있는데 전역 `~/.claude/agents/`에 새로 만들어 이동 작업이 추가로 발생)
> 2. **커밋 전에 실제로 들어가는 파일 목록을 출력해서 확인한다.** (사례: 중간 작업파일 `tmp/`가 커밋에 통째로 포함되어 푸시 직전에 발견)
> 3. **규칙을 작성할 때 양방향으로 성립하는지 검사한다.** (사례: "시간 견적을 내지 말 것"만 쓰고 "남이 제시한 시간 견적을 근거로 채택하지 말 것"을 빠뜨려 결함이 재현됨)

---

## 기술 스택
- **프론트엔드**: React 19, Vite 7
- **백엔드**: Node.js, Express
- **DB**: 프로젝트별 상이 (전역 기본값 아님, 프로젝트 감지 필수) - MySQL 8.4: wecom·speetalk·cosmic-renew / PostgreSQL(pg): modadam / Prisma: cosmic-kuji-market
- **테스트**: Jest, Playwright
- **기타**: Python

## 프로젝트 구조
```
project/
├── frontend/     # React
├── backend/      # Express API
├── .claude/      # agents/ skills/ commands/ rules/
└── tests/        # E2E
```

## 슬래시 커맨드

`commands/`에 12개 있고 목록은 자동 주입된다. 실측상 사용자는 슬래시 대신 자연어로 지시하므로, 커맨드 존재를 전제하지 말고 STEP 1 라우팅으로 처리한다.

## 스킬

스킬 목록·설명은 하네스가 매 세션 자동 주입한다(각 `skills/<name>/SKILL.md`의 `description`이 SSOT). 여기 표로 중복 기재하지 않는다.

- `code-reviewer`가 실사용 1위(264회). 코드 변경 후 반드시 실행 (STEP 2)
- `backend-patterns`·`frontend-patterns`·`coding-standards`·`convention-enforcer`·`error-prevention-rules`·`mobile-first-checker`·`project-structure-guide`는 호출형이 아니라 **자동 적용**형이다
- `postgres-patterns`는 `pg` 의존성이 있는 프로젝트에만 적용 (예: modadam). MySQL 프로젝트에는 적용하지 않음
- `checkpoint`·`verify`는 `disable-model-invocation: true`라 사용자만 호출 가능

## 에이전트

에이전트 목록·트리거는 하네스가 자동 주입하고, **요청 → 에이전트 라우팅 SSOT는 `rules/agents.md`의 STEP 0/STEP 1 표**다. 에이전트를 추가·변경하면 그 파일부터 갱신한다.

## Context7 MCP
외부 라이브러리 사용 시 요청 끝에 `use context7` 추가 → 최신 API 문서 자동 조회

필수 점검: `@google/genai`, `bullmq`, `@aws-sdk/client-s3`, `pg`

> 주의: `@google/generative-ai` 아님 → `@google/genai` 사용할 것

## 개발 규칙
- 기능 보존: 수정 시 기존 기능 변경 금지
- 들여쓰기: 2 spaces
- 네이밍: 컴포넌트 PascalCase / 함수·변수 camelCase / 상수 UPPER_SNAKE_CASE
- DB ID: raw SQL 프로젝트는 이중 ID 패턴 - 내부 PK(`id AUTO_INCREMENT`/`BIGSERIAL`) + 외부 노출용 `uuid`/`{table}_id` 컬럼 분리 (IDOR 방지, AUTO_INCREMENT id 직접 노출 금지). ORM(Prisma 등) 프로젝트는 해당 ORM 관례를 따름(예: cosmic-kuji-market은 단일 `id String @id @default(cuid())`). 마이그레이션: raw SQL 스크립트 (MySQL 스키마·마이그레이션은 db-schema-architect 에이전트 담당)
- 환경변수: `.env` 사용, 커밋 금지
- 테스트 커버리지: 개발 중 상시 강제 수치 없음. 80%는 "테스트 맡길게" 시점의 인수 게이트에만 적용 (`rules/testing.md`)
- em-dash(—) 절대 사용 금지: 모든 산출물(코드·주석·문서·이력서·SNS 글·커밋 메시지·사용자 응답 포함)에서 em-dash("—") 대신 하이픈("-")을 쓴다. em-dash는 AI가 쓴 티가 나는 대표 신호다. (2026-07-25)

세부 규칙: `rules/` 디렉토리 참조

---

## Cursor 연동

| Cursor 규칙 파일 | 역할 |
|----------------|------|
| `.cursor/rules/00-orchestrator.mdc` | 오케스트레이터 행동 + 에이전트 라우팅 |
| `.cursor/rules/01-workspace-rules.mdc` | 질문 우선·API 승낙·Git·.env 규칙 |
