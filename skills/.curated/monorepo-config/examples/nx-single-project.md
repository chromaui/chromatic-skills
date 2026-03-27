# Nx Single-Project Example

## Input

A team has one shared Storybook for their design system in an Nx monorepo. They build Storybook through an Nx target rather than an npm script and want TurboSnap enabled.

## Expected use of the skill

- recommend one Chromatic project
- use `buildCommand` plus `outputDir` because the build is orchestrated through Nx
- call out `fetch-depth: 0` and `onlyChanged: true`
- mention Nx `webpackStatsJson` when TurboSnap trace quality depends on stats generation
