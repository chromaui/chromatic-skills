# Investigate and stabilize a Chromatic story

This guide is for SEs and customers investigating unreliable Chromatic or Storybook tests: inconsistent visuals, intermittent assertions, changing data, async readiness, leaked state, environment differences, or uncertain capture history. It works as a manual guide or with the accompanying [agent skill](../SKILL.md). Follow the sections relevant to the evidence; not every investigation needs images, build history, quarantine, or a timing fixture.

Start with available source, test output, and the expected behavior. When remote evidence is needed, use the user's connected, customer-facing Chromatic MCP tools. They can be supplied by a plugin or connected directly. A plugin packages instructions and integrations; MCP exposes callable tools. Installing this skills bundle alone does not connect a data server. Discover capabilities instead of relying on an installation name. No project token or internal admin tool is needed for this workflow. If the connection is unavailable, continue with local or user-provided evidence and state which remote checks could not be completed.

## 1. Set a narrow scope

Record the affected story/test, its expected outcome, the actual failure, and whether it is repeatable or intermittent. Add the project ID, exact story ID, branch, build, mode, browser, and viewport where relevant. A display name alone may not distinguish stories; different modes or environments are separate cases when comparing results.

Begin with the smallest evidence set that can distinguish the likely causes. When history is relevant, choose a bounded sample of completed builds on the requested branch and state its limits. A sample is not proof of stability. Confirm completion from deployed build types and fields; do not treat a published or still-running build as finished.

Example investigation request:

> Investigate the unreliable test for `<story-id>` using the evidence available in this checkout and my connected Chromatic tools. Expected behavior: `<outcome>`. Observed failure: `<symptom and conditions>`. Start with the narrowest useful comparison. Discover tool capabilities and search the deployed schema before composing queries. Separate observations from hypotheses and state which checks actually ran. Do not read tokens, change reviews or quarantine, upload, or start a build.

## 2. Discover and verify the available tools

When remote evidence is needed, list the callable tools from the connected MCP server, distinguishing read-only tools from mutation tools. Names and capabilities may differ between servers and versions. Some connections expose `chromatic_search_schema`, `chromatic_query`, and `chromatic_get_latest_build`; do not require these exact names or assume all MCP servers provide build data. A Storybook documentation connection alone may not expose test history. A tool's presence is not proof that its query or image access works.

Before composing a GraphQL query, search the deployed schema by keyword, then by exact returned type name. Inspect arguments, enums, interfaces, and state fragments before selecting fields. A dedicated typed tool can be used through its documented arguments without inventing a GraphQL query. Discover only the paths relevant to the investigation, such as:

- Project and build identity, branch, commit, completion, and warnings.
- Story-filtered tests, mode, result, status, ignore reason, and instability.
- Browser/platform, viewport, baseline and head builds, and comparison results.
- Capture identity, capture result, image access, and any explicit skip/copy/provenance evidence.
- Current quarantined stories, pagination, quarantine date, and latest test.

If a local query recipe is available, use it as a starting point and validate its fields against the deployed schema. Otherwise build a narrow query from discovered fields. Use named queries and variables, and obey the connected tool's limits. Omit an optional cursor on the first page; send the returned cursor for subsequent pages. Stop if a cursor does not advance and report incomplete pagination.

For a new data connection, verify one small metadata query before broader reads. Verify image access only when images matter to the diagnosis or the user requests it. If a tool returns actual capture pixels, inspect them. If it returns only a hosted URL, ask the user for one image as an attachment or local file, or ask them to inspect it in Chromatic. Do not fetch the hosted URL directly. A URL only verifies URL retrieval; viewing actual pixels verifies image access. Report user observations as user-reported. Signed URLs can expire; do not store them in shared instructions. Keep DOM snapshots and traces out of scope unless deployed schema discovery proves they are exposed and the task calls for them.

Record what actually worked:

| Capability | Evidence to record |
| --- | --- |
| Schema discovery | Types and fields returned by the deployed service |
| Metadata query | Project/build identity returned by a successful query |
| Image access | A real capture retrieved and viewed, with its test link |
| History or quarantine | Pages inspected and whether pagination completed |
| Provenance | Specific origin/reuse evidence, or “not exposed in this schema” |

Do not replace missing public fields with guesses, local implementation details, secret reads, or internal endpoints. If a history connection is absent, use available build lookup or the project's build list, with a bounded search. Report a partial sample if the requested builds cannot be resolved.

## 3. Establish what failed

Distinguish an intentional UI change, a repeatable functional regression, an intermittent assertion, a visual-only difference, and a result that did not execute fresh work. These call for different checks. Start with the failing assertion or visible state and the conditions that differ between a pass and failure.

When a historical visual comparison is relevant:

Match the exact story and mode, then select the requested browser comparison. Record the browser version and viewport dimensions when exposed. Read the baseline and head build numbers and commits from the comparison's actual relationships; do not assume the baseline is the previous build or current main.

Inspect available before, after, and diff images for that comparison, using tool-supplied pixels or images the user provides. If an image is missing and would change the diagnosis, request one at a time. Describe visible changes, such as glyph-edge pixels or layout movement, without asserting their cause. Capture warnings and errors verbatim in short excerpts where useful, or summarize them. An empty warning list only describes the queried record.

Separate three statements:

- **Observed:** what the API, image, source, or executed test shows.
- **Hypothesis:** a possible mechanism, with the evidence needed to test it.
- **Verified change:** what the patch and validation actually establish.

For example, a changing timestamp supports investigating the clock input. A late callback supports inspecting readiness. Neither observation alone explains unrelated pixel changes.

## 4. Check history when execution or capture freshness matters

Query only this story for each selected completed build and page all its results. Match mode and browser after retrieval if the API has no corresponding filter. Keep the returned identifiers and source fields with your notes.

Use one row per matching browser result:

| Build | Commit | Test URL | Captured / skipped / unknown | Evidence | Result | Ignore reason | Instability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `<number>` | `<sha>` | `<test link>` | `unknown` | Equal comparison; origin/reuse not exposed | Test: EQUAL; comparison: EQUAL; capture: SUCCESS | `<value or null>` | `<value or unavailable>` |

“Captured” here means evidence of a fresh browser capture for this build. Apply these rules:

| Evidence | Classification |
| --- | --- |
| Explicit provenance or authoritative capture record establishes a new capture for this build | `captured`, citing that evidence |
| Explicit test/comparison skip or reuse/copy evidence | `skipped`, specifying whether it was skipped or copied and its source when available |
| Success, equal images, build association, timestamp, or capture ID without established origin semantics | `unknown` |
| Skipped build with no matching test/comparison | No browser-result row; report the build separately as having no result |
| Missing test or browser in an otherwise completed build | Report absence separately; do not invent a skipped browser result |

Do not assume a capture ID identifies an original rendering job; discover its documented semantics. Likewise, a head capture linked to the current build can still lack origin information. Preserve null or unavailable values rather than converting them to “stable,” “not ignored,” or “fresh.”

TurboSnap can reuse snapshots from unchanged stories. This is why green results alone cannot establish fresh rendering. The [TurboSnap documentation](https://www.chromatic.com/docs/turbosnap/) is a human-facing reference; installed skills use the local guidance here rather than fetching linked pages.

## 5. Check quarantine when suppression or instability status matters

Use the installed **Quarantined stories** query recipe when available, after confirming the deployed fields. Read the entire current project list with `first`, `after`, `pageInfo.hasNextPage`, and `endCursor`. Count the records and compare with `totalCount` when supplied. If pages disagree because the list changed, report that limitation or repeat the bounded read.

Match the exact `story.storyId` and `modeName` after pagination completes. Report whether that pair is currently quarantined, its quarantine date, and `latestTest` if exposed. Read the field description: a quarantine record's latest test may mean the latest test where quarantine applied, not the latest project test. If there is no match, say “not in the current quarantined list.” If quarantine is unavailable or disabled, state that distinction when the API exposes it.

Separately report each historical ignored result within the requested story/build scope, including its `ignoreReason`, result, and `isUnstable` when available. A historical ignore does not establish current quarantine; absence from today's quarantine list does not erase a historical ignore. Manual ignores, instability ignores, and quarantine are different evidence. Do not change any of them during investigation.

## 6. Trace behavior before choosing the fix

Read the story/test, component, and relevant setup. Choose a hypothesis from the evidence, then identify the smallest check that could disprove it. The following are diagnostic options, not a mandatory audit:

| Suspected source | Evidence to check | Focused correction when confirmed |
| --- | --- | --- |
| Variable inputs | Clock, random IDs, mutable data, network responses, locale | Stable scenario data or a scoped input fixture that preserves the behavior under test |
| Async readiness or assets | Requested state versus rendered state, fonts/images, in-flight work | Await a meaningful observable outcome or control the relevant resource |
| Shared state or ordering | Pass alone but fail after another story; storage, globals, listeners, mocks | Isolate setup and cleanup, then verify the relevant sequence |
| Environment differences | Same inputs under differing viewport, theme, browser, dependencies, or build mode | Align the intended configuration or fix a demonstrated environment-specific defect |
| Component behavior | Wrong transition, lifecycle cleanup, stale state, or race under controlled inputs | Minimal component fix with a regression test for the broken contract |
| Test expectation | Assertion targets the wrong state, inaccessible selector, or an intentional UI change | Correct the scenario/assertion while retaining meaningful coverage |

For timer or callback evidence specifically, trace the scheduling event through its effects:

1. Is it scheduled on mount, load, render, or an interaction?
2. Which current props/state does it check when it fires?
3. Does it call a callback, change state, update the DOM, navigate, or do nothing?
4. Does the story's callback actually update state, or only log an action?
5. What cancels or supersedes the operation, and what happens on unmount?

Keep component timeout, assertion deadline, test-runner timeout, capture delay, and hosted interaction timeout distinct. Increasing an assertion's deadline does not change the component timer or guarantee that the outer runner will wait that long.

Choose the smallest change supported by the evidence. For an uncontrolled missing URL, use a local static response with deliberate content. For a readiness race, wait for the intended callback or visible state. For a demonstrated component bug, fix the production behavior and add a regression test at the appropriate level. Do not modify correct component behavior to compensate for a broken fixture.

The [non-connecting iframe example](fixture-example.md) shows how to test an existing timeout without sending a synthetic success message, changing the timer, or replacing the real behavior with a mock.

## 7. Verify locally, then verify the pushed commit

Confirm that the server and test runner point to the checkout containing your edit. A running Storybook tool may belong to another worktree. Check the served story/fixture, the working directory, and the command configuration before trusting a pass.

Choose validation that exercises the suspected failure: an interaction test for a transition, a visual comparison for appearance, a focused component test for logic, or a sequence check for leaked state. Use the relevant existing environment; add browser/platform coverage only when the failure evidence warrants it. Do not prescribe a specific browser or a second browser for every fix. If a fixture changed, verify its actual served content. For production-only differences, build and serve Storybook locally using the repository's existing commands. Run required lint and type checks.

For intermittent behavior, choose a bounded repeat or order check that can expose the suspected mechanism and report the number and conditions of runs. Confirm the assertion detects the original failure, using a safe local regression probe when practical. One passing run does not establish reliability. Tests excluded by a local name filter are not evidence that Chromatic skipped them.

An assertion should fail if the intended callback or state never occurs. Use explicit spies for callbacks and await the assertion. Storybook documents [callback spies and interaction assertions](https://storybook.js.org/docs/writing-tests/interaction-testing). When the expected result is a visible error panel, assert that panel too; a callback-only story does not prove the parent renders it.

Static files can sit outside the bundler dependency graph. Verify how the project tracks them for TurboSnap, especially for later fixture-only edits; do not assume a future static-file change triggers capture. See [TurboSnap guidance for external files](https://www.chromatic.com/docs/turbosnap/best-practices/).

Commit, push, and create a PR when requested. If the push is expected to run Chromatic, query the latest build for that branch and compare its full commit to the pushed commit. If it is older, absent, or running, wait briefly and retry a few times following the connected tool's guidance. Then report pending validation rather than polling indefinitely or starting a build yourself.

For the matching completed build, repeat the scoped story check. A passing local test establishes local behavior; a green remote build with no fresh-capture evidence leaves remote capture freshness unknown. A pending visual review needs human review. Report failures and show the changed images within scope; do not accept them automatically.

## Handoff and reuse

End with the tested behavior, changed files, test commands/browser coverage, remote build/commit, and remaining uncertainty. Include the evidence table, current quarantine status, historical ignores, and verified tool capabilities when those were part of the request. Keep credentials, signed image URLs, and unrelated customer data out of shared instructions.

The directory containing `SKILL.md`, `reference/`, and `agents/` is portable. To use it in Codex, place that entire `chromatic-story-reliability` directory under your configured skills directory (commonly `~/.codex/skills/`) and start a session that discovers it. Other assistants can read `SKILL.md` directly; people can follow this guide without installing a skill. Keep the references together when distributing the folder.

Example fix request after investigation:

> Use `$chromatic-story-reliability` to implement the evidence-backed fix for `<story-id>`. Preserve the component's intended behavior and existing capture settings. Choose validation that exercises the failure mechanism and demonstrate that the test still catches the regression. Run the repository's required checks. Separate local verification from any remote capture verification. Do not publish or change review/quarantine state.
