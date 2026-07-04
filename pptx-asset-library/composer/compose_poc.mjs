import { Automizer, ModifyTextHelper, ModifyShapeHelper } from 'pptx-automizer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(__dirname, '..'); // pptx-asset-library root

const EMU = px => Math.round(px * 9525); // px@96dpi -> EMU

const mode = process.argv[2] || 'A';

const automizer = new Automizer({
  templateDir: __dirname,
  outputDir: path.join(__dirname, 'out'),
  removeExistingSlides: true,
  autoImportSlideMasters: false,
});

const pres = automizer
  .loadRoot('base.pptx')
  .load('base.pptx', 'base')
  .load(path.join(LIB, 'decks/01_tables/TBL_header-styles_v1.pptx'), 'tbl')
  .load(path.join(LIB, 'decks/02_kpi/KPI_cards_v1.pptx'), 'kpi')
  .load(path.join(LIB, 'decks/03_process/PRC_chevron_v1.pptx'), 'prc')
  .load(path.join(LIB, 'decks/09_headers/HDR_section-pill_v1.pptx'), 'hdr');

if (mode === 'A') {
  // METHOD A: one blank output slide, addElement named assets from each deck
  pres.addSlide('base', 1, (slide) => {
    // HDR pill background (anchor is hollow) + its content siblings
    slide.addElement('hdr', 1, 'asset:HDR-001', [ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(30) })]);
    slide.addElement('hdr', 1, 'Rectangle 4', [ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(30) })]);
    slide.addElement('hdr', 1, 'Rectangle 5', [
      ModifyShapeHelper.setPosition({ x: EMU(118), y: EMU(30) }),
      ModifyTextHelper.setText('수출 역량진단'),
    ]);

    // TBL graphicFrame (self-contained) + a cell text replace
    slide.addElement('tbl', 1, 'asset:TBL-001', [ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(140) })]);

    // KPI: anchor hollow -> bring first card bg + value/label textboxes
    slide.addElement('kpi', 1, 'TextBox 5', [
      ModifyShapeHelper.setPosition({ x: EMU(700), y: EMU(160) }),
      ModifyTextHelper.setText('1,000 건'),
    ]);
    slide.addElement('kpi', 1, 'TextBox 6', [ModifyShapeHelper.setPosition({ x: EMU(700), y: EMU(250) })]);

    // PRC chevrons
    slide.addElement('prc', 1, 'Chevron 4', [ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(430) })]);
    slide.addElement('prc', 1, 'Chevron 5', [ModifyShapeHelper.setPosition({ x: EMU(430), y: EMU(430) })]);
    slide.addElement('prc', 1, 'Chevron 6', [ModifyShapeHelper.setPosition({ x: EMU(800), y: EMU(430) })]);
  });
} else {
  // METHOD B: import whole slides + modifyElement text replace
  pres.addSlide('hdr', 1, (slide) => {
    slide.modifyElement('Rectangle 5', [ModifyTextHelper.setText('수출 역량진단')]);
  });
  pres.addSlide('tbl', 1);
  pres.addSlide('kpi', 1, (slide) => {
    slide.modifyElement('TextBox 5', [ModifyTextHelper.setText('1,234 건')]);
  });
  pres.addSlide('prc', 1);
}

const out = mode === 'A' ? 'composed.pptx' : 'composed_B.pptx';
pres.write(out).then((s) => {
  console.log('OK mode', mode, '->', out, JSON.stringify(s?.duration ? { ms: s.duration } : s ?? {}));
}).catch((e) => {
  console.error('FAIL mode', mode, e && e.stack ? e.stack : e);
  process.exit(1);
});
