# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large components
- Organize by feature/domain, not by type

## Error Handling

새 컨트롤러/라우트를 쓰기 전에 프로젝트의 기존 컨트롤러가 실제로 어떤 관용구를 쓰는지 먼저 확인한다 (일부 프로젝트는 `asyncHandler` 래퍼를 쓸 수 있음).

### (A) Express HTTP 핸들러 (컨트롤러/라우트)

`try { ... } catch (err) { next(err) }` — 재throw 금지, 중앙 `errorHandler` 미들웨어가 상태코드·응답 JSON을 단독 책임진다. 컨트롤러에 사용자 노출 에러 문자열을 인라인하지 않는다(중앙에서 결정). 기존 코드베이스가 명시적 try/catch를 쓰고 있으면 그 관례를 따르고, `asyncHandler` 같은 래퍼를 새로 도입하지 않는다.

```javascript
export async function getWebtoon(req, res, next) {
  try {
    const webtoon = await webtoonService.findById(req.params.id)
    res.json({ success: true, data: webtoon })
  } catch (err) {
    next(err)
  }
}
```

### (B) 그 외 일반 코드 (유틸·서비스 내부·스크립트 등, HTTP 핸들러 아님)

ALWAYS handle errors comprehensively:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## Input Validation

ALWAYS validate user input:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)
