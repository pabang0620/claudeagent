# Coding Style

## Immutability (CRITICAL)

객체를 mutate하지 않고 항상 새 객체를 만든다. 코드 예시는 `coding-standards` 스킬의 "불변성 패턴" 참조.

## File Organization

> 판정 기준 SSOT는 `agents/lee-wonho.md`. 파일 줄 수 = 규칙 I-06, 지역성 우선 = 규칙 I-01.

파일 줄 수:
- 최대 500줄. 500줄을 초과하면 개발 도중이라도 즉시 분할한다. 단 분할 후 연동과 동작이 정상인지 확인한다.
- 500줄 미만 구간에서는 무조건 분할하지 않는다. 필요할 때만 한다.
- 통상적으로는 구조화가 잘 되어 있으면 300줄을 넘지 않는다.
- 사용자 원문: "최대 500줄인데 사실 이것도 필요에 의해서 해야지 일부러 무조건적으로 분할하진 않아. 하지만 구조화를 잘 해뒀기 때문에 보통 300줄을 넘어가진 않지" / "A로 하지 잘 연동만 되면 돼"

DRY보다 지역성(locality) 우선:
- 같은 코드가 여러 곳에 있어도 굳이 공통화하지 않는다. 중복 제거·추출은 기본값이 아니다.
- 컨벤션: 해당 페이지에서 쓰는 API 코드는 그 페이지 폴더에 다 넣는다. 여러 페이지에 중복되어도 공통 훅·유틸로 강제 추출하지 않는다.
- Organize by feature/domain, not by type (위 지역성 우선 방향과 일치하므로 유지)
- 사용자 원문: "굳이 공통화 안 해도 되면 안 해도 상관없어. 같은 코드여도 그냥 쓴다 주의야. 컨벤션 자체가 해당 페이지에 나온 api는 한 폴더에 다 넣는다로 되어 있을 텐데"

## Error Handling

새 컨트롤러/라우트를 쓰기 전에 프로젝트의 기존 컨트롤러가 실제로 어떤 관용구를 쓰는지 먼저 확인한다 (일부 프로젝트는 `asyncHandler` 래퍼를 쓸 수 있음).

### (A) Express HTTP 핸들러 (컨트롤러/라우트)

`try { ... } catch (err) { next(err) }` — 재throw 금지, 중앙 `errorHandler` 미들웨어가 상태코드·응답 JSON을 단독 책임진다. 컨트롤러에 사용자 노출 에러 문자열을 인라인하지 않는다(중앙에서 결정). 기존 코드베이스가 명시적 try/catch를 쓰고 있으면 그 관례를 따르고, `asyncHandler` 같은 래퍼를 새로 도입하지 않는다.

```javascript
export async function getWebtoon(req, res, next) {
  try {
    const webtoon = await webtoonService.findById(req.params.id)
    res.json({ success: true, data: webtoon })
  } catch (err) {
    next(err)
  }
}
```

### (B) 그 외 일반 코드 (유틸·서비스 내부·스크립트 등, HTTP 핸들러 아님)

ALWAYS handle errors comprehensively:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## Input Validation

사용자 입력은 항상 zod로 검증한다. 스키마 작성 예시는 `coding-standards` 스킬 참조.

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<500 lines, 규칙 I-06)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)
