# Final timecodes - English (general-ep19-dog-nose-slit, v3)

Based on TTS measurement (`public/audio/en_words.json`). Default gap 0.2s between segments,
0.6s only for the s2->s3 transition (breathing room after the reaction+hook question,
principle 4-5). Main content starts after Intro (69 frames = 2.3s) + TitleCard (54 frames = 1.8s).

**v3 change**: s1 replaced (silent nose close-up -> voiced dog entrance, "Here, boy!"), s2 text
revised. s3-s8 narration and timing are unchanged from v2.

| Segment | Start | End | Length | Narration |
|---|---|---|---|---|
| s1 | 4.10s | 6.07s | 1.97s | Here, boy! |
| s2 | 6.07s | 11.47s | 5.40s | Huh, there's something weird by its nostril. Wait, what is that? |
| s3 | 11.47s | 17.03s | 5.57s | Turns out that's not just a crack - it's a dedicated exit, just for breathing out. |
| s4 | 17.03s | 24.63s | 7.60s | When it exhales, the air slips out sideways through that slit - so the fresh scent coming in up front stays undisturbed. |
| s5 | 24.63s | 30.50s | 5.87s | So unlike us, a dog never actually stops smelling - not even while breathing out. |
| s6 | 30.50s | 37.60s | 7.10s | Thanks to that, dogs can take quick little sniffs, one after another, without ever losing track of a scent. |
| s7 | 37.60s | 44.80s | 7.20s | Scientists have actually caught that exhaled air escaping sideways on camera, using special imaging techniques. |
| s8 | 44.80s | 49.67s | 4.87s | And they say a dog's nose stays wet to trap even more scent particles. |

Main content total (s1-s8): 45.57s (1367 frames)
Grand total (Intro+TitleCard+main+Outro): 1580 frames = 52.67s

Reaction tone: s2 synthesized separately at rate=+30%/pitch=+35Hz (higher than the profile default
+20%/+15Hz), matching the ep18 baseline (principle 1). s1 ("Here, boy!") used the profile default
with no override - it's a plain call, not a reaction+hook line.

Change from v2: 52.73s -> 52.67s (-0.06s), essentially unchanged (silent 2.00s s1 became a
voiced 1.97s s1, and s2's wording length was very close to before).

Length difference from KO: EN total (52.67s) is 4.90s longer than KO (47.77s), mainly from s4/s6/s7
having noticeably more words in English. This is expected (principle 4) and was not corrected by
speeding up or trimming either language.
