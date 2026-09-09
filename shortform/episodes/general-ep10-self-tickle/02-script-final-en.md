# 확정 타임코드 - 영어 (TTS 실측 기반)

voice=en-US-AnaNeural, rate=+20%/pitch=+15Hz (s2만 +30%/+35Hz 리액션 부스트)

| 구간 | 내용 | 실측 길이(초) | pad(초) | 프레임 | 로컬 시작 프레임 |
|---|---|---|---|---|---|
| s1 (silent) | Try to self-tickle with the opposite arm, nothing happens (v2, 2026-08-20 fix) | 3.400(고정) | 0 | 102 | 0 |
| s2 (reaction+hook) | Huh, that doesn't tickle at all. Why not? | 3.504 | 0.6 | 123 | 102 |
| s3 | Turns out, even an ancient Greek philosopher... | 5.856 | 0.2 | 182 | 225 |
| s4 | Tickling only happens when you have no idea... | 4.848 | 0.2 | 151 | 407 |
| s5 | But when it's your own hand... | 5.688 | 0.2 | 177 | 558 |
| s6 | So by the time it touches you... | 4.704 | 0.2 | 147 | 735 |
| s7 | But add a tiny delay - say, with a robot arm... | 6.240 | 0.2 | 193 | 882 |
| s8 | Break the prediction, even slightly... | 4.536 | 0.2 | 142 | 1075 |
| **본편 합계** | | 38.776s(발화+pad, s1이 3.0->3.4초로 +0.4초) | | **1217프레임 = 40.6초** | |
| **전체(인트로+제목카드+본편+아웃트로)** | | | | **1430프레임 = 47.7초** (ffprobe 실측 47.667s) | |

인트로(69F)+제목카드(54F)=123F를 본편 앞에, 아웃트로(90F)를 본편 뒤에 붙인다.

s2->s3 전환만 원칙 4에 따라 0.6초 여백을 준다. 나머지는 프로필 기본 0.2초.

**두 언어 총 길이 차이**: EN이 KO보다 2프레임(0.07초) 길다 - 두 언어의 발화 길이가 우연히
거의 같게 나온 경우다(맞추려는 조정 없이 실측 그대로).


## v1 -> v2 수정 (2026-08-20, 사용자 피드백)

한국어판과 동일한 수정(02-script-final-ko.md의 "v1 -> v2 수정" 절 참고) - s1은 언어 무관
공용 장면이라 KO/EN 모두 3.0초 -> 3.4초로 동일하게 늘었고, s2 이후 로컬 시작 프레임이 모두
+12씩 밀렸다. EN 전체 길이는 47.3초 -> 47.7초.
