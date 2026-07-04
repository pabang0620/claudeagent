import { Automizer, ModifyShapeHelper } from 'pptx-automizer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(__dirname, '..');
const EMU = px => Math.round(px * 9525);

const automizer = new Automizer({
  templateDir: __dirname,
  outputDir: path.join(__dirname, 'out'),
  removeExistingSlides: true,
  autoImportSlideMasters: false,
});

const pres = automizer
  .loadRoot('base.pptx')
  .load('base.pptx', 'base')
  .load(path.join(LIB, 'decks/09_headers/HDR_section-pill_v1.pptx'), 'hdr')
  .load(path.join(LIB, 'decks/02_kpi/KPI_cards_v1.pptx'), 'kpi')
  .load(path.join(LIB, 'decks/03_process/PRC_chevron_v1.pptx'), 'prc')
  .load(path.join(LIB, 'decks/01_tables/TBL_header-styles_v1.pptx'), 'tbl');

const results = [];

pres.addSlide('base', 1, (slide) => {
  // HDR-001 is a single sp (NOT a group) — addElement single shape (fallback case)
  try {
    slide.addElement('hdr', 1, 'asset:HDR-001', [ModifyShapeHelper.setPosition({ x: EMU(40), y: EMU(20) })]);
    results.push('HDR-001 addElement(single sp) OK');
  } catch (e) { results.push('HDR-001 FAIL ' + e.message); }

  // KPI-001 grpSp (13 sp children)
  try {
    slide.addElement('kpi', 1, 'asset:KPI-001', [ModifyShapeHelper.setPosition({ x: EMU(40), y: EMU(120) })]);
    results.push('KPI-001 addElement(grpSp) OK');
  } catch (e) { results.push('KPI-001 FAIL ' + e.message); }

  // PRC-001 grpSp (5 sp children)
  try {
    slide.addElement('prc', 1, 'asset:PRC-001', [ModifyShapeHelper.setPosition({ x: EMU(40), y: EMU(320) })]);
    results.push('PRC-001 addElement(grpSp) OK');
  } catch (e) { results.push('PRC-001 FAIL ' + e.message); }

  // TBL-001 grpSp (graphicFrame table + 1 sp label)
  try {
    slide.addElement('tbl', 1, 'asset:TBL-001', [ModifyShapeHelper.setPosition({ x: EMU(40), y: EMU(430) })]);
    results.push('TBL-001 addElement(grpSp w/ table) OK');
  } catch (e) { results.push('TBL-001 FAIL ' + e.message); }
});

pres.write('group_test.pptx').then((s) => {
  console.log('WRITE OK -> out/group_test.pptx');
  results.forEach(r => console.log('  ' + r));
}).catch((e) => {
  console.error('WRITE FAIL', e && e.stack ? e.stack : e);
  results.forEach(r => console.log('  ' + r));
  process.exit(1);
});
