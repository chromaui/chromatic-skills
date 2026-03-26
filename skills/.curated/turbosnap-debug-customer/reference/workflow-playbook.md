# TurboSnap Support Workflow

Use this workflow to match how TurboSnap cases are usually handled in support.

## Default path

1. classify the current build state
2. request the smallest next artifact
3. if stats are needed, prefer a local stats path, pasted contents, or pasted trace output
4. if stats are available, run targeted trace
5. if the goal is to restore TurboSnap, minimize the fix path
6. return a diagnosis card and customer-safe next step

## Phase A: Classify The Build State

Start with the evidence already present:
- build URL
- CLI output
- bail warning text
- exact Chromatic command
- Storybook build command
- changed files if already known
- hosted metadata URL if the build already published `.chromatic/` artifacts

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
- confirmation that `preview-stats.json` exists locally
- local stats file path
- pasted trace output or pasted stats-file excerpts
- hosted metadata URL for `.chromatic/preview-stats.trimmed.json` as a support-shareable artifact
- hosted `.chromatic/` directory URL when the direct JSON URL is unknown
- changed files list
- one targeted `chromatic trace` output

Use hosted metadata only when the workflow has reached a stats or trace stage.
Installed skills should not fetch the hosted URL themselves.
Do not front-load `uploadMetadata` during basic classification when the issue is already proven by logs.

## Phase C: Trace And Minimize

Only enter this phase when at least one of these is true:
- the bail reason is already known and the goal is to restore TurboSnap
- the customer shared a stats file, pasted contents, or changed files
- a prior trace already showed the broad or missed path that needs explanation

In this phase:
- validate the bail or active trace with `chromatic trace`
- if the only stats artifact is a hosted URL, ask the user to download the file manually and provide a local path or paste the relevant contents
- if the issue is a preview/config bail, use `reference/trace-minimization.md`
- separate the minimal technical fix from the safer recommended fix
- keep the minimal technical fix explicit
- render the safer recommended `--untraced` fix as one picomatch glob instead of one flag per path when the safer set can be compressed safely

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
- explain the diagnosis before referencing outside docs
- avoid internal field names unless the customer already used them
- ask for one next artifact at a time
- if hosted metadata exists, treat it as a human handoff artifact: the user can share the URL with support or download the file themselves and provide a local path

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
- prefer one monorepo-safe `--untraced` glob for the safer recommendation, while keeping the minimal technical set explicit
- treat hosted metadata URLs as support-shareable references, not direct machine inputs

### Customer guided

Default posture:
- translate findings into plain language
- give one exact command to run next
- avoid advanced flags unless the evidence points there
- introduce `uploadMetadata` only when it unlocks the next useful artifact, and make it clear that the user must download the file manually or share the URL with support
