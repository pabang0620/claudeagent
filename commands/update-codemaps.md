# Update Codemaps

코드베이스 구조를 분석하고 아키텍처 문서를 업데이트합니다:

1. import, export, 의존성에 대한 모든 소스 파일 스캔
2. 다음 형식으로 토큰 절약형 코드맵 생성:
   - codemaps/architecture.md - 전체 아키텍처
   - codemaps/backend.md - 백엔드 구조
   - codemaps/frontend.md - 프론트엔드 구조
   - codemaps/data.md - 데이터 모델 및 스키마

3. 이전 버전과 비교하여 차이 백분율 계산
4. 변경사항 > 30%인 경우, 업데이트 전 사용자 승인 요청
5. 각 코드맵에 최신성 타임스탬프 추가
6. .reports/codemap-diff.txt에 보고서 저장

분석에 Node.js 사용. 구현 세부사항이 아닌 고수준 구조에 집중.
