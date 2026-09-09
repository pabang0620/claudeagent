# 확정 타임코드 - 영어 (general-ep11-doorway-forgetting)

voice=en-US-AnaNeural, rate=+20%/pitch=+15Hz (s2만 리액션 부스트 rate=+30%/pitch=+35Hz)
구간 간 기본 여백 0.2초, s2->s3 전환만 0.6초(원칙 4의 5번, 훅 질문 뒤 숨 쉴 틈)

| 구간 | 내레이션 | TTS 실측(초) | 여백(초) | 프레임 | 시작(본편 로컬) |
|---|---|---|---|---|---|
| s1(무성) | (none, decide -> walk toward door) | - (대본 지시 3.0초 고정) | 0 | 90 | 0 |
| s2(리액션) | Whoa, that thought's just gone. What did I even come in here for? | 4.464 | 0.6 | 152 | 90 |
| s3 | This happens so often, it actually has a name: the doorway effect. | 4.872 | 0.2 | 152 | 242 |
| s4 | Every time your brain crosses through a doorway... | 5.832 | 0.2 | 181 | 394 |
| s5 | So the second you step through... | 6.600 | 0.2 | 204 | 575 |
| s6 | String together a few doorways in a row... | 5.064 | 0.2 | 158 | 779 |
| s7 | Studies even found it happens when you walk through a virtual doorway... | 5.112 | 0.2 | 159 | 937 |
| s8 | Weirdly, if you walk back into the room where you started... | 5.664 | 0.2 | 176 | 1096 |

본편 합계: 1272프레임 = 42.400초
전체(인트로69 + 제목카드54 + 본편1272 + 아웃트로90): **1485프레임 = 49.500초**(ffprobe 실측)

## 언어 간 길이 차이

KO 1460프레임(48.667초) vs EN 1485프레임(49.500초) - EN이 25프레임(0.833초) 더 길다.
s3(문지방 효과 이름 소개, 콜론 뒤 이름을 덧붙이는 영어식 어순)·s4·s5·s7에서 영어 문장이
한국어보다 조금씩 더 길게 나온 것이 누적된 결과다. 어느 쪽도 늘리거나 줄이지 않고 실측
그대로 냈다(원칙 4).
