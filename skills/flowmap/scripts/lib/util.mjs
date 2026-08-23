import fs from 'fs'
import path from 'path'

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next',
  '.vite', 'public', 'assets', '.venv', '__pycache__', 'uploads',
])

// 디렉토리를 재귀 순회하며 확장자가 맞는 파일 경로를 모은다
export function walk(dir, exts = ['.js', '.jsx', '.ts', '.tsx'], out = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full, exts, out)
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full)
    }
  }
  return out
}

export function read(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

// 주석 안의 코드가 오탐으로 잡히는 것을 막는다.
// wecom jobApi.js처럼 블록 주석 안에 살아있는 apiClient 호출이 들어있는 사례가 실재한다.
// 줄 번호를 보존해야 하므로 개행은 남기고 나머지만 공백으로 치환한다.
// `/['"]/g` 같은 정규식 리터럴 안의 따옴표를 문자열 시작으로 오해하면
// 그 뒤 코드가 통째로 문자열로 먹혀 라우트를 놓친다(boothflow 실측 25건).
// `/` 가 나눗셈인지 정규식 시작인지는 직전 토큰으로 판별한다.
const REGEX_PRECEDERS = new Set(['=', '(', ',', '[', ':', ';', '!', '&', '|', '?', '{', '}', '+', '-', '*', '%', '~', '^', '<', '>'])
const REGEX_KEYWORDS = /\b(return|typeof|instanceof|case|in|of|do|else|yield|await|new|delete|void)$/

function startsRegex(emitted) {
  const trimmed = emitted.replace(/\s+$/, '')
  if (!trimmed) return true
  const last = trimmed[trimmed.length - 1]
  if (REGEX_PRECEDERS.has(last)) return true
  return REGEX_KEYWORDS.test(trimmed)
}

export function stripComments(code) {
  let out = ''
  let i = 0
  let mode = 'code' // code | line | block | single | double | template | regex
  while (i < code.length) {
    const c = code[i]
    const next = code[i + 1]
    if (mode === 'code') {
      if (c === '/' && next === '/') { mode = 'line'; out += '  '; i += 2; continue }
      if (c === '/' && next === '*') { mode = 'block'; out += '  '; i += 2; continue }
      if (c === '/' && startsRegex(out)) { mode = 'regex'; out += c; i++; continue }
      if (c === "'") mode = 'single'
      else if (c === '"') mode = 'double'
      else if (c === '`') mode = 'template'
      out += c; i++; continue
    }
    if (mode === 'regex') {
      // 문자 클래스 안의 `/` 는 종료가 아니지만, 여기서는 종료로 봐도
      // 그 뒤가 코드 모드로 복귀할 뿐이라 따옴표 오인만 막으면 충분하다
      if (c === '\\') { out += c + (next ?? ''); i += 2; continue }
      if (c === '/' || c === '\n') mode = 'code'
      out += c; i++; continue
    }
    if (mode === 'line') {
      if (c === '\n') { mode = 'code'; out += c } else out += ' '
      i++; continue
    }
    if (mode === 'block') {
      if (c === '*' && next === '/') { mode = 'code'; out += '  '; i += 2; continue }
      out += c === '\n' ? c : ' '
      i++; continue
    }
    // 문자열/템플릿 리터럴 내부는 그대로 둔다
    if (c === '\\') { out += c + (next ?? ''); i += 2; continue }
    if ((mode === 'single' && c === "'") || (mode === 'double' && c === '"') || (mode === 'template' && c === '`')) {
      mode = 'code'
    }
    out += c; i++
  }
  return out
}

export function lineOf(code, index) {
  return code.slice(0, index).split('\n').length
}

// `/jobs/${uuid}` → `/jobs/:param`, '/jobs/:id' → '/jobs/:param'
// 프론트 호출과 백엔드 정의를 같은 모양으로 만들어 비교하기 위한 정규화
export function normalizePath(p) {
  return (
    '/' +
    p
      .replace(/\$\{[^}]*\}/g, ':param')
      .replace(/:[A-Za-z0-9_]+/g, ':param')
      .split('/')
      .filter(Boolean)
      .join('/')
  )
}

export function joinPath(prefix, sub) {
  const a = (prefix || '').replace(/\/+$/, '')
  const b = (sub || '').replace(/^\/+/, '')
  const joined = `${a}/${b}`.replace(/\/+/g, '/')
  return joined === '/' ? '/' : joined.replace(/\/$/, '') || '/'
}

export function rel(root, file) {
  return path.relative(root, file).split(path.sep).join('/')
}

// 여러 개의 export 함수가 든 파일을 { 함수명: 본문 } 으로 쪼갠다.
// AST 없이 다음 export 선언 직전까지를 본문으로 본다. 완벽하진 않지만
// 호출 관계 추적 용도로는 충분하다.
export function splitFunctions(code) {
  const re = /export\s+(?:const|async\s+function|function)\s+([A-Za-z0-9_$]+)/g
  const marks = []
  let m
  while ((m = re.exec(code))) marks.push({ name: m[1], start: m.index })
  const result = {}
  marks.forEach((mark, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1].start : code.length
    result[mark.name] = code.slice(mark.start, end)
  })
  return result
}
