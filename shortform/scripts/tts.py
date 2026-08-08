#!/usr/bin/env python3
"""내레이션 음성 + 어절 타임스탬프 생성 (edge-tts).

핵심: edge-tts 는 우리가 넣은 문장을 자기가 읽었으므로 "어느 어절을 언제 발음했는지"를
정답값으로 알려준다(WordBoundary). 이 값을 쓰면 자막 싱크 오차가 0 이다.
whisper 로 되추정하면 30fps 기준 2~4프레임 어긋난다 (02_무료도구_실측검증.md 3장).
WordBoundary 는 CLI 로는 못 쓰고 Python API 에서만 접근된다.

입력: 구간 목록 JSON
    [
      {"id": "s1", "text": "기린 목, 엄청 길지?"},
      {"id": "s2", "text": "..."}
    ]
  또는 {"segments": [...], "voice": "...", "rate": "...", "pitch": "..."} 형태도 받는다.

출력:
    <out>/<prefix>_<id>.mp3     구간별 음성
    <out>/<prefix>_words.json   구간별 어절 타임스탬프 + ffprobe 실측 길이

사용:
    python scripts/tts.py --script episodes/ep02/script.json --out episodes/ep02/public/audio
    python scripts/tts.py --script s.json --out audio --voice en-US-AnaNeural --pitch "+15Hz" --prefix en

실행 환경: PEP 668 때문에 시스템 파이썬에 바로 설치가 막힌다. venv 를 쓸 것.
    python3 -m venv --without-pip .venv
    curl -sSL https://bootstrap.pypa.io/get-pip.py | .venv/bin/python
    .venv/bin/pip install edge-tts numpy
"""
import argparse
import asyncio
import json
import os
import subprocess
import sys

import edge_tts

# 02_무료도구_실측검증.md 2-4 실측 추천 프리셋
PRESETS = {
    'ko': {'voice': 'ko-KR-SunHiNeural', 'rate': '+20%', 'pitch': '+30Hz'},
    'en': {'voice': 'en-US-AnaNeural', 'rate': '+20%', 'pitch': '+15Hz'},
}


def probe(path):
    r = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=nw=1:nk=1', path],
        capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def load_segments(path):
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    if isinstance(data, dict):
        return data.get('segments', []), data
    return data, {}


async def one(sid, text, out_dir, prefix, voice, rate, pitch):
    path = os.path.join(out_dir, f'{prefix}_{sid}.mp3')
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary='WordBoundary')
    words = []
    with open(path, 'wb') as f:
        async for chunk in comm.stream():
            if chunk['type'] == 'audio':
                f.write(chunk['data'])
            elif chunk['type'] == 'WordBoundary':
                words.append({
                    'w': chunk['text'],
                    # offset/duration 은 100나노초 틱 단위다
                    's': round(chunk['offset'] / 1e7, 3),
                    'e': round((chunk['offset'] + chunk['duration']) / 1e7, 3),
                })
    dur = probe(path)
    print(f'{sid}: {dur:.3f}s / {len(words)} words', flush=True)
    return {'id': sid, 'text': text, 'duration': round(dur, 3), 'words': words}


async def run(args):
    segments, meta = load_segments(args.script)
    if not segments:
        raise SystemExit(f'구간이 비어 있다: {args.script}')

    preset = PRESETS.get(args.lang, PRESETS['ko'])
    voice = args.voice or meta.get('voice') or preset['voice']
    rate = args.rate or meta.get('rate') or preset['rate']
    pitch = args.pitch or meta.get('pitch') or preset['pitch']

    os.makedirs(args.out, exist_ok=True)
    out = []
    for seg in segments:
        sid, text = seg['id'], seg['text']
        for attempt in range(3):
            try:
                out.append(await one(sid, text, args.out, args.prefix, voice, rate, pitch))
                break
            except Exception as exc:  # 네트워크 일시 실패 재시도
                print(f'  retry {sid} ({attempt + 1}): {exc}', file=sys.stderr, flush=True)
                await asyncio.sleep(2)
        else:
            raise SystemExit(f'TTS 실패: {sid}')

    words_path = os.path.join(args.out, f'{args.prefix}_words.json')
    with open(words_path, 'w', encoding='utf-8') as f:
        json.dump({'voice': voice, 'rate': rate, 'pitch': pitch, 'segments': out},
                  f, ensure_ascii=False, indent=1)
    total = round(sum(s['duration'] for s in out), 3)
    print(f'saved {words_path}  total {total}s')


def main():
    p = argparse.ArgumentParser(description='edge-tts 내레이션 + 어절 타임스탬프')
    p.add_argument('--script', required=True, help='구간 목록 JSON 경로')
    p.add_argument('--out', required=True, help='출력 디렉토리 (보통 <episode>/public/audio)')
    p.add_argument('--lang', default='ko', choices=sorted(PRESETS), help='프리셋 언어')
    p.add_argument('--prefix', default=None, help='파일 접두사 (기본 = lang)')
    p.add_argument('--voice', default=None)
    p.add_argument('--rate', default=None)
    p.add_argument('--pitch', default=None)
    args = p.parse_args()
    if args.prefix is None:
        args.prefix = args.lang
    asyncio.run(run(args))


if __name__ == '__main__':
    main()
