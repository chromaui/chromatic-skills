# Storybook Config Evidence Ladder

Ask for the smallest artifact that settles the next branch.

## High-value evidence already in hand

- the exact error block
- `.storybook/main.*`
- `.storybook/preview.*`
- Storybook dependencies and scripts from `package.json`
- one story file path that should be discovered or is failing
- confirmation whether local Storybook already fails

## Best next artifacts

1. exact Storybook or Chromatic verification error block
2. `.storybook/main.*`
3. `.storybook/preview.*`
4. the Storybook-related part of `package.json`
5. one story file path that should be present

## Things to avoid asking for first

- the whole repository
- a full lockfile paste
- unrelated CI logs
- all stories in the project
- builder migration plans before the current config is inspected
