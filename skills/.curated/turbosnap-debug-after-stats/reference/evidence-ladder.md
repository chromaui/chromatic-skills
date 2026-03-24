# Evidence Ladder

Ask for the smallest next artifact that can collapse the branch.

## Tier 0: Use what is already present

Start with any of:
- CLI output from `chromatic`
- `chromatic.config.json`, the `package.json` script that runs `chromatic`, or workflow snippets
- Storybook build command
- `chromatic trace` output
- changed-file list
- screenshots or customer description

If Tier 0 cleanly maps to a diagnosis code, stop there.

## Tier 1: Fast configuration checks

Request one of these when activation or setup is unclear:
- the exact Chromatic invocation
- the `onlyChanged` setting from `chromatic.config.json`, the invoking `package.json` script, or CI
- `storybookBaseDir` and `storybookConfigDir` values
- the Storybook build command
- confirmation that `preview-stats.json` exists in the built output

Customer prompt:
> Please share the exact command that runs Chromatic, including the `package.json` script or workflow step if that is where it lives, plus where your Storybook output is written.

Internal prompt:
> Pull the Chromatic invocation first, then inspect both `chromatic.config.json` and the `package.json` script or workflow step that actually runs `chromatic` before tracing deeper.

When a hard bail is already known:
- do not restart from generic setup questions
- ask next for the smallest artifact that will let you validate or minimize that bail

## Tier 2: Trace and path proof

Request one of these when the problem is about affected stories or path alignment:
- `--trace-changed=expanded` output from a recent run
- output from `npx chromatic trace ...`
- the list of changed files relative to repo root
- the path to `preview-stats.json`
- the location of `.storybook` or alternate config dir

Customer prompt:
> Please run the next targeted command and paste the output exactly as shown.

Internal prompt:
> Prefer one targeted trace over a broad artifact request. Use the changed file with the highest leverage.

If the hard bail is already identified and the goal is to restore TurboSnap:
- request the stats file path and the changed files list
- then ask for one targeted trace or run one internally

## Tier 3: Shared-dependency and filtering proof

Request one of these only when the active trace is still disputed:
- the relevant `--externals` globs
- the relevant `--untraced` globs
- preview/config imports that could pull shared dependencies into many stories
- the component or story file the user expected to run
- monorepo root versus project root layout

Use Tier 3 when the dispute is “too broad” or “missed expected story.”

Also use Tier 3 when:
- the preview bail is proven
- the team is now deciding whether to suggest `--untraced`
- the remaining question is technical minimum versus coverage risk

## Stop conditions

Stop asking for more evidence when:
- a hard-bail code is clearly proven
- a single active-tracing diagnosis is high confidence
- the next artifact would be redundant

If confidence stays low after one or two targeted follow-ups:
- internal flows should name the most likely diagnosis and the next artifact
- customer flows should produce the support-ready summary from `reference/output-contract.md`
