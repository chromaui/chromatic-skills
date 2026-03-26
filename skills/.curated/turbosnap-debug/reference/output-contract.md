# Output Contract

Every response must include a diagnosis card.

## Standard diagnosis card

Use this structure:

```markdown
## Diagnosis
- Code: <normalized diagnosis code>
- Confidence: High | Medium | Low
- Current TurboSnap state: Enabled | Disabled for this build | Unavailable | Not enabled

## Evidence
- <signal 1>
- <signal 2>
- <signal 3>

## Interpretation
<one short paragraph explaining why the evidence maps to the diagnosis>

## Next Step
- <the single highest-value check, command, or fix>

## Likely Fix Path
- <what restores or validates TurboSnap next>

## Unresolved
- <what remains unknown, or `None`>
```

## Internal wrapper add-on

The internal wrapper should append:

```markdown
## Customer-Safe Explanation
<short explanation that can be pasted to a customer with the right level of jargon>

## Next Artifact To Request
- <one artifact only>
```

Use normalized codes in the internal output.

## Suppression formatting

When the likely fix path includes `--untraced`:
- keep the minimal technical fix explicit
- render the safer recommended fix as one `--untraced '<picomatch-pattern>'`
- avoid repeating one `--untraced` flag per path in the recommended command
- if the safer pattern covers `.storybook`, exclude `main.*` and `preview.*` by default unless the case explicitly proves those files are safe to suppress

## Customer wrapper add-on

The customer wrapper should:
- keep the diagnosis card in plain language
- avoid raw repo field names unless the customer already used them
- ask for only one next artifact at a time
- include official docs links only when they clearly match the diagnosis

## Support-ready summary

When the customer flow cannot reach a confident fix after targeted follow-up, append:

```markdown
## Support Summary
- Problem: <plain-language problem statement>
- Current TurboSnap state: <state>
- Evidence gathered: <bulleted list>
- Commands run: <bulleted list or `None yet`>
- Most likely diagnosis: <normalized code plus plain-language label>
- Remaining unknown: <single biggest missing fact>
```

This summary should be copy-paste ready for a support ticket.
