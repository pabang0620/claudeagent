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
import { Automizer, ModifyShapeHelper, ModifyTableHelper, ModifyChartHelper, ModifyTextHelper } from 'pptx-automizer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(__dirname, '..');          // pptx-asset-library 루트
const DEFAULT_MANIFEST = path.join(LIB, 'manifest.json');
const EMU_PER_INCH = 914400;
const IN = inch => Math.round(inch * EMU_PER_INCH); // 인치 → EMU

// ── CLI 파싱 ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--plan') args.plan = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--master') args.master = argv[++i];
    // --manifest: 테스트 전용 오버라이드(예: smoke_test.mjs가 앵커 불일치를 재현할 때
    // 실제 manifest.json을 건드리지 않고 임시 사본을 가리키기 위함). 생략 시 기존과
    // 100% 동일하게 LIB/manifest.json을 사용한다.
    else if (a === '--manifest') args.manifest = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usageAndExit(code = 0) {
  console.log('Usage: node compose.mjs --plan <plan.json> --out <out.pptx> [--master <base.pptx|base_gov.pptx>] [--manifest <manifest.json>]');
  process.exit(code);
}

// ── 마스터 파일 → 호환성 종류(kind) 매핑 ────────────────────────────────────
// base_gov.pptx만 'gov', 그 외(기본 base.pptx 포함)는 전부 'standard'로 취급한다.
// manifest 엔트리의 master 필드 미지정 시 'standard'로 간주(기존 2,400여 엔트리 호환).
// path.basename 가드: --master templates/base_gov.pptx 처럼 경로 접두어가 붙어 와도
// 파일명만으로 판정한다(code-review 제안, 2026-07-09).
function masterKindOf(masterFile) {
  return path.basename(masterFile) === 'base_gov.pptx' ? 'gov' : 'standard';
}

// ── 라이브러리 캡션 판별 (에셋 ID로 시작하는 문자열만) ─────────────────────────
// 주의(버그 수정 2026-07-09): 이전에는 " · "(공백 감싼 가운뎃점) 포함 여부도
// OR 조건으로 캡션 판정에 사용했으나, gov 트랙 실제 디자인 콘텐츠
// ("2026 · 기관명을 입력하세요", "PART 00 · 표지" 등, 치환 후에도 동일 패턴 유지)가
// 이 조건에 걸려 텍스트 치환 직후 stripLibraryCaptions()가 빈 문자열로 지워버리는
// 결함이 발견됨(스팟체크: proposal-gov-sample.pptx BGP-201~205 슬라이드에서
// 연도·기관명·PART 라벨이 통째로 사라짐). generators/*.py 전수 조사 결과
// c.id_caption() 호출은 예외 없이 항상 asset_id로 문자열이 시작하므로
// ASSET_ID_RE 단독 판정으로 충분 — " · " OR절을 제거한다.
const ASSET_ID_RE = /^[A-Z]{2,4}-\d{2,3}/; // 예: BGP-001, HDR-001~003
function isLibraryCaption(text) {
  if (!text) return false;
  const t = text.trim();
  return ASSET_ID_RE.test(t);
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

// ── 병합인식 패딩 래퍼: 병합 표(gridSpan/rowSpan) 동적 텍스트 치환 ─────────────
// 스파이크 확정 결론(BUILD_SPEC 병합셀 표 원칙 참고): ModifyTableHelper.setTableData는
// 병합 지오메트리를 인식하지 못하고 물리적 <a:tc> 순서(hMerge/vMerge placeholder 셀
// 포함)로 값 배열을 그대로 꽂는다. 게다가 placeholder 셀은 python-pptx가 만드는
// 실제 구조상 <a:p/>(런·endParaRPr 전무)이므로, 거기에 값을 쓰려 들면
// xml-elements.js의 textRangeProps()가 `endParaRPr.getAttribute(...)`를 호출하며
// endParaRPr===undefined TypeError를 던진다(실측 확인: TBL_gov_v1.pptx 병합 셀 XML).
// 이 예외는 classes/shape.js applyCallbacks의 catch(e){console.warn(e)}에 삼켜져
// exit 0인 채로 표가 일부만 채워지는 조용한 오정렬로 새어나간다.
//
// 그래서 이 래퍼는 setTableData를 아예 거치지 않는다. 표의 각 행(a:tr)에서 실제
// <a:tc>를 순회하며 hMerge/vMerge 속성으로 "origin(화면에 보이는) 셀"만 골라내고,
// 사용자가 준 "논리적 값 배열"(병합 구조를 몰라도 되는, 보이는 셀 개수만큼의 배열)을
// 그 origin 셀에만 순서대로 매핑해 ModifyTextHelper.setText로 직접 쓴다.
// ModifyTextHelper.setText(text)(element)는 element 안의 <a:r> 개수만큼만 순회하고
// 0개면 아무 것도 하지 않으므로(placeholder 셀은 런이 0개), placeholder에는 자연히
// "기존값 유지(사실상 무해한 no-op)"가 되고 위 크래시 경로 자체를 타지 않는다.
function mergeAwareTableText(logicalRows) {
  return (element) => {
    const trs = element.getElementsByTagName('a:tr');
    logicalRows.forEach((rowValues, r) => {
      const tr = trs.item(r);
      if (!tr) {
        throw new Error(
          `merge_aware table: 행 ${r} 없음(템플릿 실제 행 수=${trs.length}, 요청 행 수=${logicalRows.length})`
        );
      }
      // TODO(pptx-automizer 버전업 시 재확인): hMerge/vMerge/gridSpan/rowSpan은
      // OOXML DrawingML 표준 표 셀 속성이며, 0.8.2는 이를 가공 없이 그대로 통과시킨다는
      // 전제로 동작한다. 라이브러리가 테이블 XML을 자체 정규화하도록 바뀌면 재검증 필요.
      const tcs = tr.getElementsByTagName('a:tc');
      const originIdx = [];
      for (let c = 0; c < tcs.length; c++) {
        const tc = tcs.item(c);
        const isPlaceholder = tc.getAttribute('hMerge') === '1' || tc.getAttribute('vMerge') === '1';
        if (!isPlaceholder) originIdx.push(c);
      }
      if (rowValues.length !== originIdx.length) {
        throw new Error(
          `merge_aware table: 행 ${r} 논리값 개수(${rowValues.length}) != 물리적 origin 셀 개수(${originIdx.length}). ` +
          `해당 행의 origin 셀 물리 인덱스: [${originIdx.join(',')}] (전체 물리 열 수 ${tcs.length})`
        );
      }
      rowValues.forEach((val, i) => {
        const tc = tcs.item(originIdx[i]);
        ModifyTextHelper.setText(String(val))(tc); // 런 0개(placeholder)면 no-op, 크래시 없음
      });
    });
  };
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
  // merge_aware:true 인 경우에만 병합인식 패딩 래퍼 사용(하위호환: 미지정 시 기존
  // setTableData 경로 그대로 — 병합 없는 표 다수가 이 경로에 의존하므로 유지 필수).
  if (asset.table) {
    if (asset.merge_aware) {
      mods.push(mergeAwareTableText(asset.table));
    } else {
      mods.push(ModifyTableHelper.setTableData(toTableData(asset.table)));
    }
  }
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
  const masterFile = args.master || 'base.pptx'; // --master 생략 시 기존과 100% 동일 동작
  const masterKind = masterKindOf(masterFile);

  // manifest 로드 → 에셋 인덱스
  // --manifest 생략 시 기존과 100% 동일(LIB/manifest.json). 오버라이드는 테스트 전용.
  const manifestPath = args.manifest ? path.resolve(process.cwd(), args.manifest) : DEFAULT_MANIFEST;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const assetIndex = new Map();
  for (const a of manifest.assets) {
    assetIndex.set(a.id, {
      file: a.file,
      slide: a.slide || 1,
      anchor: a.anchor || `asset:${a.id}`,
      master: a.master || 'standard', // manifest에 master 필드 없으면 standard로 취급
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

  let pres = automizer.loadRoot(masterFile).load(masterFile, 'base');

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
  }
  if (missing.length) {
    throw new Error(`manifest에 없는 에셋 ID: ${missing.join(', ')}`);
  }

  // ── HIGH-2 마스터 호환성 가드 ─────────────────────────────────────────────
  // 선택된 마스터의 kind와 어긋나는 에셋이 플랜에 하나라도 섞여 있으면 즉시 중단.
  const incompatible = [];
  for (const id of usedIds) {
    const meta = assetIndex.get(id);
    if (!meta) continue; // 위에서 이미 missing 처리
    if (meta.master !== masterKind) incompatible.push(`${id}(master=${meta.master})`);
  }
  if (incompatible.length) {
    throw new Error(
      `마스터 호환성 위반: --master ${masterFile}(kind=${masterKind}) 플랜에 비호환 에셋 포함 → ${incompatible.join(', ')}`
    );
  }

  for (const id of usedIds) {
    const meta = assetIndex.get(id);
    if (!fileToAlias.has(meta.file)) {
      const alias = `d${aliasSeq++}`;
      fileToAlias.set(meta.file, alias);
      pres = pres.load(path.join(LIB, meta.file), alias);
    }
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
          if (el.table) feats.push(el.merge_aware ? 'table(merge_aware)' : 'table');
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

  // ── HIGH-1 실패감지 보조: pptx-automizer는 "앵커를 못 찾음" 같은 실패를
  // addElement() 호출 시점에 던지지 않고, 실제 복사가 일어나는 pres.write() 내부에서
  // console.error로만 로깅하고 조용히 스킵한다(has-shapes.js getElementInfo 확인됨).
  // 이 케이스가 위의 try/catch(FAIL: 로그)에 잡히지 않아 exit 0으로 새어나가는 것을
  // 막기 위해 write() 구간에서만 console.error를 감시해 카운트한다.
  // TODO(pptx-automizer 버전업 시 재확인): 아래 문자열 매칭은 현재 설치 버전(0.8.2,
  // has-shapes.js getElementInfo)의 console.error 문구에 의존한다. 라이브러리를
  // 업그레이드하면 이 문구가 바뀌거나 로깅 방식(console.error → 예외 throw 등)이
  // 바뀔 수 있어 감지가 조용히 무력화될 위험이 있다. 버전업 시 반드시
  // `grep -rn "Can't find element on slide" node_modules/pptx-automizer/dist/`로
  // 문구 존재 여부를 재확인하고, 바뀌었다면 이 매칭 문자열도 함께 갱신할 것.
  let missingElementCount = 0;
  const origConsoleError = console.error;
  console.error = (...args) => {
    origConsoleError.apply(console, args);
    if (args.some(a => typeof a === 'string' && a.includes("Can't find element on slide"))) {
      missingElementCount++;
    }
  };

  // ── 모디파이어 예외 삼킴 실패감지: classes/shape.js의 applyCallbacks가 모디파이어에서
  // 던진 예외를 catch(e){console.warn(e)}로 삼켜 exit 0으로 새어나가게 한다
  // (BUILD_SPEC 병합셀 표 원칙 문서화 근거). mergeAwareTableText가 throw하는
  // Error("merge_aware table:"로 시작)뿐 아니라, merge_aware를 깜빡한 병합표에서
  // setTableData가 유발하는 TypeError(endParaRPr undefined 등, 메시지에
  // 'merge_aware table:'을 포함하지 않음)도 동일 경로(console.warn(e))로 삼켜진다
  // (재현 확인). 이 write() 구간에서 console.warn이 나는 유일한 경로가 위
  // applyCallbacks의 예외 삼킴뿐이므로(pptx-automizer 소스 grep 확인,
  // shape.js:154,166), 접두어 매칭 없이 write() 중 발생하는 모든 console.warn을
  // 실패로 카운트한다(오탐 없음 — code-reviewer 근거).
  let mergeAwareErrorCount = 0;
  const origConsoleWarn = console.warn;
  console.warn = (...args) => {
    origConsoleWarn.apply(console, args);
    mergeAwareErrorCount++;
  };

  try {
    await pres.write(outName);
  } finally {
    console.error = origConsoleError;
    console.warn = origConsoleWarn;
  }

  log.forEach(l => console.log('  ' + l));
  console.log(`WROTE ${path.join(outputDir, outName)}`);

  // ── HIGH-1 실패감지 ────────────────────────────────────────────────────
  // addElement 실패는 로그 라인에 " FAIL: "로 기록된다(placed.push 참고).
  // 하나라도 있으면(또는 write() 중 앵커 미발견이 있으면) 산출물은 그대로 두되(디버깅용)
  // 비정상 종료로 상위 파이프라인에 알린다.
  const failCount = log.reduce((n, l) => n + (l.match(/ FAIL: /g) || []).length, 0) + missingElementCount + mergeAwareErrorCount;
  if (failCount > 0) {
    console.log(`⚠ ${failCount}건 실패`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('COMPOSE FAIL:', e && e.stack ? e.stack : e);
  process.exit(1);
});
