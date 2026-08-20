# Final timecodes - English (measured)

Based on edge-tts WordBoundary measurement (en-US-AnaNeural, rate +20%/pitch +15Hz, s2 reaction
boost rate +30%/pitch +35Hz). Segment length = that segment's speech length + pad (profile
default 0.2s). **Only s1** has no narration (silent action - the character whips its head toward
the wall clock), so it uses the script's specified length (2.0s) with no pad. **Only the s2->s3
transition** gets an extended pad (0.6s) per principle 4 (breathing room after the hook question
"Wait, did that second hand just pause... Why does it do that?") - every other transition uses the
default 0.2s pad.

Intro (2.3s=69f), title card (1.8s=54f), and outro (3.0s=90f) attach before/after the main body
separately; the table below is **main body only (0s = right after the title card)**.

| # | start | end | length | frames | TTS measured speech | pad |
|---|---|---|---|---|---|---|
| s1 | 0.000 | 2.000 | 2.000s | 60f | (silent, scripted) | 0 |
| s2 | 2.000 | 7.433 | 5.433s | 163f | 4.848s | 0.6s(special) |
| s3 | 7.433 | 19.067 | 11.633s | 349f | 11.448s | 0.2s |
| s4 | 19.067 | 28.733 | 9.667s | 290f | 9.480s | 0.2s |
| s5 | 28.733 | 40.367 | 11.633s | 349f | 11.424s | 0.2s |
| s6 | 40.367 | 54.867 | 14.500s | 435f | 14.304s | 0.2s |
| s7 | 54.867 | 61.633 | 6.767s | 203f | 6.552s | 0.2s |
| s8 | 61.633 | 71.167 | 9.533s | 286f | 9.336s | 0.2s |
| s9 | 71.167 | 78.300 | 7.133s | 214f | 6.936s | 0.2s |
| s10 | 78.300 | 87.400 | 9.100s | 273f | 8.904s | 0.2s |
| s11 | 87.400 | 99.733 | 12.333s | 370f | 12.144s | 0.2s |
| s12 | 99.733 | 108.967 | 9.233s | 277f | 9.024s | 0.2s |
| s13 | 108.967 | 121.667 | 12.700s | 381f | 12.504s | 0.2s |

Main body total: 3650 frames = 121.667s. Full mp4 = intro 69f + title card 54f + main body
3650f + outro 90f = **3863f / 30fps = 128.767s** (ffprobe measured: 128.810667s, minor audio
tail-encoding difference - frame count itself matches at 3863).

- The script's (`02-script-v1.md`) rough pre-estimate (~145s including brand segments) came out
  longer than the actual measurement. Per principle 4, scenes were not padded to match the
  estimate - the measured value is used as-is.
- This episode is exempt from the profile's default 60s cap by explicit user instruction, using
  an 180-240s cap instead (same exception as ep06). The measured length (128.8s) is shorter than
  that range, which is simply the natural result of the actual speech length.
- **KO/EN length difference**: EN runs 10.5s longer than KO (128.8s vs 118.3s), driven mostly by
  s3/s5/s6 where the English sentences are longer. Neither language was stretched or sped up to
  match the other - this difference is expected and left as-is per principle 4.
