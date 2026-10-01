#!/usr/bin/env python3
"""Bundle one canonical TurboSnap runtime in both independently installable skills."""
import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'skills/chromatic-turbosnap-check'
TARGET = ROOT / 'skills/chromatic-turbosnap-audit'
SHARED = ('scripts', 'reference/cli.md', 'assets/preflight.config.example.json')


def reject_symlink_parents(file):
    for candidate in (file, *file.parents):
        if candidate == ROOT:
            break
        if candidate.is_symlink():
            raise RuntimeError(f'Refusing a symlink in shared runtime: {candidate}')


def files(root):
    found = {}
    for name in SHARED:
        base = root / name
        reject_symlink_parents(base)
        candidates = [base, *base.rglob('*')] if base.is_dir() else [base]
        for file in candidates:
            if file.is_symlink():
                raise RuntimeError(f'Refusing a symlink in shared runtime: {file}')
            if file.is_file():
                found[file.relative_to(root)] = file
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if SOURCE.is_symlink() or TARGET.is_symlink():
        raise RuntimeError('Skill roots must not be symlinks.')
    expected, actual = files(SOURCE), files(TARGET)
    if not expected or not (SOURCE / 'scripts/preflight.mjs').is_file():
        raise RuntimeError('Canonical TurboSnap runtime is missing.')
    if args.write:
        for relative in actual.keys() - expected.keys():
            actual[relative].unlink()
        for relative, source in expected.items():
            target = TARGET / relative
            reject_symlink_parents(target)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
        actual = files(TARGET)
    differences = sorted(expected.keys() ^ actual.keys())
    differences += [p for p in expected.keys() & actual.keys()
                    if expected[p].read_bytes() != actual[p].read_bytes()
                    or expected[p].stat().st_mode & 0o777 != actual[p].stat().st_mode & 0o777]
    if differences:
        print('TurboSnap runtime differs:', *differences, sep='\n  ')
        return 1
    print(f'TurboSnap runtime matches across both skills ({len(expected)} files).')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
