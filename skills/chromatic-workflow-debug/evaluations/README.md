# Workflow Debug Evaluations

These scenarios verify that the public chromatic-workflow-debug skill:
- picks the right git or baseline diagnosis branch
- explains the current comparison state truthfully
- asks for one artifact at a time
- stays customer-safe
- gives one exact next step
- distinguishes queue identity problems from expected merge-group branches
- handles acceptance timing without promising a baseline reset
