#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { RELEASE, TESTED_CLI, slash, inside, normalizeFile, isPackageFile, isSource, isPreview, graphFromStats, reachable, configPaths, changedRuntimeImports, resolveImport, parseTrace, exitForStatus, hasRuntimeReexports } from './preflight-lib.mjs';

import { auditGraph } from './audit.mjs';

const HELP = `TurboSnap preflight ${RELEASE}

  node preflight.mjs --audit --config <json> [--stats <json>]
  node preflight.mjs --config <json> [--base <ref> | --merge-base <ref>]
  node preflight.mjs --config <json> --stats <json> [--changes <json>]

--audit              Audit current global dependencies without a change set.
--fail-on <policy>   Check only: review (default), bail, or never; failures exit 2.
--repo <directory>   Git working tree (default: current directory).
--base <ref>         Compare working tree with ref (default: HEAD).
--merge-base <ref>   Compare with the merge base of HEAD and ref.
--stats <json>       Replay existing stats; never claims a fresh build.
--changes <json>     Explicit array of repository-relative paths; requires --stats.
--out <directory>    New, empty evidence directory (default: temporary directory).
--help              Show this help.

Check exit 0/1 follows --fail-on. Audit completion exits 0, even with global inputs.
Exit 2 always means unable to verify. Status is preserved regardless of exit policy.
No previous stats, Chromatic upload, credentials, or capture run is required.
`;

function args(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (name === '--help') { result.help = true; continue; }
    if (name === '--audit') { result.audit = true; continue; }
    if (!['--config', '--repo', '--base', '--merge-base', '--stats', '--changes', '--out', '--fail-on'].includes(name) || !argv[i + 1]) throw new Error(`Unknown or incomplete option: ${name}`);
    if (result[name.slice(2)] !== undefined) throw new Error(`Duplicate option: ${name}`);
    result[name.slice(2)] = argv[++i];
  }
  if (result.base && result['merge-base']) throw new Error('Choose --base or --merge-base.');
  if (result.changes && !result.stats) throw new Error('--changes is only valid for artifact replay with --stats.');
  if (result.audit && (result.base || result['merge-base'] || result.changes || result['fail-on'])) throw new Error('Audit does not accept a Git change scope or hook failure policy.');
  if (result['fail-on']) exitForStatus('clear', result['fail-on']);
  return result;
}

function run(command, cwd, { log, timeout = 120_000, allowFailure = false } = {}) {
  if (!Array.isArray(command) || !command.length || command.some((arg) => typeof arg !== 'string' || arg.includes('\0'))) throw new Error('Commands must be nonempty arrays of strings.');
  const fd = log ? fs.openSync(log, 'w') : undefined;
  let result;
  try {
    result = spawnSync(command[0], command.slice(1), { cwd, shell: false, timeout, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }, stdio: log ? ['ignore', fd, fd] : ['ignore', 'pipe', 'pipe'] });
  } finally { if (fd !== undefined) fs.closeSync(fd); }
  if (result.error) throw new Error(`${path.basename(command[0])}: ${result.error.message}`);
  if (result.signal) throw new Error(`${path.basename(command[0])} terminated by ${result.signal}.`);
  if (result.status !== 0 && !allowFailure) throw new Error(`${path.basename(command[0])} failed (exit ${result.status}). ${log ? `See ${log}` : result.stderr?.trim()}`);
  return result;
}

function git(repo, ...argv) { return run(['git', ...argv], repo).stdout; }
function json(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function read(file) { try { return fs.readFileSync(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return ''; throw error; } }
function command(value, label) {
  if (!Array.isArray(value) || !value.length || value.some((x) => typeof x !== 'string' || !x || x.includes('\0'))) throw new Error(`${label} must be a nonempty argv array.`);
  return value;
}
function rootPath(repo, value, label) {
  const relative = value === '.' ? '.' : normalizeFile(value);
  const absolute = path.resolve(repo, relative);
  if (!fs.statSync(absolute).isDirectory()) throw new Error(`${label} is not a directory: ${absolute}`);
  return { relative, absolute };
}

function collect(repo, baseline, exclude) {
  const fields = git(repo, 'diff', '--no-ext-diff', '--no-textconv', '--name-status', '-z', '--find-renames', baseline, '--').split('\0');
  const changes = [];
  for (let i = 0; i < fields.length && fields[i];) {
    const status = fields[i++]; const first = normalizeFile(fields[i++]);
    if (/^[RC]/.test(status)) { const next = normalizeFile(fields[i++]); changes.push({ status: status[0], path: next, oldPath: first }); }
    else changes.push({ status: status[0], path: first });
  }
  for (const file of git(repo, 'ls-files', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean)) {
    if (!exclude(file)) changes.push({ status: 'A', path: normalizeFile(file) });
  }
  return changes.filter((entry) => !exclude(entry.path));
}

function fingerprint(repo, exclude) {
  const hasher = crypto.createHash('sha256');
  hasher.update(git(repo, 'rev-parse', 'HEAD'));
  // Include content, not only paths or mtimes, so an edit during the build invalidates the check.
  const files = new Set(git(repo, 'diff', '--no-ext-diff', '--no-textconv', '--name-only', '-z', 'HEAD', '--').split('\0').filter(Boolean));
  for (const file of git(repo, 'ls-files', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean)) files.add(file);
  for (const file of [...files].filter((file) => !exclude(file)).sort()) {
    hasher.update(file); const absolute = path.join(repo, file);
    if (fs.existsSync(absolute)) { const stat = fs.lstatSync(absolute); hasher.update(stat.isSymbolicLink() ? fs.readlinkSync(absolute) : fs.readFileSync(absolute)); }
    else hasher.update('<deleted>');
  }
  return hasher.digest('hex');
}

function previousSource(repo, baseline, file) {
  const found = run(['git', 'show', `${baseline}:${file}`], repo, { allowFailure: true });
  return found.status === 0 ? found.stdout : '';
}

export function check(options) {
  const repo = git(path.resolve(options.repo || '.'), 'rev-parse', '--show-toplevel').trim();
  if (!options.config) throw new Error('--config is required. See reference/cli.md.');
  const configFile = path.resolve(options.config);
  const configText = fs.readFileSync(configFile, 'utf8');
  const config = JSON.parse(configText);
  const baseRelative = config.storybookBaseDir === '.' || !config.storybookBaseDir ? '.' : normalizeFile(config.storybookBaseDir);
  const base = options.stats ? { relative: baseRelative, absolute: path.resolve(repo, baseRelative) } : rootPath(repo, baseRelative, 'storybookBaseDir');
  const configuredDir = config.storybookConfigDir || '.storybook';
  if (typeof configuredDir !== 'string' || configuredDir.includes('\0') || path.posix.isAbsolute(slash(configuredDir)) || /^[A-Za-z]:/.test(configuredDir)) throw new Error('storybookConfigDir must be relative to storybookBaseDir.');
  const configRelative = normalizeFile(path.posix.join(base.relative, slash(configuredDir)));
  const cli = command(config.chromatic, 'chromatic');
  const untraced = config.untraced || [];
  if (!Array.isArray(untraced) || untraced.some((x) => typeof x !== 'string')) throw new Error('untraced must be an array of strings.');
  let out;
  if (options.out) {
    out = path.resolve(options.out);
    if (fs.existsSync(out) && fs.readdirSync(out).length) throw new Error('--out must be new or empty; prior evidence is never overwritten.');
    fs.mkdirSync(out, { recursive: true });
  } else out = fs.mkdtempSync(path.join(os.tmpdir(), 'turbosnap-preflight-'));
  const excluded = (file) => inside(slash(path.resolve(repo, file)), slash(out));
  const result = { schemaVersion: 1, version: RELEASE, status: 'unable-to-verify', workflow: options.audit ? 'audit' : 'check', failOn: options.audit ? null : options['fail-on'] || 'review', mode: options.stats ? 'artifact-replay' : 'fresh-build', repo, evidenceDirectory: out, findings: [], notes: [], traces: [], build: { status: options.stats ? 'not-run' : 'pending' } };
  try {
    if (configRelative === '.') throw new Error('Repository-root Storybook configuration is unsupported by this validated tracer; cannot verify its configuration boundaries.');
    const reference = git(repo, 'rev-parse', '--verify', '--end-of-options', `${options['merge-base'] || options.base || 'HEAD'}^{commit}`).trim();
    const baseline = options['merge-base'] ? git(repo, 'merge-base', 'HEAD', reference).trim() : reference;
    result.scope = { baseline, requested: options['merge-base'] ? `merge-base:${options['merge-base']}` : options.base || 'HEAD', head: git(repo, 'rev-parse', 'HEAD').trim(), includesWorkingTree: !options.changes };
    const changes = options.audit ? [] : options.changes ? json(path.resolve(options.changes)).map((file) => ({ path: normalizeFile(file), status: 'supplied' })) : collect(repo, baseline, excluded);
    if (options.audit) result.scope = { head: result.scope.head, requested: 'current-graph', includesWorkingTree: true };
    result.changedFiles = changes;
    const before = fingerprint(repo, excluded);
    const version = run([...cli, '--version'], repo).stdout.trim();
    result.chromaticVersion = version;
    if (version !== TESTED_CLI) throw new Error(`This release validates Chromatic ${TESTED_CLI}; command resolved to ${version}. Pin the configured CLI to ${TESTED_CLI}.`);
    let statsPath;
    if (options.stats) {
      statsPath = path.resolve(options.stats);
      result.notes.push('Artifact replay: source/stats correspondence and Storybook build success are not verified.');
    } else {
      const outputDir = path.join(out, 'storybook');
      const build = command(config.build?.command, 'build.command');
      if (!build.some((arg) => arg.includes('{outputDir}')) || !config.statsFile?.includes('{outputDir}')) throw new Error('Fresh checks require {outputDir} in both build.command and statsFile to prevent stale stats.');
      const cwd = rootPath(repo, config.build.cwd || base.relative, 'build.cwd').absolute;
      const expanded = build.map((arg) => arg.replaceAll('{outputDir}', outputDir));
      statsPath = path.resolve(config.statsFile.replaceAll('{outputDir}', outputDir));
      if (!inside(slash(statsPath), slash(outputDir))) throw new Error('statsFile must stay inside the fresh {outputDir}.');
      result.build = { status: 'running', command: expanded, cwd, log: path.join(out, 'build.log') };
      const timeout = config.build.timeoutMs || 600_000;
      if (!Number.isSafeInteger(timeout) || timeout < 1000 || timeout > 3_600_000) throw new Error('build.timeoutMs must be between 1000 and 3600000.');
      run(expanded, cwd, { log: result.build.log, timeout });
      result.build.status = 'passed';
      if (before !== fingerprint(repo, excluded)) throw new Error('Source inputs changed during the build. Re-run after edits or code generation finish.');
    }
    const statsBytes = fs.readFileSync(statsPath);
    result.stats = { path: statsPath, sha256: hash(statsBytes) };
    const graph = graphFromStats(JSON.parse(statsBytes), { base: base.relative, repo, configDir: configRelative });
    const allPaths = [...new Set(changes.flatMap((entry) => entry.oldPath ? [entry.oldPath, entry.path] : [entry.path]))].sort();
    const packages = allPaths.filter(isPackageFile);
    const directConfig = allPaths.filter((file) => !isPackageFile(file) && inside(file, configRelative));
    const ordinary = allPaths.filter((file) => !isPackageFile(file) && !inside(file, configRelative));
    result.packageChanges = packages;
    result.unmatchedFiles = allPaths.filter((file) => !graph.children.has(file));
    result.notes.push('This checks source/configuration dependency risk, not ancestor selection, package-content diffs, externals, or server capture eligibility.');
    if (packages.length) result.notes.push('Package and lockfile changes are expected dependency inputs. They are listed separately because chromatic trace cannot evaluate their content differences.');
    if (untraced.length) result.notes.push('Configured untraced patterns apply to CLI traces. Supplementary graph paths are unsuppressed and are review evidence, not additional CLI verdicts.');
    if (changes.some((entry) => entry.status === 'D' || entry.oldPath)) result.notes.push('Deleted/renamed source paths may be absent from the new graph. Their historical impact is not assessed without old stats.');
    function traceFiles(name, inputs, index) {
      const log = path.join(out, `trace-${name}-${index + 1}.log`);
      const argv = [...cli, 'trace', '--stats-file', statsPath, '--storybook-base-dir', base.relative, '--storybook-config-dir', config.storybookConfigDir || '.storybook', '--mode', 'compact', ...untraced.flatMap((glob) => ['--untraced', glob]), '--', ...inputs];
      const evidence = { group: name, files: inputs, command: argv, log };
      result.traces.push(evidence);
      try {
        const traced = run(argv, repo, { log, allowFailure: true });
        const outcome = parseTrace(fs.readFileSync(log, 'utf8'), traced.status);
        Object.assign(evidence, outcome);
        return { log, ...outcome };
      } catch (error) {
        evidence.error = error.message;
        throw new Error(`${error.message} Input(s): ${inputs.join(', ')}. Log: ${log}`);
      }
    }
    for (const [name, files] of [['application', ordinary], ['configuration', directConfig]]) {
      // Avoid command-line limits without losing any changed paths. Each batch is reported separately.
      const batches = []; let batch = []; let length = 0;
      for (const file of files) { if (length + file.length > 16_000 && batch.length) { batches.push(batch); batch = []; length = 0; } batch.push(file); length += file.length + 1; }
      if (batch.length) batches.push(batch);
      for (const [index, inputs] of batches.entries()) {
        const outcome = traceFiles(name, inputs, index);
        const { log } = outcome;
        if (outcome.bailed && name === 'application') result.findings.push({ code: 'APPLICATION_CHANGE_REACHES_CONFIG', severity: 'bail', boundary: outcome.boundary, message: 'An application change reaches Storybook configuration and requires a full capture.', log });
        if (outcome.bailed && name === 'configuration') result.notes.push(`Direct Storybook configuration changes require a full capture (${outcome.boundary}); this alone is not an architectural regression.`);
      }
    }
    result.configurationPaths = configPaths(graph, ordinary);
    for (const entry of changes) {
      const configEntrypoint = path.posix.dirname(entry.path) === configRelative && /\/(?:main|preview|manager)\.[cm]?[jt]sx?$/.test(entry.path);
      if (inside(entry.path, configRelative) && isSource(entry.path) && ['A', 'R', 'C'].includes(entry.status) && !configEntrypoint) {
        result.findings.push({ code: 'CONFIG_MODULE_ADDED', severity: 'review', file: entry.path, message: 'A new source module lives inside the Storybook config directory. Consider whether application/fixture code belongs outside it.', reachableApplicationModules: reachable(graph, entry.path).length });
      }
      if (!isPreview(entry.path, configRelative) || entry.status === 'D' || entry.status === 'supplied') continue;
      const source = read(path.join(repo, entry.path));
      for (const { specifier, added } of changedRuntimeImports(previousSource(repo, baseline, entry.oldPath || entry.path), source, entry.path, entry.oldPath || entry.path)) {
        const target = resolveImport(graph, entry.path, specifier);
        const content = target && graph.real(target) ? read(path.join(repo, target)) : '';
        const barrel = /(?:^|\/)index(?:\.[cm]?[jt]sx?)?$/.test(specifier) || !!target && /\/index\.[cm]?[jt]sx?$/.test(target) || !!target && /\.[cm]?[jt]sx?$/.test(target) && hasRuntimeReexports(content, target);
        result.findings.push({ code: added ? 'PREVIEW_IMPORT_ADDED' : 'PREVIEW_IMPORT_CHANGED', severity: 'review', file: entry.path, specifier, target: target || null, barrelCandidate: barrel, reachableApplicationModules: target ? reachable(graph, target).length : null, message: 'A runtime import/re-export was added or its bindings changed in preview. Review its current dependency footprint; this is not a measured increase against an old graph.' });
      }
    }
    result.health = { previewImports: [] };
    for (const file of graph.children.keys()) {
      if (!isPreview(file, configRelative)) continue;
      for (const dependency of graph.children.get(file)) result.health.previewImports.push({ preview: file, dependency, reachableApplicationModules: reachable(graph, dependency).length });
    }
    if (options.audit) {
      let probeIndex = 0;
      result.audit = auditGraph(graph, repo, configRelative, { sourceVerified: !options.stats, trace: (input) => traceFiles('audit-probe', [input], probeIndex++) });
      result.notes.push('Audit probes use hypothetical changed files. A confirmed bail applies to the named probe; dependency counts are current measurements, not regressions.');
      if (options.stats) result.notes.push('Artifact audit: checkout source imports and barrel contents are not inspected; graph edges and filename heuristics are available.');
    }
    result.health.previewImports.sort((a, b) => b.reachableApplicationModules - a.reachableApplicationModules);
    if (before !== fingerprint(repo, excluded) || fs.readFileSync(configFile, 'utf8') !== configText || hash(fs.readFileSync(statsPath)) !== result.stats.sha256) throw new Error('Inputs changed during verification; rerun the check.');
    result.status = options.audit ? 'audited' : result.findings.some((f) => f.severity === 'bail') ? 'bail' : result.findings.length ? 'review' : 'clear';
    result.exitCode = exitForStatus(result.status, options['fail-on'] || 'review');
    result.inputFingerprint = before;
  } catch (error) {
    result.status = 'unable-to-verify'; result.exitCode = 2; result.error = error.message;
    if (result.build.status === 'running') result.build.status = 'failed';
  }
  fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(result, null, 2)}\n`);
  const lines = [`# TurboSnap preflight: ${result.status}`, '', `Mode: ${result.mode}. CLI: ${result.chromaticVersion || 'unknown'}.`, '', `Build: ${result.build.status}. Changed paths: ${result.changedFiles?.length ?? 'unknown'}.`, ''];
  if (result.audit) {
    lines.push(`Preview imports: ${result.audit.previewImports.length}. Reachable application modules: ${result.audit.previewReachableApplicationModules}/${result.audit.applicationModuleCount}.`, '', `Hypothetical CLI probes: ${result.audit.uniqueProbeCount}; confirmed configuration bails: ${result.audit.confirmedBailProbeCount}.`, '');
    for (const item of result.audit.previewImports) lines.push(`- ${item.dependency}: ${item.reachableApplicationModules} application modules; probe ${item.probe?.input || 'none'}: ${item.probe ? (item.probe.bailed ? 'bail' : 'no bail') : 'not applicable'}.`);
    lines.push('');
  }
  if (result.error) lines.push(`Unable to verify: ${result.error}`, '');
  for (const finding of result.findings) lines.push(`- **${finding.code}**: ${finding.message} ${finding.file || finding.boundary || ''}`);
  lines.push('', 'See report.json for all configuration paths, import footprints, commands, and trace logs.', '');
  for (const note of result.notes) lines.push(`- ${note}`);
  fs.writeFileSync(path.join(out, 'report.md'), `${lines.join('\n')}\n`);
  return result;
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  try {
    const options = args(process.argv.slice(2));
    if (options.help) console.log(HELP);
    else {
      const result = check(options);
      console.log(`TurboSnap preflight: ${result.status} (${result.mode})`);
      if (result.error) console.error(result.error);
      for (const finding of result.findings) console.log(`${finding.code}: ${finding.file || finding.boundary || ''}`);
      console.log(`Report: ${path.join(result.evidenceDirectory, 'report.json')}`);
      process.exitCode = result.exitCode;
    }
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
