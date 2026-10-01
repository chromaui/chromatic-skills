"""Ensure new skills can be reviewed before staging without widening the catalog."""

import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/sync_plugin_skills.py"
spec = importlib.util.spec_from_file_location("sync_skill_catalog", SCRIPT)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class CatalogReviewTests(unittest.TestCase):
    def test_symlinked_source_roots_cannot_publish_outside_files(self):
        for relative in ("skills", "skills/example"):
            with self.subTest(relative=relative), tempfile.TemporaryDirectory() as directory:
                base = Path(directory).resolve()
                root = base / "repo"
                outside = base / "outside"
                root.mkdir()
                outside.mkdir()
                target = outside / "example" if relative == "skills" else outside
                target.mkdir(exist_ok=True)
                (target / "SKILL.md").write_text("private content")
                link = root / relative
                link.parent.mkdir(parents=True, exist_ok=True)
                link.symlink_to(outside, target_is_directory=True)
                with patch.object(sync, "REPOSITORY_ROOT", root), \
                     patch.object(sync, "SOURCE_ROOT", root / "skills"), \
                     patch.object(sync, "PUBLIC_SKILLS", ("example",)):
                    with self.assertRaisesRegex(RuntimeError, "symlinks"):
                        sync.source_files([])

    def test_symlinked_destination_ancestors_cannot_replace_outside_files(self):
        for relative in ("plugins", "plugins/chromatic", "plugins/chromatic/skills"):
            with self.subTest(relative=relative), tempfile.TemporaryDirectory() as directory:
                base = Path(directory).resolve()
                root = base / "repo"
                outside = base / "outside"
                root.mkdir()
                suffix = Path("plugins/chromatic/skills").relative_to(relative)
                destination = outside / suffix
                destination.mkdir(parents=True)
                sentinel = destination / "preserve.txt"
                sentinel.write_text("keep")
                link = root / relative
                link.parent.mkdir(parents=True, exist_ok=True)
                link.symlink_to(outside, target_is_directory=True)
                with patch.object(sync, "REPOSITORY_ROOT", root), \
                     patch.object(sync, "SOURCE_ROOT", root / "skills"), \
                     patch.object(sync, "PLUGIN_SKILLS_ROOT", root / "plugins/chromatic/skills"):
                    with self.assertRaisesRegex(RuntimeError, "symlinks"):
                        sync.write_plugin_skills([])
                self.assertEqual(sentinel.read_text(), "keep")

    def test_new_skill_requires_its_explicit_entrypoint(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            skill = root / "skills" / "example"
            skill.mkdir(parents=True)
            (skill / "SKILL.md").write_text("---\nname: example\n---\n")
            with patch.object(sync, "REPOSITORY_ROOT", root), \
                 patch.object(sync, "SOURCE_ROOT", root / "skills"), \
                 patch.object(sync, "PUBLIC_SKILLS", ("example",)), \
                 patch.object(sync, "committed_skill_names", return_value=set()):
                with self.assertRaises(RuntimeError):
                    sync.validate_catalog()
                with self.assertRaises(RuntimeError):
                    sync.validate_catalog(["skills/example/reference.md"])
                sync.validate_catalog(["skills/example/SKILL.md"])

    def test_unlisted_skill_cannot_enter_catalog_through_review(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            skill = root / "skills" / "private-example"
            skill.mkdir(parents=True)
            (skill / "SKILL.md").write_text("---\nname: private-example\n---\n")
            with patch.object(sync, "REPOSITORY_ROOT", root), \
                 patch.object(sync, "SOURCE_ROOT", root / "skills"), \
                 patch.object(sync, "PUBLIC_SKILLS", ()), \
                 patch.object(sync, "committed_skill_names", return_value=set()):
                with self.assertRaises(RuntimeError):
                    sync.validate_catalog(["skills/private-example/SKILL.md"])


if __name__ == "__main__":
    unittest.main()
