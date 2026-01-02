---
name: frontend-dev
description: Landing Studio 프론트엔드 개발 컨벤션. React 컴포넌트, Shadcn/UI, CSS 작업 시 사용. 프론트엔드 코드 작성, 수정, 리뷰 시 자동 적용.
---

# Landing Studio Frontend Conventions

## 기술 스택

- **Framework**: React 19 + Vite 7
- **Routing**: React Router v7
- **UI Library**: Shadcn/UI (Radix UI + Tailwind 기반)
- **Styling**: 페이지별 CSS 파일 분리
- **Icons**: Lucide React, FontAwesome
- **Table**: TanStack React Table v8
- **HTTP Client**: Fetch API
- **Drag & Drop**: dnd-kit
- **상태관리**: localStorage 기본, 필요시 Recoil

## 디렉토리 구조

```
src/
├── components/           # 재사용 컴포넌트
│   └── ui/              # Shadcn/UI 컴포넌트 (Tailwind 사용)
├── service/             # 페이지 단위 모듈
│   └── {페이지}/
│       ├── Page.jsx     # 메인 컴포넌트
│       ├── api.js       # API 함수
│       ├── constants.js # 상수 정의
│       ├── helpers.js   # 유틸리티
│       ├── style.css    # 페이지 전용 스타일
│       └── elements/    # 서브 컴포넌트
├── hooks/               # 커스텀 훅
├── lib/                 # 유틸리티
├── main.jsx            # 엔트리포인트
├── Page.jsx            # 라우터 설정
└── index.css           # 글로벌 스타일
```

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 함수명 | PascalCase | `function AdminPage()` |
| 파일명 | PascalCase (현재 유지) | `Page.jsx`, `Header.jsx` |
| 함수/변수 | camelCase | `handleSubmit`, `formData` |
| 상수 | camelCase | `staticButtonSets` |
| CSS 클래스 | camelCase | `footerDark`, `formLight` |

## 컴포넌트 패턴

### 기본 구조 (성능 최적화 순서)
```jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function componentName({ prop1, prop2 }) {
  // 1. Refs (DOM 참조, 리렌더링 불필요한 값)
  const inputRef = useRef(null);

  // 2. 라우터 훅
  const navigate = useNavigate();

  // 3. State 선언
  const [state, setState] = useState(initialValue);

  // 4. Derived state (메모이제이션)
  const computed = useMemo(() => {
    // 비용이 큰 계산
  }, [deps]);

  // 5. 이벤트 핸들러 (메모이제이션)
  const handleClick = useCallback(() => {
    // 핸들러 로직
  }, [deps]);

  // 6. Effects (부수 효과)
  useEffect(() => {
    // 초기화 로직
    return () => {
      // cleanup
    };
  }, [deps]);

  // 7. 렌더링
  return (
    <div className="componentName">
      {/* JSX */}
    </div>
  );
}
```

## CSS 규칙

### 최상단 클래스 스코핑 (필수)

모든 CSS는 최상단 컴포넌트 클래스명을 앞에 붙여서 스코핑한다.

```jsx
// JSX
<div className="adminPage">
  <button className="postBtn">저장</button>
  <div className="contentWrap">
    <span className="title">제목</span>
  </div>
</div>
```

```css
/* CSS - 최상단 클래스 .adminPage를 항상 앞에 붙임 */
.adminPage .postBtn {
  background: #007bff;
  color: white;
}

.adminPage .contentWrap {
  padding: 20px;
}

.adminPage .contentWrap .title {
  font-size: 18px;
  font-weight: bold;
}
```

### 잘못된 예시
```css
/* ❌ 최상단 클래스 없이 작성 - 금지 */
.postBtn {
  background: #007bff;
}

.title {
  font-size: 18px;
}
```

### 올바른 예시
```css
/* ✅ 최상단 클래스로 스코핑 */
.adminPage .postBtn {
  background: #007bff;
}

.adminPage .title {
  font-size: 18px;
}
```

## API 통합 패턴

### 기본 Fetch 패턴
```javascript
// service/{페이지}/api.js
export const getResource = async () => {
  try {
    const response = await fetch('/api/resource', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
```

### FormData (파일 업로드)
```javascript
export const uploadResource = async (formData) => {
  try {
    const response = await fetch('/api/resource', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // Content-Type 생략 - 브라우저가 자동 설정
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};
```

## 인증 & 상태관리

```javascript
// 토큰 저장
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify({
  userId: response.data.user.user_id,
  username: response.data.user.username,
  name: response.data.user.name,
  role: response.data.user.role,
}));

// 토큰 사용
const token = localStorage.getItem('token');

// 사용자 정보 조회
const user = JSON.parse(localStorage.getItem('user'));
```

### Recoil (필요시)
```javascript
import { atom, useRecoilState } from 'recoil';

// atom 정의
export const userState = atom({
  key: 'userState',
  default: null,
});

// 사용
const [user, setUser] = useRecoilState(userState);
```

## API 응답 처리

백엔드 응답 형식 `{ success, data, msg }`에 맞춰 처리:

```javascript
const handleSubmit = async () => {
  try {
    setLoading(true);
    const response = await apiFunction(data);

    if (response.success) {
      // 성공: response.data 사용
      setData(response.data);
    } else {
      // 실패: response.msg 표시
      setError(response.msg);
    }
  } catch (error) {
    setError('서버 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};
```

## 에러 코드 처리

### HTTP 상태 코드별 처리
| 코드 | 의미 | 프론트엔드 처리 |
|------|------|----------------|
| 200 | 성공 | `response.data` 사용 |
| 201 | 생성 성공 | `response.data` 사용, 성공 메시지 표시 |
| 400 | 잘못된 요청 | `response.msg` 표시 (유효성 검사 실패) |
| 401 | 인증 필요 | 로그인 페이지로 리다이렉트 |
| 403 | 권한 없음 | 권한 없음 메시지 표시 |
| 404 | 리소스 없음 | `response.msg` 표시 |
| 409 | 중복 충돌 | `response.msg` 표시 (이미 존재) |
| 500 | 서버 오류 | 일반 에러 메시지 표시 |

### 에러 처리 패턴

```javascript
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError('');

    const response = await fetch('/api/resource', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // 401 - 인증 만료 시 로그인으로 이동
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    // 성공/실패 처리
    if (result.success) {
      setData(result.data);
      // 성공 메시지 또는 페이지 이동
    } else {
      // 백엔드에서 보낸 에러 메시지 표시
      setError(result.msg);
    }

  } catch (error) {
    // 네트워크 오류 등 예외 상황
    console.error('API 오류:', error);
    setError('서버와 통신 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};
```

### 에러 메시지 표시

```jsx
// 에러 상태
const [error, setError] = useState('');

// JSX에서 에러 표시
{error && (
  <div className="errorMessage">
    {error}
  </div>
)}
```

### 공통 에러 메시지 (백엔드 응답)
```
// 400 - 유효성 검사
"도메인은 필수입니다."
"파일 크기는 5MB를 초과할 수 없습니다."

// 401 - 인증
"인증 토큰이 없습니다."
"유효하지 않은 토큰입니다."

// 404 - 리소스 없음
"랜딩 페이지를 찾을 수 없습니다."
"도메인을 찾을 수 없습니다."

// 409 - 중복
"이미 존재하는 도메인입니다."

// 500 - 서버 오류
"서버 오류가 발생했습니다."
```

## Import 별칭

```javascript
// vite.config.js에 설정된 별칭
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## 주석

- **언어**: 한국어 사용
- **함수 설명**: 필요시 JSDoc 스타일

```javascript
/**
 * 랜딩 페이지 데이터를 조회한다
 * @param {string} adNumber - 광고 번호
 * @returns {Promise<Object>} 랜딩 데이터
 */
const getLanding = async (adNumber) => { ... };
```

## 코드 수정 원칙

### 기능 보존 (최우선)
- **구조 수정 요청 시에도 기능은 절대 수정하지 않음**
- 리팩토링과 기능 변경을 동시에 하지 않음
- 기능 변경이 필요하면 반드시 사전에 확인 요청

```
// 예시: "컴포넌트 구조 정리해줘" 요청 시
✅ 파일 분리, 코드 정리 → OK
❌ 기존 동작 변경 → 절대 금지
```

### 수정 범위 준수
- 요청받은 범위만 수정
- "ついでに(김에)" 식의 추가 수정 금지
- 관련 없는 코드 건드리지 않기

### 컴포넌트화 원칙
- 반복되는 UI는 컴포넌트로 분리
- 한 컴포넌트는 **300줄 이하** 권장
- 길어지면 `elements/` 폴더에 서브 컴포넌트로 분리

```
// ❌ 나쁜 예: 한 파일에 모든 코드
Page.jsx (500줄)

// ✅ 좋은 예: 컴포넌트 분리
Page.jsx (150줄)
elements/
├── FormSection.jsx (80줄)
├── TableSection.jsx (100줄)
└── ModalPopup.jsx (70줄)
```

### 분리 기준
- **UI 반복**: 2회 이상 반복되면 컴포넌트화
- **논리적 단위**: 폼, 테이블, 모달 등 독립적 영역
- **가독성**: 한 눈에 파악하기 어려우면 분리

### 코드 가독성
- 중첩은 최대 3단계까지
- 조건문이 복잡하면 early return 사용
- 긴 JSX는 변수로 추출

```jsx
// ❌ 복잡한 중첩
return (
  <div>
    {condition1 && (
      <div>
        {condition2 && (
          <div>
            {condition3 && <Component />}
          </div>
        )}
      </div>
    )}
  </div>
);

// ✅ 분리 또는 early return
if (!condition1 || !condition2 || !condition3) return null;
return <Component />;
```

## 체크리스트

- [ ] **구조 수정 시에도 기능 절대 보존**
- [ ] **요청 범위만 수정, 추가 수정 금지**
- [ ] 컴포넌트 함수명은 PascalCase
- [ ] 변수/함수/상수/CSS클래스는 camelCase
- [ ] CSS는 최상단 클래스로 스코핑
- [ ] CSS 파일은 페이지별 분리 (`style.css`)
- [ ] Refs → State → Memoized → Handler → Effects 순서
- [ ] API 응답은 `{ success, data, msg }` 형식 처리
- [ ] 401 에러 시 로그인 페이지로 리다이렉트
- [ ] 주석은 한국어로 작성
- [ ] 컴포넌트는 300줄 이하로 유지
- [ ] 반복 UI는 컴포넌트로 분리
