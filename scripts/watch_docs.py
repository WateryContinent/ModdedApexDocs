#!/usr/bin/env python3
"""Regenerate the docs manifest whenever docs or resource files change."""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
GENERATOR = ROOT / "scripts" / "generate_docs_manifest.py"
POLL_SECONDS = 0.8


def snapshot() -> tuple[tuple[str, int, int], ...]:
    if not DOCS_DIR.exists():
        return ()

    entries = []
    for path in sorted(item for item in DOCS_DIR.rglob("*") if item.is_file() and not item.name.startswith(".")):
        stat = path.stat()
        entries.append((path.relative_to(ROOT).as_posix(), stat.st_mtime_ns, stat.st_size))
    return tuple(entries)


def regenerate() -> None:
    subprocess.run([sys.executable, str(GENERATOR)], cwd=ROOT, check=True)
    print("docs-manifest.json updated", flush=True)


def main() -> None:
    print("Watching docs/ for page, asset, and image changes. Press Ctrl+C to stop.", flush=True)
    regenerate()
    previous = snapshot()

    while True:
        time.sleep(POLL_SECONDS)
        current = snapshot()
        if current != previous:
            regenerate()
            previous = current


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopped watching docs.", flush=True)
