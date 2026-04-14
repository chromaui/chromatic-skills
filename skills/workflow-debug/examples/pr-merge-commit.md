# Pull Request Merge Commit Example

## Input

A customer says their pull request compares against the wrong baseline in GitHub Actions.

They shared:
- `GITHUB_EVENT_NAME=pull_request`
- a checkout step but not the official Chromatic action
- a Chromatic run that attached to the merge commit instead of the head branch tip

## Expected use of the skill

- classify as `WF_PR_EVENT_MISMATCH`
- explain that GitHub pull request runs often build an ephemeral merge commit
- ask for one exact action step or command line if the forwarding path is still unclear
- recommend forwarding the head branch and SHA through the official action path or equivalent settings
