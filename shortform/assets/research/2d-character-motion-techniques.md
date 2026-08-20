# 리서치: 짧은 팔다리 2D 벡터 캐릭터의 "움직임" 표현 기법

퍼둥이(짧은 팔다리 플랫 벡터 캐릭터) 및 향후 유사 캐릭터 제작 시 참고할 사례 조사.
조사 범위: 기법 사례(모션라인/스쿼시&스트레치/컷아웃/스미어) + 브랜드 마스코트 사례 +
오픈 라이선스 에셋(SVG·SFX) 수집 가능성 검토.

수집일: 2026-08-10

---

## 1. 핵심 사실·기법 요약

| 근거ID | 내용 | 사실/요지 | 출처 | 날짜 |
|--------|------|----------|------|------|
| E-2dmotion-01 | 스쿼시&스트레치 | "간단한 도형 + 스쿼시&스트레치만 있으면 카툰 캐릭터에 필요한 해부학적 요소는 다 갖춘 것"이라는 것이 업계 정설. 원, 타원 등 단순 도형에 특히 잘 맞고 바운싱 볼이 표준 학습 예제 | Animation Mentor / Pixune (12원칙 해설) | 확인불가(상시 정설, 최근 재정리 글) |
| E-2dmotion-02 | 컷아웃 애니메이션 | 몸을 여러 파츠로 쪼개 프레임마다 파츠를 재배치(회전·이동)해 움직임을 만든다. "복잡한 리깅·스키닝 없이" 파츠를 통째로 움직이거나 회전시키는 것만으로 동작이 만들어짐 - 디지털에서는 이 로직을 그대로 재현해 파츠를 tween | Toon Boom Learn / prolificstudio 컷아웃 애니메이션 가이드 | 확인불가(일반 기법 해설) |
| E-2dmotion-03 | 듀오링고(Duo) 부엉이 리그 | 복잡한 스켈레톤 리그 대신 겹쳐진 단순 도형(날개=몸 뒤에 숨은 반원 등)으로 구성. 몸 곡률·눈 크기·날개 위치를 표준화해 "매우 유연한 리그"를 만들고, 이를 통해 브랜드 일관성을 잃지 않으면서 수천 가지 표현을 양산 | LogoAI 듀오링고 브랜드 스토리텔링 글 (WebSearch 요약, 원문 상세 인용은 페이지 접근 제한으로 재확인 불가) | 확인불가 |
| E-2dmotion-04 | 스미어 프레임(smear frame) | 빠른 움직임을 전달하기 위해 이미지를 프레임 간 늘리거나 왜곡하는 기법. 3가지 세부기법: ①스트레치 스미어(팔다리·몸을 여러 지점에 걸쳐 늘림) ②다중 팔다리(팔/다리를 여러 버전으로 겹쳐 그려 휘청임 표현) ③복제 스미어(같은 프레임에 여러 위치로 잔상처럼 복제 배치) | GarageFarm "스미어 프레임" 블로그(한국어) | 확인불가 |
| E-2dmotion-05 | 만화 모션라인 vs 스피드라인 | 스피드라인은 화면 전체에 걸쳐 속도·긴박감을 전달(위→아래는 침울함, 아래→위는 상승감 등 방향에 따라 감정도 다름). 모션라인은 캐릭터 가까이에 그려 "손의 움직임으로 인한 흐릿한 잔상"처럼 움직임의 방향 자체를 짧게 표시 | CLIP STUDIO TIPS "만화 효과" 아티클 | 확인불가 |
| E-2dmotion-06 | 만화적 실루엣 반복 표현 | 그림자를 혜성처럼 뒤로 갈수록 옅게 늘이거나, 캐릭터 실루엣을 여러 겹 배치해 뒤쪽일수록 옅어지게 하는 표현도 최근 만화에서 널리 쓰임(잔상 계열의 변형) | 나무위키 "만화적 표현" | 확인불가 |
| E-2dmotion-07 | UI/모션그래픽 12원칙 적용 | UI·모션그래픽에서 특히 자주 쓰는 4가지는 이징(easing)·타이밍·follow-through/overlap·anticipation. 과장(exaggeration)은 "물리를 사실적으로 보여주기보다 피드백/전환을 확실하고 재밌게 만드는" 데 씀(예: 폼 필드 에러 시 살짝이 아니라 확실히 흔들기) | IxDF "UI Animation: Disney's 12 Principles" | 확인불가 |
| E-2dmotコン-08 | (오디오) Mixkit SFX 라이선스 | Sound Effects Free License: 상업/개인 프로젝트 사용 가능(유튜브 포함), 회원가입 불필요, 저작자 표시 불필요. 단 DVD/비디오게임/TV·라디오 방송 포맷에는 제한(유튜브 숏폼과는 무관) | mixkit.co/license/ (Playwright 직접 접근 확인 - 아코디언 상세 텍스트는 JS 렌더 이슈로 재추출 실패, WebSearch 교차 확인으로 보완) | 확인불가(상시 정책) |
| E-2dmotion-09 | (오디오) Pixabay 라이선스 | Pixabay Content License: 상업적 이용 무료(단독 재판매/재배포 금지, 즉 "Standalone" 형태로 그대로 되팔 수 없음), 저작자 표시 불필요("있으면 감사하지만 필수 아님") | pixabay.com/service/license-summary/ (WebFetch 접근 확인) | 확인불가(상시 정책) |
| E-2dmotion-10 | 프로젝트 기존 결론(재확인) | "외부 음원(Freesound 등)은 상업 이용 라이선스 제약이 있어 쓰지 않는다(2026-08-08 조사 완결). 새 효과음이 필요하면 이 방식[ffmpeg lavfi]을 그대로 따른다" - 이미 10종 SFX를 이 방식으로 합성해 운영 중 | `/home/lee/project/.claude/shortform/assets/REGISTRY.md` 7절 (Read로 원문 확인) | 2026-08-08 |
| E-2dmotion-11 | 프로젝트 기존 결론(재확인) | "이미지 파일(png/jpg) 자산을 쓰지 않는다. 전부 코드로 그린다(해상도 자유, diff 가능)" - REGISTRY 규칙 8 | `/home/lee/project/.claude/shortform/assets/REGISTRY.md` 규칙 8 (Read로 원문 확인) | 확인불가(상시 원칙) |
| E-2dmotion-12 | 퍼둥이 프로젝트 내 기존 자산 | `MotionSwoosh` 컴포넌트(`scenes/MotionSwoosh.tsx`)가 이미 "동그라미 안에서 밖으로 뻗는 짧은 호 3개를 부채꼴 배치, frame 기반 sin으로 scale/opacity를 빠르게 펄스"시키는 speed-line 이펙트를 구현해 퍼둥이 등 캐릭터 종류 무관하게 재사용 가능 상태 | `/home/lee/project/.claude/shortform/assets/REGISTRY.md` 3절 (Read로 원문 확인) | 최초 perdungi-demo-active(v2) |
| E-2dmotion-13 | 퍼둥이 프로젝트 내 기존 자산 | 퍼둥이 v5 리그(`character-perdungi/poseRig.ts`)가 이미 body/face/armRight를 독립 `<g>`로 분리해 숨쉬기·어깨 회전·얼굴 sway를 프레임 기반으로 애니메이션. `perdungi-demo-active` 데모가 제자리 홉(스쿼시&스트레치) + 포즈 크로스페이드 + dizzy 하드컷(공중 스핀 암시) + 카메라 bounce로 "리깅 없이도 생동감" 구현을 이미 실증 | `/home/lee/project/.claude/shortform/assets/REGISTRY.md` 9절 (Read로 원문 확인) | perdungi-pilot-squid-ink(v5) / perdungi-demo-active |

---

## 2. 출처별 정리

### GarageFarm - "애니메이션의 동작을 강화 시키는 스미어 프레임 소개" (한국어)
- URL: https://garagefarm.net/ko-blog/smear-frames-enhancing-motion-in-animation (WebFetch 접근 확인)
- 접근 방법: WebFetch 직접
- 핵심 내용: 스미어 프레임 = 빠른 동작 구간에서 형태를 프레임 간 늘리거나 왜곡. 스트레치 스미어(팔다리 등을 여러 지점에 걸쳐 늘림) / 다중 팔다리(팔다리를 여러 버전으로 겹쳐 그려 휘청임) / 복제 스미어(같은 프레임에 여러 위치로 잔상 복제)의 3갈래. 관절 리깅을 새로 하지 않고 "그 프레임 한 장"을 과장해서 그리는 접근이라 짧은 팔다리 캐릭터에도 그대로 응용 가능.

### CLIP STUDIO TIPS - "모든 아티스트가 알아야 할 만화 효과!" (한국어)
- URL: https://tips.clip-studio.com/ko-kr/articles/10107 (WebFetch 접근 확인)
- 접근 방법: WebFetch 직접
- 핵심 내용: 포커스 라인(집중선)/스피드 라인/모션 라인 3종을 구분. 스피드 라인은 화면 전체 배경형(방향에 따라 감정 다름), 모션 라인은 캐릭터 근접부에 그리는 잔상형. 퍼둥이처럼 팔다리 표현이 제한적인 캐릭터에는 "모션 라인"(근접 잔상형)이 더 적합 - 이미 구현된 `MotionSwoosh`가 이 범주에 해당.

### LogoAI - "Duolingo's Logo History and Mascot Brand Storytelling"
- URL: https://www.logoai.com/blog/duolingos-logo-history-and-mascot-brand-storytelling (WebFetch 접근 확인, 단 리그 구조 상세 문단은 페이지에서 재확인 실패 - WebSearch 스니펫에는 있었으나 WebFetch 재접근 시 해당 문단 추출 안 됨)
- 접근 방법: WebFetch + WebSearch 교차
- 핵심 내용: Duo는 겹쳐진 단순 도형(반원 날개 등)으로 구성된 "유연한 리그"이며, 몸 곡률·눈 크기·날개 위치의 표준화로 브랜드 일관성을 유지한 채 대량의 표현 변주를 만든다는 것이 WebSearch 스니펫의 요지. 원문 문단은 재확인 실패했으므로 인용 시 "요지 수준"으로만 쓸 것(직접 인용 금지).

### IxDF (Interaction Design Foundation) - "UI Animation: Disney's 12 Principles"
- URL: https://ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design
- 접근 방법: 요약만 확인(WebSearch 스니펫)
- 핵심 내용: UI/모션그래픽에서 실제로 자주 쓰는 건 이징·타이밍·follow-through/overlap·anticipation 4가지. 과장은 "물리적 사실성"이 아니라 "피드백을 확실하게 알아채게" 하는 목적으로 씀.

### Mixkit License / Pixabay Content License (에셋 수집 가능성 검토용)
- URL: https://mixkit.co/license/ (Playwright 접근 확인, 아코디언 상세본문 추출 실패) / https://pixabay.com/service/license-summary/ (WebFetch 접근 확인)
- 접근 방법: Playwright 크롤링(Mixkit, JS 렌더 아코디언이라 본문 텍스트 자동추출 실패) / WebFetch 직접(Pixabay)
- 핵심 내용: 3절 참고. 둘 다 상업적 이용에 문제없어 보이나, 실제 다운로드는 하지 않음(4절 사유 참고).

---

## 3. 퍼둥이 캐릭터 적용 추천

우선순위 순:

1. **모션 라인(근접 잔상형) - 이미 구현됨, 파라미터 다양화만 하면 됨**
   `MotionSwoosh`가 CLIP STUDIO가 설명하는 "모션 라인"(스피드 라인과 달리 캐릭터 근접부에 그리는 방향성 잔상)에 정확히 대응한다. 팔·다리 짧은 부위 옆에 붙이는 용도로 이미 범용 설계되어 있으므로, 새로 조사한 이론적 근거(E-2dmotion-05)가 기존 구현 방향이 옳았음을 뒷받침한다. 추가로 할 일은 "스피드 라인"(화면 전체 배경형, 위→아래/아래→위 방향에 따라 감정을 다르게 준다는 위 CLIP STUDIO의 설명)까지는 아직 안 만들어졌다는 점 - 예를 들어 "깜짝 놀라 위로 튀어오르는" 장면처럼 화면 전체 임팩트가 필요할 때 참고할 신규 후보로 기록.

2. **스미어 프레임(다중 팔다리/복제 스미어) - 퍼둥이 v5 리그와 결합 여지 있음**
   현재 v5는 body/face/armRight를 독립 `<g>`로 분리해 회전 애니메이션만 준다(374~381행). 스미어 프레임의 "다중 팔다리"(팔을 2~3겹 반투명 잔상으로 겹쳐 그리기) 기법은 새로운 관절 좌표를 창작하지 않고, 기존 armRight `<g>`를 낮은 opacity로 2~3프레임 전 회전각에 복제 렌더링하기만 하면 된다 - REGISTRY 규칙 4(결정론)·규칙 6(기존 props 유지)과 충돌 없이 옵션 prop(`smear?: boolean`)으로 얹을 수 있는 형태. **구현은 이 조사 범위 밖**이므로 코드 작성은 하지 않았고, 다음 화 작업 시 참고 후보로만 기록.

3. **스쿼시&스트레치 - 이미 데모(perdungi-demo-active)에서 검증됨**
   업계 정설(E-2dmotion-01)과 이미 만든 데모(제자리 홉에서의 squash&stretch, E-2dmotion-13)가 정확히 일치한다. 별도 조사로 새로 배울 것은 없고, "이 방향이 업계 표준과 일치한다"는 확인 근거로만 유효.

4. **컷아웃 애니메이션 파츠 분리 - 이미 v5로 부분 구현됨**
   body/face/armRight 분리(E-2dmotion-13)가 컷아웃 애니메이션의 핵심 아이디어(파츠 단위 이동/회전, E-2dmotion-02)와 동일한 접근이다. 원본 SVG가 팔·다리를 몸통과 뚜렷이 분리된 도형으로 안 주는 포즈(lookback/dizzy/wine의 팔, pillarWide/Narrow/Peek의 다리 등)는 REGISTRY가 이미 "보류"로 명시했으므로, 무리하게 억지로 분리를 시도하지 말고 그 포즈들은 포즈 전환(크로스페이드/하드컷)으로 감정을 표현하는 현재 방식을 유지하는 것이 컷아웃 애니메이션 이론과도 부합한다(파츠 경계가 불명확하면 억지로 자르지 않는 것이 정석).

5. **UI 모션그래픽 4원칙(이징·타이밍·follow-through·anticipation) - 프레임 유틸에 이미 있음**
   `anim.ts`의 `easeIn`/`bounceIn`/`popIn` 등이 이미 이 4원칙 중 이징·타이밍을 커버 중. Follow-through/overlap(주 동작이 끝난 뒤 부속 요소가 약간 늦게 따라오는 것 - 예: 몸이 멈춘 뒤 귀나 꼬리가 한 박자 늦게 멈추는 것)은 얼굴/팔 `<g>`의 sway 위상을 body와 살짝 어긋나게 주는 정도로 이미 부분 구현된 것으로 보이나, "의도적으로 body보다 X프레임 늦게 감쇠"하는 명시적 파라미터는 없어 보임 - 향후 화에서 필요하면 검토할 후보.

---

## 4. 에셋 수집 결과

### SVG (모션라인/스와시)
**다운로드하지 않음.** 사유는 라이선스 문제가 아니라 **프로젝트 원칙 위반**이다:
- REGISTRY.md 규칙 8이 "이미지 파일(png/jpg) 자산을 쓰지 않는다. 전부 코드로 그린다"고 명시(E-2dmotion-11). SVG는 png/jpg가 아니지만, 이 프로젝트는 실제로도 SVG "파일"을 asset으로 두는 방식이 아니라 `<path d>` 좌표를 TS 코드(`poseArt.ts` 등)에 상수로 박아 렌더하는 방식을 쓴다. 즉 "코드로 그린다"는 원칙이 SVG 파일 형태의 외부 소스에도 그대로 적용된다.
- 실제로 필요한 것(모션 라인/스와시 이펙트)은 이미 `MotionSwoosh`로 코드 구현이 완료되어 있다(E-2dmotion-12). 새로 찾을 이유가 없다.
- 검색 결과 자체는 CC0/상업이용 가능 소스가 다수 존재했다(publicdomainvectors.org, svgrepo.com 등 - 단 svgrepo는 아이콘마다 라이선스가 개별 지정되어 일괄 신뢰 불가, 건별 확인 필요). 즉 "구할 수 없어서" 못 받은 게 아니라 **프로젝트 방침상 코드로 직접 그리는 게 맞다**는 판단.

### 효과음 (발소리/점프/스와시 사운드)
**다운로드하지 않음.** 두 가지 이유가 겹친다:

1. **기존 프로젝트 결론이 이미 이 문제를 다뤘다(E-2dmotion-10).** 2026-08-08에 Freesound 등을 조사해 "상업 이용 라이선스 제약이 있어 쓰지 않는다"로 결론 내고 ffmpeg lavfi 합성 방식(`hop_thump`, `anticipate_pop` 등 이미 10종)으로 이미 전환·운영 중이다. 이번 조사에서 확인한 **Mixkit(E-2dmotion-08)과 Pixabay(E-2dmotion-09)는 Freesound와 달리 상업 이용·유튜브 사용이 명확히 허용**되는 것으로 보이지만(라이선스 문면상), 그렇다고 해도 아래 2번 문제 때문에 실제 전환은 권하지 않는다.
2. **도구 제약: 이 크롤러 인스턴스는 바이너리 파일을 저장할 수 없다.** 사용 가능한 도구가 Read/Write(텍스트)/WebSearch/WebFetch(페이지 요약)/Playwright뿐이라 mp3 등 바이너리를 실제로 다운로드해 디스크에 저장하는 것이 기술적으로 불가능했다. Playwright로 라이선스 페이지 열람은 했지만 파일 저장은 별도 Bash/curl 권한이 필요하다.

**결론**: 라이선스가 명확한 후보(Mixkit·Pixabay)를 찾긴 했지만, (a) 기존에 검증되어 잘 작동 중인 ffmpeg lavfi 합성 방식을 대체할 만한 이유가 없고 (b) 이 인스턴스는 실제 다운로드를 수행할 도구가 없다. **"ffmpeg lavfi로 직접 합성하는 게 안전하다"는 기존 방침을 그대로 유지할 것을 권고**한다. 정말 외부 효과음이 필요해지는 예외 상황이 생기면, Mixkit/Pixabay 순으로 후보를 검토하되 라이선스 페이지 원문 재확인(가능하면 Bash 권한이 있는 세션에서 실제 다운로드 전 `curl`로 이용약관 재확인) 후 파일 옆에 출처·라이선스 URL·확인일을 명시하는 절차를 밟을 것.

---

## 5. 막힌 곳

- Mixkit 라이선스 페이지의 "Sound Effects Free License" 아코디언 상세 본문은 클릭 시 JS로 렌더되는데, Playwright `browser_evaluate`로 접근해도 DOM에 실제 텍스트가 로드되지 않아(React 컴포넌트 상태 문제로 추정) 원문 전체 인용 실패. WebSearch 스니펫으로 "상업/개인 사용 가능, 가입 불필요, 무저작자표시, DVD/게임/방송 제한"이라는 요지만 교차 확인했다. 스크린샷은 별도로 남기지 않았음(막힌 지점이 텍스트 렌더 문제이지 접근 차단이 아니라 증빙 스크린샷의 실익이 낮다고 판단).
- LogoAI 듀오링고 글의 리그 구조 상세 문단은 WebSearch 스니펫에는 잡혔으나 WebFetch로 페이지를 직접 열었을 때는 해당 문단이 추출되지 않음(페이지 내 다른 섹션으로 재구성됐거나 캐시 차이로 추정). 인용은 스니펫 수준으로만 표기했고 "직접 인용"이 아니라 "요지"로 명시함.

---

## 6. 추가 탐색 추천 (필요 시)

- Rive(rive.app) 상태 머신 기반 마스코트 애니메이션 실제 사례 - 이번 조사에서는 dev.to 글 2건을 열었으나 기획/영업성 콘텐츠라 기술 디테일이 부족했다. Rive 공식 예제 갤러리를 별도로 열람하면 "리깅 없이 상태 전환만으로 표현력 내는" 더 구체적인 사례를 얻을 수 있을 것으로 보임(이번 조사 범위 밖으로 남김).
- 카카오프렌즈/라인프렌즈 등 국내 마스코트의 실제 모션그래픽(공식 애니메이션 숏) 사례 - 나무위키 정도만 확인했고 실제 애니메이션 영상 분석은 하지 않음. 유튜브 공식 채널 영상을 직접 보며 프레임 분석하는 조사가 필요하면 별도 인스턴스로 진행 권장.
