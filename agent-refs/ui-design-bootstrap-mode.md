# ui-design-system: BOOTSTRAP 모드

> `.claude/agents/ui-design-system.md` 의 모드 파일. Day 0 디자인 시스템을 일괄 생성할 때만 읽는다.

## BOOTSTRAP 모드 — Day 0 일괄 생성

### 기존 파일 충돌 확인 (BOOTSTRAP 전 필수)
기존 공용 컴포넌트 파일이 있으면 사용자에게 확인:
> "다음 파일이 이미 존재합니다: [목록]
> 덮어쓰기하면 기존 커스터마이징이 사라집니다. 진행하시겠습니까? (Y/N)"
> N 선택 시 AUDIT 모드로 전환

### 1. `styles/tokens.css` 생성

```css
/* ==========================================================================
   Design Tokens
   모든 하드코딩 컬러/간격/radius/shadow 는 금지. var(--토큰명) 만 사용.
   ========================================================================== */

:root {
  /* --- Color: Semantic --- */
  /* WCAG AA 통과: #4f46e5 on #ffffff = 4.9:1 (normal text AA) */
  --color-primary: #4f46e5;         /* indigo-600 */
  --color-primary-hover: #4338ca;   /* indigo-700 */
  --color-primary-active: #3730a3;  /* indigo-800 */
  --color-primary-subtle: #eef2ff;

  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* --- Color: Neutral (gray scale) --- */
  --color-bg: #ffffff;
  --color-bg-subtle: #f9fafb;
  --color-bg-muted: #f3f4f6;
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-text-subtle: #9ca3af;  /* ⚠️ WCAG AA 미달 (2.5:1). 텍스트 아닌 장식용(non-text)으로만 사용 */
  --color-text-inverse: #ffffff;

  /* --- Spacing (4px scale) --- */
  --space-1: 0.25rem;   /* 4 */
  --space-2: 0.5rem;    /* 8 */
  --space-3: 0.75rem;   /* 12 */
  --space-4: 1rem;      /* 16 */
  --space-5: 1.25rem;   /* 20 */
  --space-6: 1.5rem;    /* 24 */
  --space-8: 2rem;      /* 32 */
  --space-10: 2.5rem;   /* 40 */
  --space-12: 3rem;     /* 48 */
  --space-16: 4rem;     /* 64 */

  /* --- Radius --- */
  --radius-sm: 0.25rem;  /* 4 */
  --radius-md: 0.5rem;   /* 8 */
  --radius-lg: 0.75rem;  /* 12 */
  --radius-xl: 1rem;     /* 16 */
  --radius-2xl: 1.5rem;  /* 24 */
  --radius-full: 9999px;

  /* --- Shadow --- */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* --- Typography --- */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Noto Sans KR', sans-serif;
  --font-mono: 'JetBrains Mono', Menlo, Consolas, monospace;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* --- Breakpoints (CSS에서 참조용, JS는 useIsMobile 사용) --- */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;

  /* --- Z-index scale --- */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;

  /* --- Transitions --- */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* --- Overlay / Alpha --- */
  --color-overlay: rgba(0, 0, 0, 0.4);
  --color-overlay-strong: rgba(0, 0, 0, 0.6);
  --color-shimmer: rgba(0, 0, 0, 0.06);
}

/* Dark mode (prefers-color-scheme) — 토큰만 덮어쓰면 자동 적용됨 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-bg-subtle: #1e293b;
    --color-bg-muted: #334155;
    --color-border: #334155;
    --color-border-strong: #475569;
    --color-text: #f1f5f9;
    --color-text-muted: #94a3b8;
    --color-text-subtle: #64748b;
    --color-text-inverse: #0f172a;
  }
}
```

### 2. `styles/reset.css` 생성

```css
/* ==========================================================================
   Global Reset — 전역 리셋 7종 (선택적 연계: mobile-first-checker가 있으면 mf-001로 검증, 없으면 건너뜀)
   ========================================================================== */

*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}

img, video, svg, iframe, embed, object {
  max-width: 100%;
  height: auto;
  display: block;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

input, textarea, select {
  font: inherit;
  color: inherit;
}

/* flex 자식의 overflow 방지 */
[data-min-0] > * { min-width: 0; }

/* 포커스 링 접근성 */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 3. `hooks/` 3종 생성

#### `hooks/useIsMobile.js`
```javascript
import { useEffect, useState } from 'react'

/**
 * 반응형 분기용 훅. CSS `--bp-md` 와 일치.
 * - matchMedia 기반 — 리사이즈·회전 즉시 반영
 * - SSR-safe (초기값 false)
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}
```

#### `hooks/useDragScroll.js`
```javascript
import { useCallback, useRef } from 'react'

/**
 * 가로 드래그 스크롤. Pointer Events API 사용 — 마우스+터치+펜 통합 처리.
 * setPointerCapture 로 커서 이탈 및 엘리먼트 밖 이동 대응.
 * 선택적 연계: mobile-first-checker가 있으면 mf-005로 검증, 없으면 건너뜀.
 *
 * 사용:
 *   const { ref, onPointerDown } = useDragScroll()
 *   <div ref={ref} onPointerDown={onPointerDown} style={{ overflowX: 'auto' }}>
 */
export function useDragScroll() {
  const ref = useRef(null)
  const state = useRef({ down: false, startX: 0, scrollLeft: 0, pointerId: 0 })

  const onPointerMove = useCallback((e) => {
    if (!state.current.down || !ref.current) return
    const dx = e.clientX - state.current.startX
    ref.current.scrollLeft = state.current.scrollLeft - dx
  }, [])

  const onPointerUp = useCallback(() => {
    state.current.down = false
    ref.current?.releasePointerCapture?.(state.current.pointerId)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
  }, [onPointerMove])

  const onPointerDown = useCallback((e) => {
    if (!ref.current || (e.button != null && e.button !== 0)) return
    state.current = { down: true, startX: e.clientX, scrollLeft: ref.current.scrollLeft, pointerId: e.pointerId }
    ref.current.setPointerCapture?.(e.pointerId)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }, [onPointerMove, onPointerUp])

  return { ref, onPointerDown }
}
```

#### `hooks/useScrollLock.js`
```javascript
import { useEffect } from 'react'

/**
 * Modal/BottomSheet 스크롤 잠금. 스크롤바 너비 보정 포함.
 * 선택적 연계: mobile-first-checker가 있으면 mf-009로 검증, 없으면 건너뜀.
 * HMR 안전 — window에 카운터 저장하여 Vite 모듈 재평가 시 상태 유지.
 *
 * 사용:
 *   useScrollLock(isOpen)
 */
const getStore = () => {
  if (typeof window === 'undefined') return { count: 0 }
  if (window.__scrollLockStore == null) window.__scrollLockStore = { count: 0 }
  return window.__scrollLockStore
}

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return
    const store = getStore()
    if (store.count === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    store.count++
    return () => {
      store.count--
      if (store.count === 0) {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }
    }
  }, [locked])
}
```

### 4. `utils/sentinels.js` 생성

```javascript
/**
 * 필터 "전체" 센티넬. null 대신 사용.
 * 선택적 연계: mobile-first-checker가 있으면 mf-007로 검증, 없으면 건너뜀.
 */
export const ALL = 'ALL'
```

### 5. `components/common/` 13개 컴포넌트 생성

| # | 컴포넌트 | 책임 | 상태 |
|---|---|---|---|
| 1 | `Button` | 기본 버튼 | default/hover/active/focus/disabled/loading |
| 2 | `Input` | 텍스트 입력 | default/focus/error/disabled/readonly |
| 3 | `Select` | 드롭다운 | default/open/disabled |
| 4 | `Modal` | 모달 다이얼로그 | open/closed (useScrollLock 사용) |
| 5 | `BottomSheet` | 모바일 바텀시트 | open/closed (useScrollLock 사용) |
| 6 | `Chip` | 단일 칩 | default/active/disabled |
| 7 | `ChipScroller` | 가로 스크롤 칩 컨테이너 | + 좌우 화살표 + fade mask |
| 8 | `Card` | 기본 카드 | default/hover/pressed |
| 9 | `Badge` | 상태 배지 | info/success/warning/danger/neutral |
| 10 | `Toast` | 토스트 알림 | info/success/warning/danger (포털 + 큐) |
| 11 | `SafeImage` | 에러 fallback + lazy 이미지 | loading/loaded/error (onerror 자기 해제) |
| 12 | `Avatar` | 사용자 아바타 | default/initials fallback |
| 13 | `Skeleton` | 로딩 스켈레톤 | animated shimmer |

각 컴포넌트는 다음 원칙 준수:
- Props validation (TypeScript 또는 JSDoc)
- 8개 상태 중 해당하는 것만 제공 (빈 상태/에러 상태 포함)
- `className` prop으로 확장 가능, 내부 스타일은 CSS Modules 또는 `[data-component]` 속성 선택자
- 접근성: ARIA role, keyboard navigation, focus trap (Modal/BottomSheet)
- 하드코딩 금지 — 모든 값은 `var(--토큰)`

**예시: `components/common/Button.jsx`**
```jsx
import styles from './Button.module.css'

/**
 * @param {'primary'|'secondary'|'ghost'|'danger'} [variant='primary']
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {boolean} [loading]
 * @param {boolean} [disabled]
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={`${styles.button} ${className}`}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : children}
    </button>
  )
}
```

**`Button.module.css`**:
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: background var(--transition-fast);
}
.button[data-size='sm'] { padding: var(--space-1) var(--space-3); font-size: var(--text-sm); }
.button[data-size='lg'] { padding: var(--space-3) var(--space-6); font-size: var(--text-lg); }

.button[data-variant='primary'] { background: var(--color-primary); color: var(--color-text-inverse); }
.button[data-variant='primary']:hover:not(:disabled) { background: var(--color-primary-hover); }
.button[data-variant='primary']:active { background: var(--color-primary-active); }

.button[data-variant='secondary'] { background: var(--color-bg-muted); color: var(--color-text); }
.button[data-variant='ghost'] { background: transparent; color: var(--color-text); }
.button[data-variant='danger'] { background: var(--color-danger); color: var(--color-text-inverse); }

.button:disabled { opacity: 0.5; cursor: not-allowed; }
```

회고에서 4~5회 재발명된 **핵심 5개 컴포넌트는 반드시 템플릿 파일의 구현을 기본으로 사용**. 나머지 7개(Input/Select/Chip/Card/Badge/Avatar/Skeleton)도 템플릿 파일에 동일한 토큰 기반 패턴으로 포함되어 있다.

### 12개 컴포넌트 전체 구현 — 템플릿 파일 참조

Button을 제외한 나머지 12개(Modal/BottomSheet/Toast/SafeImage/ChipScroller/Input/Select/Chip/Card/Badge/Avatar/Skeleton)의 JSX+CSS 전체 소스는 컨텍스트 절약을 위해 별도 템플릿 파일로 분리되어 있다. BOOTSTRAP 5단계 진입 시, 또는 AUDIT 모드에서 특정 컴포넌트를 추가할 때 다음 파일을 Read해서 사용한다:

```
/home/lee/project/.claude/references/ui-design-system-templates.md
```

템플릿 소스는 모두 CSS Modules(`styles.xxx`) 기준으로 작성되어 있다. 감지된 CSS 방법론(BEM/CSS Modules/Tailwind/styled-components)에 따라 클래스명만 정의파일(`.claude/agents/ui-design-system.md`) Phase 1의 "생성할 스타일 파일 결정 로직"/"CSS 방법론별 컴포넌트 클래스 산출 규칙"에 맞춰 변환하고, JSX 구조·훅 사용·ARIA 속성은 그대로 유지한다.

각 컴포넌트의 필수 핵심(전체 코드는 템플릿 파일 참조):
- **Modal/BottomSheet**: `useScrollLock` + ESC + 포커스 트랩 + return focus + `f247671` 재발 방지
- **Toast**: 포털 + 큐(`utils/toast.js`) + polite/assertive `aria-live` 분리
- **SafeImage**: `onerror` 자기 해제로 무한 루프 방지 (`fa3dc46` 재발 방지)
- **ChipScroller**: `useDragScroll` + 좌우 화살표 + fade mask
- **Input/Select**: `forwardRef` + `aria-invalid` + `aria-describedby`
- **Chip/Card/Badge/Avatar/Skeleton**: 토큰 기반 상태별 `data-*` 속성 스타일링, 무한 루프 방지(Avatar `onerror` 자기 해제), `prefers-reduced-motion` 대응(Skeleton)


---

**13개 컴포넌트 완전 구현 완료**. 모든 컴포넌트 공통 원칙:
- 모든 값은 `var(--토큰)` 참조 (하드코딩 0)
- 접근성 우선: `aria-*`, `role`, `:focus-visible`, 키보드 네비게이션, `prefers-reduced-motion`
- 상태별 `data-*` 속성 스타일링 (CSS Modules)
- `forwardRef` 로 ref 전달 가능 (Input, Select)
- 무한 루프 방지(`onerror = null`), SafeImage 패턴 내장(Avatar)
- `color-mix()` 로 semantic 색상 파생 (Badge)

### 6. `stylelint.config.cjs` 생성

```javascript
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'color-no-hex': true,  // 하드코딩 hex 차단 — 토큰 사용 강제 (tokens.css는 ignoreFiles로 제외)
    'color-named': 'never',
    'color-hex-length': 'long',   /* #fff → #ffffff 강제 (일관성) */

    /* 하드코딩 radius 금지 */
    'declaration-property-value-disallowed-list': {
      '/^border-radius/': ['/(^|\\s)\\d/'],  // 숫자로 시작하는 모든 값 차단 (shorthand 포함, 예: 4px 4px 0 0)
      // box-shadow 하드코딩 금지는 grep 기반 CI 보완으로만 처리
      // (정규식 false positive 과다: none/inherit/initial 모두 유효한 값)
      // grep -rEn "box-shadow:[[:space:]]*[0-9]" src/ --include="*.css"
    },

    /* 고정 px width 금지 룰은 stylelint 기본에서 제외.
       false positive 과다(아이콘 24px, divider 1px 등)로 mobile-first-checker mf-002에 위임 */
  },
  ignoreFiles: ['**/tokens.css', '**/reset.css'],
}
```

### 7. `index.css` 진입점 생성/수정

**덮어쓰기 금지 — Write로 전체 교체 절대 금지.** `index.css`는 신규 프로젝트가 아닌 이상 거의 항상 이미 존재하며 기존 import(폰트, 서드파티 CSS 등)를 담고 있다.
1. 먼저 파일 존재 여부를 확인한다.
2. **존재하지 않으면** → 아래 2줄로 새로 생성 (Write 가능, 신규 파일이므로 덮어쓰기 아님).
3. **이미 존재하면** → 전체 내용을 읽고 기존 import 목록을 사용자에게 보여준 뒤, 다음 2줄이 없을 때만 파일 **최상단에 추가**하는 형태로 **Edit(append)** 한다. Write로 전체 교체 금지 (프로젝트 최상위 규칙 — 새 산출물 저장 시 기존 동명 파일이 있으면 자동 덮어쓰기 금지).

```css
@import './styles/tokens.css';
@import './styles/reset.css';
```

### Bootstrap 완료 메시지
```
✓ tokens.css 생성 (8 카테고리: color/spacing/radius/shadow/typography/breakpoint/z-index/transition)
✓ reset.css 생성 (7종)
✓ hooks 3개 생성 (useIsMobile/useDragScroll/useScrollLock — HMR 안전)
✓ components/common 13개 생성 (Modal/BottomSheet/Toast/SafeImage/ChipScroller 완전 구현)
✓ utils/sentinels.js 생성 (ALL)
✓ utils/toast.js 생성 (큐)
✓ stylelint.config.cjs 생성

다음 단계:
1. `npm install -D stylelint stylelint-config-standard`
2. `index.css` 진입점 확인 (기존 import 보존 후 tokens.css/reset.css 추가)
3. `App.jsx` (또는 루트 컴포넌트) 최상단에 `<ToastContainer />` 추가 — 포털이 document.body 에 마운트되므로 어디서든 `toast(...)` 호출 가능
4. 신규 페이지 작성 시 var(--토큰) 만 사용. 하드코딩은 stylelint가 거부
```

## Bootstrap 실패 시 롤백
생성된 파일을 되돌리려면:
```bash
# Git 사용 시 (권장):
git checkout -- src/ stylelint.config.cjs

# Git 미사용 시:
rm -f src/styles/tokens.css src/styles/reset.css
rm -f src/hooks/useIsMobile.js src/hooks/useDragScroll.js src/hooks/useScrollLock.js
rm -rf src/components/common/
rm -f stylelint.config.cjs
```

### Bootstrap 자기검증 (필수 — 완료 메시지 출력 전 자동 실행)

7개 산출물 생성 완료 후 즉시 다음 검증 수행. 실패 시 Bootstrap 실패로 판정:

```bash
# 1. 하드코딩 컬러 잔존 여부 (tokens/reset 제외)
grep -rEn "#[0-9a-fA-F]{3,8}" src/ --include="*.css" --include="*.scss" \
  | grep -v tokens.css | grep -v reset.css

# 2. Modal/BottomSheet의 scrollLock 사용 확인
grep -l "useScrollLock" src/components/common/Modal.jsx src/components/common/BottomSheet.jsx

# 3. SafeImage의 onerror 자기 해제 확인
grep -n "onerror = null" src/components/common/SafeImage.jsx

# 4. ChipScroller의 useDragScroll 사용 확인
grep -l "useDragScroll" src/components/common/ChipScroller.jsx

# 5. sentinels.js에 ALL 상수 확인
grep -n "export const ALL" src/utils/sentinels.js
```

각 항목이 예상대로 나오면 성공. 잔존 하드코딩 또는 필수 훅/유틸 누락 발견 시 Bootstrap 실패 보고 후 자동 재시도.

### 하드코딩 grep gate를 husky pre-commit에 배선 (필수)

위 "Bootstrap 자기검증" 1번(하드코딩 컬러 잔존 여부 grep)은 CI 뿐 아니라 **husky pre-commit 훅에도 반드시 배선**한다. 그래야 위반이 커밋 단계에서 차단되고, CI까지 도달하지 않는다. `.husky/pre-commit` 에 다음 게이트를 추가:

```bash
# .husky/pre-commit — 하드코딩 컬러/shadow 차단 게이트
HARDCODED=$(grep -rEn "#[0-9a-fA-F]{3,8}" src/ --include="*.css" --include="*.scss" \
  | grep -v tokens.css | grep -v reset.css)
SHADOW=$(grep -rEn "box-shadow:[[:space:]]*[0-9]" src/ --include="*.css" --include="*.scss")
if [ -n "$HARDCODED" ] || [ -n "$SHADOW" ]; then
  echo "✗ 하드코딩 컬러/shadow 감지 — 토큰(var(--...))으로 치환 후 커밋하세요:"
  echo "$HARDCODED"
  echo "$SHADOW"
  exit 1
fi
```

husky 미설치 시: `npm install -D husky && npx husky init` 후 위 게이트를 `.husky/pre-commit` 에 추가한다. 이 게이트는 stylelint 실행과 별개로 항상 커밋을 차단한다.
