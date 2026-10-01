# UI 디자인 시스템 - TS 전환·CSS 방법론 분기 규칙

ui-design-system 참조. 원문 그대로 옮겼다(2026-09-29).

### TypeScript 감지 시 전환 규칙 (tsconfig.json 존재 또는 .tsx 파일 존재 시)
- 모든 .jsx → .tsx, .js → .ts
- Props 타입: JSDoc 금지 → `interface Props { ... }` 선언 필수
- 훅 시그니처 타입 명시:
  - `useIsMobile(bp?: number): boolean`
  - `useDragScroll(): { ref: RefObject<HTMLDivElement>; onPointerDown: PointerEventHandler<HTMLDivElement> }`
  - `useScrollLock(locked: boolean): void`
- tsconfig.json 없으면 생성 제안 (strict: true 기본)

TS 변환은 별도 구현을 만들지 않는다 - `.claude/agent-refs/ui-design-bootstrap-mode.md` 의 "5. `components/common/` 13개 컴포넌트 생성"에 있는 JS 버전(`Button.jsx` 등)을 기준 구현으로 삼고, 다음 규칙만 적용해 `.tsx`로 변환한다:
1. JSDoc `@param {...}` 주석 블록 → `interface {Component}Props { ... }` 선언으로 대체 (타입은 JSDoc 타입을 그대로 옮김)
2. 함수 시그니처에 `: {Component}Props` 타입 어노테이션 추가
3. 클래스명(`styles.button` 등)은 JS 버전과 동일하게 유지 - 아래 "CSS 방법론별 컴포넌트 클래스 산출 규칙"에 따라 BEM/Tailwind/styled-components가 감지되면 JS·TS 버전 모두 동일하게 변환한다 (TS라고 해서 CSS Modules를 강제하지 않음 - 예: WeCom BEM 감지 시 TS 버전도 `Button.css` + BEM 클래스명 사용)

**충돌 시**:
- Tailwind + BEM 혼재: `93cd44e` 재앙을 언급하고 하나로 통일할 것을 요구.
- CSS Modules + BEM 혼재: 동일. 방법론 통일 후 진행

**충돌 감지 후 사용자 대화 템플릿**:
> "Tailwind와 BEM이 혼재하고 있습니다. 전체 개선 전에 방법론을 하나로 통일해야 합니다.
> 옵션 1: Tailwind로 통일 (기존 BEM 클래스 제거 필요)
> 옵션 2: BEM/CSS Modules로 통일 (Tailwind 의존성 제거 필요)
> 방향을 결정해 주시면 진행합니다. 그전까지는 하드코딩 스캔 리포트만 제공합니다."
- **생성할 스타일 파일 결정 로직**:
  - 감지된 방법론이 BEM → `Button.jsx` + `Button.css` (일반 CSS, BEM 클래스명)
  - 감지된 방법론이 CSS Modules → `Button.jsx` + `Button.module.css`
  - Tailwind → `Button.jsx` (className 인라인), CSS 파일 없음, tokens.css를 `@theme`로 통합 제안
  - styled-components/@emotion 기존 프로젝트 감지 → **새 방법론을 도입하지 않고 기존 styled-components를 그대로 따른다.** `Button.jsx` + `Button.js`(또는 `.styles.js`, 프로젝트 기존 관례를 따름) 안에 `styled.button` 템플릿 리터럴로 정의, CSS 파일 생성 없음. tokens.css의 `var(--토큰)`은 styled-components 템플릿 리터럴 안에서도 그대로 참조 가능(`background: var(--color-primary);`)하므로 토큰 자체는 동일하게 사용

CSS 방법론별 컴포넌트 클래스 산출 규칙:
- CSS Modules: styles.button (기본)
- BEM: block__element--modifier (예: .btn .btn__icon .btn--primary)
- Tailwind: @apply 또는 유틸 클래스 직접 + cva/clsx 변형
- styled-components: `const StyledButton = styled.button` 템플릿 리터럴 형태로 변환, `data-variant`/`data-size` 등 상태 속성은 `props`로 받아 템플릿 리터럴 내 조건부 스타일로 처리 (신규 도입이 아니라 **기존 프로젝트에 이미 styled-components가 있을 때만** 이 규칙을 쓴다 - 없는 프로젝트에 새로 들여오지 않는다. 아래 "에이전트가 하지 말아야 할 것" 참조)
감지된 방법론에 맞춰 13개 컴포넌트 클래스명을 변환한다.

> 본 문서의 13개 컴포넌트 예시는 모두 CSS Modules(`styles.button`) 기준으로 작성되어 있다. BEM/Tailwind/styled-components가 감지되면 위 규칙에 따라 13개 컴포넌트 전체의 클래스명(또는 styled 정의)을 일괄 변환하여 생성한다.


