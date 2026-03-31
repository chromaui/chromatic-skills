# Workflow Debug Command Catalog

Use only the smallest command needed for the branch you are on.

## Confirm branch and SHA

```bash
git rev-parse HEAD
git branch --show-current
```

## Confirm recent history

```bash
git log --oneline --decorate -n 10
```

## Confirm merge base for patch builds or PR reasoning

```bash
git merge-base <head-branch> <base-branch>
```

## Confirm checkout depth in GitHub Actions

Ask for the exact `actions/checkout` step.

## Confirm Chromatic invocation

Ask for one of:
- the exact `npx chromatic ...` command
- the exact `chromaui/action` step inputs

## Usage rule

Do not send all commands at once. Pick one command or one config snippet request.
