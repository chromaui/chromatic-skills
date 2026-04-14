# Topology Rubric

Always make one explicit topology recommendation.

## Recommend one Chromatic project

Choose this when most of these are true:
- the repo has one primary Storybook
- cross-package UI changes should be reviewed together
- shared preview or Storybook config is intentional and central
- teams do not need separate approval queues or ownership boundaries

## Recommend multiple Chromatic projects

Choose this when most of these are true:
- the repo has multiple Storybooks or independently owned UI apps
- each package or app needs independent approvals and baselines
- unrelated package changes should not produce shared review noise
- the build system already treats the Storybooks as separate targets

## Tie-breakers

If the repo is ambiguous:
- prefer one project for a single shared Storybook review surface
- prefer multiple projects for multiple independently reviewed Storybooks
