# Using Chromatic Skills from Codex

Install the curated skill that matches your workflow:

```bash
npx skills add chromaui/chromatic-skills@workflow-debug
npx skills add chromaui/chromatic-skills@monorepo-config
npx skills add chromaui/chromatic-skills@turbosnap-debug
npx skills add chromaui/chromatic-skills@turbosnap-debug-internal
npx skills add chromaui/chromatic-skills@turbosnap-debug-customer
npx skills add chromaui/chromatic-skills@turbosnap-debug-after-stats
```

Then invoke the skill directly in Codex:

```text
Use $workflow-debug to diagnose this Chromatic baseline issue.
Use $monorepo-config to recommend the best Chromatic setup for this Nx monorepo.
Use $turbosnap-debug-customer to guide this TurboSnap investigation.
```

Use the hosted metadata flow when a TurboSnap investigation needs stats:
- hosted URL as a support-shareable artifact: `<storybookUrl>.chromatic/preview-stats.trimmed.json`
- fallback discovery directory: `<storybookUrl>.chromatic/`
- local stats path or pasted contents for continued in-skill analysis
