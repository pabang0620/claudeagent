# 99-prep-report.md (general-ep101-veins-look-blue, 렌더 전 준비 단계)

- 재사용 자산: `character/Actor.tsx`(BustActor), `backgrounds/PlainBg.tsx`, `scenes/Caption.tsx`(Caption/Label), `props/ThemedIcon.tsx`(x, eye 아이콘), `assets/timeline.ts`/`anim.ts` 전체, `assets/audio/head_whoosh.mp3`(무성 s1 SFX), `intro_ding.mp3`/`outro_ding.mp3`. `props/LightScatterDiagram.tsx`의 `LIGHT_BLUE`/`LIGHT_RED` 색 상수 재사용.
- 신규 자산: `assets/props/VeinLightDiagram.tsx` 1개 파일, 컴포넌트 3종(`ArmVein`, `SkinLightCrossSection`, `VeinDepthCompare`). 배럴(`assets/index.ts`)을 거치지 않고 상대경로로 직접 import(이번 배치 규칙).
- REGISTRY.md/assets/props/index.ts는 직접 수정하지 않음 - `99-registry-additions.md`에 등록 초안 작성, 배치 종료 후 오케스트레이터 일괄 반영 대기.
- TTS(ko): s2(리액션, rate+32%/pitch+55Hz) ~ s7(설명, 기본 rate+20%/pitch+30Hz) 총 6구간, 합계 28.056초. s1은 무성(고정 2.5초). 립싱크 ko_mouth.json 생성 완료.
- precheck.mjs 결과: 에러 0 / 경고 1(SHAREDOUT - 공용 out/에 남은 다른 화 잔여물, 본 화와 무관해 손대지 않음). 최초 실행 시 KO-STR 경고 2건(파란빛/빨간빛 하드코딩)은 strings.ts로 옮겨 props화해 해결.
- 스틸 선점검(remotion still, 13프레임): S1 줌인 방향(747px→883px, 확대 확인), S3 ArmVein reveal(X 배지 강→약, O 링 무→강, 겉보기/실제 방향 정상), S4 blueBounce(진입→반사 방향 정상), S5 redPenetrate(진입→심부 도달하며 옅어짐, 흡수 방향 정상), S6 toEye(반사광→눈 아이콘 도달 정상), S7 VeinDepthCompare(등장 페이드인 정상, 주사기가 얕은 쪽 가리킴). 전부 관찰 기록 완료, 잔상·좌표 역전 없음.
- 미해결 관찰(경고 아님, 참고용): S4~S6 다이어그램과 S7 비교그림 아래쪽에 여백이 다소 넓게 남음 - 렌더 후 24항목 전체 검수 단계에서 하단 여백 과다 항목으로 재확인 필요.
- READY_TO_RENDER: 생성함 (precheck 에러 0 확인 후).
