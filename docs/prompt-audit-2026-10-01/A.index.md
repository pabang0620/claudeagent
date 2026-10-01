# A.patch finding 대응표

패치: `A.patch` (46 hunk). 적용: `cd /home/lee/project && patch -p1 < A.patch`
라인은 원본 파일 기준. 문맥 줄 수는 finding 분리를 위해 파일마다 다르다(convention-enforcer·frontend-patterns는 -U0, error-prevention-rules·coding-standards는 -U2, 나머지 -U3).

| hunk | finding | 파일:라인(원본) |
|---|---|---|
| 1 | H2 | video-use/SKILL.md:78 |
| 2 | H1 | video-use/SKILL.md:184, 190 |
| 3 | H3 | video-use/SKILL.md:266 |
| 4 | M10 | video-use/SKILL.md:289 |
| 5 | H4 | video-use/skills/manim-video/README.md:22 |
| 6 | M11 | video-use/skills/manim-video/SKILL.md:17 |
| 7 | M1 | .claude/skills/convention-enforcer/SKILL.md:12 |
| 8 | H5 | .claude/skills/convention-enforcer/SKILL.md:15 |
| 9 | H6 | .claude/skills/convention-enforcer/SKILL.md:327 |
| 10 | H6 | .claude/skills/convention-enforcer/SKILL.md:331-332 |
| 11 | H6 | .claude/skills/convention-enforcer/SKILL.md:334 |
| 12 | H6 | .claude/skills/convention-enforcer/SKILL.md:336 |
| 13 | H8 | .claude/skills/convention-enforcer/SKILL.md:351 |
| 14 | H6 | .claude/skills/convention-enforcer/SKILL.md:542 |
| 15 | M13 | .claude/skills/convention-enforcer/SKILL.md:692-704 |
| 16 | M1 | .claude/skills/error-prevention-rules/SKILL.md:3 |
| 17 | M1 + H5 (예외: 인접 줄이라 분리 불가) | .claude/skills/error-prevention-rules/SKILL.md:11 (M1), 12 (H5) |
| 18 | M4 | .claude/skills/error-prevention-rules/SKILL.md:18 |
| 19 | M5 | .claude/skills/error-prevention-rules/SKILL.md:386 |
| 20 | M13 | .claude/skills/error-prevention-rules/SKILL.md:414-419 |
| 21 | M13 | .claude/skills/error-prevention-rules/SKILL.md:430-432 |
| 22 | H7 | .claude/skills/coding-standards/SKILL.md:24-29 |
| 23 | H9 | .claude/skills/coding-standards/SKILL.md:239-256 |
| 24 | M7 | .claude/skills/coding-standards/SKILL.md:271-287 |
| 25 | H8 | .claude/skills/coding-standards/SKILL.md:292-309 |
| 26 | M6 | .claude/skills/coding-standards/SKILL.md:327-329 |
| 27 | M6 | .claude/skills/coding-standards/SKILL.md:370 |
| 28 | M12 | .claude/skills/coding-standards/SKILL.md:498-502 |
| 29 | H6 | .claude/skills/coding-standards/SKILL.md:515 |
| 30 | H8 | .claude/skills/frontend-patterns/SKILL.md:76-84 |
| 31-35 | M3 | .claude/skills/frontend-patterns/SKILL.md:127-143 (useAsync) |
| 36 | M2 | .claude/skills/frontend-patterns/SKILL.md:175 |
| 37 | M3 | .claude/skills/frontend-patterns/SKILL.md:396 |
| 38-39 | M4 | .claude/skills/frontend-patterns/SKILL.md:399-402 |
| 40 | M12 | .claude/skills/frontend-patterns/SKILL.md:418-421 |
| 41 | H10 | .claude/skills/backend-patterns/SKILL.md:43 |
| 42 | M9 | .claude/skills/backend-patterns/SKILL.md:87-97 |
| 43 | M9 | .claude/skills/backend-patterns/SKILL.md:108-111 |
| 44 | H11 | .claude/skills/backend-patterns/SKILL.md:133 |
| 45 | M12 | .claude/skills/backend-patterns/SKILL.md:369-373 |
| 46 | M8 | .claude/skills/backend-patterns/SKILL.md:381 |

## 포함하지 않은 부분
- M12 중 coding-standards:12-22, 30-34(가독성·KISS·YAGNI 일반론): H7이 지우는 24-29와 맞붙어 있어 hunk를 분리할 수 없다. H7 적용 뒤 따로 처리할 것.
- Low·flag 항목(L1-L8)은 대상에서 뺐다.
- video-use는 upstream(browser-use/video-use) 레포 파일이라 적용하면 upstream과 갈라진다.
