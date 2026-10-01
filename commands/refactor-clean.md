# Refactor Clean

Use the refactor-cleaner agent to perform this task.

테스트 검증과 함께 데드 코드를 안전하게 식별하고 제거합니다:

1. 데드 코드 분석 도구 실행:
   - knip: 사용되지 않는 export 및 파일 찾기
   - depcheck: 사용되지 않는 의존성 찾기
   - ts-prune: 사용되지 않는 TypeScript export 찾기

2. 1단계: 아무것도 지우지 않고 후보를 등급별 표(안전/주의/위험)로 보고하고 멈춘다.

3. 2단계: 사용자가 승인한 목록만 제거한다. 종류별로 빌드·테스트를 돌리고, 실패하면 그 변경만 되돌린다.

4. 정리된 항목 요약 표시

승인 목록에 없는 항목은 삭제하지 않는다.
