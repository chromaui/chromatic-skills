# Rebase and Replacement Build Example

## Input

A customer rebased their branch, force-pushed, and then saw Chromatic mention a replacement build while TurboSnap still behaved differently than expected.

## Expected use of the skill

- classify as `WF_REBASE_BASELINE_CONFUSION` or `WF_REPLACEMENT_BUILD`
- explain that the old branch build may no longer exist in git history even if Chromatic still knows about it
- call out that replacement builds are used to recover from missing historic commits
- recommend one next proof point or one branch-setting change, not a list of unrelated flags
