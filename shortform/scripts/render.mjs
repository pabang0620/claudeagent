#!/usr/bin/env node
/** 에피소드 렌더 래퍼 (render).
 *
 *  `npx remotion render` 는 shortform 루트(package.json / remotion.config.ts / node_modules 가
 *  있는 곳)에서 실행해야 한다. 그런데 출력 경로를 `out/episode-ko.mp4` 처럼 상대경로로 주면
 *  cwd 기준으로 풀려서 **공용 루트 `shortform/out/`** 에 떨어진다. 여러 화를 동시에 렌더하면
 *  서로 파일을 덮어쓰고, 남의 화 산출물을 자기 것으로 착각한다.
 *
 *  실제 사고 (2026-08-20): 8화 렌더 중 공용 루트 `out/` 에 프레임 수가 다른(1492/1582)
 *  7화의 `episode-ko/en-v1~v3.mp4` 와 그 프레임 폴더가 섞여 있는 것이 발견됐다. 8화는 1307/1314
 *  프레임이라 남의 화 파일이었다. 3화씩 병렬 렌더가 기본이 된 이상 반드시 막아야 한다.
 *
 *  그래서 출력 경로를 손으로 적지 않는다. 이 래퍼가 에피소드 폴더에서 절대경로를 계산해
 *  `episodes/<화>/out/` 안에만 쓴다.
 *
 *  사용법:
 *    node scripts/render.mjs <에피소드 폴더> <ko|en|both> [버전태그] [-- <추가 remotion 인자>]
 *
 *    node scripts/render.mjs general-ep09-pins-and-needles ko
 *      -> episodes/general-ep09-pins-and-needles/out/episode-ko.mp4
 *    node scripts/render.mjs episodes/general-ep09-pins-and-needles both v2
 *      -> .../out/episode-ko-v2.mp4 , .../out/episode-en-v2.mp4
 *    node scripts/render.mjs general-ep09-pins-and-needles ko -- --concurrency=4
 *
 *  종료 코드: 0 = 전부 성공 / 1 = 렌더 실패 / 2 = 사용법·내부 오류
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');

const COMPOSITION = { ko: 'EpisodeKo', en: 'EpisodeEn' };

function usage(msg) {
  if (msg) console.error(`오류: ${msg}\n`);
  console.error('사용법: node scripts/render.mjs <에피소드 폴더> <ko|en|both> [버전태그] [-- <추가 remotion 인자>]');
  console.error('  예) node scripts/render.mjs general-ep09-pins-and-needles both');
  console.error('  예) node scripts/render.mjs general-ep09-pins-and-needles ko v2');
  console.error('');
  console.error('출력 경로는 이 스크립트가 episodes/<화>/out/ 안으로 고정한다 - 직접 지정할 수 없다.');
  process.exit(2);
}

function resolveEpisodeDir(arg) {
  if (!arg) usage('에피소드 폴더를 지정하세요.');
  const cands = [
    path.resolve(process.cwd(), arg),
    path.resolve(ROOT, arg),
    path.resolve(ROOT, 'episodes', arg),
  ];
  for (const c of cands) if (fs.existsSync(path.join(c, 'src'))) return c;
  usage(`src/ 가 있는 에피소드 폴더를 찾지 못했습니다: ${arg}`);
  return null;
}

function main() {
  const argv = process.argv.slice(2);
  const sep = argv.indexOf('--');
  const extra = sep === -1 ? [] : argv.slice(sep + 1);
  const args = sep === -1 ? argv : argv.slice(0, sep);

  const epDir = resolveEpisodeDir(args[0]);

  const langArg = (args[1] || '').toLowerCase();
  if (!['ko', 'en', 'both'].includes(langArg)) usage(`언어는 ko / en / both 중 하나입니다: '${args[1] ?? ''}'`);
  const langs = langArg === 'both' ? ['ko', 'en'] : [langArg];

  const tag = args[2] ? String(args[2]).replace(/^-+/, '') : '';
  if (tag && !/^[A-Za-z0-9._-]+$/.test(tag)) usage(`버전태그에 쓸 수 없는 문자가 있습니다: '${tag}'`);

  const entry = path.join(epDir, 'src', 'index.ts');
  const publicDir = path.join(epDir, 'public');
  if (!fs.existsSync(entry)) usage(`엔트리가 없습니다: ${entry}`);
  if (!fs.existsSync(publicDir)) usage(`public/ 이 없습니다: ${publicDir}`);

  const outDir = path.join(epDir, 'out');
  fs.mkdirSync(outDir, { recursive: true });

  // 출력이 에피소드 폴더 밖으로 새지 않는지 마지막으로 한 번 더 확인한다.
  if (path.relative(epDir, outDir).startsWith('..')) {
    console.error(`내부 오류: 출력 경로가 에피소드 폴더 밖입니다 (${outDir})`);
    process.exit(2);
  }

  console.log(`에피소드 : ${path.basename(epDir)}`);
  console.log(`출력 폴더 : ${outDir}`);
  console.log('');

  for (const lang of langs) {
    const outFile = path.join(outDir, `episode-${lang}${tag ? `-${tag}` : ''}.mp4`);
    const cmdArgs = [
      'remotion', 'render',
      `--public-dir=${publicDir}`,
      entry,
      COMPOSITION[lang],
      outFile,
      ...extra,
    ];

    console.log(`[${lang}] npx ${cmdArgs.join(' ')}`);
    const r = spawnSync('npx', cmdArgs, { cwd: ROOT, stdio: 'inherit' });
    if (r.error) {
      console.error(`[${lang}] 렌더 실행 실패:`, r.error.message);
      process.exit(1);
    }
    if (r.status !== 0) {
      console.error(`[${lang}] 렌더 실패 (exit ${r.status})`);
      process.exit(1);
    }
    console.log(`[${lang}] 완료 -> ${outFile}`);
    console.log('');
  }

  process.exit(0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (e) {
    console.error('render 내부 오류:', e && e.stack ? e.stack : e);
    process.exit(2);
  }
}
