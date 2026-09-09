# Final Timecode - English (general-ep17-ice-floats)

Based on measured edge-tts WordBoundary durations + profile default pad (0.2s), s2->s3 transition uses 0.6s. Under the 60s cap.

| Segment | Local timecode (main only) | Frames | Basis |
|---|---|---:|---|
| s1 (silent) | 0.00s - 2.20s | 66f | fixed 2.2s (original 2.0s + drop/settle animation headroom) |
| s2 (reaction) | 2.20s - 7.73s | 166f | measured 4.920s + pad 0.6s |
| s3 | 7.73s - 15.00s | 218f | measured 7.080s + pad 0.2s |
| s4 | 15.00s - 19.00s | 120f | measured 3.792s + pad 0.2s |
| s5 | 19.00s - 26.73s | 232f | measured 7.536s + pad 0.2s |
| s6 | 26.73s - 32.47s | 172f | measured 5.520s + pad 0.2s |
| s7 | 32.47s - 43.77s | 339f | measured 11.088s + pad 0.2s |
| s8 | 43.77s - 53.90s | 304f | measured 9.936s + pad 0.2s |

Main (s1-s8) total: 1617f = 53.90s
Full video (Intro 69f + TitleCard 54f + main 1617f + Outro 90f) = 1830f = 61.056s (30fps)

TTS: voice=en-US-AnaNeural, rate/pitch profile default (+20%/+15Hz), s2 only uses reaction tone (+30%/+35Hz).
