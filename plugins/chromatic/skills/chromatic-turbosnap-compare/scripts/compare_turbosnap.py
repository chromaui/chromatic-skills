#!/usr/bin/env python3
"""Inspect local TurboSnap artifacts; optionally compare two v2 manifests.

Uses only the Python standard library. Reads artifacts as data, never executes
their contents, and writes JSON to stdout. It does not run Chromatic or hash files.
"""

from __future__ import annotations

import argparse
from collections import defaultdict, deque
import json
from pathlib import Path
import posixpath
import re


ATTRIBUTIONS = ("previewSubtree", "storybookGlobals", "storyReachable")
STAMP = re.compile(r"^\s*\d{2}:\d{2}:\d{2}\.\d{3}\b")


def canonical(value):
    """Normalize relative paths only; absolute roots need explicit translation."""
    value = value.replace("\\", "/")
    if value.startswith("/") or re.match(r"^[A-Za-z]:/", value):
        raise ValueError(f"expected a project-relative path: {value}")
    value = posixpath.normpath(value)
    return value if value.startswith("../") else "./" + value


def read_manifest(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("manifest must be an object")
    for key in ("files", "storyFiles", "storybookConfigHashes"):
        if not isinstance(data.get(key), dict):
            raise ValueError(f"manifest requires an object at {key}")
    for key in ("storybookConfigFiles", "staticFiles", "attribution"):
        if key in data and not isinstance(data[key], dict):
            raise ValueError(f"manifest {key} must be an object")
    for path, entry in data["files"].items():
        if not isinstance(entry, dict) or not isinstance(entry.get("hash"), str):
            raise ValueError(f"invalid file hash: {path}")
        if not isinstance(entry.get("dependencies"), list) or not all(
            isinstance(item, str) for item in entry["dependencies"]
        ):
            raise ValueError(f"invalid dependencies: {path}")
    for key in ("storyFiles", "storybookConfigHashes", "storybookConfigFiles", "staticFiles"):
        if not all(isinstance(value, str) for value in data.get(key, {}).values()):
            raise ValueError(f"invalid hash map: {key}")
    for key in ATTRIBUTIONS:
        value = data.get("attribution", {}).get(key)
        if value is not None and (
            not isinstance(value, list) or not all(isinstance(p, str) for p in value)
        ):
            raise ValueError(f"invalid attribution: {key}")
    return data


def read_log(content):
    lines = re.sub(r"\x1b\[[0-9;]*m", "", content).splitlines()
    blocks, signals, stories = [], [], set()
    story_block = False
    for index, line in enumerate(lines):
        match = re.search(r"\bFound (\d+) changed files:\s*$", line)
        if match:
            count, paths = int(match[1]), []
            for following in lines[index + 1:]:
                if len(paths) == count or STAMP.match(following) or not following.strip():
                    break
                paths.append(following.strip())
            blocks.append({"line": index + 1, "reported_count": count, "files": paths,
                           "complete": len(paths) == count})
        if STAMP.match(line):
            story_block = "Found affected story files:" in line
        if story_block:
            match = re.search(r"\[([^\]]+)\]\s*$", line)
            if match:
                stories.add(match[1])
        if re.search(
            r"Chromatic CLI v|Found (?:parent|baseline)Commits:|Tracing changed files with TurboSnap"
            r"|Generated manifest for TurboSnap|TurboSnap enabled|TurboSnap disabled"
            r"|Found a Storybook config change|Capturing \d+ snapshots"
            r"|Snapshots will be limited|Started build \d+|Found \d+ story files affected",
            line,
        ):
            signals.append({"line": index + 1, "text": line.strip()})
    return {"changed_file_blocks": blocks, "signals": signals,
            "affected_story_files": sorted(stories)}


def walk(graph, roots):
    """Return predecessor links for shortest paths; handle shared nodes and cycles."""
    predecessors = {root: None for root in roots}
    queue = deque(roots)
    while queue:
        node = queue.popleft()
        for dependency in graph.get(node, ()):
            if dependency not in predecessors:
                predecessors[dependency] = node
                queue.append(dependency)
    return predecessors


def path_to(predecessors, target):
    if target not in predecessors:
        return None
    result = []
    while target is not None:
        result.append(target)
        target = predecessors[target]
    return list(reversed(result))


def map_delta(before, after):
    return {
        "added": sorted(after.keys() - before.keys()),
        "removed": sorted(before.keys() - after.keys()),
        "changed": [{"path": key, "before": before[key], "after": after[key]}
                    for key in sorted(before.keys() & after.keys()) if before[key] != after[key]],
    }


def compare(before, after):
    result = {}
    for key in ("storybookConfigHashes", "storybookConfigFiles", "staticFiles", "storyFiles"):
        result[key] = (map_delta(before[key], after[key])
                       if key in before and key in after else None)
    old_hashes = {p: e["hash"] for p, e in before["files"].items()}
    new_hashes = {p: e["hash"] for p, e in after["files"].items()}
    result["file_hashes"] = map_delta(old_hashes, new_hashes)
    result["dependency_edges_changed"] = [
        {"path": p,
         "added": sorted(set(after["files"][p]["dependencies"]) - set(before["files"][p]["dependencies"])),
         "removed": sorted(set(before["files"][p]["dependencies"]) - set(after["files"][p]["dependencies"]))}
        for p in sorted(before["files"].keys() & after["files"].keys())
        if set(before["files"][p]["dependencies"]) != set(after["files"][p]["dependencies"])
    ]
    result["attribution"] = {}
    for key in ATTRIBUTIONS:
        old = before.get("attribution", {}).get(key)
        new = after.get("attribution", {}).get(key)
        if old is None or new is None:
            result["attribution"][key] = None
            continue
        old, new = set(old), set(new)
        result["attribution"][key] = {
            "added": sorted(new - old), "removed": sorted(old - new),
            "file_hash_changes": [
                {"path": p, "before": old_hashes.get(p), "after": new_hashes.get(p)}
                for p in sorted(old | new) if old_hashes.get(p) != new_hashes.get(p)
            ],
        }
    return result


def stats_evidence(stats, targets):
    """Inspect all Webpack records, retaining concatenation and null-id evidence."""
    if not isinstance(stats, dict) or not isinstance(stats.get("modules"), list):
        raise ValueError("stats requires a Webpack-style modules array")
    found = defaultdict(list)
    count = 0
    dependency_records = 0

    def visit(modules, container=None):
        nonlocal count, dependency_records
        for module in modules:
            count += 1
            raw = module.get("nameForCondition") or module.get("name") or ""
            dependency_records += int("node_modules/" in raw.replace("\\", "/"))
            name = re.sub(r" \+ \d+ modules?$", "", raw)
            try:
                name = canonical(name)
            except ValueError:
                # Retain absolute names verbatim; do not invent the build's root.
                pass
            if name in targets:
                found[name].append({
                    "name": raw, "id": module.get("id"), "container": container,
                    "importers": [r.get("moduleName") for r in module.get("reasons", [])],
                    "concatenated": [m.get("name") for m in module.get("modules", [])],
                })
            visit(module.get("modules", []), raw)

    visit(stats["modules"])
    return {"top_level_modules": len(stats["modules"]), "all_module_records": count,
            "node_modules_records": dependency_records, "target_records": dict(found),
            "scope": "Record inspection only; trimmed stats may omit package and synthetic nodes."}


def analyze(manifest, changed, previews, baseline=None, stats=None):
    graph = {p: e["dependencies"] for p, e in manifest["files"].items()}
    reverse = defaultdict(set)
    for importer, dependencies in graph.items():
        for dependency in dependencies:
            reverse[dependency].add(importer)
    predecessors = walk(graph, [p for p in previews if p in graph])
    attribution = manifest.get("attribution", {})
    sets = {key: set(attribution[key]) if key in attribution else None for key in ATTRIBUTIONS}
    warnings = [
        "Serialized manifests omit synthetic nodes. Positive paths are evidence; missing paths are inconclusive without attribution.",
        "This does not regenerate roll-up hashes or reproduce server baseline selection.",
    ]
    if baseline is None:
        warnings.append("Baseline manifest missing: the changed configuration hash and its cause are unproven.")
    if any(value is None for value in sets.values()):
        warnings.append("Attribution is incomplete; unknown membership is reported as null.")
    changed_results = []
    for item in sorted(set(changed)):
        importers = walk(reverse, [item])
        changed_results.append({
            "path": item, "present_in_files": item in graph,
            "attribution": {k: item in v if v is not None else None for k, v in sets.items()},
            "in_config_files": item in manifest["storybookConfigFiles"] if "storybookConfigFiles" in manifest else None,
            "in_static_files": item in manifest["staticFiles"] if "staticFiles" in manifest else None,
            "preview_path": path_to(predecessors, item),
            "reachable_stories_in_serialized_graph": sorted(set(importers) & manifest["storyFiles"].keys()),
        })
    result = {
        "counts": {"files": len(graph), "story_files": len(manifest["storyFiles"]),
                   **{k: len(v) if v is not None else None for k, v in sets.items()}},
        "config_hashes": manifest["storybookConfigHashes"],
        "preview_roots": [{"path": p, "file_hash": manifest["files"].get(p, {}).get("hash"),
                           "config_file_hash": manifest.get("storybookConfigFiles", {}).get(p)} for p in previews],
        "preview_graph_reachable_count": len(predecessors),
        "attributed_preview_without_serialized_path": sorted((sets["previewSubtree"] or set()) - predecessors.keys()),
        "changed_files": changed_results,
        "comparison": compare(baseline, manifest) if baseline is not None else None,
        "warnings": warnings,
    }
    if baseline is not None:
        hash_changes = result["comparison"]["file_hashes"]["changed"]
        result["file_hash_changes_absent_from_git_list"] = [
            entry for entry in hash_changes if entry["path"] not in set(changed)
        ]
        preview_delta = result["comparison"]["attribution"]["previewSubtree"]
        result["preview_hash_input_paths"] = [
            {"path": entry["path"], "preview_path": path_to(predecessors, entry["path"])}
            for entry in (preview_delta or {}).get("file_hash_changes", [])
        ]
    if stats is not None:
        targets = set(changed) | set(previews)
        targets.update(entry["path"] for entry in result.get("preview_hash_input_paths", []))
        result["stats"] = stats_evidence(stats, targets)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--baseline")
    parser.add_argument("--log")
    parser.add_argument("--stats")
    parser.add_argument("--changed-file", action="append", default=[])
    parser.add_argument("--preview", action="append", help="project-relative preview root; repeat for multiple roots")
    parser.add_argument("--git-prefix", default="", help="repository-relative Storybook project directory")
    args = parser.parse_args()
    try:
        log = read_log(Path(args.log).read_text(encoding="utf-8")) if args.log else None
        blocks = log["changed_file_blocks"] if log else []
        if any(not block["complete"] for block in blocks):
            raise ValueError("incomplete changed-file block; supply a complete log or use --changed-file without --log")
        if len(blocks) > 1:
            raise ValueError("multiple changed-file blocks; supply the log for one build")
        changed = args.changed_file + (blocks[0]["files"] if blocks else [])
        prefix = canonical(args.git_prefix)[2:].rstrip("/") if args.git_prefix else ""
        if args.git_prefix and canonical(args.git_prefix).startswith("../"):
            raise ValueError("--git-prefix must be inside the repository")
        if prefix:
            # ../ preserves relevant files outside a monorepo project.
            changed = [posixpath.relpath(canonical(p).removeprefix("./"), prefix) for p in changed]
        changed = [canonical(p) for p in changed]
        result = analyze(
            read_manifest(args.manifest), changed,
            [canonical(p) for p in (args.preview or [".storybook/preview.js"])],
            read_manifest(args.baseline) if args.baseline else None,
            json.loads(Path(args.stats).read_text(encoding="utf-8")) if args.stats else None,
        )
        if not changed:
            result["warnings"].append("No changed-file evidence supplied.")
        result["log"] = log
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except (OSError, ValueError, TypeError, KeyError) as error:
        parser.exit(2, f"error: {error}\n")


if __name__ == "__main__":
    main()
