**감사 범위와 대상 모델**

- 대상 모델은 Claude Opus 5.5다. 6개 스킬 모두 frontmatter에 model이 없다.
- video-use는 심볼릭 링크로, 실제 위치는 `/home/lee/project/video-use`다. 프로젝트 안에 있어서 실경로로 읽었다. upstream `browser-use/video-use`를 clone한 별도 git 레포이고, 로컬에서는 SKILL.md의 em-dash만 바뀌어 있다. 그래서 여기를 고치면 upstream과 갈라진다.
- 경로와 플래그는 helpers/*.py의 argparse 정의를 읽어서 대조했다. 명령은 하나도 실행하지 않았다. 다만 Glob 도구가 없어 디렉터리 목록은 Bash의 ls/grep으로 봤다.

**요약**

가장 영향이 큰 문제는 세 가지다.
1. video-use SKILL.md가 helper 코드의 실제 동작과 3곳에서 어긋난다(자막 MarginV, `--preview` 해상도, 없는 `--filter` 플래그).
2. 파일 줄 수 상한(800줄)과 DRY·폴더 구조가 최신 규칙(`rules/coding-style.md`의 500줄과 지역성 우선)과 충돌한다.
3. 응답 shape를 하나로 고정하는 예시가 `rules/patterns.md`와 같은 파일 하단 문구와 충돌한다.

findings는 대부분 Group 2(설정 파일 충돌, 낡은 사실)이고 Group 1은 소수다. Group 3과 4는 해당 없다.

---

### High

**H1. video-use SKILL.md:184, 190**
- 근거: "MarginV=35 ... `render.py` ships with this as `SUB_FORCE_STYLE`"
- 패턴: Group 2 Volatile specifics
- 왜 낡았나: `helpers/render.py:51-56`의 실제 값은 `MarginV=90`이다. 커밋 87f00c6에서 세로 영상 안전영역 때문에 올렸다.
- 조치: rewrite. "`MarginV=90`(세로 안전영역 회피). `render.py`가 `SUB_FORCE_STYLE`로 이 값을 쓴다." 코드블록 190행도 90으로 바꾼다.

**H2. video-use SKILL.md:78**
- 근거: "`--preview` for 720p fast"
- 패턴: Group 2 Volatile specifics
- 왜 낡았나: `render.py:579-588`을 보면 `--preview`는 1080p CRF22이고, 720p는 `--draft`다.
- 조치: rewrite. "`--preview`는 1080p medium CRF 22(QC용), `--draft`는 720p ultrafast(컷 지점 확인용)."

**H3. video-use SKILL.md:266**
- 근거: "`render.py` ... pass `--filter` or edit the extract command"
- 패턴: Group 2 Volatile specifics
- 왜 낡았나: render.py의 argparse(577-605행)에 `--filter`가 없다. `--filter`는 grade.py에만 있다.
- 조치: rewrite. "다른 해상도가 필요하면 `render.py`의 extract 명령(scale 부분)을 고친다."

**H4. manim-video/README.md:22**
- 근거: "`bash skills/creative/manim-video/scripts/setup.sh`"
- 패턴: Group 2 Volatile specifics
- 왜 낡았나: 이 경로는 없다. 실제 경로는 `skills/manim-video/scripts/setup.sh`다.
- 조치: rewrite. 실제 경로로 고친다.

**H5. convention-enforcer/SKILL.md:15, error-prevention-rules/SKILL.md:12**
- 근거: "`/convention-check <경로>`", "`/error-prevention-check <경로>`"
- 패턴: Group 2 Volatile specifics
- 왜 낡았나: `commands/`(12개)와 `skills/` 어디에도 이 커맨드가 없다.
- 조치: rewrite. "수동 - '컨벤션 검사해줘' / '에러 방지 룰 검사해줘'처럼 경로를 지정해 요청"

**H6. convention-enforcer:330-336 (ce-007), coding-standards:515, convention-enforcer:542**
- 근거: "파일 800줄 초과: warn / 1500줄 초과: error", "파일 800줄 미만", "400줄 초과는 ce-007과 중복"
- 패턴: Group 2 충돌
- 왜 낡았나: `rules/coding-style.md:12`의 "최대 500줄, 초과 시 즉시 분할"(2026-07-28)이 ce-007(2026-04-21)보다 새 규칙이다. 542행의 400줄은 같은 파일 안에서도 앞뒤가 맞지 않는다.
- 조치: rewrite
  - ce-007: "함수 50줄 초과 warn / 파일 500줄 초과 error(즉시 분할, rules/coding-style.md I-06) / 500줄 미만은 분할을 강제하지 않는다"
  - coding-standards:515: "함수 50줄 미만, 파일 500줄 이하"
  - 542행: "파일 크기는 ce-007에 위임한다"

**H7. coding-standards:24-28**
- 근거: "DRY ... 공통 로직을 함수로 추출 / 모듈 간 유틸리티 공유 / 복사-붙여넣기 지양"
- 패턴: Group 2 충돌
- 왜 낡았나: `rules/coding-style.md:17-20`의 "DRY보다 지역성 우선"(2026-07-28)이 이 부분(2026-03-10)보다 새 규칙이다. rules 파일은 매 세션 로드되므로 내용도 이미 그쪽에 있다.
- 조치: remove. 3번 섹션을 통째로 지운다.

**H8. 프론트엔드 폴더 구조 3종**
- 위치: coding-standards:294-308(`lib/api/`), frontend-patterns:77-83(`features/`, `components/ui/`), convention-enforcer:342-358(ce-008 `src/api/` 강제)
- 패턴: Group 2 충돌
- 왜 낡았나: 세 스킬이 서로 다른 구조를 제시한다. 게다가 `rules/coding-style.md:19`의 "페이지 API 코드는 그 페이지 폴더에"(2026-07-28)와도 어긋난다. 세 블록 모두 2026-03 또는 2026-04에 들어갔다.
- 조치:
  - coding-standards와 frontend-patterns의 구조 블록은 remove.
  - ce-008은 rewrite: `api/` 행을 "`api/` 또는 페이지 폴더 안 api 파일(페이지 단위 동거 허용, rules/coding-style.md 지역성 우선)"으로 바꾼다.

**H9. coding-standards:237-256, 279-284**
- 근거: `{ success, data, meta, msg }`, `{ success:false, data:null, error, msg }`
- 패턴: Group 2 충돌
- 왜 낡았나: `rules/patterns.md:3-8`(2026-07-25)은 "하나로 고정하지 말 것"이라고 하고, 기본 필드명도 `message`다. `msg`는 어느 실측 프로젝트에도 없다.
- 조치: rewrite. 응답 형식 섹션 전체를 "응답 shape은 rules/patterns.md의 확인 순서를 따른다(프로젝트 response.js 실측 우선)." 한 줄로 바꾼다.

**H10. backend-patterns:43-57, 153-168, 178-182**
- 근거: "### 응답 형식 (일관성 필수)"와 `{ success:false, error }` 고정
- 패턴: Group 2 충돌
- 왜 낡았나: 같은 파일 377-380행(2026-07-25/08-20)과 patterns.md가 "전역 고정 금지, 기본은 `message/errors`"라고 한다. 43-57행은 2026-04-21에 들어간 더 오래된 내용이다.
- 조치: rewrite. 43행을 "### 응답 형식 예시 (아래 'API 응답 포맷' 확인 순서로 프로젝트 실측 shape를 우선한다. 이 예시는 `error` 변형)"으로 바꾼다.

**H11. backend-patterns:133**
- 근거: "Prisma는 이 프로젝트에서 미지향입니다"
- 패턴: Group 2 충돌
- 왜 낡았나: CLAUDE.md:95(2026-08-20)가 "ORM 프로젝트는 해당 ORM 관례(cosmic-kuji-market)"라고 정한다. 133행은 2026-07-19로 더 오래됐다.
- 조치: rewrite. "Prisma 프로젝트(예: cosmic-kuji-market)는 Prisma 관례를 따른다. raw SQL 프로젝트에는 Prisma를 새로 도입하지 않는다."

### Medium

**M1. convention-enforcer:12, error-prevention-rules:11 (+ 3행 description)**
- 근거: "자동 - `.jsx/.tsx` 저장 직후"
- 패턴: Group 2 충돌
- 왜 낡았나: `rules/hooks.md:5-7`(2026-08-21)에 "등록된 훅이 하나도 없다. 훅이 있다고 가정하고 동작을 설계하지 말 것"이라고 되어 있다. 위 문구는 2026-08-20이라 더 오래됐다.
- 조치: rewrite. "`.jsx/.tsx`(.js/.ts) 파일을 작성·수정한 직후 Claude가 직접 적용한다(저장 훅은 등록돼 있지 않다)."

**M2. frontend-patterns:172-176**
- 근거: `useLocalStorage`의 `localStorage.setItem(...)`이 try/catch 없이 쓰였다.
- 패턴: Group 2 충돌
- 왜 낡았나: error-prevention-rules:260-281(ep-010)과 coding-standards:523은 try/catch를 요구한다. 세 곳 모두 같은 커밋(57bd42d1)이라 시점으로는 순서를 가릴 수 없다. 다만 룰 쪽에 이유(iOS Safari 프라이빗 모드)가 붙어 있어 예시 쪽이 틀렸다고 보았다.
- 조치: rewrite. `try { localStorage.setItem(key, JSON.stringify(valueToStore)) } catch (e) { console.warn('storage 저장 실패', e) }`

**M3. frontend-patterns:122-144(useAsync), 392-397**
- 근거: useEffect 안의 fetch 예시에 AbortController가 없다.
- 패턴: Group 2 충돌
- 왜 낡았나: ep-001은 이 패턴을 error로 잡는다. 같은 세션에서 두 스킬이 함께 로드되면 예시가 룰을 위반하는 셈이다.
- 조치: rewrite. 397행 예시를 `useEffect(() => { const ac = new AbortController(); fetchData(userId, { signal: ac.signal }); return () => ac.abort() }, [userId])`로 바꾸고, useAsync에도 signal을 전달한다.

**M4. error-prevention-rules:18, frontend-patterns:399-406**
- 근거: "렌더 중 객체/함수 생성 금지"(절대형), "인라인 객체/함수 → useMemo/useCallback"
- 패턴: Group 1a(근거 없는 절대 표현)와 같은 파일 안의 충돌
- 왜 낡았나: ep-008은 warn이고 예외(원시값 단일 객체)가 있다. frontend-patterns:224-227과 419행은 "측정 후 적용"이라고 한다. 이렇게 절대형으로 써 두면 과잉 메모이제이션을 유발한다.
- 조치: rewrite
  - error-prevention-rules:18: "memo된 자식 prop이나 effect 의존성으로 넘기는 객체·함수는 매 렌더 새 참조가 되지 않게 한다(ep-008)."
  - frontend-patterns:399 제목: "❌ memo된 자식에 인라인 객체/함수 전달"

**M5. error-prevention-rules:386**
- 근거: "렌더 함수 내 `use(fetch(...))` ... ep-001 대상 외"
- 패턴: Group 2 Volatile specifics(API 주장)
- 왜 낡았나: React 19 문서상 렌더 중에 새로 만든 promise는 매 렌더 다시 생성된다. 이 문장은 버그 패턴을 통과시킨다.
- 조치: rewrite. "렌더 밖(상위 컴포넌트·캐시)에서 만든 promise를 `use()`로 받는 경우만 ep-001 대상 외. 렌더 중 `use(fetch(...))`로 promise를 새로 만들면 위반으로 보고한다."

**M6. coding-standards:369-371, 328-329**
- 근거: `useMemo(() => markets.sort(...))`, "의도적으로 mutation 사용 `items.push(newItem)`"(좋은 예로 제시됨)
- 패턴: Group 2 충돌
- 왜 낡았나: 같은 파일 66-80행("절대 직접 변경 금지")과 `rules/coding-style.md`의 Immutability CRITICAL에 어긋난다. 특히 sort는 props 배열 자체를 바꾼다.
- 조치:
  - 370행 rewrite: `[...markets].sort((a, b) => b.volume - a.volume)`
  - 328-329행은 remove(주석 예시는 백오프 한 개로 충분하다).

**M7. coding-standards:271-287**
- 근거: 컨트롤러가 catch 안에서 `res.status(400).json({... msg: '유효성 검사 실패'})`를 바로 반환하고, Zod가 아닌 에러는 삼킨다.
- 패턴: Group 2 충돌
- 왜 낡았나: `rules/coding-style.md:27-33`(2026-08-20)의 "(A) try/catch 후 `next(err)`, 사용자 노출 문자열은 컨트롤러에 넣지 않는다"보다 오래된(2026-03-10) 내용이다.
- 조치: rewrite. 예시를 `try { const validated = CreateMarketSchema.parse(req.body); ... } catch (err) { next(err) }`로 바꾸고 "ZodError → 400 변환은 중앙 errorHandler가 한다"를 덧붙인다.

**M8. backend-patterns:381**
- 근거: "res.json 직접 호출 금지 → 응답 유틸 래퍼 사용"
- 패턴: Group 2 충돌
- 왜 낡았나: 같은 파일의 모든 예시(46-56, 316, 335행)와 `rules/coding-style.md:29-37` 예시가 `res.json`을 직접 쓴다.
- 조치: rewrite. "프로젝트에 응답 래퍼(response.js 등)가 있으면 그것을 쓰고, 없으면 `res.json`을 쓴다."

**M9. backend-patterns:87-101, 108-114**
- 근거: `SELECT id, ... WHERE id = $1`, `RETURNING id`
- 패턴: Group 2 충돌
- 왜 낡았나: CLAUDE.md:95의 이중 ID 패턴(외부에는 uuid만 노출)과 같은 파일 387행에 어긋난다. 이 결과가 316행에서 그대로 응답으로 나간다.
- 조치: rewrite. 외부 조회 예시를 `SELECT user_id, email, name, created_at FROM users WHERE user_id = ? AND deleted_at IS NULL`로 바꾸고, 주석에 "내부 id는 JOIN·FK 전용"을 적는다.

**M10. video-use SKILL.md:289**
- 근거: "`grade` is a preset name or raw ffmpeg filter."
- 패턴: Group 2 Volatile specifics(설명 누락)
- 왜 낡았나: `render.py:66-75`가 `"auto"`(구간별 자동 보정)를 지원하는데 설명에 없다.
- 조치: add. "`grade`는 preset 이름, raw ffmpeg 필터, 또는 `\"auto\"`(구간마다 분석해 미세 보정)다. 비우면 grade 없음."

**M11. manim-video/SKILL.md:17**
- 근거: "First-render excellence is non-negotiable ... without revision rounds"
- 패턴: Group 1a(압박 표현)
- 왜 낡았나: 같은 파일의 REVIEW 단계(63, 183-187행)와 production-quality.md 체크리스트와 충돌한다. 이런 문구는 과잉 경직을 유발한다.
- 조치: rewrite. "목표는 수정 라운드 없이 통과하는 첫 렌더다. 어수선하거나 'AI 슬라이드'처럼 보이면 고친다."

**M12. coding-standards:12-22, 30-34, 500; frontend-patterns:419; backend-patterns:370**
- 근거: 가독성, KISS, YAGNI 일반론과 "코드 품질은 타협할 수 없습니다" 같은 맺음 구호
- 패턴: Group 2 row 1과 Group 1c Padding
- 왜 낡았나: 모델이 이미 아는 기본값을 반복하는 내용이다. 프로젝트 고유 정보가 없다.
- 조치: remove. 단 불변성과 zod 예시는 `rules/coding-style.md`가 참조하므로 남긴다.

**M13. 커밋 해시 나열과 성공 지표**
- 위치: convention-enforcer:693-704, error-prevention-rules:414-418, 431-432
- 근거: "참고 커밋 `895043a` ...", "성공 지표 ... 100% 차단"
- 패턴: Group 2 History narratives와 Group 1c(채점 어휘)
- 왜 낡았나: 해시는 WeCom 레포 것이라 이 레포에서는 확인할 수 없고, 지표는 행동을 바꾸지 않는다. 룰마다 붙은 한 줄 "근거"는 맥락이므로 남긴다.
- 조치: remove. 해당 섹션만 지운다.

### Low / flag

- **L1. convention-enforcer:552, 554** - "전담 project-bootstrapper는 아카이빙됨"은 이력 서술이다(Group 2 History). 지우고 "직접 설치 필요"만 남기는 것이 좋다.
- **L2. error-prevention-rules:420-429, 318** - WeCom 파일명 기준 "예상 탐지" 목록이 레포 밖 사실이라 확인할 수 없다(Group 2 Volatile). flag.
- **L3. convention-enforcer:480, 544** - `wecom-convention-checker`는 이 프로젝트 agents/에 없다. 출처 표기로만 쓰인 것이라 flag.
- **L4. video-use 부속 문서의 em-dash**
  - 개수: install.md 13개, manim SKILL.md 16개, references 합계 약 90개, USAGE-KR.md 12개, GUIDE-KR.md 2개
  - 근거: 사용자 규칙은 em-dash 금지다. 프롬프트 문체가 출력에 번질 수 있다.
  - upstream 레포 파일이라 flag만 한다.
- **L5. video-use SKILL.md:16, 91-99** - 매번 자체 검증(timeline_view)을 하라는 지시가 `rules/agents.md` STEP 1-2 #4("요구되지 않은 자체 검증 금지")와 겹친다. 영상 편집이라는 작업 특성상의 override로도 볼 수 있다. 사용자 판단이 필요하다.
- **L6. video-use SKILL.md 환경 의존 서술**
  - 243행: Menlo 경로가 macOS 전용인데 현재 환경은 Linux다.
  - 65행: "HyperFrames currently requires Node.js 22+"에 확인 날짜가 없다.
  - 70행: 설치 위치를 `~/.claude/skills`로 설명하지만 실제로는 project/.claude/skills에 링크돼 있다.
  - 모두 레포 밖 경로라 확인하지 않고 flag만 한다.
- **L7. backend-patterns:254** - production에서 `ssl: { rejectUnauthorized: false }`를 기본 예시로 둔다. 보안 관점 flag다(프롬프트 패턴은 아님).
- **L8. manim-video/SKILL.md:247** - "reason through it BEFORE designing"은 계획 강요형 문구다(Group 1b). 관용구로 시기를 추정한 것이라 flag.

---

### 파일별 finding 수

| 파일 | 수 | 내역 |
|---|---|---|
| video-use (SKILL.md, manim-video 포함) | 10 | H1, H2, H3, H4, M10, M11, L4, L5, L6, L8 |
| convention-enforcer | 7 | H5, H6, H8, M1, M13, L1, L3 |
| coding-standards | 7 | H6, H7, H8, H9, M6, M7, M12 |
| frontend-patterns | 5 | H8, M2, M3, M4, M12 |
| error-prevention-rules | 6 | H5, M1, M4, M5, M13, L2 |
| backend-patterns | 6 | H10, H11, M8, M9, M12, L7 |

여러 파일에 걸친 finding은 각 파일에 중복으로 셌다.

그룹별로는 Group 2가 25건, Group 1이 5건이다(M12, M13은 1과 2에 걸쳐 있어 Group 2로 셌다). Group 3과 4는 해당 없다. 6개 스킬 모두 finding이 있어서 "깨끗함"으로 판정한 파일은 없다.
