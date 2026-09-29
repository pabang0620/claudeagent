# 에이전트 운영 참고 (필요할 때만 읽는다)

> 2026-09-29 `rules/agents.md`에서 옮김. `rules/`는 매 턴 로드되므로 가끔만 필요한 절차·이력은 여기 둔다.
> 읽을 때: 에이전트를 새로 만들 때 / 필드명을 DB·백엔드·프론트 전체에서 바꿀 때 / 퇴역 에이전트를 되살릴 때.

## 신규 에이전트 생성 체크리스트

> **신규 에이전트 생성 시 필수 체크리스트** (공식 문서 기준):
> - [ ] frontmatter: `name`, `description`, `tools`, `model` 4개 필드 모두 포함
> - [ ] `name`: 소문자+하이픈만 사용, 전체 scope에서 유일 (`/doctor`로 중복 감지 가능)
> - [ ] `model`·`effort`는 `rules/agents.md` "모델·effort 정책"을 따른다 (sonnet + low/medium, 코드 검증만 opus + low)
> - [ ] `description`: "무엇을 하는가" + **"언제 사용하는가"(트리거 키워드)** 명시.
>       자동 위임을 원하면 "~시 사전에 적극 활용(use proactively when ~)" 패턴 포함
> - [ ] `tools`: 최소 권한 allowlist. 읽기 전용 에이전트에 Write/Edit 금지,
>       서브에이전트 스폰이 필요할 때만 `Agent` 포함
> - [ ] 생성 후 agent-evaluator-v2로 1회 점검 (점수 루프 금지, `rules/agents.md` STEP 1-1)

## 필드명 전면 변경 (DB+백엔드+프론트)

```
1. 영향범위 스캔 - schema-drift-auditor 또는 grep으로 필드명 등장 지점 전수 수집
   (DB 스키마/마이그레이션, Repository SQL, Service, Controller, Zod 스키마,
    프론트 API 함수·폼·store·라벨·CSS 클래스명) + 동명이인 필드(타 테이블 동일명) 충돌 확인
   → [승인 게이트] 스캔 결과 사용자 확인
2. db-schema-architect MIGRATE 모드로 UP/DOWN(롤백) SQL 파일만 생성 - 실행하지 않음
   → [승인 게이트] 마이그레이션 SQL 검토
3. 사용자가 직접 마이그레이션 실행 (백업 확인 후) - 에이전트는 ALTER TABLE 실행 금지
   → [승인 게이트] 실행 완료 확인
4. 코드 반영 - 백엔드(Repository→Service→Controller→Zod) → 프론트(API 함수→폼→store→표시 라벨)
5. schema-drift-auditor로 3축 정합성 재확인 + 앱 기동 확인 → code-reviewer
```
> 전용 에이전트를 만들지 않은 이유: ALTER TABLE 실행 권한을 가진 자율 에이전트는
> "파괴적 작업 절대 금지" 승인 규칙과 구조적으로 충돌한다.

## 아카이빙 이력

`.claude/agents-archive/`로 퇴역한 에이전트는 라우팅 대상이 아니다. 필요해지면 파일을 `agents/`로 되돌리고 위 표 2곳(STEP 1 + Available Agents)에 다시 등재한다.

| 에이전트 | 퇴역일 | 사유 |
|---|---|---|
| lh-asset-specialist, lh-design-reviewer, lh-integration-custodian, lh-module-implementer, lh-module-verifier (링크 제거), mobile-idle-rpg-3d-developer (agents-archive/ 이동) | 2026-09-15 | 사용자 지시 "게임 개발 에이전트만 정리". Lantern Rite 제작(2026-09-14/15)에서 확정된 신규 4종(unity2d-scene-architect·game-feel-tuner·sprite-sheet-slicer·unity-build-verifier) + game-asset-artist + `game2d-pipeline` 스킬이 게임 개발 표준 세트가 됨. lh-* 원본은 lighthaven-3d 레포에, lh2d-* 는 레포 교체로 이미 소실. mobile-idle-rpg-3d-v2·mobile-rpg(Sapphire) 작업이 다시 필요하면 game2d-pipeline 세트로 진행하거나 아카이브에서 복원 |
| godot-game-developer, godot-netcode-engineer, game-data-designer, game-level-designer, multiplayer-safety-reviewer | 2026-09-09 | dungeon-legends(Godot 4.7, Lighthaven Depths 2D) 프로젝트가 lighthaven-3d(Unity 3D 리메이크)로 대체됨 - 기존 기술스택은 참고하지 않는다는 신규 레포 CLAUDE.md 원칙에 따라 Godot 전용 에이전트 5종 전부 퇴역. project/.claude/agents/의 심볼릭 링크만 제거(dungeon-legends 레포 원본 파일은 그대로 - 그 레포 자체 세션에서는 계속 유효). 대체 에이전트는 lh-design-reviewer/lh-module-implementer/lh-module-verifier/lh-integration-custodian/lh-asset-specialist 5종. 게임 이미지 에셋 생성은 계속 game-asset-artist 담당(변경 없음) |
| asset-prompt-writer, game-asset-generator | 2026-09-01 | project/.claude/agents/의 심볼릭 링크만 제거(dungeon-legends 레포 원본 파일은 그대로 - 그 프로젝트 자체 세션에서는 계속 유효). 두 역할(프롬프트 작성+실제 생성)을 프로젝트 한정 없는 game-asset-artist로 통합해 mobile-idle-rpg 등 다른 게임 프로젝트에서도 쓸 수 있게 함 |
| e2e-runner | 2026-08-20 | 전체 세션 로그 실측 호출 0회. playwright-verify-loop가 실질 대체 |
| project-bootstrapper | 2026-08-20 | 호출 0회. Day 0 셋업 시나리오 미발생 |
| review-plan-builder | 2026-08-20 | 호출 0회 |
| flutter-game-builder | 2026-08-20 | 호출 0회. 대상 게임 프로젝트 전부 폐기 |
| manus-liaison | 2026-08-20 | raid-forge 폐기로 위임 대상 소멸 |
| audio-transcriber | 2026-07-24 | (이전 퇴역) |
