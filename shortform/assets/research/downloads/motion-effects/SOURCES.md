# Motion Effects SVG Assets - Sources & Licenses

Downloaded for the "퍼둥이" character motion expression (running/waving/basic actions) in the shortform pipeline. All files below were verified for license text directly on the source page before download (no assumptions).

Date checked/downloaded: 2026-08-11 (일부 파일은 이전 세션에서 2026-08-10에 다운로드, 같은 세션 이어서 검증)

---

## 1. game-icons.net (author: Lorc, via game-icons.net)

License: **CC BY 3.0** (Creative Commons Attribution 3.0) — commercial use allowed, attribution required.
License URL: http://creativecommons.org/licenses/by/3.0/
Site: https://game-icons.net

| File | Source page | Description |
|---|---|---|
| `gameicons-dust-cloud.svg` | https://game-icons.net/1x1/lorc/dust-cloud.html | Particle dust cloud icon - good for running dust puff under 퍼둥이's feet |
| `gameicons-impact-point.svg` | https://game-icons.net/1x1/lorc/impact-point.html | Radial impact burst - good for landing/stomp/hit accent |
| `gameicons-sprint.svg` | https://game-icons.net/1x1/lorc/sprint.html | Human figure in a running pose (reference silhouette, not a line effect) |
| `gameicons-whirlwind.svg` | https://game-icons.net/1x1/lorc/whirlwind.html | Swirling vortex - good for spin/whoosh motion |

Attribution required when shipped: "Icons by Lorc (game-icons.net), CC BY 3.0" - add this credit line wherever the final video/asset credits are compiled.

Download method: direct SVG endpoint `https://game-icons.net/icons/000000/transparent/1x1/lorc/{icon}.svg` (black icon on transparent background variant).

---

## 2. openclipart.org (Public Domain / CC0)

License: **Public Domain** (CC0 1.0, confirmed via "Public Domain" label shown directly on each detail page). No attribution required, but author name kept below for traceability.
Site: https://openclipart.org

| File | Source page | Author (if listed) | Description |
|---|---|---|---|
| `openclipart-swirl-motion-lines.svg` | https://openclipart.org/detail/330106/swirl-motion-lines | not listed in metadata | Clean 2-path swirl/motion-line graphic |
| `openclipart-trailing-lines.svg` | https://openclipart.org/detail/243581/trailing-lines | Lazur URH | Motion trail streaks - **caution: built from SVG filters (feGaussianBlur + feTurbulence), not plain paths, see integration notes below** |
| `openclipart-simple-dust-cloud.svg` | https://openclipart.org/detail/177836/simple-dust-cloud | not listed in metadata | Cartoon dust cloud, 13 clean paths, viewBox 0 0 48 48. Identical file is also mirrored on freesvg.org ("cartoon-dust-cloud") - kept the openclipart copy only, duplicate removed |
| `openclipart-comic-burst-explosion-abstract-005.svg` | https://openclipart.org/detail/170774/comic-burst-explosion-abstract-005 | not listed in metadata | Comic-style star/burst outline (1 polygon), viewBox 0 0 377 225 - good for impact/pop accent |

---

## 3. freesvg.org (Public Domain / CC0, mirrors openclipart content)

License: site-wide "Creative Commons 0 license (public domain)", confirmed on page.
Site: https://freesvg.org

| File | Source page | Description |
|---|---|---|
| `freesvg-whoosh.svg` | https://freesvg.org/1544401255 (original: openclipart.org, artist Arvin61r58) | **Not a line-effect asset** - it is literal "Whoosh" word-art typography (176KB, complex traced text paths). Kept because license was verified, but low practical use for 퍼둥이 motion lines. See recommendation below. |

Note: `freesvg.org` requires a `Referer` header pointing at the detail page to serve the actual file (bare GET to `/download/{id}` returns an empty body) - not a licensing issue, just a server quirk.

---

## Not downloaded (license unclear or source blocked)

- **svgrepo.com** ("speed", "speed-lines", "fast-forward" search results) - site aggregates icons from many different collections with per-icon licensing that varies, and the site returned HTTP 429 (rate limited) on repeated attempts during this session. Did not download anything from here because I could not confirm the license of any specific candidate icon page.
- **publicdomainvectors.org** ("Dynamic lines in motion", "Lines in motion", "Burst of lines") - license itself confirmed as Public Domain on the page, but the actual downloadable file behind each page is a `.zip` bundle containing `.ai`/`.eps` vector files, not SVG, despite the "vector" branding. No SVG/EPS-to-SVG conversion tool was available in this environment (no inkscape/imagemagick/potrace), so these were not usable for the stated goal (direct SVG integration) and were discarded.
- **Vecteezy, Freepik, Flaticon, IconScout, Noun Project (default tier), Etsy bundles** - all returned in search results but require attribution-locked "free" tiers, paid upgrades, or account sign-in to download at usable resolution/format. Excluded per instruction to only take CC0/MIT/explicit-commercial licenses confirmed directly on the page.
- Generic "speed lines radiating behind a running character" (the single most literally-matching asset type for the brief) was not found under a clean CC0/MIT license anywhere in this search. The closest confirmed-free substitutes are `openclipart-swirl-motion-lines.svg` (swirl/whoosh curve) and `openclipart-trailing-lines.svg` (filter-based streaks, see caution above).

---

## SVG structure check (pipeline integration readiness)

All files opened and inspected for `<path>` vs `<image>`/raster embeds/complex `<filter>` per the request.

| File | viewBox | paths/shapes | `<image>`/base64 | `<filter>` | Verdict |
|---|---|---|---|---|---|
| gameicons-dust-cloud.svg | 0 0 512 512 | 1 path | none | none | Clean, single `d` path - directly usable as a React `<path>` |
| gameicons-impact-point.svg | 0 0 512 512 | 1 path | none | none | Clean, directly usable |
| gameicons-sprint.svg | 0 0 512 512 | 1 path | none | none | Clean, directly usable (but it's a running-person silhouette, not a line effect) |
| gameicons-whirlwind.svg | 0 0 512 512 | 1 path | none | none | Clean, directly usable |
| openclipart-swirl-motion-lines.svg | 0 0 800 800 | 2 paths | none | none | Clean, directly usable |
| openclipart-simple-dust-cloud.svg | 0 0 48 48 | 13 paths | none | none | Clean, directly usable |
| openclipart-comic-burst-explosion-abstract-005.svg | 0 0 377 225 | 1 polygon | none | none | Clean, directly usable |
| openclipart-trailing-lines.svg | ~600x600 | 3 paths | none | **2 filters** (feGaussianBlur + feTurbulence) | **Not simple path art.** The visible streak look is generated at render-time by an SVG filter (procedural blur/turbulence), not by the path geometry itself. Needs either: (a) keep as a static rasterized reference and re-draw as clean paths, or (b) render as-is only if the target renderer (browser/Remotion via Chromium) supports SVG filter primitives - Remotion's headless Chromium does support `feGaussianBlur`/`feTurbulence`, so it CAN be dropped in as-is, but it won't behave like a simple stroke you can recolor/scale as freely as a path. Flagging for a judgment call before use. |
| freesvg-whoosh.svg | ~214x62 | 67 paths | none | 1 filter | Structurally fine (no raster), but content-wise is decorative text typography, not a motion-line shape - low relevance to the character-motion use case. |
