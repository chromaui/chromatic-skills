# Story reliability evaluations

These offline scenarios exercise the evidence boundaries and fixture proposal. Give the evaluating agent the scenario's `query`, `context`, and skill, without its expected behavior or success criteria. Compare the response with those criteria afterward. No live service calls or repository changes are needed.

- `capture-provenance-and-quarantine.json`: equal comparisons with unknown origin, a skipped build without tests, exact-mode matching across two quarantine pages, and image access that has not been verified.
- `non-connecting-fixture.json`: distinguish a timeout callback from parent-owned UI, propose a script-free fixture, and assert the real error callback without changing production timing.
- `shared-state-between-stories.json`: diagnose an order-dependent failure using local evidence without requiring a remote connection, another browser, or a production behavior change.
- `variable-story-inputs.json`: stabilize a changing story input through an existing component seam and distinguish a direct MCP connection from plugin installation.

Browser names and timer values in scenarios are case data, not requirements of the skill. These scenarios validate reasoning. They do not replace executing the relevant tests or checking remote results when applicable.
