#!/usr/bin/env node
/** 렌더 큐 (100~150화 대량 배치용, 2026-09-27 신설).
 *
 *  빌더 에이전트가 코드 작성까지만 끝내고(TTS, 씬, precheck, 스틸 선점검) 렌더는 걸지 않은
 *  "준비 완료" 에피소드들을, 이 스크립트가 CPU 여유에 맞춰 순서대로 렌더 + 검증 + shorts/ 배포까지
 *  대신 처리한다. 에이전트를 렌더 끝날 때까지 붙잡아두지 않기 위한 분리다(원칙: 준비는 에이전트,
 *  렌더는 큐 - 코드 작성은 에이전트 여러 개가 병렬로 계속 진행되고, 렌더는 이 큐 하나가 CPU를
 *  나눠 쓰며 순서대로 처리한다).
 *
 *  준비 완료 판정: 에피소드 폴더에 `READY_TO_RENDER`와 `deploy-title-ko.txt`가 둘 다 있어야 한다.
 *    - READY_TO_RENDER: 빌더가 precheck.mjs 에러 0을 확인한 뒤 만든 빈 마커 파일
 *    - deploy-title-ko.txt: 02-script-v1.md의 확정 제목 한 줄만. 파일명에 그대로 쓴다(재파싱 안 함)
 *
 *  사용법:
 *    node scripts/render_queue.mjs [--concurrency=2] [--per-job-concurrency=3] [--once]
 *      --concurrency        동시에 돌릴 렌더 작업 수 (기본 2, 8코어 머신 기준)
 *      --per-job-concurrency  각 remotion render에 넘길 --concurrency (기본 3, 2*3=6코어 사용)
 *      --once                준비된 것만 한 바퀴 처리하고 종료 (기본은 60초 간격으로 계속 폴링)
 *
 *  처리 순서 (에피소드 1개당):
 *    1. precheck.mjs 재확인 (에러면 건너뛰고 실패 기록 - 빌더 이후 코드가 바뀌었을 가능성 대비)
 *    2. render.mjs <ep> ko
 *    3. ffprobe로 프레임 수·길이 실측
 *    4. shorts/ko/[N화] <제목>.mp4로 복사 (덮어쓰기는 이 스크립트가 만든 것만, 기존 파일 있으면 스킵+기록)
 *    5. out/episode-ko.mp4 삭제 (빌더 규약과 동일 - shorts/가 유일 보관소)
 *    6. READY_TO_RENDER 삭제, DONE_RENDERED 마커 생성
 *    7. 상태를 render_queue_status.jsonl(이 scripts/ 폴더)에 한 줄 append
 *
 *  실패해도 큐는 멈추지 않는다. 실패한 에피소드는 상태 로그에 fail로 남기고 다음으로 넘어간다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const EPISODES_DIR = path.join(ROOT, 'episodes');
const SHORTS_KO = path.join(ROOT, '..', '..', 'shorts', 'ko'); // .claude/shortform -> .claude -> project, then shorts/ko
const STATUS_LOG = path.join(SCRIPT_DIR, 'render_queue_status.jsonl');
const LOCK_FILE = path.join(SCRIPT_DIR, '.render_queue.lock');

/** 큐 프로세스가 중복 실행되면 같은 에피소드의 같은 out/episode-ko.mp4 경로에 두 렌더가 동시에
 *  쓰는 사고가 난다(2026-09-27 실측 - 101/102화가 잠깐 두 프로세스에서 동시 렌더됨, 수동으로
 *  중복 프로세스를 kill -9 해서 수습했다). 그래서 최상위(비-single) 실행은 시작 시 락 파일을
 *  잡고, 살아있는 다른 큐 프로세스가 있으면 즉시 종료한다. */
function acquireLockOrExit() {
  if (fs.existsSync(LOCK_FILE)) {
    const pid = Number(fs.readFileSync(LOCK_FILE, 'utf8').trim());
    const alive = pid && (() => {
      try { process.kill(pid, 0); return true; } catch { return false; }
    })();
    if (alive) {
      console.error(`이미 다른 render_queue.mjs가 실행 중입니다 (pid ${pid}). 중복 실행을 막기 위해 종료합니다.`);
      process.exit(1);
    }
    console.log(`오래된 락 파일 발견(pid ${pid}, 이미 종료됨) - 정리하고 계속합니다.`);
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid));
  process.on('exit', () => {
    try {
      if (fs.readFileSync(LOCK_FILE, 'utf8').trim() === String(process.pid)) fs.rmSync(LOCK_FILE);
    } catch {}
  });
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (name, def) => {
    const p = argv.find((a) => a.startsWith(`--${name}=`));
    return p ? p.split('=')[1] : def;
  };
  return {
    concurrency: Number(get('concurrency', '2')),
    perJobConcurrency: Number(get('per-job-concurrency', '3')),
    once: argv.includes('--once'),
  };
}

function log(line) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${line}`);
}

function appendStatus(obj) {
  fs.appendFileSync(STATUS_LOG, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n');
}

function findReady() {
  if (!fs.existsSync(EPISODES_DIR)) return [];
  return fs
    .readdirSync(EPISODES_DIR)
    .filter((name) => {
      const dir = path.join(EPISODES_DIR, name);
      return (
        fs.existsSync(path.join(dir, 'READY_TO_RENDER')) &&
        fs.existsSync(path.join(dir, 'deploy-title-ko.txt')) &&
        !fs.existsSync(path.join(dir, 'DONE_RENDERED')) &&
        !fs.existsSync(path.join(dir, 'RENDER_FAILED'))
      );
    })
    .sort();
}

function episodeNumber(name) {
  const m = name.match(/-ep(\d+)-/);
  return m ? m[1].replace(/^0+(?=\d)/, '') : null;
}

function ffprobe(file) {
  const r = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=r_frame_rate,width,height',
    '-of', 'default=noprint_wrappers=1',
    file,
  ], { encoding: 'utf8' });
  return r.stdout || '';
}

function processOne(epName, opts) {
  const epDir = path.join(EPISODES_DIR, epName);
  const n = episodeNumber(epName);
  log(`시작: ${epName} (${n}화)`);

  // 1) precheck 재확인
  const pc = spawnSync('node', ['scripts/precheck.mjs', `episodes/${epName}`], { cwd: ROOT, encoding: 'utf8' });
  if (pc.status !== 0) {
    log(`precheck 실패, 건너뜀: ${epName}`);
    fs.writeFileSync(path.join(epDir, 'RENDER_FAILED'), `precheck 실패\n${pc.stdout}\n${pc.stderr}`);
    appendStatus({ episode: epName, step: 'precheck', ok: false });
    return false;
  }

  // 2) 렌더
  const r = spawnSync(
    'node',
    ['scripts/render.mjs', epName, 'ko', '--', `--concurrency=${opts.perJobConcurrency}`],
    { cwd: ROOT, encoding: 'utf8' }
  );
  if (r.status !== 0) {
    log(`렌더 실패: ${epName}`);
    fs.writeFileSync(path.join(epDir, 'RENDER_FAILED'), `렌더 실패\n${r.stdout}\n${r.stderr}`);
    appendStatus({ episode: epName, step: 'render', ok: false });
    return false;
  }

  const mp4 = path.join(epDir, 'out', 'episode-ko.mp4');
  if (!fs.existsSync(mp4)) {
    log(`렌더 성공했다는데 파일이 없음: ${epName}`);
    fs.writeFileSync(path.join(epDir, 'RENDER_FAILED'), '렌더 종료 코드 0이지만 out/episode-ko.mp4 없음');
    appendStatus({ episode: epName, step: 'missing-output', ok: false });
    return false;
  }

  // 3) 실측
  const probe = ffprobe(mp4);
  log(`실측 ${epName}: ${probe.replace(/\n/g, ' | ')}`);

  // 4) 배포
  const title = fs.readFileSync(path.join(epDir, 'deploy-title-ko.txt'), 'utf8').trim();
  const destName = `[${n}화] ${title}.mp4`;
  const dest = path.join(SHORTS_KO, destName);
  if (fs.existsSync(dest)) {
    log(`이미 존재해서 덮어쓰지 않음(수동 확인 필요): ${dest}`);
    appendStatus({ episode: epName, step: 'deploy-skip-exists', ok: false, dest });
  } else {
    fs.mkdirSync(SHORTS_KO, { recursive: true });
    fs.copyFileSync(mp4, dest);
    log(`배포 완료: ${dest}`);
  }

  // 5) out/ 정리 (shorts/가 유일 보관소 - 기존 빌더 규약과 동일)
  fs.rmSync(mp4);

  // 6) 마커 교체
  fs.rmSync(path.join(epDir, 'READY_TO_RENDER'), { force: true });
  fs.writeFileSync(path.join(epDir, 'DONE_RENDERED'), `${new Date().toISOString()}\n${dest}\n${probe}`);

  appendStatus({ episode: epName, step: 'done', ok: true, dest, probe: probe.replace(/\n/g, ' | ') });
  log(`완료: ${epName} -> ${destName}`);
  return true;
}

function runOneAsync(epName, opts) {
  // processOne 자체는 동기(spawnSync 연쇄)라, 실제 동시 렌더를 위해 이 스크립트 자신을
  // --_single=<ep> 인자로 별도 프로세스로 띄운다(node 한 프로세스 안에서 spawnSync를 여러 개
  // "동시에" 부를 수 없기 때문 - spawnSync는 완료까지 이벤트 루프를 막는다).
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [
      fileURLToPath(import.meta.url),
      `--_single=${epName}`,
      `--per-job-concurrency=${opts.perJobConcurrency}`,
    ], { cwd: ROOT, stdio: 'inherit' });
    child.on('exit', (code) => resolve({ epName, ok: code === 0 }));
    child.on('error', () => resolve({ epName, ok: false }));
  });
}

async function runBatch(opts) {
  const ready = findReady();
  if (ready.length === 0) return 0;
  log(`대기열 ${ready.length}개: ${ready.join(', ')}`);

  let idx = 0;
  let processed = 0;
  const workers = Array.from({ length: Math.min(opts.concurrency, ready.length) }, async () => {
    for (;;) {
      const i = idx++;
      if (i >= ready.length) return;
      await runOneAsync(ready[i], opts);
      processed++;
    }
  });
  await Promise.all(workers);
  return processed;
}

async function main() {
  const argv = process.argv.slice(2);
  const single = argv.find((a) => a.startsWith('--_single='));
  const opts = parseArgs();

  if (single) {
    const ep = single.split('=')[1];
    const ok = processOne(ep, opts);
    process.exit(ok ? 0 : 1);
  }

  acquireLockOrExit();
  log(`렌더 큐 시작 (concurrency=${opts.concurrency}, per-job-concurrency=${opts.perJobConcurrency}, once=${opts.once})`);
  for (;;) {
    const n = await runBatch(opts);
    if (opts.once) {
      log(`--once 지정, ${n}개 처리 후 종료`);
      break;
    }
    if (n === 0) {
      await new Promise((r) => setTimeout(r, 60000));
    }
  }
}

main();
