# TurboSnap Support Workflow

Use this workflow to match how TurboSnap cases are usually handled in support.

## Default path

1. classify the current build state
2. request the smallest next artifact
3. if stats are available, run targeted trace
4. if the goal is to restore TurboSnap, minimize the fix path
5. return a diagnosis card and customer-safe next step

## Phase A: Classify The Build State

Start with the evidence already present:
- build URL
- CLI output
- bail warning text
- exact Chromatic command
- Storybook build command
- changed files if already known

Choose one primary diagnosis code before you ask for more.

Typical outcomes:
- hard bail already known from logs: stop and name it
- config unclear: request the invoking command or config
- active trace dispute: request the smallest trace artifact

## Phase B: Request The Smallest Next Artifact

Ask for one artifact only.

Preferred order:
- exact Chromatic command or GitHub Action step
- Storybook build command
- confirmation that `preview-stats.json` exists
- stats file path
- changed files list
- one targeted `chromatic trace` output

Do not ask for the stats file until the case has reached the point where tracing will help.

## Phase C: Trace And Minimize

Only enter this phase when at least one of these is true:
- the bail reason is already known and the goal is to restore TurboSnap
- the customer shared a stats file and changed files
- a prior trace already showed the broad or missed path that needs explanation

In this phase:
- validate the bail or active trace with `chromatic trace`
- if the issue is a preview/config bail, use `reference/trace-minimization.md`
- separate the minimal technical fix from the safer recommended fix

## Phase D: Return Actionable Results

Always return:
- diagnosis code
- confidence
- current TurboSnap state
- key evidence
- the next step
- likely fix path
- unresolved items

For customer-facing output:
- explain the diagnosis before linking docs
- avoid internal field names unless the customer already used them
- ask for one next artifact at a time

## Mode Guidance

### Internal triage

Default posture:
- identify the code
- decide the next artifact
- keep the customer explanation short and pasteable

### Internal after stats

Default posture:
- validate the graph behavior
- minimize the fix path if the goal is to remove a bail
- call out coverage risk when suggesting `--untraced` or `--externals`

### Customer guided

Default posture:
- translate findings into plain language
- give one exact command to run next
- avoid advanced flags unless the evidence points there
