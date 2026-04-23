# Troubleshoot Config Command Catalog

Use these only when the repo is available and one targeted proof step will settle the next branch.

Prefer portable shell tools here. Do not assume `rg` is installed in the user's environment.

## Repo probes

### Find Storybook config files

```bash
find .storybook -type f
```

### Inspect story discovery, framework, and addon configuration

```bash
grep -RInE "stories:|framework:|addons:|core:|builder:" .storybook
```

### List story files the repo actually contains

```bash
find . -type f \
  \( -name "*.stories.*" -o -name "*.story.*" -o -name "*.mdx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*"
```

### Inspect Storybook and builder packages

```bash
grep -nE '"(@storybook/|storybook|vite|webpack)' package.json
```

## Script guidance

- Read `package.json` before suggesting a Storybook command.
- Use the project's existing Storybook dev or build script if one exists.
- Do not invent script names when the repo already defines them.
