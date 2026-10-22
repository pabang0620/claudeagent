import sys, copy, json
sys.path.insert(0,__import__('os').path.dirname(__file__))
from lib import *
SP=sys.argv[2] if len(sys.argv)>2 else '.'  # 작업 폴더(ref.pptx, cfg_xlsx.json 위치)
OUT=sys.argv[1]
prs=Presentation(SP+'ppt/ref.pptx')
base=prs.slides[13]
X=json.load(open(SP+'cfg_xlsx.json'))
bands={}
for a,n,v,s,note in X['bands']: bands.setdefault(n,[]).append((v,s,note))
def fmt(v):
    if isinstance(v,float) and v.is_integer(): v=int(v)
    return f'{v:,}' if isinstance(v,int) else str(v)
def btxt(name,u):
    out=[]
    for v,s,note in bands[name]:
        if u=='R': t='그 외' if v==1900 else ('올해' if v==2026 else f'{2026-v}년 전까지')
        elif v==-999999: t='그 외'
        else: t=(note if note else f'{fmt(v)}{u}↑')
        out.append(f'{t} {s}')
    return ' / '.join(out)
def gmax(names): return sum(max(0,max(s for _,s,_ in bands[n])) for n in names)

def new_slide(title,kind,notes):
    s=prs.slides.add_slide(base.slide_layout)
    for ph in list(s.placeholders): ph._element.getparent().remove(ph._element)
    for sh in base.shapes:
        if sh.name in ('Rectangle 75','Table 76'): continue
        s.shapes._spTree.append(copy.deepcopy(sh._element))
    frame(s,title,kind,notes)
    return s
DB='□ 사용자 □ 관리자 ■ DB □ 기타'
ETC='□ 사용자 □ 관리자 ■ DB ■ 기타'
Y0=990000
R=188441

# ---- 개정이력
rv=[sh for sh in prs.slides[1].shapes if sh.has_table][0].table
vals=['1.0.0','2026-10-20','최초작성','비즈니스 POOL DB 반영 기획 (엑셀 기준 DB 구조·산출 로직)','','']
for j,v in enumerate(vals):
    tf=rv.cell(2,j).text_frame; p=tf.paragraphs[0]
    if p.runs: p.runs[0].text=v; [r._r.getparent().remove(r._r) for r in p.runs[1:]]
    elif v: p.add_run().text=v
    if not v and p._p.find('{%s}endParaRPr'%A) is None:
        p._p.append(etree.fromstring(f'<a:endParaRPr xmlns:a="{A}" lang="ko-KR" sz="1000"/>'))
s2=prs.slides[1]
if not any(sh.name=='TopMask' for sh in s2.shapes):
    s2.shapes._spTree.append(etree.fromstring(f'<p:sp xmlns:p="{NS["p"]}" xmlns:a="{A}"><p:nvSpPr><p:cNvPr id="9001" name="TopMask"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="118000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr></p:sp>'))
    s2.shapes._spTree.append(etree.fromstring(f'<p:sp xmlns:p="{NS["p"]}" xmlns:a="{A}"><p:nvSpPr><p:cNvPr id="9002" name="TopMask2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="8500000" y="132000"/><a:ext cx="3500000" cy="22000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr></p:sp>'))

# ---- 3. 개요
s=new_slide('개요 · 개발 범위 요약',ETC,[
 '엑셀: 국내기업 현행화리스트, 배점관리, 프로필 차트 시트 기준',
 '해외(영문) 기업은 이번 범위에서 제외(보류)',
 '기존 웰콘 테이블·공통코드는 바꾸지 않음',
 '계산은 매월 1일 + 배점을 고친 즉시. 화면 검색은 저장된 결과만 읽음'])
bar(s,X0,Y0,W0,'1. 무엇을 만드나요')
y=dotlist(s,X0,Y0+260000,W0,[
 '비즈니스 풀 엑셀(국내 4,031곳)의 점수·등급 계산을 웰콘 관리자 페이지로 옮긴다. 항목·배점·등급 규칙은 엑셀과 같다',
 '사업안정성(F1~F5) 15개 항목 + 활동성(A1~A5) 14개 항목 → 백분율 등급(F1A2 형식), 점수 등급, 종합등급(S~D), 프로필 차트 8개 묶음 비율',
 '웰콘 DB에 이미 있는 값(활동성)은 기존 테이블에서 바로 꺼내고, 없는 값(NICE 사업안정성)만 새 테이블에 넣는다',
 '점수는 매월 1일 한 번 계산해 점수 테이블에 저장하고, 화면 검색·필터는 이 저장값을 읽는다. 관리자가 배점을 고치면 그때 즉시 다시 계산한다'])
y=y+120000
bar(s,X0,y,W0,'2. 데이터는 두 곳에서 온다')
table(s,X0,y+260000,W0,[1.3,3,3.6,2.4],[
 ['구분','항목','어디서','갱신'],
 ['사업안정성','15개 (업력, 종업원수, 신용등급, 영업이익률 등)','새 테이블 TW_BIZPOOL_NICE_COMP (NICE D&B 추출 값 적재)','새 NICE 자료를 받을 때 다시 적재'],
 ['활동성','14개 (로그인, 콘텐츠, 행사·실적, 매출·수상 등)','웰콘 기존 테이블 10개에서 집계','매월 1일에 집계해 점수 테이블에 함께 저장'],
 ['화면 표시·필터','장르, 회사유형, 희망비즈니스, 행사국가, 활성여부','웰콘 기존 테이블 (장르매핑, 행사, 코드세부, 셀러)','조회할 때 그 시점 값'],
],bold_col0=True)
y=y+260000+R*4+250000
bar(s,X0,y,W0,'3. IDC 개발 범위 한눈에 보기')
table(s,X0,y+260000,W0,[1.3,6.4,2.6],[
 ['구분','개발 항목','상세 장'],
 ['DB','새 테이블 4개: NICE 값, 점수·등급, 항목 배점, 등급 구간','DB 설계 2장'],
 ['초기 데이터','NICE 값 4,031행, 항목 배점 116행, 등급 구간 30행 (엑셀 값)','NICE 값 적재'],
 ['계산','점수·등급 계산 1벌. 매월 1일 실행, 배점을 고친 즉시 실행','산출 규칙, 매월 계산 순서'],
 ['화면','배점 설정 화면 (화면은 별도 설계)','배점 설정'],
],bold_col0=True)

# ---- 4. 데이터 흐름
s=new_slide('데이터 흐름 · 계산 주기',DB,[
 '①은 처음 1번, 새 NICE 자료를 받으면 다시',
 '②는 매월 1일에만 실행. 집계한 활동성 원값은 TW_BIZPOOL_EVL에 저장',
 '배점 수정·NICE 재적재 때는 ②를 건너뛰고 저장된 그달 원값으로 ③~⑤ 실행',
 '화면 검색·필터는 TW_BIZPOOL_EVL을 읽기만 하고 계산하지 않음'])
bar(s,X0,Y0,W0,'데이터 흐름: 계산해서 저장해 두고, 화면은 저장된 결과를 읽는다')
bw=1650000; gap=(W0-bw*5)//4
items=[('① NICE 값 적재','TW_BIZPOOL_NICE_COMP\n셀러당 1행 (4,031행)'),('② 활동성 집계','매월 1일, 기존 테이블 10개\n셀러별 14개 원값'),
       ('③ 항목 점수','TW_BIZPOOL_SCORE_ITEM\n구간표로 점수'),('④ 등급·순위','TW_BIZPOOL_GRADE_CFG\n전체 셀러 비교'),('⑤ 결과 저장','TW_BIZPOOL_EVL\n원값·점수·등급 덮어쓰기')]
for k,(t,b) in enumerate(items):
    x=X0+k*(bw+gap); box(s,x,Y0+300000,bw,620000,t,b)
    if k<4: arrow(s,x+bw+(gap-150000)//2,Y0+300000+220000)
y=Y0+1100000
sub(s,X0,y,W0,'계산하는 때 (이때만 계산하고, 그 밖에는 저장된 결과를 읽기만 한다)')
table(s,X0,y+230000,W0,[2.2,6,2],[
 ['언제','무엇을','활동성 원값'],
 ['매월 1일 (정기)','활동성 14개를 집계해 저장하고 점수·백분율·순위·등급을 계산해 저장 (②~⑤)','그날 새로 집계'],
 ['배점·등급 구간을 고쳤을 때','저장하는 즉시 점수·백분율·순위·등급을 다시 계산 (③~⑤)','그달 1일에 저장한 값'],
 ['새 NICE 자료를 적재했을 때','적재 후 점수·백분율·순위·등급을 다시 계산 (③~⑤)','그달 1일에 저장한 값'],
],bold_col0=True)
y=y+230000+R*4+250000
callout(s,X0,y,W0,'전체를 같이\n계산하는 이유',[
 '백분율, 순위, 백분율 등급, 종합등급은 전체 셀러를 줄 세워 정하는 값이다. 한 셀러의 점수만 바뀌어도 다른 셀러의 순위·등급이 바뀔 수 있다',
 '배점을 고쳐 다시 계산할 때도 활동성 값은 그달 1일에 저장한 값을 쓰므로, 결과는 계속 매월 1일 기준으로 유지된다',
 '업력·최신성의 경과 년수는 활동성 집계일(매월 1일)의 해를 기준으로 구한다'])

# ---- 5. 산출 규칙
s=new_slide('산출 규칙 (엑셀과 같음)',DB,[
 '등급 구간·배점의 처음 값은 엑셀 배점관리 시트',
 '경계값: 사업안정성·활동성은 백분율이 경계와 같으면 아래 등급(정확히 10%면 F2), 종합은 위 등급(정확히 10%면 S)',
 '점수 등급은 축 항목 점수 합으로 비교 (지금 만점은 둘 다 100)',
 '휴폐업·제한기업도 점수·순위를 똑같이 매김'])
bar(s,X0,Y0,W0,'1. 산출 순서')
bw=2100000; gap=(W0-bw*4)//3
items=[('항목 점수','29개 항목마다 구간표에서 점수\n빈 값은 점수 없음'),('축 점수','사업안정성 15개 합\n활동성 14개 합'),
       ('환산·종합','축 합 ÷ 축 만점 × 100\n종합 = 두 환산점수의 평균'),('백분율·순위·등급','전체 셀러 비교\n등급 구간 적용')]
for k,(t,b) in enumerate(items):
    x=X0+k*(bw+gap); box(s,x,Y0+270000,bw,520000,t,b)
    if k<3: arrow(s,x+bw+(gap-150000)//2,Y0+270000+170000)
y=Y0+900000
bar(s,X0,y,W0,'2. 등급 구간 (처음 값)')
table(s,X0,y+260000,W0,[0.8,2,2,2,0.8,1.6,1.4],[
 ['순서','사업안정성 백분율 등급','활동성 백분율 등급','사업안정성·활동성 점수 등급','종합','종합 백분율 등급','종합 점수 등급'],
 ['1','F1 10% 미만','A1 10% 미만','F1·A1 80점 이상','S','10% 이하','80점 이상'],
 ['2','F2 10~25%','A2 10~25%','F2·A2 60점 이상','A','10~25%','60점 이상'],
 ['3','F3 25~45%','A3 25~45%','F3·A3 40점 이상','B','25~45%','40점 이상'],
 ['4','F4 45~70%','A4 45~70%','F4·A4 20점 이상','C','45~70%','20점 이상'],
 ['5','F5 70% 이상','A5 70% 이상','F5·A5 그 외','D','70% 초과','그 외'],
],aligns=['ctr']*7)
y=y+260000+R*6+230000
bar(s,X0,y,W0,'3. 세부 규칙')
table(s,X0,y+260000,W0,[1.5,8.5],[
 ['규칙','내용'],
 ['백분율','1 - 전체 셀러 중 백분위 순위 (엑셀 PERCENTRANK.INC). 0에 가까울수록 상위. 사업안정성·활동성·종합 각각 계산'],
 ['등급 표기','백분율 등급과 점수 등급 모두 사업안정성 등급 + 활동성 등급을 붙여 F1A2 형식. 종합등급은 S~D'],
 ['순위·동점','점수 높은 순. 동점이면 종합은 사업안정성 점수, 사업안정성은 활동성 점수, 활동성은 사업안정성 점수가 높은 쪽이 위'],
 ['빈 값','원값이 비면 그 항목은 점수 없음(합계에 0). 값은 있는데 어느 구간에도 안 걸리면 0점. NICE 값이 없는 셀러는 사업안정성 15개가 모두 빈 값'],
 ['묶음 비율','묶음 점수 합(음수면 0) ÷ 묶음 최고점. 프로필 차트 8축 (기업 규모, 재무 건전성, 사업 보유 역량, 재무 안정성, 활동성, 콘텐츠 준비성, 해외진출 역량, 활동 보유 역량)'],
 ['만점·최고점','항목 최고점 = 그 항목 구간 점수 중 최댓값(음수면 0). 축 만점 = 사용하는 항목 최고점 합'],
 ['제외 표시','휴폐업(NICE) 또는 제한여부 Y. 점수·순위·등급은 똑같이 계산하고 화면의 "제외" 표시와 숨기기 필터에만 씀'],
 ['기준 연도','업력·최신성의 경과 년수는 활동성 집계일(매월 1일)의 해 기준 (엑셀은 2026년 고정)'],
],bold_col0=True)

# ---- 6. 사업안정성
G1=[('기업 규모',[('업력','FOUNDATION_DATE → 집계일의 해 - 설립연도','년'),('종업원수','EMPLOYEE_CO','명'),('인원변동률','STAFF_CHANGE_RATE (국민연금 입·퇴사)','%')]),
 ('재무 건전성',[('신용등급','CREDIT_GRADE_VALUE (AAA 10 ~ D 1, NG 0)',''),('매출액영업이익률','OPRT_PROFIT_RATE_AVG (3개년 평균)','%'),('부채비율','DEBT_RATE_AVG (3개년 평균)','%'),('매출증가율','SALES_INCRS_RATE','%'),('영업이익증가율','OPRT_PROFIT_INCRS_RATE','%')]),
 ('사업 보유 역량',[('인증정보','CERT_CO','건'),('특허','PATENT_CO','건'),('실용신안','UTILITY_MODEL_CO','건')]),
 ('재무 안정성',[('현금흐름등급','CASHFLOW_GRADE_VALUE (A 6 ~ E 1)',''),('단기연체','SHRTTRM_OVRDUE_CO (1백만원 이상)','건'),('채무불이행','DEBT_DFLT_CO (1백만원 이상)','건'),('공공기록','PUBLIC_RECORD_CO (1백만원 이상 체납)','건')])]
gm=' / '.join(f'{g} {gmax([i[0] for i in its])}' for g,its in G1)
s=new_slide('사업안정성 15개 항목 계산식',DB,[
 '원값은 모두 TW_BIZPOOL_NICE_COMP (셀러당 1행)',
 '구간은 위에서부터 먼저 맞는 것 하나만 적용, 어디에도 안 걸리면 0점',
 '묶음 최고점: '+gm+' (만점 100)',
 '인원변동률·단기연체·채무불이행·공공기록은 감점 항목(최고점 0)',
 '신용등급·현금흐름등급은 등급 문자를 수치로 바꿔 넣고 수치로 비교'])
bar(s,X0,Y0,W0,'사업안정성 15개 항목: 어느 칸의 값으로 계산하는지 (TW_BIZPOOL_NICE_COMP)')
rows=[['No','묶음','항목','원값 컬럼','구간 → 점수 (처음 값)']]
n=0
for g,its in G1:
    for name,col,u in its:
        n+=1; rows.append([str(n),g,name,col,btxt(name,u)])
table(s,X0,Y0+260000,W0,[0.35,1.05,1.25,3.0,4.6],rows,aligns=['ctr','l','l','l','l'])

# ---- 7. 활동성
G2=[('활동성',[('최종 로그인 최신성','소속 회원 마지막 로그인 연도 중 최댓값 → 경과 년수','TW_MEMBER.LOGIN_DT (셀러↔회원: COMTNEMPLYRSCRTYESTBS)','R'),
   ('프로필 최종수정 최신성','셀러 정보 수정 연도 → 경과 년수','TW_SELLER.UPDATE_DT','R'),
   ('정보 충실도','8칸 중 값이 있는 칸 수','TW_SELLER: COMPANY_NAME_EN, COMPANY_ZIP, SITE_URL, MOVIE_URL, INTRO_KO, INTRO_EN, BIZ_KO, BIZ_EN','칸')]),
 ('콘텐츠 준비성',[('등록 콘텐츠 건수','셀러별 행 수','TW_SELLER_CONTENTS','건'),('최신 콘텐츠 연도','YEAR 최댓값 → 경과 년수','TW_SELLER_CONTENTS.YEAR','R'),('마켓플레이스 콘텐츠 건수','셀러별 행 수','WP_PROD_MST (마켓플레이스 DB)','건')]),
 ('해외진출 역량',[('행사 신청 건수','셀러별 행 수 (기간 제한 없음)','TW_SELLER_APPLY','건'),('실적 등록 건수','셀러별 행 수','TW_EVENT_RESULT','건'),('상담액 평균','상담액 평균','TW_EVENT_RESULT.COUNSEL_AMOUNT',''),('계약액 평균','계약액 평균','TW_EVENT_RESULT.CONTRACT_AMOUNT','')]),
 ('활동 보유 역량',[('수혜 현황 등록 건수','셀러별 행 수','TW_SELLER_SUPPORT','건'),('해외 매출 현황 등록 건수','SALES_TYPE_CD가 O인 행 수','TW_SELLER_SALES','건'),('국내 매출 현황 등록 건수','SALES_TYPE_CD가 D인 행 수','TW_SELLER_SALES','건'),('수상 현황 등록 건수','셀러별 행 수','TW_SELLER_AWARDS','건')])]
gm2=' / '.join(f'{g} {gmax([i[0] for i in its])}' for g,its in G2)
s=new_slide('활동성 14개 항목 계산식',DB,[
 '셀러(SELLER_ID) 단위로 집계',
 '경과 년수 = 활동성 집계일(매월 1일)의 해 - 그 연도',
 '8/25 추출 DB로 이 방법대로 집계한 값이 엑셀과 일치: 4,031곳 (정보 충실도 4,020곳, 상담액 4,026곳, 계약액 4,019곳)',
 '묶음 최고점: '+gm2+' (만점 100)',
 '매월 1일에만 집계하고, 집계한 원값 14개를 TW_BIZPOOL_EVL에 저장 (배점 수정 때 재사용)'])
bar(s,X0,Y0,W0,'활동성 14개 항목: 어느 테이블의 어떤 값으로 계산하는지 (셀러 = SELLER_ID)')
rows=[['No','묶음','항목','계산식','원천 테이블.컬럼','구간 → 점수 (처음 값)']]
n=0
for g,its in G2:
    for name,calc,src,u in its:
        n+=1; rows.append([str(n),g,name,calc,src,btxt(name,u)])
table(s,X0,Y0+260000,W0,[0.35,1.0,1.5,2.0,2.8,2.6],rows,aligns=['ctr','l','l','l','l','l'])

# ---- 8. 표시·필터
s=new_slide('화면 표시 · 필터 값의 출처',DB,[
 '점수 계산에는 쓰지 않고 목록·필터에만 쓰는 값',
 '따로 저장하지 않고 조회할 때 기존 테이블에서 꺼냄',
 '엑셀 대조는 8/25 추출 DB 기준'])
bar(s,X0,Y0,W0,'화면에 보여 주거나 걸러 보는 값: 기존 웰콘 테이블에서 꺼낸다')
table(s,X0,Y0+260000,W0,[1.5,2.6,4.4,1.5],[
 ['값','원천','꺼내는 방법','엑셀 대조'],
 ['장르','TW_GENRE_MAPPING → CO_CODE_DTL','TABLE_NAME이 TW_SELLER인 행(DATA_ID = SELLER_ID)과 TW_SELLER_APPLY인 행(DATA_ID = APPLY_ID)을 셀러별로 합침. FIELD_NAME이 GENRE_CDS인 행. 코드는 CO_CODE_DTL.CODE_NAME_KO로 이름 변환','4,031곳 일치'],
 ['회사유형','위와 같음','FIELD_NAME이 *_COMPANY_CDS인 행','4,031곳 일치'],
 ['희망비즈니스','위와 같음','FIELD_NAME이 *_BIZ_CDS인 행','4,031곳 일치'],
 ['행사국가','TW_SELLER_APPLY → TW_EVENT → CO_CODE_DTL','셀러가 신청한 행사(EVENT_ID)의 COUNTRY_CD를 셀러별로 모아 이름으로 변환','국가 개수 4,030곳 일치'],
 ['활성여부','TW_SELLER.ENABLE_YN','그대로','-'],
 ['제외 표시','TW_BIZPOOL_NICE_COMP.CLSBIZ_SE_NAME, TW_SELLER.RSTR_YN','휴업·폐업이거나 제한여부 Y면 "제외" 표시','-'],
],bold_col0=True)

# ---- 9. DB 설계 1
s=new_slide('DB 설계: 새 테이블 ① ②',DB,[
 '두 테이블 모두 SELLER_ID가 PK (셀러당 1행)',
 '①은 웰콘 DB에 없는 NICE 값만 담음 (회사명·사업자번호는 TW_SELLER에 있음)',
 '②는 계산할 때마다 덮어씀. 활동성 원값 14개는 매월 1일에만 새로 채움',
 '등급은 글자로 저장 (공통코드 추가 없음)',
 'INSERT_ID·DT, UPDATE_ID·DT는 웰콘 공통 컬럼'])
hw=(W0-150000)//2
sub(s,X0,Y0,hw,'① TW_BIZPOOL_NICE_COMP 국내 사업안정성 정보')
nice=[['SELLER_ID','셀러ID','VARCHAR(20)','PK, TW_SELLER'],['FOUNDATION_DATE','설립일','VARCHAR(8)','업력 계산'],['EMPLOYEE_CO','종업원수','INT',''],['STAFF_CHANGE_RATE','인원변동률','DOUBLE(18,4)',''],
 ['CREDIT_GRADE_VALUE','신용등급수치','INT','AAA 10 ~ NG 0'],['OPRT_PROFIT_RATE_AVG','매출액영업이익률평균','DOUBLE(18,4)','3개년'],['DEBT_RATE_AVG','부채비율평균','DOUBLE(18,4)','3개년'],['SALES_INCRS_RATE','매출증가율','DOUBLE(18,4)',''],
 ['OPRT_PROFIT_INCRS_RATE','영업이익증가율','DOUBLE(18,4)',''],['CERT_CO','인증수','INT',''],['PATENT_CO','특허수','INT',''],['UTILITY_MODEL_CO','실용신안수','INT',''],['CASHFLOW_GRADE_VALUE','현금흐름등급수치','INT','A 6 ~ E 1'],
 ['SHRTTRM_OVRDUE_CO','단기연체수','INT',''],['DEBT_DFLT_CO','채무불이행수','INT',''],['PUBLIC_RECORD_CO','공공기록수','INT',''],['CLSBIZ_SE_NAME','휴폐업구분이름','VARCHAR(100)','제외 표시'],['DELETE_YN','삭제여부','VARCHAR(1)',''],
 ['INSERT_ID·DT / UPDATE_ID·DT','공통','','']]
table(s,X0,Y0+230000,hw,[2.3,1.9,1.4,1.4],[['컬럼','이름','타입','설명']]+nice,rowh=170000)
sub(s,X0+hw+150000,Y0,hw,'② TW_BIZPOOL_EVL 점수·등급')
evl=[['SELLER_ID','셀러ID','VARCHAR(20)','PK, TW_SELLER'],['STBL_SCORE / PCNT / RANK','사업안정성 점수·백분율·순위','DOUBLE / INT',''],['ACT_SCORE / PCNT / RANK','활동성 점수·백분율·순위','DOUBLE / INT',''],
 ['TOTAL_SCORE / PCNT / RANK','종합 점수·백분율·순위','DOUBLE / INT','100점 환산'],['COMPANY_SCALE_RATE','기업규모비율','DOUBLE(18,4)','0~1'],['FNNR_SOUNDNESS_RATE','재무건전성비율','DOUBLE(18,4)','0~1'],['BIZ_CAPABILITY_RATE','사업보유역량비율','DOUBLE(18,4)','0~1'],
 ['FNNR_STABILITY_RATE','재무안정성비율','DOUBLE(18,4)','0~1'],['ACTIVITY_RATE','활동성비율','DOUBLE(18,4)','0~1'],['CONTENTS_READINESS_RATE','콘텐츠준비성비율','DOUBLE(18,4)','0~1'],['OVSEA_EXPANSION_RATE','해외진출역량비율','DOUBLE(18,4)','0~1'],
 ['ACTIVITY_CAPABILITY_RATE','활동보유역량비율','DOUBLE(18,4)','0~1'],
 ['ACT_BASE_DT','활동성 집계일','DATETIME','매월 1일'],['LOGIN_YEAR / PROFILE_UPDT_YEAR','최종 로그인·프로필 수정 연도','INT','활동성 원값'],
 ['INFO_FILL_CO / CONTENTS_CO','정보충실도 칸 수·콘텐츠 수','INT','활동성 원값'],['LATEST_CONTENTS_YEAR / MARKET_CONTENTS_CO','최신 콘텐츠 연도·마켓 콘텐츠 수','INT','활동성 원값'],
 ['EVENT_APPLY_CO / EVENT_RESULT_CO','행사 신청 수·실적 수','INT','활동성 원값'],['COUNSEL_AMOUNT_AVG / CONTRACT_AMOUNT_AVG','상담액·계약액 평균','DOUBLE(18,4)','활동성 원값'],
 ['SUPPORT_CO / AWARD_CO','수혜 수·수상 수','INT','활동성 원값'],['OVSEA_SALES_CO / DMSTC_SALES_CO','해외·국내 매출 수','INT','활동성 원값'],['ABSLT_GRADE_NAME','점수 등급','VARCHAR(20)','예: F1A2'],['RLTV_GRADE_NAME','백분율 등급','VARCHAR(20)','예: F2A1'],['TOTAL_GRADE_NAME','종합등급','VARCHAR(20)','S~D'],
 ['EVL_DT','계산일시','DATETIME',''],['INSERT_ID·DT / UPDATE_ID·DT','공통','','']]
table(s,X0+hw+150000,Y0+230000,hw,[2.3,1.9,1.4,1.4],[['컬럼','이름','타입','설명']]+evl,rowh=170000)

# ---- 10. DB 설계 2
s=new_slide('DB 설계: 새 테이블 ③ ④ · 기존 테이블 연결',DB,[
 '③④의 처음 값은 엑셀 배점관리 시트 (③ 116행, ④ 30행)',
 '관리자가 배점 화면에서 고치면 값을 바꾸고 즉시 점수·등급을 다시 계산',
 '항목 29개와 계산식은 고정, 구간·점수·사용여부만 바꿈',
 '기존 웰콘 테이블은 구조를 바꾸지 않음'])
sub(s,X0,Y0,hw,'③ TW_BIZPOOL_SCORE_ITEM 항목별 구간·점수')
it=[['ITEM_CD','항목코드','VARCHAR(30)','PK, 예: BIZ_AGE'],['BAND_SEQ','구간순서','INT','PK'],['AXIS_SE','축구분','VARCHAR(4)','STBL / ACT'],['GROUP_CD','묶음코드','VARCHAR(30)','예: COMPANY_SCALE'],
 ['ITEM_NAME','항목이름','VARCHAR(50)',''],['BASE_VALUE','기준값','DOUBLE(18,4)','빈 값 = 그 외'],['SCORE','점수','INT',''],['BAND_NOTE','구간표시문구','VARCHAR(50)','예: AAA,AA,A,BBB'],['USE_YN','사용여부','CHAR(1)','N이면 점수에서 뺌'],['UPDATE_ID / UPDATE_DT','수정자·일시','','']]
table(s,X0,Y0+230000,hw,[2.0,1.5,1.4,2.1],[['컬럼','이름','타입','설명']]+it,rowh=170000)
sub(s,X0+hw+150000,Y0,hw,'④ TW_BIZPOOL_GRADE_CFG 등급 구간')
gc=[['GRADE_TYPE_SE','구간종류','VARCHAR(20)','PK, 6종 (아래)'],['GRADE_NAME','등급','VARCHAR(2)','PK, F1~F5 / A1~A5 / S~D'],['BASE_VALUE','기준값','DOUBLE(18,4)','백분율은 0~1, 점수는 점'],['SORT_ORDR','정렬순서','INT',''],['UPDATE_ID / UPDATE_DT','수정자·일시','','']]
table(s,X0+hw+150000,Y0+230000,hw,[2.0,1.5,1.4,2.1],[['컬럼','이름','타입','설명']]+gc,rowh=170000)
text(s,X0+hw+150000,Y0+230000+170000*6+40000,hw,520000,'구간종류: STBL_RLTV·ACT_RLTV (사업안정성·활동성 백분율), STBL_ABSLT·ACT_ABSLT (점수), TOTAL_RLTV·TOTAL_ABSLT (종합 백분율·점수)',sz=800,color='595959')
y=Y0+230000+170000*11+200000
sub(s,X0,y,W0,'기존 웰콘 테이블과의 연결')
table(s,X0,y+230000,W0,[2.4,2.0,5.6],[
 ['새 테이블','연결 키','기존 테이블'],
 ['① NICE_COMP, ② EVL','SELLER_ID','TW_SELLER.SELLER_ID'],
 ['② EVL 계산','SELLER_ID','TW_MEMBER(COMTNEMPLYRSCRTYESTBS 경유), TW_SELLER_CONTENTS, WP_PROD_MST, TW_SELLER_APPLY, TW_EVENT_RESULT, TW_SELLER_SUPPORT, TW_SELLER_SALES, TW_SELLER_AWARDS'],
 ['화면 표시·필터','SELLER_ID, APPLY_ID, EVENT_ID','TW_GENRE_MAPPING, TW_EVENT, CO_CODE_DTL'],
],bold_col0=True)

# ---- 11. NICE 적재
s=new_slide('NICE 값 적재 방법',DB,[
 '적재는 처음 1번, 새 NICE 자료를 받으면 같은 방식으로 다시',
 '적재 파일은 SELLER_ID로 바꿔서 전달',
 '사업자번호로 매칭하면 셀러 사업자번호가 빈 2곳이 빠짐',
 '적재 후 점수·등급을 다시 계산 (활동성은 그달 1일에 저장한 값 사용)'])
bar(s,X0,Y0,W0,'엑셀의 NICE 값을 셀러별 1행으로 TW_BIZPOOL_NICE_COMP에 넣는다')
table(s,X0,Y0+260000,W0,[1.8,8.2],[
 ['단계','내용'],
 ['1. 셀러 연결','엑셀 셀러 번호는 추출 때 붙인 일련번호다. 추출 때 만든 연결표로 SELLER_ID로 바꾼다 (4,031곳 모두 1:1)'],
 ['2. 값 넣기','아래 16개 값을 엑셀 값 그대로 넣는다. 3개년 평균·증가율도 엑셀에서 계산된 값을 넣는다'],
 ['3. 빈 값','엑셀에서 빈 값은 NULL로 넣는다 (그 항목은 점수 없음)'],
 ['4. 다시 적재','같은 SELLER_ID 행을 덮어쓴다 (UPDATE_ID·DT 기록)'],
],bold_col0=True)
y=Y0+260000+R*5+250000
sub(s,X0,y,W0,'엑셀 열 → 컬럼')
mp=[('설립일','FOUNDATION_DATE'),('종업원수','EMPLOYEE_CO'),('국민연금정보 (입사자+퇴사자 ÷ 평균 재직인원)','STAFF_CHANGE_RATE'),('신용등급수치','CREDIT_GRADE_VALUE'),
    ('매출액영업이익률 평균','OPRT_PROFIT_RATE_AVG'),('부채비율 평균','DEBT_RATE_AVG'),('매출증가율','SALES_INCRS_RATE'),('영업이익증가율','OPRT_PROFIT_INCRS_RATE'),
    ('인증정보','CERT_CO'),('특허','PATENT_CO'),('실용신안','UTILITY_MODEL_CO'),('현금흐름등급수치','CASHFLOW_GRADE_VALUE'),
    ('단기연체','SHRTTRM_OVRDUE_CO'),('채무불이행','DEBT_DFLT_CO'),('공공기록','PUBLIC_RECORD_CO'),('휴폐업정보','CLSBIZ_SE_NAME')]
rows=[['엑셀 열','컬럼','엑셀 열','컬럼']]
for k in range(8): rows.append([mp[k][0],mp[k][1],mp[k+8][0],mp[k+8][1]])
table(s,X0,y+230000,W0,[3.2,2.3,2.2,2.3],rows)
text(s,X0,y+230000+R*9+60000,W0,300000,'신용등급수치·현금흐름등급수치는 엑셀 코드 시트의 변환표(AAA 10, AA 9, A 8, BBB 7, BB 6, B 5, CCC 4, CC 3, C 2, D 1, NG 0 / A 6, B 5, C+ 4, C- 3, D 2, E 1)로 바꾼 값',sz=800,color='595959')

# ---- 12. 매월 계산
s=new_slide('매월 계산 순서 · 운영 규칙',DB,[
 '정기 실행: 매월 1일 (1~6단계 전부)',
 '배점 수정·NICE 재적재 때는 2단계를 건너뛰고 저장된 그달 원값으로 3~6단계',
 '결과는 한 번에 저장, 실패하면 직전 결과 유지',
 '화면 검색·필터는 저장된 결과만 읽음'])
bar(s,X0,Y0,W0,'실행: 매월 1일 · 대상: TW_BIZPOOL_NICE_COMP에 있는 셀러 전체')
bw=1400000; gap=(W0-bw*6)//5
items=[('1. 대상 선정','NICE_COMP\nDELETE_YN = N'),('2. 활동성 집계','기존 테이블 10개\n14개 원값 (매월 1일만)'),('3. 항목 점수','SCORE_ITEM\n구간표 적용'),
       ('4. 합계·환산','축 점수, 종합점수\n묶음 비율'),('5. 백분율·등급','GRADE_CFG\n순위·등급'),('6. 저장','EVL 덮어쓰기\n원값·점수·등급')]
for k,(t,b) in enumerate(items):
    x=X0+k*(bw+gap); box(s,x,Y0+290000,bw,560000,t,b)
    if k<5: arrow(s,x+bw+(gap-120000)//2,Y0+290000+190000,120000,170000)
y=Y0+1000000
sub(s,X0,y,W0,'운영 규칙')
table(s,X0,y+230000,W0,[2.4,7.6],[
 ['상황','처리'],
 ['계산 중 오류','2~6단계를 한 번에 저장한다. 실패하면 저장하지 않고 직전 결과를 그대로 둔다'],
 ['배점·등급 구간 수정','저장 즉시 3~6단계를 실행한다. 활동성은 다시 집계하지 않고 그달 1일에 저장한 원값을 쓴다'],
 ['새 NICE 자료 적재','적재 후 3~6단계를 실행한다. 활동성은 그달 1일에 저장한 원값을 쓴다'],
 ['새로 가입한 셀러','NICE 값이 없어 대상에 없다. NICE 자료를 받아 적재하면 대상이 된다'],
 ['휴폐업·제한 셀러','대상에 포함해 똑같이 계산하고 화면에서 "제외" 표시'],
],bold_col0=True)

# ---- 13. 배점 설정
s=new_slide('배점 설정',ETC,[
 '화면 구성은 별도 설계 예정',
 '처음 값은 엑셀 배점관리 시트',
 '저장하면 즉시 점수·등급을 다시 계산',
 '항목 29개·계산식·묶음 구성은 고정 (새 항목은 개발 필요)'])
bar(s,X0,Y0,W0,'관리자가 고치는 값과 저장되는 곳 (화면은 별도 설계)')
table(s,X0,Y0+260000,W0,[2.0,3.3,4.7],[
 ['고치는 것','저장 테이블.컬럼','규칙'],
 ['항목 구간·점수','TW_BIZPOOL_SCORE_ITEM.BASE_VALUE, SCORE, BAND_SEQ','숫자 항목은 값이 기준값 이상인 첫 구간(큰 것부터), 최신성 3개는 경과 년수가 기준값 이하인 첫 구간(작은 것부터)'],
 ['항목 사용 여부','TW_BIZPOOL_SCORE_ITEM.USE_YN','N이면 그 항목 점수와 최고점이 빠짐 (만점도 같이 바뀜)'],
 ['등급 구간','TW_BIZPOOL_GRADE_CFG.BASE_VALUE','6종 × 5등급. 백분율은 0~1, 점수는 점'],
 ['수정 기록','두 테이블의 UPDATE_ID, UPDATE_DT','누가 언제 고쳤는지'],
],bold_col0=True)
y=Y0+260000+R*5+250000
callout(s,X0,y,W0,'저장했을 때',[
 '고친 값을 두 테이블에 바로 반영한다',
 '이어서 점수·백분율·순위·등급을 다시 계산해 TW_BIZPOOL_EVL을 덮어쓴다. 활동성은 그달 1일에 저장한 원값을 쓴다',
 '항목 최고점·축 만점·묶음 최고점은 고친 구간에서 다시 구한다'])

# ---- 원본 3~14장 삭제
lst=prs.slides._sldIdLst
ids=list(lst)
for el in ids[2:14]:
    prs.part.drop_rel(el.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'))
    lst.remove(el)
prs.save(OUT)
print('saved', len(prs.slides))
