# Claude Code 프로젝트 가이드

## 구현 방향

버그 수정·리팩토링은 최소 수정안, 신규 기능은 요구사항을 충족하는 확실한 구현으로 한다(불필요한 추상화 금지). 요구사항이 모호하면 먼저 묻는다.

---

## 파괴적 작업 금지 규칙 (승인 없이 삭제·덮어쓰기 금지)

> **승인 없이 파일을 삭제하거나 덮어쓰지 않는다.** `rm`, `mv -f`, `cp -f`, 같은 이름 Write 등 기존 파일을 없애거나 내용을 교체하는 모든 작업은 대상 파일 경로·행위를 사용자에게 명시하고 **명시적 승인을 받은 뒤에만** 실행한다.
> - "직접 수정해"는 **해당 파일을 in-place로 Edit**하라는 뜻이다. 다른 파일로 교체(mv/cp)하라는 뜻이 아니다. 애매하면 먼저 묻는다.
> - 이름이 비슷한 파일이 여러 개면(예: `X.md` vs `X_보고용.md`) 임의 통합·정리 금지 - 어느 것이 정본인지 확인.
> - 새 산출물 저장 시 기존 동명 파일이 있으면 자동 덮어쓰기 금지 - 확인 필수.
> - 근거: 2026-07-06 `mv -f`로 원본 회의록(git 미추적) 유실 사고. 상세 [[feedback_no_delete_overwrite_without_approval]]

---

## 작업 방식 (2026-09-29 개편)

> 사용자 지시(2026-09-29): 모든 일을 서브에이전트로 넘기는 구조가 전체 성능을 떨어뜨린다. 넘길 때마다 맥락이 빠지고 더 약한 모델이 작업하기 때문이다.

**메인이 직접 한다**: 코드 읽기·수정, 빌드·테스트 실행, 몇 개 파일 탐색, 커밋·푸시, 설정·문서 수정 등 대화 맥락이 중요한 작고 중간 크기의 작업.

**위임한다** (담당은 `rules/agents.md` STEP 1 표):
- 여러 디렉토리를 넓게 훑어야 하는 대규모 탐색 (결과 요약만 필요할 때)
- 서로 독립적인 작업 여러 개를 동시에 돌릴 때 (단일 메시지 병렬 스폰)
- 전용 파이프라인이 있는 작업 (숏폼·굼구미·게임 에셋·HWPX/DOCX/PPTX 생성·회의록 등)
- 로그가 길게 쌓이는 장시간 작업 (대량 렌더, 긴 빌드 루프)

### 위임할 때 원칙

1. **스폰 프롬프트에 필요한 맥락을 적는다** - 서브에이전트는 대화 이력을 모른다. 대상 파일 절대경로, 제약 조건, 기대 출력 형식, 완료 기준, 보고 줄 수 상한을 적는다.
2. **plan → implement → review 분리는 여러 파일에 걸친 신규 기능·큰 리팩토링에만** 쓴다. 단건 수정에는 붙이지 않는다.
3. **위임 결과는 diff·실행 결과로 확인한다.** 보고 문장만 믿지 않는다.
4. **모델·effort**: 에이전트 기본은 `model: sonnet` + low/medium. high가 필요한 작업은 sonnet high 대신 `model: opus` + `effort: low`로 한다(현재 코드 검증 3종: security-reviewer·database-reviewer·function-validator). 코드 검증 외에는 high를 쓰지 않는다. 상세는 `rules/performance.md`.
5. **`lee-wonho`(판정 대리 에이전트)는 사용자가 명시적으로 요청할 때만 쓴다.** 사용자에게 질문하기 전 단계로 끼워 넣지 않는다.
6. **막혔을 때는 혼자 더 시도하지 말고 모델 상향을 제안한다.** 같은 문제에 2회 실패했거나 원인을 특정 못 한 채 추측으로 고치려 하면 멈추고 제안한다. 절차는 `rules/performance.md`.


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
`project/`는 여러 하위 프로젝트(wecom/, modadam/, cosmic-renew/ 등)를 담는 작업 루트다. 하위 프로젝트마다 자기 `.claude/CLAUDE.md`가 있으면 그것을 따른다. 공용 설정은 `.claude/`(agents/ skills/ commands/ rules/ agent-refs/)에 있다.

## 슬래시 커맨드

`commands/`에 12개 있고 목록은 자동 주입된다. 실측상 사용자는 슬래시 대신 자연어로 지시하므로, 커맨드 존재를 전제하지 말고 STEP 1 라우팅으로 처리한다.

## 스킬

스킬 목록·설명은 하네스가 매 세션 자동 주입한다(각 `skills/<name>/SKILL.md`의 `description`이 SSOT). 여기 표로 중복 기재하지 않는다.

- `code-reviewer`가 실사용 1위(264회). 여러 파일에 걸친 코드 변경 뒤에 실행한다. 단건·소규모 수정에는 붙이지 않는다
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
- 사용자 응답은 항상 한국어로 쓴다. 작업 중 진행 안내·완료 보고·질문 전부 포함. 코드·명령어·파일 경로·영어 프롬프트 원문만 예외다. (2026-09-22 사용자 지시 "한글로 답해 룰에 적어둬 항상한글로 답하라고")
- em-dash(—) 절대 사용 금지: 모든 산출물(코드·주석·문서·이력서·SNS 글·커밋 메시지·사용자 응답 포함)에서 em-dash("—") 대신 하이픈("-")을 쓴다. em-dash는 AI가 쓴 티가 나는 대표 신호다. (2026-07-25)

세부 규칙: `rules/` 디렉토리 참조

---

## Cursor 연동

| Cursor 규칙 파일 | 역할 |
|----------------|------|
| `.cursor/rules/00-orchestrator.mdc` | 오케스트레이터 행동 + 에이전트 라우팅 |
| `.cursor/rules/01-workspace-rules.mdc` | 질문 우선·API 승낙·Git·.env 규칙 |
