"""Regression tests for the repository's publishing and security policies."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import re
import unittest


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SYNC_SCRIPT = REPOSITORY_ROOT / "scripts" / "sync_plugin_skills.py"

SPEC = importlib.util.spec_from_file_location("sync_plugin_skills", SYNC_SCRIPT)
if SPEC is None or SPEC.loader is None:  # pragma: no cover - import setup guard
    raise RuntimeError(f"Unable to load sync script from {SYNC_SCRIPT}")
sync_plugin_skills = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync_plugin_skills)

PUBLIC_SKILL_ROOTS = tuple(
    REPOSITORY_ROOT / "skills" / name
    for name in sync_plugin_skills.PUBLIC_SKILLS
)
ACTION_PATTERN = re.compile(r"uses:\s+([^\s@]+)@([^\s#]+)")
FULL_SHA_PATTERN = re.compile(r"[0-9a-f]{40}")
FORBIDDEN_REMOTE_COMMANDS = re.compile(r"\b(?:WebFetch|curl|wget)\b")
MUTABLE_NPX_COMMAND = re.compile(
    r"(?m)^\s*(?:buildCommand:\s*)?npx\s+(?!--no-install\b)"
)
BACKTICK_PATTERN = re.compile(r"`([^`]+\.md)`")


TURBOSNAP_RELEASE_ROOTS = tuple(
    root for root in PUBLIC_SKILL_ROOTS
    if root.name in {"chromatic-turbosnap-audit", "chromatic-turbosnap-check", "chromatic-turbosnap-compare"}
)


def public_files(pattern: str, roots=PUBLIC_SKILL_ROOTS):
    for skill_root in roots:
        yield from skill_root.rglob(pattern)


class RepositoryPolicyTests(unittest.TestCase):
    def test_plugin_manifest_exposes_the_complete_catalog(self) -> None:
        plugin_root = REPOSITORY_ROOT / "plugins" / "chromatic"
        manifest = json.loads(
            (plugin_root / ".codex-plugin" / "plugin.json").read_text(
                encoding="utf-8"
            )
        )
        self.assertEqual(manifest["name"], plugin_root.name)
        self.assertRegex(manifest["version"], r"^\d+\.\d+\.\d+$")
        self.assertEqual(manifest["skills"], "./skills/")
        for icon_field in ("composerIcon", "logo"):
            self.assertTrue((plugin_root / manifest["interface"][icon_field]).is_file())

        bundled_skills = {
            path.parent.name
            for path in (plugin_root / "skills").glob("*/SKILL.md")
        }
        self.assertEqual(bundled_skills, set(sync_plugin_skills.PUBLIC_SKILLS))

    def test_marketplace_entry_uses_reviewed_defaults(self) -> None:
        marketplace = json.loads(
            (
                REPOSITORY_ROOT / ".agents" / "plugins" / "marketplace.json"
            ).read_text(encoding="utf-8")
        )
        entry = next(
            plugin for plugin in marketplace["plugins"] if plugin["name"] == "chromatic"
        )
        self.assertEqual(
            entry["source"],
            {"source": "local", "path": "./plugins/chromatic"},
        )
        self.assertEqual(entry["policy"]["installation"], "AVAILABLE")
        self.assertEqual(entry["policy"]["authentication"], "ON_INSTALL")

    def test_public_skill_json_is_valid(self) -> None:
        for path in public_files("*.json"):
            with self.subTest(path=path.relative_to(REPOSITORY_ROOT)):
                json.loads(path.read_text(encoding="utf-8"))

    def test_new_turbosnap_skills_do_not_fetch_remote_instructions(self) -> None:
        for path in public_files("*", TURBOSNAP_RELEASE_ROOTS):
            if not path.is_file() or path.suffix not in {".md", ".yaml", ".py"}:
                continue
            with self.subTest(path=path.relative_to(REPOSITORY_ROOT)):
                match = FORBIDDEN_REMOTE_COMMANDS.search(
                    path.read_text(encoding="utf-8")
                )
                self.assertIsNone(match, f"forbidden runtime fetch command: {match}")

    def test_new_turbosnap_commands_do_not_download_mutable_npx_packages(self) -> None:
        for path in public_files("*.md", TURBOSNAP_RELEASE_ROOTS):
            with self.subTest(path=path.relative_to(REPOSITORY_ROOT)):
                match = MUTABLE_NPX_COMMAND.search(path.read_text(encoding="utf-8"))
                self.assertIsNone(match, f"npx command permits an implicit download: {match}")

    def test_release_actions_are_pinned_except_chromatic(self) -> None:
        paths = list(public_files("*.md", TURBOSNAP_RELEASE_ROOTS)) + [
            REPOSITORY_ROOT / ".github" / "workflows" / "validate.yml"
        ]
        for path in paths:
            for action, reference in ACTION_PATTERN.findall(
                path.read_text(encoding="utf-8")
            ):
                with self.subTest(
                    path=path.relative_to(REPOSITORY_ROOT), action=action
                ):
                    if action == "chromaui/action":
                        self.assertEqual(reference, "latest")
                    else:
                        self.assertIsNotNone(FULL_SHA_PATTERN.fullmatch(reference))

    def test_backticked_reference_files_exist(self) -> None:
        for skill_root in PUBLIC_SKILL_ROOTS:
            skill_file = skill_root / "SKILL.md"
            for reference in BACKTICK_PATTERN.findall(
                skill_file.read_text(encoding="utf-8")
            ):
                if not (
                    reference.startswith("reference/")
                    or reference.startswith("../")
                ):
                    continue
                with self.subTest(
                    skill=skill_root.name,
                    reference=reference,
                ):
                    candidate = (skill_root / reference).resolve()
                    self.assertIn(
                        (REPOSITORY_ROOT / "skills").resolve(),
                        candidate.parents,
                        f"reference escapes the public skills tree: {reference}",
                    )
                    self.assertTrue(
                        candidate.is_file(),
                        f"missing local reference: {reference}",
                    )

    def test_skill_instructions_stay_under_500_lines(self) -> None:
        for skill_root in PUBLIC_SKILL_ROOTS:
            skill_file = skill_root / "SKILL.md"
            with self.subTest(skill=skill_root.name):
                self.assertLessEqual(
                    len(skill_file.read_text(encoding="utf-8").splitlines()),
                    500,
                )


if __name__ == "__main__":
    unittest.main()
