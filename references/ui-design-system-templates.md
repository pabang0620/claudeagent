# UI Design System — 공용 컴포넌트 템플릿 (12종 전체 소스)

> 이 파일은 `ui-design-system.md` 에이전트 정의파일에서 분리된 참조 전용 템플릿이다. 에이전트가 아니므로 직접 호출되지 않는다.
> `ui-design-system.md`의 BOOTSTRAP 5단계(`components/common/` 13개 컴포넌트 생성) 진입 시, 또는 AUDIT 모드에서 특정 컴포넌트를 추가할 때 이 파일을 Read해서 사용한다.
> Button은 `ui-design-system.md` 본문(BOOTSTRAP 5단계 예시)에 남아있고, 나머지 12개(Modal/BottomSheet/Toast/SafeImage/ChipScroller/Input/Select/Chip/Card/Badge/Avatar/Skeleton) 전체 구현이 여기에 있다.
>
> **사용 방법**: 아래 소스는 모두 CSS Modules(`styles.xxx`) 기준으로 작성되어 있다. `ui-design-system.md`의 "생성할 스타일 파일 결정 로직" / "CSS 방법론별 컴포넌트 클래스 산출 규칙"에서 감지된 방법론(BEM / CSS Modules / Tailwind / styled-components)에 맞춰 클래스명만 변환하고, 구조(JSX 마크업·훅 사용·이벤트 핸들러·ARIA 속성)는 그대로 유지한다.

---

#### `Modal.jsx` (scrollLock + ESC + 외부 클릭 + 포털 + focus trap + return focus + aria-labelledby, `f247671` 재발 방지)
```jsx
import { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '../../hooks/useScrollLock'
import styles from './Modal.module.css'

export function Modal({ isOpen, onClose, title, children, className = '' }) {
  useScrollLock(isOpen)
  const overlayRef = useRef(null)
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()  // return focus
      previousFocusRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const trap = (e) => {
      if (e.key === 'Escape') { onClose?.(); return }
      if (e.key !== 'Tab') return
      const els = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) ?? [])]
      if (!els.length) { e.preventDefault(); return }
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    document.addEventListener('keydown', trap)
    dialogRef.current?.querySelector(FOCUSABLE)?.focus()
    return () => document.removeEventListener('keydown', trap)
  }, [isOpen, onClose])

  if (!isOpen) return null
  return createPortal(
    <div ref={overlayRef}
      className={styles.overlay}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.() }}>
      {/* role="dialog" 는 대화상자 내부 컨테이너에 (WAI-ARIA APG 표준) */}
      <div ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`${styles.dialog} ${className}`}>
        {title && (
          <header>
            <h2 id={titleId}>{title}</h2>
            <button aria-label="닫기" onClick={onClose}>×</button>
          </header>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  )
}
```

```css
/* Modal.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay, rgba(0,0,0,0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop, 100);
}
.dialog {
  position: relative;
  background: var(--color-bg, #fff);
  border-radius: var(--radius-xl, 16px);
  padding: var(--space-6, 24px);
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  z-index: var(--z-modal, 101);
}
```

#### `BottomSheet.jsx` (모바일 바텀시트, scrollLock + focus trap + ESC + return focus + touchmove passive:false)
```jsx
import { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '../../hooks/useScrollLock'
import styles from './BottomSheet.module.css'

export function BottomSheet({ isOpen, onClose, title, children, className = '' }) {
  useScrollLock(isOpen)
  const sheetRef = useRef(null)
  const previousFocusRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (isOpen) previousFocusRef.current = document.activeElement
    else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const trap = (e) => {
      if (e.key === 'Escape') { onClose?.(); return }
      if (e.key !== 'Tab') return
      const els = [...(sheetRef.current?.querySelectorAll(FOCUSABLE) ?? [])]
      if (!els.length) { e.preventDefault(); return }
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    // React 합성 onTouchMove 는 passive:true 고정이므로 네이티브 리스너로 부착 (mobile-first-checker가 있으면 mf-006으로 검증)
    const el = sheetRef.current
    const onTouch = (e) => {
      if (e.target.closest('[data-scroll]')) return
      e.preventDefault()
    }
    document.addEventListener('keydown', trap)
    el?.addEventListener('touchmove', onTouch, { passive: false })
    sheetRef.current?.querySelector(FOCUSABLE)?.focus()
    return () => {
      document.removeEventListener('keydown', trap)
      el?.removeEventListener('touchmove', onTouch)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  return createPortal(
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`${styles.sheet} ${className}`}>
        {children}
      </div>
    </div>,
    document.body
  )
}
```

```css
/* BottomSheet.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay, rgba(0,0,0,0.5));
  z-index: var(--z-modal-backdrop, 100);
}
.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg, #fff);
  border-radius: var(--radius-2xl, 24px) var(--radius-2xl, 24px) 0 0;
  padding: var(--space-6, 24px);
  max-height: 90vh;
  overflow-y: auto;
  z-index: var(--z-modal, 101);
}
```

#### `Toast.jsx` + `toast.js` (포털 + 큐 + 자동 dismiss)

다음 두 파일을 각각 생성:

**`utils/toast.js`**:
```js
// utils/toast.js
const listeners = new Set()
let seq = 0
export const toast = (msg, type = 'info', duration = 3000) => {
  const id = ++seq
  listeners.forEach((fn) => fn({ type: 'add', item: { id, msg, type, duration } }))
  if (duration > 0) setTimeout(() => dismiss(id), duration)
}
export const dismiss = (id) => listeners.forEach((fn) => fn({ type: 'remove', id }))
export const _subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
```

**`components/common/Toast.jsx`**:
```jsx
// components/common/Toast.jsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { _subscribe, dismiss } from '../../utils/toast'
import styles from './Toast.module.css'

export function ToastContainer() {
  const [items, setItems] = useState([])
  useEffect(() => _subscribe((e) => {
    if (e.type === 'add') setItems((s) => [...s, e.item])
    else setItems((s) => s.filter((i) => i.id !== e.id))
  }), [])
  const renderItems = (list) => list.map((i) => (
    <div key={i.id} data-variant={i.type} className={styles.toast}>
      {i.msg}
      <button aria-label="닫기" onClick={() => dismiss(i.id)} className={styles.close}>×</button>
    </div>
  ))
  // danger/error 는 assertive (스크린리더 즉시 중단), 나머지는 polite
  const polite = items.filter((i) => !['danger', 'error'].includes(i.type))
  const assertive = items.filter((i) => ['danger', 'error'].includes(i.type))
  return createPortal(
    <div className={styles.viewport}>
      <div role="status" aria-live="polite" className={styles.group}>{renderItems(polite)}</div>
      <div role="alert" aria-live="assertive" className={styles.group}>{renderItems(assertive)}</div>
    </div>,
    document.body
  )
}
```

**`Toast.module.css`**:
```css
/* Toast.module.css — position: fixed 뷰포트, z-index는 tokens.css의 --z-toast 재사용 */
.viewport { position: fixed; bottom: var(--space-6); right: var(--space-6); z-index: var(--z-toast); display: flex; flex-direction: column; gap: var(--space-2); pointer-events: none; }
.group { display: flex; flex-direction: column; gap: var(--space-2); }
.toast { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); background: var(--color-bg); color: var(--color-text); pointer-events: auto; }
.toast[data-variant='info'] { background: var(--color-info); color: var(--color-text-inverse); }
.toast[data-variant='success'] { background: var(--color-success); color: var(--color-text-inverse); }
.toast[data-variant='warning'] { background: var(--color-warning); color: var(--color-text-inverse); }
.toast[data-variant='danger'] { background: var(--color-danger); color: var(--color-text-inverse); }
.close { margin-left: auto; flex-shrink: 0; color: inherit; }
```

#### `SafeImage.jsx` (onerror 자기 해제 — 무한 루프 방지, `fa3dc46` 재발 방지)
```jsx
export function SafeImage({ src, fallback = '/images/placeholder.png', alt = '', ...props }) {
  const onError = (e) => {
    if (e.target.src === fallback) return  // 이미 fallback이면 중단 (무한 루프 방지)
    e.target.onerror = null                // 자기 해제
    e.target.src = fallback
  }
  return <img src={src || fallback} alt={alt} loading="lazy" onError={onError} {...props} />
}
```

#### `ChipScroller.jsx` (가로 드래그 + 좌우 화살표 + useDragScroll 사용)
```jsx
import styles from './ChipScroller.module.css'
import { useDragScroll } from '../../hooks/useDragScroll'

export function ChipScroller({ children, className = '' }) {
  const { ref, onPointerDown } = useDragScroll()
  const scrollBy = (dx) => ref.current?.scrollBy({ left: dx, behavior: 'smooth' })
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <button type="button" onClick={() => scrollBy(-200)} aria-label="이전" className={styles.arrow}>‹</button>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        className={styles.track}
        data-scroll
      >
        {children}
      </div>
      <button type="button" onClick={() => scrollBy(200)} aria-label="다음" className={styles.arrow}>›</button>
    </div>
  )
}
```

**`ChipScroller.module.css`**:
```css
/* ChipScroller.module.css */
.wrapper { position: relative; display: flex; align-items: center; gap: var(--space-2); }
.track { flex: 1; overflow-x: auto; display: flex; gap: var(--space-2); scrollbar-width: none; }
.track::-webkit-scrollbar { display: none; }
.arrow { flex-shrink: 0; }
.wrapper::before, .wrapper::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: var(--space-6);
  pointer-events: none; z-index: 1;
}
.wrapper::before { left: 32px; background: linear-gradient(to right, var(--color-bg), transparent); }
.wrapper::after { right: 32px; background: linear-gradient(to left, var(--color-bg), transparent); }
```

#### `Input.jsx` (accessible, aria-invalid, error/disabled/readonly)
```jsx
// components/common/Input.jsx
import { forwardRef, useId } from 'react'
import styles from './Input.module.css'

/**
 * 접근성 표준: aria-invalid + aria-describedby (에러 메시지 연결)
 * Radix/shadcn 패턴 준수.
 */
export const Input = forwardRef(function Input(
  { label, error, hint, id, className = '', type = 'text', ...props },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`${styles.field} ${className}`} data-invalid={!!error || undefined}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={styles.input}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error && <small id={hintId} className={styles.hint}>{hint}</small>}
      {error && <small id={errorId} className={styles.error}>{error}</small>}
    </div>
  )
})
```

#### `Input.module.css`
```css
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.label { font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text); }
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-subtle); }
.input:disabled { background: var(--color-bg-muted); color: var(--color-text-muted); cursor: not-allowed; }
.input[readonly] { background: var(--color-bg-subtle); }
.field[data-invalid='true'] .input { border-color: var(--color-danger); }
.field[data-invalid='true'] .input:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-danger) 20%, transparent); }
.hint { color: var(--color-text-muted); font-size: var(--text-xs); }
.error { color: var(--color-danger); font-size: var(--text-xs); }
```

---

#### `Select.jsx` (네이티브 select 기반 + 토큰 스타일, accessible by default)
```jsx
// components/common/Select.jsx
// 고급 드롭다운 필요 시 Radix Select 기반으로 교체 권장 (키보드 네비게이션·typeahead 완전 지원)
// 본 컴포넌트는 네이티브 <select> 기반 = 기본 접근성·모바일 네이티브 피커 제공
import { forwardRef, useId } from 'react'
import styles from './Select.module.css'

export const Select = forwardRef(function Select(
  { label, options = [], error, hint, id, placeholder, className = '', ...props },
  ref
) {
  const autoId = useId()
  const selectId = id || autoId
  const errorId = `${selectId}-error`
  const hintId = `${selectId}-hint`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`${styles.field} ${className}`} data-invalid={!!error || undefined}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <div className={styles.wrapper}>
        <select
          ref={ref}
          id={selectId}
          className={styles.select}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) =>
            typeof opt === 'object'
              ? <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
              : <option key={opt} value={opt}>{opt}</option>
          )}
        </select>
        <span className={styles.caret} aria-hidden="true">▾</span>
      </div>
      {hint && !error && <small id={hintId} className={styles.hint}>{hint}</small>}
      {error && <small id={errorId} className={styles.error} role="alert">{error}</small>}
    </div>
  )
})
```

#### `Select.module.css`
```css
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.label { font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text); }
.wrapper { position: relative; }
.select {
  width: 100%;
  padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
  font-size: var(--text-base);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  appearance: none;
  cursor: pointer;
}
.select:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-subtle); }
.select:disabled { background: var(--color-bg-muted); cursor: not-allowed; }
.caret { position: absolute; right: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
.field[data-invalid='true'] .select { border-color: var(--color-danger); }
.hint { color: var(--color-text-muted); font-size: var(--text-xs); }
.error { color: var(--color-danger); font-size: var(--text-xs); }
```

---

#### `Chip.jsx` (toggle / active / removable / disabled)
```jsx
// components/common/Chip.jsx
import styles from './Chip.module.css'

/**
 * 필터/태그/카테고리 칩. active 토글 또는 removable 두 모드.
 * mf-007 "전체" 센티넬 사용 시 value={ALL} 전달.
 */
export function Chip({
  children,
  active = false,
  disabled = false,
  onClick,
  onRemove,
  variant = 'default',   // default | outlined
  className = '',
  ...props
}) {
  // onRemove 가 있으면 내부에 <button> 이 중첩되므로 HTML5 위반 방지를 위해 div 로 강제
  const Tag = onClick && !onRemove ? 'button' : onRemove ? 'div' : 'span'
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      role={Tag === 'div' && onClick ? 'button' : undefined}
      tabIndex={Tag === 'div' && onClick ? 0 : undefined}
      onKeyDown={Tag === 'div' && onClick
        ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) } }
        : undefined}
      className={`${styles.chip} ${className}`}
      data-variant={variant}
      data-active={active || undefined}
      disabled={Tag === 'button' ? (disabled || undefined) : undefined}
      aria-disabled={Tag !== 'button' && disabled ? true : undefined}
      aria-pressed={onClick ? active : undefined}
      onClick={onClick}
      {...props}
    >
      <span className={styles.label}>{children}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          aria-label="제거"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
        >×</button>
      )}
    </Tag>
  )
}
```

#### `Chip.module.css`
```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  background: var(--color-bg-muted);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  cursor: pointer;
}
.chip[data-variant='outlined'] { background: transparent; border-color: var(--color-border); }
.chip:hover:not(:disabled) { background: var(--color-bg-subtle); }
.chip[data-active] { background: var(--color-primary); color: var(--color-text-inverse); border-color: var(--color-primary); }
.chip:disabled { opacity: 0.5; cursor: not-allowed; }
.label { }
.remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  margin-left: var(--space-1);
  font-size: var(--text-sm);
  line-height: 1;
  color: inherit;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
}
.remove:hover { background: var(--color-shimmer); }
```

---

#### `Card.jsx` (default / elevated / outlined + clickable variant)
```jsx
// components/common/Card.jsx
import styles from './Card.module.css'

export function Card({
  variant = 'default',   // default | elevated | outlined
  interactive = false,   // hover 시 그림자 강조
  as: Component = 'div',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`${styles.card} ${className}`}
      data-variant={variant}
      data-interactive={interactive || undefined}
      {...props}
    >
      {children}
    </Component>
  )
}

Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`${styles.header} ${className}`}>{children}</div>
}
Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`${styles.body} ${className}`}>{children}</div>
}
Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>
}
```

#### `Card.module.css`
```css
.card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.card[data-variant='default'] { box-shadow: var(--shadow-sm); }
.card[data-variant='elevated'] { box-shadow: var(--shadow-md); }
.card[data-variant='outlined'] { border: 1px solid var(--color-border); }
.card[data-interactive] { cursor: pointer; transition: box-shadow var(--transition-base), transform var(--transition-base); }
.card[data-interactive]:hover { box-shadow: var(--shadow-lg); transform: translateY(-1px); }
.card[data-interactive]:active { transform: translateY(0); }
.header { padding: var(--space-4); border-bottom: 1px solid var(--color-border); }
.body { padding: var(--space-4); flex: 1; }
.footer { padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border); background: var(--color-bg-subtle); }
```

---

#### `Badge.jsx` (info/success/warning/danger/neutral + dot variant)
```jsx
// components/common/Badge.jsx
import styles from './Badge.module.css'

export function Badge({
  variant = 'neutral',   // info | success | warning | danger | neutral
  size = 'md',           // sm | md
  dot = false,           // 점 표시 + 텍스트
  className = '',
  children,
  ...props
}) {
  return (
    <span
      className={`${styles.badge} ${className}`}
      data-variant={variant}
      data-size={size}
      data-dot={dot || undefined}
      {...props}
    >
      {dot && <span className={styles.dotMark} aria-hidden="true" />}
      {children}
    </span>
  )
}
```

#### `Badge.module.css`
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
  border-radius: var(--radius-full);
  white-space: nowrap;
}
.badge[data-size='sm'] { font-size: 10px; padding: 1px var(--space-1); }
.badge[data-variant='neutral'] { background: var(--color-bg-muted); color: var(--color-text); }
.badge[data-variant='info'] { background: color-mix(in srgb, var(--color-info) 15%, transparent); color: var(--color-info); }
.badge[data-variant='success'] { background: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success); }
.badge[data-variant='warning'] { background: color-mix(in srgb, var(--color-warning) 15%, transparent); color: var(--color-warning); }
.badge[data-variant='danger'] { background: color-mix(in srgb, var(--color-danger) 15%, transparent); color: var(--color-danger); }
.dotMark {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}
```

---

#### `Avatar.jsx` (이미지 + initials fallback + SafeImage 내장)
```jsx
// components/common/Avatar.jsx
import { useState } from 'react'
import styles from './Avatar.module.css'

/**
 * 이미지 로드 실패 시 자동으로 initials 표시. SafeImage 패턴 내장.
 * src 없으면 initials 바로 표시.
 */
export function Avatar({
  src,
  name = '',
  size = 'md',          // sm | md | lg | xl
  className = '',
  ...props
}) {
  const [errored, setErrored] = useState(false)
  const initials = getInitials(name)
  const showImage = src && !errored

  return (
    <div
      className={`${styles.avatar} ${className}`}
      data-size={size}
      role="img"
      aria-label={name || 'avatar'}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className={styles.image}
          onError={(e) => {
            e.target.onerror = null  // 자기 해제 (무한 루프 방지; error-prevention-rules가 있으면 ep-002로 검증)
            setErrored(true)
          }}
          loading="lazy"
        />
      ) : (
        <span className={styles.initials}>{initials || '?'}</span>
      )}
    </div>
  )
}

function getInitials(name) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
```

#### `Avatar.module.css`
```css
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-bg-muted);
  color: var(--color-text-muted);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  user-select: none;
  flex-shrink: 0;
}
.avatar[data-size='sm'] { width: 24px; height: 24px; font-size: var(--text-xs); }
.avatar[data-size='md'] { width: 40px; height: 40px; font-size: var(--text-sm); }
.avatar[data-size='lg'] { width: 56px; height: 56px; font-size: var(--text-lg); }
.avatar[data-size='xl'] { width: 80px; height: 80px; font-size: var(--text-2xl); }
.image { width: 100%; height: 100%; object-fit: cover; }
.initials { text-transform: uppercase; letter-spacing: 0.02em; }
```

---

#### `Skeleton.jsx` (animated shimmer, text/rect/circle variants)
```jsx
// components/common/Skeleton.jsx
import styles from './Skeleton.module.css'

/**
 * 주의: aria-busy 는 Skeleton 자체가 아닌 로딩 컨테이너에 적용하는 것이 WAI-ARIA 표준.
 * Skeleton 스스로는 aria-hidden="true" 로 숨기고,
 * 컨테이너에서 <div role="status" aria-busy="true" aria-label="로딩 중"> 관리 권장.
 *
 * 로딩 플레이스홀더. React 19 Suspense 와 함께 사용 가능.
 * variant: text(한 줄) / rect(상자) / circle(원)
 */
export function Skeleton({
  variant = 'rect',       // text | rect | circle
  width,
  height,
  count = 1,
  className = '',
  ...props
}) {
  const items = Array.from({ length: count })
  return (
    <>
      {items.map((_, i) => (
        <span
          key={i}
          className={`${styles.skeleton} ${className}`}
          data-variant={variant}
          style={{ width, height }}
          aria-hidden="true"
          {...props}
        />
      ))}
    </>
  )
}
```

#### `Skeleton.module.css`
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  display: block;
  background: linear-gradient(90deg,
    var(--color-bg-muted) 25%,
    var(--color-bg-subtle) 50%,
    var(--color-bg-muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}
.skeleton[data-variant='text'] { height: var(--text-base); width: 100%; border-radius: var(--radius-sm); }
.skeleton[data-variant='rect'] { width: 100%; height: 120px; }
.skeleton[data-variant='circle'] { width: 40px; height: 40px; border-radius: var(--radius-full); }

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```
