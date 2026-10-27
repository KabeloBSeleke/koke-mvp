#!/usr/bin/env python3
"""Render content/site.json into HTML slot markers (stdlib only).

Usage:
  python3 tools/render_content.py              # dev: wrap placeholders with .ph-flag
  python3 tools/render_content.py --production # strip placeholder flags

Markers (idempotent, re-runnable):
  <!-- slot:page.section.key --><rendered><!-- /slot:page.section.key -->
  <!-- if:caseStudy.featured.published --> ... <!-- /if -->
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "site.json"
PAGES = [
    "index.html", "services.html", "sectors.html", "how-we-work.html", "about.html",
    "projects.html", "team.html", "credentials.html", "contact.html",
    "privacy.html", "404.html",
]

SLOT_RE = re.compile(
    r"(<!-- slot:([\w.\-]+) -->).*?(<!-- /slot:\2 -->)", re.DOTALL
)
IF_RE = re.compile(
    r"(<!--\s*if:([\w.\-]+)\s*-->)(.*?)(<!--\s*/if:\2\s*-->)", re.DOTALL
)


def flatten(obj, prefix=""):
    out = {}
    for k, v in obj.items():
        key = f"{prefix}{k}"
        if isinstance(v, dict) and "value" in v and "status" in v:
            out[key] = v
        elif isinstance(v, dict):
            out.update(flatten(v, key + "."))
    return out


def resolve(slots, dotted):
    if dotted not in slots:
        raise KeyError(f"missing content slot: {dotted}")
    return slots[dotted]


def render_value(item, production):
    value = item["value"]
    if item["status"] == "placeholder" and not production:
        q = item.get("source", "")
        return f'<span class="ph-flag" data-q="{q}">{value}</span>'
    return value


def render_html(text, slots, production):
    def slot_sub(m):
        key = m.group(2)
        item = resolve(slots, key)
        # alt-text slots are injected into HTML attributes — never wrap them
        if key.endswith(".alt"):
            return f"{m.group(1)}{item['value']}{m.group(3)}"
        return f"{m.group(1)}{render_value(item, production)}{m.group(3)}"

    def if_sub(m):
        cond = m.group(2)
        # dotted path to a boolean in the raw JSON tree
        node = json.loads(CONTENT.read_text(encoding="utf-8"))
        for part in cond.split("."):
            node = node[part]
        if node:
            inner = SLOT_RE.sub(slot_sub, m.group(3))
        else:
            inner = m.group(3)
            # unwrap a previous inert wrapper to stay idempotent
            marker = f'<template data-if="{cond}">'
            if inner.strip().startswith(marker):
                inner = inner.strip()[len(marker):]
                inner = inner[: inner.rindex("</template>")]
            # keep the branch (incl. slot markers) in an inert <template>
            # so flipping the flag + re-rendering restores it
            inner = f'<template data-if="{cond}">{inner}</template>'
        return f"{m.group(1)}{inner}{m.group(4)}"

    text = IF_RE.sub(if_sub, text)
    text = SLOT_RE.sub(slot_sub, text)
    return text


def main():
    production = "--production" in sys.argv
    data = json.loads(CONTENT.read_text(encoding="utf-8"))
    slots = flatten(data)
    changed = 0
    for page in PAGES:
        path = ROOT / page
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8")
        rendered = render_html(original, slots, production)
        if rendered != original:
            path.write_text(rendered, encoding="utf-8")
            changed += 1
    mode = "production" if production else "development"
    print(f"render_content: {mode} — {changed} file(s) updated, {len(slots)} slots loaded")


if __name__ == "__main__":
    main()
