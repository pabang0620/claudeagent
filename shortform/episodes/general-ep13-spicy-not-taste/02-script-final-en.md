# Final timecodes - English (measured, general-ep13-spicy-not-taste)

voice=en-US-AnaNeural, rate=+20%/pitch=+15Hz (s1 only: +30%/+35Hz reaction boost)
Padding: default 0.2s, s1->s2 transition only 0.6s (reaction+hook question -> explanation)

| Seg | Start (s, main content) | Length (s) | Text |
|---|---|---|---|
| s1 | 0.000 | 5.267 | Whoa, that's hot. But wait, is "spicy" even a taste? |
| s2 | 5.267 | 4.200 | Your tongue can only actually pick out five true tastes. |
| s3 | 9.467 | 3.167 | And "spicy" was never one of them. |
| s4 | 12.633 | 6.000 | It's a compound called capsaicin - and it actually triggers the nerves that sense pain and heat. |
| s5 | 18.633 | 6.167 | So when you eat something spicy, your brain gets the exact same signal as touching something hot. |
| s6 | 24.800 | 6.533 | That's also why spicy food makes you sweat and your heart race - same reaction as touching something hot. |
| s7 | 31.333 | 8.000 | It's also why the unit for spiciness isn't a taste scale - it's the Scoville scale, and it measures how intense the irritation is. |
| s8 | 39.333 | 7.200 | And it's why milk beats water when your mouth's on fire. Capsaicin dissolves in fat, not water. |
| s9 | 46.533 | 4.600 | So "spicy" isn't really a taste. It's pain. |

Main content total: 51.133s (1534 frames)
Intro(69f=2.3s) + TitleCard(54f=1.8s) + Main(1534f) + Outro(90f=3.0s) = 1747 frames = 58.233s
(ffprobe measured 58.283s)

Note: EN runs 7.35s longer than KO (58.28s vs 50.99s) - this is expected (English sentences run
longer at the same rate/pitch preset) and is not adjusted to match; per principle 4 the two
languages are timed independently from their own measured narration lengths.

v3 update (2026-08-21): No English timecodes changed. v3 only edited the Korean s5 line
("delae ttaerang" -> "tteugeoun geol manjyeoul ttaerang") and added a static KimchiPiece prop to
the shared S1 scene component (visual only, no narration text or audio change). English text and
audio were untouched, so this file's timecodes (1747 frames = 58.283s, ffprobe-confirmed unchanged
after re-render) remain identical to v2.
