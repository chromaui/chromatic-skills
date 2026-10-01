# Customer Baseline Handoff Example

## Input

A customer accepted a story change on a pull-request build. The first `main` build after a squash merge showed the old baseline again. The CLI log does not include the accepted PR commit in its submitted parent commits. Chromatic Support has not supplied a lookup limit.

## Expected result

**Confirmed:** The first affected `main` build did not submit the accepted PR commit as a parent.

- Accepted PR build: build 201, accepted, story `button--primary`, default mode, commit `<accepted-pr-sha>`.
- First affected target build: build 202 on `main`, commit `<first-main-sha>`.
- Merge relationship: the accepted PR commit is not a Git ancestor after the squash merge.
- Submitted parents: `<other-parent-sha>`; the accepted PR commit is absent.
- Lookup window: unknown. Lookup truncation is not confirmed.
- Customer action: run Chromatic on every target-branch commit while the incident is investigated.
- Support action: confirm whether the repository provider linked the squash commit to the expected PR build.

The response stops at the customer access boundary. It does not claim a provider failure or server defect.
