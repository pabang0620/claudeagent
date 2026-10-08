# react-specialist 참조: 컴포넌트·상태·테스트·빌드 패턴

> 이 파일은 `.claude/agents/react-specialist.md` 의 참조 파일이다. 새 컴포넌트 구조를 잡거나, URL 상태를 다루거나, 테스트·Vite 설정을 건드릴 때만 읽는다.

## 컴포넌트 설계 패턴

### 컴포넌트 배치 기준 (wecom 실측, project-structure-guide 스킬과 동일)
```
pages/<page>/        → XxxPage.jsx + useXxx.js + xxxApi.js 3파일. 그 페이지의 API 호출은 여기 둔다(중복돼도 공통 추출 안 함)
components/common/   → Header·Footer·Modal·Pagination·ProtectedRoute 등 전역 공용
components/<domain>/ → WebtoonCard처럼 도메인 안에서 여러 페이지가 쓰는 것
layouts/             → MainLayout·AuthLayout·AdminLayout
hooks/               → 전역 공용 훅만 (useAuth·useDebounce·usePagination)
store/               → zustand 스토어
config/apiClient.js  → axios + JWT 인터셉터
```
`features/`, `components/ui/` 폴더는 쓰지 않는다. 대상 프로젝트에 자체 `.claude/CLAUDE.md` 레이아웃이 있으면 그쪽이 우선한다.

### Compound Component 패턴
```typescript
// 복잡한 UI를 유연하게 조합할 때. 클래스명은 프로젝트 CSS 방법론(wecom: BEM + Component.css)을 따르고 Tailwind 유틸을 새로 들이지 않는다
const Card = {
  Root: ({ children, className = '' }: CardProps) => (
    <div className={`card ${className}`}>{children}</div>
  ),
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="card__header">{children}</div>
  ),
  Body: ({ children }: { children: React.ReactNode }) => (
    <div className="card__body">{children}</div>
  ),
}

// 사용
<Card.Root>
  <Card.Header>제목</Card.Header>
  <Card.Body>내용</Card.Body>
</Card.Root>
```

### 커스텀 훅 패턴
```typescript
// 관련 로직을 훅으로 캡슐화
function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getUsers({ signal: ac.signal })
        setUsers(data)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err : new Error('알 수 없는 오류'))
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => ac.abort()
  }, [])

  return { users, isLoading, error }
}
```

```typescript
// URL 상태 관리 - React Router v6/v7 (wecom은 v7, API 동일)
import { useSearchParams } from 'react-router-dom'

const FILTER_ALL = 'ALL' as const

function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? FILTER_ALL

  const handleChange = (value: string) => {
    setSearchParams(prev => {
      if (value === FILTER_ALL) {
        prev.delete('category') // ALL 선택 시 파라미터 제거
      } else {
        prev.set('category', value)
      }
      return prev
    })
  }
}
```

**Context 과다 사용 금지** - 자주 변경되는 값은 Context에 넣지 않음 (리렌더링 폭발)

## 테스트

React Testing Library + `userEvent.setup()` + Jest(프로젝트 설정 확인: vitest인 곳도 있다). 사용자 관점 쿼리(`getByRole`/`getByLabelText`)만 쓰고 구현 세부(state, 클래스명)를 단언하지 않는다. 테스트 범위·커버리지는 Claude 재량이고 수치 강제는 인수 게이트에서만(`rules/testing.md`).

---

## Vite 7 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
```
