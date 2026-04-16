# Visual Diff Command Catalog

Use these only when the repo is available and one targeted proof step will settle the next branch.

## Repo probes

### Find Chromatic parameters and shared globals

```bash
rg -n "chromatic:|pauseAnimationAtEnd|delay|diffThreshold|modes|viewports|globals" .storybook src stories
```

### Find possible nondeterministic rendering inputs

```bash
rg -n "Math.random|Date.now|new Date\(|crypto.randomUUID|setTimeout|setInterval|requestAnimationFrame" src .storybook stories
```

### Find animation and transition sources

```bash
rg -n "animation|transition|keyframes|requestAnimationFrame" src .storybook stories
```

### Find custom font setup or font-loading code

```bash
rg -n "@font-face|font-display|font-family|FontFace|next/font|fonts?/" src .storybook public
```

## Script guidance

- Read `package.json` before suggesting a local Storybook command.
- Use the project's existing Storybook dev or build script if one exists.
- Do not invent script names when the repo already defines them.
