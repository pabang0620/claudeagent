import { Automizer, ModifyTableHelper } from 'pptx-automizer';
import path from 'path'; import { fileURLToPath } from 'url';
const __d=path.dirname(fileURLToPath(import.meta.url));
const LIB=path.resolve(__d,'..');
const a=new Automizer({templateDir:__d,outputDir:path.join(__d,'out'),removeExistingSlides:true});
a.loadRoot('base.pptx').load('base.pptx','base')
 .load(path.join(LIB,'decks/01_tables/TBL_header-styles_v1.pptx'),'tbl');
a.addSlide('tbl',1,(slide)=>{
  slide.modifyElement('asset:TBL-001',[
    ModifyTableHelper.setTableData({
      body:[
        {values:['평가항목','현행','개선']},
        {values:['수출 역량진단','부족','우수']},
        {values:['해외 판로','제한적','확대']},
      ]
    })
  ]);
});
a.write('cell_test.pptx').then(()=>console.log('CELL OK')).catch(e=>{console.error('CELL FAIL',e.message);process.exit(1)});
