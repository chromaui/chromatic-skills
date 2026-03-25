# Customer Guided Debug Example

## Input

Customer says:
> TurboSnap stopped working after we changed our Storybook build. We now get a full build every time.

They shared:
- the Chromatic command includes `--only-changed`
- the Storybook build command changed recently
- no trace output yet
- no hosted metadata URL yet

## Expected use of the core

- classify provisionally as `TS_BAIL_MISSING_STATS` or `TS_NEEDS_MORE_EVIDENCE`
- if a rerun is possible, ask for one artifact only: enable `uploadMetadata: true`, then either download the stats file manually and provide the local path or share the hosted URL with Chromatic support
- if hosted metadata is not available, fall back to confirming whether `preview-stats.json` exists in the built Storybook output
- if the file is missing, promote to `TS_BAIL_MISSING_STATS`
- explain that TurboSnap is unavailable for the current build and the fix is to restore the stats artifact so TurboSnap can run again next time

## Support phase

This is a customer-guided Phase B case from `reference/workflow-playbook.md`:
- the customer should get one short request
- the next ask should prefer a local artifact or pasted contents, with hosted metadata only as a handoff path
- if a rerun is not practical, the fallback ask is a local stats-file confirmation, not a broad debug questionnaire
