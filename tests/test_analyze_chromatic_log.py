"""Tests for the customer-safe Chromatic log analyzer."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]
ANALYZER_PATH = (
    REPO_ROOT
    / "skills"
    / "diagnose-chromatic-baselines"
    / "scripts"
    / "analyze_chromatic_log.py"
)

SPEC = importlib.util.spec_from_file_location("analyze_chromatic_log", ANALYZER_PATH)
if SPEC is None or SPEC.loader is None:  # pragma: no cover - import setup guard
    raise RuntimeError(f"Unable to load analyzer from {ANALYZER_PATH}")
analyzer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(analyzer)


CURRENT = "a" * 40
PARENT = "b" * 40
MERGE = "c" * 40
OLDER = "d" * 40


class ParseLogTests(unittest.TestCase):
    def test_parses_current_log_and_preserves_observed_empty_lists(self) -> None:
        log = "\n".join(
            [
                "Chromatic CLI v18.6.0",
                (
                    'git info: {"branch":"feature/customer-name",'
                    f'"commit":{{"commit":"{CURRENT}"}}}}'
                ),
                (
                    "App firstBuild: { committedAt: 1 }, "
                    f"lastBuild: {{ commit: '{PARENT}', committedAt: 2 }}"
                ),
                f"visitedCommitsWithoutBuilds: {MERGE}, {OLDER}",
                f"visitedCommitsWithoutBuilds: {MERGE}, {OLDER}, {PARENT}",
                f"Adding merged PR build commit {OLDER}",
                "Final commitsWithBuilds: ",
                f"Found parentCommits: {PARENT}",
                "Build 42 initialized",
                "notify service handshake successful at https://example.test/build/deadbeef",
            ]
        )

        result = analyzer.parse_log(log)

        self.assertEqual(result["cliVersion"], "18.6.0")
        self.assertEqual(result["buildNumber"], 42)
        self.assertEqual(result["buildId"], "Build:deadbeef")
        self.assertEqual(result["branch"], "feature/customer-name")
        self.assertEqual(result["currentCommit"], CURRENT)
        self.assertEqual(result["lastBranchBuildCommit"], PARENT)
        self.assertFalse(result["isSameCommitRebuild"])
        self.assertEqual(result["visitedCommits"], [MERGE, OLDER, PARENT])
        self.assertEqual(result["mergedPrBuildCommits"], [OLDER])
        self.assertTrue(result["finalCommitsWithBuildsObserved"])
        self.assertEqual(result["finalCommitsWithBuilds"], [])
        self.assertTrue(result["parentCommitsObserved"])
        self.assertEqual(result["parentCommits"], [PARENT])

    def test_parses_legacy_commit_fallback_and_empty_parent_evidence(self) -> None:
        log = "\n".join(
            [
                f"execGitCommand result: '{CURRENT} ## main'",
                "Found parentCommits:",
                "Started build 7",
            ]
        )

        result = analyzer.parse_log(log)

        self.assertEqual(result["currentCommit"], CURRENT)
        self.assertEqual(result["buildNumber"], 7)
        self.assertTrue(result["parentCommitsObserved"])
        self.assertEqual(result["parentCommits"], [])

    def test_malformed_or_non_object_git_info_is_ignored(self) -> None:
        self.assertEqual(analyzer.parse_git_info("git info: not-json"), {})
        self.assertEqual(analyzer.parse_git_info("git info: []"), {})
        self.assertEqual(analyzer.parse_git_info('git info: {"branch":"main"} trailing'), {})


class AssessmentTests(unittest.TestCase):
    def make_data(
        self,
        *,
        same_commit: bool = False,
        parents_observed: bool = True,
        parents: list[str] | None = None,
        visited: list[str] | None = None,
    ) -> dict[str, object]:
        return {
            "isSameCommitRebuild": same_commit,
            "parentCommitsObserved": parents_observed,
            "parentCommits": parents or [],
            "visitedCommits": visited or [],
        }

    def test_same_commit_rebuild_takes_precedence(self) -> None:
        result = analyzer.assess(
            self.make_data(same_commit=True, parents=[PARENT]),
            PARENT,
            None,
            None,
        )
        self.assertEqual(result["classification"], "same-commit-rebuild")

    def test_expected_parent_present(self) -> None:
        result = analyzer.assess(self.make_data(parents=[PARENT]), PARENT, None, None)
        self.assertEqual(result["classification"], "expected-parent-present")

    def test_observed_empty_parent_list_means_expected_parent_absent(self) -> None:
        result = analyzer.assess(self.make_data(), PARENT, None, None)
        self.assertEqual(result["classification"], "expected-parent-absent")

    def test_missing_parent_line_is_insufficient_evidence(self) -> None:
        result = analyzer.assess(
            self.make_data(parents_observed=False), PARENT, None, None
        )
        self.assertEqual(result["classification"], "insufficient-parent-evidence")

    def test_lookup_window_requires_an_explicit_limit(self) -> None:
        data = self.make_data(visited=[CURRENT, MERGE, OLDER])

        unknown = analyzer.assess(data, None, MERGE, None)
        within = analyzer.assess(data, None, MERGE, 2)
        outside = analyzer.assess(data, None, OLDER, 2)

        self.assertEqual(unknown["mergeCommitPosition"], 2)
        self.assertIn("unknown", unknown["lookupWindowConclusion"])
        self.assertIn("within", within["lookupWindowConclusion"])
        self.assertIn("outside", outside["lookupWindowConclusion"])


class InputSafetyTests(unittest.TestCase):
    def test_full_sha_accepts_only_lowercase_40_character_hex(self) -> None:
        self.assertEqual(analyzer.full_sha(CURRENT), CURRENT)

        invalid_values = [
            "a" * 39,
            "A" * 40,
            "g" * 40,
            f"{CURRENT}; echo unsafe",
            f"{CURRENT}\n{PARENT}",
        ]
        for value in invalid_values:
            with self.subTest(value=value):
                with self.assertRaises(argparse.ArgumentTypeError):
                    analyzer.full_sha(value)

    def test_redaction_does_not_mutate_input_or_leak_branch_in_json_cli_output(self) -> None:
        branch = "feature/private-customer-name"
        log = "\n".join(
            [
                f'git info: {{"branch":"{branch}","commit":{{"commit":"{CURRENT}"}}}}',
                f"Found parentCommits: {PARENT}",
            ]
        )

        original = {"branch": branch, "currentCommit": CURRENT}
        redacted = analyzer.redact(original, True)
        self.assertEqual(original["branch"], branch)
        self.assertEqual(redacted["branch"], "[redacted]")

        with tempfile.TemporaryDirectory() as temp_dir:
            log_path = Path(temp_dir) / "chromatic.log"
            log_path.write_text(log, encoding="utf-8")
            result = subprocess.run(
                [
                    sys.executable,
                    str(ANALYZER_PATH),
                    str(log_path),
                    "--expected-parent",
                    PARENT,
                    "--redact-branch",
                    "--json",
                ],
                check=True,
                capture_output=True,
                text=True,
            )

        self.assertNotIn(branch, result.stdout)
        report = json.loads(result.stdout)
        self.assertEqual(report["evidence"]["branch"], "[redacted]")
        self.assertEqual(
            report["assessment"]["classification"], "expected-parent-present"
        )

    def test_cli_rejects_invalid_sha_and_non_positive_lookup_limit(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            log_path = Path(temp_dir) / "chromatic.log"
            log_path.write_text("Found parentCommits:\n", encoding="utf-8")

            invalid_sha = subprocess.run(
                [
                    sys.executable,
                    str(ANALYZER_PATH),
                    str(log_path),
                    "--expected-parent",
                    "A" * 40,
                ],
                capture_output=True,
                text=True,
            )
            invalid_limit = subprocess.run(
                [
                    sys.executable,
                    str(ANALYZER_PATH),
                    str(log_path),
                    "--known-lookup-limit",
                    "0",
                ],
                capture_output=True,
                text=True,
            )

        self.assertEqual(invalid_sha.returncode, 2)
        self.assertIn("40-character lowercase hexadecimal", invalid_sha.stderr)
        self.assertNotIn("Traceback", invalid_sha.stderr)
        self.assertEqual(invalid_limit.returncode, 2)
        self.assertIn("must be greater than zero", invalid_limit.stderr)
        self.assertNotIn("Traceback", invalid_limit.stderr)


if __name__ == "__main__":
    unittest.main()
