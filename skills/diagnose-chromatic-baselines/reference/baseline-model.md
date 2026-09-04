# Customer-facing baseline model

## Acceptance and inheritance are different steps

Accepting a visual change records a decision for a specific test and snapshot. A later build must still find that accepted result through eligible build ancestry.

Baseline selection varies by story, mode, branch ancestry, and accepted history. Do not describe a project as having one global last-known-good commit.

The build page can summarize the accepted baseline. That label does not always prove the complete comparison chain. Use build records and CLI ancestry logs when exact provenance matters.

## Parent builds connect accepted changes to later builds

Chromatic uses Git history and build metadata to identify parent builds. CLI debug logs can show:

- the current commit;
- the previous build commit on the branch;
- commits inspected between builds;
- PR build commits added to the ancestry candidates;
- the final parent commits submitted for the build.

The public evidence can prove whether an expected commit was submitted as a parent. It cannot always explain the server-side choice between eligible tests.

## Merge strategy changes the evidence

### Regular merge

A regular merge retains the PR head in Git ancestry. This command should exit `0`:

```bash
git merge-base --is-ancestor <accepted-pr-commit> <target-branch-commit>
```

If the command exits `0` but the CLI did not submit the expected commit, capture both results for Support.

### Squash or rebase merge

A squash or rebase creates target-branch commits that do not contain the original PR head as a Git ancestor. Chromatic must connect the merged commit to the PR build through the repository provider.

Customer-visible evidence can show that the PR commit is absent. It usually cannot prove why provider linkage was absent. Possible causes remain hypotheses until Support verifies them.

## Rebuilds preserve the first decision on a commit

A rebuild on the same commit can inherit the earlier build's ancestry choice. A later rebuild does not prove that Chromatic recalculated every relationship.

Always locate the first build on the affected commit.

## Evidence boundary

Customer-accessible data usually establishes:

- test state and result;
- build branch and commit;
- submitted parent commits;
- repository merge information;
- CLI ancestry decisions.

Chromatic Support may need to establish:

- why a provider lookup returned a specific result;
- the deployed lookup configuration for the incident;
- the exact server-side baseline candidate and rationale;
- whether a product defect occurred after parent commits were submitted.
