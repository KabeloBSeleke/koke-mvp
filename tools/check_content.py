#!/usr/bin/env python3
"""Summarise content/site.json statuses and flag copy awaiting sign-off.

Usage:
  python3 tools/check_content.py

Fails (exit 1) if a slot is unused by every page, a page references a missing
slot, or any slot has an unknown status.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "site.json"
STATUSES = {"confirmed", "derived"}


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
    html = "".join(p.read_text(encoding="utf-8") for p in ROOT.glob("*.html"))
    used = set(re.findall(r"<!-- slot:([\w.\-]+) -->", html))

    review = sorted(k for k, v in slots.items() if v.get("needsReview"))
    confirmed = sum(1 for v in slots.values() if v["status"] == "confirmed")
    print(f"check_content: {len(slots)} slots — {confirmed} confirmed, "
          f"{len(slots) - confirmed} derived, {len(review)} awaiting sign-off (needsReview)")

    noted = {k: v["note"] for k, v in slots.items() if v.get("note")}
    for key in sorted(noted):
        print(f"  note  {key}: {noted[key]}")

    problems = [f"unknown status '{v['status']}': {k}" for k, v in slots.items()
                if v["status"] not in STATUSES]
    problems += [f"unused slot: {k}" for k in sorted(set(slots) - used)]
    problems += [f"missing slot: {k}" for k in sorted(used - set(slots))]
    for p in problems:
        print(f"  ERROR {p}")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
