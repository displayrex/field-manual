#!/usr/bin/env python3
"""Rebuild manifest.json from content/**/*.md.

Run after adding or editing a page:  python3 scripts/build_manifest.py
The GitHub Action in .github/workflows/manifest.yml also runs it on every push.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
pages = []
for md in sorted((ROOT / "content").glob("*/*.md")):
    text = md.read_text(encoding="utf-8")
    meta, body = {}, text
    if text.startswith("---\n"):
        head, _, body = text[4:].partition("\n---\n")
        for line in head.splitlines():
            if ":" not in line:
                continue
            k, _, v = line.partition(":")
            v = v.strip()
            try:
                meta[k.strip()] = json.loads(v)
            except json.JSONDecodeError:
                meta[k.strip()] = v
    pages.append({
        "id": md.stem,
        "path": md.relative_to(ROOT).as_posix(),
        "title": str(meta.get("title", md.stem)),
        "category": str(meta.get("category", md.parent.name.upper())),
        "order": meta.get("order", 50),
        "summary": meta.get("summary", ""),
        "tags": meta.get("tags", []),
        "updated": str(meta.get("updated", "")),
        "body": body.lstrip("\n"),
    })

(ROOT / "manifest.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"manifest.json: {len(pages)} pages")
