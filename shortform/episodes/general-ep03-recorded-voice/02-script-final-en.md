# 확정 타임코드 - 영어 (general-ep03-recorded-voice)

TTS 실측(edge-tts WordBoundary, `en-US-AnaNeural`) 기준. `assets/timeline.ts`의
`sceneFrames`/`sceneStarts`로 계산했다. 대본은 `02-script-v2.md`의 영어판(재작성, 직역 아님)을
그대로 가져왔다.

## 구간별 TTS 실측 길이

| 구간 | 텍스트 | rate | pitch | 실측 길이(초) |
|---|---|---|---|---|
| s1 (무성) | (none, 동작만) | - | - | 2.000 (대본 지정값, 실측 대상 아님) |
| s2 | Huh, that sounds different. | +30% | +35Hz (리액션 오버라이드) | 2.184 |
| s3 | When I talk, my voice reaches my ears two different ways. And only I can hear one of them. | +20%(기본) | +15Hz(기본) | 6.552 |
| s4 | The sound from inside your body is lower and thicker. That's why your own voice sounds richer to you. | +20%(기본) | +15Hz(기본) | 6.600 |
| s5 | A recording only picks up the sound that traveled through the air. That richer part goes missing, so playback sounds like a stranger. | +20%(기본) | +15Hz(기본) | 8.256 |

## 여백(pad) 적용

- s1 -> s2: 0 (s1은 대본 지정 고정 길이, 여백 없음, 언어 무관 공통)
- s2 -> s3: **0.6초** (리액션→설명 전환, ko와 동일 원칙 적용)
- s3 -> s4, s4 -> s5, s5 -> (아웃트로): 0.2초 (프로필 기본 여백)

## 프레임 계산 (30fps)

| 구간 | 길이(초) | 프레임 | 절대 시작 프레임(인트로+제목카드 123f 이후) |
|---|---|---|---|
| s1 | 2.0000 | 60 | 123 |
| s2 | 2.8000 | 84 | 183 |
| s3 | 6.7667 | 203 | 267 |
| s4 | 6.8000 | 204 | 470 |
| s5 | 8.4667 | 254 | 674 |
| 본편 합계 | 26.8333 | 805 | - |

- 인트로: 69f (2.3초)
- 제목 카드: 54f (1.8초)
- 본편: 805f (26.8333초)
- 아웃트로: 90f (3.0초)
- **총합: 1018f = 33.9333초**

실측 렌더 결과(ffprobe): `out/episode-en-v2.mp4` 1018프레임, duration 33.984초.

## 한국어 대비 길이 차이

en 총 길이(33.9333초) - ko 총 길이(30.9333초) = **+3.0초** (en이 더 길다).

- s1(무성, 2.0초)은 언어 무관 동일.
- s2: en 2.184s < ko 2.424s (en이 오히려 짧음 - "Huh, that sounds different."가 "어, 목소리가
  다르게 들려."보다 발화 시간이 짧게 나옴, rate/pitch 오버라이드 차이 포함).
- s3~s5는 en이 매 구간 ko보다 상당히 길다(예: s5 en 8.256s vs ko 6.720s, +1.536s). 영어 문장이
  같은 정보를 담는 데 음절 수·단어 수가 더 많이 필요했기 때문(예: s5 en은 "A recording only
  picks up the sound that traveled through the air. That richer part goes missing, so playback
  sounds like a stranger."로 ko보다 정보를 더 풀어서 표현).
- 이 차이는 맞추지 않았다(원칙 4) - 언어별 실측을 그대로 반영한 결과다.

## 원칙 확인

- 실측이 짧게 나와도 늘리지 않았다. 60초 상한 대비 여유(33.93초).
- 한 언어의 타임코드를 다른 언어에 복사하지 않았다 - ko/en 각각 sceneFrames/sceneStarts를
  독립적으로 계산했다.
