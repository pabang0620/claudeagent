# B.patch finding 대응표

패치: B.patch (59 hunks, 14 files). 원본 라인 기준(hunk의 `-` 시작 라인). 한 hunk에 한 finding만 들어 있다.
대부분 파일은 diff -U1, `shortform/references/pipeline.md`와 `project-structure-guide/SKILL.md`는 서로 다른 finding이 인접해 hunk가 합쳐지는 것을 막으려고 -U0으로 만들었다.

| ID | 파일 | 원본 라인(hunk) |
|---|---|---|
| #1 | .claude/skills/shortform/SKILL.md | 4, 46, 55, 76, 87, 155 |
| #1 | .claude/skills/shortform/references/pipeline.md | 9, 64, 71, 129, 155, 170 |
| #2 | .claude/skills/gumgumi-cinematic/SKILL.md | 75, 83 |
| #3 | .claude/skills/game2d-pipeline/SKILL.md | 18, 31 |
| #4 | .claude/skills/game2d-pipeline/SKILL.md | 40 |
| #5 | .claude/skills/game2d-pipeline/SKILL.md | 11, 27 |
| #6 | .claude/skills/code-reviewer/SKILL.md | 6 |
| #7 | .claude/skills/code-reviewer/SKILL.md | 78, 127 |
| #8 | .claude/skills/code-reviewer/SKILL.md | 46 |
| #9 | .claude/skills/project-structure-guide/SKILL.md | 191, 193, 205 |
| #10 | .claude/skills/postgres-patterns/SKILL.md | 35, 46, 51 |
| #11 | .claude/skills/dispatcher/SKILL.md | 83, 96, 102, 120, 136, 168 |
| #12 | .claude/skills/dispatcher/SKILL.md | 182 |
| #13 | .claude/skills/dispatcher/SKILL.md | 211 |
| #14 | .claude/skills/checkpoint/SKILL.md | 30 |
| #15 | .claude/skills/quote-builder/SKILL.md | 34, 204 |
| #16 | .claude/skills/mobile-first-checker/SKILL.md | 31, 315 |
| #18 | .claude/skills/shortform/references/pipeline.md | 124 |
| #19 | .claude/skills/shortform/SKILL.md | 105 |
| #19 | .claude/skills/shortform/references/pipeline.md | 84, 131, 146, 161 |
| #20 | .claude/skills/flow-nanobanana/SKILL.md | 43, 79 |
| #22 | .claude/skills/readdy-cinematic/SKILL.md | 11 |
| #23 | .claude/skills/code-reviewer/SKILL.md | 50, 83, 104 |
| #24 | .claude/skills/test-coverage/SKILL.md | 2, 8, 95 |
| #25 | .claude/skills/project-structure-guide/SKILL.md | 202 |
| #26 | .claude/skills/mobile-first-checker/SKILL.md | 325 |

제외: #17(delogo 충돌), #21(Playwright 전달 여부)는 flag라 제외. #27~#32는 Low라 제외.

참고:
- #10은 DDL의 `creator_id`를 `bigint`로 함께 바꿨다(users.id가 bigserial이 되므로).
- #15의 em-dash 검사 명령은 em-dash 문자를 쓰지 않도록 `printf '\342\200\224'` 형태로 적었다.
