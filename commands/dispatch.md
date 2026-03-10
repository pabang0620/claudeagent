# Dispatch Command

사용자 요청을 분석하여 최적의 도구를 자동 선택하고 실행합니다.

## 사용법

```
/dispatch [요청 내용]
```

## 예시

```bash
/dispatch 로그인 기능 추가해줘
/dispatch 이 API 성능 개선해줘
/dispatch 코드 리뷰해줘
/dispatch 빌드 에러 수정해줘
/dispatch 테스트 작성해줘
```

## 작동 방식

1. **요청 분석**: 핵심 동사와 도메인 식별
2. **도구 선택**: 적합한 에이전트/스킬/커맨드 매칭
3. **프롬프트 생성**: 최적화된 실행 프롬프트 생성
4. **실행 제안**: 단일 도구 또는 워크플로우 제안

## 자동 매칭

| 요청 유형 | 선택되는 도구 |
|----------|-------------|
| 새 기능 구현 | planner → tdd-guide → code-reviewer |
| 버그 수정 | build-error-resolver → tdd-guide |
| 코드 리뷰 | code-reviewer + security-reviewer (병렬) |
| 테스트 작성 | tdd-guide |
| E2E 테스트 | e2e-runner |
| 리팩토링 | refactor-cleaner → code-reviewer |
| DB 최적화 | database-reviewer |
| 보안 검토 | security-reviewer |
| 문서 작성 | doc-updater |
| 아키텍처 | architect |

## 실행 과정

```
dispatcher 에이전트를 호출하여 다음 단계를 수행:

1. 의도 파악
   - 핵심 동사 추출 (구현/수정/분석/테스트/계획)
   - 도메인 식별 (프론트/백엔드/DB/보안)
   - 복잡도 판단 (단순/중간/복잡)

2. 도구 선택
   - 단순: 커맨드 (/build-fix, /verify 등)
   - 중간: 단일 에이전트
   - 복잡: 에이전트 워크플로우

3. 프롬프트 생성 및 실행
```

## 출력 예시

```markdown
## 🎯 분석 결과

**요청**: 로그인 기능 추가해줘
**유형**: 신규 기능 (보안 관련)
**복잡도**: 복잡

## 📋 선택된 워크플로우

feature + security:
1. planner - 구현 계획 수립
2. tdd-guide - 테스트 주도 개발
3. code-reviewer - 코드 품질 검사
4. security-reviewer - 보안 감사

## ▶️ 실행

[자동 실행 또는 확인 후 실행]
```

## 인자

$ARGUMENTS:
- 자연어 요청 (한국어/영어 모두 지원)

## 팁

1. **구체적으로 요청**: "API 만들어줘" → "사용자 프로필 조회 API 만들어줘"
2. **컨텍스트 제공**: 관련 파일이나 기능 언급
3. **목표 명시**: 원하는 결과물 설명

## 관련 도구

- `/orchestrate` - 워크플로우 직접 실행
- `/plan` - 계획만 수립
- `/verify` - 검증만 실행
