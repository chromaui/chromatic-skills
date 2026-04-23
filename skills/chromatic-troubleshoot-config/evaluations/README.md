# Troubleshoot Config Evaluations

These scenarios verify that the troubleshoot-config skill:
- picks the right Storybook config branch
- separates local Storybook failures from Chromatic follow-on symptoms
- protects the local-build-first decision path before deeper config speculation
- asks for one artifact at a time
- avoids broad rewrites when a narrower file-level fix is likely
- gives one exact next step
