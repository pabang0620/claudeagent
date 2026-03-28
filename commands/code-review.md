# Code Review

Invoke the code-reviewer skill to perform this review.

커밋되지 않은 변경사항에 대한 종합적인 보안 및 품질 리뷰:

1. 변경된 파일 확인: git diff --name-only HEAD

2. 각 변경된 파일에 대해 다음 사항 검토:

**보안 이슈 (CRITICAL):**
- 하드코딩된 자격증명, API 키, 토큰
- SQL 인젝션 취약점
- XSS 취약점
- 입력 검증 누락
- 안전하지 않은 의존성
- 경로 탐색 위험

**코드 품질 (HIGH):**
- 50줄을 초과하는 함수
- 800줄을 초과하는 파일
- 4단계를 초과하는 중첩 깊이
- 에러 처리 누락
- console.log 구문
- TODO/FIXME 주석
- 공개 API에 대한 JSDoc 누락

**모범 사례 (MEDIUM):**
- Mutation 패턴 (불변성 사용 권장)
- 코드/주석에 이모지 사용
- 새 코드에 대한 테스트 누락
- 접근성 문제 (a11y)

3. 다음 내용을 포함한 보고서 생성:
   - 심각도: CRITICAL, HIGH, MEDIUM, LOW
   - 파일 위치 및 줄 번호
   - 이슈 설명
   - 수정 방법 제안

4. CRITICAL 또는 HIGH 이슈 발견 시 커밋 차단

보안 취약점이 있는 코드는 절대 승인하지 않습니다!
