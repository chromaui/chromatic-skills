# Evidence and hashing

## Three different meanings of “preview changed”

| Evidence | Meaning |
| --- | --- |
| Git lists `.storybook/preview.js` | Git observed a source change in that comparison. |
| `files["./.storybook/preview.js"].hash` differs | The bytes of the preview file hashed by the two builds differ. |
| `storybookConfigHashes.preview` differs | The preview subtree's hash inputs differ, or their encoding/algorithm differs. |

Also compare `storybookConfigFiles`, which records an out-of-graph configuration-directory sweep. A `preview` subtree change and a configuration-directory file change are distinct categories.

## Concrete v18.8.1 behavior

The Chromatic CLI source at tag `v18.8.1` has these relevant modules:

- `node-src/lib/turbosnap/index.ts`: runs v2 for side effects before v1 selects stories.
- `node-src/lib/turbosnap/v2/statsGraph.ts`: derives dependency edges and hashes on-disk files.
- `node-src/lib/turbosnap/v2/graph.ts`: hashes sorted JSON-encoded `[path, contentHash]` pairs.
- `node-src/lib/turbosnap/v2/storybookFiles.ts`: collects the preview subtree and globals attribution.
- `node-src/lib/turbosnap/v2/manifest.ts`: generates roll-ups and serializes the debug manifest.
- `node-src/lib/getFileHashes.ts`: hashes raw file bytes with xxHash64.

These are version-specific observations, not a guarantee for every CLI release. If a local CLI checkout is available, inspect the tag matching the log. Do not execute customer preview files or install software merely to inspect artifacts. Installed workflows do not fetch remote source or hosted artifacts; use supplied local content.

## Graph direction and incomplete artifacts

`files[importer].dependencies` points toward dependencies. Webpack `reasons[].moduleName` points the other way: it names the importer of that module. Follow the correct direction when explaining a preview path.

Webpack may concatenate preview with CSS and locale JSON. A module named `preview.js + 3 modules` is a bundle grouping, not proof of four Git edits. Preserve nested module records and standalone records with null IDs when examining the evidence.

The serialized v2 manifest omits synthetic nodes and their edges. `attribution` records membership before pruning and is stronger negative evidence than an unsuccessful walk over the serialized graph. An attributed file may have no surviving path. Missing attribution means unknown membership.

Roll-ups in v18.8.1 can include synthetic paths with empty hashes. Hashing only the real files listed in `attribution.previewSubtree` may therefore produce a different value. This alone is not a defect. Trimmed stats can omit every package module; do not use them to regenerate a complete graph or claim exact hash reproduction.

## Hidden content change example

Suppose only `Card.tsx` appears in Git's changed-file list. Both manifests have identical preview source hashes and graph membership. The sole changed preview input is `generated/locales.json`, imported directly by preview and passed into a global provider.

The supported finding is that the locale file's recorded bytes changed outside the reported Git change set. V1's Git-based tracing has no changed locale seed; v2's content hash observes it. Whether this is a translation edit, ordering noise, a CI-generated artifact, or a checkout difference needs the two JSON files and the relevant build step.

Compare parsed JSON values as well as raw bytes. Equality of objects can rule out key-order and formatting differences as semantic changes, but array order and duplicate keys need care. Never normalize a file before measuring the bytes the production hasher used.
