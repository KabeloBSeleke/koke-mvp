#!/usr/bin/env python3
"""Koke Holdings static-site verifier (stdlib only, offline).

Checks per HTML file:
  1. Tag well-formedness (balance / stray / implicit closes)
  2. Local href/src targets exist on disk (GitHub Pages base-path safety)
  3. Fragment anchors (#id) resolve within the target file
  4. <img> elements have alt attributes
  5. Landmark elements: nav, main, footer
  6. Duplicate id attributes within a file

Usage:  python3 tools/verify.py [file.html ...]
Exit:   0 = PASS (warnings allowed), 1 = FAIL (any error)
"""

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent

VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}

LANDMARKS = ("nav", "main", "footer")


class Doc(HTMLParser):
    """Collects structure, links, ids, img-alts from one HTML document."""

    def __init__(self, path: Path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.stack: list[str] = []
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.ids: set[str] = set()
        self.links: list[tuple[str, int]] = []   # (raw href/src, line)
        self.imgs_missing_alt = 0
        self.tags_seen: set[str] = set()

    # -- helpers ---------------------------------------------------------
    def _line(self) -> int:
        return self.getpos()[0]

    def _record_id(self, attrs: dict) -> None:
        el_id = attrs.get("id")
        if not el_id:
            return
        if el_id in self.ids:
            self.errors.append(f"line {self._line()}: duplicate id \"{el_id}\"")
        self.ids.add(el_id)

    # -- HTMLParser hooks ------------------------------------------------
    def handle_starttag(self, tag: str, attrs: list) -> None:
        a = dict(attrs)
        self.tags_seen.add(tag)
        self._record_id(a)
        if tag not in VOID_ELEMENTS:
            self.stack.append(tag)
        if tag == "img" and "alt" not in a:
            self.imgs_missing_alt += 1
            self.errors.append(f"line {self._line()}: <img> missing alt attribute")
        for key in ("href", "src"):
            if key in a and a[key]:
                self.links.append((a[key], self._line()))

    def handle_startendtag(self, tag: str, attrs: list) -> None:
        a = dict(attrs)
        self.tags_seen.add(tag)
        self._record_id(a)
        if tag == "img" and "alt" not in a:
            self.imgs_missing_alt += 1
            self.errors.append(f"line {self._line()}: <img> missing alt attribute")
        for key in ("href", "src"):
            if key in a and a[key]:
                self.links.append((a[key], self._line()))

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID_ELEMENTS:
            return
        if not self.stack:
            self.errors.append(
                f"line {self._line()}: stray closing </{tag}> (no open element)"
            )
            return
        if self.stack[-1] == tag:
            self.stack.pop()
            return
        if tag in self.stack:
            while self.stack and self.stack[-1] != tag:
                leaked = self.stack.pop()
                self.warnings.append(
                    f"line {self._line()}: implicit close of <{leaked}> by </{tag}>"
                )
            self.stack.pop()
        else:
            self.errors.append(
                f"line {self._line()}: closing </{tag}> without matching open tag"
            )


def classify(link: str) -> str:
    if link.startswith(("http://", "https://")):
        return "external"
    if link.startswith(("mailto:", "tel:", "data:", "javascript:")):
        return "skip"
    if link.startswith("#"):
        return "fragment"
    return "local"


def check_file(path: Path, all_ids: dict[Path, set[str]]) -> tuple[list[str], list[str]]:
    doc = Doc(path)
    doc.feed(path.read_text(encoding="utf-8"))
    doc.close()

    for tag in LANDMARKS:
        if tag not in doc.tags_seen:
            doc.errors.append(f"missing landmark <{tag}>")

    for unclosed in doc.stack:
        doc.errors.append(f"unclosed element <{unclosed}>")

    for raw, line in doc.links:
        kind = classify(raw)
        if kind in ("external", "skip"):
            continue
        target_path = path
        fragment = ""
        if kind == "fragment":
            fragment = raw[1:]
        else:
            parsed = urlparse(raw)
            if parsed.fragment:
                fragment = unquote(parsed.fragment)
            rel = unquote(parsed.path)
            if rel:
                target_path = (path.parent / rel).resolve()
        if kind != "fragment":
            if not target_path.exists():
                doc.errors.append(
                    f"line {line}: broken local reference \"{raw}\" "
                    f"(missing {target_path.relative_to(ROOT) if ROOT in target_path.parents or target_path == ROOT else target_path})"
                )
                continue
        if fragment and target_path in all_ids and fragment not in all_ids[target_path]:
            doc.errors.append(
                f"line {line}: anchor \"#{fragment}\" not found in {target_path.name}"
            )

    return doc.errors, doc.warnings


def main() -> int:
    args = sys.argv[1:]
    if args:
        files = [Path(a).resolve() for a in args]
    else:
        files = sorted(
            p for p in ROOT.glob("*.html")
            if p.is_file()
        )

    if not files:
        print("verify: no HTML files found")
        return 1

    # Pass 1: parse everything to collect ids for anchor resolution
    docs: dict[Path, Doc] = {}
    for f in files:
        d = Doc(f)
        d.feed(f.read_text(encoding="utf-8"))
        d.close()
        docs[f] = d
    all_ids = {p: d.ids for p, d in docs.items()}

    # Pass 2: full checks
    total_errors = 0
    total_warnings = 0
    for f in files:
        errors, warnings = check_file(f, all_ids)
        rel = f.relative_to(ROOT) if f.is_relative_to(ROOT) else f
        status = "FAIL" if errors else "PASS"
        print(f"[{status}] {rel}  ({len(errors)} errors, {len(warnings)} warnings)")
        for e in errors:
            print(f"    ERROR  {e}")
        for w in warnings:
            print(f"    warn   {w}")
        total_errors += len(errors)
        total_warnings += len(warnings)

    print(f"\nverify: {len(files)} files, {total_errors} errors, {total_warnings} warnings")
    if total_errors:
        print("RESULT: FAIL")
        return 1
    print("RESULT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
