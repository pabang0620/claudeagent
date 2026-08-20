---
name: quote-builder
description: 프리랜서/외주 개발 견적서를 인쇄(PDF) 최적화된 HTML 문서로 생성하는 스킬. "견적서 만들어", "견적 뽑아", "estimate/quote 작성" 같은 요청이나, 작업 항목·금액을 정리해 의뢰자에게 보낼 견적 문서가 필요할 때 활성화한다. 비사업자(프리랜서) 부가세·3.3% 원천징수 처리, "수정 범위" 기준 금액 산정, 무상 서비스 항목, 권장사항 분리 등 의뢰자 납득성에 최적화된 템플릿을 따른다.
version: 1.0.0
triggers:
  - /quote-builder
  - 견적서
---

# quote-builder 스킬

## 역할
작업 항목과 금액을 받아 **의뢰자가 바로 납득할 수 있는 견적서**를 A4 인쇄(PDF) 최적화 HTML로 생성한다.
사용자(공급자)는 보통 **개인 프리랜서(비사업자)**이며, 의뢰자는 비개발자인 경우가 많다 → 전문용어·주관적 난이도 표기를 피하고 "무엇을, 어디까지 고치는지(수정 범위)"로 금액을 정당화한다.

## 산출물
- `견적서_<프로젝트>_<용도>_<공급자>.html` (지정 경로 또는 `docs/견적서/`)
- 사용자가 크롬에서 `Ctrl+P → PDF로 저장`(배경 그래픽 ON)으로 PDF화

## 입력으로 받을 정보 (없으면 질문하거나 빈칸 처리)
- 공급자: 이름/활동명, 사업자 여부(개인 비사업자 / 사업자), 연락처, 이메일
- 의뢰처: 담당자/상호
- 작업 항목 목록 + 항목별 금액 (또는 총액을 주면 항목에 분산)
- 무상으로 넣을 서비스 항목(있으면)
- 작업 기간 / 대금 조건 / 하자보수 기간 (없으면 기본값 제안)

## 핵심 원칙 (이 스킬의 차별점)

1. **금액 근거 = "수정 범위" 컬럼** - 난이도(상/중/하)는 주관적이라 의뢰자가 납득 못 함. 대신 "백엔드+프론트 / 백엔드만 / 점검·배포" 처럼 **건드리는 영역**으로 표기 → 둘 다 고치면 비싸고 한쪽만이면 싼 게 눈에 보임.
2. **비사업자 처리** - 개인 프리랜서는 **부가세(VAT) 없음**. 대신 지급 시 **사업소득 원천징수 3.3%** 안내(실수령 = 총액 × 0.967). 합계 박스에 "(부가세 없음 · 비사업자)" 표기.
   - 사업자(과세)인 경우엔 공급가액 + VAT 10% = 합계로 바꾸고 3.3% 문구 제거.
3. **무상 서비스 항목** - 0원 + `(서비스/무상 제공)` 표기. "원래 별도 비용이나 ~ 무상 제공" 한 줄로 가치 어필. (기본 보안, 로그 개선 등)
4. **권장 사항 분리** - 이번 작업 범위 밖(리팩토링·인프라 이관 등)은 "지금 필수 아님 / 규모 커지면 추후 / 진행 시 별도 견적"으로 명확히 선 긋기.
5. **합계 검증** - 항목 금액 합 == 표시 합계. 항상 재계산해 확인.
6. **하이픈 사용** - em대시(-) 금지, 하이픈(-) 사용. 화살표(→)·가운뎃점(·)은 허용.
7. **머리말 한 줄** - 표제 아래 정중한 인사 한 줄로 시작.
8. **리스크 방어 문구** - 결제 등 민감 작업은 전제조건(운영 DB 직접 사용 금지, 키 의뢰처 제공, 재현 지연 시 기간 협의)을 명시해 공급자를 보호.

## 생성 절차
1. 입력 정보 확인(부족하면 질문). 사업자 여부 반드시 확인(VAT 처리 갈림).
2. 항목·금액 확정 → **합 == 총액** 검증.
3. 아래 HTML 템플릿의 `{{...}}` 치환 + 항목 행 생성.
4. 파일 저장 후, 합계·항목수·잔여 옛값 등을 grep으로 검증.
5. PDF 변환 안내(크롬 Ctrl+P, 배경 그래픽 ON).

## HTML 템플릿

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>견적서 - {{프로젝트}}</title>
<style>
  @page { size: A4; margin: 18mm 16mm 18mm 16mm; }
  :root { --ink:#1a1a1a; --muted:#555; --line:#cfcfcf; --line2:#888; --head:#f0f0f0; --accent:#1f3a5f; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family:"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo","Noto Sans KR",sans-serif; color:var(--ink); font-size:10.5pt; line-height:1.6; margin:0; background:#fff; }
  @media screen { body{ background:#e8e8e8; padding:24px 0;} .wrap{ max-width:820px; margin:0 auto; background:#fff; padding:44px 50px; box-shadow:0 2px 16px rgba(0,0,0,.18);} .hint{max-width:820px;margin:0 auto 14px;background:#fff8e1;border:1px solid #e0c060;padding:10px 16px;font-size:10pt;color:#6a5400;border-radius:4px;} }
  @media print { .hint{display:none;} .wrap{padding:0;} }
  .title { text-align:center; font-size:24pt; letter-spacing:14px; font-weight:800; color:var(--accent); margin:0 0 4px; padding-left:14px;}
  .title-sub { text-align:center; font-size:10.5pt; color:var(--muted); margin:0 0 18px; }
  .topline { border-top:3px solid var(--accent); margin:10px 0 18px; }
  .parties { display:flex; gap:16px; margin-bottom:16px; }
  .party { flex:1; border:1px solid var(--line); border-radius:6px; padding:10px 14px; }
  .party h4 { margin:0 0 6px; font-size:10pt; color:var(--accent); border-bottom:1px solid var(--line); padding-bottom:4px;}
  .party table { width:100%; border:none; }
  .party td { border:none; padding:2px 0; font-size:9.7pt; vertical-align:top; }
  .party td.k { color:var(--muted); width:34%; }
  .sum-box { border:2px solid var(--accent); border-radius:6px; padding:12px 18px; margin:8px 0 18px; display:flex; justify-content:space-between; align-items:center; background:#f5f8fc;}
  .sum-box .label { font-size:11pt; font-weight:700; }
  .sum-box .amt { font-size:20pt; font-weight:800; color:var(--accent); }
  .sum-box .amt small { font-size:10pt; color:var(--muted); font-weight:500; }
  table { width:100%; border-collapse:collapse; margin:8px 0 14px; font-size:9.7pt; }
  th,td { border:1px solid var(--line); padding:7px 9px; vertical-align:top; }
  thead th { background:var(--head); font-weight:700; border-bottom:1.5px solid var(--line2); text-align:center;}
  td.num { text-align:right; white-space:nowrap; }
  td.center { text-align:center; }
  tr.total td { font-weight:800; background:#eef2f7; font-size:11pt; }
  .free { color:#2c6b2c; font-weight:700; }
  .item-title { font-weight:700; }
  .item-detail { color:#444; font-size:9pt; }
  h3 { font-size:12pt; border-left:5px solid var(--accent); padding:3px 0 3px 10px; margin:22px 0 8px; }
  ul { margin:6px 0; padding-left:20px; } li { margin:3px 0; }
  .note { background:#f7f7f7; border:1px solid var(--line); border-radius:5px; padding:10px 14px; font-size:9.3pt; margin:8px 0; }
  .sec-box { background:#eef7ee; border:1px solid #4a8a4a; border-left:5px solid #4a8a4a; border-radius:0 5px 5px 0; padding:10px 16px; margin:8px 0; font-size:9.5pt; }
  .sec-box .em { font-weight:700; color:#2c6b2c; }
  .small { font-size:9pt; color:var(--muted); }
  .sign { margin-top:24px; text-align:right; font-size:10pt; }
</style>
</head>
<body>
<div class="hint">📄 인쇄용 견적서입니다. <b>Ctrl/Cmd + P → "PDF로 저장"</b> (배경 그래픽 켜기) 후 의뢰처에 전달하세요.</div>
<div class="wrap">

  <div class="title">견 적 서</div>
  <div class="title-sub">{{프로젝트}} {{작업명}}</div>
  <div class="topline"></div>

  <p style="margin:0 0 16px; font-size:10.5pt;">안녕하세요. {{작업명}} 건에 대한 견적을 아래와 같이 제출드립니다. 검토 후 문의사항이 있으시면 편하게 연락 주시기 바랍니다.</p>

  <div class="parties">
    <div class="party">
      <h4>공급자 (작성자)</h4>
      <table>
        <tr><td class="k">성명</td><td>{{이름}} <span class="small">(활동명: {{활동명}})</span></td></tr>
        <tr><td class="k">구분</td><td>개인 프리랜서 (비사업자)</td></tr>
        <tr><td class="k">연락처</td><td>{{연락처}}</td></tr>
        <tr><td class="k">이메일</td><td>{{이메일}}</td></tr>
      </table>
    </div>
    <div class="party">
      <h4>공급받는 자 (의뢰처)</h4>
      <table>
        <tr><td class="k">담당</td><td>{{의뢰처담당}}</td></tr>
        <tr><td class="k">서비스</td><td>{{의뢰처서비스}}</td></tr>
        <tr><td class="k">작성일</td><td>{{작성일}}</td></tr>
        <tr><td class="k">유효기간</td><td>작성일로부터 30일</td></tr>
      </table>
    </div>
  </div>

  <div class="sum-box">
    <span class="label">견적 합계 금액</span>
    <span class="amt">₩{{총액}} <small>(부가세 없음 · 비사업자)</small></span>
  </div>

  <h3>1. 견적 내역</h3>
  <table>
    <thead>
      <tr><th style="width:4%">No</th><th style="width:52%">항목 / 세부 내역</th><th style="width:24%">수정 범위</th><th style="width:20%">금액</th></tr>
    </thead>
    <tbody>
      <!-- 항목 행 반복: 유료 항목 -->
      <tr>
        <td class="center">{{No}}</td>
        <td><span class="item-title">{{항목명}}</span><br>
          <span class="item-detail">· {{세부1}}<br>· {{세부2}}</span></td>
        <td>{{수정범위}}</td>
        <td class="num">{{금액}}</td>
      </tr>
      <!-- 무상 서비스 항목 -->
      <tr>
        <td class="center">{{No}}</td>
        <td><span class="item-title">{{무상항목명}}</span> <span class="free">(서비스 / 무상 제공)</span><br>
          <span class="item-detail">· {{세부}}<br><span class="small">※ 원래 별도 비용 항목이나 무상 제공</span></span></td>
        <td>{{영역}} <span class="free">(무상)</span></td>
        <td class="num free">0</td>
      </tr>
      <tr class="total">
        <td class="center" colspan="3">합계 금액 (부가세 없음)</td>
        <td class="num">₩{{총액}}</td>
      </tr>
    </tbody>
  </table>
  <p class="small">※ 금액은 각 항목의 <b>수정 범위</b>(수정 대상 영역·작업량)를 기준으로 산정되었습니다.</p>
  <p class="small">※ 공급자는 개인(비사업자) 프리랜서로 부가가치세(VAT)가 발생하지 않습니다. 대금 지급 시 사업소득 원천징수(3.3%)가 적용될 수 있으며, 이 경우 실지급액은 {{실수령액}}원입니다. (세전/실수령 기준은 협의)</p>

  <!-- 선택: 보안/도메인 특이사항 안내 박스 -->
  <h3>2. 포함 / 별도</h3>
  <ul>
    <li><b>포함:</b> {{포함항목요약}}</li>
    <li><b>별도(미포함):</b> 유지보수(월 정액/건당 별도 협의), 신규 기능 개발{{기타별도}}</li>
  </ul>

  <h3>3. 작업 전제 조건</h3>
  <ul>
    <li>{{전제1 예: 운영 DB 직접 사용 금지, 테스트 환경에서 작업}}</li>
    <li>외부 연동 키(결제/스토리지/메일 등)는 <b>의뢰처에서 제공</b>합니다.</li>
  </ul>

  <h3>4. 작업 기간 · 대금 지급 · 하자보수</h3>
  <ul>
    <li><b>작업 기간:</b> 착수일로부터 약 <b>{{기간}}</b> (영업일 기준). 상황에 따라 협의하여 조정합니다.</li>
    <li><b>지급 조건:</b> 착수금 50% (계약 시) / 잔금 50% (검수 완료 시) - 협의 가능</li>
    <li><b>하자보수:</b> 검수 완료 후 <b>{{하자보수기간}}</b> 동일 건에 대한 무상 수정 (그 이후는 유지보수 계약 범위)</li>
  </ul>

  <h3>5. 권장 사항 (참고 · 이번 견적 범위 외)</h3>
  <p class="small" style="margin-bottom:6px;">아래는 이번 작업에 포함되지 않으며 지금 당장 필수는 아닙니다. 다만 <b>서비스 규모가 커지면 추후 고려</b>를 권장드립니다. 반드시 본 공급자가 아니더라도 진행 가능합니다. (진행 시 별도 견적)</p>
  <ul>
    <li>{{권장1}}</li>
  </ul>

  <div class="sign">
    {{작성일}}<br><br>
    공급자 : {{이름}} ({{활동명}})
  </div>

</div>
</body>
</html>
```

## 사업자(과세) 버전 차이
- sum-box: `(부가세 없음 · 비사업자)` → `(공급가액 {{공급가}} + VAT {{부가세}})`
- 합계 = 공급가액 + 부가세(10%)
- 3.3% 원천징수 문구 제거, 세금계산서 발행 가능 문구 추가

## 마무리 검증 체크리스트
- [ ] 항목 금액 합 == 표시 합계(2곳: sum-box, 합계행)
- [ ] No 번호 연속·중복 없음
- [ ] em대시(-) 0개
- [ ] 비사업자면 실수령액(총액×0.967) 정확
- [ ] 무상 항목 0원·(무상) 표기
- [ ] 옛 금액 잔존 0 (금액 수정 시)
