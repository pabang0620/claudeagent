"""Build a Playwright submit script for one Readdy Interactive Cinematic video.

Usage: python3 make_submit.py <staging_dir> <length>
  staging_dir must contain prompt.txt (English-only), first.png, last.png.
  length example: "10s" or "15s" (must match Readdy's radio label exactly).
Writes <staging_dir>/submit.js and prints its path.
"""
import json, sys, io, os

base, length = sys.argv[1].rstrip("/"), sys.argv[2]
key = os.path.basename(base)
prompt = io.open(f"{base}/prompt.txt", encoding="utf-8").read()
js = f"""async (page) => {{
  await page.goto('https://readdy.ai/project');
  await page.waitForLoadState('domcontentloaded');
  const gotIt = page.getByRole('button', {{ name: 'Got it' }});
  try {{ await gotIt.waitFor({{ state: 'visible', timeout: 4000 }}); await gotIt.click(); }} catch (e) {{}}
  await page.locator('button.edit-tab--cinematic').click();
  const box = page.getByRole('textbox').first();
  await box.waitFor();
  await box.fill({json.dumps(prompt)});
  const sw = page.getByRole('switch', {{ name: 'First / last frame' }});
  if (!(await sw.isVisible().catch(() => false))) await page.getByRole('button', {{ name: 'Advanced' }}).click();
  await sw.waitFor();
  if (!(await sw.isChecked())) await sw.click();
  await page.getByRole('radio', {{ name: /^2K/ }}).click();
  await page.getByRole('radio', {{ name: '{length}', exact: true }}).click();
  let [fc] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('div').filter({{ hasText: /^First frame \\(optional\\)$/ }}).first().click(),
  ]);
  await fc.setFiles({json.dumps(base + '/first.png')});
  await page.getByRole('button', {{ name: 'Remove image' }}).first().waitFor();
  [fc] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('div').filter({{ hasText: /^Last frame \\(optional\\)$/ }}).first().click(),
  ]);
  await fc.setFiles({json.dumps(base + '/last.png')});
  await page.waitForFunction(() => document.querySelectorAll('button[aria-label="Remove image"]').length >= 2, null, {{ timeout: 20000 }});
  const checked = {{
    frames: await page.getByRole('button', {{ name: 'Remove image' }}).count(),
    firstLast: await sw.isChecked(),
    k2: await page.getByRole('radio', {{ name: /^2K/ }}).isChecked(),
    len: await page.getByRole('radio', {{ name: '{length}', exact: true }}).isChecked(),
  }};
  await page.getByRole('button', {{ name: 'Next' }}).click();
  await page.waitForURL('**/cinematic', {{ timeout: 30000 }});
  await page.getByText(/Starting automatically|Confirm script/).first().waitFor({{ timeout: 90000 }});
  return JSON.stringify({{ video: '{key}', ...checked, url: page.url() }});
}}
"""
io.open(f"{base}/submit.js", "w", encoding="utf-8").write(js)
print(f"{base}/submit.js")
