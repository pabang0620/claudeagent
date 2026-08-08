/** 음성 타임스탬프 -> 화면 타이밍 변환. 에피소드 내용과 무관한 순수 계산만 둔다.
 *
 *  전제 (02_무료도구_실측검증.md 결론)
 *   - 자막 타이밍은 edge-tts 의 WordBoundary 값을 쓴다. 우리가 만든 음성이라 이게 정답값이고
 *     whisper 로 되추정하면 오차만 늘어난다.
 *   - 립싱크는 RMS 기반 프레임별 0~1 배열을 쓴다.
 *
 *  scripts/tts.py -> words.json, scripts/rms_mouth.py -> mouth.json 이 이 파일의 입력이다.
 */
import { FPS } from './theme';

/** 어절 하나의 시작·끝 (초) */
export interface WordTs { w: string; s: number; e: number }

/** 구간(문장) 하나 = 음성 파일 하나 */
export interface SegmentData {
  id: string;
  text: string;
  /** ffprobe 실측 길이(초) */
  duration: number;
  words: WordTs[];
}

export interface WordsFile { voice?: string; segments: SegmentData[] }
export interface MouthFile { fps: number; mouth: Record<string, number[]> }

/** 구간 길이(초)를 프레임으로. 연출용 여백을 pad 초만큼 더한다 */
export function sceneFrames(segments: SegmentData[], padSec: number | number[] = 0.5) {
  return segments.map((s, i) => {
    const pad = Array.isArray(padSec) ? (padSec[i] ?? 0) : padSec;
    return Math.round((s.duration + pad) * FPS);
  });
}

/** 각 구간의 시작 프레임 (누적합) */
export function sceneStarts(frames: number[]) {
  const out: number[] = [];
  frames.reduce((acc, f, i) => {
    out.push(i === 0 ? 0 : acc);
    return (i === 0 ? 0 : acc) + f;
  }, 0);
  return out;
}

export function totalFrames(frames: number[]) {
  return frames.reduce((a, b) => a + b, 0);
}

/** 구간 안에서 wordIndex 번째 어절이 시작하는 시각(초) */
export function wordTime(segments: SegmentData[], sceneIndex: number, wordIndex: number) {
  return segments[sceneIndex]?.words[wordIndex]?.s ?? 0;
}

/** 구간 안 어절 시작 시각을 구간 로컬 프레임으로.
 *  "이 단어를 말할 때 이 그래픽이 뜬다"를 손으로 맞추지 않기 위한 것이다. */
export function wordFrame(segments: SegmentData[], sceneIndex: number, wordIndex: number) {
  return Math.round(wordTime(segments, sceneIndex, wordIndex) * FPS);
}

/** 특정 구간의 어절 인덱스를 프레임으로 바꾸는 함수를 만들어 준다 (씬 컴포넌트에서 쓰기 편하게) */
export function makeWordFrame(segments: SegmentData[], sceneIndex: number) {
  return (wordIndex: number) => wordFrame(segments, sceneIndex, wordIndex);
}

/** 프레임 단위 입벌림 값 (구간 로컬 프레임) */
export function mouthAt(mouth: MouthFile['mouth'], segmentId: string, localFrame: number) {
  const arr = mouth[segmentId];
  if (!arr || localFrame < 0 || localFrame >= arr.length) return 0;
  return arr[localFrame];
}

/** 입벌림 0~1 을 캐릭터 mouthOpen 으로.
 *  완전히 다물면 표정이 죽어 보여서 하한을 준다. */
export function mouthProp(v: number, floor = 0.06, gain = 1.12) {
  return floor + (0.94 - floor) * Math.min(1, v * gain);
}

/** 화면에 한 번에 띄우는 자막 한 줄 */
export interface CaptionLine { words: WordTs[]; start: number; end: number }

/** 어절 타임스탬프 + "한 줄에 넣을 어절 개수" 규칙 -> 자막 줄 목록 (구간별).
 *
 *  lineSpec[segmentId] = [4, 6] 이면 첫 줄에 어절 4개, 둘째 줄에 6개를 넣는다.
 *  합계가 어절 수와 다르면 남는 어절은 마지막 줄에 붙는다.
 *
 *  표시 구간은 이어 붙인다: 이전 줄은 다음 줄이 시작되기 직전까지 화면에 남는다
 *  (줄과 줄 사이가 비면 자막이 깜빡이는 것으로 보인다).
 */
export function buildCaptions(
  segments: SegmentData[],
  lineSpec: Record<string, number[]>,
  opts: { leadIn?: number; tailOut?: number } = {}
): CaptionLine[][] {
  const leadIn = opts.leadIn ?? 0.25;
  const tailOut = opts.tailOut ?? 0.6;
  return segments.map((seg) => {
    const counts = lineSpec[seg.id] ?? [seg.words.length];
    const lines: CaptionLine[] = [];
    let i = 0;
    for (let c = 0; c < counts.length; c++) {
      const isLast = c === counts.length - 1;
      const take = isLast ? Math.max(counts[c], seg.words.length - i) : counts[c];
      const ws = seg.words.slice(i, i + take);
      i += take;
      if (ws.length === 0) continue;
      lines.push({ words: ws, start: ws[0].s, end: ws[ws.length - 1].e });
    }
    return lines.map((ln, idx) => ({
      ...ln,
      start: Math.max(0, idx === 0 ? ln.start - leadIn : lines[idx - 1].end),
      end: idx === lines.length - 1 ? ln.end + tailOut : lines[idx + 1].start - 0.05,
    }));
  });
}

/** 현재 프레임이 몇 번째 구간인지 + 구간 로컬 시각(초) */
export function locate(starts: number[], frame: number) {
  let index = 0;
  for (let i = 0; i < starts.length; i++) if (frame >= starts[i]) index = i;
  const localFrame = frame - starts[index];
  return { index, localFrame, localSec: localFrame / FPS };
}
