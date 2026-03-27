# Output Contract

Every response must include one diagnosis card.

## Standard diagnosis card

Use this structure:

```markdown
## Diagnosis
- Code: <normalized diagnosis code>
- Confidence: High | Medium | Low
- Current TurboSnap state: Enabled | Disabled for this build | Unavailable | Not enabled
- Summary: <one-sentence plain-language readout>

## Key Evidence
- <signal 1>
- <signal 2>
- <signal 3>

## Current State
<one short paragraph explaining what TurboSnap is doing right now and why the evidence maps to the diagnosis>

## Recommended Next Step
- <the single highest-value check, command, or fix>

## Likely Fix Path
- <what restores or validates TurboSnap next>

## Unresolved
- <what remains unknown, or `None`>

## Deeper Technical Note
<optional; include only when extra implementation detail changes the recommendation or helps a support handoff>
```

The `Deeper Technical Note` section is optional.
Leave it out when the diagnosis card is already sufficient.

## Suppression formatting

When the likely fix path includes `--untraced`:
- keep the minimal technical fix explicit
- render the safer recommended fix as one `--untraced '<picomatch-pattern>'`
- avoid repeating one `--untraced` flag per path in the recommended command
- if the safer pattern covers `.storybook`, exclude `main.*` and `preview.*` by default unless the case explicitly proves those files are safe to suppress

## Audience adaptation

Default posture:
- keep the diagnosis card customer-safe
- use technical terms when they improve precision, then define them plainly
- avoid raw repo field names unless the user already used them
- ask for only one next artifact at a time
- include outside docs references only when they clearly match the diagnosis and the user needs follow-up reading

## Support-ready summary

When the investigation cannot reach a confident fix after targeted follow-up, append:

```markdown
## Support Summary
- Problem: <plain-language problem statement>
- Current TurboSnap state: <state>
- Evidence gathered: <bulleted list>
- Commands run: <bulleted list or `None yet`>
- Most likely diagnosis: <normalized code plus plain-language label>
- Remaining unknown: <single biggest missing fact>
```

This summary should be copy-paste ready for a support ticket or handoff.
