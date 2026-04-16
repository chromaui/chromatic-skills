# Visual Diff Debug Evaluations

These scenarios verify that the public visual-diff skill:
- picks the right rendering-stability branch
- separates local rendering issues from Chromatic-only drift
- protects the expected-change boundary before stabilization advice
- asks for one artifact at a time
- avoids overusing suppression-style fixes
- gives one exact next step
