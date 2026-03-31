# Snippet Catalog

Use these patterns when enough context is available.

## Repo-root GitHub Action with workingDir

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    workingDir: apps/web
    onlyChanged: true
```

## Nx-style orchestrated build command

Use this when the Storybook build is not exposed as a plain package script.

```yaml
- uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    buildCommand: npx nx run ui:build-storybook
    outputDir: dist/storybook/ui
    onlyChanged: true
```

## Repo-root trace alignment

Use when Chromatic runs from repo root but the Storybook lives below it.

```yaml
storybookBaseDir: apps/web
storybookConfigDir: .storybook
onlyChanged: true
```

## Multiple project pattern

Use one action step per Storybook or per independently owned review surface, each with its own token and working directory or build command.

## Suppression rule

If you recommend `externals` or `untraced`, make the path repo-root-relative and explain the coverage tradeoff.
