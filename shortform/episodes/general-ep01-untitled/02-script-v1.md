프로필: general
추정 길이: 한국어 약 19초 / 영어 약 18초 (낭독 기준 추정치. TTS 실측으로 언어별 확정, 60초 상한 대비 여유 큼)
사실 개수: 1개 - "아이스크림을 급하게 먹을 때 아픈 곳은 입천장인데, 입천장과 이마 감각을 같은 신경이 함께 맡고 있어서 뇌가 그 신호를 이마 통증으로 착각한다"

## 장면 (언어 공용)

| # | 구간(ko 기준 추정) | 장면 지시 | 화면 문자 (언어별 교체) |
|---|---|---|---|
| s1 | 0:00-0:02.5 | PlainBg(밝은 단색). 캐릭터가 아이스크림콘을 들고 크게 한입 베어 무는 동작 | (없음, 대사 자막만 자동 표시) |
| s2 | 0:02.5-0:05 | 캐릭터 바스트샷, 이마를 짚으며 놀란 표정으로 전환. 이마 위치에 통증 강조 아이콘(번쩍) 팝인 | ko "이마가 찌릿" / en "Ow - forehead" |
| s3 | 0:05-0:09 | 화면이 머리 옆모습 다이어그램으로 전환. 입천장 부위에 파란 냉기 표시가 번져나감. 이마 쪽은 아직 표시 없음 | (없음, 대사 자막만) |
| s4 | 0:09-0:13.5 | 같은 다이어그램에서 입천장과 이마 두 지점을 잇는 신경선 한 가닥이 그려진다 | (없음, 대사 자막만) |
| s5 | 0:13.5-0:18.5 | 신경선을 따라 신호가 입천장에서 뇌로, 뇌에서 다시 이마 쪽으로 잘못 튀어나가는 애니메이션(방향이 헷갈리는 화살표). 마지막에 캐릭터 컷으로 돌아와 이마를 짚은 채 멈춤 | (없음, 대사 자막만) |

## 내레이션 대조표

| # | 한국어 | English |
|---|---|---|
| s1 | 아이스크림을 급하게 먹다 보면 | Eat ice cream too fast |
| s2 | (없음) | (none) |
| s3 | 근데 진짜 차가워진 건 입 안이거든요. | But the cold part is your mouth. |
| s4 | 입천장이랑 이마 감각을 같은 신경 한 가닥이 같이 맡고 있어서 | Your mouth and forehead share one nerve |
| s5 | 뇌가 입천장 신호를 이마 통증으로 착각하는 거예요. | So your brain reads that signal as pain in your forehead. |

## 영어판 의역 메모

- s3: 직역이면 "But what's actually cold is inside your mouth" 처럼 길어진다. `"But the cold part is your mouth."` 로 짧게 끊어 리듬을 살렸다. 물음표를 넣어 `"But the cold part? Your mouth."` 처럼 쪼개는 안도 검토했으나, 문장 안에 종결부호가 두 번(? 과 .) 들어가 무음이 두 번 쌓이므로(원칙 5) 하나의 문장으로 합쳤다
- s4: 한국어의 "같이 맡고 있어서"(이유를 대며 다음 문장으로 넘어가는 연결어미)를 영어는 접속사 없이 현재형 동사로 끝내는 게 더 자연스러워 `"share one nerve"`로 끝내고 종결부호를 찍지 않았다. s5로 그대로 이어지는 리듬을 한국어와 동일하게 유지했다
- s2 화면 라벨: 한국어 "이마가 찌릿"의 의성어 뉘앙스를 영어 의성어로 억지로 옮기지 않고, 통증을 부르는 감탄 표현 `"Ow"`로 대체했다

## 자산 목록

### 기존 라이브러리 재사용
- `character/Actor`, `character/BustActor` - 캐릭터 배치 (전신 s1, 바스트샷 s2)
- `character/poses.ts` 의 `present` (s1, 아이스크림을 들고 보여주는 자세로 활용) - 기존 14종 중 손에 무언가를 든 자세와 가장 가까움
- `backgrounds/PlainBg` - s1~s2 배경 (밝은 단색, 특정 장소 불필요)
- `scenes/Caption` - 대사가 있는 s1·s3·s4·s5는 자동 자막 동기화로 처리, 별도 그래픽 라벨 불필요
- `scenes/Appear` - 신경선·냉기 표시 등 요소 등장 모션
- `props/ThemedIcon` (Tabler `bolt` 아이콘) - s2 이마 통증 강조 아이콘. 캐시에 없으면 `node scripts/sync_icons.mjs bolt` 로 추가 (신규 그림 자산은 아니고 기존 아이콘 파이프라인 사용)
- `brand/Intro`, `brand/Outro` - 인트로·아웃트로

### 새로 만들어야 함
- `props/IceCream.tsx` - 아이스크림콘 소품. 사유: 기존 props(`Giraffe`·`Mouse`·`Whale`·`Sloth`·`BoneStack`·`Ruler`·`QMark`·`HumanNeckIcon`)에 음식류 자산이 없음. 향후 미각·소화 관련 화에서도 재사용 가능해 `props/`에 등록
- `props/HeadNerveDiagram.tsx`(가칭) - 머리 옆모습 다이어그램. `highlightMouth`(냉기 표시 on/off), `highlightForehead`, `showNerve`(신경선 표시 on/off) 를 props로 받아 s3·s4·s5 세 장면을 같은 컴포넌트 하나로 처리. 사유: 기존 `HumanNeckIcon`은 상반신 실루엣만 있고 머리 내부 구조·신경 경로를 표시할 수 없음. 향후 다른 신경·감각계 소재(간지럼·재채기 등)에서도 재사용 가능
- `character/poses.ts`에 포즈 1개 추가: `touchForehead`(바스트샷 전용). 사유: 기존 14종 중 `touchNeck`이 가장 비슷하지만 손이 목 위치에 고정돼 있어 이마를 짚는 동작에 그대로 못 씀. 새 컴포넌트가 아니라 기존 `poses.ts`에 항목만 추가하는 확장이라 등록 부담이 작음
