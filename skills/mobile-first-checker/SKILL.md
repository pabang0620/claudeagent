---
name: mobile-first-checker
description: React/CSS 코드 작성·수정 시 모바일 안티패턴을 사전 차단하는 정적 검사 스킬. "PC 먼저 → 모바일 복제" 이중 파일 구조 금지, 드래그/터치/스크롤 락/blob cleanup/필터 센티넬/scrollLock/모바일 경로/고정 min 크기 등 WeCom 프로젝트 36건의 mobile fix를 근거로 도출된 12개 룰(mf-000~mf-011). `.jsx/.tsx/.css/.scss` 저장 시점, 모바일 레이아웃 작업 시, 드래그·스크롤·필터·모달 UI 설계 시 자동·수동 적용.
---

# mobile-first-checker

> WeCom 회고 근거: fix 커밋 347건 중 "mobile" 관련 36건 + CSS·반응형 140건. `pages/mobile/*` 복제 아키텍처 + 필터 센티넬 부재 + blob cleanup 누락 등 9개 패턴이 **각 3~5회 반복 발생**. 이 스킬은 그 반복을 Day 0부터 0건으로 만든다.

## 적용 트리거

1. **자동** — `.jsx/.tsx/.css/.scss` 파일 저장/편집 직후
2. **수동** — `/mobile-first-check <경로>` 또는 "모바일 체크해줘"
3. **계획 단계** — 새 페이지/컴포넌트 설계 시 planner의 사전 체크리스트로 주입

## 핵심 원칙 (레드 라인)

| # | 원칙 | 근거 |
|---|---|---|
| RL-1 | `pages/mobile/*` **디렉터리 생성 금지**. 반드시 `useIsMobile()` 조건부 렌더. | `HomePage.jsx` 81회, `MobileHomePage.jsx` 34회 재수정 |
| RL-2 | 기본 CSS는 **모바일(375px) 퍼스트**, PC는 `@media (min-width: 768px)` 확장만 | CSS sed 일괄 수정 `82fbc6a`, `b3f2c44` |
| RL-3 | 고정 `width:Npx` 금지 (아이콘/보더 예외) — `max-width`/`min-width:0`/`flex` 사용 | `2f3a299` 모바일 오버플로우 |
| RL-4 | 전역 reset 7종(아래 §global-reset) 없이는 어떠한 페이지도 작성 금지 | 오버플로우·이미지 흘림 fix 30+건 |
| RL-5 | 드래그·터치 핸들러는 **window/document 레벨**에 부착. 컴포넌트 요소 레벨 금지 | `add4afe` 커서 이탈 시 드래그 깨짐 |
| RL-6 | React 합성 `onTouchMove`에 `preventDefault` 금지 (passive:true 고정). `addEventListener('touchmove', fn, { passive: false })` 필수 | `3b3d80e` |
| RL-7 | 필터 "전체" 값은 `null` 금지, **`ALL` 센티넬 문자열** 사용 | `03bb2d4` 전체 필터 활성화 실패 5회 |
| RL-8 | `URL.createObjectURL` 호출 지점 옆에 **반드시 cleanup 짝** (`useEffect` return 또는 `onLoad` 후 revoke) | `fd329d7`, `4793511` 메모리 누수 |
| RL-9 | Modal/BottomSheet 열릴 때 **scrollLock 유틸 필수**. `document.body.style.overflow` 직접 조작 금지 | `f247671` 전역 레이아웃 쉬프트 |

---

## 체크리스트 룰 (mf-000 ~ mf-008)

검사 대상: 변경된 파일. 각 룰은 `severity: error | warn`, `autofix: yes | hint | no`, `match`, `antipattern`, `correct` 을 포함.

### mf-000 — 모바일 복제 페이지 금지 (error, autofix: no)
**match** (3가지 모드):
1. **신규 파일** — 경로에 `pages/mobile/` 포함하는 신규 파일 생성 → error (기존 유지)
2. **전수 감사 모드** (`/mobile-first-check --full` 또는 스킬 최초 적용 시) — 기존 `pages/mobile/*` 전수 탐색 → "기존 복제 구조 N개 파일 발견. 단계적 통합 계획 수립 권장" warn 리포트
3. **신규 페이지 컴포넌트** — `pages/` 하위 신규 파일에 `useIsMobile` import 없으면 warn

(하위 호환) 기존 경로 패턴: `pages/mobile/`, `m[A-Z][a-zA-Z]*Page`, `Mobile[A-Z][a-zA-Z]*Page` 패턴 신규 파일
**antipattern**:
```
pages/
  HomePage.jsx
  mobile/HomePage.jsx  ← 금지
```
**correct**:
```jsx
// HomePage.jsx 단일 파일
import { useIsMobile } from '@/hooks/useIsMobile'
export default function HomePage() {
  const isMobile = useIsMobile()
  return isMobile ? <HomeMobileView/> : <HomeDesktopView/>
}
```
**설명**: 동일 페이지 2파일 구조는 드리프트(색상·경로·상태관리)를 필연적으로 만든다. WeCom에서 홈/뷰어/상세/마이 4개 모두 평균 25회 재수정됨.

---

### mf-001 — 전역 reset 7종 확인 (error, autofix: hint)
**자동 트리거**: 스킬이 처음 프로젝트에 적용될 때 1회 전수 감사. 이후 `.css/.scss` 저장 시 global 파일 변경 감지 시 재검사.
**탐색 경로 확장**: `src/styles/global.css`, `src/global.css`, `src/styles/reset.css` 순서
**match**: `src/**/*.{css,scss,sass,less}` 중 전역 스타일 파일 탐지 순서:
1. `reset.{css,scss}`, `global.{css,scss}`, `index.{css,scss}`, `main.{css,scss}`, `base.{css,scss}`, `app.{css,scss}`, `App.{css,scss}` 순서로 검색
2. 1번에 해당하는 파일이 없으면: **error** — "전역 reset CSS 파일 없음. reset.css 생성 필요" (사용자 승인 후 생성)
3. 파일이 있으면: 아래 7종 규칙 포함 여부 검사
**필수 포함**:
```css
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; overflow-x: hidden; }
img, video, svg { max-width: 100%; height: auto; display: block; }
button { font: inherit; background: none; border: none; cursor: pointer; }
a { color: inherit; text-decoration: none; }
input, textarea, select { font: inherit; }
body { -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }
```
**누락 시**: 사용자에게 생성 여부 확인 후 Edit 적용 (사용자 승인 필수 — 파일 자동 수정 금지)

---

### mf-002 — 고정 px width 금지 (warn, autofix: hint)
**antipattern** (CSS):
```css
.card { width: 320px; }         /* 모바일 375px - 패딩에서 깨짐 */
.modal { width: 600px; }
.sidebar { width: 280px; min-width: 280px; }
```
**correct**:
```css
.card { width: 100%; max-width: 320px; }
.modal { width: min(100%, 600px); }
.sidebar { width: 100%; max-width: 280px; }

/* flex 컨테이너 자식은 min-width:0 필수 */
.row > * { min-width: 0; }
```
**예외**: 아이콘/썸네일(< 80px), 보더/간격, 인라인 SVG

---

### mf-003 — PC-only 미디어 쿼리 구조 강제 (warn, autofix: hint)
**antipattern**: `@media (max-width: 767px) { ... }` (PC 기본 → 모바일 override 구조)
**correct**: 모바일 기본 → `@media (min-width: 768px) { ... }` 로 PC 확장
**예외 (통과)**:
- 경로에 `/admin/`, `pages/admin/` 포함 파일 (관리자 패널은 PC 전용 UI — mobile-first 원칙 불필요)
- 파일명이 `Admin*.css`, `Admin*.scss` 형태
- 경로에 `/layouts/`, `Layout.css`, `Header.css`, `Footer.css` 포함 파일 — PC 레이아웃 컴포넌트 (모바일 분리 아키텍처에서 PC-first 의도)
**이유**: PC-first 구조는 모바일 override를 까먹기 쉽고 CSS 특이도 싸움을 유발. WeCom `2f3a299` 대수술의 원인.

---

### mf-004 — 부모 체인 overflow-x 검사 (warn, autofix: hint)
**match**: CSS 파일 내 `overflow-x:\s*(auto|scroll)` 패턴이 있는 모든 파일
**1단계 자동 감지** (Grep 가능):
- 동일 CSS 파일 내에 `overflow-x: auto|scroll` 규칙과 별도 선택자의 `overflow:\s*hidden` 규칙이 공존 → warn
- 형제/부모 선택자 추정: 자식 선택자(`.parent .child`)인데 부모에 `overflow: hidden`이 있는 경우
**2단계 수동 확인** (Claude 판단 필요, 1단계 warn 시 자동 수행):
- JSX 파일에서 해당 가로 스크롤 컴포넌트의 DOM 트리를 직접 조사
- "부모 체인에 overflow: hidden 또는 overflow-x: hidden이 있는지 수동 점검 요망"을 메시지에 명시
**올바른 수정**:
```css
/* 가로 스크롤 컨테이너의 직접 부모: hidden → clip 변경 */
.filter-wrapper { overflow-x: clip; }   /* clip은 내부 가로 스크롤 허용 */
.chip-scroller { overflow-x: auto; -webkit-overflow-scrolling: touch; }
```
**근거**: `6b2987f` tabs-viewport overflow-x clip

---

### mf-005 — 드래그/커서는 window 리스너 (error, autofix: hint)
**감지 패턴**: 동일 JSX 요소에 `onMouseMove` 또는 `onMouseUp`이 props로 존재하면 error. `onMouseDown` 단독은 허용.
**antipattern** (동일 요소에 Move/Up 함께):
```jsx
// 패턴 1: 동일 요소에 Move+Up 모두
<div onMouseDown={start} onMouseMove={move} onMouseUp={end}>
// 패턴 2: onMouseMove 단독
<div onMouseMove={handleDrag}>
```
**허용** (onMouseDown → window 등록):
```jsx
const handleMouseDown = (e) => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp, { once: true })
}
<div onMouseDown={handleMouseDown}>  // 경고 없음
```
**correct**:
```jsx
const onMouseDown = (e) => {
  startX.current = e.clientX
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp, { once: true })
}
// passive:false로 touchmove 전역 부착 필요 시 useEffect에서 addEventListener
```
**이유**: 요소 레벨 핸들러는 커서가 요소 밖으로 나가면 드래그가 깨짐. `add4afe` 참고. 공용 훅 `useDragScroll` 제공 권장.

---

### mf-006 — touchmove passive 선언 (error, autofix: hint)
**감지 조건** (false positive 방지):
- JSX 의 `onTouchMove` 핸들러 **인라인 함수** 내부에 `e.preventDefault()` 호출이 있는 경우 → **error**
- 참조형 핸들러(`onTouchMove={handler}`) 는 **handler 내부에 `preventDefault` 존재 확인이 필요**한 warn 으로 하향
- swipe-to-close 처럼 CSS `transform` 만 조작하는 onTouchMove 는 passive 무관 → **통과**
**antipattern**:
```jsx
<div onTouchMove={(e) => e.preventDefault()} /> // React 합성 이벤트는 passive:true 고정 → 경고/동작 안됨
```
**correct**:
```jsx
useEffect(() => {
  const el = ref.current
  const handler = (e) => { if (shouldLock) e.preventDefault() }
  el.addEventListener('touchmove', handler, { passive: false })
  return () => el.removeEventListener('touchmove', handler)
}, [shouldLock])
```
**근거**: `3b3d80e`

---

### mf-007 — 필터 "전체" 센티넬 (error, autofix: hint)
**match** (필터 맥락으로 한정, 3가지 패턴):
1. 변수명에 `filter`, `univ`, `genre`, `category`, `tab`, `type`, `sort`, `active*Id`, `selected*Id` 포함 + `useState(null)`
2. 필터 맥락 state 가 `useState(null)` 인데 조건 분기에서 다음 패턴으로 null 여부를 암묵적 확인:
   - `state ?`  (truthy 체크)
   - `!state` (falsy 체크)
   - `Boolean(state)` 
   - `state && ...` 
   → "truthy null 필터 패턴 — ALL 센티넬 권장" warn
3. 렌더에서 `=== null` / `== null` 직접 비교 → error
4. **Boolean flag 우회 패턴** — `const [xIsAll, setXIsAll] = useState(true)` 처럼 **null state 와 1:1 대응하는 boolean state 공존** → "ALL 센티넬로 통합 권장" warn
5. **API 인자 null 전송** — 필터 맥락 함수(`fetchXxx`, `loadXxxWebtoons`, `search*`)에 첫 인자로 `null` 전달 시 → "ALL 센티넬 전송 권장" warn
- 단순 로딩 초기값(`const [data, setData] = useState(null)`) 또는 API 응답 대기는 제외
- 근거: WeCom MobileHomePage 의 `activeUnivId=null` + `univIsAll=boolean` 혼용 패턴이 실제 배포됨
**antipattern** (위 match 조건 충족 시):
```jsx
const [univ, setUniv] = useState(null) // null = 전체
// 렌더
<Chip active={univ == null}>전체</Chip>
// 전송
if (univ !== null) params.univ = univ
```
**correct**:
```jsx
const ALL = 'ALL'
const [univ, setUniv] = useState(ALL)
<Chip active={univ === ALL}>전체</Chip>
if (univ !== ALL) params.univ = univ
```
**이유**: `null`은 "값 없음"과 "전체 선택"을 구분 못해서 활성화 상태 깨짐. `03bb2d4`, `0a723fc` 5회 반복. 상수 `ALL`로 명시.

---

### mf-008 — blob URL cleanup 강제 (error, autofix: hint)
**antipattern**:
```jsx
const url = URL.createObjectURL(file)
setPreview(url) // 해제 없음 → 메모리 누수
```
**correct**:
```jsx
useEffect(() => {
  if (!file) return
  const url = URL.createObjectURL(file)
  setPreview(url)
  return () => URL.revokeObjectURL(url)
}, [file])
```
**탐지 한계 (명시)**:
- `.then()` / async-await 체인 또는 `img.onload = () => URL.revokeObjectURL(url)` 같은 이벤트 콜백 내 revoke는 정적 Grep으로 감지 불가
- 해당 파일에 `URL.createObjectURL`이 있고 `revokeObjectURL` 도 있으면 warn으로 하향, "수동 확인 요망" 메시지 첨부
- 둘 중 하나만 있으면 error
**근거**: `fd329d7`, `4793511`

---

### mf-009 — Modal/BottomSheet scrollLock 강제 (error, autofix: hint)
**match**: `Modal`, `BottomSheet`, `Drawer`, `Sheet`, `Overlay` 패턴 컴포넌트 파일, 또는 `document.body.style.overflow` 직접 할당 탐지
**antipattern**:
```jsx
// Modal 열릴 때 body 직접 조작 (스크롤바 너비 보정 없음 → 레이아웃 쉬프트)
document.body.style.overflow = 'hidden'
document.body.style.overflow = 'auto'
document.body.classList.add('modal-open')
```
**correct**:
```jsx
import { lockScroll, unlockScroll } from '@/utils/scrollLock'

useEffect(() => {
  if (!isOpen) return
  lockScroll()   // body padding-right = scrollbar width 보정 포함
  return () => unlockScroll()
}, [isOpen])
```
**감지 패턴**:
- `document\.body\.style\.overflow\s*=` 직접 할당 → error
- Modal/BottomSheet 파일에 `scrollLock` 또는 `lockScroll` import 없음 → warn

**초기화 단계**: 스킬 실행 시 `src/utils/scrollLock.js` 또는 `src/hooks/useScrollLock.js` 존재 여부 1회 확인. 없으면 "scrollLock 유틸 미존재 — 공용 유틸 의존성 섹션 참조. 생성 후 적용 권장" error + 생성 코드 hint 제시 (ui-design-system 에이전트 호출 권장)
**근거**: `f247671` 전역 레이아웃 쉬프트, `6be6e1a` 바텀시트 재설계

---

### mf-010 — 모바일 경로 문자열 리터럴 금지 (warn, autofix: hint)
**match** (확장):
1. `pages/mobile/**/*.jsx` 또는 `MobileXxx` 컴포넌트 파일 내 PC/모바일 경로 하드코딩
2. **모든 JSX/TSX 파일** 내 `/m/` 접두사 경로 문자열 리터럴 — `navigate('/m/...')`, `<Link to="/m/...">`, `href="/m/..."` 패턴
3. ROUTES 상수 미사용 직접 문자열 리터럴 (PC 파일에서 모바일로 이동하는 경우 포함)
**antipattern**:
```jsx
navigate('/webtoon/' + uuid)        // 모바일에서 PC 경로로 이동
<Link to={`/university/${uuid}`}>    // M_ 상수 없이 하드코딩
```
**correct**:
```jsx
import { ROUTES } from '@/constants/routes'
navigate(ROUTES.M_WEBTOON_DETAIL(uuid))
<Link to={ROUTES.M_UNIVERSITY_DETAIL(uuid)}>
```
**근거**: `cb917df` 모바일 검색결과 PC 경로로 이동, `7e26d6c` cross-nav links (10+회 반복)

---

### mf-011 — 고정 min-height/min-width 금지 (warn, autofix: hint)
**match**: CSS `min-height:\s*\d+px` / `min-width:\s*\d+px` 중 **값이 48px 초과** 인 경우만 경고
**antipattern** (CSS):
```css
.stat-card { min-height: 200px; }     /* 모바일에서 빈 공간 */
.entries-wrap { min-width: 300px; }    /* 모바일 가로 스크롤 유발 */
```
**correct**:
```css
.stat-card { min-height: auto; }
@media (min-width: 768px) {
  .stat-card { min-height: 200px; }   /* PC에서만 적용 */
}
```
**예외 (통과)**:
- `min-height: 100vh` / `min-width: 100vw` (전체 화면)
- `min-width: 0` (flex 자식 overflow 방지)
- **`min-height: 44px` ~ `min-height: 48px` (WCAG/Apple HIG 터치 타겟 최소 기준)** — 삭제 금지
- **`min-width: 44px` ~ `min-width: 48px` (동일)**
- 48px 이하 값은 아이콘/버튼 터치타겟으로 간주 → 모두 통과
**근거**: `2f3a299` entries-wrap/stat-card min-height auto 수정, WCAG 2.1 Target Size (Minimum) 기준 44x44 CSS pixel

---

## 실행 프로토콜

### 스킬이 호출될 때
1. **변경 파일 수집**: `git diff --name-only HEAD` 또는 사용자가 지정한 경로
2. **룰 적용 순서**: mf-000 → mf-001 → mf-002..mf-008 (병렬 가능)
3. **각 룰**: Grep + 정적 AST 의미 검사(수동). React 합성 이벤트는 JSX 파싱이 필요.
4. **결과**: 룰별 JSON 어레이
   ```json
   [
     { "file": "src/pages/HomePage.jsx", "line": 42, "rule": "mf-000",
       "severity": "error", "message": "...", "autofix_hint": "..." }
   ]
   ```
5. **보고**: 사용자에게 테이블 + 수정 권장사항 출력
6. **자동 수정 없음** — 모든 수정은 힌트/권장사항 형태로만 제시. 파일 수정이 필요한 경우 반드시 사용자 승인 요청 후 진행 (CLAUDE.md "파일 수정 승낙" 원칙 준수)

### 출력 포맷 (사용자용)
```
🚨 mobile-first-check 결과

| 파일 | 라인 | 룰 | 심각도 | 메시지 |
|---|---|---|---|---|
| HomePage.jsx | 15 | mf-000 | error | pages/mobile/ 복제 구조 감지... |

통과: X건 / 경고: Y건 / 에러: Z건

권장 조치:
1. ...
```

## 공용 유틸 의존성 (프로젝트에 없으면 생성 제안)

이 스킬은 다음 유틸이 프로젝트에 존재한다고 가정. 없으면 `ui-design-system` 에이전트 호출 권장:

- `hooks/useIsMobile.js` — `matchMedia('(max-width: 767px)')` 기반
- `hooks/useDragScroll.js` — window-level 마우스/터치 드래그
- `hooks/useScrollLock.js` — body scrollbar width 보존 + overflow hidden
- `utils/sentinels.js` — `export const ALL = 'ALL'`

## 성공 지표

- **mobile fix 커밋 비율**: WeCom 36건 → 다음 프로젝트 **5건 이하**
- **`pages/mobile/*` 디렉터리**: 0
- **`URL.createObjectURL` 호출 대비 `revokeObjectURL` 호출 비율**: 100%
- **`useIsMobile` 도입률**: 반응형 페이지 100%

## 검증 시나리오 (self-test)

1. **기본**: 일반 CSS에 `width: 300px` 포함 → mf-002 경고 발생
2. **엣지**: 개발자가 `onMouseMove` 를 컴포넌트에 부착 → mf-005 에러 + `useDragScroll` 힌트
3. **복합**: 신규 `pages/mobile/HomePage.jsx` 생성 + 그 안에 `useState(null)` 필터 + `URL.createObjectURL` cleanup 누락 → mf-000/mf-007/mf-008 3개 동시 감지

## 이 스킬이 하지 않는 것

- 접근성(a11y) 전반 — `axe-core` 또는 별도 스킬 담당
- 성능 측정 — React DevTools Profiler 담당
- 색상·타이포 일관성 — `ui-design-system` 담당
- 라우팅 상수화 — `convention-enforcer` 담당

## 자기검증 — WeCom 현재 기준 예상 탐지

이 스킬을 현재 WeCom 코드베이스에 적용하면 다음을 탐지해야 한다 (3차 평가 실측):
- mf-001: `styles/global.css` 에 7종 중 4종 누락 (overflow-x hidden, img max-width, -webkit-tap-highlight, button border)
- mf-003: 비 admin 파일 10+ PC-first 쿼리 (UniversityWebtoonPage.css, EpisodeViewerPage.css 등)
- mf-007: MobileHomePage/HomePage `activeUnivId/activeGenreId` 2건 truthy 체크
- mf-009: EpisodeViewerPage `document.body.style.overflow` 직접 조작 3건
- mf-010: MobileWebtoonDetailPage `navigate('/m/mypage/conversations')` 1건
- mf-011: `min-height: 140/88/64px` 등 48px 초과 다수

이 숫자가 나오지 않으면 스킬이 정상 동작하지 않는 것이다.

## 참고 커밋 (근거)

`03bb2d4` `0a723fc` (필터 센티넬) · `3b3d80e` (passive touchmove) · `add4afe` (드래그 커서 이탈) · `fd329d7` `4793511` (blob cleanup) · `f247671` (scrollLock) · `2f3a299` `d7906a5` `6b2987f` (overflow 대수술) · `82fbc6a` `b3f2c44` `cb917df` `9f6883f` (mobile/PC 드리프트)
