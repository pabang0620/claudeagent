## 서브에이전트 정의파일 prompt-audit 결과 (읽기 전용, 파일 수정 없음)

**전제**
- **범위:** `/home/lee/project/.claude/agents/*.md` 46개와 `.quality-tracking.md`를 감사했습니다.
- **제외:** 게임 4종(game-feel-tuner, sprite-sheet-slicer, unity-build-verifier, unity2d-scene-architect)은 `/mnt/c/...`를 가리키는 링크라서 따라가지 않고 보고만 합니다.
- **agent-refs:** 본문이 참조하는 29개는 존재만 확인했고, 모두 있습니다.
- **타깃 모델:** frontmatter의 model이 sonnet이면 Sonnet 5.5, opus(database-reviewer, security-reviewer, function-validator)면 Opus 5.5입니다. 모델 정책 위반은 0건입니다.
- **셸 사용:** 이 세션에 Glob 도구가 없었습니다. 그래서 디렉토리 목록, `git log`, `wc`, frontmatter 추출에 읽기 전용 셸을 썼습니다. 개별 경로 확인은 Read로 했습니다.

**영향이 가장 큰 3가지**
1. **서브에이전트가 할 수 없는 지시가 19개 파일에 남아 있습니다.** "대화로 묻고 답을 받아 진행", "사용자 승인 대기" 같은 지시입니다. 같은 레포의 agent-evaluator-v2:49와 refactor-cleaner:9는 이를 HIGH 결함으로 정의하고 있어 서로 모순됩니다.
2. **game-asset-artist가 자기 자신, 그리고 flow-nanobanana 스킬과 정면으로 모순됩니다.** 투명 에셋을 flow-nanobanana로 보내지 말라는 항목, 투명 거터 요구, gpt-image 전용 CLI 플래그가 남아 있습니다.
3. **존재하지 않는 대상을 가리키는 참조가 여럿입니다.** 예시는 다음과 같습니다.
   - playwright-verify-loop가 인용하는 CLAUDE.md 예외 조항(현재 CLAUDE.md에 없음)
   - code-reviewer를 에이전트로 호출하는 지시(code-reviewer는 스킬)
   - ui-design-system의 "위 ~절"(이미 agent-refs로 옮겨짐)
   - pptx-asset-generator의 "exit 0"(audit.py에 `sys.exit`가 없음)

**그룹별 건수**
- G1(압력 언어·패딩·이전 지시와의 비교식 표현): 9건
- G2(충돌·낡은 사실·이력 서술): 34건
- G3(도구 description): 해당 없음. description은 라우팅 텍스트로 분류했고, 그 안의 이력 서술은 G2로 셌습니다.
- G4: 2건(로스터 정리). 요청 코드는 없어서 나머지 항목은 해당 없음입니다.

---

### HIGH (레포가 직접 반박하는 항목)

**H1. 서브에이전트에게 대화 질문·승인 대기를 지시함**
- **위치(중간 대기형):**
  - proposal-pt-builder:20,57,67,70,80,86,105-107,183,191-192
  - doc-generator:16-17,40,46-62,78-85,113-117,220
  - playwright-verify-loop:41,109-116,139,227
  - meeting-minutes-writer:78,90,94
  - ui-design-system:55-56,78
  - api-contract-designer:47-60
  - db-schema-architect:124,138-139
- **위치(질문형):**
  - planner:12, spreadsheet-editor:28,42, gov-followup-outreach-writer:109, shortform-builder:41, shortform-planner:54("builder가 첫 렌더 때 확인받는다"), game-asset-artist:206-207,236, welcon-advisor:165
- **위치(승인형):**
  - meeting-minutes-writer:104, ops-deployer:46, repo-janitor:23,42,49, pastletter-image-prompt-writer:46, spreadsheet-editor:13, db-schema-architect:130
- **근거:** 예를 들어 proposal-pt-builder:20 "정보 수집·목차 승인·저장 위치 확인은 모두 대화로 묻고 답변을 받아 진행한다". 반대쪽 규칙은 agent-evaluator-v2:49 "서브에이전트가 할 수 없는 지시... HIGH"와 refactor-cleaner:9입니다.
- **패턴:** G2 파일 간 모순
- **조치:** rewrite. 질문형과 대기형은 아래 문장으로 바꿉니다.
  > "필수 입력이 없으면 추측하지 말고 누락 항목과 질문 문안을 반환하고 종료한다(오케스트레이터가 답을 받아 재스폰)."

  승인형은 아래 문장으로 바꿉니다.
  > "스폰 프롬프트에 승인이 명시된 경우에만 실행하고, 아니면 대상·영향을 보고하고 멈춘다."

**H2. .quality-tracking.md:7 모델 정책이 현행과 반대**
- **근거:** "model: 은 sonnet 고정. opus/haiku/fable 금지". rules/agents.md 정책과 실제 frontmatter 3개(opus + low)가 이와 반대입니다.
- **패턴:** G2 충돌
- **조치:** rewrite.
  > "기본 sonnet + effort low|medium. opus + low는 security-reviewer·database-reviewer·function-validator만. haiku·fable 금지."

**H3. .quality-tracking.md:9 체크리스트 위치가 낡음**
- **근거:** "rules/agents.md '에이전트 모델 제약' 체크리스트". 이 체크리스트는 docs/agents-reference.md의 "신규 에이전트 생성 체크리스트"로 옮겨졌습니다.
- **패턴:** G2 낡은 사실
- **조치:** rewrite. 경로를 `docs/agents-reference.md`로 고칩니다.

**H4. playwright-verify-loop:98 없는 CLAUDE.md 조항을 인용**
- **근거:** "CLAUDE.md 오케스트레이터 규칙의 '단순 텍스트 수정·...1~3줄 이하' 예외". 현재 CLAUDE.md에는 이런 문구가 없습니다.
- **패턴:** G2 낡은 사실
- **조치:** remove. 위 92-96행의 조건만으로 충분합니다.

**H5. playwright-verify-loop:76,102-103,170 code-reviewer를 서브에이전트로 호출**
- **근거:** "code-reviewer 서브에이전트로 ... 리뷰". rules/agents.md와 tdd-guide:50은 code-reviewer가 스킬이라 스폰할 수 없다고 명시합니다.
- **패턴:** G2 충돌
- **조치:** rewrite.
  > "여러 파일을 고쳤으면 final-report에 'code-reviewer 스킬 실행 권장'을 적는다."

  103행의 되돌림 조건은 아래로 바꿉니다.
  > "인라인 수정 후 해당 플로우가 다시 막히면 되돌리고 위임으로 전환"

**H6. game-asset-artist:47-49 flow-nanobanana 스킬 내용을 잘못 서술**
- **근거:** "이 스킬 자체 문서는 '투명 배경 에셋에 쓰지 말고 gpt-image를 쓰라'고 되어 있으나". 실제 skills/flow-nanobanana/SKILL.md:3,13-14는 "gpt-image/Codex는 쓰지 않는다, 투명은 마젠타+크로마키"입니다.
- **패턴:** G2 낡은 사실
- **조치:** remove. 해당 괄호 문장을 삭제합니다.

**H7. game-asset-artist 내부 모순**
- **위치와 근거:**
  - :268-271 "투명이 필요한 ... 시트를 flow-nanobanana로 보냄 → 원천적으로 불가능". 같은 파일 :25, :239-241, :272와 반대입니다.
  - :77 "거터는 완전 투명으로". JPEG는 알파가 없습니다.
- **패턴:** G2 충돌
- **조치:** rewrite.
  - 7번 항목:
    > "알파가 필요한데 마젠타 배경을 지정하지 않고 생성 → 키잉 불가. 생성 전에 알파 필요 여부를 정하고 #FF00FF를 요청한다."
  - :77:
    > "거터는 배경색(알파 필요 시 순수 마젠타)으로 비운다."

**H8. game-asset-artist:72,92,166,211 gpt-image 전용 CLI 플래그가 남아 있음**
- **근거:** `batch --manifest`, `--reference`, `--mode edit --edit-target`는 gpt-image CLI 플래그입니다. flow-nanobanana는 "Upload media"로 참조 이미지를 넣습니다(SKILL.md:32).
- **패턴:** G2 낡은 사실
- **조치:** rewrite.
  > "참조 이미지는 flow-nanobanana 2절 4번 절차로 첨부한다."

  batch 문구는 remove합니다.

**H9. pastletter-image-prompt-writer:3,11,39,56 출력을 gpt-image 스킬로 보냄**
- **근거:** flow-nanobanana SKILL.md:13 "이미지·영상 생성은 전부 이 스킬로 한다. Codex/gpt-image는 쓰지 않는다".
- **패턴:** G2 충돌
- **조치:** rewrite. "gpt-image 스킬"을 "flow-nanobanana 스킬"로 바꾸고, 프롬프트 맨 앞에 `Generate a single static IMAGE (not a video): `를 붙이도록 합니다.

**H10. pptx-asset-generator:39,62 audit.py 종료 코드 서술이 틀림**
- **근거:** "# 교차검증 - exit 0 필수", "audit.py 결과(exit code + 문제 유무)". 같은 파일 :45와 audit.py 본문(`sys.exit` 없음, 항상 0 반환)이 이를 반박합니다.
- **패턴:** G2 낡은 사실
- **조치:** rewrite.
  - :39 주석: "# 출력의 '문제: 0' 확인"
  - :62: "audit.py 출력의 문제 건수와 목록"

**H11. gumgumi-cinematic-planner:107 산출 파일 개수가 틀림**
- **근거:** "위 7개 파일". 3절 목록은 01-fact, 02-explain, narration-ko.json, 03-text, 04-storyboard, 05-meta로 6개입니다. en을 뺄 때 남은 흔적입니다.
- **패턴:** G2
- **조치:** rewrite. "6개 파일"로 고칩니다.

**H12. gumgumi-explain-reviewer:46 없는 영어판을 검사함**
- **근거:** "영어판이 같은 뜻인가". 입력 목록(:23)과 rules/agents.md가 en 미제작을 명시합니다.
- **패턴:** G2
- **조치:** remove.

**H13. ui-design-system:140,203 옮겨진 절을 "위"로 참조**
- **근거:** '위 "충돌 감지 후 사용자 대화 템플릿"', '위 "생성할 스타일 파일 결정 로직"'. 두 절은 이 파일에 없고 agent-refs/ui-design-methodology.md:23,28에 있습니다.
- **패턴:** G2
- **조치:** rewrite. 해당 참조를 "`.claude/agent-refs/ui-design-methodology.md`의 해당 절"로 바꿉니다.

**H14. ui-design-system:189 공용화 강제가 지역성 원칙과 충돌**
- **근거:** "공용 컴포넌트 재사용 강제 - 3회 이상 반복... 추출". 같은 파일 :133("추출 제안"), rules/coding-style.md("중복 제거·추출은 기본값이 아니다"), refactor-cleaner:34와 충돌합니다.
- **패턴:** G2
- **조치:** rewrite.
  > "3회 이상 반복되는 UI 패턴은 공용화 후보로 보고만 한다. 추출은 요청 시에만(지역성 우선)."

**H15. react-specialist:36,129 파일 길이 기준이 현행과 다름**
- **근거:** "400줄 초과 시 분리 권장 (200-400줄 적정...)". rules/coding-style.md:12-14(최대 500, 그 아래는 필요할 때만)와 다르고, lee-wonho:148은 "200~400줄"을 폐기 규칙으로 명시합니다.
- **패턴:** G2
- **조치:** rewrite.
  > "파일 500줄 초과 시 분할, 그 아래는 필요할 때만(rules/coding-style.md)."

**H16. planner:38 없는 도구를 지시함**
- **근거:** "`ls .claude/agents/*.md`로". planner의 도구는 Read/Grep/Glob뿐이고 Bash가 없습니다.
- **패턴:** G2 도구 계약 불일치
- **조치:** rewrite. "Glob `.claude/agents/*.md`로"로 바꿉니다.

**H17. shortform-builder:3,76와 shortform 스킬이 산출물 기본값에서 충돌 (flag)**
- **근거:** 에이전트는 "기본 산출물은 한국어판 mp4 1개", skills/shortform/SKILL.md:5는 "기본 산출물은 언어별 mp4 2개"입니다.
- **패턴:** G2
- **조치:** flag. 고칠 곳이 감사 범위 밖인 스킬입니다. 제안 문구는 SKILL.md:5를 "기본 산출물은 한국어판 mp4 1개(영어판은 명시 요청 시)"로 바꾸는 것입니다.

**H18. repo-janitor 설명과 rules/agents.md의 커밋 규칙 충돌 (flag)**
- **근거:** repo-janitor:3 "커밋해줘, 푸시해줘 ... use proactively" ↔ rules/agents.md STEP 1-2 #1 "커밋·푸시는 오케스트레이터가 Bash로 직접 한다. 에이전트를 스폰하지 않는다". 같은 파일 STEP 0 23행은 커밋을 repo-janitor로 보내고 있어 룰 파일 내부도 충돌합니다.
- **패턴:** G2
- **조치:** flag. 사용자 결정이 필요합니다. 제안은 description 트리거를 "파일 이동·정리·레포 분리"로 줄이는 것입니다.

### MEDIUM

**M1. Playwright 의존 에이전트와 "서브에이전트는 Playwright를 못 받는다"는 레포 사실이 충돌 (flag)**
- **근거:** playwright-verify-loop(전체 루프와 Step 2 역할별 서브에이전트), web-crawler(L3~L5 단계), game-asset-artist:245가 Playwright에 의존합니다. 반면 flow-nanobanana SKILL.md:15와 rules/agents.md:78은 서브에이전트가 Playwright 도구를 받지 못한다고 적습니다.
- **패턴:** G2
- **조치:** flag. playwright-verify-loop에는 대체 경로가 없습니다. 메인 세션에서 실행할지 사용자가 정해야 합니다.

**M2. playwright-verify-loop 두 가지 낡은 지시**
- **위치와 근거:**
  - :123 "TodoWrite로 단계별 추적". tools에 TodoWrite가 없습니다.
  - :14 "general-purpose에 위임하고 rules/agents.md STEP 0에 따라 라우팅 표를 갱신". 서브에이전트가 룰 파일을 고치라는 지시이고, 아카이빙 이력 서술입니다.
- **패턴:** G2
- **조치:**
  - :123은 remove.
  - :14는 rewrite: "테스트 스위트 작성 요청이면 범위 밖이라고 보고하고 끝낸다."

**M3. pptx-asset-generator:46 사용할 수 없는 도구를 지시**
- **근거:** "`use context7`로 최신 문서를 확인". 에이전트 tools에 context7 MCP가 없습니다.
- **패턴:** G1d(아무것도 강제하지 않는 지시)
- **조치:** rewrite.
  > "node_modules/pptx-automizer의 타입 정의·README를 Read해 API를 확인한다."

**M4. security-reviewer:44 수정 담당을 진단 전용 에이전트로 지정**
- **근거:** "쿼리·스키마는 database-reviewer"를 수정 담당으로 적었지만, database-reviewer는 진단 전용입니다(:9).
- **조치:** rewrite. "쿼리는 express-engineer, 스키마 변경은 db-schema-architect"로 바꿉니다.
- **연관 flag(architect:40):** "PostgreSQL이면 database-reviewer"라고 되어 있지만, db-schema-architect는 MySQL 전용이고(:142) database-reviewer는 설계를 하지 않습니다. PostgreSQL 스키마 설계 담당이 비어 있습니다.

**M5. db-schema-architect와 database-reviewer의 역할 중복 (G4 로스터)**
- **근거:** db-schema-architect:3 description이 REVIEW를 "기존 스키마 ... 감사"로 소개합니다. 이는 database-reviewer의 라우팅 영역과 겹치고, 같은 파일 본문 :121의 "설계·마이그레이션 직전 자체 사전점검"과도 다릅니다.
- **조치:** rewrite. description을 "REVIEW(DESIGN·MIGRATE 직전 자체 점검. 기존 스키마 감사는 database-reviewer)"로 바꿉니다.

**M6. shortform-critic 보관 권장 (G4 로스터)**
- **근거:**
  - 파이프라인에서 이미 빠졌습니다(rules/agents.md:50, shortform SKILL.md:40).
  - 핵심 입력인 `01-research.md`를 planner가 기본적으로 만들지 않습니다(shortform-planner:72).
  - :129의 열 이름 "화면이 말하는 것"은 planner 출력 형식(:81 "화면 문자")에 없습니다.
  - :33의 "프로젝트 규칙: 리뷰 주체 분리"는 현재 CLAUDE.md에 없습니다.
  - :45는 2026-08-08 사고 서술입니다.
- **조치:** move. 0486d1c 커밋에서 호출 0회 에이전트 3개를 보관한 기준과 같게 `agents-archive/`로 옮깁니다. 남길 경우 :18, :129를 planner의 현행 형식에 맞춰 rewrite합니다.

**M7. game-asset-artist 이력·이전 지시 비교식 서술과 압력 언어**
- **근거:**
  - :19-23, :55-59 "원래 gpt-image 알파 옵션을 전제로 쓰였다. 지금은 ... 치환해서 적용"
  - :3 description의 "(2026-09-19부로 ... 사용자 지시 '코덱스는 안써 이제')"
  - :30-31 "이 세션에서 이미 만든 키잉 도구"("이 프로젝트" 고정 표현이 :15 "특정 프로젝트에 고정되지 않는다"와 충돌)
  - "절대 규칙 0~5", "[최우선]", "절대 금지"
- **패턴:** G1d, G2 이력 서술, G1a
- **조치:**
  - 3번 규칙은 현행 규칙만 직접 서술하도록 rewrite합니다.
  - :55-59는 remove.
  - description은 "flow-nanobanana로 생성, 알파가 필요하면 마젠타 + 크로마키"로 바꿉니다.
  - "절대 규칙"은 "규칙"으로 바꿉니다.
  - 284줄로 특화 상한 250줄을 넘으므로 :120-135, :253-273을 agent-refs로 move합니다.

**M8. 정의파일 줄 수 상한 초과 (rules/agents.md:116 기준)**
- **위치:**
  - 일반 150줄 상한 초과: playwright-verify-loop 234, doc-generator 230, schema-drift-auditor 218, ui-design-system 208, proposal-pt-builder 193, web-crawler 191, lee-wonho 164, db-schema-architect 155
  - 특화 250줄 상한 초과: welcon-advisor 290
- **추가 근거:** doc-generator:218-230과 proposal-pt-builder:177-193의 "핵심 규칙 요약"은 본문을 다시 반복합니다(G1c 반복 강조).
- **조치:** 요약 절은 remove하고, 나머지는 agent-refs로 move합니다.

**M9. em-dash 규칙 문구가 깨짐**
- **위치:** lee-wonho:99, gov-followup-outreach-writer:124, meeting-minutes-writer:70, repo-janitor:37
- **근거:** "em-dash(-) 금지, 하이픈(-) 사용". em-dash를 일괄 치환하면서 금지 문자 자리에도 하이픈이 들어가, 규칙이 "하이픈 금지, 하이픈 사용"으로 읽힙니다.
- **패턴:** G2
- **조치:** rewrite.
  > "em-dash(U+2014) 금지, 하이픈(-) 사용"

  skill-evaluator:49의 표기 방식과 같습니다.

**M10. 이력 서술 정리**
- **근거:**
  - meeting-minutes-writer:13 "이전에는 meeting-report-writer/...로 나뉘어"
  - ui-design-system:3 description "project-bootstrapper는 2026-08-20 ... 아카이빙"
  - gumgumi-cinematic-planner:56과 :3, gumgumi-animator:27 "2026-09-28 방침 변경". 본문 항목은 이미 ko 전용입니다.
- **패턴:** G2 이력 서술, G1d
- **조치:** remove. 필요한 곳만 "한국어판만 만든다"로 rewrite합니다.

**M11. welcon-advisor 참조와 구조 정리**
- **위치와 근거:**
  - :156 `[[project_welcon_company_category_audit]]`는 프로젝트 밖 메모리 링크라 서브에이전트가 읽을 수 없습니다.
  - :53 "B. 최종 89개 ... 구버전"과 G/G-2/H/I/G-1 절의 "이 절이 이긴다" 우선순위 사슬은 패치가 쌓인 구조입니다.
- **패턴:** G2, G1d
- **조치:**
  - :156은 `welcon/0901/0831_최종대조_빠진항목.md`로 rewrite합니다.
  - B절 총계를 102개로 갱신하고 H절을 합칩니다.

**M12. api-contract-designer:72 생성 파일 개수 불일치**
- **근거:** 본문은 "6파일", description:3은 "5개 파일"입니다.
- **조치:** description을 "6개 파일(Zod·라우트·컨트롤러·Repository·API 클라이언트·MSW)"로 rewrite합니다. :89-90은 :11-20과 중복입니다(낮음).

**M13. 안전 규칙과의 충돌 (flag, 사용자 결정 필요)**
- spreadsheet-editor:11 "'직접 수정해'라고 해도 ... 새 파일로 산출" ↔ CLAUDE.md "'직접 수정해'는 해당 파일 in-place Edit"
- shortform-builder:103-104 "같은 파일명에 덮어쓴다 / out/의 mp4는 전부 지우고" ↔ CLAUDE.md 승인 없는 삭제·덮어쓰기 금지. 작업 범위로 한정된 예외지만, 어떤 규칙을 덮어쓰는지 명시하지 않았습니다.

### LOW (flag만)
- **고정된 모델명:** lee-wonho:134 "Opus 5 또는 Fable 5", gumgumi-animator:12 "(Opus 제작...)". "상위 모델(Opus·Fable)"로 바꾸는 것을 제안합니다.
- **점수 계산 규칙(G1b):** agent-evaluator-v2:38,60-62, skill-evaluator:35-52. 1회 채점이 목적이라 유지를 권합니다.
- **압력 언어(G1a):** doc-generator:14 "위반 시 동작 불가", proposal-pt-builder:18, playwright-verify-loop:13,18,62,81 "(혼동 금지)", meeting-minutes-writer:17, ui-design-system:9,187 "참사", spreadsheet-editor:9 "# 절대 규칙"
- **이모지 표기:** react-specialist:100, ui-design-system:162, doc-generator:214, proposal-pt-builder:157-158. 출력 형식 안의 기호라 위반은 아닙니다.
- **기타:**
  - hwp-generator:17 기본 저장 경로 `~/Documents/` ↔ repo-janitor:50 "/home/lee/project 하위"
  - jasoseo-writer:12 대체 경로 `.claude/agents/jasoseo-profile.md`는 agents/ 안이라 에이전트로 스캔될 수 있습니다. `jasoseo-data/`는 gitignore 대상이라 파일이 없는 것은 정상입니다.
  - schema-drift-auditor:204 강등 규칙은 패치가 쌓인 형태입니다.
  - ui-design-system:191 "다크모드 무료" ↔ lee-wonho X-05(다크모드는 과잉의 경계)
  - express-engineer:36 `res.json` 직접 호출 금지 ↔ rules/coding-style.md 예시의 `res.json` 직접 호출

### 유지할 것 (keep list 1번: 규칙의 근거 문단)
ops-deployer:22, repo-janitor:21,33, shortform-builder:39,68-69, gumgumi-cinematic-planner:93-95, meeting-minutes-writer:59, game-asset-artist:157-160, api-contract-designer:11-22, db-schema-architect:11-23, ui-design-system:22-32는 규칙의 이유를 담고 있으니 남겨 두세요.

### 로스터 중복 점검 (G4) 결론
- ebook-student/editor: 읽기 전용 보고와 수정이 의도적으로 분리돼 있고 도구도 다릅니다. 유지
- gumgumi 3종: 기획, 검토, 렌더 단계가 분리돼 있습니다. 유지
- gumgumi-explain-reviewer와 shortform-critic: 기준과 파이프라인이 달라 합칠 대상이 아닙니다. critic만 보관(M6)
- gumgumi-cinematic-planner와 shortform-planner: 산출 형식이 달라 유지
- agent-evaluator-v2와 skill-evaluator: 평가 대상이 달라 유지
- 실제 겹침은 db-schema-architect REVIEW 모드와 database-reviewer(M5) 하나입니다.

### 문제 없는 파일
build-error-resolver, database-reviewer, doc-updater, ebook-editor, ebook-student, flowmap-resolver, function-validator, refactor-cleaner, tdd-guide

### 파일별 finding 수
| 파일 | 건수 |
|---|---|
| game-asset-artist | 7 |
| playwright-verify-loop | 7 |
| ui-design-system | 7 |
| meeting-minutes-writer | 4 |
| welcon-advisor | 4 |
| db-schema-architect | 3 |
| doc-generator | 3 |
| lee-wonho | 3 |
| proposal-pt-builder | 3 |
| repo-janitor | 3 |
| shortform-builder | 3 |
| spreadsheet-editor | 3 |
| .quality-tracking.md | 2 |
| api-contract-designer | 2 |
| gov-followup-outreach-writer | 2 |
| gumgumi-animator | 2 |
| gumgumi-cinematic-planner | 2 |
| pastletter-image-prompt-writer | 2 |
| planner | 2 |
| pptx-asset-generator | 2 |
| react-specialist | 2 |
| schema-drift-auditor | 2 |
| web-crawler | 2 |
| agent-evaluator-v2 | 1 |
| architect | 1 |
| express-engineer | 1 |
| gumgumi-explain-reviewer | 1 |
| hwp-generator | 1 |
| jasoseo-writer | 1 |
| ops-deployer | 1 |
| security-reviewer | 1 |
| shortform-critic | 1 |
| shortform-planner | 1 |
| skill-evaluator | 1 |
| 위 "문제 없는 파일" 9개 | 0 |
| 게임 4종 | 프로젝트 밖, 감사하지 않음 |

**참고 파일 (모두 확인용으로 읽음)**
- `/home/lee/project/.claude/rules/agents.md` (라우팅 SSOT, 116행 줄 수 상한)
- `/home/lee/project/.claude/skills/flow-nanobanana/SKILL.md`
- `/home/lee/project/.claude/skills/shortform/SKILL.md`
- `/home/lee/project/.claude/agent-refs/ui-design-methodology.md`
- `/home/lee/project/.claude/pptx-asset-library/generators/audit.py`
- `/home/lee/project/.claude/docs/agents-reference.md`

game-asset-artist.md는 감사 시점에 커밋되지 않은 수정(M) 상태였습니다.
