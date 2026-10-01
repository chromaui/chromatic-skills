import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { check } from '../skills/chromatic-turbosnap-check/scripts/preflight.mjs';
import { graphFromStats, configPaths, reachable, importSpecifiers, changedRuntimeImports, parseTrace, normalizeFile, exitForStatus, hasRuntimeReexports, isSupportedCliVersion } from '../skills/chromatic-turbosnap-check/scripts/preflight-lib.mjs';

const module = (name, parents = [], extra = {}) => ({ id: name, name, reasons: parents.map((moduleName) => ({ moduleName })), ...extra });
const stats = (bail = false) => ({ modules: [
  module('./src/Button.js', ['./src/Button.stories.js', ...(bail ? ['./.storybook/preview.js'] : [])]),
  module('./src/Button.stories.js', ['./storybook-stories.js']),
  module('./.storybook/preview.js', ['./storybook-config-entry.js']),
  module('./storybook-stories.js', ['./storybook-config-entry.js']),
  module('./storybook-config-entry.js'),
] });
const graph = (data) => graphFromStats(data, { repo: '/repo', base: '.', configDir: '.storybook' });

test('CLI executes through a symlinked skill directory', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'turbosnap-entrypoint-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const linked = path.join(dir, 'skill');
  fs.symlinkSync(fileURLToPath(new URL('../skills/chromatic-turbosnap-check/', import.meta.url)), linked, 'dir');
  const output = execFileSync(process.execPath, [path.join(linked, 'scripts/preflight.mjs'), '--help'], { encoding: 'utf8' });
  assert.match(output, /TurboSnap preflight 0\.2\.0/);
  assert.match(output, /--audit/);
});

test('story index wiring does not create a false global path', () => {
  assert.deepEqual(configPaths(graph(stats()), ['src/Button.js']), []);
});
test('finds all independent config boundaries despite cycles', () => {
  const data = stats(true);
  data.modules.push(module('./.storybook/adapter-a.js'), module('./.storybook/adapter-b.js'), module('./src/cycle.js', ['./src/Button.js']));
  data.modules[0].reasons.push({ moduleName: './.storybook/adapter-a.js' }, { moduleName: './.storybook/adapter-b.js' }, { moduleName: './src/cycle.js' });
  const g = graph(data);
  assert.deepEqual(configPaths(g, ['src/Button.js']).map((x) => x.boundary).sort(), ['.storybook/adapter-a.js', '.storybook/adapter-b.js', '.storybook/preview.js']);
  assert.ok(reachable(g, '.storybook/preview.js').includes('src/cycle.js'));
});
test('cycle alone is not a bail', () => {
  const data = stats(); data.modules.push(module('./src/cycle.js', ['./src/Button.js']));
  data.modules[0].reasons.push({ moduleName: './src/cycle.js' });
  assert.deepEqual(configPaths(graph(data), ['src/cycle.js']), []);
});
test('webpack concatenated modules preserve nested reachability', () => {
  const data = stats(true);
  data.modules[0].name = './src/Button.js + 1 modules';
  data.modules[0].modules = [module('./src/nested.js')];
  assert.equal(configPaths(graph(data), ['src/nested.js'])[0].boundary, '.storybook/preview.js');
});
test('monorepo paths include packages outside the Storybook package', () => {
  const data = { modules: [module('../shared/helper.js', ['./.storybook/preview.js']), module('./.storybook/preview.js')] };
  const g = graphFromStats(data, { repo: '/repo', base: 'packages/web', configDir: 'packages/web/.storybook' });
  assert.equal(configPaths(g, ['packages/shared/helper.js'])[0].boundary, 'packages/web/.storybook/preview.js');
});
test('rejects empty and relationship-free stats', () => {
  assert.throws(() => graph({ modules: [] }), /empty/);
  assert.throws(() => graph({ modules: [module('./src/A.js')] }), /relationships/);
});
test('import scan supports multiline, side effects, reexports, and literal dynamic imports', () => {
  const input = `// import Fake from 'bad-one';
  const text = "import Fake from 'bad-two';";
  /* export * from 'bad-three'; */
  import type { Foo } from 'types';
  import { A,\n B } from './barrel';
  import './styles.css';
  export * from './other';
  const lazy = import('./lazy');`;
  assert.deepEqual(importSpecifiers(input), ['./barrel', './lazy', './other', './styles.css']);
});
test('CLI success with bail is classified as bail, and count is incomplete', () => {
  const result = parseTrace('ℹ Traced 1 changed file to 300 affected story files:\n⚠ TurboSnap disabled due to file change\nFound a Storybook config change in .storybook/preview.tsx\n', 0);
  assert.equal(result.bailed, true); assert.equal(result.countComplete, false);
});
test('inline type-only bindings are erased while mixed bindings and require are runtime', () => {
  assert.deepEqual(importSpecifiers(`import { type Foo, type Bar as B } from './types'; export { type Foo } from './types';`), []);
  assert.deepEqual(importSpecifiers(`import { type Foo, Bar } from './mixed'; const x = require('./commonjs');`), ['./commonjs', './mixed']);
  assert.deepEqual(importSpecifiers(`import { type as value } from './value'; import { type } from './other';`), ['./other', './value']);
});
test('long named imports and static template dynamic imports are retained', () => {
  const names = Array.from({ length: 120 }, (_, n) => `Name${n}`).join(',');
  assert.deepEqual(importSpecifiers(`import {${names}} from './barrel'; import(\`./lazy\`);`), ['./barrel', './lazy']);
});
test('TypeScript import-equals and import types are erased; runtime transitions are detected', () => {
  assert.deepEqual(importSpecifiers(`import type Foo = require('./types'); type Bar = import('./other').Bar;`), []);
  assert.deepEqual(importSpecifiers(`import Foo = require('./types'); const value = require('./common') as unknown;`), ['./common', './types']);
  assert.deepEqual(changedRuntimeImports(`import type Foo = require('./types');`, `import Foo = require('./types');`), [{ specifier: './types', added: true }]);
});
test('changing bindings from an existing barrel is reviewable', () => {
  assert.deepEqual(changedRuntimeImports(`import { A } from './barrel';`, `import { A, B } from './barrel';`), [{ specifier: './barrel', added: false }]);
  assert.deepEqual(changedRuntimeImports(`import { A, B } from './barrel';`, `import { B, A } from './barrel';`), []);
});
test('TypeScript assertions and TSX remain valid in their respective preview files', () => {
  const source = `import { A } from './barrel'; const value = <number>1; export default {};`;
  assert.deepEqual(changedRuntimeImports('', source, 'preview.ts'), [{ specifier: './barrel', added: true }]);
  assert.deepEqual(changedRuntimeImports('', `import { A } from './barrel'; const value = <A />;`, 'preview.tsx'), [{ specifier: './barrel', added: true }]);
});
test('unknown output and process failure cannot pass', () => {
  assert.throws(() => parseTrace('everything fine', 0), /Unrecognized/);
  assert.throws(() => parseTrace('Traced 1 changed file to 3 affected story files:', 1), /failed/);
});
test('rejects escaping changed paths', () => {
  assert.throws(() => normalizeFile('../secrets'));
  assert.throws(() => normalizeFile('/absolute'));
  assert.equal(normalizeFile('./src/has space.js'), 'src/has space.js');
});

test('CLI compatibility accepts stable 18.x SemVer only', () => {
  for (const version of ['18.0.0', '18.9.5', '18.9.6', '18.10.0', '18.99.99', '18.9.6+build.1']) {
    assert.equal(isSupportedCliVersion(version), true, version);
  }
  for (const version of ['17.9.6', '19.0.0', '180.9.6', '18.9.6-canary.1', '18.9.6-rc.1+build.1', '18', '18.9', '18.09.6', '018.9.6', '18.9.6+', 'v18.9.6', '1.22.22\n18.9.6', 'chromatic@latest', '', null]) {
    assert.equal(isSupportedCliVersion(version), false, String(version));
  }
});

function fixture(t, { bail = false, buildMode = 'success', realCli = false, cliVersion = '18.9.5' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'turbosnap-test-'));
  const repo = path.join(dir, 'repo'); const out = path.join(dir, 'out'); fs.mkdirSync(repo);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const write = (name, content) => { const target = path.join(repo, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); };
  const git = (...argv) => execFileSync('git', argv, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '-b', 'main'); git('config', 'user.email', 'fixture@example.test'); git('config', 'user.name', 'Fixture');
  write('src/Button.js', 'export const value = 1;\n'); write('.storybook/preview.js', 'export default {};\n');
  write('package.json', '{"private":true}\n'); write('.gitignore', 'ignored/\n');
  git('add', '.'); git('commit', '-m', 'baseline');
  const cliPath = path.join(dir, 'cli.mjs');
  fs.writeFileSync(cliPath, `if(process.argv.includes('--version')) console.log(${JSON.stringify(cliVersion)}); else console.log(${JSON.stringify(`Traced 1 changed file to 1 affected story files:\n${bail ? 'TurboSnap disabled due to file change\nFound a Storybook config change in .storybook/preview.js\n' : ''}`)});`);
  const statsPath = path.join(dir, 'input-stats.json'); fs.writeFileSync(statsPath, JSON.stringify(stats(bail)));
  const builder = path.join(dir, 'builder.mjs');
  fs.writeFileSync(builder, `import fs from 'node:fs';import path from 'node:path';
    const out=process.argv[2];
    ${buildMode === 'fail' ? 'process.exit(7);' : ''}
    ${buildMode !== 'missing' ? `fs.mkdirSync(out,{recursive:true});fs.copyFileSync(${JSON.stringify(statsPath)},path.join(out,'preview-stats.json'));` : ''}
    ${buildMode === 'mutate' ? `fs.appendFileSync('src/Button.js','// changed while building');` : ''}`);
  const configPath = path.join(dir, 'config.json');
  const config = { storybookBaseDir: '.', storybookConfigDir: '.storybook', chromatic: [process.execPath, realCli ? process.env.CHROMATIC_TEST_BIN : cliPath], build: { command: [process.execPath, builder, '{outputDir}'], cwd: '.' }, statsFile: '{outputDir}/preview-stats.json' };
  fs.writeFileSync(configPath, JSON.stringify(config));
  return { dir, repo, out, write, git, statsPath, configPath, config, options: { repo, out, config: configPath } };
}

test('minor and patch updates within major 18 run and retain the exact version', (t) => {
  for (const cliVersion of ['18.0.0', '18.9.6', '18.10.0']) {
    const f = fixture(t, { cliVersion });
    f.write('src/Button.js', 'export const value = 2;\n');
    const result = check(f.options);
    assert.equal(result.status, 'clear', result.error);
    assert.equal(result.chromaticVersion, cliVersion);
    assert.equal(result.build.status, 'passed');
  }
});

test('unsupported versions fail before building even with advisory exit policy', (t) => {
  for (const cliVersion of ['17.9.6', '19.0.0', '18.9.6-canary.1', 'yarn run v1.22.22\n18.9.6']) {
    const f = fixture(t, { cliVersion });
    const result = check({ ...f.options, 'fail-on': 'never' });
    assert.equal(result.status, 'unable-to-verify');
    assert.equal(result.exitCode, 2);
    assert.equal(result.build.status, 'pending');
    assert.equal(fs.existsSync(path.join(f.out, 'storybook')), false);
    assert.match(result.error, /supports stable Chromatic 18\.x/);
  }
});

test('example CLI argv forwards version and trace arguments to the installed binary', (t) => {
  const f = fixture(t);
  const example = JSON.parse(fs.readFileSync(new URL('../skills/chromatic-turbosnap-check/assets/preflight.config.example.json', import.meta.url), 'utf8'));
  f.write('node_modules/chromatic/dist/bin.cjs', fs.readFileSync(f.config.chromatic[1], 'utf8'));
  f.write('.gitignore', 'ignored/\nnode_modules/\n');
  f.write('src/Button.js', 'export const value = 2;\n');
  f.config.chromatic = example.chromatic;
  fs.writeFileSync(f.configPath, JSON.stringify(f.config));
  const result = check(f.options);
  assert.equal(result.status, 'clear', result.error);
  assert.equal(result.chromaticVersion, '18.9.5');
  assert.ok(result.traces.length > 0);
});

test('fresh build records complete evidence for a harmless working-tree edit', (t) => {
  const f = fixture(t); f.write('src/Button.js', 'export const value = 2;\n');
  const result = check(f.options);
  assert.equal(result.status, 'clear', result.error); assert.equal(result.build.status, 'passed');
  assert.equal(result.changedFiles[0].path, 'src/Button.js'); assert.equal(result.traces.length, 1);
  assert.ok(fs.existsSync(path.join(f.out, 'report.json')));
});
test('build failure and missing stats cannot reuse an old artifact', (t) => {
  for (const buildMode of ['fail', 'missing']) {
    const f = fixture(t, { buildMode }); f.write('src/Button.js', 'export const value = 2;');
    const result = check(f.options); assert.equal(result.status, 'unable-to-verify'); assert.equal(result.exitCode, 2);
  }
});
test('source changed during build invalidates verification', (t) => {
  const f = fixture(t, { buildMode: 'mutate' });
  const result = check(f.options); assert.equal(result.exitCode, 2); assert.match(result.error, /changed during the build/);
});
test('new config helper is flagged without requiring prior stats', (t) => {
  const f = fixture(t); f.write('.storybook/adapter.js', 'export const value = 2;');
  const result = check(f.options); assert.equal(result.status, 'review', result.error);
  assert.ok(result.findings.some((x) => x.code === 'CONFIG_MODULE_ADDED'));
});
test('new multiline preview barrel import is flagged', (t) => {
  const f = fixture(t); f.write('.storybook/preview.js', "import {\n A\n} from '../src/index';\nexport default {};\n");
  const result = check(f.options); const finding = result.findings.find((x) => x.code === 'PREVIEW_IMPORT_ADDED');
  assert.ok(finding, result.error); assert.equal(finding.barrelCandidate, true);
});
test('preview changes from inline type-only to runtime imports are flagged', (t) => {
  const f = fixture(t); f.write('.storybook/preview.js', "import { type Foo } from '../src/barrel';");
  f.git('add', '.'); f.git('commit', '-m', 'type baseline');
  f.write('.storybook/preview.js', "import { Foo } from '../src/barrel';");
  const result = check(f.options); assert.ok(result.findings.some((x) => x.code === 'PREVIEW_IMPORT_ADDED'), result.error);
});
test('new require in preview and nested entrypoint-named helpers both receive review', (t) => {
  const f = fixture(t); f.write('.storybook/preview.js', "const x = require('../src/index');");
  f.write('.storybook/helpers/main.js', 'export const x = 1;');
  const result = check(f.options);
  assert.ok(result.findings.some((x) => x.code === 'PREVIEW_IMPORT_ADDED'), result.error);
  assert.ok(result.findings.some((x) => x.code === 'CONFIG_MODULE_ADDED'));
});
test('shared config outside the Storybook base remains within the repository', (t) => {
  const f = fixture(t); f.write('apps/web/placeholder.js', '');
  f.config.storybookBaseDir = 'apps/web'; f.config.storybookConfigDir = '../../.storybook';
  fs.writeFileSync(f.configPath, JSON.stringify(f.config));
  f.write('.storybook/helper.js', 'export const x = 1;');
  const result = check(f.options);
  assert.notEqual(result.status, 'unable-to-verify', result.error);
  assert.ok(result.findings.some((x) => x.code === 'CONFIG_MODULE_ADDED'));
});
test('ordinary application dependency bail is actionable', (t) => {
  const f = fixture(t, { bail: true }); f.write('src/Button.js', 'export const value = 2;');
  const result = check(f.options); assert.equal(result.status, 'bail', result.error);
  assert.equal(result.configurationPaths[0].boundary, '.storybook/preview.js');
});
test('intentional direct preview edit is not automatically a structural regression', (t) => {
  const f = fixture(t, { bail: true }); f.write('.storybook/preview.js', 'export default {theme: "dark"};');
  const result = check(f.options); assert.equal(result.status, 'clear', result.error);
  assert.equal(result.traces[0].bailed, true); assert.ok(result.notes.some((x) => x.includes('not an architectural regression')));
});
test('package changes are separated from structural findings', (t) => {
  const f = fixture(t); f.write('package.json', '{"private":true,"description":"changed"}');
  const result = check(f.options); assert.equal(result.status, 'clear', result.error);
  assert.deepEqual(result.packageChanges, ['package.json']); assert.equal(result.traces.length, 0);
});
test('staged, unstaged, untracked, renamed, and spaced paths survive Git collection', (t) => {
  const f = fixture(t); f.git('mv', 'src/Button.js', 'src/Button renamed.js');
  f.write('src/new file.js', 'export const value = 3;'); f.write('package.json', '{"private":false}');
  const result = check(f.options); assert.equal(result.status, 'clear', result.error);
  assert.ok(result.changedFiles.some((x) => x.oldPath === 'src/Button.js' && x.path === 'src/Button renamed.js'));
  assert.ok(result.traces[0].command.includes('src/new file.js'));
});
test('committed changes use an explicit previous revision', (t) => {
  const f = fixture(t); f.write('src/Button.js', 'export const value = 2;'); f.git('add', '.'); f.git('commit', '-m', 'edit');
  const result = check({ ...f.options, base: 'HEAD^' }); assert.equal(result.changedFiles.length, 1, result.error);
});
test('artifact replay does not claim a successful build', (t) => {
  const f = fixture(t); f.write('src/Button.js', 'export const value = 2;');
  const result = check({ ...f.options, stats: f.statsPath }); assert.equal(result.status, 'clear', result.error);
  assert.equal(result.mode, 'artifact-replay'); assert.equal(result.build.status, 'not-run');
});
test('nonempty evidence directories are never overwritten', (t) => {
  const f = fixture(t); fs.mkdirSync(f.out); fs.writeFileSync(path.join(f.out, 'keep'), 'preserve');
  assert.throws(() => check(f.options), /new or empty/);
});

for (const bail of [false, true]) {
  test(`real installed Chromatic trace: ${bail ? 'configuration bail' : 'isolated change'}`, { skip: !process.env.CHROMATIC_TEST_BIN }, (t) => {
    const f = fixture(t, { bail, realCli: true }); f.write('src/Button.js', 'export const value = 2;');
    const result = check(f.options); assert.equal(result.status, bail ? 'bail' : 'clear', result.error);
    assert.equal(isSupportedCliVersion(result.chromaticVersion), true);
    t.diagnostic(`Chromatic ${result.chromaticVersion}`);
  });
}


test('audit reports current global exposure and hypothetical bails without inventing a regression', (t) => {
  const f = fixture(t, { bail: true });
  const result = check({ ...f.options, audit: true });
  assert.equal(result.status, 'audited');
  assert.equal(result.exitCode, 0);
  assert.equal(result.changedFiles.length, 0);
  assert.equal(result.audit.uniqueProbeCount, 1);
  assert.equal(result.audit.confirmedBailProbeCount, 1);
  assert.deepEqual(result.audit.previewReachableApplicationFiles, ['src/Button.js']);
  assert.equal(result.audit.previewImports[0].probe.input, 'src/Button.js');
  assert.equal(result.audit.previewImports[0].pathsToConfiguration[0].boundary, '.storybook/preview.js');
  assert.equal(f.git('status', '--porcelain'), '');
});
test('artifact audit does not inspect unrelated checkout source', (t) => {
  const f = fixture(t, { bail: true });
  f.write('.storybook/preview.js', 'this is not valid source');
  const result = check({ ...f.options, audit: true, stats: f.statsPath });
  assert.equal(result.status, 'audited');
  assert.equal(result.audit.sourceImportsInspected, false);
  assert.deepEqual(result.audit.sourceImports, []);
  assert.equal(result.build.status, 'not-run');
});
test('audit fails explicitly if preview coverage or native probe output is unavailable', (t) => {
  const f = fixture(t, { bail: true, cliVersion: '18.9.6' });
  fs.writeFileSync(path.join(f.dir, 'cli.mjs'), `console.log(process.argv.includes('--version') ? '18.9.6' : 'unknown output');`);
  const failed = check({ ...f.options, audit: true });
  assert.equal(failed.status, 'unable-to-verify');
  assert.equal(failed.traces[0].files[0], 'src/Button.js');
  assert.ok(fs.existsSync(failed.traces[0].log));
  assert.ok(failed.error.includes(failed.traces[0].log));
  const g = fixture(t);
  fs.writeFileSync(g.statsPath, JSON.stringify({ modules: [module('./src/A.js', ['./src/A.stories.js']), module('./src/A.stories.js')] }));
  const result = check({ ...g.options, audit: true, stats: g.statsPath });
  assert.equal(result.status, 'unable-to-verify');
  assert.match(result.error, /No preview/);
});
test('hook policies preserve findings and never treat verification failure as success', (t) => {
  const f = fixture(t);
  f.write('.storybook/helper.js', 'export const value = 1;');
  const result = check({ ...f.options, 'fail-on': 'bail' });
  assert.equal(result.status, 'review');
  assert.equal(result.exitCode, 0);
  assert.ok(result.findings.some((finding) => finding.code === 'CONFIG_MODULE_ADDED'));
  for (const policy of ['review', 'bail', 'never']) assert.equal(exitForStatus('unable-to-verify', policy), 2);
  assert.equal(exitForStatus('bail', 'bail'), 1);
  assert.equal(exitForStatus('bail', 'never'), 0);
  assert.equal(exitForStatus('review', 'review'), 1);
  assert.throws(() => exitForStatus('clear', 'anything'), /fail-on/);
});

test('barrel evidence requires real runtime reexports, not examples or types', () => {
  assert.equal(hasRuntimeReexports('// export * from "./all";\nexport const x = "export * from \'./all\'";', 'theme.js'), false);
  assert.equal(hasRuntimeReexports('export type {Theme} from "./types";', 'theme.ts'), false);
  assert.equal(hasRuntimeReexports('export {theme} from "./theme";', 'barrel.ts'), true);
});

test('repository-root configuration fails explicitly instead of returning a clear check', (t) => {
  const f = fixture(t);
  f.config.storybookConfigDir = '.';
  fs.writeFileSync(f.configPath, JSON.stringify(f.config));
  const result = check(f.options);
  assert.equal(result.status, 'unable-to-verify');
  assert.equal(result.exitCode, 2);
  assert.match(result.error, /Repository-root/);
});
