import { walk, read, stripComments } from './util.mjs'

// 필드명 → 샘플값. 실무 필드 대부분은 이 사전으로 끝나고 LLM이 필요 없다.
const RULES = [
  [/^(id|.*_id)$/i, () => 1],
  [/uuid|guid/i, () => '3f2b9c10-8a4d-4e91-b7c2-1d5e6f0a8b34'],
  [/email/i, () => 'user@example.com'],
  [/password|passwd|pwd/i, () => '********'],
  [/(^|_)(url|link|href)$|url$/i, () => 'https://example.com/path'],
  [/image|thumbnail|photo|avatar|banner/i, () => 'https://example.com/image.jpg'],
  [/phone|mobile|tel/i, () => '010-1234-5678'],
  [/(^|_)(at|date)$|_at$|date$|Date$/i, () => '2026-08-22T09:00:00Z'],
  [/^(is|has|use|can|show|enable)[A-Z_]/, () => true],
  [/^(is_|has_|use_|can_)/i, () => true],
  [/price|amount|fee|cost|salary|balance|point/i, () => 10000],
  [/count|qty|quantity|total|num|order$|index|page|limit|offset/i, () => 10],
  [/rating|score|avg/i, () => 4.5],
  [/status|state/i, () => 'active'],
  [/type|kind|category|genre/i, () => 'default'],
  [/token|jwt|secret|key/i, () => '<token>'],
  [/name|title|nickname/i, () => '샘플 제목'],
  [/content|body|description|desc|memo|comment|text/i, () => '샘플 내용입니다.'],
  [/address|addr/i, () => '서울시 강남구 테헤란로 1'],
  [/color/i, () => '#4a6cf7'],
  [/file|path/i, () => 'sample.pdf'],
]

export function sampleFor(field, sqlType) {
  if (sqlType) {
    const t = sqlType.toLowerCase()
    if (/^(tinyint\(1\)|boolean|bool)/.test(t)) return true
    if (/int|decimal|float|double|numeric/.test(t)) {
      for (const [re, fn] of RULES) if (re.test(field)) { const v = fn(); if (typeof v === 'number') return v }
      return 1
    }
    if (/date|time/.test(t)) return '2026-08-22T09:00:00Z'
    if (/json/.test(t)) return {}
  }
  for (const [re, fn] of RULES) if (re.test(field)) return fn()
  return '샘플값'
}

export function buildSample(fields, columnTypes = {}) {
  const out = {}
  for (const f of fields) out[f] = sampleFor(f, columnTypes[f])
  return out
}

// z.object({ title: z.string(), price: z.number().optional() }) 에서 필드명을 뽑는다
export function scanZodSchemas(root) {
  const schemas = {}
  for (const file of walk(root)) {
    const code = stripComments(read(file))
    if (!/\bz\.object\s*\(/.test(code)) continue
    const declRe = /(?:export\s+)?const\s+([A-Za-z0-9_$]+)\s*=\s*([\s\S]{0,2500}?z\.object\s*\(\s*\{)/g
    let m
    while ((m = declRe.exec(code))) {
      const name = m[1]
      const start = m.index + m[0].length
      // 중괄호 균형을 맞춰 z.object 본문 끝을 찾는다
      let depth = 1
      let i = start
      while (i < code.length && depth > 0) {
        if (code[i] === '{') depth++
        else if (code[i] === '}') depth--
        i++
      }
      const body = code.slice(start, i - 1)
      const fields = []
      for (const f of body.matchAll(/(?:^|[,{\s])([A-Za-z0-9_$]+)\s*:\s*z\./g)) {
        if (!fields.includes(f[1])) fields.push(f[1])
      }
      if (fields.length) schemas[name] = fields
    }
  }
  return schemas
}

// CREATE TABLE 문에서 컬럼명과 타입을 뽑는다 (마이그레이션 .sql / schema.sql)
export function scanSqlTables(root) {
  const tables = {}
  for (const file of walk(root, ['.sql'])) {
    const code = read(file)
    const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?([A-Za-z0-9_]+)[`"]?\s*\(([\s\S]*?)\n\s*\)/gi
    let m
    while ((m = re.exec(code))) {
      const name = m[1].toLowerCase()
      const columns = []
      for (const line of m[2].split('\n')) {
        const c = line.trim().match(/^[`"]?([a-z][a-z0-9_]*)[`"]?\s+([A-Za-z]+[^\s,]*)/i)
        if (!c) continue
        if (/^(primary|unique|key|index|constraint|foreign)$/i.test(c[1])) continue
        columns.push({ name: c[1], type: c[2] })
      }
      if (columns.length) tables[name] = columns
    }
  }
  return tables
}
