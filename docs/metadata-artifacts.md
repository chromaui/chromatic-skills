# Metadata Artifacts

Use this page when you need a support-shareable TurboSnap artifact from a hosted Storybook build.

## What `uploadMetadata` publishes

When `uploadMetadata` is enabled, Chromatic uploads a `.chromatic/` metadata directory alongside the hosted Storybook.

The key TurboSnap artifact is:
- `.chromatic/preview-stats.trimmed.json`

Other common metadata files include:
- `.chromatic/main.ts`
- `.chromatic/preview.tsx`
- `.chromatic/chromatic-diagnostics.json`
- `.chromatic/chromatic.log`
- `.chromatic/build-storybook.log`

Exact files vary by build and available logs.

## Preferred URL structure

Ask for the direct JSON URL first:

```text
<storybookUrl>.chromatic/preview-stats.trimmed.json
```

If the direct file URL is unknown, ask for the metadata directory URL:

```text
<storybookUrl>.chromatic/
```

That directory exposes an index page at `.chromatic/index.html` and links to the uploaded files.

## When to ask for it

Use hosted metadata only once the workflow needs stats or trace evidence.

Prefer it for:
- missing-stats follow-up when a rerun is possible
- broad or disputed trace investigations
- preview/config bail minimization
- internal handoff when a local stats file path is not practical

Do not front-load `uploadMetadata` during basic classification if logs already prove the diagnosis.

## How to enable it

CLI:

```bash
npx chromatic --upload-metadata
```

`chromatic.config.json`:

```json
{
  "uploadMetadata": true
}
```

GitHub Action:

```yaml
- uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    uploadMetadata: true
```

## Manual handoff rule

Installed skills should not fetch the hosted URL automatically.

If you want to continue inside the skill workflow:
- download the file yourself and provide the local path
- or paste the relevant contents

If you want help from Chromatic support:
- share the hosted URL directly

## Local trace fallback

`chromatic trace` still expects a local file path.

After you have downloaded the file yourself, you can run:

```bash
npx chromatic trace -s <local-path-to-preview-stats.trimmed.json> -m expanded <changed-file>
```
