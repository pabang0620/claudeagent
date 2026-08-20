# api-contract-designer: GENERATE 모드

> `.claude/agents/api-contract-designer.md` 의 모드 파일. 엔드포인트 1개에서 6파일을 생성할 때만 읽는다. 마지막 자기검증 절까지 반드시 수행한다.

## GENERATE 모드 — 엔드포인트 1개에서 6파일 생성

### 입력 예시
```
도메인: webtoon
엔드포인트:
- GET  /webtoons          (public, paginated)
- GET  /webtoons/:id      (public)
- POST /webtoons          (admin, 파일 업로드: cover_image)
- PATCH /webtoons/:id     (admin, 본인 또는 관리자)
- DELETE /webtoons/:id    (admin, 소프트 삭제)
DB 테이블: webtoons (이중 ID, status ENUM, deleted_at)
```

### 출력 파일 6종 (Repository 포함 — 컨트롤러 의존성 해결)

**경로 및 함수명은 Phase 0 감지 결과에 따라 적응**:
- 도메인 드리븐 구조: `backend/src/domains/webtoon/webtoonController.js` 등
- 평면 구조: `backend/controllers/webtoonController.js`
- 응답 유틸: 기존 프로젝트에 `successResponse/errorResponse/paginatedResponse` 가 있으면 그대로 사용 (ok/created 신규 생성 금지)
- DB 변수: `import pool from '../../config/database.js'; pool.query(...)` 또는 `import { db } from '../config/db.js'; db.query(...)`
- auth 필드: `req.user.role` 또는 `req.user.user_type`/`req.user.is_admin` (Phase 0 감지 결과 따름)
- 관리자 권한: `requireAdmin` 또는 `requireRole('admin')`

이하 템플릿은 "flat + ok/created + req.user.role + requireAdmin" 기준 예시. **실제 생성 시 Phase 0 결과로 치환**.

**Validation 스키마 구조 적응**:
- `VALIDATE_PATTERN=body.parse` → 에이전트 기본 템플릿 사용 (flat)
  ```typescript
  export const CreateWebtoonInput = z.object({
    title: z.string(),
    // ...
  })
  ```
- `VALIDATE_PATTERN=wrapped` → WeCom 호환 래핑 형태
  ```javascript
  export const createWebtoonSchema = z.object({
    body: z.object({
      title: z.string(),
      // ...
    })
  })
  ```
  - 라우트에서 `validationMiddleware(createWebtoonSchema)` 형태로 단일 스키마 전달
  - 컨트롤러는 `req.body` 그대로 사용 (미들웨어가 `{ body: req.body }` 로 래핑 parse)


#### (1) `shared/schemas/webtoon.ts` — Zod SSOT
```typescript
import { z } from 'zod'
import { WEBTOON_STATUS } from '../constants/enums'

// DB 컬럼명과 완전 동일 — drift 방지의 핵심
export const WebtoonSchema = z.object({
  id: z.number().int().positive(),
  webtoon_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  summary: z.string().max(2000).nullable(),
  cover_image_url: z.string().url().nullable(),
  status: z.enum(WEBTOON_STATUS),
  view_count: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
})
export type Webtoon = z.infer<typeof WebtoonSchema>

// 생성 시 — 클라이언트가 보내는 필드만
// ⚠️ multipart/FormData 경로: 숫자/불리언은 String()으로 직렬화되어 전송됨.
//    따라서 FormData로 들어오는 필드는 반드시 z.coerce.* 를 사용해야 validate({body})가 통과한다.
//    (uploadClient.create()는 모든 값을 String(v)로 append → coerce 없으면 validate 거부)
export const CreateWebtoonInput = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  summary: z.string().max(2000).nullable().optional(),
  // FormData 전송 필드는 coerce 필수 (문자열 → 타입 변환)
  episode_count: z.coerce.number().int().nonnegative().optional(),
  // ⚠️ multipart 경로에서 boolean: z.coerce.boolean()은 "false"(비어있지 않은 문자열)도 true로 만든다.
  //    enum('true','false') → transform 패턴으로 명시 변환해야 안전하다.
  is_featured: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  // 파일은 multer가 req.file로 주입. 여기선 URL 아님
})
export type CreateWebtoonInput = z.infer<typeof CreateWebtoonInput>

// 수정 시 — partial
export const UpdateWebtoonInput = CreateWebtoonInput.partial()
export type UpdateWebtoonInput = z.infer<typeof UpdateWebtoonInput>

// 쿼리 파라미터 (offset 방식)
export const ListWebtoonQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(WEBTOON_STATUS).optional(),
})
export type ListWebtoonQuery = z.infer<typeof ListWebtoonQuery>

// cursor 방식 (pagination=cursor 선택 시)
export const ListCursorQuery = z.object({
  after_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type ListCursorQuery = z.infer<typeof ListCursorQuery>

// Params — WeCom 이중 ID: 외부 식별자는 항상 UUID(webtoon_id)
export const WebtoonIdParam = z.object({
  webtoon_id: z.string().uuid(),
})
```

#### (2) `backend/routes/webtoonRoutes.js` — Express 스캐폴드
```javascript
import { Router } from 'express'
import multer from 'multer'
import { validate } from '../middleware/validate.js'
import { authMiddleware, requireAdmin, verifyOwnership } from '../middleware/auth.js'
import { uploadErrorHandler } from '../middleware/uploadErrorHandler.js'
import {
  WebtoonIdParam,
  ListWebtoonQuery,
  CreateWebtoonInput,
  UpdateWebtoonInput,
} from '../../shared/schemas/webtoon.js'
import * as ctrl from '../controllers/webtoonController.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('Only image files allowed'))
    cb(null, true)
  },
})

router.get('/', validate({ query: ListWebtoonQuery }), ctrl.list)
router.get('/:webtoon_id', validate({ params: WebtoonIdParam }), ctrl.getOne)

// ⚠️ uploadErrorHandler 는 라우트 미들웨어가 아닌 **글로벌 에러 핸들러**로 등록해야 함
// (multer fileFilter 에러가 next(err)로 글로벌 체인에 전달되므로)
// backend/app.js: `app.use(uploadErrorHandler)` 를 **모든 라우트 등록 이후** 호출
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  upload.single('cover_image'),
  validate({ body: CreateWebtoonInput }),
  ctrl.create
)

router.patch(
  '/:webtoon_id',
  authMiddleware,
  requireAdmin,
  validate({ params: WebtoonIdParam, body: UpdateWebtoonInput }),
  ctrl.update
)

// ⚠️ 순서 엄수: authMiddleware(인증) → verifyOwnership(소유권) → multer(파일) → validate → ctrl
// multer를 auth 앞에 두면 익명 사용자 파일이 메모리에 올라간 후 인증 실패 → DoS 위험
router.patch(
  '/:webtoon_id/cover',
  authMiddleware,                                   // 1. 인증 (req.user 주입)
  verifyOwnership(async (req) => {                 // 2. 소유권 (req.user 사용)
    // ★ 아키텍처 개선: repo를 routes에서 직접 import하지 말 것
    // verifyOwnership 콜백을 controller로 이동하거나, ctrl.verifyOwnerMiddleware 형태로 분리
    // 예: ctrl.verifyOwnerMiddleware → 내부에서 repo.findById 호출 후 req.resource 주입
    // routes에서는 아래처럼 controller가 제공하는 미들웨어를 참조
    return ctrl.getWebtoonOwnerId(req)             // controller가 repo 의존성 캡슐화
  }),
  upload.single('cover_image'),                    // 3. 파일 업로드 (Multer)
  validate({ params: WebtoonIdParam }),             // 4. 검증
  ctrl.updateCover
)

router.delete(
  '/:webtoon_id',
  authMiddleware,
  requireAdmin,
  validate({ params: WebtoonIdParam }),
  ctrl.remove
)

export default router
```

#### (3) `backend/controllers/webtoonController.js` — 전체 재조회 패턴
```javascript
import * as repo from '../repositories/webtoonRepository.js'
import { ok, created, notFound, serverError } from '../utils/response.js'
import { uploadToS3 } from '../utils/s3.js'

export const list = async (req, res) => {
  try {
    const { page, limit, status } = req.query
    const { items, total } = await repo.list({ page, limit, status })
    return ok(res, items, { page, limit, total })
  } catch (e) {
    return serverError(res, e.message)
  }
}

export const getOne = async (req, res) => {
  try {
    const row = await repo.findById(req.params.webtoon_id)
    if (!row || row.deleted_at) return notFound(res)
    return ok(res, row)
  } catch (e) {
    return serverError(res, e.message)
  }
}

// verifyOwnership 콜백용 — repo 의존성을 controller에 캡슐화 (routes에서 repo 직접 import 금지)
export const getWebtoonOwnerId = async (req) => {
  const row = await repo.findById(req.params.webtoon_id)
  return row?.owner_id ?? null
}

export const create = async (req, res) => {
  try {
    let cover_image_url = null
    if (req.file) cover_image_url = await uploadToS3(req.file, 'webtoon')

    const newId = await repo.insert({ ...req.body, cover_image_url })
    // ★ 핵심: insertId만 반환하지 말고 전체 리소스 재조회
    const row = await repo.findById(newId)
    return created(res, row)
  } catch (e) {
    return serverError(res, e.message)
  }
}

export const update = async (req, res) => {
  try {
    const existing = await repo.findById(req.params.webtoon_id)
    if (!existing || existing.deleted_at) return notFound(res)
    await repo.update(req.params.webtoon_id, req.body)
    // ★ 전체 재조회
    const row = await repo.findById(req.params.webtoon_id)
    return ok(res, row)
  } catch (e) {
    return serverError(res, e.message)
  }
}

export const remove = async (req, res) => {
  try {
    const existing = await repo.findById(req.params.webtoon_id)
    if (!existing || existing.deleted_at) return notFound(res)
    await repo.softDelete(req.params.webtoon_id)
    return ok(res, { id: req.params.webtoon_id, deleted: true })
  } catch (e) {
    return serverError(res, e.message)
  }
}
```

#### (3-b) `backend/repositories/webtoonRepository.js` — SQL 최소 CRUD

```javascript
import { db } from '../config/db.js'
import { randomUUID } from 'crypto'

// WeCom 이중 ID 컨벤션: 외부 식별자는 UUID(webtoon_id), 내부 인덱스는 AUTO_INCREMENT(id)
const COLS = 'id, webtoon_id, title, author, summary, cover_image_url, status, view_count, created_at, updated_at, deleted_at'

export const list = async ({ page, limit, status }) => {
  const offset = (page - 1) * limit
  const whereClause = status
    ? 'WHERE deleted_at IS NULL AND status = ?'
    : 'WHERE deleted_at IS NULL'
  const whereParams = status ? [status] : []

  const [items] = await db.query(
    `SELECT ${COLS} FROM webtoons ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...whereParams, limit, offset]
  )
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM webtoons ${whereClause}`,
    whereParams
  )
  return { items, total }
}

export const findById = async (webtoon_id) => {
  const [rows] = await db.query(`SELECT ${COLS} FROM webtoons WHERE webtoon_id = ? LIMIT 1`, [webtoon_id])
  return rows[0] || null
}

export const insert = async (input) => {
  const webtoon_id = randomUUID()
  await db.query(
    `INSERT INTO webtoons (webtoon_id, title, author, summary, cover_image_url, status, episode_count, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [webtoon_id, input.title, input.author, input.summary ?? null, input.cover_image_url ?? null, input.status ?? 'draft', input.episode_count ?? 0, input.is_featured ?? false]
  )
  return webtoon_id  // UUID 반환 (AUTO_INCREMENT 내부 ID 노출 금지)
}

// 화이트리스트 — 스키마와 동기 (zod schema 의 partial() 과 중복 방어)
const UPDATABLE_COLS = new Set(['title', 'author', 'summary', 'episode_count', 'is_featured'])

export const update = async (webtoon_id, input) => {
  const fields = []
  const params = []
  for (const [k, v] of Object.entries(input)) {
    if (!UPDATABLE_COLS.has(k)) continue  // 화이트리스트 외 차단 (defense in depth)
    fields.push(`\`${k}\` = ?`)
    params.push(v)
  }
  if (!fields.length) return
  params.push(webtoon_id)
  await db.query(`UPDATE webtoons SET ${fields.join(', ')} WHERE webtoon_id = ?`, params)
}

export const softDelete = async (webtoon_id) => {
  await db.query(`UPDATE webtoons SET deleted_at = NOW() WHERE webtoon_id = ?`, [webtoon_id])
}

// cursor 기반 list (무한스크롤용 — Phase 1 에서 pagination=cursor 선택 시)
export const listCursor = async ({ after_id, limit }) => {
  const params = after_id ? [after_id, limit] : [limit]
  const where = after_id ? 'WHERE deleted_at IS NULL AND id < ?' : 'WHERE deleted_at IS NULL'
  const [items] = await db.query(
    `SELECT ${COLS} FROM webtoons ${where} ORDER BY id DESC LIMIT ?`,
    params
  )
  const next_cursor = items.length === limit ? items[items.length - 1].id : null
  return { items, next_cursor }
}
```

> **참고**: 비즈니스 로직이 복잡할 경우 Service 계층은 `express-engineer` 에이전트에 위임. 이 에이전트는 최소 CRUD Repository만 생성.

#### (4) `frontend/src/api/webtoon.ts` — 타입 안전 클라이언트
```typescript
import { apiClient } from './client'
import { uploadClient } from './uploadClient'
import type { Webtoon, CreateWebtoonInput, UpdateWebtoonInput, ListWebtoonQuery } from '../../../shared/schemas/webtoon'

export const webtoonApi = {
  list: (query: ListWebtoonQuery) =>
    apiClient.get<Webtoon[]>('/webtoons', { params: query }),

  getOne: (id: string) =>
    apiClient.get<Webtoon>(`/webtoons/${id}`),

  create: (input: CreateWebtoonInput, coverImage?: File) => {
    const fd = new FormData()
    Object.entries(input).forEach(([k, v]) => v != null && fd.append(k, String(v)))
    if (coverImage) fd.append('cover_image', coverImage)
    return uploadClient.post<Webtoon>('/webtoons', fd)
  },

  update: (id: string, input: UpdateWebtoonInput) =>
    apiClient.patch<Webtoon>(`/webtoons/${id}`, input),

  remove: (id: string) =>
    apiClient.delete<{ id: string; deleted: boolean }>(`/webtoons/${id}`),
}
```

#### (5) `frontend/src/mocks/webtoon.ts` — MSW 핸들러
```typescript
import { http, HttpResponse } from 'msw'
import { WebtoonSchema, ListWebtoonQuery, CreateWebtoonInput } from '../../../shared/schemas/webtoon'

const fixtures: any[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  webtoon_id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  title: `웹툰 ${i + 1}`,
  author: `작가 ${i + 1}`,
  summary: null,
  cover_image_url: null,
  status: 'published',
  view_count: i * 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
}))

export const webtoonHandlers = [
  http.get('/webtoons', ({ request }) => {
    const url = new URL(request.url)
    const query = ListWebtoonQuery.parse(Object.fromEntries(url.searchParams))
    const start = (query.page - 1) * query.limit
    return HttpResponse.json({
      success: true,
      data: fixtures.slice(start, start + query.limit),
      meta: { page: query.page, limit: query.limit, total: fixtures.length },
    })
  }),

  http.get('/webtoons/:webtoon_id', ({ params }) => {
    const row = fixtures.find((w) => w.webtoon_id === params.webtoon_id)
    // message 필드가 기본값(원칙 #2-③) — 필드명은 프로젝트 실측 response.js shape을 따를 것(error일 수도 있음)
    if (!row) return HttpResponse.json({ success: false, message: '없음' }, { status: 404 })
    return HttpResponse.json({ success: true, data: row })
  }),

  // POST/PATCH/DELETE 핸들러도 유사 패턴으로 추가
]
```

---

### PATCH + 파일 업로드 패턴 (주의)

Express는 PATCH 메서드에도 multer를 사용할 수 있지만, Content-Type이 multipart/form-data여야 함:

```javascript
// ❌ 잘못됨: PATCH에서 express.json() 미들웨어 사용 시 FormData 파싱 안 됨
router.patch('/users/:id/avatar', express.json(), uploadAvatar)

// ✅ 올바름: PATCH에도 multer 미들웨어 명시
import { upload } from '../middleware/upload.js'
router.patch('/users/:id/avatar', upload.single('avatar'), updateUserAvatar)

// 프론트엔드: PATCH + FormData
const formData = new FormData()
formData.append('avatar', file)
await apiClient.patch(`/users/${id}/avatar`, formData)
// ⚠️ Content-Type 헤더를 직접 설정하지 말 것 — 브라우저가 boundary 포함하여 자동 설정
```


---

## 자기검증 체크리스트 (GENERATE 모드 완료 시)

각 출력 파일 생성 후 **반드시** 다음을 검증:

```bash
# 1. 필드명 일관성 — Zod 스키마의 모든 키가 DB 스키마 컬럼명과 일치하는가
grep -E "^\s+\w+:" shared/schemas/<domain>.ts
# 위 결과를 DB 스키마 파일과 비교

# 2. 모든 POST/PATCH가 전체 재조회를 하는가
grep -A3 "insertId\|updateResult" backend/controllers/<domain>Controller.js
# insertId 만 반환하는 패턴이 있으면 error

# 3. 관리자 라우트에 requireAdmin 부착 여부
grep -E "router\.(post|patch|delete)" backend/routes/<domain>Routes.js | grep -v "requireAdmin"
# 빈 결과여야 함 (관리자 라우트인 경우)

# 4. 응답 포맷 통일 여부
grep "res.json\|res.send" backend/controllers/<domain>Controller.js
# 직접 res.json 호출 있으면 error (ok/created/notFound 등만 사용해야)

# 5. UPDATABLE_COLS ↔ Zod UpdateInput 동기 검증
# ⚠️ 전체 WebtoonSchema 키(id/created_at 등 포함)와 비교하면 항상 불일치(false positive).
#    반드시 업데이트 가능한 부분집합인 CreateInput/UpdateInput 스키마의 키만 추출해 비교한다.
# CreateWebtoonInput = z.object({ ... }) 블록 내부 키만 추출 (UpdateInput은 이것의 .partial())
UPDATE_KEYS=$(awk '/export const Create[A-Za-z]+Input = z.object\(\{/,/^\}\)/' shared/schemas/<domain>.ts 2>/dev/null \
  | grep -oE "^\s+\w+:" | tr -d ' :' | sort -u)
REPO_COLS=$(grep -oE "UPDATABLE_COLS = new Set\(\[[^]]*\]" backend/repositories/<domain>Repository.js 2>/dev/null \
  | grep -oE "'[a-z_]+'" | tr -d "'" | sort -u)
diff <(echo "$UPDATE_KEYS") <(echo "$REPO_COLS") && echo "✓ UpdateInput↔UPDATABLE_COLS 동기" || echo "⚠️ UPDATABLE_COLS와 Zod UpdateInput 불일치"
```

자기검증 실패 시 해당 파일 자동 수정 후 재검증.
