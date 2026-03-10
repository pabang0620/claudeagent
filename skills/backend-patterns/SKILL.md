---
name: backend-patterns
description: Node.js/Express 백엔드 아키텍처 패턴, API 설계, 데이터베이스 최적화, Prisma ORM 활용법
---

# 백엔드 개발 패턴

확장 가능한 서버 사이드 애플리케이션을 위한 아키텍처 패턴 및 베스트 프랙티스

## API 설계 패턴

### RESTful API 구조

```javascript
// ✅ 리소스 기반 URL 설계
GET    /api/markets                 // 목록 조회
GET    /api/markets/:id             // 단일 조회
POST   /api/markets                 // 생성
PUT    /api/markets/:id             // 전체 수정
PATCH  /api/markets/:id             // 부분 수정
DELETE /api/markets/:id             // 삭제

// ✅ 쿼리 파라미터로 필터링, 정렬, 페이지네이션
GET /api/markets?status=active&sort=volume&limit=20&offset=0
```

### Repository 패턴 (Prisma)

```javascript
// 데이터 접근 로직 추상화
class MarketRepository {
  async findAll(filters = {}) {
    const { status, limit = 10, offset = 0 } = filters;

    const where = status ? { status } : {};

    return await prisma.market.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createAt: 'desc' }
    });
  }

  async findById(id) {
    return await prisma.market.findUnique({
      where: { id }
    });
  }

  async create(data) {
    return await prisma.market.create({
      data: {
        ...data,
        createAt: getKoreanTime()
      }
    });
  }

  async update(id, data) {
    return await prisma.market.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return await prisma.market.delete({
      where: { id }
    });
  }
}

module.exports = MarketRepository;
```

### Service Layer 패턴

```javascript
// 비즈니스 로직을 데이터 접근과 분리
class MarketService {
  constructor(marketRepo) {
    this.marketRepo = marketRepo;
  }

  async searchMarkets(query, limit = 10) {
    // 비즈니스 로직
    const embedding = await generateEmbedding(query);
    const results = await this.vectorSearch(embedding, limit);

    // 전체 데이터 조회
    const marketIds = results.map(r => r.id);
    const markets = await this.marketRepo.findByIds(marketIds);

    // 유사도 점수로 정렬
    return markets.sort((a, b) => {
      const scoreA = results.find(r => r.id === a.id)?.score || 0;
      const scoreB = results.find(r => r.id === b.id)?.score || 0;
      return scoreB - scoreA;
    });
  }

  async vectorSearch(embedding, limit) {
    // 벡터 검색 구현
  }
}

module.exports = MarketService;
```

### 미들웨어 패턴 (Express)

```javascript
// 요청/응답 처리 파이프라인
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      msg: '인증 토큰이 필요합니다.'
    });
  }

  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      msg: '유효하지 않은 토큰입니다.'
    });
  }
};

// 사용법
router.get('/protected', authMiddleware, async (req, res) => {
  // req.user 사용 가능
});

module.exports = authMiddleware;
```

## 데이터베이스 패턴

### 쿼리 최적화 (Prisma)

```javascript
// ✅ 좋은 예: 필요한 컬럼만 선택
const markets = await prisma.market.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    volume: true
  },
  where: { status: 'active' },
  orderBy: { volume: 'desc' },
  take: 10
});

// ❌ 나쁜 예: 모든 컬럼 선택
const markets = await prisma.market.findMany();
```

### N+1 쿼리 방지

```javascript
// ❌ 나쁜 예: N+1 쿼리 문제
const markets = await prisma.market.findMany();
for (const market of markets) {
  market.creator = await prisma.user.findUnique({
    where: { id: market.creatorId }  // N개의 쿼리
  });
}

// ✅ 좋은 예: include로 한 번에 조회
const markets = await prisma.market.findMany({
  include: {
    creator: true  // 1개의 쿼리로 JOIN
  }
});

// ✅ 좋은 예: 배치 조회
const markets = await prisma.market.findMany();
const creatorIds = markets.map(m => m.creatorId);
const creators = await prisma.user.findMany({
  where: { id: { in: creatorIds } }
});

const creatorMap = new Map(creators.map(c => [c.id, c]));
markets.forEach(market => {
  market.creator = creatorMap.get(market.creatorId);
});
```

### 트랜잭션 패턴 (Prisma)

```javascript
async function createMarketWithPosition(marketData, positionData) {
  // Prisma 트랜잭션 사용
  return await prisma.$transaction(async (tx) => {
    // 마켓 생성
    const market = await tx.market.create({
      data: marketData
    });

    // 포지션 생성
    const position = await tx.position.create({
      data: {
        ...positionData,
        marketId: market.id
      }
    });

    return { market, position };
  });
}

// 에러 시 자동 롤백
```

## 캐싱 전략

### Redis 캐싱 계층

```javascript
class CachedMarketRepository {
  constructor(baseRepo, redis) {
    this.baseRepo = baseRepo;
    this.redis = redis;
  }

  async findById(id) {
    // 캐시 먼저 확인
    const cacheKey = `market:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // 캐시 미스 - DB에서 조회
    const market = await this.baseRepo.findById(id);

    if (market) {
      // 5분간 캐시
      await this.redis.setex(cacheKey, 300, JSON.stringify(market));
    }

    return market;
  }

  async invalidateCache(id) {
    await this.redis.del(`market:${id}`);
  }
}
```

### Cache-Aside 패턴

```javascript
async function getMarketWithCache(id) {
  const cacheKey = `market:${id}`;

  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 캐시 미스 - DB 조회
  const market = await prisma.market.findUnique({
    where: { id }
  });

  if (!market) {
    throw new Error('마켓을 찾을 수 없습니다.');
  }

  // 캐시 업데이트
  await redis.setex(cacheKey, 300, JSON.stringify(market));

  return market;
}
```

## 에러 처리 패턴

### 중앙 집중식 에러 핸들러

```javascript
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      data: null,
      msg: error.message
    });
  }

  // 예상치 못한 에러
  console.error('❌ 예상치 못한 에러:', error);

  return res.status(500).json({
    success: false,
    data: null,
    msg: '서버 내부 오류가 발생했습니다.'
  });
};

// Express 앱에 등록
app.use(errorHandler);

module.exports = { ApiError, errorHandler };
```

### 재시도 with 지수 백오프

```javascript
async function fetchWithRetry(fn, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries - 1) {
        // 지수 백오프: 1초, 2초, 4초
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// 사용법
const data = await fetchWithRetry(() => fetchFromAPI());
```

## 인증 & 권한 관리

### JWT 토큰 검증

```javascript
const jwt = require('jsonwebtoken');

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    throw new ApiError(401, '유효하지 않은 토큰입니다.');
  }
}

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, '인증 토큰이 필요합니다.');
  }

  const user = verifyToken(token);
  req.user = user;
  next();
}

// API 라우트에서 사용
router.get('/protected', requireAuth, async (req, res) => {
  const data = await getDataForUser(req.user.userId);

  res.json({
    success: true,
    data,
    msg: '데이터 조회 성공'
  });
});
```

### 역할 기반 접근 제어 (RBAC)

```javascript
const rolePermissions = {
  admin: ['read', 'write', 'delete', 'admin'],
  moderator: ['read', 'write', 'delete'],
  user: ['read', 'write']
};

function hasPermission(user, permission) {
  return rolePermissions[user.role]?.includes(permission) || false;
}

function requirePermission(permission) {
  return async (req, res, next) => {
    const user = req.user;

    if (!hasPermission(user, permission)) {
      throw new ApiError(403, '권한이 부족합니다.');
    }

    next();
  };
}

// 사용법
router.delete('/markets/:id',
  requireAuth,
  requirePermission('delete'),
  async (req, res) => {
    // 삭제 로직
  }
);
```

## Rate Limiting

### 인메모리 Rate Limiter

```javascript
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  async checkLimit(identifier, maxRequests, windowMs) {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // 윈도우 밖의 요청 제거
    const recentRequests = requests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return false;  // 제한 초과
    }

    // 현재 요청 추가
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }
}

const limiter = new RateLimiter();

// 미들웨어로 사용
const rateLimitMiddleware = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';

  const allowed = await limiter.checkLimit(ip, 100, 60000);  // 100 req/min

  if (!allowed) {
    return res.status(429).json({
      success: false,
      data: null,
      msg: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
    });
  }

  next();
};
```

## 백그라운드 작업 & 큐

### 간단한 큐 패턴

```javascript
class JobQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(job) {
    this.queue.push(job);

    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();

      try {
        await this.execute(job);
      } catch (error) {
        console.error('❌ 작업 실패:', error);
      }
    }

    this.processing = false;
  }

  async execute(job) {
    // 작업 실행 로직
  }
}

// 마켓 인덱싱 큐
const indexQueue = new JobQueue();

// API에서 사용
router.post('/markets', async (req, res) => {
  const market = await createMarket(req.body);

  // 블로킹 없이 큐에 추가
  await indexQueue.add({ marketId: market.id });

  res.status(201).json({
    success: true,
    data: market,
    msg: '마켓 생성 성공 (인덱싱 예약됨)'
  });
});
```

## 로깅 & 모니터링

### 구조화된 로깅

```javascript
class Logger {
  log(level, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    };

    console.log(JSON.stringify(entry));
  }

  info(message, context) {
    this.log('info', message, context);
  }

  warn(message, context) {
    this.log('warn', message, context);
  }

  error(message, error, context) {
    this.log('error', message, {
      ...context,
      error: error.message,
      stack: error.stack
    });
  }
}

const logger = new Logger();

// 사용법
router.get('/markets', async (req, res) => {
  const requestId = crypto.randomUUID();

  logger.info('마켓 목록 조회', {
    requestId,
    method: 'GET',
    path: '/api/markets'
  });

  try {
    const markets = await fetchMarkets();

    res.json({
      success: true,
      data: markets,
      msg: '마켓 목록 조회 성공'
    });
  } catch (error) {
    logger.error('마켓 조회 실패', error, { requestId });

    res.status(500).json({
      success: false,
      data: null,
      msg: '마켓 조회 중 오류가 발생했습니다.'
    });
  }
});
```

## 한국 시간 처리 (Prisma UTC 문제 해결)

```javascript
// Prisma는 UTC로 저장하므로 +9시간 필요
const getKoreanTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  return now;
};

// 사용 예시
const market = await prisma.market.create({
  data: {
    name: '테스트 마켓',
    createAt: getKoreanTime()  // 한국 시간으로 저장
  }
});
```

---

**핵심**: 백엔드 패턴은 확장 가능하고 유지보수 가능한 서버 애플리케이션을 가능하게 합니다. 복잡도 수준에 맞는 패턴을 선택하세요.
