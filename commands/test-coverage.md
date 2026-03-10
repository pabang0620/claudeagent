# Test Coverage

테스트 커버리지를 분석하고 누락된 테스트를 생성합니다:

1. 커버리지와 함께 테스트 실행: npm test --coverage 또는 pnpm test --coverage

2. 커버리지 보고서 분석 (coverage/coverage-summary.json)

3. 80% 커버리지 임계값 미만인 파일 식별

4. 커버리지가 낮은 각 파일에 대해:
   - 테스트되지 않은 코드 경로 분석
   - 함수에 대한 단위 테스트 생성
   - API에 대한 통합 테스트 생성
   - 중요한 플로우에 대한 E2E 테스트 생성

5. 새 테스트 통과 확인

6. 이전/이후 커버리지 지표 표시

7. 프로젝트가 전체 80%+ 커버리지 도달하도록 보장

집중할 사항:
- Happy path 시나리오
- 에러 처리
- 엣지 케이스 (null, undefined, empty)
- 경계 조건
