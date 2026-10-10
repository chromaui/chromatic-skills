# Workflow Debug Playbook

Use this workflow to keep git and baseline investigations narrow and actionable.

## Default path

1. classify the workflow failure
2. confirm the current git and CI shape
3. request the smallest missing artifact
4. explain the current comparison state
5. give one exact next step

## Phase A: Classify the workflow failure

Start with the strongest signal already present:
- `Found only one commit`
- `no ancestor build`
- `Failed to retrieve the merge base`
- wrong pull request comparison target
- missing approvals or baselines after a rebase
- output that mentions a replacement build

Choose one diagnosis code before you ask for more.

## Phase B: Confirm the git and CI shape

The usual questions are:
- which SHA is Chromatic associating with the build
- which branch is Chromatic associating with the build
- is CI building a detached merge commit or the head branch tip
- does the checkout include enough history for baseline selection
- is the merge base valid for the requested patch build

If you already know the answer to one of those from the logs, do not ask for it again.

## Phase C: Request the smallest next artifact

Preferred order:
- exact Chromatic invocation or GitHub Action inputs
- checkout step showing history depth
- one git command result proving branch or SHA state
- one merge-base command result
- the exact warning or error block

Keep the request short. Avoid asking for a whole workflow file when one step is enough.

## Phase D: Explain the current state

Always distinguish between:
- what Chromatic is doing on this run
- why it is doing that
- what would change on the next run after the fix

### Repeated approvals and concurrent builds

First distinguish UI Tests from UI Review. UI Test acceptance establishes a snapshot for future baselines. UI Review compares the PR head with the merge-base build, so an accepted change can remain in its changeset.

For a stack or overlapping builds, reconstruct the upstream build, first affected intermediate build, and downstream build. Record the story, mode, branch, commit, selected baseline, and readiness/review times. Keep unknown times explicit.

Check whether the upstream build was usable when the descendant established ancestry and whether its test was accepted when the comparison was selected. Current acceptance alone does not prove either. An intermediate unaccepted test can retain an older baseline that later builds inherit.

Use `WF_BASELINE_ACCEPTANCE_TIMING` when historical evidence supports that boundary. Otherwise use `WF_NEEDS_MORE_EVIDENCE` and request the first affected test record or the missing timestamp. Do not promise that a dashboard rerun, same-commit CI rebuild, or empty commit repairs existing comparisons. Inspect the resulting test before declaring recovery.

For a detailed human-readable procedure and timeline template, see [Baselines, approvals, and concurrent builds](https://github.com/chromaui/chromatic-skills/blob/main/skills/diagnose-chromatic-baselines/reference/concurrent-builds.md). This is optional reading; do not fetch it from an installed skill or require a sibling skill to answer.

### Merge queue checks

A GitHub queue branch is expected. Chromatic supports `merge_group` and automatically detects its branch and commit. Do not map it to one PR head simply because its name is unfamiliar.

Verify the CI event, checkout identity, and Chromatic invocation. Use `WF_MERGE_QUEUE_BRANCH_REMAP` only when evidence proves an override or ref mismatch; the legacy code name does not require manual remapping. An unaccepted PR test or a changed combined snapshot can explain a queue diff without an identity problem.

Review intended PR changes before queueing. If the queue rejects an unaccepted change, review it on the PR and enqueue again. For a missing queue check, verify the workflow runs on `merge_group`. See [the merge-queue guide](https://www.chromatic.com/docs/github-actions/#run-chromatic-in-a-merge-queue).

## Phase E: Return one next step

Return one exact next step, not a menu.

Examples:
- set `fetch-depth: 0`
- run the official GitHub Action so the head SHA and branch are forwarded
- rerun with `--patch-build head...base`
- add `ignoreLastBuildOnBranch` for the rebased branch pattern
- share `git merge-base head base`
