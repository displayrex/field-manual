---
title: "Writing runbooks & KB articles"
category: OPS
order: 3
summary: "A runbook template and writing rules so documentation is usable by someone else at 2 a.m."
tags: ["runbook", "documentation", "knowledge base", "technical writing", "kb"]
updated: 2026-10-16
---
## Runbook template
```markdown
# <Task name, verb first: "Offboard a user">
Owner: <name> · Last tested: <date> · Systems: Okta, Google, Jamf

## When to use
One or two sentences. What triggers this runbook.

## Before you start
- Access needed (roles, accounts)
- Info needed (ticket number, user email, manager)

## Steps
1. <Action> — <where> — <expected result>
2. ...

## Verify
How you know it worked (what to check, where).

## Rollback
How to undo each risky step.

## Escalation
Who to call if stuck; vendor support links.
```

## Writing rules
- **One action per step**, starting with a verb: "Deactivate the user in Okta".
- Include the **expected result** so the reader knows a step worked.
- Exact names: menu paths in **bold**, commands in code blocks, values in `code`.
- Screenshots only where the UI is confusing; they go stale fastest.
- Put warnings **before** the step they apply to.
- Date-stamp and name an owner. Review quarterly; mark "Last tested".

## KB article (end-user) template
```markdown
# How to <do the thing>
**Applies to:** Mac / Windows / everyone
1. ...
2. ...
**Still stuck?** Open a ticket: <portal link> and choose "<request type>".
```
Write at the user's level: name buttons as they appear, no internal jargon (say "work account", not "Okta tenant").

## Turning tickets into docs
When the same ticket appears 3+ times: write the KB, link it in the JSM/ServiceNow request type, and track whether volume drops.
