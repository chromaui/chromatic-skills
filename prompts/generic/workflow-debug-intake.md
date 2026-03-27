# Workflow Debug Intake

Use this prompt when you want help diagnosing a Chromatic workflow issue.

Please share:
- the exact Chromatic command or action step
- the warning or error text
- the CI event type and checkout step if this is a CI run
- the comparison you expected Chromatic to make

The workflow-debug skill should:
- choose one diagnosis branch
- explain the current state in plain language
- ask for one additional artifact only if needed
