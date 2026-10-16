---
title: "AI-assisted scripting & docs"
category: AUTO
order: 5
summary: "How to use Claude or ChatGPT safely to write scripts, research and draft documentation, with a review checklist."
tags: ["ai", "claude", "chatgpt", "scripting", "prompting", "review"]
updated: 2026-10-16
---
## Good uses
- First draft of a script from a clear spec, then you review and test.
- Explaining an unfamiliar log, error code or API response.
- Converting between languages (Bash ↔ PowerShell ↔ Python).
- Drafting runbooks, KB articles, change records and client emails.
- Generating test data and edge-case lists.

## Prompt pattern for scripts
```text
Role: macOS admin writing a Jamf policy script (zsh, runs as root).
Goal: If FileVault is off, show the user a dialog and open System Settings.
Constraints: no third-party tools; log to /var/log/company.log; exit 0 on success.
Inputs: Jamf parameter $4 = company name.
Output: one script with comments, then a list of assumptions and how to test it.
```
Give context (platform, runs-as user, versions), constraints and the output format you want. Paste real error messages verbatim.

## Never paste
Secrets (API tokens, passwords, private keys), client PII, full user lists, internal hostnames you're not allowed to share. Redact to placeholders (`<TOKEN>`, `user@example.com`). Check the client's AI policy before using AI on their data.

## Review checklist before production
- [ ] I can explain every line.
- [ ] API endpoints and parameters checked against official docs (models invent plausible ones).
- [ ] Destructive actions have a dry-run mode and a scope limit.
- [ ] Ran it against a test user/device/tenant first.
- [ ] Errors are handled; script exits non-zero on failure.
- [ ] No secrets hardcoded; output doesn't log tokens.
- [ ] Committed to Git with a meaningful message; peer-reviewed if it touches production.

## Documentation flow
Paste your rough notes + the commands you actually ran → ask for a runbook in your template → verify every step by doing it once.
