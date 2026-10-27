// 나노바나나(Google Flow) 웹툰 컷 생성기. 계정 하나를 맡아 tools/nb/jobs_<계정>.json 을 위에서부터 한 장씩 그린다.
// 바탕: .claude/skills/flow-nanobanana/helpers/flow_image_gen.mjs (참조 여러 장, 비율 전환, 하루 상한, 차단 감지, 후처리 추가)
// 사용: node tools/nb/nb_gen.mjs lwh970924      (먼저 python3 tools/nb/nb_jobs.py lwh970924)
// 계정 설정: tools/nb/accounts.json (profile, project, gap_sec. daily_cap은 넣지 않으면 상한 없음. 차단 문구가 뜰 때만 멈춘다)
// 기록: tools/nb/log_<계정>.md   원본: tools/nb/raw/<계정>/<id>.jpg   최종: job.final (nb_post.py가 잘라서 저장)
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? '/home/lee/project/nyang-bakja/node_modules/@playwright/test/index.mjs');
import { renameSync, readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NB = path.dirname(fileURLToPath(import.meta.url));
const account = process.argv[2];
if (!account) throw new Error('계정 이름을 주세요: node tools/nb/nb_gen.mjs <계정>');
const acc = JSON.parse(readFileSync(`${NB}/accounts.json`, 'utf8'))[account];
if (!acc?.project) throw new Error(`accounts.json 에 ${account} 의 Flow 프로젝트 URL이 없습니다. 먼저 nb_login.mjs`);
const jobs = JSON.parse(readFileSync(`${NB}/jobs_${account}.json`, 'utf8'));
const LOG = `${NB}/log_${account}.md`;
const RAW = `${NB}/raw/${account}`;
mkdirSync(RAW, { recursive: true });
const GAP = (acc.gap_sec ?? 10) * 1000;
const today = new Date().toLocaleDateString('sv-SE');  // 로컬 날짜(YYYY-MM-DD). toISOString은 UTC라 한국 오전 9시 전에는 전날로 찍혀 차단 1시간 판정이 틀렸다
const log = (msg) => { const line = `- ${today} ${new Date().toTimeString().slice(0, 8)} ${msg}`; console.log(line); appendFileSync(LOG, line + '\n'); };
const doneToday = () => (existsSync(LOG) ? readFileSync(LOG, 'utf8').split('\n').filter((l) => l.startsWith(`- ${today}`) && l.includes(' 성공')).length : 0);
const BLOCK = /비정상적인 활동|사용량 한도|unusual activity|usage limit/;
const BLOCKG = new RegExp(BLOCK.source, 'g');

const ctx = await chromium.launchPersistentContext(acc.profile, {
  // NB_HEADLESS=1 이면 창 없이 백그라운드로 돈다(Flow가 헤드리스 표식을 보지 못하게 사용자 에이전트를 일반 크롬으로 맞춘다)
  headless: process.env.NB_HEADLESS === '1',
  ...(process.env.NB_HEADLESS === '1' ? { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36' } : {}),
  executablePath: process.env.CHROME_PATH ?? '/home/lee/.cache/ms-playwright/chromium-1232/chrome-linux64/chrome',
  viewport: { width: 1500, height: 950 },
  ignoreDefaultArgs: ['--enable-automation'],
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const wait = (ms) => page.waitForTimeout(ms);

async function tiles() {
  return page.evaluate(() => [...document.querySelectorAll('img')]
    .filter((i) => i.alt === '사용자 이미지를 표시하는 타일')
    .map((i) => ({ src: i.src, key: i.src.split('?')[0], w: i.naturalWidth, label: i.closest('[role=group]')?.getAttribute('aria-label') ?? '' })));
}

async function setAspect(aspect) {
  // 계정에 따라 에이전트 모드가 켜져 있으면 설정 버튼이 숨는다. 끄고 직접 생성 모드로
  const agent = page.getByRole('button', { name: '에이전트', exact: true });
  if ((await agent.getAttribute('aria-pressed').catch(() => null)) === 'true') { await agent.click(); await wait(1200); }
  await page.getByRole('button', { name: '설정 트리거' }).click(); await wait(1000);
  await page.getByRole('radio', { name: aspect, exact: true }).click(); await wait(400);
  await page.getByRole('radio', { name: 'x1', exact: true }).click().catch(() => {}); await wait(300);
  await page.keyboard.press('Escape'); await wait(500);
}

async function attachRef(ref) {
  const name = path.basename(ref);
  await page.getByRole('button', { name: '프롬프트 상자에 소재 추가' }).click(); await wait(1500);
  const search = page.locator('input[placeholder*="애셋 검색"], input[aria-label*="애셋 검색"]').first();
  await search.fill(path.basename(ref, path.extname(ref))); await wait(2000);
  if (!(await page.locator('[role=option]', { hasText: name }).count())) {
    const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), page.getByRole('button', { name: '미디어 업로드' }).click()]);
    await chooser.setFiles(ref);
    log(`참조 업로드 ${name}`);
    await wait(8000);
    await search.fill(path.basename(ref, path.extname(ref))); await wait(2500);
  }
  await page.locator('[role=option]', { hasText: name }).first().click(); await wait(500);
  const add = page.getByRole('button', { name: /프롬프트에 추가/ });
  if (await add.count()) await add.first().click();
  await wait(700);
  await page.keyboard.press('Escape').catch(() => {}); await wait(400);
}

async function saveTile(src, out) {
  const b64 = await page.evaluate(async (s) => {
    const r = await fetch(s);
    const u = new Uint8Array(await r.arrayBuffer());
    let bin = '';
    for (let i = 0; i < u.length; i += 32768) bin += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
    return btoa(bin);
  }, src);
  writeFileSync(out, Buffer.from(b64, 'base64'));
}

// 처음 쓰는 계정은 쿠키 동의·안내 창이 버튼을 가린다. 보이면 닫는다
async function dismissPopups() {
  for (const name of [/^동의함$/, /^Agree$/, /^나중에$/, /^닫기$/, /^Close$/, /^확인$/, /^OK$/, /^Got it$/]) {
    const b = page.getByRole('button', { name }).first();
    if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await wait(800); }
  }
}

await page.goto(acc.project, { waitUntil: 'domcontentloaded' });
await wait(8000);
await dismissPopups();
if (!page.url().includes('/project/')) { log('프로젝트가 열리지 않음(로그인 확인 필요). 중단'); await ctx.close(); process.exit(1); }

let lastSubmit = 0;
for (const job of jobs) {
  if (existsSync(job.final)) continue;
  if (acc.daily_cap && doneToday() >= acc.daily_cap) { log(`오늘 상한 ${acc.daily_cap}장 도달. 중단`); break; }
  const gapLeft = GAP - (Date.now() - lastSubmit);
  if (gapLeft > 0) await wait(gapLeft);
  let tries = 0;
  while (tries < 3) {
    tries += 1;
    try {
      await dismissPopups();
      const clear = page.getByRole('button', { name: '프롬프트 지우기' });
      if (await clear.count()) { await clear.first().click(); await wait(700); }
      await setAspect(job.aspect);
      for (const r of job.refs) await attachRef(r);
      // 같은 장면의 바로 앞 컷을 마지막 참조로 붙여 장소·빛·옷·인물 위치를 잇는다
      let prompt = job.prompt;
      if (job.prev && existsSync(job.prev) && tries < 2) {  // 앞 컷 참조 첨부가 두 번 막히면 참조 없이 그린다
        await attachRef(job.prev);
        const note = 'The last reference image is the previous panel of this same scene: keep exactly the same place, background details, time of day and light, clothing, injuries and props, and keep each character on the same side; only the camera angle, framing and action change as described.';
        prompt = prompt.includes(' No text,') ? prompt.replace(' No text,', ` ${note} No text,`) : `${prompt} ${note}`;
      }
      const box = page.locator('[contenteditable=true]').first();
      await box.click(); await page.keyboard.insertText(prompt); await wait(700);
      await wait(4000);  // 방금 올린 참조 그림이 목록에 늦게 뜨면 새 결과로 잘못 잡힌다. 다 뜬 뒤에 기준을 잡는다
      const before = new Set((await tiles()).map((t) => t.key));
      await page.getByRole('button', { name: '생성 시작' }).click();
      lastSubmit = Date.now();
      let got = null;
      const blockBefore = ((await page.locator('body').innerText().catch(() => '')).match(BLOCKG) || []).length;
      const bodyBefore = await page.locator('body').innerText().catch(() => '');
      const failsBefore = (bodyBefore.match(/정책을 위반|이미지를 생성할 수 없습니다/g) || []).length;
      const policyBefore = (bodyBefore.match(/정책을 위반/g) || []).length;
      for (let k = 0; k < 60 && !got; k++) {
        await wait(4000);
        const body = await page.locator('body').innerText().catch(() => '');
        // 화면에 남아 있던 옛 실패 타일의 문구가 아니라, 이번 제출 뒤에 새로 늘어난 문구만 차단으로 본다
        if ((body.match(BLOCKG) || []).length > blockBefore) { log(`차단 문구 감지(${job.id}). 이 계정은 멈춘다`); await ctx.close(); process.exit(2); }
        // 정책 거부·생성 불가 실패 타일이 새로 뜨면 4분을 기다리지 않고 바로 실패 처리한다
        const fails = (body.match(/정책을 위반|이미지를 생성할 수 없습니다/g) || []).length;
        if (fails > failsBefore) {
          // 정책 위반 문구가 늘었으면 프롬프트 문제, 아니면 Flow 쪽 일시적 생성 불가(혼잡). 혼잡이면 1분 쉬고 다음 시도
          const policy = (body.match(/정책을 위반/g) || []).length > policyBefore;
          if (!policy) await wait(60000);
          throw new Error(policy ? 'Flow 정책 거부(프롬프트 문제)' : 'Flow 일시 생성 불가(혼잡, 1분 쉼)');
        }
        got = (await tiles()).find((t) => !before.has(t.key) && t.w >= 800 && !/\.(png|jpe?g)$/i.test(t.label));
      }
      if (!got) throw new Error('시간 초과');
      const raw = `${RAW}/${job.id}.jpg`;
      await saveTile(got.src, raw);
      // 결과가 참조 그림(앞 컷 포함)과 같으면 참조를 잘못 잡은 것이다. 실패로 보고 다시 그린다
      const refsAll = [...job.refs, ...(job.prev && existsSync(job.prev) ? [job.prev] : [])];
      // 같은 장의 이미 저장된 컷과도 비교한다(가상 스크롤로 다시 나타난 옛 타일을 새 결과로 잡는 경우)
      // 원본(raw)은 잘리기 전이라 저장된 컷과 해시가 달라진다. 같은 방식으로 잘라 둔 임시 파일로 비교한 뒤 옮긴다
      const tmp = `${RAW}/${job.id}_post.png`;
      execFileSync('python3', [`${NB}/nb_post.py`, raw, tmp, job.ratio]);
      const dupArgs = [raw, ...refsAll];
      try { execFileSync('python3', [`${NB}/is_dup.py`, ...dupArgs]); execFileSync('python3', [`${NB}/is_dup.py`, tmp, '--dir', path.dirname(job.final)]); }
      catch { throw new Error('참조나 옛 컷을 결과로 잘못 잡음'); }
      mkdirSync(path.dirname(job.final), { recursive: true });
      renameSync(tmp, job.final);
      log(`${job.id} 성공`);
      break;
    } catch (e) {
      log(`${job.id} 실패(${tries}회): ${String(e.message).split('\n')[0].slice(0, 120)}`);
      await page.screenshot({ path: `${RAW}/fail_${job.id}_${tries}.png` }).catch(() => {});
      await page.keyboard.press('Escape').catch(() => {});
      // 버튼이 안 눌리거나 시간 초과면 화면이 걸린 것이다. 새로고침해서 다음 시도를 깨끗한 화면에서 한다
      if (/locator\.click|시간 초과/.test(String(e.message))) {
        await page.goto(acc.project, { waitUntil: 'domcontentloaded' }).catch(() => {});  // reload는 편집 화면 주소면 'Project not found'가 된다
        await wait(8000);
      }
      await wait(GAP);
    }
  }
}
log('목록 끝 또는 중단');
await ctx.close();
