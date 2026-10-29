# Write a reliable story

Start with the UI state the reviewer needs to see. Record how the story reaches that state.

Use this instruction when an agent writes stories:

> Inspect the installed Storybook version and the app's existing stories first.
> Use that version's framework and test imports.
> Record the working directory and exact build command.
> Write one story for each meaningful visible state.
> Replace time, random data, remote images, and remote responses with explicit fixtures.
> Keep the component's user actions and failure behavior.
> Reset mutable fixtures before each run.
> Await every interaction, assertion, and composed play function.
> Wait for the visible result with `findByRole` or `waitFor`.
> Await image readiness when the image matters to the capture.
> Run every corrected story three times in fresh contexts.
> Confirm that a deliberate regression fails.
> Restore the UI and run the affected story again.
> Report the story names, exact commands, and proof limits.

## Learn from the examples

`Clock.stories.tsx` exposes live time through a real interval. `FixedTime` supplies one timestamp through a prop.

If the production clock needs timezone or countdown coverage, add fixed cases for those behaviors. Freezing one screenshot does not cover every time behavior.

`RemoteInputs` loads a response from a reserved `.invalid` host. The local runner supplies two synthetic responses and images.

`Ready` uses an injected async service and a bundled SVG. This removes uncontrolled inputs at the component boundary.

The injected service preserves asynchronous success, loading, failure, and retry paths. It does not verify authentication, HTTP serialization, or server behavior.

Use existing MSW handlers when the target component cannot accept a service prop. Return explicit success and failure responses.

## Wait for the result

The `Saved` story waits for the heading before typing. It awaits typing and clicking.

It finds the status message after saving. It checks the message and the service call.

The `Saving` story holds a promise unresolved to show the pending state. Each run receives a new promise.

The `RetrySave` story rejects the first save and resolves the second. It checks the visible error, retained input, call arguments, and final confirmation.

Avoid a sleep that assumes a save finishes after a fixed duration. A timeout on an observable-state query is a failure bound.

Keep the pending-state story when adding a successful save fixture. Keep the error and retry stories too.

## Keep the monorepo boundary explicit

The notes app owns the stories, config, and images. The UI package owns the component and CSS.

The notes app's story glob includes only its `src` directory. The app imports the UI package through its workspace dependency.

Shared UI changes remain covered by the app's stories. The preview imports shared UI styling, so styling changes can affect every story.

Record the real target repository's boundaries before copying these commands. Do not invent Nx or Turborepo tasks for this npm workspace example.

Avoid suppressing shared UI, preview, package, or lockfile changes to reduce rebuilds. Use the existing monorepo and TurboSnap skills for tracing questions.

## Check suppression choices

Complete the cost questions before recommending suppression. State both the capture behavior and the lost review coverage.

For temporary quarantine, record an owner and repair date. Remove quarantine after validating the fix.

Recheck the documented billing rules when they change. The lab's calculation concerns full visual captures, not an account invoice.
