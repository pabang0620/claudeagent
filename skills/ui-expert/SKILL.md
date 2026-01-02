# UI Expert Skill

Landing Studio 프로젝트의 UI/UX 디자인 전문 스킬. 페이지별 CSS 스타일링과 디자인 가이드.

## 기술 스택

- **Styling**: 페이지별 CSS 파일 (style.css)
- **Icons**: Lucide React
- **Layout**: CSS Grid / Flexbox
- **Shadcn/UI**: 사용자가 직접 요청할 때만 사용

## CSS 작성법 (frontend-dev와 동일)

### 1. CSS 스코핑 (필수)
```css
/* ✅ 올바른 방식: 페이지 최상위 클래스로 스코핑 */
.adminPage .header { ... }
.adminPage .contentWrap .title { font-size: 18px; }
.landingEditor .sidebar .menuItem { ... }

/* ❌ 금지: 전역 스타일 */
.header { ... }
.title { ... }
```

### 2. 네이밍 규칙
```css
/* camelCase 사용 */
.adminPage { }
.contentWrap { }
.inputUser { }
.phoneWrap { }
.footerClassName { }

/* ❌ 금지: kebab-case, snake_case */
.admin-page { }
.content_wrap { }
```

### 3. 반응형 디자인
```css
/* 모바일/PC 미리보기 분기 */
.preview-mobile .componentName { font-size: 10px; }
.preview-pc .componentName { font-size: 14px; }

/* clamp로 반응형 폰트 */
.footerDetail {
  font-size: clamp(10px, 2.5vw, 14px);
  line-height: clamp(16px, 3.8vw, 22px);
}

/* 미디어 쿼리 */
@media (min-width: 768px) {
  .componentName { padding: 20px 25px; }
}
```

### 4. 페이지별 CSS 파일
```
service/{페이지}/
├── Page.jsx
├── style.css      ← 페이지 전용 CSS
└── elements/
```

## 프로젝트 색상 체계

### 브랜드 색상 (index.css 기준)
```css
/* Primary - 보라색 계열 */
--primary: 272.9 81.1% 55.9%;      /* 메인 브랜드 컬러 */
--ring: 272.9 81.1% 55.9%;

/* 기본 색상 */
--background: 0 0% 100%;           /* 흰색 배경 */
--foreground: 222.2 84% 4.9%;      /* 어두운 텍스트 */
--muted: 210 40% 96.1%;            /* 비활성/배경 */
--muted-foreground: 215.4 16.3% 46.9%;

/* 위험/삭제 */
--destructive: 0 84.2% 60.2%;      /* 빨강 */
```

### 상태 색상
```css
#22C55E  /* 성공 - 녹색 */
#F59E0B  /* 경고 - 주황 */
#EF4444  /* 오류 - 빨강 */
#3B82F6  /* 정보 - 파랑 */
```

### 자주 사용하는 색상 (프로젝트 실제 사용)
```css
/* 배경 */
#f8f9fa  /* 밝은 회색 배경 */
#f5f5f5  /* 연한 회색 */
#2a2e33  /* 어두운 배경 (footer-obsidian) */
#333     /* 다크 배경 */

/* 테두리 */
#ddd, #e0e0e0  /* 기본 보더 */
#dee2e6        /* Shadcn 스타일 보더 */

/* 텍스트 */
#333, #212529  /* 기본 텍스트 */
#666, #6c757d  /* 보조 텍스트 */
#495057        /* 중간 텍스트 */

/* 액션 */
#007bff  /* 기본 파란색 버튼/링크 */
#0969da  /* 포커스 파란색 */
```

### 간격 (8px 그리드)
```
4px  (0.25rem) - 아주 작은 간격
8px  (0.5rem)  - 작은 간격
16px (1rem)    - 기본 간격
24px (1.5rem)  - 중간 간격
32px (2rem)    - 큰 간격
48px (3rem)    - 섹션 간격
```

### 타이포그래피
```
12px - 캡션, 라벨
14px - 본문 작은
16px - 본문 기본
18px - 리드 텍스트
20px - H4
24px - H3
30px - H2
36px - H1
```

## UI 패턴 (CSS)

### 폼 스타일 (프로젝트 패턴)
```css
/* 폼 래퍼 */
.formStyleClassName {
  margin: 0 auto 20px auto;
  width: 90%;
}

.inputWrap {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
}

/* 입력 필드 */
.inputUser {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.inputUser label {
  font-weight: bold;
  color: #333;
  width: 20%;
  flex-shrink: 0;
}

.inputUser input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.inputUser input:focus {
  border-color: #007bff;
}
```

### 버튼 스타일
```css
/* 기본 버튼 */
.pageName .primaryBtn {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.pageName .primaryBtn:hover {
  background: #0056b3;
}

.pageName .primaryBtn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 보조 버튼 */
.pageName .secondaryBtn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

/* 위험 버튼 */
.pageName .dangerBtn {
  background: #EF4444;
  color: white;
}
```

### 카드 스타일
```css
.pageName .card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pageName .card .cardTitle {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #212529;
}
```

### 상태 스타일
```css
/* 로딩 */
.pageName .loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
}

/* 빈 상태 */
.pageName .emptyState {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.pageName .emptyState .icon {
  font-size: 48px;
  margin-bottom: 16px;
}
```

## 접근성 체크리스트

- [ ] 버튼/링크에 명확한 텍스트 또는 aria-label
- [ ] 폼 필드에 Label 연결 (htmlFor + id)
- [ ] 색상 대비 4.5:1 이상
- [ ] 키보드 탐색 가능
- [ ] 포커스 표시 명확
- [ ] 이미지에 alt 텍스트

## 출력 형식

```markdown
## UI 디자인 제안

### 개요
{디자인 설명}

### 컴포넌트 구조
{HTML 구조 + CSS 클래스명}

### 반응형
- 모바일: {설명}
- 데스크톱: {설명}

### 상태
- 기본 / 호버 / 포커스 / 비활성 / 에러

### CSS 예시
```css
.pageName .componentName { ... }
```

### 접근성 고려사항
{필요한 aria 속성, 키보드 탐색 등}
```

## Guidelines

### Do
- CSS 스코핑 필수 (페이지 클래스명 prefix)
- camelCase 클래스명
- 8px 그리드 간격 준수
- 모바일/PC 미리보기 분기 (preview-mobile, preview-pc)
- 상태별 UI 고려 (로딩/빈 상태/에러)
- 기존 프로젝트 색상 체계 사용

### Don't
- 전역 CSS 스타일 작성
- Tailwind 클래스 직접 사용 (Shadcn 외부)
- 12px 미만 폰트 사용
- 색상만으로 정보 전달
- 포커스 표시 제거
- kebab-case 클래스명

## 협업 안내

이 스킬은 UI/UX 가이드라인입니다.
실제 구현은 **메인 Claude가 적절한 에이전트를 호출**하여 수행합니다.
