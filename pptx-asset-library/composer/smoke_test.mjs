#!/usr/bin/env node
/**
 * smoke_test.mjs — compose.mjs 견고화 스팟체크 (proposal-pt-builder 조합 계약 검증)
 *
 * manifest.json / design-tokens.json / decks(*.pptx)는 전혀 건드리지 않는다.
 * 임시 산출물은 모두 composer/out/smoke/ (git-ignored) 아래에만 쓴다.
 *
 * 실행:
 *   cd .claude/pptx-asset-library/composer
 *   node smoke_test.mjs
 *
 * 검증 항목:
 *   (a) gov/standard 혼합 플랜 → 마스터 호환성 가드가 exit 1
 *   (b) 없는 앵커(--manifest 오버라이드로 재현) → 실패감지 배너 + exit 1
 *   (c) 병합인식 패딩 래퍼(merge_aware) → TBL-201 병합표 origin 셀에 정확히 치환,
 *       placeholder 셀은 오염 없이 그대로
 *   (d) 회귀: reference/proposal-standard.plan.json (--master 생략) 정상 동작
 *   (e) 회귀: reference/proposal-gov.plan.json (--master base_gov.pptx) 정상 동작
 *       (기존 정적 병합표 TBL-201/202/204/205/206 포함, merge_aware 미사용 경로)
 *   (f) 병합표에 merge_aware 없이 setTableData를 태우면(placeholder 셀에
 *       a:t 신규생성 시도 → xml-elements.js textRangeProps()의 endParaRPr
 *       undefined TypeError) applyCallbacks가 삼키는 console.warn을 실패로
 *       카운트해 ⚠ 배너 + exit 1이 나오는지 확인(수정 전엔 조용히 exit 0).
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(__dirname, '..');
const COMPOSE = path.join(__dirname, 'compose.mjs');
const SCRATCH = path.join(__dirname, 'out', 'smoke');
fs.mkdirSync(SCRATCH, { recursive: true });

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`);
}

function runCompose(args) {
  const res = spawnSync(process.execPath, [COMPOSE, ...args], {
    cwd: __dirname,
    encoding: 'utf8',
  });
  return res;
}

function runPython(script, args = []) {
  const res = spawnSync('python3', ['-c', script, ...args], {
    cwd: __dirname,
    encoding: 'utf8',
  });
  return res;
}

function writeJson(relPath, obj) {
  const abs = path.join(SCRATCH, relPath);
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2));
  return abs;
}

// ── (a) gov/standard 혼합 플랜 가드 ─────────────────────────────────────────
function testMixedMasterGuard() {
  const planPath = writeJson('plan_mixed_master.json', {
    slides: [{ assets: [{ id: 'TBL-001' }, { id: 'TBL-201' }] }],
  });
  const res = runCompose([
    '--plan', path.relative(__dirname, planPath),
    '--out', path.join('out', 'smoke', 'mixed.pptx'),
    '--master', 'base_gov.pptx',
  ]);
  const combined = (res.stdout || '') + (res.stderr || '');
  const guardHit = combined.includes('마스터 호환성 위반');
  const pass = res.status !== 0 && guardHit;
  record(
    '(a) gov/standard 혼합 플랜 → 마스터 호환성 가드 exit 1',
    pass,
    `exit=${res.status}, guard문구발견=${guardHit}`
  );
}

// ── (b) 없는 앵커 → 실패감지 배너 + exit 1 ──────────────────────────────────
function testMissingAnchorDetection() {
  const realManifest = JSON.parse(fs.readFileSync(path.join(LIB, 'manifest.json'), 'utf8'));
  const tbl001 = realManifest.assets.find((a) => a.id === 'TBL-001');
  if (!tbl001) {
    record('(b) 없는 앵커 → 실패감지', false, 'manifest.json에 TBL-001 없음(전제 붕괴)');
    return;
  }
  const brokenEntry = { ...tbl001, anchor: 'asset:TBL-001-DOES-NOT-EXIST' };
  const manifestPath = writeJson('manifest_broken_anchor.json', { assets: [brokenEntry] });
  const planPath = writeJson('plan_broken_anchor.json', {
    slides: [{ assets: [{ id: 'TBL-001' }] }],
  });
  const res = runCompose([
    '--plan', path.relative(__dirname, planPath),
    '--out', path.join('out', 'smoke', 'broken_anchor.pptx'),
    '--manifest', path.relative(__dirname, manifestPath),
  ]);
  const combined = (res.stdout || '') + (res.stderr || '');
  const bannerHit = combined.includes("Can't find element on slide") && combined.includes('건 실패');
  const pass = res.status !== 0 && bannerHit;
  record(
    '(b) 없는 앵커(--manifest 오버라이드) → 실패감지 배너 + exit 1',
    pass,
    `exit=${res.status}, 배너발견=${bannerHit}`
  );
}

// ── (c) 병합인식 패딩 래퍼: TBL-201 origin 셀 정확 치환, placeholder 무오염 ───
function testMergeAwareTable() {
  // TBL-201 실측 물리 그리드(6x6): row0 origin=col{0,1,3,5}(gridSpan/rowSpan),
  // row1 origin=col{1,2,3,4}, row2~5 origin=전체 6열(병합 없음).
  const table = [
    ['TEST_구분', 'TEST_2025실적', 'TEST_2026계획', 'TEST_증감'],
    ['TEST_목표1', 'TEST_실적1', 'TEST_목표2', 'TEST_실적2'],
    ['TEST_r2c0', 'TEST_r2c1', 'TEST_r2c2', 'TEST_r2c3', 'TEST_r2c4', 'TEST_r2c5'],
    ['TEST_r3c0', 'TEST_r3c1', 'TEST_r3c2', 'TEST_r3c3', 'TEST_r3c4', 'TEST_r3c5'],
    ['TEST_r4c0', 'TEST_r4c1', 'TEST_r4c2', 'TEST_r4c3', 'TEST_r4c4', 'TEST_r4c5'],
    ['TEST_r5c0', 'TEST_r5c1', 'TEST_r5c2', 'TEST_r5c3', 'TEST_r5c4', 'TEST_r5c5'],
  ];
  const planPath = writeJson('plan_merge_aware.json', {
    slides: [{ assets: [{ id: 'TBL-201', merge_aware: true, table }] }],
  });
  const outRel = path.join('out', 'smoke', 'merge_aware.pptx');
  const res = runCompose([
    '--plan', path.relative(__dirname, planPath),
    '--out', outRel,
    '--master', 'base_gov.pptx',
  ]);
  if (res.status !== 0) {
    record('(c) merge_aware 텍스트 치환 정확성', false, `compose 실패: exit=${res.status}\n${res.stderr}`);
    return;
  }

  // 기대값: origin 셀은 새 값, placeholder(hMerge/vMerge) 셀은 원본 그대로 '' 유지.
  const expected = {
    '0,0': 'TEST_구분', '0,1': 'TEST_2025실적', '0,2': '', '0,3': 'TEST_2026계획', '0,4': '', '0,5': 'TEST_증감',
    '1,0': '', '1,1': 'TEST_목표1', '1,2': 'TEST_실적1', '1,3': 'TEST_목표2', '1,4': 'TEST_실적2', '1,5': '',
    '2,0': 'TEST_r2c0', '2,1': 'TEST_r2c1', '2,2': 'TEST_r2c2', '2,3': 'TEST_r2c3', '2,4': 'TEST_r2c4', '2,5': 'TEST_r2c5',
    '5,0': 'TEST_r5c0', '5,5': 'TEST_r5c5',
  };
  const outAbs = path.join(__dirname, outRel);
  const pyScript = `
import sys, json
from pptx import Presentation
path, expected_json = sys.argv[1], sys.argv[2]
expected = json.loads(expected_json)
prs = Presentation(path)
table = None
for slide in prs.slides:
    for shape in slide.shapes:
        if getattr(shape, 'has_table', False) and shape.name == 'asset:TBL-201':
            table = shape.table
            break
    if table is not None:
        break
if table is None:
    print('TABLE_NOT_FOUND'); sys.exit(1)
errors = []
for key, exp in expected.items():
    r, c = map(int, key.split(','))
    actual = table.cell(r, c).text
    if actual != exp:
        errors.append(f'({r},{c}) expected={exp!r} actual={actual!r}')
if errors:
    print('MISMATCH:\\n' + '\\n'.join(errors)); sys.exit(1)
print('OK')
`;
  const pyRes = runPython(pyScript, [outAbs, JSON.stringify(expected)]);
  const pass = pyRes.status === 0 && pyRes.stdout.includes('OK');
  record(
    '(c) merge_aware 텍스트 치환 정확성(origin 정확/placeholder 무오염)',
    pass,
    pass ? 'origin/placeholder 전부 기대값 일치' : `${pyRes.stdout}\n${pyRes.stderr}`
  );
}

// ── (f) merge_aware 누락 병합표 → 실패감지(모든 console.warn 카운트) ─────────────
// TBL-201(6x6, row0/row1에 hMerge/vMerge placeholder 포함)에 merge_aware 없이
// 물리 6열 값 배열을 그대로 넘기면, placeholder 셀(빈 <a:p/>, endParaRPr 없음)에
// setTableData가 <a:t>를 신규 생성하려다 xml-elements.js textRangeProps()에서
// endParaRPr.getAttribute(...) TypeError를 던진다. 이 예외는 pptx-automizer
// classes/shape.js applyCallbacks의 catch(e){console.warn(e)}에 삼켜지며, 메시지에
// 'merge_aware table:' 접두어가 없다(래퍼 자체를 타지 않았으므로) — 수정 전 로직은
// 이 경로를 놓쳐 조용히 exit 0을 냈다. 수정 후에는 write() 중 모든 console.warn을
// 카운트하므로 ⚠ 배너 + exit 1이 나와야 한다.
function testMissingMergeAwareFlagOnMergedTable() {
  const table = [
    ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
    ['B0', 'B1', 'B2', 'B3', 'B4', 'B5'],
    ['C0', 'C1', 'C2', 'C3', 'C4', 'C5'],
    ['D0', 'D1', 'D2', 'D3', 'D4', 'D5'],
    ['E0', 'E1', 'E2', 'E3', 'E4', 'E5'],
    ['F0', 'F1', 'F2', 'F3', 'F4', 'F5'],
  ];
  const planPath = writeJson('plan_merge_aware_missing.json', {
    slides: [{ assets: [{ id: 'TBL-201', table }] }], // merge_aware 의도적 누락
  });
  const res = runCompose([
    '--plan', path.relative(__dirname, planPath),
    '--out', path.join('out', 'smoke', 'merge_aware_missing.pptx'),
    '--master', 'base_gov.pptx',
  ]);
  const combined = (res.stdout || '') + (res.stderr || '');
  const bannerHit = /건 실패/.test(combined);
  const noMergeAwarePrefixInError = !combined.includes('merge_aware table:');
  const pass = res.status !== 0 && bannerHit;
  record(
    '(f) merge_aware 누락 병합표 → 모든 console.warn 카운트 → 실패배너 + exit 1',
    pass,
    `exit=${res.status}, 배너발견=${bannerHit}, merge_aware접두어무(예상대로 없음)=${noMergeAwarePrefixInError}`
  );
}

// ── (d)/(e) 회귀: 기존 reference plan 재실행 ────────────────────────────────
function testReferencePlan(label, planRel, masterArgs, outName) {
  const planAbs = path.join(LIB, planRel);
  if (!fs.existsSync(planAbs)) {
    record(label, false, `plan 없음: ${planAbs}`);
    return;
  }
  const plan = JSON.parse(fs.readFileSync(planAbs, 'utf8'));
  const expectedSlides = plan.slides.length;
  const outRel = path.join('out', 'smoke', outName);
  const res = runCompose(['--plan', planAbs, '--out', outRel, ...masterArgs]);
  const combined = (res.stdout || '') + (res.stderr || '');
  const noFailBanner = !combined.includes('건 실패');
  if (res.status !== 0 || !noFailBanner) {
    record(label, false, `exit=${res.status}, 실패배너=${!noFailBanner}\n${res.stderr}`);
    return;
  }
  const outAbs = path.join(__dirname, outRel);
  const pyScript = `
import sys
from pptx import Presentation
path, expected = sys.argv[1], int(sys.argv[2])
prs = Presentation(path)
n = len(prs.slides)
if n != expected:
    print(f'SLIDE_COUNT_MISMATCH expected={expected} actual={n}'); sys.exit(1)
print('OK')
`;
  const pyRes = runPython(pyScript, [outAbs, String(expectedSlides)]);
  const pass = pyRes.status === 0 && pyRes.stdout.includes('OK');
  record(label, pass, pass ? `슬라이드 ${expectedSlides}개 일치, 실패배너 없음` : `${pyRes.stdout}\n${pyRes.stderr}`);
}

testMixedMasterGuard();
testMissingAnchorDetection();
testMergeAwareTable();
testMissingMergeAwareFlagOnMergedTable();
testReferencePlan(
  '(d) 회귀: reference/proposal-standard.plan.json (--master 생략)',
  path.join('reference', 'proposal-standard.plan.json'),
  [],
  'ref-standard.pptx'
);
testReferencePlan(
  '(e) 회귀: reference/proposal-gov.plan.json (--master base_gov.pptx, 기존 정적 병합표 포함)',
  path.join('reference', 'proposal-gov.plan.json'),
  ['--master', 'base_gov.pptx'],
  'ref-gov.pptx'
);

console.log('');
const failed = results.filter((r) => !r.pass);
console.log(`SMOKE TEST: ${results.length - failed.length}/${results.length} PASS`);
if (failed.length) {
  console.log(`실패 항목: ${failed.map((f) => f.name).join(', ')}`);
  process.exit(1);
}
process.exit(0);
