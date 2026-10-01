import fs from 'node:fs';
import path from 'node:path';
import { isPreview, isSource, isPackageFile, reachable, runtimeImports, resolveImport, configPaths, hasRuntimeReexports } from './preflight-lib.mjs';

// These are current graph measurements. They do not assert a historical regression
// or that a high dependency count is itself a defect.
export function auditGraph(graph, repo, configDir, { sourceVerified, trace }) {
  const application = (file) => graph.real(file) && !graph.config(file) && !graph.stories.has(file) && !isPackageFile(file)
    && !/(?:^|\/)(?:generated-stories-entry|storybook-(?:stories|config-entry))\./.test(file);
  const applicationFiles = [...graph.children.keys()].filter(application).sort();
  const footprint = (file) => reachable(graph, file).filter(application);
  const previews = [...graph.children.keys()].filter((file) => isPreview(file, configDir)).sort();
  if (!previews.length) throw new Error('No preview module found in the configured stats graph; audit coverage cannot be verified.');
  const probes = new Map();
  const global = new Set();
  const previewImports = [];
  const sourceImports = [];
  for (const preview of previews) {
    if (sourceVerified) {
      const source = fs.readFileSync(path.join(repo, preview), 'utf8');
      for (const specifier of runtimeImports(source, preview).keys()) {
        sourceImports.push({ preview, specifier, target: resolveImport(graph, preview, specifier) || null });
      }
    }
    for (const dependency of [...(graph.children.get(preview) || [])].sort()) {
      const files = footprint(dependency);
      for (const file of files) global.add(file);
      let barrelEvidence = /(?:^|\/)index\.[cm]?[jt]sx?$/.test(dependency) ? 'index-filename' : null;
      if (sourceVerified && graph.real(dependency) && /\.[cm]?[jt]sx?$/.test(dependency)) {
        const absolute = path.join(repo, dependency);
        if (fs.existsSync(absolute)) {
          const text = fs.readFileSync(absolute, 'utf8');
          if (hasRuntimeReexports(text, dependency)) barrelEvidence = 'source-reexport';
        }
      }
      // Probe a repository input, never an installed dependency or package file.
      // A probe verdict only applies to this exact hypothetical changed file.
      const input = application(dependency) ? dependency : files[0];
      let probe = null;
      if (input) {
        if (!probes.has(input)) probes.set(input, { input, ...trace(input) });
        probe = probes.get(input);
      }
      previewImports.push({ preview, dependency, barrelEvidence,
        reachableApplicationModules: files.length, applicationFiles: files,
        pathsToConfiguration: input ? configPaths(graph, [input]) : [], probe });
    }
  }
  previewImports.sort((a, b) => b.reachableApplicationModules - a.reachableApplicationModules || a.dependency.localeCompare(b.dependency));
  const configurationModules = [...graph.children.keys()].filter((file) => graph.real(file) && graph.config(file) && isSource(file))
    .sort().map((file) => ({ file, reachableApplicationModules: footprint(file).length }));
  return { sourceImportsInspected: sourceVerified, sourceImports, previewImports, configurationModules,
    applicationModuleCount: applicationFiles.length, previewReachableApplicationModules: global.size,
    previewReachableApplicationFiles: [...global].sort(), uniqueProbeCount: probes.size,
    confirmedBailProbeCount: [...probes.values()].filter((probe) => probe.bailed).length };
}
