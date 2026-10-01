"""Verify standalone runtime bundling and containment of generated writes."""
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


class RuntimeSyncTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'scripts').mkdir()
        source = Path(__file__).resolve().parents[1] / 'scripts/sync_turbosnap_runtime.py'
        self.script = self.root / 'scripts/sync_turbosnap_runtime.py'
        shutil.copy2(source, self.script)
        self.source = self.root / 'skills/chromatic-turbosnap-check'
        self.target = self.root / 'skills/chromatic-turbosnap-audit'
        self.target.mkdir(parents=True)
        (self.target / 'SKILL.md').write_text('Audit-specific instructions')
        for name in ['scripts/preflight.mjs', 'reference/cli.md', 'assets/preflight.config.example.json']:
            file = self.source / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text('shared content')

    def run_sync(self, mode):
        return subprocess.run(['python3', str(self.script), mode], capture_output=True, text=True)

    def test_sync_keeps_skill_instructions_and_detects_drift(self):
        self.assertEqual(self.run_sync('--write').returncode, 0)
        self.assertEqual((self.target / 'SKILL.md').read_text(), 'Audit-specific instructions')
        self.assertEqual(self.run_sync('--check').returncode, 0)
        (self.target / 'scripts/preflight.mjs').write_text('stale copy')
        self.assertEqual(self.run_sync('--check').returncode, 1)
        self.assertEqual(self.run_sync('--write').returncode, 0)
        self.assertEqual(self.run_sync('--check').returncode, 0)

    def test_symlinked_destination_parents_cannot_receive_writes(self):
        for name in ['reference', 'assets']:
            with self.subTest(name=name):
                outside = self.root / ('outside-' + name)
                outside.mkdir()
                marker = outside / ('cli.md' if name == 'reference' else 'preflight.config.example.json')
                marker.write_text('preserve')
                link = self.target / name
                link.symlink_to(outside, target_is_directory=True)
                try:
                    result = self.run_sync('--write')
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn('symlink', result.stderr)
                    self.assertEqual(marker.read_text(), 'preserve')
                finally:
                    link.unlink()
