import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'apps/notes/storybook-static');
const artifacts = resolve(root, 'artifacts');
await mkdir(artifacts, { recursive: true });
const index = JSON.parse(await readFile(resolve(output, 'index.json'), 'utf8'));
const entries = Object.values(index.entries).filter((entry) => entry.type === 'story');
const story = (title, name) => {
  const match = entries.find((entry) => entry.title === title && entry.name === name);
  assert.ok(match, `Missing story ${title}/${name}`);
  return match.id;
};
const stable = entries.filter((entry) => !['Live Timer', 'Remote Inputs'].includes(entry.name));
assert.deepEqual(stable.map(({ title, name }) => `${title}/${name}`).sort(), [
  'Lab/Clock/Fixed Time', 'Lab/Note card/Ready', 'Lab/Note card/Loading',
  'Lab/Note card/Saved', 'Lab/Note card/Saving', 'Lab/Note card/Load Error',
  'Lab/Note card/Retry Load', 'Lab/Note card/Retry Save',
].sort(), 'Keep every corrected coverage story in the repeat suite');
let regress = false;
let replacements = 0;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const filename = resolve(output, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!filename.startsWith(output + sep)) { response.writeHead(403).end(); return; }
    let body = await readFile(filename);
    // Mutate only the component's rendered label. Assertions keep their expected text.
    if (regress && extname(filename) === '.js') {
      const text = body.toString();
      const changed = text.replaceAll('"Saved note: "', '"Lost note: "');
      if (changed !== text) replacements++;
      body = Buffer.from(changed);
    }
    response.writeHead(200, { 'Content-Type': types[extname(filename)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise((accept) => server.listen(0, '127.0.0.1', accept));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const evidence = { proof: 'local Storybook play assertions and Chromium PNG comparisons; no Chromatic cloud captures', repeats: 3, stories: [], negativeControls: [] };
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function openStory(id, { remoteVariant, clock } = {}) {
  const context = await browser.newContext({ viewport: { width: 800, height: 600 }, locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  const blocked = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === base) return route.continue();
    if (remoteVariant && url.hostname === 'api.story-lab.invalid') {
      return route.fulfill({ json: { title: `Orbit feed ${remoteVariant}`, updatedAt: '2026-01-15T09:00:00.000Z', imageUrl: 'https://images.story-lab.invalid/badge.svg' } });
    }
    if (remoteVariant && url.hostname === 'images.story-lab.invalid') {
      const svg = await readFile(resolve(root, 'apps/notes/public/orbit.svg'), 'utf8');
      return route.fulfill({ contentType: 'image/svg+xml', body: svg.replace('#ffd166', remoteVariant === 1 ? '#ffd166' : '#ff3355') });
    }
    blocked.push(url.origin);
    return route.abort('blockedbyclient');
  });
  // Storybook 10.5.7 channel events are version-bound plumbing, not an assertion substitute.
  await page.addInitScript(() => {
    window.__LAB_RESULTS__ = [];
    let channel;
    Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
      configurable: true,
      get: () => channel,
      set: (value) => {
        channel = value;
        for (const event of ['storyFinished', 'storyErrored', 'storyThrewException', 'playFunctionThrewException']) {
          value.on(event, (payload) => window.__LAB_RESULTS__.push({ event, payload }));
        }
      },
    });
  });
  if (clock) await page.clock.install({ time: new Date(clock) });
  await page.goto(`${base}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__LAB_RESULTS__.some(({ event }) => ['storyFinished', 'storyErrored', 'storyThrewException', 'playFunctionThrewException'].includes(event)), null, { timeout: 15000 });
  const results = await page.evaluate(() => window.__LAB_RESULTS__);
  const failed = results.some(({ event, payload }) => event !== 'storyFinished' || payload.status !== 'success');
  return { context, page, failed, errors, blocked, results };
}

async function capture(id, options) {
  const run = await openStory(id, options);
  try {
    assert.equal(run.failed, false, JSON.stringify(run.results));
    assert.deepEqual(run.errors, []);
    assert.deepEqual(run.blocked, [], 'Corrected stories must need no external network');
    if (options?.remoteVariant) {
      await run.page.getByRole('heading', { name: `Orbit feed ${options.remoteVariant}` }).waitFor({ state: 'visible' });
    }
    const card = run.page.getByRole('region');
    await card.waitFor({ state: 'visible' });
    await run.page.waitForFunction(() => [...document.querySelectorAll('img')].every((image) => image.complete && image.naturalWidth > 0));
    const png = await card.screenshot();
    await writeFile(resolve(artifacts, `${id}${options?.remoteVariant ?? ''}.png`), png);
    return png;
  } finally { await run.context.close(); }
}

try {
  browser = await chromium.launch({ headless: true });
  evidence.runtime = { node: process.version, platform: process.platform, arch: process.arch, chromium: browser.version() };
  for (const entry of stable) {
    const captures = [];
    for (let repeat = 0; repeat < 3; repeat++) captures.push(await capture(entry.id));
    for (const png of captures.slice(1)) assert.deepEqual(png, captures[0], `Repeat drift in ${entry.id}`);
    evidence.stories.push({ id: entry.id, assertions: 'passed 3 times', identicalCaptures: 3, sha256: hash(captures[0]) });
    console.log(`PASS repeat x3: ${entry.title}/${entry.name}`);
  }

  const live = story('Lab/Clock', 'Live Timer');
  const clocks = await Promise.all(['2026-01-15T09:00:00Z', '2026-01-15T09:01:00Z'].map((clock) => capture(live, { clock })));
  assert.notDeepEqual(clocks[0], clocks[1], 'Live wall-clock input should expose drift');
  evidence.negativeControls.push('live clock: changed wall-clock input changed capture');

  const remote = story('Lab/Note card', 'Remote Inputs');
  const feeds = [];
  for (const remoteVariant of [1, 2]) feeds.push(await capture(remote, { remoteVariant }));
  assert.notDeepEqual(feeds[0], feeds[1], 'Changed remote data/image should expose drift');
  evidence.negativeControls.push('remote inputs: synthetic changed response and image changed capture; requests intercepted locally');

  const saved = story('Lab/Note card', 'Saved');
  const visual = await openStory(saved);
  try {
    assert.equal(visual.failed, false);
    const card = visual.page.getByRole('region');
    const before = await card.screenshot();
    await visual.page.addStyleTag({ content: '.note-card { background: #ff3355 !important; }' });
    const after = await card.screenshot();
    assert.throws(() => assert.deepEqual(after, before));
    await writeFile(resolve(artifacts, 'intentional-color-regression.png'), after);
    evidence.negativeControls.push('intentional CSS regression: exact PNG equality failed');
  } finally { await visual.context.close(); }

  regress = true;
  const broken = await openStory(saved);
  try {
    assert.ok(replacements > 0, 'Component label mutation must actually run');
    assert.equal(broken.failed, true, 'Saved play assertion must reject the label regression');
    const failure = broken.results.find(({ event }) => event === 'playFunctionThrewException');
    assert.ok(failure, 'Require a play assertion failure');
    assert.match(failure.payload.message, /Saved note: Check the orbit/);
    assert.match(failure.payload.message, /Lost note: Check the orbit/);
    evidence.negativeControls.push('intentional component label regression: unchanged Saved play assertion failed');
  } finally { await broken.context.close(); }
  regress = false;
  await capture(saved);
  await writeFile(resolve(artifacts, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log('PASS timer/network drift controls, CSS regression, play regression, and restored Saved story.');
} finally {
  await browser?.close();
  await new Promise((accept) => server.close(accept));
}
