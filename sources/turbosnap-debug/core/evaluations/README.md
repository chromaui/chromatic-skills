# TurboSnap Debug Evaluations

Evaluation scenarios for the private TurboSnap skill suite.

## Purpose

These scenarios verify that the shared core and thin wrappers:
- pick the right normalized diagnosis code
- cite the right evidence
- ask for the smallest next artifact
- preserve TurboSnap as the intended fix path without hiding current hard-bail states
- render audience-appropriate output

## Coverage

The initial set covers:
- missing stats files
- invalid git history
- base-dir and path mismatch issues
- overly broad traces
- missed expected stories
- partial-log customer cases that should end in a support-ready summary

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
- precise about wrapper-specific behavior
