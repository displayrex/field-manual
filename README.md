# Field Manual

Rex Hector's personal operations reference: quick how-to pages for the tools and workflows I use day to day. It covers identity (Okta, Entra ID, AD), endpoints (Jamf Pro, ABM, Intune, SCCM), Google Workspace and GAM, Zero Trust and networking, Splunk, scripting (Git, PowerShell, Bash, Python), databases (Supabase, PostgreSQL, Firebase), service desk tools (Jira Service Management, ServiceNow) and compliance (SOC 2, ISO 27001).

## Layout

```text
content/<area>/<page>.md   one page per tool or workflow (Markdown + front matter)
manifest.json              all pages bundled for the site (generated, don't edit by hand)
index.html                 the reader: search with "/", filter by area, copy buttons on code
scripts/build_manifest.py  rebuilds manifest.json from content/
```

Areas: `iam`, `mdm`, `gws`, `ztna`, `siem`, `auto`, `data`, `ops`, `grc`.

## Read it locally

```bash
git clone https://github.com/displayrex/field-manual.git
cd field-manual
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` straight from disk won't work, because the browser blocks loading `manifest.json` from a `file://` page. Serve the folder as shown above.

## Add or edit a page

1. Create or edit `content/<area>/<page-id>.md`, for example:

   ```markdown
   ---
   title: "Jamf Connect"
   category: MDM
   order: 7
   summary: "Okta sign-in at the macOS login window and local account sync."
   tags: ["jamf", "okta", "macos"]
   updated: 2026-10-16
   ---
   ## Where things live
   ...
   ```

2. Commit and push. The **Rebuild manifest** GitHub Action regenerates `manifest.json`.
   To do it locally instead: `python3 scripts/build_manifest.py`.

The **Edit on GitHub** button on each page opens that page's file in GitHub's editor.

## Deploy on Vercel

1. vercel.com → **Add New → Project** → import `displayrex/field-manual`.
2. Framework preset: **Other**. Leave build command and output directory empty.
3. **Environment Variables**: add `FM_USER` and `FM_PASS` (your login for the site).
4. **Deploy**. The browser asks for that username and password on every new session.

`middleware.js` enforces the password on every path. If the variables are missing, the site returns 503 instead of going public. Each push to `main` redeploys automatically.

## Security

- Every path is behind HTTP Basic Auth (`middleware.js`), checked in constant time and fails closed if the variables are unset.
- No third-party requests: scripts (marked, DOMPurify) and fonts are self-hosted in `vendor/`.
- Strict headers in `vercel.json`: Content-Security-Policy (`script-src 'self'`, no framing), HSTS, nosniff, no referrer, `noindex`, `no-store`.
- Page Markdown is sanitized with DOMPurify before display.
- The GitHub Action uses SHA-pinned actions and least-privilege token permissions.

## Privacy

This repo is private. GitHub Pages would make the site public (or require a paid plan for private Pages), so the default is to read it locally. Don't put secrets, tokens or client data in pages.
