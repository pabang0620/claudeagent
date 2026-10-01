# schema-drift-auditor 참조 - 탐지 커맨드·리포트 형식

schema-drift-auditor 정의파일에서 옮긴 내용이다(2026-10-01 prompt-audit). 정의파일이 가리킬 때만 읽는다.

## 1. 축 1 탐지 커맨드

### 탐지 커맨드
```bash
# Zod 필드명 목록 추출 (z.object 내부 key)
grep -n "^\s*[a-zA-Z_][a-zA-Z0-9_]*:\s*z\." {validation_file}

# 해당 필드가 실제로 DB 컬럼과 이름이 같은지는 Read로 대조 (자동 매칭 불가 - 테이블명 매핑은 파일 경로/도메인명으로 사람이 판단)
```

## 2. 축 2 탐지 커맨드

### 탐지 커맨드
```bash
# INSERT 문과 컬럼 목록 추출 - VALUES 플레이스홀더 개수와 컬럼 개수가 맞는지도 함께 확인
grep -n "INSERT INTO" -A3 {repository_file}

# UPDATE SET 대상 컬럼 화이트리스트 패턴 확인 (있으면 R2류 누락이 여기도 반복될 가능성 높음)
# 주의: "SET\s"는 OFFSET을 오매칭한다 - 단어 경계로 SET만 매칭
grep -n "UPDATABLE\|ALLOWED_FIELDS\|\bSET\b" {repository_file}

# WHERE 절의 PK 컬럼과 바인딩값 타입 확인 (uuid 변수를 정수 PK 컬럼에 바인딩하는지)
grep -n "WHERE.*\bid\s*=\s*?" {repository_file}
```
(위 세 커맨드 모두 `\s`/`\b`를 쓴다. GNU grep 확장 문법이며 본 프로젝트 실행 환경(Linux)에서는 정상 동작한다. BSD grep(macOS 기본)에서 실행할 경우 매칭이 안 될 수 있으니 `ggrep` 또는 `grep -P`로 대체한다.)

## 3. 축 3 탐지 커맨드

### 탐지 커맨드

API client 파일만 봐서는 payload 필드가 안 보이는 경우가 흔하다 - 함수가 `create{Resource}(formData)`처럼 **이미 조립된 객체를 파라미터로만 받아 그대로 전달**하는 패턴이면, 실제 필드 구성은 API client가 아니라 그 함수를 호출하는 훅/컴포넌트에 있다. grep으로 필드가 안 보이면(변수명만 전달되는 형태) 아래 3번째 커맨드로 호출부까지 역추적해 실제 객체 리터럴 구성 지점을 찾는다. 또한 **파라미터명이 `formData`라는 이유만으로 실제 `FormData` 인스턴스라고 단정하지 말 것** - 관례적으로 일반 객체 리터럴에도 이 이름을 붙이는 경우가 흔하므로, `new FormData()` 생성 여부를 호출부에서 직접 확인해야 한다.

```bash
# POST/PUT/PATCH 요청 payload 객체 구성부
grep -n "\.post(\|\.put(\|\.patch(" {frontend_api_file}

# FormData append 키 목록
grep -n "formData.append(" {frontend_api_file}

# 위 두 커맨드에서 필드가 안 보이면(변수명만 전달) 호출부까지 역추적
grep -rn "{apiFunctionName}(" {frontend}/src
```

## 4. 리포트 출력 형식

## 출력 형식

```
# 스키마 drift 감사 리포트

## 대상 스택 확인
- Zod: {있음/없음} / DB 드라이버: {mysql2/pg} / Prisma: {없음 - 게이트 통과}
- DB 정의 소스: {라이브 DB 조회 / migrations 재구성 / 정적 스냅샷(미검증)}

## 요약
- CRITICAL: N건 (silent 데이터 유실)
- HIGH: N건 (에러 발생·기능 오작동)
- MEDIUM: N건
- LOW: N건

## CRITICAL

### [SD-01] 축 {1|2|3}
**위치**: {file}:{line} ↔ {file}:{line}
**불일치**: `{값 A}` (레이어 A) vs `{값 B}` (레이어 B)
**현상**: 어떤 데이터가 어떻게 유실/오류 나는지
**재현**: 어떤 API 요청/사용자 액션에서 발생하는지
**근거 레이어별 원문**: 각 레이어에서 실제로 읽은 코드 조각 1줄씩 인용
**현재 실사용 영향**: 아래 라벨 중 정확히 하나로 **필드를 시작**한다(부연은 그 뒤에 이어 쓴다). 이 CRITICAL이 F1/F2/Z1/Z4(Zod strip으로 인한 무증상 데이터 유실) 계열이면 `실사용 - 프론트 호출자 N건이 실제로 이 필드를 전송함을 확인` 또는 `휴면 landmine - 호출자 0건 확인되어 등급 강등 적용됨`(→ 등급을 HIGH로 낮춰 재기재) 중 하나로 쓴다. F1/F2/Z1/Z4에 해당하지 않는 CRITICAL(R2/R3/R5, Repository 구조분해·화이트리스트 누락 등)은 `해당 없음(강등 규칙 미적용 - 사유: F1/F2/Z1/Z4 미해당)`을 쓴다.

---

## HIGH / MEDIUM / LOW
(동일 형식)

## 판정
CRITICAL {N}건 존재 시 → "데이터 유실 가능 필드 있음, 수정 우선순위 최상위 권장"
CRITICAL 0건, HIGH {N}건 → "즉시 유실은 없으나 에러 유발 지점 존재"
전부 0건 → "[CLEAN] 3축 정합성 이상 없음"
```

발견 없는 축은 `[축 N] 이상 없음 - 체크리스트 전체 검토 완료`로 표기한다.

## 5. STEP 0 게이트 커맨드

```bash
# 1) Zod 사용 여부
grep -rl "from 'zod'\|require(\"zod\")\|require('zod')" {backend}/src --include="*.js" --include="*.ts" | head -5

# 2) DB 접근 방식 - package.json 의존성
grep -E "\"(mysql2|pg)\"" {backend}/package.json
grep -E "\"prisma\"|\"@prisma/client\"" {backend}/package.json
```

## 6. STEP 1 기반 데이터 수집 커맨드

```bash
# Zod 스키마 파일
find {backend}/src -iname "*validation*.js" -o -iname "*validation*.ts" -o -iname "*schema*.js" | grep -v node_modules

# Repository 파일
find {backend}/src -iname "*repository*.js" -o -iname "*repository*.ts" | grep -v node_modules

# 프론트엔드 API 클라이언트 (POST/PUT/PATCH payload 구성부)
find {frontend}/src -iname "*api*.js" -o -iname "*api*.ts" | grep -v node_modules

# DB 정의 소스 후보 - 아래 "스키마 신뢰성" 섹션의 우선순위대로 선택
find {project_root} -iname "*.sql" -not -path "*/node_modules/*"
find {project_root} -type d -iname "migrations" -not -path "*/node_modules/*"
```
