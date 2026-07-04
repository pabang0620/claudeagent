#!/usr/bin/env node
/**
 * compose.mjs — 범용 제안서 PPTX 조합 엔진 (proposal-pt-builder v2 백엔드)
 *
 * 슬라이드 플랜 JSON을 입력받아, 에셋 라이브러리(manifest.json)의 네이티브 도형/표/차트를
 * base.pptx 위에 addElement 단일콜로 얹어 "편집 가능한" 제안서 pptx를 산출한다.
 *
 * 사용법:
 *   node compose.mjs --plan <plan.json> --out <out.pptx>
 *
 * 검증된 조합 방식(compose_demo.mjs / compose_group_test.mjs)을 프로덕션화한 것.
 *   - 에셋은 manifest의 anchor("asset:<ID>")로 참조, file로부터 deck 자동 load/등록
 *   - 위치: ModifyShapeHelper.setPosition (인치→EMU)
 *   - 표:   ModifyTableHelper.setTableData
 *   - 차트: ModifyChartHelper.setChartData
 *   - 텍스트: 그룹 자식 sp의 <a:t>까지 도달하는 커스텀 XML 모디파이어(기존텍스트→새텍스트)
 *   - 라이브러리 캡션(에셋 ID로 시작 / "·" 설명 캡션)은 빈 문자열로 제거
 */
import { Automizer, ModifyShapeHelper, ModifyTableHelper, ModifyChartHelper } from 'pptx-automizer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(__dirname, '..');          // pptx-asset-library 루트
const MANIFEST = path.join(LIB, 'manifest.json');
const EMU_PER_INCH = 914400;
const IN = inch => Math.round(inch * EMU_PER_INCH); // 인치 → EMU

// ── CLI 파싱 ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--plan') args.plan = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usageAndExit(code = 0) {
  console.log('Usage: node compose.mjs --plan <plan.json> --out <out.pptx>');
  process.exit(code);
}

// ── 라이브러리 캡션 판별 (에셋 ID로 시작 / 공백 감싼 " · " 설명 캡션) ──────────
// 주의: 라이브러리 캡션은 "BGP-001 · 표지 배경A" 처럼 가운뎃점 양옆에 공백이 있다.
// 한국어 복합어("착수·현황분석", "활용·성과확산")는 공백 없는 "·"를 쓰므로,
// includes('·') 대신 공백 감싼 " · "만 캡션으로 판별해 실제 콘텐츠 오삭제를 방지한다.
const ASSET_ID_RE = /^[A-Z]{2,4}-\d{2,3}/; // 예: BGP-001, HDR-001~003
function isLibraryCaption(text) {
  if (!text) return false;
  const t = text.trim();
  return ASSET_ID_RE.test(t) || t.includes(' · ');
}

// ── 커스텀 XML 모디파이어: 그룹 자식까지 도달하는 텍스트 치환 ─────────────────
// textMap: { 기존텍스트(부분일치): 새텍스트 }. 복사된 element(grpSp 또는 sp) 하위의
// 모든 <a:t> run을 순회하며, 각 키의 **모든 occurrence를 모든 run에서** 교체한다.
// (반복 더미 텍스트 — 예: KPI 카드 4개의 동일 라벨 — 도 전부 치환됨)
// 긴 키를 먼저 적용해 짧은 키가 긴 키의 일부를 오매칭하는 것을 줄인다.
function replaceDescendantText(textMap) {
  const entries = Object.entries(textMap)
    .filter(([k]) => k)                         // 빈 키 무시
    .sort((a, b) => b[0].length - a[0].length); // 긴 키 우선
  return (element) => {
    if (!element || entries.length === 0) return;
    const ts = element.getElementsByTagName('a:t');
    for (let i = 0; i < ts.length; i++) {
      let cur = ts[i].textContent;
      let changed = false;
      for (const [oldText, newText] of entries) {
        if (cur.includes(oldText)) {
          cur = cur.split(oldText).join(String(newText)); // 모든 occurrence 치환
          changed = true;
        }
      }
      if (changed) {
        while (ts[i].firstChild) ts[i].removeChild(ts[i].firstChild);
        ts[i].appendChild(ts[i].ownerDocument.createTextNode(cur));
      }
    }
  };
}

// ── 커스텀 XML 모디파이어: 라이브러리 캡션 라벨 제거(빈 문자열) ───────────────
function stripLibraryCaptions() {
  return (element) => {
    if (!element) return;
    const ts = element.getElementsByTagName('a:t');
    for (let i = 0; i < ts.length; i++) {
      if (isLibraryCaption(ts[i].textContent)) {
        while (ts[i].firstChild) ts[i].removeChild(ts[i].firstChild);
        // 빈 텍스트 노드 유지(런 구조 보존)
        ts[i].appendChild(ts[i].ownerDocument.createTextNode(''));
      }
    }
  };
}

// ── plan의 table(배열의 배열) → automizer setTableData 형식 ──────────────────
function toTableData(rows) {
  return { body: rows.map(r => ({ values: r })) };
}

// ── plan의 chart → automizer setChartData 형식 ──────────────────────────────
// plan: { categories:[str...], series:[{label, values:[num...]}] }
// out : { series:[{label}], categories:[{label, values:[num...]}] }
function toChartData(chart) {
  const series = (chart.series || []).map(s => ({ label: s.label }));
  const categories = (chart.categories || []).map((cat, i) => ({
    label: cat,
    values: (chart.series || []).map(s => (s.values ? s.values[i] : 0)),
  }));
  return { series, categories };
}

// ── 에셋 하나에 대한 modifier 배열 조립 ─────────────────────────────────────
function buildModifiers(asset) {
  const mods = [];
  // 위치 (인치 → EMU). x/y 둘 중 하나만 있어도 처리(없는 축은 원본 유지 불가하므로 둘 다 요구 권장)
  if (asset.x != null || asset.y != null) {
    const pos = {};
    if (asset.x != null) pos.x = IN(asset.x);
    if (asset.y != null) pos.y = IN(asset.y);
    mods.push(ModifyShapeHelper.setPosition(pos));
  }
  // 표
  if (asset.table) mods.push(ModifyTableHelper.setTableData(toTableData(asset.table)));
  // 차트
  if (asset.chart) mods.push(ModifyChartHelper.setChartData(toChartData(asset.chart)));
  // 텍스트 치환 (그룹 자식 포함)
  if (asset.text && Object.keys(asset.text).length > 0) {
    mods.push(replaceDescendantText(asset.text));
  }
  // 라이브러리 캡션 제거는 항상 마지막(치환된 콘텐츠를 캡션으로 오인하지 않도록)
  mods.push(stripLibraryCaptions());
  return mods;
}

// ── 메인 ───────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.plan || !args.out) usageAndExit(args.help ? 0 : 1);

  const planPath = path.resolve(process.cwd(), args.plan);
  const outArg = args.out;

  // manifest 로드 → 에셋 인덱스
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const assetIndex = new Map();
  for (const a of manifest.assets) {
    assetIndex.set(a.id, {
      file: a.file,
      slide: a.slide || 1,
      anchor: a.anchor || `asset:${a.id}`,
    });
  }

  // plan 로드
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  if (!plan.slides || !Array.isArray(plan.slides)) {
    throw new Error('plan.json 에 slides 배열이 없습니다.');
  }

  // out 경로 처리: automizer outputDir 기준 상대 파일명만 write에 넘긴다.
  const outAbs = path.resolve(process.cwd(), outArg);
  const outputDir = path.dirname(outAbs);
  const outName = path.basename(outAbs);
  fs.mkdirSync(outputDir, { recursive: true });

  const automizer = new Automizer({
    templateDir: __dirname,
    outputDir,
    removeExistingSlides: true,   // base의 기존 슬라이드 제거 → orphan 빈 슬라이드 방지
    autoImportSlideMasters: false,
  });

  let pres = automizer.loadRoot('base.pptx').load('base.pptx', 'base');

  // plan에서 사용하는 모든 에셋의 deck을 유니크 파일 단위로 load/등록
  const fileToAlias = new Map();
  let aliasSeq = 0;
  const usedIds = new Set();
  for (const s of plan.slides) {
    for (const el of (s.assets || [])) usedIds.add(el.id);
  }
  const missing = [];
  for (const id of usedIds) {
    const meta = assetIndex.get(id);
    if (!meta) { missing.push(id); continue; }
    if (!fileToAlias.has(meta.file)) {
      const alias = `d${aliasSeq++}`;
      fileToAlias.set(meta.file, alias);
      pres = pres.load(path.join(LIB, meta.file), alias);
    }
  }
  if (missing.length) {
    throw new Error(`manifest에 없는 에셋 ID: ${missing.join(', ')}`);
  }

  const log = [];

  // 슬라이드별 조합
  plan.slides.forEach((slidePlan, si) => {
    pres.addSlide('base', 1, (slide) => {
      const placed = [];
      for (const el of (slidePlan.assets || [])) {
        const meta = assetIndex.get(el.id);
        const alias = fileToAlias.get(meta.file);
        const mods = buildModifiers(el);
        try {
          slide.addElement(alias, meta.slide, meta.anchor, mods);
          const feats = [];
          if (el.x != null || el.y != null) feats.push('pos');
          if (el.table) feats.push('table');
          if (el.chart) feats.push('chart');
          if (el.text) feats.push('text');
          placed.push(`${el.id}(${feats.join('+') || 'as-is'})`);
        } catch (e) {
          placed.push(`${el.id} FAIL: ${e.message}`);
        }
      }
      log.push(`slide ${si + 1}: ${placed.join(', ')}`);
    });
  });

  await pres.write(outName);
  log.forEach(l => console.log('  ' + l));
  console.log(`WROTE ${path.join(outputDir, outName)}`);
}

main().catch((e) => {
  console.error('COMPOSE FAIL:', e && e.stack ? e.stack : e);
  process.exit(1);
});
