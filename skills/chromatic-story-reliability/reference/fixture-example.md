# Example: an iframe that never connects

Use this pattern when testing a component whose existing contract is to call `onConnectionError(true)` after a timeout if an embedded preview has not connected. Adapt the component name, required props, framework import, and paths to the repository. This example is not a universal fix for flaky stories.

## Explain the timer first

In this case, the component schedules a ten-second check on mount. When that check runs, it reads the current `connected` prop and does nothing if already connected or unmounted. Otherwise, it calls `onConnectionError(true)`. It does not replace the iframe document, navigate, or render an error panel itself. A parent may use the callback to update its own UI; a story that supplies only a spy does not.

Connection messages can call `onConnectionError(false)` and `onConnected()`. A story that pins `connected={false}` can still receive such callbacks and later report a timeout. Waiting only for the positive error callback would miss that contradiction, so the assertion below also excludes success callbacks during the test.

## Serve controlled content

Place this at `static/non-connecting/iframe.html` in a directory served by the project's existing Storybook `staticDirs` configuration:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Non-connecting iframe fixture</title>
  </head>
  <body></body>
</html>
```

This document has no script, Storybook runtime, or external resources. It never sends a connection message. A nonexistent URL delegates its contents to the host's error handling; this file makes the contents deliberate. Verify the served URL, including any query parameters the component adds, returns this document with HTTP 200.

## Assert the real callback

This illustrative CSF story assumes `ConnectionFrame` exports its existing timeout as `LOAD_TIMEOUT`, and has props matching the example. Use the project's actual component and test imports; older Storybook versions may use a different test package. Do not add a production API just to copy this snippet.

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { ConnectionFrame, LOAD_TIMEOUT } from './ConnectionFrame';

const meta = { component: ConnectionFrame } satisfies Meta<typeof ConnectionFrame>;
export default meta;

export const FailToConnect = {
  args: {
    src: `${location.origin}/non-connecting/iframe.html`,
    connected: false,
    onConnected: fn(),
    onConnectionError: fn(),
    // Include the component's other required props here.
  },
  play: async ({ args }) => {
    await waitFor(
      async () => {
        await expect(args.onConnectionError).toHaveBeenCalledWith(true);
      },
      { timeout: LOAD_TIMEOUT * 1.2 }
    );
    await expect(args.onConnected).not.toHaveBeenCalled();
    await expect(args.onConnectionError).not.toHaveBeenCalledWith(false);
  },
} satisfies StoryObj<typeof meta>;
```

The 1.2 multiplier is an illustrative assertion budget: with a ten-second component timer it permits twelve seconds, and normally resolves at about ten. Choose a deadline that allows normal scheduling overhead and fits the actual runner's budget. Keep the component timer unchanged. Do not use fake timers or a fixed sleep to stand in for observing this behavior in the visual story.

The outer runner may terminate before an inner `waitFor` deadline. Chromatic's documented interaction window is currently an additional fifteen seconds after rendering; check the applicable limits before copying a longer assertion timeout. See [Chromatic interaction timing](https://www.chromatic.com/docs/interactions/debug/).

This test proves that the controlled story reports the expected failure without observing a success callback before `play` completes. It does not prove an error panel appears, that callbacks cannot happen later, or that a historical Firefox rasterization difference has been explained. If the story is intended to display a parent-owned error panel, use that parent or a faithful stateful harness and assert the visible panel as well.
