# TurboSnap audit and check CLI

Both skills bundle the same checker, so either can be installed alone. Node.js 20+, Git with a committed HEAD, a working Storybook installation, and an already installed stable Chromatic 18.x CLI are required. Minor and patch releases within major 18 are accepted, including 18.9.6; prereleases and other majors require separate compatibility validation. The exact CLI version is recorded in the report. Unrecognized native trace output still returns `unable-to-verify`, even from an accepted version. Report any difference from the project's CI CLI. The checker does not upload, authenticate to Chromatic, capture screenshots, or download dependencies.

Prefer the newest reviewed stable release within major 18. A dependency range such as `^18.0.0` permits those updates; the committed lockfile selects the exact package and dependency versions used for a run. Use the repository's frozen/immutable lockfile installation in CI, and update dependencies deliberately through the team's review process. Do not resolve or execute `chromatic@latest` during a diagnostic run: `latest` is mutable and can move to another major. A major-version range is a compatibility boundary, not protection against a compromised patch; a lockfile provides repeatability, not proof that the selected code is safe. Review release provenance and dependency changes when upgrading, and add newer majors after validating their tracing behavior.

## Configure once per Storybook

Inspect the repository's setup documentation and version files. Use its package manager and existing build script. The example uses Yarn for the build and invokes the already installed CLI directly (`node ./node_modules/chromatic/dist/bin.cjs`), relative to the Git root. Adapt that path for a workspace or use an absolute installed CLI path. Yarn PnP projects must use their supported local binary runner, with argument forwarding and quiet output verified: the version command must print only the Chromatic version. Do not use `yarn exec chromatic` unchanged with Yarn Classic, which consumes `--version` itself. Do not silently upgrade a project's dependencies or change its registry settings to make the check pass.

Configuration fields:

- `storybookBaseDir`: repository-relative stats root; `.` for a root Storybook.
- `storybookConfigDir`: relative to that base; shared configuration may use `../` while remaining inside the repository.
- `chromatic`: argv array for the installed, tested CLI.
- `build.cwd`: repository-relative working directory.
- `build.command`: argv array for the existing Storybook build, including its appropriate stats flag and `{outputDir}`.
- `statsFile`: fresh output path containing `{outputDir}`, normally `{outputDir}/preview-stats.json`.
- `build.timeoutMs`: optional timeout, from 1000 to 3600000; default 600000.
- `untraced`: copy the effective project patterns exactly. Never add exclusions to clear findings.

Commands run without a shell, although a repository's own package script can use one. Only execute configuration from an authorized repository or a configuration you prepared. Supplied JSON is not permission to run arbitrary commands. Output and stats go to a fresh directory; `--out` accepts a new or empty evidence directory. Reports are not overwritten.

Configuration located at the Git repository root (`storybookConfigDir: "."` with a root base) is currently unsupported by the validated tracer and returns `unable-to-verify`; it must not silently pass.

For a monorepo, run separately for each affected Storybook, preserving each base, config directory, build command, and tracing options. Shared packages remain in scope.

## Audit

```bash
node <skill-directory>/scripts/preflight.mjs --audit --repo <repo> --config <config.json>
node <skill-directory>/scripts/preflight.mjs --audit --repo <repo> --config <config.json> --stats <local-preview-stats.json>
```

Fresh mode builds once, parses runtime preview imports, inspects local barrel candidates, and ranks stats dependency footprints. Artifact mode uses only the supplied graph and filename heuristics; it does not inspect unrelated checkout source or claim source/stats correspondence. Native tracing still requires a Git checkout. No previous stats, Git baseline, or pending changes are needed for an audit.

One hypothetical repository input is probed per distinct preview dependency where possible. For a configuration-only root, the first reachable application input is used. Probes are deduplicated. Every native result applies only to its exact input; it is not a verdict for all transitive descendants. Installed packages are not used as probes, and package-content changes are outside this CLI's coverage.

Reachable application counts exclude configuration files, story files, installed dependencies, and known synthetic entrypoints. Counts can overlap between imports. The complete file lists expose overlap. Configuration modules are inventoried separately. Parsed source imports may be unresolved or optimized away; stats edges remain the built graph evidence. An audit with no identifiable preview module or an unsupported probe result fails explicitly.

## Change check

```bash
# Working tree, staged edits, and untracked files against HEAD:
node <skill-directory>/scripts/preflight.mjs --repo <repo> --config <config.json>
# Previous commit plus working-tree edits:
node <skill-directory>/scripts/preflight.mjs --repo <repo> --config <config.json> --base HEAD^
# Task/branch changes against a known target:
node <skill-directory>/scripts/preflight.mjs --repo <repo> --config <config.json> --merge-base <target-branch>
```

Choose the baseline for the task; do not infer a remote or invent a branch. The baseline provides source text for import comparisons, not a second Storybook graph. Renames include old and new paths. Deleted/renamed historical dependency impact may require old stats and is not proven by the current graph.

A new preview import or changed runtime binding gets review evidence, including a resolved target and current footprint when available. A new source module inside the configuration directory also gets review. Direct configuration edits and package/lockfile changes are reported separately as expected inputs. Application changes that trigger the official configuration-bail message produce `bail`. One graph cannot establish when an existing global dependency was introduced.

Artifact replay is also available for support:

```bash
node <skill-directory>/scripts/preflight.mjs --repo <repo> --config <config.json> --stats <local-stats.json> --changes <changed-files.json>
```

The changes file is an array of repository-relative paths. Supplied changes cannot establish added imports without source history. Artifact replay never claims a fresh build or a valid pre-push check.

## Results and failure policies

| Status | Meaning |
| --- | --- |
| `clear` | No targeted structural finding in the selected change scope. |
| `review` | New config source, preview import, or changed runtime bindings need inspection. |
| `bail` | The official trace found an application change reaching configuration. |
| `audited` | Architecture audit completed; inspect measured exposure and hypothetical bails. |
| `unable-to-verify` | Build, inputs, stats, CLI version, or native trace could not be verified. |

Check defaults to `--fail-on review`: review/bail exit 1, clear exits 0. `--fail-on bail` makes review advisory. `--fail-on never` makes both advisory. The report status and findings never change with the exit policy. Verification failures always exit 2. A completed audit exits 0 even when hypothetical global-input probes bail; it has no failure policy.

Read `report.json` for full paths, counts, provenance, commands, and logs. A bailed native trace has an incomplete affected-story count. Counts refer to story files or source modules, not captures.

## Optional pre-push hook

Only install a hook when the user requests enforcement. Adapt the existing hook manager instead of replacing hooks. An illustrative POSIX hook body, after replacing the paths and target ref:

```sh
#!/bin/sh
exec node /absolute/skill/scripts/preflight.mjs \
  --repo /absolute/repository \
  --config /absolute/repository/tooling/turbosnap.json \
  --merge-base origin/main \
  --fail-on bail
```

An existing, appropriate target ref must be configured for this repository. The example checks the working tree against that ref and builds Storybook on each invocation. It does not derive each pushed ref from Git's hook stdin, so a multi-ref push needs a wrapper that chooses scope per pushed ref. Do not claim the example verifies every ref in a multi-ref push. Reports retain advisory findings even when the hook exits 0.

For agent-driven checks, add an instruction to the repository's own agent guidance: run the configured change check before completing relevant source/import/configuration changes, using the task's Git scope; report findings and evidence without editing source or tracing rules as part of the check.

## Coverage limits

The official CLI supplies configuration-bail verdicts. Supplemental importer paths retain all graph edges, including paths suppressed by `untraced`; do not call them additional confirmed bails. The checker supports Vite and Webpack importer data, including nested concatenated modules. Unsupported/empty relationship data fails explicitly.

The runtime detects changes to HEAD, tracked/untracked source inputs, its configuration, and stats while running. Ignored generated inputs, installed dependencies, and environment inputs must remain stable. Code generation that changes tracked source should finish before running. Successful dependency installation and rendering are not inferred from a stats artifact.

No previous graph is required, but current counts do not measure a before/after increase. Computed imports, all aliases, runtime rendering, package-content comparisons, configured `externals`, Git ancestry, retries, and server capture eligibility are outside this focused check. A changed external may intentionally require full capture; inspect effective configuration before interpreting CI differences. The supplied trace is the tested CLI's local tracing result, not a promise of TurboSnap v2/server behavior.

Automated fixtures cover Vite and Webpack graph shapes. Real CLI and Storybook smoke checks were run on macOS; other operating systems require validation before claiming support.
