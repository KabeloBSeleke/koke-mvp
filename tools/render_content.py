#!/usr/bin/env python3
"""Render shared partials and content/site.json into the HTML pages (stdlib only).

Usage:
  python3 tools/render_content.py

Markers (idempotent, re-runnable):
  <!-- include:name -->…<!-- /include:name -->
      replaced with partials/name.html. Elements with data-nav="<page>"
      get aria-current="page" on that page. In 404.html, relative
      href/src paths become root-absolute (GitHub Pages serves it at any depth).
  <!-- slot:page.section.key -->value<!-- /slot:page.section.key -->
      replaced with the value from content/site.json.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "site.json"
PARTIALS = ROOT / "partials"

INCLUDE_RE = re.compile(r"(<!-- include:([\w-]+) -->).*?(<!-- /include:\2 -->)", re.DOTALL)
SLOT_RE = re.compile(r"(<!-- slot:([\w.\-]+) -->).*?(<!-- /slot:\2 -->)", re.DOTALL)
RELATIVE_URL_RE = re.compile(r'\b(href|src)="(?![a-z]+:|/|#)([^"]+)"')


def flatten(obj, prefix=""):
    out = {}
    for k, v in obj.items():
        key = f"{prefix}{k}"
        if isinstance(v, dict) and "value" in v and "status" in v:
            out[key] = v
        elif isinstance(v, dict):
            out.update(flatten(v, key + "."))
    return out


def render_includes(text, page):
    def sub(m):
        name = m.group(2)
        partial = (PARTIALS / f"{name}.html").read_text(encoding="utf-8")
        partial = partial.replace(f'data-nav="{page.stem}"',
                                  f'data-nav="{page.stem}" aria-current="page"')
        if page.name == "404.html":
            partial = RELATIVE_URL_RE.sub(r'\1="/\2"', partial)
        return f"{m.group(1)}{partial}{m.group(3)}"

    return INCLUDE_RE.sub(sub, text)


def main():
    slots = flatten(json.loads(CONTENT.read_text(encoding="utf-8")))

    def slot_sub(m):
        key = m.group(2)
        if key not in slots:
            raise KeyError(f"missing content slot: {key}")
        return f"{m.group(1)}{slots[key]['value']}{m.group(3)}"

    changed = 0
    for path in sorted(ROOT.glob("*.html")):
        original = path.read_text(encoding="utf-8")
        rendered = SLOT_RE.sub(slot_sub, render_includes(original, path))
        if rendered != original:
            path.write_text(rendered, encoding="utf-8")
            changed += 1
    print(f"render_content: {changed} file(s) updated, {len(slots)} slots loaded")


if __name__ == "__main__":
    main()
