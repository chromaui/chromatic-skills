# Example initial audit

Audit completed. Preview imports `src/testing/index.ts`, whose stats footprint reaches 32 application modules. The inspected file re-exports helpers; the report lists their exact paths. A hypothetical change to `src/testing/index.ts` produces a confirmed preview-configuration bail in the official CLI trace.

This is current global exposure, not proof that the project regressed or that the barrel must be changed. Inspect which exports preview actually needs and whether those dependencies intentionally provide global behavior. Recommend a focused follow-up only after that source inspection. Include the named probe, dependency path, count, and evidence directory. Leave files and tracing settings unchanged.
