---
name: backend-dev
description: Landing Studio 백엔드 개발 컨벤션. Express API, Prisma ORM, AWS S3 작업 시 사용. 백엔드 코드 작성, 수정, 리뷰 시 자동 적용.
---

# Landing Studio Backend Conventions

## 기술 스택

- **Runtime**: Node.js (ES6+)
- **Framework**: Express.js v4
- **ORM**: Prisma v5 (MySQL)
- **Database**: MySQL (AWS RDS)
- **Storage**: AWS S3 + CloudFront CDN
- **Auth**: JWT (jsonwebtoken)
- **Upload**: Multer (메모리 스토리지)
- **Frontend Serving**: Express static (빌드된 React 앱 서빙)

## 아키텍처

Node.js(Express)가 API 서버 + 프론트엔드 서빙을 모두 담당:

```
┌─────────────────────────────────────┐
│           Express (app.js)          │
├─────────────────────────────────────┤
│  /api/*  → API 라우트 처리          │
│  /*      → React 빌드 파일 서빙     │
└─────────────────────────────────────┘
```

```javascript
// app.js - 프론트엔드 빌드 파일 서빙
const path = require('path');

// React 빌드 폴더 static 서빙
app.use(express.static(path.join(__dirname, '../front-end/dist')));

// API 라우트
app.use('/api', routes);

// SPA 라우팅 - 모든 요청을 index.html로
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/dist/index.html'));
});
```

## 디렉토리 구조

```
src/
├── app.js                    # Express 앱 설정 + 프론트 서빙
├── config/
│   └── s3Config.js          # AWS S3 설정
├── middleware/
│   └── authMiddleware.js    # JWT 인증
├── modules/                 # 기능 모듈
│   └── {feature}/
│       ├── controllers/
│       │   └── {feature}Controller.js
│       └── routes.js
├── routes/
│   └── index.js             # 라우트 통합
└── utils/
    └── s3Upload.js          # S3 유틸리티
prisma/
└── schema.prisma            # DB 스키마
```

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 | camelCase | `landingController.js` |
| 함수/변수 | camelCase | `getUserNameMap`, `uploadToS3` |
| 상수 | UPPER_SNAKE_CASE | `CACHE_TTL`, `BUCKET_NAME` |
| Prisma 모델 | camelCase | `landingInfo`, `domainList` |
| DB 필드 | camelCase | `adNumber`, `createAt`, `userId` |

## API 설계

### REST 엔드포인트
```
GET    /api/{resources}           # 목록 조회
GET    /api/{resources}/:id       # 단일 조회
POST   /api/{resources}           # 생성
PUT    /api/{resources}/:id       # 수정
DELETE /api/{resources}/:id       # 삭제
```

### 응답 형식 (필수)
```javascript
// 성공 - 어디서 성공했는지 명시
{
  "success": true,
  "data": { /* 응답 데이터 */ },
  "msg": "랜딩 페이지 생성 성공"
}

// 실패 - 어디서 실패했는지 명시
{
  "success": false,
  "data": null,
  "msg": "랜딩 페이지 조회 실패: 해당 데이터를 찾을 수 없습니다."
}
```

**msg 작성 규칙:**
- 성공: `"{작업 대상} {동작} 성공"` (예: "도메인 생성 성공", "랜딩 페이지 수정 성공")
- 실패: `"{작업 대상} {동작} 실패: {원인}"` (예: "랜딩 페이지 조회 실패: 해당 데이터를 찾을 수 없습니다.")

### HTTP 상태 코드
| 코드 | 용도 | 사용 상황 |
|------|------|----------|
| 200 | 성공 | 조회, 수정, 삭제 성공 |
| 201 | 생성 성공 | POST로 새 리소스 생성 |
| 400 | 잘못된 요청 | 필수 파라미터 누락, 유효성 검사 실패 |
| 401 | 인증 필요 | 토큰 없음, 토큰 만료, 토큰 무효 |
| 403 | 권한 없음 | 인증됐지만 해당 리소스 접근 권한 없음 |
| 404 | 리소스 없음 | 요청한 데이터가 DB에 없음 |
| 409 | 중복 충돌 | 이미 존재하는 데이터 생성 시도 |
| 500 | 서버 오류 | 예외 발생, DB 오류, 예상치 못한 에러 |

### 에러 코드 체계

에러 발생 시 `msg`에 구체적인 한국어 메시지 포함:

```javascript
// 400 - 유효성 검사 실패
{ success: false, data: null, msg: "도메인은 필수입니다." }
{ success: false, data: null, msg: "파일 크기는 5MB를 초과할 수 없습니다." }
{ success: false, data: null, msg: "허용되지 않는 파일 형식입니다." }

// 401 - 인증 실패
{ success: false, data: null, msg: "인증 토큰이 없습니다." }
{ success: false, data: null, msg: "유효하지 않은 토큰입니다." }
{ success: false, data: null, msg: "토큰이 만료되었습니다." }

// 403 - 권한 없음
{ success: false, data: null, msg: "해당 리소스에 접근 권한이 없습니다." }

// 404 - 리소스 없음
{ success: false, data: null, msg: "랜딩 페이지를 찾을 수 없습니다." }
{ success: false, data: null, msg: "사용자를 찾을 수 없습니다." }
{ success: false, data: null, msg: "도메인을 찾을 수 없습니다." }

// 409 - 중복
{ success: false, data: null, msg: "이미 존재하는 도메인입니다." }
{ success: false, data: null, msg: "이미 존재하는 항목입니다." }

// 500 - 서버 오류
{ success: false, data: null, msg: "서버 오류가 발생했습니다." }
{ success: false, data: null, msg: "조회 실패: {에러메시지}" }
{ success: false, data: null, msg: "생성 실패: {에러메시지}" }
```

### 에러 처리 패턴

```javascript
const create = async (req, res) => {
  try {
    const { domain, template } = req.body;

    // 400 - 유효성 검사
    if (!domain) {
      return res.status(400).json({
        success: false,
        data: null,
        msg: "도메인은 필수입니다."
      });
    }

    // 409 - 중복 체크
    const existing = await prisma.domainList.findUnique({
      where: { domainUrl: domain }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        data: null,
        msg: "이미 존재하는 도메인입니다."
      });
    }

    // 201 - 생성 성공
    const created = await prisma.domainList.create({ data: { ... } });
    return res.status(201).json({
      success: true,
      data: created,
      msg: "생성 성공"
    });

  } catch (error) {
    // 500 - 서버 오류
    console.error("❌ 생성 실패:", error);
    return res.status(500).json({
      success: false,
      data: null,
      msg: `생성 실패: ${error.message}`
    });
  }
};
```

## 컨트롤러 패턴

```javascript
// modules/{feature}/controllers/{feature}Controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 목록 조회
const getAll = async (req, res) => {
  try {
    const items = await prisma.model.findMany({
      orderBy: { createAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: items,
      msg: "조회 성공"
    });
  } catch (error) {
    console.error("조회 실패:", error);
    return res.status(500).json({
      success: false,
      data: null,
      msg: `조회 실패: ${error.message}`
    });
  }
};

// 단일 조회
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.model.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        data: null,
        msg: "리소스를 찾을 수 없습니다."
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
      msg: "조회 성공"
    });
  } catch (error) {
    console.error("조회 실패:", error);
    return res.status(500).json({
      success: false,
      data: null,
      msg: `조회 실패: ${error.message}`
    });
  }
};

// 생성
const create = async (req, res) => {
  try {
    const { field1, field2 } = req.body;

    // 유효성 검사
    if (!field1) {
      return res.status(400).json({
        success: false,
        data: null,
        msg: "field1은 필수입니다."
      });
    }

    // 중복 체크
    const existing = await prisma.model.findUnique({
      where: { field1 }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        data: null,
        msg: "이미 존재하는 항목입니다."
      });
    }

    const created = await prisma.model.create({
      data: {
        field1,
        field2,
        createAt: new Date(),
        userId: req.userId
      }
    });

    return res.status(201).json({
      success: true,
      data: created,
      msg: "생성 성공"
    });
  } catch (error) {
    console.error("생성 실패:", error);
    return res.status(500).json({
      success: false,
      data: null,
      msg: `생성 실패: ${error.message}`
    });
  }
};

module.exports = { getAll, getById, create };
```

## 라우트 패턴

```javascript
// modules/{feature}/routes.js
const express = require("express");
const router = express.Router();
const controller = require("./controllers/featureController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", authMiddleware, controller.create);
router.put("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.delete);

module.exports = router;
```

## 인증 미들웨어

```javascript
// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      msg: "인증 토큰이 없습니다."
    });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      msg: "유효하지 않은 토큰입니다."
    });
  }
};

module.exports = authMiddleware;
```

## Prisma 사용

### 기본 쿼리
```javascript
// 조회
const item = await prisma.model.findUnique({ where: { id } });
const items = await prisma.model.findMany({ orderBy: { createAt: 'desc' } });

// 생성
const created = await prisma.model.create({ data: { ... } });

// 수정
const updated = await prisma.model.update({
  where: { id },
  data: { ... }
});

// 삭제
const deleted = await prisma.model.delete({ where: { id } });
```

### 시간 처리 (중요)

Prisma는 UTC를 강제하므로 한국 시간(KST) 맞추려면 **+9시간** 처리 필요.
DB에는 항상 올바른 한국 시간이 저장되어야 함.

```javascript
// 한국 시간 생성 함수
const getKoreanTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  return now;
};

// 생성 시 - 한국 시간으로 저장
const created = await prisma.model.create({
  data: {
    ...data,
    createAt: getKoreanTime(),
    updateAt: getKoreanTime()
  }
});

// 수정 시 - 한국 시간으로 저장
const updated = await prisma.model.update({
  where: { id },
  data: {
    ...data,
    updateAt: getKoreanTime()
  }
});
```

### Raw SQL (복잡한 쿼리)
```javascript
// 날짜 포맷팅 - DB에 이미 한국 시간이 저장되어 있음
const results = await prisma.$queryRaw`
  SELECT
    id,
    DATE_FORMAT(createAt, '%Y-%m-%d %H:%i') as createdAt
  FROM model
  ORDER BY createAt DESC
`;

// 동적 쿼리
await prisma.$executeRawUnsafe(query, ...params);
```

## S3 업로드 패턴

```javascript
const { uploadToS3, deleteFromS3 } = require("../../utils/s3Upload");

// 업로드
const s3Url = await uploadToS3(
  file.buffer,        // 파일 버퍼
  file.originalname,  // 원본 파일명
  adNumber,          // 식별자
  'imgUrl1'          // 이미지 키
);

// 삭제 (에러 무시)
deleteFromS3(existingUrl).catch(err => {
  console.error(`S3 삭제 실패:`, err);
});
```

## 파일 업로드 (Multer)

```javascript
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('허용되지 않는 파일 형식입니다.'), false);
    }
  }
});

// 라우트에서 사용
router.post("/", upload.fields([
  { name: 'imgUrl1', maxCount: 1 },
  { name: 'imgUrl2', maxCount: 1 },
]), controller.create);
```

## 캐싱 패턴

```javascript
let cache = {};
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5분

async function getCachedData() {
  const now = Date.now();

  if (cache && (now - cacheTime) < CACHE_TTL) {
    return cache;
  }

  // 데이터 로드
  const data = await loadData();

  cache = data;
  cacheTime = now;

  return data;
}
```

## ID 생성 패턴

```javascript
async function generateNextId() {
  const latest = await prisma.model.findFirst({
    orderBy: { id: 'desc' }
  });

  if (!latest) {
    return 'A001';
  }

  const num = parseInt(latest.id.replace('A', ''), 10);
  return `A${String(num + 1).padStart(3, '0')}`;
}
```

## 로깅 규칙

```javascript
// 성공
console.log("✅ 작업 완료:", result);

// 정보
console.log("🔍 조회:", params);

// 경고
console.warn("⚠️ 경고:", message);

// 에러
console.error("❌ 에러:", error);
```

## 환경 변수

```bash
DATABASE_URL="mysql://user:pass@host/db"
JWT_SECRET="secret-key"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-northeast-2"
S3_BUCKET_NAME="bucket-name"
CLOUDFRONT_DOMAIN="xxx.cloudfront.net"
```

## 코드 수정 원칙

### 기능 보존 (최우선)
- **구조 수정 요청 시에도 기능은 절대 수정하지 않음**
- 리팩토링과 기능 변경을 동시에 하지 않음
- 기능 변경이 필요하면 반드시 사전에 확인 요청

```
// 예시: "컨트롤러 구조 정리해줘" 요청 시
✅ 파일 분리, 코드 정리 → OK
❌ 기존 API 동작 변경 → 절대 금지
```

### 수정 범위 준수
- 요청받은 범위만 수정
- "ついでに(ついでに)" 식의 추가 수정 금지
- 관련 없는 코드 건드리지 않기

## 체크리스트

- [ ] **구조 수정 시에도 기능 절대 보존**
- [ ] 응답은 `{ success, data, msg }` 형식
- [ ] msg는 "{작업 대상} {동작} 성공/실패" 형식
- [ ] 시간은 getKoreanTime()으로 +9시간 처리
- [ ] 에러 메시지는 한국어로
- [ ] try-catch로 모든 비동기 작업 감싸기
- [ ] 유효성 검사는 컨트롤러 시작 부분에서
- [ ] 인증 필요한 라우트에 authMiddleware 적용
- [ ] console.error로 에러 로깅
- [ ] S3 삭제 실패는 무시 (비차단)
