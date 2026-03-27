# Monorepo Config Intake

Use this prompt when you want a Chromatic setup recommendation for a monorepo.

Please share:
- whether the repo uses Nx or Turborepo
- whether there is one Storybook or several
- the current Chromatic command or action step
- where Storybook lives in the repo
- whether you want one shared review surface or separate approvals

The monorepo-config skill should:
- choose one Chromatic topology
- recommend exact config changes
- call out risk for any `externals` or `untraced` guidance
