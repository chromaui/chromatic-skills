# Baseline Diagnosis Intake

Use this form when the user can provide a structured evidence bundle. Accept partial evidence and ask for only one missing artifact at a time.

```text
Affected story ID: <story-id>
Mode: <mode or default>
Comparison surface: <UI Tests, UI Review, or unknown>
Accepted PR build: <build URL or number>
Accepted test state: <accepted, not accepted, or unknown>
Accepted PR commit: <full SHA>
PR number: <number>
Merge method: <merge commit, squash, rebase, or unknown>
First affected target-branch build: <build URL or number>
First affected target-branch commit: <full SHA>
Observed behavior: <what changed or reappeared>
Accepted-build CLI log: <local path or pasted relevant lines>
Affected-build CLI log: <local path or pasted relevant lines>
Git ancestry result: <exit code from git merge-base --is-ancestor, if known>
Support-supplied lookup limit: <number or unknown>
```

For stacked PRs, queues, or overlapping builds, add only the applicable fields:

```text
Dependency order: <base branch → upstream PR → downstream PR>
CI event: <push, pull_request, merge_group, other, or unknown>
Upstream build ready time: <timestamp with timezone or unknown>
Upstream test acceptance time: <timestamp with timezone or unknown>
Intermediate build(s): <build, branch, commit, selected baseline, test state>
Downstream start / comparison available: <timestamps with timezone or unknown>
Rerun type: <dashboard rerun, CI rebuild, new commit, or none>
```

## Customer prompt

```text
Use $diagnose-chromatic-baselines to determine why this accepted visual change did not carry forward.

Start with the evidence below. Keep confirmed facts separate from hypotheses. Ask for one missing artifact at a time. Do not use internal Chromatic APIs or ask me for credentials.

Evidence:
<paste the completed intake form, build links, or relevant CLI log lines>
```

For a concurrency case, append: `Build a timeline of upstream readiness, acceptance, and intermediate comparisons. Identify the first affected build and one supported next action. Do not assume a rerun resets ancestry.`

## Support handoff prompt

```text
Use $diagnose-chromatic-baselines to turn this customer-owned evidence into a sanitized Chromatic Support handoff.

Do not include secrets, cookies, signed URLs, customer names, repository names, or committer email addresses. State the confirmed boundary and ask Support one question that requires Chromatic-only data.

Evidence:
<paste sanitized analyzer output and build details>
```
