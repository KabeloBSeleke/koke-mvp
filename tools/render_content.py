#!/usr/bin/env python3
"""Render content/site.json into HTML slot markers (stdlib only).

Usage:
  python3 tools/render_content.py

Markers (idempotent, re-runnable):
  <!-- slot:page.section.key -->rendered value<!-- /slot:page.section.key -->
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "site.json"

SLOT_RE = re.compile(r"(<!-- slot:([\w.\-]+) -->).*?(<!-- /slot:\2 -->)", re.DOTALL)


def flatten(obj, prefix=""):
    out = {}
    for k, v in obj.items():
        key = f"{prefix}{k}"
        if isinstance(v, dict) and "value" in v and "status" in v:
            out[key] = v
        elif isinstance(v, dict):
            out.update(flatten(v, key + "."))
    return out


def main():
    slots = flatten(json.loads(CONTENT.read_text(encoding="utf-8")))

    def sub(m):
        key = m.group(2)
        if key not in slots:
            raise KeyError(f"missing content slot: {key}")
        return f"{m.group(1)}{slots[key]['value']}{m.group(3)}"

    changed = 0
    for path in sorted(ROOT.glob("*.html")):
        original = path.read_text(encoding="utf-8")
        rendered = SLOT_RE.sub(sub, original)
        if rendered != original:
            path.write_text(rendered, encoding="utf-8")
            changed += 1
    print(f"render_content: {changed} file(s) updated, {len(slots)} slots loaded")


if __name__ == "__main__":
    main()
