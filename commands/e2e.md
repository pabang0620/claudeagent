---
description: Playwright로 E2E 테스트를 생성하고 실행합니다. 테스트 시나리오를 만들고, 테스트를 실행하며, 스크린샷/비디오/추적을 캡처하고, 결과물을 업로드합니다.
---

# E2E Command

이 명령은 Playwright `npx playwright test` 스위트를 생성·유지·실행합니다.

> **주의 (2026-08-20)**: 전담 `e2e-runner` 에이전트는 전체 세션 로그 실측 호출 0회로 `agents-archive/`에 아카이빙됐습니다.
> 이 명령은 아래 방법론을 프롬프트에 실어 `general-purpose` 에이전트에 위임합니다.
> 브라우저를 직접 눌러보며 오류를 잡는 검증은 이 명령이 아니라 `playwright-verify-loop` 에이전트입니다.

## 이 명령이 하는 일

1. **테스트 시나리오 생성** - 사용자 플로우를 위한 Playwright 테스트 생성
2. **E2E 테스트 실행** - 여러 브라우저에서 테스트 실행
3. **결과물 캡처** - 실패 시 스크린샷, 비디오, 추적 기록
4. **결과 업로드** - HTML 리포트 및 JUnit XML
5. **불안정한 테스트 식별** - 불안정한 테스트 격리

## 언제 사용하나요

다음 경우 `/e2e` 사용:
- 중요한 사용자 여정 테스트 (로그인, 결제 등)
- 다단계 플로우가 end-to-end로 작동하는지 검증
- UI 상호작용 및 네비게이션 테스트
- 프론트엔드와 백엔드 간 통합 검증
- 프로덕션 배포 준비

## 작동 방식

위임받은 에이전트는:

1. **사용자 플로우 분석** 및 테스트 시나리오 식별
2. **Playwright 테스트 생성** (Page Object Model 패턴 사용)
3. **테스트 실행** (Chrome, Firefox, Safari 등)
4. **실패 캡처** (스크린샷, 비디오, 추적)
5. **리포트 생성** (결과 및 결과물 포함)
6. **불안정한 테스트 식별** 및 수정 권장사항 제시

## 사용 예시

```
# E2E 테스트 생성: <플로우명>
## 시나리오: <사용자 여정 단계 목록>
## 생성 파일: tests/e2e/<영역>/<이름>.spec.ts (Page Object Model)
## 실행 결과: 통과 N / 실패 N / 불안정 N
## 결과물: playwright-report/index.html, 실패 시 스크린샷·추적
```

## 테스트 결과물

테스트 실행 시 다음 결과물이 캡처됩니다:

**모든 테스트:**
- 타임라인 및 결과가 포함된 HTML 리포트
- CI 통합을 위한 JUnit XML

**실패 시에만:**
- 실패 상태의 스크린샷
- 테스트 비디오 녹화
- 디버깅을 위한 추적 파일 (단계별 재생)
- 네트워크 로그
- 콘솔 로그

## 결과물 확인

```bash
# 브라우저에서 HTML 리포트 보기
npx playwright show-report

# 특정 추적 파일 보기
npx playwright show-trace artifacts/trace-abc123.zip

# 스크린샷은 artifacts/ 디렉터리에 저장됨
open artifacts/search-results.png
```

## 불안정한 테스트 감지

테스트가 간헐적으로 실패하는 경우:

```
⚠️  불안정한 테스트 감지: tests/e2e/markets/trade.spec.ts

테스트 통과율: 7/10 (70%)

일반적인 실패:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

수정 권장사항:
1. 명시적 대기 추가: await page.waitForSelector('[data-testid="confirm-btn"]')
2. 타임아웃 증가: { timeout: 10000 }
3. 컴포넌트의 race condition 확인
4. 애니메이션에 의해 요소가 숨겨지지 않는지 확인

격리 권장사항: 수정될 때까지 test.fixme()로 표시
```

## 브라우저 구성

기본적으로 여러 브라우저에서 테스트 실행:
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (선택사항)

브라우저 조정은 `playwright.config.ts`에서 설정합니다.

## CI/CD 통합

CI 파이프라인에 추가:

```yaml
# .github/workflows/e2e.yml
- name: Playwright 설치
  run: npx playwright install --with-deps

- name: E2E 테스트 실행
  run: npx playwright test

- name: 결과물 업로드
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## 모범 사례

**해야 할 것:**
- ✅ 유지보수성을 위해 Page Object Model 사용
- ✅ 선택자에 data-testid 속성 사용
- ✅ API 응답 대기, 임의 타임아웃 사용 안 함
- ✅ 중요한 사용자 여정을 end-to-end로 테스트
- ✅ main 브랜치에 머지하기 전 테스트 실행
- ✅ 테스트 실패 시 결과물 검토

**하지 말아야 할 것:**
- ❌ 취약한 선택자 사용 (CSS 클래스는 변경될 수 있음)
- ❌ 구현 세부사항 테스트
- ❌ 프로덕션에서 테스트 실행
- ❌ 불안정한 테스트 무시
- ❌ 실패 시 결과물 검토 건너뛰기
- ❌ 모든 엣지 케이스를 E2E로 테스트 (단위 테스트 사용)

## 다른 명령과의 통합

- `/plan` - 테스트할 중요한 여정 식별
- `/tdd` - 단위 테스트 (더 빠르고 세밀함)
- `/e2e` - 통합 및 사용자 여정 테스트
- `/code-review` - 테스트 품질 검증

## 관련 에이전트

전담 에이전트 정의는 `agents-archive/e2e-runner-retired-2026-08-20.md`에 보관돼 있습니다.
필요해지면 `agents/`로 되돌리고 `rules/agents.md` STEP 1 표에 재등재하십시오.

## 빠른 명령어

```bash
# 모든 E2E 테스트 실행
npx playwright test

# 특정 테스트 파일 실행
npx playwright test tests/e2e/markets/search.spec.ts

# 브라우저를 볼 수 있는 모드로 실행
npx playwright test --headed

# 테스트 디버그
npx playwright test --debug

# 테스트 코드 생성
npx playwright codegen http://localhost:3000

# 리포트 보기
npx playwright show-report
```
