# 프롬프트 감사 (2026-10-01)

## 전제 (Step 0)
- **범위**: 이 프로젝트에서 세션에 로드되는 Claude Code 설정.
  - `.claude/CLAUDE.md`, `.claude/rules/` 8개, `.claude/skills/` 24종, `.claude/commands/` 12개, `.claude/agents/` 47개
  - `~/.claude/CLAUDE.md`(0줄), `~/.claude/skills/`의 gpt-image·test-plugin
  - 하위 지침: `ai-hanjul-diary/`, `ebook-ai-dev-job/완성레포/`의 CLAUDE.md·AGENTS.md, `.agents/rules/AGENTS.md`
- **보고만**: `~/.claude/skills/synced/`(claude.ai 동기화 Anthropic 스킬)와 플러그인 스킬(unity:*, anthropic-skills:*)은 수정 제안 없음.
- **제외**: 게임 에이전트 4종(`/mnt/c/...` 링크, 프로젝트 밖). 하위 프로젝트 자체 설정(`wecom/.claude/CLAUDE.md`, `modadam/`, `ondam/`, `cosmic-renew/`)은 그 폴더에서 세션을 열 때 로드되는 별도 설정이라 범위 밖.
- **읽지 않음**: settings 파일, `.mcp.json`, `~/.claude.json`.
- **타깃 모델**: 이 세션 모델 Claude Opus 5.5. 정의파일이 모델을 고정하면 그 계열 최신(sonnet → Sonnet 5.5, opus → Opus 5.5).
- **신구 판정**: `git blame`. 이력으로 가릴 수 없는 충돌은 flag.

## 요약
가장 영향이 큰 세 가지는 다음과 같다.

1. **규칙 파일과 스킬·커맨드가 서로 반대로 말한다.** 2026-09-29~10-01 개편으로 CLAUDE.md, rules, 에이전트 정의는 바뀌었지만 스킬·커맨드·라우팅 표의 오래된 문장은 그대로였다.
   - 파일 상한: 500줄 vs 400·800줄
   - 중복 코드: "DRY보다 지역성" vs "중복 금지"
   - 커버리지: "인수 게이트만" vs "80% 상시"
   - 숏폼 산출물: "한국어 1개" vs "한/영 2개"
   - 이미지 생성: "gpt-image 중단" vs gpt-image 지시
   - 워크플로: "tdd-guide·code-reviewer 단건엔 안 붙임" vs "모든 변경에 자동"
2. **없는 대상을 가리키는 참조가 많다.** 존재하지 않는 경로·에이전트·스크립트·커맨드가 대상이다.
   - `project/frontend·backend·tests`, explorer 에이전트, tdd-workflow 스킬, `setup-package-manager.js`, `/instinct-*`, `.agy/` 경로
   - code-reviewer·dispatcher는 스킬인데 에이전트처럼 호출한다.
   - em-dash 금지 규칙은 일괄 치환으로 "하이픈 금지, 하이픈 사용"이 되어 버렸다.
3. **서브에이전트 19개 파일이 할 수 없는 일을 지시한다.** "대화로 묻고 답을 받아 진행", "승인 대기" 같은 지시다. 서브에이전트는 사용자와 대화할 수 없다.

## 묶음별 결과
| 묶음 | 대상 | finding(H/M/L) | 패치 hunk | 보고서 | 패치 |
|---|---|---|---|---|---|
| R | CLAUDE.md + rules | 5 / 10 / 3 | 15 | R.report.md | R.patch |
| A | 스킬 6종(video-use, convention-enforcer, coding-standards, frontend/backend-patterns, error-prevention-rules) | 11 / 13 / 8 | 46 | A.report.md | A.patch |
| B | 스킬 18종 | 17 / 9 / 6 | 59 | B.report.md | B.patch |
| C | commands 12 + 홈 스킬 + 하위 지침 | 22 / 13 / 5 | 70 + 3 | C.report.md | C.patch, C-global.patch |
| D | agents 47 | 18 / 13 / 다수 | 128 | D.report.md | D.patch |

그룹별로는 Group 2(충돌·낡은 사실·이력)가 대부분이고, Group 1(압력 언어·화석·과잉 지정)이 그다음이다. Group 3은 test-plugin·gpt-image의 2건, Group 4는 로스터 정리 2건(db-schema-architect REVIEW 모드 중복, shortform-critic 보관)이다.

## 패치 적용
5개 프로젝트 패치는 서로 다른 파일만 건드린다. 사본에 차례로 적용해 모두 성공하는 것을 확인했다. 원본에는 아무것도 적용하지 않았다.

```bash
cd /home/lee/project
patch -p1 --dry-run < .claude/docs/prompt-audit-2026-10-01/R.patch   # 묶음별로 골라서
patch -p1 < .claude/docs/prompt-audit-2026-10-01/R.patch
# 전역(~/.claude, 모든 프로젝트 영향): cd /home/lee && patch -p1 < .../C-global.patch
```

한 hunk에 한 finding을 담았다. hunk 번호와 finding ID의 대응은 `*.index.md`에 있다. 패치 파일을 직접 편집하면 원하는 hunk만 고를 수 있다.

### 적용 전 알아둘 것
- **문맥 줄 수**: A·B·C의 일부는 hunk를 나누려고 문맥 줄을 0~1줄로 만들었다. 원본이 그 사이에 바뀌면 엉뚱한 줄에 적용될 수 있으므로 반드시 `--dry-run`부터 돌린다.
- **video-use**: A.patch의 hunk 1~6은 upstream `browser-use/video-use` 클론 파일을 고친다. 적용하면 upstream과 갈라진다.
- **D.patch의 새 ref 파일**: 상한을 넘는 정의파일 9개의 코드·표를 `agent-refs/`의 새 파일 10개로 옮기는 hunk가 들어 있다.
- **game-asset-artist.md**: D.patch는 커밋되지 않은 현재 디스크 내용을 기준으로 만들었다.
- **삭제 hunk(승인 필요)**: C.patch의 `commands/setup-pm.md`, C-global.patch의 `~/.claude/skills/test-plugin/`(적용 후 빈 디렉토리는 따로 지워야 함).

## 사용자가 정할 것 (flag, 패치에 없음)
1. **`.agents/rules/AGENTS.md`(664줄)의 정본 문제.** 이 파일은 `.claude/rules`의 낡은 사본이다. 정본을 `.claude`로 하고 이 파일을 생성물로 볼지 정해야 한다(C-A6·A7·M12). 패치는 명백한 오류만 고친다.
2. **gpt-image 전역 스킬.** 투명 PNG 요청에 자동 발동해 flow-nanobanana 정책과 경쟁한다. `disable-model-invocation: true`를 넣을지 링크를 제거할지 정해야 한다(C-S2).
3. **flow-nanobanana의 워터마크 처리.** delogo로 지울지 크롭할지 정해야 한다. bgm-factory와 메모리는 크롭이다(B-17).
4. **서브에이전트의 Playwright 사용.** 서브에이전트가 Playwright를 받는지 실제로 확인해야 한다. 못 받으면 playwright-verify-loop을 메인에서 돌려야 한다(B-21, D-M1).
5. **repo-janitor 트리거.** 지금은 "커밋해줘"로 발동하는데, 커밋은 메인이 직접 하는 규칙과 충돌한다. 트리거를 이동·정리로 줄일지 정해야 한다(D-H18). R.patch는 rules/agents.md STEP 0 쪽만 고친다.
6. **덮어쓰기·삭제 예외.** spreadsheet-editor의 "직접 수정해도 새 파일로", shortform-builder의 "shorts/ 덮어쓰기·out/ mp4 삭제"가 CLAUDE.md 안전 규칙의 예외라는 것을 명시할지 정해야 한다(D-M13).
7. **shortform-critic 보관.** `git mv agents/shortform-critic.md agents-archive/shortform-critic-retired-2026-10-01.md`를 제안한다(D-M6).
8. **커밋 attribution.** rules/git-workflow.md:13은 "attribution disabled"라고 하는데, 오늘 커밋 두 건에는 Co-Authored-By가 붙었다(R-F1).
9. **완성레포 자동 push.** 완성레포에 `.git`이 없어 상위 레포가 push 대상이 된다(C-M13).

## 검증 (Step 7)
- 패치는 가설이다. 숏폼·굼구미·게임 스킬처럼 결과물이 있는 파이프라인은 한 묶음씩 적용하고 다음 실제 작업에서 이상이 없는지 본다.
- 문제가 생기면 git으로 그 파일만 되돌린다. `.claude`는 git 레포이고, video-use도 자체 git이다.

## 적용 결과 (2026-10-01, 사용자 지시 "판단해서 다 개선")
- R·A·B·C·D 패치 전부 적용(hunk 318개, 충돌 없음).
- flag 항목은 아래처럼 판단해 처리했다.
  1. `.agents/rules/AGENTS.md`: 정본은 `.claude/rules/agents.md`라고 명시하고, "직접 코딩 금지"와 "Sonnet 단일" 정책을 2026-09-29 지시에 맞춰 고쳤다. 파일 전체 재작성은 하지 않았다.
  2. gpt-image: `disable-model-invocation: true`를 넣어 자동 발동을 막았다(수동 호출은 가능). Star 요청 문장도 지웠다. upstream(genexis-ai) 클론이라 원본과 갈라진다.
  3. 워터마크: flow-nanobanana를 "지우지 말고 잘라낸다"로 통일했다. 영상 명령은 `crop=1500:844:210:0,scale=1920:1080`.
  4. Playwright: 서브에이전트(game-asset-artist)에 `mcp__playwright__*` 도구가 전달되는 것을 실제로 확인했다. flow-nanobanana와 bgm-factory의 "서브에이전트는 못 받는다"를 "스폰 전 도구 목록 확인, 브라우저는 한 번에 한 세션"으로 고쳤다.
  5. repo-janitor: description 트리거를 이동·정리·레포 분리로 좁혔다.
  6. 예외 명시: spreadsheet-editor(새 파일 산출이 "직접 수정해"보다 우선)와 shortform-builder(shorts 덮어쓰기와 out 삭제는 사용자 지시 예외)를 본문에 적었다.
  7. shortform-critic: `agents-archive/shortform-critic-retired-2026-10-01.md`로 보관했다.
  8. 커밋 attribution(R-F1): 설정을 확인할 수 없어 그대로 뒀다.
  9. 완성레포 push(C-M13): 독자 배포물이라 그대로 뒀다.
- test-plugin: 삭제하지 않고 `~/.claude/skills-disabled/test-plugin`으로 옮겼다(git 미추적이라 되돌릴 수 있게).
- coding-standards의 가독성·KISS·YAGNI 일반론(M12)을 지웠다. H7과 붙어 있어 패치에서 빠졌던 항목이다.
