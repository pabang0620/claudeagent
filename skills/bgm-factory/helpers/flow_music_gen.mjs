// Flow Music 생성곡 자동 생성·WAV 다운로드(이 세션 전용 브라우저).
// 정본: .claude/skills/bgm-factory/helpers/flow_music_gen.mjs (게임 레포 사본은 소비자. 고치면 여기로 역반영)
// 환경변수: FLOW_PROFILE(필수) PLAYWRIGHT_MODULE(@playwright/test index.mjs 경로) CHROME_PATH(크롬 실행 파일) SUBMIT_ONLY GAP_SEC SHOTS
// 사용: FLOW_PROFILE=<로그인 프로필 복사본> node tools/flow_music_gen.mjs <jobs.json> <저장 폴더>
// jobs.json = [{ "file": "cannery_gen3.wav", "prompt": "..." }] (곡 id를 알면 { file, clip }로 생성 없이 받기)
// 빠르게: SUBMIT_ONLY=1로 전부 요청만 넣고(Flow는 동시 12곡 생성), <저장 폴더>/_sessions.json을 jobs로 다시 돌려 받는다.
// GAP_SEC=<초>: 요청 사이 쉬는 시간(연속 제출 차단 예방).
// 받은 뒤: npm run bgm:import -- --id <게임> --batch <폴더> 로 박 검사·정렬·등록.
// 주의: Flow는 짧은 시간 연속 생성(약 40분 15곡) 시 비정상 활동으로 막힌다. 한 번에 10곡 안팎.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? '/home/lee/project/nyang-bakja/node_modules/@playwright/test/index.mjs');
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
// 로그인된 Flow Music 브라우저 프로필 복사본 경로(공용 MCP 프로필을 직접 쓰지 말 것: 다른 세션과 충돌)
const PROFILE = process.env.FLOW_PROFILE;
if (!PROFILE) throw new Error('FLOW_PROFILE(로그인된 프로필 복사본 경로)을 지정하세요');
const SP = process.env.SHOTS ?? '/tmp';
const [, , jobsPath, outDir] = process.argv;
const jobs = JSON.parse(readFileSync(jobsPath, 'utf8'));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: false, executablePath: process.env.CHROME_PATH ?? '/home/lee/.cache/ms-playwright/chromium-1232/chrome-linux64/chrome',
  viewport: { width: 1400, height: 900 }, acceptDownloads: true,
});
const page = ctx.pages()[0] ?? await ctx.newPage();
let auth = null; let clip = null;
const used = new Set();
/** SUBMIT_ONLY=1: 요청한 곡과 세션 주소 */
const submitted = [];
// 예전 곡 id(곡 id 재사용 방지)
page.on('request', (r) => { const a = r.headers().authorization; if (a && r.url().includes('flowmusic.app/__api')) auth = a; const m = r.url().match(/clips\/([0-9a-f-]{36})\.m4a/); if (m) clip = m[1]; });
const shot = (n) => page.screenshot({ path: `${SP}/fm-${n}.png` }).catch(() => {});

for (const job of jobs) {
  const out = `${outDir}/${job.file}`;
  if (existsSync(out)) { log('skip(있음)', job.file); continue; }
  log('==', job.file);
  if (job.clip) {
    // 곡 id를 이미 아는 곡: 생성 없이 받는다(토큰을 얻으려 홈을 한 번 연다)
    if (!auth) { await page.goto('https://www.flowmusic.app/', { waitUntil: 'domcontentloaded' }); for (let k = 0; k < 15 && !auth; k++) await page.waitForTimeout(1000); }
    const r = await ctx.request.get(`https://www.flowmusic.app/__api/download/audio/${job.clip}?format=wav`, { headers: { authorization: auth }, timeout: 180000 });
    const b = await r.body();
    if (r.status() === 200 && b.slice(0, 4).toString() === 'RIFF') { writeFileSync(out, b); used.add(job.clip); log('저장', out); } else log('WAV 받기 실패', r.status());
    continue;
  }
  if (clip) used.add(clip);
  clip = null;
  let sessionUrl = job.session ?? null;
  if (sessionUrl === null) {
    await page.goto('https://www.flowmusic.app/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Agree')?.click());
    await page.evaluate(() => document.querySelector('button[aria-label="Open compose panel"]')?.click());
    await page.waitForSelector('textarea[aria-label="Sound description"]', { state: 'attached', timeout: 20000 });
    await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Toggle instrumental mode"]');
      if (b && b.getAttribute('aria-checked') === 'false') b.click();
    });
    await page.waitForTimeout(800);
    const instr = await page.evaluate(() => document.querySelector('button[aria-label="Toggle instrumental mode"]')?.getAttribute('aria-checked'));
    if (instr !== 'true') { log('instrumental 켜기 실패', instr); await shot('err-instr'); continue; }
    const len = await page.evaluate((text) => {
      const ta = document.querySelector('textarea[aria-label="Sound description"]');
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ta, text);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      return ta.value.length;
    }, job.prompt);
    if (len !== job.prompt.length) { log('프롬프트 길이 불일치', len); continue; }
    await page.waitForTimeout(500);
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Generate')?.click());
    try { await page.waitForURL(/\/session\//, { timeout: 20000 }); } catch { log('Generate 실패(세션 URL 없음)'); await shot('err-gen'); continue; }
    sessionUrl = page.url();
    // 요청 카드가 세션에 안 생겼으면(생성이 시작되지 않음) Generate를 한 번 더
    await page.waitForTimeout(12000);
    const started = await page.evaluate((head) => document.body.innerText.includes(head), job.prompt.slice(0, 40));
    if (!started) {
      log('생성 시작 확인 안 됨, 다시 누름');
      await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Generate')?.click());
      await page.waitForTimeout(12000);
      sessionUrl = page.url();
    }
  }
  if (process.env.SUBMIT_ONLY === '1') {
    // 빠른 모드 1단계: 요청만 넣고 다음 곡으로(세션 주소를 기록해 2단계에서 { file, session }으로 받는다)
    submitted.push({ file: job.file, session: sessionUrl });
    writeFileSync(`${outDir}/_sessions.json`, JSON.stringify(submitted, null, 1));
    log('요청', job.file, sessionUrl);
    // GAP_SEC: 다음 요청까지 쉬는 시간(짧은 간격 연속 제출은 비정상 활동으로 막힐 수 있다)
    const gap = Number(process.env.GAP_SEC ?? 0);
    if (gap > 0) await page.waitForTimeout(gap * 1000);
    continue;
  }
  // 생성 시작 뒤에 불린 곡만 이번 곡으로 본다(홈 화면 플레이어가 예전 곡을 불러올 수 있다)
  if (clip) used.add(clip);
  clip = null;
  log('세션', sessionUrl);
  // 생성 대기: 세션 화면에 곡 '더 보기' 버튼이 생길 때까지(최대 4분)
  let ok = false;
  for (let i = 0; i < 16; i++) {
    await page.waitForTimeout(i === 0 && !job.session ? 30000 : 6000);
    if (!(clip && !used.has(clip))) {
      // 세션 목록에 곡이 생겼으면 그 곡의 재생 버튼을 눌러 플레이어가 새 곡을 불러오게 한다(곡 id를 그 요청에서 얻는다)
      await page.goto(sessionUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      const played = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button[aria-label^="Play"]')).find((b) => !b.closest('#player'));
        btn?.click();
        return !!btn;
      });
      if (played) for (let k = 0; k < 10 && !(clip && !used.has(clip)); k++) await page.waitForTimeout(1000);
    }
    // 이전 곡이 플레이어에 남아 있을 수 있어, 이번에 새로 불린 곡 id가 생겨야 준비된 것으로 본다
    if (clip && !used.has(clip)) { ok = true; break; }
  }
  await shot(`${job.file}-ready`);
  if (!ok) { log('생성 대기 시간 초과', sessionUrl); continue; }
  await page.waitForTimeout(15000); // 렌더 마무리 여유
  if (!clip || !auth) { log('곡 id·토큰을 못 찾음', sessionUrl); continue; }
  // 사이트의 WAV 다운로드 버튼은 브라우저 안 후처리에서 실패한다 → 같은 토큰으로 API를 직접 받는다
  const res = await ctx.request.get(`https://www.flowmusic.app/__api/download/audio/${clip}?format=wav`, { headers: { authorization: auth }, timeout: 180000 });
  const body = await res.body();
  if (res.status() !== 200 || body.slice(0, 4).toString() !== 'RIFF') { log('WAV 받기 실패', res.status(), sessionUrl); continue; }
  writeFileSync(out, body);
  used.add(clip);
  log('저장', out, sessionUrl);
}
await ctx.close();
