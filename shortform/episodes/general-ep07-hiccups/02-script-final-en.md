# Confirmed Timecodes - English (measured)

TTS measured (`scripts/tts.py`, voice=en-US-AnaNeural) + `assets/timeline.ts` `sceneFrames`/`sceneStarts`.
30fps. Pad is profile default 0.2s, except s2->s3 transition (0.6s, principle 4).

| Segment | Speech length(s) | pad(s) | Frames | Local start frame (main) | Start time in video |
|---|---|---|---|---|---|
| s1(silent, impact) | 2.000(script-fixed) | 0 | 60 | 0 | 0:04.100 (after intro+title card) |
| s2(reaction+hook) | 3.792 | 0.6 | 132 | 60 | 0:06.100 |
| s3(diaphragm spasm) | 7.176 | 0.2 | 221 | 192 | 0:10.500 |
| s4(throat closes) | 7.344 | 0.2 | 226 | 413 | 0:17.867 |
| s5(68-year record) | 6.816 | 0.2 | 210 | 639 | 0:25.633 |
| s6(hold-breath myth) | 8.064 | 0.2 | 248 | 849 | 0:32.300 |

- Main (s1-s6) total: 1097 frames (36.567s)
- Intro 69 frames(2.300s) + Title card 54 frames(1.800s) + Main 1097 frames + Outro 90 frames(3.000s)
  = 1310 frames total (43.667s)
- Reaction segment (s2) TTS: rate +30% / pitch +35Hz (clearly above profile default +20%/+15Hz, principle 1)
- Explanation segments (s3-s6) TTS: profile default rate +20% / pitch +15Hz

## Language length difference
EN is 3 frames (0.100s) longer than KO (1310 vs 1307). Not adjusted - measured length kept as-is (principle 4:
do not stretch/compress either language to match the other).
