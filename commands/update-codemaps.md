---
description: docs/CODEMAPS/ 코드맵을 doc-updater로 갱신한다. "/update-codemaps", "코드맵 갱신". 구조 변경이 30%를 넘으면 갱신하지 않고 차이만 보고한다.
---

# Update Codemaps

doc-updater 에이전트에 위임한다. 스폰 프롬프트에 대상 프로젝트 절대경로를 적는다.

1. 소스의 import·export·의존성을 스캔한다(Node.js). 구현 세부가 아니라 고수준 구조만.
2. `docs/CODEMAPS/INDEX.md`(전체)와 실제 있는 영역 파일만(frontend, backend, database, integrations, workers) 갱신한다. 없는 영역 파일은 만들지 않는다.
3. 이전 버전과 차이를 백분율로 계산한다. 30%를 넘으면 파일을 바꾸지 않고 차이 요약만 보고하고 멈춘다(에이전트는 사용자에게 물을 수 없다).
4. 각 코드맵 머리에 갱신 날짜를 적는다. 차이 보고는 `.reports/codemap-diff.txt`.
