# Common Patterns

## API Response Format

> **하나로 고정하지 말 것.** 실제 프로젝트마다 shape이 다르다:
> - wecom / modadam: `{success, message, data}` / `{success:false, message, errors?}`
> - speetalk: `{success, data, error, details?}`
> - cosmic-renew: `{success, data}` / `{success:false, error, code?}`
>
> 확인 순서: ① 로컬 `.claude/CLAUDE.md`/로컬 에이전트에 문서화된 shape 최우선 → ② 없으면 `backend/src/utils/response.js`(또는 동등 래퍼)를 직접 읽어 실제 shape 확인 → ③ 그것도 없는 신규 프로젝트에 한해 아래 인터페이스를 기본값으로 사용.
> speetalk·cosmic-kuji-market은 로컬 override가 없어 이 기본값을 그대로 상속하므로, 실제 프로젝트의 응답 필드명을 확인 없이 여기 인터페이스로 가정하지 말 것.

```typescript
// 신규 프로젝트 기본값 (wecom·modadam 실증)
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: unknown
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 관찰된 변형 (기본값 아님) — speetalk/cosmic-renew 등 기존 프로젝트에 붙일 땐
// 위 기본값을 가정하지 말고 해당 프로젝트 response.js 실측값을 따를 것
interface ApiResponseVariant {
  error?: string
  details?: unknown
  code?: string
}
```

## 공통 패턴 코드

useDebounce 등 커스텀 훅은 `frontend-patterns` 스킬, Repository 패턴은 `backend-patterns` 스킬이 담당한다(둘 다 자동 적용형). 여기 중복 기재하지 않는다.
