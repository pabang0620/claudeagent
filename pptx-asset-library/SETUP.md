# SETUP — 클론 후 초기 설정

`pptx-asset-library`를 새 경로에 클론했을 때 바로 동작시키기 위한 최소 절차. 모든 코드(생성기·`audit.py`/`merge_manifest.py`/`regroup.py`·`composer/compose.mjs`)는 `__file__`/`__dirname` 기준 상대경로만 사용하므로, 클론 위치가 어디든(예: 다른 사용자 홈, 다른 프로젝트 하위) 그대로 동작한다.

## 1. Node 의존성 (composer — 조합 엔진)

```bash
cd pptx-asset-library/composer
npm install
```

- `package.json`에 `pptx-automizer`(설치된 버전 `0.8.2`)가 명시돼 있고 `package-lock.json`도 커밋돼 있어 `npm install`(또는 `npm ci`)만으로 재현된다.
- `composer/node_modules/`, `composer/out/`은 `.gitignore`로 제외돼 있으므로 클론 직후에는 반드시 `npm install`을 먼저 실행해야 `compose.mjs`가 동작한다.

## 2. Python 의존성 (generators — 에셋 생성기)

```bash
cd pptx-asset-library
pip install -r requirements.txt
```

- 핵심: `python-pptx`, `lxml`.
- `pymupdf`는 선택 의존성이다. `generators/lib/common.py`의 `try_thumbnail()`이 LibreOffice(`soffice`) 설치 여부를 먼저 확인하고, 없으면 `None`을 반환한다(정상 동작, 실패 아님). 썸네일이 필요 없으면 `pymupdf` 설치를 생략해도 에셋 생성 파이프라인 전체가 문제없이 동작한다.

## 3. (선택) 폰트 설치 — 렌더링/썸네일 확인용

에셋 **생성 자체에는 폰트 설치가 불필요**하다(python-pptx는 폰트 파일 없이도 텍스트 run에 폰트명을 XML로 기록할 뿐이다). 다만 LibreOffice로 썸네일을 뽑거나 실제 PowerPoint/한컴오피스에서 의도한 대로 렌더링되는지 눈으로 확인하려면 다음 폰트가 필요하다(design-tokens.json 참조):
- Pretendard GOV
- KoPubWorld돋움체
- Paperlogy

시스템 폰트 디렉토리(예: `~/.local/share/fonts` 또는 `/usr/share/fonts`)에 설치 후 폰트 캐시 갱신.

## 4. 에셋 생성 흐름 (신규/수정 에셋 반영 시)

```bash
cd pptx-asset-library

# ① 생성기 실행 (예시 — 대상 카테고리에 맞는 gen_*.py)
python3 generators/gen_<카테고리>_*.py

# ② _incoming/manifest_<CAT>.json 조각들을 manifest.json + INDEX.md로 병합
python3 generators/merge_manifest.py

# ③ 1에셋=1슬라이드 덱의 미그룹 도형을 asset:<ID> 그룹으로 소급 그룹화 (멱등)
python3 generators/regroup.py

# ④ 교차검증 — 출력의 "문제:" 카운트가 0이어야 완료로 간주
#    (audit.py는 sys.exit()를 호출하지 않으므로 exit code가 아니라 출력 텍스트를 직접 확인할 것)
python3 generators/audit.py
```

반드시 이 순서대로, 전체 재실행한다(부분 재실행 금지 — 상태 불일치 방지).

## 5. 조합 (완성 pptx 생성)

```bash
cd pptx-asset-library/composer
node compose.mjs --plan <plan.json> --out <out.pptx> [--master base.pptx|base_gov.pptx] [--manifest <manifest.json>]
```

- `--plan`: 슬라이드별 `asset_id` + 위치 + 텍스트/표/차트 치환을 담은 JSON.
- `--master`: 생략 시 표준 트랙(`base.pptx`), 정부 트랙은 `base_gov.pptx` 지정.
- `--manifest`: 생략 시 라이브러리 루트의 `manifest.json`을 사용(테스트에서만 오버라이드).
- 예시 플랜: `composer/sample_plan.json`.

## 6. 관련 에이전트 역할 분담

| 에이전트 | 역할 |
|---|---|
| `pptx-asset-generator` | 이 라이브러리의 "재료"를 만든다 — 생성기 작성/수정, manifest 반영(merge→regroup→audit), compose.mjs 확장. 최종 제안서 조립은 하지 않는다. |
| `proposal-pt-builder` | 최종 제안서 조립 — 슬라이드 플랜 수립, 이 라이브러리에서 에셋 선택, `compose.mjs`로 전체 PPT 완성. 에셋 자체를 새로 만들지 않고 소비만 한다. |

두 역할을 혼동해 한쪽이 다른 쪽 작업을 대신 수행하지 않는다.
