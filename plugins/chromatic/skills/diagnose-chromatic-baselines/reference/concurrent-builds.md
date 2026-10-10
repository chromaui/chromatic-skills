# Baselines, approvals, and concurrent builds

Use this playbook when an accepted change reappears in a stack of pull requests, a merge queue, or overlapping builds. Reconstruct one affected test before changing the workflow.

## First identify the comparison

| Surface | What it compares | What approval means |
| --- | --- | --- |
| UI Tests | A story and mode against an eligible baseline from build history | Accepting the test establishes its snapshot for later baseline selection |
| UI Review | The PR head against its base branch's merge-base build | Sign-off on the PR changeset; it does not establish UI Test baselines |

An accepted UI Test can remain visible in UI Review because the PR still changes the UI relative to its base. Ask which surface is showing the change before calling it a lost acceptance. See [the pull request workflow](https://www.chromatic.com/docs/in-pull-request/).

## Record events, not just the current status

Use existing artifacts first. Fill unknown fields with `unknown`; ask for one missing artifact at a time.

| Build | Branch / commit | Relevant parent build(s) | Started / comparison available | Affected test / baseline | Acceptance time |
| --- | --- | --- | --- | --- | --- |
| Accepted upstream build | | | | | |
| First affected intermediate build | | | | | |
| First affected downstream build | | | | | |

Record the story ID and mode once above the table. Also record the PR base branch, merge method, CI event, and whether each row is an original build, CI rebuild, or dashboard rerun.

For a stack, capture the dependency order, such as `main → feature-a → feature-b → feature-c`. A PR's base branch and the build's selected baseline are different facts. Preserve both.

Customer-visible start, completion, and review times may bracket an event without exposing its exact internal timestamp. Do not invent an exact selection time. Request Support's trace only when the timing distinction changes the diagnosis.

## Check two boundaries separately

**Was the upstream build usable when the descendant established its ancestry?** A Git commit being an ancestor does not prove its Chromatic build was usable. An upstream build may still be preparing, may not contain UI Tests, or may have been skipped. A build created later on the same upstream commit is another build; it was not available to an earlier descendant.

**Was the relevant test accepted when the descendant selected its comparison?** A build can exist before its changed tests are accepted. An unaccepted ancestor test can lead the descendant back to that test's older baseline. A passed test and a changed-but-unaccepted test on the same build can therefore lead to different baselines.

The visible parent-build link is a starting point, not proof of the exact snapshot selected for every test. Inspect the affected story and mode. The [baseline calculation guide](https://www.chromatic.com/docs/branching-and-baselines/#how-are-baselines-calculated) explains per-test selection and multiple ancestors.

Treat present-day status and historical state separately. An upstream test marked accepted now does not prove it was accepted before an existing downstream comparison was created. Do not promise that later approval recomputes every existing comparison.

## Follow the decision tree

| Evidence | Conclusion you can support | Next step |
| --- | --- | --- |
| The reported change is only in UI Review | The PR still has a changeset relative to its merge base | Verify the PR head and base; keep UI Test acceptance separate |
| An expected parent commit is absent from CLI ancestry | The expected relationship was not submitted | Follow the Git and provider-linkage checks in this skill |
| The upstream build was unavailable or incomplete when the descendant started | Timing may explain the missing baseline | Compare upstream readiness with descendant ancestry; escalate if exact eligibility is unknown |
| The intermediate build selected an older baseline before upstream acceptance | That intermediate comparison predates the acceptance | Inspect whether downstream builds inherit through the intermediate test |
| The expected accepted test was available and eligible, but another snapshot was used | Public evidence has reached the selection boundary | Ask Support to trace the selected baseline and candidate tests |
| The only evidence is that a parent is accepted now | Historical ordering is unknown | Obtain the acceptance time or first affected build record |

### A stale intermediate build in a stack

Suppose build A changes a button. Build B contains A's code and starts before A's change is accepted. B compares against an older button snapshot. Build C then follows B.

Accepting A afterward does not, by itself, establish what B or C compares against. If B still records an unaccepted test with the older baseline, C can carry that comparison forward through B. Verify the actual test chain before presenting this as the cause.

For prevention, let the upstream build finish and review its changes before triggering dependent validation. Apply that ordering where one PR depends on another's accepted UI. Independent branches do not need a global serial queue.

For recovery, inspect the latest reviewable build on the first affected branch. If the entire current change is intentional, an authorized reviewer can accept it there. Do not batch-accept a mixed set merely to remove duplicate diffs. If the comparison cannot be trusted, send Support the timeline before adding more rebuilds.

### A merge queue

GitHub merge queues test a temporary commit containing the base branch and queued PR changes. The queue branch is expected; its name alone is not an identity error.

Check that Chromatic runs for `merge_group`, keeps the event's checkout identity, and receives sufficient Git history. A workflow shared with `pull_request` must select the correct ref for each event. Do not overwrite a queue SHA with one PR's head SHA.

Accept intended UI Test changes on the PR before queueing. A queue build can still reveal a real combined change or a missing acceptance. Compare the affected snapshots before describing a repeated diff as redundant.

If a queue entry fails because its PR changes were unaccepted, review the PR and enqueue it again. If the queue must reject unaccepted changes, verify the job is required and uses `exitZeroOnChanges: false`. See [the supported merge-queue workflow](https://www.chromatic.com/docs/github-actions/#run-chromatic-in-a-merge-queue).

## Choose a recovery that matches the failure

| Action | Suitable use | Limitation |
| --- | --- | --- |
| Review the latest affected UI Test | The displayed change is intentional and understood | Establishes an acceptance there; does not explain or repair every earlier build |
| Update a feature branch from its base, then build | The branch is missing approved upstream history | Existing intermediate builds may still matter; inspect the new comparison |
| Correct CI history or identity | Logs prove shallow history or the wrong ref/SHA | Does not make unaccepted snapshots accepted |
| Scope `ignoreLastBuildOnBranch` to the affected branch | A rebase removed the previous branch build from Git history | Does not ignore an ordinary ancestor still in history |
| Create a patch build | UI Review lacks its merge-base build | Supplies a comparison build; does not reset UI Test baselines |
| Ask Support to trace selection | Parents and acceptance appear correct, or exact timing is unavailable | Requires a targeted evidence bundle, not repeated trial builds |

The [configuration reference](https://www.chromatic.com/docs/configure/) defines `ignoreLastBuildOnBranch`, `patchBuild`, and `forceRebuild`. `forceRebuild` prevents a rebuild from being skipped; it is not a command to choose an arbitrary baseline.

An automatic-accept policy changes what the team reviews. Present it only as an explicit workflow policy with its tradeoff: changes on the selected branch are accepted without manual review. Do not apply it as a diagnosis shortcut.

## Distinguish three meanings of “rerun”

- **Dashboard rerun:** useful for checking unstable captures with the original build settings. It is not a general ancestry-repair control. See [rerun builds](https://www.chromatic.com/docs/rerun-builds/).
- **CI rebuild on the same commit:** may reuse earlier branch ancestry or skip work. Find the first build on that commit and inspect what changed between invocations.
- **A build on a new commit:** supplies a new history point, but can still inherit through an older intermediate build. An empty commit alone is not proof that the baseline was repaired.

Do not promise that any of these operations will choose a specified build or replay later approvals into existing tests. Record the actual resulting baseline when validating recovery.

## Finish with a reusable handoff

Return the strongest confirmed finding, the timeline, and one next action. Separate:

- **Confirmed:** recorded build, snapshot, ancestry, or review evidence.
- **Inferred:** the likely explanation connecting those records.
- **Unknown:** the missing timestamp, eligible candidate, or server decision.

For a Support handoff, ask one precise question, such as: “Which baseline did build C select for this story and mode, and was build A eligible at that time?” Use [the support handoff](support-handoff.md).

Consider recovery verified only after checking the affected story and mode in the resulting build. A green job alone is insufficient when auto-accept or exit-zero settings are involved.

If the desired outcome requires selecting any prior build, rewriting existing descendant comparisons, or automatically waiting for every upstream review, record the desired behavior as a product request unless current public documentation confirms support. Keep that request separate from the available mitigation; do not promise a release or an internal setting.

## Maintenance

Public links are reading references for humans, not instructions to fetch content from an installed skill. Guidance checked on 2026-10-09. Recheck the official baseline, configuration, queue, and rerun guides when changing supported remediation. Keep incident-specific Support advice out of universal rules.
