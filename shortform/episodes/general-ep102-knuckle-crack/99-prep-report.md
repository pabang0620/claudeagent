# 102화 준비 보고 (렌더 전 단계, 배치 작업)

- 재사용 자산(14): Actor/BustActor/POSES(idle,surprised,shrug), PlainBg, Caption/Label,
  Appear/Shake/FlashOverlay/ImpactBurst, ThemedIcon(check,clock), Finger(props/Hand.tsx),
  Intro/Outro/TitleCard/SceneSwitcher, intro_ding.mp3/outro_ding.mp3.
- 신규 자산(2, 99-registry-additions.md에 등록 대기): `assets/props/JointCrackDiagram.tsx`
  (관절 단면 - gapWiden/bubbleForm/bubbleDissolve), `assets/audio/knuckle_crack.mp3`(0.14s,
  max -5.8dB).
- TTS: ko-KR-SunHiNeural 기본값 + s2만 rate+32%/pitch+55Hz 리액션 오버라이드. 실측 합계
  33.816s(s2~s6), 본편 1128f, 전체 1341f(44.7s). 립싱크(rms_mouth.py) 정상 생성.
- precheck.mjs: 에러 0 / 경고 1(SHAREDOUT - 공용 out/에 다른 화 프레임 잔존, 이 화와 무관,
  삭제하지 않음).
- 스틸 점검(축소 범위): s1 크랙 순간(finger 회전+ImpactBurst+FlashOverlay 타이밍 확인),
  s3~s5 JointCrackDiagram 간격/기포 형성/기포 소멸 방향 확인(시작-끝 프레임 대조로 방향
  정상 확인), s4 X(뼈)/O(기포) 배지 위치 확인, s6 캐릭터+X 배지, TitleCard/Outro 확인.
  s1 초기 버전은 손가락이 화면에 비해 너무 작아 폭 480->680, top 560->370으로 조정 후
  재확인.
- 특이사항: 리액션 오버라이드는 기존 "어," 시작 리액션 관례(rate+32%/pitch+55Hz)를 그대로
  따름. s2->s3 전환 pad 0.6s 적용(원칙 4).
- READY_TO_RENDER 생성함(precheck 에러 0 확인 후).
