# Story reliability intake

Start with what you already know. This form is optional; accept natural-language requests and partial evidence. Ask for one missing artifact at a time when it would change the diagnosis.

```text
Project ID or build URL: <value>
Story/test: <exact ID or local test path>
Expected behavior: <intended outcome>
Observed problem: <what changed or failed>
Frequency and conditions: <repeatable, intermittent, order-dependent, or unknown>
Relevant environment: <mode, viewport, browser, build mode, or other known difference>
Branch/build: <value, if relevant>
History sample: <bounded scope, if needed>
Story/component source: <local paths or relevant pasted code>
Available image evidence: <attachment or local path, if any>
Requested scope: <investigate, propose a fix, or implement and test>
```

## Read-only investigation

> Use `$chromatic-story-reliability` to investigate the test described above. Start with local evidence and use my connected Chromatic MCP tools when remote evidence is needed, whether supplied by a plugin or connected directly. Search the deployed schema before composing queries. Choose checks that distinguish the likely causes; do not require unrelated image, history, quarantine, or browser checks. Report what actually ran and what remains uncertain. Do not read tokens, change reviews or quarantine, upload, or start a build. Ask for one missing artifact at a time.

## Implement an evidence-backed fix

> Use `$chromatic-story-reliability` to implement the evidence-backed fix in this checkout. Preserve the component's intended behavior and existing capture settings. Choose validation that exercises the failure mechanism, confirm the assertion still detects the regression, and run the repository's required checks. Separate local verification from any remote capture verification. Do not publish or change review/quarantine state.
