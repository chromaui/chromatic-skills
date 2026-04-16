# Visual Diff Workflow Playbook

Use this workflow to move from symptom to the smallest stabilizing action.

## Default path

1. identify the affected story and current rendering symptom
2. decide whether the issue reproduces locally
3. classify the most likely rendering cause
4. ask for one exact artifact or run one targeted repo probe if needed
5. return the diagnosis card with one verification step

## Phase A: Triage

Look for the fastest branch-cutting facts:
- did the UI intentionally change?
- does local Storybook show the same problem?
- is the issue story-local or shared through preview, decorators, or globals?

## Phase B: Rendering-cause selection

Prefer these branches in order:
- expected change
- local rendering drift
- fonts or assets
- timing or motion
- unstable data or globals

## Phase C: Targeted validation

If the repo is available, inspect:
- the affected story
- `.storybook/preview.*`
- shared decorators, globals, and mode parameters
- obvious font, animation, and random-data sources

## Phase D: Recommendation

Return the narrowest fix that matches the evidence.

If the evidence is incomplete, ask for one exact artifact instead of proposing a broad stabilization checklist.
