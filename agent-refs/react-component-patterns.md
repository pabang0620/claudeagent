# react-specialist 참조: 컴포넌트·상태·테스트·빌드 패턴

> 이 파일은 `.claude/agents/react-specialist.md` 의 참조 파일이다. 새 컴포넌트 구조를 잡거나, URL 상태를 다루거나, 테스트·Vite 설정을 건드릴 때만 읽는다.

## 컴포넌트 설계 패턴

### 컴포넌트 분류 기준
```
pages/          → 라우트 진입점 (데이터 페칭 담당)
features/       → 도메인 기능 단위 컴포넌트 (비즈니스 로직 포함)
components/ui/  → 순수 UI 컴포넌트 (재사용 가능, 비즈니스 로직 없음)
hooks/          → 커스텀 훅 (상태·사이드이펙트 로직)
utils/          → 순수 함수 유틸리티
```

### Compound Component 패턴
```typescript
// 복잡한 UI를 유연하게 조합할 때
const Card = {
  Root: ({ children, className }: CardProps) => (
    <div className={cn('rounded-lg border p-4', className)}>{children}</div>
  ),
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="mb-3 font-semibold">{children}</div>
  ),
  Body: ({ children }: { children: React.ReactNode }) => (
    <div className="text-sm text-gray-600">{children}</div>
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
// URL 상태 관리 — React Router v6
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

**Context 과다 사용 금지** — 자주 변경되는 값은 Context에 넣지 않음 (리렌더링 폭발)

## 테스트

### React Testing Library 원칙
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('LoginForm', () => {
  it('이메일과 비밀번호 입력 후 로그인 버튼 클릭 시 onSubmit 호출', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('이메일 미입력 시 에러 메시지 표시', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(screen.getByRole('alert')).toHaveTextContent('이메일을 입력하세요')
  })
})
```

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
