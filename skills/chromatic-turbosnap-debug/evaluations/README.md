# TurboSnap Debug Evaluations

Evaluation scenarios for the adaptive TurboSnap skill.

## Purpose

These scenarios verify that the single public skill:
- picks the right normalized diagnosis code
- cites the right evidence
- asks for the smallest next artifact
- preserves TurboSnap as the intended fix path without hiding current hard-bail states
- adapts its output depth to the evidence and audience without requiring separate installables

## Coverage

The set covers:
- missing stats files
- invalid git history
- base-dir and path mismatch issues
- overly broad traces
- missed expected stories
- low-evidence self-serve cases that should end in a support-ready summary when needed
- preview-bail minimization with minimal-fix versus safer-fix guidance

## How to use

1. Trigger the skill listed in each evaluation file.
2. Provide the query and any context.
3. Check the expected behavior list.
4. Verify the success criteria.

## Quality bar

Good evaluations are:
- specific about the evidence available
- explicit about the expected diagnosis code
- clear about the next artifact or command
- precise about when the response should stay concise versus include a deeper technical note
