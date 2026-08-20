# react-specialist 참조: React 19 신규 API

> 이 파일은 `.claude/agents/react-specialist.md` 의 참조 파일이다. `use()`, `useOptimistic`, `useActionState` 를 실제로 쓸 때만 읽는다.

## React 19 특화 패턴

### use() Hook - 비동기 데이터 언래핑
```typescript
import { use, Suspense } from 'react'

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // Suspense와 함께 사용
  return <div>{user.name}</div>
}

// ⚠️ 주의: 렌더링마다 fetchUser(id)가 호출되면 무한 재요청 발생
// useMemo로 Promise를 한 번만 생성해야 함

// 부모: Promise를 useMemo로 한 번만 생성 (무한 재요청 방지)
const userPromise = useMemo(() => fetchUser(id), [id])
return <Suspense fallback={<Spinner />}><UserCard userPromise={userPromise} /></Suspense>

// 자식:
function UserCard({ userPromise }) {
  const user = use(userPromise)
  return <div>{user.name}</div>
}
```

### useOptimistic - 낙관적 업데이트
```typescript
import { useOptimistic, useTransition } from 'react'

function LikeButton({ post }: { post: Post }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    post.likes,
    (current, delta: number) => current + delta
  )
  const [isPending, startTransition] = useTransition()

  const handleLike = () => {
    startTransition(async () => {
      addOptimisticLike(1)
      await likePost(post.id)
    })
  }

  return (
    <button onClick={handleLike} disabled={isPending}>
      {optimisticLikes} 좋아요
    </button>
  )
}

// 아이템 삭제 패턴 (배열에서 제거)
// ⚠️ 필수: useOptimistic의 set 함수는 반드시 startTransition 내에서 호출
// Transition 밖에서 호출하면 즉시 원래 상태로 되돌아감 (React 19 제약)
const [isPending, startTransition] = useTransition()

const [optimisticItems, removeOptimistic] = useOptimistic(
  items,
  (state, idToRemove: string) => state.filter(item => item.id !== idToRemove)
)

const handleDelete = (id: string) => {
  startTransition(async () => {
    removeOptimistic(id)
    await deleteItem(id)
  })
}
```

### useActionState - 폼 액션 상태 관리
```typescript
import { useActionState } from 'react'

async function submitForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get('name') as string
  if (!name) return { error: '이름을 입력하세요', success: false }
  await saveUser({ name })
  return { error: null, success: true }
}

function UserForm() {
  const [state, formAction, isPending] = useActionState(submitForm, { error: null, success: false })

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
```
