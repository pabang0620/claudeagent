---
name: security-review
description: 인증, 사용자 입력 처리, 시크릿 관리, API 엔드포인트, 민감 기능 구현 시 보안 체크리스트
---

# 보안 리뷰 스킬

모든 코드가 보안 베스트 프랙티스를 따르고 잠재적 취약점을 식별합니다.

## 언제 활성화하나

- 인증 또는 권한 구현 시
- 사용자 입력 또는 파일 업로드 처리 시
- 새 API 엔드포인트 생성 시
- 시크릿 또는 자격 증명 작업 시
- 결제 기능 구현 시
- 민감 데이터 저장 또는 전송 시
- 타사 API 통합 시

## 보안 체크리스트

### 1. 시크릿 관리

#### ❌ 절대 하지 말 것
```javascript
const apiKey = "sk-proj-xxxxx"  // 하드코딩된 시크릿
const dbPassword = "password123" // 소스 코드에 포함
```

#### ✅ 항상 이렇게
```javascript
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;

// 시크릿 존재 확인
if (!apiKey) {
  throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
}
```

#### 검증 단계
- [ ] 하드코딩된 API 키, 토큰, 비밀번호 없음
- [ ] 모든 시크릿은 환경 변수로
- [ ] `.env.local`은 .gitignore에 포함
- [ ] Git 히스토리에 시크릿 없음
- [ ] 프로덕션 시크릿은 호스팅 플랫폼에 (Vercel, Railway)

### 2. 입력 유효성 검사

#### 항상 사용자 입력 검증
```javascript
const { z } = require('zod');

// 유효성 검사 스키마 정의
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
});

// 처리 전 검증
async function createUser(input) {
  try {
    const validated = CreateUserSchema.parse(input);
    return await prisma.user.create({ data: validated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    throw error;
  }
}
```

#### 파일 업로드 검증
```javascript
function validateFileUpload(file) {
  // 크기 확인 (5MB 최대)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('파일이 너무 큽니다 (최대 5MB)');
  }

  // 타입 확인
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('허용되지 않는 파일 형식입니다');
  }

  // 확장자 확인
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('허용되지 않는 파일 확장자입니다');
  }

  return true;
}
```

#### 검증 단계
- [ ] 모든 사용자 입력은 스키마로 검증
- [ ] 파일 업로드 제한 (크기, 타입, 확장자)
- [ ] 쿼리에 사용자 입력 직접 사용 금지
- [ ] 화이트리스트 검증 (블랙리스트 아님)
- [ ] 에러 메시지에 민감 정보 누출 방지

### 3. SQL 인젝션 방지

#### ❌ 절대 SQL 문자열 연결 금지
```javascript
// 위험 - SQL 인젝션 취약점
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
await db.query(query);
```

#### ✅ 항상 파라미터화된 쿼리 사용
```javascript
// 안전 - Prisma 사용
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// 또는 Raw SQL with 파라미터
await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`;
```

#### 검증 단계
- [ ] 모든 데이터베이스 쿼리는 파라미터화
- [ ] SQL에 문자열 연결 없음
- [ ] ORM/쿼리 빌더 올바르게 사용
- [ ] Prisma 쿼리 제대로 새니타이징

### 4. 인증 & 권한 관리

#### JWT 토큰 처리
```javascript
// ❌ 잘못됨: localStorage (XSS에 취약)
localStorage.setItem('token', token);

// ✅ 올바름: httpOnly 쿠키
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`);
```

#### 권한 검사
```javascript
async function deleteUser(userId, requesterId) {
  // 항상 권한 먼저 확인
  const requester = await prisma.user.findUnique({
    where: { id: requesterId }
  });

  if (requester.role !== 'admin') {
    throw new Error('권한이 부족합니다');
  }

  // 삭제 진행
  await prisma.user.delete({ where: { id: userId } });
}
```

#### Prisma의 경우
```javascript
// 미들웨어로 권한 확인
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      msg: '인증 토큰이 필요합니다'
    });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: '유효하지 않은 토큰입니다'
    });
  }
};
```

#### 검증 단계
- [ ] 토큰은 httpOnly 쿠키에 저장 (localStorage 아님)
- [ ] 민감한 작업 전 권한 검사
- [ ] 역할 기반 접근 제어 구현
- [ ] 세션 관리 보안

### 5. XSS 방지

#### HTML 새니타이징
```javascript
import DOMPurify from 'isomorphic-dompurify';

// 항상 사용자 제공 HTML 새니타이징
function renderUserContent(html) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

#### Content Security Policy
```javascript
// Express 설정
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.example.com;
  `.replace(/\s{2,}/g, ' ').trim());
  next();
});
```

#### 검증 단계
- [ ] 사용자 제공 HTML 새니타이징
- [ ] CSP 헤더 설정
- [ ] 검증되지 않은 동적 콘텐츠 렌더링 금지
- [ ] React의 내장 XSS 방지 활용

### 6. CSRF 방지

#### CSRF 토큰
```javascript
const csrf = require('csurf');

// CSRF 보호 활성화
app.use(csrf({ cookie: true }));

// 라우트에서 검증
app.post('/api/markets', (req, res) => {
  // CSRF 토큰 자동 검증됨
  // 요청 처리
});
```

#### SameSite 쿠키
```javascript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`);
```

#### 검증 단계
- [ ] 상태 변경 작업에 CSRF 토큰
- [ ] 모든 쿠키에 SameSite=Strict
- [ ] Double-submit 쿠키 패턴 구현

### 7. Rate Limiting

#### API Rate Limiting (Express)
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 윈도우당 최대 100개 요청
  message: '요청이 너무 많습니다'
});

// 라우트에 적용
app.use('/api/', limiter);
```

#### 비용이 큰 작업
```javascript
// 검색에 더 엄격한 제한
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 분당 10개 요청
  message: '검색 요청이 너무 많습니다'
});

app.use('/api/search', searchLimiter);
```

### 8. 민감 데이터 노출

#### 로깅
```javascript
// ❌ 잘못됨: 민감 데이터 로깅
console.log('사용자 로그인:', { email, password });
console.log('결제:', { cardNumber, cvv });

// ✅ 올바름: 민감 데이터 삭제
console.log('사용자 로그인:', { email, userId });
console.log('결제:', { last4: card.last4, userId });
```

#### 에러 메시지
```javascript
// ❌ 잘못됨: 내부 세부 정보 노출
catch (error) {
  return res.json({
    error: error.message,
    stack: error.stack
  });
}

// ✅ 올바름: 일반적인 에러 메시지
catch (error) {
  console.error('내부 에러:', error);
  return res.status(500).json({
    success: false,
    msg: '오류가 발생했습니다. 다시 시도해주세요.'
  });
}
```

## 배포 전 보안 체크리스트

프로덕션 배포 전 반드시 확인:

- [ ] **시크릿**: 하드코딩 없음, 모두 환경 변수
- [ ] **입력 검증**: 모든 사용자 입력 검증
- [ ] **SQL 인젝션**: 모든 쿼리 파라미터화
- [ ] **XSS**: 사용자 콘텐츠 새니타이징
- [ ] **CSRF**: 보호 활성화
- [ ] **인증**: 적절한 토큰 처리
- [ ] **권한**: 역할 검사 적용
- [ ] **Rate Limiting**: 모든 엔드포인트에 활성화
- [ ] **HTTPS**: 프로덕션에서 강제
- [ ] **보안 헤더**: CSP, X-Frame-Options 설정
- [ ] **에러 처리**: 민감 데이터 미포함
- [ ] **로깅**: 민감 데이터 미로깅
- [ ] **의존성**: 최신, 취약점 없음
- [ ] **CORS**: 적절하게 설정
- [ ] **파일 업로드**: 검증 (크기, 타입)

---

**핵심**: 보안은 선택 사항이 아닙니다. 하나의 취약점이 전체 플랫폼을 위험에 빠뜨릴 수 있습니다. 의심스러울 때는 신중하게 접근하세요.
