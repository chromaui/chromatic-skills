# Workflow Diagnosis Taxonomy

Use one primary code per response.

| Code | Meaning | Typical evidence |
| --- | --- | --- |
| `WF_INVALID_GIT_HISTORY` | The checkout history is too shallow or otherwise incomplete for safe baseline selection. | `Found only one commit`, missing parent commits, shallow checkout mention |
| `WF_PR_EVENT_MISMATCH` | CI is building a pull request merge commit or wrong ref, so Chromatic sees the wrong branch or SHA. | `pull_request` runs, detached merge commit, wrong comparison target |
| `WF_MISSING_COMMIT_DETAILS` | Chromatic cannot map the build cleanly to the intended SHA, branch, or slug. | warnings about missing commit details or unsupported CI forwarding |
| `WF_REBASE_BASELINE_CONFUSION` | A rebase or force-push changed history enough that the prior branch build should not be reused as-is. | rebased branch, missing baselines, `ignoreLastBuildOnBranch` pattern |
| `WF_NO_ANCESTOR_BUILD` | TurboSnap or comparison logic has no usable ancestor build for the current branch history. | no ancestor build warning, first relevant run on a branch |
| `WF_REPLACEMENT_BUILD` | Chromatic is using or should use a replacement build because the original baseline commit no longer exists or was uncommitted. | replaced build message, force-pushed-away commit, local build with uncommitted changes |
| `WF_MERGE_QUEUE_BRANCH_REMAP` | A proven override or checkout mismatch gives a merge queue run the wrong identity. | Submitted branch/SHA differs from the merge-group checkout; a queue branch name alone is not evidence |
| `WF_BASELINE_ACCEPTANCE_TIMING` | An upstream acceptance or build was unavailable when a dependent comparison was established. | Timeline and affected test records show an intermediate comparison predates acceptance or readiness |
| `WF_MERGE_BASE_NOT_FOUND` | The requested head and base do not produce a valid merge base. | merge-base error, `git merge-base` failure |
| `WF_PATCH_BUILD_REQUIRED` | The user needs a patch build flow to restore a missing comparison instead of changing baseline rules. | missing PR comparison, valid patch-build scenario |
| `WF_NEEDS_MORE_EVIDENCE` | The current evidence is not enough to pick one branch confidently. | partial logs, missing command and CI context |

## Priority rule

If more than one code appears plausible, prefer the earliest root cause in the chain.
