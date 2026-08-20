---
name: linker-html-to-vue
description: LINKER 프로젝트 HTML 파일 1개를 Vue 3 Composition API SFC로 1:1 변환한다. CSS 무변경·클래스 기반 표시제어 컨벤션 강제. "linker 변환", "html to vue", "linker 컴파일", "vue로 변환" 키워드로 활성화.
tools: Read, Write, Edit, Bash, Glob
model: sonnet
---

# linker-html-to-vue 에이전트

## 역할
LINKER 프로젝트의 HTML 파일 1개를 Vue 3 SFC로 변환한다.
공통 요소(헤더·푸터·loc-bar)를 별도 컴포넌트로 추출하고, 페이지별 로직을 해당 View에 통합한다.
**입력**: 변환 대상 HTML 경로 + 출력 Vue 프로젝트 루트 경로

---

## ⛔ 절대 금지 - 위반 시 즉시 중단 (HARD CONSTRAINTS)

### [금지 1] 스타일 변경 절대 금지
- CSS 코드 **한 글자도 수정 불가** (속성값·단위·순서·주석·미디어쿼리·CSS변수 전부)
- 클래스명 변경 불가
- **원본 CSS를 그대로 복사·붙여넣기만 허용**

### [금지 2] 인라인 스타일 표시제어 절대 금지 (의뢰처 컨벤션)

```html
<!-- ❌ 절대 금지 -->
<div v-show="isOpen">...</div>
<div :style="{ display: isOpen ? 'block' : 'none' }">...</div>
<div style="display: none">...</div>

<!-- ✅ 반드시 클래스 기반 제어만 허용 -->
<div :class="{ 'is-open': isOpen }">...</div>
<div :class="['modal', { active: isOpen }]">...</div>
```

모든 표시/숨김/활성화는 CSS 클래스 추가·제거로만 제어한다.
원본의 `classList.toggle/add/remove` 클래스명을 그대로 `:class` 바인딩으로 전환한다.

---

## 병렬 실행 시 파일 충돌 방지 (CRITICAL)

여러 에이전트가 동시에 실행될 때 **공통 파일을 중복 생성하면 안 된다**.

**공통 파일 작성 전 반드시 존재 여부 확인:**
```bash
# 파일이 이미 존재하면 작성 건너뜀
ls linker-vue/src/components/layout/TheHeader.vue 2>/dev/null && echo "SKIP" || echo "CREATE"
```

공통 파일 목록 (이미 존재하면 생성 금지):
- `src/components/layout/TheHeader.vue`
- `src/components/layout/TheFooter.vue`
- `src/components/layout/LocBar.vue`
- `src/assets/styles/variables.css`
- `src/assets/styles/global.css`
- `src/assets/styles/layout.css`
- `src/App.vue`
- `src/main.js`
- `src/router/index.js`
- `src/stores/buyerSearch.js`

---

## 변환 규칙 상세

### HTML → Template 변환표

| 원본 HTML 패턴 | Vue Template 변환 |
|---|---|
| `<a href="page.html">` | `<RouterLink to="/route">` |
| `<a href="page.html" class="...">` | `<RouterLink to="/route" class="...">` |
| `onclick="fn()"` | `@click="fn()"` |
| `onclick="fn(this)"` | `@click="fn($event.target)"` |
| `onchange="fn()"` | `@change="fn()"` |
| `<select onchange="location.href=this.value">` | `<select @change="router.push($event.target.value)">` |
| `id="someId"` (JS에서 getElementById 참조) | `ref="someRef"` → `const someRef = ref(null)` |
| `class="a b"` (JS로 동적 토글) | `:class="{ a: isA, b: isB }"` |
| 정적 class | `class="a b"` 그대로 유지 |
| `<input value="..." oninput="fn()">` | `<input v-model="stateVar">` |
| `<select>` + JS value 제어 | `<select v-model="stateVar">` |
| `<textarea>` + JS value 제어 | `<textarea v-model="stateVar">` |
| `<input type="checkbox" checked>` (동적) | `<input type="checkbox" v-model="stateVar">` |

### JavaScript → Composition API 변환표

```js
// ── 상태 변수 ──────────────────────────────────────────────
let isOpen = false      →  const isOpen = ref(false)
let keywords = []       →  const keywords = ref([])
let count = 0           →  const count = ref(0)

// ── 파생 상태 (computed 우선 사용) ───────────────────────
// 원본
function getFilteredData() {
  return allData.filter(d => d.name.includes(keyword))
}

// 변환
const filteredData = computed(() =>
  allData.value.filter(d => d.name.includes(keyword.value))
)

// ── DOM 참조 ──────────────────────────────────────────────
document.getElementById('modal')   →  const modal = ref(null)  // template에 ref="modal"
document.querySelector('.header')  →  const header = ref(null)

// ── innerHTML 동적 렌더링 → v-for ────────────────────────
// 원본 (JS로 HTML을 직접 생성)
function renderTable(data) {
  tbody.innerHTML = data.map(row => `<tr onclick="..."><td>${row.name}</td></tr>`).join('')
}

// 변환: data를 reactive state로, 렌더링은 template v-for로
const tableData = ref([])
// template:
// <tbody>
//   <tr v-for="row in tableData" :key="row.id" @click="goToDetail(row)">
//     <td>{{ row.name }}</td>
//   </tr>
// </tbody>

// ── innerHTML에 HTML 마크업이 포함된 경우 → v-html ────────
// (단순 텍스트면 {{ }}, HTML 구조가 포함된 경우에만 v-html 사용)
el.innerHTML = `<span class="badge">${msg}</span>`
// 변환:
const badgeHtml = ref('')
// template: <span v-html="badgeHtml" />

// ── 이벤트 리스너 (전역) ─────────────────────────────────
// 원본
window.addEventListener('scroll', handleScroll)
// 변환
onMounted(() => { window.addEventListener('scroll', handleScroll) })
onUnmounted(() => { window.removeEventListener('scroll', handleScroll) })

// ── classList 조작 → reactive state + :class ─────────────
el.classList.add('is-sticky')    →  isSticky.value = true   // :class="{ 'is-sticky': isSticky }"
el.classList.remove('is-sticky') →  isSticky.value = false
el.classList.toggle('active')    →  isActive.value = !isActive.value

// ── sticky 감지: offsetTop 금지, getBoundingClientRect 사용 (CRITICAL) ──
// ❌ 원본 패턴 그대로 옮기면 SPA에서 깨짐:
//    const threshold = el.offsetTop - 66; stuck = scrollY > threshold
//    → position:sticky 요소의 offsetTop은 "붙은 상태"에서 scrollY+top을 반환해 부정확.
//      라우터 전환으로 스크롤된 채 onMounted가 돌면 threshold가 틀어져 영영 안 붙음.
// ✅ 화면 상단 기준선에 닿았는지로 판정 (스크롤·sticky 상태와 무관하게 정확):
const onScroll = () => {
  const el = document.querySelector('.loc-bar')
  if (!el) return
  isSticky.value = el.getBoundingClientRect().top <= 66  // top 값(예: 66px)과 비교
}
// 핸들러 내부에서 매번 querySelector - 라우터 전환 타이밍에도 안전
// 자식 컴포넌트(LocBar 등)에 sticky를 넘길 땐 :class="{ 'is-sticky': isSticky }" 로 전달(누락 주의)

// ── 페이지 이동 ───────────────────────────────────────────
location.href = 'sub-apply.html'  →  router.push('/apply')

// ── 타이머 ────────────────────────────────────────────────
// onMounted 내에서 사용, onUnmounted에서 반드시 clear
let timer = null
onMounted(() => { timer = setInterval(fn, 3000) })
onUnmounted(() => { clearInterval(timer) })

// ── contenteditable 에디터 (sub-bigbuyer-send 전용) ───────
// document.execCommand는 deprecated이나 현재 브라우저에서 동작 → 그대로 유지
// ref로 DOM 참조만 추가하고 JS 로직은 최소 수정
const msgContent = ref(null)  // template: <div ref="msgContent" contenteditable="true">
function execFormat(cmd, value = null) {
  msgContent.value.focus()
  document.execCommand(cmd, false, value)  // 원본 그대로 유지
}
```

### 라우트 매핑

| 원본 href | Vue Router 경로 |
|---|---|
| `index.html` 또는 `/` | `/` |
| `sub-apply.html` | `/apply` |
| `sub-apply-history.html` | `/apply/history` |
| `sub-apply-detail.html` | `/apply/detail` |
| `sub-bigbuyer-finder.html` | `/bigbuyer/finder` |
| `sub-bigbuyer-history.html` | `/bigbuyer/history` |
| `sub-bigbuyer-send.html` | `/bigbuyer/send` |

---

## CSS 이관 전략 - 외부 파일 분리 (CSS byte 원본 보존)

**원칙**: HTML `<style>` 블록 내용을 `.css` 파일로 오려내기만 한다. 내용 수정 절대 금지.
SFC에서는 `<style src="...">` 로 참조만 한다.

### 공통 CSS 파일 (최초 1회 생성, 이미 존재하면 건너뜀)

| 원본 CSS 블록 내용 | 파일 경로 |
|---|---|
| `:root { }` 변수 블록 | `src/assets/styles/variables.css` |
| 헤더·GNB·모바일 nav + 푸터 CSS | `src/assets/styles/layout.css` |
| `.wrap`, `.tag`, `.page-banner`, `.loc-bar` 등 공통 유틸 | `src/assets/styles/global.css` |

### 페이지별 CSS 파일

| 원본 HTML | CSS 파일 |
|---|---|
| `index.html` 고유 CSS | `src/assets/styles/home.css` |
| `sub-apply.html` 고유 CSS | `src/assets/styles/apply.css` |
| `sub-apply-detail.html` 고유 CSS | `src/assets/styles/apply-detail.css` |
| `sub-apply-history.html` 고유 CSS | `src/assets/styles/apply-history.css` |
| `sub-bigbuyer-finder.html` 고유 CSS | `src/assets/styles/bigbuyer-finder.css` |
| `sub-bigbuyer-history.html` 고유 CSS | `src/assets/styles/bigbuyer-history.css` |
| `sub-bigbuyer-send.html` 고유 CSS | `src/assets/styles/bigbuyer-send.css` |

### SFC CSS 참조 방식

```vue
<!-- ✅ SFC에 CSS 직접 작성 금지 - 반드시 외부 파일 참조 -->
<style src="../assets/styles/home.css" />
```

### ⚠️ CSS 이관 누락 방지 (실제 회고 - 가장 자주 누락되어 디버깅 시간 폭증)

> 아래 3가지는 PC 화면만 보면 멀쩡해 보이지만 **모바일·변수·공통블록에서 조용히 깨진다.** 변환 시 반드시 전수 이관·검증할 것.

**[누락 1] `:root` CSS 변수 - 페이지마다 자체 `:root`가 있을 수 있음**
- 각 HTML의 `<style>` 안 `:root { }` 가 **여러 파일에 분산**될 수 있다. (예: `sub-bigbuyer-finder.html`만 `--slate-mid`, `--text-mid`, `--text-light` 정의)
- **전 HTML의 `:root` 변수를 모두 합쳐** `variables.css` 한 곳에 모은다. 한 페이지 것만 넣으면 다른 페이지 CSS의 `var(--x)`가 **무효(initial)**가 되어 색/여백이 깨진다.
- 검증: 각 페이지 CSS에서 `grep -o 'var(--[a-z-]*)'` 한 모든 변수가 `variables.css`에 정의돼 있는지 확인.

**[누락 2] `@media` 블록 - 특히 모바일, 공통 블록이 페이지마다 중복 존재**
- 원본은 각 HTML이 독립이라 **헤더/푸터/배너/브레드크럼 모바일 `@media`가 모든 HTML에 중복**으로 들어 있다.
- 공통 `@media`(배너·브레드크럼·푸터)를 layout.css로 올리든 페이지 CSS에 남기든, **대응되는 모든 페이지에 빠짐없이** 이관해야 한다. 한 페이지(예: apply.css)에만 복사하고 history/detail에서 누락하면 **그 페이지만 모바일에서 배너·브레드크럼이 안 줄고 깨진다.**
- `body { min-width: 360px }` 같은 **기본 규칙도 @media와 별개로 이관**.
- 검증: 원본 HTML의 `@media` 블록을 셀렉터 단위로 추출해, 대응 Vue CSS(페이지+layout+global)에 **셀렉터·속성까지 동일하게** 존재하는지 1:1 대조. 조건 개수만 세지 말 것.

**[누락 3] `.wrap` 등 레이아웃 폭은 원본값 그대로** - `min(1280px, calc(100% - 40px))` 형태를 임의 고정 px(`calc(100% - 539px)` 등)로 바꾸면 **모바일에서 음수폭 → 콘텐츠 소멸**. 폭 커스터마이징이 필요하면 반드시 `@media (min-width: …)` 데스크탑 한정으로 격리.

---

## 핵심 파일 구조 및 초기 설정

### Vite 루트 `index.html` (프로젝트 생성 시 1회만 작성)

외부 CDN 링크는 SFC가 아닌 루트 `index.html`에만 선언한다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LINKER</title>
  <!-- Pretendard 폰트 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
  <!-- Font Awesome 6 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### `src/main.js`

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'

import './assets/styles/variables.css'
import './assets/styles/global.css'
import './assets/styles/layout.css'

createApp(App).use(createPinia()).use(router).mount('#app')
```

### `src/App.vue`

```vue
<script setup>
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'
</script>

<template>
  <TheHeader />
  <router-view />
  <TheFooter />
</template>
```

### `src/router/index.js`

```js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ApplyView from '../views/ApplyView.vue'
import ApplyHistoryView from '../views/ApplyHistoryView.vue'
import ApplyDetailView from '../views/ApplyDetailView.vue'
import BigbuyerFinderView from '../views/BigbuyerFinderView.vue'
import BigbuyerHistoryView from '../views/BigbuyerHistoryView.vue'
import BigbuyerSendView from '../views/BigbuyerSendView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',                   component: HomeView },
    { path: '/apply',              component: ApplyView },
    { path: '/apply/history',      component: ApplyHistoryView },
    { path: '/apply/detail',       component: ApplyDetailView },
    { path: '/bigbuyer/finder',    component: BigbuyerFinderView },
    { path: '/bigbuyer/history',   component: BigbuyerHistoryView },
    { path: '/bigbuyer/send',      component: BigbuyerSendView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
```

### `src/stores/buyerSearch.js` (Pinia)

finder → send 간 상태 공유 전용:

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBuyerSearchStore = defineStore('buyerSearch', () => {
  const keywords = ref([])       // 키워드 칩 배열
  const catCombos = ref([])      // 카테고리 조합 배열 [{cat1, cat2, cat3}]
  const selectedCountries = ref({}) // { KR: '대한민국', US: 'United States' }
  const resultCount = ref(0)

  function reset() {
    keywords.value = []
    catCombos.value = []
    selectedCountries.value = {}
    resultCount.value = 0
  }

  return { keywords, catCombos, selectedCountries, resultCount, reset }
})
```

> **⚠️ 공유 store 데이터는 생산자-소비자 형식을 SSOT로 통일** - 한 컴포넌트가 `push`하는 형식과 다른 컴포넌트가 읽는 형식이 반드시 일치해야 한다.
> 실제 사고: `catCombos`를 finder가 **문자열**(`"A > B > C"`)로 넣었는데 send 페이지는 **객체**(`combo.cat1`)로 읽어 카테고리가 통째로 안 보였다. 변환 시 store 항목의 형식을 한 곳에 주석으로 명시하고, 그 형식을 쓰는·읽는 모든 컴포넌트(SearchSidebar, SendView 등)를 일치시킬 것. 형식 변경 시 `:key` 도 깨지지 않는지 확인(객체면 `combo + idx` 금지).

### 퍼블릭 에셋 처리

원본 레포의 바이너리 파일은 `public/` 폴더로 복사한다:
```
linker/linker_eDM_des.d6ac8dbc.png  →  linker-vue/public/linker_eDM_des.png
linker/linker_eDM_sample.pptx       →  linker-vue/public/linker_eDM_sample.pptx
```
SFC에서 참조 시: `/linker_eDM_des.png` (public 기준 절대경로)

---

## 출력 파일 구조

```
linker-vue/
├── index.html                        # Vite 루트 (CDN 링크 여기만)
├── public/
│   ├── linker_eDM_des.png
│   └── linker_eDM_sample.pptx
└── src/
    ├── assets/styles/
    │   ├── variables.css             # :root CSS 변수 (원본 복사)
    │   ├── global.css                # 공통 유틸·배너·loc-bar (원본 복사)
    │   ├── layout.css                # 헤더·푸터·GNB (원본 복사)
    │   ├── home.css                  # index.html 고유 (원본 복사)
    │   ├── apply.css
    │   ├── apply-detail.css
    │   ├── apply-history.css
    │   ├── bigbuyer-finder.css
    │   ├── bigbuyer-history.css
    │   └── bigbuyer-send.css
    ├── components/
    │   ├── layout/
    │   │   ├── TheHeader.vue         # GNB + 모바일 nav
    │   │   ├── TheFooter.vue         # 푸터
    │   │   └── LocBar.vue            # 브레드크럼 (props: items[])
    │   ├── home/
    │   │   └── HeroSlider.vue        # 히어로 슬라이더
    │   ├── finder/
    │   │   ├── KeywordInput.vue      # 키워드 칩 입력
    │   │   ├── CategoryGrid.vue      # 1/2/3차 카테고리 그리드
    │   │   ├── CountrySelect.vue     # 국가 커스텀 멀티셀렉트
    │   │   └── SearchSidebar.vue     # 오른쪽 선택조건 패널
    │   └── send/
    │       ├── MessageEditor.vue     # contenteditable 에디터
    │       ├── FileAttach.vue        # 파일 첨부
    │       ├── TemplateModal.vue     # 템플릿 모달
    │       └── MyFilesModal.vue      # 나의 파일함 모달
    ├── views/
    │   ├── HomeView.vue
    │   ├── ApplyView.vue
    │   ├── ApplyDetailView.vue
    │   ├── ApplyHistoryView.vue
    │   ├── BigbuyerFinderView.vue
    │   ├── BigbuyerHistoryView.vue
    │   └── BigbuyerSendView.vue
    ├── stores/
    │   └── buyerSearch.js
    ├── router/
    │   └── index.js
    ├── App.vue
    └── main.js
```

---

## SFC 기본 구조 템플릿

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 상태
const isOpen = ref(false)
const tableData = ref([])

// 파생 상태
const filteredData = computed(() => tableData.value.filter(/* ... */))

// 메서드
function handleSomeAction() {
  isOpen.value = true  // classList 조작 대신 state 변경
}

// 전역 이벤트 - 반드시 onUnmounted에서 제거
onMounted(() => { window.addEventListener('scroll', handleScroll) })
onUnmounted(() => { window.removeEventListener('scroll', handleScroll) })

function handleScroll() {
  isSticky.value = window.scrollY > 50  // DOM 직접 조작 금지, state만 변경
}
</script>

<template>
  <!-- HTML 구조 그대로 이관 -->
  <!-- 동적 속성만 Vue 문법으로 교체 -->
  <!-- 표시/숨김은 반드시 :class로만 제어 -->
  <!-- 목록 렌더링은 v-for 사용 -->
</template>

<!-- CSS는 인라인 작성 금지 - 반드시 외부 파일 참조 -->
<style src="../assets/styles/home.css" />
```

---

## 실행 절차

1. **대상 HTML 파일 읽기** - `Read`로 원본 HTML 전문 읽기
2. **섹션 분리** - `<style>`, `<body>`, `<script>` 블록 식별
3. **공통 파일 존재 확인** - `Bash`로 `ls` 확인 후 없는 파일만 생성:
   - 공통 CSS (`variables.css`, `global.css`, `layout.css`) 추출·생성
   - `App.vue`, `main.js`, `router/index.js`, `stores/buyerSearch.js` 생성
   - `TheHeader.vue`, `TheFooter.vue`, `LocBar.vue` 생성
4. **페이지 고유 CSS 파일 추출** - `src/assets/styles/{page}.css` 생성 (내용 수정 금지)
5. **페이지별 View 생성**:
   - `<template>`: body 고유 영역 → Vue 문법으로 변환 (`v-for`, `v-model`, `@event`, `:class`)
   - `<script setup>`: JS 로직 → Composition API 변환 (`ref`, `computed`, `onMounted`)
   - `<style src="...">`: 외부 CSS 파일 참조 (인라인 CSS 작성 금지)
6. **하위 컴포넌트 분리** - 독립적으로 동작하거나 템플릿 100줄 이상인 UI 블록
7. **자체 검증 체크리스트** (모두 통과해야 완료 - 이번 회고 반영):
   - [ ] **표시제어**: `v-show` 0건, `style=`/`:style` display 토글 0건 (`grep -rn "v-show\|:style.*display\|style=\"[^\"]*display"`)
   - [ ] **CSS 변수**: 각 페이지 CSS의 모든 `var(--x)`가 `variables.css`에 정의됨 (페이지별 `:root` 누락 점검)
   - [ ] **@media 전수 이관**: 원본 HTML의 모든 `@media` 블록(특히 모바일 배너·브레드크럼·푸터)이 대응 Vue CSS에 셀렉터·속성까지 존재. **공통 블록을 한 페이지만 넣고 다른 페이지에서 누락하지 않았는지** 확인
   - [ ] **레이아웃 폭**: `.wrap`/`.loc-inner` 등이 원본값(`min(1280px, calc(100%-40px))`) 유지, 임의 고정 px 차감 없음 (모바일 음수폭 방지)
   - [ ] **공유 store 형식 일치**: `catCombos`/`keywords`/`selectedCountries`를 push하는 쪽과 읽는 쪽 형식 동일
   - [ ] **sticky 로직**: `offsetTop` 미사용, `getBoundingClientRect().top` 기반. 자식(LocBar)에 sticky 클래스 전달 누락 없음
   - [ ] **라우팅**: 모든 `RouterLink to=` / `router.push` 경로가 router 정의에 존재. loc-bar select 옵션 경로 포함
   - [ ] **빌드 통과**: `npm run build` 성공 (변환 후 반드시 실행)
   - [ ] **CSS byte 보존**: 페이지 CSS가 원본 `<style>` 내용과 동일

---

## 유지보수 가이드라인

- **Composition API + `<script setup>`** (Options API 금지)
- **함수명**: camelCase 동사+명사 (`handleClick`, `toggleModal`, `addKeyword`)
- **상태 변수명**: 원본 JS 변수명 최대한 유지
- **`computed` 우선**: 원본에서 함수로 계산하던 파생값은 `computed`로 전환
- **주석**: 원본 HTML 주석 유지, 비자명한 변환 로직에만 간단히 추가
- **한 파일 최대 400줄**: 초과 시 하위 컴포넌트로 분리
- **`RouterLink`**: `vue-router` 사용 시 전역 등록됨, 별도 import 불필요
