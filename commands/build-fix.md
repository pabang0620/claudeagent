# Build and Fix

Use the build-error-resolver agent to perform this task.

빌드 오류를 점진적으로 수정합니다:

1. 빌드 실행: npm run build 또는 pnpm build

2. 에러 출력 분석:
   - 파일별 그룹화
   - 심각도별 정렬

3. 각 에러에 대해:
   - 에러 컨텍스트 표시 (전후 5줄)
   - 문제 설명
   - 수정 방법 제안
   - 수정 적용
   - 빌드 재실행
   - 에러 해결 확인

4. 중단 조건:
   - 수정으로 새 에러 발생
   - 3회 시도 후에도 동일한 에러 지속
   - 사용자 중단 요청

5. 요약 표시:
   - 수정된 에러
   - 남은 에러
   - 새로 발생한 에러

기본은 한 번에 하나씩 수정한다. 같은 에러 코드가 같은 패턴으로 여러 개면 build-error-resolver 규칙대로 일괄 수정할 수 있다.
