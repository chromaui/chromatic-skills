# Workflow Evidence Ladder

Ask for the smallest artifact that settles the next branch.

## High-value evidence already in hand

- exact warning or error text
- exact CI event type
- exact Chromatic command or action inputs
- checkout configuration showing history depth
- build URL plus the comparison the user expected

## Best next artifacts

1. exact `actions/checkout` step or equivalent checkout snippet
2. exact Chromatic invocation line or action step
3. `git rev-parse HEAD`
4. `git branch --show-current`
5. `git log --oneline --decorate -n 10`
6. `git merge-base <head> <base>`

## Things to avoid asking for first

- a full repository tree
- unrelated Storybook config
- multiple advanced git commands at once
- long CI logs when one warning block is enough
