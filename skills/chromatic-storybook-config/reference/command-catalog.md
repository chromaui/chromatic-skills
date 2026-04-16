# Storybook Config Command Catalog

Use these only when the repo is available and one targeted proof step will settle the next branch.

## Repo probes

### Find Storybook config files

```bash
rg --files .storybook
```

### Inspect story discovery, framework, and addon configuration

```bash
rg -n "stories:|framework:|addons:|core:|builder:" .storybook
```

### List story files the repo actually contains

```bash
rg --files -g "*.stories.*" -g "*.story.*" -g "*.mdx"
```

### Inspect Storybook and builder packages

```bash
rg -n '"@storybook/|"storybook"|"vite"|"webpack"' package.json
```

## Script guidance

- Read `package.json` before suggesting a Storybook command.
- Use the project's existing Storybook dev or build script if one exists.
- Do not invent script names when the repo already defines them.
