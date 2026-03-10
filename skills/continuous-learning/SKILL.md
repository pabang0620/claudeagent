---
name: continuous-learning
description: Claude Code 세션에서 재사용 가능한 패턴을 자동으로 추출하여 향후 사용을 위한 학습된 스킬로 저장
---

# 지속적 학습 스킬

세션 종료 시 재사용 가능한 패턴을 자동으로 추출하여 학습된 스킬로 저장합니다.

## 작동 방식

이 스킬은 각 세션 종료 시 **Stop 훅**으로 실행됩니다:

1. **세션 평가**: 세션에 충분한 메시지가 있는지 확인 (기본: 10개 이상)
2. **패턴 감지**: 세션에서 추출 가능한 패턴 식별
3. **스킬 추출**: 유용한 패턴을 `~/.claude/skills/learned/`에 저장

## 설정

`config.json`을 편집하여 커스터마이징:

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## 패턴 유형

| 패턴 | 설명 |
|------|------|
| `error_resolution` | 특정 에러를 해결한 방법 |
| `user_corrections` | 사용자 수정에서 얻은 패턴 |
| `workarounds` | 프레임워크/라이브러리 문제 해결법 |
| `debugging_techniques` | 효과적인 디버깅 접근법 |
| `project_specific` | 프로젝트별 컨벤션 |

## 훅 설정

`~/.claude/settings.json`에 추가:

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## 왜 Stop 훅인가?

- **경량**: 세션 종료 시 한 번만 실행
- **논블로킹**: 모든 메시지에 지연 추가하지 않음
- **완전한 컨텍스트**: 전체 세션 대화 내역에 접근 가능

## 학습된 패턴 예시

### 에러 해결 패턴
```markdown
---
id: prisma-utc-timezone-fix
pattern: error_resolution
confidence: 0.8
---

# Prisma UTC 시간대 문제 해결

## 문제
Prisma는 기본적으로 UTC로 시간을 저장하여 한국 시간과 9시간 차이 발생

## 해결책
```javascript
const getKoreanTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  return now;
};

await prisma.market.create({
  data: {
    name: '테스트',
    createAt: getKoreanTime()
  }
});
```

## 언제 적용
- Prisma로 시간 저장 시
- 한국 시간대 사용 프로젝트
```

### 프로젝트별 컨벤션
```markdown
---
id: landing-studio-response-format
pattern: project_specific
confidence: 0.9
---

# Landing Studio API 응답 형식

## 표준 응답 구조
```javascript
// 성공
{
  success: true,
  data: {...},
  msg: "작업 성공"
}

// 실패
{
  success: false,
  data: null,
  msg: "작업 실패: 이유"
}
```

## 언제 적용
- 모든 API 엔드포인트
- Express 라우트 핸들러
```

## 관련 자료

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - 지속적 학습 섹션
- `/learn` 명령 - 세션 중 수동 패턴 추출

---

## 비교 노트 (연구: 2025년 1월)

### vs Homunculus (github.com/humanplane/homunculus)

Homunculus v2는 더 정교한 접근 방식을 취합니다:

| 기능 | 우리 접근법 | Homunculus v2 |
|------|------------|---------------|
| 관찰 | Stop 훅 (세션 종료) | PreToolUse/PostToolUse 훅 (100% 신뢰) |
| 분석 | 메인 컨텍스트 | 백그라운드 에이전트 (Haiku) |
| 단위 | 전체 스킬 | 원자적 "본능" |
| 신뢰도 | 없음 | 0.3-0.9 가중치 |
| 진화 | 직접 스킬로 | 본능 → 클러스터 → 스킬/명령/에이전트 |
| 공유 | 없음 | 본능 내보내기/가져오기 |

**homunculus의 핵심 통찰:**
> "v1은 관찰에 스킬을 사용했습니다. 스킬은 확률적이어서 50-80%만 발동합니다. v2는 관찰에 훅을 사용하고 (100% 신뢰), 본능을 학습된 행동의 원자 단위로 사용합니다."

### 잠재적 v2 개선사항

1. **본능 기반 학습** - 신뢰도 점수가 있는 더 작고 원자적인 행동
2. **백그라운드 관찰자** - 병렬로 분석하는 Haiku 에이전트
3. **신뢰도 감소** - 모순될 경우 본능이 신뢰도를 잃음
4. **도메인 태깅** - code-style, testing, git, debugging 등
5. **진화 경로** - 관련 본능을 스킬/명령으로 클러스터링

전체 사양은 `continuous-learning-v2`를 참조하세요.
