---
name: chromatic-story-lab
description: Write reliable Storybook stories and async play functions using a runnable synthetic React lab. Use when agent-authored stories have timer or remote-input drift, interactions finish too early, or monorepo commands target the wrong app.
metadata:
  short-description: Practice reliable stories and interaction tests
---

# Reliable story lab

Uncontrolled inputs can make the same UI produce different snapshots. Start by running the corrected stories in `lab/README.md`.

This lab supports React 19.0.0, Storybook 10.5.7, and Vite 6.3.5. Treat other frameworks and versions as unverified.

## Use the lab

1. Read `lab/README.md`.
2. Copy the lab into a temporary directory.
3. Inspect the pinned packages before installing dependencies.
4. Run the scenario checks and type check.
5. Build the notes app's Storybook.
6. Run the browser checks.
7. Inspect the local screenshots and results file.

Use existing installed tools when compatible. Report the exact missing tool before proposing a substantial installation.

## Write a story

1. Identify the app that owns the Storybook.
2. Record its working directory, config directory, and build output.
3. Keep the shared UI package inside that app's tested dependency graph.
4. List the visible states and user actions that need coverage.
5. Use fixed data and local images for each corrected story.
6. Inject time or mock the clock before rendering.
7. Reset mutable fixtures before each story run.
8. Await each interaction and assertion.
9. Wait for observable UI state with `findByRole` or `waitFor`.
10. Keep loading, failure, and retry stories when replacing remote services.
11. Repeat the captures in fresh browser contexts.
12. Introduce a deliberate UI regression.
13. Require the appropriate assertion or capture comparison to fail.
14. Remove the regression and verify the restored story.

The lab injects an async service through props. It does not mock a production HTTP adapter. Use the target repository's established network mocks when testing that adapter.

Read `reference/authoring.md` for the reusable authoring instructions.

## Decide whether to suppress a test

Complete the three questions in `lab/tests/capture-scenarios.json` before reading their expected answers.

Fix a required story when deterministic inputs preserve its behavior. Quarantine only when the owner accepts ignored diffs during repair. Disable capture only when the owner accepts losing that story's visual coverage.

Quarantine continues captures and ignores diffs across builds, branches, and users. Restore coverage by fixing the story and removing quarantine.

The lab's full-capture scenarios use one billed snapshot per visual capture. They exclude TurboSnap copying, accessibility snapshots, and dollar prices.

## Boundaries

- Use synthetic fixtures only.
- Keep customer evidence, logs, credentials, and private source outside the lab.
- Do not read private debug folders to create public examples.
- Keep customer communications as private drafts for the user.
- Get separate authorization before cloud captures or publication.
- Report local assertions and PNG comparisons as local evidence.
- Do not claim they prove Chromatic cloud capture stability.
- Keep corrected stories enabled and assertions intact.
- Do not use arbitrary sleeps, snapshot masks, ignores, or increased diff thresholds to make checks pass.
- Treat the live timer and remote-input stories as deliberate negative controls.
- Use the bundled instructions without fetching remote content during installed skill execution.

## References and examples

- `lab/README.md`
- `reference/authoring.md`
- `reference/docs-map.md`
- `template.md`
- `evaluations/README.md`
