#!/usr/bin/env python3
"""Generate the static documentation manifest used by the website."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
OUT_FILE = ROOT / "docs-manifest.json"
RESOURCE_DIR_NAMES = ("assets", "images")
ASSET_DIR_NAMES = ("assets",)


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


def readable_size(size: int) -> str:
    units = ("B", "KB", "MB", "GB")
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            if unit == "B":
                return f"{int(value)} {unit}"
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{size} B"


def asset_roots_for_doc(path: Path) -> list[Path]:
    parent = path.parent
    return [
        parent / name for name in ASSET_DIR_NAMES
    ] + [
        parent / f"{path.stem}-assets",
        parent / path.stem / "assets",
    ]


def assets_for_doc(path: Path) -> list[dict[str, str]]:
    seen = set()
    assets = []

    for root in asset_roots_for_doc(path):
        if not root.is_dir():
            continue
        for asset in sorted(item for item in root.rglob("*") if item.is_file() and not item.name.startswith(".")):
            relative = asset.relative_to(ROOT).as_posix()
            if relative in seen:
                continue
            seen.add(relative)
            assets.append(
                {
                    "name": asset.name,
                    "path": relative,
                    "size": readable_size(asset.stat().st_size),
                    "folder": root.relative_to(DOCS_DIR).as_posix(),
                }
            )

    return assets


def is_markdown_doc(path: Path) -> bool:
    relative = path.relative_to(DOCS_DIR)
    return not any(part in RESOURCE_DIR_NAMES or part.endswith("-assets") for part in relative.parts)


def main() -> None:
    docs = []
    for path in sorted(DOCS_DIR.rglob("*.md")):
        if not is_markdown_doc(path):
            continue
        relative = path.relative_to(ROOT)
        docs.append(
            {
                "title": title_from_markdown(path),
                "path": relative.as_posix(),
                "group": group_title(path.relative_to(DOCS_DIR)),
                "assets": assets_for_doc(path),
            }
        )

    OUT_FILE.write_text(
        json.dumps({"docs": docs}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
