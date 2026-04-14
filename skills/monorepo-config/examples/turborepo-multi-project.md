# Turborepo Multi-Project Example

## Input

A Turborepo contains multiple independently owned apps, each with its own Storybook and approval flow.

## Expected use of the skill

- recommend multiple Chromatic projects
- suggest one action step per Storybook with separate tokens
- use repo-root execution only when it simplifies CI, otherwise prefer package-local runs
- call out root lockfile handling and suppression risk explicitly
