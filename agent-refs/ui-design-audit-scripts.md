# ui-design-system 참조 - AUDIT 스캔 커맨드·리포트 형식

ui-design-system 정의파일에서 옮긴 내용이다(2026-10-01 prompt-audit). 정의파일이 가리킬 때만 읽는다.

## 1. 하드코딩 스캔·중복 컴포넌트 감지

### A. 하드코딩 스캔
```bash
# 컬러 하드코딩 (ERE 플래그로 macOS/Linux 호환, 3~8자리 hex 커버)
grep -rEn "#[0-9a-fA-F]{3,8}" src/ --include="*.css" --include="*.scss" | \
  grep -v "tokens.css" | grep -v "reset.css"

# radius 하드코딩
grep -rEn "border-radius:[[:space:]]*[0-9]" src/ --include="*.css" --include="*.scss"

# shadow 하드코딩
grep -rEn "box-shadow:[[:space:]]*[0-9]" src/ --include="*.css" --include="*.scss"

# 고정 px width (100px 이상만 - 아이콘/divider 제외)
grep -rEn "width:[[:space:]]*[1-9][0-9]{2,}px" src/ --include="*.css"
```

각 발견 항목을 토큰 치환 테이블로 정리:
```
| 파일 | 라인 | 현재 | 제안 토큰 | 사유 |
|---|---|---|---|---|
| Card.css | 23 | #ef4444 | var(--color-danger) | 시맨틱 |
| Modal.css | 8 | 12px | var(--radius-lg) | 가장 근접 |
```

### B. 중복 컴포넌트 감지
```bash
# 별점·토스트·뒤로가기 버튼이 여러 페이지에 재구현 됐는지 (ERE 플래그, -i로 PascalCase 감지)
grep -rEiln "star|rating|toast|back.*button" src/components src/pages
```

동일한 패턴이 3회 이상 반복되면 `components/common/` 으로 추출 제안.

## 2. 미사용 토큰·부재 컴포넌트 감지와 리포트 형식

### C-1. 미사용 토큰 + 부재 컴포넌트 실제 감지
```bash
# 미사용 토큰 감지 (mktemp - 병렬 실행 시 경합 방지, 고정 경로 금지)
DEFINED_TOKENS=$(mktemp)
USED_TOKENS=$(mktemp)
grep -oE -- '--[a-z][a-z0-9-]+' src/styles/tokens.css | sort -u > "$DEFINED_TOKENS"
grep -roE -- 'var\(--[a-z][a-z0-9-]+\)' src/ --include="*.css" --include="*.jsx" --include="*.tsx" \
  | grep -oE -- '--[a-z][a-z0-9-]+' | sort -u > "$USED_TOKENS"
echo "미사용 토큰:" && comm -23 "$DEFINED_TOKENS" "$USED_TOKENS"
rm -f "$DEFINED_TOKENS" "$USED_TOKENS"

# 부재한 컴포넌트 감지 (13종 목록 대비)
EXPECTED="Button Input Select Modal BottomSheet Chip ChipScroller Card Badge Toast SafeImage Avatar Skeleton"
for c in $EXPECTED; do
  [ ! -f "src/components/common/${c}.jsx" ] && [ ! -f "src/components/common/${c}.tsx" ] && echo "MISSING: $c"
done
```

### D. 리포트 출력
```
📊 디자인 시스템 감사 결과

하드코딩 이슈:
  컬러: X건 (3파일)
  radius: Y건 (5파일)
  shadow: Z건 (27파일)

중복 구현:
  별점 컴포넌트: 3회 중복 → 공용화 권장
  토스트: 2회 중복

미사용 토큰: X개
부재한 컴포넌트: [BottomSheet, SafeImage]

권장 수정 순서:
1. 가장 많이 쓰이는 하드코딩 부터 → sed 없이 Edit로 안전하게
2. 중복 컴포넌트 공용화 후보 보고
3. stylelint 설정 적용
```
