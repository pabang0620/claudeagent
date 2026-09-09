# Confirmed Timecode - English (measured)

From TTS measurement (`public/audio/en_words.json`) + `assets/timeline.ts` `sceneFrames`/`sceneStarts`.
Default profile pad 0.2s, except s2->s3 transition at 0.6s (breathing room after the hook question, principle 4-5).
Main scenes total 53.83s. Intro(69F/2.3s) + TitleCard(54F/1.8s) + main + Outro(90F/3.0s) = 1828 frames total (60.93s).

| Segment | Local timecode | Frames | Measured narration length | Content |
|---|---|---|---|---|
| s1 | 0.00 - 2.00s | 60 | (silent, fixed 2.0s) | Rinsing with water alone doesn't remove oil |
| s2 | 2.00 - 7.87s | 176 | 5.280s | Reaction "why won't it go?" |
| s3 | 7.87 - 13.90s | 181 | 5.832s | Water and oil never mix |
| s4 | 13.90 - 20.63s | 202 | 6.528s | Surfactants wrap the oil |
| s5 | 20.63 - 30.43s | 294 | 9.600s | Becomes a micelle, rinses away |
| s6 | 30.43 - 39.13s | 261 | 8.496s | 20 seconds of handwashing |
| s7 | 39.13 - 46.33s | 216 | 7.008s | Soap bursts coronavirus's fatty layer |
| s8 | 46.33 - 53.83s | 225 | 7.296s | History of soap |

Reaction (s2) TTS tone: `rate +30%`, `pitch +35Hz` (clearly higher than profile default +20%/+15Hz, principle 1).

Note: total length differs from Korean (53.83s vs 51.93s main scenes) - this is expected and was not
forced to match (principle 4 - do not equalize cross-language lengths).
