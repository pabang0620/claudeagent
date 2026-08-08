#!/usr/bin/env python3
"""구간별 mp3 -> 30fps 프레임 단위 입벌림 값(0~1) 추출 (RMS 방식).

왜 RMS 인가: 립싱크에 필요한 건 "무슨 단어인지"가 아니라 "지금 소리가 얼마나 크게 나는지"다.
whisper 는 단어를 알려주지 입 벌림 정도를 안 준다. RMS 는 그 값을 바로 준다.
52초 오디오 기준 whisper base(3.01초)보다 약 19배 빠르고(0.16초), 추가 설치도 없다
(02_무료도구_실측검증.md 4장 실측).

전 구간을 하나의 정규화 기준으로 맞추기 위해 상위 퍼센타일은 구간별이 아니라
전체 구간을 모아 한 번에 계산한다 (구간마다 입 벌림 최대치가 달라 보이는 것 방지).

입력: tts.py 가 만든 <prefix>_words.json + <prefix>_<id>.mp3
출력: <prefix>_mouth.json
    {"fps":30, "top_db":..., "mouth": {"s1":[0.0,0.21,...], ...}}

사용:
    python scripts/rms_mouth.py --audio episodes/ep02/public/audio --prefix ko

의존: ffmpeg(시스템), numpy
"""
import argparse
import json
import os
import subprocess
import tempfile
import wave

import numpy as np

FPS = 30
NOISE_FLOOR_DB = -45.0
SMOOTH = 3


def db_series(mp3, fps):
    """mp3 -> 프레임별 dB 값. ffmpeg 로 16kHz 모노 PCM 으로 디코드해 직접 계산한다"""
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'tmp.wav')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mp3,
                        '-ac', '1', '-ar', '16000', '-f', 'wav', wav], check=True)
        with wave.open(wav, 'rb') as w:
            sr = w.getframerate()
            raw = w.readframes(w.getnframes())
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    hop = int(round(sr / fps))
    nframes = int(np.ceil(len(x) / hop))
    x = np.pad(x, (0, nframes * hop - len(x)))
    rms = np.sqrt((x.reshape(nframes, hop) ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-12)


def main():
    p = argparse.ArgumentParser(description='RMS 기반 프레임별 입벌림 추출')
    p.add_argument('--audio', required=True, help='mp3 와 <prefix>_words.json 이 있는 디렉토리')
    p.add_argument('--prefix', default='ko')
    p.add_argument('--fps', type=int, default=FPS)
    p.add_argument('--floor', type=float, default=NOISE_FLOOR_DB, help='노이즈 플로어(dB)')
    p.add_argument('--smooth', type=int, default=SMOOTH, help='이동평균 프레임 수 (턱 떨림 방지)')
    args = p.parse_args()

    words_path = os.path.join(args.audio, f'{args.prefix}_words.json')
    with open(words_path, encoding='utf-8') as f:
        meta = json.load(f)
    ids = [s['id'] for s in meta['segments']]

    dbs = {sid: db_series(os.path.join(args.audio, f'{args.prefix}_{sid}.mp3'), args.fps)
           for sid in ids}
    top = float(np.percentile(np.concatenate(list(dbs.values())), 95))

    out = {}
    for sid in ids:
        v = np.clip((dbs[sid] - args.floor) / max(top - args.floor, 1e-6), 0.0, 1.0)
        if args.smooth > 1:
            v = np.convolve(v, np.ones(args.smooth) / args.smooth, mode='same')
        out[sid] = [round(float(x), 3) for x in v]
        print(f'{sid}: {len(v)} frames  mean={v.mean():.3f} max={v.max():.3f}')

    dest = os.path.join(args.audio, f'{args.prefix}_mouth.json')
    with open(dest, 'w') as f:
        json.dump({'fps': args.fps, 'top_db': round(top, 2), 'mouth': out}, f)
    print(f'saved {dest}')


if __name__ == '__main__':
    main()
