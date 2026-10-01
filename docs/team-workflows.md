# Team workflows

Use this repository to share reusable Chromatic diagnostics and configuration workflows. Start with one skill, a specific question, and the smallest useful evidence.

## Where each responsibility belongs

| Responsibility | Home | Handoff |
| --- | --- | --- |
| Product diagnostics and configuration guidance | The public skills in this repository | Evidence, findings, limitations, and a next step |
| Live account data and administrative operations | Approved access tools with their own permissions | Authorized data needed for the investigation |
| Customer context, reporting, follow-ups, and durable records | The team's internal workflow system | A scoped question and approved artifacts; then a record of the result |

An internal workflow can select a public skill and use its result. Keep the diagnostic procedure here so every entry point uses the same version. Keep account access, credentials, customer records, and internal routing in the surrounding system.

Installing a skill does not grant account access. These skills do not provide a usage export, customer database, or communication channel.

## Source and installed copies

| Location | Purpose | How to change it |
| --- | --- | --- |
| `skills/<name>/` in this repository | Canonical instructions, references, and helper scripts | Edit through a reviewed repository change |
| `plugins/chromatic/skills/` | Generated distribution for the Chromatic plugin | Regenerate from canonical sources |
| A local agent's skill directory or plugin cache | The installed version an agent runs | Update through the installer or plugin manager |

The audit skill's shared runtime is generated from the check skill. See [Contributing](../CONTRIBUTING.md#shared-turbosnap-runtime) before editing either runtime.

Pulling this repository does not necessarily update installed skills. Editing an installed copy does not update the shared source. To troubleshoot drift, record the resolved skill path and its repository revision or plugin version. Compare its contents with the intended release.

Use the [installation instructions](../README.md#install) for direct skill installation. Teams using a plugin manager should install the Chromatic plugin from this repository's marketplace. Choose one distribution method per agent environment to reduce duplicate skill entries.

## Choose a TurboSnap workflow

| Question | Skill | Example prompt |
| --- | --- | --- |
| What currently makes this Storybook sensitive to broad changes? | [chromatic-turbosnap-audit](../skills/chromatic-turbosnap-audit/SKILL.md) | “Use $chromatic-turbosnap-audit to inspect this Storybook's preview dependencies. Explain measured exposure without changing code.” |
| Do my pending changes introduce a dependency risk? | [chromatic-turbosnap-check](../skills/chromatic-turbosnap-check/SKILL.md) | “Use $chromatic-turbosnap-check on this branch against the merge base with our target branch. Report findings and evidence.” |
| Why did TurboSnap behave unexpectedly in this build? | [chromatic-turbosnap-debug](../skills/chromatic-turbosnap-debug/SKILL.md) | “Use $chromatic-turbosnap-debug to explain this build's full rebuild from the supplied log. Request the next artifact only if needed.” |
| Why do v1 tracing and v2 hashes disagree? | [chromatic-turbosnap-compare](../skills/chromatic-turbosnap-compare/SKILL.md) | “Use $chromatic-turbosnap-compare on these current and baseline manifests and the current log. Identify changed preview inputs absent from Git.” |

Audit measures the current graph. Check evaluates a selected Git change scope. Debug diagnoses an observed incident. Compare explains differences between recorded artifacts. Use the reported baseline for comparisons; adjacent build numbers do not establish ancestry.

For a check, name the actual target branch or commit. The default scope compares the working tree with `HEAD`; a clean checkout checks no changes.

For other work, choose from the [full catalog](../README.md#skills):

| Task | Skill |
| --- | --- |
| Accepted changes did not carry forward | [diagnose-chromatic-baselines](../skills/diagnose-chromatic-baselines/SKILL.md) |
| Git, pull request, merge queue, or baseline workflow behavior | [chromatic-workflow-debug](../skills/chromatic-workflow-debug/SKILL.md) |
| Storybook configuration or build failure | [chromatic-troubleshoot-config](../skills/chromatic-troubleshoot-config/SKILL.md) |
| Unexpected visual differences | [chromatic-troubleshoot-diff](../skills/chromatic-troubleshoot-diff/SKILL.md) |
| Monorepo setup | [chromatic-monorepo-config](../skills/chromatic-monorepo-config/SKILL.md) |
| CI setup | [chromatic-setup-ci](../skills/chromatic-setup-ci/SKILL.md) |
| Theme or viewport coverage | [chromatic-themes](../skills/chromatic-themes/SKILL.md) or [chromatic-viewports](../skills/chromatic-viewports/SKILL.md) |

## Prepare inputs and keep evidence

| Workflow | Inputs | Local output |
| --- | --- | --- |
| Audit | An authorized Git checkout, configured Storybook build, and installed CLI; local stats can replace the fresh build | `report.json`, `report.md`, and trace logs in a new evidence directory |
| Check | The same build setup, plus an explicit Git scope; artifact replay uses local stats and changed paths | Reports, build and trace logs, findings, and an exit status |
| Compare | A current manifest; add the reported baseline manifest, current log, stats, and preview paths as available | JSON on stdout; redirect it to an approved local evidence location when needed |
| Debug | Existing logs, configuration, symptoms, and targeted artifacts | A diagnosis card with confidence, supporting evidence, and a next step |

Audit and check require Node.js 20+, a committed Git `HEAD`, and the installed CLI. Fresh-build mode also needs a working Storybook setup; artifact replay uses supplied local stats. Compare requires Python 3.9+ and reads local artifacts without building or installing packages. Read each skill's instructions before running its helper.

Prepare the audit/check configuration from the repository's own build instructions. Its command arrays execute programs; an artifact supplied for analysis is not authorization to execute commands inside it. Set one configuration per Storybook in a monorepo.

The helpers create evidence, but do not publish reports to a team system. Record the skill version, exact CLI version, selected scope, artifact provenance, and report location in the team's approved record. Review reports before sharing: they can contain local paths and supplied artifact content. Use synthetic examples in changes to this public repository.

`audited` means the audit completed. `clear` means no targeted finding was detected in the selected check scope. Neither proves rendering correctness or predicts server capture counts. `unable-to-verify` means the evidence or execution was insufficient.

## When a manual handoff is still required

Installed skills do not fetch hosted metadata. A hosted URL can be shared with support, but analysis needs a local file path or pasted contents. Ask the artifact owner to download or export the smallest missing item. See [Metadata artifacts](metadata-artifacts.md#manual-handoff-rule).

Account exports and usage CSVs belong to the surrounding access or reporting workflow. These public skills cannot replace a missing export or permission. Keep that handoff explicit: who supplies the file, which period or build it covers, and where the result belongs. Do not infer unavailable account totals from a dependency graph.

For v1/v2 comparisons, one manifest cannot prove a cross-build hash change. Request the reported baseline manifest when that evidence is missing. For an audit using supplied stats, report that checkout source and artifact provenance may be unverified.

## CLI versions and updates

Audit and check accept installed stable Chromatic 18.x releases. They reject prereleases and other majors, and fail when native trace output is unrecognized. The report records the exact CLI version. This policy belongs to these helpers; it does not change a project's production CI configuration.

Prefer the newest reviewed stable 18.x release, installed through the repository's committed lockfile. A range such as `^18.0.0` permits minor and patch updates; a frozen or immutable installation preserves the selected versions. Update the lockfile deliberately and review dependency changes.

Do not download or execute mutable `chromatic@latest` during diagnosis. `latest` can move to another major. A major range does not protect against a compromised patch, and a lockfile gives repeatability rather than proof of safety. Review package provenance when upgrading.

Before widening compatibility to another major, validate both an isolated change and a configuration bail. See the [CLI reference](../skills/chromatic-turbosnap-check/reference/cli.md) and [validation instructions](../CONTRIBUTING.md#validation).

Update installed skills separately from the CLI. Confirm the intended skill release is active before comparing results across teammates.

## Adopt the workflow as a team

1. **Pick one pilot.** Choose a Storybook and an owner. Record its build command, configuration, installed CLI, and skill version.
2. **Run an audit.** Review measured dependency exposure with the owner. Separate intentional global inputs from changes worth investigating.
3. **Try a scoped check.** Check a known harmless change and an application dependency change that triggers a configuration bail. Confirm both outcomes.
4. **Agree on the handoff.** Choose an approved place for reports and an owner for missing artifacts. Keep customer evidence out of this repository.
5. **Add agent guidance.** Record the chosen skill, local configuration, Git scope, and reporting destination in the application repository's agent instructions.
6. **Choose enforcement deliberately.** Start with reviewed reports. Install a hook only when requested, using the existing hook manager and a known target ref.
7. **Review updates.** Update canonical instructions through a pull request. Refresh installed copies and repeat the pilot checks after relevant runtime changes.

For optional hooks, `--fail-on review` blocks review findings and bails. `--fail-on bail` makes review findings advisory. `--fail-on never` makes both advisory. Verification failures always exit 2. A zero advisory exit is not a clear report. The [hook example](../skills/chromatic-turbosnap-check/reference/cli.md#optional-pre-push-hook) describes its scope limits.

Use [Contributing](../CONTRIBUTING.md) to improve a shared workflow. Agents editing this repository should follow [AGENTS.md](../AGENTS.md).
