# Example: an intermediate build predates acceptance

This is a fictional case. Build labels, commit labels, and times are illustrative.

**Confirmed:** build B compared against the older button snapshot before build A's new button was accepted. Build C still shows that older baseline.

Affected test: `button--primary`, mode `desktop-light`. The symptom is in UI Tests. The stack is `main → feature-a → feature-b → feature-c`.

| Time (UTC) | Evidence |
| --- | --- |
| 09:00 | Main build M has an accepted green button. |
| 09:05 | Build A finishes on `feature-a`; its blue button change is unaccepted. |
| 09:08 | Build B finishes on `feature-b`, based on A. Its test records M's green button as baseline and remains unaccepted. |
| 09:10 | A reviewer accepts the blue button in A. |
| 09:15 | Build C finishes on `feature-c`, based on B. Its test still records M's green button as baseline. |

**Inferred:** B's earlier comparison is carrying the older baseline into C. A's current accepted status does not show that B was recomputed.

**Unknown:** the exact candidate-selection path for C. The visible build links do not establish every per-test decision.

**Next step:** ask Support to trace C's baseline for `button--primary` in `desktop-light`, using A, B, and C's records and this timeline. The question is whether C inherited M through B despite A's later acceptance.

If an authorized reviewer confirms the entire change on the latest affected build is intentional, accepting that test is a separate recovery option. Do not accept other changes without reviewing them. A dashboard rerun is not proof that ancestry has been recalculated.

For future dependent builds, finish the upstream review before starting downstream validation. Verify recovery using the specific story and mode in the resulting build, including its selected baseline and test state.
