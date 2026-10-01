#!/usr/bin/env python3
"""Synchronize the public skill catalog into the Chromatic plugin."""

from __future__ import annotations

import argparse
import filecmp
import shutil
import stat
import subprocess
import sys
import tempfile
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = REPOSITORY_ROOT / "skills"
PLUGIN_SKILLS_ROOT = REPOSITORY_ROOT / "plugins" / "chromatic" / "skills"

# This allowlist prevents local/private skills from being bundled accidentally. The
# parity check below ensures every committed public skill is added deliberately.
PUBLIC_SKILLS = (
    "chromatic-monorepo-config",
    "chromatic-setup-ci",
    "chromatic-themes",
    "chromatic-troubleshoot-config",
    "chromatic-troubleshoot-diff",
    "chromatic-turbosnap-debug",
    "chromatic-turbosnap-audit",
    "chromatic-turbosnap-check",
    "chromatic-turbosnap-compare",
    "chromatic-viewports",
    "chromatic-workflow-debug",
    "diagnose-chromatic-baselines",
)

IGNORED_NAMES = {".DS_Store", "__pycache__"}
IGNORED_SUFFIXES = {".pyc", ".pyo"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--check",
        action="store_true",
        help="fail when the plugin skill copies differ from the canonical skills",
    )
    mode.add_argument(
        "--write",
        action="store_true",
        help="replace the generated plugin skill copies with canonical content",
    )
    parser.add_argument(
        "--include-untracked",
        action="append",
        default=[],
        metavar="PATH",
        help=(
            "include one reviewed, untracked file below a public skill; repeat for "
            "multiple files (normally stage new files instead)"
        ),
    )
    return parser.parse_args()


def fail(message: str) -> None:
    raise RuntimeError(message)


def reject_symlink_ancestors(path: Path) -> None:
    if not path.is_relative_to(REPOSITORY_ROOT):
        fail(f"path escapes the repository: {path}")
    for candidate in (path, *path.parents):
        if candidate.is_symlink():
            fail(f"skill publishing paths must not contain symlinks: {candidate}")
        if candidate == REPOSITORY_ROOT:
            break


def validate_roots() -> None:
    expected = REPOSITORY_ROOT / "plugins" / "chromatic" / "skills"
    if PLUGIN_SKILLS_ROOT != expected:
        fail(f"refusing to operate on unexpected destination: {PLUGIN_SKILLS_ROOT}")
    reject_symlink_ancestors(SOURCE_ROOT)
    reject_symlink_ancestors(PLUGIN_SKILLS_ROOT)


def committed_skill_names() -> set[str]:
    result = subprocess.run(
        ["git", "ls-files", "--", "skills/*/SKILL.md"],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return {Path(line).parent.name for line in result.stdout.splitlines() if line}


def validate_catalog(requested_untracked: list[str] | None = None) -> None:
    configured = set(PUBLIC_SKILLS)
    if len(configured) != len(PUBLIC_SKILLS):
        fail("PUBLIC_SKILLS contains a duplicate entry")

    missing_sources = [
        name for name in PUBLIC_SKILLS if not (SOURCE_ROOT / name / "SKILL.md").is_file()
    ]
    if missing_sources:
        fail(f"configured skills are missing SKILL.md: {', '.join(missing_sources)}")

    committed = committed_skill_names()
    # Explicitly reviewed new entrypoints can be validated before staging, just
    # like their supporting files. The file-level allowlist is still enforced.
    for value in requested_untracked or []:
        candidate = (REPOSITORY_ROOT / value).resolve()
        if candidate.name == "SKILL.md" and candidate.parent.parent == SOURCE_ROOT:
            if candidate.is_file() and not candidate.is_symlink():
                committed.add(candidate.parent.name)
    if committed != configured:
        missing = sorted(committed - configured)
        extra = sorted(configured - committed)
        details = []
        if missing:
            details.append(f"add committed skills to PUBLIC_SKILLS: {', '.join(missing)}")
        if extra:
            details.append(f"remove uncommitted skills from PUBLIC_SKILLS: {', '.join(extra)}")
        fail("; ".join(details))


def worktree_source_files() -> dict[Path, Path]:
    files: dict[Path, Path] = {}
    for skill_name in PUBLIC_SKILLS:
        skill_root = SOURCE_ROOT / skill_name
        reject_symlink_ancestors(skill_root)
        for source in sorted(skill_root.rglob("*")):
            if source.is_symlink():
                fail(f"canonical skills must not contain symlinks: {source}")
            if not source.is_file():
                continue
            if any(part in IGNORED_NAMES for part in source.parts):
                continue
            if source.suffix in IGNORED_SUFFIXES:
                continue
            relative = Path(skill_name) / source.relative_to(skill_root)
            files[relative] = source
    return files


def tracked_source_files(worktree: dict[Path, Path]) -> dict[Path, Path]:
    result = subprocess.run(
        ["git", "ls-files", "-z", "--", *(f"skills/{name}" for name in PUBLIC_SKILLS)],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
    )
    tracked: dict[Path, Path] = {}
    for raw_path in result.stdout.split(b"\0"):
        if not raw_path:
            continue
        repository_relative = Path(raw_path.decode("utf-8"))
        source = REPOSITORY_ROOT / repository_relative
        try:
            skill_relative = repository_relative.relative_to("skills")
        except ValueError:
            fail(f"git returned a path outside the skills tree: {repository_relative}")
        if source.is_file() and skill_relative in worktree:
            tracked[skill_relative] = source
    return tracked


def resolve_included_untracked(
    requested: list[str], worktree: dict[Path, Path], tracked: dict[Path, Path]
) -> set[Path]:
    included: set[Path] = set()
    for value in requested:
        candidate = (REPOSITORY_ROOT / value).resolve()
        try:
            repository_relative = candidate.relative_to(REPOSITORY_ROOT)
            skill_relative = repository_relative.relative_to("skills")
        except ValueError:
            fail(f"--include-untracked must be below the repository skills tree: {value}")
        if not skill_relative.parts or skill_relative.parts[0] not in PUBLIC_SKILLS:
            fail(f"--include-untracked is not below a public skill: {value}")
        if skill_relative not in worktree:
            fail(f"--include-untracked is not a regular reviewed source file: {value}")
        if skill_relative in tracked:
            fail(f"--include-untracked is already tracked and does not need approval: {value}")
        included.add(skill_relative)
    return included


def source_files(requested_untracked: list[str]) -> dict[Path, Path]:
    worktree = worktree_source_files()
    tracked = tracked_source_files(worktree)
    included = resolve_included_untracked(requested_untracked, worktree, tracked)
    untracked = set(worktree) - set(tracked)
    unapproved = sorted(untracked - included)
    if unapproved:
        details = "\n".join(f"  skills/{path}" for path in unapproved)
        fail(
            "untracked files exist below public skills and will not be bundled; "
            "stage them or pass one --include-untracked PATH per reviewed file:\n"
            f"{details}"
        )
    return {**tracked, **{path: worktree[path] for path in included}}


def plugin_files() -> dict[Path, Path]:
    if not PLUGIN_SKILLS_ROOT.exists():
        return {}
    files: dict[Path, Path] = {}
    for candidate in sorted(PLUGIN_SKILLS_ROOT.rglob("*")):
        if candidate.is_symlink():
            fail(f"generated plugin skills must not contain symlinks: {candidate}")
        if candidate.is_file():
            files[candidate.relative_to(PLUGIN_SKILLS_ROOT)] = candidate
    return files


def check_parity(requested_untracked: list[str]) -> bool:
    expected = source_files(requested_untracked)
    actual = plugin_files()
    missing = sorted(expected.keys() - actual.keys())
    extra = sorted(actual.keys() - expected.keys())
    changed = sorted(
        relative
        for relative in expected.keys() & actual.keys()
        if not filecmp.cmp(expected[relative], actual[relative], shallow=False)
    )
    mode_changed = sorted(
        relative
        for relative in expected.keys() & actual.keys()
        if stat.S_IMODE(expected[relative].stat().st_mode)
        != stat.S_IMODE(actual[relative].stat().st_mode)
    )

    if not (missing or extra or changed or mode_changed):
        print(f"Plugin skills match {len(PUBLIC_SKILLS)} canonical skills.")
        return True

    if missing:
        print("Missing from plugin:", *(f"  {path}" for path in missing), sep="\n")
    if extra:
        print("Unexpected in plugin:", *(f"  {path}" for path in extra), sep="\n")
    if changed:
        print("Content differs:", *(f"  {path}" for path in changed), sep="\n")
    if mode_changed:
        print("File mode differs:", *(f"  {path}" for path in mode_changed), sep="\n")
    print("Run: python3 scripts/sync_plugin_skills.py --write")
    return False


def write_plugin_skills(requested_untracked: list[str]) -> None:
    validate_roots()
    sources = source_files(requested_untracked)
    PLUGIN_SKILLS_ROOT.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(
        tempfile.mkdtemp(prefix=".chromatic-skills-", dir=PLUGIN_SKILLS_ROOT.parent)
    )
    backup = PLUGIN_SKILLS_ROOT.parent / ".chromatic-skills-backup"
    try:
        for relative, source in sources.items():
            destination = temporary / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

        if backup.exists():
            fail(f"refusing to overwrite stale backup directory: {backup}")
        if PLUGIN_SKILLS_ROOT.exists():
            PLUGIN_SKILLS_ROOT.replace(backup)
        temporary.replace(PLUGIN_SKILLS_ROOT)
        if backup.exists():
            shutil.rmtree(backup)
    except Exception:
        if backup.exists() and not PLUGIN_SKILLS_ROOT.exists():
            backup.replace(PLUGIN_SKILLS_ROOT)
        raise
    finally:
        if temporary.exists():
            shutil.rmtree(temporary)

    print(
        f"Synchronized {len(sources)} files from {len(PUBLIC_SKILLS)} canonical skills."
    )


def main() -> int:
    try:
        validate_roots()
        args = parse_args()
        validate_catalog(args.include_untracked)
        if args.write:
            write_plugin_skills(args.include_untracked)
        return 0 if check_parity(args.include_untracked) else 1
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
