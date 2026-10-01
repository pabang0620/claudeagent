# Update Codemaps

Use the doc-updater agent to perform this task.

코드베이스 구조를 분석하고 아키텍처 문서를 업데이트합니다:

1. import, export, 의존성에 대한 모든 소스 파일 스캔
2. 코드맵은 `docs/CODEMAPS/` 규격을 따른다:
   - docs/CODEMAPS/INDEX.md - 전체 아키텍처
   - 영역별 파일(frontend, backend, database, integrations, workers) - 실제 있는 영역만

3. 이전 버전과 비교하여 차이 백분율 계산
4. 변경사항 > 30%인 경우, 업데이트 전 사용자 승인 요청
5. 각 코드맵에 최신성 타임스탬프 추가
6. .reports/codemap-diff.txt에 보고서 저장

분석에 Node.js 사용. 구현 세부사항이 아닌 고수준 구조에 집중.
