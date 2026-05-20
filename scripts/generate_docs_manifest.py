#!/usr/bin/env python3
"""Generate the static documentation manifest used by the website."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
OUT_FILE = ROOT / "docs-manifest.json"


def title_from_markdown(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="replace")
    for line in text.splitlines():
        match = re.match(r"^#\s+(.+?)\s*$", line)
        if match:
            return match.group(1).strip()
    return path.stem.replace("-", " ").replace("_", " ").title()


def group_title(path: Path) -> str:
    if len(path.parts) <= 1:
        return "General"
    return path.parts[0].replace("-", " ").replace("_", " ").title()


def main() -> None:
    docs = []
    for path in sorted(DOCS_DIR.rglob("*.md")):
        relative = path.relative_to(ROOT)
        docs.append(
            {
                "title": title_from_markdown(path),
                "path": relative.as_posix(),
                "group": group_title(path.relative_to(DOCS_DIR)),
            }
        )

    OUT_FILE.write_text(
        json.dumps({"docs": docs}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
