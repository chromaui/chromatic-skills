# Story reliability evaluations

These offline scenarios exercise the evidence boundaries and fixture proposal. Give the evaluating agent the scenario's `query`, `context`, and skill, without its expected behavior or success criteria. Compare the response with those criteria afterward. No live service calls or repository changes are needed.

- `capture-provenance-and-quarantine.json`: equal comparisons with unknown origin, a skipped build without tests, exact-mode matching across two quarantine pages, and image access that has not been verified.
- `non-connecting-fixture.json`: distinguish a timeout callback from parent-owned UI, propose a script-free fixture, and assert the real error callback without changing production timing.

These scenarios validate reasoning. They do not replace running a changed story in the relevant browsers or checking a pushed commit's Chromatic results.
