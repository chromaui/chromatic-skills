# Collect customer-owned evidence

Use the least privileged source that answers the question.

## Build and test records

From the Chromatic build pages, record:

- build URL and number;
- branch and full commit SHA;
- build status and result;
- affected story ID and mode;
- affected test status and result;
- whether this is the first build on the commit.

Do not treat a visual label alone as proof of the immediate baseline chain.

## Optional Public API access

Use the Chromatic Public API only when the customer already has an account-scoped client with `build:read`. Store the client secret in a local secret file or secret manager. Never paste it into chat.

The public build record can provide build status, branch, commit, parent commits, tests, story IDs, modes, and results. It does not provide every server-side baseline-selection detail.

Do not use a project token as a substitute for Public API authentication. Do not extract a web session cookie.

## CLI debug logs

Collect the full CLI output for:

1. The accepted PR build.
2. The first affected target-branch build.

When sharing logs outside the customer's organization, remove:

- project tokens and API secrets;
- authorization headers and cookies;
- signed image or asset URLs;
- customer and repository names when unnecessary;
- committer names and email addresses.

Keep build numbers, story IDs, commit SHAs, branch roles, ancestry lines, and parent commits. Those fields are needed for diagnosis.

Run the bundled analyzer locally. It reads the file and prints only parsed ancestry fields:

```bash
python3 scripts/analyze_chromatic_log.py chromatic.log --json --redact-branch
```

Omit `--redact-branch` when the exact branch name is necessary and safe to share.

## Pull-request and Git evidence

For GitHub:

```bash
gh pr view <pr-number> \
  --repo <owner/repository> \
  --json mergeCommit,headRefOid,mergeStateStatus,mergedAt
```

For direct ancestry:

```bash
git merge-base --is-ancestor <accepted-pr-commit> <target-branch-commit>
printf '%s\n' "$?"
```

Exit `0` means the first commit is an ancestor. Exit `1` means it is not. Other exit codes indicate a command or repository error.

If the local clone is shallow or missing objects, fetch the required commits through the customer's normal repository credentials. Do not assume a partial clone caused the issue when the command completed successfully.

## Evidence checklist

Before classifying the incident, confirm:

- The accepted test matches the affected story and mode.
- The accepted commit is exact, not a branch name or abbreviated guess.
- The target build is the first build on its commit.
- The merge strategy is known.
- The CLI log contains the final submitted parent commits.
- Any lookup limit came directly from Chromatic Support for this incident.
