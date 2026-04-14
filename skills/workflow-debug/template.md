# Workflow Debug Intake

## Minimal customer request

Please share the exact Chromatic command or GitHub Action step that ran, plus the warning or error text you saw. If this is a pull request run, also share the checkout step so I can confirm whether the branch and git history were passed through correctly.

## Minimal git proof request

Please run these two commands and paste the output:

```bash
git rev-parse HEAD
git branch --show-current
```

## Merge-base request

Please run this command and paste the output:

```bash
git merge-base <head-branch> <base-branch>
```
