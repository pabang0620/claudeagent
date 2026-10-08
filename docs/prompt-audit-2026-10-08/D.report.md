# 묶음 D 보고 (문서·비즈니스 에이전트 16 + 참조 9 + deep-research)

## 적용 (17파일, +240/-263)
- hwp-generator: 기본 저장 경로 `~/Documents` → 소스 파일과 같은 폴더(절대경로). `~`는 Write에서 확장 안 됨.
- doc-generator: 도구 폴더를 `find $HOME` 탐색 대신 `/home/lee/project/doc-generator` 리터럴로 고정(NOT_FOUND 분기 제거, extras §5 동기화). "⚠" 제거. 본문 작성 규칙 추가(em-dash·이모지 금지, 제출용에 수정이력 서술 금지, 수치·일정 창작 금지 → `[확인 필요]`).
- proposal-pt-builder: 서브에이전트가 "짧게 재확인/질문"하던 3곳(경량 경로 재확인, 슬라이드 수 애매, 트랙 애매)을 가정+보고로 바꿈. description에 "스폰 전 확보할 입력(사업명·발주기관·저장경로·슬라이드 수·RFP)" 명시. evidence "알려달라고 안내" 제거. "⚠" 제거.
- pptx-plan-compose(ref): "사용자에게 템플릿 묻는다" 제거, 동명 파일 게이트를 "대화로 확인하라" → `_v2` 저장으로, 일정(TML)은 RFP 기간만 쓰고 자체 산정 금지(시간 견적 금지 메모리), "⚠" 제거.
- pptx-asset-generator: "사용자가 요청하면 커밋" → 커밋 안 함(오케스트레이터 직접). "사용자에게 알린다" → 보고. 보고 15줄 상한.
- meeting-minutes-writer: `Agent` 도구 제거(hwp-generator 스폰은 오케스트레이터가). hwp 추출 순서를 설치 실측(hwp5txt·hwp5proc 있음) 기준으로 정리(pip install 삭제, hwpx 추출법 추가). 메모리 feedback_meeting_minutes_focus의 핵심 "녹취록 통독으로 요점메모가 놓친 주제·정량수치 보완"이 빠져 있어 원칙 2에 추가.
- gov-followup-outreach-writer: 182 → 146줄. `Agent` 제거(STEP 5 위임 블록 삭제, 저장 후 경로 보고로). "사용자에게 요청" → 반환·종료. 문체 표: "수년간" 금지를 삭제하고 연차 표기 금지(크몽 메모리와 충돌 해소)·수정이력 서술 금지 추가. 자체검토 8→4항목, 예시 블록 압축, 구분선 제거. 보고 15줄 상한.
- jasoseo-writer: `.claude/jasoseo-data/`(gitignore 대상)가 디스크에 없음 → 절대경로로 바꾸고 메모리 `user_profile_career.md` 폴백 추가, 없는 `.claude/agents/jasoseo-profile.md` 폴백 삭제. 강점 프레임·PM 표기 금지·경력 시작 2023.03 규칙 추가.
- spreadsheet-editor: 제출용 셀에 날짜도장·"재검증"·"신규 발견" 서술 금지(메모리 feedback_report_deliverable_no_process_trail), 보고 15줄 상한.
- welcon-advisor: 250 → 113줄. 지식 베이스 A~I·G-1(146줄)을 `agent-refs/welcon-advisor-sources.md` 0절로 이동하고 "호출마다 첫 도구 호출로 Read" 단계 추가. 판단 원칙에 "실행계획서 PPT가 회의록보다 우선"(메모리 09-14)과 "실사용례 2~3건+트렌드 = [데이터 근거]"(메모리 08-14) 추가.
- lee-wonho: P-04 "모든 기능에 플래닝" → 여러 파일 신규 기능·큰 리팩토링만(09-29 개편). ESCALATE 모델 상향의 비용 수치(1.7배/3.3배)를 performance.md 기준(2배/5배)으로 맞추고 "메인이 Fable이면 메인이 직접 가져오는 건 ESCALATE 아님" 명시.
- pastletter-image-prompt-writer: `_v2` 고정 → 번호 증가(현재 `06_이미지프롬프트.md`가 이미 있어 매번 `_v2`를 덮어쓸 뻔함).
- web-crawler / web-crawler-output / deep-research: 이모지 제거(❌🎯📋🔎📊🏛). "사용자가 제외한 대상 재조사·추천 금지"(메모리 feedback_respect_stated_exclusions) 추가.
- 변경 없음: hwp-templates, proposal-pt-builder-extras, lee-wonho-retired-rules, web-crawling-ladder, ebook-editor, ebook-student(결함 없음, 경로 실재 확인).

## flag (사용자 결정 필요)
1. pastletter-image-prompt-writer: 모두의창업2차 접수 마감 2026-09-17 경과. 2차 심사용 이미지가 더 필요 없으면 `agents-archive/`로 보관 권장(라우팅 표 행도 제거).
2. welcon-advisor 지식 베이스 기준일이 2026-09-02. 이후 결정(09-14 정량 S~D 통합등급 범위, 10-06 "내 업무 프로필" 명칭 확정, 10-07 업무 프로필 DB 저장 방식)이 미반영. "최신 폴더 확인" 단계가 보완하지만 사용자가 갱신을 지시하면 메모리 project_welcon_* 기준으로 0절을 갱신해야 한다. 내용 창작 위험이 있어 이번에 손대지 않았다.
3. jasoseo-data 폴더 유실: `.claude/jasoseo-data/profile.md`(상세 프로필)가 gitignore 대상이라 PC 이관 때 사라진 것으로 보인다. 메모리 요약으로 폴백하게 했지만 상세 경력 원본은 사용자가 다시 넣어야 한다.
4. meeting-minutes-writer 원칙 1 "소스 원문을 `회의내용무편집본/`에 복사 저장": 사용자 지시 유래가 불분명. 유지했다.
5. doc-generator / proposal-pt-builder 모두 "필수 입력 누락 시 질문 문안 반환 → 재스폰" 구조. 오케스트레이터가 스폰 전에 입력을 모으면 왕복이 없어진다(proposal-pt description에 적음, doc-generator description에는 안 적음 - 필요하면 같은 문장 추가).

## 오케스트레이터 요청
- rules/agents.md STEP 1 "PastLetter 이미지 프롬프트" 행: flag 1 결정에 따라 삭제 또는 유지.
- rules/agents.md STEP 1 "회의록 작성" 행에 "HWPX 변환은 meeting-minutes-writer 결과 경로를 hwp-generator에 넘겨 메인이 2단계로 스폰" 한 줄 추가(이번에 Agent 도구를 뺐으므로).
- rules/agents.md "후속사업 사전영업 자료" 행도 동일(파일 산출은 메인이 hwp/doc-generator에 2단계 스폰).
- proposal-pt-builder 스폰 시 사업명·발주기관·저장경로·슬라이드 수·RFP를 프롬프트에 넣는 것을 STEP 1 표 "PT/발표자료" 행 비고에 적으면 재스폰이 줄어든다.

## 통계 (줄 수 전후)
hwp-generator 43→43 / doc-generator 149→150 / proposal-pt-builder 149→149 / pptx-asset-generator 68→68 / meeting-minutes-writer 107→107 / gov-followup 182→146 / jasoseo-writer 57→58 / spreadsheet-editor 42→43 / welcon-advisor 250→113 / lee-wonho 145→145 / pastletter 56→56 / web-crawler 132→133 / ebook-editor 35 / ebook-student 27 / deep-research 249→250 / welcon-advisor-sources 55→201 / pptx-plan-compose 128→129 / doc-generator-extras 98→96
검증: 대상 전 파일 em-dash 0건(규칙 문구 제외), 이모지 0건, frontmatter 5필드 전부 존재, 외부 도구(kordoc·hwp5proc·hwp5txt·docxtpl·pypandoc·python-pptx·openpyxl·olefile)와 경로(doc-generator, pptx-asset-library 스크립트, 모두의창업2차, ebook 교육자료, welcon) 실재 확인.
