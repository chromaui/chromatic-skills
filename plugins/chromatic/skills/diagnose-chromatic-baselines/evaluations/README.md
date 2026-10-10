# Baseline Diagnosis Evaluations

These scenarios verify that the public `diagnose-chromatic-baselines` skill:

- distinguishes acceptance from later inheritance;
- analyzes the first build on a commit;
- handles current and legacy CLI log formats;
- treats an empty submitted-parent list as evidence;
- never guesses a server lookup limit;
- stops at the customer access boundary;
- produces a sanitized, support-ready handoff;
- distinguishes UI Review sign-off from UI Test acceptance;
- reconstructs readiness and acceptance timing across intermediate builds;
- avoids promising that reruns or empty commits reset ancestry;
- separates supported recovery from requests for new product behavior.

Each JSON file is a manual behavioral evaluation, not an executable test. Give an evaluator the skill plus only `query` and `context`; assess its output against `expected_behavior` and `success_criteria`. Repository tests check fixture syntax, not whether an agent follows the workflow.
