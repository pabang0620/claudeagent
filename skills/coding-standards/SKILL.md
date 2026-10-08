---
name: coding-standards
description: JS/TS 코드를 작성·수정할 때 자동 적용하는 이 사용자의 코딩 표준. rules/coding-style.md가 참조하는 불변성·에러 처리·zod 스키마 예시, 네이밍, 주석, 테스트 이름, WeCom 회고 기반 파일 규칙을 담는다. React 상세는 frontend-patterns, Express 상세는 backend-patterns.
---

# 코딩 표준 & 베스트 프랙티스

rules/coding-style.md가 참조하는 예시와 WeCom 회고 기반 규칙만 둔다. 네이밍·주석·테스트 이름 같은 일반 원칙은 모델 기본값에 맡긴다.

## JavaScript/TypeScript 표준

### 불변성 패턴 (rules/coding-style.md Immutability의 예시)

```javascript
// 스프레드로 새 객체·배열을 만든다
const updatedUser = {
  ...user,
  name: '새 이름'
};

const updatedArray = [...items, newItem];

// 직접 변경 금지
user.name = '새 이름';
items.push(newItem);
```

### 에러 처리 (rules/coding-style.md B형. HTTP 핸들러는 A형 `next(err)`)

```javascript
// 로그 남기고 호출자가 이해할 에러로 다시 던진다
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('요청 실패:', error);
    throw new Error('데이터 조회에 실패했습니다.');
  }
}

```

## API 설계 표준

### 응답 형식

응답 shape은 rules/patterns.md의 확인 순서를 따른다(프로젝트 response.js 실측 우선).

### 입력 유효성 검사

```javascript
import { z } from 'zod'

// 스키마 유효성 검사 (rules/coding-style.md Input Validation의 예시)
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
});

async function createMarket(req, res, next) {
  try {
    const validated = CreateMarketSchema.parse(req.body);
    // 검증된 데이터로 진행
  } catch (err) {
    next(err); // ZodError → 400 변환은 중앙 errorHandler가 담당
  }
}
```

## 코드 스멜
- 깊은 중첩은 조기 반환으로 편다. 반복되는 숫자·문자열 설정값은 UPPER_SNAKE_CASE 상수나 `.env`로 뺀다 (rules/coding-style.md 마무리 전 확인).
- 함수 길이 자체는 룰이 아니다. 파일만 500줄 상한 (rules/coding-style.md).

---

## WeCom 회고 기반 추가 표준 (347 fix 분석 교훈)

### 컨벤션 강제 (convention-enforcer 스킬 참조)
- navigate/Link 경로 문자열 리터럴 금지 → ROUTES 상수 사용
- useParams 변수명은 라우트 정의 `:paramName` 과 일치 필수
- admin*Routes.js 에 requireAdmin 미사용 시 부팅 실패
- .env.example 필수, zod 런타임 검증

### 파일 규칙
- 컴포넌트: PascalCase.jsx
- 훅: use*.js
- 파일 500줄 초과 시 분할, 미만이면 분할 강제 안 함 (rules/coding-style.md)
- pages/mobile/* 복제 디렉터리 금지

### 에러 방지 (error-prevention-rules 스킬 참조)
- useEffect fetch → AbortController cleanup
- img onError → onerror=null 자기 해제
- setTimeout/setInterval/Observer → useEffect cleanup
- addEventListener → removeEventListener
- localStorage.setItem → try/catch (iOS Safari)
