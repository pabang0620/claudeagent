#!/usr/bin/env node
/** 렌더 전 정적 검사 (precheck).
 *
 *  에피소드 폴더를 받아 그 화의 `src/` 를 TypeScript AST 로 읽고, 렌더해 보기 전에
 *  코드만 봐도 알 수 있는 결함을 잡는다. 지금까지 렌더 뒤에 프레임을 눈으로 훑어서
 *  찾아내던 반복 결함들(로케일 누출·깜빡임·줄바꿈 깨짐·포맷 불일치)을 자동화한 것이다.
 *
 *  사용법:
 *    node scripts/precheck.mjs episodes/general-ep06-dark-night-sky
 *    node scripts/precheck.mjs general-long01-stopped-clock-illusion   (폴더명만 줘도 된다)
 *    node scripts/precheck.mjs <경로> --strict     (경고도 실패로 처리)
 *
 *  종료 코드: 0 = 에러 없음 / 1 = 에러 있음 / 2 = 사용법·내부 오류
 *
 *  검사 항목
 *    1 (KO-STR)   한국어 문자열 하드코딩       strings.ts 를 안 거친 화면 문구 (경고, JSX 텍스트는 에러)
 *    2 (RANDOM)   Math.random 사용             프레임마다 값이 달라져 깜빡인다 (에러)
 *    3 (NOWRAP)   CountUp/StepCounter 폭 미지정 숫자+접두/접미사가 2~3줄로 깨진다 (경고)
 *    4 (WORDBRK)  wordBreak: 'keep-all' 누락    한글 단어 중간에서 줄이 쪼개진다 (경고)
 *    5 (FORMAT)   포맷 불일치                   16:9 에 세로 전용 자산, 9:16 에 가로 전용 자산 (에러)
 *    6 (IMPORT)   존재하지 않는 import          배럴에 없는 이름·없는 파일 (에러)
 *
 *  이 스크립트는 읽기만 한다 - 에피소드 코드도, 자산도 고치지 않는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');
const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/* ------------------------------------------------------------------ 리포트 */

const findings = [];
let epDirAbs = '';

function rel(file) {
  const r = path.relative(epDirAbs, file);
  return r.startsWith('..') ? path.relative(ROOT, file) : r;
}

function report(level, rule, file, line, message, hint) {
  findings.push({ level, rule, file: rel(file), line, message, hint });
}
const err = (...a) => report('ERROR', ...a);
const warn = (...a) => report('WARN', ...a);

/* ------------------------------------------------------------------ 파일 유틸 */

const SRC_EXT = new Set(['.ts', '.tsx']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'out' || e.name.startsWith('.')) continue;
      walk(p, out);
    } else if (SRC_EXT.has(path.extname(e.name))) {
      out.push(p);
    }
  }
  return out;
}

const sourceCache = new Map();
function parse(file) {
  if (sourceCache.has(file)) return sourceCache.get(file);
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  sourceCache.set(file, sf);
  return sf;
}

function lineOf(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

function visit(node, fn) {
  fn(node);
  node.forEachChild((c) => visit(c, fn));
}

/** './x' -> 실제 파일 경로. 없으면 null */
function resolveRelative(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const cands = [
    base, `${base}.ts`, `${base}.tsx`, `${base}.json`,
    path.join(base, 'index.ts'), path.join(base, 'index.tsx'),
  ];
  for (const c of cands) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

/* ------------------------------------------------------------------ import/export 파싱 */

/** 파일의 import 를 [{spec, resolved, names:[{imported, local, typeOnly}], namespace, isTypeOnly}] 로 */
function importsOf(sf) {
  const out = [];
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    const spec = st.moduleSpecifier.text;
    const entry = {
      spec,
      resolved: resolveRelative(sf.fileName, spec),
      names: [],
      namespace: null,
      node: st,
      line: lineOf(sf, st),
    };
    const clause = st.importClause;
    if (clause) {
      if (clause.name) entry.names.push({ imported: 'default', local: clause.name.text });
      const b = clause.namedBindings;
      if (b && ts.isNamespaceImport(b)) entry.namespace = b.name.text;
      if (b && ts.isNamedImports(b)) {
        for (const el of b.elements) {
          entry.names.push({
            imported: el.propertyName ? el.propertyName.text : el.name.text,
            local: el.name.text,
            line: lineOf(sf, el),
          });
        }
      }
    }
    out.push(entry);
  }
  return out;
}

/** 배럴을 따라가며 exportName -> 정의 파일 맵을 만든다 */
const exportCache = new Map();
function exportsOf(file, seen = new Set()) {
  if (exportCache.has(file)) return exportCache.get(file);
  if (seen.has(file)) return new Map();
  seen.add(file);
  const map = new Map();
  if (path.extname(file) === '.json') return map;
  const sf = parse(file);

  // 로컬 import 출처 (export { A } 재노출 추적용)
  const localFrom = new Map();
  for (const im of importsOf(sf)) {
    for (const n of im.names) if (im.resolved) localFrom.set(n.local, { file: im.resolved, name: n.imported });
  }

  for (const st of sf.statements) {
    const exported = ts.canHaveModifiers(st)
      && (ts.getModifiers(st) || []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

    if (ts.isExportDeclaration(st)) {
      const modFile = st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)
        ? resolveRelative(file, st.moduleSpecifier.text) : null;
      if (!st.exportClause && modFile) {
        for (const [k, v] of exportsOf(modFile, seen)) if (!map.has(k)) map.set(k, v);
        continue;
      }
      if (st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) {
          const orig = el.propertyName ? el.propertyName.text : el.name.text;
          if (modFile) {
            const inner = exportsOf(modFile, seen);
            map.set(el.name.text, inner.get(orig) || { file: modFile, name: orig });
          } else if (localFrom.has(orig)) {
            const src = localFrom.get(orig);
            const inner = exportsOf(src.file, seen);
            map.set(el.name.text, inner.get(src.name) || { file: src.file, name: orig });
          } else {
            map.set(el.name.text, { file, name: orig });
          }
        }
      }
      continue;
    }
    if (!exported) continue;
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) map.set(d.name.text, { file, name: d.name.text });
      }
    } else if (
      ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)
      || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isEnumDeclaration(st)
    ) {
      if (st.name) map.set(st.name.text, { file, name: st.name.text });
    }
  }
  exportCache.set(file, map);
  return map;
}

/* ------------------------------------------------------------------ 포맷 판정 */

/** theme.ts 의 캔버스 상수 */
function themeConstants() {
  const file = path.join(ASSETS_DIR, 'theme.ts');
  const out = new Map();
  const sf = parse(file);
  visit(sf, (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer
      && ts.isNumericLiteral(n.initializer)) {
      out.set(n.name.text, Number(n.initializer.text));
    }
  });
  return out;
}

/** 자산 파일이 세로 전용인지 가로 전용인지. 'portrait' | 'landscape' | 'any' */
const formatCache = new Map();
function assetFormat(file, depth = 0) {
  if (formatCache.has(file)) return formatCache.get(file);
  if (depth > 4 || !fs.existsSync(file) || path.extname(file) === '.json') return 'any';
  formatCache.set(file, 'any'); // 순환 방지 임시값
  let result = 'any';
  if (file.split(path.sep).includes('16x9')) {
    result = 'landscape';
  } else {
    const sf = parse(file);
    const ims = importsOf(sf);
    for (const im of ims) {
      if (!im.resolved || !im.resolved.includes(path.join('assets', 'theme'))) continue;
      for (const n of im.names) {
        if (n.imported === 'W_LANDSCAPE' || n.imported === 'H_LANDSCAPE') result = 'landscape';
        else if (n.imported === 'W' || n.imported === 'H') result = 'portrait';
      }
    }
    if (result === 'any') {
      // 좌표를 직접 안 들고 있어도, 세로 전용 부품을 품고 있으면 같이 세로 전용이다
      const kinds = new Set();
      for (const im of ims) {
        if (!im.resolved || !im.resolved.startsWith(ASSETS_DIR)) continue;
        if (path.basename(im.resolved).startsWith('index.')) continue;
        kinds.add(assetFormat(im.resolved, depth + 1));
      }
      if (kinds.has('portrait') && !kinds.has('landscape')) result = 'portrait';
      else if (kinds.has('landscape') && !kinds.has('portrait')) result = 'landscape';
    }
  }
  formatCache.set(file, result);
  return result;
}

/** Root.tsx 의 Composition width/height 를 읽어 에피소드 포맷을 정한다 */
function episodeFormat(rootFile, consts) {
  if (!fs.existsSync(rootFile)) return null;
  const sf = parse(rootFile);
  // `W_LANDSCAPE as W` 처럼 별칭으로 받아 쓰는 경우가 있어 원래 이름으로 되돌려 읽는다
  const alias = new Map();
  for (const im of importsOf(sf)) for (const n of im.names) alias.set(n.local, n.imported);
  const constOf = (name) => {
    const real = alias.get(name) || name;
    return consts.has(real) ? consts.get(real) : real;
  };
  const comps = [];
  visit(sf, (n) => {
    const open = ts.isJsxSelfClosingElement(n) ? n
      : (ts.isJsxElement(n) ? n.openingElement : null);
    if (!open || open.tagName.getText(sf) !== 'Composition') return;
    const attrs = {};
    for (const a of open.attributes.properties) {
      if (!ts.isJsxAttribute(a) || !a.name || !a.initializer) continue;
      const key = a.name.getText(sf);
      const init = a.initializer;
      let v = null;
      if (ts.isStringLiteral(init)) v = init.text;
      else if (ts.isJsxExpression(init) && init.expression) {
        const e = init.expression;
        if (ts.isNumericLiteral(e)) v = Number(e.text);
        else if (ts.isIdentifier(e)) v = constOf(e.text);
      }
      attrs[key] = v;
    }
    comps.push({ ...attrs, line: lineOf(sf, open) });
  });
  return comps;
}

/* ------------------------------------------------------------------ 검사 1: 한국어 하드코딩 */

function checkKoreanStrings(sf) {
  if (path.basename(sf.fileName) === 'strings.ts') return;
  visit(sf, (n) => {
    // import/export 경로는 대상 아님
    const skipParent = n.parent
      && (ts.isImportDeclaration(n.parent) || ts.isExportDeclaration(n.parent));
    if (skipParent) return;

    if (ts.isJsxText(n)) {
      if (!HANGUL.test(n.text)) return;
      warnOrErrJsx(sf, n);
      return;
    }
    const isStr = ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)
      || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n);
    if (!isStr || !HANGUL.test(n.text)) return;
    // 객체 키가 한글인 경우는 화면 문구가 아니라 자료 키다
    if (n.parent && ts.isPropertyAssignment(n.parent) && n.parent.name === n) return;
    // locale/lang 으로 이미 분기된 삼항(ko 면 '다음 편', 아니면 'Next up')은 누출이 아니다
    if (isLocaleGated(n, sf)) return;
    const snippet = n.text.trim().slice(0, 40);
    warn('KO-STR', sf.fileName, lineOf(sf, n),
      `한국어 문자열 리터럴: "${snippet}"`,
      'strings.ts 를 거치지 않은 화면 문자열일 수 있다. 화면에 그려지는 문구면 strings.ts 의 ko/en 테이블로 옮기고 props 로 받는다(영어판에 한국어가 새는 원인). 화면과 무관한 값이면 무시해도 된다.');
  });
}

/** 조상 중에 locale/lang 을 조건으로 쓰는 삼항이 있으면 언어별로 이미 갈린 문구다 */
function isLocaleGated(node, sf) {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isConditionalExpression(p) && /\b(locale|lang|language)\b/.test(p.condition.getText(sf))) {
      return true;
    }
  }
  return false;
}

function warnOrErrJsx(sf, n) {
  const snippet = n.text.trim().slice(0, 40);
  err('KO-STR', sf.fileName, lineOf(sf, n),
    `JSX 안에 한국어 텍스트가 직접 들어 있다: "${snippet}"`,
    '화면에 그대로 그려지는 문구다. strings.ts 의 ko/en 테이블로 옮기고 props 로 받는다.');
}

/* ------------------------------------------------------------------ 검사 2: Math.random */

function checkMathRandom(sf, tag = '') {
  visit(sf, (n) => {
    if (!ts.isPropertyAccessExpression(n)) return;
    if (n.name.text !== 'random') return;
    if (!ts.isIdentifier(n.expression) || n.expression.text !== 'Math') return;
    err('RANDOM', sf.fileName, lineOf(sf, n),
      `${tag}Math.random() 사용`,
      'Remotion 은 프레임마다 컴포넌트를 다시 그리므로 값이 매번 달라져 화면이 깜빡인다. frame 만의 순수 함수나 고정 배열, mulberry32 같은 시드 기반 결정적 난수를 쓴다.');
  });
}

/* ------------------------------------------------------------------ 검사 3: 폭·nowrap */

const TEXT_COMPONENTS = new Set(['CountUp', 'StepCounter']);

function jsxOpeningElements(sf) {
  const out = [];
  visit(sf, (n) => {
    if (ts.isJsxSelfClosingElement(n)) out.push(n);
    else if (ts.isJsxElement(n)) out.push(n.openingElement);
  });
  return out;
}

function attrNames(open, sf) {
  const names = new Set();
  for (const a of open.attributes.properties) {
    if (ts.isJsxAttribute(a) && a.name) names.add(a.name.getText(sf));
  }
  return names;
}

/** style={{ ... }} 안에 특정 CSS 속성이 있는지 (값까지 볼 수 있으면 값도 준다) */
function styleProps(open, sf) {
  const props = new Map();
  for (const a of open.attributes.properties) {
    if (!ts.isJsxAttribute(a) || !a.name || a.name.getText(sf) !== 'style') continue;
    const init = a.initializer;
    if (!init || !ts.isJsxExpression(init) || !init.expression) continue;
    collectObjectProps(init.expression, sf, props);
  }
  return props;
}

function collectObjectProps(expr, sf, into = new Map()) {
  if (ts.isObjectLiteralExpression(expr)) {
    for (const p of expr.properties) {
      if (ts.isPropertyAssignment(p) && p.name) {
        into.set(p.name.getText(sf).replace(/['"]/g, ''), p.initializer.getText(sf));
      } else if (ts.isSpreadAssignment(p)) {
        into.set('...spread', p.expression.getText(sf));
      } else if (ts.isShorthandPropertyAssignment(p) && p.name) {
        into.set(p.name.getText(sf), p.name.getText(sf));
      }
    }
  }
  return into;
}

function checkTextWrap(sf) {
  for (const open of jsxOpeningElements(sf)) {
    const tag = open.tagName.getText(sf);
    if (!TEXT_COMPONENTS.has(tag)) continue;
    const names = attrNames(open, sf);
    const style = styleProps(open, sf);
    const hasWidth = names.has('width');
    const nowrap = /nowrap/.test(style.get('whiteSpace') || '');
    if (hasWidth && nowrap) continue;
    const missing = [
      hasWidth ? null : 'width',
      nowrap ? null : "style={{ whiteSpace: 'nowrap' }}",
    ].filter(Boolean).join(' + ');
    warn('NOWRAP', sf.fileName, lineOf(sf, open),
      `<${tag}> 에 ${missing} 가 없다`,
      `${tag} 의 기본 width 는 300px 이라 접두/접미사가 붙은 큰 숫자가 2~3줄로 접힌다. 숫자가 들어갈 만큼 width 를 주고 whiteSpace: 'nowrap' 으로 고정한다.`);
  }
}

/* ------------------------------------------------------------------ 검사 4: wordBreak */

const TEXTISH = ['fontSize', 'fontFamily', 'fontWeight'];

/** 실제로 화면에 먹는 스타일 객체만 모은다 (style={{...}} 또는 CSSProperties 로 선언된 상수).
 *  theme.ts 의 토큰 객체처럼 "값 묶음"일 뿐인 객체는 여기서 걸러진다(오탐 방지). */
function styleObjects(sf) {
  const out = [];
  visit(sf, (n) => {
    if (ts.isJsxAttribute(n) && n.name && n.name.getText(sf) === 'style' && n.initializer
      && ts.isJsxExpression(n.initializer) && n.initializer.expression) {
      const e = n.initializer.expression;
      if (ts.isObjectLiteralExpression(e)) out.push(e);
      else if (ts.isConditionalExpression(e)) {
        for (const b of [e.whenTrue, e.whenFalse]) if (ts.isObjectLiteralExpression(b)) out.push(b);
      }
      return;
    }
    if (ts.isVariableDeclaration(n) && n.type && n.initializer
      && ts.isObjectLiteralExpression(n.initializer)
      && /CSSProperties/.test(n.type.getText(sf))) {
      out.push(n.initializer);
    }
  });
  return out;
}

/** 줄바꿈이 일어날 수 있는 텍스트 박스인데 wordBreak: 'keep-all' 이 없는 곳 */
function checkWordBreak(sf, tag = '') {
  for (const n of styleObjects(sf)) {
    const props = collectObjectProps(n, sf);
    if (props.has('...spread')) continue; // 바깥에서 스타일을 덮어쓸 수 있으면 판단 불가
    if (!TEXTISH.some((k) => props.has(k))) continue;
    const white = props.get('whiteSpace') || '';
    if (/nowrap/.test(white)) continue;
    // maxWidth/wrapWidth 가 있다 = 그 폭에서 실제로 줄이 접힌다. 고정 width 만 있는 박스는
    // 한 줄짜리 라벨인 경우가 대부분이라 오탐이 많아 제외한다.
    if (!props.has('maxWidth') && !props.has('wrapWidth')) continue;
    if (props.has('wordBreak')) continue;
    warn('WORDBRK', sf.fileName, lineOf(sf, n),
      `${tag}줄바꿈되는 텍스트 박스에 wordBreak: 'keep-all' 이 없다`,
      "한글은 어절 중간(예: \"캄캄한\" -> \"캄\" / \"캄한\")에서 쪼개진다. 이 스타일 객체에 wordBreak: 'keep-all' 을 추가한다. 한글이 안 들어가는 박스면 무시해도 된다.");
  }
}

/** 배럴에 등록된 짝 이름 찾기 (Intro -> IntroLandscape, INTRO_FRAMES -> INTRO_FRAMES_LANDSCAPE) */
function landscapeTwin(barrel, name) {
  for (const cand of [`${name}Landscape`, `${name}_LANDSCAPE`]) if (barrel.has(cand)) return cand;
  return null;
}
function portraitTwin(barrel, name) {
  const cand = name.replace(/(Landscape|_LANDSCAPE)$/, '');
  return cand !== name && barrel.has(cand) ? cand : null;
}

/* ------------------------------------------------------------------ 실행 */

function usage(msg) {
  if (msg) console.error(`오류: ${msg}\n`);
  console.error('사용법: node scripts/precheck.mjs <에피소드 폴더> [--strict]');
  console.error('  예) node scripts/precheck.mjs episodes/general-ep06-dark-night-sky');
  process.exit(2);
}

function resolveEpisodeDir(arg) {
  if (!arg) usage('에피소드 폴더를 지정하세요.');
  const cands = [
    path.resolve(process.cwd(), arg),
    path.resolve(ROOT, arg),
    path.resolve(ROOT, 'episodes', arg),
  ];
  for (const c of cands) if (fs.existsSync(path.join(c, 'src'))) return c;
  usage(`src/ 가 있는 에피소드 폴더를 찾지 못했습니다: ${arg}`);
  return null;
}

function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--strict');
  const strict = process.argv.includes('--strict');
  epDirAbs = resolveEpisodeDir(args[0]);

  const srcDir = path.join(epDirAbs, 'src');
  const srcFiles = walk(srcDir);
  if (srcFiles.length === 0) usage(`${srcDir} 에 .ts/.tsx 파일이 없습니다.`);

  const consts = themeConstants();
  const barrelFile = path.join(ASSETS_DIR, 'index.ts');
  const barrel = exportsOf(barrelFile);

  /* 포맷 판정 (검사 5의 기준) */
  const comps = episodeFormat(path.join(srcDir, 'Root.tsx'), consts) || [];
  const sizes = new Set(comps.map((c) => `${c.width}x${c.height}`));
  let format = null;
  for (const s of sizes) {
    if (s === '1920x1080') format = format === 'portrait' ? 'mixed' : 'landscape';
    else if (s === '1080x1920') format = format === 'landscape' ? 'mixed' : 'portrait';
    else format = 'unknown';
  }

  /* src 파일 검사 + 사용 자산 수집 */
  const usedAssetFiles = new Map(); // file -> [사용된 이름]
  for (const f of srcFiles) {
    const sf = parse(f);
    checkKoreanStrings(sf);
    checkMathRandom(sf);
    checkTextWrap(sf);
    checkWordBreak(sf);

    for (const im of importsOf(sf)) {
      const isAssetsBarrel = im.spec.endsWith('/assets') || im.spec === '../../assets';
      if (im.spec.startsWith('.')) {
        if (!im.resolved) {
          err('IMPORT', f, im.line, `존재하지 않는 경로를 import 한다: '${im.spec}'`,
            '경로 오타이거나 아직 만들지 않은 파일이다. 자산은 항상 배럴(assets/index.ts)에서 가져온다.');
          continue;
        }
      } else {
        continue; // react, remotion 등 패키지 import 는 대상 아님
      }

      const fromAssets = im.resolved.startsWith(ASSETS_DIR);
      const table = fromAssets && isAssetsBarrel ? barrel : exportsOf(im.resolved);

      for (const n of im.names) {
        if (n.imported === 'default') continue;
        const hit = table.get(n.imported);
        if (!hit) {
          err('IMPORT', f, n.line || im.line,
            `'${im.spec}' 에 없는 이름을 import 한다: ${n.imported}`,
            fromAssets
              ? 'assets/REGISTRY.md 와 assets/index.ts 에서 실제 export 이름을 확인한다(16:9 자산은 Landscape 접미사).'
              : '해당 파일이 실제로 export 하는 이름인지 확인한다.');
          continue;
        }
        if (!fromAssets) continue;
        if (!usedAssetFiles.has(hit.file)) usedAssetFiles.set(hit.file, new Set());
        usedAssetFiles.get(hit.file).add(n.imported);

        /* 검사 5: 포맷 불일치 */
        if (format !== 'landscape' && format !== 'portrait') continue;
        const want = format;
        if (n.imported === 'W' || n.imported === 'H') {
          if (want === 'landscape') {
            err('FORMAT', f, n.line || im.line,
              `16:9(1920x1080) 화인데 세로 캔버스 상수 ${n.imported} 를 쓴다`,
              `W_LANDSCAPE / H_LANDSCAPE 로 바꾼다(W=${consts.get('W')}, H=${consts.get('H')} 는 9:16 값이라 좌표가 화면 밖으로 나간다).`);
          }
          continue;
        }
        if (n.imported === 'W_LANDSCAPE' || n.imported === 'H_LANDSCAPE') {
          if (want === 'portrait') {
            err('FORMAT', f, n.line || im.line,
              `9:16(1080x1920) 화인데 가로 캔버스 상수 ${n.imported} 를 쓴다`,
              'W / H 로 바꾼다.');
          }
          continue;
        }
        const af = assetFormat(hit.file);
        if (af === 'any' || af === want) continue;
        const label = af === 'portrait' ? '세로(9:16) 전용' : '가로(16:9) 전용';
        const fix = want === 'landscape'
          ? (landscapeTwin(barrel, n.imported)
            ? `배럴에 있는 16:9 판 ${landscapeTwin(barrel, n.imported)} 로 바꾼다.`
            : `assets/index.ts 에 이 자산의 16:9 판(Landscape 접미사)이 아직 없다. assets/*/16x9/ 에 새로 만들고 배럴에 Landscape 접미사로 재노출한다(REGISTRY 폴더식 분리 규칙).`)
          : (portraitTwin(barrel, n.imported)
            ? `세로판 ${portraitTwin(barrel, n.imported)} 로 바꾼다.`
            : '세로판(Landscape 접미사 없는 export)으로 바꾼다.');
        err('FORMAT', f, n.line || im.line,
          `${want === 'landscape' ? '16:9' : '9:16'} 화에서 ${label} 자산 ${n.imported} 를 쓴다 (${rel(hit.file)})`,
          `${fix} 이 자산은 캔버스 좌표를 직접 들고 있어 다른 포맷에서는 화면 밖으로 나간다.`);
      }
    }
  }

  /* 사용 중인 자산 파일도 같이 본다 (깜빡임·줄바꿈은 자산 쪽에서 터진 전례가 있다) */
  const assetFiles = [...usedAssetFiles.keys()].filter((f) => SRC_EXT.has(path.extname(f)));
  for (const f of assetFiles) {
    const sf = parse(f);
    checkMathRandom(sf, '[자산] ');
    checkWordBreak(sf, '[자산] ');
  }

  /* ---------------- 출력 ---------------- */
  const errors = findings.filter((f) => f.level === 'ERROR');
  const warns = findings.filter((f) => f.level === 'WARN');

  const fmtLabel = {
    landscape: '16:9 가로 (1920x1080)',
    portrait: '9:16 세로 (1080x1920)',
    mixed: '섞여 있음 (Composition 마다 캔버스가 다르다)',
    unknown: '판별 불가',
  }[format] || '판별 불가 (Root.tsx 에서 Composition 을 못 찾음)';

  console.log('숏폼 렌더 전 정적 검사 (precheck)');
  console.log(`  에피소드 : ${path.basename(epDirAbs)}`);
  console.log(`  포맷     : ${fmtLabel}${comps.length ? ` [${comps.map((c) => c.id).join(', ')}]` : ''}`);
  console.log(`  검사 대상 : src ${srcFiles.length}개 + 사용 자산 ${assetFiles.length}개`);
  console.log('');

  const order = { ERROR: 0, WARN: 1 };
  findings.sort((a, b) => order[a.level] - order[b.level]
    || a.file.localeCompare(b.file) || a.line - b.line);

  for (const f of findings) {
    console.log(`[${f.level}] ${f.rule}  ${f.file}:${f.line}`);
    console.log(`        ${f.message}`);
    console.log(`        -> ${f.hint}`);
  }
  if (findings.length) console.log('');

  if (errors.length === 0 && warns.length === 0) {
    console.log('통과: 정적 검사에서 발견된 문제 없음 (에러 0 / 경고 0)');
  } else if (errors.length === 0) {
    console.log(`통과(경고 있음): 에러 0 / 경고 ${warns.length} - 경고는 오탐일 수 있으니 해당 줄만 확인한다.`);
  } else {
    console.log(`실패: 에러 ${errors.length} / 경고 ${warns.length} - 에러는 렌더 전에 고친다.`);
  }

  const fail = errors.length > 0 || (strict && warns.length > 0);
  process.exit(fail ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (e) {
    console.error('precheck 내부 오류:', e && e.stack ? e.stack : e);
    process.exit(2);
  }
}
