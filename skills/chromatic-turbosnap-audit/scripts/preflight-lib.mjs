import path from 'node:path';
import babelParser from './vendor/babel-parser.cjs';

export const RELEASE = '0.2.0';
export const SUPPORTED_CLI_MAJOR = 18;

export function isSupportedCliVersion(version) {
  if (typeof version !== 'string') return false;
  // Accept stable SemVer releases (including build metadata), not prereleases
  // or wrapper output such as a package manager's banner/version.
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(version);
  return match !== null && match[1] === String(SUPPORTED_CLI_MAJOR);
}
export const slash = (value) => value.replaceAll('\\', '/');
export const inside = (file, dir) => file === dir || file.startsWith(`${dir}/`);
export const isPackageFile = (file) => /(^|\/)(package\.json|yarn\.lock|package-lock\.json|pnpm-lock\.yaml|npm-shrinkwrap\.json|bun\.lockb?)$/.test(file);
export const isSource = (file) => /\.(?:[cm]?[jt]sx?|vue|svelte|css|scss|sass|less|mdx)$/.test(file);
export const isPreview = (file, configDir) => path.posix.dirname(file) === configDir && /\/preview\.[cm]?[jt]sx?$/.test(file);

export function exitForStatus(status, failOn = 'review') {
  if (!['review', 'bail', 'never'].includes(failOn)) throw new Error('--fail-on must be review, bail, or never.');
  if (status === 'unable-to-verify') return 2;
  if (status === 'bail') return failOn === 'never' ? 0 : 1;
  return status === 'review' && failOn === 'review' ? 1 : 0;
}

export function normalizeFile(value) {
  if (typeof value !== 'string' || !value || value.includes('\0')) throw new Error('Expected a nonempty file path.');
  const result = path.posix.normalize(slash(value).replace(/^\.\//, ''));
  if (path.posix.isAbsolute(result) || result === '..' || result.startsWith('../') || /^[A-Za-z]:/.test(result)) {
    throw new Error(`Expected a repository-relative path: ${value}`);
  }
  return result;
}

function modulePath(name, base, repo) {
  if (!name || typeof name !== 'string') return undefined;
  let clean = slash(name.replace(/\0/g, '').replace(/ \+ \d+ modules?$/, ''));
  if (/virtual:|^data:|^external | lazy |\|lazy\||^webpack\//.test(clean)) return `virtual:${clean}`;
  // A loader chain or query is a module variant, but its source file has one Git identity.
  clean = clean.slice(clean.lastIndexOf('!') + 1).split('?')[0];
  if (path.posix.isAbsolute(clean)) {
    const root = slash(repo).replace(/\/$/, '');
    if (!inside(clean, root)) return `external:${clean}`;
    return clean.slice(root.length + 1);
  }
  return path.posix.normalize(path.posix.join(base, clean));
}

export function graphFromStats(stats, { base = '.', repo, configDir }) {
  if (!stats || !Array.isArray(stats.modules) || stats.modules.length === 0) {
    throw new Error('Unsupported or empty stats: expected a nonempty modules array. Supply preview-stats.json.');
  }
  const children = new Map();
  const parents = new Map();
  const requests = new Map();
  const names = new Map();
  const stories = new Set();
  const add = (key) => { if (key && !children.has(key)) { children.set(key, new Set()); parents.set(key, new Set()); } };
  const edge = (from, to, request) => {
    if (!from || !to || from === to) return;
    add(from); add(to); children.get(from).add(to); parents.get(to).add(from);
    if (request) { if (!requests.has(from)) requests.set(from, new Map()); requests.get(from).set(request, to); }
  };
  const flat = [];
  const visit = (module, container) => {
    if (!module || typeof module.name !== 'string') throw new Error('Unsupported stats module without a name.');
    const key = modulePath(module.nameForCondition || module.name, base, repo);
    add(key); names.set(module.name, key); if (module.id != null) names.set(String(module.id), key);
    flat.push({ module, key });
    if (container) edge(container, key);
    for (const child of module.modules || []) visit(child, key);
  };
  for (const module of stats.modules) visit(module);
  let reasonCount = 0;
  for (const { module, key } of flat) {
    if (/\.(?:stories|story)\.[cm]?[jt]sx?$|\.mdx$/.test(key)) stories.add(key);
    for (const reason of module.reasons || []) {
      if (!reason.moduleName) continue;
      reasonCount++;
      const from = names.get(reason.moduleName) || modulePath(reason.moduleName, base, repo);
      edge(from, key, reason.userRequest);
      if (/storybook-stories\.[cm]?js|generated-stories-entry\.[cm]?js|include:.*stories/.test(reason.moduleName)) stories.add(key);
    }
  }
  if (!reasonCount) throw new Error('Stats contain no importer relationships; cannot verify dependency impact.');
  const real = (file) => !/^(?:virtual:|external:)/.test(file) && !/(^|\/)node_modules\//.test(file) && !file.startsWith('../');
  const config = (file) => inside(file, configDir) && !/(?:^|\/)(?:generated-stories-entry|storybook-(?:stories|config-entry))\./.test(file);
  return { children, parents, requests, stories, real, config };
}

export function reachable(graph, start) {
  const found = new Set();
  const stack = [start];
  while (stack.length) {
    const file = stack.pop();
    if (found.has(file)) continue;
    found.add(file);
    for (const child of graph.children.get(file) || []) stack.push(child);
  }
  return [...found].filter(graph.real).sort();
}

export function configPaths(graph, changed) {
  const results = [];
  for (const file of changed) {
    if (!graph.parents.has(file)) continue;
    const previous = new Map([[file, null]]);
    const queue = [file];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      if (graph.config(current)) {
        const route = []; let next = current;
        while (next !== null) { route.push(next); next = previous.get(next); }
        results.push({ changedFile: file, boundary: current, importPath: route });
        continue;
      }
      // Story index imports are runtime wiring, not a global dependency of every story.
      if (graph.stories.has(current)) continue;
      for (const parent of graph.parents.get(current) || []) {
        if (!previous.has(parent)) { previous.set(parent, current); queue.push(parent); }
      }
    }
  }
  return results;
}

// Parse source without executing it. Type-only syntax never becomes a runtime import.
export function runtimeImports(source, filename = 'preview.tsx') {
  const ast = babelParser.parse(source, {
    sourceType: 'unambiguous', sourceFilename: filename,
    plugins: ['typescript', ...(/\.[cm]?ts$/.test(filename) ? [] : ['jsx']), 'decorators-legacy'],
    allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true,
  });
  const found = new Map();
  const literal = (node) => node?.type === 'StringLiteral' ? node.value
    : node?.type === 'TemplateLiteral' && node.expressions.length === 0 ? node.quasis[0].value.cooked : undefined;
  const add = (specifier, kind, bindings = []) => {
    if (typeof specifier !== 'string') return;
    if (!found.has(specifier)) found.set(specifier, new Set());
    found.get(specifier).add(JSON.stringify([kind, [...bindings].sort()]));
  };
  const stack = [ast.program];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (['TSImportType', 'TSTypeQuery'].includes(node.type)) continue;
    if (node.type === 'ImportDeclaration') {
      if (node.importKind === 'type') continue;
      const values = node.specifiers.filter((item) => item.importKind !== 'type');
      if (!node.specifiers.length || values.length) add(node.source.value, 'import', values.map((item) => `${item.type}:${item.imported?.name || item.imported?.value || ''}:${item.local.name}`));
      continue;
    }
    if (node.type === 'TSImportEqualsDeclaration') {
      if (node.importKind !== 'type' && !node.isTypeOnly && node.moduleReference.type === 'TSExternalModuleReference') add(literal(node.moduleReference.expression), 'require');
      continue;
    }
    if ((node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source) {
      if (node.exportKind === 'type') continue;
      const values = (node.specifiers || []).filter((item) => item.exportKind !== 'type');
      if (!node.specifiers?.length || values.length) add(node.source.value, 'export', values.map((item) => `${item.local?.name || ''}:${item.exported?.name || item.exported?.value || ''}`));
      continue;
    }
    if (node.type === 'CallExpression' && (node.callee.type === 'Import' || node.callee.type === 'Identifier' && node.callee.name === 'require')) add(literal(node.arguments[0]), node.callee.type === 'Import' ? 'dynamic' : 'require');
    if (node.type === 'ImportExpression') add(literal(node.source), 'dynamic');
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'start', 'end', 'extra', 'comments', 'leadingComments', 'trailingComments', 'innerComments'].includes(key)) continue;
      if (Array.isArray(value)) stack.push(...value); else if (value && typeof value === 'object') stack.push(value);
    }
  }
  return found;
}

export function importSpecifiers(source) {
  return [...runtimeImports(source).keys()].sort();
}

export function hasRuntimeReexports(source, filename) {
  return [...runtimeImports(source, filename).values()].some((signatures) =>
    [...signatures].some((signature) => JSON.parse(signature)[0] === 'export'));
}

export function changedRuntimeImports(before, after, filename = 'preview.tsx', beforeFilename = filename) {
  const old = runtimeImports(before, beforeFilename);
  return [...runtimeImports(after, filename)].filter(([specifier, signatures]) => [...signatures].some((signature) => !old.get(specifier)?.has(signature))).map(([specifier]) => ({ specifier, added: !old.has(specifier) }));
}

export function resolveImport(graph, from, specifier) {
  const direct = graph.children.get(from) || new Set();
  const requested = graph.requests.get(from)?.get(specifier);
  if (requested) return requested;
  if (!specifier.startsWith('.')) return undefined;
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
  return [...direct].find((file) => file === target || file.replace(/\.[cm]?[jt]sx?$/, '') === target || file.replace(/\/index\.[cm]?[jt]sx?$/, '') === target);
}

export function parseTrace(text, code) {
  const plain = text.replace(/\x1b\[[0-9;]*m/g, '');
  if (code !== 0) throw new Error(`Chromatic trace failed (exit ${code}). See the trace log.`);
  const match = /Traced (\d+) changed files? to (\d+) affected story files?/.exec(plain);
  const bail = /TurboSnap disabled due to file change/.test(plain);
  const boundary = /Found a Storybook config change in ([^\r\n]+)/.exec(plain)?.[1];
  if (!match || (bail && !boundary)) throw new Error('Unrecognized Chromatic trace output. No passing verdict can be produced.');
  return { bailed: bail, boundary, affectedStoryFiles: Number(match[2]), countComplete: !bail };
}
