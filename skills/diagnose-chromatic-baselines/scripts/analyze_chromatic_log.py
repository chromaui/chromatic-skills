#!/usr/bin/env python3
"""Extract customer-safe Chromatic baseline ancestry evidence from a CLI log."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


SHA_PATTERN = r"[0-9a-f]{40}"


def match_one(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text, re.MULTILINE)
    return match.group(1) if match else None


def split_shas(value: str | None) -> list[str]:
    return re.findall(SHA_PATTERN, value or "")


def parse_git_info(text: str) -> dict[str, Any]:
    raw = match_one(r"git info: (\{.*\})$", text)
    if not raw:
        return {}
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return value if isinstance(value, dict) else {}


def parse_log(text: str) -> dict[str, Any]:
    git_info = parse_git_info(text)
    commit_info = git_info.get("commit")
    current_commit = commit_info.get("commit") if isinstance(commit_info, dict) else None
    current_commit = current_commit or match_one(
        rf"execGitCommand result: '({SHA_PATTERN}) ##", text
    )

    visited_matches = re.findall(
        rf"visitedCommitsWithoutBuilds: ((?:{SHA_PATTERN}[, ]*)+)$",
        text,
        re.MULTILINE,
    )
    visited_lists = [split_shas(value) for value in visited_matches]
    visited_commits = max(visited_lists, key=len, default=[])

    last_build_value = match_one(r"App firstBuild: .*?lastBuild:\s*(.*)$", text)
    last_branch_build = match_one(
        rf'''(?:["']commit["']|commit)\s*:\s*["']({SHA_PATTERN})["']''',
        last_build_value or "",
    )
    branch = git_info.get("branch") if isinstance(git_info.get("branch"), str) else None
    branch = branch or match_one(r'git info: .*?"branch":"([^\"]+)"', text)

    build_number = match_one(r"(?:Build |Started build )(\d+)(?: initialized|$)", text)
    build_id = match_one(r"notify service handshake successful at .*?/build/([0-9a-f]+)", text)

    final_commits_match = re.search(
        r"Final commitsWithBuilds:\s*([0-9a-f, ]*)$", text, re.MULTILINE
    )
    parent_commits_match = re.search(
        r"Found parentCommits:\s*([0-9a-f, ]*)$", text, re.MULTILINE
    )

    return {
        "cliVersion": match_one(r"Chromatic CLI v([^\s]+)", text),
        "buildNumber": int(build_number) if build_number else None,
        "buildId": f"Build:{build_id}" if build_id else None,
        "branch": branch,
        "currentCommit": current_commit,
        "lastBranchBuildCommit": last_branch_build,
        "isSameCommitRebuild": bool(current_commit and current_commit == last_branch_build),
        "visitedCommits": visited_commits,
        "mergedPrBuildCommits": re.findall(
            rf"Adding merged PR build commit ({SHA_PATTERN})", text
        ),
        "finalCommitsWithBuildsObserved": final_commits_match is not None,
        "finalCommitsWithBuilds": split_shas(
            final_commits_match.group(1) if final_commits_match else None
        ),
        "parentCommitsObserved": parent_commits_match is not None,
        "parentCommits": split_shas(
            parent_commits_match.group(1) if parent_commits_match else None
        ),
    }


def assess(
    data: dict[str, Any],
    expected_parent: str | None,
    merge_commit: str | None,
    known_lookup_limit: int | None,
) -> dict[str, Any]:
    if data["isSameCommitRebuild"]:
        result = {
            "classification": "same-commit-rebuild",
            "conclusion": "Analyze the first build on this commit.",
        }
    elif expected_parent and expected_parent in data["parentCommits"]:
        result = {
            "classification": "expected-parent-present",
            "conclusion": (
                "The CLI submitted the accepted PR commit as a parent. "
                "Exact baseline selection may require Chromatic Support."
            ),
        }
    elif expected_parent and data["parentCommitsObserved"]:
        result = {
            "classification": "expected-parent-absent",
            "conclusion": (
                "The CLI did not submit the accepted PR commit as a parent. "
                "Use Git ancestry and merge strategy to narrow the cause."
            ),
        }
    else:
        result = {
            "classification": "insufficient-parent-evidence",
            "conclusion": "Supply the expected parent commit and a log with submitted parents.",
        }

    merge_position = None
    if merge_commit and merge_commit in data["visitedCommits"]:
        merge_position = data["visitedCommits"].index(merge_commit) + 1

    result["mergeCommitPosition"] = merge_position
    if merge_position is None:
        result["lookupWindowConclusion"] = "No merge position is available."
    elif known_lookup_limit is None:
        result["lookupWindowConclusion"] = (
            "The server lookup window is unknown. Do not infer truncation from position alone."
        )
    elif merge_position > known_lookup_limit:
        result["lookupWindowConclusion"] = (
            "The merge position is outside the lookup limit supplied by Chromatic Support."
        )
    else:
        result["lookupWindowConclusion"] = (
            "The merge position is within the lookup limit supplied by Chromatic Support."
        )
    return result


def print_commit_list(title: str, commits: list[str]) -> None:
    print(f"\n{title}:")
    if not commits:
        print("- none found in log")
        return
    for commit in commits:
        print(f"- {commit}")


def print_report(
    data: dict[str, Any],
    assessment: dict[str, Any],
    known_lookup_limit: int | None,
) -> None:
    print("Chromatic baseline ancestry report")
    print(f"Build: {data['buildNumber'] or 'unknown'}")
    print(f"Build ID: {data['buildId'] or 'unknown'}")
    print(f"CLI: {data['cliVersion'] or 'unknown'}")
    print(f"Branch: {data['branch'] or 'unknown'}")
    print(f"Current commit: {data['currentCommit'] or 'unknown'}")
    print(f"Last branch build: {data['lastBranchBuildCommit'] or 'unknown'}")
    rebuild = "yes" if data["isSameCommitRebuild"] else "no"
    print(f"Same-commit rebuild: {rebuild}")

    print(f"\nTraversed commits: {len(data['visitedCommits'])}")
    for position, commit in enumerate(data["visitedCommits"], start=1):
        print(f"{position:>3}. {commit}")

    if known_lookup_limit is None:
        print("\nSupport-supplied lookup limit: unknown")
    else:
        print(f"\nSupport-supplied lookup limit: {known_lookup_limit}")

    merge_position = assessment["mergeCommitPosition"]
    print(f"Target merge commit position: {merge_position or 'not found'}")

    print_commit_list("Added PR build commits", data["mergedPrBuildCommits"])
    print_commit_list("Final commits with builds", data["finalCommitsWithBuilds"])
    print_commit_list("Submitted parent commits", data["parentCommits"])
    observed = "yes" if data["parentCommitsObserved"] else "no"
    print(f"Submitted parent line observed: {observed}")

    print(f"\nClassification: {assessment['classification']}")
    print(f"Conclusion: {assessment['conclusion']}")
    print(f"Lookup window: {assessment['lookupWindowConclusion']}")


def redact(data: dict[str, Any], redact_branch: bool) -> dict[str, Any]:
    if not redact_branch:
        return data
    return {**data, "branch": "[redacted]" if data["branch"] else None}


def full_sha(value: str) -> str:
    if not re.fullmatch(SHA_PATTERN, value):
        raise argparse.ArgumentTypeError(
            "must be a 40-character lowercase hexadecimal commit SHA"
        )
    return value


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract customer-safe ancestry evidence from a Chromatic CLI debug log."
    )
    parser.add_argument("log", type=Path, help="Path to the Chromatic CLI debug log")
    parser.add_argument(
        "--expected-parent",
        type=full_sha,
        help="Accepted PR commit expected in the submitted parent commits",
    )
    parser.add_argument(
        "--merge-commit",
        type=full_sha,
        help="Locate a known target-branch merge or squash commit in the traversal",
    )
    parser.add_argument(
        "--known-lookup-limit",
        type=int,
        help="Deployed lookup limit supplied by Chromatic Support; no value is assumed",
    )
    parser.add_argument(
        "--redact-branch",
        action="store_true",
        help="Replace the branch name in output while preserving ancestry evidence",
    )
    parser.add_argument("--json", action="store_true", help="Print parsed evidence as JSON")
    args = parser.parse_args()

    if args.known_lookup_limit is not None and args.known_lookup_limit < 1:
        parser.error("--known-lookup-limit must be greater than zero")

    data = parse_log(args.log.read_text(encoding="utf-8", errors="replace"))
    data = redact(data, args.redact_branch)
    assessment = assess(
        data,
        args.expected_parent,
        args.merge_commit,
        args.known_lookup_limit,
    )

    if args.json:
        print(json.dumps({"evidence": data, "assessment": assessment}, indent=2))
    else:
        print_report(data, assessment, args.known_lookup_limit)


if __name__ == "__main__":
    main()
