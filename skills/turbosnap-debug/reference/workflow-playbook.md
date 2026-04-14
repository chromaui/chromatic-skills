# TurboSnap Support Workflow

Use this adaptive workflow for customer, support, and engineer investigations.

## Default path

1. triage the current build state
2. request the smallest next artifact
3. if richer evidence is available, validate it with targeted trace or path proof
4. if the goal is to restore TurboSnap, minimize the fix path
5. return a diagnosis card and exact next step
6. include a deeper technical note only when it changes the recommendation or helps handoff

## Phase 1: Triage

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

## Phase 2: Artifact Request

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

## Phase 3: Trace Validation

Only enter this phase when at least one of these is true:
- the bail reason is already known and the goal is to restore TurboSnap
- the user shared a stats file, pasted contents, or changed files
- a prior trace already showed the broad or missed path that needs explanation

In this phase:
- validate the bail or active trace with `chromatic trace`
- if the only stats artifact is a hosted URL, ask the user to download the file manually and provide a local path or paste the relevant contents
- if the issue is a preview/config bail, use `reference/trace-minimization.md`
- separate the minimal technical fix from the safer recommended fix
- keep the minimal technical fix explicit
- render the safer recommended `--untraced` fix as one picomatch glob instead of one flag per path when the safer set can be compressed safely

## Phase 4: Recommendation

Always return:
- diagnosis code
- confidence
- current TurboSnap state
- key evidence
- the recommended next step
- likely fix path
- unresolved items

Default posture:
- explain the diagnosis before referencing outside docs
- keep the output customer-safe, but technically honest
- use technical terms when they improve precision and define them plainly
- ask for one next artifact at a time when evidence is incomplete
- if hosted metadata exists, treat it as a human handoff artifact: the user can share the URL with support or download the file themselves and provide a local path
- if the user is a support engineer or power user, add a deeper technical note only when it materially improves the decision or handoff
