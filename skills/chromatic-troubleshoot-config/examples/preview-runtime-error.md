# Preview Runtime Error Example

## Input

A customer says Storybook crashes before stories render. The stack trace points into `.storybook/preview.ts` where a shared provider import throws at startup.

## Expected use of the skill

- classify as `SB_CFG_PREVIEW_RUNTIME_ERROR`
- state that the break happens in shared preview code before normal story rendering
- focus the next step on the preview import or decorator setup rather than story globs or package upgrades
