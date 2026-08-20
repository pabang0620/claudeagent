# 확정 타임코드 - 영어 (general-ep02-wrinkly-fingers)

대상 대본: `02-script-v4.md`. TTS: `en-US-AnaNeural`, 기본 rate `+20%` / pitch `+15Hz` (프로필 `general.md` 4절).
s2(리액션)만 rate `+30%` / pitch `+35Hz`로 별도 합성(ep01 s2 선례와 동일한 수치).

## 구간별 실측

| # | 텍스트 | TTS 실측(초) | 여백(초) | 프레임 | 초 |
|---|---|---|---|---|---|
| s1 | After a long soak in the tub | 2.472 | 0.2 | 80 | 2.667 |
| s2 | Whoa, all wrinkly. Wait, why? (rate+30%/pitch+35Hz) | 3.288 | 0.6 | 117 | 3.900 |
| s3 | Turns out, your body's squeezing the blood vessels in your fingers on its own. | 4.824 | 0.2 | 151 | 5.033 |
| s4 | So you don't fumble and drop something slippery | 3.288 | 0.2 | 105 | 3.500 |
| s5 | Turns out your body might be doing that on purpose. | 3.432 | 0.2 | 109 | 3.633 |
| **본편 합계** | | | | **562** | **18.733** |

## 전체 타임라인

| 구간 | 프레임 | 초 |
|---|---|---|
| Intro | 69 | 2.300 |
| TitleCard | 54 | 1.800 |
| 본편(s1~s5) | 562 | 18.733 |
| Outro | 90 | 3.000 |
| **합계** | **775** | **25.833** |

렌더 실측(ffprobe): 775프레임 / 25.833초. 계산값과 완전 일치.

## 한국어 대비 길이 차이

- ko 758프레임(25.267초) vs en 775프레임(25.833초) - **en이 약 0.57초 더 길다.**
- 원인: s3(영어 문장이 관계절+분사구 등으로 한국어보다 길게 풀어써짐, 4.824s vs 4.152s)와
  s1(영어 "After a long soak in the tub"가 한국어 "오래 목욕하고 나면"보다 음절 대비 발화가
  길게 잡힘, 2.472s vs 2.016s)이 주 원인. s4/s5는 오히려 en이 ko와 비슷하거나 약간 짧다.
- 두 언어 다 60초 상한에 크게 못 미쳐(25초대) 여유가 크다. **의도적으로 맞추지 않았다** -
  언어별 실측 그대로 반영.
