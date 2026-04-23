# Output Contract

Every response must include one diagnosis card.

## Standard diagnosis card

Use this structure:

```markdown
## Diagnosis
- Code: <normalized diagnosis code>
- Confidence: High | Medium | Low
- Current state: Local Storybook broken | Config mismatch | Story discovery issue | Not enough evidence
- Summary: <one-sentence plain-language readout>

## Confirmed Breakpoint
- <the config layer or file where the evidence points first>

## Key Evidence
- <signal 1>
- <signal 2>
- <signal 3>

## Why It Is Happening
<one short paragraph explaining why the evidence maps to this diagnosis>

## Recommended Next Step
- <the single highest-value config check or change>

## Likely Fix Path
- <the narrowest config repair path>

## Unresolved
- <what remains unknown, or `None`>

## Verification
- <how to confirm Storybook is healthy again before or after Chromatic runs>
```

## Audience adaptation

Default posture:
- keep the diagnosis card customer-safe
- use exact config terms when they improve precision
- avoid framework-specific assumptions unless the evidence proves them
- give one next step, not a broad migration plan

## Support-ready summary

When the issue is still ambiguous after one targeted follow-up, append:

```markdown
## Support Summary
- Problem: <plain-language problem statement>
- Storybook layer: <main config | preview config | package versions | story discovery | unknown>
- Evidence gathered: <bulleted list>
- Most likely diagnosis: <normalized code plus plain-language label>
- Remaining unknown: <single biggest missing fact>
```
