---
name: diagnose-chromatic-baselines
description: Diagnose Chromatic visual-test baseline ancestry with customer-owned evidence. Use when an accepted change reappears, a PR acceptance seems not to carry to the target branch, a build uses an unexpected baseline, or rebuilds and branches disagree. Work from Chromatic build links, test or story IDs, CI debug logs, Git history, GitHub pull requests, and optional customer-scoped Public API access. Do not use internal Chromatic APIs, employee credentials, production configuration, or private observability.
metadata:
  short-description: Trace baseline ancestry with customer-owned evidence
---

# Diagnose Chromatic Baselines

Find the first build where the expected baseline stopped carrying forward. Separate confirmed evidence from facts that only Chromatic Support can verify.

## Keep the investigation customer-safe

- Work read-only unless the user explicitly requests a review action.
- Use only data the customer owns or can access normally.
- Never request a project token, API secret, session cookie, or signed asset URL in chat.
- Never instruct the user to extract credentials from a browser session.
- Never query an internal Chromatic API or production environment.
- Do not identify a server limit, provider failure, or baseline-selection defect as confirmed without direct evidence.
- Redact customer names, repository names, and committer email addresses from shared reports when they are not required.

## Collect the minimum evidence

Obtain:

1. The affected story ID and mode.
2. The PR build where the change was accepted.
3. The first affected build on the target branch.
4. The PR number, merge strategy, accepted PR commit, and target-branch commit.
5. CLI debug logs for the accepted build and first affected target-branch build.
6. A later rebuild only when it helps locate the first build on the same commit.

Read [reference/collect-evidence.md](reference/collect-evidence.md) for customer-safe collection methods. Do not block on optional API access when build pages and logs provide enough evidence.

## Analyze the first affected build

Resolve `scripts/` and `reference/` paths from the directory that contains this `SKILL.md`. Do not resolve them from the customer's repository.

Run:

```bash
python3 scripts/analyze_chromatic_log.py /path/to/chromatic.log \
  --expected-parent <accepted-pr-commit> \
  --merge-commit <target-branch-merge-commit>
```

Pass `--known-lookup-limit` only when Chromatic Support supplied the deployed value for this incident. The script has no default limit and must not guess one.

If the report classifies the log as a same-commit rebuild, find the preceding build on that commit. Analyze the preceding build instead.

## Verify Git ancestry

For a regular merge, run:

```bash
git merge-base --is-ancestor <accepted-pr-commit> <first-target-branch-commit>
```

Interpret the exit code:

- `0`: Git contains the accepted PR commit in the target commit's ancestry.
- `1`: Git does not contain that relationship. This is normal after squash and rebase merges.
- Any other value: Fix the repository or object-access error before drawing a conclusion.

For GitHub repositories, retrieve customer-visible merge information:

```bash
gh pr view <pr-number> \
  --repo <owner/repository> \
  --json mergeCommit,headRefOid,mergeStateStatus,mergedAt
```

Use the repository host's equivalent command or UI when the project does not use GitHub.

## Classify only what the evidence proves

| Evidence | Customer-safe conclusion | Next step |
|---|---|---|
| The PR test was not accepted | The expected acceptance was not recorded on that test | Verify the reviewed story, mode, build, and test |
| The current commit equals the previous branch-build commit | This is a rebuild | Analyze the first build on the commit |
| The accepted PR commit appears in submitted parent commits | The ancestry handoff included the expected commit | Ask Support to trace exact baseline selection if the wrong image remains |
| Regular merge ancestry exits `0`, but the accepted commit is absent from submitted parents | Git ancestry and submitted build ancestry disagree | Send the Git result and CLI report to Support |
| Squash or rebase merge, and the accepted commit is absent from submitted parents | The public evidence does not show a link to the accepted PR build | Use the mitigation below and ask Support to inspect provider linkage |
| Support supplied a lookup limit and the merge position exceeds it | The merge lies outside the confirmed lookup window | Ask Support to confirm the product-side cause and remediation |
| No support-supplied limit exists | Lookup truncation is unconfirmed | Report the merge position without guessing the limit |
| A later PR head differs from the accepted commit | A later PR build may have changed the inherited state | Inspect the intervening PR builds |

Read [reference/baseline-model.md](reference/baseline-model.md) before explaining acceptance, ancestry, merge strategy, or rebuild behavior.

## Recommend safe mitigations

Choose only mitigations supported by the evidence:

- Run Chromatic on every target-branch commit so build ancestry has fewer gaps.
- Analyze the first build on a commit instead of a later rebuild.
- Confirm that the Chromatic Git provider integration can access the repository.
- Use a regular merge commit as a temporary workaround when preserving Git ancestry is acceptable.
- Ask Chromatic Support to trace the exact baseline when submitted parents are correct but the comparison is not.

Do not recommend changing clone filters unless Git reports missing commit objects or ancestry errors.

## Report the result

Start with one sentence that states the strongest confirmed conclusion. Then include:

1. Accepted PR build, test state, mode, and commit.
2. First affected target-branch build and submitted parent commits.
3. Merge strategy and direct Git ancestry result.
4. Merge position, but only compare it with a support-supplied limit.
5. The confirmed failure boundary or the single unresolved question.
6. One customer action and one action for Chromatic Support.

Use [reference/support-handoff.md](reference/support-handoff.md) when the remaining question requires Chromatic-only data.

Use precise labels:

- **Confirmed:** directly shown by a build record, CLI log, or Git command.
- **Inferred:** follows from confirmed evidence but is not directly recorded.
- **Unknown:** requires missing customer evidence or Chromatic Support access.

Stop when the evidence reaches the external access boundary. Do not replace missing evidence with a theory.

## References and examples

- `reference/collect-evidence.md`
- `reference/baseline-model.md`
- `reference/support-handoff.md`
- `template.md`
- `examples/customer-baseline-handoff.md`
- `evaluations/README.md`
