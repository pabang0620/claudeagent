---
name: mkt-search
description: 네이버·구글·AI 검색(ChatGPT·Perplexity·AI Overviews)에 노출되게 페이지·블로그 글·구조화 데이터를 손볼 때 쓴다. "검색 노출", "SEO", "GEO", "AI 검색에 뜨게", "네이버 블로그 저품질", "상위노출", "구조화 데이터", "JSON-LD", "llms.txt", "Q&A 페이지 늘리기", "프로그래매틱 SEO" 요청 시 사용. 페이지 문구는 mkt-landing-copy.
---

# mkt-search: 네이버·구글·AI 검색 노출

## 대상과 현황
- kingkle.co.kr(`/home/lee/project/nekolab`, Next.js): Q&A·블로그·포트폴리오 데이터(`lib/qna-data.js`, `lib/blog-data.js`, `lib/portfolio-data.js`), JSON-LD(`lib/jsonld.js`), IndexNow(`npm run seo:submit`). 이력: `nekolab/docs/seo-geo-log.md`
- calc.kingkle.co.kr, timer.kingkle.co.kr: 현황 SSOT `docs/utility-sites-status.md`
- 네이버 블로그(자동 게시): 조사 근거 `sns-auto-poster/docs/naver-blog-quality-research.md`

## 네이버 블로그 (저품질 회복 중)
- 네이버가 불이익을 준다고 밝힌 건 AI 사용 자체가 아니라 **대량 자동 게시, 기존 글 짜깁기·변형, 독창성 부족**이다. 이 셋을 줄이는 쪽으로만 고친다
- 하루 1편 이하, 일정한 주기. 몰아서 쏟아내기와 대량 삭제 둘 다 피한다
- 한 글 한 주제. 기사 묶음 다이제스트보다 기사 1건을 근거로 한 개발자 시각 글
- 직접 경험 문단(직접 써본 것, 막힌 것), 직접 만든 이미지(스크린샷·도식)가 신호가 된다
- 제목 앞쪽과 본문 첫 100자에 핵심 키워드 한 번, 소제목에 관련어. 억지 반복 금지
- 태그는 본문 내용에 맞춰서. 무작위 태그 금지
- 영업 문구·외부 상품 링크 넣지 않는다(확정 결정)
- 수치는 원문 기사에 있는 것만. 효과는 몇 주 단위 노출 추이로 판단한다

## 구글 (AI Overviews 포함)
- 구글 공식 입장: AI 전용 마크업·파일은 필요 없고, AI용으로 글을 쪼개거나 따로 쓰지 말라(대량 생성 스팸 정책 위험). 사람에게 도움 되는 원본 정보, E-E-A-T, 의미 있는 HTML, 깨끗한 색인이 전부
- 한 키워드당 한 페이지보다 **주제 묶음 전체**를 덮는 쪽이 낫다. 질문 하나를 쓸 때 AI가 같이 찾아볼 관련 질문 5~10개를 떠올려 사이트 전체가 답하게 한다. 사실 하나의 정답 페이지는 하나만 둔다

## ChatGPT·Perplexity·Claude 같은 AI 검색
- 뽑아 쓰기 좋은 구조를 보상한다: 각 섹션 첫 문장에 바로 답, 핵심 답변 문단 40~60단어(한국어 2~3문장), 질문형 소제목, 비교는 표, 절차는 번호 목록
- 인용되는 글의 특징: 출처 붙은 숫자, 날짜, 이름 있는 작성자와 이력, "마지막 업데이트" 표시. GEO 연구(2023)에서 통계·인용 추가가 노출을 30~40% 올렸다는 결과가 있다(표본 한정, 약속 아님)
- 외부 존재감: 여러 곳(크몽 프로필, GitHub, 쓰레드, 네이버 블로그, 링크드인)이 같은 회사 설명을 쓰게 맞춘다. AI는 일치하는 설명을 신뢰한다. JSON-LD `sameAs`로 엮는다
- 크롤러 허용 확인: `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `Claude-User`는 검색·인용 경로라 막지 않는다. 학습용(`GPTBot`, `ClaudeBot`, `Google-Extended`)은 별개 판단
- 가격을 이미지나 "문의 주세요"에만 두면 AI가 읽지 못한다. 대표 가격대를 텍스트로 둔다(점검법: AI에 URL 주고 "플랜과 가격이 뭐야" 물어보기)
- `llms.txt`는 비구글 엔진용 보조 수단. 있으면 좋고 없어도 구글엔 영향 없다

## 구조화 데이터 (JSON-LD)
- 페이지에 실제로 있는 내용만 마크업한다. 없는 후기·별점 금지
- 쓸 것: `Organization`(sameAs 포함), `WebSite`, `Article`/`BlogPosting`(작성자·날짜), `BreadcrumbList`, `Service`/`Product`+`Offer`(가격이 실제로 있을 때)
- 원문 기준 구글 리치결과 변화: FAQ 리치결과 표시 중단(2026-05), HowTo 중단(2023-09), 사이트링크 검색창 중단(2024-11). 이 마크업을 넣어도 구글 화면엔 안 나온다. AI 엔진이 읽는 의미는 남으므로 지울 필요는 없다
- 배포 전 Rich Results Test와 validator.schema.org로 확인

## 페이지 대량 생성 (프로그래매틱 SEO)
- 변수만 바꾼 템플릿 페이지는 doorway 페이지로 불이익. 페이지마다 그 페이지에만 있는 가치(고유 데이터, 사례, 판단)가 있어야 한다
- 데이터 강도: 내가 만든 데이터 > 내 서비스에서 나온 데이터 > 사용자 생성 > 라이선스 > 공개 데이터(가장 약함)
- kingkle에 맞는 패턴: "업종 x 자동화 대상"(예: 쇼핑몰 주문 처리 자동화), "도구 A vs B 비교", 실제 포트폴리오 기반 사례 페이지. 실제로 해본 것만
- 하위 폴더로(`kingkle.co.kr/qna/...`). 하위 도메인은 도메인 신뢰가 갈라진다(calc·timer는 별개 사이트라 예외)
- 허브 페이지 → 개별 페이지 → 관련 페이지끼리 상호 링크. 고아 페이지 금지, sitemap 포함, 얇은 변형은 noindex
- 고유 title·description, 제목 구조, 속도 확인

## 결과물 형식
- 진단: 대상 질의 목록(문제 인식 / 해결책 탐색 / 브랜드 / 가격 단계) → 지금 누가 인용되는지 → 빠진 것
- 수정안: 파일 단위(어느 데이터 파일·컴포넌트), 추가할 페이지 목록, 마크업 변경
- 측정: 서치콘솔·네이버 서치어드바이저 노출·클릭, AI 답변 인용 여부 재확인

출처: coreyhaines31/marketingskills `ai-seo`, `programmatic-seo`, `schema` (MIT) 재구성
