# Make stories reliable

A live clock or remote image can change a snapshot without a UI change. Start by running the corrected stories below.

This lab uses synthetic notes and a bundled SVG. It supports React 19.0.0, Storybook 10.5.7, Vite 6.3.5, and Playwright 1.54.1.

Use Node 22.12 or newer. Use the committed npm lockfile.

## Run the lab

Copy this directory outside the skill before installing packages. Keep generated files out of the skill bundle.

From the repository root:

```bash
LAB_RUN=$(mktemp -d /tmp/chromatic-story-lab.XXXXXX)
cp -R skills/chromatic-story-lab/lab/. "$LAB_RUN/"
cd "$LAB_RUN"
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

For a plugin installation, copy its `chromatic-story-lab/lab` directory instead. Use the same commands from the copied lab root.

The install reads public npm packages. The stories and browser checks need no external service or credentials.

The browser check uses the installed Playwright Chromium. If that browser is missing, report that prerequisite before installing it.

After approval, install only the pinned browser:

```bash
npm exec --no -- playwright install chromium
```

Open the stories from the lab root:

```bash
npm run storybook
```

Visit `http://127.0.0.1:6017`. Keep the preview running while inspecting the examples.

## Try the examples

1. Open **Lab / Clock / Live Timer**.
2. Observe the changing timestamp.
3. Open **Fixed Time**.
4. Inspect its fixed `now` argument.
5. Open **Lab / Note card / Remote Inputs**.
6. Inspect the synthetic remote-service boundary in `src/fixtures.ts`.
7. Open **Ready**.
8. Inspect the fixed record and local SVG.
9. Open **Saved**.
10. Inspect the awaited actions and status assertion in its play function.
11. Open **Saving**, **Load Error**, **Retry Load**, and **Retry Save**.
12. Inspect how each fixture preserves that UI state.

The remote story uses reserved `.invalid` hosts. A normal preview shows its load error.

The browser runner intercepts those requests locally. It returns two different synthetic records and images to demonstrate drift.

The corrected stories inject an async service through props. They cover component behavior without testing a production HTTP adapter.

Loading and saving stories hold fresh promises unresolved. They capture a meaningful pending state without guessing a duration.

`Saved` waits for visible confirmation after clicking. `Retry Save` checks the error, retained input, both save calls, and the final confirmation.

Every interaction and assertion is awaited. The stories use no arbitrary sleeps.

## Know the target

This is one npm workspace example. It has one Storybook and no Nx or Turborepo dependency.

| Boundary | Exact location |
| --- | --- |
| Workspace and lockfile | Copied lab root |
| Storybook owner | `apps/notes`, package `@story-lab/notes` |
| Stories and service fixtures | `apps/notes/src` |
| Config | `apps/notes/.storybook` |
| Static images | `apps/notes/public` |
| Shared component and CSS | `packages/ui/src`, package `@story-lab/ui` |
| Build output | `apps/notes/storybook-static` |
| Local screenshots and evidence | `artifacts` |

Run the exact app target from the lab root:

```bash
npm run build-storybook --workspace=@story-lab/notes
```

Or run the app command from its directory:

```bash
cd apps/notes
npm run build-storybook
```

Both commands use `apps/notes` as the build working directory. The config and output arguments resolve from that directory.

The story glob includes only `apps/notes/src/**/*.stories.tsx`. Those stories import the shared UI package through the app's dependency.

The repeat suite requires all eight corrected stories. It fails when that coverage count changes.

Keep shared UI and CSS changes in coverage. Use the existing monorepo skill when the real repository has more apps or build orchestration.

## Check capture cost

Read the three questions in `tests/capture-scenarios.json`. Answer before reading each `expected` object.

Save an answer file outside the skill with this shape:

```json
{
  "timer": { "action": "fix", "billedSnapshots": 6, "diffsReviewed": true },
  "temporary-flake": { "action": "quarantine", "billedSnapshots": 12, "diffsReviewed": false },
  "retired-demo": { "action": "disable", "billedSnapshots": 0, "diffsReviewed": false }
}
```

Check the answer file from the lab root:

```bash
node tests/check-scenarios.mjs /tmp/story-lab-answers.json
```

The scenarios assume full visual captures. They exclude TurboSnap copies, accessibility snapshots, and dollar prices.

Quarantine keeps captures and ignores diffs across all builds, branches, and users. Each full captured visual snapshot still costs one billed snapshot. [Quarantine docs](https://www.chromatic.com/docs/quarantine-tests/)

`chromatic.disableSnapshot: true` skips capture for the story. It produces zero billed snapshots for that disabled visual capture. [Billing docs](https://www.chromatic.com/docs/billing/)

Fix required coverage when practical. Use quarantine for an explicitly accepted repair window.

Record an owner and repair date for quarantine. Remove quarantine after verifying the fix.

Disable an obsolete story only when the owner accepts losing its visual coverage. The corrected lab stories remain enabled.

## Read the evidence

`npm run verify` runs scenario tests, the type check, the build, and the browser checks.

The browser runner opens a fresh context for each corrected story. It requires the play function to complete successfully.

It compares three PNGs per story with exact equality. It uses no masks, ignored regions, or increased thresholds.

It then verifies four negative controls:

- Two controlled wall-clock inputs change the live timer capture.
- Two synthetic remote responses and images change the remote-input capture.
- An injected background color causes the PNG equality assertion to fail.
- A served component-label mutation causes the unchanged `Saved` play assertion to fail.

The label mutation affects only the temporary HTTP response. The source files remain intact.

The runner removes the mutation and requires `Saved` to pass again. It writes `artifacts/results.json` and synthetic PNGs.

These checks prove local repeat stability and local regression sensitivity in one browser environment. They do not create a reviewed cross-commit visual baseline.

Host, browser, font, viewport, and engine differences can affect captures. Compare across commits through reviewed baselines in the actual target environment. [Playwright guidance](https://playwright.dev/docs/test-snapshots)

Chromatic cloud captures have not run. Cloud verification requires separate authorization and a suitable synthetic project.

Read the skill's `reference/authoring.md` before applying these patterns to another app. Read its `reference/docs-map.md` when updating versions or billing assumptions.
