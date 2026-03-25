# Using TurboSnap Skills from Codex

Install the curated skill that matches your workflow:

```bash
npx skills add chromaui/chromatic-skills@turbosnap-debug
npx skills add chromaui/chromatic-skills@turbosnap-debug-internal
npx skills add chromaui/chromatic-skills@turbosnap-debug-customer
npx skills add chromaui/chromatic-skills@turbosnap-debug-after-stats
```

Then invoke the skill directly in Codex:

```text
Use $turbosnap-debug-internal to classify this TurboSnap issue.
```

Use the hosted metadata flow when the investigation needs stats:
- hosted URL as a support-shareable artifact: `<storybookUrl>.chromatic/preview-stats.trimmed.json`
- fallback discovery directory: `<storybookUrl>.chromatic/`
- local stats path or pasted contents for continued in-skill analysis
