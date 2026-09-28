# 준비 보고 (렌더 전, general-ep103-horse-standing-sleep)

- 재사용 자산(REGISTRY 대조 완료): `backgrounds/SavannaBg`, `character/Actor`(`BustActor`, `POSES.thinking/idle`), `scenes/Effects`(`PulseRing`), `props/ThemedIcon`(`moon`, 캐시 확인됨), `scenes/Caption`, `scenes/PlainBg`, 오디오 `leaf_rustle`/`intro_ding`/`outro_ding`.
- 신규 자산(3개, `99-registry-additions.md`에 등록 대기): `props/Horse.tsx`(`Horse` 서 있는 말 + `HorseLying` 누운 실루엣), `props/HorseLegLockDiagram.tsx`(무릎·발목 걸쇠 + 넓적다리 근육 하이라이트). 걸쇠 아이콘은 tabler-cache.json에 'lock'이 없어(확인 완료) 공용 캐시 동시수정 충돌을 피해 다이어그램 안에 직접 그린 모양으로 대체.
- TTS: ko만(영어 채널 중단). s2~s7 전 구간 프로필 기본값(rate+20%/pitch+30Hz)으로 합성 - s2는 "왜 안 쓰러지지?" 정도의 가벼운 되물음이라 general-ep92 s2와 동일 판단으로 리액션 오버라이드 없음. 총 34.32초(무성 s1 3.0초 별도).
- precheck: `node scripts/precheck.mjs episodes/general-ep103-horse-standing-sleep` 에러 0 / 경고 1(SHAREDOUT - 다른 화가 공용 루트 out/에 남긴 것, 이 화와 무관, 삭제하지 않음).
- 스틸 선점검(`remotion still`, EpisodeKo): s1(조는 말), s2(리액션+작은 말), s3(PulseRing+동작선, 시작·끝 비교), s4(걸쇠 팝인, 시작·끝 비교), s5(근육 하이라이트 페이드, 시작·끝 비교), s6(달 아이콘+누운 말), s7(캐릭터+말 마무리) 전부 육안 확인. s4/s5에서 넓적다리 하이라이트가 캡슐 테두리 밖으로 살짝 삐져나오는 것을 발견해 `clipPath`(useId로 고유화)로 수정 후 재확인 완료.
- 캐릭터-배경 대비: 전 장면 밝은 배경(하늘색 계열)이라 별도 글로우 처리 불필요.
- `deploy-title-ko.txt`: "말이 서서 잠을 자는 이유". `READY_TO_RENDER` 생성 완료(precheck 에러 0 확인 후).
