# Story reliability intake

Start with what you already know. This form is optional; accept natural-language requests and partial evidence. Ask for one missing artifact at a time when it would change the diagnosis.

```text
Project ID or build URL: <value>
Story ID: <exact story ID>
Mode: <name or unknown>
Browser: <name and version if known>
Branch: <branch or unknown>
Historical build: <number or URL, if relevant>
Recent build sample: <size, or start with seven>
Observed problem: <what changed or failed>
Story/component source: <local paths or relevant pasted code>
Available image evidence: <attachment or local path, if any>
Requested scope: <investigate, propose a fix, or implement and test>
```

## Read-only investigation

> Use `$chromatic-story-reliability` to investigate the story described above with my connected Chromatic tools. Search the deployed schema before selecting fields. Match the exact story, mode, and browser. Separate capture freshness, current quarantine, and historical ignores. Report which capabilities actually worked and which evidence remains unavailable. Do not read tokens, change reviews or quarantine, upload, or start a build. Ask for one missing artifact at a time.

## Implement an evidence-backed fix

> Use `$chromatic-story-reliability` to implement the proposed fix in this checkout. Preserve the component's intended behavior and existing capture settings. Run the focused interaction in the normal and affected browsers, plus the repository's required checks. Separate local verification from remote capture verification. Do not publish or change review/quarantine state.
