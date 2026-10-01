"""Behavioral tests use synthetic data; no customer artifacts are bundled."""

import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/chromatic-turbosnap-compare/scripts/compare_turbosnap.py"
spec = importlib.util.spec_from_file_location("compare_turbosnap", SCRIPT)
analyzer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analyzer)

PREVIEW = "./.storybook/preview.js"
LOCALE = "./generated/locales.json"
STORY = "./src/Card.stories.tsx"
CARD = "./src/Card.tsx"


def fixture():
    return {
        "storybookConfigHashes": {"preview": "preview-before", "storybookConfigFiles": "config"},
        "storybookConfigFiles": {PREVIEW: "preview-source"}, "staticFiles": {},
        "storyFiles": {STORY: "story-before"},
        "files": {
            PREVIEW: {"hash": "preview-source", "dependencies": [LOCALE]},
            LOCALE: {"hash": "locale-before", "dependencies": []},
            STORY: {"hash": "story-source", "dependencies": [CARD]},
            CARD: {"hash": "card-before", "dependencies": []},
        },
        "attribution": {"previewSubtree": [PREVIEW, LOCALE],
                        "storyReachable": [STORY, CARD], "storybookGlobals": []},
    }


class CompareTurboSnapTests(unittest.TestCase):
    def test_finds_global_content_change_absent_from_git(self):
        before = fixture()
        after = copy.deepcopy(before)
        after["files"][LOCALE]["hash"] = "locale-after"
        after["files"][CARD]["hash"] = "card-after"
        after["storybookConfigHashes"]["preview"] = "preview-after"
        after["storyFiles"][STORY] = "story-after"
        result = analyzer.analyze(after, [CARD], [PREVIEW], before)
        self.assertEqual([e["path"] for e in result["file_hash_changes_absent_from_git_list"]], [LOCALE])
        self.assertEqual(result["preview_hash_input_paths"], [{"path": LOCALE, "preview_path": [PREVIEW, LOCALE]}])
        self.assertEqual(result["comparison"]["dependency_edges_changed"], [])
        self.assertEqual(result["comparison"]["storybookConfigFiles"]["changed"], [])
        self.assertEqual(result["changed_files"][0]["reachable_stories_in_serialized_graph"], [STORY])

    def test_one_manifest_leaves_comparison_unknown(self):
        result = analyzer.analyze(fixture(), [CARD], [PREVIEW])
        self.assertIsNone(result["comparison"])
        self.assertFalse(result["changed_files"][0]["attribution"]["previewSubtree"])

    def test_missing_attribution_is_unknown_not_false(self):
        data = fixture()
        del data["attribution"]
        result = analyzer.analyze(data, [CARD], [PREVIEW])
        self.assertIsNone(result["changed_files"][0]["attribution"]["previewSubtree"])

    def test_pruned_graph_does_not_override_positive_attribution(self):
        data = fixture()
        data["files"][PREVIEW]["dependencies"] = []
        result = analyzer.analyze(data, [LOCALE], [PREVIEW])
        self.assertTrue(result["changed_files"][0]["attribution"]["previewSubtree"])
        self.assertIsNone(result["changed_files"][0]["preview_path"])
        self.assertEqual(result["attributed_preview_without_serialized_path"], [LOCALE])

    def test_cycles_and_shared_dependencies_preserve_direction(self):
        data = fixture()
        data["files"][LOCALE]["dependencies"] = [PREVIEW]
        data["files"][CARD]["dependencies"] = [LOCALE]
        result = analyzer.analyze(data, [CARD, LOCALE], [PREVIEW])
        by_path = {entry["path"]: entry for entry in result["changed_files"]}
        self.assertIsNone(by_path[CARD]["preview_path"])
        self.assertEqual(by_path[LOCALE]["preview_path"], [PREVIEW, LOCALE])
        self.assertEqual(by_path[LOCALE]["reachable_stories_in_serialized_graph"], [STORY])

    def test_membership_and_edge_changes_without_content_edits(self):
        before = fixture()
        after = copy.deepcopy(before)
        after["files"][PREVIEW]["dependencies"] = [CARD]
        after["attribution"]["previewSubtree"] = [PREVIEW, CARD]
        result = analyzer.compare(before, after)
        self.assertEqual(result["file_hashes"]["changed"], [])
        self.assertEqual(result["attribution"]["previewSubtree"]["added"], [CARD])
        self.assertEqual(result["attribution"]["previewSubtree"]["removed"], [LOCALE])
        self.assertEqual(result["dependency_edges_changed"][0]["removed"], [LOCALE])

    def test_added_removed_files_and_optional_fields(self):
        before = fixture()
        after = copy.deepcopy(before)
        del after["files"][LOCALE]
        after["files"]["./new.json"] = {"hash": "new", "dependencies": []}
        del before["staticFiles"]
        result = analyzer.compare(before, after)
        self.assertEqual(result["file_hashes"]["added"], ["./new.json"])
        self.assertEqual(result["file_hashes"]["removed"], [LOCALE])
        self.assertIsNone(result["staticFiles"])

    def test_log_records_dual_execution_without_inventing_v2_decision(self):
        result = analyzer.read_log(
            "08:00:00.001 Found 1 changed files:\n               src/Card.tsx\n"
            "08:00:01.001 Tracing changed files with TurboSnap v2\n"
            "08:00:02.001 Tracing changed files with TurboSnap v1\n"
            "08:00:03.001 Found affected story files:\n"
            "               src/Card.stories.tsx [./src/Card.stories.tsx]\n"
            "               src/Card.tsx [./src/Card.stories.tsx]\n"
            "08:00:04.001 ✔ TurboSnap enabled\n"
        )
        self.assertEqual(result["changed_file_blocks"][0]["files"], ["src/Card.tsx"])
        self.assertTrue(result["changed_file_blocks"][0]["complete"])
        self.assertEqual(result["affected_story_files"], [STORY])
        self.assertEqual(len(result["signals"]), 3)

    def test_incomplete_changed_list_is_detected(self):
        result = analyzer.read_log("08:00:00.001 Found 2 changed files:\n  src/Card.tsx\n08:00:01.001 Done\n")
        self.assertFalse(result["changed_file_blocks"][0]["complete"])

    def test_stats_keep_concatenated_and_null_id_records(self):
        stats = {"modules": [
            {"name": PREVIEW + " + 1 modules", "id": PREVIEW,
             "modules": [{"name": PREVIEW}, {"name": LOCALE}], "reasons": []},
            {"name": LOCALE, "id": None, "reasons": [{"moduleName": PREVIEW}]},
        ]}
        result = analyzer.stats_evidence(stats, {LOCALE})
        self.assertEqual(len(result["target_records"][LOCALE]), 2)
        self.assertEqual(result["node_modules_records"], 0)
        self.assertEqual(result["all_module_records"], 4)

    def test_cli_monorepo_paths_and_bad_schema(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "manifest.json"
            path.write_text(json.dumps(fixture()))
            command = [sys.executable, str(SCRIPT), "--manifest", str(path)]
            process = subprocess.run(command + ["--changed-file", "packages/ui/src/Card.tsx",
                                     "--git-prefix", "packages/ui"], capture_output=True, text=True)
            self.assertEqual(process.returncode, 0, process.stderr)
            self.assertEqual(json.loads(process.stdout)["changed_files"][0]["path"], CARD)
            path.write_text('{"files": []}')
            process = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(process.returncode, 2)
            self.assertIn("manifest requires an object at files", process.stderr)


if __name__ == "__main__":
    unittest.main()
