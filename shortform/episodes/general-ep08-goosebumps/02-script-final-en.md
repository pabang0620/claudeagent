# 확정 타임코드 - 영어 (general-ep08-goosebumps)

voice=en-US-AnaNeural, rate=+20%/pitch=+15Hz (s2만 리액션 부스트 rate=+30%/pitch=+35Hz)
구간 간 기본 여백 0.2초, s2->s3 전환만 0.6초

| 구간 | 내레이션 | TTS 실측(초) | 여백(초) | 프레임 | 시작(본편 로컬) |
|---|---|---|---|---|---|
| s1(silent) | (none, chill -> shiver hunched -> goosebumps on arm) | - (fixed 3.2s animation, v2: extended 2.0s->3.2s - "shivering from cold" needs 1.5~2.5s to read clearly) | 0 | 96 | 0 |
| s2(reaction) | Whoa, why is my arm all bumpy? | 2.664 | 0.6 | 98 | 96 |
| s3 | There's a tiny muscle at the root... | 5.136 | 0.2 | 160 | 194 |
| s4 | Back when we were covered in fur... | 10.008 | 0.2 | 306 | 354 |
| s5 | Ever see a scared cat... | 7.704 | 0.2 | 237 | 660 |
| s6 | That's why English calls it goosebumps... | 7.800 | 0.2 | 240 | 897 |

본편 합계: 1137프레임 = 37.900초
전체(인트로69 + 제목카드54 + 본편1137 + 아웃트로90): **1350프레임 = 45.000초**(ffprobe 실측)

언어 간 차이: EN이 KO보다 7프레임(0.233초) 더 길다. s6(닭살 어원 설명 - 영어가 한 문장에
대시로 두 절을 이어 더 길게 나옴)에서 차이가 가장 크다(KO 5.976s vs EN 7.800s). 늘리거나
줄이지 않고 실측 그대로 냈다. (s1은 언어 무관 공용 애니메이션이라 이 차이에 포함되지 않는다)

## v2 수정 (2026-08-20/21)

한국어판과 동일한 사유로 s1을 2.0s->3.2s로 확장했다(원인·내용은 02-script-final-ko.md
"v2 수정" 절 참고 - 애니메이션 자체가 언어 무관 공용이라 ko/en 모두 96프레임으로 동일하게
늘었다).
