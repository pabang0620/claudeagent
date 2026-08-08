#!/usr/bin/env node
/**
 * Tabler Icons(MIT) 중 실제로 쓰는 것만 로컬 캐시 JSON 으로 뽑아 둔다.
 *
 * 왜 캐시하나:
 *   @iconify/react 의 기본 동작은 렌더 시점에 iconify API 를 네트워크로 조회하는 것이다.
 *   Remotion 렌더는 프레임마다 브라우저를 돌리는 배치 작업이라, 네트워크 지연·실패가
 *   그대로 렌더 실패나 아이콘 누락 프레임으로 이어진다. 그래서 렌더 경로에서는
 *   네트워크를 완전히 배제하고 이 캐시 JSON 만 읽는다.
 *
 * 사용법:
 *   npm run sync-icons                 ICONS 목록 그대로 다시 생성
 *   node scripts/sync_icons.mjs bone heart   목록에 아이콘 추가 후 재생성
 *
 * 아이콘 추가 절차는 assets/REGISTRY.md 의 "외부 아이콘 추가" 항목을 따를 것.
 */
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'assets', 'props', 'tabler-cache.json');
const LIST = join(HERE, 'icons.txt');

/** 기본 큐레이션 목록. 지식·과학 숏폼에서 반복해서 쓸 만한 것 위주. */
const DEFAULT_ICONS = [
  // 신체·생물
  'bone', 'heart', 'brain', 'dna', 'dna-2', 'lungs', 'eye', 'ear', 'dental',
  'virus', 'bacteria', 'egg', 'paw', 'fish', 'butterfly', 'feather', 'leaf', 'tree', 'plant',
  // 과학·실험
  'flask', 'flask-2', 'test-pipe', 'microscope', 'atom', 'atom-2', 'magnet', 'temperature',
  'thermometer', 'scale', 'ruler', 'ruler-measure', 'battery-3', 'bolt', 'droplet', 'flame',
  'snowflake', 'wind', 'bulb', 'microscope',
  // 우주
  'planet', 'rocket', 'moon', 'sun', 'star', 'stars', 'meteor', 'satellite', 'telescope', 'world',
  'cloud', 'mountain', 'wave-sine',
  // 기호·UI
  'question-mark', 'exclamation-mark', 'alert-triangle', 'check', 'x', 'plus', 'minus', 'equal',
  'percentage', 'math-symbols', 'zoom-in', 'search', 'target', 'trophy', 'gift', 'bell',
  'thumb-up', 'heart-filled', 'clock', 'calendar', 'map-pin', 'book', 'school', 'bookmark',
  'chart-bar', 'chart-pie', 'chart-line', 'list-numbers', 'bulb-filled',
  // 화살표·전환
  'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'arrow-narrow-right',
  'arrow-big-right', 'refresh', 'repeat', 'player-play', 'player-pause',
];

function loadList() {
  const extra = process.argv.slice(2);
  let base = DEFAULT_ICONS;
  try {
    base = readFileSync(LIST, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
  } catch {
    /* icons.txt 가 없으면 기본 목록 사용 */
  }
  return [...new Set([...base, ...extra])].sort();
}

function main() {
  const collection = require('@iconify-json/tabler/icons.json');
  const wanted = loadList();
  const icons = {};
  const missing = [];

  for (const name of wanted) {
    const item = collection.icons[name] ?? collection.aliases?.[name];
    const body = item?.body ?? (item?.parent ? collection.icons[item.parent]?.body : null);
    if (!body) {
      missing.push(name);
      continue;
    }
    icons[name] = {
      body,
      w: item.width ?? collection.width ?? 24,
      h: item.height ?? collection.height ?? 24,
    };
  }

  writeFileSync(
    OUT,
    `${JSON.stringify({ prefix: 'tabler', license: 'MIT', source: '@iconify-json/tabler', icons }, null, 1)}\n`
  );
  writeFileSync(LIST, `${wanted.join('\n')}\n`);

  console.log(`saved ${Object.keys(icons).length} icons -> ${OUT}`);
  if (missing.length) console.log(`없는 이름(무시함): ${missing.join(', ')}`);
}

main();
