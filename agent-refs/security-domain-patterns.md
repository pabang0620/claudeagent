# security-reviewer 참조: 도메인 한정 고위험 패턴

> `.claude/agents/security-reviewer.md` 의 참조 파일. 프로젝트에 WebSocket/SSE, 결제 웹훅, 금액성 자원 변경이 **실제로 있을 때만** 읽는다.

### WebSocket/SSE 인증 패턴 (고위험)

```javascript
// [금지] 치명적: WebSocket 업그레이드 인증 누락
const wss = new WebSocketServer({ server })
wss.on('connection', (ws) => { /* 토큰 검증 없음 */ })

// [완료] 올바름: 업그레이드 이벤트에서 토큰 검증
server.on('upgrade', (req, socket, head) => {
  const token = req.headers['sec-websocket-protocol'] || parseToken(req.url)
  if (!verifyToken(token)) return socket.destroy()
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
})

// [금지] 높음: SSE 채널에 userId 격리 없음
res.write(`data: ${JSON.stringify(allUserEvents)}\n\n`)

// [완료] 올바름: 요청 사용자 ID 기준 필터링
const userEvents = allUserEvents.filter(e => e.userId === req.user.id)
res.write(`data: ${JSON.stringify(userEvents)}\n\n`)

// Origin 검증 - CSRF-over-WebSocket 방어
const ALLOWED_ORIGINS = ['https://example.com']
server.on('upgrade', (req, socket, head) => {
  if (!ALLOWED_ORIGINS.includes(req.headers.origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
    socket.destroy(); return
  }
  // 이후 토큰 검증 진행
})
```

WebSocket/SSE grep:
```bash
grep -rEn "WebSocketServer|new WebSocket|io\.on|socket\.on" \
  --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
  --exclude-dir=node_modules .
grep -rn "ws://" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" \
  --exclude-dir=node_modules .
```

### 웹훅 서명 검증 패턴 (결제 도메인)

```javascript
// [금지] 치명적: 웹훅 서명 검증 없음 (위조 요청 처리 가능)
app.post('/webhook', express.json(), (req, res) => {
  processPayment(req.body)
})

// [완료] 올바름: HMAC 서명 검증 (Stripe SDK 예시. 국내 PG(KCP 등)는 각사 규격의 서명·해시 검증 함수로 같은 자리에서 검증한다. raw body를 먼저 파싱하면 서명이 깨진다)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  processEvent(event)
  res.json({ received: true })
})
```


---

### 금융 작업에서 경쟁 조건 (치명적)

```javascript
// [금지] 치명적: 잔액 확인에서 경쟁 조건
const balance = await getBalance(userId)
if (balance >= amount) {
  await withdraw(userId, amount) // 다른 요청이 병렬로 출금할 수 있음!
}

// [완료] mysql2 raw SQL 패턴 (wecom·speetalk·cosmic-renew)
const conn = await pool.getConnection()
try {
  await conn.beginTransaction()
  const [rows] = await conn.execute(
    'SELECT amount FROM balances WHERE user_id = ? FOR UPDATE',
    [userId]
  )
  if (!rows[0] || rows[0].amount < amount) throw new Error('잔액 부족')
  await conn.execute(
    'UPDATE balances SET amount = amount - ? WHERE user_id = ?',
    [amount, userId]
  )
  await conn.commit()
} catch (err) {
  await conn.rollback()
  throw err
} finally {
  conn.release()
}

// [완료] pg raw SQL 패턴 (modadam)
const client = await pool.connect()
try {
  await client.query('BEGIN')
  const { rows } = await client.query(
    'SELECT amount FROM balances WHERE user_id = $1 FOR UPDATE',
    [userId]
  )
  if (rows[0].amount < amount) throw new Error('잔액 부족')
  await client.query(
    'UPDATE balances SET amount = amount - $1 WHERE user_id = $2',
    [amount, userId]
  )
  await client.query('COMMIT')
} catch (err) {
  await client.query('ROLLBACK')
  throw err
} finally {
  client.release()
}
```

## 동시성 이슈

```bash
# Race condition 위험 패턴 (check-then-act)
grep -rEn "await.*(get|check|find).*(balance|amount|stock|inventory)" \
  --include="*.js" --include="*.ts" \
  --exclude-dir=node_modules .
# 원자적 트랜잭션 미사용 확인 (잔액 확인 후 출금 패턴)
grep -rEn "if\s*\(.*balance|if\s*\(.*amount" \
  --include="*.js" --include="*.ts" \
  --exclude-dir=node_modules .
```
