import { Automizer, ModifyShapeHelper, ModifyTableHelper, ModifyChartHelper } from 'pptx-automizer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(__dirname, '..');
const EMU = px => Math.round(px * 9525);

// Custom modifier: replace text of a named child shape inside a copied element (group or sp)
function replaceChildText(childName, matchText, newText) {
  return (element) => {
    const cNvPrs = element.getElementsByTagName('p:cNvPr');
    for (let i = 0; i < cNvPrs.length; i++) {
      if (cNvPrs[i].getAttribute('name') === childName) {
        let sp = cNvPrs[i].parentNode;
        while (sp && sp.nodeName !== 'p:sp') sp = sp.parentNode;
        if (!sp) return;
        const ts = sp.getElementsByTagName('a:t');
        for (let j = 0; j < ts.length; j++) {
          if (matchText === null || ts[j].textContent.includes(matchText)) {
            while (ts[j].firstChild) ts[j].removeChild(ts[j].firstChild);
            ts[j].appendChild(ts[j].ownerDocument.createTextNode(newText));
            return;
          }
        }
      }
    }
  };
}

const automizer = new Automizer({
  templateDir: __dirname,
  outputDir: path.join(__dirname, 'out'),
  removeExistingSlides: true,
  autoImportSlideMasters: false,
});

const pres = automizer
  .loadRoot('base.pptx')
  .load('base.pptx', 'base')
  .load(path.join(LIB, 'decks/10_backgrounds/BGP_cover_v1.pptx'), 'bgp')
  .load(path.join(LIB, 'decks/09_headers/HDR_section-pill_v1.pptx'), 'hdr')
  .load(path.join(LIB, 'decks/01_tables/TBL_header-styles_v1.pptx'), 'tbl')
  .load(path.join(LIB, 'decks/02_kpi/KPI_cards_v1.pptx'), 'kpi')
  .load(path.join(LIB, 'decks/03_process/PRC_chevron_v1.pptx'), 'prc')
  .load(path.join(LIB, 'decks/08_charts/CHT_bar_v1.pptx'), 'cht');

const log = [];

// ── SLIDE 1: 표지 (BGP 배경 그룹 + 제목 텍스트 치환) ──
pres.addSlide('base', 1, (slide) => {
  slide.addElement('bgp', 1, 'asset:BGP-001', [
    // 표지 제목 치환 (TextBox 8 = "사업명")
    replaceChildText('TextBox 8', '사업명', '콘텐츠 해외진출 지원사업 제안'),
    // 라이브러리 캡션 제거(정리)
    replaceChildText('TextBox 1', 'BGP-001', ''),
  ]);
  log.push('slide1: BGP-001 group + 제목 텍스트 치환');
});

// ── SLIDE 2: 섹션헤더 + 표(셀 치환) + KPI(숫자 치환) ──
pres.addSlide('base', 1, (slide) => {
  // 섹션 헤더 (단일 sp, 텍스트 유지: "사업추진 전략")
  slide.addElement('hdr', 1, 'asset:HDR-001', [
    ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(50) }),
  ]);
  // 표 (그룹 안 네이티브 테이블) + 셀 텍스트 치환
  slide.addElement('tbl', 1, 'asset:TBL-001', [
    ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(170) }),
    ModifyTableHelper.setTableData({
      body: [
        { values: ['평가항목', '현행', '개선'] },
        { values: ['수출역량진단', '미흡', '우수'] },
        { values: ['해외 판로', '제한적', '확대'] },
        { values: ['성과관리', '부재', '체계화'] },
      ],
    }),
  ]);
  // KPI 카드 그룹 + 첫 카드 숫자 치환
  slide.addElement('kpi', 1, 'asset:KPI-001', [
    ModifyShapeHelper.setPosition({ x: EMU(690), y: EMU(190) }),
    replaceChildText('TextBox 5', '1,000', '3,200'),
  ]);
  log.push('slide2: HDR-001(단일 sp) + TBL-001(표셀 치환) + KPI-001(숫자 치환)');
});

// ── SLIDE 3: 프로세스 + 차트(데이터 치환) ──
pres.addSlide('base', 1, (slide) => {
  slide.addElement('prc', 1, 'asset:PRC-001', [
    ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(90) }),
  ]);
  slide.addElement('cht', 1, 'asset:CHT-001', [
    ModifyShapeHelper.setPosition({ x: EMU(60), y: EMU(300) }),
    ModifyChartHelper.setChartData({
      series: [{ label: '2025 수출액(백만$)' }],
      categories: [
        { label: '게임', values: [7200] },
        { label: '음악', values: [1580] },
        { label: '방송', values: [1120] },
        { label: '영화', values: [710] },
        { label: '캐릭터', values: [820] },
      ],
    }),
  ]);
  log.push('slide3: PRC-001(그룹) + CHT-001(차트 데이터 치환)');
});

pres.write('demo_proposal.pptx').then(() => {
  log.forEach(l => console.log('  ' + l));
  console.log('WROTE out/demo_proposal.pptx');
}).catch((e) => {
  log.forEach(l => console.log('  ' + l));
  console.error('WRITE FAIL', e && e.stack ? e.stack : e);
  process.exit(1);
});
