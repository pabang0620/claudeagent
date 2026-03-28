---
name: project-structure-guide
description: "Enforces WeCom project folder structure and naming conventions. Applies automatically when creating new files, folders, or moving code between directories. Ensures backend domain-driven structure and frontend 3-layer separation."
user-invocable: false
---

# WeCom Project Structure Conventions

When creating, moving, or renaming files and folders in the WeCom project, enforce the following structure and naming conventions.

---

## Backend Structure

### Principles
- Focus DB connections only -- business logic belongs in service, queries only in repository.
- Use domain-driven folder separation. Direct imports between domains are prohibited.
- Enforce the layer chain strictly: `routes -> controller -> service -> repository -> DB`.

### Folder Structure
```
backend/
├── src/
│   ├── domains/
│   │   ├── auth/            # signup, login, refresh, phone verification, password reset
│   │   ├── user/            # my profile, public profile, account deletion
│   │   ├── webtoon/         # webtoon CRUD + episodeRoutes/Controller/Service/Repository
│   │   ├── community/       # comment / like / rating -- 4 files each
│   │   ├── job/             # job posting CRUD, company list/detail, skills
│   │   ├── conversation/    # offer+job_application unified (conversation_type ENUM)
│   │   ├── event/           # event list/detail, participation, results
│   │   ├── admin/           # auth, users, notices, banners, master, events
│   │   ├── common/          # upload, search, notifications, nav
│   │   └── settlement/      # Phase 3 placeholder
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── optionalAuthMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── uploadMiddleware.js
│   ├── config/
│   │   ├── database.js      # mysql2 pool
│   │   ├── env.js
│   │   ├── cors.js
│   │   └── s3.js
│   ├── utils/
│   │   ├── response.js      # successResponse / paginatedResponse / errorResponse
│   │   ├── pagination.js    # getPagination / buildMeta
│   │   ├── jwt.js
│   │   ├── hash.js          # bcrypt
│   │   └── uuid.js
│   ├── routes/
│   │   └── index.js         # unified router for all domains
│   └── app.js
└── server.js
```

### Backend File Naming -- dots (.) are strictly prohibited
```
{Domain}{Layer}.js  <- camelCase concatenation, no dots

authRoutes.js / authController.js / authService.js / authRepository.js
adminNoticeRoutes.js / adminNoticeService.js / adminBannerRepository.js
auth.routes.js / admin.notice.service.js / admin-banner-repository.js   <-- FORBIDDEN
```

### common Domain (Shared APIs)
| Endpoint | File | Purpose |
|----------|------|---------|
| `POST /api/uploads` | uploadRoutes.js | S3 file upload |
| `GET /api/search` | searchRoutes.js | Unified search (webtoon, author, company) |
| `GET /api/notifications` | notificationRoutes.js | My notifications list |
| `PATCH /api/notifications/:uuid/read` | notificationRoutes.js | Mark notification read |
| `PATCH /api/notifications/read-all` | notificationRoutes.js | Mark all read |
| `GET /api/nav` | navRoutes.js | Return nav.json file |

### admin Domain Structure
```
admin/
├── adminAuthRoutes.js + Controller + Service
├── adminUserRoutes.js + Controller + Service + Repository
├── adminNoticeRoutes.js + Controller + Service + Repository
├── adminBannerRoutes.js + Controller + Service + Repository
├── adminMasterRoutes.js + Controller + Service + Repository  (genres/universities/skills)
└── adminEventRoutes.js + Controller + Service + Repository
```

---

## Frontend Structure

### Principles
- Enforce 3-layer separation: View (Page) / Hook / API. Never mix roles across files.
- File name prefixes must match -- all 3 files for the same page share the same prefix.
- Page.jsx handles rendering only. No state, logic, or fetch calls directly in pages.

### Folder Structure
```
frontend/src/
├── pages/
│   ├── home/            # HomePage + useHome + homeApi
│   ├── auth/            # Login, Register(2-step), FindPassword
│   ├── webtoon/         # WebtoonDetail, EpisodeViewer, WebtoonNew, WebtoonPopular
│   ├── university/      # UniversityWebtoon
│   ├── genre/           # GenreWebtoon
│   ├── job/             # CompanyList, CompanyDetail, JobPostList, JobPostDetail + jobApi
│   ├── event/           # EventList, EventDetail, EventIntro, EventExhibition + eventApi
│   ├── mypage/          # Profile, MyWebtoon, MyEpisode, CompanyInfo,
│   │                    # ConversationList, ConversationDetail, Notification + mypageApi
│   ├── search/          # SearchPage + searchApi
│   ├── admin/           # Dashboard, Users, Notices, Banners, Master, Events + adminApi
│   └── notFound/
├── components/
│   ├── common/          # Header, Footer, LoadingSpinner, Modal, Pagination, ProtectedRoute
│   └── webtoon/         # WebtoonCard, WebtoonGrid, EpisodeList
├── layouts/
│   ├── MainLayout.jsx   # Normal pages (Header + Footer)
│   ├── AuthLayout.jsx   # Login/Register
│   └── AdminLayout.jsx  # /admin/* (slate-800 sidebar)
├── hooks/               # Global shared hooks
│   ├── useAuth.js
│   ├── useDebounce.js
│   └── usePagination.js
├── store/
│   ├── authStore.js     # zustand: user, isAuthenticated, initAuth
│   └── navStore.js
├── config/
│   └── apiClient.js     # axios + JWT interceptor + 401 auto refresh
├── constants/
│   ├── routes.js        # ROUTES constant object
│   └── enums.js
└── routes/
    └── AppRoutes.jsx    # lazy loading + Suspense + ProtectedRoute
```

### 3-Layer Role Definitions

#### XxxxxPage.jsx (View)
```jsx
// Rendering only -- no state, logic, or fetch
export default function WebtoonDetailPage() {
  const { webtoon, isLoading, handleLike } = useWebtoonDetail()
  if (isLoading) return <LoadingSpinner />
  return <div>...</div>
}
```

#### useXxxxx.js (Hook)
```js
// State management, event handlers, API call composition
export function useWebtoonDetail() {
  const [webtoon, setWebtoon] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    fetchWebtoonDetail(id).then(setWebtoon).finally(() => setIsLoading(false))
  }, [id])
  return { webtoon, isLoading }
}
```

#### xxxxxApi.js (API)
```js
// axios calls only -- no state
export async function fetchWebtoonDetail(uuid) {
  const { data } = await apiClient.get(`/webtoons/${uuid}`)
  return data.data
}
```

---

## Naming Rules

| Target | Convention | Example |
|--------|-----------|---------|
| React component | PascalCase | `WebtoonCard`, `EpisodeList` |
| Page file | `XxxxxPage.jsx` | `WebtoonDetailPage.jsx` |
| Hook file | `useXxxxx.js` | `useWebtoonDetail.js` |
| API file | `xxxxxApi.js` | `webtoonDetailApi.js` |
| Function/variable | camelCase | `fetchWebtoon`, `isLoading` |
| Constant | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| Backend file | `{Domain}{Layer}.js` (no dots) | `webtoonService.js` |
| CSS module | `XxxxxPage.module.css` | `WebtoonDetailPage.module.css` |

---

## File Size Guidelines

- All files: 400 lines maximum (split immediately if exceeded).
- Function level: 50 lines maximum recommended.
- When Service/Repository exceeds 400 lines, split into domain subfolders.

---

## Review Checklist

When creating new files or folders, verify:
- [ ] Page 3-file set (Page/use/Api) shares the same prefix
- [ ] Page.jsx contains no direct fetch or state
- [ ] APIs used across multiple domains live in common/
- [ ] Backend filenames contain no dots (`.`) -- `webtoonService.js` not `webtoon.service.js`
- [ ] Admin master data APIs live in admin/ or common/
- [ ] File is 400 lines or fewer (split if exceeded)
