# Chromatic Support handoff

Send this report when customer-visible evidence cannot identify the server-side boundary.

Do not include secrets, cookies, authorization headers, signed asset URLs, customer names, or committer email addresses.

## Summary

**Confirmed conclusion:**

State one sentence supported by the evidence.

## Affected test

- Project ID:
- Story ID:
- Mode:
- Accepted PR build URL and number:
- Accepted test ID or URL:
- Accepted test state:
- Accepted PR commit:
- First affected target-branch build URL and number:
- First affected commit:
- Observed test state:

For a stack, merge queue, or concurrent build, attach the timeline from [the concurrent-build playbook](concurrent-builds.md). Include acceptance and readiness times where known; preserve `unknown` for unavailable selection times. State whether the symptom is in UI Tests or UI Review.

## Ancestry evidence

- Merge strategy:
- Merge commit:
- `git merge-base --is-ancestor` exit code:
- Position of the merge commit in the CLI traversal:
- Parent commits submitted by the CLI:
- Expected PR commit present in submitted parents: yes, no, or unknown
- Same-commit rebuild: yes or no

Attach the sanitized analyzer output and the relevant sanitized CLI log section.

## Customer checks completed

- Verified the story and mode:
- Verified the acceptance occurred on the stated build:
- Located the first build on the affected commit:
- Verified repository access:
- Reviewed intervening PR builds when the accepted commit was not the last PR head:

## Question for Support

Ask one question that crosses the customer access boundary. Examples:

- Did the provider map this merge commit to the expected PR build?
- What lookup configuration applied to this build?
- The expected parent was submitted. Which eligible baseline did the server select, and why?
- Was the expected upstream build eligible when the descendant established its ancestry, and was the affected test accepted when its comparison was selected?
- Did the server receive the same parent commits shown in the CLI log?

## Requested outcome

Request one concrete outcome:

- confirm the missing ancestry boundary;
- identify a safe project mitigation;
- link an existing product defect;
- open an engineering investigation with the evidence above.
