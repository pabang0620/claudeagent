#!/bin/bash
# 사용: download_video.sh <출력폴더> <파일이름(확장자 제외)> <fal.media URL>
# 다운로드 + 길이/해상도 + 루프 이음매(첫프레임-끝프레임 차이) 검증까지 한 번에.
set -e
OUT_DIR="$1"; NAME="$2"; URL="$3"
SCRATCH="${SCRATCH:-/tmp}"
F="$OUT_DIR/$NAME.mp4"
[ -d "$OUT_DIR" ] || { echo "폴더 없음: $OUT_DIR"; exit 1; }
[ -e "$F" ] && { echo "이미 있음: $F"; exit 1; }
curl -sL -o "$F" "$URL" || { echo "다운로드 실패"; exit 1; }
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
wh=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$F")
ffmpeg -v error -y -ss 0 -i "$F" -frames:v 1 "$SCRATCH/g0.png"
ffmpeg -v error -y -sseof -0.1 -i "$F" -frames:v 1 "$SCRATCH/g1.png"
seam=$(python3 -c "
from PIL import Image, ImageChops, ImageStat
a=Image.open('$SCRATCH/g0.png').convert('RGB'); b=Image.open('$SCRATCH/g1.png').convert('RGB')
print(round(sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3,1))")
printf "%-30s %5.1f초 %s  처음-끝 차이 %s  %sMB\n" "$NAME" "$dur" "$wh" "$seam" "$(( $(stat -c %s "$F") / 1048576 ))"
