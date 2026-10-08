# Express WeCom 회고 패턴 - 코드 예시 원문

express-engineer 본문 규칙의 코드 예시다. 해당 규칙을 구현할 때만 읽는다.

## WeCom 회고 기반 안티패턴 (자동 체크)

> WeCom 프로젝트 회고에서 반복 발생한 실수를 정리한 섹션. 코드 작성·리뷰 시 아래 항목을 자동으로 점검한다.

### 응답 포맷 통일
- 프로젝트마다 실제 응답 shape이 다르다 (예: wecom/modadam `{success, message, data}` + `errors[]`, speetalk `{success, data, error, details}`, cosmic-renew `{success, data}`/`{error}`). 단일 shape을 예외 없이 강제하지 않는다. 판단 우선순위:
  1. 프로젝트 로컬 `.claude` 문서가 응답 shape을 정의했으면 그것이 최우선
  2. 없으면 `backend/src/utils/response.js`(또는 동등 래퍼)를 직접 읽어 기존 코드가 실제로 쓰는 shape을 따름
  3. 신규 프로젝트에 한해 기본값 `{ success: true, message?, data, meta? }` / `{ success: false, message, errors? }` 채택
- 직접 `res.json({ ... })` 호출 금지 → 응답 유틸(`successResponse`/`errorResponse` 등) 래퍼 사용
- 신규 프로젝트 기본 래퍼(wecom·modadam `utils/response.js` 실측과 동일한 시그니처):
  ```javascript
  // src/utils/response.js
  export const successResponse = (res, data = null, message = 'success', statusCode = 200) =>
    res.status(statusCode).json({ success: true, message, data })

  export const errorResponse = (res, message = 'error', statusCode = 400, errors = null) =>
    res.status(statusCode).json(errors ? { success: false, message, errors } : { success: false, message })

  export const paginatedResponse = (res, data, meta, message = 'success') =>
    res.status(200).json({ success: true, message, data, meta })
  ```
- DELETE 등 데이터 없는 응답도 래퍼로: wecom·modadam은 `successResponse(res, null, '삭제되었습니다.')`(3번째 인자가 message). `messageResponse`는 프로젝트 response.js에 이미 있을 때만 쓴다.
- 인자 순서는 래퍼마다 다르다(cosmic-renew는 `ok(res, data, meta)` / `fail(res, status, message, code)`). 호출 전에 response.js의 시그니처를 읽고, 문자열을 statusCode 자리에 넣는 실수를 피한다.

### POST/PATCH 전체 리소스 재조회
- INSERT 후 `insertId`만 반환 금지 → 전체 리소스 `findById` 재조회 후 반환
- 외부에 `AUTO_INCREMENT` id 노출 금지 → UUID만 반환
- 패턴:
  ```javascript
  // [나쁨] insertId만 반환
  const { insertId } = await pool.query('INSERT INTO ...')
  return { id: insertId }

  // [좋음] 전체 리소스 재조회
  const { insertId } = await pool.query('INSERT INTO ...')
  return findById(insertId)  // UUID 포함 전체 필드 반환

  // UPDATE 후 전체 리소스 재조회 (시나리오 C 패턴)
  const [result] = await conn.execute(
    'UPDATE posts SET title=?, body=? WHERE post_uuid=?',
    [title, body, uuid]
  )
  if (result.affectedRows === 0) throw new AppError('게시글을 찾을 수 없습니다.', 404)
  return findByUuid(uuid)  // AUTO_INCREMENT id 아닌 UUID로 조회
  ```

  ```javascript
  // mysql2 + withTransaction 완전 흐름 예시 (PATCH /:id)
  const updated = await withTransaction(pool, async (conn) => {
    const [{ affectedRows }] = await conn.execute(
      'UPDATE comments SET body=? WHERE comment_uuid=? AND deleted_at IS NULL',
      [body, uuid]
    )
    if (affectedRows === 0) throw new AppError('댓글을 찾을 수 없습니다.', 404)
    return findByUuid(uuid)  // 전체 리소스 재조회 반환
  })
  ```

### 인증 2층 구조
- `authMiddleware` (토큰 검증) + `requireAdmin` 또는 `verifyOwnership` (권한) 2층 필수
- admin 라우트에 `requireAdmin` 누락 시 부팅 실패로 강제 (convention-enforcer ce-002)
- 패턴:
  ```javascript
  // [나쁨] 인증만 있고 권한 없음
  router.delete('/admin/users/:id', authenticate, adminController.deleteUser)

  // [좋음] 인증 + 권한 2층
  router.delete('/admin/users/:id', authenticate, requireAdmin, adminController.deleteUser)
  ```

### verifyOwnership 미들웨어 구현

신규 프로젝트는 `src/middleware/verifyOwnership.js`를 만들어 라우터 체인에 둔다. wecom·modadam은 미들웨어 없이 Service에서 소유권을 검사한다(`webtoonService.js`: `author_uuid !== userUuid` → 403). 기존 프로젝트에서는 그 관례를 따르고, 빠진 소유권 검사를 보완할 때도 같은 자리(Service)에 넣는다. 둘 중 어느 방식이든 "검사 자체가 없는" 변경 라우트가 CRITICAL이다.
구현체와 라우터 적용 예시는 `agent-refs/express-middleware-auth.md` 참조.
핵심 제약: `verifyOwnership(Model, ownerField = 'user_id')` 시그니처, ADMIN 역할은 우회 허용, 검증 통과 시 `req.resource` 에 레코드 주입, 라우터에서 `validate(uuidParamSchema, 'params')` **뒤에** 배치.

### 파일 업로드
- FormData 전송 시 `Content-Type` 헤더 수동 설정 금지 → `uploadClient` 래퍼 경유
- multer 에러는 글로벌 에러 핸들러로 등록 (라우트 미들웨어 아님)
- multer 모든 에러를 **400**으로 정규화 (500 누출 금지)
- 구현체(multer storage/fileFilter/limits + errorHandler MulterError 분기)는 `agent-refs/express-middleware-auth.md` 참조
- 파일명은 `crypto.randomUUID()` 사용 (userId 노출 금지), 업로드 디렉토리는 `mkdirSync(dir, { recursive: true })` 로 사전 생성 (없으면 ENOENT)


### 대량 알림 팬아웃 (PK 커서 배치, LIMIT/OFFSET 금지)
- N명 대상 팬아웃(알림·이메일 등)은 처음부터 **PK 커서 기반 배치**로 설계 - LIMIT/OFFSET 페이지네이션은 배치 처리 중 대상 테이블에 삽입/삭제가 끼면 뒤로 밀리며 일부 대상이 누락되거나 중복 발송됨
- 카운트 API(안읽음 수 등)는 부분합 캐시 조합이 아니라 **단일 집계 쿼리**로 계산 (캐시-실측 drift 방지)
- WeCom 회고: `1996523` 공지 발행 알림이 10000명 초과 시 누락되어 cursor batch로 전환, `5c127cc`+`d742567` Bell 미읽음 뱃지가 부정확해 전체 카운트 API로 교체
- 패턴:
  ```javascript
  // [나쁨] LIMIT/OFFSET - 배치 중간 삽입/삭제 시 누락·중복
  for (let offset = 0; offset < total; offset += 500) {
    const [users] = await pool.query('SELECT id FROM users LIMIT 500 OFFSET ?', [offset])
    await sendNotifications(users)
  }

  // [좋음] PK 커서 기반 배치 - 삽입/삭제에 안전
  let cursor = 0
  while (true) {
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id > ? ORDER BY id LIMIT 500', [cursor]
    )
    if (users.length === 0) break
    await sendNotifications(users)
    cursor = users[users.length - 1].id
  }
  ```

### Zod 검증
- 요청 `body`/`query`/`params` 모두 Zod 스키마로 검증 → `validate` 미들웨어
- Zod 에러 시 필드별 메시지. 상태코드·형식은 프로젝트 실측: wecom·modadam은 `validate(schema)` 하나가 `{ body, query, params }`를 받아 `422` + `errors[{field,message}]`, 결과는 `req.validated`. 아래는 그런 미들웨어가 없는 신규 프로젝트 기본(`400` + `details`)이다.
- 패턴:
  ```javascript
  // body 외에 query, params도 검증
  export const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: '입력값이 올바르지 않습니다.',
        details: result.error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
    }
    req[source] = result.data
    next()
  }

  // 라우터에서 사용
  router.get('/', validate(listQuerySchema, 'query'), controller.list)
  router.get('/:id', validate(idParamSchema, 'params'), controller.getById)
  ```
- **모든 `/:id` 파라미터 라우트는 `validate(uuidParamSchema, 'params')`를 기본 포함** - 반드시 `verifyOwnership` **앞에** 배치. 누락·순서 역전 시 잘못된 UUID가 DB에 전달되어 `22P02 invalid_text_representation` 500 에러 발생. 예시가 아닌 기본 패턴으로 항상 적용.

### Repository 패턴 - defense in depth
- UPDATE 시 `UPDATABLE_COLS` 화이트리스트 사용 (SQL 인젝션 defense in depth)
- FK 참조는 UUID 컬럼으로 (`AUTO_INCREMENT` 내부 id 직접 참조 금지)
- 패턴:
  ```javascript
  // [나쁨] 동적 컬럼 무검증
  const setClauses = Object.keys(data).map((k, i) => `${k} = $${i + 1}`)

  // [좋음] 화이트리스트 필터링
  const UPDATABLE_COLS = ['name', 'email', 'bio', 'avatar_url']
  const entries = Object.entries(data).filter(([k]) => UPDATABLE_COLS.includes(k))
  const setClauses = entries.map(([k], i) => `${k} = $${i + 1}`)
  const values = entries.map(([, v]) => v)
  ```

- 상태코드는 프로젝트 errorHandler가 읽는 필드에 맞춰 던진다. 필드명이 어긋나면 500이 된다.
  ```javascript
  // wecom·modadam (AppError 없음, errorHandler가 err.status를 읽음)
  if (!row) throw Object.assign(new Error('주문을 찾을 수 없습니다'), { status: 404 })

  // AppError가 있는 프로젝트 (errorHandler가 err.statusCode를 읽음)
  import { AppError } from '../utils/AppError.js'
  if (!row) throw new AppError('주문을 찾을 수 없습니다.', 404)

  // [나쁨] 프로젝트가 읽지 않는 필드에 넣기 - wecom에서 err.statusCode = 404 는 500으로 응답된다
  ```

### 트랜잭션 헬퍼

`src/utils/withTransaction.js` 로 BEGIN/COMMIT/ROLLBACK + `client.release()` 를 `finally` 에서 보장하는 헬퍼를 만들어 쓴다. 구현체는 `agent-refs/express-db-async.md` 참조.
mysql2 프로젝트는 같은 파일의 mysql2 트랜잭션 헬퍼를 쓴다 (`conn.beginTransaction()` / `conn.release()`).


### 신규 라우터 등록 규칙

신규 라우터 파일 생성 시 **반드시** `routes/index.js`에 등록 코드를 포함한다:

```javascript
// src/routes/index.js
import { Router } from 'express'
import userRoutes from './users.js'
import productRoutes from './products.js'  // 신규 라우터 등록

const router = Router()
router.use('/users', userRoutes)
router.use('/products', productRoutes)  // 등록 없으면 API 응답 안 함

export default router
```

라우터 파일 자체를 작성·수정할 때는 등록 여부 외에 아래 두 가지도 함께 점검한다.

#### 선언 순서 - 와일드카드/파라미터 라우트가 정적 라우트보다 먼저 오면 안 됨
같은 라우터 안에서 `/:id` 같은 파라미터 라우트가 `/search`, `/popular`, `/mine` 같은 정적 라우트보다 먼저 선언되면, 정적 라우트로 가는 요청도 먼저 매칭된 `/:id` 핸들러로 흡수되어 **영원히 도달하지 못한다.**

탐지 패턴: 같은 라우터 파일 내에서 `router.get('/:xxx', ...)` 선언 줄 번호가 `router.get('/정적경로', ...)` 선언 줄 번호보다 앞서는지 확인. GET뿐 아니라 동일 세그먼트를 쓰는 다른 메서드에도 동일하게 적용.

```javascript
// [나쁨] 나쁨 - /popular 요청이 /:id 핸들러로 잘못 라우팅됨
router.get('/:id', productController.getById)
router.get('/popular', productController.getPopular)  // 영원히 도달 불가

// [좋음] 좋음 - 정적 라우트를 파라미터 라우트보다 먼저 선언
router.get('/popular', productController.getPopular)
router.get('/:id', productController.getById)
```

#### 변경계열 라우트(POST/PUT/PATCH/DELETE) 인증 미들웨어 누락
라우터 파일을 훑을 때 `POST`/`PUT`/`PATCH`/`DELETE` 핸들러마다 `authenticate`(또는 `authMiddleware`) - 필요 시 `verifyOwnership`/`requireAdmin` - 가 실제로 체이닝되어 있는지 줄 단위로 확인한다. 로그인 없이도 되는 라우트(예: 회원가입, 로그인)를 제외하고, 리소스를 변경하는 라우트에 인증 미들웨어가 없으면 CRITICAL로 보고한다. 2층 인증 조합 자체의 상세 규칙은 위 "인증 2층 구조" 섹션을 따른다 - 여기서는 라우터 파일을 새로 등록/수정할 때 누락 여부를 놓치지 않기 위한 체크리스트로 취급한다.

```javascript
// [나쁨] 나쁨 - DELETE인데 인증 미들웨어 없음
router.delete('/:id', productController.remove)

// [좋음] 좋음
router.delete('/:id', authenticate, verifyOwnership(ProductRepository), productController.remove)
```

### API 워터폴 탐지 및 aggregation 엔드포인트

**탐지 기준**
페이지/커스텀훅이 마운트 시점(`useEffect(..., [])`)에 **3개 이상**의 독립적인 API를 호출하면 워터폴 후보다.
- 패턴 A - `useEffect` 안에 개별 fetch 3개 이상 나열
- 패턴 B - `Promise.all([...])`로 병렬 처리했지만 그 결과에 의존한 후속 호출이 또 붙는 2-step 체이닝(예: A·B 완료 후 `fetchC(a.id)` 추가 호출)
- 패턴 C - 순차 `await` 체인(`await fetchA(); await fetchB(); await fetchC()`)으로 직렬 실행되는 경우

```bash
grep -rln "useEffect" frontend/src/pages/ --include="*.jsx" --include="*.js"      # 후보 페이지/훅 나열
grep -rn "Promise.all(\[" frontend/src/pages/ --include="*.jsx" --include="*.js"  # 병렬 묶음 후보
```
grep은 후보 나열용일 뿐이다 - 카운트만으로 판단하지 말고 각 페이지 컴포넌트/`use*.js` 훅을 Read로 직접 열어 마운트 시 실제 호출 수와 의존관계를 확인한 뒤에만 판단한다.

**합칠지 판단 기준**
| 합쳐도 됨 | 합치면 안 됨 |
|---|---|
| 모두 같은 페이지 초기 렌더에 필요 | 사용자 상호작용(드롭다운·검색·페이지네이션)으로 트리거되는 호출 - 애초에 워터폴이 아니므로 유지 |
| 전부 동일 인증 수준(전부 공개 또는 전부 인증) | 인증 필요 데이터 + 공개 데이터 혼합 (아래 금지 규칙) |
| 응답이 작아 페이로드 합산 부담이 없음 | 캐싱 전략이 서로 달라야 하는 경우(한쪽만 실시간성이 중요) |

**금지 규칙 - 인증 데이터 ↔ 공개 데이터 혼합 금지**
인증이 필요한 데이터와 공개 데이터를 하나의 aggregation 엔드포인트에 섞지 않는다.
- 토큰 만료 시 공개 데이터까지 함께 실패 → 공개 페이지 전체가 깨짐
- 반대로 미들웨어를 느슨하게 걸면 비인증 사용자에게 보호 데이터가 그대로 노출됨
- 대안: (1) 프론트에서 `Promise.all([공개API(), 인증API()])` 병렬 유지 - 이미 병렬이므로 워터폴 아님 (2) 공개/인증을 각각 별도 aggregation 엔드포인트로 분리 (3) 공개 데이터는 캐싱으로 요청 자체를 줄임

**집계 엔드포인트 골격**
```javascript
// controllers 위치는 프로젝트 구조 컨벤션을 따름
export const getPageData = async (req, res, next) => {
  try {
    const [itemsA, itemsB, itemsC] = await Promise.all([
      ServiceA.getAll().catch(() => []),      // 부분 실패를 기본값으로 흡수
      ServiceB.getList().catch(() => []),
      ServiceC.getItems().catch(() => []),
    ])
    // 응답 shape은 위 "응답 포맷 통일" 규칙(프로젝트 감지)을 그대로 따른다 - 여기서 새 shape을 만들지 않음
    return successResponse(res, { itemsA, itemsB, itemsC })
  } catch (err) {
    next(err)
  }
}
```
- `.catch(() => 기본값)`은 "없어도 페이지가 의미 있는" 데이터에만 적용한다. 핵심 데이터(예: 상품 상세 자체)는 catch 없이 던져 `next(err)`로 넘겨 정상 에러 처리
- 라우터 등록은 위 "신규 라우터 등록 규칙" 섹션과 동일 - `routes/index.js` 등록 누락 금지

**프론트 교체**
- 기존 `useEffect` 내 다중 fetch / `Promise.all` 호출을 단일 aggregation API 함수 1개 호출로 교체
- 부분 실패 처리: 단일 호출이 실패해도 페이지 전체가 깨지지 않도록 `.catch(() => {})` + 각 state는 빈 배열/null 기본값 유지, 로딩 종료는 `.finally()`
- 완료 기준: 마운트 시 HTTP 요청 수 ≤ 2개(aggregation 1개 + 필요 시 인증 확인 1개), 사용자 상호작용으로 트리거되는 호출은 그대로 유지되는지 확인

