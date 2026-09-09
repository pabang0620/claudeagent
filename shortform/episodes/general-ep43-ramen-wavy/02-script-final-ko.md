# 라면이 다 꼬불꼬불한 이유 - 확정 대본 (한국어, 실측 타임코드)

영어 채널(Whymo) 운영 중단(2026-09-02)으로 한국어판만 제작한다.

## 구간별 실측 (TTS 실측 길이 + 여백, 30fps)

| # | 내레이션 | 실측 길이(초) | 여백(초) | 프레임 | 시작 프레임(본편 기준) |
|---|---|---|---|---|---|
| s1 | (무성 - 봉지를 뜯어 마른 면 덩어리를 꺼냄) | 2.500(고정) | 0 | 75 | 0 |
| s2 | 어, 근데 이 면 처음부터 이렇게 꼬불꼬불했나. | 3.432 | 0.6(훅->설명 전환 확장) | 121 | 75 |
| s3 | 라면 면은 뽑혀 나온 뒤에 벨트 속도를... | 8.616 | 0.2 | 264 | 196 |
| s4 | 이렇게 접어두면 면과 면 사이에 틈이... | 8.424 | 0.2 | 259 | 460 |
| s5 | 그리고 그 틈으로 물이 훨씬 빨리 스며들어서... | 5.832 | 0.2 | 181 | 719 |
| s6 | 컵라면은 이 구불한 면 덕분에... | 5.760 | 0.2 | 179 | 900 |
| s7 | 이 튀기고 말리는 방식은 1958년... | 7.296 | 0.2 | 225 | 1079 |

본편 합계: 1304프레임 (43.47초)
Intro(69) + TitleCard(54) + 본편(1304) + Outro(90) = 1517프레임 (50.57초, 실측 mp4 50.624초)

## 화면 문자

- s3: "일부러 만든 모양"
- s4: "틈 사이로 골고루"
- s5: "3분"
- s6: "컵에 쏙"
- s7: "1958년"

## 자산

- 신규: `props/NoodleDiagram.tsx`(`NoodleDiagram`, `NoodleCupFit`) - REGISTRY 등록 완료
- 신규 SFX: `audio/bag_tear.mp3` - REGISTRY 등록 완료
- 재사용: `character/Actor.tsx`(BustActor, POSES.thinking), `scenes/Caption.tsx`, `scenes/PopIn.tsx`,
  `backgrounds/PlainBg.tsx`, `props/ThemedIcon.tsx`(clock, history), `audio/ui_tap.mp3`,
  `audio/intro_ding.mp3`, `audio/outro_ding.mp3`
