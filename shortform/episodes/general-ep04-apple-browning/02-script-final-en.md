# Final Script - English (TTS-measured, general-ep04)

voice: en-US-AnaNeural / rate +20% / pitch +15Hz (s2 reaction line only: +30%/+35Hz)
Inter-segment padding: 0.2s (uniform, profile default)

| # | Text | Measured length (s) | Frames incl. pad | Local start frame (main timeline) | Absolute start frame (in mp4) |
|---|---|---|---|---|---|
| s1 | (silent - apple on cutting board → knife cuts it, fixed duration per script) | 2.000 | 60 | 0 | 123 |
| s2 | Whoa, it turned brown. | 2.088 | 69 | 60 | 183 |
| s3 | Inside an apple, the browning enzyme and the stuff it reacts with actually start out separated. | 6.120 | 190 | 129 | 252 |
| s4 | Cut it, and the cell walls break - so they suddenly meet oxygen together. | 4.944 | 154 | 319 | 442 |
| s5 | Squeeze on some lemon juice and it slows down - the tartness gets in the way of that reaction. | 5.784 | 180 | 473 | 596 |
| s6 | A browned apple isn't rotten. It's just reacting to oxygen. | 4.944 | 154 | 653 | 776 |

Main body (s1-s6) total: 807 frames = 26.900s
Full video (intro 69 + title card 54 + main 807 + outro 90): 1020 frames = 34.000s
(ffprobe measured: 1020 frames / 34.048s - the sub-frame second difference is container overhead only; frame count matches exactly)

Well under the 60s cap. Not stretched to fill - this is the raw measured length.

## Length difference vs Korean

EN total (1020 frames / 34.048s) is 21 frames (0.704s) longer than KO (999 frames / 33.344s).
This is normal and was not corrected - s3 and s5 run longer in English (190f/180f vs KO's 180f/167f)
because the English sentences ("the browning enzyme and the stuff it reacts with actually start out
separated", "the tartness gets in the way of that reaction") are wordier than the Korean originals.
s1, s2, s4, s6 are identical or nearly identical in length between languages.
