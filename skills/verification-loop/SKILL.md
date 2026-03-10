---
name: verification-loop
description: 기능 완료 후, PR 전, 리팩토링 후 코드 품질 검증을 위한 포괄적인 검증 시스템
---

# 검증 루프 스킬

Claude Code 세션을 위한 포괄적인 검증 시스템

## 언제 사용하나

다음 상황에서 이 스킬을 실행하세요:
- 기능 또는 중요한 코드 변경 완료 후
- PR 생성 전
- 품질 게이트 통과 확인 시
- 리팩토링 후

## 검증 단계

### 1단계: 빌드 검증
```bash
# 프로젝트가 빌드되는지 확인
npm run build 2>&1 | tail -20
# 또는
pnpm build 2>&1 | tail -20
```

빌드 실패 시, 중단하고 계속하기 전에 수정하세요.

### 2단계: 타입 체크
```bash
# TypeScript 프로젝트
npx tsc --noEmit 2>&1 | head -30

# Python 프로젝트
pyright . 2>&1 | head -30
```

모든 타입 에러 보고. 계속하기 전에 중요한 것들 수정.

### 3단계: Lint 체크
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### 4단계: 테스트 스위트
```bash
# 커버리지와 함께 테스트 실행
npm run test -- --coverage 2>&1 | tail -50

# 커버리지 임계값 확인
# 목표: 최소 80%
```

보고:
- 전체 테스트: X
- 통과: X
- 실패: X
- 커버리지: X%

### 5단계: 보안 스캔
```bash
# 시크릿 확인
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# console.log 확인
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### 6단계: Diff 리뷰
```bash
# 무엇이 변경되었는지 표시
git diff --stat
git diff HEAD~1 --name-only
```

변경된 각 파일 검토:
- 의도하지 않은 변경
- 누락된 에러 처리
- 잠재적 엣지 케이스

## 출력 형식

모든 단계 실행 후, 검증 리포트 생성:

```
검증 리포트
==================

빌드:     [통과/실패]
타입:     [통과/실패] (X 에러)
Lint:     [통과/실패] (X 경고)
테스트:   [통과/실패] (X/Y 통과, Z% 커버리지)
보안:     [통과/실패] (X 이슈)
Diff:     [X 파일 변경]

전체:     [PR 준비 완료/준비 안 됨]

수정할 이슈:
1. ...
2. ...
```

## 연속 모드

긴 세션의 경우, 15분마다 또는 주요 변경 후 검증 실행:

```markdown
정신적 체크포인트 설정:
- 각 함수 완료 후
- 컴포넌트 완료 후
- 다음 작업으로 이동하기 전

실행: /verify
```

## Hooks와의 통합

이 스킬은 PostToolUse hooks를 보완하지만 더 심층적인 검증을 제공합니다.
Hooks는 즉시 이슈를 잡고; 이 스킬은 포괄적인 리뷰를 제공합니다.

## Node.js/React 프로젝트 검증 체크리스트

### 프론트엔드 (React)
- [ ] `npm run build` 성공
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 컴포넌트 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 번들 크기 확인 (예상 범위 내)
- [ ] 접근성 체크 (a11y)

### 백엔드 (Node.js/Express)
- [ ] 서버 시작 성공
- [ ] API 엔드포인트 응답
- [ ] 데이터베이스 연결 성공
- [ ] 환경 변수 설정
- [ ] API 테스트 통과
- [ ] Prisma 마이그레이션 적용
- [ ] 에러 처리 검증

### 전체 스택
- [ ] Git 상태 깨끗 (의도된 변경만)
- [ ] 커밋 메시지 의미있음
- [ ] README 업데이트 (필요시)
- [ ] 환경 변수 문서화
- [ ] 의존성 최신
- [ ] 보안 취약점 없음 (`npm audit`)

## 빠른 검증 (간단한 체크)

시간이 부족할 때, 최소 실행:

```bash
# 빌드 + 테스트 + Lint
npm run build && npm test && npm run lint
```

## 전체 검증 (철저한 체크)

PR 전에는 전체 검증 실행:

```bash
# 1. 빌드
npm run build

# 2. 타입 체크
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. 테스트 (커버리지)
npm test -- --coverage

# 5. E2E 테스트
npx playwright test

# 6. 보안 감사
npm audit

# 7. Git 상태
git status
```

## 자동화 스크립트 예시

`scripts/verify.sh`:
```bash
#!/bin/bash

echo "🔍 검증 시작..."

# 빌드
echo "\n1️⃣  빌드 검증..."
npm run build || { echo "❌ 빌드 실패"; exit 1; }

# 타입
echo "\n2️⃣  타입 체크..."
npx tsc --noEmit || { echo "⚠️  타입 에러 발견"; }

# Lint
echo "\n3️⃣  Lint 체크..."
npm run lint || { echo "⚠️  Lint 에러 발견"; }

# 테스트
echo "\n4️⃣  테스트 실행..."
npm test -- --coverage || { echo "❌ 테스트 실패"; exit 1; }

# 보안
echo "\n5️⃣  보안 감사..."
npm audit --audit-level=high || { echo "⚠️  보안 취약점 발견"; }

echo "\n✅ 검증 완료!"
```

---

**핵심**: 검증은 코드 품질의 마지막 방어선입니다. 배포 전 항상 검증하세요.
