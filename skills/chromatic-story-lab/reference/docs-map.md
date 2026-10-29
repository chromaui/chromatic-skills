# Sources checked for this lab

Checked on 2026-10-02 against installed Storybook 10.5.7, React 19.0.0, Vite 6.3.5, and Playwright 1.54.1.

The lab type check, build, and browser run verify the used imports and assertions. Current Storybook docs describe a later release.

- [Storybook interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing): canvas queries, awaited interactions, awaited assertions, and per-story setup.
- [Storybook play functions](https://storybook.js.org/docs/writing-stories/play-function): interaction composition and async state.
- [Storybook network mocks](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-network-requests): an alternative when the production component requires HTTP mocks.
- [Chromatic interaction tests](https://www.chromatic.com/docs/interactions/): Chromatic waits for interactions before capture.
- [Chromatic quarantine](https://www.chromatic.com/docs/quarantine-tests/): capture continues while diffs remain ignored until quarantine is removed.
- [Chromatic billing](https://www.chromatic.com/docs/billing/): full visual captures cost one billed snapshot; quarantine continues captures; disabled snapshots cost zero.
- [Chromatic disable snapshots](https://www.chromatic.com/docs/disable-snapshots/): the Storybook `chromatic.disableSnapshot` parameter.
- [Chromatic monorepos](https://www.chromatic.com/docs/monorepos/): app boundaries and separate Storybooks.
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots): browser and host differences can affect screenshots.

These links support human follow-up. Installed agents should use the bundled notes.

The runner subscribes to `storyFinished` and play-error events through Storybook's preview channel. This plumbing is version-specific.

Recheck the event payload when changing Storybook versions. The runner requires successful story completion before recording a passing capture.

The runner compares PNG bytes within one local run. It creates no approved cross-commit baseline.

Review real Chromatic baselines separately after cloud execution is authorized.
