프로필: general (이 화는 사용자 지시로 상한을 180~240초로 완화 적용 - general.md의 기본 60초 상한은 이번 화에 적용하지 않는다. ep06과 동일한 예외 처리)

추정 길이(본편, 낭독 기준 추정치): 한국어 약 179초(2분 59초) / 영어 약 138초(2분 18초, ep06 실측 KO/EN 비율 약 0.77을 적용한 근사치). 인트로(2.3초)+제목카드(약 1.8초)+아웃트로(3.0초) 표준 브랜드 구간을 더하면 총 영상 길이는 한국어 약 186초(3분 6초) / 영어 약 145초(2분 25초)로 추정된다. 정확한 초 단위는 builder의 언어별 TTS 실측으로 확정되며, 이 수치를 맞추기 위해 문장·장면을 늘리지 않았다(원칙 0) - 아래 12개 장면(전제 1단 + 인과 3단의 핵심 사슬 + 곁가지 4개)을 다 쓴 결과가 이 길이다.

사실 개수: 1개(사슬 4단 - 전제 1단 + 인과 3단, s3~s7에 해당). s8~s12는 이 답을 심화·확장하는 곁가지 4개(역사/스케일/응용/청각버전)이며 `01-research.md`에서 개별적으로 확신 판단을 마쳤다.

## 제목 (제목 카드용, 원칙 6)

### KO 후보

| 후보 | 문구 | 평가 |
|---|---|---|
| A (채택) | `시계 보면 초침이 멈춰 보이는 이유` | "~이유" 서술형 기본형. 구체적 상황(시계를 볼 때)을 담되 원인(눈 움직임)은 스포하지 않음 |
| B (탈락) | `눈을 움직이면 시간이 잠깐 멈추는 이유` | 원인("눈을 움직이면")을 제목에서 먼저 알려줘, 본편의 핵심 반전(눈 움직임이 원인이라는 것)을 제목이 미리 스포함 - 원칙 6 톤 가이드 위반 |
| C (탈락) | `시계 초침이 순간 멈춘 것처럼 보이는 이유` | A와 정보량은 같지만 더 길고("것처럼"이 늘어짐), 공백 포함 20자를 넘어 상한에 근접 |

**선정: A** - "~이유"로 끝나는 기본형 유지, 구체적 계기("시계 보면")를 담아 추상적으로 던지지 않았고, 메커니즘(눈이 움직인 순간 뇌가 시간을 늘려 채운다)은 본편에 남겼다. B는 반전을 스포해서 탈락, C는 A와 동일한 정보량인데 더 길어서 탈락.

### EN 후보

| 후보 | 문구 | 평가 |
|---|---|---|
| A (채택) | `Why a Clock's Second Hand Looks Frozen for a Moment` | 짧고 명료, 원인 언급 없이 현상만 제시 |
| B (탈락) | `Why the Second Hand Seems to Pause When You Glance at a Clock` | A와 같은 내용이지만 더 길다 |

**선정: A** - KO A와 같은 원칙(반전 미스포, 구체적 상황 제시)을 영어 관용 표현으로 재작성했다(원칙 4, 직역 아님).

## 해시태그 (업로드 메타데이터용, 원칙 6)

- KO: `#굼구미 #상식 #착시 #시계 #뇌과학 #쇼츠`
- EN: `#Whymo #DidYouKnow #OpticalIllusion #Chronostasis #Brain #shorts #reels`
- 구성 메모: 채널 태그(`#굼구미`/`#Whymo`, `#상식`/`#DidYouKnow`) + 주제 키워드(`#착시` `#시계` `#뇌과학` / `#OpticalIllusion` `#Chronostasis` `#Brain` - 전부 대본·화면에 실제 등장하는 개념, `Chronostasis`는 s8 화면 라벨에 실제로 뜨는 단어라 검증 없이 지어낸 키워드가 아니다) + 플랫폼 관용 태그(`#쇼츠` / `#shorts` `#reels`)

## 설명 (업로드 캡션용, 원칙 6)

- KO: `시계 초침이 잠깐 멈춘 것처럼 보일 때가 있습니다. 눈을 빠르게 움직인 직후 뇌가 놓친 시간을 메우면서 생기는 착시 때문입니다.`
- EN: `A clock's second hand can seem to freeze for a moment before it starts ticking again. That happens because your brain fills in a blank moment right after your eyes jump to it.`
- 구성 메모: 1문장은 제목과 같은 현상을 캡션에서 다시 제시(제목과 문장 자체는 다르게 재작성), 2문장은 대본 s6~s7의 핵심 답(뇌가 빈 시간을 메운다)을 요약해 캡션 안에서 완결(원칙 6 설명 절 5번). 구독·팔로우 유도 문구는 넣지 않음

## 장면 (언어 공용)

캐릭터는 s1·s2·s13에만 등장한다(오프닝·리액션·클로징). s3~s12는 화면 전용 다이어그램 장면이다. 배경은 특정 장소를 고정하지 않는 `PlainBg`를 기본으로 쓴다(프로필 6항).

| # | 구간(추정, KO 기준) | 장면 지시 | 화면이 담당 | 목소리가 담당 | 화면 문자(언어별) |
|---|---|---|---|---|---|
| s1 | 0:00.0-0:02.0 | 캐릭터가 방 안(PlainBg)에서 벽시계 쪽으로 고개를 홱 돌린다(`idle`에서 살짝 회전된 자세로 전환) | 고개를 돌리는 동작 자체 | (없음 - 무성) | (없음) |
| s2 | 0:02.0-0:10.6 | 캐릭터 바스트샷, `surprised` 포즈로 시계를 보며 자문(원칙 2-1) | 캐릭터의 놀란 표정 | "어? 방금 초침이 잠깐 멈췄다가 움직인 것 같은데. 이거 왜 이러지?" | (없음) |
| s3 | 0:10.6-0:27.8 | 화면이 `AnalogClock`(신규) 클로즈업으로 전환. 눈 아이콘이 A지점에서 시계로 홱 이동하는 미니 다이어그램과, 눈 아이콘이 시계에 계속 고정돼 있는(움직임 없는) 대비 상황을 나란히 보여준다(텍스트 라벨 없이 아이콘 움직임만으로 "조건"을 보여줌) | 두 상황(눈이 방금 옮겨온 경우 vs 계속 보고 있던 경우)의 대비 자체 | "이 착시는 아무 때나 일어나지 않아요. 눈을 딴 데 보다가 시계로 홱 돌릴 때만 생겨요. 계속 보고 있던 시계에서는 절대 안 일어나요." | (없음) |
| s4 | 0:27.8-0:42.6 | 눈 아이콘(`ThemedIcon eye`)이 매우 빠르게 좌에서 우로 이동(`Shake`류 모션 활용), 이동 궤적 옆에 용어 라벨 팝인 | 눈이 매우 빠르게 움직이는 속도감 + 용어 라벨(원칙 2 - 용어는 화면이 전담) | "눈을 딴 데서 시계로 옮기는 순간, 눈알이 엄청나게 빠르게 움직여요. 이런 눈 점프, 하루에도 셀 수 없이 많이 해요." | ko `사카드` · en `Saccade` |
| s5 | 0:42.6-1:01.3 | 화면이 빠른 잔상(블러)으로 흐려지다가 순간 완전히 어두워짐(`FlashOverlay`를 어두운 색으로 재사용해 "섬광"이 아니라 "블랙아웃"으로 연출) | 블러 -> 블랙아웃으로 전환되는 화면 자체 | "근데 그렇게 빨리 움직이면 시야가 다 흐릿하게 번져야 정상이에요. 근데 그 흐릿한 순간, 본 기억이 없죠. 뇌가 그 순간 화면 신호를 잠깐 꺼버리기 때문이에요." | (없음) |
| s6 | 1:01.3-1:17.7 | 블랙아웃이 걷히며 시계 화면(정지된 초침)이 나타나고, 그 이미지가 짧은 타임라인 바 위에서 실제 등장 시점보다 훨씬 앞쪽까지 늘어나 채워지는 그래픽(에피소드 로컬 - "이미지가 과거로 늘어난다"는 걸 보여주는 단순 바 애니메이션) | "이미지가 과거로 늘어나 시간 공백을 채우는" 시각화 자체 | "그 꺼진 시간도 어쨌든 시간은 흘렀어요. 뇌는 그 빈틈을 메워야 해요. 그래서 처음 본 장면을, 원래보다 훨씬 먼저부터 있었던 것처럼 늘려버려요." | (없음) |
| s7 | 1:17.7-1:24.7 | `AnalogClock` 클로즈업, 초침이 짧게 멈춘 듯 정지해 있다가 원래 속도로 다시 똑딱이기 시작하는 페이오프 애니메이션(초침 끝에 옅은 글로우 링) | 초침이 멈췄다 다시 움직이는 모습 자체(핵심 반전의 결과) | "그 결과 초침이 잠깐, 마치 멈춘 것처럼 느껴지는 거예요." | (없음) |
| s8 | 1:24.7-1:38.0 | `Card` 팝인: 원형 뱃지 "2000년대 초", 라벨 "크로노스타시스", art는 `ThemedIcon(clock)`류 아이콘 | "2000년대 초" 뱃지 + "크로노스타시스" 라벨(원칙 2 - 이름·연도는 화면이 전담, 목소리는 이름을 직접 말하지 않음) | "이 현상엔 이름도 따로 있어요. 시간이 얼어붙은 것 같다고 해서 붙은 이름이에요. 정식으로 연구된 것도 생각보다 최근이에요." | ko `2000년대 초` / `크로노스타시스` · en `Early 2000s` / `Chronostasis` |
| s9 | 1:38.0-1:47.4 | `CountUp`으로 0에서 "약 10만"까지 빠르게 올라가는 숫자, 옆에서 눈 아이콘이 숫자가 오를 때마다 깜빡임 | "약 10만 번"이라는 숫자 자체(원칙 2 - 목소리는 숫자를 읽지 않고 "생각보다 자주"라고만 말함) | "생각보다 훨씬 더 자주 일어나요. 그때마다 아주 짧게, 화면이 껐다 켜지는 셈이에요." | ko `약 10만 번/하루` · en `~100,000 times/day` |
| s10 | 1:47.4-2:04.6 | 하루 24시간을 나타내는 원형 타임라인 위에, 사카드가 일어날 때마다 아주 짧은 검은 조각들이 촘촘히 누적되는 모습(정확한 비율·숫자는 표시하지 않는다 - 원칙 1의 정성적 표현 유지) | 검은 조각이 계속 쌓이는 누적 애니메이션 자체 | "그 순간들을 다 더하면, 하루 중 꽤 긴 시간 동안 사실 눈이 감겨 있는 셈이에요. 근데 우리는 그걸 전혀 눈치 못 채요." | (없음) |
| s11 | 2:04.6-2:23.3 | 마술사 실루엣이 손기술을 부리는 모습과 눈 아이콘이 옆에서 반짝(사카드) 표시되는 장면이 교차, 이어서 필름 편집 타임라인 위에서 컷 전환이 눈 아이콘 깜빡임과 동시에 일어나는 장면 | 손기술 타이밍 + 컷 전환 타이밍이 눈 깜빡임(사카드)과 정확히 겹치는 모습 자체 | "이 짧은 순간을 아예 이용하는 사람들도 있어요. 마술사들은 관객 눈이 움직이는 그 틈에 맞춰 손을 바꿔요. 영화 편집자들도 이 타이밍에 몰래 장면을 이어 붙이고요." | (없음) |
| s12 | 2:23.3-2:37.3 | 캐릭터 없이 귀 아이콘(`ThemedIcon ear`)이 고개가 홱 돌아가는 모션과 함께 나타나고, 소리 파형이 s6과 비슷하게 늘어나 채워지는 축소판 그래픽 | 청각 버전의 "파형이 늘어나 채워지는" 시각화 자체 | "이 착시, 눈에서만 나타나는 것도 아니에요. 고개를 홱 돌렸을 때 처음 들리는 소리에서도, 비슷한 현상이 나타난다는 연구도 있어요." | (없음) |
| s13 | 2:37.3-2:59.1 | 화면이 다시 캐릭터로 돌아옴(PlainBg, s1과 수미상관). 캐릭터가 `thinking` 포즈로 주변 사물들(창문·책상 등 실루엣)을 한 번씩 훑어보다가 마지막으로 벽시계를 다시 바라본다 | 캐릭터가 여러 사물을 훑어보다 시계로 시선이 돌아오는 모습 자체 | "사실 이 착시, 시계에서만 일어나는 건 아니에요. 눈을 옮긴 직후에 보는 거라면 뭐든 다 똑같이 일어나요. 근데 시계는 초침이 움직여야 한다는 걸 우리가 아니까, 유독 잘 느껴지는 것뿐이에요." | (없음) |

### 장면 구성 메모

- **핵심 사슬은 s3(전제)-s4(링크1: 눈 점프)-s5(링크2: 신호 차단)-s6(링크3: 빈 시간 채움)-s7(결과 페이오프)**에 몰려 있다. 이 5장면이 곁가지 없이도 "왜 초침이 멈춰 보이는가"에 완결된 답을 낸다.
- **s8~s12는 순서를 바꿔도 의미가 훼손되지 않는 곁가지 4개**(역사, 스케일1, 스케일2, 응용, 청각버전)다. 다만 s9(스케일: 하루 발생 빈도)와 s10(스케일: 누적 시간)은 서로 이어지는 게 자연스러워 순서를 유지했다.
- **s13은 "왜 하필 시계에서 특히 느껴지는가"라는, 핵심 답과는 다른 결의 마무리 통찰**로 닫는다. s6~s7에서 이미 나온 답을 반복하지 않고(원칙 3의 "결론 예고 후 반복" 금지), 그 답을 일반화하는 새로운 문장으로 영상을 정리한다.
- s4의 "사카드"와 s8의 "크로노스타시스"가 이 화의 용어 2개다(프로필 3항 한도 내). 둘 다 화면 라벨로만 노출되고 목소리는 쉬운 말로만 서술한다.

## 내레이션 대조표

| # | 한국어 | English |
|---|---|---|
| s1 | (없음) | (none) |
| s2 | 어? 방금 초침이 잠깐 멈췄다가 움직인 것 같은데. 이거 왜 이러지? | Wait, did that second hand just pause for a beat? Why does it do that? |
| s3 | 이 착시는 아무 때나 일어나지 않아요. 눈을 딴 데 보다가 시계로 홱 돌릴 때만 생겨요. 계속 보고 있던 시계에서는 절대 안 일어나요. | This illusion doesn't happen just anytime. It only kicks in when you look away, then whip your eyes onto the clock. If you've been staring at it the whole time, it never happens. |
| s4 | 눈을 딴 데서 시계로 옮기는 순간, 눈알이 엄청나게 빠르게 움직여요. 이런 눈 점프, 하루에도 셀 수 없이 많이 해요. | The instant your eyes jump from somewhere else onto the clock, they move incredibly fast. You make jumps like that all day long, more than you'd think. |
| s5 | 근데 그렇게 빨리 움직이면 시야가 다 흐릿하게 번져야 정상이에요. 근데 그 흐릿한 순간, 본 기억이 없죠. 뇌가 그 순간 화면 신호를 잠깐 꺼버리기 때문이에요. | Moving that fast should turn everything into a blur. But you've never actually seen that blur, have you. That's because your brain shuts off the incoming picture for that split second. |
| s6 | 그 꺼진 시간도 어쨌든 시간은 흘렀어요. 뇌는 그 빈틈을 메워야 해요. 그래서 처음 본 장면을, 원래보다 훨씬 먼저부터 있었던 것처럼 늘려버려요. | That blacked-out moment still counts as time passing, though. Your brain has to fill that gap somehow. So it takes the very first image you land on and stretches it backward, as if it had been there far longer than it really was. |
| s7 | 그 결과 초침이 잠깐, 마치 멈춘 것처럼 느껴지는 거예요. | And that's why the second hand looks like it paused, just for a beat, before it starts ticking normally again. |
| s8 | 이 현상엔 이름도 따로 있어요. 시간이 얼어붙은 것 같다고 해서 붙은 이름이에요. 정식으로 연구된 것도 생각보다 최근이에요. | This illusion even has its own name, inspired by the way time seems to freeze. And it wasn't studied seriously until surprisingly recently. |
| s9 | 생각보다 훨씬 더 자주 일어나요. 그때마다 아주 짧게, 화면이 껐다 켜지는 셈이에요. | It happens way more often than you'd think. Each time, it's a tiny blackout, off then back on. |
| s10 | 그 순간들을 다 더하면, 하루 중 꽤 긴 시간 동안 사실 눈이 감겨 있는 셈이에요. 근데 우리는 그걸 전혀 눈치 못 채요. | Add all those instants together, and a surprisingly large chunk of your day is spent with your eyes effectively shut. You just never notice it. |
| s11 | 이 짧은 순간을 아예 이용하는 사람들도 있어요. 마술사들은 관객 눈이 움직이는 그 틈에 맞춰 손을 바꿔요. 영화 편집자들도 이 타이밍에 몰래 장면을 이어 붙이고요. | Some people actually exploit that blackout on purpose. Magicians time their sleight of hand to exactly when your eyes are jumping. Film editors sneak cuts into that very same window. |
| s12 | 이 착시, 눈에서만 나타나는 것도 아니에요. 고개를 홱 돌렸을 때 처음 들리는 소리에서도, 비슷한 현상이 나타난다는 연구도 있어요. | And it's not just your eyes, either. Some research suggests a similar illusion happens with the first sound you hear right after you whip your head around. |
| s13 | 사실 이 착시, 시계에서만 일어나는 건 아니에요. 눈을 옮긴 직후에 보는 거라면 뭐든 다 똑같이 일어나요. 근데 시계는 초침이 움직여야 한다는 걸 우리가 아니까, 유독 잘 느껴지는 것뿐이에요. | This illusion isn't really about clocks at all. It happens with anything you glance at right after moving your eyes. Clocks just make it obvious, because you already know that hand is supposed to be moving. |

## 영어판 의역 메모

- s2: "이거 왜 이러지?"를 "Why does it do that?"으로 옮겼다. 직역("Why is this like this")보다 자연스러운 구어체
- s3: "홱 돌릴 때만"을 "whip your eyes onto the clock"으로 재작성했다. "홱"의 순간성을 "whip"이라는 동사 하나로 담았다
- s5: "본 기억이 없죠"를 반문형 "have you"를 문장 끝에 붙이는 영어 부가의문 구조로 재작성해 같은 뉘앙스(정말 그렇지 않냐는 확인)를 살렸다
- s6: "늘려버려요"를 "stretches it backward"로 옮기며 "far longer than it really was"를 덧붙여 늘어나는 방향(과거로)을 명확히 했다 - 한국어는 "먼저부터 있었던 것처럼"이라는 구문으로 방향을 담지만 영어는 동사+부사 조합이 더 자연스럽다
- s8: "생각보다 최근이에요"를 "surprisingly recently"로 재작성. 한국어는 "생각보다"로 의외성을 담고 영어는 "surprisingly"라는 부사 하나로 같은 역할을 한다
- s9~s13은 대체로 한국어 문장 구조를 따르되, 영어 관용구(예: "off then back on", "that very same window")로 리듬을 살렸다

## 자산 목록

### 기존 라이브러리 재사용

- `backgrounds/PlainBg` - 전 장면 배경
- `character/Actor`, `character/BustActor` - s1·s2·s13만 캐릭터 사용
- `character/poses` - `idle`(s1), `surprised`(s2), `thinking`(s13)
- `scenes/Caption` - 자막
- `scenes/Label` - s4·s8·s9의 화면 문구(용어·연도·숫자 라벨)
- `scenes/Card` - s8(연도+이름 카드, ep06의 케플러/포 카드와 동일 패턴 재사용)
- `scenes/Counter`의 `CountUp` - s9(0 -> 약 10만)
- `scenes/Effects`의 `FlashOverlay` - s5의 블랙아웃(색을 `C.ink` 계열 어두운 톤으로 넘겨 "섬광"이 아니라 "암전"으로 재사용), `Appear` - 각 장면 요소 등장 모션 전반
- `props/ThemedIcon` - s4 `eye`, s8 카드 art `clock`류, s11 마술사/필름 관련 아이콘 후보, s12 `ear`. 캐시에 없는 이름이면 렌더 전 `node scripts/sync_icons.mjs eye clock wand movie ear`류로 동기화 필요(정확한 Tabler 아이콘 이름은 builder가 아이콘 브라우저로 확인, REGISTRY 규칙 7)
- `scenes/TitleCard`, `brand/Intro`, `brand/Outro` - 표준 공용 요소. `TitleCard` 문구는 위 "제목" 절 값 사용

### 새로 만들어야 함

- `props/AnalogClock.tsx` - 시계 문자판 + 시침/분침/초침(각도 지정 가능) + 초침이 "멈춘 듯" 보일 때 쓰는 옅은 글로우 링(freeze 하이라이트). 사유: 라이브러리에 시계 컴포넌트가 없다. 시간·타이밍을 소재로 한 향후 화에서도 재사용 가능성이 높아 에피소드 로컬이 아니라 `props/`에 등록하는 것을 제안한다
- (에피소드 로컬, 라이브러리 등록 불필요) s3의 "눈 아이콘이 시계로 이동 vs 계속 고정" 대비 다이어그램 - 이 화 전용 단순 조건 시각화
- (에피소드 로컬, 라이브러리 등록 불필요) s6의 "이미지가 타임라인 위에서 과거로 늘어나 채워지는" 바 애니메이션 - 이 화의 핵심 반전 전용 시각화
- (에피소드 로컬, 라이브러리 등록 불필요) s10의 "하루 원형 타임라인 위에 검은 조각이 누적되는" 애니메이션 - 곁가지 전용, 다른 화에서 재사용 필요해지면 그때 승격 검토
- (에피소드 로컬, 라이브러리 등록 불필요) s11의 마술사 실루엣 + 필름 편집 타임라인 교차 장면 - 이 화 전용 응용 예시 시각화
- (에피소드 로컬, 라이브러리 등록 불필요) s12의 청각 버전 파형(s6 그래픽의 축소 변형) - 이 화 전용
