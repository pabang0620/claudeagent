// Google Flow image generation in this session's own browser (a copy of the logged-in profile, never the shared MCP one).
// 정본: .claude/skills/flow-nanobanana/helpers/flow_image_gen.mjs (게임 레포 사본은 소비자. 고치면 여기로 역반영)
// 환경변수: FLOW_PROFILE(필수) FLOW_PROJECT(Flow 프로젝트 URL) PLAYWRIGHT_MODULE(@playwright/test index.mjs 경로) CHROME_PATH(크롬 실행 파일) GAP_SEC SHOTS
// Usage: FLOW_PROFILE=<profile copy> node Tools/art/flow_image_gen.mjs <jobs.json> <out dir> [first] [count]
// jobs.json = [{ "name": "gear_sword_1_10", "prompt": "...", "ref": "/abs/path/ref.png" }]
// Each job: clear the prompt box, attach the reference (uploaded once, then picked by name), type the prompt, generate,
// wait for the new tile and save it as <out dir>/gen_<name>.jpg. Jobs whose file exists are skipped.
// Pace: one job at a time with a gap (GAP_SEC, default 20) so Flow does not flag rapid submissions.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? '/home/lee/project/nyang-bakja/node_modules/@playwright/test/index.mjs');
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PROFILE = process.env.FLOW_PROFILE;
if (!PROFILE) throw new Error('FLOW_PROFILE(로그인된 프로필 복사본 경로)을 지정하세요');
const PROJECT = process.env.FLOW_PROJECT ?? 'https://flow.google.com/project/148fc0d6-31d9-4538-bf3d-1a266fd94249';
const GAP = Number(process.env.GAP_SEC ?? 20) * 1000;
const SHOTS = process.env.SHOTS ?? '/tmp';
const [, , jobsPath, outDir, firstArg, countArg] = process.argv;
const all = JSON.parse(readFileSync(jobsPath, 'utf8'));
const first = Number(firstArg ?? 0);
const jobs = all.slice(first, countArg ? first + Number(countArg) : undefined);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: false,
  executablePath: process.env.CHROME_PATH ?? '/home/lee/.cache/ms-playwright/chromium-1232/chrome-linux64/chrome',
  viewport: { width: 1500, height: 950 },
  // Flow checks reCAPTCHA: do not announce an automated browser
  ignoreDefaultArgs: ['--enable-automation'],
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const shot = (n) => page.screenshot({ path: `${SHOTS}/flowgen-${n}.png` }).catch(() => {});
const uploaded = new Set();

async function tileSrcs() {
  return page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.alt === '사용자 이미지를 표시하는 타일').map((i) => i.src));
}

async function attachRef(ref) {
  const name = path.basename(ref, path.extname(ref));
  await page.getByRole('button', { name: '프롬프트 상자에 소재 추가' }).click();
  await page.waitForTimeout(1500);
  if (!uploaded.has(ref)) {
    const search = page.locator('input[placeholder*="애셋 검색"], input[aria-label*="애셋 검색"]').first();
    await search.fill(name).catch(() => {});
    await page.waitForTimeout(2000);
    const found = await page.locator('[role=option]', { hasText: name }).count();
    if (found === 0) {
      const [chooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        page.getByText('업로드', { exact: false }).last().click(),
      ]);
      await chooser.setFiles(ref);
      log('uploaded', name);
      await page.waitForTimeout(6000);
    }
    uploaded.add(ref);
  }
  const search = page.locator('input[placeholder*="애셋 검색"], input[aria-label*="애셋 검색"]').first();
  if (await search.count()) {
    await search.fill(name);
    await page.waitForTimeout(2500);
    const opt = page.locator('[role=option]', { hasText: name }).first();
    if (await opt.count()) await opt.click();
    await page.waitForTimeout(500);
    const add = page.getByRole('button', { name: /프롬프트에 추가/ });
    if (await add.count()) await add.first().click();
  }
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape').catch(() => {});
}

async function save(src, out) {
  const b64 = await page.evaluate(async (s) => {
    const r = await fetch(s);
    const u = new Uint8Array(await r.arrayBuffer());
    let bin = '';
    for (let i = 0; i < u.length; i += 32768) bin += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
    return btoa(bin);
  }, src);
  writeFileSync(out, Buffer.from(b64, 'base64'));
}

await page.goto(PROJECT, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
if (!page.url().includes('/project/')) {
  await shot('login');
  throw new Error('Flow 프로젝트가 열리지 않았습니다(로그인 확인): ' + page.url());
}

// One image per generation (a profile copy may keep x2; two at once trips the limit)
await page.getByRole('button', { name: '설정 트리거' }).click();
await page.waitForTimeout(1200);
await page.getByRole('button', { name: 'x1', exact: true }).click().catch(() => page.getByText('x1', { exact: true }).click());
await page.waitForTimeout(500);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

let n = 0;
for (const job of jobs) {
  const out = `${outDir}/gen_${job.name}.jpg`;
  if (existsSync(out)) { log('skip(있음)', job.name); continue; }
  log('==', job.name);
  try {
    const clear = page.getByRole('button', { name: '프롬프트 지우기' });
    if (await clear.count()) { await clear.first().click(); await page.waitForTimeout(800); }
    if (job.ref) await attachRef(job.ref);
    const box = page.locator('[contenteditable=true]').first();
    await box.click();
    await page.keyboard.insertText(job.prompt);
    await page.waitForTimeout(800);
    const before = new Set(await tileSrcs());
    await page.getByRole('button', { name: '생성 시작' }).click();
    let src = null;
    for (let k = 0; k < 120 && !src; k++) {
      await page.waitForTimeout(3000);
      src = await page.evaluate((prev) => {
        const im = [...document.querySelectorAll('img')].find((i) => i.alt === '사용자 이미지를 표시하는 타일' && !prev.includes(i.src) && i.naturalWidth >= 1000);
        return im ? im.src : null;
      }, [...before]);
    }
    if (!src) { await shot(job.name); log('시간 초과', job.name); continue; }
    await save(src, out);
    log('저장', out);
  } catch (e) {
    await shot(job.name);
    log('실패', job.name, e.message.split('\n')[0]);
  }
  n++;
  if (n < jobs.length) await page.waitForTimeout(GAP);
}
await ctx.close();
log('끝');
