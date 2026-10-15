# Investigate and stabilize a Chromatic story

This guide is for SEs and customers investigating one story that looks unstable, fails to connect, or passes without clear evidence of a new capture. It works as a manual checklist or with the accompanying [agent skill](../SKILL.md).

You need access to the project's Chromatic results and the source for its story and component. Agent-assisted API inspection uses the installed Chromatic plugin with the user's existing connection. No project token or internal admin tool is needed. If that connection is unavailable, use the Chromatic UI for evidence it exposes and state which API checks could not be completed.

## 1. Set a narrow scope

Record the project ID, exact story ID, mode name, browser, branch, and any historical build number. A display name such as “Fail To Connect” is insufficient to distinguish stories. Modes with the same story are separate cases.

Start with the requested historical comparison and a small set of recent completed builds on the requested branch. Seven builds is a useful initial sample, not a required sample size or proof of stability. Confirm what “completed” means from deployed build types and fields; do not treat a published or still-running build as finished.

Example investigation request:

> Use the installed Chromatic plugin read-only for project `<project-id>`. Inspect only `<story-id>`, mode `<mode>`, in Firefox. Start with historical build `<number>` and seven recent completed builds on `<branch>`. Search the deployed schema first. Verify access to one real capture image. Separate observations from hypotheses. Do not read tokens, change reviews or quarantine, upload, or start a build. Keep DOM snapshots and traces out of scope unless deployed schema discovery proves they exist.

## 2. Discover and verify the available tools

List the callable tools from the installed plugin, distinguishing read-only tools from mutation tools. Names and capabilities may differ between versions. Common entry points are `chromatic_search_schema`, `chromatic_query`, and `chromatic_get_latest_build`; their presence is not proof that a query or image fetch works.

Search the deployed schema by keyword, then by exact returned type name. Inspect argument types, enum descriptions, interfaces, and state fragments before selecting fields. Discover the paths for:

- Project and build identity, branch, commit, completion, and warnings.
- Story-filtered tests, mode, result, status, ignore reason, and instability.
- Browser/platform, viewport, baseline and head builds, and comparison results.
- Capture identity, capture result, image access, and any explicit skip/copy/provenance evidence.
- Current quarantined stories, pagination, quarantine date, and latest test.

Use the installed query recipe as a starting point, then validate its fields against the deployed schema. Send one named query with variables. Keep selections small and obey the plugin's alias and response-size limits. Omit an optional cursor on the first page; send the returned cursor for subsequent pages. Stop if a cursor does not advance and report incomplete pagination.

First verify one small project/build metadata query through the user's connected Chromatic tools. If a tool returns actual capture pixels, inspect them. If it returns only a hosted URL, ask the user for one capture image as an attachment or local file, or ask them to inspect it in Chromatic. Do not fetch the hosted URL directly. A URL in GraphQL only verifies URL retrieval; decoding or viewing the actual image verifies image access. Report user observations as user-reported, and leave agent image access unverified until pixels are available. Signed image URLs can expire; do not store them in the reusable skill or customer guide.

Record what actually worked:

| Capability | Evidence to record |
| --- | --- |
| Schema discovery | Types and fields returned by the deployed service |
| Metadata query | Project/build identity returned by a successful query |
| Image access | A real capture retrieved and viewed, with its test link |
| History or quarantine | Pages inspected and whether pagination completed |
| Provenance | Specific origin/reuse evidence, or “not exposed in this schema” |

Do not replace missing public fields with guesses, local implementation details, secret reads, or internal endpoints. If a history connection is absent, use available build lookup or the project's build list, with a bounded search. Report a partial sample if the requested builds cannot be resolved.

## 3. Inspect the historical comparison

Match the exact story and mode, then select the requested browser comparison. Record the browser version and viewport dimensions when exposed. Read the baseline and head build numbers and commits from the comparison's actual relationships; do not assume the baseline is the previous build or current main.

Inspect available before, after, and diff images for that comparison, using tool-supplied pixels or images the user provides. If an image is missing and would change the diagnosis, request one at a time. Describe visible changes, such as glyph-edge pixels or layout movement, without asserting their cause. Capture warnings and errors verbatim in short excerpts where useful, or summarize them. An empty warning list only describes the queried record.

Separate three statements:

- **Observed:** what the API, image, source, or executed test shows.
- **Hypothesis:** a possible mechanism, with the evidence needed to test it.
- **Verified change:** what the patch and validation actually establish.

For example, a changed error-page screenshot and an uncontrolled missing URL justify investigating the fixture. They do not prove that the component's timeout caused Firefox text rasterization differences.

## 4. Check recent results without overstating capture freshness

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

## 5. Check quarantine separately from historical ignores

Use the installed **Quarantined stories** query recipe when available, after confirming the deployed fields. Read the entire current project list with `first`, `after`, `pageInfo.hasNextPage`, and `endCursor`. Count the records and compare with `totalCount` when supplied. If pages disagree because the list changed, report that limitation or repeat the bounded read.

Match the exact `story.storyId` and `modeName` after pagination completes. Report whether that pair is currently quarantined, its quarantine date, and `latestTest` if exposed. Read the field description: a quarantine record's latest test may mean the latest test where quarantine applied, not the latest project test. If there is no match, say “not in the current quarantined list.” If quarantine is unavailable or disabled, state that distinction when the API exposes it.

Separately report each historical ignored result within the requested story/build scope, including its `ignoreReason`, result, and `isUnstable` when available. A historical ignore does not establish current quarantine; absence from today's quarantine list does not erase a historical ignore. Manual ignores, instability ignores, and quarantine are different evidence. Do not change any of them during investigation.

## 6. Trace behavior before choosing the fix

Read the story, component, relevant parent callbacks, decorators, fixture serving configuration, and test runner configuration. Trace each relevant timer from its scheduling event to its effects:

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

Run the selected story's interaction test in the normal browser and the affected browser, if supported. Verify the fixture returns the intended content, not a fallback document. Use the project's established lint and type-check commands. Record the focused test count; other tests excluded by the name filter are not evidence that Chromatic skipped them. For production-only differences, also build and serve Storybook locally using the repository's existing commands.

An assertion should fail if the intended callback or state never occurs. Use explicit spies for callbacks and await the assertion. Storybook documents [callback spies and interaction assertions](https://storybook.js.org/docs/writing-tests/interaction-testing). When the expected result is a visible error panel, assert that panel too; a callback-only story does not prove the parent renders it.

Static files can sit outside the bundler dependency graph. Verify how the project tracks them for TurboSnap, especially for later fixture-only edits; do not assume a future static-file change triggers capture. See [TurboSnap guidance for external files](https://www.chromatic.com/docs/turbosnap/best-practices/).

Commit, push, and create a PR when requested. After a push, query the latest build for that branch and compare its full commit to the pushed commit. If it is older, absent, or running, wait briefly and retry a few times following the plugin's guidance. Then report pending validation rather than polling indefinitely or starting a build yourself.

For the matching completed build, repeat the scoped story check. A passing local test establishes local behavior; a green remote build with no fresh-capture evidence leaves remote capture freshness unknown. A pending visual review needs human review. Report failures and show the changed images within scope; do not accept them automatically.

## Handoff and reuse

End with the tested behavior, changed files, test commands/browser coverage, remote build/commit, and remaining uncertainty. Include the evidence table, current quarantine status, historical ignores, and verified tool capabilities when those were part of the request. Keep credentials, signed image URLs, and unrelated customer data out of shared instructions.

The directory containing `SKILL.md`, `reference/`, and `agents/` is portable. To use it in Codex, place that entire `chromatic-story-reliability` directory under your configured skills directory (commonly `~/.codex/skills/`) and start a session that discovers it. Other assistants can read `SKILL.md` directly; people can follow this guide without installing a skill. Keep the references together when distributing the folder.

Example fix request after investigation:

> Use `$chromatic-story-reliability` to implement the evidence-backed fix for `<story-id>`. Preserve the component's intended behavior and existing capture settings. Run the focused interaction in the normal browser and `<affected-browser>`, plus the repository's required checks. Separate local verification from remote capture verification. Do not publish or change review/quarantine state.
