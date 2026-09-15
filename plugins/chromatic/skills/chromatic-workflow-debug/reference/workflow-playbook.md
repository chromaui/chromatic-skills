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

## Phase E: Return one next step

Return one exact next step, not a menu.

Examples:
- set `fetch-depth: 0`
- run the official GitHub Action so the head SHA and branch are forwarded
- rerun with `--patch-build head...base`
- add `ignoreLastBuildOnBranch` for the rebased branch pattern
- share `git merge-base head base`
