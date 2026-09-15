# Baseline Diagnosis Evaluations

These scenarios verify that the public `diagnose-chromatic-baselines` skill:

- distinguishes acceptance from later inheritance;
- analyzes the first build on a commit;
- handles current and legacy CLI log formats;
- treats an empty submitted-parent list as evidence;
- never guesses a server lookup limit;
- stops at the customer access boundary;
- produces a sanitized, support-ready handoff.
