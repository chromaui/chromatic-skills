# Stories Glob Mismatch Example

## Input

A customer says Storybook starts but shows zero stories. They share one valid `Button.stories.tsx` path and a `main.ts` file whose `stories` glob only matches `../stories/**/*.mdx`.

## Expected use of the skill

- classify as `SB_CFG_STORIES_GLOB_MISMATCH`
- explain that Storybook is not scanning the file pattern that actually exists in the repo
- recommend the narrowest glob fix instead of changing builders or addons
