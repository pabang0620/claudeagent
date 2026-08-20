# Final Timecodes - English (measured, v6 re-render)

Re-rendered against `02-script-v6.md` (title + s4/s5 narration + s5 on-screen motion changes).
Only s4's English line changed text (s5 EN was already unchanged from v5); the re-measured s4
duration (7.320s) came out identical to v5's, so every per-scene number below is unchanged from
v5. Only the final mp4 duration shifted by a fraction of a second (see note below) due to
non-deterministic TTS synthesis on the unchanged segments.

TTS measured (edge-tts WordBoundary, en-US-AnaNeural, rate +20%/pitch +15Hz, s2 reaction-boosted
to rate +30%/pitch +35Hz). Scene length = spoken duration + pad (profile default 0.2s). **s1
only** has no narration (pure static shot) so it uses the script's specified length (2.0s) with
no pad. **s2→s3 transition only** gets an extended 0.6s pad per principle 4 (breathing room after
the hook question "So why is it still this dark out here?") - every other transition uses the
default 0.2s pad.

Intro (2.3s=69f) / TitleCard (1.8s=54f) / Outro (3.0s=90f) are attached separately before/after
the main body. The table below is **main body only** (0 = right after TitleCard).

| # | start | end | length | frames | TTS measured | pad |
|---|---|---|---|---|---|---|
| s1 | 0.000 | 2.000 | 2.000s | 60f | (silent, script-specified) | 0 |
| s2 | 2.000 | 7.533 | 5.533s | 166f | 4.920s | 0.6s(special) |
| s3 | 7.533 | 19.067 | 11.533s | 346f | 11.328s | 0.2s |
| s4 | 19.067 | 26.600 | 7.533s | 226f | 7.320s | 0.2s |
| s5 | 26.600 | 34.800 | 8.200s | 246f | 8.016s | 0.2s |
| s6 | 34.800 | 48.800 | 14.000s | 420f | 13.800s | 0.2s |
| s7 | 48.800 | 54.733 | 5.933s | 178f | 5.736s | 0.2s |
| s8 | 54.733 | 62.500 | 7.767s | 233f | 7.560s | 0.2s |
| s9 | 62.500 | 77.233 | 14.733s | 442f | 14.544s | 0.2s |
| s10 | 77.233 | 84.067 | 6.833s | 205f | 6.648s | 0.2s |
| s11 | 84.067 | 106.700 | 22.633s | 679f | 22.440s | 0.2s |

Main body total: 3201 frames = 106.700s. Full mp4 = Intro 69f + TitleCard 54f + main 3201f +
Outro 90f = 3414f/30fps = **113.856s** (ffprobe measurement; 0.056s longer than v5's 113.800s -
minor TTS re-synthesis variance on unchanged segments, frame count identical).

- EN runs 495 frames (16.5s) longer than KO, mainly because s6 (forest metaphor combined into one
  long sentence) and s9 (two hedge sentences) have more words in English. Neither language's
  timing was padded or trimmed to match the other - per principle 4 this difference is expected
  and left as-is.
- The 60s profile cap does not apply to this episode - a 150-200s range was explicitly approved
  by the user (see `03-critique-r1.md`). The measured length (113.8s) is within that range, and
  no filler was added to reach it.
